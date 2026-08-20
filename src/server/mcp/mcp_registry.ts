import { MCPServerRegistryEntry, MCPServerRegistrySummary } from '../../types';

// In-memory registered servers store
let REGISTERED_SERVERS: MCPServerRegistryEntry[] = [
  {
    id: 'srv-arthurian-core',
    name: 'arthurian-sovereign-forge',
    displayName: 'Arthurian Sovereign Forge Core',
    description: 'Primary Camelot-OS Model Context Protocol engine exposing Merlin Ω 7-Gate Intent Grill, Blueprint OS DAG engines, Gideon Crucible SRE, and ARM64 hardware partitions.',
    version: '4.0.0-PROD',
    protocolVersion: '2024-11-05',
    status: 'ONLINE_CONNECTED',
    transport: 'SSE_EVENT_STREAM',
    endpointUrl: '/api/mcp/v1/sse',
    latencyMs: 6,
    uptimeSeconds: 14420,
    lastPingTimestamp: new Date().toISOString(),
    connectedClientsCount: 4,
    totalInvocations: 1420,
    securityType: 'SENTINEL_LEASE',
    tags: ['Core', 'Sovereign', 'WASM', 'JSON-RPC-2.0', 'Level-5-SRE'],
    hostRuntime: 'Node.js Express / TSX Kernel v3.4',
    resourceCount: 5,
    promptCount: 3,
    tools: [
      {
        name: 'forge_grill_intent',
        description: 'Merlin Ω 7-Gate Intent Grill: Parses raw voice/text prompts into high-density architecture specs, knight allocations, and risk telemetry.',
        category: 'ROUTING',
        handler: 'Knight Merlin Ω (The Sovereign Router)',
        parametersCount: 2,
        totalCalls: 342,
        avgLatencyMs: 8.2,
        inputSchema: {
          type: 'object',
          properties: {
            rawIntent: { type: 'string', description: 'Raw natural language intent or project idea to parse.' },
            strictZeroEntropy: { type: 'boolean', description: 'Enforce mathematical anti-slop and zero-entropy parsing.' }
          },
          required: ['rawIntent']
        }
      },
      {
        name: 'forge_blueprint_dag',
        description: 'Sir Architect & Sir Scribe DAG Generator: Generates deterministic Mermaid dependency graphs, .md boundary contracts, and kinetic lock dials.',
        category: 'SPECIFICATION',
        handler: 'Sir Architect & Sir Scribe',
        parametersCount: 2,
        totalCalls: 289,
        avgLatencyMs: 14.1,
        inputSchema: {
          type: 'object',
          properties: {
            featureName: { type: 'string', description: 'Name of the application or subsystem to blueprint.' },
            scopeLevel: { type: 'string', enum: ['MICRO_COMPONENT', 'MODULE_SERVICE', 'FULL_STACK_CHASSIS'] }
          },
          required: ['featureName']
        }
      },
      {
        name: 'forge_execute_crucible',
        description: 'Sir Gideon SRE Level-5 Crucible: Runs automated stress tests against 5 failure archetypes (Race condition, OOM panic, Schema drift, ReZero fault, Zero-trust lease timeout).',
        category: 'CRUCIBLE',
        handler: 'Sir Gideon (The Crucible SRE)',
        parametersCount: 2,
        totalCalls: 194,
        avgLatencyMs: 18.7,
        inputSchema: {
          type: 'object',
          properties: {
            targetModule: { type: 'string', description: 'Module or endpoint to verify against failure archetypes.' },
            failureArchetype: { 
              type: 'string', 
              enum: ['ALL_FIVE_ARCHETYPES', 'RACE_CONDITION', 'OOM_HEAP_PRESSURE', 'SCHEMA_DRIFT', 'REZERO_RECOVERY', 'CAPABILITY_LEASE_REVOCATION'] 
            }
          },
          required: ['targetModule']
        }
      },
      {
        name: 'forge_synthesize_cli',
        description: 'Titan Omni Forge Agentic CLI Synthesizer: Synthesizes unmapped APIs or modules into an autonomous Stdio JSON-RPC CLI with Wasmtime host bindings.',
        category: 'SYNTHESIS',
        handler: 'Sir Castor & Sir Forge (Hive IDE)',
        parametersCount: 3,
        totalCalls: 120,
        avgLatencyMs: 24.5,
        inputSchema: {
          type: 'object',
          properties: {
            toolName: { type: 'string', description: 'Identifier of the forged tool.' },
            category: { type: 'string', enum: ['DATABASE', 'PAYMENT', 'AUDIO_DSP', 'DEV_TOOL', 'STORAGE', 'INTEGRATION'] },
            targetCodebase: { type: 'string', description: 'Description or endpoints to wrap.' }
          },
          required: ['toolName', 'category']
        }
      },
      {
        name: 'forge_topological_audit',
        description: 'Sir Scout & Sir Warden Topological Mesh Scan: Analyzes UI state graphs, detects navigation bottlenecks, and audits WCAG AA compliance.',
        category: 'TOPOLOGY',
        handler: 'Sir Scout & Sir Warden',
        parametersCount: 1,
        totalCalls: 145,
        avgLatencyMs: 9.6,
        inputSchema: {
          type: 'object',
          properties: {
            scanDepth: { type: 'string', enum: ['SURFACE_24H', 'DEEP_SPECTRAL_GRAPH', 'STATE_MACHINE_EDGES'] }
          }
        }
      },
      {
        name: 'forge_style_dictionary',
        description: 'Sir Lancelot & Sir Animator Style Dictionary: Emits mathematical anti-slop CSS variables, spring physics curves, and color palettes.',
        category: 'MOTION',
        handler: 'Sir Lancelot & Sir Animator',
        parametersCount: 2,
        totalCalls: 98,
        avgLatencyMs: 6.4,
        inputSchema: {
          type: 'object',
          properties: {
            archetype: { type: 'string', enum: ['CYBER_ROYAL_CAMELOT', 'INDUSTRIAL_FORGE', 'MINIMAL_DARK_CHROME', 'WARM_NEUTRAL_SOVEREIGN'] },
            motionTier: { type: 'string', enum: ['60FPS_SPRING_PHYSICS', 'SUBTLE_DECELERATION', 'ZERO_ANIMATION'] }
          }
        }
      },
      {
        name: 'forge_sync_workspace',
        description: 'Lady APIs Workspace Synchronizer: Fetches and mounts Drive documents, Sheets ledgers, Slides decks, or Gmail alerts into Sovereign context.',
        category: 'WORKSPACE',
        handler: 'Lady APIs (Workspace Bridge)',
        parametersCount: 2,
        totalCalls: 110,
        avgLatencyMs: 28.0,
        inputSchema: {
          type: 'object',
          properties: {
            service: { type: 'string', enum: ['DRIVE', 'SHEETS', 'SLIDES', 'DOCS', 'GMAIL'] },
            action: { type: 'string', enum: ['LIST_RECENT', 'READ_SCHEMA', 'EXPORT_MARKDOWN', 'TRIGGER_SYNC'] }
          },
          required: ['service']
        }
      },
      {
        name: 'forge_hardware_telemetry',
        description: 'Knight Herald Telemetry Stream: Queries 8.0GB RAM allocation, 8-core CPU affinity, and sandbox zero-leak enforcement.',
        category: 'HARDWARE',
        handler: 'Knight Herald (Hardware Sentinel)',
        parametersCount: 1,
        totalCalls: 84,
        avgLatencyMs: 3.2,
        inputSchema: {
          type: 'object',
          properties: {
            modeFilter: { type: 'string', enum: ['MERLIN_AGENCY', 'BLUEPRINT_OS', 'HIVE_IDE', 'SYNAPTIC_LOOM', 'ALL_PARTITIONS'] }
          }
        }
      },
      {
        name: 'ask_notebook',
        description: 'Lady Mnemosyne Grounded Vault Query: Performs semantic vector retrieval across indexed PDF, Markdown, and API contracts with 100% grounded citations.',
        category: 'KNOWLEDGE',
        handler: 'Lady Mnemosyne (The Memory Vault)',
        parametersCount: 2,
        totalCalls: 38,
        avgLatencyMs: 16.5,
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Grounded question to ask the knowledge vault.' },
            requireCitations: { type: 'boolean', description: 'Enforce strict Viking block citation pointers.' }
          },
          required: ['query']
        }
      }
    ]
  },
  {
    id: 'srv-notebooklm-vault',
    name: 'notebooklm-cloudbrain-vault',
    displayName: 'NotebookLM & Cloudbrain Vault',
    description: 'Grounding Memory Engine providing X25519 ECC zero-trust verified knowledge retrieval, executive audio podcasts, and Isomorphic FileTree compliance audits.',
    version: '2.8.4',
    protocolVersion: '2024-11-05',
    status: 'ONLINE_CONNECTED',
    transport: 'STDIO_BIFROST',
    endpointUrl: '/api/mcp/query',
    latencyMs: 14,
    uptimeSeconds: 18200,
    lastPingTimestamp: new Date().toISOString(),
    connectedClientsCount: 3,
    totalInvocations: 850,
    securityType: 'X25519_ECC',
    tags: ['Grounded', 'Viking-URI', 'Citations', 'TOON-Compression', 'Zero-Hallucination'],
    hostRuntime: 'Wasmtime Stdio Subprocess',
    resourceCount: 4,
    promptCount: 2,
    tools: [
      {
        name: 'ask_notebook',
        description: 'Semantic vector search across indexed vaults with Viking block citations.',
        category: 'KNOWLEDGE',
        handler: 'Lady Mnemosyne',
        parametersCount: 2,
        totalCalls: 420,
        avgLatencyMs: 15.2,
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Grounded question.' },
            requireCitations: { type: 'boolean' }
          },
          required: ['query']
        }
      },
      {
        name: 'get_notebook_summary',
        description: 'Generates an executive podcast brief and structured takeaway matrix.',
        category: 'KNOWLEDGE',
        handler: 'Merlin Ω & Lady Mnemosyne',
        parametersCount: 2,
        totalCalls: 180,
        avgLatencyMs: 22.4,
        inputSchema: {
          type: 'object',
          properties: {
            notebookId: { type: 'string' },
            topicFilter: { type: 'string' }
          }
        }
      },
      {
        name: 'upload_source',
        description: 'Indexes a new PDF, Markdown blueprint, or API contract into Viking storage.',
        category: 'KNOWLEDGE',
        handler: 'Anya Ω',
        parametersCount: 4,
        totalCalls: 95,
        avgLatencyMs: 31.0,
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            type: { type: 'string', enum: ['markdown_blueprint', 'pdf_vault', 'api_contract'] },
            authorAgent: { type: 'string' }
          },
          required: ['title', 'content']
        }
      },
      {
        name: 'verify_cloudbrain_sync',
        description: 'Sir Gideon MGV double-blind Maker/Checker audit to detect citation hallucinations.',
        category: 'CRUCIBLE',
        handler: 'Sir Gideon',
        parametersCount: 1,
        totalCalls: 85,
        avgLatencyMs: 12.8,
        inputSchema: {
          type: 'object',
          properties: {
            testQuery: { type: 'string' }
          }
        }
      },
      {
        name: 'isomorphic_filetree_audit',
        description: 'Audits local edge workspace against canonical Viking hashes for 1:1 isomorphism.',
        category: 'CRUCIBLE',
        handler: 'Lady Mnemosyne',
        parametersCount: 0,
        totalCalls: 70,
        avgLatencyMs: 8.5
      }
    ]
  },
  {
    id: 'srv-google-workspace',
    name: 'google-workspace-hub',
    displayName: 'Google Workspace Hub Bridge',
    description: 'Enterprise MCP bridge orchestrating Google Drive files, Google Sheets real-time ledgers, Google Slides proposal decks, and Gmail dispatch.',
    version: '3.1.0',
    protocolVersion: '2024-11-05',
    status: 'ONLINE_CONNECTED',
    transport: 'HTTP_JSON_RPC',
    endpointUrl: '/api/workspace/sync',
    latencyMs: 22,
    uptimeSeconds: 9800,
    lastPingTimestamp: new Date().toISOString(),
    connectedClientsCount: 2,
    totalInvocations: 430,
    securityType: 'ZERO_TRUST_OAUTH',
    tags: ['Google', 'Drive', 'Sheets', 'Slides', 'Gmail', 'OAuth-Client'],
    hostRuntime: 'GSI Client Proxy + REST Proxy',
    resourceCount: 3,
    promptCount: 2,
    tools: [
      {
        name: 'drive_list_files',
        description: 'Lists and searches Google Drive files, blueprints, and uploaded spreadsheets.',
        category: 'WORKSPACE',
        handler: 'Lady APIs',
        parametersCount: 2,
        totalCalls: 140,
        avgLatencyMs: 24.5
      },
      {
        name: 'sheets_append_ledger',
        description: 'Appends structured financial, operational, or DAG execution telemetry rows to Sheets.',
        category: 'WORKSPACE',
        handler: 'Lady APIs',
        parametersCount: 3,
        totalCalls: 120,
        avgLatencyMs: 28.0
      },
      {
        name: 'slides_export_deck',
        description: 'Compiles and generates a multi-slide presentation deck directly in Google Slides.',
        category: 'WORKSPACE',
        handler: 'Sir Lancelot & Lady APIs',
        parametersCount: 2,
        totalCalls: 65,
        avgLatencyMs: 45.2
      },
      {
        name: 'docs_compile_spec',
        description: 'Exports locked Blueprint OS specifications to a collaborative Google Doc.',
        category: 'WORKSPACE',
        handler: 'Sir Scribe',
        parametersCount: 2,
        totalCalls: 55,
        avgLatencyMs: 32.1
      },
      {
        name: 'gmail_dispatch_alert',
        description: 'Dispatches high-priority SRE alerts and milestone completion notifications via Gmail.',
        category: 'WORKSPACE',
        handler: 'Knight Herald',
        parametersCount: 3,
        totalCalls: 50,
        avgLatencyMs: 19.8
      }
    ]
  },
  {
    id: 'srv-synaptic-loom',
    name: 'synaptic-loom-compiler',
    displayName: 'Synaptic Loom Cognitive MCP',
    description: 'Self-optimizing cognitive compiler leveraging 5-layer prompting topologies (DSPy Typed Slots, ProTeGi Textual Gradients, and MIPROv2 Bayesian optimizers).',
    version: '1.9.2',
    protocolVersion: '2024-11-05',
    status: 'ONLINE_CONNECTED',
    transport: 'WASM_FFI',
    endpointUrl: '/api/synaptic-loom/cycle',
    latencyMs: 4,
    uptimeSeconds: 12600,
    lastPingTimestamp: new Date().toISOString(),
    connectedClientsCount: 5,
    totalInvocations: 620,
    securityType: 'EPHEMERAL_VFS',
    tags: ['DSPy', 'ProTeGi', 'MIPROv2', '24D-Leech-Lattice', 'Cognitive-Compiler'],
    hostRuntime: 'Embedded Wasmtime / MsgPack no_std FFI',
    resourceCount: 4,
    promptCount: 3,
    tools: [
      {
        name: 'loom_compile_signature',
        description: 'Compiles a typed DSPy prompt signature through TACOMORE/COSTAR constraints.',
        category: 'COGNITION',
        handler: 'Anya Ω (Synaptic Loom)',
        parametersCount: 3,
        totalCalls: 210,
        avgLatencyMs: 4.8
      },
      {
        name: 'loom_protegi_gradient',
        description: 'Generates textual gradients from WASM panics to self-heal prompt slots.',
        category: 'COGNITION',
        handler: 'Sir Warden & Gideon Protocol',
        parametersCount: 2,
        totalCalls: 140,
        avgLatencyMs: 6.2
      },
      {
        name: 'loom_aot_reasoning',
        description: 'Runs single-context Algorithm of Thoughts exploration within 8.0GB RAM ceilings.',
        category: 'COGNITION',
        handler: 'Merlin Ω',
        parametersCount: 2,
        totalCalls: 130,
        avgLatencyMs: 5.5
      },
      {
        name: 'loom_pot_wasm_sandbox',
        description: 'Executes deterministic Program-aided Language model WASM code in zero-leak sandbox.',
        category: 'COGNITION',
        handler: 'Sir Architect',
        parametersCount: 2,
        totalCalls: 90,
        avgLatencyMs: 2.1
      },
      {
        name: 'loom_mipro_optimize',
        description: 'Triggers Bayesian search over prompt demo candidates and instruction weights.',
        category: 'COGNITION',
        handler: 'Anya Ω',
        parametersCount: 1,
        totalCalls: 50,
        avgLatencyMs: 12.0
      }
    ]
  },
  {
    id: 'srv-industrial-cpps',
    name: 'industrial-cpps-bridge',
    displayName: 'Industrial Cyber-Physical CPPS Bridge',
    description: 'Deterministic microsecond-bus MCP bridge connecting factory stations, EtherCAT CNC mills, optical QA nodes, and Gideon TDD contracts.',
    version: '5.2.0',
    protocolVersion: '2024-11-05',
    status: 'ONLINE_CONNECTED',
    transport: 'ETHERCAT_OPC_UA',
    endpointUrl: '/api/industrial/telemetry',
    latencyMs: 1.8,
    uptimeSeconds: 24000,
    lastPingTimestamp: new Date().toISOString(),
    connectedClientsCount: 6,
    totalInvocations: 2100,
    securityType: 'MUTUAL_TLS',
    tags: ['Cyber-Physical', 'EtherCAT', 'OPC-UA', 'TDD-Contracts', 'Deterministic-Realtime'],
    hostRuntime: 'Hard Real-Time Linux IPC / CAN-Bus Native',
    resourceCount: 6,
    promptCount: 2,
    tools: [
      {
        name: 'cpps_station_telemetry',
        description: 'Fetches real-time cycle times, vibration, temperature, and parts/min across 6 stations.',
        category: 'HARDWARE',
        handler: 'Station Telemetry Agent',
        parametersCount: 1,
        totalCalls: 980,
        avgLatencyMs: 1.2
      },
      {
        name: 'gideon_tdd_contract_assert',
        description: 'Asserts pre/post conditions and safety invariants on physical robotics actuators.',
        category: 'CRUCIBLE',
        handler: 'Sir Gideon (Physical Prover)',
        parametersCount: 2,
        totalCalls: 520,
        avgLatencyMs: 2.1
      },
      {
        name: 'kinetic_opcode_inject',
        description: 'Directly injects microsecond hardware opcodes to stations via EtherCAT bus.',
        category: 'HARDWARE',
        handler: 'Kinetic Hand Controller',
        parametersCount: 3,
        totalCalls: 380,
        avgLatencyMs: 0.9
      },
      {
        name: 'sre_invariant_check',
        description: 'Validates non-deadlock, bounded drift, and zero-overflow invariants.',
        category: 'CRUCIBLE',
        handler: 'Sentinel Watchdog',
        parametersCount: 1,
        totalCalls: 220,
        avgLatencyMs: 1.5
      }
    ]
  },
  {
    id: 'srv-gemini-multimodal',
    name: 'gemini-live-multimodal-socket',
    displayName: 'Gemini Live Multimodal Socket',
    description: 'High-speed bidirectional WebSocket bridge powering real-time streaming voice interactions, Google Search Grounding, vision analysis, and thinking modes.',
    version: '2.5.0-FLASH',
    protocolVersion: '2024-11-05',
    status: 'ONLINE_CONNECTED',
    transport: 'WSS_SOCKET',
    endpointUrl: '/ws/live-audio',
    latencyMs: 18,
    uptimeSeconds: 15400,
    lastPingTimestamp: new Date().toISOString(),
    connectedClientsCount: 3,
    totalInvocations: 940,
    securityType: 'SENTINEL_LEASE',
    tags: ['Gemini-Live', 'WebSocket', 'Search-Grounding', 'Voice-Streaming', 'Vision-OCR'],
    hostRuntime: 'Node.js ws WebSocketServer + Gemini 2.5 SDK',
    resourceCount: 2,
    promptCount: 2,
    tools: [
      {
        name: 'gemini_live_stream_audio',
        description: 'Streams raw PCM audio chunks over WebSocket to the Gemini Live API session.',
        category: 'MULTIMODAL',
        handler: 'Spatial Voice Engine',
        parametersCount: 2,
        totalCalls: 450,
        avgLatencyMs: 18.2,
        isStreaming: true
      },
      {
        name: 'gemini_search_grounding',
        description: 'Performs live web search grounding with factual verification and URL citations.',
        category: 'KNOWLEDGE',
        handler: 'Sir Scout',
        parametersCount: 1,
        totalCalls: 230,
        avgLatencyMs: 85.0
      },
      {
        name: 'gemini_vision_audit',
        description: 'Audits uploaded UI wireframes or architecture diagrams with high-resolution OCR.',
        category: 'MULTIMODAL',
        handler: 'Sir Lancelot & Sir Scout',
        parametersCount: 2,
        totalCalls: 140,
        avgLatencyMs: 120.0
      },
      {
        name: 'gemini_high_thinking',
        description: 'Executes System-2 deep reasoning chain with 8,192 token thinking budgets.',
        category: 'COGNITION',
        handler: 'Merlin Ω (Deep Reasoner)',
        parametersCount: 2,
        totalCalls: 120,
        avgLatencyMs: 210.0
      }
    ]
  },
  {
    id: 'srv-hydra-loop',
    name: 'hydra-autonomous-swarm-loop',
    displayName: 'Hydra Autonomous Swarm Loop',
    description: 'Multi-agent background execution loop orchestrating parallel Knight worker races, AST delta verification, and immutable ledger consensus.',
    version: '1.4.0',
    protocolVersion: '2024-11-05',
    status: 'ONLINE_CONNECTED',
    transport: 'WASM_FFI',
    endpointUrl: '/api/hydra/step',
    latencyMs: 2.4,
    uptimeSeconds: 11200,
    lastPingTimestamp: new Date().toISOString(),
    connectedClientsCount: 2,
    totalInvocations: 512,
    securityType: 'EPHEMERAL_VFS',
    tags: ['Hydra-Swarm', 'AST-Diff', 'Sub-Agents', 'Consensus', 'Zero-Leak'],
    hostRuntime: 'Unix Domain Socket / In-memory FFI',
    resourceCount: 2,
    promptCount: 1,
    tools: [
      {
        name: 'hydra_spawn_subagent',
        description: 'Spawns an isolated ephemeral sub-agent worker with strict memory caps.',
        category: 'ROUTING',
        handler: 'Hydra Orchestrator',
        parametersCount: 3,
        totalCalls: 190,
        avgLatencyMs: 3.1
      },
      {
        name: 'hydra_step_loop',
        description: 'Advances the autonomous development loop by one iteration step.',
        category: 'SPECIFICATION',
        handler: 'Hydra Engine',
        parametersCount: 1,
        totalCalls: 172,
        avgLatencyMs: 4.2
      },
      {
        name: 'hydra_halt_converge',
        description: 'Halts the swarm loop when target epsilon convergence is achieved.',
        category: 'CRUCIBLE',
        handler: 'Sir Gideon',
        parametersCount: 1,
        totalCalls: 80,
        avgLatencyMs: 1.8
      },
      {
        name: 'hydra_audit_ledger',
        description: 'Audits the immutable cryptographic ledger of all agent state mutations.',
        category: 'CRUCIBLE',
        handler: 'Sir Warden',
        parametersCount: 1,
        totalCalls: 70,
        avgLatencyMs: 2.2
      }
    ]
  }
];

