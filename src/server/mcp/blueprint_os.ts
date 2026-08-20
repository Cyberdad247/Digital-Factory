import {
  BlueprintConstitution,
  FeatureSpecification,
  ClarificationItem,
  ImplementationPlan,
  MerlinTaskDAG,
  VerificationPlan,
  RollbackPlan,
  SandboxRequest,
  SentinelPolicyDecision,
  BlueprintCapabilityLease,
  VFSSandboxAttestation,
  GideonVerdict,
  ApprovalRequest,
  ImmutableEffectManifest,
  ProofReceipt,
  BlueprintArtifactBundle,
  BlueprintOSState,
  BlueprintLifecycleStatus
} from '../../types';
import crypto from 'crypto';

// ============================================================================
// CONSTITUTIONS REPOSITORY
// ============================================================================

export const CANONICAL_ENGINEERING_CONSTITUTION: BlueprintConstitution = {
  schema_version: 'camelot.blueprint-constitution/1',
  constitution_id: 'const_engineering_v1',
  version: '1.0.0',
  scope: {
    organization_id: 'org_camelot_sovereign',
    tenant_id: 'tenant_omega_01',
    workspace_id: 'engineering',
    domain: 'engineering'
  },
  principles: [
    'Evidence before promotion',
    'Least privilege',
    'No direct production mutation',
    'Tenant isolation is mandatory'
  ],
  non_negotiables: [
    { id: 'no-direct-main-branch-write', severity: 'block', description: 'Direct commits to main branch are forbidden.' },
    { id: 'no-unapproved-data-egress', severity: 'block', description: 'Network egress strictly blocked without lease capability.' },
    { id: 'require-receipt-for-effect', severity: 'block', description: 'Consequential effects require signed immutable receipts.' }
  ],
  data_policy: {
    allowed_classifications: ['public', 'internal'],
    restricted_data_requires: ['local_only_route', 'human_approval', 'enhanced_receipt']
  },
  runtime_policy: {
    allowed_runtimes: ['pi', 'claude-code', 'codex'],
    denied_runtimes: ['prime-agent'],
    maximum_concurrent_writers: 1
  },
  infrastructure_policy: {
    max_memory_mb: 512,
    max_task_timeout_s: 300,
    allow_network_by_default: false
  },
  promotion_policy: {
    required_for: [
      'engineering.patch.promote',
      'infrastructure.oci.instance.create',
      'external.send'
    ],
    approval_mode: 'human'
  },
  integrity: {
    policy_bundle_ref: 'policy://tenant/engineering/v1',
    signer: 'tenant-policy-authority',
    signature: 'sig_ed25519_const_eng_v1_e9a712f5a01bc894'
  }
};

export const CANONICAL_COMMERCE_CONSTITUTION: BlueprintConstitution = {
  schema_version: 'camelot.blueprint-constitution/1',
  constitution_id: 'const_commerce_v1',
  version: '1.0.0',
  scope: {
    organization_id: 'org_camelot_sovereign',
    tenant_id: 'tenant_omega_01',
    workspace_id: 'commerce',
    domain: 'commerce'
  },
  principles: [
    'Strict transaction auditability',
    'PCI DSS isolation bounds',
    'Deterministic inventory reconciliation',
    'Zero unverified refunds'
  ],
  non_negotiables: [
    { id: 'pci-card-data-isolation', severity: 'block', description: 'Raw cardholder data must never enter general memory.' },
    { id: 'require-dual-custody-refunds', severity: 'block', description: 'Refunds exceeding $1,000 require dual operator signature.' }
  ],
  data_policy: {
    allowed_classifications: ['public', 'internal', 'confidential'],
    restricted_data_requires: ['local_only_route', 'human_approval']
  },
  runtime_policy: {
    allowed_runtimes: ['pi', 'codex'],
    denied_runtimes: ['prime-agent'],
    maximum_concurrent_writers: 1
  },
  infrastructure_policy: {
    max_memory_mb: 512,
    max_task_timeout_s: 180,
    allow_network_by_default: false
  },
  promotion_policy: {
    required_for: ['commerce.charge.settle', 'commerce.payout.trigger'],
    approval_mode: 'human'
  },
  integrity: {
    policy_bundle_ref: 'policy://tenant/commerce/v1',
    signer: 'commerce-policy-authority',
    signature: 'sig_ed25519_const_com_v1_b88231c4f9a0'
  }
};

// ============================================================================
// RESPONSIBILITY SPLIT MATRIX
// ============================================================================

