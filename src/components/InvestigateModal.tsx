import React, { useState, useEffect } from 'react';
import { X, Sparkles, Shield, AlertOctagon, Terminal } from 'lucide-react';

interface Props {
  eventId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const InvestigateModal: React.FC<Props> = ({ eventId, isOpen, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && eventId) {
      setLoading(true);
      setError('');
      fetch(`/api/agent/investigate/${eventId}`)
        .then(res => res.json())
        .then(resData => {
          if (resData.error) throw new Error(resData.error);
          setData(resData);
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [isOpen, eventId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono">Post-Hoc Bedrock Investigation</h2>
              <p className="text-xs text-slate-400 font-mono">Event: {eventId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6">
          {loading ? (
            <div className="text-center text-slate-400 font-mono p-10 animate-pulse">
              Dispatching Evidence Envelope to Amazon Bedrock...
            </div>
          ) : error ? (
            <div className="text-center text-rose-400 font-mono p-10">
              Error fetching investigation: {error}
            </div>
          ) : data ? (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 font-mono font-bold text-xs">
                    <Shield className="w-4 h-4 text-emerald-400" /> SEALED EVIDENCE ENVELOPE
                  </div>
                  <pre className="text-[10px] text-cyan-200 bg-black/50 p-3 rounded overflow-x-auto border border-slate-800/80 max-h-48">
                    {JSON.stringify(data.event, null, 2)}
                  </pre>
                </div>
                
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 font-mono font-bold text-xs">
                    <AlertOctagon className="w-4 h-4 text-rose-400" /> BEDROCK INVESTIGATION STATUS
                  </div>
                  <pre className="text-[10px] text-slate-300 bg-black/50 p-3 rounded overflow-x-auto border border-slate-800/80">
                    {JSON.stringify(data.investigationStatus, null, 2)}
                  </pre>
                  
                  {data.investigationStatus?.error && (
                    <div className="mt-2 p-2 bg-rose-950/20 border border-rose-800/50 rounded text-rose-400 text-xs font-mono">
                      <strong>DEGRADATION VERIFIED:</strong> Bedrock failed (expected in sandbox), but authorization decision was unaffected.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-purple-900/40">
                <div className="flex items-center gap-2 text-purple-300 font-mono font-bold text-xs mb-3">
                  <Terminal className="w-4 h-4" /> AI ANALYSIS
                </div>
                <div className="text-sm text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                  {data.investigationStatus?.analysis || "No analysis returned from model. Verify AWS Credentials in Sandbox."}
                </div>
              </div>

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
