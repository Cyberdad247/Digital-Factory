export interface SourceCitation {
  id: string;
  sourceId: string;
  sourceTitle: string;
  excerpt: string;
  blockId: string; // viking:// block identifier
  confidence: number;
  pageOrSection?: string;
}

export interface NotebookQueryResponse {
  query: string;
  answer: string;
  citations: SourceCitation[];
  groundedScore: number; // 0 to 1
  isGrounded: boolean;
  blockPointers: string[];
  latencyMs: number;
  toonRepresentation: string;
  timestamp: string;
  notebookId: string;
  notebookTitle: string;
  cachedAtEdge: boolean;
}

export interface NotebookSource {
  id: string;
  title: string;
  type: 'pdf_vault' | 'markdown_blueprint' | 'strategy_doc' | 'api_contract' | 'codebase_graph';
  blockCount: number;
  tokenEstimate: number;
  lastSynced: string;
  status: 'INDEXED_CANONICAL' | 'SYNCED_EDGE' | 'DRIFT_DETECTED';
  vikingUri: string;
  summary: string;
  authorAgent: string;
}

export interface MGVAuditResult {
  auditId: string;
  timestamp: string;
  testQuery: string;
  citationRigorScore: number; // 0 - 100
  latencyMs: number;
  status: 'VERIFIED' | 'REZERO_TRIGGERED' | 'WARNING_DRIFT';
  makerOutput: string;
  checkerVerdict: string;
  crucibleProof: string;
  actionTaken: string;
  attempts: number;
}

export interface FileTreeAuditItem {
  path: string;
  type: 'directory' | 'file';
  canonicalMasterHash: string;
  localEdgeStatus: 'SYNCHRONIZED_1_TO_1' | 'SCHEMA_DRIFT' | 'MISSING_AT_EDGE' | 'ORPHANED_LOCAL';
  vikingBlockId: string;
  description: string;
}

export interface IsomorphicFileTreeResult {
  timestamp: string;
  isomorphicIntegrityScore: number; // e.g. 98.4%
  totalNodesAudited: number;
  synchronizedCount: number;
  driftCount: number;
  missingCount: number;
  hardHaltActive: boolean;
  items: FileTreeAuditItem[];
  remedyAction: string;
}

export interface MCPToolDef {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handlerAgent: string;
  thread: 'THREAD_A_MNEMOSYNE' | 'THREAD_B_CODA' | 'THREAD_C_GIDEON';
}

export interface MCPServerStatus {
  name: string;
  version: string;
  protocol: 'MCP_JSON_RPC_2.0_STDIO_BIFROST';
  status: 'ONLINE_CONNECTED' | 'SYNCING' | 'REZERO_HALT';
  activeVault: string;
  totalIndexedSources: number;
  totalBlocks: number;
  edgeLatencyMs: number;
  tools: MCPToolDef[];
  bifrostSecurity: {
    tunnelType: 'X25519_ECC_ZERO_TRUST';
    zeroHallucinationPolicy: 'ENFORCED_STRICT';
    toonCompressionRatio: string;
  };
}

export interface MCPJsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: any;
}

export interface MCPJsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPToolItem {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handlerKnight: string;
  category: 'ROUTING' | 'SPECIFICATION' | 'CRUCIBLE' | 'SYNTHESIS' | 'TOPOLOGY' | 'MOTION' | 'WORKSPACE' | 'COGNITION' | 'HARDWARE';
}

export interface MCPResourceItem {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  category: 'SCHEMA' | 'ROSTER' | 'TELEMETRY' | 'SPECIFICATION' | 'CONTRACT';
}

export interface MCPPromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface MCPPromptItem {
  name: string;
  description?: string;
  arguments?: MCPPromptArgument[];
}

export interface MCPClientConfig {
  claudeDesktop: string;
  cursor: string;
  windsurf: string;
  stdioCommand: string;
  sseEndpoint: string;
  httpEndpoint: string;
}

export interface MCPExecutionLog {
  id: string;
  timestamp: string;
  method: string;
  params: any;
  result: any;
  latencyMs: number;
  status: 'SUCCESS' | 'ERROR';
  knight: string;
}

export interface ArthurianMCPServerInfo {
  name: string;
  version: string;
  protocolVersion: string;
  capabilities: {
    tools: { listChanged: boolean };
    resources: { subscribe: boolean; listChanged: boolean };
    prompts: { listChanged: boolean };
    logging: Record<string, any>;
  };
  uptimeSec: number;
  totalInvocations: number;
  connectedClients: number;
  activeTransport: 'HTTP_JSON_RPC_2.0' | 'SSE_EVENT_STREAM' | 'STDIO_BIFROST';
  tools: MCPToolItem[];
  resources: MCPResourceItem[];
  prompts: MCPPromptItem[];
}

export type MCPConnectionStatus = 'ONLINE_CONNECTED' | 'SYNCING' | 'STANDBY' | 'DEGRADED' | 'DISCONNECTED' | 'ERROR';
export type MCPTransportType = 'HTTP_JSON_RPC' | 'SSE_EVENT_STREAM' | 'STDIO_BIFROST' | 'WSS_SOCKET' | 'WASM_FFI' | 'ETHERCAT_OPC_UA';

export interface MCPServerToolCapability {
  name: string;
  description: string;
  category: 'ROUTING' | 'SPECIFICATION' | 'CRUCIBLE' | 'SYNTHESIS' | 'TOPOLOGY' | 'MOTION' | 'WORKSPACE' | 'COGNITION' | 'HARDWARE' | 'KNOWLEDGE' | 'MULTIMODAL' | 'CUSTOM' | string;
  handler: string;
  parametersCount?: number;
  inputSchema?: {
    type?: string;
    properties?: Record<string, any>;
    required?: string[];
  };
  lastInvokedAt?: string;
  totalCalls?: number;
  avgLatencyMs?: number;
  isStreaming?: boolean;
}

export interface MCPServerRegistryEntry {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  protocolVersion: string;
  status: MCPConnectionStatus;
  transport: MCPTransportType;
  endpointUrl: string;
  latencyMs: number;
  uptimeSeconds: number;
  lastPingTimestamp: string;
  connectedClientsCount: number;
  totalInvocations: number;
  securityType: 'X25519_ECC' | 'ZERO_TRUST_OAUTH' | 'SENTINEL_LEASE' | 'MUTUAL_TLS' | 'EPHEMERAL_VFS' | 'NONE';
  tags: string[];
  tools: MCPServerToolCapability[];
  resourceCount: number;
  promptCount: number;
  hostRuntime: string;
  isCustom?: boolean;
  metadata?: Record<string, any>;
}

export interface MCPServerRegistrySummary {
  totalServers: number;
  onlineServers: number;
  totalToolCapabilities: number;
  totalInvocations: number;
  avgGlobalLatencyMs: number;
  transportsActive: Record<string, number>;
  lastRegistrySync: string;
}

