import React from "react";

export default function KV({ rows }: any) {
  return (
    <dl className="kv">
      {rows.map(([k, v]: any, i: any) => (
        <React.Fragment key={i}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
