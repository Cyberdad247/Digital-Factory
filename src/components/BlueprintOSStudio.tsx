import React, { useState, useEffect } from 'react';
import {
  BlueprintArtifactBundle,
  BlueprintOSState,
  BlueprintLifecycleStatus
} from '../types';
import {
  FileCode2,
  ShieldCheck,
  Cpu,
  Terminal,
  Lock,
  GitBranch,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  FastForward,
  Flame,
  ArrowRight,
  Shield,
  FileCheck,
  Workflow,
  Copy,
  Check,
  Server,
  Key,
  Database,
  Hash,
  Settings
} from 'lucide-react';

interface BlueprintOSStudioProps {
  onNotify?: (msg: string, type?: 'success' | 'warning') => void;
  onOpenSettings?: () => void;
}

export const BlueprintOSStudio: React.FC<BlueprintOSStudioProps> = ({ onNotify, onOpenSettings }) => {
  const [state, setState] = useState<BlueprintOSState | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'constitution' | 'spec' | 'plan' | 'dag' | 'policy_lease' | 'vfs_sandbox' | 'gideon' | 'receipt'
  >('overview');
  
  // Compiler inputs
  const [intentInput, setIntentInput] = useState('Tenant-scoped receipt filtering and pagination isolation');
  const [constitutionInput, setConstitutionInput] = useState('const_engineering_v1');
  const [dataClassInput, setDataClassInput] = useState<'internal' | 'confidential' | 'restricted'>('internal');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchBlueprintState();
  }, []);

  const fetchBlueprintState = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/blueprints/state');
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.error('Failed to fetch Blueprint OS state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompileIntent = async () => {
    try {
      setLoading(true);
      setStatusMessage('Compiling Blueprint specification against Constitution rules...');
      const res = await fetch('/api/blueprints/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: 'tenant_omega_01',
          workspace_id: 'engineering',
          intent: intentInput,
          constitution_ref: constitutionInput,
          data_classification: dataClassInput
        })
      });
      if (res.ok) {
        setStatusMessage('Blueprint compiled successfully. Clarifications generated.');
        await fetchBlueprintState();
      }
    } catch (err) {
      console.error('Error compiling blueprint:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveClarifications = async (id: string) => {
    try {
      setLoading(true);
      setStatusMessage('Resolving clarification gate & synthesizing Merlin Task DAG...');
      const res = await fetch(`/api/blueprints/${id}/clarify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: {} })
      });
      if (res.ok) {
        setStatusMessage('Clarifications resolved. Merlin DAG ready.');
        await fetchBlueprintState();
      }
    } catch (err) {
      console.error('Error clarifying blueprint:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPreflight = async (id: string) => {
    try {
      setLoading(true);
      setStatusMessage('Evaluating Sentinel Policy decision & VFS sandbox preflight attestation...');
      const res = await fetch(`/api/blueprints/${id}/preflight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setStatusMessage('Sentinel Policy approved. VFS preflight attestation passed.');
        await fetchBlueprintState();
      }
    } catch (err) {
      console.error('Error in preflight:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueLease = async (id: string) => {
    try {
      setLoading(true);
      setStatusMessage('Sentinel issuing cryptographic Capability Lease (Authority Epoch 43)...');
      const res = await fetch(`/api/blueprints/${id}/lease`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setStatusMessage('Capability Lease granted and bound to Immutable Manifest Hash.');
        await fetchBlueprintState();
      }
    } catch (err) {
      console.error('Error issuing lease:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteSandbox = async (id: string) => {
    try {
      setLoading(true);
      setStatusMessage('Spawning bwrap Tier 1 isolated sandbox. Executing bounded runtime...');
      const res = await fetch(`/api/blueprints/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setStatusMessage('Bounded execution complete. Artifacts written to /evidence.');
        await fetchBlueprintState();
      }
    } catch (err) {
      console.error('Error executing sandbox:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGideonVerify = async (id: string) => {
    try {
      setLoading(true);
      setStatusMessage('Gideon independent verification crucible: running Boris tests & Socrates Z3 invariants...');
      const res = await fetch(`/api/blueprints/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setStatusMessage('Gideon verdict: PASS. Human operator approval requested.');
        await fetchBlueprintState();
      }
    } catch (err) {
      console.error('Error verifying blueprint:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteEffect = async (id: string) => {
    try {
      setLoading(true);
      setStatusMessage('Human operator promoting effect. Emitting immutable Proof Receipt...');
      const res = await fetch(`/api/blueprints/${id}/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator_id: 'operator_sovereign_alchemist' })
      });
      if (res.ok) {
        setStatusMessage('Effect promoted and committed. Proof Receipt recorded.');
        await fetchBlueprintState();
      }
    } catch (err) {
      console.error('Error promoting blueprint:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFastForward = async (id: string) => {
    try {
      setLoading(true);
      setStatusMessage('Fast-forwarding all 15 Blueprint OS lifecycle stages to Proof Receipt...');
      const res = await fetch(`/api/blueprints/${id}/fast-forward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setStatusMessage('Full lifecycle fast-forwarded successfully!');
        await fetchBlueprintState();
      }
    } catch (err) {
      console.error('Error fast-forwarding blueprint:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const activeBp = state?.activeBlueprint;

  const STAGES: { status: BlueprintLifecycleStatus; label: string; number: number }[] = [
    { status: 'INTENT_RECEIVED', label: '1. Intent', number: 1 },
    { status: 'CONSTITUTION_SELECTED', label: '2. Constitution', number: 2 },
    { status: 'SPEC_COMPILED', label: '3. Feature Spec', number: 3 },
    { status: 'CLARIFICATION_REQUIRED', label: '4. Clarifications', number: 4 },
    { status: 'PLAN_GENERATED', label: '5. Plan', number: 5 },
    { status: 'DAG_TASKIFIED', label: '6. Merlin DAG', number: 6 },
    { status: 'MANIFEST_FROZEN', label: '7. Manifest', number: 7 },
    { status: 'POLICY_EVALUATED', label: '8. Policy', number: 8 },
    { status: 'VFS_PREFLIGHT_PASSED', label: '9. VFS Preflight', number: 9 },
    { status: 'LEASE_ISSUED', label: '10. Capability Lease', number: 10 },
    { status: 'BOUNDED_EXECUTION', label: '11. Sandbox Run', number: 11 },
    { status: 'GIDEON_VERIFIED', label: '12. Gideon Verdict', number: 12 },
    { status: 'APPROVAL_REQUIRED', label: '13. Operator Review', number: 13 },
    { status: 'PROMOTED_COMMITTED', label: '14. Receipt Recorded', number: 14 }
  ];

  const getStageIndex = (status: BlueprintLifecycleStatus) => {
    switch (status) {
      case 'INTENT_RECEIVED': return 0;
      case 'CONSTITUTION_SELECTED': return 1;
      case 'SPEC_COMPILED': return 2;
      case 'CLARIFICATION_REQUIRED': return 3;
      case 'PLAN_GENERATED': return 4;
      case 'DAG_TASKIFIED': return 5;
      case 'MANIFEST_FROZEN': return 6;
      case 'POLICY_EVALUATED': return 7;
      case 'VFS_PREFLIGHT_PASSED': return 8;
      case 'LEASE_ISSUED': return 9;
      case 'BOUNDED_EXECUTION': return 10;
      case 'GIDEON_VERIFIED': return 11;
      case 'APPROVAL_REQUIRED': return 12;
      case 'PROMOTED_COMMITTED': return 13;
      case 'REPAIR_TRIGGERED': return 10;
      default: return 0;
    }
  };

  const currentStageIndex = activeBp ? getStageIndex(activeBp.status) : 0;

  return (
    <div className="space-y-6">
      {/* Operating Law & Responsibility Matrix Banner */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Blueprint OS v1.1 Architecture
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Zero-Trust Contract Compiler
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-amber-400" />
              Sovereign Contract & Capability Lease Arena
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict separation between Contract Planning (Blueprint OS), Scheduling (Merlin), Leases (Sentinel), Sandboxes (VFS Guardian), and Verification (Gideon).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 border border-amber-500/30 rounded-lg px-4 py-2.5 max-w-lg">
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                The Seven Operating Laws
              </div>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed italic">
                "Blueprint OS describes the permitted job. Sentinel grants the exact authority. VFS creates the bounded place to do it. The runtime performs only leased work. Gideon verifies the evidence. Humans promote consequential outcomes. Receipts preserve the proof."
              </p>
            </div>

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-2.5 rounded-lg bg-slate-950 border border-amber-500/40 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer h-full flex flex-col items-center justify-center gap-1 shrink-0"
                title="Open Blueprint OS Harness Settings"
              >
                <Settings size={16} />
                <span className="text-[9px] font-mono font-bold">SETTINGS</span>
              </button>
            )}
          </div>
        </div>

        {/* 7-Component Responsibility Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mt-4">
          {[
            { name: 'Blueprint OS', owns: 'Constitution, Spec, Plans, DAG, AC', cant: 'Leases, Policy, Sandbox Creation', color: 'border-amber-500/40 text-amber-400' },
            { name: 'Merlin', owns: 'DAG Scheduling, Ordering, Runtime Rec', cant: 'Lease Issuance, Policy Override', color: 'border-purple-500/40 text-purple-400' },
            { name: 'Sentinel', owns: 'Policy Decision, Capability Leases, Revocation', cant: 'Worktree Mounts, Source Edits', color: 'border-red-500/40 text-red-400' },
            { name: 'VFS Guardian', owns: 'Worktrees, bwrap Mounts, Quotas, Paths', cant: 'Policy Approval, Receipt Rewriting', color: 'border-blue-500/40 text-blue-400' },
            { name: 'Bifrost', owns: 'Auth, Transport, Event Streams, Idempotency', cant: 'Direct Effect Authority', color: 'border-cyan-500/40 text-cyan-400' },
            { name: 'Gideon', owns: 'Independent Verification, Pass/Block Verdict', cant: 'Direct Promotion, Lease Grant', color: 'border-emerald-500/40 text-emerald-400' },
            { name: 'Promotion Ctrl', owns: 'Human-Approved Effect Promotion', cant: 'Self-Approval, Policy Bypass', color: 'border-yellow-500/40 text-yellow-400' }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between">
              <div>
                <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${item.color}`}>
                  {item.name}
                </div>
                <div className="text-[10px] text-slate-300 leading-tight mb-1.5">
                  <span className="text-emerald-400 font-semibold">Owns:</span> {item.owns}
                </div>
              </div>
              <div className="text-[9px] text-rose-300/80 leading-tight border-t border-slate-800/80 pt-1">
                <span className="text-rose-400 font-semibold">Cannot Own:</span> {item.cant}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blueprint Intent Compiler Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Blueprint Intent Compiler & Constitution Selector
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Blueprints: <strong className="text-white">{state?.totalBlueprints || 0}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-4">
          <div className="lg:col-span-6">
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              Raw Feature Intent (Natural Language)
            </label>
            <input
              type="text"
              value={intentInput}
              onChange={(e) => setIntentInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              placeholder="e.g. Tenant-scoped receipt filtering and pagination isolation"
            />
          </div>

          <div className="lg:col-span-3">
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              Target Constitution
            </label>
            <select
              value={constitutionInput}
              onChange={(e) => setConstitutionInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            >
              <option value="const_engineering_v1">const_engineering_v1 (Zero Egress, 512MB)</option>
              <option value="const_commerce_v1">const_commerce_v1 (PCI DSS, Dual-Custody)</option>
            </select>
          </div>

          <div className="lg:col-span-3">
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              Data Classification
            </label>
            <select
              value={dataClassInput}
              onChange={(e) => setDataClassInput(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            >
              <option value="internal">Internal (Default)</option>
              <option value="confidential">Confidential</option>
              <option value="restricted">Restricted (Human Approval Req)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCompileIntent}
              disabled={loading || !intentInput}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-900/30 transition disabled:opacity-50"
            >
              <Flame className="w-4 h-4" />
              Compile Specification (POST /v1/blueprints/compile)
            </button>

            {activeBp && (
              <button
                onClick={() => handleFastForward(activeBp.blueprint_id)}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition disabled:opacity-50"
              >
                <FastForward className="w-4 h-4" />
                1-Click Fast-Forward Full Lifecycle to Receipt
              </button>
            )}
          </div>

          {statusMessage && (
            <div className="text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 rounded px-3 py-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              {statusMessage}
            </div>
          )}
        </div>
      </div>

      {/* Active Blueprint Lifecycle Stepper & Controls */}
      {activeBp && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-amber-400 font-bold">
                  {activeBp.blueprint_id}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Status: {activeBp.status}
                </span>
                <span className="text-xs text-slate-400">
                  Tenant: <strong className="text-slate-200">{activeBp.tenant_id}</strong>
                </span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">
                {activeBp.spec.title}
              </h4>
            </div>

            {/* Interactive Step-by-Step Buttons */}
            <div className="flex items-center gap-2">
              {activeBp.status === 'CLARIFICATION_REQUIRED' && (
                <button
                  onClick={() => handleResolveClarifications(activeBp.blueprint_id)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-mono font-bold flex items-center gap-1 transition"
                >
                  <Play className="w-3.5 h-3.5" /> Resolve Clarifications & Taskify DAG
                </button>
              )}

              {activeBp.status === 'DAG_TASKIFIED' && (
                <button
                  onClick={() => handleRunPreflight(activeBp.blueprint_id)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-mono font-bold flex items-center gap-1 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Run Sentinel Policy & VFS Preflight
                </button>
              )}

              {activeBp.status === 'VFS_PREFLIGHT_PASSED' && (
                <button
                  onClick={() => handleIssueLease(activeBp.blueprint_id)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-mono font-bold flex items-center gap-1 transition"
                >
                  <Key className="w-3.5 h-3.5" /> Sentinel Issue Capability Lease
                </button>
              )}

              {activeBp.status === 'LEASE_ISSUED' && (
                <button
                  onClick={() => handleExecuteSandbox(activeBp.blueprint_id)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-mono font-bold flex items-center gap-1 transition"
                >
                  <Terminal className="w-3.5 h-3.5" /> Launch Bounded bwrap Sandbox
                </button>
              )}

              {activeBp.status === 'BOUNDED_EXECUTION' && (
                <button
                  onClick={() => handleGideonVerify(activeBp.blueprint_id)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-mono font-bold flex items-center gap-1 transition"
                >
                  <FileCheck className="w-3.5 h-3.5" /> Run Gideon Verification Crucible
                </button>
              )}

              {activeBp.status === 'APPROVAL_REQUIRED' && (
                <button
                  onClick={() => handlePromoteEffect(activeBp.blueprint_id)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold flex items-center gap-1 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Operator Promote & Emit Proof Receipt
                </button>
              )}
            </div>
          </div>

          {/* 14-Stage Visual Lifecycle Pipeline Stepper */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
              <span>Blueprint OS 14-Stage Pipeline Lifecycle</span>
              <span className="text-amber-400 font-bold">
                Stage {currentStageIndex + 1} of 14: {STAGES[currentStageIndex]?.label || 'Active'}
              </span>
            </div>
            <div className="flex items-center gap-1 min-w-[900px]">
              {STAGES.map((stg, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={idx} className="flex items-center flex-1">
                    <div
                      className={`px-2 py-1 rounded text-[9px] font-mono font-bold whitespace-nowrap border transition-all flex items-center gap-1 w-full justify-center ${
                        isCurrent
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-md shadow-amber-500/20 animate-pulse'
                          : isPassed
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/60'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-700 flex items-center justify-center text-[7px] text-slate-300">
                          {stg.number}
                        </span>
                      )}
                      {stg.label}
                    </div>
                    {idx < STAGES.length - 1 && (
                      <ArrowRight className={`w-3 h-3 mx-0.5 shrink-0 ${isPassed ? 'text-emerald-500/60' : 'text-slate-700'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-800 pt-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview & Contracts', icon: Layers },
              { id: 'constitution', label: '1. Constitution', icon: Shield },
              { id: 'spec', label: '2. Feature Spec', icon: FileCode2 },
              { id: 'plan', label: '3. Impl Plan & ADRs', icon: Workflow },
              { id: 'dag', label: '4. Merlin Task DAG', icon: GitBranch },
              { id: 'policy_lease', label: '5. Sentinel Lease', icon: Key },
              { id: 'vfs_sandbox', label: '6. VFS & bwrap', icon: Server },
              { id: 'gideon', label: '7. Gideon Verdict', icon: FileCheck },
              { id: 'receipt', label: '8. Proof Receipt', icon: CheckCircle2 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 text-xs font-mono font-bold flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
                    isActive
                      ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="pt-2">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                  <div className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                    <FileCode2 className="w-4 h-4" /> Feature Specification Scope
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <p><strong>Objective:</strong> {activeBp.spec.objective}</p>
                    <p><strong>Risk Tier:</strong> <span className="text-amber-300 uppercase font-bold">{activeBp.spec.risk_tier}</span></p>
                    <p><strong>Data Classification:</strong> <span className="text-cyan-300 uppercase font-mono">{activeBp.spec.data_classification}</span></p>
                    <p><strong>Affected Domains:</strong> {activeBp.spec.affected_domains.join(', ')}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-mono text-slate-400 uppercase mb-1">Acceptance Criteria</div>
                    {activeBp.spec.acceptance_criteria.map((ac) => (
                      <div key={ac.id} className="bg-slate-900 p-2 rounded text-[11px] font-mono text-slate-300 mb-1 border border-slate-800">
                        <span className="text-amber-400 font-bold">{ac.id}:</span> Given {ac.given}, when {ac.when}, then <span className="text-emerald-300">{ac.then}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                  <div className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                    <Hash className="w-4 h-4" /> Immutable Effect Manifest
                  </div>
                  <div className="space-y-1 text-xs font-mono text-slate-300">
                    <p className="text-[10px] text-slate-400">MANIFEST SHA256 HASH:</p>
                    <p className="bg-slate-900 p-1.5 rounded text-[10px] text-cyan-300 break-all border border-slate-800">
                      {activeBp.manifest.manifest_hash}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2">AFFECTED FILES ({activeBp.manifest.affected_files.length}):</p>
                    {activeBp.manifest.affected_files.map((file, i) => (
                      <div key={i} className="text-[10px] bg-slate-900/60 p-1 rounded border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-300 truncate">{file.path}</span>
                        <span className="text-amber-400 font-bold ml-1">{file.action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                  <div className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Security & Authority State
                  </div>
                  <div className="space-y-2 text-xs font-mono text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Sentinel Lease:</span>
                      <span className={activeBp.lease ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {activeBp.lease ? `GRANTED (Epoch ${activeBp.lease.authority_epoch})` : 'PENDING'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">VFS Isolation Tier:</span>
                      <span className="text-cyan-300 font-bold">Tier 1 (bwrap + cgroup_v2)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Gideon Verdict:</span>
                      <span className={activeBp.gideonVerdict ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {activeBp.gideonVerdict?.verdict || 'PENDING'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Cryptographic Receipt:</span>
                      <span className={activeBp.receipt ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                        {activeBp.receipt ? activeBp.receipt.receipt_id : 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONSTITUTION TAB */}
            {activeTab === 'constitution' && (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-amber-400 font-bold">
                    SCHEMA: camelot.blueprint-constitution/1 (ID: {activeBp.constitution.constitution_id})
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(activeBp.constitution, null, 2), 'const')}
                    className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'const' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy JSON
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="space-y-2">
                    <div className="text-slate-400 uppercase font-bold">Principles:</div>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      {activeBp.constitution.principles.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                    <div className="text-slate-400 uppercase font-bold mt-3">Non-Negotiables:</div>
                    {activeBp.constitution.non_negotiables.map((nn) => (
                      <div key={nn.id} className="bg-slate-900 p-2 rounded border border-red-900/40 text-slate-300">
                        <span className="text-red-400 font-bold">{nn.id} [{nn.severity.toUpperCase()}]:</span> {nn.description}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 bg-slate-900/60 p-3 rounded border border-slate-800">
                    <p><strong>Allowed Runtimes:</strong> {activeBp.constitution.runtime_policy.allowed_runtimes.join(', ')}</p>
                    <p><strong>Denied Runtimes:</strong> <span className="text-red-400">{activeBp.constitution.runtime_policy.denied_runtimes.join(', ')}</span></p>
                    <p><strong>Max Memory:</strong> {activeBp.constitution.infrastructure_policy.max_memory_mb} MB</p>
                    <p><strong>Task Timeout:</strong> {activeBp.constitution.infrastructure_policy.max_task_timeout_s}s</p>
                    <p><strong>Network Default:</strong> <span className="text-amber-400 font-bold">{activeBp.constitution.infrastructure_policy.allow_network_by_default ? 'ALLOWED' : 'DISABLED (ZERO TRUST)'}</span></p>
                    <p><strong>Signer:</strong> {activeBp.constitution.integrity.signer}</p>
                  </div>
                </div>
              </div>
            )}

            {/* FEATURE SPEC TAB */}
            {activeTab === 'spec' && (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-cyan-400 font-bold">
                    SCHEMA: camelot.feature-specification/1 (Spec ID: {activeBp.spec.spec_id})
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(activeBp.spec, null, 2), 'spec')}
                    className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'spec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy JSON
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                  <div className="space-y-2">
                    <p><strong>Problem:</strong> {activeBp.spec.problem_statement}</p>
                    <p><strong>Objective:</strong> {activeBp.spec.objective}</p>
                    <div className="text-emerald-400 font-bold mt-2">Goals:</div>
                    <ul className="list-disc list-inside text-slate-300">
                      {activeBp.spec.goals.map((g, i) => <li key={i}>{g}</li>)}
                    </ul>
                    <div className="text-red-400 font-bold mt-2">Non-Goals:</div>
                    <ul className="list-disc list-inside text-slate-300">
                      {activeBp.spec.non_goals.map((ng, i) => <li key={i}>{ng}</li>)}
                    </ul>
                  </div>
                  <div className="space-y-2 bg-slate-900/60 p-3 rounded border border-slate-800">
                    <div className="text-amber-400 font-bold">Functional Requirements:</div>
                    {activeBp.spec.functional_requirements.map((fr) => (
                      <div key={fr.id} className="text-[11px] mb-1">
                        <strong className="text-white">{fr.id} ({fr.priority}):</strong> {fr.statement}
                      </div>
                    ))}
                    <div className="text-purple-400 font-bold mt-3">Security & Non-Functional:</div>
                    <ul className="list-disc list-inside text-[11px] text-slate-300">
                      {activeBp.spec.nonfunctional_requirements.security.map((sec, i) => <li key={i}>{sec}</li>)}
                      {activeBp.spec.nonfunctional_requirements.performance.map((perf, i) => <li key={i}>{perf}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* IMPL PLAN & ADRs TAB */}
            {activeTab === 'plan' && (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-amber-400 font-bold">
                    SCHEMA: camelot.implementation-plan/1 (Plan ID: {activeBp.plan.plan_id})
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(activeBp.plan, null, 2), 'plan')}
                    className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'plan' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy JSON
                  </button>
                </div>
                <div className="space-y-3 text-xs font-mono">
                  <div className="text-slate-400 uppercase font-bold">Architecture Decisions (ADRs):</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeBp.plan.architecture_decisions.map((adr) => (
                      <div key={adr.id} className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                        <div className="text-amber-400 font-bold">{adr.id}: {adr.decision}</div>
                        <div className="text-slate-400 text-[11px]"><strong>Rationale:</strong> {adr.rationale}</div>
                        <div className="text-slate-500 text-[10px]">Alternatives considered: {adr.alternatives.join(', ')}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-slate-400 uppercase font-bold pt-2">Ordered Implementation Steps:</div>
                  <div className="space-y-1.5">
                    {activeBp.plan.implementation_steps.map((st) => (
                      <div key={st.order} className="bg-slate-900/70 px-3 py-2 rounded border border-slate-800 flex items-center gap-2 text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                          {st.order}
                        </span>
                        {st.action}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MERLIN TASK DAG TAB */}
            {activeTab === 'dag' && (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-purple-400 font-bold">
                    SCHEMA: camelot.task-dag/1 (DAG ID: {activeBp.dag.dag_id})
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(activeBp.dag, null, 2), 'dag')}
                    className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'dag' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy JSON
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {activeBp.dag.nodes.map((node) => (
                    <div key={node.task_id} className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-purple-300 font-bold">{node.task_id}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">{node.mode}</span>
                        </div>
                        <div className="text-xs font-bold text-white mt-1">{node.title}</div>
                        <div className="text-[10px] font-mono text-amber-400 mt-1">Role: @{node.role}</div>
                        {node.runtime_recommendation && (
                          <div className="text-[10px] font-mono text-cyan-300">Runtime: {node.runtime_recommendation}</div>
                        )}
                        <div className="text-[10px] font-mono text-slate-400 mt-1">
                          Deps: {node.dependencies.length ? node.dependencies.join(', ') : 'None (Root)'}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-800 text-[9px] font-mono text-slate-400">
                        Budget: {node.budget.max_memory_mb}MB / {node.budget.timeout_s}s
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SENTINEL POLICY & LEASE TAB */}
            {activeTab === 'policy_lease' && (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-red-400 font-bold">
                    SENTINEL CAPABILITY LEASE (Authority Epoch 43)
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(activeBp.lease || activeBp.policyDecision, null, 2), 'lease')}
                    className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'lease' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy JSON
                  </button>
                </div>
                {activeBp.lease ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-2">
                      <div className="text-emerald-400 font-bold">Lease Bindings & Bounds:</div>
                      <p><strong>Lease ID:</strong> {activeBp.lease.lease_id}</p>
                      <p><strong>Signer:</strong> Sentinel (Key: {activeBp.lease.integrity.signing_key_id})</p>
                      <p><strong>Workload:</strong> {activeBp.lease.bindings.workload_id}</p>
                      <p><strong>Runtime:</strong> {activeBp.lease.bindings.runtime_id}</p>
                      <p><strong>Expires At:</strong> {activeBp.lease.budgets.expires_at}</p>
                      <p><strong>Network Mode:</strong> <span className="text-amber-400 font-bold">{activeBp.lease.permissions.network.mode}</span></p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-2">
                      <div className="text-cyan-400 font-bold">VFS Write Scope Permissions:</div>
                      <ul className="list-disc list-inside text-[11px]">
                        {activeBp.lease.permissions.vfs.write.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                      <div className="text-purple-400 font-bold mt-2">Process Allowlist:</div>
                      <p className="text-[11px]">{activeBp.lease.permissions.process.allowlist.join(', ')}</p>
                      <div className="text-[10px] text-slate-500 pt-2">
                        Signature: {activeBp.lease.integrity.signature}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-slate-400 italic">
                    Capability lease not yet issued. Advance through preflight to generate signed lease.
                  </div>
                )}
              </div>
            )}

            {/* VFS & BWRAP SANDBOX TAB */}
            {activeTab === 'vfs_sandbox' && (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-blue-400 font-bold">
                    VFS GUARDIAN TIER 1 BWRAP SANDBOX COMMAND PROFILE
                  </div>
                  <button
                    onClick={() => copyToClipboard(activeBp.vfsAttestation?.bwrap_command_profile || '', 'bwrap')}
                    className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'bwrap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy bwrap CLI
                  </button>
                </div>
                {activeBp.vfsAttestation ? (
                  <pre className="bg-slate-900 p-4 rounded-lg text-[11px] font-mono text-emerald-300 overflow-x-auto border border-slate-800">
                    {activeBp.vfsAttestation.bwrap_command_profile}
                  </pre>
                ) : (
                  <div className="text-xs font-mono text-slate-400 italic">
                    VFS Sandbox profile generates after preflight attestation.
                  </div>
                )}
              </div>
            )}

            {/* GIDEON VERDICT TAB */}
            {activeTab === 'gideon' && (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-emerald-400 font-bold">
                    GIDEON INDEPENDENT VERDICT CRUCIBLE
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(activeBp.gideonVerdict, null, 2), 'gideon')}
                    className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'gideon' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Verdict
                  </button>
                </div>
                {activeBp.gideonVerdict ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                    <div className="bg-slate-900 p-3 rounded border border-emerald-500/40 space-y-2">
                      <div className="text-base font-bold text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> VERDICT: {activeBp.gideonVerdict.verdict}
                      </div>
                      <p><strong>Verdict ID:</strong> {activeBp.gideonVerdict.verdict_id}</p>
                      <p><strong>Evidence Digest:</strong> {activeBp.gideonVerdict.evidence_digest}</p>
                      <p><strong>Timestamp:</strong> {activeBp.gideonVerdict.timestamp}</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1.5">
                      <div className="text-amber-400 font-bold mb-1">Check Gates Summary:</div>
                      {Object.entries(activeBp.gideonVerdict.checks_summary).map(([chk, pass]) => (
                        <div key={chk} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">{chk}:</span>
                          <span className={pass ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                            {pass ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-slate-400 italic">
                    Gideon independent verification will execute following bounded sandbox run.
                  </div>
                )}
              </div>
            )}

            {/* PROOF RECEIPT TAB */}
            {activeTab === 'receipt' && (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-amber-400 font-bold">
                    CRYPTOGRAPHIC PROOF RECEIPT (camelot.receipt/1)
                  </div>
                  {activeBp.receipt && (
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(activeBp.receipt, null, 2), 'receipt')}
                      className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'receipt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Receipt
                    </button>
                  )}
                </div>
                {activeBp.receipt ? (
                  <div className="bg-slate-900 p-4 rounded-lg border border-amber-500/40 space-y-2 text-xs font-mono text-slate-300">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-amber-400 font-bold text-sm">{activeBp.receipt.receipt_id}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
                        {activeBp.receipt.promotion_status}
                      </span>
                    </div>
                    <p><strong>Effect Kind:</strong> {activeBp.receipt.effect_kind}</p>
                    <p><strong>Tenant:</strong> {activeBp.receipt.tenant_id}</p>
                    <p><strong>Approved By:</strong> <span className="text-white font-bold">{activeBp.receipt.approved_by}</span></p>
                    <p><strong>Manifest Hash:</strong> {activeBp.receipt.manifest_hash}</p>
                    <p><strong>SHA256 Proof:</strong> <span className="text-cyan-300">{activeBp.receipt.sha256_proof}</span></p>
                    <p className="text-slate-400 italic pt-2">{activeBp.receipt.summary}</p>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-slate-400 italic">
                    Proof receipt is generated and cryptographically sealed upon human promotion.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
