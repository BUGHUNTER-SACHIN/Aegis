import React, { useEffect, useState } from 'react';
import { X, GitBranch } from 'lucide-react';

interface Props {
  eventId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CausalGraphModal: React.FC<Props> = ({ eventId, isOpen, onClose }) => {
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    if (isOpen && eventId) {
      fetch("/api/agent/ledger")
        .then(res => res.json())
        .then(data => {
          const found = data.find((e: any) => e.eventId === eventId);
          if (found) setEvent(found);
        });
    }
  }, [isOpen, eventId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 text-center space-y-4">
         <div className="flex justify-between">
           <div className="flex gap-2 items-center text-indigo-400 font-mono font-bold">
             <GitBranch className="w-5 h-5"/> CAUSAL DAG (Simplified)
           </div>
           <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-white"/></button>
         </div>
         {event && (
           <div className="text-left font-mono text-xs space-y-2 bg-slate-950 p-4 border border-slate-800 rounded">
             <p className="text-emerald-400">Previous Hash: {event.previousHash}</p>
             <p className="text-slate-400">&darr; Append Event {event.eventId}</p>
             <p className="text-cyan-400">New Hash: {event.hash}</p>
           </div>
         )}
         <p className="text-slate-400 text-xs">Causal graph connects the cryptographic hashes back to the genesis block.</p>
      </div>
    </div>
  );
};
