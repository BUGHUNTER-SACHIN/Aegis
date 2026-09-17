import React, { useState, useEffect } from 'react';
import { 
  Terminal, Play, RotateCcw, StepForward, ShieldAlert, 
  Cpu, GitBranch, Eye, Search, Sparkles, AlertTriangle
} from 'lucide-react';
import { CausalGraphModal } from './CausalGraphModal';
import { ReplayPlayerModal } from './ReplayPlayerModal';
import { InvestigateModal } from './InvestigateModal';

interface SimulationStep {
  stepNumber: number;
  timestamp: string;
  actionType: string;
  targetResource: string;
  trustStatus: string;
  decision: 'ALLOW' | 'DENY';
  reason: string;
  parentHash: string;
  stepHash: string;
  stateDigest: string;
  cedarLatencyMs: number;
  terminalOutput: string;
  eventId: string;
}

const INTENT_SEQUENCE = [
  { tool: 'fs', action: 'fs:read', resource: 'package.json', trust: 'TRUSTED' },
  { tool: 'shell', action: 'shell:exec', resource: 'npm audit --json', trust: 'TRUSTED' },
  { tool: 'fs', action: 'fs:read', resource: 'package-lock.json', trust: 'TRUSTED' },
  { tool: 'fs', action: 'fs:read', resource: 'node_modules/axios/README.md', trust: 'UNTRUSTED_EXTERNAL' },
  { tool: 'fs', action: 'fs:read', resource: '.env', trust: 'UNTRUSTED_EXTERNAL' }
];