export const BLUEPRINT_OS_RESPONSIBILITY_SPLIT = [
  {
    component: 'Blueprint OS',
    owns: 'Constitution, specifications, plans, acceptance criteria, DAG, verification plan, rollback plan',
    cannotOwn: 'Leases, policy decisions, secrets, direct sandbox creation'
  },
  {
    component: 'Merlin',
    owns: 'DAG scheduling, dependency ordering, runtime recommendation, checkpoints',
    cannotOwn: 'Lease issuance, policy override, final verification'
  },
  {
    component: 'Sentinel',
    owns: 'Policy evaluation, approval requirement, capability leases, revocation',
    cannotOwn: 'Worktree construction, source modification, model selection without policy'
  },
  {
    component: 'VFS Guardian',
    owns: 'Source admission, worktree, mounts, quotas, path constraints, process allowlist enforcement',
    cannotOwn: 'Policy approval, tenant authority, receipt rewriting'
  },
  {
    component: 'Bifrost',
    owns: 'Authentication, transport, event streaming, idempotency',
    cannotOwn: 'Authorization or direct effect authority'
  },
  {
    component: 'Gideon',
    owns: 'Independent verification and pass/block verdict',
    cannotOwn: 'Direct promotion, lease issuance'
  },
  {
    component: 'Promotion Controller',
    owns: 'Human-approved effect promotion',
    cannotOwn: 'Self-approval or policy bypass'
  }
];

export const BLUEPRINT_OS_OPERATING_LAW = `Blueprint OS describes the permitted job.
Sentinel grants the exact authority.
VFS creates the bounded place to do it.
The runtime performs only leased work.
Gideon verifies the evidence.
Humans promote consequential outcomes.
Receipts preserve the proof.`;

// In-Memory Blueprint Storage
const blueprintsStore: Map<string, BlueprintArtifactBundle> = new Map();

function hashString(input: string): string {
  return 'sha256:' + crypto.createHash('sha256').update(input).digest('hex');
}

// ============================================================================
// PIPELINE ENGINE FUNCTIONS
// ============================================================================

/**
 * 1. Intent -> Constitution selection -> Feature specification & Clarifications
 */
