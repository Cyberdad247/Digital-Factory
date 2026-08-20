import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Cpu, 
  Layers, 
  Lock, 
  Zap, 
  Activity, 
  CheckCircle2, 
  Radio, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  Boxes, 
  X, 
  Info,
  Server,
  FileCode,
  Sparkles
} from 'lucide-react';
import { MainView } from '../App';
import { getModeSystemInstruction, ModeSystemInstruction } from '../services/modeSystemInstructionEngine';

interface ModeResourceHUDProps {
  activeTab: MainView;
  onOpenSettings?: (tab?: string) => void;
}

export function ModeResourceHUD({ activeTab, onOpenSettings }: ModeResourceHUDProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const modeSpec = getModeSystemInstruction(activeTab);
  const { resourceConstraint } = modeSpec;

  return (
    <div className="w-full space-y-2 mb-3">
      {/* Primary Constrained Resource Banner */}
      <motion.div
        layout
        className="px-3.5 py-2.5 bg-[#0A0C14]/95 border-2 rounded-xl text-xs font-mono shadow-xl transition-all duration-300 relative overflow-hidden backdrop-blur-md"
        style={{ borderColor: `${modeSpec.color}45` }}
      >
        {/* Glowing Top Edge Line */}
        <div 
          className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
          style={{ 
            background: `linear-gradient(90deg, transparent, ${modeSpec.color}, transparent)` 
          }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Mode Title, Persona & System Instruction Contract */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: modeSpec.color }}
              />
              <span
                className="relative inline-flex rounded-full h-2.5 w-2.5"
                style={{ backgroundColor: modeSpec.color }}
              />
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-400 font-bold uppercase text-[10px]">
                ACTIVE SYSTEM INSTRUCTION:
              </span>
              <span 
                className="text-[10px] font-black px-2 py-0.5 rounded border flex items-center gap-1 shadow-sm"
                style={{ 
                  backgroundColor: `${modeSpec.color}15`, 
                  color: modeSpec.color, 
                  borderColor: `${modeSpec.color}60` 
                }}
              >
                <Lock size={10} />
                <span>[{modeSpec.instructionId}]</span>
              </span>

              <span className="text-gray-300 font-bold text-[11px] truncate hidden sm:inline">
                • {modeSpec.personaName}
              </span>
            </div>
          </div>

          {/* Right: Constrained Hardware Allocation Metrics */}
          <div className="flex flex-wrap items-center gap-2.5 text-[10px]">
            {/* Constrained RAM Allocation */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#121422] border border-[#23263C] rounded-lg">
              <Server size={11} style={{ color: modeSpec.color }} />
              <span className="text-gray-400">RAM:</span>
              <strong className="text-white font-mono">
                {resourceConstraint.allocatedRamGB}GB / {resourceConstraint.totalRamGB}GB
              </strong>
              <span 
                className="font-bold font-mono px-1 py-0.2 rounded text-[9px]"
                style={{ backgroundColor: `${modeSpec.color}20`, color: modeSpec.color }}
              >
                {resourceConstraint.ramPercentage}% Quota
              </span>
            </div>

            {/* Active CPU Cores Constraint */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#121422] border border-[#23263C] rounded-lg">
              <Cpu size={11} className="text-[#00F0FF]" />
              <span className="text-gray-400">CORES:</span>
              <strong className="text-white font-mono">
                {resourceConstraint.activeCores} / {resourceConstraint.totalCores} Active
              </strong>
            </div>

            {/* Deallocated / Quarantined Subsystems Counter */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300">
              <CheckCircle2 size={11} className="text-emerald-400" />
              <span className="hidden md:inline text-gray-300 font-sans">
                {resourceConstraint.deallocatedSubsystems.length} Subsystems
              </span>
              <span className="font-bold">Deallocated</span>
            </div>

            {/* Toggle Full Isolation Details */}
            <button
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="p-1 px-2 rounded-lg bg-[#181B2B] hover:bg-[#23273D] border border-[#2E3450] text-gray-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
              title="View Hardware Partitioning & Enforced System Instruction Rules"
            >
              <Info size={11} style={{ color: modeSpec.color }} />
              <span className="text-[9px] uppercase font-bold">
                {isDetailsOpen ? 'Hide Bounds' : 'Inspect Isolation'}
              </span>
              {isDetailsOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Expandable Hardware Isolation & System Instruction Contract Details */}
      <AnimatePresence>
        {isDetailsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-[#080910] border-2 border-[#1E2235] rounded-xl space-y-3.5 shadow-2xl text-xs font-mono">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2235] pb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="p-1.5 rounded-lg border flex items-center justify-center"
                    style={{ 
                      backgroundColor: `${modeSpec.color}15`, 
                      borderColor: `${modeSpec.color}50`,
                      color: modeSpec.color
                    }}
                  >
                    <Shield size={14} />
                  </div>
                  <div>
                    <h3 className="font-black text-white uppercase tracking-wider text-xs">
                      {modeSpec.title} • System Instruction & Resource Bounds
                    </h3>
                    <p className="text-[10px] text-gray-400 font-sans">
                      {modeSpec.roleDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 size={10} /> ZERO MONOLITHIC OVERALLOCATION
                  </span>
                  <button
                    onClick={() => setIsDetailsOpen(false)}
                    className="p-1 rounded-md bg-[#161826] text-gray-400 hover:text-white cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {/* Grid: Active Capabilities vs. Constrained Resource Allocation */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Enforced System Instruction Rules (6 Cols) */}
                <div className="md:col-span-6 p-3 bg-[#0D0F18] border border-[#1C2032] rounded-lg space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <Lock size={12} style={{ color: modeSpec.color }} /> Enforced System Instruction Rules:
                  </span>
                  <div className="space-y-1.5">
                    {modeSpec.enforcedRules.map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-gray-300 font-sans leading-relaxed">
                        <span className="text-[#00F0FF] font-mono mt-0.5">•</span>
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Constrained Hardware Allocation Partitioning (6 Cols) */}
                <div className="md:col-span-6 p-3 bg-[#0D0F18] border border-[#1C2032] rounded-lg space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <Sliders size={12} className="text-[#00F0FF]" /> Hardware Partitioning & IPC Isolation:
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 bg-[#121422] rounded border border-[#202438]">
                      <span className="text-gray-400 block text-[9px]">RAM Quota:</span>
                      <strong className="text-white font-mono">{resourceConstraint.allocatedRamGB} GB ({resourceConstraint.ramPercentage}%)</strong>
                    </div>
                    <div className="p-2 bg-[#121422] rounded border border-[#202438]">
                      <span className="text-gray-400 block text-[9px]">ARM64 Affinity:</span>
                      <strong className="text-emerald-400 font-mono">{resourceConstraint.coreAffinity}</strong>
                    </div>
                    <div className="p-2 bg-[#121422] rounded border border-[#202438]">
                      <span className="text-gray-400 block text-[9px]">WASM Page Quota:</span>
                      <strong className="text-[#00F0FF] font-mono">{resourceConstraint.wasmPageQuota.toLocaleString()} Pages</strong>
                    </div>
                    <div className="p-2 bg-[#121422] rounded border border-[#202438]">
                      <span className="text-gray-400 block text-[9px]">GPU Shader Tier:</span>
                      <strong className="text-amber-300 font-mono">{resourceConstraint.gpuShaderTier}</strong>
                    </div>
                  </div>

                  {/* Deallocated Subsystems Tag Cloud */}
                  <div className="pt-1.5 border-t border-[#1C2032]">
                    <span className="text-[9px] font-bold uppercase text-gray-400 block mb-1">
                      Deallocated Subsystems (Unloaded from Memory):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {resourceConstraint.deallocatedSubsystems.map((sub, idx) => (
                        <span 
                          key={idx} 
                          className="text-[9px] bg-[#161826] text-gray-400 border border-[#24283E] px-1.5 py-0.5 rounded font-mono"
                        >
                          ✕ {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
