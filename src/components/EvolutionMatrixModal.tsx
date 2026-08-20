import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Flame, 
  Sparkles, 
  Layers, 
  Radio, 
  ArrowRight,
  RefreshCw,
  Terminal,
  Lock,
  Boxes
} from 'lucide-react';

interface EvolutionMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (msg: string, type?: 'success' | 'warning') => void;
  onEvolutionComplete?: (newTier: string) => void;
  currentTier?: string;
}

interface EvolutionStage {
  id: number;
  title: string;
  codename: string;
  description: string;
  knight: string;
  status: 'PENDING' | 'SYNTHESIZING' | 'LOCKED_VERIFIED' | 'FAILED';
  telemetry: string;
}

const INITIAL_STAGES: EvolutionStage[] = [
  {
    id: 1,
    title: 'GRILL 7-GATE ENTROPY CALIBRATION',
    codename: 'STAGE_GRILL_Z3',
    description: 'Running formal SMT theorem prover to clamp state drift and enforce zero invariant regression.',
    knight: 'MERLIN_Ω',
    status: 'PENDING',
    telemetry: '0 / 7 Invariant Gates Verified'
  },
  {
    id: 2,
    title: '7-KNIGHT PERSONA LATTICE BINDING',
    codename: 'STAGE_PERSONA_FFI',
    description: 'Hot-swapping Wasmtime MsgPack micro-frontend modules for Scribe, Scout, Warden, Herald, Architect, Animator & Boris.',
    knight: 'LANCELOT',
    status: 'PENDING',
    telemetry: '7 Wasm Agents Awaiting FFI Link'
  },
  {
    id: 3,
    title: 'WASMTIME WAL2 AOT MICROVM ACCELERATION',
    codename: 'STAGE_MICROVM_AOT',
    description: 'Compiling memory-safe Dioxus/Rust kernels into native ARM64 wasm32 execution ring.',
    knight: 'GALAHAD',
    status: 'PENDING',
    telemetry: 'JIT Latency: 14.2ms -> 1.8ms Target'
  },
  {
    id: 4,
    title: 'TOPOLOGICAL STATE GRAPH SYNCHRONIZATION',
    codename: 'STAGE_TOPOLOGICAL_MESH',
    description: 'Constructing directional acyclic flow graph with automated bottleneck telemetry and self-healing backpressure.',
    knight: 'SIR_ARCHITECT',
    status: 'PENDING',
    telemetry: 'Mesh Nodes: 12 Active Vertices'
  },
  {
    id: 5,
    title: 'GIDEON LEVEL-5 ADVERSARIAL HARNESS SEAL',
    codename: 'STAGE_GIDEON_SEAL',
    description: 'Fuzzing with 5 failure archetypes (Race, Memory, Network, Schema, Drift) under continuous audit.',
    knight: 'SIR_WARDEN',
    status: 'PENDING',
    telemetry: 'Zero Failure Invariants Tolerated'
  }
];