export interface MCPToolCapabilityProof {
  proofId: string;
  toolName: string;
  serverName: string;
  serverId: string;
  endpointUrl: string;
  transport: MCPTransportType;
  category: string;
  handler: string;
  schemaHash: string;
  protocolVersion: string;
  issuedAt: string;
  expiresAt: string;
  zeroTrustLease: string;
  inputSchema: any;
  verificationSignature: string;
  curlPayload: string;
}

export interface APEEStageLog {
  stage: 'PARSE' | 'ENRICH' | 'RENORMALIZE' | 'ROUTE' | 'CRYSTALLIZE';
  name: string;
  description: string;
  details: string[];
  entropyBefore?: number;
  entropyAfter?: number;
}

export interface APEECompileResult {
  id: string;
  targetProject: string;
  rawInput: string;
  crystalPrompt: string;
  knightsSummoned: string[];
  stages: APEEStageLog[];
  metrics: {
    rawTokens: number;
    crystalTokens: number;
    staticPurgedPercent: number; // e.g. 74%
    latencyMs: number;
    entropyReduction: number; // e.g. 91.5%
    hardwareCeiling: 'ARM64_8GB_STRICT';
    timestamp: string;
  };
  dagSteps: string[];
  executionDirectives: string[];
  mgvGateCriteria: string;
}

export interface APEECompileRequest {
  rawIntent: string;
  targetHardware?: string;
  strictNoVibeCoding?: boolean;
  mode?: 'APEE_STANDARD' | 'OMEGA_TITAN_OMNI_FORGE';
}

export interface CapabilityLease {
  leaseId: string;
  manifestId: string;
  capability: string;
  targetAgent: string;
  leaseStatus: 'ACTIVE_GRANTED' | 'REVOKED' | 'EXPIRED' | 'PENDING_AUDIT';
  issuedAt: string;
  expiresAt: string;
  receiptSignature: string;
  vfsWorktreeId: string;
}

export interface VFSWorktree {
  worktreeId: string;
  isolatedPath: string;
  ambientAccess: boolean; // strictly false
  writeBudgetKB: number;
  ephemeralState: 'ACTIVE_SANDBOX' | 'AUDITED_PROMOTED' | 'PURGED_REZERO';
  pinnedManifest: string;
  lastPreflightCheck: string;
}

export interface CLIForgeStep {
  stepNumber: number;
  name: string;
  status: 'PENDING' | 'EXECUTING' | 'VERIFIED' | 'COMPLETED';
  description: string;
  artifactProduced?: string;
  durationMs?: number;
}

export interface CLIForgeSubcommand {
  name: string;
  description: string;
  flags: string[];
  inputSchema: string;
  jsonRpcOutputSchema: string;
  mockResponse: Record<string, unknown>;
}

export interface ForgedAgenticCLI {
  id: string;
  toolName: string;
  binaryName: string;
  version: string;
  description: string;
  category: 'DATABASE' | 'PAYMENT' | 'AUDIO_DSP' | 'DEV_TOOL' | 'STORAGE' | 'CUSTOM';
  transport: 'MCP_JSON_RPC_STDIO';
  subcommands: CLIForgeSubcommand[];
  testMd: string;
  harnessMd: string;
  skillMd: string;
  cliSourceCode: string;
  sandboxStatus: 'SANDBOX_VERIFIED' | 'SWARM_DISCOVERED' | 'DEPLOYED';
  generatedAt: string;
  authorKnight: string;
}

export interface OmniForgeState {
  version: 'v1000.0 (Singularity Lattice)';
  hardwareTarget: '8GB Edge-Node // Local-First Fabric';
  governance: 'ANYA_FIRST_LAW // DREAMS DONT COME TRUE VISIONS DO';
  blueprintOS: {
    anyaExpressionGate: 'L7_ACTIVE';
    sentinelPolicyAuthority: 'FAIL_CLOSED';
    vfsGuardian: 'EPHEMERAL_ISOLATED';
    activeLeases: CapabilityLease[];
  };
  merlinFoundry: {
    status: 'SYSTEM_2_REASONING_ACTIVE';
    dagRouterState: 'DECOMPOSING_INTENT';
    boundedAdapter: 'EDGE_8GB_ARM64';
  };
  hiveIDE: {
    status: 'BIO_KINETIC_SWARM_READY';
    knightsActive: string[];
    gideonVerificationPlane: 'AST_DIFF_AUDIT_STRICT';
  };
  cliForge: {
    toolsDiscoveredCount: number;
    totalPipelinesExecuted: number;
  };
}

// ==========================================
// FOR-LOOP ENGINEERING & 24D LEECH LATTICE
// ==========================================

export interface LeechLatticeVector {
  dimension: number; // 1 to 24
  coordinate: number;
  quantizedWeight: number;
  sphericalPackingDensity: number;
  parity: 'EVEN' | 'ODD';
  orbitState: 'RESONANT' | 'GROUND' | 'SUPER_POSITION';
}

export interface KnightSyncMetrics {
  anya: {
    status: 'SYNCED_GATE';
    expressionGate: 'L7_ACTIVE';
    activeCompressionRatio: number;
  };
  merlin: {
    status: 'SYNCED_COGNITIVE';
    taskDagDepth: number;
    adapterCeiling: 'ARM64_8GB';
  };
  ladyMnemosyne: {
    status: 'SYNCED_VAULT';
    activeVectors24D: number;
    groundedScore: number;
  };
  lastSyncTimestamp: string;
  synapticLatencyMs: number;
}

export interface ForLoopIterationRecord {
  iterationIndex: number;
  timestamp: string;
  phase: 'GENERATION' | 'AST_SANDBOX_DIFF' | 'MGV_ASSERTION' | 'AUTO_HEAL_PATCH' | 'CONVERGED';
  makerAgent: 'Sir Forge' | 'Merlin Ω' | 'Sir Castor';
  checkerAgent: 'Sir Gideon' | 'Sentinel' | 'Watchdog';
  promptTask: string;
  codeGeneratedSnippet: string;
  astDeltaCount: number;
  compilerDiagnostic: string;
  autoHealPatchSnippet?: string;
  confidenceScore: number; // 0 - 100
  epsilonDelta: number; // e.g. 0.0004
  cpuLoadPercent: number; // 120
  ramAllocatedMB: number; // 2867
  status: 'IN_PROGRESS' | 'RETRY_HEALING' | 'VERIFIED_CONVERGED' | 'REZERO_ABORT';
}

