import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  Terminal,
  Lock,
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
  Activity,
  Sliders,
  Box,
  Scale,
  Award,
  GitPullRequest
} from 'lucide-react';
import { BlueprintArtifactBundle, BlueprintOSState, BlueprintLifecycleStatus } from '../types';

export type TaskLifecyclePhaseId = 
  | 'INTENT'
  | 'SPECIFICATION'
  | 'PLANNING'
  | 'DAG'
  | 'SANDBOX'
  | 'VERIFICATION'
  | 'RECEIPT';

export interface TaskLifecyclePhaseConfig {
  id: TaskLifecyclePhaseId;
  stepNumber: number;
  title: string;
  shortName: string;
  tagline: string;
  icon: string;
  governingAuthority: string;
  contractSchema: string;
  statusBadge: {
    label: string;
    badgeStyle: string;
    iconComponent: string;
  };
  keyArtifact: string;
  invariants: string[];
  description: string;
  samplePayload: Record<string, any>;
}

export const LIFECYCLE_PHASES: TaskLifecyclePhaseConfig[] = [
  {
    id: 'INTENT',
    stepNumber: 1,
    title: 'Intent Ingestion',
    shortName: 'Intent',
    tagline: 'Raw User & Agent Intent Parsing',
    icon: '🎯',
    governingAuthority: 'Human Operator / Swarm Orchestrator',
    contractSchema: 'camelot.blueprint-intent/1',
    statusBadge: {
      label: 'INGESTED',
      badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-amber-500/10',
      iconComponent: 'Sparkles'
    },
    keyArtifact: 'Raw Task Intent & Tenant Scope Map',
    invariants: ['Tenant boundary defined', 'Prompt injection scrubbed', 'Origin authenticated'],
    description: 'Ingests raw human or orchestrator intent, binds tenant context, and maps task classification (Internal / Restricted).',
    samplePayload: {
      schema: 'camelot.blueprint-intent/1',
      tenant_id: 'tenant_omega_01',
      workspace: 'engineering-core',
      raw_intent: 'Implement tenant-scoped receipt filtering and pagination with strict cross-tenant isolation in Hydra Ledger.',
      classification: 'internal',
      risk_tier: 'medium',
      submitted_at: '2026-08-15T21:50:00.000Z'
    }
  },
  {
    id: 'SPECIFICATION',
    stepNumber: 2,
    title: 'Specification',
    shortName: 'Spec',
    tagline: 'Formal Requirements & Constitution',
    icon: '📐',
    governingAuthority: 'Blueprint OS Spec Compiler',
    contractSchema: 'camelot.feature-specification/1',
    statusBadge: {
      label: 'SPEC_LOCKED',
      badgeStyle: 'bg-yellow-950/80 text-yellow-300 border-yellow-500/60 shadow-yellow-500/10',
      iconComponent: 'FileText'
    },
    keyArtifact: 'FR-001 Synthesized Spec & Constitution',
    invariants: ['512MB RAM Limit', 'Zero ambient egress', 'Immutable test contracts'],
    description: 'Compiles intent into structured Goals, Non-Goals, Functional Requirements (FR-001..FR-004), and binds non-negotiable constitution invariants.',
    samplePayload: {
      schema: 'camelot.feature-specification/1',
      constitution_ref: 'const_engineering_v1',
      goals: ['Tenant query filter', 'Page cursor hashing', 'Z3 invariant assertions'],
      non_goals: ['Direct socket egress', 'Unscoped global scans'],
      requirements: [
        { id: 'FR-001', description: 'Filter records strictly by tenant_id index' },
        { id: 'FR-002', description: 'Enforce deterministic cursor pagination tokens' }
      ],
      constitution_invariants: ['Read-only root mount', 'Deterministic ephemeral worktree']
    }
  },
  {
    id: 'PLANNING',
    stepNumber: 3,
    title: 'Planning',
    shortName: 'Plan',
    tagline: 'Architecture Decisions & ADR Matrix',
    icon: '🗺️',
    governingAuthority: 'Blueprint OS Architect Agent',
    contractSchema: 'camelot.implementation-plan/1',
    statusBadge: {
      label: 'ADR_SEALED',
      badgeStyle: 'bg-sky-950/80 text-sky-300 border-sky-500/60 shadow-sky-500/10',
      iconComponent: 'Layers'
    },
    keyArtifact: 'ADR Matrix, Blast Radius & Rollback Vector',
    invariants: ['Deterministic rollback ready', 'No ambient root modifications', 'Zero breaking API changes'],
    description: 'Generates formal Architecture Decision Records (ADRs), module impact radius, frozen effect manifest digests, and atomic rollback triggers.',
    samplePayload: {
      schema: 'camelot.implementation-plan/1',
      architecture_decisions: ['ADR-041: Tenant Index Partitioning', 'ADR-042: SHA-256 Checksummed Receipts'],
      impact_radius: { files_modified: 3, modules_affected: ['ledger', 'storage', 'vfs'] },
      effect_manifest_digest: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      rollback_trigger: 'GIDEON_INVARIANT_VIOLATION'
    }
  },
  {
    id: 'DAG',
    stepNumber: 4,
    title: 'Merlin Task DAG',
    shortName: 'DAG',
    tagline: 'Topological Scheduling & Agent Dispatch',
    icon: '🕸️',
    governingAuthority: 'Merlin Scheduling Authority',
    contractSchema: 'camelot.task-dag/1',
    statusBadge: {
      label: 'DAG_RESOLVED',
      badgeStyle: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60 shadow-cyan-500/10',
      iconComponent: 'Workflow'
    },
    keyArtifact: 'Topologically Sorted Task Node Network',
    invariants: ['Acyclic dependency graph', 'Single-owner task dispatch', 'Epoch timeout bound'],
    description: 'Breaks plan into a directed acyclic graph of discrete atomic tasks dispatched concurrently to specialized agents (Sir-Ant, Sir-Owl, Sir-Forge, Boris).',
    samplePayload: {
      schema: 'camelot.task-dag/1',
      dag_nodes: [
        { id: 'dag-01', title: 'Synthesize Tenant Filter Kernel', agent: 'Sir-Forge', status: 'COMPLETED' },
        { id: 'dag-02', title: 'Implement Pagination Cursor Logic', agent: 'Sir-Ant', status: 'COMPLETED' },
        { id: 'dag-03', title: 'Z3 Invariant Solver Tests', agent: 'Boris', status: 'ACTIVE' }
      ],
      concurrency_mode: 'PARALLEL_TOPOLOGICAL',
      execution_epoch: 43
    }
  },
  {
    id: 'SANDBOX',
    stepNumber: 5,
    title: 'VFS Sandbox',
    shortName: 'Sandbox',
    tagline: 'Isolated Ephemeral Worktree & Leases',
    icon: '📦',
    governingAuthority: 'VFS Guardian & Sentinel Security',
    contractSchema: 'camelot.vfs-attestation/1',
    statusBadge: {
      label: 'AIR_GAPPED',
      badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-500/60 shadow-purple-500/10',
      iconComponent: 'Box'
    },
    keyArtifact: 'bwrap Tier 3 Container & Lease Token',
    invariants: ['Zero network socket egress', 'Read-only root container', 'Ephemeral memory namespace'],
    description: 'Spawns an air-gapped Bubblewrap (bwrap) sandbox with cryptographic capability lease (LEAS-xxxx), ensuring agents cannot tamper with host filesystem.',
    samplePayload: {
      schema: 'camelot.vfs-attestation/1',
      sandbox_tier: 'TIER_3_CONTAINERIZED',
      lease_id: 'LEAS-4392-TENANT-ISOLATION',
      network_egress: 'DISABLED (0.0.0.0 blocked)',
      memory_ceiling_mb: 512,
      mount_profile: { root: 'READ_ONLY', worktree: 'EPHEMERAL_TMPFS' }
    }
  },
  {
    id: 'VERIFICATION',
    stepNumber: 6,
    title: 'Verification',
    shortName: 'Verify',
    tagline: 'Gideon Verdict & Z3 Invariant Solver',
    icon: '⚖️',
    governingAuthority: 'Gideon Verification & Socrates Z3',
    contractSchema: 'camelot.gideon-verdict/1',
    statusBadge: {
      label: 'Z3_VERIFIED',
      badgeStyle: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-emerald-500/10',
      iconComponent: 'CheckCircle2'
    },
    keyArtifact: 'Formal Z3 Invariant Proof & Green Tests',
    invariants: ['Zero cross-tenant leakage', 'No uncommitted mutations', '100% test contract passing'],
    description: 'Independent verification engine executes automated regression tests via Boris and mathematically proves cross-tenant memory isolation using the Socrates Z3 SMT solver.',
    samplePayload: {
      schema: 'camelot.gideon-verdict/1',
      verdict: 'PASSED',
      z3_solver_status: 'SAT (Invariants provably held)',
      boris_test_suite: { total: 18, passed: 18, failed: 0 },
      cross_tenant_leak_check: 'ZERO_LEAK_CONFIRMED',
      verifier_signature: 'ed25519:gideon_sovereign_verifier_0x9f1a'
    }
  },
  {
    id: 'RECEIPT',
    stepNumber: 7,
    title: 'Proof Receipt',
    shortName: 'Receipt',
    tagline: 'Immutable Sovereign Audit Anchor',
    icon: '🧾',
    governingAuthority: 'Camelot Sovereign Ledger',
    contractSchema: 'camelot.receipt/1',
    statusBadge: {
      label: 'IMMUTABLE_ANCHOR',
      badgeStyle: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-yellow-300 border-yellow-400/80 shadow-yellow-500/20',
      iconComponent: 'Award'
    },
    keyArtifact: 'Cryptographically Signed camelot.receipt/1',
    invariants: ['Hydra ledger anchored', 'Non-repudiable audit trail', 'Operator promotion signed'],
    description: 'Issues the final tamper-proof, cryptographically signed receipt anchored into the immutable Hydra Ledger, allowing production promotion.',
    samplePayload: {
      schema: 'camelot.receipt/1',
      receipt_id: 'RCPT-OMEGA-20260815-9921',
      immutable_hash: 'sha256:7c8b212f45143a53e899b8214f77c3e5362f6b89694e9f733157e84efd0ab845',
      hydra_anchor_block: 1048576,
      operator_promotion_by: 'operator_titan_forge',
      promoted_at: '2026-08-15T21:51:30.000Z',
      audit_status: 'PERMANENTLY_SEALED'
    }
  }
];

