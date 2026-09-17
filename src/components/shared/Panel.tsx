import React from "react";

export default function Panel({ title, right, children, flush, style, id }: any) {
  return (
    <section className="panel" style={style} id={id}>
      {title ? (
        <header>
          <h3>{title}</h3>
          {right ? <div className="right">{right}</div> : null}
        </header>
      ) : null}
      <div className={"body" + (flush ? " flush" : "")}>{children}</div>
    </section>
  );
}
