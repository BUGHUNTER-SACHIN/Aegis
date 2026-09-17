import React from "react";
import PageHead from "../shared/PageHead.tsx";
import Panel from "../shared/Panel.tsx";
import StateChip from "../shared/StateChip.tsx";
import { SESSION, EVENTS } from "../../data/fixtures.js";

export default function Sessions({ go }: any) {
  const allow = EVENTS.filter((e: any) => e.decision === "ALLOW").length;
  const deny = EVENTS.filter((e: any) => e.decision === "DENY").length;
  const untrusted = EVENTS.filter((e: any) => e.trust === "UNTRUSTED_EXTERNAL").length;

  return (
    <>
      <PageHead
        title="Sessions"
        desc="A session binds an agent to a specific task contract for a limited duration."
      />

      <Panel flush>
        <div className="tablescroll">
          <table className="dt">
            <thead>
              <tr>
                <th>SESSION ID</th><th>AGENT</th><th>TASK CONTRACT</th>
                <th>STARTED</th><th>DURATION</th><th>EVENTS</th>
                <th>DECISIONS</th><th>STATE</th><th />
              </tr>
            </thead>
            <tbody>
              <tr className="clickable" onClick={() => go("execution")}>
                <td className="m">{SESSION.id}</td>
                <td>{SESSION.agentId}</td>
                <td className="m">{SESSION.contractId}</td>
                <td className="m dim">{SESSION.startedAt.slice(11, 19)}Z</td>
                <td className="m dim">{SESSION.durationMs}ms</td>
                <td className="m">{EVENTS.length}</td>
                <td className="m">
                  {allow} allow / <span style={{ color: "var(--deny)" }}>{deny} deny</span> / {untrusted} ctx
                </td>
                <td><StateChip s={SESSION.state} /></td>
                <td style={{ textAlign: "right" }}><span className="btn sm">View execution</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