export function getRegisteredMCPServers(): MCPServerRegistryEntry[] {
  return REGISTERED_SERVERS;
}

export function getMCPServerRegistrySummary(): MCPServerRegistrySummary {
  const online = REGISTERED_SERVERS.filter(s => s.status === 'ONLINE_CONNECTED').length;
  const totalTools = REGISTERED_SERVERS.reduce((acc, s) => acc + s.tools.length, 0);
  const totalCalls = REGISTERED_SERVERS.reduce((acc, s) => acc + s.totalInvocations, 0);
  const avgLat = REGISTERED_SERVERS.length > 0 
    ? Number((REGISTERED_SERVERS.reduce((acc, s) => acc + s.latencyMs, 0) / REGISTERED_SERVERS.length).toFixed(1))
    : 0;

  const transportCounts: Record<string, number> = {};
  REGISTERED_SERVERS.forEach(s => {
    transportCounts[s.transport] = (transportCounts[s.transport] || 0) + 1;
  });

  return {
    totalServers: REGISTERED_SERVERS.length,
    onlineServers: online,
    totalToolCapabilities: totalTools,
    totalInvocations: totalCalls,
    avgGlobalLatencyMs: avgLat,
    transportsActive: transportCounts,
    lastRegistrySync: new Date().toISOString()
  };
}

