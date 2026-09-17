import React from "react";
import Chip from "./Chip.tsx";

export default function TrustChip({ t }: any) {
  if (t === "UNTRUSTED_EXTERNAL") {
    return (
      <Chip kind="warn" icon="\u26a0" title="Third-party content of unverified origin. Classification records origin, not intent.">
        UNTRUSTED_EXTERNAL
      </Chip>
    );
  }
  if (t === "TRUSTED") return <Chip kind="info" icon="\u25c8">TRUSTED</Chip>;
  if (t === "GENERATED") return <Chip kind="ghost">GENERATED</Chip>;
  return <Chip kind="ghost">{t}</Chip>;
}