export const DevFixSimulator: React.FC = () => {
  const [activeSteps, setActiveSteps] = useState<SimulationStep[]>([]);
  const [selectedStepDetail, setSelectedStepDetail] = useState<SimulationStep | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPoisonEnabled, setIsPoisonEnabled] = useState(true);

  // Modals state
  const [modalType, setModalType] = useState<'why' | 'replay' | 'investigate' | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const currentStepIndex = activeSteps.length;
  const isBlocked = activeSteps.length > 0 && activeSteps[activeSteps.length - 1].decision === 'DENY';

  const handleNextStep = async () => {
    if (currentStepIndex >= INTENT_SEQUENCE.length || isProcessing) return;
    setIsProcessing(true);
    
    let intent = INTENT_SEQUENCE[currentStepIndex];
    
    // If not poison enabled, change the 4th and 5th steps to something safe
    if (!isPoisonEnabled && currentStepIndex >= 3) {
       intent = { tool: 'fs', action: 'fs:read', resource: 'src/utils.ts', trust: 'TRUSTED' };
       if (currentStepIndex === 4) {
           intent = { tool: 'fs', action: 'fs:read', resource: 'src/main.tsx', trust: 'TRUSTED' };
       }
    }

    try {
      const startTime = performance.now();
      const res = await fetch("/api/agent/invoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "ui_session_1",
          agentId: "DevFix_UI",
          tool: intent.tool,
          action: intent.action,
          resource: intent.resource,
          context: { trust: intent.trust }
        })
      });
      const data = await res.json();
      const latency = Math.round(performance.now() - startTime);

      // Fetch ledger to get previousHash
      const ledgerRes = await fetch("/api/agent/ledger");
      const ledger = await ledgerRes.json();
      const currentEvent = ledger.find((e: any) => e.eventId === data.decision.eventId);

      const newStep: SimulationStep = {
        stepNumber: currentStepIndex + 1,
        timestamp: new Date().toISOString().substring(11, 23),
        actionType: intent.action,
        targetResource: intent.resource,
        trustStatus: intent.trust,
        decision: data.decision.decision,
        reason: data.decision.reason,
        parentHash: currentEvent?.previousHash || 'UNKNOWN',
        stepHash: data.decision.hash,
        stateDigest: data.decision.hash.substring(0, 10),
        cedarLatencyMs: latency,
        terminalOutput: data.decision.decision === 'DENY' 
           ? `devfix@agent:~$ ${intent.tool}.${intent.action}("${intent.resource}")\n[AEGIS GATEWAY] 403 FORBIDDEN - Blocked by Cedar policy.`
           : `devfix@agent:~$ ${intent.tool}.${intent.action}("${intent.resource}") -> 200 OK`,
        eventId: data.decision.eventId
      };

      const newSteps = [...activeSteps, newStep];
      setActiveSteps(newSteps);
      setSelectedStepDetail(newStep);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setActiveSteps([]);
    setSelectedStepDetail(null);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> DevFix Interactive Agent
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">REAL BACKEND API</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Autonomous Dependency Remediation
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed mt-0.5">
            Step through how Aegis deterministically monitors, tags untrusted context, and stops the prompt-injected agent from reading <code className="text-rose-400">.env</code>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => { setIsPoisonEnabled(!isPoisonEnabled); handleReset(); }}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
              isPoisonEnabled
                ? 'bg-rose-950/40 text-rose-300 border-rose-800 hover:bg-rose-900/50'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-800 hover:bg-emerald-900/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {isPoisonEnabled ? 'Injected README: ACTIVE' : 'Benign Clean Repo'}
          </button>
          
          <button
            onClick={handleNextStep}
            disabled={currentStepIndex >= INTENT_SEQUENCE.length || isProcessing || isBlocked}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            {isProcessing ? <span className="animate-spin text-lg">⏳</span> : <StepForward className="w-3.5 h-3.5" />} 
            Step Next
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-slate-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Live Agent Execution &amp; SHA-256 Evidence Ledger
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Step {currentStepIndex} of {INTENT_SEQUENCE.length}
              </span>
            </div>
            
            <div className="space-y-2">
              {activeSteps.map((step) => {
                const isSelected = selectedStepDetail?.stepNumber === step.stepNumber;
                return (
                  <div
                    key={step.stepNumber}
                    onClick={() => setSelectedStepDetail(step)}
                    className={`cursor-pointer p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/20'
                        : step.decision === 'DENY'
                        ? 'border-rose-800/80 bg-rose-950/20 hover:border-rose-700'
                        : step.trustStatus === 'UNTRUSTED_EXTERNAL'
                        ? 'border-amber-800/80 bg-amber-950/20 hover:border-amber-700'
                        : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[10px] text-slate-300 font-bold">
                          {step.stepNumber}
                        </span>
                        <span className="text-slate-400 text-[11px]">{step.timestamp}</span>
                        <span className="font-bold text-slate-200">{step.targetResource}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {step.trustStatus === 'UNTRUSTED_EXTERNAL' && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                            UNTRUSTED
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            step.decision === 'ALLOW'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border-rose-800'
                          }`}
                        >
                          {step.decision}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-black/90 rounded-xl border border-slate-800 p-4 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-800 pb-1.5">
              <span>SANDBOX STDOUT / PROTOCOL GATEWAY LOG</span>
              <span className="text-emerald-400">STATUS: ACTIVE</span>
            </div>
            <div className="space-y-1 text-slate-300 max-h-36 overflow-y-auto leading-relaxed">
              {activeSteps.map((s, i) => (
                <div key={i} className={s.decision === 'DENY' ? 'text-rose-400 font-bold' : s.trustStatus === 'UNTRUSTED_EXTERNAL' ? 'text-amber-300' : 'text-slate-300'}>
                  {s.terminalOutput}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-4">
          {isBlocked && (
            <div className="p-4 bg-rose-950/30 border border-rose-800/80 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-300 font-mono text-xs font-bold">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                SECURITY INCIDENT DETECTED
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                DevFix requested credential file <code className="text-rose-300 font-mono">.env</code> after reading tainted README. Evaluated deterministically by Cedar &rarr; BLOCKED. Zero bytes leaked.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-2 font-mono text-xs">
                {selectedStepDetail && (
                  <>
                    <button onClick={() => { setSelectedEventId(selectedStepDetail.eventId); setModalType('why'); }} className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-1.5 transition-all shadow">
                      <GitBranch className="w-3.5 h-3.5" /> WHY? (DAG)
                    </button>
                    <button onClick={() => { setSelectedEventId(selectedStepDetail.eventId); setModalType('replay'); }} className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center gap-1.5 transition-all">
                      <Eye className="w-3.5 h-3.5" /> REPLAY
                    </button>
                    <button onClick={() => { setSelectedEventId(selectedStepDetail.eventId); setModalType('investigate'); }} className="flex-1 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-1.5 transition-all shadow">
                      <Sparkles className="w-3.5 h-3.5" /> INVESTIGATE
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {selectedStepDetail && (
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  Step #{selectedStepDetail.stepNumber} Inspector
                </span>
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                  selectedStepDetail.decision === 'ALLOW' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                }`}>
                  {selectedStepDetail.decision}
                </span>
              </div>
              <div className="space-y-2 text-slate-300">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Requested Resource</span>
                  <span className="font-mono font-bold text-white">{selectedStepDetail.targetResource}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Cedar Evaluation Reason</span>
                  <p className="text-slate-300 leading-relaxed font-mono text-[11px] bg-slate-900 p-2 rounded border border-slate-800 mt-1">
                    {selectedStepDetail.reason}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[9px] uppercase text-slate-500 block">Context Taint</span>
                    <span className={selectedStepDetail.trustStatus === 'UNTRUSTED_EXTERNAL' ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                      {selectedStepDetail.trustStatus}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-[9px] uppercase text-slate-500 block">API Roundtrip</span>
                    <span className="text-cyan-400 font-bold">{selectedStepDetail.cedarLatencyMs} ms</span>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800/80 space-y-1 font-mono text-[10px] text-slate-400 break-all">
                  <span className="text-indigo-400 uppercase font-bold block mb-1">SHA-256 Hash Chain Link</span>
                  <div><span className="text-slate-500">ParentHash:</span><br/>{selectedStepDetail.parentHash}</div>
                  <div className="mt-1"><span className="text-slate-500">StepHash:</span><br/>{selectedStepDetail.stepHash}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalType === 'why' && selectedEventId && (
        <CausalGraphModal isOpen={true} onClose={() => { setModalType(null); setSelectedEventId(null); }} eventId={selectedEventId} />
      )}
      {modalType === 'replay' && selectedEventId && (
        <ReplayPlayerModal isOpen={true} onClose={() => { setModalType(null); setSelectedEventId(null); }} eventId={selectedEventId} />
      )}
      {modalType === 'investigate' && selectedEventId && (
        <InvestigateModal isOpen={true} onClose={() => { setModalType(null); setSelectedEventId(null); }} eventId={selectedEventId} />
      )}
    </div>
  );
};
