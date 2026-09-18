import React from "react";
import { fmtT } from "../../data/fixtures.js";

export default function Verdict({ ev, go, select }: any) {
  return (
    <div className="verdict" role="alert" aria-label="Security decision: denied">
      <div className="req">
        {ev.tool} <span style={{ color: "var(--fg)" }}>{ev.resource}</span>{" "}
        <span className="dim">&middot; {fmtT(ev.t)}</span>
      </div>

      <div className="word">
        <span className="x" aria-hidden="true">&#10005;</span>DENIED
      </div>

      <div className="reason">{ev.reason}</div>

      <div className="facts">
        <div className="f"><div className="k">RESPONSE</div><div className="v">{ev.http == null ? "HTTP UNKNOWN" : `HTTP ${ev.http}`}</div></div>
        <div className="f"><div className="k">EXECUTION</div><div className="v">{ev.execution}</div></div>
        <div className="f"><div className="k">DATA EXPOSED</div><div className="v">{ev.bytes == null ? "UNKNOWN" : `${ev.bytes} BYTES`}</div></div>
        <div className="f"><div className="k">EVIDENCE</div><div className="v">{ev.id}</div></div>
      </div>

      <div className="by">
        Decided by <strong>{ev.authProvider || "UNKNOWN AUTHORITY"}</strong> at the Aegis gateway,
        before the filesystem tool was invoked.
      </div>

      <div className="cta">
        <button className="btn primary" onClick={() => { select(ev.id); go("decisions"); }}>Why this was denied</button>
        <button className="btn" onClick={() => { select(ev.id); go("evidence"); }}>Open evidence</button>
        <button className="btn" onClick={() => go("lineage")}>View lineage</button>
        <button className="btn" onClick={() => go("investigations")}>Investigate</button>
      </div>
    </div>
  );
}