interface TaskLifecycleGridDiagramProps {
  onNotify?: (message: string, type: 'success' | 'warning') => void;
  onOpenFullOS?: () => void;
}

export const TaskLifecycleGridDiagram: React.FC<TaskLifecycleGridDiagramProps> = ({
  onNotify,
  onOpenFullOS
}) => {
  const [osState, setOsState] = useState<BlueprintOSState | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState<TaskLifecyclePhaseId>('INTENT');
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
      console.error('Failed to load state in lifecycle diagram:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeBundle: BlueprintArtifactBundle | null = osState?.activeBlueprint || null;
  const currentStatus = activeBundle?.status || 'INTENT_RECEIVED';

  // Map the 14 granular Blueprint OS statuses into the 7 high-level lifecycle phases:
  const mapStatusToPhaseIndex = (status: BlueprintLifecycleStatus): number => {
    switch (status) {
      case 'INTENT_RECEIVED':
      case 'CONSTITUTION_SELECTED':
        return 0; // Intent
      case 'SPEC_COMPILED':
      case 'CLARIFICATION_REQUIRED':
        return 1; // Specification
      case 'PLAN_GENERATED':
        return 2; // Planning
      case 'DAG_TASKIFIED':
        return 3; // DAG
      case 'MANIFEST_FROZEN':
      case 'POLICY_EVALUATED':
      case 'VFS_PREFLIGHT_PASSED':
      case 'LEASE_ISSUED':
      case 'BOUNDED_EXECUTION':
        return 4; // Sandbox
      case 'GIDEON_VERIFIED':
      case 'APPROVAL_REQUIRED':
        return 5; // Verification
      case 'PROMOTED_COMMITTED':
        return 6; // Receipt
      default:
        return 0;
    }
  };

  const currentPhaseIndex = mapStatusToPhaseIndex(currentStatus);

  // Auto-play state machine runner
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlaying && activeBundle) {
      if (currentStatus === 'PROMOTED_COMMITTED') {
        setIsAutoPlaying(false);
        if (onNotify) onNotify('Task Lifecycle reached final Immutable Proof Receipt!', 'success');
      } else {
        timer = setTimeout(() => {
          handleStepNext();
        }, 1200);
      }
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, currentStatus, activeBundle]);

  const handleStepNext = async () => {
    if (!activeBundle) {
      handlePresetStart('tenant');
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
      console.error('Error advancing task lifecycle:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFastForward = async () => {
    if (!activeBundle) {
      handlePresetStart('tenant');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/blueprints/${activeBundle.blueprint_id}/fast-forward`, {
        method: 'POST'
      });
      if (res.ok) {
        await fetchState();
        if (onNotify) onNotify('Task fast-forwarded to final Proof Receipt (PROMOTED_COMMITTED)!', 'success');
      }
    } catch (err) {
      console.error('Error fast-forwarding task lifecycle:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetStart = async (type: 'tenant' | 'lattice' | 'sentinel') => {
    let intent = '';
    let classification = 'internal';
    let risk = 'medium';

    if (type === 'tenant') {
      intent = 'Implement tenant-scoped receipt filtering and pagination with strict cross-tenant isolation in Hydra Ledger.';
      classification = 'internal';
      risk = 'medium';
    } else if (type === 'lattice') {
      intent = 'Synthesize high-speed 24-dimensional Leech Lattice vector indexing kernel on ARM64 Wasmtime runtime.';
      classification = 'restricted';
      risk = 'high';
    } else {
      intent = 'Deploy epoch-bound capability lease validator with bwrap container path escape prevention.';
      classification = 'confidential';
      risk = 'critical';
    }

    try {
      setLoading(true);
      const res = await fetch('/api/blueprints/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: 'tenant_omega_01',
          workspace_id: 'engineering',
          intent,
          constitution_ref: 'const_engineering_v1',
          data_classification: classification
        })
      });
      if (res.ok) {
        await fetchState();
        if (onNotify) onNotify(`Initialized agent task lifecycle: ${intent.slice(0, 45)}...`, 'success');
      }
    } catch (err) {
      console.error('Error compiling preset task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = (obj: any, key: string) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const selectedPhase = LIFECYCLE_PHASES.find(p => p.id === selectedPhaseId) || LIFECYCLE_PHASES[0];
  const selectedPhaseIndex = LIFECYCLE_PHASES.findIndex(p => p.id === selectedPhaseId);

  // Status for each of the 7 phases:
  const getPhaseState = (phaseIndex: number): 'COMPLETED' | 'ACTIVE' | 'PENDING' => {
    if (currentPhaseIndex === 6 && currentStatus === 'PROMOTED_COMMITTED') {
      return 'COMPLETED';
    }
    if (phaseIndex < currentPhaseIndex) return 'COMPLETED';
    if (phaseIndex === currentPhaseIndex) return 'ACTIVE';
    return 'PENDING';
  };

  return (
    <div className="bg-[#0D0D15] border-2 border-purple-500/40 hover:border-purple-400/80 rounded-2xl p-4 sm:p-5 shadow-2xl transition-all space-y-4">
      
      {/* HEADER BAR: Diagram Title, Active Phase Telemetry & Action Buttons */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 pb-3 border-b border-[#1E1E2E]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 via-sky-500/10 to-amber-500/10 border border-purple-500/40 text-purple-300 shadow-inner">
            <Workflow size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                Agent Task Visual State Machine
              </h3>
              <span className="text-[9px] bg-gradient-to-r from-purple-950 to-indigo-950 text-purple-200 font-mono font-black px-2 py-0.5 rounded border border-purple-700/60 shadow-sm">
                7-PHASE CSS GRID
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Tracking agent task lifecycle: <span className="text-amber-300 font-mono">Intent</span> $\rightarrow$ <span className="text-yellow-300 font-mono">Spec</span> $\rightarrow$ <span className="text-sky-300 font-mono">Plan</span> $\rightarrow$ <span className="text-cyan-300 font-mono">DAG</span> $\rightarrow$ <span className="text-purple-300 font-mono">Sandbox</span> $\rightarrow$ <span className="text-emerald-300 font-mono">Verification</span> $\rightarrow$ <span className="text-amber-300 font-mono">Receipt</span>.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Step Button */}
          <button
            onClick={handleStepNext}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-[#1C1C2C] hover:bg-[#25253A] border border-amber-500/50 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow hover:scale-[1.02] disabled:opacity-50"
            title="Advance exactly one phase forward"
          >
            <Play size={13} className={loading ? 'animate-spin' : ''} />
            <span>Step Phase</span>
          </button>

          {/* Auto-Play */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow ${
              isAutoPlaying
                ? 'bg-amber-400 text-black border-amber-300 font-black animate-pulse'
                : 'bg-[#151522] text-gray-300 border-[#2A2A3E] hover:text-white hover:border-amber-400'
            }`}
            title="Automatically run through all 7 lifecycle phases"
          >
            <Activity size={13} />
            <span>{isAutoPlaying ? 'Running Auto...' : 'Auto-Run'}</span>
          </button>

          {/* Fast-Forward */}
          <button
            onClick={handleFastForward}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
            title="Fast forward directly to sealed proof receipt"
          >
            <FastForward size={13} />
            <span>Fast-Forward</span>
          </button>

          {/* Refresh */}
          <button
            onClick={fetchState}
            disabled={loading}
            className="p-1.5 rounded-xl bg-[#141420] hover:bg-[#1E1E2E] border border-[#2A2A3E] text-gray-400 hover:text-white transition-colors"
            title="Refresh State Machine"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          {onOpenFullOS && (
            <button
              onClick={onOpenFullOS}
              className="px-2.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-800/60 text-purple-300 text-xs font-bold flex items-center gap-1 transition-all"
            >
              <ExternalLink size={12} />
              <span>Full Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE TASK INTENT STRIP & PRESET SHORTCUTS */}
      <div className="bg-[#10101A] border border-[#1F1F30] rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">
              Active Lifecycle Task:
            </span>
            <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded uppercase ${
              currentStatus === 'PROMOTED_COMMITTED'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              Phase {currentPhaseIndex + 1}/7 • {currentStatus}
            </span>
            {activeBundle && (
              <span className="text-[10px] text-gray-500 font-mono">
                [{activeBundle.blueprint_id}]
              </span>
            )}
          </div>
          <p className="text-xs text-white font-medium line-clamp-1">
            {activeBundle?.intent || 'Tenant-scoped receipt filtering and pagination with strict cross-tenant isolation in Hydra Ledger.'}
          </p>
        </div>

        {/* 1-Click Task Loader */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handlePresetStart('tenant')}
            className="text-[10px] font-bold font-mono px-2 py-1 rounded bg-[#161626] border border-[#28283C] hover:border-amber-400 text-gray-300 hover:text-white transition-all flex items-center gap-1"
            title="Load Tenant Receipt Filter task"
          >
            <span>🧾</span> <span>Tenant Filter</span>
          </button>
          <button
            onClick={() => handlePresetStart('lattice')}
            className="text-[10px] font-bold font-mono px-2 py-1 rounded bg-[#161626] border border-[#28283C] hover:border-amber-400 text-gray-300 hover:text-white transition-all flex items-center gap-1"
            title="Load 24D Leech Lattice Quantizer task"
          >
            <span>⚡</span> <span>24D Lattice</span>
          </button>
          <button
            onClick={() => handlePresetStart('sentinel')}
            className="text-[10px] font-bold font-mono px-2 py-1 rounded bg-[#161626] border border-[#28283C] hover:border-amber-400 text-gray-300 hover:text-white transition-all flex items-center gap-1"
            title="Load Sentinel Lease task"
          >
            <span>🛡️</span> <span>Sentinel Lease</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VISUAL STATE MACHINE DIAGRAM: PURE CSS GRID (7-Phase Responsive Architecture)
          ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400 font-mono px-1">
          <span className="font-bold text-gray-300 flex items-center gap-1.5">
            <Sliders size={13} className="text-purple-400" />
            <span>State Machine Transition Grid</span>
          </span>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Completed</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> Active Phase</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2A2A3E]"></span> Pending</span>
          </div>
        </div>

        {/* 7-COLUMN CSS GRID DIAGRAM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {LIFECYCLE_PHASES.map((phase, idx) => {
            const state = getPhaseState(idx);
            const isSelected = selectedPhaseId === phase.id;

            return (
              <div
                key={phase.id}
                onClick={() => setSelectedPhaseId(phase.id)}
                className={`relative rounded-xl p-3 cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-2.5 border group ${
                  isSelected
                    ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-[#0D0D15] shadow-xl'
                    : ''
                } ${
                  state === 'COMPLETED'
                    ? 'bg-gradient-to-b from-[#101E1A] to-[#0A1412] border-emerald-500/50 hover:border-emerald-400'
                    : state === 'ACTIVE'
                    ? 'bg-gradient-to-b from-[#221A0F] to-[#14100A] border-amber-400/90 shadow-lg shadow-amber-500/10 hover:border-yellow-300'
                    : 'bg-[#12121D] border-[#222234] hover:border-[#3A3A52] opacity-75 hover:opacity-100'
                }`}
              >
                {/* Arrow indicator between grid cells for desktop */}
                {idx < 6 && (
                  <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 text-gray-500 pointer-events-none">
                    <ChevronRight size={14} className={state === 'COMPLETED' ? 'text-emerald-400' : 'text-gray-600'} />
                  </div>
                )}

                {/* Top Row: Step Index & Phase Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-black ${
                      state === 'COMPLETED'
                        ? 'bg-emerald-500 text-black'
                        : state === 'ACTIVE'
                        ? 'bg-amber-400 text-black animate-pulse'
                        : 'bg-[#1C1C2A] text-gray-400 border border-[#2D2D40]'
                    }`}>
                      {state === 'COMPLETED' ? <Check size={11} className="stroke-[3]" /> : idx + 1}
                    </span>
                    <span className="text-base">{phase.icon}</span>
                  </div>

                  {/* DISTINCT STATUS BADGE FOR EACH PHASE */}
                  <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded border uppercase tracking-wider flex items-center gap-1 ${
                    state === 'COMPLETED'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : state === 'ACTIVE'
                      ? phase.statusBadge.badgeStyle
                      : 'bg-[#181824] text-gray-500 border-[#2A2A38]'
                  }`}>
                    {state === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>}
                    <span>{state === 'COMPLETED' ? 'VERIFIED' : phase.statusBadge.label}</span>
                  </span>
                </div>

                {/* Phase Title & Tagline */}
                <div>
                  <h4 className={`text-xs font-black tracking-tight leading-snug ${
                    state === 'ACTIVE'
                      ? 'text-amber-300'
                      : state === 'COMPLETED'
                      ? 'text-emerald-300'
                      : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {phase.title}
                  </h4>
                  <p className="text-[9px] text-gray-400 line-clamp-1 mt-0.5 font-mono">
                    {phase.tagline}
                  </p>
                </div>

                {/* Key Artifact & Authority Footer */}
                <div className="pt-2 border-t border-[#1C1C2C] space-y-1">
                  <div className="flex items-center justify-between text-[8px] font-mono">
                    <span className="text-gray-500 truncate">{phase.governingAuthority.split(' ')[0]}</span>
                    <span className="text-gray-400 font-bold group-hover:text-amber-300 transition-colors">
                      Inspect &gt;
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SELECTED PHASE DEEP INSPECTOR & LIVE CONTRACT PAYLOAD VIEWER
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-[#101018] border border-[#222234] rounded-xl p-4">
        
        {/* Left Column: Phase Specification & Authority Invariants */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E1E2E] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedPhase.icon}</span>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                  Phase {selectedPhase.stepNumber}: {selectedPhase.title}
                </h4>
                <span className="text-[10px] text-purple-300 font-mono">
                  Schema: {selectedPhase.contractSchema}
                </span>
              </div>
            </div>

            <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded border uppercase ${
              getPhaseState(selectedPhaseIndex) === 'COMPLETED'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : getPhaseState(selectedPhaseIndex) === 'ACTIVE'
                ? selectedPhase.statusBadge.badgeStyle
                : 'bg-[#181826] text-gray-500 border-[#2A2A3A]'
            }`}>
              {getPhaseState(selectedPhaseIndex)}
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            {selectedPhase.description}
          </p>

          {/* Phase Invariants List */}
          <div className="space-y-1.5 bg-[#0A0A10] p-3 rounded-lg border border-[#1A1A28]">
            <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>Phase Governing Invariants:</span>
            </div>
            <ul className="space-y-1 text-[10px] font-mono text-gray-300">
              {selectedPhase.invariants.map((inv, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <Check size={10} className="text-emerald-400 shrink-0" />
                  <span>{inv}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Governing Authority & Key Artifact Details */}
          <div className="space-y-1 text-[10px] font-mono bg-[#0E0E16] p-2.5 rounded-lg border border-[#1E1E2E]">
            <div className="flex justify-between">
              <span className="text-gray-500">Authority:</span>
              <span className="text-sky-300 font-bold">{selectedPhase.governingAuthority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Artifact:</span>
              <span className="text-amber-300">{selectedPhase.keyArtifact}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Contract JSON Payload Viewer */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between border-b border-[#1E1E2E] pb-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-300 font-mono">
              <Binary size={14} className="text-purple-400" />
              <span>Phase Schema Contract Payload ({selectedPhase.contractSchema})</span>
            </div>

            <button
              onClick={() => handleCopyJson(selectedPhase.samplePayload, selectedPhase.id)}
              className="text-[10px] font-mono px-2 py-1 rounded bg-[#181828] hover:bg-[#222238] text-gray-300 hover:text-white border border-[#2D2D42] flex items-center gap-1 transition-all"
            >
              {copiedKey === selectedPhase.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              <span>{copiedKey === selectedPhase.id ? 'Copied JSON' : 'Copy Payload'}</span>
            </button>
          </div>

          {/* JSON Payload Codebox */}
          <div className="bg-[#07070D] border border-[#181824] rounded-xl p-3 max-h-56 overflow-y-auto font-mono text-[11px] leading-relaxed scrollbar-thin scrollbar-thumb-purple-500/20">
            <pre className="text-purple-300 whitespace-pre-wrap">
              {JSON.stringify(selectedPhase.samplePayload, null, 2)}
            </pre>
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 pt-1">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle size={10} /> Cryptographically Bound to Epoch 43
            </span>
            <span>Status: <strong>{getPhaseState(selectedPhaseIndex)}</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
};
