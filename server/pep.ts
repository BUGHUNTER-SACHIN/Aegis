import fs from "fs";
import path from "path";
import "dotenv/config";
import * as cedar from "@cedar-policy/cedar-wasm";
import { VerifiedPermissionsClient, IsAuthorizedCommand } from "@aws-sdk/client-verifiedpermissions";
import { globalLedger } from "./ledger.js";
import { ArchivalResults } from "./aws-archiver.js";

export type ToolRequest = {
  sessionId: string;
  agentId: string;
  tool: string;
  resource: string;
  action: string;
  context: {
    trust: string;
    source?: string;
  };
};

export type Decision = {
  decision: "ALLOW" | "DENY";
  reason: string;
  policyId?: string;
  eventId: string;
  hash: string;
  archivalStatus?: ArchivalResults;
};

// Load the local Cedar policy
const policyPath = path.join(process.cwd(), "server/policies/devfix.cedar");
const policyString = fs.readFileSync(policyPath, "utf8");

const avpClient = new VerifiedPermissionsClient({ 
  region: process.env.AWS_REGION || "us-east-1" 
});

function evaluateLocalCedar(request: ToolRequest) {
  const principal = { type: "Aegis::Agent", id: request.agentId };
  const action = { type: "Aegis::Action", id: request.action };
  const resource = { type: "Aegis::File", id: request.resource };
  
  const context = {
    trust: request.context.trust,
    source: request.context.source || "unknown",
  };

  const entities = [
    { uid: principal, attrs: {}, parents: [] },
    { uid: action, attrs: {}, parents: [] },
    { uid: resource, attrs: {}, parents: [] }
  ];

  const policiesObj: Record<string, string> = {};
  const splitPolicies = policyString.split(/\/\/\s*\d+\.\s*[^\n]+/).filter(Boolean);
  splitPolicies.forEach((pol, idx) => {
    if (pol.trim()) policiesObj[`policy_${idx}`] = pol.trim();
  });

  try {
    const callResult = cedar.isAuthorized({
      principal: { type: principal.type, id: principal.id },
      action: { type: action.type, id: action.id },
      resource: { type: resource.type, id: resource.id },
      context,
      entities,
      policies: { staticPolicies: policiesObj }
    });
    
    console.log("Local Cedar Result:", JSON.stringify(callResult, null, 2));

    const decision = callResult.type === "success" && callResult.response?.decision === "allow" ? "ALLOW" : "DENY";
    const reason = callResult.type === "success" && callResult.response?.decision === "allow" 
      ? `Authorized by ${callResult.response.diagnostics.reason.join(", ")}` 
      : (callResult.type === "failure" ? callResult.errors.map(e => e.message).join(", ") : "Denied by local policy");

    return { decision, reason };
  } catch (err: any) {
    console.error("Local Cedar authorization error:", err);
    return { decision: "DENY", reason: "INTERNAL_ERROR" };
  }
}

async function evaluateAVP(request: ToolRequest) {
  const policyStoreId = process.env.AVP_POLICY_STORE_ID || "UNCONFIGURED_STORE_ID";
  const cmd = new IsAuthorizedCommand({
    policyStoreId,
    principal: { entityType: "Aegis::Agent", entityId: request.agentId },
    action: { actionType: "Aegis::Action", actionId: request.action },
    resource: { entityType: "Aegis::File", entityId: request.resource },
    context: {
      contextMap: {
        trust: { string: request.context.trust },
        source: { string: request.context.source || "unknown" }
      }
    }
  });
  
  const response = await avpClient.send(cmd);
  
  const decision = response.decision === "ALLOW" ? "ALLOW" : "DENY";
  const reason = (response.determiningPolicies && response.determiningPolicies.length > 0) ? "Matched AVP policy" : "Denied by AVP";
  
  return { decision: decision as "ALLOW" | "DENY", reason, policyStoreId };
}

export async function authorize(request: ToolRequest): Promise<Decision> {
  // 1. Local Cedar Evaluation
  const localResult = evaluateLocalCedar(request);
  
  // 2. Amazon Verified Permissions Evaluation (Phase 3)
  let finalDecision: "ALLOW" | "DENY" = "DENY";
  let finalReason = "";
  let provider = "";
  let avpError = "";
  let policyStoreId: string | undefined = undefined;

  try {
    const avpResult = await evaluateAVP(request);
    policyStoreId = avpResult.policyStoreId;
    
    // 3. Comparison
    if (localResult.decision !== avpResult.decision) {
      console.error(`[AEGIS PEP] AUTHORIZATION MISMATCH: Local Cedar says ${localResult.decision}, AVP says ${avpResult.decision}`);
      // "If they disagree, stop and investigate. Do not silently make one override the other."
      finalDecision = "DENY";
      finalReason = "AUTHORIZATION_MISMATCH_ERROR";
      provider = "amazon-verified-permissions";
    } else {
      // They agree
      finalDecision = avpResult.decision;
      finalReason = avpResult.reason;
      provider = "amazon-verified-permissions";
    }
  } catch (err: any) {
    // Expected graceful fallback when AWS cloud credentials are not provisioned in local dev
    if (process.env.DEBUG_AEGIS_PEP) {
      console.warn(`[AEGIS PEP] AVP Unavailable, falling back to Local Cedar. Error: ${err.message}`);
    }
    // Safe fallback to local evaluation
    finalDecision = localResult.decision as "ALLOW" | "DENY";
    finalReason = localResult.reason;
    provider = "local-cedar";
    avpError = err.message;
  }

  // 4. Record Evidence locally
  const event = globalLedger.appendEvent({
    sessionId: request.sessionId || "unknown-session",
    agentId: request.agentId || "unknown-agent",
    action: request.action,
    resource: request.resource,
    context: request.context,
    decision: finalDecision,
    reason: finalReason,
    authorization: {
       provider,
       policyStoreId,
       error: avpError || undefined
    }
  });

  return {
    decision: finalDecision,
    reason: finalReason,
    eventId: event.eventId,
    hash: event.hash
  };
}
