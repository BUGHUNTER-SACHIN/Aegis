import React from "react";
import PageHead from "../shared/PageHead.tsx";
import Panel from "../shared/Panel.tsx";
import StateChip from "../shared/StateChip.tsx";
import SourceFlag from "../shared/SourceFlag.tsx";
import { SESSION, EVENTS } from "../../data/fixtures.js";

export default function Sessions({ go, events = EVENTS, source = "FIXTURE" }: any) {
  const liveEvents = Array.isArray(events) && events.length ? events : EVENTS;
  const isFixture = source === "FIXTURE";
  const sessionRows = Object.values(liveEvents.reduce((acc: any, event: any) => {
    const sessionId = event.sessionId || (isFixture ? SESSION.id : "UNKNOWN_SESSION");
    if (!acc[sessionId]) {
      acc[sessionId] = {
        id: sessionId,
        agentId: event.agentId || (isFixture ? SESSION.agentId : "UNKNOWN_AGENT"),
        contractId: isFixture ? SESSION.contractId : "UNAVAILABLE",
        startedAt: event.timestamp || SESSION.startedAt,
        durationMs: 0,
        events: [],
      };
    }
    acc[sessionId].events.push(event);
    if (event.timestamp && event.timestamp < acc[sessionId].startedAt) acc[sessionId].startedAt = event.timestamp;
    return acc;
  }, {}));

  return (
    <>
      <PageHead
        title="Sessions"
        desc="Sessions are derived from recorded ledger events when backend data is available; otherwise this view is explicitly demo/fallback."
        actions={<SourceFlag source={source} />}
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
              {sessionRows.map((row: any) => {
                const allow = row.events.filter((e: any) => e.decision === "ALLOW").length;
                const deny = row.events.filter((e: any) => e.decision === "DENY").length;
                const untrusted = row.events.filter((e: any) => e.trust === "UNTRUSTED_EXTERNAL").length;
                const state = deny ? "HALTED_AT_DENY" : isFixture ? SESSION.state : "LOCAL";
                return (
                  <tr key={row.id} className="clickable" onClick={() => go("execution")}>
                    <td className="m">{row.id}</td>
                    <td>{row.agentId}</td>
                    <td className="m">{row.contractId}</td>
                    <td className="m dim">{row.startedAt ? row.startedAt.slice(11, 19) + "Z" : "UNKNOWN"}</td>
                    <td className="m dim">{isFixture ? `${SESSION.durationMs}ms` : "UNAVAILABLE"}</td>
                    <td className="m">{row.events.length}</td>
                    <td className="m">
                      {allow} allow / <span style={{ color: "var(--deny)" }}>{deny} deny</span> / {untrusted} ctx
                    </td>
                    <td><StateChip s={state} /></td>
                    <td style={{ textAlign: "right" }}><span className="btn sm">{isFixture ? "Demo execution" : "View execution"}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {isFixture && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
            <span className="muted">Demo/fallback session data is shown because live ledger data is unavailable.</span>
          </div>
        )}
      </Panel>
    </>
  );
}
