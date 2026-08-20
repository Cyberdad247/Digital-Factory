import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  KeyRound,
  FileCheck,
  GitPullRequest,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Clock,
  Copy,
  Check,
  FileCode,
  Terminal,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Zap,
  Sparkles,
  ArrowUpRight,
  Database,
  Layers,
  Fingerprint,
  Filter,
  CheckCheck,
  Send,
  RotateCcw,
  Plus,
  Users,
  UserCheck,
  UserPlus
} from 'lucide-react';

export type CandidateArtifactStatus = 'pending approval' | 'approved' | 'signed' | 'denied';

export interface CandidateAuthorization {
  id: string;
  authorizedBy: string;
  role: 'OPERATOR' | 'SECURITY_WARDEN' | 'RELEASE_SOVEREIGN' | 'VFS_GUARDIAN';
  roleName: string;
  authorizedAt: string;
  signatureDigest: string;
  note?: string;
}

export interface PromotionCandidate {
  id: string;
  taskId: string;
  title: string;
  tenantId: string;
  workspaceId: string;
  manifestHash: string;
  diffHash: string;
  baseRevision: string;
  candidateRevision: string;
  targetBranch: string;
  rollbackRef: string;
  authorityEpoch: number;
  expiresAt: string;
  effectClass: 'engineering.patch.promote' | 'infra.config.apply' | 'connector.schema.migrate';
  status: CandidateArtifactStatus;
  authorizations?: CandidateAuthorization[];
  requiredAuthorizations?: number;
  approvedBy?: string;
  approvedAt?: string;
  signedBy?: string;
  signedAt?: string;
  warrantReceipt?: ExcaliburWarrantReceipt;
  candidatePaths: {
    path: string;
    action: 'modify' | 'create' | 'delete';
    additions: number;
    deletions: number;
  }[];
  gates: {
    manifestIntegrity: boolean;
    testsPassed: boolean;
    gideonVerdict: 'PASS' | 'BLOCK' | 'PENDING';
    vfsAttestation: boolean;
    sentinelPolicyAllowed: boolean;
    receiptChainHealthy: boolean;
  };
  summary: string;
  authorWorkload: string;
}

export interface ExcaliburWarrantReceipt {
  receiptId: string;
  warrantId: string;
  candidateId: string;
  manifestHash: string;
  targetBranch: string;
  signedBy: string;
  signerRole: string;
  authorityEpoch: number;
  timestamp: string;
  signature: string;
  multiSignatures?: { role: string; signedBy: string; signatureDigest: string; timestamp: string }[];
  status: 'WARRANT_ISSUED' | 'DISPATCHED_TO_GATEWAY' | 'MERGED_TO_TARGET';
  rawPayload: Record<string, any>;
}

export const PROD_AUTHORIZING_ROLES: { role: CandidateAuthorization['role']; roleName: string; defaultSigner: string }[] = [
  { role: 'OPERATOR', roleName: 'Primary Operator', defaultSigner: 'Vizion711@gmail.com (Operator)' },
  { role: 'SECURITY_WARDEN', roleName: 'Security Warden', defaultSigner: 'Sir Galahad (Security Warden / SRE)' },
  { role: 'RELEASE_SOVEREIGN', roleName: 'Release Sovereign', defaultSigner: 'Merlin-Ω (Release Sovereign)' }
];

