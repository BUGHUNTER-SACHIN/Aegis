import React from "react";
import Panel from "../shared/Panel.tsx";
import Note from "../shared/Note.tsx";
import { short } from "../../data/fixtures.js";

export default function ChainLink({ ev, events }: any) {
  return (
    <>
      <Panel title="CHAIN LINK" flush>
        <div style={{ padding: "var(--s4)" }}>
          <div className="mono dim" style={{ fontSize: 9.5, letterSpacing: ".12em", marginBottom: 4 }}>PREVIOUS HASH</div>
          <div className="hash" style={{ marginBottom: 12 }}>{ev.prev || "\u2014 genesis event \u2014"}</div>
          <div className="mono dim" style={{ fontSize: 11, marginBottom: 12 }} aria-hidden="true">
            &#9474; SHA-256
            <br />
            &#9660;
          </div>
          <div className="mono dim" style={{ fontSize: 9.5, letterSpacing: ".12em", marginBottom: 4 }}>CURRENT HASH</div>
          <div className="hash" style={{ color: "var(--fg)" }}>{ev.curr}</div>
        </div>
      </Panel>

      <Panel title="CHAIN POSITION" flush>
        <div className="chain">
          {events.map((e: any) => (
            <div
              className="lnk"
              key={e.id}
              style={{ background: e.id === ev.id ? "var(--panel-3)" : "transparent" }}>
              <div className="sq">{String(e.seq).padStart(3, "0")}</div>
              <div className="bd">
                <span className={e.id === ev.id ? "a" : ""}>{e.id}</span>
                <span className="dim"> &middot; {short(e.prev)} &rarr; </span>
                <span className={e.id === ev.id ? "a" : ""}>{short(e.curr)}</span>
                <span style={{ color: "var(--allow)" }}> &#10003;</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
          <Note>
            Modifying any recorded field changes that event&rsquo;s hash and breaks every link
            after it. Verification is recomputation on the backend, not a stored flag.
          </Note>
        </div>
      </Panel>
    </>
  );
}
