import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  Terminal,
  Lock,
  Layers,
  CheckCircle2,
  Play,
  Flame,
  Rocket,
  Hammer,
  Swords,
  ChevronRight,
  RefreshCw,
  Trophy,
  Check,
  FileCode,
  Shield,
  Sliders,
  Zap,
  Target,
  FileText,
  AlertCircle
} from 'lucide-react';
import { ForgedAgenticCLI } from '../types';

export interface PlayerProfile {
  level: number;
  xp: number;
  xpToNext: number;
  rankTitle: string;
  forgeStreak: number;
  tokensForged: number;
  manaEnergy: number; // 0-100%
  completedQuests: string[];
}

interface PrimaryControlCardProps {
  onNotify: (message: string, type: 'success' | 'warning') => void;
  toolName: string;
  setToolName: (name: string) => void;
  category: 'DATABASE' | 'PAYMENT' | 'AUDIO_DSP' | 'DEV_TOOL' | 'STORAGE' | 'CUSTOM';
  setCategory: (cat: 'DATABASE' | 'PAYMENT' | 'AUDIO_DSP' | 'DEV_TOOL' | 'STORAGE' | 'CUSTOM') => void;
  codebaseInput: string;
  setCodebaseInput: (input: string) => void;
  forging: boolean;
  currentStepIndex: number;
  handleStartForge: () => void;
  applyTemplate: (template: any) => void;
  templates: any[];
  selectedCLI: ForgedAgenticCLI | null;
  selectedSubcommand: string;
  setSelectedSubcommand: (sub: string) => void;
  customArgsInput: string;
  setCustomArgsInput: (args: string) => void;
  handleExecuteSubcommand: () => void;
  executingSub: boolean;
  player: PlayerProfile;
  quests: any[];
  playSfx: (type: 'FORGE' | 'LEVEL_UP' | 'EXECUTE' | 'CLICK') => void;
  onIntentCompiled?: () => void;
}

export const CONSTITUTIONS = [
  {
    id: 'const_engineering_v1',
    name: 'const_engineering_v1',
    label: 'Standard Engineering V1 (512MB, Zero Egress)',
    description: 'Enforces read-only root mount, zero network egress, deterministic worktrees, and 512MB RAM limits.',
    nonNegotiables: ['Zero Ambient Leak', 'Deterministic Ephemeral Worktree', 'Read-Only Root', '512MB RAM Max'],
    allowlist: ['git', 'pnpm', 'node', 'test-runner', 'wasmtime-cli'],
    riskProfile: 'Balanced Production'
  },
  {
    id: 'const_commerce_v1',
    name: 'const_commerce_v1',
    label: 'Commerce & Financial Compliance (PCI DSS, Dual-Custody)',
    description: 'Requires multi-signature approval gates, strict ledger auditing, and zero external socket allocation.',
    nonNegotiables: ['Immutable Hydra Ledger Anchor', 'Dual-Custody Gate', 'Zero Raw Card Persistence', 'Air-gapped VFS'],
    allowlist: ['git', 'pnpm', 'node', 'stripe-cli', 'hydra-anchor'],
    riskProfile: 'Strict Financial'
  },
  {
    id: 'const_research_v1',
    name: 'const_research_v1',
    label: 'Cognitive Research & Lattice Sandbox (24D Leech, High Memory)',
    description: 'Enables high-dimensional vector quantization, 2GB memory ceiling, and accelerated mathematical kernels.',
    nonNegotiables: ['Deterministic Leech Lattice Projections', 'Isolated Wasmtime Vector Pool', 'Audit Receipt On Exit'],
    allowlist: ['git', 'pnpm', 'node', 'wasmtime-cli', 'z3-solver', 'vector-bench'],
    riskProfile: 'Experimental Research'
  }
];

