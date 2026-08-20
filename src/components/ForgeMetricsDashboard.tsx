import React, { useState, useEffect } from 'react';
import {
  Activity,
  Bot,
  Cpu,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Gauge,
  Layers,
  Sparkles,
  Server,
  Radio,
  ArrowUpRight,
  HardDrive,
  RefreshCw
} from 'lucide-react';

export interface AgentStatusItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'ACTIVE' | 'ONLINE' | 'GUARDING' | 'SYNCED';
  workloadPercent: number;
  metricLabel: string;
  metricValue: string;
  color: string;
}

interface ForgeMetricsDashboardProps {
  totalCLIsForged?: number;
  activeLeasesCount?: number;
  activeWorktreesCount?: number;
  compact?: boolean;
}

export function ForgeMetricsDashboard({
  totalCLIsForged = 4,
  activeLeasesCount = 3,
  activeWorktreesCount = 3,
  compact = false
}: ForgeMetricsDashboardProps) {
  const [pulseLive, setPulseLive] = useState(true);

  // Live agents state
  const agents: AgentStatusItem[] = [
    {
      id: 'anya',
      name: 'Anya Ω',
      role: 'AST Compiler & Synthesizer',
      avatar: '⚡',
      status: 'ACTIVE',
      workloadPercent: 88,
      metricLabel: 'AST Speed',
      metricValue: '1,840 n/s',
      color: 'amber'
    },
    {
      id: 'merlin',
      name: 'Merlin Ω',
      role: 'DAG Swarm Orchestrator',
      avatar: '🧙‍♂️',
      status: 'ONLINE',
      workloadPercent: 74,
      metricLabel: 'DAG Flow',
      metricValue: '128 tasks/m',
      color: 'purple'
    },
    {
      id: 'gideon',
      name: 'Sir Gideon',
      role: 'Sentinel Verification Gate',
      avatar: '🛡️',
      status: 'GUARDING',
      workloadPercent: 96,
      metricLabel: 'Pass Rate',
      metricValue: '99.8%',
      color: 'emerald'
    },
    {
      id: 'sirlink',
      name: 'Sir Link',
      role: 'Stdio JSON-RPC Conduit',
      avatar: '⚔️',
      status: 'SYNCED',
      workloadPercent: 62,
      metricLabel: 'Latency',
      metricValue: '1.8 ms',
      color: 'sky'
    },
    {
      id: 'mnemosyne',
      name: 'Lady Mnemosyne',
      role: 'Zero-Ambient VFS Cache',
      avatar: '🏛️',
      status: 'ONLINE',
      workloadPercent: 48,
      metricLabel: 'Isolation',
      metricValue: '0% Leak',
      color: 'pink'
    }
  ];

  // Periodic visual tick
  useEffect(() => {
    const timer = setInterval(() => {
      setPulseLive(prev => !prev);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#0E0E17] border-2 border-[#252538] hover:border-[#D4AF37]/50 rounded-2xl p-4 sm:p-5 space-y-4 transition-all shadow-xl">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1E1E2E] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Gauge size={16} className="text-[#D4AF37]" /> Swarm Telemetry & Health
            </h2>
            <span className="text-[9px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-800/40 font-mono">
              ALL NOMINAL
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Real-time multi-agent fleet workload, JSON-RPC velocity, and Edge ARM64 efficiency.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="bg-[#151522] border border-[#2A2A3E] text-gray-300 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[11px]">
            <Server size={12} className="text-sky-400" />
            <span>Fleet: <strong className="text-white">5 Synced</strong></span>
          </span>
          <span className="bg-[#151522] border border-[#2A2A3E] text-amber-300 px-2.5 py-1 rounded-xl flex items-center gap-1.5 font-bold text-[11px]">
            <Activity size={12} className={pulseLive ? 'text-amber-400' : 'text-yellow-200'} />
            <span>99.9% Uptime</span>
          </span>
        </div>
      </div>

      {/* 1. KEY EFFICIENCY & THROUGHPUT METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Card 1: AST Generation Throughput */}
        <div className="bg-gradient-to-b from-[#141422] to-[#0D0D15] border border-[#222236] p-3 rounded-xl space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-bold flex items-center gap-1 text-[11px]">
              <Zap size={13} className="text-amber-400" /> AST Velocity
            </span>
            <span className="text-[9px] text-amber-300 bg-amber-950/60 px-1 py-0.5 rounded font-mono font-bold">
              +14%
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-black text-white font-mono">1,840</span>
            <span className="text-[10px] text-gray-400 font-mono">nodes/s</span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full bg-[#08080C] h-1.5 rounded-full overflow-hidden p-0.5 border border-[#222230]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#D4AF37] transition-all duration-700"
                style={{ width: '74%' }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-gray-500">
              <span>Peak: 2.5k</span>
              <span className="text-amber-400 font-bold">74% Target</span>
            </div>
          </div>
        </div>

        {/* Card 2: JSON-RPC Dispatch Rate */}
        <div className="bg-gradient-to-b from-[#141422] to-[#0D0D15] border border-[#222236] p-3 rounded-xl space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-bold flex items-center gap-1 text-[11px]">
              <Radio size={13} className="text-sky-400" /> Stdio Transport
            </span>
            <span className="text-[9px] text-sky-300 bg-sky-950/60 px-1 py-0.5 rounded font-mono font-bold">
              Sub-ms
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-black text-sky-300 font-mono">1.8 ms</span>
            <span className="text-[10px] text-gray-400 font-mono">latency</span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full bg-[#08080C] h-1.5 rounded-full overflow-hidden p-0.5 border border-[#222230]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-300 transition-all duration-700"
                style={{ width: '92%' }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-gray-500">
              <span>420 req/s</span>
              <span className="text-sky-400 font-bold">92% Target</span>
            </div>
          </div>
        </div>

        {/* Card 3: Memory Efficiency (ARM64 Clamped) */}
        <div className="bg-gradient-to-b from-[#141422] to-[#0D0D15] border border-[#222236] p-3 rounded-xl space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-bold flex items-center gap-1 text-[11px]">
              <Cpu size={13} className="text-emerald-400" /> Memory Ratio
            </span>
            <span className="text-[9px] text-emerald-300 bg-emerald-950/60 px-1 py-0.5 rounded font-mono font-bold">
              CLAMPED
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-black text-emerald-300 font-mono">3.4 GB</span>
            <span className="text-[10px] text-gray-400 font-mono">/ 8.0 GB</span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full bg-[#08080C] h-1.5 rounded-full overflow-hidden p-0.5 border border-[#222230]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all duration-700"
                style={{ width: '42.5%' }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-gray-500">
              <span>Headroom: 4.6G</span>
              <span className="text-emerald-400 font-bold">42.5% Used</span>
            </div>
          </div>
        </div>

        {/* Card 4: Gideon Test Pass Rate & Integrity */}
        <div className="bg-gradient-to-b from-[#141422] to-[#0D0D15] border border-[#222236] p-3 rounded-xl space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-bold flex items-center gap-1 text-[11px]">
              <ShieldCheck size={13} className="text-purple-400" /> Gideon Pass
            </span>
            <span className="text-[9px] text-purple-300 bg-purple-950/60 px-1 py-0.5 rounded font-mono font-bold">
              100%
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-black text-purple-300 font-mono">99.8%</span>
            <span className="text-[10px] text-gray-400 font-mono">accuracy</span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full bg-[#08080C] h-1.5 rounded-full overflow-hidden p-0.5 border border-[#222230]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-300 transition-all duration-700"
                style={{ width: '99.8%' }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-gray-500">
              <span>0 Failures</span>
              <span className="text-purple-300 font-bold">Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE AGENT STATUS ROSTER */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-black text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Bot size={14} className="text-[#D4AF37]" /> Active Agent Fleet Status ({agents.length} Nodes)
          </h3>
          <span className="text-[9px] font-mono text-gray-500">
            Real-time Workload
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {agents.map(ag => (
            <div
              key={ag.id}
              className="bg-[#11111C] border border-[#222234] hover:border-[#D4AF37]/40 p-2.5 rounded-xl space-y-2 transition-all group"
            >
              {/* Agent Title & Avatar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm p-1 bg-[#181826] rounded-lg border border-[#28283C]">
                    {ag.avatar}
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-white group-hover:text-[#D4AF37] transition-colors leading-none">
                      {ag.name}
                    </h4>
                    <span className="text-[9px] text-gray-400 leading-tight block mt-0.5 truncate max-w-[120px]">
                      {ag.role}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded border ${
                    ag.status === 'ACTIVE'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-800/50 animate-pulse'
                      : ag.status === 'GUARDING'
                      ? 'bg-purple-950/80 text-purple-300 border-purple-800/50'
                      : ag.status === 'SYNCED'
                      ? 'bg-sky-950/80 text-sky-300 border-sky-800/50'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50'
                  }`}
                >
                  {ag.status}
                </span>
              </div>

              {/* Workload Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-gray-400">Load</span>
                  <span className="text-white font-bold">{ag.workloadPercent}%</span>
                </div>
                <div className="w-full bg-[#08080E] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ag.color === 'amber'
                        ? 'bg-[#D4AF37]'
                        : ag.color === 'purple'
                        ? 'bg-purple-400'
                        : ag.color === 'emerald'
                        ? 'bg-emerald-400'
                        : ag.color === 'sky'
                        ? 'bg-sky-400'
                        : 'bg-pink-400'
                    }`}
                    style={{ width: `${ag.workloadPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Metric Tag */}
              <div className="bg-[#09090F] px-2 py-0.5 rounded border border-[#1A1A28] flex justify-between items-center text-[9px] font-mono">
                <span className="text-gray-400">{ag.metricLabel}:</span>
                <strong className="text-amber-300">{ag.metricValue}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. PIPELINE EFFICIENCY SUMMARY STRIP */}
      <div className="bg-[#0A0A10] border border-[#1E1E2C] rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-gray-300">
          <CheckCircle2 size={13} className="text-emerald-400" />
          <span>Pipeline: <strong className="text-emerald-400">7-Stage AST Smelter Active</strong></span>
        </div>

        <div className="flex items-center gap-3 text-gray-400 text-[10px]">
          <span>Density: <strong className="text-amber-300">4.6x Factor</strong></span>
          <span>•</span>
          <span>Leases: <strong className="text-sky-300">{activeLeasesCount} Active</strong></span>
          <span>•</span>
          <span>Sandboxes: <strong className="text-purple-300">{activeWorktreesCount} VFS</strong></span>
          <span>•</span>
          <span>CLIs: <strong className="text-white">{totalCLIsForged} Ready</strong></span>
        </div>
      </div>
    </div>
  );
}