export function registerCustomMCPServer(server: Partial<MCPServerRegistryEntry>): MCPServerRegistryEntry {
  const newServer: MCPServerRegistryEntry = {
    id: server.id || `srv-custom-${Date.now()}`,
    name: server.name || 'custom-mcp-server',
    displayName: server.displayName || server.name || 'Custom MCP Server',
    description: server.description || 'User-registered Model Context Protocol server endpoint.',
    version: server.version || '1.0.0',
    protocolVersion: server.protocolVersion || '2024-11-05',
    status: server.status || 'ONLINE_CONNECTED',
    transport: server.transport || 'HTTP_JSON_RPC',
    endpointUrl: server.endpointUrl || 'http://localhost:8080/mcp',
    latencyMs: server.latencyMs || Math.floor(Math.random() * 15) + 5,
    uptimeSeconds: 60,
    lastPingTimestamp: new Date().toISOString(),
    connectedClientsCount: 1,
    totalInvocations: 0,
    securityType: server.securityType || 'NONE',
    tags: server.tags || ['Custom', 'User-Added'],
    hostRuntime: server.hostRuntime || 'External Remote Host',
    resourceCount: server.resourceCount || 0,
    promptCount: server.promptCount || 0,
    tools: server.tools || [
      {
        name: `${(server.name || 'custom').toLowerCase().replace(/\s+/g, '_')}_query`,
        description: 'Generic query tool capability exposed by this custom MCP server.',
        category: 'CUSTOM',
        handler: 'Custom Host Endpoint',
        parametersCount: 1,
        totalCalls: 0,
        avgLatencyMs: 12.0
      }
    ],
    isCustom: true
  };

  REGISTERED_SERVERS = [...REGISTERED_SERVERS, newServer];
  return newServer;
}

