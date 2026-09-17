import React, { useState, useEffect } from "react";
import AppShell from "./components/layout/AppShell.tsx";
import Overview from "./components/overview/Overview.tsx";
import Agents from "./components/agents/Agents.tsx";
import Execution from "./components/execution/Execution.tsx";
import Contracts from "./components/contracts/Contracts.tsx";
import Policies from "./components/policies/Policies.tsx";
import Decisions from "./components/decisions/Decisions.tsx";
import Sessions from "./components/sessions/Sessions.tsx";
import Evidence from "./components/evidence/Evidence.tsx";
import FlightRecorder from "./components/recorder/FlightRecorder.tsx";
import LineageVisual from "./components/lineage/LineageVisual.tsx";
import Investigations from "./components/investigations/Investigations.tsx";
import SecurityTests from "./components/tests/SecurityTests.tsx";
import AwsControlPlane from "./components/aws/AwsControlPlane.tsx";
import aegisApi from "./data/aegisApi.ts";
import { EVENTS } from "./data/fixtures.js";
import { parseHash, ROUTE_IDS, ROUTE_LABELS } from "./components/layout/routes.ts";

export default function App() {
  const [route, setRouteState] = useState(parseHash(window.location.hash));
  const [data, setData] = useState<any>({ source: "FIXTURE", events: EVENTS });
  const [chain, setChain] = useState<any>({ source: "FIXTURE", verified: true, ok: EVENTS.length, total: EVENTS.length });
  const [analysis, setAnalysis] = useState<any>(null);
  const [playIdx, setPlayIdx] = useState(EVENTS.length - 1);
  const [selectedEvent, selectEvent] = useState<any>(EVENTS[EVENTS.length - 1]?.id || null);

  const setRoute = (r: string) => {
    window.location.hash = r;
    setRouteState(r);
  };

  useEffect(() => {
    const onHash = () => setRouteState(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.title = (ROUTE_LABELS[route] || "Overview") + " · Aegis";
  }, [route]);

  const refreshLedger = async () => {
    const [ledgerRes, chainRes] = await Promise.all([
      aegisApi.getLedger(),
      aegisApi.verifyChain()
    ]);
    setData(ledgerRes);
    setChain(chainRes);
    const evs = ledgerRes.events || [];
    setPlayIdx(Math.max(0, evs.length - 1));
    if (evs.length) {
      selectEvent(evs[evs.length - 1].id);
      const deny = evs.find((e: any) => e.decision === "DENY");
      const investigateId = deny ? deny.id : evs[evs.length - 1].id;
      aegisApi.investigate(investigateId).then(aRes => {
        setAnalysis(aRes);
      });
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      aegisApi.getLedger(),
      aegisApi.verifyChain()
    ]).then(([ledgerRes, chainRes]) => {
      if (!active) return;
      setData(ledgerRes);
      setChain(chainRes);
      const evs = ledgerRes.events || [];
      setPlayIdx(Math.max(0, evs.length - 1));
      if (evs.length) {
        selectEvent(evs[evs.length - 1].id);
        const deny = evs.find((e: any) => e.decision === "DENY");
        const investigateId = deny ? deny.id : evs[evs.length - 1].id;
        aegisApi.investigate(investigateId).then(aRes => {
          if (active) setAnalysis(aRes);
        });
      }
    });
    return () => { active = false; };
  }, []);

  const Component = {
    overview: Overview,
    agents: Agents,
    execution: Execution,
    contracts: Contracts,
    policies: Policies,
    decisions: Decisions,
    sessions: Sessions,
    evidence: Evidence,
    recorder: FlightRecorder,
    lineage: LineageVisual,
    investigations: Investigations,
    tests: SecurityTests,
    aws: AwsControlPlane,
  }[route as keyof typeof ROUTE_LABELS] || Overview;

  return (
    <AppShell
      route={route}
      setRoute={setRoute}
      events={data.events}
      playIdx={playIdx}
      setPlayIdx={setPlayIdx}
      selectedEvent={selectedEvent}
      selectEvent={selectEvent}>
      <Component
        events={data.events}
        idx={playIdx}
        setIdx={setPlayIdx}
        selected={selectedEvent}
        select={selectEvent}
        go={setRoute}
        source={data.source}
        chain={chain}
        refresh={refreshLedger}
        analysis={analysis ? analysis.analysis : { whatHappened: ["Loading analysis..."], basis: [], refs: [], notAsserted: [] }}
      />
    </AppShell>
  );
}
