import React from "react";
import Panel from "../shared/Panel.tsx";
import PageHead from "../shared/PageHead.tsx";
import Chip from "../shared/Chip.tsx";
import Note from "../shared/Note.tsx";
import { SESSION, CONTRACT } from "../../data/fixtures.js";

export default function Agents({ events, go }: any) {
  const deny = events.filter((e: any) => e.decision === "DENY").length;

  return (
    <>
      <PageHead
        title="Agents"
        desc="Autonomous agents registered with Aegis. Each acts only under a signed task contract."
      />

      <Panel flush>
        <div className="tablescroll">
          <table className="dt">
            <thead>
              <tr>
                <th>AGENT</th><th>ROLE</th><th>SESSION</th><th>TASK CONTRACT</th>
                <th>SCOPE</th><th>DECISIONS</th><th>STATE</th><th />
              </tr>
            </thead>
            <tbody>
              <tr className="clickable" onClick={() => go("execution")}>
                <td style={{ fontWeight: 600 }}>{SESSION.agentName}</td>
                <td className="muted">{SESSION.agentRole}</td>
                <td className="m">{SESSION.id}</td>
                <td className="m">{SESSION.contractId}</td>
                <td className="m dim">
                  {CONTRACT.tools.length} tools &middot; {CONTRACT.fsAllow.length} paths &middot; {CONTRACT.network.length} host
                </td>
                <td className="m">
                  <span style={{ color: "var(--allow)" }}>{events.filter((e: any) => e.decision === "ALLOW").length} allow</span>
                  <span className="dim"> / </span>
                  <span style={{ color: "var(--deny)" }}>{deny} deny</span>
                </td>
                <td><Chip kind="info" icon="&#9679;">ACTIVE</Chip></td>
                <td style={{ textAlign: "right" }}><span className="btn sm">Open execution</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      <Note>
        Aegis is the platform. DevFix is the reference agent used to demonstrate it. Additional
        agents appear here, each with their own task contract, policy set and evidence stream.
      </Note>
    </>
  );
}
