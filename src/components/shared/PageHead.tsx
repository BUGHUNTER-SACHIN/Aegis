import React from "react";

export default function PageHead({ title, desc, actions }: any) {
  return (
    <div className="pagehead">
      <div>
        <h2 className="t">{title}</h2>
        {desc ? <p className="d">{desc}</p> : null}
      </div>
      {actions ? <div className="actions">{actions}</div> : null}
    </div>
  );
}
