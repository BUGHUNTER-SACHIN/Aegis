import React, { useEffect, useState } from "react";
import PageHead from "../shared/PageHead.tsx";
import Panel from "../shared/Panel.tsx";
import KV from "../shared/KV.tsx";
import Note from "../shared/Note.tsx";
import SourceFlag from "../shared/SourceFlag.tsx";
import aegisApi from "../../data/aegisApi.ts";

export default function Policies({ go }: any) {
  const [policy, setPolicy] = useState<any>(null);

  useEffect(() => {
    let active = true;
    aegisApi.getPolicy().then((result) => {
      if (active) setPolicy(result);
    });
    return () => { active = false; };
  }, []);

  const p = policy || {
    source: "UNAVAILABLE",
    file: "server/policies/devfix.cedar",
    hash: "",
    hashAlgorithm: "SHA-256",
    sourceText: "Loading current Cedar policy...",
    note: "Loading policy from backend.",
  };

  return (
    <>
      <PageHead
        title="Policies"
        desc="The current runtime policy shown here is the actual local Cedar source loaded by the Aegis PEP."
        actions={
          <>
            <SourceFlag source={p.source} />
            <button className="btn" onClick={() => go("decisions")}>Decisions</button>
          </>
        }
      />

      <div className="grid g3">
        <Panel title="ACTIVE SET">
          <KV
            rows={[
              ["FILE", p.file],
              ["AUTHORITY", p.policyAuthority || "local-cedar"],
              ["STATUS", <span style={{ color: "var(--info)" }}>{p.source}</span>],
              ["HASH ALG", p.hashAlgorithm],
              ["HASH", <span className="hash">{p.hash}</span>],
              ["NOTE", p.note],
            ]}
          />
        </Panel>
        <div style={{ gridColumn: "2 / -1" }}>
          <Panel title={"CEDAR SOURCE \u00b7 " + p.file} flush>
            <pre className="cedar">{p.sourceText}</pre>
            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
              <Note kind="info">
                This view displays the current Cedar policy loaded by the backend. It does not use
                the fixture policy as the authoritative runtime representation.
              </Note>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
