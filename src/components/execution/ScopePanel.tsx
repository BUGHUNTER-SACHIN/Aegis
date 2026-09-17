import React from "react";
import Panel from "../shared/Panel.tsx";
import Note from "../shared/Note.tsx";
import { CONTRACT } from "../../data/fixtures.js";

export default function ScopePanel({ touched, breached }: any) {
  const inScope = [
    ...CONTRACT.fsAllow.map((p: any) => ({ p, hit: touched.has(p) })),
  ];

  return (
    <Panel
      title="DECLARED AUTHORITY"
      flush
      right={<span className="dim mono" style={{ fontSize: 10 }}>{CONTRACT.id}</span>}>
      <div className="scope">
        <div className="grp">
          <div className="h"><span className="sdot ok" />AUTHORIZED SCOPE</div>
          {inScope.map((s: any) => (
            <div key={s.p} className={"it" + (s.hit ? " hit" : "")}>
              <span className="g" aria-hidden="true">{s.hit ? "\u2713" : "\u00b7"}</span>
              {s.p}
              <span className="t">{s.hit ? "touched" : "not used"}</span>
            </div>
          ))}
        </div>

        <div className="grp">
          <div className="h"><span className="sdot off" />NOT AUTHORIZED</div>
          {CONTRACT.fsDeny.map((p: any) => {
            const hit = breached === p;
            return (
              <div key={p} className={"it" + (hit ? " breach" : "")}>
                <span className="g" aria-hidden="true">{hit ? "\u2715" : "\u00b7"}</span>
                {p}
                {hit ? <span className="t" style={{ color: "var(--deny)" }}>requested &middot; denied</span> : null}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
        <Note>
          This phase verifies filesystem reads through the local PEP. Shell commands such as
          npm audit are intentionally unavailable until a structured authorization design exists.
        </Note>
      </div>
    </Panel>
  );
}
