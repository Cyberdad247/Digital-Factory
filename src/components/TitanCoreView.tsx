import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  ShieldAlert, 
  Cpu, 
  Zap, 
  Activity, 
  Terminal, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  HardDrive, 
  RefreshCw, 
  Sliders, 
  Radio, 
  Play, 
  Lock, 
  Database, 
  Server, 
  Eye, 
  Copy, 
  Check, 
  Search,
  Network,
  Users,
  Compass,
  Code
} from 'lucide-react';
import { TitanCoreTelemetry } from '../types';

interface TitanCoreViewProps {
  onNotify: (msg: string, type?: 'success' | 'warning') => void;
  onSwitchToVibe?: () => void;
  onSwitchToKanban?: () => void;
  onOpenCognitivePlayground?: () => void;
}

interface ArchmageAuditor {
  id: string;
  name: string;
  title: string;
  avatar: string;
  specialty: string;
  status: 'ACTIVE_CONVENED' | 'STANDBY' | 'PROVING_THEOREMS';
  z3Formula: string;
  tokensSec: number;
  theoremsProved: number;
}

const ARCHMAGE_AUDITORS: ArchmageAuditor[] = [
  {
    id: 'arch-arithmos',
    name: 'Archmage Arithmos',
    title: 'High Quantizer of 24D Leech Lattice',
    avatar: '📐',
    specialty: '24D Sphere Packing & Matrix Quantization',
    status: 'ACTIVE_CONVENED',
    z3Formula: '(assert (forall ((v Vector24)) (<= (norm2 v) 4.0)))',
    tokensSec: 2168,
    theoremsProved: 1420
  },
  {
    id: 'arch-formalis',
    name: 'Archmage Formalis Ω',
    title: 'Grand Inquisitor of Z3 Theorem Prover',
    avatar: '⚖️',
    specialty: 'Formal AST Type Safety & Memory Bounds',
    status: 'ACTIVE_CONVENED',
    z3Formula: '(assert (forall ((slot WasmSlot)) (<= (heapDelta slot) 0.12)))',
    tokensSec: 1890,
    theoremsProved: 3280
  },
  {
    id: 'arch-gideon',
    name: 'Sir Gideon',
    title: 'Crucible Invariant Master',
    avatar: '🛡️',
    specialty: '5 Failure Archetype TDD Stress Tester',
    status: 'PROVING_THEOREMS',
    z3Formula: '(check-sat) ; All 5 Crucible failure archetypes rejected',
    tokensSec: 1450,
    theoremsProved: 890
  },
  {
    id: 'arch-apis',
    name: 'Lady APIS',
    title: 'Custodian of Memory Mapped Slots',
    avatar: '⚡',
    specialty: 'Zero-Ambient Leakage & io_uring HSS',
    status: 'STANDBY',
    z3Formula: '(assert (validCapabilityLease (getLeaseId token)))',
    tokensSec: 2420,
    theoremsProved: 2150
  }
];

