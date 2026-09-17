import React from "react";

export default function Note({ kind = "", children }: any) {
  return <p className={"note " + kind}>{children}</p>;
}
