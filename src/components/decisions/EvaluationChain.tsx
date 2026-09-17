import React from "react";

export default function EvaluationChain({ ev }: any) {
  const denied = ev.decision === "DENY";

  const steps = [
    { l: "TASK CONTRACT", v: "tc_prod_fix_cve_9182", s: "signature VALID \u00b7 not expired", ok: true },
    { l: "RESOURCE SCOPE", v: ev.resource, s: denied ? "outside declared filesystem scope" : "inside declared filesystem scope", ok: !denied },
    { l: "CEDAR POLICY", v: "devfix.cedar v4", s: denied ? 'forbid ResourceGroup::"secrets" matched' : "permit ContractScope matched", ok: !denied },
    { l: "EVALUATION", v: "Amazon Verified Permissions", s: "deterministic \u00b7 at the gateway", ok: true },
    { l: "DECISION", v: ev.decision, s: ev.reason, ok: !denied },
  ];

  return (
    <div>
      {steps.map((s: any, i: any) => {
        const isVerdict = i === steps.length - 1;
        return (
          <div key={s.l}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "150px 1fr auto",
                gap: "var(--s3)",
                alignItems: "center",
                padding: "10px var(--s4)",
                border: "1px solid " + (isVerdict && !s.ok ? "rgba(210,92,92,.5)" : "var(--line)"),
                background: isVerdict && !s.ok ? "var(--deny-bg)" : "var(--panel-2)",
              }}>
              <span className="mono dim" style={{ fontSize: 9.5, letterSpacing: ".12em" }}>{s.l}</span>
              <span className="mono" style={{ fontSize: 12.5, color: isVerdict && !s.ok ? "var(--deny)" : "var(--fg)" }}>{s.v}</span>
              <span className="mono dim" style={{ fontSize: 10.5 }}>{s.s}</span>
            </div>
            {i < steps.length - 1 ? (
              <div className="mono dim" style={{ textAlign: "center", fontSize: 11, padding: "2px 0" }} aria-hidden="true">&darr;</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
