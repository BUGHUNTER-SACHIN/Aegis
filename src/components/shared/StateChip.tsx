import React from "react";
import Chip from "./Chip.tsx";

const MAP: any = {
  VERIFIED: ["allow", "\u2713"],
  LIVE_VERIFIED: ["allow", "\u2713"],
  CONNECTED: ["info", "\u25cf"],
  SDK_READY: ["info", "\u25e7"],
  IMPLEMENTED: ["ghost", "\u25e7"],
  NOT_CONFIGURED: ["ghost", "\u25cb"],
  UNAVAILABLE: ["ghost", "\u25cb"],
  FIXTURE: ["ghost", "\u25cc"],
  LIVE: ["allow", "\u2713"],
};

export default function StateChip({ s }: any) {
  const [kind, icon] = MAP[s] || ["ghost", "\u25cb"];
  return <Chip kind={kind} icon={icon}>{String(s).replace(/_/g, " ")}</Chip>;
}