export function EvolutionMatrixModal({
  isOpen,
  onClose,
  onNotify,
  onEvolutionComplete,
  currentTier = 'V1000_EXCALIBUR_ASCENDED'
}: EvolutionMatrixModalProps) {
  const [stages, setStages] = useState<EvolutionStage[]>(INITIAL_STAGES);
  const [isEvolving, setIsEvolving] = useState(false);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(-1);
  const [evolutionLog, setEvolutionLog] = useState<string[]>([
    '[CHASSIS_READY]: Ready to execute //evolve upgrade sequence.',
    `[CURRENT_TIER]: ${currentTier}`
  ]);
  const [evolutionDone, setEvolutionDone] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      if (!isEvolving && !evolutionDone) {
        setStages(INITIAL_STAGES);
        setActiveStageIdx(-1);
      }
    }
  }, [isOpen, isEvolving, evolutionDone]);

  const handleStartEvolution = async () => {
    if (isEvolving) return;
    setIsEvolving(true);
    setEvolutionDone(false);
    setEvolutionLog(prev => [...prev, '[INITIATE]: //evolve sequence triggered by Operator Vizion...']);

    for (let i = 0; i < stages.length; i++) {
      setActiveStageIdx(i);
      
      // Update stage to SYNTHESIZING
      setStages(prev => prev.map((st, idx) => idx === i ? { ...st, status: 'SYNTHESIZING' } : st));
      setEvolutionLog(prev => [
        ...prev,
        `[STAGE_${i + 1}_START]: ${stages[i].codename} initiated by Knight ${stages[i].knight}...`
      ]);

      await new Promise(r => setTimeout(r, 700));

      // Update stage to LOCKED_VERIFIED
      setStages(prev => prev.map((st, idx) => idx === i ? { 
        ...st, 
        status: 'LOCKED_VERIFIED',
        telemetry: i === 0 ? '7/7 Gates Passed (0.4ms)' :
                   i === 1 ? '7 Personas Linked via MsgPack' :
                   i === 2 ? 'ARM64 MicroVM JIT Latency 1.8ms' :
                   i === 3 ? 'Topological Mesh Real-time Synchronized' :
                   'Gideon Level-5 Seal Locked & Invariant Validated'
      } : st));

      setEvolutionLog(prev => [
        ...prev,
        `[STAGE_${i + 1}_PASS]: ${stages[i].title} verified with 100% formal safety!`
      ]);
    }

    setIsEvolving(false);
    setEvolutionDone(true);
    const newTier = 'V2000_SINGULARITY_SOVEREIGN';
    setEvolutionLog(prev => [
      ...prev,
      `[ASCENSION_COMPLETE]: Digital Forge upgraded to ${newTier}!`,
      '[SOVEREIGNTY]: 60fps UI locked, Sub-ms Agent RPC live, Gideon Invariant Seal ACTIVE.'
    ]);
    onEvolutionComplete?.(newTier);
    onNotify?.('//evolve Complete! Digital Forge Ascended to Tier V2000 Singularity!', 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl bg-[#090912] border-2 border-[#00F0FF]/60 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-[#0E0E1C] border-b border-[#202038] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#00F0FF]/20 to-[#D4AF37]/20 border border-[#00F0FF]/40 text-[#00F0FF]">
              <Zap size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>OMNI-EVOLUTION MATRIX</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                  //EVOLVE PROTOCOL
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Ascend Digital Forge architecture from V1000 to V2000 Singularity
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scroll">
          {/* Status Matrix Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#0C1222] to-[#161226] border border-[#00F0FF]/30 flex flex-wrap justify-between items-center gap-4">
            <div>
              <div className="text-[10px] text-[#00F0FF] uppercase tracking-widest font-black">
                LATTICE CHASSIS STATUS
              </div>
              <div className="text-lg font-black text-white flex items-center gap-2 mt-0.5">
                <span>{evolutionDone ? 'V2000_SINGULARITY_SOVEREIGN' : currentTier}</span>
                {evolutionDone && (
                  <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40">
                    ASCENDED
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={isEvolving || evolutionDone}
                onClick={handleStartEvolution}
                className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                  evolutionDone
                    ? 'bg-emerald-900/50 border border-emerald-500 text-emerald-300 cursor-default'
                    : isEvolving
                    ? 'bg-cyan-950 border border-[#00F0FF] text-[#00F0FF] animate-pulse cursor-wait'
                    : 'bg-gradient-to-r from-[#00F0FF] to-[#D4AF37] text-black hover:opacity-90 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                }`}
              >
                {isEvolving ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>ASCENDING LATTICE...</span>
                  </>
                ) : evolutionDone ? (
                  <>
                    <CheckCircle2 size={14} />
                    <span>ASCENSION VERIFIED</span>
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    <span>EXECUTE //EVOLVE</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 5 Pipeline Stages */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Layers size={13} className="text-[#D4AF37]" />
              <span>5-Stage Sovereign Ascension Pipeline</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {stages.map((st, idx) => (
                <div
                  key={st.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    st.status === 'LOCKED_VERIFIED'
                      ? 'bg-[#0E1A1A] border-emerald-500/50 text-white'
                      : st.status === 'SYNTHESIZING'
                      ? 'bg-[#0F1E28] border-[#00F0FF] text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-[#0E0E18] border-[#222238] text-gray-400'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                        st.status === 'LOCKED_VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
                          : st.status === 'SYNTHESIZING'
                          ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF] animate-pulse'
                          : 'bg-[#181828] text-gray-500 border border-gray-700'
                      }`}>
                        {st.id}
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-2">
                          <span className="text-white">{st.title}</span>
                          <span className="text-[10px] text-gray-500 font-mono">[{st.codename}]</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">{st.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#181828] border border-[#303048] text-amber-300">
                        {st.knight}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        st.status === 'LOCKED_VERIFIED'
                          ? 'text-emerald-400 bg-emerald-950/60'
                          : st.status === 'SYNTHESIZING'
                          ? 'text-[#00F0FF] bg-[#00F0FF]/15 animate-pulse'
                          : 'text-gray-500 bg-gray-900'
                      }`}>
                        {st.telemetry}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Terminal Log */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Terminal size={13} className="text-[#00F0FF]" />
              <span>Ascension Crucible Telemetry Log</span>
            </div>
            <div className="p-3 bg-[#06060C] border border-[#1C1C2C] rounded-xl font-mono text-[11px] max-h-36 overflow-y-auto custom-scroll space-y-1">
              {evolutionLog.map((log, i) => (
                <div key={i} className="text-gray-300">
                  <span className="text-[#00F0FF] mr-1.5">&gt;</span>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0B0B14] border-t border-[#1C1C2A] flex justify-between items-center shrink-0">
          <div className="text-[10px] text-gray-500">
            Press <kbd className="px-1.5 py-0.5 rounded bg-[#181828] text-gray-300 border border-gray-700">ESC</kbd> or click Close to return
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#181826] hover:bg-[#252538] text-white text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
