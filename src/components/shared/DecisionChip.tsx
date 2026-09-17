import React from "react";
import Chip from "./Chip.tsx";

export default function DecisionChip({ d }: any) {
  if (d === "ALLOW") return <Chip kind="allow" icon="\u2713">ALLOW</Chip>;
  if (d === "DENY") return <Chip kind="deny" icon="\u2715">DENY</Chip>;
  return <Chip kind="ghost" icon="\u25cf">{d}</Chip>;
}
