import React from "react";
import Panel from "../shared/Panel.tsx";
import Chip from "../shared/Chip.tsx";
import TrustChip from "../shared/TrustChip.tsx";
import Note from "../shared/Note.tsx";
import { fmtT } from "../../data/fixtures.js";

export default function ProvenancePanel({ event }: any) {
  if (!event) return null;

  return (
    <Panel title="CONTEXT PROVENANCE" flush right={<TrustChip t="UNTRUSTED_EXTERNAL" />}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ padding: "var(--s4)", borderRight: "1px solid var(--line)" }}>
          <div className="mono dim" style={{ fontSize: 9.5, letterSpacing: ".12em", marginBottom: 6 }}>INGESTED CONTENT</div>
          <div className="mono" style={{ fontSize: 12.5, marginBottom: 4 }}>{event.resource}</div>
          <div className="dim mono" style={{ fontSize: 11 }}>
            origin: third-party package &middot; ingested {fmtT(event.t)} &middot; read permitted
          </div>
          <div style={{ marginTop: 12 }}>
            <Note kind="warn">
              The file contains instruction-like text addressed to an agent. Aegis records that
              the content is external and unverified. It does not classify the content as
              malicious, and the README author is not accused of anything.
            </Note>
          </div>
        </div>

        <div style={{ padding: "var(--s4)" }}>
          <div className="mono dim" style={{ fontSize: 9.5, letterSpacing: ".12em", marginBottom: 6 }}>
            WHAT THE CLASSIFICATION MEANS
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>
            Content can inform the agent.
            <br />
            <span style={{ color: "var(--amber)" }}>Content cannot grant authority.</span>
          </div>
          <Note>
            Runtime authority comes from Cedar / Amazon Verified Permissions plus the currently
            implemented request and session scope. Text read from a file, however it is phrased,
            has no standing in the authorization decision. Signed Task Contract verification is
            target architecture and is not cryptographically enforced in this runtime.
          </Note>
        </div>
      </div>

      <div style={{ padding: "12px 16px" }}>
        <span className="dim mono" style={{ fontSize: 10 }}>TRUST LANES &middot; </span>
        <Chip kind="info">TRUSTED &mdash; request scope</Chip>{" "}
        <Chip kind="ghost">INTERNAL &mdash; first-party files</Chip>{" "}
        <Chip kind="ghost">GENERATED &mdash; tool output</Chip>{" "}
        <Chip kind="warn">UNTRUSTED_EXTERNAL &mdash; third-party content</Chip>
      </div>
    </Panel>
  );
}