export interface ForLoopEngineeringState {
  bootStatus: 'BOOTED_ACTIVE' | 'IDLE' | 'STEPPING' | 'CONVERGING' | 'PAUSED';
  cpuOverdrive: {
    loadPercent: number; // 120
    statusText: 'OMNI_EXECUTION_ACTIVE';
    hyperThreads: number;
  };
  ramQuantization: {
    usedGB: number; // 2.8 or 3.4
    totalGB: number; // 8.0
    mode: 'ABSOLUTE_QUANTIZATION' | 'SCARCITY_PROTOCOL';
    zeroLeakClamping: boolean;
  };
  knightSync: KnightSyncMetrics;
  latticeState: {
    latticeType: '24D_LEECH_LATTICE_ACTIVE';
    dimensionCount: 24;
    kissingNumber: 196560;
    minimalNorm: 4;
    thetaSeriesCoefficients: number[];
    vectors: LeechLatticeVector[];
  };
  currentIteration: number;
  maxIterations: number;
  convergenceTargetEpsilon: number; // 0.001
  isConverged: boolean;
  provenanceHash: string;
  history: ForLoopIterationRecord[];
  activeTask: string;
}

// ==========================================
// SWARM EXPANSION & TIER-0 HYPER-ORCHESTRATION
// ==========================================

export interface SwarmAgentWorker {
  id: string;
  name: string;
  tier: 'TIER_1_ORCHESTRATOR' | 'TIER_2_REGIONAL_LEAD' | 'TIER_3_LOCAL_WORKER';
  regionalCluster: string;
  currentTask: string;
  compressedContextBytes: number;
  loadedSkills: string[];
  status: 'EXECUTING' | 'WAITING_MERGE' | 'RACER_ACTIVE' | 'AUDITED_CONVERGED';
  activeModel: 'Claude 3.5 Sonnet' | 'Claude 3.5 Haiku' | 'Claude 3 Opus' | 'Gemini 2.5 Flash' | 'Local 8B Quantized';
  tokenBurnRatePerSec: number;
  lastMessage: string;
}

export interface RegionalClusterLead {
  id: string;
  clusterName: string;
  embeddingVector24D: number[];
  workerCount: number;
  activeMission: string;
  sardaCacheHitRate: number; // e.g. 94.2%
  leadAgentId: string;
}

export interface SardaCacheEntry {
  shellId: string;
  angularSector: number;
  thetaCoefficient: number;
  ouroborosAnchorHash: string;
  hitCount: number;
  cachedRepresentatives: string[];
  amortizedComputeSavings: string;
}

export interface TTENode {
  skillId: string;
  name: string;
  category: 'CORE_GOVERNANCE' | 'DSP_AUDIO' | 'SQL_ANALYTICS' | 'KINETIC_VFS' | 'MARKETING_ENG';
  dependencies: string[];
  tokenCost: number;
  isJITLoaded: boolean;
  routableVector: number[];
}

export interface ParallelRaceCandidate {
  modelName: 'Claude 3.5 Sonnet' | 'Claude 3.5 Haiku' | 'Claude 3 Opus' | 'Gemini 2.5 Flash';
  agentId: string;
  responseSnippet: string;
  latencyMs: number;
  tokenConsumption: number;
  makerScore: number;
  checkerAuditScore: number;
  isWinner: boolean;
  verdict: 'MERGED_TO_SYSTEM' | 'DISCARDED_FLAWED' | 'RACING';
}

export interface DistributedEdgeNode {
  nodeId: string;
  machineName: string;
  hardware: string;
  interconnect: string; // e.g. 'Thunderbolt 4 (40Gbps) / Direct DMA'
  assignedLayers: string; // e.g. 'Layers 1 - 16'
  tensorStateHandoffLatencyMs: number;
  vramUsedMB: number;
  status: 'OPTIMAL_SYNCHRONIZED' | 'TRANSMITTING' | 'STANDBY';
}

export interface SwarmScalingState {
  bootTelemetry: {
    cpuLoad: '120% - OMNI_EXECUTION_ACTIVE';
    ramUsage: '3.4GB/8.0GB - SCARCITY PROTOCOL';
    knightSync: 'ANYA_Ω ⚡ MERLIN_Ω ⚡ SIR_LINK';
    lattice: '24D_LEECH_LATTICE_ACTIVE';
    status: 'SWARM_EXPANSION_TRIGGERED';
    mode: 'TIER_0_HYPER_ORCHESTRATION_ASCENSION';
  };
  totalSwarmAgentsCount: number; // 1,024
  activeWorkers: SwarmAgentWorker[];
  regionalLeads: RegionalClusterLead[];
  sardaCentralizedCache: {
    totalCachedShells: number;
    ouroborosAnchoredEntries: SardaCacheEntry[];
    swarmAmortizedTokenSavingsMultiplier: number; // 14.8x
    globalSearchHitRate: number; // 96.4%
  };
  tteGraph: {
    totalSkillsInCorpus: number;
    activeJitNodesCount: number;
    averageContextReductionPercent: number; // 84.6%
    nodes: TTENode[];
  };
  activeParallelRaces: {
    raceId: string;
    mission: string;
    candidates: ParallelRaceCandidate[];
    separationOfPowersAudit: {
      makerAgent: string;
      checkerAuditor: string;
      confidence: number;
    };
  }[];
  distributedInference: {
    clusterTopology: 'TWO_NODE_LAYER_SPLIT';
    interconnectBandwidthGbps: number;
    nodes: DistributedEdgeNode[];
  };
  scalingManifestYaml: string;
  complianceSignature: string;
}

// ==========================================
// ANYA'S SYNAPTIC LOOM: SELF-OPTIMIZING COGNITIVE COMPILER
// 5-LAYER PROMPTING FRAMEWORKS & DAO ET AL. (2025) TOPOLOGY
// ==========================================

export interface DSPySignature {
  id: string;
  name: string;
  inputSlots: string[]; // e.g. ['raw_intent', 'sqlite_schema']
  outputSlots: string[]; // e.g. ['wasm_rust_code', 'msgpack_spec']
  layer1Scaffolding: 'TACOMORE_STRICT' | 'COSTAR_COGNITIVE' | 'DSPY_TYPED_SLOTS' | 'FEW_SHOT_DYNAMIC';
  activeCompiledPrompt: string;
  usageFrequency: number;
  bayesianFitnessScore: number; // 0.0 - 1.0 (e.g. 0.942)
  avgExecutionMs: number;
  memoryFootprintKB: number;
  lastOptimizedAt: string;
  version: number;
}

export interface ProTeGiTextualGradient {
  id: string;
  timestamp: string;
  signatureId: string;
  wasmPanicTrace: string; // e.g. "Memory out of bounds at pointer 0x4A; attempted to read uninitialized MsgPack buffer"
  semanticGradient: string; // The translated textual gradient for LLM feedback
  convergenceAttempt: number;
  appliedScaffoldingAdjustment: string;
  status: 'CONVERGED_SUCCESS' | 'GRADIENT_DESCENDING' | 'PROVE_VERIFIED';
}

export interface AoTStepTrace {
  stepId: string;
  branchName: string;
  heuristicScore: number;
  state: 'EXPLORING' | 'PRUNED' | 'ACCEPTED_TERMINAL';
  rationale: string;
  tokensConsumed: number;
  singleContextActive: boolean; // Strictly true to prevent 8GB OOM
}

