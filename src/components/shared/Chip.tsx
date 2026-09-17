import React from "react";

export default function Chip({ kind = "", icon, children, title }: any) {
  return (
    <span className={"chip " + kind} title={title}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
}
