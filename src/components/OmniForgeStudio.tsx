import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Hammer,
  Shield,
  FileCode,
  CheckCircle2,
  Terminal,
  Play,
  Layers,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Lock,
  Boxes,
  BookOpen,
  Send,
  AlertTriangle,
  FolderLock
} from 'lucide-react';
import { 
  ForgedAgenticCLI, 
  CLIForgeStep, 
  OmniForgeState, 
  CapabilityLease, 
  VFSWorktree 
} from '../types';

interface OmniForgeStudioProps {
  onNotify: (message: string, type: 'success' | 'warning') => void;
}

export function OmniForgeStudio({ onNotify }: OmniForgeStudioProps) {
  const [omniState, setOmniState] = useState<OmniForgeState | null>(null);
  const [forgedCLIs, setForgedCLIs] = useState<ForgedAgenticCLI[]>([]);
  const [selectedCLI, setSelectedCLI] = useState<ForgedAgenticCLI | null>(null);
  const [activeTab, setActiveTab] = useState<'SUBCOMMANDS' | 'SOURCE' | 'TEST_MD' | 'HARNESS_MD' | 'SKILL_MD' | 'LEASES'>('SUBCOMMANDS');
  
  // Pipeline Generator Form State
  const [toolNameInput, setToolNameInput] = useState('');
  const [codebaseInput, setCodebaseInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<'DATABASE' | 'PAYMENT' | 'AUDIO_DSP' | 'DEV_TOOL' | 'STORAGE' | 'CUSTOM'>('DEV_TOOL');
  const [forging, setForging] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<CLIForgeStep[]>([]);
  const [showForgeForm, setShowForgeForm] = useState(false);

  // Subcommand Runner State
  const [selectedSubcommand, setSelectedSubcommand] = useState<string>('');
  const [executingSub, setExecutingSub] = useState(false);
  const [subcommandOutput, setSubcommandOutput] = useState<Record<string, unknown> | null>(null);
  const [copied, setCopied] = useState(false);

  // Lease modal
  const [leases, setLeases] = useState<CapabilityLease[]>([]);
  const [worktrees, setWorktrees] = useState<VFSWorktree[]>([]);

  useEffect(() => {
    fetchOmniData();
  }, []);

  const fetchOmniData = async () => {
    try {
      const [resState, resCLIs, resLeases] = await Promise.all([
        fetch('/api/forge/omni/status').then(r => r.json()),
        fetch('/api/forge/cli/list').then(r => r.json()),
        fetch('/api/forge/leases').then(r => r.json())
      ]);
      setOmniState(resState);
      setForgedCLIs(resCLIs);
      setLeases(resLeases.leases || []);
      setWorktrees(resLeases.worktrees || []);
      if (resCLIs.length > 0 && !selectedCLI) {
        setSelectedCLI(resCLIs[0]);
        if (resCLIs[0].subcommands.length > 0) {
          setSelectedSubcommand(resCLIs[0].subcommands[0].name);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunPipeline = async () => {
    if (!toolNameInput.trim()) {
      onNotify('Please specify a tool name to forge', 'warning');
      return;
    }
    setForging(true);
    setGenerationSteps([]);
    try {
      const res = await fetch('/api/forge/cli/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: toolNameInput,
          targetCodebase: codebaseInput,
          category: categoryInput,
          authorKnight: 'Sir Forge & Sir Castor (Hive IDE)'
        })
      });
      const data = await res.json();
      setGenerationSteps(data.steps);
      onNotify(`Forged [${data.forgedCLI.binaryName}] via 7-Stage Pipeline!`, 'success');
      await fetchOmniData();
      setSelectedCLI(data.forgedCLI);
      if (data.forgedCLI.subcommands.length > 0) {
        setSelectedSubcommand(data.forgedCLI.subcommands[0].name);
      }
      setShowForgeForm(false);
      setToolNameInput('');
      setCodebaseInput('');
    } catch (err) {
      console.error(err);
      onNotify('Failed to execute CLI Forge pipeline', 'warning');
    } finally {
      setForging(false);
    }
  };

  const handleExecuteSubcommand = async (cli: ForgedAgenticCLI, subName: string) => {
    setExecutingSub(true);
    setSubcommandOutput(null);
    try {
      const res = await fetch('/api/forge/cli/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliId: cli.id,
          subcommand: subName,
          args: { mode: 'PRODUCTION_TEST', vfsSandbox: true }
        })
      });
      const data = await res.json();
      setSubcommandOutput(data);
      onNotify(`Executed \`${cli.binaryName} ${subName}\` in ${data.telemetry?.executionTimeMs || 2}ms`, 'success');
    } catch (err) {
      console.error(err);
      onNotify('Subcommand execution error', 'warning');
    } finally {
      setExecutingSub(false);
    }
  };

  const handleIssueLease = async (capability: string, targetAgent: string) => {
    try {
      const res = await fetch('/api/forge/lease/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capability,
          targetAgent,
          manifestId: `manifest_${capability.toLowerCase()}_v1`
        })
      });
      const lease = await res.json();
      onNotify(`Sentinel granted lease: ${lease.leaseId}`, 'success');
      await fetchOmniData();
    } catch (err) {
      console.error(err);
      onNotify('Failed to issue Sentinel lease', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      {/* Omni-Forge High-Level Triad Banner */}
      <div className="bg-[#121217] border border-[#D4AF37]/50 rounded-lg p-4 space-y-3 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252535] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#D4AF37]/10 border border-[#D4AF37]/40 rounded-md text-[#D4AF37]">
              <Boxes size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Ω_TITAN_OMNI_FORGE (v1000.0)
                </h2>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/40 font-mono">
                  SINGULARITY_LATTICE
                </span>
                <span className="text-[10px] bg-[#1E1E28] text-gray-300 px-2 py-0.5 rounded border border-[#333345] font-mono">
                  8GB Edge-Node
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Brain & Body Paradigm • Blueprint OS (Control) • Merlin's Software Foundry (Cognitive) • Hive IDE (Kinetic Swarm)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForgeForm(!showForgeForm)}
              className="bg-[#D4AF37] hover:bg-[#E5C158] text-[#08080B] font-bold text-xs px-3.5 py-1.5 rounded flex items-center gap-1.5 transition-all shadow-md"
            >
              <Hammer size={14} />
              <span>{showForgeForm ? 'Close Forge' : '+ Forge New Agentic CLI'}</span>
            </button>
          </div>
        </div>

        {/* 3 Cartridges Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Blueprint OS */}
          <div className="bg-[#0B0B0E] p-3 rounded-lg border border-[#20202C] space-y-1.5">
            <div className="flex items-center justify-between font-bold text-sky-400">
              <span className="flex items-center gap-1.5"><Shield size={14} /> 1. Blueprint OS</span>
              <span className="text-[9px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded border border-sky-800/40 font-mono">CONTROL_PLANE</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Anya (L7 Gate) • Sentinel Policy Authority (fails closed) • VFS Guardian (0 ambient leaks, ephemeral worktree clamping).
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-1 border-t border-[#181822]">
              <span>Active Leases: <strong className="text-sky-300">{leases.length}</strong></span>
              <span className="text-emerald-400">0 Ambient Escapes</span>
            </div>
          </div>

          {/* Merlin Foundry */}
          <div className="bg-[#0B0B0E] p-3 rounded-lg border border-[#20202C] space-y-1.5">
            <div className="flex items-center justify-between font-bold text-[#D4AF37]">
              <span className="flex items-center gap-1.5"><Cpu size={14} /> 2. Merlin Foundry</span>
              <span className="text-[9px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800/40 font-mono">COGNITIVE_BRAIN</span>
            </div>
            <p className="text-[11px] text-gray-400">
              System-2 Reasoning • Mathematical Task-DAG Decomposition • Bounded Runtime Adapter (zero direct kinetic execution).
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-1 border-t border-[#181822]">
              <span>DAG Router: <strong className="text-amber-300">ACTIVE</strong></span>
              <span>Envelope: 8GB Strict</span>
            </div>
          </div>

          {/* Hive IDE */}
          <div className="bg-[#0B0B0E] p-3 rounded-lg border border-[#20202C] space-y-1.5">
            <div className="flex items-center justify-between font-bold text-purple-400">
              <span className="flex items-center gap-1.5"><Layers size={14} /> 3. Hive IDE Swarm</span>
              <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/40 font-mono">KINETIC_BODY</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Nano-Knights (Sir Forge, Sir Castor) • Ephemeral Work-Cells • Gideon Independent Verification (AST diffs & tests).
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-1 border-t border-[#181822]">
              <span>Gideon Rigor: <strong className="text-purple-300">≥85%</strong></span>
              <span className="text-green-400">AST Clean</span>
            </div>
          </div>
        </div>
      </div>

      {/* CLI Forge Generation Drawer */}
      {showForgeForm && (
        <div className="bg-[#121217] border border-[#D4AF37] rounded-lg p-4 space-y-4 transition-all">
          <div className="flex items-center justify-between border-b border-[#252535] pb-2">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <Hammer size={15} /> Automated 7-Step Agentic CLI System Forge Pipeline
            </span>
            <span className="text-[10px] text-gray-400 font-mono">Turns any local software into agent-native Stdio JSON-RPC tools</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">Tool / Service Name</label>
              <input
                type="text"
                value={toolNameInput}
                onChange={e => setToolNameInput(e.target.value)}
                placeholder="e.g., Redis Fast Cache or DistroKid Uploader"
                className="w-full bg-[#181822] border border-[#2A2A35] text-xs text-white p-2.5 rounded focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">Category</label>
              <select
                value={categoryInput}
                onChange={e => setCategoryInput(e.target.value as any)}
                className="w-full bg-[#181822] border border-[#2A2A35] text-xs text-white p-2.5 rounded focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="DATABASE">DATABASE (OLAP / Key-Value / SQL)</option>
                <option value="PAYMENT">PAYMENT (Stripe / Ledger / Invoices)</option>
                <option value="AUDIO_DSP">AUDIO_DSP (Suno / Stems / Transcoding)</option>
                <option value="DEV_TOOL">DEV_TOOL (Git / Bundle / AST / REPL)</option>
                <option value="STORAGE">STORAGE (Parquet / S3 / IPFS / VFS)</option>
                <option value="CUSTOM">CUSTOM MICRO-SERVICE</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">Target Codebase / API Scope</label>
              <input
                type="text"
                value={codebaseInput}
                onChange={e => setCodebaseInput(e.target.value)}
                placeholder="e.g., In-memory cache with get/set and 64MB buffer limit"
                className="w-full bg-[#181822] border border-[#2A2A35] text-xs text-white p-2.5 rounded focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {/* 7-Step Breakdown Visualizer */}
          <div className="bg-[#0B0B0E] p-3 rounded border border-[#20202A] space-y-2">
            <div className="text-[11px] font-bold text-gray-300 flex items-center justify-between">
              <span>7-Stage Automated Pipeline Steps:</span>
              <span className="text-[10px] text-[#D4AF37] font-mono">Stdio JSON-RPC + TOON Architecture</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 text-[10px] font-mono">
              <div className="p-1.5 rounded bg-[#15151F] border border-[#2A2A3A] text-gray-300">1. Map API</div>
              <div className="p-1.5 rounded bg-[#15151F] border border-[#2A2A3A] text-gray-300">2. Subcommands</div>
              <div className="p-1.5 rounded bg-[#15151F] border border-[#2A2A3A] text-gray-300">3. JSON Output</div>
              <div className="p-1.5 rounded bg-[#15151F] border border-[#2A2A3A] text-gray-300">4. REPL Code</div>
              <div className="p-1.5 rounded bg-[#15151F] border border-[#2A2A3A] text-gray-300">5. TEST.md</div>
              <div className="p-1.5 rounded bg-[#15151F] border border-[#2A2A3A] text-gray-300">6. HARNESS.md</div>
              <div className="p-1.5 rounded bg-[#15151F] border border-[#2A2A3A] text-gray-300">7. SKILL.md</div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setShowForgeForm(false)}
              className="bg-[#1C1C26] hover:bg-[#252535] text-gray-400 text-xs px-3 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleRunPipeline}
              disabled={forging || !toolNameInput.trim()}
              className="bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-40 text-[#08080B] font-bold text-xs px-5 py-2 rounded flex items-center gap-2 shadow-md"
            >
              {forging ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
              <span>Execute 7-Stage Forge Pipeline</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Forged CLI Vault & Interactive Runner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: List of Forged CLIs */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#252535] pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-1.5">
              <Terminal size={14} className="text-[#D4AF37]" /> Agentic CLI Vault ({forgedCLIs.length})
            </span>
            <span className="text-[10px] text-green-400 font-mono">SWARM_DISCOVERED</span>
          </div>

          <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
            {forgedCLIs.map(cli => (
              <div
                key={cli.id}
                onClick={() => {
                  setSelectedCLI(cli);
                  if (cli.subcommands.length > 0) {
                    setSelectedSubcommand(cli.subcommands[0].name);
                  }
                  setSubcommandOutput(null);
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedCLI?.id === cli.id
                    ? 'bg-[#181822] border-[#D4AF37] shadow-md'
                    : 'bg-[#121217] border-[#252535] hover:border-[#3A3A4A]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                    <Terminal size={13} className="text-[#D4AF37]" />
                    {cli.binaryName}
                  </span>
                  <span className="text-[9px] bg-[#221B28] text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/40 font-mono">
                    v{cli.version}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                  {cli.description}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 mt-2 pt-1 border-t border-[#1C1C26]">
                  <span className="text-sky-400">{cli.subcommands.length} subcommands</span>
                  <span className="text-gray-400">{cli.authorKnight}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Selected CLI Inspector & Execution Workspace */}
        {selectedCLI && (
          <div className="lg:col-span-8 bg-[#121217] border border-[#2A2A35] rounded-lg p-4 space-y-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#252535] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <Terminal size={16} className="text-[#D4AF37]" /> {selectedCLI.binaryName}
                  </h3>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/40 font-mono">
                    {selectedCLI.transport}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{selectedCLI.toolName} • {selectedCLI.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleIssueLease(selectedCLI.binaryName.toUpperCase(), 'Sir Forge')}
                  className="bg-[#181822] hover:bg-[#222230] text-sky-300 border border-sky-800/50 text-xs px-2.5 py-1.5 rounded flex items-center gap-1 transition-all"
                  title="Request Sentinel Capability Lease"
                >
                  <Lock size={12} />
                  <span>Request Lease</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-[#20202A] pb-2 text-xs font-mono">
              <button
                onClick={() => setActiveTab('SUBCOMMANDS')}
                className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                  activeTab === 'SUBCOMMANDS'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'bg-[#181822] text-gray-300 hover:text-white border border-[#252532]'
                }`}
              >
                <Play size={13} /> Subcommands & Runner
              </button>
              <button
                onClick={() => setActiveTab('SOURCE')}
                className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                  activeTab === 'SOURCE'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'bg-[#181822] text-gray-300 hover:text-white border border-[#252532]'
                }`}
              >
                <FileCode size={13} /> Executable CLI Code
              </button>
              <button
                onClick={() => setActiveTab('TEST_MD')}
                className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                  activeTab === 'TEST_MD'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'bg-[#181822] text-gray-300 hover:text-white border border-[#252532]'
                }`}
              >
                <CheckCircle2 size={13} /> TEST.md
              </button>
              <button
                onClick={() => setActiveTab('HARNESS_MD')}
                className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                  activeTab === 'HARNESS_MD'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'bg-[#181822] text-gray-300 hover:text-white border border-[#252532]'
                }`}
              >
                <BookOpen size={13} /> HARNESS.md
              </button>
              <button
                onClick={() => setActiveTab('SKILL_MD')}
                className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                  activeTab === 'SKILL_MD'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'bg-[#181822] text-gray-300 hover:text-white border border-[#252532]'
                }`}
              >
                <Sparkles size={13} /> SKILL.md
              </button>
              <button
                onClick={() => setActiveTab('LEASES')}
                className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                  activeTab === 'LEASES'
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'bg-[#181822] text-gray-300 hover:text-white border border-[#252532]'
                }`}
              >
                <FolderLock size={13} /> Sentinel & VFS ({leases.length})
              </button>
            </div>

            {/* TAB: Subcommands & Live Runner */}
            {activeTab === 'SUBCOMMANDS' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedCLI.subcommands.map(sc => (
                    <div
                      key={sc.name}
                      onClick={() => {
                        setSelectedSubcommand(sc.name);
                        handleExecuteSubcommand(selectedCLI, sc.name);
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedSubcommand === sc.name
                          ? 'bg-[#161622] border-[#D4AF37]'
                          : 'bg-[#0B0B0E] border-[#222230] hover:border-[#353545]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-400 font-mono">
                          {selectedCLI.binaryName} {sc.name}
                        </span>
                        <Play size={12} className="text-[#D4AF37]" />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">{sc.description}</p>
                      <div className="text-[10px] font-mono text-gray-500 mt-2 flex flex-wrap gap-1">
                        {sc.flags.map((f, i) => (
                          <span key={i} className="bg-[#14141E] px-1 py-0.5 rounded text-gray-300">{f}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subcommand Live Output Terminal */}
                <div className="bg-[#08080B] rounded-lg border border-[#252535] p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#1E1E28] pb-2">
                    <span className="text-[11px] font-bold text-gray-300 font-mono flex items-center gap-1.5">
                      <Terminal size={13} className="text-[#D4AF37]" />
                      Stdio JSON-RPC 2.0 Output ({selectedCLI.binaryName} {selectedSubcommand})
                    </span>
                    <button
                      onClick={() => handleExecuteSubcommand(selectedCLI, selectedSubcommand)}
                      disabled={executingSub}
                      className="text-[10px] bg-[#1E1E28] hover:bg-[#282836] text-[#D4AF37] px-2.5 py-1 rounded flex items-center gap-1 transition-all"
                    >
                      {executingSub ? <RefreshCw size={11} className="animate-spin" /> : <Play size={11} />}
                      <span>Re-Execute Subcommand</span>
                    </button>
                  </div>

                  <pre className="p-2.5 bg-[#050507] rounded text-xs font-mono text-emerald-400 overflow-x-auto max-h-56 leading-relaxed">
                    {subcommandOutput
                      ? JSON.stringify(subcommandOutput, null, 2)
                      : `Click any subcommand above to trigger zero-ambient VFS execution.\n// Example:\n$ ${selectedCLI.binaryName} ${selectedSubcommand || 'inspect'}\n>> Awaiting Stdio JSON-RPC execution...`}
                  </pre>

                  {subcommandOutput && (
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-1 border-t border-[#181822]">
                      <span className="text-green-400">✓ VFS Sandbox Isolation Active</span>
                      <span>Ambient File Leaks: <strong className="text-white">0</strong></span>
                      <span className="text-sky-300">Sentinel Lease Verified</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Executable Source Code */}
            {activeTab === 'SOURCE' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 font-mono">
                    bin/{selectedCLI.binaryName} (Node.js / TypeScript Executable)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedCLI.cliSourceCode);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-[10px] bg-[#181822] text-[#D4AF37] px-2.5 py-1 rounded flex items-center gap-1"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#08080B] rounded border border-[#252535] text-xs font-mono text-gray-200 overflow-x-auto max-h-80 leading-relaxed">
                  {selectedCLI.cliSourceCode}
                </pre>
              </div>
            )}

            {/* TAB: TEST.md */}
            {activeTab === 'TEST_MD' && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-300 font-mono">TEST.md (Gideon Sandbox Test Harness)</span>
                <pre className="p-3 bg-[#08080B] rounded border border-[#252535] text-xs font-mono text-sky-300 overflow-x-auto max-h-80 whitespace-pre-wrap">
                  {selectedCLI.testMd}
                </pre>
              </div>
            )}

            {/* TAB: HARNESS.md */}
            {activeTab === 'HARNESS_MD' && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-300 font-mono">HARNESS.md (Agent Operational Manual)</span>
                <pre className="p-3 bg-[#08080B] rounded border border-[#252535] text-xs font-mono text-purple-300 overflow-x-auto max-h-80 whitespace-pre-wrap">
                  {selectedCLI.harnessMd}
                </pre>
              </div>
            )}

            {/* TAB: SKILL.md */}
            {activeTab === 'SKILL_MD' && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-300 font-mono">SKILL.md (Swarm Discovery Spec)</span>
                <pre className="p-3 bg-[#08080B] rounded border border-[#252535] text-xs font-mono text-[#D4AF37] overflow-x-auto max-h-80 whitespace-pre-wrap">
                  {selectedCLI.skillMd}
                </pre>
              </div>
            )}

            {/* TAB: Sentinel Capability Leases & VFS Sandboxes */}
            {activeTab === 'LEASES' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#20202A] pb-2">
                  <span className="text-xs font-bold text-sky-400 font-mono flex items-center gap-1.5">
                    <Shield size={14} /> Active Sentinel Capability Leases ({leases.length})
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">Policy: FAIL_CLOSED</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {leases.map(l => (
                    <div key={l.leaseId} className="p-2.5 bg-[#0B0B0E] rounded border border-[#20202C] text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[#D4AF37] font-bold">{l.capability}</span>
                        <span className="text-[10px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded">{l.leaseStatus}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        Lease: {l.leaseId} • Agent: {l.targetAgent} • Worktree: {l.vfsWorktreeId}
                      </div>
                      <div className="text-[9px] text-gray-500 font-mono truncate">
                        Sig: {l.receiptSignature}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-[#20202A] pt-2 text-[11px] text-gray-400 font-mono">
                  <span>VFS Worktrees: <strong className="text-white">{worktrees.length} Sandboxes</strong></span>
                  <span className="text-emerald-400">Ambient Access: 0% (Forbidden)</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