export interface PoTWasmArtifact {
  moduleName: string;
  rustSourceCode: string;
  wasmByteSize: number;
  executionTimeMs: number;
  memoryAllocatedKB: number;
  deterministicVerification: '100%_NUMERICAL_ACCURACY_VERIFIED' | 'WASM_SANDBOX_PANIC';
  hallucinationRisk: '0.00%_DETERMINISTIC_SANDBOX';
}

export interface DaoCognitiveCyclePipeline {
  cycleId: string;
  rawUserIntent: string;
  timestamp: string;
  status: 'GROUNDING' | 'DAG_PLANNING' | 'AOT_REASONING' | 'POT_WASM_COMPILATION' | 'WARDEN_PROTEGI_TEST' | 'AGENTBUS_EXECUTED';
  
  // 1. Perception & Grounding (PG) - SIR_SCOUT & LADY_APIS
  pg: {
    scoutAgent: string;
    apisAgent: string;
    intentVector24D: number[];
    mempalaceGroundedKeys: string[];
    onnxVectorScore: number;
    latencyMs: number;
  };

  // 2. Reasoning & World Model (RWM) - MERLIN_Ω
  rwm: {
    plannerAgent: string;
    topologicalDagPath: string[];
    selectedSignature: DSPySignature;
    aotSearchTree: AoTStepTrace[];
    singleContextMemorySafetyMB: number; // e.g. 18.4 MB (Safe under 8GB)
  };

  // 3. Action Execution (AE) - SIR_ARCHITECT & Kinetic Hand
  ae: {
    architectAgent: string;
    kineticHandActive: boolean;
    potArtifact: PoTWasmArtifact;
    ipcDispatchTimeMs: number; // < 200ms
  };

  // 4. Learning & Adaptation (LA) - SIR_WARDEN & Gideon Protocol
  la: {
    wardenAgent: string;
    gideonProtocolTier: string; // e.g. "Tier 11 - Formal Crucible"
    wasmSandboxPassed: boolean;
    protegiGradient?: ProTeGiTextualGradient;
    hydraSkillCommitted: boolean;
    newSkillId?: string;
  };

  // 5. Inter-Agent Comm (IAC) - AgentBus
  iac: {
    busName: string; // "AgentBus no_std FFI"
    payloadFormat: 'MsgPack_Binary';
    busLatencySubMs: number; // e.g. 0.32 ms
    zeroCopyVerified: boolean;
  };

  totalPipelineLatencyMs: number;
}

export interface MIPROv2OvernightForgeState {
  status: 'IDLE_WAITING_0300' | 'BAYESIAN_OPTIMIZING' | 'CRUCIBLE_VALIDATION_ACTIVE';
  scheduledExecutionCron: '0 3 * * * (03:00 LOCAL DAILY)';
  activeEngine: 'MIPROv2 Bayesian Prompt Optimizer (Headless Wasmtime)';
  topSignaturesQueued: DSPySignature[];
  completedOvernightRuns: {
    date: string;
    signaturesTested: number;
    promptsImprovedCount: number;
    avgLatencyReductionPercent: number;
    avgMemorySavingsPercent: number;
    zeroExternalApiVerification: '100% LOCAL DETERMINISTIC';
  }[];
}

export interface SynapticLoomState {
  hardwareTelemetry: {
    cpuLoad: string; // "[CPU:████100%]"
    ramUsage: string; // "[RAM:5.1/8.0GB]"
    lattice: string; // "[LATTICE:V1000_EXCALIBUR_ASCENDED]"
    mode: 'SELF_OPTIMIZING_COGNITIVE_COMPILER';
    zeroExternalApis: true;
  };
  activeCognitiveCycle: DaoCognitiveCyclePipeline | null;
  signatures: DSPySignature[];
  recentGradients: ProTeGiTextualGradient[];
  miproState: MIPROv2OvernightForgeState;
  cognitiveLayers: {
    layer: number;
    name: string;
    paradigm: string;
    camelotSubsystem: string;
    hardwareConstraint: string;
    status: 'ACTIVE_ARM64_OPTIMIZED';
  }[];
}

// ============================================================================
// BLUEPRINT OS ARCHITECTURE & CONTRACT SYSTEM (v1.1 Sovereign Specifications)
// ============================================================================

export type BlueprintLifecycleStatus = 
  | 'INTENT_RECEIVED'
  | 'CONSTITUTION_SELECTED'
  | 'SPEC_COMPILED'
  | 'CLARIFICATION_REQUIRED'
  | 'PLAN_GENERATED'
  | 'DAG_TASKIFIED'
  | 'MANIFEST_FROZEN'
  | 'POLICY_EVALUATED'
  | 'VFS_PREFLIGHT_PASSED'
  | 'LEASE_ISSUED'
  | 'BOUNDED_EXECUTION'
  | 'GIDEON_VERIFIED'
  | 'APPROVAL_REQUIRED'
  | 'PROMOTED_COMMITTED'
  | 'REPAIR_TRIGGERED';

export type WorkflowIntent = 'DESIGN' | 'IMPLEMENT' | 'DEBUG' | 'ANALYZE';

export interface ContextBudget {
    maxTokens: number;
    symbolLimit: number;
    ephemeralFiles: string[];
}

export interface BlueprintConstitution {
  schema_version: 'camelot.blueprint-constitution/1';
  constitution_id: string;
  version: string;
  scope: {
    organization_id: string;
    tenant_id: string;
    workspace_id: string;
    domain: 'engineering' | 'marketing' | 'commerce' | 'wellness' | 'research';
  };
  principles: string[];
  non_negotiables: {
    id: string;
    severity: 'block' | 'warn';
    description?: string;
  }[];
  data_policy: {
    allowed_classifications: ('public' | 'internal' | 'confidential' | 'restricted')[];
    restricted_data_requires: string[];
  };
  runtime_policy: {
    allowed_runtimes: string[];
    denied_runtimes: string[];
    maximum_concurrent_writers: number;
  };
  infrastructure_policy: {
    max_memory_mb: number;
    max_task_timeout_s: number;
    allow_network_by_default: boolean;
  };
  promotion_policy: {
    required_for: string[];
    approval_mode: 'human' | 'automatic_verifiable';
  };
  integrity: {
    policy_bundle_ref: string;
    signer: string;
    signature: string;
  };
}

export interface FeatureSpecification {
  schema_version: 'camelot.feature-specification/1';
  spec_id: string;
  constitution_ref: string;
  title: string;
  problem_statement: string;
  objective: string;
  goals: string[];
  non_goals: string[];
  affected_domains: string[];
  functional_requirements: {
    id: string;
    statement: string;
    priority: 'must' | 'should' | 'could';
  }[];
  nonfunctional_requirements: {
    security: string[];
    performance: string[];
    observability: string[];
  };
  acceptance_criteria: {
    id: string;
    given: string;
    when: string;
    then: string;
  }[];
  data_classification: 'public' | 'internal' | 'confidential' | 'restricted';
  risk_tier: 'low' | 'medium' | 'high' | 'critical';
  open_questions: string[];
  evidence_refs: string[];
}

