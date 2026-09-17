import React from "react";

export default function SourceFlag({ source }: any) {
  const live = source === "LIVE";
  return (
    <span
      className="fixflag"
      title={live
        ? "Served by the Aegis backend."
        : "Demo fixture data. No backend reachable from this environment."}>
      {live ? "LIVE DATA" : "FIXTURE DATA"}
    </span>
  );
}
