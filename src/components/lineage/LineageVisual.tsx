import React from "react";
import PageHead from "../shared/PageHead.tsx";
import Panel from "../shared/Panel.tsx";
import SourceFlag from "../shared/SourceFlag.tsx";
import { LINEAGE_NODES, LINEAGE_EDGES } from "../../data/fixtures.js";

export default function LineageVisual({ go, selected, select, source }: any) {
  const W = 1000;
  const H = 460;

  return (
    <>
      <PageHead
        title="Evidence Lineage"
        desc="Provenance of the authorization decision based on recorded events."
        actions={
          <>
            <SourceFlag source={source} />
            <button className="btn" onClick={() => go("decisions")}>Decisions</button>
            <button className="btn" onClick={() => go("evidence")}>Ledger</button>
          </>
        }
      />

      <Panel flush>
        <div className="lineagewrap">
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--line-3)" />
              </marker>
              <marker id="arrow-prov" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--amber)" />
              </marker>
            </defs>
            {LINEAGE_EDGES.map(([u, v, kind]: any, i: any) => {
              const nu = LINEAGE_NODES.find((n: any) => n.id === u);
              const nv = LINEAGE_NODES.find((n: any) => n.id === v);
              if (!nu || !nv) return null;
              
              let x1 = nu.x + nu.w;
              let y1 = nu.y + nu.h / 2;
              let x2 = nv.x;
              let y2 = nv.y + nv.h / 2;
              
              if (nu.x === nv.x) {
                x1 = nu.x + nu.w / 2;
                y1 = nu.y + nu.h;
                x2 = nv.x + nv.w / 2;
              }

              const mx = x1 + (x2 - x1) / 2;
              const d = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;

              const isProv = kind === "prov";
              const isTemp = kind === "temp";
              
              let stroke = isProv ? "var(--amber)" : isTemp ? "var(--line-3)" : "var(--line-2)";
              if (isProv) stroke = "rgba(196, 146, 47, 0.6)";

              return (
                <g key={i}>
                  <path
                    className={"ed" + (isProv ? " prov" : "") + (isTemp ? " temp" : "")}
                    d={d}
                    style={{ stroke }}
                    markerEnd={isProv ? "url(#arrow-prov)" : "url(#arrow)"}
                  />
                  {isProv && <text x={mx} y={y1 - 6} className="lbl" textAnchor="middle" fill="var(--amber)">provides context</text>}
                  {isTemp && <text x={mx} y={y1 - 6} className="lbl" textAnchor="middle">precedes</text>}
                </g>
              );
            })}
            
            {LINEAGE_NODES.map((n: any) => {
              const isSel = n.ev === selected && selected != null;
              return (
                <g
                  key={n.id}
                  className={"nd" + (n.kind ? " " + n.kind : "") + (isSel ? " sel" : "")}
                  transform={`translate(${n.x},${n.y})`}
                  style={{ cursor: n.ev ? "pointer" : "default" }}
                  onClick={() => { if (n.ev) { select(n.ev); go("evidence"); } }}>
                  <rect width={n.w} height={n.h} rx="4" />
                  <text x={n.w / 2} y={n.h / 2 - 2} textAnchor="middle" dominantBaseline="middle">{n.l}</text>
                  <text x={n.w / 2} y={n.h / 2 + 10} textAnchor="middle" dominantBaseline="middle" className="sub">{n.s}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </Panel>
    </>
  );
}