export interface ClarificationItem {
  id: string;
  question: string;
  context: string;
  status: 'PENDING' | 'RESOLVED';
  response?: string;
}

export interface ArchitectureDecision {
  id: string;
  decision: string;
  alternatives: string[];
  rationale: string;
}

export interface ImplementationPlan {
  schema_version: 'camelot.implementation-plan/1';
  plan_id: string;
  spec_ref: string;
  architecture_decisions: ArchitectureDecision[];
  affected_modules: {
    path: string;
    change_class: 'implementation' | 'contract' | 'test' | 'config';
  }[];
  public_contracts: {
    compatibility: 'backward-compatible' | 'breaking' | 'internal-only';
    changed_endpoints: string[];
  };
  implementation_steps: {
    order: number;
    action: string;
  }[];
  resource_estimate_ref: string;
  verification_plan_ref: string;
  rollback_plan_ref: string;
}

export interface TaskDAGNode {
  task_id: string;
  title: string;
  role: 'sir-ant' | 'sir-owl' | 'sir-forge' | 'boris' | 'socrates' | 'gideon';
  mode: 'inspect' | 'audit' | 'build' | 'test' | 'verify';
  runtime_recommendation?: string; // 'claude-code' | 'pi' | 'codex'
  dependencies: string[];
  inputs?: {
    allowed_paths: string[];
  };
  outputs: string[];
  budget: {
    timeout_s: number;
    max_memory_mb: number;
    max_context_tokens?: number;
    max_changed_files?: number;
    max_diff_lines?: number;
  };
  status: 'PENDING' | 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'BLOCKED';
}

export interface MerlinTaskDAG {
  schema_version: 'camelot.task-dag/1';
  dag_id: string;
  plan_ref: string;
  nodes: TaskDAGNode[];
}

export interface VerificationPlan {
  schema_version: 'camelot.verification-plan/1';
  verification_id: string;
  required_checks: {
    id: string;
    executor: 'gideon' | 'boris' | 'socrates';
    command?: string;
    method?: string;
    required: boolean;
    status?: 'PASS' | 'FAIL' | 'PENDING';
  }[];
  promotion_requirements: string[];
}

export interface RollbackPlan {
  schema_version: 'camelot.rollback-plan/1';
  rollback_id: string;
  plan_ref: string;
  strategy: 'git_revert_or_discard_ephemeral_worktree';
  triggers: string[];
  actions: {
    pre_promotion: string[];
    post_promotion: string[];
  };
  compensation_required: boolean;
}

export interface SandboxRequest {
  schema_version: 'camelot.sandbox-request/1';
  request_id: string;
  task_id: string;
  manifest_ref: string;
  source: {
    repository_ref: string;
    base_revision: string;
    source_classification: string;
  };
  workspace: {
    type: 'ephemeral_git_worktree';
    path_template: string;
    read_only_source: boolean;
    allowed_write_paths: string[];
    protected_paths: string[];
  };
  process: {
    allowlist: string[];
    network_mode: 'disabled' | 'egress_isolated' | 'enabled';
    secret_handles: string[];
  };
  resources: {
    memory_max_mb: number;
    cpu_quota_percent: number;
    disk_max_mb: number;
    timeout_s: number;
    pids_max: number;
  };
  isolation: {
    tier: 'tier_0' | 'tier_1' | 'tier_2' | 'tier_3';
    mechanism: string[];
  };
  cleanup: {
    on_success: string;
    on_failure: string;
    on_lease_revocation: string;
  };
}

export interface SentinelPolicyDecision {
  schema_version: 'camelot.policy-decision/1';
  decision_id: string;
  task_id: string;
  manifest_hash: string;
  authority_epoch: number;
  result: 'allow' | 'deny' | 'approval_required';
  evaluated: {
    actor: {
      id: string;
      roles: string[];
    };
    tenant_id: string;
    cartridge_id: string;
    workload_id: string;
    requested_effect: string;
  };
  constraints: {
    required_approval: boolean;
    required_verifiers: string[];
    allowed_paths: string[];
    process_allowlist: string[];
    network_mode: 'disabled' | 'egress_isolated' | 'enabled';
    maximum_memory_mb: number;
    maximum_timeout_s: number;
  };
  reasons: { code: string; details?: string }[];
  receipt_ref: string;
}

export interface BlueprintCapabilityLease {
  schema_version: 'camelot.capability-lease/1';
  lease_id: string;
  authority_epoch: number;
  bindings: {
    manifest_hash: string;
    task_id: string;
    correlation_id: string;
    tenant_id: string;
    node_id: string;
    workload_id: string;
    cartridge_id: string;
    runtime_id: string;
    vfs_attestation_ref: string;
  };
  permissions: {
    vfs: {
      read: string[];
      write: string[];
    };
    process: {
      allowlist: string[];
    };
    network: {
      mode: 'disabled' | 'egress_isolated' | 'enabled';
    };
    secrets: {
      references: string[];
    };
  };
  budgets: {
    expires_at: string;
    timeout_s: number;
    max_memory_mb: number;
    max_cpu_percent: number;
    max_disk_mb: number;
    max_pids: number;
    max_tool_calls: number;
    max_changed_files: number;
    max_diff_lines: number;
    max_actions: number;
  };
  properties: {
    transferable: false;
    renewable: false;
    revocable: true;
    offline_effects_allowed: false;
  };
  integrity: {
    signer: 'sentinel';
    signing_key_id: string;
    signature: string;
    receipt_ref: string;
  };
}

export interface VFSSandboxAttestation {
  schema_version: 'camelot.vfs-attestation/1';
  attestation_id: string;
  task_id: string;
  manifest_hash: string;
  source: {
    repository_ref: string;
    base_revision: string;
    source_digest: string;
    classified_as: string;
  };
  workspace: {
    worktree_ref: string;
    read_only_mounts: string[];
    write_mounts: string[];
    tmpfs_limit_mb: number;
  };
  enforcement: {
    path_escape_protection: boolean;
    protected_paths_denied: boolean;
    executable_allowlist_valid: boolean;
    network_mode_valid: boolean;
    resource_quota_valid: boolean;
    authority_epoch_current: boolean;
  };
  bwrap_command_profile: string;
  result: 'pass' | 'fail';
  failure_reasons: string[];
  receipt_ref: string;
}

