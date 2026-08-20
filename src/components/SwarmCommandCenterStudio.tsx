import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Server,
  Layers,
  Network,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Search,
  Activity,
  FileCode,
  Shield,
  Workflow,
  Clock,
  TerminalSquare,
  Play,
  FileText,
  KeyRound,
  Eye,
  ArrowUpRight,
  Database,
  CheckCheck,
  RotateCcw,
  Plus,
  GitBranch,
  Sparkles,
  RefreshCw,
  Fingerprint
} from 'lucide-react';
import {
  ExcaliburApprovalDrawer,
  INITIAL_PROMOTION_CANDIDATES,
  PromotionCandidate,
  CandidateArtifactStatus,
  ExcaliburWarrantReceipt,
  CandidateAuthorization,
  PROD_AUTHORIZING_ROLES
} from './ExcaliburApprovalDrawer';

interface SwarmCommandCenterStudioProps {
  onNotify?: (message: string, type?: 'success' | 'warning') => void;
}

export function SwarmCommandCenterStudio({ onNotify }: SwarmCommandCenterStudioProps) {
  const [activePanel, setActivePanel] = useState('APPROVAL_DRAWER');
  const [candidates, setCandidates] = useState<PromotionCandidate[]>(INITIAL_PROMOTION_CANDIDATES);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('cand_receipt_export_004');
  const [isSigningCandidateId, setIsSigningCandidateId] = useState<string | null>(null);

  // Selected candidate
  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];

  // Derived counts
  const pendingCount = candidates.filter(c => c.status === 'pending approval').length;
  const approvedCount = candidates.filter(c => c.status === 'approved').length;
  const signedCount = candidates.filter(c => c.status === 'signed').length;
  const deniedCount = candidates.filter(c => c.status === 'denied').length;

  // Handler: Approve / Authorize Candidate Artifact
  const handleApproveCandidate = (id: string, roleToGrant?: CandidateAuthorization['role']) => {
    let quorumReached = false;
    let requiredCount = 1;
    let currentCount = 1;
    let targetRoleName = 'Operator';

    setCandidates(prev =>
      prev.map(c => {
        if (c.id === id) {
          const isProd = c.targetBranch === 'PROD';
          requiredCount = isProd ? (c.requiredAuthorizations || 3) : 1;
          const existingAuths = c.authorizations || [];

          // Find role info
          let targetRoleInfo = PROD_AUTHORIZING_ROLES.find(r => r.role === roleToGrant);
          if (!targetRoleInfo) {
            const grantedRoles = new Set(existingAuths.map(a => a.role));
            targetRoleInfo = PROD_AUTHORIZING_ROLES.find(r => !grantedRoles.has(r.role)) || PROD_AUTHORIZING_ROLES[0];
          }
          targetRoleName = targetRoleInfo.roleName;

          const newAuth: CandidateAuthorization = {
            id: `auth_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            authorizedBy: targetRoleInfo.defaultSigner,
            role: targetRoleInfo.role,
            roleName: targetRoleInfo.roleName,
            authorizedAt: new Date().toISOString(),
            signatureDigest: `ed25519_digest:0x${Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            note: `Authorization token granted for ${c.targetBranch} release.`
          };

          const updatedAuths = [...existingAuths.filter(a => a.role !== targetRoleInfo.role), newAuth];
          currentCount = updatedAuths.length;
          quorumReached = currentCount >= requiredCount;

          return {
            ...c,
            authorizations: updatedAuths,
            status: quorumReached ? 'approved' : 'pending approval',
            approvedBy: quorumReached
              ? `${targetRoleInfo.roleName} & Quorum (${currentCount}/${requiredCount})`
              : `${targetRoleInfo.roleName} (${currentCount}/${requiredCount})`,
            approvedAt: new Date().toISOString()
          };
        }
        return c;
      })
    );

    const cand = candidates.find(c => c.id === id);
    if (onNotify) {
      if (quorumReached) {
        onNotify(
          `⚔️ Quorum Complete! All ${requiredCount} authorizations acquired for [${cand?.taskId || id}]. Status updated to 'APPROVED'.`,
          'success'
        );
      } else {
        onNotify(
          `✓ Granted ${targetRoleName} signature for [${cand?.taskId || id}] (${currentCount}/${requiredCount} PROD signatures acquired).`,
          'success'
        );
      }
    }
  };

  // Handler: Change Target Branch
  const handleChangeTargetBranch = (id: string, branch: string) => {
    const isProd = branch === 'PROD';
    const reqCount = isProd ? 3 : 1;

    setCandidates(prev =>
      prev.map(c => {
        if (c.id === id) {
          const currentAuths = c.authorizations || [];
          const isFullyAuth = currentAuths.length >= reqCount;
          return {
            ...c,
            targetBranch: branch,
            requiredAuthorizations: reqCount,
            status: c.status === 'signed' ? 'signed' : (isFullyAuth ? 'approved' : 'pending approval')
          };
        }
        return c;
      })
    );

    if (onNotify) {
      onNotify(
        `Target branch for artifact switched to [${branch}] (${isProd ? 'Requires 3 distinct role signatures' : '1 signature required'}).`,
        'success'
      );
    }
  };

  // Handler: Sign Consequential Effect Warrant
  const handleSignCandidate = (id: string) => {
    const cand = candidates.find(c => c.id === id);
    if (!cand) return;

    setIsSigningCandidateId(id);

    setTimeout(() => {
      const newWarrantId = `warrant_excalibur_${Math.random().toString(36).substring(2, 9)}`;
      const newReceiptId = `receipt_prom_${Date.now()}`;
      const mockSig = `ed25519_sig:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      const multiSigs = (cand.authorizations || []).map(a => ({
        role: a.role,
        signedBy: a.authorizedBy,
        signatureDigest: a.signatureDigest,
        timestamp: a.authorizedAt
      }));

      const receiptPayload: ExcaliburWarrantReceipt = {
        receiptId: newReceiptId,
        warrantId: newWarrantId,
        candidateId: cand.id,
        manifestHash: cand.manifestHash,
        targetBranch: cand.targetBranch,
        signedBy: 'Vizion711@gmail.com (Arthurian Sovereign)',
        signerRole: 'SOVEREIGN_OPERATOR_EXCALIBUR',
        authorityEpoch: cand.authorityEpoch,
        timestamp: new Date().toISOString(),
        signature: mockSig,
        multiSignatures: multiSigs,
        status: 'MERGED_TO_TARGET',
        rawPayload: {
          warrant_version: 'camelot.excalibur.warrant/v1',
          consequential_effect: cand.effectClass,
          task_id: cand.taskId,
          tenant_id: cand.tenantId,
          workspace_id: cand.workspaceId,
          manifest_hash: cand.manifestHash,
          diff_hash: cand.diffHash,
          target_branch: cand.targetBranch,
          base_revision: cand.baseRevision,
          candidate_revision: cand.candidateRevision,
          rollback_ref: cand.rollbackRef,
          authority_epoch: cand.authorityEpoch,
          expires_at: cand.expiresAt,
          multi_signatures: multiSigs,
          quorum_count: multiSigs.length,
          required_quorum: cand.targetBranch === 'PROD' ? 3 : 1
        }
      };

      setCandidates(prev =>
        prev.map(c => {
          if (c.id === id) {
            return {
              ...c,
              status: 'signed',
              signedBy: 'Vizion711@gmail.com (Arthurian Sovereign)',
              signedAt: new Date().toISOString(),
              warrantReceipt: receiptPayload
            };
          }
          return c;
        })
      );

      setIsSigningCandidateId(null);

      if (onNotify) {
        onNotify(
          `⚔️ Artifact [${cand.taskId}] cryptographically SIGNED & MERGED to ${cand.targetBranch}! Warrant ID: ${newWarrantId} (${multiSigs.length} authorized signatures)`,
          'success'
        );
      }
    }, 1000);
  };

  // Handler: Deny Candidate Artifact
  const handleDenyCandidate = (id: string) => {
    setCandidates(prev =>
      prev.map(c => (c.id === id ? { ...c, status: 'denied' } : c))
    );
    const cand = candidates.find(c => c.id === id);
    if (onNotify) {
      onNotify(`🚫 Artifact [${cand?.taskId || id}] status updated to 'DENIED' & lease quarantined`, 'warning');
    }
  };

  // Handler: Reset to Pending Approval
  const handleResetCandidate = (id: string) => {
    setCandidates(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              status: 'pending approval',
              approvedBy: undefined,
              approvedAt: undefined,
              signedBy: undefined,
              signedAt: undefined,
              warrantReceipt: undefined
            }
          : c
      )
    );
    const cand = candidates.find(c => c.id === id);
    if (onNotify) {
      onNotify(`Artifact [${cand?.taskId || id}] reset to 'PENDING APPROVAL'`, 'success');
    }
  };

  // Handler: Simulate New Candidate Artifact Emission from Forge
  const handleSimulateNewCandidate = () => {
    const nextTaskNum = candidates.length + 4;
    const newTaskId = `T-00${nextTaskNum}`;
    const newId = `cand_forge_emission_${Date.now()}`;
    const newCandidate: PromotionCandidate = {
      id: newId,
      taskId: newTaskId,
      title: `Optimize WASM boundary serializer (#${nextTaskNum})`,
      tenantId: 'acme-corp',
      workspaceId: 'engineering/wasm',
      manifestHash: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      diffHash: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      baseRevision: 'git-sha:7b82ef4 (main@HEAD)',
      candidateRevision: `git-sha:9a11ef${nextTaskNum} (worktree:${newTaskId})`,
      targetBranch: 'main',
      rollbackRef: `git-revert:9a11ef${nextTaskNum} || pr-close:14${nextTaskNum}`,
      authorityEpoch: 43,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      effectClass: 'engineering.patch.promote',
      status: 'pending approval',
      candidatePaths: [
        { path: `core/wasm-bridge/src/serializer_${nextTaskNum}.rs`, action: 'create', additions: 120, deletions: 0 },
        { path: 'core/wasm-bridge/Cargo.toml', action: 'modify', additions: 3, deletions: 1 }
      ],
      gates: {
        manifestIntegrity: true,
        testsPassed: true,
        gideonVerdict: 'PASS',
        vfsAttestation: true,
        sentinelPolicyAllowed: true,
        receiptChainHealthy: true
      },
      summary: 'Automated atomic optimization emitted by Sir Forge. Ready for human operator gate evaluation.',
      authorWorkload: 'merlin-engineering-forge / sir-forge (node-01)'
    };

    setCandidates(prev => [newCandidate, ...prev]);
    setSelectedCandidateId(newId);
    if (onNotify) {
      onNotify(`✨ Sir Forge emitted new candidate artifact [${newTaskId}] into 'pending approval' state!`, 'success');
    }
  };

  const panels = [
    { id: 'APPROVAL_DRAWER', label: 'Approval Drawer (Excalibur)', icon: KeyRound, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'MISSION_OVERVIEW', label: 'Mission Overview', icon: Activity },
    { id: 'BLUEPRINT', label: 'Blueprint Truth', icon: Layers },
    { id: 'DAG_VIEW', label: 'DAG View', icon: Workflow },
    { id: 'DIFF_VIEW', label: 'Diff View', icon: GitPullRequest },
    { id: 'WORKCELL_VIEW', label: 'Workcell View', icon: Server },
    { id: 'GIDEON_VERDICT', label: 'Gideon Verdict', icon: Shield },
    { id: 'RECEIPT_TIMELINE', label: 'Receipt Timeline', icon: Clock },
    { id: 'INCIDENT_CONTROLS', label: 'Incident Controls', icon: AlertTriangle }
  ];

  return (
    <div className="h-full flex flex-col font-mono text-gray-200">
      {/* Header with Reactive Status KPIs */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B0C18] via-[#0A0F1A] to-[#0A1A17] border-2 border-[#10B981]/40 p-5 shadow-2xl backdrop-blur-xl mb-4 shrink-0">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-inner shrink-0">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2 flex-wrap">
                Swarm Command Center
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-bold">
                  EXECUTIVE AUTHORITY
                </span>
              </h1>
              <p className="text-xs text-gray-400 font-sans mt-1">
                Reactive candidate artifact state engine. Tracks and mutates lifecycle across <span className="text-amber-300 font-bold">&apos;pending approval&apos;</span>, <span className="text-cyan-300 font-bold">&apos;approved&apos;</span>, and <span className="text-emerald-300 font-bold">&apos;signed&apos;</span>.
              </p>
            </div>
          </div>

          {/* Interactive Status Badges & Emission Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            {/* KPI 1: Pending */}
            <button
              onClick={() => {
                setActivePanel('APPROVAL_DRAWER');
                const p = candidates.find(c => c.status === 'pending approval');
                if (p) setSelectedCandidateId(p.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/50 text-amber-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Clock size={13} className="animate-pulse" />
              <span>Pending:</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black font-black text-[10px]">
                {pendingCount}
              </span>
            </button>

            {/* KPI 2: Approved */}
            <button
              onClick={() => {
                setActivePanel('APPROVAL_DRAWER');
                const a = candidates.find(c => c.status === 'approved');
                if (a) setSelectedCandidateId(a.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/50 text-cyan-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <CheckCheck size={13} />
              <span>Approved:</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500 text-black font-black text-[10px]">
                {approvedCount}
              </span>
            </button>

            {/* KPI 3: Signed */}
            <button
              onClick={() => {
                setActivePanel('APPROVAL_DRAWER');
                const s = candidates.find(c => c.status === 'signed');
                if (s) setSelectedCandidateId(s.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <ShieldCheck size={13} />
              <span>Signed:</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-black font-black text-[10px]">
                {signedCount}
              </span>
            </button>

            {/* Simulate Worker Emission */}
            <button
              onClick={handleSimulateNewCandidate}
              className="px-3 py-1.5 rounded-xl bg-[#0F1824] hover:bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus size={13} />
              <span>Emit Candidate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Sidebar Navigation */}
        <div className="w-60 shrink-0 flex flex-col gap-1.5 overflow-y-auto custom-scroll pr-2">
          {panels.map((panel) => {
            const isActive = activePanel === panel.id;
            const Icon = panel.icon;
            return (
              <button
                key={panel.id}
                onClick={() => setActivePanel(panel.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-[#090A0F] text-gray-400 border border-[#141824] hover:bg-[#10131C] hover:border-[#1E2638] hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={14} className={isActive ? 'text-emerald-400' : 'text-gray-500'} />
                  <span>{panel.label}</span>
                </div>
                {panel.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[9px] font-black">
                    {panel.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#05060A] border border-[#141824] rounded-2xl overflow-y-auto custom-scroll p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* PANEL 1: APPROVAL DRAWER (EXCALIBUR) */}
              {activePanel === 'APPROVAL_DRAWER' && (
                <ExcaliburApprovalDrawer
                  candidates={candidates}
                  selectedCandidateId={selectedCandidateId}
                  onSelectCandidateId={setSelectedCandidateId}
                  onApproveCandidate={handleApproveCandidate}
                  onSignCandidate={handleSignCandidate}
                  onDenyCandidate={handleDenyCandidate}
                  onResetCandidate={handleResetCandidate}
                  onChangeTargetBranch={handleChangeTargetBranch}
                  onNotify={onNotify}
                />
              )}

              {/* PANEL 2: MISSION OVERVIEW */}
              {activePanel === 'MISSION_OVERVIEW' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#141824] pb-2">
                    <h2 className="text-lg font-black text-emerald-300 uppercase tracking-widest">
                      Mission Executive Overview
                    </h2>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold">
                      SWARM ACTIVE
                    </span>
                  </div>

                  {/* Active Mission Metadata Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-[#0A0D14] border border-[#1A2235] rounded-xl space-y-1">
                      <div className="text-[10px] text-gray-500 font-bold uppercase">Active Task Artifact</div>
                      <div className="text-sm text-emerald-400 font-bold font-mono">{selectedCandidate.taskId}: {selectedCandidate.title.slice(0, 20)}...</div>
                    </div>
                    <div className="p-4 bg-[#0A0D14] border border-[#1A2235] rounded-xl space-y-1">
                      <div className="text-[10px] text-gray-500 font-bold uppercase">Artifact Status</div>
                      <div className="text-sm font-bold font-mono">
                        <span className={`px-2 py-0.5 rounded text-xs uppercase ${
                          selectedCandidate.status === 'pending approval' ? 'bg-amber-950 text-amber-300 border border-amber-600' :
                          selectedCandidate.status === 'approved' ? 'bg-cyan-950 text-cyan-300 border border-cyan-600' :
                          selectedCandidate.status === 'signed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' :
                          'bg-rose-950 text-rose-300 border border-rose-600'
                        }`}>
                          {selectedCandidate.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-[#0A0D14] border border-[#1A2235] rounded-xl space-y-1">
                      <div className="text-[10px] text-gray-500 font-bold uppercase">Target Branch</div>
                      <div className="text-sm text-cyan-300 font-mono font-bold">refs/heads/{selectedCandidate.targetBranch}</div>
                    </div>
                    <div className="p-4 bg-[#0A0D14] border border-[#1A2235] rounded-xl space-y-1">
                      <div className="text-[10px] text-gray-500 font-bold uppercase">Authority Epoch</div>
                      <div className="text-sm text-purple-300 font-mono font-bold">Epoch #{selectedCandidate.authorityEpoch} (Locked)</div>
                    </div>
                  </div>

                  {/* Candidate Artifact Lifecycle Flow */}
                  <div className="p-5 rounded-2xl bg-[#080B14] border border-[#15202E] space-y-4">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Workflow size={15} className="text-emerald-400" />
                      Candidate Artifact Promotion Lifecycle
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Step 1 */}
                      <div className={`p-4 rounded-xl border ${
                        selectedCandidate.status === 'pending approval'
                          ? 'bg-amber-950/30 border-amber-500/60'
                          : 'bg-[#090D18] border-[#162130]'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-amber-400 uppercase">Stage 1</span>
                          {selectedCandidate.status !== 'pending approval' && <CheckCircle2 size={13} className="text-emerald-400" />}
                        </div>
                        <div className="text-xs font-bold text-white mb-1">Pending Approval</div>
                        <p className="text-[11px] text-gray-400 font-sans">
                          Preflight gates verified by Gideon. Awaiting operator audit.
                        </p>
                        {selectedCandidate.status === 'pending approval' && (
                          <button
                            onClick={() => handleApproveCandidate(selectedCandidate.id)}
                            className="mt-3 w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                          >
                            Approve Artifact
                          </button>
                        )}
                      </div>

                      {/* Step 2 */}
                      <div className={`p-4 rounded-xl border ${
                        selectedCandidate.status === 'approved'
                          ? 'bg-cyan-950/30 border-cyan-500/60'
                          : 'bg-[#090D18] border-[#162130]'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-cyan-400 uppercase">Stage 2</span>
                          {selectedCandidate.status === 'signed' && <CheckCircle2 size={13} className="text-emerald-400" />}
                        </div>
                        <div className="text-xs font-bold text-white mb-1">Approved by Operator</div>
                        <p className="text-[11px] text-gray-400 font-sans">
                          Operator confirmed manifest integrity. Ready for ED25519 signature.
                        </p>
                        {selectedCandidate.status === 'approved' && (
                          <button
                            onClick={() => handleSignCandidate(selectedCandidate.id)}
                            className="mt-3 w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Sparkles size={11} /> Sign Warrant
                          </button>
                        )}
                      </div>

                      {/* Step 3 */}
                      <div className={`p-4 rounded-xl border ${
                        selectedCandidate.status === 'signed'
                          ? 'bg-emerald-950/30 border-emerald-500/60'
                          : 'bg-[#090D18] border-[#162130]'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">Stage 3</span>
                          {selectedCandidate.status === 'signed' && <ShieldCheck size={13} className="text-emerald-400" />}
                        </div>
                        <div className="text-xs font-bold text-white mb-1">Signed & Warrant Issued</div>
                        <p className="text-[11px] text-gray-400 font-sans">
                          Cryptographic warrant committed to append-only ledger and merged.
                        </p>
                        {selectedCandidate.status === 'signed' && (
                          <div className="mt-3 text-[10px] text-emerald-300 font-mono">
                            ID: {selectedCandidate.warrantReceipt?.warrantId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fast Candidate Switcher */}
                  <div className="p-4 bg-[#0A0D15] rounded-xl border border-[#172230] space-y-2">
                    <div className="text-xs font-bold text-gray-300 uppercase">Inspect Alternate Candidates</div>
                    <div className="flex flex-wrap gap-2">
                      {candidates.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCandidateId(c.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            c.id === selectedCandidate.id
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-[#0F1420] text-gray-300 border border-[#1E283A] hover:border-emerald-500/40'
                          }`}
                        >
                          <span>{c.taskId}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded uppercase ${
                            c.status === 'pending approval' ? 'bg-amber-950 text-amber-300' :
                            c.status === 'approved' ? 'bg-cyan-950 text-cyan-300' :
                            c.status === 'signed' ? 'bg-emerald-950 text-emerald-300' :
                            'bg-rose-950 text-rose-300'
                          }`}>
                            {c.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 3: DAG VIEW */}
              {activePanel === 'DAG_VIEW' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#141824] pb-2">
                    <h2 className="text-lg font-black text-emerald-300 uppercase tracking-widest">
                      Sealed Engineering Task DAG
                    </h2>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold">
                      Merlin Coordination Engine
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {candidates.map((cand) => (
                      <div
                        key={cand.id}
                        className={`p-4 rounded-xl border transition-all space-y-3 ${
                          cand.id === selectedCandidateId
                            ? 'bg-[#0B101C] border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                            : 'bg-[#0A0D15] border-[#172230]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white text-xs font-mono">{cand.taskId}</span>
                            <span className="text-xs text-gray-300 truncate max-w-[180px]">{cand.title}</span>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                            cand.status === 'pending approval' ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse' :
                            cand.status === 'approved' ? 'bg-cyan-950 text-cyan-300 border border-cyan-600' :
                            cand.status === 'signed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' :
                            'bg-rose-950 text-rose-300 border border-rose-600'
                          }`}>
                            {cand.status}
                          </span>
                        </div>

                        <div className="text-[11px] text-gray-400 font-sans">
                          {cand.summary}
                        </div>

                        <div className="flex items-center justify-between text-[10px] pt-2 text-gray-500 border-t border-[#141C29] font-mono">
                          <span>Target: refs/heads/{cand.targetBranch}</span>
                          <span className="text-emerald-400 truncate max-w-[140px]">{cand.manifestHash.slice(0, 18)}...</span>
                        </div>

                        {/* Interactive Action Triggers directly from DAG */}
                        <div className="flex gap-2 pt-1">
                          {cand.status === 'pending approval' && (
                            <button
                              onClick={() => {
                                setSelectedCandidateId(cand.id);
                                handleApproveCandidate(cand.id);
                              }}
                              className="flex-1 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-300 text-[10px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <CheckCheck size={11} /> Approve Artifact
                            </button>
                          )}
                          {cand.status === 'approved' && (
                            <button
                              onClick={() => {
                                setSelectedCandidateId(cand.id);
                                handleSignCandidate(cand.id);
                              }}
                              disabled={isSigningCandidateId === cand.id}
                              className="flex-1 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              {isSigningCandidateId === cand.id ? <RefreshCw size={11} className="animate-spin" /> : <Sparkles size={11} />}
                              <span>Sign Consequential Warrant</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedCandidateId(cand.id);
                              setActivePanel('APPROVAL_DRAWER');
                            }}
                            className="px-2.5 py-1.5 bg-[#101622] hover:bg-[#162030] border border-[#1A2638] text-gray-300 text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer"
                          >
                            <KeyRound size={11} /> Drawer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PANEL 4: DIFF VIEW */}
              {activePanel === 'DIFF_VIEW' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#141824] pb-2">
                    <div>
                      <h2 className="text-lg font-black text-emerald-300 uppercase tracking-widest">
                        Attested Candidate Diff Inspector
                      </h2>
                      <span className="text-xs text-gray-400">
                        Inspecting candidate: <strong className="text-white">{selectedCandidate.taskId}</strong> ({selectedCandidate.title})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        selectedCandidate.status === 'pending approval' ? 'bg-amber-950 text-amber-300 border border-amber-600' :
                        selectedCandidate.status === 'approved' ? 'bg-cyan-950 text-cyan-300 border border-cyan-600' :
                        selectedCandidate.status === 'signed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' :
                        'bg-rose-950 text-rose-300 border border-rose-600'
                      }`}>
                        Status: {selectedCandidate.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions for active diff */}
                  <div className="p-3 bg-[#0A0D15] rounded-xl border border-[#172230] flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-gray-400 font-mono">
                      Diff Hash: <span className="text-purple-300">{selectedCandidate.diffHash}</span>
                    </div>
                    <div className="flex gap-2">
                      {selectedCandidate.status === 'pending approval' && (
                        <button
                          onClick={() => handleApproveCandidate(selectedCandidate.id)}
                          className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold cursor-pointer flex items-center gap-1"
                        >
                          <CheckCheck size={12} /> Approve Artifact
                        </button>
                      )}
                      {selectedCandidate.status === 'approved' && (
                        <button
                          onClick={() => handleSignCandidate(selectedCandidate.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles size={12} /> Sign Warrant
                        </button>
                      )}
                      <button
                        onClick={() => setActivePanel('APPROVAL_DRAWER')}
                        className="px-3 py-1 bg-[#121926] hover:bg-[#182336] border border-[#1A2638] text-gray-300 rounded text-xs font-bold cursor-pointer"
                      >
                        Open Approval Drawer
                      </button>
                    </div>
                  </div>

                  {/* Diff files */}
                  <div className="space-y-3">
                    {selectedCandidate.candidatePaths.map((pathItem, idx) => (
                      <div key={idx} className="p-4 bg-[#07090F] rounded-xl border border-[#141C29] space-y-2">
                        <div className="flex items-center justify-between text-xs border-b border-[#141C29] pb-2">
                          <div className="flex items-center gap-2">
                            <FileCode size={14} className="text-emerald-400" />
                            <span className="font-mono text-white font-bold">{pathItem.path}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[10px]">
                            <span className="text-emerald-400 font-bold">+{pathItem.additions}</span>
                            <span className="text-rose-400 font-bold">-{pathItem.deletions}</span>
                          </div>
                        </div>

                        {/* Simulated Diff Content */}
                        <div className="bg-black/80 p-3 rounded font-mono text-[11px] space-y-1 text-gray-400 overflow-x-auto">
                          <div className="text-gray-600">@@ -1,12 +1,24 @@</div>
                          <div className="text-gray-500"> import &#123; createHash &#125; from &apos;crypto&apos;;</div>
                          <div className="text-emerald-400 bg-emerald-950/40 px-1">+ export function exportAuditReceipt(tenantId: string, manifestHash: string) &#123;</div>
                          <div className="text-emerald-400 bg-emerald-950/40 px-1">+   const payload = &#123; tenantId, manifestHash, timestamp: Date.now() &#125;;</div>
                          <div className="text-emerald-400 bg-emerald-950/40 px-1">+   return signWithSovereignAuthority(payload);</div>
                          <div className="text-emerald-400 bg-emerald-950/40 px-1">+ &#125;</div>
                          <div className="text-gray-500"> export default exportAuditReceipt;</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PANEL 5: WORKCELL VIEW */}
              {activePanel === 'WORKCELL_VIEW' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#141824] pb-2">
                    <h2 className="text-lg font-black text-emerald-300 uppercase tracking-widest">
                      Active Worker Node Workcells
                    </h2>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold">
                      4 WORKCELLS RUNNING
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { node: 'node-01 (Sir Forge)', role: 'Implementation Engine', assigned: 'T-004', status: 'IDLE / EMITTED' },
                      { node: 'node-02 (Sir Owl)', role: 'Static Complexity Auditor', assigned: 'T-005', status: 'AUDITING' },
                      { node: 'node-00 (Sir Sentinel)', role: 'Security Quorum Monitor', assigned: 'T-003', status: 'PATROLLING' },
                      { node: 'node-03 (Sir Oracle)', role: 'Spec & Contract Refiner', assigned: 'T-001', status: 'SYNCED' }
                    ].map((w, idx) => {
                      const cand = candidates.find(c => c.taskId === w.assigned);
                      return (
                        <div key={idx} className="p-4 bg-[#0A0D15] rounded-xl border border-[#172230] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{w.node}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold">
                              {w.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">{w.role}</div>
                          {cand && (
                            <div className="mt-2 p-2 bg-black/60 rounded border border-[#16212E] flex items-center justify-between text-xs">
                              <span className="text-gray-300 font-mono">{cand.taskId}: {cand.title.slice(0, 18)}...</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold ${
                                cand.status === 'pending approval' ? 'bg-amber-950 text-amber-300' :
                                cand.status === 'approved' ? 'bg-cyan-950 text-cyan-300' :
                                cand.status === 'signed' ? 'bg-emerald-950 text-emerald-300' :
                                'bg-rose-950 text-rose-300'
                              }`}>
                                {cand.status}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PANEL 6: GIDEON VERDICT */}
              {activePanel === 'GIDEON_VERDICT' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#141824] pb-2">
                    <h2 className="text-lg font-black text-emerald-300 uppercase tracking-widest">
                      Gideon Independent Verifier
                    </h2>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold">
                      VERDICT: ALL 5 ARCHETYPES PASS
                    </span>
                  </div>

                  <div className="p-4 bg-[#0A0D15] rounded-xl border border-emerald-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <ShieldCheck size={16} /> All 5 Failure Archetypes Evaluated & Passed for Candidate: {selectedCandidate.taskId}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-black/40 rounded border border-[#172230] flex justify-between">
                        <span className="text-gray-400">1. Scope Escape Test:</span>
                        <span className="text-emerald-400 font-bold">CLEARED (VFS Constrained)</span>
                      </div>
                      <div className="p-2 bg-black/40 rounded border border-[#172230] flex justify-between">
                        <span className="text-gray-400">2. Secret Redaction:</span>
                        <span className="text-emerald-400 font-bold">CLEARED (0 Leaks)</span>
                      </div>
                      <div className="p-2 bg-black/40 rounded border border-[#172230] flex justify-between">
                        <span className="text-gray-400">3. Contract Schema Check:</span>
                        <span className="text-emerald-400 font-bold">CLEARED (WASM MsgPack)</span>
                      </div>
                      <div className="p-2 bg-black/40 rounded border border-[#172230] flex justify-between">
                        <span className="text-gray-400">4. Authority Epoch Match:</span>
                        <span className="text-emerald-400 font-bold">EPOCH #{selectedCandidate.authorityEpoch} MATCH</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 7: RECEIPT TIMELINE */}
              {activePanel === 'RECEIPT_TIMELINE' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#141824] pb-2">
                    <h2 className="text-lg font-black text-emerald-300 uppercase tracking-widest">
                      Immutable Cryptographic Receipt Ledger
                    </h2>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold">
                      APPEND-ONLY SHA-256
                    </span>
                  </div>

                  <div className="space-y-3">
                    {candidates.map((cand) => (
                      <div key={cand.id} className="p-4 bg-[#080B14] rounded-xl border border-[#162130] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Database size={14} className="text-emerald-400" />
                            <span className="font-bold text-white font-mono">{cand.taskId}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold ${
                              cand.status === 'pending approval' ? 'bg-amber-950 text-amber-300 border border-amber-700' :
                              cand.status === 'approved' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' :
                              cand.status === 'signed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
                              'bg-rose-950 text-rose-300 border border-rose-700'
                            }`}>
                              {cand.status}
                            </span>
                          </div>
                          <span className="text-gray-500 text-[10px]">
                            {cand.signedAt || cand.approvedAt || cand.expiresAt}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono truncate">
                          Manifest: {cand.manifestHash}
                        </div>
                        {cand.warrantReceipt && (
                          <div className="p-2 bg-black/60 rounded border border-emerald-950 text-[10px] text-emerald-300 font-mono truncate">
                            Warrant ID: {cand.warrantReceipt.warrantId} | Sig: {cand.warrantReceipt.signature.slice(0, 32)}...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PANEL 8: BLUEPRINT */}
              {activePanel === 'BLUEPRINT' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-black text-emerald-300 uppercase tracking-widest border-b border-[#141824] pb-2">Blueprint Truth</h2>
                  <div className="space-y-3">
                    <div className="p-4 bg-[#0A0D14] border border-[#1A2235] rounded-xl">
                      <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Acceptance Criteria</h3>
                      <ul className="list-disc pl-4 space-y-1 text-sm text-gray-300">
                        <li>Export is tenant scoped, redacted, and receipt-backed</li>
                        <li>Export does not include secrets or unauthorized tenant data</li>
                        <li>Requires explicit sovereign promotion signature before target branch mutation</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-[#0A0D14] border border-[#1A2235] rounded-xl">
                      <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Non-Goals</h3>
                      <ul className="list-disc pl-4 space-y-1 text-sm text-gray-300">
                        <li>No changes to external connector permissions</li>
                        <li>No unverified fast-forward merges</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 9: INCIDENT CONTROLS */}
              {activePanel === 'INCIDENT_CONTROLS' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-black text-rose-400 uppercase tracking-widest border-b border-[#141824] pb-2">
                    Emergency Incident & Revocation Controls
                  </h2>
                  <div className="p-5 bg-rose-950/20 border border-rose-500/40 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                      <AlertTriangle size={18} />
                      <span>Immediate Lease Quarantine</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Revoke all active worktree ephemeral leases, block promotion gates, and quarantine any pending candidate artifacts.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          candidates.forEach(c => handleDenyCandidate(c.id));
                          if (onNotify) onNotify('🚨 All active candidate artifact leases revoked and quarantined!', 'warning');
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Quarantine All Candidates
                      </button>
                      <button
                        onClick={() => {
                          setCandidates(INITIAL_PROMOTION_CANDIDATES);
                          if (onNotify) onNotify('Restored default candidate registry states', 'success');
                        }}
                        className="px-4 py-2 bg-[#121824] hover:bg-[#1C2538] text-gray-300 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Restore Defaults
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