export function compileBlueprintIntent(params: {
  tenant_id: string;
  workspace_id: string;
  intent: string;
  constitution_ref?: string;
  data_classification?: 'public' | 'internal' | 'confidential' | 'restricted';
}): BlueprintArtifactBundle {
  const blueprint_id = 'bp_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  const constitution = params.constitution_ref === 'const_commerce_v1' 
    ? CANONICAL_COMMERCE_CONSTITUTION 
    : CANONICAL_ENGINEERING_CONSTITUTION;

  const isReceiptIntent = params.intent.toLowerCase().includes('receipt') || params.intent.toLowerCase().includes('filter');
  
  const title = isReceiptIntent 
    ? 'Tenant-scoped receipt filtering & query isolation'
    : `Blueprint: ${params.intent.slice(0, 50)}`;

  const spec: FeatureSpecification = {
    schema_version: 'camelot.feature-specification/1',
    spec_id: `spec_${blueprint_id}`,
    constitution_ref: constitution.constitution_id,
    title,
    problem_statement: isReceiptIntent
      ? 'Receipt queries may expose records outside the current tenant without rigorous predicate bounds.'
      : `Unchecked execution risk identified for: "${params.intent}". Requires bounded specification.`,
    objective: isReceiptIntent
      ? 'Enforce strict tenant filtering across receipt list and pagination queries.'
      : `Implement deterministic, isolated capability for "${params.intent}" under sovereign bounds.`,
    goals: isReceiptIntent ? [
      'Return only records belonging to the authenticated tenant.',
      'Preserve existing cursor pagination behavior without schema breakage.',
      'Add regression coverage for cross-tenant attempts with audit logging.'
    ] : [
      `Execute target intent "${params.intent}" within 512MB RAM budget.`,
      'Satisfy all non-negotiable constitution principles.',
      'Produce verifiable evidence digest before any promotion.'
    ],
    non_goals: [
      'Redesign the complete receipt storage substrate.',
      'Introduce a third-party non-sovereign authentication provider.'
    ],
    affected_domains: ['receipt-service', 'bifrost-api', 'contracts', 'vfs-isolation'],
    functional_requirements: [
      {
        id: 'FR-001',
        statement: 'The query endpoint filters strictly by authenticated tenant ID.',
        priority: 'must'
      },
      {
        id: 'FR-002',
        statement: 'Cursor pagination preserves tenant scope and halts cross-tenant traversals.',
        priority: 'must'
      }
    ],
    nonfunctional_requirements: {
      security: [
        'Cross-tenant requests fail closed.',
        'Zero data egress without Sentinel capability lease.'
      ],
      performance: [
        'No full-table scan introduced for standard queries.',
        'Execution latency capped at <200ms.'
      ],
      observability: [
        'Denied cross-tenant access emits an immutable audit receipt.'
      ]
    },
    acceptance_criteria: [
      {
        id: 'AC-001',
        given: 'a user in tenant A',
        when: 'they request receipts',
        then: 'only tenant A receipts are returned'
      },
      {
        id: 'AC-002',
        given: 'a cursor from tenant B',
        when: 'it is supplied by tenant A',
        then: 'the request returns an authorization-safe failure'
      }
    ],
    data_classification: params.data_classification || 'internal',
    risk_tier: 'medium',
    open_questions: [],
    evidence_refs: []
  };

  const clarifications: ClarificationItem[] = [
    {
      id: 'q_001',
      question: 'Which receipt endpoints must preserve backward-compatible pagination?',
      context: 'Ensures API contract stability during cursor traversal changes.',
      status: 'PENDING'
    },
    {
      id: 'q_002',
      question: 'Should cross-tenant rejection emit a silent 404 or an explicit audit 403?',
      context: 'Governs security posture against tenant ID enumeration.',
      status: 'PENDING'
    }
  ];

  const plan = generateInitialImplementationPlan(blueprint_id, spec.spec_id);
  const dag = generateInitialMerlinDAG(blueprint_id, plan.plan_id);
  const verificationPlan = generateInitialVerificationPlan(blueprint_id);
  const rollbackPlan = generateInitialRollbackPlan(blueprint_id, plan.plan_id);
  const manifest = generateInitialEffectManifest(blueprint_id, spec.spec_id, plan.plan_id, dag.dag_id);

  const bundle: BlueprintArtifactBundle = {
    blueprint_id,
    tenant_id: params.tenant_id || 'tenant_omega_01',
    workspace_id: params.workspace_id || 'engineering',
    constitution,
    status: 'CLARIFICATION_REQUIRED',
    version: 1,
    intent: params.intent,
    spec,
    clarifications,
    plan,
    dag,
    verificationPlan,
    rollbackPlan,
    manifest,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  blueprintsStore.set(blueprint_id, bundle);
  return bundle;
}

/**
 * Helper to generate initial plan
 */
function generateInitialImplementationPlan(blueprint_id: string, spec_id: string): ImplementationPlan {
  return {
    schema_version: 'camelot.implementation-plan/1',
    plan_id: `plan_${blueprint_id}`,
    spec_ref: spec_id,
    architecture_decisions: [
      {
        id: 'ADR-001',
        decision: 'Tenant predicate is applied before cursor evaluation.',
        alternatives: ['Filter after pagination', 'Client-side post-filtering'],
        rationale: 'Prevents cross-tenant cursor traversal and avoids scanning out-of-tenant index pages.'
      },
      {
        id: 'ADR-002',
        decision: 'Ephemerally isolate write paths in VFS Tier 1 bwrap sandbox.',
        alternatives: ['Host in-place edits', 'Docker root container'],
        rationale: 'NIST container-security compliance with no new privileges and strict path quotas.'
      }
    ],
    affected_modules: [
      { path: 'services/receipt-service/**', change_class: 'implementation' },
      { path: 'packages/contracts/**', change_class: 'contract' },
      { path: 'tests/receipt-service/**', change_class: 'test' }
    ],
    public_contracts: {
      compatibility: 'backward-compatible',
      changed_endpoints: ['GET /v1/receipts', 'GET /v1/receipts/paginate']
    },
    implementation_steps: [
      { order: 1, action: 'Map query path and existing tenant context propagation.' },
      { order: 2, action: 'Add tenant predicate to repository query.' },
      { order: 3, action: 'Validate cursor belongs to same tenant.' },
      { order: 4, action: 'Add unit and integration tests for cross-tenant edge cases.' },
      { order: 5, action: 'Run targeted type check and receipt-service tests via Boris & Socrates.' }
    ],
    resource_estimate_ref: `resource://${blueprint_id}/estimate`,
    verification_plan_ref: `verification://${blueprint_id}/plan`,
    rollback_plan_ref: `rollback://${blueprint_id}/plan`
  };
}

/**
 * Helper to generate initial Merlin Task DAG
 */
function generateInitialMerlinDAG(blueprint_id: string, plan_id: string): MerlinTaskDAG {
  return {
    schema_version: 'camelot.task-dag/1',
    dag_id: `dag_${blueprint_id}`,
    plan_ref: plan_id,
    nodes: [
      {
        task_id: 'task_map',
        title: 'Map receipt query path & AST',
        role: 'sir-ant',
        mode: 'inspect',
        dependencies: [],
        inputs: {
          allowed_paths: ['services/receipt-service/**']
        },
        outputs: ['repository-map', 'query-flow-summary'],
        budget: {
          timeout_s: 90,
          max_memory_mb: 192,
          max_context_tokens: 2500
        },
        status: 'PENDING'
      },
      {
        task_id: 'task_audit',
        title: 'Audit tenant-query cross-contamination risk',
        role: 'sir-owl',
        mode: 'audit',
        dependencies: ['task_map'],
        outputs: ['risk-report'],
        budget: {
          timeout_s: 120,
          max_memory_mb: 256,
          max_context_tokens: 4000
        },
        status: 'PENDING'
      },
      {
        task_id: 'task_patch',
        title: 'Implement tenant filter & cursor bounds',
        role: 'sir-forge',
        runtime_recommendation: 'claude-code',
        mode: 'build',
        dependencies: ['task_map', 'task_audit'],
        inputs: {
          allowed_paths: [
            'services/receipt-service/**',
            'packages/contracts/**',
            'tests/receipt-service/**'
          ]
        },
        outputs: ['patch-manifest', 'test-request'],
        budget: {
          timeout_s: 300,
          max_memory_mb: 512,
          max_changed_files: 6,
          max_diff_lines: 250
        },
        status: 'PENDING'
      },
      {
        task_id: 'task_test',
        title: 'Run targeted Boris verification suite',
        role: 'boris',
        mode: 'test',
        dependencies: ['task_patch'],
        outputs: ['test-run-result', 'coverage-report'],
        budget: {
          timeout_s: 180,
          max_memory_mb: 384
        },
        status: 'PENDING'
      },
      {
        task_id: 'task_verify',
        title: 'Gideon independent verdict & Z3 invariant check',
        role: 'gideon',
        mode: 'verify',
        dependencies: ['task_test'],
        outputs: ['gideon-verdict'],
        budget: {
          timeout_s: 120,
          max_memory_mb: 256
        },
        status: 'PENDING'
      }
    ]
  };
}

/**
 * Helper to generate initial Verification Plan
 */
function generateInitialVerificationPlan(blueprint_id: string): VerificationPlan {
  return {
    schema_version: 'camelot.verification-plan/1',
    verification_id: `verify_${blueprint_id}`,
    required_checks: [
      { id: 'contract-schema', executor: 'gideon', required: true, status: 'PENDING' },
      { id: 'tenant-isolation-unit-test', executor: 'boris', command: 'pnpm --filter receipt-service test tenant-isolation', required: true, status: 'PENDING' },
      { id: 'typecheck', executor: 'boris', command: 'pnpm --filter receipt-service typecheck', required: true, status: 'PENDING' },
      { id: 'path-scope', executor: 'socrates', method: 'static_ast_bounds', required: true, status: 'PENDING' },
      { id: 'dependency-policy', executor: 'socrates', method: 'zero_external_fetch', required: true, status: 'PENDING' },
      { id: 'cross-tenant-invariant', executor: 'socrates', method: 'static|z3', required: true, status: 'PENDING' }
    ],
    promotion_requirements: [
      'all_required_checks_pass',
      'VFS_attestation_valid',
      'diff_hash_matches_manifest',
      'lease_current_epoch',
      'Gideon_pass'
    ]
  };
}

/**
 * Helper to generate initial Rollback Plan
 */
function generateInitialRollbackPlan(blueprint_id: string, plan_id: string): RollbackPlan {
  return {
    schema_version: 'camelot.rollback-plan/1',
    rollback_id: `rollback_${blueprint_id}`,
    plan_ref: plan_id,
    strategy: 'git_revert_or_discard_ephemeral_worktree',
    triggers: [
      'Gideon rejects candidate with BLOCK verdict',
      'Targeted Boris unit/integration tests fail',
      'Production health check fails after approved promotion'
    ],
    actions: {
      pre_promotion: [
        'Destroy ephemeral worktree.',
        'Revoke capability lease via Sentinel.',
        'Retain evidence and forensic receipts in /evidence.'
      ],
      post_promotion: [
        'Create a human-approved revert manifest.',
        'Apply exact revert commit sha256.',
        'Run verification suite.',
        'Emit immutable rollback receipt.'
      ]
    },
    compensation_required: false
  };
}

/**
 * Helper to generate Effect Manifest with sha256 hash
 */
function generateInitialEffectManifest(blueprint_id: string, spec_id: string, plan_id: string, dag_id: string): ImmutableEffectManifest {
  const contentToHash = `${blueprint_id}:${spec_id}:${plan_id}:${dag_id}:v1.1`;
  const manifest_hash = hashString(contentToHash);

  return {
    schema_version: 'camelot.effect-manifest/1',
    manifest_id: `manifest_${blueprint_id}`,
    manifest_hash,
    spec_ref: spec_id,
    plan_ref: plan_id,
    dag_ref: dag_id,
    affected_files: [
      { path: 'services/receipt-service/src/queries/list_receipts.ts', action: 'MODIFY', sha256: hashString('list_receipts_v1') },
      { path: 'services/receipt-service/src/queries/paginate_receipts.ts', action: 'MODIFY', sha256: hashString('paginate_receipts_v1') },
      { path: 'packages/contracts/src/receipts/v1/receipt_query.json', action: 'MODIFY', sha256: hashString('receipt_contract_v1') },
      { path: 'tests/receipt-service/tenant_isolation.test.ts', action: 'CREATE', sha256: hashString('tenant_isolation_test_v1') }
    ],
    frozen_timestamp: new Date().toISOString()
  };
}

/**
 * 2. Clarification Resolution -> Plan & DAG Ready
 */
export function resolveClarifications(blueprint_id: string, responses: Record<string, string>): BlueprintArtifactBundle {
  const bundle = blueprintsStore.get(blueprint_id);
  if (!bundle) throw new Error(`Blueprint ${blueprint_id} not found.`);

  bundle.clarifications = bundle.clarifications.map(c => {
    if (responses[c.id]) {
      return { ...c, status: 'RESOLVED', response: responses[c.id] };
    }
    // Default mock resolution if submitted empty
    return { 
      ...c, 
      status: 'RESOLVED', 
      response: c.id === 'q_001' 
        ? 'Preserve backward-compatible GET /v1/receipts and paginate endpoint.'
        : 'Emit explicit authorization-safe 403 Forbidden with audit receipt.'
    };
  });

  bundle.status = 'DAG_TASKIFIED';
  bundle.updated_at = new Date().toISOString();
  blueprintsStore.set(blueprint_id, bundle);
  return bundle;
}

/**
 * 3. Sentinel Policy Evaluation & VFS Preflight
 */
export function runPreflight(blueprint_id: string): BlueprintArtifactBundle {
  const bundle = blueprintsStore.get(blueprint_id);
  if (!bundle) throw new Error(`Blueprint ${blueprint_id} not found.`);

  const authority_epoch = 43;
  const decision_id = `pol_${Date.now().toString(36)}`;
  const attestation_id = `vfs_${Date.now().toString(36)}`;
  const task_id = 'task_patch';

  // Sentinel Policy Decision
  const policyDecision: SentinelPolicyDecision = {
    schema_version: 'camelot.policy-decision/1',
    decision_id,
    task_id,
    manifest_hash: bundle.manifest.manifest_hash,
    authority_epoch,
    result: 'allow',
    evaluated: {
      actor: {
        id: 'user_operator_v1',
        roles: ['engineering_operator', 'sovereign_alchemist']
      },
      tenant_id: bundle.tenant_id,
      cartridge_id: 'merlin-engineering-forge',
      workload_id: 'sir-forge',
      requested_effect: 'engineering.patch.create'
    },
    constraints: {
      required_approval: true,
      required_verifiers: ['boris', 'socrates', 'gideon'],
      allowed_paths: [
        'services/receipt-service/**',
        'packages/contracts/**',
        'tests/receipt-service/**'
      ],
      process_allowlist: ['git', 'pnpm', 'node', 'test-runner'],
      network_mode: 'disabled',
      maximum_memory_mb: 512,
      maximum_timeout_s: 300
    },
    reasons: [
      { code: 'TENANT_SCOPE_VALID', details: 'Tenant scope matches authenticated caller tenant.' },
      { code: 'PATH_SCOPE_VALID', details: 'Target paths constrained to receipt-service boundaries.' },
      { code: 'NO_EXTERNAL_EFFECT', details: 'Network disabled; zero untrusted external egress.' },
      { code: 'VERIFICATION_REQUIRED', details: 'Boris + Socrates + Gideon must attest before promotion.' }
    ],
    receipt_ref: `receipt://${decision_id}/evaluated`
  };

  // VFS Sandbox Request & Attestation
  const sandboxRequest: SandboxRequest = {
    schema_version: 'camelot.sandbox-request/1',
    request_id: `sandbox_${Date.now().toString(36)}`,
    task_id,
    manifest_ref: `manifest://${bundle.manifest.manifest_id}`,
    source: {
      repository_ref: 'repo://camelot-os',
      base_revision: 'git:excalibur-v1000-8f92a1',
      source_classification: 'trusted_internal'
    },
    workspace: {
      type: 'ephemeral_git_worktree',
      path_template: `/runtime/camelot/tasks/${task_id}/worktree`,
      read_only_source: true,
      allowed_write_paths: [
        'services/receipt-service/**',
        'packages/contracts/**',
        'tests/receipt-service/**'
      ],
      protected_paths: [
        '.git/**',
        'infra/production/**',
        '.env*',
        'secrets/**'
      ]
    },
    process: {
      allowlist: ['git', 'pnpm', 'node', 'test-runner'],
      network_mode: 'disabled',
      secret_handles: []
    },
    resources: {
      memory_max_mb: 512,
      cpu_quota_percent: 100,
      disk_max_mb: 1024,
      timeout_s: 300,
      pids_max: 128
    },
    isolation: {
      tier: 'tier_1',
      mechanism: ['ephemeral_worktree', 'cgroup_v2', 'bwrap_namespace', 'no_new_privileges']
    },
    cleanup: {
      on_success: 'collect_evidence_then_destroy',
      on_failure: 'collect_evidence_then_destroy',
      on_lease_revocation: 'kill_process_and_destroy'
    }
  };

  const bwrap_command_profile = `bwrap \\
  --unshare-user \\
  --unshare-pid \\
  --unshare-ipc \\
  --unshare-uts \\
  --unshare-net \\
  --die-with-parent \\
  --new-session \\
  --proc /proc \\
  --dev /dev \\
  --ro-bind /runtime/camelot/tasks/${task_id}/source /source \\
  --bind /runtime/camelot/tasks/${task_id}/worktree /worktree \\
  --bind /runtime/camelot/tasks/${task_id}/tmp /tmp \\
  --bind /runtime/camelot/tasks/${task_id}/evidence /evidence \\
  --ro-bind /runtime/camelot/tasks/${task_id}/lease.json /run/camelot/lease.json \\
  --chdir /worktree \\
  --setenv HOME /tmp/home \\
  --setenv TMPDIR /tmp \\
  --setenv NO_PROXY "*" \\
  -- /usr/local/lib/camelot/runtime-wrapper --lease /run/camelot/lease.json --runtime claude-code`;

  const vfsAttestation: VFSSandboxAttestation = {
    schema_version: 'camelot.vfs-attestation/1',
    attestation_id,
    task_id,
    manifest_hash: bundle.manifest.manifest_hash,
    source: {
      repository_ref: 'repo://camelot-os',
      base_revision: 'git:excalibur-v1000-8f92a1',
      source_digest: hashString('source_v1000'),
      classified_as: 'trusted_internal'
    },
    workspace: {
      worktree_ref: `vfs://engineering-01/tasks/${task_id}/worktree`,
      read_only_mounts: [`/runtime/camelot/tasks/${task_id}/source`],
      write_mounts: [`/runtime/camelot/tasks/${task_id}/worktree`],
      tmpfs_limit_mb: 256
    },
    enforcement: {
      path_escape_protection: true,
      protected_paths_denied: true,
      executable_allowlist_valid: true,
      network_mode_valid: true,
      resource_quota_valid: true,
      authority_epoch_current: true
    },
    bwrap_command_profile,
    result: 'pass',
    failure_reasons: [],
    receipt_ref: `receipt://${attestation_id}/vfs_preflight`
  };

  bundle.policyDecision = policyDecision;
  bundle.sandboxRequest = sandboxRequest;
  bundle.vfsAttestation = vfsAttestation;
  bundle.status = 'VFS_PREFLIGHT_PASSED';
  bundle.updated_at = new Date().toISOString();

  blueprintsStore.set(blueprint_id, bundle);
  return bundle;
}

/**
 * 4. Issue Sentinel Capability Lease
 */
export function issueSentinelLease(blueprint_id: string): BlueprintArtifactBundle {
  const bundle = blueprintsStore.get(blueprint_id);
  if (!bundle) throw new Error(`Blueprint ${blueprint_id} not found.`);

  const lease_id = `lease_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const lease: BlueprintCapabilityLease = {
    schema_version: 'camelot.capability-lease/1',
    lease_id,
    authority_epoch: 43,
    bindings: {
      manifest_hash: bundle.manifest.manifest_hash,
      task_id: 'task_patch',
      correlation_id: `cor_${Date.now().toString(36)}`,
      tenant_id: bundle.tenant_id,
      node_id: 'engineering-01',
      workload_id: 'sir-forge',
      cartridge_id: 'merlin-engineering-forge',
      runtime_id: 'claude-code',
      vfs_attestation_ref: bundle.vfsAttestation?.attestation_id || 'attestation://vfs_01'
    },
    permissions: {
      vfs: {
        read: [
          'services/receipt-service/**',
          'packages/contracts/**',
          'tests/receipt-service/**'
        ],
        write: [
          'services/receipt-service/**',
          'packages/contracts/**',
          'tests/receipt-service/**'
        ]
      },
      process: {
        allowlist: ['git', 'pnpm', 'node', 'test-runner']
      },
      network: {
        mode: 'disabled'
      },
      secrets: {
        references: []
      }
    },
    budgets: {
      expires_at: expires,
      timeout_s: 300,
      max_memory_mb: 512,
      max_cpu_percent: 100,
      max_disk_mb: 1024,
      max_pids: 128,
      max_tool_calls: 20,
      max_changed_files: 6,
      max_diff_lines: 250,
      max_actions: 1
    },
    properties: {
      transferable: false,
      renewable: false,
      revocable: true,
      offline_effects_allowed: false
    },
    integrity: {
      signer: 'sentinel',
      signing_key_id: 'sentinel-lease-key:v1',
      signature: hashString(`sentinel_sig_${lease_id}_epoch43`),
      receipt_ref: `receipt://${lease_id}/granted`
    }
  };

  bundle.lease = lease;
  bundle.status = 'LEASE_ISSUED';
  bundle.updated_at = new Date().toISOString();

  blueprintsStore.set(blueprint_id, bundle);
  return bundle;
}

