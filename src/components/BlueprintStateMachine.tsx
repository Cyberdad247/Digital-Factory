import React, { useState, useEffect } from 'react';
import {
  BlueprintArtifactBundle,
  BlueprintOSState,
  BlueprintLifecycleStatus,
  TaskDAGNode
} from '../types';
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  Terminal,
  Lock,
  GitBranch,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  FastForward,
  Flame,
  ArrowRight,
  Shield,
  FileCheck,
  FileCode2,
  Workflow,
  Copy,
  Check,
  Server,
  Key,
  Database,
  Hash,
  Eye,
  RefreshCw,
  Clock,
  RotateCcw,
  Zap,
  FileText,
  Binary,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Activity
} from 'lucide-react';

interface BlueprintStateMachineProps {
  onNotify?: (message: string, type: 'success' | 'warning') => void;
  compact?: boolean;
  onOpenFullOS?: () => void;
}

export interface StateMachineStageDef {
  id: string;
  statusKey: BlueprintLifecycleStatus;
  label: string;
  phase: 'INTENT_SPEC' | 'AUTHORIZATION' | 'IMPLEMENTATION' | 'RECEIPT';
  phaseLabel: string;
  icon: string;
  color: string;
  description: string;
  contractSchema: string;
  governingAuthority: string;
}

