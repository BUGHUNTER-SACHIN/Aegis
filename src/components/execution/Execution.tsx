import React, { useState } from "react";
import PageHead from "../shared/PageHead.tsx";
import Panel from "../shared/Panel.tsx";
import Verdict from "./Verdict.tsx";
import ScopePanel from "./ScopePanel.tsx";
import ActivityStream from "./ActivityStream.tsx";
import ProvenancePanel from "./ProvenancePanel.tsx";
import BoundaryVisual from "../viz/BoundaryVisual.tsx";
import aegisApi from "../../data/aegisApi.ts";
import { SESSION } from "../../data/fixtures.js";

export default function Execution({ events, idx, go, select, refresh }: any) {
  const visible = events.slice(0, idx + 1);
  const denied = visible.find((e: any) => e.decision === "DENY");
  const untrusted = visible.find((e: any) => e.trust === "UNTRUSTED_EXTERNAL");
  const touched = new Set(visible.map((e: any) => e.resource));

  const [runningHero, setRunningHero] = useState(false);
  const [heroStatus, setHeroStatus] = useState<string | null>(null);

  const runLiveHeroFlow = async () => {
    setRunningHero(true);
    try {
      setHeroStatus("Step 1/4: Reading package.json (ALLOW)...");
      await aegisApi.invoke("fs", "fs:read", "package.json", "TRUSTED");
      if (refresh) await refresh();

      setHeroStatus("Step 2/4: Reading package-lock.json (ALLOW)...");
      await aegisApi.invoke("fs", "fs:read", "package-lock.json", "TRUSTED");
      if (refresh) await refresh();

      setHeroStatus("Step 3/4: Reading dependency docs (ALLOW · UNTRUSTED_EXTERNAL)...");
      await aegisApi.invoke("fs", "fs:read", "node_modules/axios/README.md", "UNTRUSTED_EXTERNAL");
      if (refresh) await refresh();

      setHeroStatus("Step 4/4: Intercepting .env read at PEP (DENY · 403 · 0 BYTES)...");
      await aegisApi.invoke("fs", "fs:read", ".env", "UNTRUSTED_EXTERNAL");
      if (refresh) await refresh();

      setHeroStatus("Hero Flow executed: Cedar DENY enforced at Gateway.");
    } catch (e: any) {
      setHeroStatus(`Execution error: ${e.message}`);
    } finally {
      setRunningHero(false);
      setTimeout(() => setHeroStatus(null), 5000);
    }
  };

  return (
    <>
      <PageHead
        title="Agent Execution"
        desc="DevFix is a reference autonomous agent running under Aegis. Aegis is the platform; DevFix is one of the agents it controls."
        actions={
          <>
            <button
              className="btn primary"
              onClick={runLiveHeroFlow}
              disabled={runningHero}
              style={{ fontWeight: 600 }}>
              {runningHero ? (heroStatus || "Executing PEP...") : "Run Live Hero Flow"}
            </button>
            <button className="btn" onClick={() => go("contracts")}>Task contract</button>
            <button className="btn" onClick={() => go("recorder")}>Flight recorder</button>
          </>
        }
      />

      {heroStatus && (
        <Panel flush style={{ marginBottom: "var(--s4)", padding: "10px 16px" }}>
          <div className="mono" style={{ fontSize: 12, color: "var(--amber)" }}>
            ⚡ {heroStatus}
          </div>
        </Panel>
      )}

      <Panel flush style={{ marginBottom: "var(--s5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--s5)", padding: "var(--s4)", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-.01em" }}>{SESSION.agentName}</div>
            <div className="muted" style={{ fontSize: 12 }}>{SESSION.agentRole} &middot; reference agent</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "var(--s5)", flexWrap: "wrap" }}>
            <div>
              <div className="mono dim" style={{ fontSize: 9.5, letterSpacing: ".12em" }}>SESSION</div>
              <div className="mono" style={{ fontSize: 12.5 }}>{SESSION.id}</div>
            </div>
            <div>
              <div className="mono dim" style={{ fontSize: 9.5, letterSpacing: ".12em" }}>TASK CONTRACT</div>
              <div className="mono" style={{ fontSize: 12.5 }}>{SESSION.contractId}</div>
            </div>
            <div>
              <div className="mono dim" style={{ fontSize: 9.5, letterSpacing: ".12em" }}>AUTHORITY</div>
              <div className="mono" style={{ fontSize: 12.5, color: "var(--allow)" }}>SIGNED &#10003;</div>
            </div>
            <div>
              <div className="mono dim" style={{ fontSize: 9.5, letterSpacing: ".12em" }}>STATE</div>
              <div className="mono" style={{ fontSize: 12.5, color: denied ? "var(--deny)" : "var(--fg)" }}>
                {denied ? "HALTED AT DENY" : "RUNNING"}
              </div>
            </div>
          </div>
        </div>
        <BoundaryVisual event={events[idx]} height={200} compact />
      </Panel>

      {denied ? (
        <div style={{ marginBottom: "var(--s5)" }}>
          <Verdict ev={denied} go={go} select={select} />
        </div>
      ) : null}

      <div className="grid g2" style={{ marginBottom: "var(--s5)" }}>
        <ScopePanel touched={touched} breached={denied ? denied.resource : null} />
        <ActivityStream events={events} idx={idx} go={go} select={select} />
      </div>

      <ProvenancePanel event={untrusted} />
    </>
  );
}