export const INITIAL_PROMOTION_CANDIDATES: PromotionCandidate[] = [
  {
    id: 'cand_prod_kernel_001',
    taskId: 'T-001',
    title: 'Promote sovereign WASM boundary isolate to production cluster',
    tenantId: 'acme-corp',
    workspaceId: 'engineering/core-prod',
    manifestHash: 'sha256:5a91ee7491ba90c1285091c1094ba41094ba41092041285091c1094ba41094ba',
    diffHash: 'sha256:881bc92041285091c1094ba41094ba41094ba41092041285091c1094ba41094ba',
    baseRevision: 'git-sha:8a1290e (PROD@HEAD)',
    candidateRevision: 'git-sha:9e3012c (worktree:T-001)',
    targetBranch: 'PROD',
    rollbackRef: 'git-revert:9e3012c || pr-close:149',
    authorityEpoch: 43,
    expiresAt: '2026-08-19T23:59:00Z',
    effectClass: 'engineering.patch.promote',
    status: 'pending approval',
    requiredAuthorizations: 3,
    authorizations: [
      {
        id: 'auth_1',
        authorizedBy: 'Vizion711@gmail.com (Operator)',
        role: 'OPERATOR',
        roleName: 'Primary Operator',
        authorizedAt: '2026-08-19T21:10:00Z',
        signatureDigest: 'ed25519_digest:0x7a81b2c3d4e5f6a1',
        note: 'Verified sandbox memory isolation bounds and smoke tests.'
      }
    ],
    candidatePaths: [
      { path: 'kernel/wasm-runtime/src/isolate.rs', action: 'modify', additions: 142, deletions: 18 },
      { path: 'kernel/wasm-runtime/src/memory_guard.rs', action: 'create', additions: 88, deletions: 0 },
      { path: 'config/prod/cluster-policy.toml', action: 'modify', additions: 12, deletions: 2 }
    ],
    gates: {
      manifestIntegrity: true,
      testsPassed: true,
      gideonVerdict: 'PASS',
      vfsAttestation: true,
      sentinelPolicyAllowed: true,
      receiptChainHealthy: true
    },
    summary: 'Critical PROD upgrade introducing strict capability-based WASM bounds. Requires 3 distinct authorizations (Operator, Security Warden, Release Sovereign).',
    authorWorkload: 'merlin-engineering-forge / sir-architect (node-00)'
  },
  {
    id: 'cand_receipt_export_004',
    taskId: 'T-004',
    title: 'Add tenant-safe approval receipt export',
    tenantId: 'acme-corp',
    workspaceId: 'engineering/core',
    manifestHash: 'sha256:8f43a9b1c720e5429188e63bb79011ea3d014c2780e12fd97103e64f7b494ab1',
    diffHash: 'sha256:d62a98f7e21b8c66e921d00c35fa9241bba69e120489aa59f323e070529e71b2',
    baseRevision: 'git-sha:4f912c9 (main@HEAD~1)',
    candidateRevision: 'git-sha:7b82ef4 (worktree:T-004)',
    targetBranch: 'main',
    rollbackRef: 'git-revert:7b82ef4 || pr-close:142',
    authorityEpoch: 43,
    expiresAt: '2026-08-19T21:34:00Z',
    effectClass: 'engineering.patch.promote',
    status: 'pending approval',
    requiredAuthorizations: 1,
    authorizations: [],
    candidatePaths: [
      { path: 'services/receipt-service/src/export.ts', action: 'modify', additions: 84, deletions: 12 },
      { path: 'services/receipt-service/test/export.spec.ts', action: 'create', additions: 142, deletions: 0 },
      { path: 'apps/pwa/src/components/operator_console/ExportReceiptDrawer.tsx', action: 'create', additions: 196, deletions: 0 }
    ],
    gates: {
      manifestIntegrity: true,
      testsPassed: true,
      gideonVerdict: 'PASS',
      vfsAttestation: true,
      sentinelPolicyAllowed: true,
      receiptChainHealthy: true
    },
    summary: 'Implements tenant-scoped, cryptographic receipt export controller with zero secret leak and append-only hash tracking.',
    authorWorkload: 'merlin-engineering-forge / sir-forge (node-01)'
  },
  {
    id: 'cand_vfs_boundary_005',
    taskId: 'T-005',
    title: 'Enforce VFS worktree sandbox quota constraints',
    tenantId: 'acme-corp',
    workspaceId: 'engineering/infra',
    manifestHash: 'sha256:4c12bb09e66104e7230198caef793b8214fa80e811bc23a19b009e4511d73a88',
    diffHash: 'sha256:119fa9928b74c0a5912389d44c9b2e10a76f281e5927c34b86e01a09d31f2490',
    baseRevision: 'git-sha:4f912c9 (main@HEAD~1)',
    candidateRevision: 'git-sha:2a910dc (worktree:T-005)',
    targetBranch: 'main',
    rollbackRef: 'git-revert:2a910dc || pr-close:143',
    authorityEpoch: 43,
    expiresAt: '2026-08-19T22:00:00Z',
    effectClass: 'engineering.patch.promote',
    status: 'approved',
    requiredAuthorizations: 1,
    approvedBy: 'Vizion711@gmail.com (Operator)',
    approvedAt: '2026-08-19T20:05:00Z',
    authorizations: [
      {
        id: 'auth_vfs_1',
        authorizedBy: 'Vizion711@gmail.com (Operator)',
        role: 'OPERATOR',
        roleName: 'Primary Operator',
        authorizedAt: '2026-08-19T20:05:00Z',
        signatureDigest: 'ed25519_digest:0x9c41a2f5'
      }
    ],
    candidatePaths: [
      { path: 'packages/vfs-guardian/src/worktree.rs', action: 'modify', additions: 45, deletions: 8 },
      { path: 'packages/vfs-guardian/tests/quota_test.rs', action: 'create', additions: 98, deletions: 0 }
    ],
    gates: {
      manifestIntegrity: true,
      testsPassed: true,
      gideonVerdict: 'PASS',
      vfsAttestation: true,
      sentinelPolicyAllowed: true,
      receiptChainHealthy: true
    },
    summary: 'Hardens scratch directory quota tracking to eliminate memory leak vectors during Knight swarm compilation.',
    authorWorkload: 'merlin-engineering-forge / sir-owl (node-02)'
  },
  {
    id: 'cand_auth_epoch_003',
    taskId: 'T-003',
    title: 'Migrate Camelot authority epoch synchronization',
    tenantId: 'acme-corp',
    workspaceId: 'engineering/security',
    manifestHash: 'sha256:3e29bb11a98075f141201984ea892c908214fa80e811bc23a19b009e451199a0',
    diffHash: 'sha256:779bc901844b2e10a76f281e5927c34b86e01a09d31f2490a119fa9928b74c0a',
    baseRevision: 'git-sha:3b129a0 (main@HEAD~2)',
    candidateRevision: 'git-sha:4f912c9 (worktree:T-003)',
    targetBranch: 'main',
    rollbackRef: 'git-revert:4f912c9 || pr-close:140',
    authorityEpoch: 43,
    expiresAt: '2026-08-19T20:30:00Z',
    effectClass: 'connector.schema.migrate',
    status: 'signed',
    requiredAuthorizations: 1,
    approvedBy: 'Vizion711@gmail.com (Operator)',
    approvedAt: '2026-08-19T19:40:00Z',
    signedBy: 'Vizion711@gmail.com (Arthurian Sovereign)',
    signedAt: '2026-08-19T19:42:00Z',
    authorizations: [
      {
        id: 'auth_epoch_1',
        authorizedBy: 'Vizion711@gmail.com (Operator)',
        role: 'OPERATOR',
        roleName: 'Primary Operator',
        authorizedAt: '2026-08-19T19:40:00Z',
        signatureDigest: 'ed25519_digest:0x3e29bb11'
      }
    ],
    warrantReceipt: {
      receiptId: 'receipt_prom_1724103720000',
      warrantId: 'warrant_excalibur_7f9b2a',
      candidateId: 'cand_auth_epoch_003',
      manifestHash: 'sha256:3e29bb11a98075f141201984ea892c908214fa80e811bc23a19b009e451199a0',
      targetBranch: 'main',
      signedBy: 'Vizion711@gmail.com (Arthurian Sovereign)',
      signerRole: 'SOVEREIGN_OPERATOR_EXCALIBUR',
      authorityEpoch: 43,
      timestamp: '2026-08-19T19:42:00.000Z',
      signature: 'ed25519_sig:9f8e7d6c5b4a3928172635445362718293a4b5c6d7e8f9011223344556677889',
      status: 'MERGED_TO_TARGET',
      rawPayload: {
        warrant_version: 'camelot.excalibur.warrant/v1',
        task_id: 'T-003',
        status: 'MERGED_TO_TARGET',
        signed_epoch: 43
      }
    },
    candidatePaths: [
      { path: 'security/epoch-sync/src/sync.rs', action: 'modify', additions: 52, deletions: 14 },
      { path: 'security/epoch-sync/tests/epoch_test.rs', action: 'create', additions: 110, deletions: 0 }
    ],
    gates: {
      manifestIntegrity: true,
      testsPassed: true,
      gideonVerdict: 'PASS',
      vfsAttestation: true,
      sentinelPolicyAllowed: true,
      receiptChainHealthy: true
    },
    summary: 'Ensures distributed nodes adhere to monotonic epoch ticks with cryptographic quorum verification.',
    authorWorkload: 'merlin-engineering-forge / sir-sentinel (node-00)'
  }
];