export const LIFECYCLE_STAGES: StateMachineStageDef[] = [
  {
    id: 'intent',
    statusKey: 'INTENT_RECEIVED',
    label: 'Intent Ingestion',
    phase: 'INTENT_SPEC',
    phaseLabel: '1. Intent & Spec',
    icon: '🎯',
    color: 'from-amber-500 to-yellow-500',
    description: 'Raw human/agent task intent parsed and mapped to tenant scope.',
    contractSchema: 'camelot.blueprint-intent/1',
    governingAuthority: 'Human Operator / Orchestrator'
  },
  {
    id: 'constitution',
    statusKey: 'CONSTITUTION_SELECTED',
    label: 'Constitution Bound',
    phase: 'INTENT_SPEC',
    phaseLabel: '1. Intent & Spec',
    icon: '📜',
    color: 'from-amber-600 to-amber-400',
    description: 'Binds non-negotiables, runtime allowlist, and memory ceilings (512MB).',
    contractSchema: 'camelot.blueprint-constitution/1',
    governingAuthority: 'Blueprint OS (Contract Authority)'
  },
  {
    id: 'spec',
    statusKey: 'SPEC_COMPILED',
    label: 'Feature Spec',
    phase: 'INTENT_SPEC',
    phaseLabel: '1. Intent & Spec',
    icon: '📐',
    color: 'from-yellow-500 to-amber-300',
    description: 'Synthesizes Goals, Non-Goals, Functional Requirements (FR-001), and Acceptance Criteria.',
    contractSchema: 'camelot.feature-specification/1',
    governingAuthority: 'Blueprint OS'
  },
  {
    id: 'clarify',
    statusKey: 'CLARIFICATION_REQUIRED',
    label: 'Clarification Gate',
    phase: 'INTENT_SPEC',
    phaseLabel: '1. Intent & Spec',
    icon: '❓',
    color: 'from-orange-500 to-amber-500',
    description: 'Resolves ambiguous prompt edge cases before committing execution resources.',
    contractSchema: 'camelot.clarification-gate/1',
    governingAuthority: 'Operator / Prompt Boundary'
  },
  {
    id: 'plan',
    statusKey: 'PLAN_GENERATED',
    label: 'Implementation Plan',
    phase: 'INTENT_SPEC',
    phaseLabel: '1. Intent & Spec',
    icon: '🗺️',
    color: 'from-sky-500 to-cyan-400',
    description: 'Formal Architecture Decisions (ADRs), module impact matrix, and rollback triggers.',
    contractSchema: 'camelot.implementation-plan/1',
    governingAuthority: 'Blueprint OS'
  },
  {
    id: 'dag',
    statusKey: 'DAG_TASKIFIED',
    label: 'Merlin Task DAG',
    phase: 'INTENT_SPEC',
    phaseLabel: '1. Intent & Spec',
    icon: '🕸️',
    color: 'from-cyan-500 to-blue-500',
    description: 'Dispatches typed task nodes to Sir-Ant, Sir-Owl, Sir-Forge, and Boris.',
    contractSchema: 'camelot.task-dag/1',
    governingAuthority: 'Merlin (Scheduling Authority)'
  },
  {
    id: 'manifest',
    statusKey: 'MANIFEST_FROZEN',
    label: 'Manifest Frozen',
    phase: 'AUTHORIZATION',
    phaseLabel: '2. Authorization',
    icon: '🧊',
    color: 'from-blue-500 to-indigo-500',
    description: 'Computes sha256 digests over all planned file creations, edits, and deletions.',
    contractSchema: 'camelot.effect-manifest/1',
    governingAuthority: 'Blueprint OS'
  },
  {
    id: 'policy',
    statusKey: 'POLICY_EVALUATED',
    label: 'Sentinel Policy',
    phase: 'AUTHORIZATION',
    phaseLabel: '2. Authorization',
    icon: '🛡️',
    color: 'from-indigo-500 to-purple-500',
    description: 'Zero-trust evaluation against tenant rules, authority epoch (43), and role scopes.',
    contractSchema: 'camelot.policy-decision/1',
    governingAuthority: 'Sentinel (Policy Authority)'
  },
  {
    id: 'vfs_preflight',
    statusKey: 'VFS_PREFLIGHT_PASSED',
    label: 'VFS Sandbox Preflight',
    phase: 'AUTHORIZATION',
    phaseLabel: '2. Authorization',
    icon: '📦',
    color: 'from-purple-500 to-pink-500',
    description: 'Generates Tier 0–3 bwrap namespace profile with read-only root and isolated worktree.',
    contractSchema: 'camelot.vfs-attestation/1',
    governingAuthority: 'VFS Guardian (Sandbox Authority)'
  },
  {
    id: 'lease',
    statusKey: 'LEASE_ISSUED',
    label: 'Capability Lease',
    phase: 'AUTHORIZATION',
    phaseLabel: '2. Authorization',
    icon: '🔑',
    color: 'from-emerald-500 to-teal-400',
    description: 'Issues cryptographic lease (LEAS-xxxx) bound to authority epoch & manifest hash.',
    contractSchema: 'camelot.capability-lease/1',
    governingAuthority: 'Sentinel'
  },
  {
    id: 'execution',
    statusKey: 'BOUNDED_EXECUTION',
    label: 'Implementation Run',
    phase: 'IMPLEMENTATION',
    phaseLabel: '3. Implementation',
    icon: '⚡',
    color: 'from-amber-400 to-emerald-400',
    description: 'Agents perform code changes exclusively inside isolated ephemeral worktree.',
    contractSchema: 'camelot.execution-telemetry/1',
    governingAuthority: 'Merlin & Agent Runners'
  },
  {
    id: 'gideon',
    statusKey: 'GIDEON_VERIFIED',
    label: 'Gideon Verdict',
    phase: 'IMPLEMENTATION',
    phaseLabel: '3. Implementation',
    icon: '⚖️',
    color: 'from-emerald-400 to-green-500',
    description: 'Independent test runners (Boris) and Socrates Z3 cross-tenant invariant solver.',
    contractSchema: 'camelot.gideon-verdict/1',
    governingAuthority: 'Gideon (Verification Authority)'
  },
  {
    id: 'approval',
    statusKey: 'APPROVAL_REQUIRED',
    label: 'Operator Promotion Gate',
    phase: 'RECEIPT',
    phaseLabel: '4. Promotion & Receipt',
    icon: '👑',
    color: 'from-amber-400 to-yellow-300',
    description: 'Human approval gate requiring exact frozen manifest hash match.',
    contractSchema: 'camelot.approval-request/1',
    governingAuthority: 'Promotion Controller / Operator'
  },
  {
    id: 'receipt',
    statusKey: 'PROMOTED_COMMITTED',
    label: 'Immutable Proof Receipt',
    phase: 'RECEIPT',
    phaseLabel: '4. Promotion & Receipt',
    icon: '🧾',
    color: 'from-yellow-400 via-amber-300 to-emerald-400',
    description: 'Cryptographically signed audit receipt anchored into immutable Hydra Ledger.',
    contractSchema: 'camelot.receipt/1',
    governingAuthority: 'Camelot Sovereign Ledger'
  }
];