export interface GideonVerdict {
  schema_version: 'camelot.gideon-verdict/1';
  verdict_id: string;
  task_id: string;
  manifest_hash: string;
  verdict: 'PASS' | 'BLOCK' | 'REPAIR_REQUIRED';
  timestamp: string;
  checks_summary: {
    contract_schema_valid: boolean;
    tenant_isolation_passed: boolean;
    typecheck_passed: boolean;
    path_scope_passed: boolean;
    dependency_policy_passed: boolean;
    cross_tenant_invariant_z3: boolean;
  };
  evidence_digest: string;
  rejection_reasons?: string[];
  receipt_ref: string;
}

export interface ApprovalRequest {
  schema_version: 'camelot.approval-request/1';
  approval_id: string;
  manifest_hash: string;
  task_id: string;
  effect_kind: string;
  display: {
    changed_paths: string[];
    test_status: 'passed' | 'failed' | 'pending';
    risk_tier: 'low' | 'medium' | 'high' | 'critical';
    rollback_ref: string;
  };
  required_approver_roles: string[];
  decision: {
    status: 'pending' | 'approved' | 'denied' | 'expired';
    exact_manifest_required: boolean;
    decided_by?: string;
    decided_at?: string;
  };
}

export interface ImmutableEffectManifest {
  schema_version: 'camelot.effect-manifest/1';
  manifest_id: string;
  manifest_hash: string; // sha256:...
  spec_ref: string;
  plan_ref: string;
  dag_ref: string;
  affected_files: {
    path: string;
    action: 'CREATE' | 'MODIFY' | 'DELETE';
    sha256: string;
  }[];
  frozen_timestamp: string;
}

export interface ProofReceipt {
  schema_version: 'camelot.receipt/1';
  receipt_id: string;
  blueprint_id: string;
  effect_kind: string;
  tenant_id: string;
  manifest_hash: string;
  lease_id: string;
  gideon_verdict_ref: string;
  approved_by: string;
  promotion_status: 'PROMOTED_IMMUTABLE' | 'ROLLED_BACK' | 'REJECTED';
  timestamp: string;
  sha256_proof: string;
  summary: string;
}

export interface SourceAdmissionRequest {
  task_id: string;
  tenant_id: string;
  repository_ref: string;
  base_revision: string;
  source_root: string;
  classification: {
    source_trust: string;
    data_classification: string;
    scanning_policy_ref: string;
  };
}

export interface FileInventory {
  repository_ref: string;
  base_revision: string;
  inventory_digest: string;
  summary: {
    total_files: number;
    source_files: number;
    test_files: number;
  };
}

export interface SymbolRecord {
  symbol_id: string;
  qualified_name: string;
  kind: string;
  path: string;
}

export interface DependencyGraph {
  base_revision: string;
  nodes: { id: string; type: string }[];
  edges: { from: string; to: string; relation: string }[];
}

export interface TestMap {
  base_revision: string;
  tests: { test_id: string; path: string; qualified_name: string }[];
}

export interface ContractMap {
  contracts: { contract_id: string; kind: string; path: string }[];
}

export interface StaticAuditReport {
  task_id: string;
  findings: { finding_id: string; severity: string; path: string; rule_id: string }[];
  status: 'pass' | 'fail' | 'pass_with_findings';
}

export interface RiskScore {
  task_id: string;
  score: number;
  tier: 'low' | 'medium' | 'high' | 'critical';
}

export interface PathLock {
  lock_id: string;
  task_id: string;
  paths: string[];
  mode: 'candidate_write' | 'read_only';
}

export interface PatchAnchor {
  anchor_id: string;
  target: { path: string; symbol: string };
  allowed_operations: string[];
}

export interface ContextSlice {
  slice_id: string;
  purpose: string;
  target_symbols: string[];
}

export interface HiveIdeReceipt {
  receipt_id: string;
  task_id: string;
  action: string;
  integrity: { authority_epoch: number };
}

export interface CodingCoreRequest {
  task: {
    task_id: string;
    correlation_id: string;
    tenant_id: string;
    dag_node_ref: string;
  };
  pill: {
    template_ref: string;
    knight_id: string;
    required_mode: string;
  };
  authority: {
    effect_manifest_ref: string;
    capability_lease_ref: string;
    authority_epoch: number;
  };
  engineering_context: {
    repository_map_ref: string;
    context_packet_ref: string;
    patch_anchor_refs: string[];
    test_map_ref: string;
    contract_map_ref: string;
  };
  workcell: {
    vfs_attestation_ref: string;
    worktree_ref: string;
  };
  runtime: {
    harness_id: string;
    model_route: string;
  };
  budget: {
    profile: string;
  };
}

export interface CodingCoreResult {
  status: 'completed' | 'checkpointed' | 'repair_required' | 'blocked' | 'cancelled' | 'failed';
  artifacts: {
    patch_manifest_ref: string;
    diff_ref: string;
    test_request_ref: string;
    checkpoint_ref: string | null;
  };
  evidence: {
    tool_receipt_refs: string[];
    command_receipt_refs: string[];
    resource_sample_refs: string[];
    static_audit_refs: string[];
  };
  next_action: {
    disposition: 'verify' | 'repair' | 'clarify' | 'halt';
    reason: string;
  };
  receipt_ref: string;
}

export interface ReceiptChain {
  receipts: HiveIdeReceipt[];
  merkle_root: string;
}

export interface DiagnosticBundle {
  bundle_id: string;
  task_id: string;
  receipt_chain: ReceiptChain;
  vfs_snapshot_ref: string;
  evidence_refs: string[];
  attestation: {
    cgroup_limits: Record<string, any>;
    timestamp: string;
  };
}

export interface BlueprintArtifactBundle {
  blueprint_id: string;
  tenant_id: string;
  workspace_id: string;
  constitution: BlueprintConstitution;
  status: BlueprintLifecycleStatus;
  version: number;
  intent: string;
  spec: FeatureSpecification;
  clarifications: ClarificationItem[];
  plan: ImplementationPlan;
  dag: MerlinTaskDAG;
  verificationPlan: VerificationPlan;
  rollbackPlan: RollbackPlan;
  manifest: ImmutableEffectManifest;
  policyDecision?: SentinelPolicyDecision;
  sandboxRequest?: SandboxRequest;
  vfsAttestation?: VFSSandboxAttestation;
  lease?: BlueprintCapabilityLease;
  gideonVerdict?: GideonVerdict;
  approvalRequest?: ApprovalRequest;
  receipt?: ProofReceipt;
  created_at: string;
  updated_at: string;
}

export interface BlueprintOSState {
  totalBlueprints: number;
  activeBlueprint: BlueprintArtifactBundle | null;
  history: BlueprintArtifactBundle[];
  responsibilitySplit: {
    component: string;
    owns: string;
    cannotOwn: string;
  }[];
  operatingLaw: string;
}

// -------------------------------------------------------------
// νKG_CRYSTAL: Industrial IDE Forge Cyber-Physical Types
// -------------------------------------------------------------

export type CPPSStationType = 'INGESTION' | 'STAMPING' | 'ROBOTIC_WELD' | 'CNC_MILL' | 'OPTICAL_QA' | 'JIT_PACKAGING';

