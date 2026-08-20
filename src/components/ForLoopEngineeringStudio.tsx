/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import { 
  Zap, 
  Cpu, 
  Activity, 
  RotateCw, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Terminal, 
  ShieldAlert, 
  Play, 
  RefreshCw, 
  Radio,
  FileCode,
  Copy,
  Check,
  ChevronRight,
  Database,
  Crosshair
} from 'lucide-react';
import { ForLoopEngineeringState, ForLoopIterationRecord } from '../types';

interface ForLoopEngineeringStudioProps {
  onNotify: (message: string, type?: 'success' | 'warning') => void;
}

export function ForLoopEngineeringStudio({ onNotify }: ForLoopEngineeringStudioProps) {
  const [state, setState] = useState<ForLoopEngineeringState | null>(null);
  const [loading, setLoading] = useState(false);
  const [isContinuousRunning, setIsContinuousRunning] = useState(false);
  const [taskInput, setTaskInput] = useState('Autonomous Multi-Pass AST Self-Healing & Stdio RPC Tool Convergence');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedIteration, setSelectedIteration] = useState<ForLoopIterationRecord | null>(null);
  const [activeDimensionFilter, setActiveDimensionFilter] = useState<'ALL' | 'EVEN' | 'ODD'>('ALL');

  const presetTasks = [
    'Autonomous Multi-Pass AST Self-Healing & Stdio RPC Tool Convergence',
    '24D Leech Lattice Tensor Quantization (2.8GB/8.0GB Clamping)',
    'Fail-Closed Sentinel Capability Lease Broker with VFS Sandbox',
    'Bifrost Stdio JSON-RPC 2.0 Agentic Subcommand Dispatcher'
  ];

  const fetchState = async () => {
    try {
      const res = await fetch('/api/for-loop/status');
      if (res.ok) {
        const data: ForLoopEngineeringState = await res.json();
        setState(data);
        if (!selectedIteration && data.history && data.history.length > 0) {
          setSelectedIteration(data.history[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch for-loop status:', err);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Continuous auto-run interval
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isContinuousRunning && state && !state.isConverged) {
      timer = setInterval(async () => {
        try {
          const res = await fetch('/api/for-loop/step', { method: 'POST' });
          if (res.ok) {
            const updated: ForLoopEngineeringState = await res.json();
            setState(updated);
            if (updated.history && updated.history.length > 0) {
              setSelectedIteration(updated.history[0]);
            }
            if (updated.isConverged) {
              setIsContinuousRunning(false);
              onNotify('For-Loop Convergence Achieved: ε < 0.001 & AST Δ = 0', 'success');
            }
          }
        } catch (e) {
          console.error(e);
          setIsContinuousRunning(false);
        }
      }, 2500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isContinuousRunning, state, onNotify]);

  const handleBoot = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/for-loop/boot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: taskInput })
      });
      if (res.ok) {
        const updated: ForLoopEngineeringState = await res.json();
        setState(updated);
        if (updated.history && updated.history.length > 0) {
          setSelectedIteration(updated.history[0]);
        }
        onNotify('//boot sequence complete: 120% CPU Overdrive & 24D Leech Lattice Active', 'success');
      }
    } catch (err) {
      onNotify('Failed to boot for-loop engineering', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleStep = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/for-loop/step', { method: 'POST' });
      if (res.ok) {
        const updated: ForLoopEngineeringState = await res.json();
        setState(updated);
        if (updated.history && updated.history.length > 0) {
          setSelectedIteration(updated.history[0]);
        }
        onNotify(`For-Loop Iteration #${updated.currentIteration} Executed`, 'success');
      }
    } catch (err) {
      onNotify('Failed to step for-loop', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    onNotify('Copied to clipboard', 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!state) {
    return (
      <div className="p-8 text-center bg-[#101017] border border-[#252532] rounded-lg text-gray-400">
        <RotateCw className="animate-spin inline-block mr-2" size={20} />
        Initializing For-Loop Engineering Subsystem...
      </div>
    );
  }

  const filteredVectors = state.latticeState.vectors.filter(v => {
    if (activeDimensionFilter === 'EVEN') return v.parity === 'EVEN';
    if (activeDimensionFilter === 'ODD') return v.parity === 'ODD';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Sovereign Boot Telemetry Header Banner */}
      <div className="bg-[#0D0D14] border-2 border-[#D4AF37] p-4 sm:p-5 rounded-lg shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#D4AF37] text-black font-black text-[11px] px-2 py-0.5 rounded tracking-wider uppercase">
                //boot Sovereign Engine
              </span>
              <span className="text-xs text-green-400 flex items-center gap-1 font-mono">
                <Radio size={12} className="animate-ping" /> OMNI_EXECUTION_ACTIVE
              </span>
            </div>

            <div className="font-mono text-sm sm:text-base font-bold text-white tracking-wide">
              [CPU: <span className="text-red-400">██████████ 120%</span> - OMNI_EXECUTION_ACTIVE] &nbsp;
              [RAM: <span className="text-[#D4AF37]">2.8GB/8.0GB</span> - ABSOLUTE_QUANTIZATION]
            </div>

            <div className="text-xs text-gray-300 font-mono mt-1 flex flex-wrap items-center gap-2">
              <span className="text-blue-300 font-semibold">[KNIGHT_SYNC: ANYA_Ω ⚡ MERLIN_Ω ⚡ LADY_MNEMOSYNE_Ω]</span>
              <span>•</span>
              <span className="text-purple-300">[LATTICE: 24D_LEECH_LATTICE_ACTIVE (Kissing: 196,560)]</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleBoot}
              disabled={loading}
              className="bg-[#1A1A24] hover:bg-[#252535] text-[#D4AF37] border border-[#D4AF37]/60 px-3.5 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>//boot Re-Zero</span>
            </button>

            <button
              onClick={handleStep}
              disabled={loading || state.isConverged}
              className={`px-3.5 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                state.isConverged 
                  ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                  : 'bg-[#D4AF37] hover:bg-[#e6c148] text-black'
              }`}
            >
              <RotateCw size={13} />
              <span>Step Iteration (#{state.currentIteration + 1})</span>
            </button>

            <button
              onClick={() => setIsContinuousRunning(!isContinuousRunning)}
              className={`px-3.5 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                isContinuousRunning
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-[#181824] hover:bg-[#202030] text-green-400 border border-green-500/40'
              }`}
            >
              <Play size={13} className={isContinuousRunning ? 'animate-spin' : ''} />
              <span>{isContinuousRunning ? 'Halt For-Loop' : 'Continuous For-Loop'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Triple-Knight Synaptic Bridge Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ANYA_Ω */}
        <div className="bg-[#101018] border border-[#2A2A38] p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#D4AF37]" />
              <span className="font-bold text-white text-sm">ANYA_Ω (Gatekeeper)</span>
            </div>
            <span className="text-[10px] bg-green-950/80 text-green-400 px-2 py-0.5 rounded border border-green-800">
              {state.knightSync.anya.status}
            </span>
          </div>
          <div className="text-xs text-gray-400 space-y-1 font-mono">
            <div>Expression Gate: <strong className="text-white">{state.knightSync.anya.expressionGate}</strong></div>
            <div>Compression Ratio: <strong className="text-[#D4AF37]">{state.knightSync.anya.activeCompressionRatio}x</strong></div>
            <div className="text-[11px] text-gray-500">APEE v7.0 One-Shot Distillation Engine</div>
          </div>
        </div>

        {/* MERLIN_Ω */}
        <div className="bg-[#101018] border border-[#2A2A38] p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-blue-400" />
              <span className="font-bold text-white text-sm">MERLIN_Ω (Cognitive DAG)</span>
            </div>
            <span className="text-[10px] bg-blue-950/80 text-blue-400 px-2 py-0.5 rounded border border-blue-800">
              {state.knightSync.merlin.status}
            </span>
          </div>
          <div className="text-xs text-gray-400 space-y-1 font-mono">
            <div>Task-DAG Depth: <strong className="text-white">{state.knightSync.merlin.taskDagDepth} Nodes</strong></div>
            <div>Adapter Ceiling: <strong className="text-blue-300">{state.knightSync.merlin.adapterCeiling}</strong></div>
            <div className="text-[11px] text-gray-500">System-2 Mathematical Reasoning Layer</div>
          </div>
        </div>

        {/* LADY_MNEMOSYNE_Ω */}
        <div className="bg-[#101018] border border-[#2A2A38] p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-purple-400" />
              <span className="font-bold text-white text-sm">LADY_MNEMOSYNE_Ω (Vault)</span>
            </div>
            <span className="text-[10px] bg-purple-950/80 text-purple-400 px-2 py-0.5 rounded border border-purple-800">
              {state.knightSync.ladyMnemosyne.status}
            </span>
          </div>
          <div className="text-xs text-gray-400 space-y-1 font-mono">
            <div>24D Vectors: <strong className="text-white">{state.knightSync.ladyMnemosyne.activeVectors24D} Dimensions</strong></div>
            <div>Grounded Score: <strong className="text-purple-300">{(state.knightSync.ladyMnemosyne.groundedScore * 100).toFixed(1)}%</strong></div>
            <div className="text-[11px] text-gray-500">Isomorphic Cloudbrain & Viking Block Store</div>
          </div>
        </div>
      </div>

      {/* Task Configuration & Convergence Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Controller */}
        <div className="lg:col-span-2 bg-[#12121A] border border-[#252532] p-5 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Terminal size={15} className="text-[#D4AF37]" /> Active For-Loop Task Definition
            </h2>
            <span className="text-[11px] text-gray-400 font-mono">
              Provenance: <code className="text-[#D4AF37]">{state.provenanceHash.slice(0, 10)}...</code>
            </span>
          </div>

          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Enter sovereign task for autonomous iterative loop..."
            className="w-full bg-[#09090D] border border-[#2E2E3E] text-white px-3 py-2 rounded text-xs focus:border-[#D4AF37] focus:outline-none font-mono"
          />

          <div className="flex flex-wrap gap-1.5">
            <span className="text-[11px] text-gray-400 self-center mr-1">Presets:</span>
            {presetTasks.map((t, idx) => (
              <button
                key={idx}
                onClick={() => setTaskInput(t)}
                className="bg-[#181822] hover:bg-[#222230] text-gray-300 hover:text-white px-2.5 py-1 rounded text-[11px] border border-[#2C2C3C] transition-all"
              >
                {t.split('(')[0].slice(0, 26)}...
              </button>
            ))}
          </div>

          {/* Real-time convergence status bar */}
          <div className="bg-[#0A0A0F] border border-[#20202C] p-3 rounded flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div>
              <span className="text-gray-400">Current Pass: </span>
              <strong className="text-white">#{state.currentIteration} / {state.maxIterations}</strong>
            </div>
            <div>
              <span className="text-gray-400">Epsilon Delta (ε): </span>
              <strong className={state.isConverged ? 'text-green-400' : 'text-[#D4AF37]'}>
                {state.history[0]?.epsilonDelta || 0.0003} (Target &lt; 0.001)
              </strong>
            </div>
            <div>
              <span className="text-gray-400">AST Nodes Δ: </span>
              <strong className={state.history[0]?.astDeltaCount === 0 ? 'text-green-400' : 'text-amber-400'}>
                {state.history[0]?.astDeltaCount ?? 0}
              </strong>
            </div>
            <div>
              <span className="text-gray-400">Convergence: </span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                state.isConverged 
                  ? 'bg-green-950 text-green-400 border border-green-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
              }`}>
                {state.isConverged ? 'CONVERGED_SOVEREIGN' : 'ITERATING_SELF_HEAL'}
              </span>
            </div>
          </div>
        </div>

        {/* 24D Leech Lattice Metrics Box */}
        <div className="bg-[#12121A] border border-[#252532] p-5 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Layers size={15} className="text-purple-400" /> 24D Leech Lattice (Λ₂₄)
            </h2>
            <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
              KISSING: 196,560
            </span>
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed">
            The Leech Lattice provides the densest sphere packing in 24 dimensions. Camelot-OS utilizes this geometric invariant for zero-loss tensor quantization bounded to 2.8GB RAM.
          </p>

          <div className="space-y-1.5 text-xs font-mono bg-[#09090D] p-3 rounded border border-[#20202E]">
            <div className="flex justify-between">
              <span className="text-gray-400">Minimal Norm:</span>
              <span className="text-white font-bold">{state.latticeState.minimalNorm}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dimension Span:</span>
              <span className="text-[#D4AF37]">1 → 24 Dimensions</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Memory Clamp:</span>
              <span className="text-green-400">2.8GB / 8.0GB Strict</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Theta Series:</span>
              <span className="text-purple-300 font-mono text-[10px]">Θ_Λ24 = 1 + 196560q⁴ + ...</span>
            </div>
          </div>
        </div>
      </div>

      {/* 24-Dimensional Leech Lattice Coordinate Map */}
      <div className="bg-[#101018] border border-[#252532] p-5 rounded-lg space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Crosshair size={16} className="text-[#D4AF37]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              24-Dimensional Leech Quantization Grid
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Parity Filter:</span>
            <button
              onClick={() => setActiveDimensionFilter('ALL')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                activeDimensionFilter === 'ALL' ? 'bg-[#D4AF37] text-black font-bold' : 'bg-[#181824] text-gray-300'
              }`}
            >
              ALL (24D)
            </button>
            <button
              onClick={() => setActiveDimensionFilter('EVEN')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                activeDimensionFilter === 'EVEN' ? 'bg-[#D4AF37] text-black font-bold' : 'bg-[#181824] text-gray-300'
              }`}
            >
              EVEN
            </button>
            <button
              onClick={() => setActiveDimensionFilter('ODD')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                activeDimensionFilter === 'ODD' ? 'bg-[#D4AF37] text-black font-bold' : 'bg-[#181824] text-gray-300'
              }`}
            >
              ODD
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
          {filteredVectors.map((vec) => (
            <div
              key={vec.dimension}
              className={`p-2 rounded border text-xs font-mono transition-all hover:border-[#D4AF37] ${
                vec.orbitState === 'RESONANT'
                  ? 'bg-[#1A1828] border-purple-500/40 text-purple-200'
                  : (vec.parity === 'EVEN' ? 'bg-[#12121A] border-[#252535] text-gray-300' : 'bg-[#0E141E] border-[#203045] text-blue-200')
              }`}
            >
              <div className="flex justify-between items-center text-[10px] mb-1">
                <span className="text-gray-400 font-bold">D{vec.dimension}</span>
                <span className={`px-1 rounded text-[9px] ${vec.parity === 'EVEN' ? 'bg-gray-800 text-gray-300' : 'bg-blue-900/60 text-blue-300'}`}>
                  {vec.parity}
                </span>
              </div>
              <div className="font-bold text-white text-[11px]">Coord: {vec.coordinate}</div>
              <div className="text-[10px] text-[#D4AF37]">W: {vec.quantizedWeight}</div>
              <div className="text-[9px] text-gray-500 truncate mt-0.5">Orbit: {vec.orbitState}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Iteration History & AST Self-Healing Code Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Iteration Timeline List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <RotateCw size={15} className="text-[#D4AF37]" /> For-Loop Iteration Passes
          </h3>

          <div className="space-y-2">
            {state.history.map((record) => {
              const isSelected = selectedIteration?.iterationIndex === record.iterationIndex;
              return (
                <div
                  key={record.iterationIndex}
                  onClick={() => setSelectedIteration(record)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#1A1A26] border-[#D4AF37] shadow-lg'
                      : 'bg-[#101016] border-[#252532] hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">
                        Pass #{record.iterationIndex}: {record.phase}
                      </span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      record.status === 'VERIFIED_CONVERGED'
                        ? 'bg-green-950 text-green-400 border border-green-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {record.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-400 truncate mb-1">
                    {record.promptTask}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                    <span>Maker: <strong className="text-gray-300">{record.makerAgent}</strong></span>
                    <span>ε Delta: <strong className="text-[#D4AF37]">{record.epsilonDelta}</strong></span>
                    <span>Confidence: <strong className="text-green-400">{record.confidenceScore}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Iteration Code & Self-Healing Diagnostic Panel */}
        <div className="lg:col-span-7 bg-[#12121A] border border-[#252532] p-5 rounded-lg space-y-4">
          {selectedIteration ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-[#252532]">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCode size={15} className="text-[#D4AF37]" />
                    Pass #{selectedIteration.iterationIndex} Code & AST Diagnostic
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Audited by {selectedIteration.checkerAgent} • Latency: 1.2ms
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(selectedIteration.codeGeneratedSnippet, `code_${selectedIteration.iterationIndex}`)}
                  className="bg-[#1A1A24] hover:bg-[#252535] text-gray-300 px-2.5 py-1.5 rounded text-xs flex items-center gap-1 border border-[#303040]"
                >
                  {copiedCode === `code_${selectedIteration.iterationIndex}` ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  <span>{copiedCode === `code_${selectedIteration.iterationIndex}` ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Diagnostic Box */}
              <div className="bg-[#0A0A0F] border border-[#2A2A38] p-3 rounded text-xs font-mono space-y-1">
                <div className="text-gray-400 flex items-center gap-1.5 font-bold">
                  <Terminal size={12} className="text-blue-400" /> Diagnostic Verdict:
                </div>
                <div className="text-gray-300 leading-relaxed pl-4">
                  {selectedIteration.compilerDiagnostic}
                </div>
              </div>

              {/* Code Snippet */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-gray-300">Generated Kinetic Output:</div>
                <pre className="bg-[#08080C] p-3.5 rounded border border-[#20202E] text-xs font-mono text-green-300 overflow-x-auto max-h-56 leading-relaxed">
                  {selectedIteration.codeGeneratedSnippet}
                </pre>
              </div>

              {/* Auto-Heal Patch (if present) */}
              {selectedIteration.autoHealPatchSnippet && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-[#D4AF37] flex items-center gap-1">
                    <Zap size={12} /> Merlin's Self-Healing AST Patch:
                  </div>
                  <pre className="bg-[#121018] p-3 rounded border border-[#D4AF37]/30 text-xs font-mono text-[#D4AF37] overflow-x-auto max-h-40">
                    {selectedIteration.autoHealPatchSnippet}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-gray-500 text-xs">
              Select an iteration pass to view the AST diff and self-healing patch.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