const PRESET_TASKS = [
  {
    id: 'task-receipt-filter',
    title: 'Tenant Receipt Filter & Isolation',
    intent: 'Implement tenant-scoped receipt filtering and pagination with strict cross-tenant isolation in Hydra Ledger.',
    constitution: 'const_engineering_v1',
    classification: 'internal' as const,
    risk: 'medium' as const,
    targetAgent: 'Sir-Ant & Sir-Forge',
    icon: '🧾'
  },
  {
    id: 'task-leech-lattice',
    title: '24D Leech Lattice Quantizer',
    intent: 'Synthesize high-speed 24-dimensional Leech Lattice vector indexing kernel on ARM64 Wasmtime runtime.',
    constitution: 'const_engineering_v1',
    classification: 'restricted' as const,
    risk: 'high' as const,
    targetAgent: 'Sir-Forge & Boris',
    icon: '⚡'
  },
  {
    id: 'task-sentinel-lease',
    title: 'Zero-Trust Sentinel Lease Enforcer',
    intent: 'Deploy epoch-bound capability lease validator with bwrap container path escape prevention.',
    constitution: 'const_engineering_v1',
    classification: 'confidential' as const,
    risk: 'critical' as const,
    targetAgent: 'Gideon & Sentinel',
    icon: '🛡️'
  }
];

