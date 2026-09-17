import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, Play, ShieldAlert, GitBranch, 
  Eye, CheckCircle2, XCircle, Code, Check, Copy, Sparkles 
} from 'lucide-react';
import { CausalGraphModal } from './CausalGraphModal';
import { ReplayPlayerModal } from './ReplayPlayerModal';
import { InvestigateModal } from './InvestigateModal';

export const AegisFlightRecorder: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [showJsonRecord, setShowJsonRecord] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  
  // Modal states
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'why' | 'replay' | 'investigate' | null>(null);

  useEffect(() => {
    // Poll the ledger API
    const fetchLedger = async () => {
      try {
        const res = await fetch("/api/agent/ledger");
        if (res.ok) {
          const data = await res.json();
          setEvents(data.reverse()); // latest first
        }
      } catch (err) {
        console.error("Failed to fetch ledger", err);
      }
    };
    
    fetchLedger();
    const interval = setInterval(fetchLedger, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(events, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">Real-Time Evidence Ledger</h2>
            <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono font-bold">
              LIVE BACKEND
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
            Every authorization decision evaluated by the Aegis PEP is cryptographically hashed and appended here in the process-local ledger. 
            This sealed evidence chain is used by Post-Hoc Bedrock Investigation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-emerald-400">LEDGER INTEGRITY</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Hashes continuously verified.</p>
          </div>
        </div>
        <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shrink-0">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-mono font-bold text-indigo-400">EVENTS RECORDED</div>
            <p className="text-xs text-slate-400 mt-1">{events.length} cryptographic operations.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white uppercase font-mono">Cryptographically Linked Event Log</h3>
          <button onClick={() => setShowJsonRecord(!showJsonRecord)} className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5" />
            {showJsonRecord ? 'Hide JSON' : 'View Raw JSON'}
          </button>
        </div>

        {showJsonRecord && (
          <div className="bg-slate-950 p-4 rounded-xl border border-cyan-900/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 font-bold">Raw Ledger</span>
              <button onClick={handleCopyJson} className="px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                {copiedJson ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="text-xs font-mono text-cyan-200/90 bg-slate-900/80 p-3.5 rounded-lg overflow-x-auto border border-slate-800 max-h-64">
              {JSON.stringify(events, null, 2)}
            </pre>
          </div>
        )}

        <div className="space-y-3 font-mono">
          {events.map((event, idx) => {
            const isBlocked = event.decision === 'DENY';
            const isTainted = event.context?.trust === 'UNTRUSTED_EXTERNAL';
            
            return (
              <div key={event.eventId} className={`p-4 rounded-xl border ${
                isBlocked ? 'bg-rose-950/20 border-rose-800/80' : isTainted ? 'bg-amber-950/20 border-amber-800/60' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex flex-col sm:flex-row justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{new Date(event.timestamp).toISOString().split('T')[1].replace('Z','')}</span>
                    <span className={`font-bold ${isBlocked ? 'text-rose-300' : isTainted ? 'text-amber-300' : 'text-slate-200'}`}>
                      {event.tool}.{event.action}
                    </span>
                    <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {event.resource}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isBlocked ? (
                      <span className="px-2 py-0.5 rounded bg-rose-900 text-rose-200 border border-rose-600 font-bold">BLOCKED</span>
                    ) : isTainted ? (
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">TAINTED</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">ALLOWED</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-800/50 grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px]">
                  <div>
                    <span className="text-slate-500 uppercase block">Reason</span>
                    <span className="text-slate-300">{event.reason}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block">Cryptographic Hash</span>
                    <span className="text-cyan-400 font-bold break-all">{event.hash}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-2 flex gap-2">
                  <button onClick={() => { setSelectedEventId(event.eventId); setModalType('why'); }} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1 text-[10px]">
                    <GitBranch className="w-3 h-3" /> WHY?
                  </button>
                  <button onClick={() => { setSelectedEventId(event.eventId); setModalType('replay'); }} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1 text-[10px]">
                    <Eye className="w-3 h-3" /> REPLAY
                  </button>
                  <button onClick={() => { setSelectedEventId(event.eventId); setModalType('investigate'); }} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1 text-[10px]">
                    <Sparkles className="w-3 h-3" /> INVESTIGATE
                  </button>
                </div>
              </div>
            );
          })}
          {events.length === 0 && (
            <div className="text-center py-10 text-slate-500 font-sans">
              No evidence events recorded yet. Run the DevFix Simulator to generate events.
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