/**
 * 5. Bounded Execution in Sandbox
 */
export function executeBoundedSandbox(blueprint_id: string): BlueprintArtifactBundle {
  const bundle = blueprintsStore.get(blueprint_id);
  if (!bundle) throw new Error(`Blueprint ${blueprint_id} not found.`);

  // Mark all DAG nodes as executed
  bundle.dag.nodes = bundle.dag.nodes.map(node => ({
    ...node,
    status: 'COMPLETED'
  }));

  bundle.status = 'BOUNDED_EXECUTION';
  bundle.updated_at = new Date().toISOString();

  blueprintsStore.set(blueprint_id, bundle);
  return bundle;
}

/**
 * 6. Gideon Verification & Boris/Socrates Checks
 */
export function runGideonVerification(blueprint_id: string): BlueprintArtifactBundle {
  const bundle = blueprintsStore.get(blueprint_id);
  if (!bundle) throw new Error(`Blueprint ${blueprint_id} not found.`);

  // Update check statuses
  bundle.verificationPlan.required_checks = bundle.verificationPlan.required_checks.map(c => ({
    ...c,
    status: 'PASS'
  }));

  const verdict_id = `verdict_gideon_${Date.now().toString(36)}`;
  const gideonVerdict: GideonVerdict = {
    schema_version: 'camelot.gideon-verdict/1',
    verdict_id,
    task_id: 'task_patch',
    manifest_hash: bundle.manifest.manifest_hash,
    verdict: 'PASS',
    timestamp: new Date().toISOString(),
    checks_summary: {
      contract_schema_valid: true,
      tenant_isolation_passed: true,
      typecheck_passed: true,
      path_scope_passed: true,
      dependency_policy_passed: true,
      cross_tenant_invariant_z3: true
    },
    evidence_digest: hashString(`evidence_digest_${verdict_id}`),
    receipt_ref: `receipt://${verdict_id}/gideon_pass`
  };

  const approval_id = `apr_${Date.now().toString(36)}`;
  const approvalRequest: ApprovalRequest = {
    schema_version: 'camelot.approval-request/1',
    approval_id,
    manifest_hash: bundle.manifest.manifest_hash,
    task_id: 'task_patch',
    effect_kind: 'engineering.patch.promote',
    display: {
      changed_paths: [
        'services/receipt-service/src/queries/list_receipts.ts',
        'services/receipt-service/src/queries/paginate_receipts.ts',
        'packages/contracts/src/receipts/v1/receipt_query.json',
        'tests/receipt-service/tenant_isolation.test.ts'
      ],
      test_status: 'passed',
      risk_tier: 'medium',
      rollback_ref: `rollback://${bundle.rollbackPlan.rollback_id}`
    },
    required_approver_roles: ['engineering_operator'],
    decision: {
      status: 'pending',
      exact_manifest_required: true
    }
  };

  bundle.gideonVerdict = gideonVerdict;
  bundle.approvalRequest = approvalRequest;
  bundle.status = 'APPROVAL_REQUIRED';
  bundle.updated_at = new Date().toISOString();

  blueprintsStore.set(blueprint_id, bundle);
  return bundle;
}

