import React from "react";
import Panel from "../shared/Panel.tsx";
import DecisionChip from "../shared/DecisionChip.tsx";

export default function ActivityStream({ events, idx, go, select }: any) {
  const glyphFor = (e: any) =>
    e.decision === "DENY" ? "\u2715"
      : e.decision === "ALLOW" ? (e.trust === "UNTRUSTED_EXTERNAL" ? "\u26a0" : "\u2713")
      : "\u25cf";

  const colourFor = (e: any) =>
    e.decision === "DENY" ? "var(--deny)"
      : e.trust === "UNTRUSTED_EXTERNAL" ? "var(--amber)"
      : "var(--allow)";

  return (
    <Panel
      title="AGENT ACTIVITY"
      flush
      right={<span className="dim mono" style={{ fontSize: 10 }}>{Math.min(idx + 1, events.length)} of {events.length}</span>}>
      <div className="stream">
        {events.map((e: any, i: any) => (
          <div
            key={e.id}
            className={"ev" + (i > idx ? " pending" : "") + (i === idx ? " cur" : "") + (e.decision === "DENY" ? " deny" : "")}
            role="button"
            tabIndex={0}
            aria-label={`${e.t.toFixed(3)} ${e.tool} ${e.resource} ${e.decision}`}
            onClick={() => { select(e.id); go("decisions"); }}
            onKeyDown={(ev: any) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); select(e.id); go("decisions"); } }}>
            <span className="t">{e.t.toFixed(3)}</span>
            <span className="g" aria-hidden="true" style={{ color: colourFor(e) }}>{glyphFor(e)}</span>
            <span className="r"><span className="tool">{e.tool} </span>{e.resource}</span>
            <DecisionChip d={e.decision} />
            {e.trust === "UNTRUSTED_EXTERNAL" && e.decision === "ALLOW" ? (
              <span className="sub">context ingested &middot; UNTRUSTED_EXTERNAL</span>
            ) : null}
          </div>
        ))}
      </div>
    </Panel>
  );
}
