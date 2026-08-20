import React, { useState } from 'react';
import { Cpu, Layers, Play, CheckCircle2, Shield, Activity, RefreshCw } from 'lucide-react';

interface HydraLedgerProps {
  logs: string[];
  activeCartridge: string;
  cartridges: string[];
  onSelectCartridge: (c: string) => void;
  onTriggerSimulate: () => void;
  onNotify: (message: string, type: 'success' | 'warning') => void;
}

export function HydraLedger({
  logs,
  activeCartridge,
  cartridges,
  onSelectCartridge,
  onTriggerSimulate,
  onNotify
}: HydraLedgerProps) {
  const [runningWorkflow, setRunningWorkflow] = useState<string | null>(null);

  const handleRunWorkflow = async (type: 'excel' | 'podcast' | 'shopify') => {
    setRunningWorkflow(type);
    try {
      let endpoint = '';
      let body = {};
      if (type === 'excel') {
        endpoint = '/api/workflows/excel-tracker';
        body = { id: `row_${Date.now().toString().slice(-4)}`, value: 'Revenue: +$4,200', author: 'Sir Boris' };
      } else if (type === 'podcast') {
        endpoint = '/api/workflows/podcast-bot';
        body = { podcastId: `pod_ep_${Math.floor(Math.random() * 90 + 10)}` };
      } else {
        endpoint = '/api/workflows/shopify-flow';
        body = { productId: `prod_${Math.floor(Math.random() * 900 + 100)}` };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      onNotify(`Workflow [${type.toUpperCase()}]: ${data.status || 'Executed'}`, 'success');
      onTriggerSimulate();
    } catch (err) {
      console.error(err);
      onNotify(`Workflow failed`, 'warning');
    } finally {
      setRunningWorkflow(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Provenance Ledger */}
      <section className="lg:col-span-2 border border-[#2A2A35] p-5 rounded-lg bg-[#121217] space-y-4">
        <div className="flex items-center justify-between border-b border-[#2A2A35] pb-3">
          <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-white">
            <Cpu size={16} className="text-[#D4AF37]" /> Hydra Loop - Provenance Ledger
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onTriggerSimulate}
              className="bg-[#1C1C26] hover:bg-[#282836] text-xs text-[#D4AF37] border border-[#2A2A35] px-2.5 py-1 rounded flex items-center gap-1 transition-all"
            >
              <RefreshCw size={12} /> Pulse Loop
            </button>
            <span className="text-[10px] font-mono bg-[#18261E] text-green-400 px-2 py-0.5 rounded border border-green-800/40">
              Maker-Checker-MGV Active
            </span>
          </div>
        </div>

        <div className="h-64 overflow-y-auto font-mono text-xs text-gray-300 space-y-1.5 pr-2 bg-[#08080C] p-3 rounded border border-[#20202C]">
          {logs.map((log, i) => {
            const isVerified = log.includes('VERIFIED');
            const isFlagged = log.includes('FLAGGED') || log.includes('FAILED');
            return (
              <div 
                key={i} 
                className={`py-0.5 px-1.5 rounded transition-colors ${
                  isVerified ? 'text-green-400' : isFlagged ? 'text-red-400 bg-red-950/30' : 'text-gray-400'
                }`}
              >
                {log}
              </div>
            );
          })}
        </div>

        {/* Kinetic Workflow Dispatchers */}
        <div className="pt-2 border-t border-[#2A2A35] space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Dispatch Kinetic Workflows:</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleRunWorkflow('excel')}
              disabled={!!runningWorkflow}
              className="bg-[#181822] hover:bg-[#222230] border border-[#2A2A35] text-xs px-3 py-1.5 rounded text-gray-200 hover:text-[#D4AF37] transition-all flex items-center gap-1.5"
            >
              <Play size={12} /> Workflow 01: Sheet Append
            </button>
            <button
              onClick={() => handleRunWorkflow('podcast')}
              disabled={!!runningWorkflow}
              className="bg-[#181822] hover:bg-[#222230] border border-[#2A2A35] text-xs px-3 py-1.5 rounded text-gray-200 hover:text-[#D4AF37] transition-all flex items-center gap-1.5"
            >
              <Play size={12} /> Workflow 56: Podcast Bot
            </button>
            <button
              onClick={() => handleRunWorkflow('shopify')}
              disabled={!!runningWorkflow}
              className="bg-[#181822] hover:bg-[#222230] border border-[#2A2A35] text-xs px-3 py-1.5 rounded text-gray-200 hover:text-[#D4AF37] transition-all flex items-center gap-1.5"
            >
              <Play size={12} /> Workflow 82: Shopify Flow
            </button>
          </div>
        </div>
      </section>

      {/* Cartridge Selector & Edge Envelope */}
      <section className="border border-[#2A2A35] p-5 rounded-lg bg-[#121217] space-y-4">
        <div className="border-b border-[#2A2A35] pb-3">
          <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-white">
            <Layers size={16} className="text-[#D4AF37]" /> Active Cartridge
          </h2>
          <p className="text-[11px] text-gray-400">Context Isolator & Sovereign Memory State</p>
        </div>

        <div className="flex flex-col gap-2">
          {cartridges.map(c => (
            <button 
              key={c}
              onClick={() => onSelectCartridge(c)}
              className={`text-left p-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
                activeCartridge === c 
                  ? 'bg-[#D4AF37] text-[#0B0B0E] font-bold shadow-md' 
                  : 'border border-[#2A2A35] bg-[#171720] text-gray-300 hover:border-[#D4AF37]/50'
              }`}
            >
              <span>{c}</span>
              {activeCartridge === c && <CheckCircle2 size={14} />}
            </button>
          ))}
        </div>

        <div className="bg-[#0B0B0F] border border-[#252535] rounded p-3 text-[11px] font-mono text-gray-400 space-y-1">
          <div className="text-gray-300 font-bold flex items-center gap-1">
            <Shield size={12} className="text-[#D4AF37]" /> Edge Ceiling & Isolation
          </div>
          <div>ARM64 8GB Ceiling: <span className="text-emerald-400">OPTIMIZED</span></div>
          <div>DuckDB WASM Cache: <span className="text-[#D4AF37]">L0_HYDRATED</span></div>
          <div>Bifrost Tunnel: <span className="text-green-400">SECURE (X25519)</span></div>
        </div>
      </section>
    </div>
  );
}
