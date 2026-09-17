import React from "react";
import PageHead from "../shared/PageHead.tsx";
import Panel from "../shared/Panel.tsx";
import Chip from "../shared/Chip.tsx";
import KV from "../shared/KV.tsx";
import Note from "../shared/Note.tsx";
import { CONTRACT } from "../../data/fixtures.js";

function ScopeList({ items, kind }: any) {
  const glyph = kind === "deny" ? "\u2715" : kind === "allow" ? "\u2713" : "\u00b7";
  const colour = kind === "deny" ? "var(--deny)" : kind === "allow" ? "var(--allow)" : "var(--dim)";
  return (
    <div>
      {items.map((i: any) => (
        <div
          key={i}
          className="mono"
          style={{ fontSize: 11.5, padding: "5px 0", borderBottom: "1px solid var(--line)", display: "flex", gap: 10 }}>
          <span aria-hidden="true" style={{ color: colour }}>{glyph}</span>
          {i}
        </div>
      ))}
    </div>
  );
}

export default function Contracts({ go }: any) {
  const c = CONTRACT;

  return (
    <>
      <PageHead
        title="Task Contracts"
        desc="A task contract is the declared authority for a session. Aegis compares what an agent was authorized to do against what it actually requested."
        actions={<button className="btn" onClick={() => go("execution")}>Agent execution</button>}
      />

      <Panel flush style={{ marginBottom: "var(--s5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--s5)", padding: "var(--s4)", flexWrap: "wrap" }}>
          <div>
            <div className="mono" style={{ fontSize: 15 }}>{c.id}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{c.purpose}</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Chip kind="allow" icon="&#10003;">SIGNATURE VALID</Chip>
            <Chip kind="ghost">TTL {c.ttl}</Chip>
            <Chip kind="info">SESSION {c.session}</Chip>
          </div>
        </div>
      </Panel>

      <div className="grid g3">
        <Panel title="IDENTITY & LIFETIME">
          <KV
            rows={[
              ["AGENT", c.agent],
              ["AGENT ID", c.agentId],
              ["SESSION", c.session],
              ["ISSUED", c.issuedAt.slice(11, 23) + "Z"],
              ["EXPIRES", c.expiresAt.slice(11, 23) + "Z"],
              ["TTL", c.ttl],
              ["DEPLOYMENT", <span style={{ color: "var(--amber)" }}>{c.deployment}</span>],
            ]}
          />
        </Panel>

        <Panel title="PERMITTED TOOLS">
          <ScopeList items={c.tools} kind="allow" />
          <div className="mono dim" style={{ fontSize: 9.5, letterSpacing: ".12em", margin: "16px 0 6px" }}>NETWORK SCOPE</div>
          <ScopeList items={c.network} kind="allow" />
          <ScopeList items={c.networkDeny} kind="deny" />
        </Panel>

        <Panel title="FILESYSTEM SCOPE">
          <div className="mono dim" style={{ fontSize: 9.5, letterSpacing: ".12em", marginBottom: 6 }}>AUTHORIZED</div>
          <ScopeList items={c.fsAllow} kind="allow" />
          <div className="mono dim" style={{ fontSize: 9.5, letterSpacing: ".12em", margin: "16px 0 6px" }}>NOT AUTHORIZED</div>
          <ScopeList items={c.fsDeny} kind="deny" />
        </Panel>
      </div>

      <Panel title="SIGNATURE">
        <div style={{ display: "flex", gap: "var(--s6)", flexWrap: "wrap", alignItems: "flex-start" }}>
          <div>
            <div className="mono dim" style={{ fontSize: 9.5, letterSpacing: ".12em" }}>STATUS</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "var(--allow)" }}>VALID &#10003;</div>
          </div>
          <div>
            <div className="mono dim" style={{ fontSize: 9.5, letterSpacing: ".12em" }}>ALGORITHM</div>
            <div className="mono" style={{ fontSize: 13 }}>{c.signatureAlg}</div>
          </div>
          <div>
            <div className="mono dim" style={{ fontSize: 9.5, letterSpacing: ".12em" }}>KEY ID</div>
            <div className="mono" style={{ fontSize: 13 }}>{c.signatureKid}</div>
          </div>
          <div style={{ flex: "1 1 300px" }}>
            <Note>
              The signature is verified against a local key in this environment. AWS KMS
              integration is implemented but no live key is bound &mdash; see the AWS control plane.
            </Note>
          </div>
        </div>
      </Panel>
    </>
  );
}
