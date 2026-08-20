/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * APEX Omni-Nexus v0.1.0 — REFORGED ARCHITECTURAL STUDIO
 * Comprehensive interactive visualizer, failure-mode crucible, cost model calculator,
 * and implementation roadmap for the reforged APEX system.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  Boxes,
  Sliders,
  Network,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Play,
  RotateCcw,
  Clock,
  ArrowRight,
  TrendingUp,
  Cpu,
  FileCode2,
  Terminal,
  ShieldAlert,
  GitBranch,
  BookOpen,
  DollarSign,
  ChevronRight,
  ChevronDown,
  Info,
  Flame,
  CheckSquare
} from 'lucide-react';
import {
  APEX_8_PRINCIPLES,
  APEX_7_COMPONENTS,
  APEX_ROADMAP,
  APEX_COST_TIERS,
  APEX_ADRS,
  APEX_COMPETITOR_MATRIX,
  APEX_DOWNLOADABLE_ARTIFACTS,
  ApexComponentSpec,
  FailureMode,
  ApexPrinciple
} from '../data/apexReforgedSpec';

interface ApexReforgedArchitectureStudioProps {
  onNotify?: (msg: string, type?: 'success' | 'warning') => void;
  onBackToIDE?: () => void;
}

type ApexTab = 
  | 'ARCHITECTURE_DAG' 
  | 'COMPONENTS_FAILURE_MODES' 
  | '8_PRINCIPLES' 
  | '36_WEEK_ROADMAP' 
  | 'COST_COMPETITOR_MATRIX' 
  | 'ADRS_ARTIFACTS';

