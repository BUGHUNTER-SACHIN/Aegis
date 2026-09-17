import React, { useEffect, useState } from "react";
import { fmtT } from "../../data/fixtures.js";

export default function Transport({ events, idx, setIdx, selected, select }: any) {
  const safeEvents = Array.isArray(events) ? events : [];
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [pauseOnDeny, setPauseOnDeny] = useState(true);

  const isEnd = idx >= safeEvents.length - 1;
  const isStart = idx <= 0;

  useEffect(() => {
    let timer: any;
    if (playing) {
      if (idx < safeEvents.length - 1) {
        timer = setTimeout(() => {
          const nextIdx = idx + 1;
          const nextEv = safeEvents[nextIdx];
          setIdx(nextIdx);
          if (pauseOnDeny && nextEv && nextEv.decision === "DENY") {
            setPlaying(false);
          }
        }, 1000 / speed);
      } else {
        setPlaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [playing, idx, safeEvents, speed, pauseOnDeny, setIdx]);

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === "ArrowRight" && !isEnd) setIdx(idx + 1);
      if (e.key === "ArrowLeft" && !isStart) setIdx(idx - 1);
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p: boolean) => !p);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [idx, isEnd, isStart, setIdx]);

  useEffect(() => {
    if (safeEvents[idx]) select(safeEvents[idx].id);
  }, [idx, safeEvents, select]);

  if (safeEvents.length === 0) return null;

  return (
    <>
      <div className="tctl">
        <button onClick={() => { setIdx(0); setPlaying(false); }} disabled={isStart} aria-label="First event">|&lsaquo;</button>
        <button onClick={() => { setIdx(idx - 1); setPlaying(false); }} disabled={isStart} aria-label="Previous event">&lsaquo;</button>
        <button
          onClick={() => {
            if (isEnd) {
              setIdx(0);
              setPlaying(true);
            } else {
              setPlaying(!playing);
            }
          }}
          style={{ minWidth: 48, color: playing ? "var(--allow)" : "var(--fg)", fontWeight: 600 }}
          aria-label={playing ? "Pause" : "Play"}>
          {playing ? "PAUSE" : "PLAY"}
        </button>
        <button onClick={() => { setIdx(idx + 1); setPlaying(false); }} disabled={isEnd} aria-label="Next event">&rsaquo;</button>
        <button onClick={() => { setIdx(events.length - 1); setPlaying(false); }} disabled={isEnd} aria-label="Last event">&rsaquo;|</button>
        <button
          onClick={() => setSpeed(speed === 1 ? 2 : speed === 2 ? 0.5 : 1)}
          style={{ marginLeft: 6, fontSize: 10 }}>
          {speed}&times;
        </button>
      </div>

      <div className="tread" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 10, color: "var(--dim)" }}>
          <input
            type="checkbox"
            checked={pauseOnDeny}
            onChange={(e) => setPauseOnDeny(e.target.checked)}
            style={{ margin: 0 }}
          />
          AUTO PAUSE ON DENY
        </label>
        <span>
          SEQ {String(idx + 1).padStart(3, "0")} &middot; {safeEvents[idx] ? fmtT(safeEvents[idx].t) : ""}
        </span>
      </div>

      <div className="tl">
        <div className="track" />
        <div className="fill" style={{ width: ((idx / Math.max(1, safeEvents.length - 1)) * 100) + "%" }} />

        {safeEvents.map((e: any, i: any) => {
          const pct = (i / Math.max(1, safeEvents.length - 1)) * 100;
          const isOn = i <= idx;
          const k = e.decision === "DENY" ? "deny" : e.trust === "UNTRUSTED_EXTERNAL" ? "warn" : "ok";

          return (
            <div
              key={e.id}
              className={"mk " + k + (isOn ? " on" : "")}
              style={{ left: pct + "%", cursor: "pointer" }}
              onClick={() => { setIdx(i); setPlaying(false); }}>
              <div className="d" />
              <div className="lb" style={{ opacity: isOn ? 1 : 0.4 }}>{e.id}</div>
              {i === idx ? <div className="ph" /> : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
