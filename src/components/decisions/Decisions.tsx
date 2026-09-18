import React from "react";
import PageHead from "../shared/PageHead.tsx";
import Panel from "../shared/Panel.tsx";
import KV from "../shared/KV.tsx";
import Note from "../shared/Note.tsx";
import DecisionChip from "../shared/DecisionChip.tsx";
import TrustChip from "../shared/TrustChip.tsx";
import EvaluationChain from "./EvaluationChain.tsx";
import { SESSION } from "../../data/fixtures.js";

export default function Decisions({ events, selected, select, go }: any) {
  const ev = events.find((e: any) => e.id === selected) || events[events.length - 1];

  return (
    <>
      <PageHead
        title="Authorization Decisions"
        desc="Every request an agent makes is evaluated against its declared authority before any tool runs."
      />

      <Panel title="DECISION LOG" flush>
        <div className="tablescroll">
          <table className="dt">
            <thead>
              <tr>
                <th>T+</th><th>PRINCIPAL</th><th>ACTION</th><th>RESOURCE</th>
                <th>CONTEXT</th><th>DECISION</th><th>REASON</th><th>EVENT</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e: any) => (
                <tr
                  key={e.id}
                  className={"clickable" + (e.id === ev.id ? " sel" : "")}
                  onClick={() => select(e.id)}>
                  <td className="m dim">{e.t.toFixed(3)}</td>
                  <td className="m">{e.agentId || SESSION.agentId}</td>
                  <td className="m">{e.action}</td>
                  <td className="m">{e.resource}</td>
                  <td className="m">
                    {e.trust === "UNTRUSTED_EXTERNAL"
                      ? <span style={{ color: "var(--amber)" }}>untrusted &#9888;</span>
                      : <span className="dim">{e.trust.toLowerCase()}</span>}
                  </td>
                  <td><DecisionChip d={e.decision} /></td>
                  <td className="m dim">{e.reason}</td>
                  <td className="m dim">{e.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <PageHead
        title={"Decision detail \u00b7 " + ev.id}
        desc={ev.detail}
        actions={
          <>
            <button className="btn" onClick={() => go("evidence")}>Evidence</button>
            <button className="btn" onClick={() => go("lineage")}>Lineage</button>
          </>
        }
      />

      <div className="grid g2">
        <Panel title="SECURITY RECORD">
          <KV
            rows={[
              ["WHO", `${SESSION.agentName} (Agent::"${ev.agentId || SESSION.agentId}")`],
              ["SESSION", ev.sessionId || SESSION.id],
              ["WHAT", ev.action],
              ["RESOURCE", ev.resource],
              ["TASK CONTRACT", ev.sessionId ? "NOT RECORDED" : SESSION.contractId],
              ["CONTEXT", <TrustChip t={ev.trust} />],
              ["DECISION", <DecisionChip d={ev.decision} />],
              ["REASON", ev.reason],
              ["AUTHORITY", ev.authProvider || "UNKNOWN"],
              ["EXECUTION", ev.execution],
              ["EXPOSURE", ev.bytes == null ? "UNKNOWN" : ev.bytes + " BYTES"],
              ["HTTP", ev.http == null ? "UNKNOWN" : String(ev.http)],
            ]}
          />
        </Panel>

        <Panel title="POLICY EVALUATION" flush>
          <div style={{ padding: "var(--s4)" }}>
            <EvaluationChain ev={ev} />
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
            <Note kind="info">
              This screen displays the evaluation. It is not what enforces it. Enforcement
              happens at the Aegis gateway in front of the tool: the request is refused there,
              so the tool is never invoked. Removing this screen would not change the outcome.
            </Note>
          </div>
        </Panel>
      </div>
    </>
  );
}