interface ExcaliburApprovalDrawerProps {
  candidates?: PromotionCandidate[];
  selectedCandidateId?: string;
  onSelectCandidateId?: (id: string) => void;
  onApproveCandidate?: (id: string, role?: CandidateAuthorization['role']) => void;
  onSignCandidate?: (id: string) => void;
  onDenyCandidate?: (id: string) => void;
  onResetCandidate?: (id: string) => void;
  onChangeTargetBranch?: (id: string, branch: string) => void;
  onNotify?: (message: string, type?: 'success' | 'warning') => void;
}

export function ExcaliburApprovalDrawer({
  candidates: propCandidates,
  selectedCandidateId: propSelectedId,
  onSelectCandidateId,
  onApproveCandidate,
  onSignCandidate,
  onDenyCandidate,
  onResetCandidate,
  onChangeTargetBranch,
  onNotify
}: ExcaliburApprovalDrawerProps) {
  // Local fallback if not supplied by parent
  const [internalCandidates, setInternalCandidates] = useState<PromotionCandidate[]>(INITIAL_PROMOTION_CANDIDATES);
  const [internalSelectedId, setInternalSelectedId] = useState<string>('cand_receipt_export_004');
  const [statusFilter, setStatusFilter] = useState<'all' | CandidateArtifactStatus>('all');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [activeReceiptModal, setActiveReceiptModal] = useState<ExcaliburWarrantReceipt | null>(null);
  const [showRawManifest, setShowRawManifest] = useState(false);

  const candidates = propCandidates || internalCandidates;
  const currentSelectedId = propSelectedId || internalSelectedId;
  const setCandidateId = (id: string) => {
    if (onSelectCandidateId) {
      onSelectCandidateId(id);
    } else {
      setInternalSelectedId(id);
    }
  };

  const selectedCandidate = candidates.find(c => c.id === currentSelectedId) || candidates[0];

  // Filtered candidate list
  const filteredCandidates = candidates.filter(c => {
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
  });

  // Copy helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    if (onNotify) onNotify(`Copied ${fieldName} to clipboard`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Check if all pre-flight conditions are satisfied
  const allGatesPassed = Object.values(selectedCandidate.gates).every(val => val === true || val === 'PASS');

  // Trigger Approve / Authorize
  const handleApprove = (roleToGrant?: CandidateAuthorization['role']) => {
    if (onApproveCandidate) {
      onApproveCandidate(selectedCandidate.id, roleToGrant);
    } else {
      const isProd = selectedCandidate.targetBranch === 'PROD';
      const reqCount = isProd ? (selectedCandidate.requiredAuthorizations || 3) : 1;
      const existingAuths = selectedCandidate.authorizations || [];

      // Determine next role to grant
      let targetRoleInfo = PROD_AUTHORIZING_ROLES.find(r => r.role === roleToGrant);
      if (!targetRoleInfo) {
        // Find first ungranted role from PROD_AUTHORIZING_ROLES
        const grantedRoles = new Set(existingAuths.map(a => a.role));
        targetRoleInfo = PROD_AUTHORIZING_ROLES.find(r => !grantedRoles.has(r.role)) || PROD_AUTHORIZING_ROLES[0];
      }

      const newAuth: CandidateAuthorization = {
        id: `auth_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        authorizedBy: targetRoleInfo.defaultSigner,
        role: targetRoleInfo.role,
        roleName: targetRoleInfo.roleName,
        authorizedAt: new Date().toISOString(),
        signatureDigest: `ed25519_digest:0x${Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        note: `Authorization token granted for ${selectedCandidate.targetBranch} release.`
      };

      const updatedAuths = [...existingAuths.filter(a => a.role !== targetRoleInfo.role), newAuth];
      const isFullyAuthorized = updatedAuths.length >= reqCount;

      setInternalCandidates(prev =>
        prev.map(c =>
          c.id === selectedCandidate.id
            ? {
                ...c,
                authorizations: updatedAuths,
                status: isFullyAuthorized ? 'approved' : 'pending approval',
                approvedBy: isFullyAuthorized
                  ? `${targetRoleInfo.roleName} & Quorum (${updatedAuths.length}/${reqCount})`
                  : `${targetRoleInfo.roleName} (${updatedAuths.length}/${reqCount})`,
                approvedAt: new Date().toISOString()
              }
            : c
        )
      );

      if (onNotify) {
        if (isFullyAuthorized) {
          onNotify(
            `⚔️ Quorum Complete! All ${reqCount} required authorizations acquired for [${selectedCandidate.taskId}]. Artifact is now APPROVED for ${selectedCandidate.targetBranch}.`,
            'success'
          );
        } else {
          onNotify(
            `✓ Added authorization from ${targetRoleInfo.roleName} (${updatedAuths.length}/${reqCount} signatures acquired for PROD).`,
            'success'
          );
        }
      }
    }
  };

  // Switch Target Branch
  const handleSwitchTargetBranch = (newBranch: string) => {
    if (onChangeTargetBranch) {
      onChangeTargetBranch(selectedCandidate.id, newBranch);
    } else {
      const isProd = newBranch === 'PROD';
      const reqCount = isProd ? 3 : 1;
      setInternalCandidates(prev =>
        prev.map(c => {
          if (c.id === selectedCandidate.id) {
            const currentAuths = c.authorizations || [];
            const isFullyAuth = currentAuths.length >= reqCount;
            return {
              ...c,
              targetBranch: newBranch,
              requiredAuthorizations: reqCount,
              status: c.status === 'signed' ? 'signed' : (isFullyAuth ? 'approved' : 'pending approval')
            };
          }
          return c;
        })
      );
      if (onNotify) {
        onNotify(`Target branch updated to [${newBranch}] (${newBranch === 'PROD' ? 'Multi-Sign Quorum Required: 3 Signatures' : 'Standard Quorum: 1 Signature'}).`, 'success');
      }
    }
  };

  // Trigger Sign
  const handleSign = () => {
    const isProd = selectedCandidate.targetBranch === 'PROD';
    const reqCount = isProd ? (selectedCandidate.requiredAuthorizations || 3) : 1;
    const authCount = (selectedCandidate.authorizations || []).length;

    if (authCount < reqCount && selectedCandidate.status !== 'approved') {
      if (onNotify) {
        onNotify(`Cannot sign warrant: PROD requires ${reqCount} distinct authorizations (${authCount}/${reqCount} acquired)!`, 'warning');
      }
      return;
    }

    if (!allGatesPassed) {
      if (onNotify) onNotify('Cannot sign warrant: All preflight gates must pass!', 'warning');
      return;
    }

    setIsSigning(true);

    setTimeout(() => {
      if (onSignCandidate) {
        onSignCandidate(selectedCandidate.id);
      } else {
        const newWarrantId = `warrant_excalibur_${Math.random().toString(36).substring(2, 9)}`;
        const newReceiptId = `receipt_prom_${Date.now()}`;
        const mockSig = `ed25519_sig:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

        const multiSigs = (selectedCandidate.authorizations || []).map(a => ({
          role: a.role,
          signedBy: a.authorizedBy,
          signatureDigest: a.signatureDigest,
          timestamp: a.authorizedAt
        }));

        const receiptPayload: ExcaliburWarrantReceipt = {
          receiptId: newReceiptId,
          warrantId: newWarrantId,
          candidateId: selectedCandidate.id,
          manifestHash: selectedCandidate.manifestHash,
          targetBranch: selectedCandidate.targetBranch,
          signedBy: 'Vizion711@gmail.com (Arthurian Sovereign)',
          signerRole: 'SOVEREIGN_OPERATOR_EXCALIBUR',
          authorityEpoch: selectedCandidate.authorityEpoch,
          timestamp: new Date().toISOString(),
          signature: mockSig,
          multiSignatures: multiSigs,
          status: 'WARRANT_ISSUED',
          rawPayload: {
            warrant_version: 'camelot.excalibur.warrant/v1',
            consequential_effect: selectedCandidate.effectClass,
            task_id: selectedCandidate.taskId,
            tenant_id: selectedCandidate.tenantId,
            workspace_id: selectedCandidate.workspaceId,
            manifest_hash: selectedCandidate.manifestHash,
            diff_hash: selectedCandidate.diffHash,
            target_branch: selectedCandidate.targetBranch,
            base_revision: selectedCandidate.baseRevision,
            candidate_revision: selectedCandidate.candidateRevision,
            rollback_ref: selectedCandidate.rollbackRef,
            authority_epoch: selectedCandidate.authorityEpoch,
            expires_at: selectedCandidate.expiresAt,
            multi_signatures: multiSigs,
            quorum_count: multiSigs.length,
            required_quorum: reqCount
          }
        };

        setInternalCandidates(prev =>
          prev.map(c =>
            c.id === selectedCandidate.id
              ? {
                  ...c,
                  status: 'signed',
                  signedBy: 'Vizion711@gmail.com (Arthurian Sovereign)',
                  signedAt: new Date().toISOString(),
                  warrantReceipt: receiptPayload
                }
              : c
          )
        );

        if (onNotify) {
          onNotify(
            `⚔️ Excalibur Warrant [${newWarrantId}] signed and issued with ${multiSigs.length}-signature quorum! Promotion to [${selectedCandidate.targetBranch}] authorized.`,
            'success'
          );
        }
      }
      setIsSigning(false);
    }, 1200);
  };

  // Trigger Deny
  const handleDeny = () => {
    if (onDenyCandidate) {
      onDenyCandidate(selectedCandidate.id);
    } else {
      setInternalCandidates(prev =>
        prev.map(c => (c.id === selectedCandidate.id ? { ...c, status: 'denied' } : c))
      );
      if (onNotify) onNotify(`Artifact ${selectedCandidate.taskId} marked as DENIED`, 'warning');
    }
  };

  // Trigger Reset
  const handleReset = () => {
    if (onResetCandidate) {
      onResetCandidate(selectedCandidate.id);
    } else {
      setInternalCandidates(prev =>
        prev.map(c =>
          c.id === selectedCandidate.id
            ? {
                ...c,
                status: 'pending approval',
                authorizations: [],
                approvedBy: undefined,
                approvedAt: undefined,
                signedBy: undefined,
                signedAt: undefined,
                warrantReceipt: undefined
              }
            : c
        )
      );
      if (onNotify) onNotify(`Artifact ${selectedCandidate.taskId} reset to PENDING APPROVAL`, 'success');
    }
  };

  // Status helper badges
  const getStatusBadge = (status: CandidateArtifactStatus) => {
    switch (status) {
      case 'pending approval':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 font-bold uppercase tracking-wider animate-pulse">
            <Clock size={11} /> Pending Approval
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 font-bold uppercase tracking-wider">
            <CheckCheck size={11} /> Approved
          </span>
        );
      case 'signed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <ShieldCheck size={11} /> Signed & Issued
          </span>
        );
      case 'denied':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/60 text-rose-300 font-bold uppercase tracking-wider">
            <Lock size={11} /> Denied
          </span>
        );
    }
  };

  const isProdTarget = selectedCandidate.targetBranch === 'PROD';
  const requiredAuthCount = isProdTarget ? (selectedCandidate.requiredAuthorizations || 3) : 1;
  const currentAuths = selectedCandidate.authorizations || [];
  const currentAuthCount = currentAuths.length;
  const isFullyAuthorized = currentAuthCount >= requiredAuthCount;
  const authProgressPercent = Math.min(100, Math.round((currentAuthCount / requiredAuthCount) * 100));

  return (
    <div className="space-y-6 font-mono text-gray-200">
      {/* Top Banner & Header with Status Filter Controls */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#090C16] via-[#091512] to-[#0A1D18] border-2 border-emerald-500/40 p-5 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)] flex items-center justify-center shrink-0">
              <KeyRound size={26} className="text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                  Excalibur Approval Warrant
                </h1>
                {getStatusBadge(selectedCandidate.status)}
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold">
                  Epoch #{selectedCandidate.authorityEpoch}
                </span>
                {isProdTarget && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-300 font-bold flex items-center gap-1">
                    <ShieldAlert size={10} /> PROD: Multi-Auth Quorum ({currentAuthCount}/{requiredAuthCount})
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 font-sans mt-1 max-w-2xl">
                Reactive state pipeline: Distinguish between <span className="text-amber-300 font-semibold">&apos;pending approval&apos;</span>, <span className="text-cyan-300 font-semibold">&apos;approved&apos;</span>, and <span className="text-emerald-300 font-semibold">&apos;signed&apos;</span>. PROD target requires 3 distinct cryptographic role authorizations before warrant issuance.
              </p>
            </div>
          </div>

          {/* Filter and Candidate Selectors */}
          <div className="flex flex-wrap items-center gap-2 bg-[#05070D] p-1.5 rounded-xl border border-[#17222B]">
            {/* Status Filter Buttons */}
            <div className="flex rounded-lg bg-[#0A0D15] p-1 border border-[#141C29]">
              {(['all', 'pending approval', 'approved', 'signed'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-2 py-1 text-[10px] font-bold rounded uppercase transition-all cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab.replace(' approval', '')}
                </button>
              ))}
            </div>

            {/* Candidate Dropdown */}
            <select
              value={currentSelectedId}
              onChange={(e) => setCandidateId(e.target.value)}
              className="bg-[#0D121D] border border-emerald-500/30 text-emerald-300 text-xs rounded-lg px-2.5 py-1.5 font-bold focus:outline-none focus:border-emerald-400 cursor-pointer max-w-[220px]"
            >
              {filteredCandidates.map(cand => (
                <option key={cand.id} value={cand.id}>
                  [{cand.status.toUpperCase()}] {cand.taskId} ({cand.targetBranch}): {cand.title.slice(0, 20)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic 3-State Progress Pipeline Bar */}
        <div className="relative z-10 mt-4 pt-4 border-t border-emerald-950/60 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div
            className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
              selectedCandidate.status === 'pending approval'
                ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : selectedCandidate.status === 'approved' || selectedCandidate.status === 'signed'
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                : 'bg-[#090C15] border-[#131A26] text-gray-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                selectedCandidate.status === 'pending approval' ? 'bg-amber-500 text-black' : 'bg-emerald-800 text-white'
              }`}>
                1
              </div>
              <div className="text-xs font-bold">1. Pending Approval</div>
            </div>
            {selectedCandidate.status !== 'pending approval' && <CheckCircle2 size={14} className="text-emerald-400" />}
          </div>

          <div
            className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
              selectedCandidate.status === 'approved'
                ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : selectedCandidate.status === 'signed'
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                : 'bg-[#090C15] border-[#131A26] text-gray-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                selectedCandidate.status === 'approved' ? 'bg-cyan-500 text-black' : selectedCandidate.status === 'signed' ? 'bg-emerald-800 text-white' : 'bg-gray-800 text-gray-400'
              }`}>
                2
              </div>
              <div className="text-xs font-bold">
                2. {isProdTarget ? `Quorum (${currentAuthCount}/${requiredAuthCount})` : 'Approved by Operator'}
              </div>
            </div>
            {selectedCandidate.status === 'signed' && <CheckCircle2 size={14} className="text-emerald-400" />}
          </div>

          <div
            className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
              selectedCandidate.status === 'signed'
                ? 'bg-emerald-950/50 border-emerald-500/70 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-[#090C15] border-[#131A26] text-gray-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                selectedCandidate.status === 'signed' ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400'
              }`}>
                3
              </div>
              <div className="text-xs font-bold">3. Signed & Warrant Issued</div>
            </div>
            {selectedCandidate.status === 'signed' && <ShieldCheck size={14} className="text-emerald-400" />}
          </div>
        </div>

        {/* PROD Secondary Progress Bar for Required Distinct Signatures */}
        {isProdTarget && (
          <div className="relative z-10 mt-4 pt-3 border-t border-purple-900/40 bg-purple-950/20 p-3 rounded-xl border border-purple-500/30">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-black text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-purple-400" />
                PROD Multi-Signature Quorum Progress
              </span>
              <span className="font-mono text-[11px] font-bold text-purple-200">
                {currentAuthCount} / {requiredAuthCount} Required Signatures ({authProgressPercent}%)
              </span>
            </div>
            
            {/* Secondary Progress Bar Container */}
            <div className="w-full bg-[#0A0D15] rounded-full h-3 p-0.5 border border-purple-500/40 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${authProgressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-full rounded-full transition-all ${
                  isFullyAuthorized
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                    : 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                }`}
              />
            </div>

            {/* Visual Multi-Signer Chips in Header */}
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
              {PROD_AUTHORIZING_ROLES.map((roleDef, i) => {
                const existingAuth = currentAuths.find(a => a.role === roleDef.role);
                const isSigned = !!existingAuth;
                return (
                  <div
                    key={roleDef.role}
                    className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
                      isSigned
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                        : 'bg-[#0A0D17] border-[#162030] text-gray-400'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-bold truncate">{i + 1}. {roleDef.roleName}</div>
                      <div className="text-[9px] text-gray-500 truncate">
                        {isSigned ? `✓ ${existingAuth.authorizedBy.split(' ')[0]}` : 'Awaiting Authorization'}
                      </div>
                    </div>
                    {isSigned ? (
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    ) : (
                      <Clock size={13} className="text-amber-500 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Candidate Warrant Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Manifest & Target Integrity (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Candidate Metadata Card */}
          <div className="p-5 rounded-2xl bg-[#07090F] border border-[#141E28] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#141E28] pb-3">
              <div className="flex items-center gap-2">
                <GitPullRequest size={16} className="text-emerald-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Promotion Candidate Specs
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedCandidate.status)}
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 font-bold">
                  {selectedCandidate.taskId}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-sm font-black text-emerald-300">{selectedCandidate.title}</h2>
              <p className="text-xs text-gray-400 font-sans">{selectedCandidate.summary}</p>
              
              {/* Approval & Signature metadata if available */}
              {(selectedCandidate.approvedBy || selectedCandidate.signedBy || currentAuths.length > 0) && (
                <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                  {currentAuths.map((auth) => (
                    <span
                      key={auth.id}
                      className="px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-mono flex items-center gap-1"
                    >
                      <CheckCircle2 size={11} className="text-cyan-400" />
                      {auth.roleName}: {auth.authorizedBy} ({new Date(auth.authorizedAt).toLocaleTimeString()})
                    </span>
                  ))}
                  {selectedCandidate.signedBy && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono flex items-center gap-1">
                      <Sparkles size={11} className="text-emerald-400" />
                      ⚔️ Signed: {selectedCandidate.signedBy} ({new Date(selectedCandidate.signedAt || '').toLocaleTimeString()})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Crucial Parameters: Manifest Hash, Target Branch, Rollback */}
            <div className="space-y-3 pt-2">
              {/* Manifest Hash */}
              <div className="p-3 bg-[#0B0F19] rounded-xl border border-emerald-500/30">
                <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase font-bold mb-1">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Fingerprint size={12} /> Candidate Manifest Hash (Immutable)
                  </span>
                  <button
                    onClick={() => handleCopy(selectedCandidate.manifestHash, 'Manifest Hash')}
                    className="hover:text-emerald-300 flex items-center gap-1 text-[10px] transition-colors cursor-pointer text-gray-500"
                  >
                    {copiedField === 'Manifest Hash' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    <span>Copy</span>
                  </button>
                </div>
                <code className="block text-[11px] text-emerald-300 bg-black/60 p-2 rounded border border-emerald-950 font-mono break-all select-all">
                  {selectedCandidate.manifestHash}
                </code>
              </div>

              {/* Target Branch with Interactive Branch Switcher & Diff Hash */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#0B0F19] rounded-xl border border-[#16212E] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase font-bold">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <GitBranch size={12} /> Target Branch
                    </span>
                    <span className="text-[9px] text-gray-500 font-normal">Switch target:</span>
                  </div>
                  
                  {/* Branch Selector Toggles */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {['main', 'staging', 'PROD'].map((branch) => {
                      const isActive = selectedCandidate.targetBranch === branch;
                      return (
                        <button
                          key={branch}
                          onClick={() => handleSwitchTargetBranch(branch)}
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            isActive
                              ? branch === 'PROD'
                                ? 'bg-purple-900/70 border border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                                : 'bg-cyan-950 border border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                              : 'bg-[#070A12] border border-[#141B26] text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          {branch}
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-[9px] text-gray-400 font-sans">
                    {isProdTarget ? '🔒 Requires 3 distinct authorizations' : '⚡ Single authorization quorum'}
                  </div>
                </div>

                <div className="p-3 bg-[#0B0F19] rounded-xl border border-[#16212E]">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase font-bold mb-1">
                    <span className="flex items-center gap-1 text-purple-400">
                      <Layers size={12} /> Diff Hash
                    </span>
                    <button
                      onClick={() => handleCopy(selectedCandidate.diffHash, 'Diff Hash')}
                      className="hover:text-purple-300 flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer"
                    >
                      {copiedField === 'Diff Hash' ? <Check size={11} className="text-purple-400" /> : <Copy size={11} />}
                    </button>
                  </div>
                  <code className="block text-[10px] text-purple-300 truncate bg-black/60 p-1 rounded border border-[#16212E]">
                    {selectedCandidate.diffHash}
                  </code>
                </div>
              </div>

              {/* Revision References & Rollback Binding */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-[#090D17] rounded-lg border border-[#141C29]">
                  <span className="text-[10px] text-gray-500 uppercase block font-bold">Base Revision:</span>
                  <span className="text-gray-300 text-[11px] font-mono">{selectedCandidate.baseRevision}</span>
                </div>
                <div className="p-2.5 bg-[#090D17] rounded-lg border border-[#141C29]">
                  <span className="text-[10px] text-gray-500 uppercase block font-bold">Candidate Revision:</span>
                  <span className="text-emerald-300 text-[11px] font-mono">{selectedCandidate.candidateRevision}</span>
                </div>
              </div>

              {/* Rollback Reference */}
              <div className="p-3 bg-[#0B0F19] rounded-xl border border-amber-500/20">
                <div className="flex items-center justify-between text-[10px] text-amber-400 uppercase font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <ShieldAlert size={12} /> Bound Rollback / Compensation Ref
                  </span>
                </div>
                <code className="block text-[10px] text-amber-300/90 bg-black/60 p-1.5 rounded border border-amber-950 font-mono">
                  {selectedCandidate.rollbackRef}
                </code>
              </div>
            </div>

            {/* Changed Candidate Paths */}
            <div className="pt-2 border-t border-[#141E28]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCode size={13} className="text-emerald-400" />
                  Attested Candidate Paths ({selectedCandidate.candidatePaths.length})
                </span>
                <span className="text-[10px] text-gray-500">VFS Scope Enforced</span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scroll pr-1">
                {selectedCandidate.candidatePaths.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#090C15] border border-[#131A26] text-[11px]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        p.action === 'create' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        p.action === 'modify' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                        'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {p.action}
                      </span>
                      <span className="text-gray-300 font-mono truncate">{p.path}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] shrink-0">
                      <span className="text-emerald-400 font-bold">+{p.additions}</span>
                      <span className="text-rose-400 font-bold">-{p.deletions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preflight Gate Matrix & Consequential Signing (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Gate Matrix Card */}
          <div className="p-5 rounded-2xl bg-[#07090F] border border-[#141E28] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#141E28] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Mandatory Preflight Gates
                </span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                allGatesPassed ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-amber-950 text-amber-300 border border-amber-600'
              }`}>
                {allGatesPassed ? '6 / 6 GATES CLEAR' : 'GATES PENDING'}
              </span>
            </div>

            <div className="space-y-2">
              {/* Gate 1 */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#090C15] border border-[#131A26] text-xs">
                <span className="text-gray-300">Manifest Integrity</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 size={13} /> VERIFIED
                </span>
              </div>

              {/* Gate 2 */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#090C15] border border-[#131A26] text-xs">
                <span className="text-gray-300">Unit / Integration Tests</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 size={13} /> 100% PASS
                </span>
              </div>

              {/* Gate 3 */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#090C15] border border-[#131A26] text-xs">
                <span className="text-gray-300">Gideon Independent Verdict</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/50">
                  <ShieldCheck size={13} /> {selectedCandidate.gates.gideonVerdict}
                </span>
              </div>

              {/* Gate 4 */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#090C15] border border-[#131A26] text-xs">
                <span className="text-gray-300">VFS Worktree Attestation</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 size={13} /> ATTESTED
                </span>
              </div>

              {/* Gate 5 */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#090C15] border border-[#131A26] text-xs">
                <span className="text-gray-300">Sentinel Policy Admission</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 size={13} /> ALLOWED
                </span>
              </div>

              {/* Gate 6 */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#090C15] border border-[#131A26] text-xs">
                <span className="text-gray-300">Append-Only Receipt Chain</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 size={13} /> HEALTHY
                </span>
              </div>
            </div>

            {/* Reactive State Transitions: Pending Approval -> Approved -> Signed */}
            <div className="pt-3 border-t border-[#141E28] space-y-3">
              <div className="text-[10px] text-gray-400 uppercase font-bold flex items-center justify-between">
                <span>Executive Workflow State</span>
                <span className="text-amber-400 flex items-center gap-1">
                  <Clock size={11} /> Expires: {new Date(selectedCandidate.expiresAt).toLocaleTimeString()}
                </span>
              </div>

              {/* Multi-Sign Quorum Visual Progress inside the Action Card for PROD */}
              {isProdTarget && selectedCandidate.status !== 'signed' && (
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-300 flex items-center gap-1">
                      <ShieldAlert size={12} /> Signatures Required:
                    </span>
                    <span className="font-mono text-purple-200 font-bold">
                      {currentAuthCount} / {requiredAuthCount} ({authProgressPercent}%)
                    </span>
                  </div>
                  
                  {/* Secondary Progress Bar */}
                  <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-purple-500/30">
                    <motion.div
                      animate={{ width: `${authProgressPercent}%` }}
                      className={`h-full transition-all ${
                        isFullyAuthorized
                          ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                          : 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                      }`}
                    />
                  </div>

                  {/* Individual Role Authorization Buttons for PROD */}
                  <div className="space-y-1.5 pt-1">
                    {PROD_AUTHORIZING_ROLES.map((roleDef) => {
                      const isGranted = currentAuths.some(a => a.role === roleDef.role);
                      return (
                        <div
                          key={roleDef.role}
                          className={`p-2 rounded-lg border flex items-center justify-between text-[11px] ${
                            isGranted
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                              : 'bg-[#090C16] border-[#162030] text-gray-400'
                          }`}
                        >
                          <div>
                            <div className="font-bold">{roleDef.roleName}</div>
                            <div className="text-[9px] text-gray-500">{roleDef.defaultSigner}</div>
                          </div>

                          {isGranted ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold flex items-center gap-1">
                              <CheckCircle2 size={10} /> Authorized
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApprove(roleDef.role)}
                              disabled={!allGatesPassed}
                              className="px-2.5 py-1 rounded bg-purple-900/60 hover:bg-purple-800 border border-purple-500/50 text-purple-200 text-[10px] font-bold cursor-pointer transition-all shadow"
                            >
                              Authorize
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* State: SIGNED */}
              {selectedCandidate.status === 'signed' ? (
                <div className="p-4 bg-emerald-950/40 border-2 border-emerald-500/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-300 font-black text-xs uppercase tracking-wider">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      Warrant Cryptographically Signed
                    </div>
                    <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded font-mono">
                      MERGED TO {selectedCandidate.targetBranch}
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-300 font-mono truncate">
                    ID: {selectedCandidate.warrantReceipt?.warrantId || `warrant_${selectedCandidate.taskId}`}
                  </div>
                  
                  {selectedCandidate.warrantReceipt && (
                    <button
                      onClick={() => setActiveReceiptModal(selectedCandidate.warrantReceipt!)}
                      className="w-full py-1.5 px-3 bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-300 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <FileCheck size={13} />
                      Inspect Signed Warrant Receipt
                    </button>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleReset}
                      className="text-[10px] text-gray-400 hover:text-gray-200 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw size={10} /> Reset to Pending (Simulate)
                    </button>
                  </div>
                </div>
              ) : selectedCandidate.status === 'approved' ? (
                /* State: APPROVED (Awaiting Signature) */
                <div className="space-y-2">
                  <div className="p-3 bg-cyan-950/40 border border-cyan-500/50 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
                      <CheckCheck size={14} className="text-cyan-400" />
                      {isProdTarget ? 'MULTI-SIGN QUORUM COMPLETE' : 'ARTIFACT APPROVED BY OPERATOR'}
                    </div>
                    <p className="text-[11px] text-gray-400 font-sans">
                      {isProdTarget
                        ? `All ${requiredAuthCount} required signatures acquired. Ready to execute sovereign ED25519 consequential warrant.`
                        : 'Preflight gates verified. Ready to execute sovereign ED25519 consequential warrant.'}
                    </p>
                  </div>

                  <button
                    onClick={handleSign}
                    disabled={isSigning || !allGatesPassed || (isProdTarget && !isFullyAuthorized)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                      isSigning
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-600 animate-pulse'
                        : allGatesPassed && (!isProdTarget || isFullyAuthorized)
                        ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white border border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                        : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                    }`}
                  >
                    {isSigning ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>SIGNING ED25519 CONSTRAINED WARRANT...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        <span>Sign Consequential Effect</span>
                      </>
                    )}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={handleDeny}
                      disabled={isSigning}
                      className="flex-1 py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-400 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Lock size={12} />
                      Deny & Revoke
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-3 py-2 bg-[#0C101A] hover:bg-[#121724] border border-[#192233] text-gray-400 hover:text-gray-200 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      Reset
                    </button>
                  </div>
                </div>
              ) : selectedCandidate.status === 'denied' ? (
                /* State: DENIED */
                <div className="p-4 bg-rose-950/40 border-2 border-rose-500/50 rounded-xl space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-rose-400 font-bold text-xs">
                    <ShieldAlert size={15} /> PROMOTION DENIED & LEASE QUARANTINED
                  </div>
                  <p className="text-[10px] text-gray-400 text-center">
                    A denial receipt was appended to the immutable audit ledger.
                  </p>
                  <button
                    onClick={handleReset}
                    className="w-full py-1.5 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={12} /> Reset to Pending Approval
                  </button>
                </div>
              ) : (
                /* State: PENDING APPROVAL */
                <div className="space-y-2">
                  <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                      <Clock size={13} className="text-amber-400" />
                      {isProdTarget ? 'AWAITING MULTI-SIGN QUORUM' : 'AWAITING OPERATOR EVIDENCE REVIEW'}
                    </div>
                    <p className="text-[11px] text-gray-400 font-sans">
                      {isProdTarget
                        ? `Target is set to PROD: Acquire all ${requiredAuthCount} role authorizations to approve.`
                        : 'Examine manifest hash and preflight gates before granting operator approval.'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleApprove()}
                    disabled={!allGatesPassed}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                      allGatesPassed
                        ? isProdTarget
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                          : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                        : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                    }`}
                  >
                    <CheckCheck size={15} />
                    <span>
                      {isProdTarget ? `Grant Authorization (${currentAuthCount + 1}/${requiredAuthCount})` : 'Approve Candidate Artifact'}
                    </span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={handleDeny}
                      className="flex-1 py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-400 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Lock size={12} />
                      Deny Artifact
                    </button>
                    <button
                      onClick={() => setShowRawManifest(!showRawManifest)}
                      className="px-3 py-2 bg-[#0C101A] hover:bg-[#121724] border border-[#192233] text-gray-400 hover:text-gray-200 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <FileCode size={12} />
                      JSON
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Raw Manifest Inspection (Collapsible) */}
      {showRawManifest && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-xl bg-[#04060A] border border-[#141B26] space-y-2"
        >
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase">
            <span>Raw Candidate Delivery Manifest</span>
            <button
              onClick={() => handleCopy(JSON.stringify(selectedCandidate, null, 2), 'Manifest JSON')}
              className="text-emerald-400 hover:text-emerald-300 text-[10px] flex items-center gap-1 cursor-pointer"
            >
              <Copy size={10} /> Copy JSON
            </button>
          </div>
          <pre className="text-[10px] text-emerald-300/90 font-mono bg-black/80 p-3 rounded overflow-x-auto max-h-48 custom-scroll">
            {JSON.stringify(selectedCandidate, null, 2)}
          </pre>
        </motion.div>
      )}

      {/* Candidate Artifacts Ledger Table (Reactive All-Artifacts Status Viewer) */}
      <div className="p-5 rounded-2xl bg-[#07090F] border border-[#141E28] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#141E28] pb-3">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-emerald-400" />
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Candidate Artifact Registry ({candidates.length})
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-600/50 text-amber-300 font-bold">
              Pending: {candidates.filter(c => c.status === 'pending approval').length}
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-600/50 text-cyan-300 font-bold">
              Approved: {candidates.filter(c => c.status === 'approved').length}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 font-bold">
              Signed: {candidates.filter(c => c.status === 'signed').length}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {candidates.map((cand) => {
            const isSelected = cand.id === selectedCandidate.id;
            return (
              <div
                key={cand.id}
                onClick={() => setCandidateId(cand.id)}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-950/20 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-[#090D18] border-[#16212E] hover:border-emerald-500/30'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-xs">{cand.taskId}: {cand.title}</span>
                    {getStatusBadge(cand.status)}
                    <span className="text-[10px] text-cyan-400 font-mono">
                      → {cand.targetBranch}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono truncate max-w-xl">
                    Manifest: {cand.manifestHash}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {cand.status === 'pending approval' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCandidateId(cand.id);
                        handleApprove();
                      }}
                      className="px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold"
                    >
                      Approve
                    </button>
                  )}
                  {cand.status === 'approved' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCandidateId(cand.id);
                        handleSign();
                      }}
                      className="px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold"
                    >
                      Sign Warrant
                    </button>
                  )}
                  {cand.warrantReceipt && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveReceiptModal(cand.warrantReceipt!);
                      }}
                      className="px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1"
                    >
                      <FileCheck size={11} /> Receipt
                    </button>
                  )}
                  <ChevronRight size={14} className={isSelected ? 'text-emerald-400' : 'text-gray-600'} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Detailed Receipt Inspector */}
      <AnimatePresence>
        {activeReceiptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#080B14] border-2 border-emerald-500/60 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#182333] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-400">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Immutable Warrant Receipt
                    </h3>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {activeReceiptModal.receiptId}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveReceiptModal(null)}
                  className="px-3 py-1 bg-[#121824] hover:bg-[#1C2538] text-gray-400 hover:text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#0B0F1C] rounded-xl border border-[#162133]">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Signer:</span>
                    <span className="text-gray-200 font-mono text-[11px]">{activeReceiptModal.signedBy}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Signer Role:</span>
                    <span className="text-emerald-400 font-bold">{activeReceiptModal.signerRole}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Authority Epoch:</span>
                    <span className="text-cyan-300 font-mono">{activeReceiptModal.authorityEpoch}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Target Branch:</span>
                    <span className="text-cyan-300 font-mono">{activeReceiptModal.targetBranch}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase font-bold mb-1">
                    <span>Cryptographic Signature Proof</span>
                    <button
                      onClick={() => handleCopy(activeReceiptModal.signature, 'Signature')}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy size={10} /> Copy
                    </button>
                  </div>
                  <code className="block text-[10px] text-emerald-300/90 font-mono bg-black p-2 rounded border border-emerald-950 break-all">
                    {activeReceiptModal.signature}
                  </code>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase font-bold mb-1">
                    <span>Verified JSON Receipt Payload</span>
                    <button
                      onClick={() => handleCopy(JSON.stringify(activeReceiptModal.rawPayload, null, 2), 'Receipt Payload')}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy size={10} /> Copy JSON
                    </button>
                  </div>
                  <pre className="text-[10px] text-gray-300 font-mono bg-black p-3 rounded border border-[#162133] max-h-48 overflow-y-auto custom-scroll">
                    {JSON.stringify(activeReceiptModal.rawPayload, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="pt-3 border-t border-[#182333] flex justify-end gap-2">
                <button
                  onClick={() => {
                    handleCopy(JSON.stringify(activeReceiptModal, null, 2), 'Complete Receipt');
                    setActiveReceiptModal(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Copy size={13} />
                  Copy & Export Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