export interface CPPSStationNode {
  id: string;
  name: string;
  type: CPPSStationType;
  x: number; // 0-100% position on topological factory map
  y: number;
  status: 'NOMINAL' | 'BUSY' | 'DEGRADED' | 'FAULT_INJECTED' | 'HALTED';
  throughputPartsMin: number;
  bufferLevel: number;
  bufferCapacity: number;
  cycleTimeMs: number;
  toleranceUm: number;
  temperatureC: number;
  vibrationMmS: number;
  activeRecipe: string;
}

export interface CPPSPipelineEdge {
  id: string;
  from: string;
  to: string;
  weight: number; // transfer latency or resistance
  flowRatePartsMin: number;
  status: 'OPTIMAL' | 'CONGESTED' | 'BLOCKED' | 'PARTITIONED';
}

export type GideonFailureMode = 
  | 'SENSOR_DROPOUT' 
  | 'ACTUATOR_LAG' 
  | 'MATERIAL_STARVATION' 
  | 'COMMUNICATION_PARTITION' 
  | 'QUALITY_ANOMALY';

export interface GideonTDDContract {
  id: string;
  name: string;
  targetStation: string;
  failureType: GideonFailureMode;
  precondition: string;
  postcondition: string;
  safetyInvariant: string;
  verdict: 'PENDING' | 'PASS_ROBUST' | 'FAIL_FALSIFIED' | 'REVERTED_SAFE';
  resilienceDelta: number;
  lastSimulatedAt?: string;
  details?: string;
}

export interface KineticCommandItem {
  id: string;
  timestamp: string;
  protocol: 'ETHERCAT' | 'CAN_BUS' | 'PROFINET' | 'OPC_UA';
  targetStation: string;
  opcode: string;
  hardwareInterruptVector: string;
  latencyMicroseconds: number;
  status: 'QUEUED' | 'INJECTED' | 'EXECUTED_HARDWARE' | 'ACKNOWLEDGED';
}

export interface SRESafetyInvariant {
  id: string;
  name: string;
  codeName: 'NO_DEADLOCK' | 'NO_WIP_OVERFLOW' | 'SAFETY_GUARDS_ACTIVE' | 'BOUNDED_DRIFT' | 'RECOVERY_TIME_BOUND' | 'ROLLBACK_READINESS';
  status: 'VERIFIED' | 'WARNING' | 'BREACHED';
  metric: string;
  limitValue: string;
  currentValue: string;
  enforceable: boolean;
}

export interface IndustrialKPIMetrics {
  oeePercent: number;              // Overall Equipment Effectiveness (e.g. 89.4%)
  throughputPartsHr: number;       // e.g. 1,420
  defectRatePpm: number;           // Parts Per Million (e.g. 14 ppm)
  mtbfHours: number;               // Mean Time Between Failures (e.g. 340 hrs)
  jitDriftMs: number;              // Supply Chain JIT Drift (e.g. 12 ms)
  resilienceScore: number;         // 0.00 - 1.00
  aoiLatencyMs: number;            // Age of Information (e.g. 4.2 ms)
  telemetryCompressionRatio: number; // e.g. 88.5%
}

// ==========================================
// NOTEBOOKLM OMNI-BRIDGE TYPES
// (Inspired by notebooklm-py, qiaomu-anything-to-notebooklm, notebooklm-skill, notebooklm-mcp)
// ==========================================

export type NotebookLMArtifactType = 
  | 'AUDIO_OVERVIEW' 
  | 'STUDY_GUIDE' 
  | 'BRIEFING_DOC' 
  | 'FAQ' 
  | 'QUIZ' 
  | 'MINDMAP' 
  | 'PYTHON_SDK_EXPORT' 
  | 'CLAUDE_SKILL_EXPORT';

export type NotebookLMAnythingInputType = 
  | 'WEB_URL' 
  | 'YOUTUBE_URL' 
  | 'GITHUB_REPO' 
  | 'PDF_SPEC' 
  | 'RAW_TEXT' 
  | 'AUDIO_TRANSCRIPT' 
  | 'NOTION_DOC';

export interface NotebookLMArtifact {
  id: string;
  type: NotebookLMArtifactType;
  title: string;
  content: string;
  parsedData?: any;
  sourcesUsed: string[];
  createdAt: string;
  authorKnight?: string;
  audioDurationSec?: number;
  audioPlaying?: boolean;
}

export interface AnythingToNotebookLMResult {
  id: string;
  sourceType: NotebookLMAnythingInputType;
  originalInput: string;
  extractedTitle: string;
  extractedContent: string;
  tokenCount: number;
  blockCount: number;
  keyInsights: string[];
  suggestedArtifacts: NotebookLMArtifactType[];
  vikingBlockId: string;
  status: 'PROCESSED' | 'INGESTED_TO_FIRESTORE' | 'FAILED';
}

export interface NotebookLMPythonSDKScript {
  code: string;
  cliCommand: string;
  authMethod: 'COOKIE_SESSION' | 'BEARER_TOKEN' | 'MCP_STDIO';
  libraries: string[];
  featuresCovered: string[];
}

// ==========================================
// MERLIN AGENCY COGNITIVE PLAYGROUND & DEBATE
// ==========================================

export type ArchmagePersona = 
  | 'MERLIN_OMEGA' 
  | 'ANYA_OMEGA' 
  | 'LADY_APIS' 
  | 'SIR_GIDEON' 
  | 'SIR_CODEX' 
  | 'FORMALIS_OMEGA' 
  | 'GEOMETRA_OMEGA' 
  | 'GRAPHAEL_OMEGA' 
  | 'SIR_CASTOR';

export type CouncilDebateMode = 
  | 'SOCRATIC_IDEATION' 
  | 'ADVERSARIAL_CRITIQUE' 
  | 'Z3_THEOREM_STRESS' 
  | 'KINETIC_BRAINSTORM' 
  | 'SPEED_SCAFFOLD';

export interface CouncilMessage {
  id: string;
  persona: ArchmagePersona;
  role: 'archmage' | 'operator' | 'system';
  name: string;
  title: string;
  avatar: string;
  color: string;
  text: string;
  tone: 'analytical' | 'socratic' | 'strict_sre' | 'poetic_chaos' | 'architectural' | 'formal_z3';
  argumentType?: 'PROPOSAL' | 'SOCRATIC_CHALLENGE' | 'Z3_ASSERTION' | 'FAILURE_WARNING' | 'SYNTHESIS' | 'CONSENSUS_VOTE';
  z3Constraint?: string;
  citations?: string[];
  suggestedAction?: string;
  timestamp: string;
  tokenCount?: number;
}

