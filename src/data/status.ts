export type TruthState =
  | "LIVE"
  | "LOCAL"
  | "PARTIAL"
  | "FIXTURE"
  | "UNAVAILABLE"
  | "SDK_READY"
  | "LIVE_VERIFIED";

export const STATE_LABELS: Record<TruthState, string> = {
  LIVE: "LIVE",
  LOCAL: "LOCAL",
  PARTIAL: "PARTIAL",
  FIXTURE: "FIXTURE",
  UNAVAILABLE: "UNAVAILABLE",
  SDK_READY: "SDK READY",
  LIVE_VERIFIED: "LIVE VERIFIED",
};

export function stateLabel(state: string) {
  return STATE_LABELS[state as TruthState] || String(state).replace(/_/g, " ");
}