/**
 * 7. Promotion Controller (Human Approval) & Immutable Receipt Generation
 */
export function promoteBlueprintEffect(blueprint_id: string, operator_id: string = 'human_operator_v1'): BlueprintArtifactBundle {
  const bundle = blueprintsStore.get(blueprint_id);
  if (!bundle) throw new Error(`Blueprint ${blueprint_id} not found.`);

  if (bundle.approvalRequest) {
    bundle.approvalRequest.decision = {
      status: 'approved',
      exact_manifest_required: true,
      decided_by: operator_id,
      decided_at: new Date().toISOString()
    };
  }

  const receipt_id = `rcpt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const receiptProof = hashString(`${bundle.blueprint_id}:${bundle.manifest.manifest_hash}:${operator_id}`);

  const receipt: ProofReceipt = {
    schema_version: 'camelot.receipt/1',
    receipt_id,
    blueprint_id: bundle.blueprint_id,
    effect_kind: 'engineering.patch.promote',
    tenant_id: bundle.tenant_id,
    manifest_hash: bundle.manifest.manifest_hash,
    lease_id: bundle.lease?.lease_id || 'lease_initial',
    gideon_verdict_ref: bundle.gideonVerdict?.verdict_id || 'verdict_initial',
    approved_by: operator_id,
    promotion_status: 'PROMOTED_IMMUTABLE',
    timestamp: new Date().toISOString(),
    sha256_proof: receiptProof,
    summary: `Tenant-scoped isolation verified across 4 files. Gideon verdict PASS. Cryptographic receipt emitted into sovereign registry.`
  };

  bundle.receipt = receipt;
  bundle.status = 'PROMOTED_COMMITTED';
  bundle.updated_at = new Date().toISOString();

  blueprintsStore.set(blueprint_id, bundle);
  return bundle;
}

/**
 * 8. Fast-Forward All Stages
 */
export function fastForwardBlueprint(blueprint_id: string): BlueprintArtifactBundle {
  resolveClarifications(blueprint_id, {});
  runPreflight(blueprint_id);
  issueSentinelLease(blueprint_id);
  executeBoundedSandbox(blueprint_id);
  runGideonVerification(blueprint_id);
  return promoteBlueprintEffect(blueprint_id);
}

/**
 * Get Overall Blueprint OS State
 */
export function getBlueprintOSState(): BlueprintOSState {
  // Ensure seed item exists if empty
  if (blueprintsStore.size === 0) {
    const seed = compileBlueprintIntent({
      tenant_id: 'tenant_omega_01',
      workspace_id: 'engineering',
      intent: 'Tenant-scoped receipt filtering and pagination isolation',
      constitution_ref: 'const_engineering_v1',
      data_classification: 'internal'
    });
    // Advance seed to verified state for immediate inspection
    fastForwardBlueprint(seed.blueprint_id);
  }

  const all = Array.from(blueprintsStore.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return {
    totalBlueprints: all.length,
    activeBlueprint: all[0] || null,
    history: all,
    responsibilitySplit: BLUEPRINT_OS_RESPONSIBILITY_SPLIT,
    operatingLaw: BLUEPRINT_OS_OPERATING_LAW
  };
}

export function getBlueprintById(id: string): BlueprintArtifactBundle | undefined {
  return blueprintsStore.get(id);
}
