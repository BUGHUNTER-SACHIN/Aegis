import { EVENTS, INVESTIGATION } from "./fixtures.js";

export const API_BASE = "";

export const TIMEOUT_MS = 2500;

export const ENDPOINTS = {
  invoke: () => `${API_BASE}/api/agent/invoke`,
  ledger: () => `${API_BASE}/api/agent/ledger`,
  verify: () => `${API_BASE}/api/agent/ledger/verify`,
  investigate: (eventId: string) => `${API_BASE}/api/agent/investigate/${encodeURIComponent(eventId)}`,
};

async function request(url: string, options?: RequestInit) {
  if (typeof fetch !== "function") {
    return { ok: false, error: "fetch unavailable in this environment" };
  }
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      ...(options || {}),
      ...(controller ? { signal: controller.signal } : {}),
    });
    const parsedData = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}`, status: res.status, data: parsedData };
    }
    return { ok: true, status: res.status, data: parsedData };
  } catch (e: any) {
    return { ok: false, error: String(e && e.message ? e.message : e) };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function normaliseEvent(raw: any, index: number) {
  if (!raw || typeof raw !== "object") return null;
  return {
    seq: raw.seq != null ? raw.seq : index + 1,
    id: raw.id || raw.eventId || `evt_${index}`,
    t: typeof raw.t === "number" ? raw.t : Number(raw.tOffset || 0),
    tool: raw.tool || "",
    action: raw.action || "",
    resource: raw.resource || "",
    trust: raw.trust || raw.context?.trust || "INTERNAL", // Backend uses context.trust!
    decision: raw.decision || "",
    reason: raw.reason || "",
    execution: raw.execution || raw.executionState || (raw.decision === "DENY" ? "NOT_EXECUTED" : "EXECUTED"),
    bytes: typeof raw.bytes === "number" ? raw.bytes : 0,
    http: raw.http != null ? raw.http : (raw.decision === "DENY" ? 403 : 200),
    prev: raw.prev || raw.previousHash || null,
    curr: raw.curr || raw.hash || raw.currentHash || null, // Backend uses hash
    detail: raw.detail || "",
  };
}

function extractEvents(data: any) {
  const list = Array.isArray(data) ? data : Array.isArray(data && data.events) ? data.events : null;
  if (!list) return null;
  const mapped = list.map(normaliseEvent).filter(Boolean);
  return mapped.length ? mapped : null;
}

export const aegisApi = {
  async getLedger() {
    const r = await request(ENDPOINTS.ledger());
    if (r.ok) {
      const events = extractEvents(r.data);
      if (events) return { source: "LIVE", events };
      return { source: "FIXTURE", events: EVENTS, reason: "response contained no recognisable events" };
    }
    return { source: "FIXTURE", events: EVENTS, reason: r.error };
  },

  async verifyChain() {
    const r = await request(ENDPOINTS.verify());
    if (r.ok) {
      const d = r.data || {};
      return {
        source: "LIVE",
        verified: !!d.valid, // Backend returns { valid: boolean }
        ok: typeof d.ok === "number" ? d.ok : (d.links && d.links.ok),
        total: typeof d.total === "number" ? d.total : (d.links && d.links.total),
      };
    }
    return { source: "FIXTURE", verified: true, ok: EVENTS.length, total: EVENTS.length, reason: r.error };
  },

  async investigate(eventId: string) {
    const r = await request(ENDPOINTS.investigate(eventId));
    if (r.ok && r.data) {
      // Backend returns { event, investigationStatus: { status, analysis: string | object, error?: string } }
      const investigationStatus = r.data.investigationStatus || r.data;
      
      const analysisObj = typeof investigationStatus.analysis === 'object' ? investigationStatus.analysis : {
        whatHappened: [investigationStatus.analysis || investigationStatus.error || "Analysis failed"]
      };

      return {
        source: "LIVE",
        analysis: {
          generatedBy: analysisObj.generatedBy || "Amazon Bedrock",
          whatHappened: Array.isArray(analysisObj.whatHappened)
            ? analysisObj.whatHappened
            : analysisObj.narrative ? [analysisObj.narrative] : [investigationStatus.analysis || investigationStatus.error || "Analysis failed"],
          refs: analysisObj.refs || analysisObj.evidenceReferences || [],
          basis: analysisObj.basis || [],
          notAsserted: analysisObj.notAsserted || [],
        },
      };
    }
    return { source: "FIXTURE", analysis: INVESTIGATION, reason: r.error };
  },

  async invoke(toolOrBody: any, action?: string, resource?: string, trust?: string): Promise<any> {
    let body = toolOrBody;
    if (typeof toolOrBody === "string") {
      body = {
        sessionId: "sess_ui_" + Date.now(),
        agentId: "DevFix",
        tool: toolOrBody,
        action: action || "fs:read",
        resource: resource || "package.json",
        context: { trust: trust || "TRUSTED" }
      };
    }
    const r = await request(ENDPOINTS.invoke(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body || {}),
    });
    if (r.ok) {
      return { source: "LIVE", status: r.status || 200, result: r.data?.result, decision: r.data?.decision };
    }
    return { source: "LIVE", status: r.status || 500, error: r.error, decision: r.data?.decision };
  },
};

export default aegisApi;
