import React from 'react';
import { Server, Cpu, CheckCircle2, Shield } from 'lucide-react';

interface ResourceMonitorProps {
  data?: { time: string; cpu: number; memory: number }[];
  modeName?: string;
  ramAllocation?: string;
  cores?: string;
}

export function ResourceMonitor({ 
  modeName = "Merlin's Agency Sandbox", 
  ramAllocation = "1.8 GB / 8.0 GB (22.5%)", 
  cores = "2 / 8 Cores (ARM64_Affinity)" 
}: ResourceMonitorProps) {
  return (
    <div className="bg-[#11111C] border border-[#222234] rounded-2xl p-5 mt-4 text-xs font-mono">
      <div className="flex items-center justify-between border-b border-[#222234] pb-3 mb-3">
        <h4 className="text-xs font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
          <Shield size={14} className="text-[#D4AF37]" />
          <span>Constrained Hardware Sandbox Profile</span>
        </h4>
        <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
          ISOLATION ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
        <div className="p-3 bg-[#090910] border border-[#1A1A28] rounded-xl flex items-center gap-2.5">
          <Server size={16} className="text-[#00F0FF]" />
          <div>
            <span className="text-gray-400 block text-[9px] uppercase">Allocated Memory:</span>
            <strong className="text-white font-mono">{ramAllocation}</strong>
          </div>
        </div>

        <div className="p-3 bg-[#090910] border border-[#1A1A28] rounded-xl flex items-center gap-2.5">
          <Cpu size={16} className="text-[#10B981]" />
          <div>
            <span className="text-gray-400 block text-[9px] uppercase">Active Processor Cores:</span>
            <strong className="text-white font-mono">{cores}</strong>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#1C1C2C] flex items-center justify-between text-[10px] text-gray-400">
        <span>Target: <strong className="text-gray-300">{modeName}</strong></span>
        <span className="text-emerald-400 flex items-center gap-1">
          <CheckCircle2 size={11} /> Unneeded Subsystems Deallocated
        </span>
      </div>
    </div>
  );
}

export function CompactResourceMonitor({ data }: { data?: any }) {
  return (
    <div className="px-2 py-1 bg-[#0D0D14] border border-[#222234] rounded-lg text-[10px] font-mono flex items-center gap-1.5 text-gray-300">
      <Server size={11} className="text-[#D4AF37]" />
      <span>Quota: <strong className="text-white">1.8GB / 2 Cores</strong></span>
    </div>
  );
}