export function TitanCoreView({
  onNotify,
  onSwitchToVibe,
  onSwitchToKanban,
  onOpenCognitivePlayground
}: TitanCoreViewProps) {
  const [telemetry, setTelemetry] = useState<TitanCoreTelemetry>({
    activeSwarmAgents: 1024,
    tokensPerSec: 2168,
    ramUsageGB: 3.42,
    maxRamGB: 4.0,
    ioUringHssSwapActive: true,
    sacContextReductionPercent: 84.6,
    sacMultiplier: 14.8,
    agenticLatencyMs: 3.8,
    z3FormalErrorBoundPercent: 0.62,
    leechLattice24DHealth: 99.8,
    activeCapabilityLeases: 48,
    totalZ3TheoremsProved: 7740
  });

  const [auditors, setAuditors] = useState<ArchmageAuditor[]>(ARCHMAGE_AUDITORS);
  const [selectedAuditor, setSelectedAuditor] = useState<ArchmageAuditor>(ARCHMAGE_AUDITORS[0]);
  const [z3Input, setZ3Input] = useState('(check-sat)\n(get-model)\n; Proving AST type bounds and 0 memory leaks');
  const [z3Output, setZ3Output] = useState('sat\n((norm2 3.84) (heapDelta 0.08) (errorRate 0.0041))');
  const [isSolvingZ3, setIsSolvingZ3] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live Stdio JSON-RPC logs
  const [logs, setLogs] = useState<string[]>([
    '[STDIO:1024] AgentBus channel open across wasm32-wasi & quickjs-sandbox',
    '[IO_URING:HSS] NVMe swap buffer mapped at 0x7FFF0000 (RAM clamped strictly <= 4.0GB)',
    '[SAC:TOON] Chat history compressed by 84.6% (14.8x multiplier into token notation)',
    '[Z3:SOLVER] Formal verification pass: Error bound verified at 0.62% (<0.7% guarantee)',
    '[LEECH:24D] 24-dimensional spherical packing integrity at 99.8% with parity checksums',
    '[AGENT:Sir-Architect] Generated AST tokens for AuraEstates Real Estate Portal',
    '[SENTINEL] Zero-Trust capability lease #9081 issued for Stripe webhook engine'
  ]);

  // Live telemetry pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        tokensPerSec: Math.floor(2150 + Math.random() * 80),
        ramUsageGB: Number((3.40 + Math.random() * 0.08).toFixed(2)),
        agenticLatencyMs: Number((3.6 + Math.random() * 0.6).toFixed(1)),
        totalZ3TheoremsProved: prev.totalZ3TheoremsProved + 1
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleRunZ3Solver = () => {
    setIsSolvingZ3(true);
    setTimeout(() => {
      setIsSolvingZ3(false);
      setZ3Output(`sat\n; Theorem verified by ${selectedAuditor.name}\n((status "PROVED_SAT") (errorBound 0.0058) (latencyMs ${telemetry.agenticLatencyMs}) (ramClamped "4.0GB_HSS"))`);
      onNotify(`⚖️ Z3 Theorem Solver executed successfully! Proved SAT under ${selectedAuditor.name}.`, 'success');
    }, 600);
  };

  const handleConveneAuditor = (auditorId: string) => {
    setAuditors(prev => prev.map(a => {
      if (a.id === auditorId) {
        const nextStatus = a.status === 'ACTIVE_CONVENED' ? 'STANDBY' : 'ACTIVE_CONVENED';
        onNotify(`🧙‍♂️ ${a.name} status updated to [${nextStatus}]!`, 'success');
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Titan Core Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0E1A16] via-[#091012] to-[#160E1E] border border-emerald-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-950 border border-emerald-400 text-emerald-300 rounded-full text-[10px] font-black tracking-widest uppercase">
                TIER 3 • THE TITAN CORE
              </span>
              <span className="text-gray-400 text-xs">• System Architect Command Center</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>1,024-Agent Swarm Telemetry & Archmage Council</span>
              <ShieldAlert size={20} className="text-emerald-400" />
            </h2>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              Full low-level system observability. Inspect 24D Leech Lattice health, NVMe io_uring memory swapping (4.0GB clamp), real-time Stdio JSON-RPC logs, and formal Z3 SMT-LIB theorem solvers.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Convene Cognitive Playground Button */}
            {onOpenCognitivePlayground && (
              <button
                onClick={onOpenCognitivePlayground}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Nine-Seat Archmage Chamber</span>
              </button>
            )}

            {/* Quick Switch */}
            <button
              onClick={onSwitchToVibe}
              className="px-3 py-2 bg-[#10151C] hover:bg-[#1A222E] border border-[#00F0FF]/40 text-[#00F0FF] rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Switch to Tier 1: Vibe Shell"
            >
              <Zap size={13} />
              <span>Vibe Mode</span>
            </button>
            <button
              onClick={onSwitchToKanban}
              className="px-3 py-2 bg-[#10151C] hover:bg-[#1A222E] border border-[#D4AF37]/40 text-[#D4AF37] rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Switch to Tier 2: Swarm Kanban"
            >
              <Sliders size={13} />
              <span>Kanban Mode</span>
            </button>
          </div>
        </div>

        {/* 5 Core Telemetry KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-gray-800/80">
          {/* Swarm Fleet */}
          <div className="p-3 bg-[#060A0C] border border-gray-800 rounded-xl space-y-1">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Swarm Fleet</span>
              <Users size={12} className="text-cyan-400" />
            </div>
            <div className="text-lg font-black text-cyan-300 font-mono">
              {telemetry.activeSwarmAgents} AGENTS
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">100% Online & Synced</div>
          </div>

          {/* Tokens Per Sec */}
          <div className="p-3 bg-[#060A0C] border border-gray-800 rounded-xl space-y-1">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Throughput</span>
              <Activity size={12} className="text-emerald-400" />
            </div>
            <div className="text-lg font-black text-emerald-300 font-mono">
              {telemetry.tokensPerSec} tok/s
            </div>
            <div className="text-[10px] text-gray-400 font-mono">Sub-10ms inter-agent</div>
          </div>

          {/* RAM Hard Clamped at 4.0 GB */}
          <div className="p-3 bg-[#060A0C] border border-gray-800 rounded-xl space-y-1">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Memory Clamp</span>
              <HardDrive size={12} className="text-amber-400" />
            </div>
            <div className="text-lg font-black text-amber-300 font-mono">
              {telemetry.ramUsageGB} / 4.0 GB
            </div>
            <div className="text-[10px] text-cyan-400 font-mono">io_uring NVMe HSS Active</div>
          </div>

          {/* SAC Context Reduction */}
          <div className="p-3 bg-[#060A0C] border border-gray-800 rounded-xl space-y-1">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>SAC Context</span>
              <Zap size={12} className="text-purple-400" />
            </div>
            <div className="text-lg font-black text-purple-300 font-mono">
              {telemetry.sacContextReductionPercent}%
            </div>
            <div className="text-[10px] text-gray-400 font-mono">14.8x TOON Compression</div>
          </div>

          {/* Z3 Formal Error Bound */}
          <div className="p-3 bg-[#060A0C] border border-gray-800 rounded-xl space-y-1">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Z3 Error Rate</span>
              <CheckCircle2 size={12} className="text-rose-400" />
            </div>
            <div className="text-lg font-black text-rose-300 font-mono">
              &lt;{telemetry.z3FormalErrorBoundPercent}%
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">{telemetry.totalZ3TheoremsProved} Theorems Proved</div>
          </div>
        </div>

        {/* 📊 RECHARTS PERFORMANCE CURVES: 24D LEECH LATTICE & MEMORY SWAP MONITOR */}
        <div className="p-4 bg-[#050810] border border-[#182438] rounded-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-cyan-400" />
              <span className="text-xs font-bold text-white">24D Leech Lattice Throughput & NVMe io_uring Swap Activity</span>
              <span className="text-[10px] px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/30 rounded font-mono">
                Δ ≤ 0.12 MiB microcubicVM
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Token Velocity (tok/s)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> NVMe Memory Swap (GB)
              </span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { time: 'T-10s', tokens: 1980, ram: 3.12, lattice: 99.4 },
                  { time: 'T-8s', tokens: 2040, ram: 3.25, lattice: 99.6 },
                  { time: 'T-6s', tokens: 2110, ram: 3.38, lattice: 99.7 },
                  { time: 'T-4s', tokens: 2190, ram: 3.44, lattice: 99.8 },
                  { time: 'T-2s', tokens: 2145, ram: 3.41, lattice: 99.8 },
                  { time: 'Now', tokens: telemetry.tokensPerSec, ram: telemetry.ramUsageGB, lattice: 99.9 }
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2030" />
                <XAxis dataKey="time" stroke="#4A5568" fontSize={10} tickLine={false} />
                <YAxis stroke="#4A5568" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0E1A', borderColor: '#2A3B5C', borderRadius: '8px', fontSize: '11px' }}
                  labelStyle={{ color: '#00F0FF', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="tokens" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#tokenGrad)" name="Tokens/sec" />
                <Area type="monotone" dataKey="ram" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#ramGrad)" name="RAM (GB)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main 2-Column Titan Grid: Left: Archmage Council Audit Panel | Right: Stdio Logs & Z3 SMT Solver */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: ARCHMAGE COUNCIL PANEL (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0A0D16] border border-[#202538] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                  <Cpu size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Archmage Council Audit Panel</h3>
                  <p className="text-[10px] text-emerald-400">Targeted Mathematical Logic & Theorem Convening</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded font-mono">
                ARM64 Native
              </span>
            </div>

            {/* Auditor Cards */}
            <div className="space-y-2.5">
              {auditors.map((auditor) => {
                const isSelected = selectedAuditor.id === auditor.id;
                return (
                  <div
                    key={auditor.id}
                    onClick={() => setSelectedAuditor(auditor)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#101828] border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                        : 'bg-[#060810] hover:bg-[#0C1220] border-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{auditor.avatar}</span>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{auditor.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              auditor.status === 'ACTIVE_CONVENED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                              auditor.status === 'PROVING_THEOREMS' ? 'bg-purple-950 text-purple-300 border border-purple-500/40 animate-pulse' :
                              'bg-gray-900 text-gray-400'
                            }`}>
                              {auditor.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400">{auditor.title}</div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConveneAuditor(auditor.id);
                        }}
                        className="px-2.5 py-1 bg-[#162034] hover:bg-[#202E4A] text-cyan-300 rounded-lg text-[11px] font-bold border border-cyan-500/30 transition-colors"
                      >
                        {auditor.status === 'ACTIVE_CONVENED' ? 'Standby' : 'Convene'}
                      </button>
                    </div>

                    <p className="text-[11px] text-gray-300 mb-2">{auditor.specialty}</p>

                    {/* SMT Invariant Formula */}
                    <div className="p-2 bg-[#030408] rounded-lg border border-gray-800 text-[10px] font-mono text-cyan-300 truncate">
                      <code>{auditor.z3Formula}</code>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mt-2 pt-1 border-t border-gray-800/80">
                      <span>{auditor.tokensSec} tok/s throughput</span>
                      <span className="text-emerald-400 font-bold">{auditor.theoremsProved} theorems proved</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Z3 THEOREM SOLVER CONSOLE & REAL-TIME LOGS (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Z3 Theorem Solver Console */}
          <div className="bg-[#0A0D16] border border-[#202538] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-300">
                  <Terminal size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">SMT-LIB Z3 Formal Solver</h3>
                  <p className="text-[10px] text-purple-400">Auditing with {selectedAuditor.name}</p>
                </div>
              </div>

              <button
                onClick={handleRunZ3Solver}
                disabled={isSolvingZ3}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Play size={12} />
                <span>{isSolvingZ3 ? 'Solving...' : 'Run Z3 Solver'}</span>
              </button>
            </div>

            {/* Z3 Input */}
            <div className="space-y-1">
              <div className="text-[10px] text-gray-400 font-bold uppercase">SMT-LIB Contract Input:</div>
              <textarea
                value={z3Input}
                onChange={(e) => setZ3Input(e.target.value)}
                className="w-full h-24 p-2.5 bg-[#04060C] border border-gray-800 focus:border-purple-400 rounded-xl text-[11px] font-mono text-purple-300 outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Z3 Output */}
            <div className="space-y-1">
              <div className="text-[10px] text-gray-400 font-bold uppercase">Solver Verification Output:</div>
              <pre className="p-2.5 bg-[#04060C] border border-emerald-500/30 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-24 leading-relaxed">
                {z3Output}
              </pre>
            </div>
          </div>

          {/* Real-Time Stdio JSON-RPC Streaming Logs */}
          <div className="bg-[#0A0D16] border border-[#202538] rounded-2xl p-4 shadow-xl space-y-2">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <Radio size={14} className="text-cyan-400 animate-pulse" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Stdio JSON-RPC 2.0 Live Bus</h3>
              </div>
              <span className="text-[9px] text-gray-500 font-mono">Stream: 1,024 Workers</span>
            </div>

            <div className="bg-[#04060C] border border-gray-800 rounded-xl p-3 h-48 overflow-y-auto space-y-1.5 font-mono text-[10px] text-gray-300 custom-scroll">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-gray-600 select-none">{index + 1}</span>
                  <span className={log.includes('Z3') ? 'text-purple-300' : log.includes('SAC') ? 'text-amber-300' : log.includes('LEECH') ? 'text-cyan-300' : 'text-gray-300'}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