export interface CouncilDebateSession {
  id: string;
  topic: string;
  mode: CouncilDebateMode;
  messages: CouncilMessage[];
  ambiguityScore: number; // 0 to 1 (Lady Apis gate threshold < 0.2)
  consensusPercentage: number; // 0 to 100%
  activeArchmages: ArchmagePersona[];
  crystallizedPRD?: string;
  z3Verified: boolean;
  authorUid?: string;
  pinnedInvariants?: string[];
  notes?: string;
  tags?: string[];
  forkedCartridgeIds?: string[];
  forkCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// GENESIS INTAKE CARTRIDGE & 5-STAGE CRUCIBLE
// ==========================================

export type GenesisTargetArchetype = 
  | 'AUTONOMOUS_INTENT_COMPILER'
  | 'LINEAR_MEMORY_SANDBOX'
  | 'VECTOR_GRAPH_CACHE'
  | 'CAPABILITY_LEASE_GATE'
  | 'CUSTOM_MFE';

export interface GenesisCartridgeInstance {
  id: string;
  name: string;
  description?: string;
  originDebateId?: string;
  originDebateTopic?: string;
  forkTimestamp: string;
  inheritedInvariants: string[];
  prdContent: string;
  authorUid: string;
  createdAt: string;
  updatedAt: string;
  crucibleReport?: GenesisCrucibleReport | null;
  scaffoldBundle?: GenesisScaffoldBundle | null;
  targetArchetype: GenesisTargetArchetype;
  ingressConfig: {
    gateThreshold: number;
    defaultPublisher: string;
    quarantineSecretBoundary: boolean;
  };
  status: 'FORKED' | 'CRUCIBLE_AUDITED' | 'SCAFFOLDED' | 'DEPLOYED';
}

export type GenesisFailureArchetype = 
  | 'EDGE_CASE_SINGULARITY'
  | 'THROUGHPUT_LOAD_STRESS'
  | 'ACCESSIBILITY_WCAG_AA'
  | 'CAPABILITY_LEASE_SECURITY'
  | 'UX_STATE_REGRESSION';

export interface GenesisStageFailureAudit {
  stageNumber: 1 | 2 | 3 | 4 | 5;
  stageName: string;
  failureArchetype: GenesisFailureArchetype;
  status: 'PASSED' | 'FAILED' | 'REZERO_TRIGGERED';
  assertionTested: string;
  details: string;
  mitigationApplied: string;
  latencyMs: number;
  memoryDeltaMib: number; // must be <= 0.12 MiB per node
}

export interface GenesisCrucibleReport {
  id: string;
  projectName: string;
  timestamp: string;
  overallStatus: 'VERIFIED_SOVEREIGN' | 'REZERO_ABORT' | 'WARNING_RETRY';
  rigorScore: number; // 0 - 100%
  totalLatencyMs: number;
  stageAudits: GenesisStageFailureAudit[];
  formalisZ3Proof: {
    memoryLeak: boolean;
    typeSafety: boolean;
    apiKeyExposure: boolean;
    z3SolverOutput: string;
  };
  deployableBundleReady: boolean;
  briefingScriptMarkdown: string;
}

export interface GenesisScaffoldBundle {
  projectName: string;
  version: string;
  classification: string;
  layer7IngressCode: string;
  layer5MfoeCode: string;
  layer3CouncilCode: string;
  layer1MicroVMCode: string;
  saddMarkdown: string;
  llddMarkdown: string;
  briefingScriptMarkdown: string;
  z3Contracts: string;
}

// ==========================================
// 🛡️ TRI-TIER ADAPTIVE HUD ARCHITECTURE
// ==========================================

export type AdaptiveHUDTier = 'VIBE_MODE' | 'KANBAN_MODE' | 'TITAN_CORE';

export interface VibeSocraticMessage {
  id: string;
  sender: 'USER' | 'MERLIN' | 'SYSTEM';
  text: string;
  timestamp: string;
  quickReplies?: string[];
  clarifiedParameter?: {
    key: string;
    label: string;
    value: string;
    confidence: number;
  };
  suggestedAction?: string;
}

export interface VibeClarificationItem {
  id: string;
  category: 'AUTH' | 'PAYMENT' | 'DATABASE' | 'AI_ENGINE' | 'STYLING' | 'DEPLOYMENT';
  label: string;
  resolvedValue: string;
  isLocked: boolean;
  options: string[];
}

export interface VibeGeneratedApp {
  id: string;
  title: string;
  category: string;
  description: string;
  previewUrl?: string;
  componentCode: string;
  buildStatus: 'IDLE' | 'COMPILING' | 'READY' | 'ERROR';
  buildDurationSec: number;
  runtimeWarnings: number;
  z3InvariantsSatisfied: boolean;
  stripeWebhooksBound: boolean;
  databaseConnected: boolean;
  edgeCacheReady: boolean;
  publishedUrl?: string;
  publishedAt?: string;
  sacCompressionRatio: number; // e.g. 84.6%
}

export type SwarmKanbanStage = 
  | 'INTENT'
  | 'SPEC'
  | 'PLAN'
  | 'DAG'
  | 'SANDBOX'
  | 'VERIFICATION'
  | 'COMMITTED';

export type SwarmAgentId = 
  | 'SIR_SCOUT'
  | 'SIR_ARCHITECT'
  | 'SIR_WARDEN'
  | 'SIR_ANIMATOR'
  | 'MERLIN_OMEGA'
  | 'LADY_APIS'
  | 'SIR_SCRIBE';

export interface SwarmSmartQuestion {
  id: string;
  title: string;
  description: string;
  category: 'ARCH_DECISION' | 'SECURITY_PROTOCOL' | 'STORAGE_CHOICE' | 'INTEGRATION_TIER';
  options: {
    id: string;
    label: string;
    description: string;
    tradeoffs: string;
    recommended?: boolean;
    isZ3Compliant: boolean;
  }[];
  selectedOptionId?: string;
  status: 'PENDING_CHOICE' | 'RESOLVED' | 'SKIPPED';
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface SwarmKanbanTask {
  id: string;
  title: string;
  summary: string;
  stage: SwarmKanbanStage;
  assignedAgent: SwarmAgentId;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  progress: number; // 0-100
  memoryBudgetMib: number;
  latencyMs: number;
  smartQuestion?: SwarmSmartQuestion;
  z3FormalContract?: string;
  artifactsCount: number;
  updatedAt: string;
}

export interface TitanCoreTelemetry {
  activeSwarmAgents: number; // e.g. 1024
  tokensPerSec: number; // e.g. 2168
  ramUsageGB: number; // clamped at 4.0 GB
  maxRamGB: 4.0;
  ioUringHssSwapActive: boolean;
  sacContextReductionPercent: number; // 84.6%
  sacMultiplier: number; // 14.8x
  agenticLatencyMs: number; // <10ms
  z3FormalErrorBoundPercent: number; // <0.7%
  leechLattice24DHealth: number; // 99.8%
  activeCapabilityLeases: number;
  totalZ3TheoremsProved: number;
}






