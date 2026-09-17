import React from "react";
import PageHead from "../shared/PageHead.tsx";
import Panel from "../shared/Panel.tsx";
import Chip from "../shared/Chip.tsx";
import StateChip from "../shared/StateChip.tsx";
import Note from "../shared/Note.tsx";
import { AWS, LOCAL } from "../../data/fixtures.js";

export default function AwsControlPlane({ go }: any) {
  return (
    <>
      <PageHead
        title="AWS Control Plane"
        desc="What is implemented, what is loaded, and what is actually connected in this environment."
      />

      <Panel title="INTENDED CONTROL PLANE" flush>
        <div style={{ padding: "var(--s5) var(--s4)", display: "grid", gap: "var(--s4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--s3)", flexWrap: "wrap" }}>
            <span className="mono dim" style={{ fontSize: 9.5, letterSpacing: ".12em", width: 110, flex: "0 0 auto" }}>ENFORCEMENT</span>
            <Chip kind="ghost">Agent</Chip>
            <span className="dim" aria-hidden="true">&rarr;</span>
            <Chip kind="info">Aegis gateway (PEP)</Chip>
            <span className="dim" aria-hidden="true">&rarr;</span>
            <button onClick={() => go("policies")}><Chip kind="info">Verified Permissions / Cedar</Chip></button>
            <span className="dim" aria-hidden="true">&rarr;</span>
            <Chip kind="allow">ALLOW &rarr; tool</Chip>
            <Chip kind="deny">DENY &rarr; blocked</Chip>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--s3)", flexWrap: "wrap" }}>
            <span className="mono dim" style={{ fontSize: 9.5, letterSpacing: ".12em", width: 110, flex: "0 0 auto" }}>AUDIT</span>
            <button onClick={() => go("evidence")}><Chip kind="ghost">Evidence event</Chip></button>
            <span className="dim" aria-hidden="true">&rarr;</span>
            <Chip kind="ghost">EventBridge</Chip>
            <span className="dim" aria-hidden="true">&rarr;</span>
            <Chip kind="ghost">DynamoDB</Chip>
            <span className="dim" aria-hidden="true">&rarr;</span>
            <Chip kind="ghost">S3 Object Lock Compliance Mode</Chip>
            <span className="dim" aria-hidden="true">&rarr;</span>
            <Chip kind="ghost">KMS</Chip>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--s3)", flexWrap: "wrap" }}>
            <span className="mono dim" style={{ fontSize: 9.5, letterSpacing: ".12em", width: 110, flex: "0 0 auto" }}>INVESTIGATION</span>
            <Chip kind="ghost">Recorded evidence</Chip>
            <span className="dim" aria-hidden="true">&rarr;</span>
            <button onClick={() => go("investigations")}><Chip kind="ghost">Amazon Bedrock &middot; post-hoc</Chip></button>
          </div>
        </div>

        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
          <Note kind="info">
            Bedrock appears only on the investigation path. It is not in the enforcement path in
            any configuration.
          </Note>
        </div>
      </Panel>

      <Panel title="SERVICE STATUS" flush>
        <div className="tablescroll">
          <table className="dt">
            <thead>
              <tr><th>SERVICE</th><th>ROLE IN AEGIS</th><th>STATE</th><th>WHAT THAT MEANS HERE</th></tr>
            </thead>
            <tbody>
              {AWS.map((s: any) => (
                <tr key={s.name}>
                  <td style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{s.name}</td>
                  <td className="muted">{s.role}</td>
                  <td><StateChip s={s.state} /></td>
                  <td className="muted" style={{ maxWidth: 360 }}>{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="LOCAL VERIFICATION" flush>
        <div className="tablescroll">
          <table className="dt">
            <thead>
              <tr><th>CONTROL</th><th>STATE</th><th>NOTE</th></tr>
            </thead>
            <tbody>
              {LOCAL.map((l: any) => (
                <tr key={l.name}>
                  <td style={{ fontWeight: 500 }}>{l.name}</td>
                  <td><StateChip s={l.state} /></td>
                  <td className="muted">{l.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
          <Note>
            SDK ready means the integration is written and the client is constructed, not that a
            live AWS resource answered. No indicator on this page turns green because a service
            exists &mdash; only because a connection was verified.
          </Note>
        </div>
      </Panel>
    </>
  );
}