export const INTENT_PRESETS = [
  {
    title: 'Tenant-Scoped Receipt Filter',
    intent: 'Implement tenant-scoped receipt filtering and pagination with strict cross-tenant isolation in Hydra Ledger.',
    constitution: 'const_engineering_v1',
    classification: 'internal',
    risk: 'medium',
    agent: 'Sir-Ant & Sir-Forge',
    icon: '🧾'
  },
  {
    title: '24D Leech Lattice Kernel',
    intent: 'Synthesize high-speed 24-dimensional Leech Lattice vector indexing kernel on ARM64 Wasmtime runtime.',
    constitution: 'const_research_v1',
    classification: 'restricted',
    risk: 'high',
    agent: 'Sir-Forge & Boris',
    icon: '⚡'
  },
  {
    title: 'Zero-Trust Sentinel Lease Enforcer',
    intent: 'Deploy epoch-bound capability lease validator with bwrap container path escape prevention.',
    constitution: 'const_engineering_v1',
    classification: 'confidential',
    risk: 'critical',
    agent: 'Gideon & Sentinel',
    icon: '🛡️'
  }
];

export const PrimaryControlCard: React.FC<PrimaryControlCardProps> = ({
  onNotify,
  toolName,
  setToolName,
  category,
  setCategory,
  codebaseInput,
  setCodebaseInput,
  forging,
  currentStepIndex,
  handleStartForge,
  applyTemplate,
  templates,
  selectedCLI,
  selectedSubcommand,
  setSelectedSubcommand,
  customArgsInput,
  setCustomArgsInput,
  handleExecuteSubcommand,
  executingSub,
  player,
  quests,
  playSfx,
  onIntentCompiled
}) => {
  // Intent & Constitution Form State
  const [taskIntent, setTaskIntent] = useState(
    'Tenant-scoped receipt filtering and pagination with strict cross-tenant isolation in Hydra Ledger.'
  );
  const [selectedConstId, setSelectedConstId] = useState('const_engineering_v1');
  const [classification, setClassification] = useState<'internal' | 'confidential' | 'restricted' | 'public'>('internal');
  const [riskTier, setRiskTier] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [targetAgent, setTargetAgent] = useState('Sir-Ant (Refactoring)');
  const [compilingIntent, setCompilingIntent] = useState(false);
  const [controlTab, setControlTab] = useState<'INTENT_SPEC' | 'CLI_SMELTER' | 'BLUEPRINTS' | 'ACTIONS'>('INTENT_SPEC');

  const activeConstitution = CONSTITUTIONS.find(c => c.id === selectedConstId) || CONSTITUTIONS[0];

  const handleCompileTaskIntent = async () => {
    if (!taskIntent.trim()) return;
    try {
      setCompilingIntent(true);
      playSfx('FORGE');
      const res = await fetch('/api/blueprints/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: 'tenant_omega_01',
          workspace_id: 'engineering',
          intent: taskIntent,
          constitution_ref: selectedConstId,
          data_classification: classification
        })
      });

      if (res.ok) {
        onNotify(`Compiled task intent into Blueprint State Machine under ${activeConstitution.name}!`, 'success');
        if (onIntentCompiled) {
          onIntentCompiled();
        }
      }
    } catch (err) {
      console.error('Error compiling intent:', err);
      onNotify('Failed to compile blueprint intent', 'warning');
    } finally {
      setCompilingIntent(false);
    }
  };

  const handleApplyPreset = (preset: typeof INTENT_PRESETS[0]) => {
    playSfx('CLICK');
    setTaskIntent(preset.intent);
    setSelectedConstId(preset.constitution);
    setClassification(preset.classification as any);
    setRiskTier(preset.risk as any);
    setTargetAgent(preset.agent);
    onNotify(`Loaded intent template: ${preset.title}`, 'success');
  };

  return (
    <div className="bg-[#101018] border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl p-4 sm:p-5 shadow-2xl transition-all space-y-4">
      
      {/* CARD HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#202030]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-amber-400 shadow-inner">
            <Sliders size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                Primary Control Authority
              </h3>
              <span className="text-[9px] bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black font-mono px-2 py-0.5 rounded shadow-sm">
                ACTIVE CONTROLS
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Task Intent Ingestion, Constitution Boundary Enforcement, AST Forge, and Action Triggers.
            </p>
          </div>
        </div>

        {/* Primary Control Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#161622] p-1 rounded-xl border border-[#252538] text-[11px] font-bold">
          <button
            onClick={() => { playSfx('CLICK'); setControlTab('INTENT_SPEC'); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              controlTab === 'INTENT_SPEC'
                ? 'bg-amber-400 text-black font-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles size={13} />
            <span>Intent & Constitution</span>
          </button>

          <button
            onClick={() => { playSfx('CLICK'); setControlTab('CLI_SMELTER'); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              controlTab === 'CLI_SMELTER'
                ? 'bg-amber-400 text-black font-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Hammer size={13} />
            <span>CLI Smelter</span>
          </button>

          <button
            onClick={() => { playSfx('CLICK'); setControlTab('BLUEPRINTS'); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              controlTab === 'BLUEPRINTS'
                ? 'bg-amber-400 text-black font-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flame size={13} />
            <span>1-Click Blueprints</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: INTENT INGESTION & CONSTITUTION BOUNDARY SELECTION
          ========================================================================= */}
      {controlTab === 'INTENT_SPEC' && (
        <div className="space-y-4">
          
          {/* Section 1: Intent Presets Quick-Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1 text-gray-300">
                <Target size={13} className="text-amber-400" /> Fast Intent Presets
              </span>
              <span className="text-[10px] font-mono text-gray-500">1-Click Spec Loading</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {INTENT_PRESETS.map(preset => (
                <div
                  key={preset.title}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2.5 rounded-xl bg-[#141420] border border-[#262638] hover:border-amber-400/80 cursor-pointer transition-all hover:scale-[1.01] space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{preset.icon}</span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${
                      preset.risk === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      preset.risk === 'high' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-sky-950 text-sky-300 border border-sky-800'
                    }`}>
                      {preset.risk}
                    </span>
                  </div>
                  <h5 className="text-[11px] font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                    {preset.title}
                  </h5>
                  <p className="text-[9px] text-gray-400 line-clamp-1 font-mono">{preset.agent}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Raw Task Intent Form */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-200 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText size={13} className="text-amber-400" /> Raw Agent Task Intent (Natural Language)
              </span>
              <span className="text-[10px] text-amber-400/80 font-mono">SPEC INPUT</span>
            </label>
            <textarea
              rows={3}
              value={taskIntent}
              onChange={(e) => setTaskIntent(e.target.value)}
              placeholder="Describe the functional goals, acceptance criteria, or architectural refactor for the agentic swarm..."
              className="w-full bg-[#141422] border border-[#2A2A3E] focus:border-amber-400 rounded-xl p-3 text-xs text-white placeholder-gray-500 font-mono leading-relaxed outline-none focus:ring-1 focus:ring-amber-400/40"
            />
          </div>

          {/* Section 3: Constitution Selection & Invariant Boundary Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Target Constitution Dropdown */}
            <div className="md:col-span-6 space-y-1">
              <label className="text-[11px] font-black text-gray-300 uppercase tracking-wider block">
                Target Constitution Selection
              </label>
              <select
                value={selectedConstId}
                onChange={(e) => { playSfx('CLICK'); setSelectedConstId(e.target.value); }}
                className="w-full bg-[#151524] border border-[#2D2D42] text-xs font-mono text-amber-200 p-2.5 rounded-xl focus:border-amber-400 outline-none"
              >
                {CONSTITUTIONS.map(c => (
                  <option key={c.id} value={c.id}>
                    📜 {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Data Classification */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-[11px] font-black text-gray-300 uppercase tracking-wider block">
                Classification
              </label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value as any)}
                className="w-full bg-[#151524] border border-[#2D2D42] text-xs font-mono text-gray-200 p-2.5 rounded-xl focus:border-amber-400 outline-none"
              >
                <option value="internal">🔒 Internal</option>
                <option value="confidential">🛡️ Confidential</option>
                <option value="restricted">⛔ Restricted</option>
                <option value="public">🌐 Public</option>
              </select>
            </div>

            {/* Risk Tier */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-[11px] font-black text-gray-300 uppercase tracking-wider block">
                Risk Tier
              </label>
              <select
                value={riskTier}
                onChange={(e) => setRiskTier(e.target.value as any)}
                className="w-full bg-[#151524] border border-[#2D2D42] text-xs font-mono text-gray-200 p-2.5 rounded-xl focus:border-amber-400 outline-none"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="critical">🔴 Critical</option>
              </select>
            </div>
          </div>

          {/* Section 4: Live Constitution Non-Negotiables & Rules Panel */}
          <div className="bg-[#0C0C14] border border-[#222234] rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-[#1C1C2C] pb-1.5">
              <span className="font-bold text-amber-300 flex items-center gap-1.5 font-mono text-[11px]">
                <ShieldCheck size={14} className="text-emerald-400" />
                Active Constitution Rules: {activeConstitution.name}
              </span>
              <span className="text-[10px] text-sky-400 font-mono">
                Profile: {activeConstitution.riskProfile}
              </span>
            </div>

            <p className="text-[11px] text-gray-300">
              {activeConstitution.description}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeConstitution.nonNegotiables.map((rule, idx) => (
                <span
                  key={idx}
                  className="text-[9px] font-mono font-bold bg-amber-950/60 text-amber-300 px-2 py-0.5 rounded border border-amber-800/40 flex items-center gap-1"
                >
                  <Check size={10} className="text-emerald-400" /> {rule}
                </span>
              ))}
              {activeConstitution.allowlist.map((tool, idx) => (
                <span
                  key={idx}
                  className="text-[9px] font-mono bg-[#161626] text-sky-300 px-1.5 py-0.5 rounded border border-sky-800/30"
                >
                  ${tool}
                </span>
              ))}
            </div>
          </div>

          {/* Section 5: Intent Action Button */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] font-mono text-gray-400">
              Target Executor: <strong className="text-white">{targetAgent}</strong>
            </div>

            <button
              onClick={handleCompileTaskIntent}
              disabled={compilingIntent || !taskIntent.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] disabled:opacity-40 uppercase tracking-wider"
            >
              {compilingIntent ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>{compilingIntent ? 'Compiling Spec...' : 'Compile & Dispatch to State Machine (+200 XP)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CUSTOM CLI SMELTER (AST 7-Stage Pipeline)
          ========================================================================= */}
      {controlTab === 'CLI_SMELTER' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-black text-gray-300 uppercase tracking-wider block mb-1">
                1. Tool / Binary Name
              </label>
              <input
                type="text"
                value={toolName}
                onChange={e => setToolName(e.target.value)}
                placeholder="e.g., distrokid-sync or suno-stem-cli"
                className="w-full bg-[#181824] border border-[#2D2D40] text-xs sm:text-sm text-white p-2.5 rounded-xl focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-gray-300 uppercase tracking-wider block mb-1">
                2. Category Specialization
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-[#181824] border border-[#2D2D40] text-xs sm:text-sm text-white p-2.5 rounded-xl focus:border-[#D4AF37] focus:outline-none font-medium"
              >
                <option value="DEV_TOOL">🛠️ DEV_TOOL (AST / Bundler)</option>
                <option value="AUDIO_DSP">🎵 AUDIO_DSP (Suno / Stems)</option>
                <option value="PAYMENT">💳 PAYMENT (Stripe / Ledger)</option>
                <option value="DATABASE">⚡ DATABASE (OLAP / Vectors)</option>
                <option value="STORAGE">📦 STORAGE (Parquet / VFS)</option>
                <option value="CUSTOM">🔮 CUSTOM MAGIC</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-black text-gray-300 uppercase tracking-wider block mb-1">
                3. Target Scope
              </label>
              <input
                type="text"
                value={codebaseInput}
                onChange={e => setCodebaseInput(e.target.value)}
                placeholder="e.g., In-memory cache with get/set"
                className="w-full bg-[#181824] border border-[#2D2D40] text-xs sm:text-sm text-white p-2.5 rounded-xl focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {/* FORGING PROGRESS ANIMATION */}
          {forging && (
            <div className="bg-[#0A0A10] border-2 border-amber-400/80 rounded-xl p-3.5 space-y-2.5 animate-pulse">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-2">
                  <RefreshCw size={13} className="animate-spin text-[#D4AF37]" /> Smelting & Binding Agentic CLI...
                </span>
                <span className="font-mono text-[#D4AF37] font-black">Stage {currentStepIndex} of 7</span>
              </div>
              <div className="w-full bg-[#151520] h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                  style={{ width: `${(currentStepIndex / 7) * 100}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-[9px] font-mono pt-0.5">
                {['1. API Map', '2. Subcommands', '3. JSON-RPC', '4. AST Binary', '5. TEST.md', '6. HARNESS.md', '7. SKILL.md'].map((label, idx) => (
                  <div
                    key={idx}
                    className={`p-1 text-center rounded border ${
                      idx < currentStepIndex
                        ? 'bg-emerald-950 border-emerald-700 text-emerald-300 font-bold'
                        : idx === currentStepIndex
                        ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold animate-bounce'
                        : 'bg-[#12121C] border-[#222230] text-gray-500'
                    }`}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTION BUTTON */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleStartForge}
              disabled={forging || !toolName.trim()}
              className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-[#D4AF37] via-amber-300 to-[#D4AF37] hover:from-amber-400 hover:to-yellow-200 disabled:opacity-40 text-black font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-[#D4AF37]/30 transition-all uppercase tracking-wider active:scale-95"
            >
              {forging ? <RefreshCw size={15} className="animate-spin" /> : <Rocket size={15} />}
              <span>{forging ? 'Smelting Binary...' : 'Execute 7-Stage Agentic Forge (+500 XP)'}</span>
            </button>
          </div>

          {/* Subcommand Runner & Action Trigger */}
          {selectedCLI && (
            <div className="bg-[#0C0C14] border border-[#252538] rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#202030] pb-2">
                <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Swords size={14} className="text-amber-400" /> Selected CLI: <span className="text-emerald-400 font-mono">{selectedCLI.binaryName}</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono">v{selectedCLI.version}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                  Select Subcommand
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCLI.subcommands.map(sub => (
                    <button
                      key={sub.name}
                      onClick={() => { playSfx('CLICK'); setSelectedSubcommand(sub.name); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        selectedSubcommand === sub.name
                          ? 'bg-amber-400 text-black shadow font-black scale-105'
                          : 'bg-[#181824] border border-[#28283C] text-gray-300 hover:text-white'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                  JSON Arguments Input
                </label>
                <textarea
                  rows={2}
                  value={customArgsInput}
                  onChange={e => setCustomArgsInput(e.target.value)}
                  className="w-full bg-[#141420] border border-[#252538] text-xs font-mono text-amber-200 p-2 rounded-xl focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <button
                onClick={handleExecuteSubcommand}
                disabled={executingSub}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-300 hover:from-amber-400 hover:to-yellow-200 text-black font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition-all uppercase tracking-wider"
              >
                {executingSub ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                <span>{executingSub ? 'Executing JSON-RPC...' : `⚡ Run ${selectedCLI.binaryName} ${selectedSubcommand} (+80 XP)`}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: 1-CLICK INSTANT BLUEPRINTS
          ========================================================================= */}
      {controlTab === 'BLUEPRINTS' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {templates.map(t => (
              <div
                key={t.id}
                onClick={() => applyTemplate(t)}
                className="bg-gradient-to-b from-[#161622] to-[#0E0E16] border border-[#2A2A3E] hover:border-[#D4AF37] p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{t.icon}</span>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    t.difficulty === 'EASY' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50' :
                    t.difficulty === 'MEDIUM' ? 'bg-sky-950 text-sky-300 border border-sky-800/50' :
                    t.difficulty === 'HARD' ? 'bg-amber-950 text-amber-300 border border-amber-800/50' :
                    'bg-purple-950 text-purple-300 border border-purple-800/50'
                  }`}>
                    {t.difficulty}
                  </span>
                </div>

                <h5 className="text-xs font-black text-white group-hover:text-[#D4AF37] transition-colors leading-snug">
                  {t.name}
                </h5>
                <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                  {t.lore}
                </p>

                <div className="flex items-center justify-between text-[9px] font-mono text-gray-400 pt-1.5 border-t border-[#1F1F2E]">
                  <span className="text-[#D4AF37] font-bold">+{t.xpReward} XP</span>
                  <span className="text-gray-300 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
                    Equip <ChevronRight size={11} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DAILY QUEST MINI-FOOTER */}
      <div className="pt-3 border-t border-[#1E1E2E] flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-[#D4AF37]" />
          <span className="font-bold text-white text-[11px]">Daily Quests</span>
          <span className="text-[10px] text-gray-500 font-mono">
            ({player.completedQuests.length}/{quests.length} Completed)
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono">
          <span className="text-amber-400 font-bold">Rank: {player.rankTitle}</span>
        </div>
      </div>

    </div>
  );
};
