/**
 * Sovereign WASM Master Architecture v4.0 - Mode System Instruction & Constrained Resource Engine
 * 
 * Enforces strict resource partitioning and system instruction isolation across modes.
 * Total system resources (8.0 GB RAM / 8 Cores ARM64) are NEVER allocated monolithically.
 * When hot-swapped, the engine unloads previous sandboxes, de-allocates idle subsystems,
 * and binds strictly to the active mode's minimal functional footprint.
 */

import { MainView } from '../App';

export interface ModeResourceConstraint {
  allocatedRamGB: number;
  totalRamGB: number;
  ramPercentage: number;
  activeCores: number;
  totalCores: number;
  coreAffinity: string;
  wasmPageQuota: number;
  gpuShaderTier: 'DISABLED' | 'LOW' | 'MEDIUM' | 'HIGH';
  networkPorts: string[];
  backgroundTickRateMs: number;
  deallocatedSubsystems: string[];
}

export interface ModeSystemInstruction {
  modeId: MainView;
  instructionId: string;
  personaName: string;
  title: string;
  roleDescription: string;
  activeCapabilities: string[];
  enforcedRules: string[];
  resourceConstraint: ModeResourceConstraint;
  color: string;
  accentColor: string;
}

export const MODE_SYSTEM_INSTRUCTIONS: Record<MainView, ModeSystemInstruction> = {
  MERLIN_AGENCY: {
    modeId: 'MERLIN_AGENCY',
    instructionId: 'MERLIN_Ω_ROUTER_CONTRACT_V4',
    personaName: 'Merlin Ω Prime Orchestrator',
    title: "Merlin's Sovereign Software Agency",
    roleDescription: 'Master intent router, 7-gate intake grill operator, and multi-agent DAG task dispatcher.',
    activeCapabilities: [
      '7_GATE_GRILL_INTAKE',
      'TOPOLOGICAL_DAG_DISPATCH',
      'SENTINEL_CAPABILITY_LEASES',
      'HIGH_TICKET_PROPOSAL_DECK',
      'CONTRACT_COMPILER_VFS'
    ],
    enforcedRules: [
      'Parse intake intents through the strict 7-gate validation grill before DAG generation.',
      'Enforce capability-based security leases with cryptographic hash verification.',
      'Allocate sub-agent tasks only to idle Knights via MsgPack FFI bus.',
      'De-allocate heavy WebGL shaders and LLM live audio streams to preserve memory.'
    ],
    resourceConstraint: {
      allocatedRamGB: 1.8,
      totalRamGB: 8.0,
      ramPercentage: 22.5,
      activeCores: 2,
      totalCores: 8,
      coreAffinity: 'Cores 0-1 (ARM64_Affinity)',
      wasmPageQuota: 28800,
      gpuShaderTier: 'DISABLED',
      networkPorts: ['Port 4001 (MsgPack Router)', 'Port 4002 (Telemetry Sync)'],
      backgroundTickRateMs: 3000,
      deallocatedSubsystems: [
        'WebGL Shader Engine',
        'Audio Visemes Pipeline',
        'SMT Z3 Live Fuzzer',
        'Speech Recognition Buffer',
        'High-Res Canvas Renderer'
      ]
    },
    color: '#D4AF37',
    accentColor: 'rgba(212, 175, 55, 0.15)'
  },

  BLUEPRINT_OS: {
    modeId: 'BLUEPRINT_OS',
    instructionId: 'SIR_ARCHITECT_&_SCRIBE_SPEC_CONTRACT_V4',
    personaName: 'Sir Architect & Sir Scribe',
    title: 'Holographic Blueprint OS Chassis',
    roleDescription: 'Deterministic system architecture generator, Markdown specification harness, and exploded DAG assembler.',
    activeCapabilities: [
      'EXPLODED_ASSEMBLY_DAG',
      'GLOBAL_MARKDOWN_HARNESS',
      'KINETIC_LOCK_DIALS',
      'MSGPACK_SCHEMA_BOUNDS',
      'ARCHITECTURAL_FREEZE_GUARD'
    ],
    enforcedRules: [
      'Lock core architectural chassis before permitting downstream code generation.',
      'Validate all API boundaries against immutable Markdown configuration contracts.',
      'Generate deterministic dependency graphs with acyclic node traversal.',
      'De-allocate live terminal runners and LLM audio streams while compiling specs.'
    ],
    resourceConstraint: {
      allocatedRamGB: 1.2,
      totalRamGB: 8.0,
      ramPercentage: 15.0,
      activeCores: 2,
      totalCores: 8,
      coreAffinity: 'Cores 1-2 (ARM64_Affinity)',
      wasmPageQuota: 19200,
      gpuShaderTier: 'DISABLED',
      networkPorts: ['Port 4010 (Schema VFS IPC)'],
      backgroundTickRateMs: 5000,
      deallocatedSubsystems: [
        'Multi-Knight Swarm Runners',
        'Live Terminal Shell',
        'Speech Recognition Core',
        'WebGL Shader Buffers',
        'OAuth Network Handlers'
      ]
    },
    color: '#00F0FF',
    accentColor: 'rgba(0, 240, 255, 0.15)'
  },

  HIVE_IDE: {
    modeId: 'HIVE_IDE',
    instructionId: 'KNIGHTS_CONCURRENCY_&_GIDEON_CRUCIBLE_CONTRACT_V4',
    personaName: 'Multi-Knight Swarm & Gideon SRE Prover',
    title: 'Hive IDE Swarm Coding Matrix',
    roleDescription: 'Parallel multicursor thermal streams, Gideon level-5 automated crucible, and voice-to-task intake matrix.',
    activeCapabilities: [
      'MULTICURSOR_THERMAL_STREAM',
      'GIDEON_5_ARCHETYPE_CRUCIBLE',
      'COLLISION_DEBATE_ARBITRATION',
      'VOICE_TO_TASK_CAPTURE_ENGINE',
      'Z3_FORMAL_PROVER_SANDBOX'
    ],
    enforcedRules: [
      'Execute code branches concurrently labeled by assigned Knight personas.',
      'Auto-resolve panics in the crucible or halt for voice override on branch collisions.',
      'Maintain sub-150ms latency for voice-to-task stream injections.',
      'De-allocate Google Workspace REST and Penpot AST engines during code compilation.'
    ],
    resourceConstraint: {
      allocatedRamGB: 2.8,
      totalRamGB: 8.0,
      ramPercentage: 35.0,
      activeCores: 4,
      totalCores: 8,
      coreAffinity: 'Cores 0-3 (ARM64_Affinity)',
      wasmPageQuota: 44800,
      gpuShaderTier: 'LOW',
      networkPorts: ['Port 4020 (Micro-VFS)', 'Port 4021 (Crucible SMT)', 'Port 4022 (Speech Parser)'],
      backgroundTickRateMs: 3500,
      deallocatedSubsystems: [
        'Google OAuth REST Worker',
        'Penpot Vector Importer',
        'Neural Style Dictionary',
        '24H Continuous SRE Scanner',
        'High-Throughput Image Gen'
      ]
    },
    color: '#10B981',
    accentColor: 'rgba(16, 185, 129, 0.15)'
  },

  TOPOLOGICAL_MESH: {
    modeId: 'TOPOLOGICAL_MESH',
    instructionId: 'SIR_SCOUT_&_WARDEN_TOPOLOGY_CONTRACT_V4',
    personaName: 'Sir Scout & Sir Warden',
    title: 'Topological State Graph & SRE Sentinel',
    roleDescription: 'Real-time UI state topology visualizer, execution bottleneck isolator, and continuous audit sentinel.',
    activeCapabilities: [
      'TOPOLOGICAL_FLOW_GRAPH',
      'BOTTLENECK_HEATMAP_ISOLATOR',
      '24H_CONTINUOUS_SRE_AUDIT',
      'GIDEON_FAILURE_REGRESSION_POLICY',
      'AUTO_ROLLBACK_SENTINEL'
    ],
    enforcedRules: [
      'Continuously audit micro-frontend IPC latency and graph connectivity.',
      'Trigger automatic rollback upon detecting Gideon failure archetype regressions.',
      'Visualize real-time execution flow without blocking background Wasmtime tasks.',
      'De-allocate IDE terminal runners and heavy neural transformers.'
    ],
    resourceConstraint: {
      allocatedRamGB: 0.9,
      totalRamGB: 8.0,
      ramPercentage: 11.2,
      activeCores: 1,
      totalCores: 8,
      coreAffinity: 'Core 4 (ARM64_Affinity)',
      wasmPageQuota: 14400,
      gpuShaderTier: 'DISABLED',
      networkPorts: ['Port 4030 (Topology Stream IPC)'],
      backgroundTickRateMs: 4000,
      deallocatedSubsystems: [
        'Wasmtime Code Compiler',
        'Multi-Knight Terminal Shell',
        'Google Workspace Sync',
        'Audio Stream Buffer',
        'WebGL Shader Engine'
      ]
    },
    color: '#06B6D4',
    accentColor: 'rgba(6, 182, 212, 0.15)'
  },

  SWARM_COMMAND_CENTER: {
    modeId: 'SWARM_COMMAND_CENTER',
    instructionId: 'SENTINEL_SWARM_OPERATOR_COCKPIT_V1',
    personaName: 'Sentinel & Operator',
    title: 'Swarm Command Center',
    roleDescription: 'Digital Factory operator cockpit for DAG visualization, lease revocation, and exact consequence approval.',
    activeCapabilities: [
      'GIDEON_VERDICT_ANALYSIS',
      'VFS_GUARDIAN_SUPERVISION',
      'LEASE_REVOCATION',
      'RECEIPT_TIMELINE_EXPORT'
    ],
    enforcedRules: [
      'Present evidence-first control surfaces for engineering task graphs.',
      'Require human approval (Excalibur warrant) for consequential patches.',
      'Observe VFS and Sentinel lease status continuously.'
    ],
    resourceConstraint: {
      allocatedRamGB: 2.1,
      totalRamGB: 8.0,
      ramPercentage: 26.2,
      activeCores: 3,
      totalCores: 8,
      coreAffinity: 'Cores 2-4 (ARM64_Affinity)',
      wasmPageQuota: 33600,
      gpuShaderTier: 'HIGH',
      networkPorts: ['Port 4040 (Token Dictionary)', 'Port 4041 (Kinetic Shader Pipeline)'],
      backgroundTickRateMs: 2500,
      deallocatedSubsystems: [
        'Gideon Z3 Formal Prover',
        'Google OAuth REST Worker',
        'Multi-Knight Concurrency Shell',
        '24H Continuous Audit Scanner',
        'CLI Terminal Matrix'
      ]
    },
    color: '#F59E0B',
    accentColor: 'rgba(245, 158, 11, 0.15)'
  },

  GEMINI_NEXUS: {
    modeId: 'GEMINI_NEXUS',
    instructionId: 'GEMINI_3_1_PRO_MULTIMODAL_REASONING_CONTRACT_V4',
    personaName: 'Gemini Nexus Omni Engine',
    title: 'Gemini Nexus Cognitive Engine',
    roleDescription: 'Multimodal LLM cognitive engine, server-side search grounding proxy, and live audio interaction engine.',
    activeCapabilities: [
      'MULTIMODAL_REASONING_CORE',
      'SERVER_SIDE_GEMINI_PROXY',
      'LIVE_AUDIO_VISEMES_STREAM',
      'SEARCH_GROUNDING_STREAM',
      'PROMPT_CALIBRATION_SYNTHESIZER'
    ],
    enforcedRules: [
      'Ensure all Gemini API calls and secret credentials remain strictly server-side.',
      'Stream live multimodal reasoning tokens via secure server-sent event (SSE) channels.',
      'Ground responses against authoritative Google Search indices when factual rigor is required.',
      'De-allocate Penpot vector parsers and SRE graph auditors during inference.'
    ],
    resourceConstraint: {
      allocatedRamGB: 2.4,
      totalRamGB: 8.0,
      ramPercentage: 30.0,
      activeCores: 4,
      totalCores: 8,
      coreAffinity: 'Cores 4-7 (ARM64_Affinity)',
      wasmPageQuota: 38400,
      gpuShaderTier: 'MEDIUM',
      networkPorts: ['Port 4050 (Live SSE Proxy)', 'Port 4051 (Grounding Channel)'],
      backgroundTickRateMs: 2000,
      deallocatedSubsystems: [
        'Penpot AST Ingester',
        'Topological Graph Engine',
        'Local SQLite WAL Engine',
        'Crucible SRE Fuzzer',
        'Micro-VFS Worktree'
      ]
    },
    color: '#A855F7',
    accentColor: 'rgba(168, 85, 247, 0.15)'
  },

  GOOGLE_WORKSPACE: {
    modeId: 'GOOGLE_WORKSPACE',
    instructionId: 'LADY_APIS_ETL_&_GOOGLE_WORKSPACE_SYNC_CONTRACT_V4',
    personaName: 'Lady Apis (ETL & Workspace Connector)',
    title: 'Google Grid & Workspace Sync Hub',
    roleDescription: 'Client-side OAuth 2.0 gateway, Drive artifact vault, Sheets audit exporter, and Calendar lease scheduler.',
    activeCapabilities: [
      'GOOGLE_IDENTITY_OAUTH_FLOW',
      'DRIVE_MANIFEST_EXPORTER',
      'SHEETS_AUDIT_STREAM_PIPELINE',
      'DOCS_SPECIFICATION_PUBLISHER',
      'CALENDAR_DEPLOYMENT_SCHEDULER'
    ],
    enforcedRules: [
      'Acquire Google OAuth tokens strictly client-side via Google Identity Services (GSI).',
      'Transmit bearer tokens securely in Authorization headers without storing secrets.',
      'Export cryptographically hashed proof receipts into Google Drive and Sheets.',
      'De-allocate WebGL shaders and IDE multi-cursor matrices to minimize memory footprints.'
    ],
    resourceConstraint: {
      allocatedRamGB: 1.1,
      totalRamGB: 8.0,
      ramPercentage: 13.7,
      activeCores: 1,
      totalCores: 8,
      coreAffinity: 'Core 7 (ARM64_Affinity)',
      wasmPageQuota: 17600,
      gpuShaderTier: 'DISABLED',
      networkPorts: ['Port 4060 (Google REST Sync Worker)'],
      backgroundTickRateMs: 15000,
      deallocatedSubsystems: [
        'WebGL Shader Engine',
        'Multi-Knight Thermal Matrix',
        'SMT Gideon Prover',
        'Speech Recognition Parser',
        'Style Dictionary Transformer'
      ]
    },
    color: '#38BDF8',
    accentColor: 'rgba(56, 189, 248, 0.15)'
  },

  MCP_SERVER: {
    modeId: 'MCP_SERVER',
    instructionId: 'ARTHURIAN_MCP_SERVER_JSONRPC2_CONTRACT_V4',
    personaName: 'Arthurian Sovereign MCP Engine',
    title: 'Arthurian Sovereign MCP Server Forge',
    roleDescription: 'Full-stack Model Context Protocol server exposing Arthurian Knights, JSON-RPC 2.0 tool registry, SSE event transport, and Claude/Cursor client exporters.',
    activeCapabilities: [
      'JSON_RPC_2_0_DISPATCH',
      'SSE_EVENT_STREAM_TRANSPORT',
      'KNIGHT_TOOL_REGISTRY',
      'RESOURCE_VAULT_PULL',
      'PROMPT_TEMPLATE_INTERPOLATION',
      'CLAUDE_CURSOR_CONFIG_GEN'
    ],
    enforcedRules: [
      'Serve strict JSON-RPC 2.0 protocol specifications (v2024-11-05).',
      'Isolate tool execution inside ephemeral sandboxes with telemetry logs.',
      'Stream real-time SSE heartbeats every 15s to prevent client timeouts.',
      'Provide one-click copyable configurations for Claude Desktop and Cursor IDE.'
    ],
    resourceConstraint: {
      allocatedRamGB: 1.5,
      totalRamGB: 8.0,
      ramPercentage: 18.7,
      activeCores: 2,
      totalCores: 8,
      coreAffinity: 'Cores 2-3 (ARM64_Affinity)',
      wasmPageQuota: 24000,
      gpuShaderTier: 'DISABLED',
      networkPorts: ['Port 3000 (HTTP/SSE JSON-RPC)'],
      backgroundTickRateMs: 3000,
      deallocatedSubsystems: [
        'WebGL Shader Engine',
        'Audio Visemes Pipeline',
        'High-Res Canvas Renderer',
        'ProTeGi Gradient Optimizer'
      ]
    },
    color: '#8B5CF6',
    accentColor: 'rgba(139, 92, 246, 0.15)'
  },

  COGNITIVE_PLAYGROUND: {
    modeId: 'COGNITIVE_PLAYGROUND',
    instructionId: 'NINE_SEAT_ARCHMAGE_COGNITIVE_DEBATE_CONTRACT_V4',
    personaName: 'Nine-Seat Archmage Council',
    title: 'Merlin Agency Cognitive Playground',
    roleDescription: 'Multi-agent Socratic debate chamber, Z3 SMT-LIB theorem prover stress engine, and PRD crystallization synthesizer.',
    activeCapabilities: [
      'NINE_SEAT_COUNCIL_ORCHESTRATION',
      'SOCRATIC_AMBIGUITY_INQUEST',
      'Z3_SMT_LIB_PROOF_SOLVER',
      'KINETIC_PRD_CRYSTALLIZATION',
      'DUAL_STREAM_ROUTING'
    ],
    enforcedRules: [
      'Ensure ambiguity score drops below 0.20 before allowing physical code compilation.',
      'Formally verify memory leak and key exposure invariants via Z3 SMT-LIB proofs.',
      'Simulate multi-agent Socratic friction across 9 specialized Archmage personas.',
      'De-allocate unneeded 3D mesh rendering during deep cognitive debate cycles.'
    ],
    resourceConstraint: {
      allocatedRamGB: 2.1,
      totalRamGB: 8.0,
      ramPercentage: 26.2,
      activeCores: 4,
      totalCores: 8,
      coreAffinity: 'Cores 0-3 (ARM64_Affinity)',
      wasmPageQuota: 33600,
      gpuShaderTier: 'LOW',
      networkPorts: ['Port 3000 (Council Stream API)'],
      backgroundTickRateMs: 1200,
      deallocatedSubsystems: [
        '3D Mesh Pipeline',
        'Penpot AST Ingester',
        'Video Encoding DSP'
      ]
    },
    color: '#D4AF37',
    accentColor: 'rgba(212, 175, 55, 0.15)'
  },

  GENESIS_INTAKE: {
    modeId: 'GENESIS_INTAKE',
    instructionId: 'GENESIS_INTAKE_4_LAYER_CRUCIBLE_CONTRACT_V4',
    personaName: 'Genesis Intake Cartridge Engine',
    title: 'Genesis Intake Cartridge Studio',
    roleDescription: '4-Layer macro-topology orchestrator (Ingress -> MFOE -> Council AST -> MicroVM), 5-Stage Failure Archetype Crucible, and physical AST scaffolder.',
    activeCapabilities: [
      '4_LAYER_MACRO_TOPOLOGY_STACK',
      '5_STAGE_FAILURE_CRUCIBLE',
      'Z3_MEMORY_DELTA_BOUND_PROVER',
      'FIRECRACKER_MICROVM_SANDBOX',
      'SADD_LLDD_MASTER_COMPILER'
    ],
    enforcedRules: [
      'Enforce memory delta <= 0.12 MiB per node and 4.0 GiB active RAM ceiling.',
      'Pass all 5 Failure Archetypes before issuing physical deployment authorization.',
      'Quarantine process.env secrets strictly behind server.ts /api/* boundary.',
      'Generate fully typed, zero-mock TypeScript scaffolds for immediate execution.'
    ],
    resourceConstraint: {
      allocatedRamGB: 2.2,
      totalRamGB: 8.0,
      ramPercentage: 27.5,
      activeCores: 4,
      totalCores: 8,
      coreAffinity: 'Cores 4-7 (ARM64_Affinity)',
      wasmPageQuota: 35200,
      gpuShaderTier: 'LOW',
      networkPorts: ['Port 3000 (Crucible RPC)'],
      backgroundTickRateMs: 1000,
      deallocatedSubsystems: [
        'Heavy Canvas Shaders',
        'Legacy Mock Telemetry'
      ]
    },
    color: '#F43F5E',
    accentColor: 'rgba(244, 63, 94, 0.15)'
  }
};

/**
 * Helper to get the active mode's system instruction and resource constraint
 */
export function getModeSystemInstruction(mode: MainView): ModeSystemInstruction {
  return MODE_SYSTEM_INSTRUCTIONS[mode] || MODE_SYSTEM_INSTRUCTIONS.MERLIN_AGENCY;
}