export function toggleMCPServerStatus(serverId: string): MCPServerRegistryEntry | null {
  let updated: MCPServerRegistryEntry | null = null;
  REGISTERED_SERVERS = REGISTERED_SERVERS.map(s => {
    if (s.id === serverId) {
      const nextStatus = s.status === 'ONLINE_CONNECTED' ? 'DISCONNECTED' : 'ONLINE_CONNECTED';
      updated = {
        ...s,
        status: nextStatus,
        lastPingTimestamp: new Date().toISOString(),
        latencyMs: nextStatus === 'ONLINE_CONNECTED' ? Math.floor(Math.random() * 15) + 3 : 0
      };
      return updated;
    }
    return s;
  });
  return updated;
}

export function pingMCPServer(serverId: string): { serverId: string; latencyMs: number; status: string; timestamp: string } | null {
  const server = REGISTERED_SERVERS.find(s => s.id === serverId);
  if (!server) return null;

  const newLatency = Number((Math.random() * 12 + (server.transport === 'ETHERCAT_OPC_UA' ? 1.0 : server.transport === 'WASM_FFI' ? 2.5 : 8.0)).toFixed(1));
  const timestamp = new Date().toISOString();
  
  server.latencyMs = newLatency;
  server.lastPingTimestamp = timestamp;
  server.totalInvocations += 1;

  return {
    serverId,
    latencyMs: newLatency,
    status: server.status,
    timestamp
  };
}

export function removeCustomMCPServer(serverId: string): boolean {
  const initialLen = REGISTERED_SERVERS.length;
  REGISTERED_SERVERS = REGISTERED_SERVERS.filter(s => s.id !== serverId || !s.isCustom);
  return REGISTERED_SERVERS.length < initialLen;
}
