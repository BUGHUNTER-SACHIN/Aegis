import React from "react";
import PageHead from "../shared/PageHead.tsx";
import Panel from "../shared/Panel.tsx";
import KV from "../shared/KV.tsx";
import Note from "../shared/Note.tsx";
import { POLICY } from "../../data/fixtures.js";

export default function Policies({ go }: any) {
  const p = POLICY;
  return (
    <>
      <PageHead
        title="Policies"
        desc="Aegis compiles task contracts into Cedar policies, which are evaluated by Amazon Verified Permissions."
        actions={<button className="btn" onClick={() => go("decisions")}>Decisions</button>}
      />

      <div className="grid g3">
        <Panel title="ACTIVE SET">
          <KV
            rows={[
              ["FILE", p.file],
              ["VERSION", p.version],
              ["STATUS", <span style={{ color: "var(--info)" }}>{p.status}</span>],
              ["HASH", <span className="hash">{p.hash}</span>],
              ["EVALUATIONS", String(p.evaluations)],
              ["LAST", p.lastEvaluation],
            ]}
          />
        </Panel>
        <div style={{ gridColumn: "2 / -1" }}>
          <Panel title={"CEDAR SOURCE \u00b7 " + p.file} flush>
            <pre className="cedar">
              <span className="cm">// devfix.cedar &mdash; v4</span>
              <br />
              <span className="cm">// Authority: Amazon Verified Permissions (Cedar).</span>
              <br />
              <span className="cm">// Evaluated at the Aegis gateway before any tool invocation.</span>
              <br />
              <br />
              <span className="kw">permit</span> (
              <br />
              {"  "}principal <span className="kw">in</span> <span className="ent">Agent::"devfix"</span>,
              <br />
              {"  "}action <span className="kw">in</span> [<span className="ent">Action::"ReadFile"</span>, <span className="ent">Action::"ExecuteCommand"</span>],
              <br />
              {"  "}resource
              <br />
              )
              <br />
              <span className="kw">when</span> {"{"}
              <br />
              {"  "}resource <span className="kw">in</span> <span className="ent">ContractScope::"tc_prod_fix_cve_9182"</span> {"&&"}
              <br />
              {"  "}context.contract.signature == <span className="str">"VALID"</span> {"&&"}
              <br />
              {"  "}context.contract.expired == <span className="kw">false</span>
              <br />
              {"}"};
              <br />
              <br />
              <span className="hl">
                <span className="kw">forbid</span> (
                <br />
                {"  "}principal,
                <br />
                {"  "}action == <span className="ent">Action::"ReadFile"</span>,
                <br />
                {"  "}resource <span className="kw">in</span> <span className="ent">ResourceGroup::"secrets"</span>
                <br />
                );
              </span>
              <br />
              <span className="kw">forbid</span> (
              <br />
              {"  "}principal,
              <br />
              {"  "}action == <span className="ent">Action::"ExecuteCommand"</span>,
              <br />
              {"  "}resource
              <br />
              ) <span className="kw">unless</span> {"{"}
              <br />
              {"  "}resource <span className="kw">in</span> <span className="ent">ContractScope::"tc_prod_fix_cve_9182"</span>.commands
              <br />
              {"}"};
            </pre>
            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
              <Note kind="info">
                The highlighted <span className="mono">forbid</span> block is the rule that denied
                the <span className="mono">.env</span> read request.
              </Note>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