export const BlueprintStateMachine: React.FC<BlueprintStateMachineProps> = ({
  onNotify,
  compact = false,
  onOpenFullOS
}) => {
  const [osState, setOsState] = useState<BlueprintOSState | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>('intent');
  const [activeTaskIndex, setActiveTaskIndex] = useState<number>(0);
  const [customIntent, setCustomIntent] = useState('');
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    fetchState();
  }, []);

  const fetchState = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/blueprints/state');
      if (res.ok) {
        const data = await res.json();
        setOsState(data);
      }
    } catch (err) {
      console.error('Failed to load blueprint state:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeBundle: BlueprintArtifactBundle | null = osState?.activeBlueprint || null;
  const currentStatus = activeBundle?.status || 'INTENT_RECEIVED';

  // Determine stage progression index (0 to 13)
  const currentStageIndex = LIFECYCLE_STAGES.findIndex(s => s.statusKey === currentStatus);
  const effectiveStageIndex = currentStageIndex >= 0 ? currentStageIndex : 0;

  // Auto-play state machine runner
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlaying && activeBundle) {
      if (currentStatus === 'PROMOTED_COMMITTED') {
        setIsAutoPlaying(false);
        if (onNotify) onNotify('Blueprint state machine reached final Immutable Proof Receipt!', 'success');
      } else {
        timer = setTimeout(() => {
          handleAdvanceStep();
        }, 1200);
      }
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, currentStatus, activeBundle]);

  const handleAdvanceStep = async () => {
    if (!activeBundle) {
      await handleStartPreset(PRESET_TASKS[0]);
      return;
    }

    const bpId = activeBundle.blueprint_id;
    try {
      setLoading(true);
      let endpoint = '';
      let body: any = undefined;

      switch (currentStatus) {
        case 'INTENT_RECEIVED':
        case 'CONSTITUTION_SELECTED':
        case 'SPEC_COMPILED':
          endpoint = `/api/blueprints/${bpId}/clarify`;
          body = { responses: {} };
          break;
        case 'CLARIFICATION_REQUIRED':
        case 'PLAN_GENERATED':
        case 'DAG_TASKIFIED':
        case 'MANIFEST_FROZEN':
          endpoint = `/api/blueprints/${bpId}/preflight`;
          break;
        case 'POLICY_EVALUATED':
        case 'VFS_PREFLIGHT_PASSED':
          endpoint = `/api/blueprints/${bpId}/lease`;
          break;
        case 'LEASE_ISSUED':
          endpoint = `/api/blueprints/${bpId}/execute`;
          break;
        case 'BOUNDED_EXECUTION':
          endpoint = `/api/blueprints/${bpId}/verify`;
          break;
        case 'GIDEON_VERIFIED':
        case 'APPROVAL_REQUIRED':
          endpoint = `/api/blueprints/${bpId}/promote`;
          body = { operator_id: 'operator_titan_forge' };
          break;
        default:
          endpoint = `/api/blueprints/${bpId}/fast-forward`;
          break;
      }

      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined
        });
        if (res.ok) {
          await fetchState();
        }
      }
    } catch (err) {
      console.error('Error advancing state machine:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFastForward = async () => {
    if (!activeBundle) {
      await handleStartPreset(PRESET_TASKS[0]);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/blueprints/${activeBundle.blueprint_id}/fast-forward`, {
        method: 'POST'
      });
      if (res.ok) {
        await fetchState();
        if (onNotify) onNotify('Blueprint state machine fast-forwarded to Proof Receipt (PROMOTED_COMMITTED)!', 'success');
      }
    } catch (err) {
      console.error('Error fast-forwarding blueprint:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPreset = async (preset: typeof PRESET_TASKS[0]) => {
    try {
      setLoading(true);
      const res = await fetch('/api/blueprints/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: 'tenant_omega_01',
          workspace_id: 'engineering',
          intent: preset.intent,
          constitution_ref: preset.constitution,
          data_classification: preset.classification
        })
      });
      if (res.ok) {
        await fetchState();
        if (onNotify) onNotify(`Initiated Blueprint lifecycle for: ${preset.title}`, 'success');
      }
    } catch (err) {
      console.error('Error compiling preset blueprint:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCustom = async () => {
    if (!customIntent.trim()) return;
    try {
      setLoading(true);
      const res = await fetch('/api/blueprints/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: 'tenant_omega_01',
          workspace_id: 'engineering',
          intent: customIntent,
          constitution_ref: 'const_engineering_v1',
          data_classification: 'internal'
        })
      });
      if (res.ok) {
        setCustomIntent('');
        await fetchState();
        if (onNotify) onNotify('Custom agent task compiled into Blueprint State Machine!', 'success');
      }
    } catch (err) {
      console.error('Error starting custom blueprint:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const selectedStage = LIFECYCLE_STAGES.find(s => s.id === selectedStageId) || LIFECYCLE_STAGES[0];
  const selectedStageIdx = LIFECYCLE_STAGES.findIndex(s => s.id === selectedStageId);

  // Determine stage status relative to active bundle
  const getStageState = (idx: number): 'COMPLETED' | 'ACTIVE' | 'PENDING' => {
    if (effectiveStageIndex === LIFECYCLE_STAGES.length - 1 && currentStatus === 'PROMOTED_COMMITTED') {
      return 'COMPLETED';
    }
    if (idx < effectiveStageIndex) return 'COMPLETED';
    if (idx === effectiveStageIndex) return 'ACTIVE';
    return 'PENDING';
  };

  return (
    <div className="bg-[#0D0D14] border border-[#252538] hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl transition-all space-y-4">
      
      {/* HEADER BAR: Task Lifecycle State Machine */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 pb-3 border-b border-[#1E1E2E]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
            <Workflow size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                Blueprint OS Visual State Machine
              </h3>
              <span className="text-[9px] bg-amber-950 text-amber-300 font-mono font-bold px-2 py-0.5 rounded border border-amber-800/50">
                14-STAGE SOVEREIGN DAG
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Tracking active agent lifecycle from <strong className="text-amber-300 font-mono">Intent</strong> $\rightarrow$ <strong className="text-sky-300 font-mono">Merlin DAG & Leases</strong> $\rightarrow$ <strong className="text-emerald-300 font-mono">Receipt</strong>.
            </p>
          </div>
        </div>

        {/* State Machine Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Step Button */}
          <button
            onClick={handleAdvanceStep}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-[#1C1C2B] hover:bg-[#252538] border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow hover:scale-[1.02] disabled:opacity-50"
            title="Advance exactly one stage in the lifecycle"
          >
            <Play size={13} className={loading ? 'animate-spin' : ''} />
            <span>Step Advance</span>
          </button>

          {/* Auto-Play Runner */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow ${
              isAutoPlaying
                ? 'bg-amber-500 text-black border-amber-400 animate-pulse font-black'
                : 'bg-[#141420] text-gray-300 border-[#2A2A3E] hover:text-white hover:border-amber-400'
            }`}
            title="Automatically run through all pipeline stages"
          >
            <Activity size={13} />
            <span>{isAutoPlaying ? 'Running Auto...' : 'Auto-Run'}</span>
          </button>

          {/* Fast-Forward */}
          <button
            onClick={handleFastForward}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
            title="Fast forward directly to proof receipt"
          >
            <FastForward size={13} />
            <span>Fast Forward</span>
          </button>

          {/* Reset / Re-sync */}
          <button
            onClick={fetchState}
            disabled={loading}
            className="p-1.5 rounded-xl bg-[#141420] hover:bg-[#1E1E2E] border border-[#2A2A3E] text-gray-400 hover:text-white transition-colors"
            title="Refresh State"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          {onOpenFullOS && (
            <button
              onClick={onOpenFullOS}
              className="px-2.5 py-1.5 rounded-xl bg-sky-950/60 hover:bg-sky-900 border border-sky-800/60 text-sky-300 text-xs font-bold flex items-center gap-1 transition-all"
              title="Open Full Blueprint OS Studio"
            >
              <ExternalLink size={12} />
              <span>Full OS Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE TASK & PRESET SELECTOR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-[#11111B] p-3 rounded-xl border border-[#1E1E2E]">
        <div className="md:col-span-8 flex flex-col justify-center space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
              Active Task Intent:
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
              currentStatus === 'PROMOTED_COMMITTED'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {currentStatus}
            </span>
            {activeBundle && (
              <span className="text-[10px] text-gray-500 font-mono">
                ID: {activeBundle.blueprint_id}
              </span>
            )}
          </div>
          <p className="text-xs text-white font-medium line-clamp-1">
            {activeBundle?.intent || 'No active task compiled. Select a template or write an intent below.'}
          </p>
        </div>

        {/* Preset Task Switcher */}
        <div className="md:col-span-4 flex items-center justify-end gap-1.5">
          {PRESET_TASKS.map((preset, idx) => (
            <button
              key={preset.id}
              onClick={() => {
                setActiveTaskIndex(idx);
                handleStartPreset(preset);
              }}
              className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                activeTaskIndex === idx
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                  : 'bg-[#151522] border-[#252538] text-gray-400 hover:text-white hover:border-gray-500'
              }`}
              title={preset.title}
            >
              <span>{preset.icon}</span>
              <span className="hidden sm:inline text-[11px]">{preset.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          THE VISUAL STATE MACHINE GRAPH (Interactive 14-Stage Stepper & Path View)
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
          <span className="flex items-center gap-1.5 text-gray-300 font-bold">
            <Layers size={13} className="text-amber-400" />
            <span>Pipeline Progression Track ({effectiveStageIndex + 1} / {LIFECYCLE_STAGES.length})</span>
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Verified</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> Active Gate</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2A2A3E]"></span> Pending</span>
          </div>
        </div>

        {/* HORIZONTAL TIMELINE GRAPH WITH RESPONSIVE SCROLL */}
        <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-500/20">
          <div className="min-w-[880px] flex items-center justify-between relative py-3 px-2">
            
            {/* Connecting Track Line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-[#1A1A28] rounded-full z-0">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm shadow-amber-500/30"
                style={{
                  width: `${(effectiveStageIndex / (LIFECYCLE_STAGES.length - 1)) * 100}%`
                }}
              ></div>
            </div>

            {/* Stage Nodes */}
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const state = getStageState(idx);
              const isSelected = selectedStageId === stage.id;
              
              return (
                <div
                  key={stage.id}
                  onClick={() => setSelectedStageId(stage.id)}
                  className="flex flex-col items-center relative z-10 cursor-pointer group"
                >
                  {/* Node Circle */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-md ${
                      isSelected
                        ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0D0D14] scale-110'
                        : ''
                    } ${
                      state === 'COMPLETED'
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-black border border-emerald-300 shadow-emerald-500/20'
                        : state === 'ACTIVE'
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-black border-2 border-yellow-200 animate-bounce shadow-amber-500/40'
                        : 'bg-[#151522] text-gray-500 border border-[#2A2A3E] hover:border-gray-500 hover:text-gray-300'
                    }`}
                    title={`${stage.label} (${stage.contractSchema})`}
                  >
                    {state === 'COMPLETED' ? (
                      <Check size={16} className="text-black stroke-[3]" />
                    ) : (
                      <span>{stage.icon}</span>
                    )}
                  </div>

                  {/* Stage Label */}
                  <div className="text-center mt-1.5 w-16">
                    <span
                      className={`text-[9px] font-black uppercase tracking-tight block truncate ${
                        state === 'ACTIVE'
                          ? 'text-amber-300 font-bold'
                          : state === 'COMPLETED'
                          ? 'text-emerald-400'
                          : 'text-gray-500 group-hover:text-gray-300'
                      }`}
                    >
                      {stage.label.split(' ')[0]}
                    </span>
                    <span className="text-[8px] font-mono text-gray-600 block">
                      #{idx + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE STAGE INSPECTOR & LIVE CONTRACT TELEMETRY
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-[#11111A] border border-[#222234] rounded-xl p-4">
        
        {/* Left Col: Stage Metadata & Operating Contract Summary */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E1E2E] pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedStage.icon}</span>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white">
                  {selectedStage.label}
                </h4>
                <span className="text-[10px] text-amber-400 font-mono">
                  {selectedStage.phaseLabel}
                </span>
              </div>
            </div>

            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
              getStageState(selectedStageIdx) === 'COMPLETED'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : getStageState(selectedStageIdx) === 'ACTIVE'
                ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                : 'bg-[#181826] text-gray-500 border border-[#27273A]'
            }`}>
              {getStageState(selectedStageIdx)}
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            {selectedStage.description}
          </p>

          <div className="space-y-1.5 text-[11px] font-mono bg-[#0D0D14] p-3 rounded-lg border border-[#1F1F30]">
            <div className="flex justify-between">
              <span className="text-gray-500">Contract Schema:</span>
              <span className="text-amber-300 font-bold">{selectedStage.contractSchema}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Authority Split:</span>
              <span className="text-sky-300">{selectedStage.governingAuthority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Execution Phase:</span>
              <span className="text-emerald-400">{selectedStage.phase}</span>
            </div>
          </div>

          {/* Quick Stage Jump Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                const prev = Math.max(0, selectedStageIdx - 1);
                setSelectedStageId(LIFECYCLE_STAGES[prev].id);
              }}
              disabled={selectedStageIdx === 0}
              className="flex-1 py-1 px-2 rounded-lg bg-[#181826] hover:bg-[#202032] border border-[#2A2A3E] text-xs font-bold text-gray-300 disabled:opacity-30"
            >
              ← Previous Stage
            </button>
            <button
              onClick={() => {
                const next = Math.min(LIFECYCLE_STAGES.length - 1, selectedStageIdx + 1);
                setSelectedStageId(LIFECYCLE_STAGES[next].id);
              }}
              disabled={selectedStageIdx === LIFECYCLE_STAGES.length - 1}
              className="flex-1 py-1 px-2 rounded-lg bg-[#181826] hover:bg-[#202032] border border-[#2A2A3E] text-xs font-bold text-gray-300 disabled:opacity-30"
            >
              Next Stage →
            </button>
          </div>
        </div>

        {/* Right Col: Live Generated Contract Payload / AST Inspector */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileCode2 size={13} className="text-amber-400" />
              <span>Live Artifact Inspector ({selectedStage.contractSchema})</span>
            </span>

            <button
              onClick={() => handleCopy(
                JSON.stringify(getStagePayload(selectedStage.id, activeBundle), null, 2),
                selectedStage.id
              )}
              className="text-[10px] font-mono text-gray-400 hover:text-amber-300 flex items-center gap-1 bg-[#161622] px-2 py-0.5 rounded border border-[#252538]"
            >
              {copiedText === selectedStage.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              <span>{copiedText === selectedStage.id ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          <div className="bg-[#0A0A10] border border-[#1E1E2E] rounded-lg p-3 font-mono text-[11px] text-gray-300 h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
            <pre className="text-amber-200/90 whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(getStagePayload(selectedStage.id, activeBundle), null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* CUSTOM INTENT INPUT BAR */}
      {!compact && (
        <div className="pt-2 border-t border-[#1C1C2B] flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={customIntent}
              onChange={(e) => setCustomIntent(e.target.value)}
              placeholder="Or compile a custom agent task intent into the Blueprint State Machine..."
              className="w-full bg-[#11111A] border border-[#252538] focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 font-mono outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleStartCustom()}
            />
          </div>
          <button
            onClick={handleStartCustom}
            disabled={!customIntent.trim() || loading}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow disabled:opacity-40"
          >
            <Sparkles size={13} />
            <span>Compile & Track</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Helper: Extract JSON payload for the selected stage from active bundle
function getStagePayload(stageId: string, bundle: BlueprintArtifactBundle | null): any {
  if (!bundle) {
    return {
      status: 'AWAITING_COMPILATION',
      message: 'No blueprint bundle active. Click "Step Advance" or a preset to compile.'
    };
  }

  switch (stageId) {
    case 'intent':
      return {
        blueprint_id: bundle.blueprint_id,
        tenant_id: bundle.tenant_id,
        workspace_id: bundle.workspace_id,
        intent: bundle.intent,
        status: bundle.status,
        created_at: bundle.created_at
      };
    case 'constitution':
      return bundle.constitution;
    case 'spec':
      return bundle.spec;
    case 'clarify':
      return {
        clarifications_total: bundle.clarifications.length,
        status: bundle.clarifications.every(c => c.status === 'RESOLVED') ? 'ALL_RESOLVED' : 'GATES_PENDING',
        items: bundle.clarifications
      };
    case 'plan':
      return bundle.plan;
    case 'dag':
      return bundle.dag;
    case 'manifest':
      return bundle.manifest;
    case 'policy':
      return bundle.policyDecision || {
        schema_version: 'camelot.policy-decision/1',
        result: 'pending_evaluation',
        authority_epoch: 43
      };
    case 'vfs_preflight':
      return bundle.vfsAttestation || bundle.sandboxRequest || {
        status: 'PREFLIGHT_PENDING'
      };
    case 'lease':
      return bundle.lease || {
        schema_version: 'camelot.capability-lease/1',
        status: 'PENDING_ISSUANCE'
      };
    case 'execution':
      return {
        target_worktree: bundle.vfsAttestation?.workspace?.worktree_ref || 'worktree_ephemeral_01',
        active_processes: ['git', 'pnpm', 'node', 'test-runner'],
        network_isolation: 'DISABLED_AIR_GAPPED',
        status: bundle.status
      };
    case 'gideon':
      return bundle.gideonVerdict || {
        schema_version: 'camelot.gideon-verdict/1',
        verdict: 'PENDING_VERIFICATION'
      };
    case 'approval':
      return bundle.approvalRequest || {
        schema_version: 'camelot.approval-request/1',
        decision: { status: 'pending' }
      };
    case 'receipt':
      return bundle.receipt || {
        schema_version: 'camelot.receipt/1',
        status: 'AWAITING_FINAL_PROMOTION'
      };
    default:
      return bundle;
  }
}
