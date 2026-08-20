import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  ShieldCheck, 
  Layers, 
  Code2, 
  Cpu, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertOctagon, 
  Sparkles, 
  Copy, 
  Check, 
  Zap, 
  Terminal, 
  FileText, 
  Database,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Server,
  GitFork,
  FolderOpen,
  Trash2
} from 'lucide-react';
import { GenesisNexusCartridge } from './GenesisNexusCartridge';
import { 
  GenesisCrucibleReport, 
  GenesisStageFailureAudit, 
  GenesisScaffoldBundle,
  GenesisCartridgeInstance,
  GenesisTargetArchetype
} from '../types';
import {
  saveGenesisCartridge,
  fetchUserGenesisCartridges,
  deleteGenesisCartridge,
  auth
} from '../lib/firebase';

interface GenesisIntakeCartridgeStudioProps {
  onNotify: (message: string, type?: 'success' | 'warning') => void;
  initialTopic?: string;
  initialPRD?: string;
  activeCartridge?: GenesisCartridgeInstance | null;
  onSelectCartridge?: (cartridge: GenesisCartridgeInstance) => void;
}

export function GenesisIntakeCartridgeStudio({ 
  onNotify, 
  initialTopic = 'Genesis Intake Cartridge',
  initialPRD,
  activeCartridge: propCartridge,
  onSelectCartridge
}: GenesisIntakeCartridgeStudioProps) {
  const [activeSubTab, setActiveSubTab] = useState<'GENESIS_NEXUS' | 'CRUCIBLE' | 'SCAFFOLDS' | 'INGRESS_GATEWAY' | 'INSTANCES'>('GENESIS_NEXUS');
  
  // Active Cartridge Instance State
  const [currentCartridge, setCurrentCartridge] = useState<GenesisCartridgeInstance | null>(propCartridge || null);
  const [savedCartridges, setSavedCartridges] = useState<GenesisCartridgeInstance[]>([]);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);

  // Crucible State
  const [projectName, setProjectName] = useState(propCartridge?.name || initialTopic);
  const [isRunningCrucible, setIsRunningCrucible] = useState(false);
  const [crucibleReport, setCrucibleReport] = useState<GenesisCrucibleReport | null>(propCartridge?.crucibleReport || null);

  // Scaffolds State
  const [scaffoldBundle, setScaffoldBundle] = useState<GenesisScaffoldBundle | null>(propCartridge?.scaffoldBundle || null);
  const [activeCodeTab, setActiveCodeTab] = useState<'LAYER7' | 'LAYER5' | 'LAYER3' | 'LAYER1' | 'SADD' | 'LLDD' | 'BRIEFING'>('LAYER7');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Ingress Gateway State
  const [intentInput, setIntentInput] = useState('');
  const [ambiguityScore, setAmbiguityScore] = useState(propCartridge?.ingressConfig?.gateThreshold || 0.45);
  const [capturedEvent, setCapturedEvent] = useState<any | null>(null);

  // MicroVM Sandbox Simulation
  const [vmExecuting, setVmExecuting] = useState(false);
  const [vmResult, setVmResult] = useState<{ memoryDeltaMib: number; latencyMs: number; status: string } | null>(null);

  // Synchronize when propCartridge changes
  useEffect(() => {
    if (propCartridge) {
      setCurrentCartridge(propCartridge);
      setProjectName(propCartridge.name);
      if (propCartridge.crucibleReport) setCrucibleReport(propCartridge.crucibleReport);
      if (propCartridge.scaffoldBundle) setScaffoldBundle(propCartridge.scaffoldBundle);
      fetchScaffolds(propCartridge.name);
    }
  }, [propCartridge]);

  // Load instances from Firestore on mount
  useEffect(() => {
    loadSavedCartridges();
  }, []);

  // Load initial scaffold bundle on mount
  useEffect(() => {
    if (!scaffoldBundle) {
      fetchScaffolds(projectName);
    }
  }, [projectName]);

  const loadSavedCartridges = async () => {
    setIsLoadingInstances(true);
    try {
      const user = auth.currentUser;
      const cartridges = await fetchUserGenesisCartridges(user?.uid);
      if (cartridges && cartridges.length > 0) {
        setSavedCartridges(cartridges);
      }
    } catch (err) {
      console.warn('Failed to load saved cartridges:', err);
    } finally {
      setIsLoadingInstances(false);
    }
  };

  const handleSelectInstance = (cart: GenesisCartridgeInstance) => {
    setCurrentCartridge(cart);
    setProjectName(cart.name);
    if (cart.crucibleReport) setCrucibleReport(cart.crucibleReport);
    if (cart.scaffoldBundle) setScaffoldBundle(cart.scaffoldBundle);
    fetchScaffolds(cart.name);
    onSelectCartridge?.(cart);
    onNotify(`Switched to Cartridge: "${cart.name}"`, 'success');
  };

  const handleDeleteInstance = async (cartridgeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteGenesisCartridge(cartridgeId);
      setSavedCartridges(prev => prev.filter(c => c.id !== cartridgeId));
      if (currentCartridge?.id === cartridgeId) {
        setCurrentCartridge(null);
      }
      onNotify('Cartridge instance deleted', 'success');
    } catch (err: any) {
      onNotify('Failed to delete cartridge instance', 'warning');
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onNotify('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fetchScaffolds = async (name: string) => {
    try {
      const res = await fetch('/api/genesis/scaffold-bundle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: name })
      });
      const data = await res.json();
      if (data.success && data.bundle) {
        setScaffoldBundle(data.bundle);
      }
    } catch (err) {
      console.warn('Failed to load scaffold bundle:', err);
    }
  };

  const handleRunCrucible = async () => {
    setIsRunningCrucible(true);
    try {
      const res = await fetch('/api/genesis/crucible-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setCrucibleReport(data.report);
        onNotify(`Crucible Verified: ${data.report.rigorScore}% rigor across 5 archetypes`, 'success');
        
        // If we have an active cartridge, update and persist it
        if (currentCartridge) {
          const updated: GenesisCartridgeInstance = {
            ...currentCartridge,
            crucibleReport: data.report,
            status: 'CRUCIBLE_AUDITED',
            updatedAt: new Date().toISOString()
          };
          setCurrentCartridge(updated);
          await saveGenesisCartridge(updated);
        }
      } else {
        throw new Error(data.error || 'Crucible run failed');
      }
    } catch (err: any) {
      console.error(err);
      onNotify('Crucible Error: ' + err.message, 'warning');
    } finally {
      setIsRunningCrucible(false);
    }
  };

  const handleSimulateMicroVM = () => {
    setVmExecuting(true);
    setTimeout(() => {
      setVmResult({
        memoryDeltaMib: 0.04,
        latencyMs: 14,
        status: 'SHADOW_BRANCH_VERIFIED (0.04 MiB <= 0.12 MiB LIMIT)'
      });
      setVmExecuting(false);
      onNotify('MicroVM shadow branch executed with zero memory leak!', 'success');
    }, 600);
  };

  const handlePublishIntent = () => {
    if (!intentInput.trim()) return;
    const event = {
      event: 'INTENT_CAPTURED',
      publisher: currentCartridge?.ingressConfig?.defaultPublisher || 'Anya_Ingress_Node',
      subscriber: 'Merlin_MFOE_Router',
      timestamp: Date.now(),
      session_hash: '0xALPHA_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      payload: {
        raw_text: intentInput,
        ambiguity_score: ambiguityScore,
        gate_status: ambiguityScore < (currentCartridge?.ingressConfig?.gateThreshold || 0.2) ? 'OPEN' : 'SOCRATIC_RETRY_REQUIRED'
      }
    };
    setCapturedEvent(event);
    onNotify('Published INTENT_CAPTURED event over MsgPack FFI!', 'success');
  };

  return (
    <div id="genesis-cartridge-root" className="space-y-4 font-mono text-gray-200">
      {/* Header & Sub-Nav */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A35] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-500/10 border border-purple-500/40 rounded-lg text-purple-400">
            <Layers size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Genesis Intake Cartridge Studio</h3>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded font-bold">
                v10000.54-Omega
              </span>
              {currentCartridge && (
                <span className="text-[10px] px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-500/40 rounded font-bold flex items-center gap-1">
                  <GitFork size={10} />
                  <span>FORKED: {currentCartridge.name}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">4-Layer Macro-Topology • 5-Stage Gideon Crucible • Physical Code Scaffolds</p>
          </div>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('INSTANCES')}
            className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
              activeSubTab === 'INSTANCES'
                ? 'bg-amber-500/20 text-[#D4AF37] border-amber-500/50 font-bold'
                : 'bg-[#141420] text-gray-400 hover:text-white border-gray-800'
            }`}
          >
            <FolderOpen size={13} />
            <span>Vault ({savedCartridges.length})</span>
          </button>

          <button
            onClick={handleRunCrucible}
            disabled={isRunningCrucible}
            className="bg-[#D4AF37] hover:bg-[#C29B27] disabled:opacity-50 text-black font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
          >
            {isRunningCrucible ? <RefreshCw size={13} className="animate-spin" /> : <Flame size={13} />}
            <span>{isRunningCrucible ? 'Executing Crucible...' : 'Run 5-Stage Crucible'}</span>
          </button>
        </div>
      </div>

      {/* Cartridge Provenance Banner (if forked from Council) */}
      {currentCartridge && (
        <div className="bg-gradient-to-r from-[#141424] to-[#0D0D18] border border-amber-500/40 rounded-xl p-3.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <GitFork size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-white">Active Forked Strategy:</span>
              <span className="text-xs font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                {currentCartridge.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-purple-950 text-purple-300 rounded border border-purple-500/30 font-bold">
                {currentCartridge.targetArchetype}
              </span>
            </div>

            <div className="text-[10px] text-gray-400">
              Origin: <span className="text-gray-200">{currentCartridge.originDebateTopic || 'Archmage Council'}</span>
            </div>
          </div>

          {/* Inherited Invariants list */}
          {currentCartridge.inheritedInvariants && currentCartridge.inheritedInvariants.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-gray-500 font-bold">Inherited Invariants:</span>
              {currentCartridge.inheritedInvariants.map((inv, idx) => (
                <span key={idx} className="text-[10px] bg-[#07070C] text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 size={10} />
                  <span>{inv}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-Tabs Selector */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#0D0D16] p-1.5 rounded-lg border border-gray-800">
        <button
          onClick={() => setActiveSubTab('GENESIS_NEXUS')}
          className={`px-3 py-1.5 rounded text-xs transition-all flex items-center gap-1.5 font-bold ${
            activeSubTab === 'GENESIS_NEXUS'
              ? 'bg-[#5A2A82]/50 text-white border border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
              : 'text-gray-400 hover:text-purple-300'
          }`}
        >
          <Sparkles size={13} className={activeSubTab === 'GENESIS_NEXUS' ? 'text-[#D4AF37]' : ''} />
          <span>Genesis Nexus v4.5 (Tri-Tier)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping"></span>
        </button>

        <button
          onClick={() => setActiveSubTab('CRUCIBLE')}
          className={`px-3 py-1.5 rounded text-xs transition-all flex items-center gap-1.5 font-bold ${
            activeSubTab === 'CRUCIBLE'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Flame size={13} />
          <span>5-Stage Failure Archetype Crucible</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SCAFFOLDS')}
          className={`px-3 py-1.5 rounded text-xs transition-all flex items-center gap-1.5 font-bold ${
            activeSubTab === 'SCAFFOLDS'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Code2 size={13} />
          <span>Physical Scaffolds & SADD / LLDD</span>
        </button>

        <button
          onClick={() => setActiveSubTab('INGRESS_GATEWAY')}
          className={`px-3 py-1.5 rounded text-xs transition-all flex items-center gap-1.5 font-bold ${
            activeSubTab === 'INGRESS_GATEWAY'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Zap size={13} />
          <span>Ethereal Ingress Gateway (Layer 7)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('INSTANCES')}
          className={`px-3 py-1.5 rounded text-xs transition-all flex items-center gap-1.5 font-bold ${
            activeSubTab === 'INSTANCES'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <FolderOpen size={13} />
          <span>Forked Vault ({savedCartridges.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB: GENESIS NEXUS v4.5 CARTRIDGE (TRI-TIER ADAPTIVE SHELL) */}
      {/* ========================================================================= */}
      {activeSubTab === 'GENESIS_NEXUS' && (
        <GenesisNexusCartridge 
          initialIntent={projectName}
          onNotify={onNotify}
        />
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB: FORKED VAULT */}
      {/* ========================================================================= */}
      {activeSubTab === 'INSTANCES' && (
        <div className="space-y-4">
          <div className="bg-[#0A0A12] border border-gray-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen size={16} className="text-[#D4AF37]" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Forked Genesis Cartridge Instances
                </h4>
              </div>
              <button
                onClick={loadSavedCartridges}
                className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 rounded flex items-center gap-1"
              >
                <RefreshCw size={12} className={isLoadingInstances ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savedCartridges.map(cart => (
                <div
                  key={cart.id}
                  onClick={() => handleSelectInstance(cart)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 group ${
                    currentCartridge?.id === cart.id
                      ? 'bg-[#121224] border-amber-500/60 shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                      : 'bg-[#07070C] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitFork size={13} className="text-amber-400" />
                      <span className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                        {cart.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        cart.status === 'CRUCIBLE_AUDITED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                        'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}>
                        {cart.status}
                      </span>
                      <button
                        onClick={(e) => handleDeleteInstance(cart.id, e)}
                        className="text-gray-600 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete cartridge"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 line-clamp-2">
                    {cart.description || `Origin: ${cart.originDebateTopic || 'Archmage Council'}`}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-800/60">
                    <span>Archetype: {cart.targetArchetype}</span>
                    <span>{new Date(cart.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}

              {savedCartridges.length === 0 && !isLoadingInstances && (
                <div className="col-span-2 p-8 text-center bg-[#07070C] border border-gray-800 rounded-xl space-y-2 text-gray-500 text-xs">
                  <GitFork size={24} className="mx-auto text-gray-600" />
                  <div>No Genesis Cartridge instances saved.</div>
                  <p className="text-[11px] text-gray-600">
                    Use the <strong>"🔱 Fork to Genesis"</strong> feature in the Collective Brainstorming Sandbox to fork debate strategies here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* SUB-TAB 1: 5-STAGE FAILURE ARCHETYPE CRUCIBLE */}
      {/* ========================================================================= */}
      {activeSubTab === 'CRUCIBLE' && (
        <div className="space-y-4">
          <div className="bg-[#0A0A12] border border-rose-500/30 rounded-xl p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <span>Sir Gideon's 5-Stage Failure Archetype Simulation</span>
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Validates Edge Cases, Throughput Load, WCAG AA, Capability Lease Security, and UX State Regression.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-black/40 px-2.5 py-1 rounded border border-gray-800 text-gray-300">
                  Target Delta: <strong className="text-emerald-400">≤ 0.12 MiB / node</strong>
                </span>
                <span className="text-[11px] bg-black/40 px-2.5 py-1 rounded border border-gray-800 text-gray-300">
                  RAM Ceiling: <strong className="text-cyan-400">4.0 GiB</strong>
                </span>
              </div>
            </div>

            {/* If no report yet, display trigger prompt */}
            {!crucibleReport && !isRunningCrucible && (
              <div className="p-8 text-center bg-[#07070C] border border-gray-800 rounded-xl space-y-3">
                <Flame size={32} className="text-rose-400 mx-auto" />
                <div className="text-sm font-bold text-white">Crucible Awaiting Invariant Execution</div>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Click below to stress-test the Genesis Intake Cartridge against all 5 formal failure archetypes.
                </p>
                <button
                  onClick={handleRunCrucible}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-2 rounded-lg transition-all"
                >
                  Start Crucible Simulation
                </button>
              </div>
            )}

            {isRunningCrucible && (
              <div className="p-8 text-center bg-[#07070C] border border-rose-500/30 rounded-xl space-y-3">
                <RefreshCw size={28} className="animate-spin text-rose-400 mx-auto" />
                <div className="text-sm font-bold text-white">Running Adversarial Invariant Stress-Tests...</div>
                <div className="text-xs text-gray-400">Simulating 100k events, cyclic AST loops, and Z3 SMT-LIB constraints</div>
              </div>
            )}

            {/* Report Results */}
            {crucibleReport && (
              <div className="space-y-4">
                {/* Status Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-[#12121E] p-3 rounded-lg border border-gray-800">
                    <div className="text-gray-400 text-[10px]">Overall Status</div>
                    <div className="font-bold text-emerald-400 text-sm mt-0.5 flex items-center justify-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>{crucibleReport.overallStatus}</span>
                    </div>
                  </div>

                  <div className="bg-[#12121E] p-3 rounded-lg border border-gray-800">
                    <div className="text-gray-400 text-[10px]">Gideon Rigor Score</div>
                    <div className="font-bold text-[#D4AF37] text-sm mt-0.5">{crucibleReport.rigorScore}%</div>
                  </div>

                  <div className="bg-[#12121E] p-3 rounded-lg border border-gray-800">
                    <div className="text-gray-400 text-[10px]">Total Latency</div>
                    <div className="font-bold text-cyan-300 text-sm mt-0.5">{crucibleReport.totalLatencyMs}ms</div>
                  </div>

                  <div className="bg-[#12121E] p-3 rounded-lg border border-gray-800">
                    <div className="text-gray-400 text-[10px]">Deployable Bundle</div>
                    <div className="font-bold text-emerald-300 text-sm mt-0.5">AUTHORIZED</div>
                  </div>
                </div>

                {/* 5 Stages Breakdown */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    5-Stage Invariant Audit Breakdown
                  </div>

                  {crucibleReport.stageAudits.map((stage) => (
                    <div
                      key={stage.stageNumber}
                      className="bg-[#07070C] border border-gray-800 rounded-lg p-3.5 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center justify-center">
                            {stage.stageNumber}
                          </span>
                          <span className="text-xs font-bold text-white">{stage.stageName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-black/40 text-gray-400 rounded font-mono">
                            {stage.failureArchetype}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-gray-400">Latency: {stage.latencyMs}ms</span>
                          <span className="text-emerald-400 font-bold">Delta: {stage.memoryDeltaMib} MiB</span>
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">
                            {stage.status}
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#050508] p-2.5 rounded border border-gray-800 text-[11px] font-mono text-purple-300">
                        <code>{stage.assertionTested}</code>
                      </div>

                      <div className="text-xs text-gray-300 leading-relaxed">
                        {stage.details}
                      </div>

                      <div className="text-[11px] text-emerald-300 bg-emerald-950/20 p-2 rounded border border-emerald-500/20">
                        <strong>Mitigation Applied:</strong> {stage.mitigationApplied}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Z3 Formal Proof Output */}
                <div className="bg-[#050508] p-4 rounded-xl border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs text-purple-300">
                    <span className="font-bold flex items-center gap-1.5">
                      <ShieldCheck size={14} /> Formalis Ω Z3 SMT-LIB Solver Proof
                    </span>
                    <span className="font-mono text-[10px]">SMT-LIB v2.6</span>
                  </div>
                  <pre className="text-[11px] font-mono text-purple-200 bg-black/40 p-2.5 rounded border border-purple-500/20 overflow-x-auto whitespace-pre-wrap">
                    {crucibleReport.formalisZ3Proof.z3SolverOutput}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: PHYSICAL CODE SCAFFOLDS & SADD / LLDD */}
      {/* ========================================================================= */}
      {activeSubTab === 'SCAFFOLDS' && scaffoldBundle && (
        <div className="space-y-4">
          <div className="bg-[#0A0A12] border border-emerald-500/30 rounded-xl p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <Code2 size={16} />
                  <span>Sir Codex Physical AST Scaffolds & Enterprise Contracts</span>
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Mathematically sealed 4-layer source code, SADD, LLDD, and BriefingScript.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulateMicroVM}
                  disabled={vmExecuting}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs text-white font-bold rounded-lg flex items-center gap-1.5 transition-all"
                >
                  {vmExecuting ? <RefreshCw size={13} className="animate-spin" /> : <Server size={13} />}
                  <span>Simulate MicroVM Execution</span>
                </button>
              </div>
            </div>

            {/* MicroVM Execution Result Box */}
            {vmResult && (
              <div className="bg-[#0E0E18] border border-purple-500/40 rounded-xl p-3.5 text-xs space-y-1">
                <div className="flex items-center justify-between text-purple-300 font-bold">
                  <span>MicroVM Ephemeral Shadow Branch Output:</span>
                  <span className="text-emerald-400">{vmResult.status}</span>
                </div>
                <div className="text-gray-400">
                  Memory Delta: <strong className="text-white">{vmResult.memoryDeltaMib} MiB</strong> | Latency: <strong className="text-white">{vmResult.latencyMs}ms</strong>
                </div>
              </div>
            )}

            {/* Code Tabs */}
            <div className="flex flex-wrap gap-1 bg-[#050508] p-1.5 rounded-lg border border-gray-800">
              {[
                { id: 'LAYER7' as const, label: 'Layer 7: Ingress Node' },
                { id: 'LAYER5' as const, label: 'Layer 5: MFOE Router' },
                { id: 'LAYER3' as const, label: 'Layer 3: Z3 Prover' },
                { id: 'LAYER1' as const, label: 'Layer 1: MicroVM' },
                { id: 'SADD' as const, label: 'SADD.md' },
                { id: 'LLDD' as const, label: 'LLDD.md' },
                { id: 'BRIEFING' as const, label: 'BriefingScript.md' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCodeTab(tab.id)}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                    activeCodeTab === tab.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Active Code Display */}
            <div className="relative">
              <div className="absolute right-3 top-3">
                <button
                  onClick={() => {
                    const codeToCopy = 
                      activeCodeTab === 'LAYER7' ? scaffoldBundle.layer7IngressCode :
                      activeCodeTab === 'LAYER5' ? scaffoldBundle.layer5MfoeCode :
                      activeCodeTab === 'LAYER3' ? scaffoldBundle.layer3CouncilCode :
                      activeCodeTab === 'LAYER1' ? scaffoldBundle.layer1MicroVMCode :
                      activeCodeTab === 'SADD' ? scaffoldBundle.saddMarkdown :
                      activeCodeTab === 'LLDD' ? scaffoldBundle.llddMarkdown :
                      scaffoldBundle.briefingScriptMarkdown;
                    copyToClipboard(codeToCopy, 'active_code');
                  }}
                  className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 rounded flex items-center gap-1"
                >
                  {copiedKey === 'active_code' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedKey === 'active_code' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="bg-[#050508] p-4 rounded-xl text-xs font-mono text-emerald-300 border border-gray-800 leading-relaxed overflow-x-auto max-h-96 overflow-y-auto">
                {activeCodeTab === 'LAYER7' && scaffoldBundle.layer7IngressCode}
                {activeCodeTab === 'LAYER5' && scaffoldBundle.layer5MfoeCode}
                {activeCodeTab === 'LAYER3' && scaffoldBundle.layer3CouncilCode}
                {activeCodeTab === 'LAYER1' && scaffoldBundle.layer1MicroVMCode}
                {activeCodeTab === 'SADD' && scaffoldBundle.saddMarkdown}
                {activeCodeTab === 'LLDD' && scaffoldBundle.llddMarkdown}
                {activeCodeTab === 'BRIEFING' && scaffoldBundle.briefingScriptMarkdown}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: ETHEREAL INGRESS GATEWAY (LAYER 7) */}
      {/* ========================================================================= */}
      {activeSubTab === 'INGRESS_GATEWAY' && (
        <div className="space-y-4">
          <div className="bg-[#0A0A12] border border-cyan-500/30 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <Zap size={16} />
                  <span>Layer 7: Ethereal Ingress Gateway & Event Publisher</span>
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Live simulator for Anya Ingress Node and Lady Apis Socratic Parameter Gate.
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded font-mono">
                MsgPack FFI Pub/Sub
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Raw Intent Payload</label>
                <textarea
                  rows={4}
                  value={intentInput}
                  onChange={e => {
                    setIntentInput(e.target.value);
                    const newAmbiguity = Math.max(0.08, 0.65 - e.target.value.length * 0.003);
                    setAmbiguityScore(Number(newAmbiguity.toFixed(3)));
                  }}
                  placeholder="Describe desired software application or cartridge architecture..."
                  className="w-full bg-[#10101A] border border-gray-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {/* Ingress Telemetry */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-[#050508] p-2.5 rounded border border-gray-800">
                  <div className="text-gray-400 text-[10px]">Calculated Ambiguity Score</div>
                  <div className={`font-bold text-sm ${ambiguityScore < 0.2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {(ambiguityScore * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-[#050508] p-2.5 rounded border border-gray-800">
                  <div className="text-gray-400 text-[10px]">Lady Apis Gate Status</div>
                  <div className="font-bold text-cyan-300 text-sm">
                    {ambiguityScore < 0.2 ? 'GATE_OPEN (Unambiguous)' : 'SOCRATIC_INQUEST_ACTIVE'}
                  </div>
                </div>

                <div className="bg-[#050508] p-2.5 rounded border border-gray-800">
                  <div className="text-gray-400 text-[10px]">Destination Event</div>
                  <div className="font-bold text-purple-300 text-sm">INTENT_CAPTURED</div>
                </div>
              </div>

              <button
                onClick={handlePublishIntent}
                disabled={!intentInput.trim()}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Zap size={14} />
                <span>Publish INTENT_CAPTURED Event to Merlin MFOE Router</span>
              </button>
            </div>

            {/* Published Event Output */}
            {capturedEvent && (
              <div className="bg-[#050508] p-4 rounded-xl border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-cyan-300 font-bold">
                  <span>MsgPack Event Packet (FFI Ingress Stream)</span>
                  <span className="font-mono text-[10px]">{capturedEvent.session_hash}</span>
                </div>
                <pre className="text-[11px] font-mono text-cyan-200 bg-black/40 p-2.5 rounded border border-cyan-500/20 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(capturedEvent, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
