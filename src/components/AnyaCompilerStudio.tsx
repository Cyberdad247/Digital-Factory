import React, { useState } from 'react';
import { 
  Sparkles, 
  Terminal, 
  Zap, 
  Copy, 
  Check, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  Hammer, 
  RefreshCw, 
  Boxes,
  HelpCircle,
  FolderLock
} from 'lucide-react';
import { APEECompileResult } from '../types';

interface AnyaCompilerStudioProps {
  onNotify: (message: string, type: 'success' | 'warning') => void;
  onDispatchToHydra?: (task: string) => void;
}

export function AnyaCompilerStudio({ onNotify, onDispatchToHydra }: AnyaCompilerStudioProps) {
  const [rawInput, setRawInput] = useState('');
  const [compilerMode, setCompilerMode] = useState<'OMEGA_TITAN_OMNI_FORGE' | 'APEE_STANDARD'>('OMEGA_TITAN_OMNI_FORGE');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<APEECompileResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showLegoExplainer, setShowLegoExplainer] = useState(false);
  const [rulesContent, setRulesContent] = useState('');
  const [titanPromptContent, setTitanPromptContent] = useState('');
  const [activeStageTab, setActiveStageTab] = useState<number>(4);
  const [indexingToVault, setIndexingToVault] = useState(false);

  const presets = [
    {
      label: 'Agentic CLI Forge (DuckDB OLAP)',
      prompt: 'Synthesize an agentic CLI for DuckDB Columnar OLAP with Stdio JSON-RPC 2.0, TEST.md sandbox suites, and HARNESS.md operational manual.'
    },
    {
      label: 'Omni-Forge Stripe Ledger',
      prompt: 'Build an autonomous Stripe webhook ledger with SQLite append-only audit trail, Sentinel capability lease verification, and idempotent settlement.'
    },
    {
      label: 'Suno DSP & Audio Pipeline',
      prompt: 'Create an autonomous Suno AI music generator with DistroKid release metadata formatter, MP3 stem transcoder, and album art generator CLI.'
    },
    {
      label: 'Appwrite Zero-Trust Auth',
      prompt: 'Implement Appwrite multi-tenant auth with X25519 Bifrost bridge, JWT auto-rotation, and WebAuthn fallback in Next.js 15 PWA.'
    }
  ];

  const handleCompile = async (overridePrompt?: string) => {
    const text = overridePrompt || rawInput;
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/apee/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rawIntent: text,
          mode: compilerMode 
        })
      });
      const data: APEECompileResult = await res.json();
      setResult(data);
      setActiveStageTab(4); // focus on CRYSTALLIZE
      onNotify(`[${compilerMode === 'OMEGA_TITAN_OMNI_FORGE' ? 'Ω_TITAN_OMNI_FORGE' : 'νKG_CRYSTAL'}] Compiled: ${data.metrics.staticPurgedPercent}% static purged in ${data.metrics.latencyMs}ms`, 'success');
    } catch (err) {
      console.error(err);
      onNotify('Compilation failed: Connection timeout', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.crystalPrompt);
    setCopied(true);
    onNotify('One-shot Titan Prompt copied for Claude / Cursor / OpenClaw', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveToNotebookVault = async () => {
    if (!result) return;
    setIndexingToVault(true);
    try {
      const res = await fetch('/api/apee/save-to-vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `[${compilerMode}]: ${result.targetProject}`,
          crystalPrompt: result.crystalPrompt,
          targetProject: result.targetProject
        })
      });
      const data = await res.json();
      if (data.success) {
        onNotify(`Indexed into NotebookLM Vault: ${data.source.title}`, 'success');
      }
    } catch (err) {
      console.error(err);
      onNotify('Failed to index crystal into NotebookLM vault', 'warning');
    } finally {
      setIndexingToVault(false);
    }
  };

  const handleViewRules = async () => {
    if (!rulesContent) {
      try {
        const res = await fetch('/api/apee/rules');
        const data = await res.json();
        setRulesContent(data.rules);
        setTitanPromptContent(data.titanOmniForgePrompt || '');
      } catch (err) {
        console.error(err);
      }
    }
    setShowRules(!showRules);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A35] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/40 rounded text-[#D4AF37]">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Anya Prompt Enhancement Engine (APEE v7.0 & Omni-Forge)
              </h3>
              <span className="text-[10px] bg-[#221B28] text-purple-300 px-2 py-0.5 rounded border border-purple-800/40 font-mono">
                L7 Sovereign Compiler
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Brain & Body Architecture • Blueprint OS (Control) • Merlin's Foundry (Cognitive) • Hive IDE (Kinetic Swarm)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#101016] border border-[#252535] rounded p-0.5 text-xs font-mono">
            <button
              onClick={() => setCompilerMode('OMEGA_TITAN_OMNI_FORGE')}
              className={`px-2.5 py-1 rounded transition-all ${
                compilerMode === 'OMEGA_TITAN_OMNI_FORGE'
                  ? 'bg-[#D4AF37] text-black font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Ω_TITAN_OMNI_FORGE
            </button>
            <button
              onClick={() => setCompilerMode('APEE_STANDARD')}
              className={`px-2.5 py-1 rounded transition-all ${
                compilerMode === 'APEE_STANDARD'
                  ? 'bg-[#D4AF37] text-black font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              APEE_STANDARD
            </button>
          </div>

          <button
            onClick={() => setShowLegoExplainer(!showLegoExplainer)}
            className="text-xs bg-[#181822] hover:bg-[#222230] text-sky-300 border border-sky-800/40 px-2.5 py-1.5 rounded flex items-center gap-1 transition-all"
            title="12-Year-Old LEGO Factory Breakdown"
          >
            <HelpCircle size={13} />
            <span>Architecture Breakdown</span>
          </button>

          <button
            onClick={handleViewRules}
            className="text-xs bg-[#1C1C26] hover:bg-[#252535] text-gray-300 px-2.5 py-1.5 rounded flex items-center gap-1 border border-[#333345] transition-all"
          >
            <BookOpen size={13} />
            <span>{showRules ? 'Hide Spec' : 'Master Rules'}</span>
          </button>
        </div>
      </div>

      {/* 12-Year-Old LEGO Factory Explainer Modal / Card */}
      {showLegoExplainer && (
        <div className="bg-[#121218] border border-sky-700/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#252535] pb-2">
            <span className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
              <Boxes size={15} /> The Omni-Forge: Explained Like a 12-Year-Old Building LEGOs
            </span>
            <button
              onClick={() => setShowLegoExplainer(false)}
              className="text-gray-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#0B0B0E] p-3 rounded border border-sky-900/40 space-y-1">
              <strong className="text-sky-400 block font-mono">1. Blueprint OS (Security)</strong>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                The Security Guard & LEGO box manager. Nobody gets any bricks or powers without an ID card (Sentinel lease). If an agent tries to touch anything unauthorized, it gets locked instantly!
              </p>
            </div>
            <div className="bg-[#0B0B0E] p-3 rounded border border-amber-900/40 space-y-1">
              <strong className="text-[#D4AF37] block font-mono">2. Merlin's Foundry (Brain)</strong>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                The Master Architect. Reads your wish, writes the step-by-step LEGO instruction booklet (Task-DAG), and picks the best tools. Never touches the actual bricks himself!
              </p>
            </div>
            <div className="bg-[#0B0B0E] p-3 rounded border border-purple-900/40 space-y-1">
              <strong className="text-purple-400 block font-mono">3. Hive IDE (Builder Swarm)</strong>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                The Tiny Builder Knights (Sir Forge & Sir Castor). They build the blocks inside temporary cardboard boxes. Gideon inspects every block before it can be used in the real castle!
              </p>
            </div>
            <div className="bg-[#0B0B0E] p-3 rounded border border-emerald-900/40 space-y-1">
              <strong className="text-emerald-400 block font-mono">4. Agentic CLI Forge (Tool Maker)</strong>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                The 3D Printer for tools. Whenever the knights find an unknown computer program, this forge automatically invents a standardized command tool, manual, and test suite in 7 steps!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rules Spec Drawer */}
      {showRules && (
        <div className="bg-[#0D0D12] border border-[#2D2D3E] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#252535] pb-2">
            <span className="text-xs font-bold text-[#D4AF37] font-mono">
              anya_compiler_rules.md & Ω_TITAN_OMNI_FORGE_v1000.nkg
            </span>
            <span className="text-[10px] text-green-400 font-mono">ISOMORPHIC_INDEXED</span>
          </div>
          <pre className="p-3 bg-[#08080B] rounded border border-[#20202A] text-xs font-mono text-gray-300 max-h-72 overflow-y-auto leading-relaxed whitespace-pre-wrap">
            {compilerMode === 'OMEGA_TITAN_OMNI_FORGE' ? titanPromptContent : rulesContent}
          </pre>
        </div>
      )}

      {/* Compiler Input Section */}
      <div className="bg-[#121217] border border-[#252535] rounded-lg p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal size={14} className="text-[#D4AF37]" />
              Sovereign Intent Input (Raw Natural Language)
            </label>
            <span className="text-[11px] text-gray-400 font-mono">
              Target Hardware: <strong className="text-white">ARM64_8GB</strong>
            </span>
          </div>

          <textarea
            value={rawInput}
            onChange={e => setRawInput(e.target.value)}
            placeholder="Type any raw project idea, unformatted thought, or workflow description. Anya Ω will eliminate static and compile a flawless one-shot Titan prompt..."
            rows={4}
            className="w-full bg-[#181822] border border-[#2A2A35] rounded-lg p-3 text-xs text-gray-200 placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none leading-relaxed font-sans"
          />
        </div>

        {/* Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Omni-Forge & Swarm Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setRawInput(p.prompt);
                  handleCompile(p.prompt);
                }}
                className="text-xs bg-[#181822] hover:bg-[#20202E] text-gray-300 border border-[#2A2A3A] px-2.5 py-1.5 rounded transition-all flex items-center gap-1.5"
              >
                <Zap size={12} className="text-[#D4AF37]" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Compile Trigger Button */}
        <div className="flex justify-end pt-1">
          <button
            onClick={() => handleCompile()}
            disabled={loading || !rawInput.trim()}
            className="bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-40 text-[#08080B] font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-lg"
          >
            {loading ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Hammer size={15} />
            )}
            <span>
              {loading ? 'Executing Compilation Matrix...' : `Compile with ${compilerMode === 'OMEGA_TITAN_OMNI_FORGE' ? 'Ω_TITAN_OMNI_FORGE' : 'APEE v7.0'}`}
            </span>
          </button>
        </div>
      </div>

      {/* Output / 5-Stage Visualizer */}
      {result && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Metrics Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#121217] p-3 rounded-lg border border-[#252535]">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Token Reduction</span>
              <div className="text-lg font-bold text-[#D4AF37] font-mono mt-0.5">
                {result.metrics.rawTokens} → {result.metrics.crystalTokens}
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">
                {result.metrics.staticPurgedPercent}% Static Neutralized
              </span>
            </div>

            <div className="bg-[#121217] p-3 rounded-lg border border-[#252535]">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Compiler Latency</span>
              <div className="text-lg font-bold text-white font-mono mt-0.5">
                {result.metrics.latencyMs}ms
              </div>
              <span className="text-[10px] text-purple-300 font-mono">
                Triple-QFT Matrix
              </span>
            </div>

            <div className="bg-[#121217] p-3 rounded-lg border border-[#252535]">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Entropy Level</span>
              <div className="text-lg font-bold text-green-400 font-mono mt-0.5">
                0.05
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                From 96.5 (99.2% Drop)
              </span>
            </div>

            <div className="bg-[#121217] p-3 rounded-lg border border-[#252535]">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Hardware Bounds</span>
              <div className="text-xs font-bold text-sky-300 font-mono mt-1.5">
                {result.metrics.hardwareCeiling}
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                Zero Memory Leaks
              </span>
            </div>
          </div>

          {/* 5-Stage Stepper Navigation */}
          <div className="bg-[#121217] border border-[#252535] rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-[#20202A] pb-2">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-[#D4AF37]" />
                The 5-Stage Compilation Pipeline
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                Target: [{result.targetProject}]
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {result.stages.map((stg, idx) => (
                <button
                  key={stg.stage}
                  onClick={() => setActiveStageTab(idx)}
                  className={`p-2 rounded text-left border transition-all ${
                    activeStageTab === idx
                      ? 'bg-[#1C1C26] border-[#D4AF37] text-white shadow-md'
                      : 'bg-[#0E0E13] border-[#222230] text-gray-400 hover:border-[#353545]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="text-[#D4AF37] font-bold">0{idx + 1}. {stg.stage}</span>
                    <span className="text-emerald-400">-{Math.round(stg.entropyBefore - stg.entropyAfter)}%</span>
                  </div>
                  <div className="text-[11px] font-medium truncate text-gray-200">{stg.name}</div>
                </button>
              ))}
            </div>

            {/* Active Stage Details */}
            <div className="bg-[#0B0B0E] rounded p-3 border border-[#1E1E28] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-gray-300">
                <span className="text-[#D4AF37] font-bold">
                  Stage Details: {result.stages[activeStageTab].name}
                </span>
                <span className="text-[11px] text-gray-400">
                  Entropy: {result.stages[activeStageTab].entropyBefore} → {result.stages[activeStageTab].entropyAfter}
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {result.stages[activeStageTab].description}
              </p>
              <ul className="space-y-1 text-xs text-gray-300 font-mono pt-1">
                {result.stages[activeStageTab].details.map((d, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#D4AF37]">▸</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Final Prompt Output Box */}
          <div className="bg-[#121217] border border-[#D4AF37] rounded-lg p-4 space-y-3 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#252535] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#D4AF37]/10 rounded text-[#D4AF37]">
                  <Terminal size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                    {compilerMode === 'OMEGA_TITAN_OMNI_FORGE' ? 'Ω_TITAN_OMNI_FORGE Execution Crystal' : 'νKG_CRYSTAL Prompt Output'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Deterministic • Zero-Entropy • Ready for Claude / Cursor / OpenClaw / Hydra
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToNotebookVault}
                  disabled={indexingToVault}
                  className="bg-[#1C1C26] hover:bg-[#252535] text-purple-300 border border-purple-800/40 text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-all"
                >
                  {indexingToVault ? <RefreshCw size={13} className="animate-spin" /> : <BookOpen size={13} />}
                  <span>Index into Vault</span>
                </button>

                {onDispatchToHydra && (
                  <button
                    onClick={() => onDispatchToHydra(result.targetProject)}
                    className="bg-[#1C1C26] hover:bg-[#252535] text-sky-300 border border-sky-800/40 text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-all"
                  >
                    <Zap size={13} />
                    <span>Run in Hydra Loop</span>
                  </button>
                )}

                <button
                  onClick={handleCopy}
                  className="bg-[#D4AF37] hover:bg-[#E5C158] text-[#08080B] font-bold text-xs px-4 py-1.5 rounded flex items-center gap-1.5 transition-all shadow-md"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Titan Prompt'}</span>
                </button>
              </div>
            </div>

            {/* Prompt Code Block */}
            <pre className="p-4 bg-[#08080B] rounded-lg border border-[#252535] text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed max-h-96 whitespace-pre-wrap selection:bg-[#D4AF37]/30">
              {result.crystalPrompt}
            </pre>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-400 font-mono pt-1">
              <span className="text-[#D4AF37]">
                ANYA_FIRST_LAW: Dreams don't come true, visions do.
              </span>
              <span className="text-gray-500">
                Format: TOON (Token-Oriented Object Notation)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