export function ApexReforgedArchitectureStudio({
  onNotify,
  onBackToIDE
}: ApexReforgedArchitectureStudioProps) {
  const [activeTab, setActiveTab] = useState<ApexTab>('ARCHITECTURE_DAG');
  const [selectedComponentId, setSelectedComponentId] = useState<string>('ouroboros');
  const [selectedPrincipleId, setSelectedPrincipleId] = useState<string>('p1');
  const [selectedRoadmapPhase, setSelectedRoadmapPhase] = useState<number>(0);
  const [copiedArtifact, setCopiedArtifact] = useState<string | null>(null);
  
  // Interactive Cost Calculator state
  const [customAgentCount, setCustomAgentCount] = useState<number>(12);
  const [isTokenCompressionActive, setIsTokenCompressionActive] = useState<boolean>(true);
  const [workHoursPerDay, setWorkHoursPerDay] = useState<number>(8);

  // Failure Mode Simulation state
  const [simulatedFailure, setSimulatedFailure] = useState<{
    component: string;
    mode: FailureMode;
    status: 'TRIGGERED' | 'DETECTED' | 'MITIGATED';
    elapsedMs: number;
  } | null>(null);

  // Selected Component Spec
  const currentComponent = useMemo(() => {
    return APEX_7_COMPONENTS.find(c => c.id === selectedComponentId) || APEX_7_COMPONENTS[0];
  }, [selectedComponentId]);

  // Selected Principle
  const currentPrinciple = useMemo(() => {
    return APEX_8_PRINCIPLES.find(p => p.id === selectedPrincipleId) || APEX_8_PRINCIPLES[0];
  }, [selectedPrincipleId]);

  // Calculated Dynamic Cost
  const calculatedCost = useMemo(() => {
    const baseCostPerAgentHour = 0.85;
    const compressionFactor = isTokenCompressionActive ? 0.35 : 1.0; // 65% token savings
    const monthlyHours = customAgentCount * workHoursPerDay * 22;
    const estimatedTokensK = monthlyHours * 150 * compressionFactor;
    const totalDollars = Math.round(monthlyHours * baseCostPerAgentHour * compressionFactor + (customAgentCount * 18));
    const baselineDevinCost = customAgentCount * 500;
    const baselineCopilotCost = customAgentCount * 39;
    const savingsVsDevin = Math.max(0, baselineDevinCost - totalDollars);

    return {
      totalDollars,
      baselineDevinCost,
      baselineCopilotCost,
      savingsVsDevin,
      savingsPercent: Math.round(((baselineDevinCost - totalDollars) / baselineDevinCost) * 100),
      estimatedTokensM: (estimatedTokensK / 1000).toFixed(1)
    };
  }, [customAgentCount, isTokenCompressionActive, workHoursPerDay]);

  // Handle Download of Artifacts
  const handleDownloadArtifact = (artifact: typeof APEX_DOWNLOADABLE_ARTIFACTS[0]) => {
    try {
      const data = artifact.contentGenerator();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = artifact.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onNotify?.(`Downloaded artifact: ${artifact.filename}`, 'success');
    } catch (e: any) {
      onNotify?.(`Failed to export artifact: ${e.message}`, 'warning');
    }
  };

  const handleCopyArtifact = (artifact: typeof APEX_DOWNLOADABLE_ARTIFACTS[0]) => {
    try {
      const data = artifact.contentGenerator();
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedArtifact(artifact.filename);
      setTimeout(() => setCopiedArtifact(null), 2500);
      onNotify?.(`Copied ${artifact.filename} JSON to clipboard!`, 'success');
    } catch (e: any) {
      onNotify?.('Clipboard copy failed.', 'warning');
    }
  };

  // Trigger Failure Mode Simulation
  const handleSimulateFailure = (comp: ApexComponentSpec, mode: FailureMode) => {
    setSimulatedFailure({
      component: comp.name,
      mode,
      status: 'TRIGGERED',
      elapsedMs: 0
    });

    setTimeout(() => {
      setSimulatedFailure(prev => prev ? { ...prev, status: 'DETECTED', elapsedMs: 42 } : null);
    }, 400);

    setTimeout(() => {
      setSimulatedFailure(prev => prev ? { ...prev, status: 'MITIGATED', elapsedMs: 118 } : null);
      onNotify?.(`⚡ Auto-Crucible Remediated [${mode.name}] in 118ms!`, 'success');
    }, 1100);
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Banner & Architectural Overview */}
      <div className="p-4 bg-gradient-to-r from-[#0C101A] via-[#101726] to-[#0A0D18] border-2 border-[#D4AF37]/50 rounded-2xl shadow-[0_0_35px_rgba(212,175,55,0.15)] relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/60 text-[#D4AF37]">
                <Layers size={18} />
              </span>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                APEX OMNI-NEXUS v0.1.0 <span className="text-[#D4AF37]">— REFORGED</span>
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 font-mono font-black animate-pulse">
                ENGINEERING SPECIFICATION READY
              </span>
            </div>
            <p className="text-xs text-gray-300 max-w-3xl leading-relaxed">
              Synthesized from reverse-engineering of <strong className="text-white">8 competitor systems</strong> and <strong className="text-white">7 verified OSS components</strong>. 
              Eliminated mythology and fictional versions; engineered into a unified 36-week, 5-layer buildable system specification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onBackToIDE && (
              <button
                onClick={onBackToIDE}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#141420] border border-[#2A2A40] text-gray-300 hover:text-white hover:border-gray-400 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Terminal size={14} className="text-[#00F0FF]" />
                <span>Return to Live IDE</span>
              </button>
            )}

            <button
              onClick={() => handleDownloadArtifact(APEX_DOWNLOADABLE_ARTIFACTS[0])}
              className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.25)]"
            >
              <Download size={14} />
              <span>Export Spec (JSON)</span>
            </button>
          </div>
        </div>

        {/* Quick Architectural Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#20283E] mt-3 text-xs">
          <div className="p-2 bg-[#080B12] rounded-lg border border-[#182032] flex items-center gap-2">
            <Clock size={14} className="text-[#00F0FF] shrink-0" />
            <div>
              <div className="text-[10px] text-gray-400 font-bold uppercase">Timeline</div>
              <div className="text-xs font-black text-white">36 Weeks (9 Months)</div>
            </div>
          </div>

          <div className="p-2 bg-[#080B12] rounded-lg border border-[#182032] flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#10B981] shrink-0" />
            <div>
              <div className="text-[10px] text-gray-400 font-bold uppercase">Core Principles</div>
              <div className="text-xs font-black text-white">8 Non-Negotiables</div>
            </div>
          </div>

          <div className="p-2 bg-[#080B12] rounded-lg border border-[#182032] flex items-center gap-2">
            <Cpu size={14} className="text-[#A855F7] shrink-0" />
            <div>
              <div className="text-[10px] text-gray-400 font-bold uppercase">Components</div>
              <div className="text-xs font-black text-white">7 Fully Specified (5 Layers)</div>
            </div>
          </div>

          <div className="p-2 bg-[#080B12] rounded-lg border border-[#182032] flex items-center gap-2">
            <AlertTriangle size={14} className="text-[#F59E0B] shrink-0" />
            <div>
              <div className="text-[10px] text-gray-400 font-bold uppercase">Failure Modes</div>
              <div className="text-xs font-black text-white">21 Documented & Mitigated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0A0C14] border border-[#1E2436] rounded-xl">
        {[
          { id: 'ARCHITECTURE_DAG', label: '5-Layer Visual DAG', icon: Layers },
          { id: 'COMPONENTS_FAILURE_MODES', label: '7 Components & 21 Failures', icon: Cpu },
          { id: '8_PRINCIPLES', label: '8 Core Principles (P1-P8)', icon: ShieldCheck },
          { id: '36_WEEK_ROADMAP', label: '36-Week Roadmap', icon: Clock },
          { id: 'COST_COMPETITOR_MATRIX', label: 'Cost Model & Benchmarks', icon: DollarSign },
          { id: 'ADRS_ARTIFACTS', label: 'ADRs & JSON Artifacts', icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ApexTab)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-black font-black shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                  : 'bg-[#101320] text-gray-300 hover:text-white hover:bg-[#181D30] border border-[#1D2235]'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab View Area */}
      <AnimatePresence mode="wait">
        {/* TAB 1: 5-LAYER VISUAL ARCHITECTURE DAG */}
        {activeTab === 'ARCHITECTURE_DAG' && (
          <motion.div
            key="dag"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Visual Stack Diagram */}
            <div className="p-4 bg-[#090C14] border border-[#1A2234] rounded-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Layers size={16} className="text-[#D4AF37]" />
                    APEX 5-LAYER HIERARCHICAL TOPOLOGY (L1 - L5)
                  </h3>
                  <p className="text-xs text-gray-400">
                    Click any layer or component node to inspect contracts, integration boundaries, and failure mitigations.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-[#0C1612] px-3 py-1 rounded-lg border border-emerald-500/40">
                  <Activity size={13} className="animate-pulse" />
                  <span>DATA FLOW: CONTINUOUS ASYNC PIPELINE</span>
                </div>
              </div>

              {/* Interactive Layer Cards Stack */}
              <div className="space-y-3">
                {/* L5: SUPERVISION */}
                <div 
                  onClick={() => setSelectedComponentId('jat')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedComponentId === 'jat'
                      ? 'bg-[#181220] border-[#A855F7] shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                      : 'bg-[#0F111E] border-[#2A203E] hover:border-[#A855F7]/60'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black px-2 py-0.5 rounded bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40 font-mono">
                        L5: SUPERVISION
                      </span>
                      <strong className="text-white text-sm">JAT (Just-in-Time Human Glass Pane)</strong>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">6 Live Views • 7 Control Actions • Instant Kill Switches</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">
                    Multi-pane real-time glass observability: Task DAG, Streaming Terminal, AST Diff Previews, Hardware Thermal Matrix, Memory Ledger, and Budget Gauges.
                  </p>
                </div>

                {/* Vertical Data Connector */}
                <div className="flex justify-center -my-1.5">
                  <div className="w-0.5 h-4 bg-gradient-to-b from-[#A855F7] to-[#00F0FF] animate-pulse" />
                </div>

                {/* L1: ORCHESTRATION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div 
                    onClick={() => setSelectedComponentId('ouroboros')}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedComponentId === 'ouroboros'
                        ? 'bg-[#0A1820] border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                        : 'bg-[#0D1520] border-[#1C2C40] hover:border-[#00F0FF]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 font-mono">
                        L1: ORCHESTRATION
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">Convergence ≥ 0.95</span>
                    </div>
                    <strong className="text-white text-sm block mt-1">Ouroboros Specification Engine</strong>
                    <p className="text-xs text-gray-300 mt-0.5">
                      Socratic requirement extraction computing Shannon entropy & ambiguity vector until mathematical convergence before dispatch.
                    </p>
                  </div>

                  <div 
                    onClick={() => setSelectedComponentId('swarm-iosm')}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedComponentId === 'swarm-iosm'
                        ? 'bg-[#0A1820] border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                        : 'bg-[#0D1520] border-[#1C2C40] hover:border-[#00F0FF]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 font-mono">
                        L1: ORCHESTRATION
                      </span>
                      <span className="text-[10px] text-amber-300 font-mono font-bold">4 Quality Gates ≥ 0.80</span>
                    </div>
                    <strong className="text-white text-sm block mt-1">Swarm-IOSM (Continuous Scheduler)</strong>
                    <p className="text-xs text-gray-300 mt-0.5">
                      Lock-free continuous dispatch with hierarchical AST file dials; eliminates wave barriers and executes 4 pre-merge gates.
                    </p>
                  </div>
                </div>

                {/* Vertical Data Connector */}
                <div className="flex justify-center -my-1.5">
                  <div className="w-0.5 h-4 bg-gradient-to-b from-[#00F0FF] to-[#D4AF37] animate-pulse" />
                </div>

                {/* L2: CONTEXT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div 
                    onClick={() => setSelectedComponentId('codegraph')}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedComponentId === 'codegraph'
                        ? 'bg-[#18160C] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                        : 'bg-[#14120A] border-[#2E2816] hover:border-[#D4AF37]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-mono">
                        L2: CONTEXT
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">SQLite WAL2 • Tree-Sitter</span>
                    </div>
                    <strong className="text-white text-sm block mt-1">CodeGraph (AST Knowledge Graph)</strong>
                    <p className="text-xs text-gray-300 mt-0.5">
                      Persistent AST graph with SQLite FTS5, PageRank centrality, and vector search that survives container restarts.
                    </p>
                  </div>

                  <div 
                    onClick={() => setSelectedComponentId('omniroute')}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedComponentId === 'omniroute'
                        ? 'bg-[#18160C] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                        : 'bg-[#14120A] border-[#2E2816] hover:border-[#D4AF37]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-mono">
                        L2: CONTEXT
                      </span>
                      <span className="text-[10px] text-[#00F0FF] font-mono font-bold">15-95% Compression</span>
                    </div>
                    <strong className="text-white text-sm block mt-1">OmniRoute (12-Engine Compression)</strong>
                    <p className="text-xs text-gray-300 mt-0.5">
                      Two-stage token pruning pipeline paired with dynamic routing and sub-second failover across 340+ AI model endpoints.
                    </p>
                  </div>
                </div>

                {/* Vertical Data Connector */}
                <div className="flex justify-center -my-1.5">
                  <div className="w-0.5 h-4 bg-gradient-to-b from-[#D4AF37] to-[#10B981] animate-pulse" />
                </div>

                {/* L3: EXECUTION */}
                <div 
                  onClick={() => setSelectedComponentId('exedev')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedComponentId === 'exedev'
                      ? 'bg-[#0D1812] border-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                      : 'bg-[#0A130E] border-[#1C3224] hover:border-[#10B981]/60'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 font-mono">
                        L3: EXECUTION
                      </span>
                      <strong className="text-white text-sm">Exe.dev (Tiered Sandboxes & Secret Proxy)</strong>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="bg-emerald-950 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/30">Tier 1: Safe Process</span>
                      <span className="bg-cyan-950 px-2 py-0.5 rounded text-cyan-300 border border-cyan-500/30">Tier 2: Container</span>
                      <span className="bg-purple-950 px-2 py-0.5 rounded text-purple-300 border border-purple-500/30">Tier 3: MicroVM</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">
                    Risk-matched execution isolation with zero-ambient secret proxies. Prevents escape attempts while lowering compute costs 10x vs full VMs.
                  </p>
                </div>

                {/* Vertical Data Connector */}
                <div className="flex justify-center -my-1.5">
                  <div className="w-0.5 h-4 bg-gradient-to-b from-[#10B981] to-[#F59E0B] animate-pulse" />
                </div>

                {/* L4: EXPANSION */}
                <div 
                  onClick={() => setSelectedComponentId('code2mcp')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedComponentId === 'code2mcp'
                      ? 'bg-[#1A1408] border-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                      : 'bg-[#120E06] border-[#2E2412] hover:border-[#F59E0B]/60'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 font-mono">
                        L4: EXPANSION
                      </span>
                      <strong className="text-white text-sm">Code2MCP (Autonomous Capability Expansion)</strong>
                    </div>
                    <span className="text-[11px] text-amber-300 font-mono">7-Agent Pipeline: GitHub ➔ MCP Server</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">
                    Autonomous tool creation: downloads target repositories, extracts public APIs, writes MCP server code, runs fuzzing tests, and registers tools dynamically.
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Component Quick Inspector */}
            <div className="p-4 bg-[#0B0E18] border border-[#1E2840] rounded-2xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1E2840]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-1 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-mono">
                    {currentComponent.layerName}
                  </span>
                  <h4 className="text-sm font-black text-white">{currentComponent.name}</h4>
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  {currentComponent.failureModes.length} Failure Modes Documented
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                {/* Inputs & Outputs (5 Cols) */}
                <div className="lg:col-span-5 space-y-2">
                  <div className="p-3 bg-[#080A12] rounded-xl border border-[#1A2234] space-y-1.5">
                    <span className="font-bold text-[#00F0FF] uppercase tracking-wider text-[10px]">Inputs:</span>
                    <ul className="list-disc list-inside text-gray-300 space-y-0.5">
                      {currentComponent.inputs.map((inp, idx) => (
                        <li key={idx}>{inp}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-[#080A12] rounded-xl border border-[#1A2234] space-y-1.5">
                    <span className="font-bold text-[#10B981] uppercase tracking-wider text-[10px]">Outputs:</span>
                    <ul className="list-disc list-inside text-gray-300 space-y-0.5">
                      {currentComponent.outputs.map((out, idx) => (
                        <li key={idx}>{out}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-[#080A12] rounded-xl border border-[#1A2234] space-y-1">
                    <span className="font-bold text-[#D4AF37] uppercase tracking-wider text-[10px]">Competitor Advantage:</span>
                    <p className="text-gray-300">{currentComponent.competitorAdvantage}</p>
                  </div>
                </div>

                {/* Process Phases & Code Sample (7 Cols) */}
                <div className="lg:col-span-7 space-y-2">
                  <div className="p-3 bg-[#080A12] rounded-xl border border-[#1A2234] space-y-1.5">
                    <span className="font-bold text-white uppercase tracking-wider text-[10px]">Process Phases:</span>
                    <div className="space-y-1">
                      {currentComponent.processPhases.map((phase, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-1.5 bg-[#101422] rounded text-gray-300">
                          <span className="w-4 h-4 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-[9px] font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span>{phase}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-[#05060A] rounded-xl border border-[#1A2234] font-mono text-[11px] overflow-x-auto text-cyan-300">
                    <pre>{currentComponent.codeSample}</pre>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: 7 COMPONENTS & 21 FAILURE MODES CRUCIBLE */}
        {activeTab === 'COMPONENTS_FAILURE_MODES' && (
          <motion.div
            key="failures"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Component Selector Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {APEX_7_COMPONENTS.map((comp) => {
                const isSelected = selectedComponentId === comp.id;
                return (
                  <button
                    key={comp.id}
                    onClick={() => setSelectedComponentId(comp.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#182238] to-[#0E1524] border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                        : 'bg-[#0B0E18] border-[#1C263C] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="text-[9px] font-mono font-bold text-[#D4AF37]">{comp.layer}</div>
                    <div className="text-xs font-black text-white truncate">{comp.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-gray-400">3 Failure Modes</div>
                  </button>
                );
              })}
            </div>

            {/* Active Component Deep Dive */}
            <div className="p-4 bg-[#0B0E18] border-2 border-[#1E2A44] rounded-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 font-mono">
                      {currentComponent.layerName}
                    </span>
                    <h3 className="text-base font-black text-white">{currentComponent.name}</h3>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">{currentComponent.role}</p>
                </div>

                <div className="text-xs font-mono text-emerald-400 bg-[#0C1612] px-3 py-1.5 rounded-xl border border-emerald-500/40">
                  KEY INNOVATION: {currentComponent.keyInnovation}
                </div>
              </div>

              {/* 3 Documented Failure Modes Matrix for this component */}
              <div className="space-y-3 pt-2 border-t border-[#1C2840]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle size={15} /> Documented Failure Modes & Automated Mitigations (3 of 21)
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">Interactive Auto-Crucible Test Harness</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {currentComponent.failureModes.map((fm) => (
                    <div
                      key={fm.id}
                      className="p-3.5 bg-[#080A12] border border-[#202A40] rounded-xl space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <strong className="text-white font-bold">{fm.name}</strong>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                            Latency {fm.detectionLatency}
                          </span>
                        </div>

                        <div className="text-[11px] space-y-1 text-gray-300">
                          <div>
                            <span className="text-red-400 font-bold">Trigger:</span> {fm.trigger}
                          </div>
                          <div>
                            <span className="text-amber-400 font-bold">Impact:</span> {fm.impact}
                          </div>
                          <div className="p-2 bg-[#0E1424] rounded-lg border border-[#1C263C] text-emerald-300">
                            <span className="font-bold text-white">Mitigation:</span> {fm.mitigation}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSimulateFailure(currentComponent, fm)}
                        className="w-full py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-950/60 border border-rose-500/60 text-rose-300 hover:bg-rose-900/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                      >
                        <Play size={11} />
                        <span>Simulate Failure Trigger</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Simulation Visualizer Drawer */}
              <AnimatePresence>
                {simulatedFailure && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-[#140A10] border-2 border-rose-500 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-rose-400 flex items-center gap-2">
                        <Flame size={16} className="animate-bounce" />
                        FAILURE SIMULATION: {simulatedFailure.mode.name} ({simulatedFailure.component})
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-white border border-gray-700">
                        STATUS: {simulatedFailure.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                      <div className={`p-2 rounded-lg border ${
                        simulatedFailure.status === 'TRIGGERED' ? 'bg-rose-950 border-rose-500 text-white font-bold' : 'bg-black/40 text-gray-400 border-gray-800'
                      }`}>
                        1. Trigger Emitted (0ms)
                      </div>
                      <div className={`p-2 rounded-lg border ${
                        simulatedFailure.status === 'DETECTED' ? 'bg-amber-950 border-amber-500 text-white font-bold' : 'bg-black/40 text-gray-400 border-gray-800'
                      }`}>
                        2. Invariant Detected ({simulatedFailure.mode.detectionLatency})
                      </div>
                      <div className={`p-2 rounded-lg border ${
                        simulatedFailure.status === 'MITIGATED' ? 'bg-emerald-950 border-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-black/40 text-gray-400 border-gray-800'
                      }`}>
                        3. Auto-Remediated (118ms)
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* TAB 3: 8 NON-NEGOTIABLE PRINCIPLES */}
        {activeTab === '8_PRINCIPLES' && (
          <motion.div
            key="principles"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {APEX_8_PRINCIPLES.map((principle) => {
                const isSelected = selectedPrincipleId === principle.id;
                return (
                  <div
                    key={principle.id}
                    onClick={() => setSelectedPrincipleId(principle.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#182030] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                        : 'bg-[#0B0E18] border-[#1C263C] hover:border-gray-500'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black px-2.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-mono">
                          {principle.code}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">VERIFIED</span>
                      </div>

                      <h4 className="text-sm font-black text-white">{principle.name}</h4>
                      <p className="text-xs text-gray-300 leading-relaxed">{principle.description}</p>
                    </div>

                    <div className="pt-3 border-t border-[#1C263C] mt-3 space-y-1.5 text-[11px]">
                      <div>
                        <span className="text-red-400 font-bold">Competitor Gap:</span>{' '}
                        <span className="text-gray-300">{principle.competitorGap}</span>
                      </div>
                      <div className="p-1.5 bg-[#080A12] rounded text-emerald-300 font-mono text-[10px]">
                        ★ {principle.impactMetric}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 4: 36-WEEK IMPLEMENTATION ROADMAP */}
        {activeTab === '36_WEEK_ROADMAP' && (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Phase Selector Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {APEX_ROADMAP.map((phase, idx) => {
                const isSelected = selectedRoadmapPhase === idx;
                return (
                  <button
                    key={phase.phase}
                    onClick={() => setSelectedRoadmapPhase(idx)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#18243C] to-[#0F1828] border-[#00F0FF] shadow-[0_0_25px_rgba(0,240,255,0.25)]'
                        : 'bg-[#0A0D18] border-[#1C263C] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-black text-[#D4AF37]">{phase.phase}</span>
                      <span className="px-2 py-0.5 rounded bg-black/50 text-cyan-300 border border-cyan-500/30">
                        {phase.duration}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-white mt-1">{phase.name}</h4>
                    <p className="text-xs text-gray-300 mt-1 line-clamp-2">{phase.deliverable}</p>
                  </button>
                );
              })}
            </div>

            {/* Active Phase Deep Dive */}
            {(() => {
              const phase = APEX_ROADMAP[selectedRoadmapPhase];
              return (
                <div className="p-4 bg-[#0B0E18] border-2 border-[#1E2A44] rounded-2xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1C263C]">
                    <div>
                      <span className="text-xs font-mono font-bold text-[#D4AF37]">{phase.phase} — {phase.duration}</span>
                      <h3 className="text-base font-black text-white">{phase.name}</h3>
                      <p className="text-xs text-gray-300 mt-0.5">{phase.deliverable}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {phase.components.map((comp, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-2 py-1 rounded-lg bg-[#141A2E] text-cyan-300 border border-[#223050]">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Breakdown Grid */}
                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Calendar size={14} className="text-[#00F0FF]" /> Weekly Engineering Execution Plan
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {phase.weeklyBreakdown.map((wb, idx) => (
                        <div key={idx} className="p-3 bg-[#080A12] border border-[#1C263C] rounded-xl space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-[#D4AF37] font-mono">{wb.weekRange}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                              MILESTONE
                            </span>
                          </div>
                          <div className="text-white font-bold">{wb.focus}</div>
                          <div className="text-gray-400 text-[11px] font-mono">🎯 {wb.milestone}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Success Criteria */}
                  <div className="p-3.5 bg-[#080C14] border border-emerald-500/30 rounded-xl space-y-1.5 text-xs">
                    <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <CheckCircle2 size={12} /> Phase Exit Success Criteria (Mandatory Gate):
                    </span>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {phase.successCriteria.map((sc, idx) => (
                        <li key={idx} className="leading-relaxed">{sc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* TAB 5: COST MODEL & COMPETITOR MATRIX */}
        {activeTab === 'COST_COMPETITOR_MATRIX' && (
          <motion.div
            key="cost"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Dynamic Cost Calculator */}
            <div className="p-4 bg-gradient-to-r from-[#0C121E] via-[#0E1624] to-[#0A0E18] border-2 border-[#D4AF37]/50 rounded-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <DollarSign size={16} className="text-[#D4AF37]" /> DYNAMIC MULTI-TIER COST CALCULATOR
                  </h3>
                  <p className="text-xs text-gray-400">
                    Adjust agent fleet concurrency and token compression settings to project monthly operational cost.
                  </p>
                </div>
                <div className="text-xs font-mono text-[#D4AF37] font-black">
                  HARD BUDGET CAPS ACTIVE
                </div>
              </div>

              {/* Slider Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-[#080B12] border border-[#1A2234] rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300 font-bold">Active Parallel Agents:</span>
                    <span className="text-[#00F0FF] font-black font-mono">{customAgentCount} Agents</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={customAgentCount}
                    onChange={(e) => setCustomAgentCount(parseInt(e.target.value))}
                    className="w-full accent-[#00F0FF] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>1 (Single)</span>
                    <span>20 (Mid)</span>
                    <span>100 (Enterprise)</span>
                  </div>
                </div>

                <div className="p-3 bg-[#080B12] border border-[#1A2234] rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300 font-bold">Work Hours / Day:</span>
                    <span className="text-[#D4AF37] font-black font-mono">{workHoursPerDay} hrs</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={24}
                    value={workHoursPerDay}
                    onChange={(e) => setWorkHoursPerDay(parseInt(e.target.value))}
                    className="w-full accent-[#D4AF37] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>2 hrs</span>
                    <span>8 hrs (Shift)</span>
                    <span>24 hrs (24/7)</span>
                  </div>
                </div>

                <div className="p-3 bg-[#080B12] border border-[#1A2234] rounded-xl flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-bold">OmniRoute 12-Engine Token Pruning:</span>
                    <button
                      onClick={() => setIsTokenCompressionActive(!isTokenCompressionActive)}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer ${
                        isTokenCompressionActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {isTokenCompressionActive ? 'ON (65% Pruning)' : 'OFF (Raw Tokens)'}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Two-stage AST pruning prunes AST redundancies and comments before LLM dispatch.
                  </p>
                </div>
              </div>

              {/* Calculated Results Projection Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-[#080D18] rounded-xl border border-[#00F0FF]/40">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">APEX Monthly Cost</div>
                  <div className="text-lg font-black text-[#00F0FF] font-mono">${calculatedCost.totalDollars} / mo</div>
                  <div className="text-[10px] text-emerald-400 font-mono font-bold">~{calculatedCost.estimatedTokensM}M Tokens/mo</div>
                </div>

                <div className="p-3 bg-[#080D18] rounded-xl border border-red-500/30">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Devin Equivalent</div>
                  <div className="text-lg font-black text-red-400 font-mono">${calculatedCost.baselineDevinCost} / mo</div>
                  <div className="text-[10px] text-red-500/80 font-mono">Full VMs ($500/seat)</div>
                </div>

                <div className="p-3 bg-[#080D18] rounded-xl border border-emerald-500/40">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Net Savings vs Devin</div>
                  <div className="text-lg font-black text-emerald-400 font-mono">${calculatedCost.savingsVsDevin} / mo</div>
                  <div className="text-[10px] text-emerald-300 font-mono font-bold">{calculatedCost.savingsPercent}% Cost Reduction</div>
                </div>

                <div className="p-3 bg-[#080D18] rounded-xl border border-[#D4AF37]/40">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Copilot Benchmark</div>
                  <div className="text-lg font-black text-[#D4AF37] font-mono">${calculatedCost.baselineCopilotCost} / mo</div>
                  <div className="text-[10px] text-gray-400 font-mono">No auto-orchestration</div>
                </div>
              </div>
            </div>

            {/* Competitor Reverse-Engineering Comparison Table */}
            <div className="p-4 bg-[#0A0D18] border border-[#1C263C] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-white flex items-center gap-2">
                  <TrendingUp size={15} className="text-[#00F0FF]" /> COMPETITOR REVERSE-ENGINEERING MATRIX
                </span>
                <span className="text-[10px] text-gray-400 font-mono">8 Systems Analyzed</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#20283E] text-gray-400 font-mono text-[10px]">
                      <th className="py-2 px-2">SYSTEM</th>
                      <th className="py-2 px-1 text-center">SPEC CONV.</th>
                      <th className="py-2 px-1 text-center">4 GATES</th>
                      <th className="py-2 px-1 text-center">COMPRESSION</th>
                      <th className="py-2 px-1 text-center">CONT. DISPATCH</th>
                      <th className="py-2 px-1 text-center">TIERED ISOLATION</th>
                      <th className="py-2 px-1 text-center">PERSISTENT DB</th>
                      <th className="py-2 px-1 text-center">AUTO-MCP</th>
                      <th className="py-2 px-2">NOTES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161C2C]">
                    {APEX_COMPETITOR_MATRIX.map((c, idx) => (
                      <tr key={idx} className={c.competitor.includes('APEX') ? 'bg-[#0E182A]/80 font-bold text-white' : 'text-gray-300'}>
                        <td className="py-2.5 px-2 font-bold">{c.competitor}</td>
                        <td className="py-2.5 px-1 text-center">{c.specConvergence ? '✅' : '❌'}</td>
                        <td className="py-2.5 px-1 text-center">{c.qualityGates ? '✅' : '❌'}</td>
                        <td className="py-2.5 px-1 text-center">{c.tokenCompression ? '✅' : '❌'}</td>
                        <td className="py-2.5 px-1 text-center">{c.continuousDispatch ? '✅' : '❌'}</td>
                        <td className="py-2.5 px-1 text-center">{c.tieredIsolation ? '✅' : '❌'}</td>
                        <td className="py-2.5 px-1 text-center">{c.persistentMemory ? '✅' : '❌'}</td>
                        <td className="py-2.5 px-1 text-center">{c.autoExpansion ? '✅' : '❌'}</td>
                        <td className="py-2.5 px-2 text-[11px] text-gray-400">{c.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 6: ADRS & DOWNLOADABLE ARTIFACTS */}
        {activeTab === 'ADRS_ARTIFACTS' && (
          <motion.div
            key="adrs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Downloadable Artifacts Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {APEX_DOWNLOADABLE_ARTIFACTS.map((art) => {
                const isCopied = copiedArtifact === art.filename;
                return (
                  <div
                    key={art.filename}
                    className="p-4 bg-[#0B0E18] border border-[#1E2840] rounded-2xl space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[#D4AF37] font-bold text-[11px] truncate">{art.filename}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{art.size}</span>
                      </div>
                      <h4 className="text-sm font-black text-white">{art.title}</h4>
                      <p className="text-xs text-gray-300 leading-relaxed">{art.description}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#182032]">
                      <button
                        onClick={() => handleDownloadArtifact(art)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download size={13} />
                        <span>Download JSON</span>
                      </button>

                      <button
                        onClick={() => handleCopyArtifact(art)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#141A2E] border border-[#243050] text-gray-300 hover:text-white hover:border-gray-400 transition-all flex items-center gap-1 cursor-pointer"
                        title="Copy raw JSON to clipboard"
                      >
                        {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Architecture Decision Records (ADRs) */}
            <div className="p-4 bg-[#0A0D18] border border-[#1C263C] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-white flex items-center gap-2">
                  <BookOpen size={15} className="text-[#D4AF37]" /> ARCHITECTURE DECISION RECORDS (ADR-001 TO ADR-006)
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">ALL 6 ACCEPTED</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {APEX_ADRS.map((adr) => (
                  <div key={adr.id} className="p-3 bg-[#080A12] border border-[#1C263C] rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#D4AF37]">{adr.code}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        {adr.status}
                      </span>
                    </div>
                    <div className="font-bold text-white">{adr.title}</div>
                    <div className="text-gray-300 text-[11px]"><strong className="text-[#00F0FF]">Decision:</strong> {adr.decision}</div>
                    <div className="text-gray-400 text-[10px] pt-1 border-t border-[#161C2C]">
                      <strong className="text-amber-400">Trade-off:</strong> {adr.tradeOff}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Calendar(props: any) {
  return <Clock {...props} />;
}
