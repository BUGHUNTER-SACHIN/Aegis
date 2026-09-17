import React from "react";
import { stateLabel } from "../../data/status.ts";

const TITLES: Record<string, string> = {
  LIVE: "Served by a live backend service.",
  LOCAL: "Served by the local Aegis runtime in this process.",
  PARTIAL: "Some data is live/local, while some remains fallback or unavailable.",
  FIXTURE: "Explicit fallback/demo fixture data. Not live telemetry.",
  UNAVAILABLE: "No backend source is implemented or reachable for this surface.",
  SDK_READY: "SDK integration exists, but no live service call has been verified.",
  LIVE_VERIFIED: "A real service interaction has been verified in this process.",
};

export default function SourceFlag({ source }: any) {
  const key = String(source || "FIXTURE");
  return (
    <span
      className="fixflag"
      title={TITLES[key] || "Data-state classification for this surface."}>
      {stateLabel(key)} DATA
    </span>
  );
}
