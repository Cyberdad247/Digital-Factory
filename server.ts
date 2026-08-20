import express from 'express';
import { createServer as createViteServer } from 'vite';
import { runHydraLoop } from './src/server/hydra_loop';
import { runExcelTrackerWorkflow } from './src/server/workflows/excel_tracker';
import { runPodcastBotWorkflow } from './src/server/workflows/podcast_bot';
import { runShopifyFlowWorkflow } from './src/server/workflows/shopify_flow';
import { 
  askNotebookLM, 
  getNotebookSummary, 
  uploadSourceToNotebook, 
  listNotebookSources, 
  verifyCloudbrainSync, 
  getMCPServerStatus, 
  generateMCPConfigPayload,
  processAnythingToNotebookLM,
  generateAudioOverview,
  generateStudyGuide,
  generateBriefingDoc,
  generateQuiz,
  generateMindmap,
  listGeneratedArtifacts,
  exportPythonSDKScript,
  exportClaudeSkillDefinition
} from './src/server/mcp/notebooklm_mcp';
import {
  handleMCPJsonRpcRequest,
  getArthurianMCPServerInfo,
  ARTHURIAN_MCP_TOOLS,
  ARTHURIAN_MCP_RESOURCES,
  ARTHURIAN_MCP_PROMPTS,
  getMCPExecutionLogs,
  generateAllMCPClientConfigs
} from './src/server/mcp/arthurian_mcp_server';
import {
  getRegisteredMCPServers,
  getMCPServerRegistrySummary,
  registerCustomMCPServer,
  toggleMCPServerStatus,
  pingMCPServer,
  removeCustomMCPServer
} from './src/server/mcp/mcp_registry';
import { auditIsomorphicFileTree, autoHealIsomorphicFileTree } from './src/server/mcp/filetree_isomorphism';
import { compileRawIntentWithAPEE, ANYA_COMPILER_RULES_MD } from './src/server/mcp/apee_compiler';
import {
  executeCouncilDebateTurn,
  crystallizeDebateToPRD,
  runGenesisCrucibleAudit,
  generateGenesisScaffoldBundle,
  ARCHMAGE_METADATA
} from './src/server/mcp/genesis_council_engine';
import { 
  getOmniForgeState, 
  getAllForgedCLIs, 
  runAgenticCLIForgePipeline, 
  executeForgedCLISubcommand,
  issueCapabilityLease,
  getCapabilityLeases,
  getVFSWorktrees,
  TITAN_OMNI_FORGE_V1000_PROMPT
} from './src/server/mcp/omni_forge';
import {
  bootForLoopEngineering,
  stepForLoopEngineering,
  getForLoopEngineeringState
} from './src/server/mcp/for_loop_engineering';
import {
  getSwarmScalingState,
  triggerSwarmExpansion,
  launchParallelRace,
  toggleTTEJitSkill,
  OMEGA_SWARM_SCALING_MANIFEST_YAML
} from './src/server/mcp/swarm_scaling';
import {
  getSynapticLoomState,
  executeCognitiveCycle,
  triggerProTeGiGradientFeedback,
  runMIPROv2OvernightForge
} from './src/server/mcp/synaptic_loom';
import {
  getBlueprintOSState,
  getBlueprintById,
  compileBlueprintIntent,
  resolveClarifications,
  runPreflight,
  issueSentinelLease,
  executeBoundedSandbox,
  runGideonVerification,
  promoteBlueprintEffect,
  fastForwardBlueprint
} from './src/server/mcp/blueprint_os';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { Modality, LiveServerMessage } from '@google/genai';
import {
  getGeminiClient,
  executeGeminiChat,
  executeSearchGrounding,
  executeLowLatency,
  analyzeImage,
  analyzeVideo,
  transcribeAudio,
  executeHighThinking,
  synthesizeKnightSpeech,
  enhancePromptWithAnya,
  executeKnightChat,
  KNIGHT_PROFILES
} from './src/server/gemini_service';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

// Ensure data dir
if (!fs.existsSync('./data')) fs.mkdirSync('./data');

// Middleware with generous payload limit for multimedia (image/video/audio)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// Vite middleware
async function startServer() {
  // API routes
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  // ==========================================
  // NOTEBOOKLM MODEL CONTEXT PROTOCOL (MCP) APIS
  // ==========================================
  
  // Status & Telemetry
  app.get('/api/mcp/status', (req, res) => {
    try {
      const status = getMCPServerStatus();
      res.json(status);
    } catch (error) {
      console.error('Error fetching MCP status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Query Grounded Knowledge Vault (ask_notebook)
  app.post('/api/mcp/query', async (req, res) => {
    try {
      const { query, requireCitations = true } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      const response = await askNotebookLM(query, requireCitations);
      res.json(response);
    } catch (error) {
      console.error('Error in ask_notebook MCP:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Executive Synthesis & Podcast Brief (get_notebook_summary)
  app.post('/api/mcp/summary', async (req, res) => {
    try {
      const { notebookId, topicFilter } = req.body;
      const summary = await getNotebookSummary(notebookId, topicFilter);
      res.json(summary);
    } catch (error) {
      console.error('Error in get_notebook_summary MCP:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // List Knowledge Sources
  app.get('/api/mcp/sources', (req, res) => {
    try {
      const sources = listNotebookSources();
      res.json({ sources, count: sources.length });
    } catch (error) {
      console.error('Error listing MCP sources:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Upload Source (upload_source)
  app.post('/api/mcp/sources/upload', async (req, res) => {
    try {
      const { title, content, type = 'markdown_blueprint', authorAgent = 'Anya Ω' } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }
      const source = await uploadSourceToNotebook(title, content, type, authorAgent);
      res.json({ success: true, source });
    } catch (error) {
      console.error('Error uploading MCP source:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Sir Gideon MGV Gate Verification (verify_cloudbrain_sync)
  app.post('/api/mcp/mgv-audit', async (req, res) => {
    try {
      const { testQuery } = req.body;
      const audit = await verifyCloudbrainSync(testQuery);
      res.json(audit);
    } catch (error) {
      console.error('Error in Sir Gideon MGV audit:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Lady Mnemosyne Isomorphic FileTree Law Audit
  app.get('/api/mcp/filetree-audit', (req, res) => {
    try {
      const audit = auditIsomorphicFileTree();
      res.json(audit);
    } catch (error) {
      console.error('Error auditing isomorphic filetree:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Lady Mnemosyne Auto-Heal FileTree
  app.post('/api/mcp/filetree-repair', (req, res) => {
    try {
      const result = autoHealIsomorphicFileTree();
      res.json(result);
    } catch (error) {
      console.error('Error repairing isomorphic filetree:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Export mcp.json / Claude Desktop Config
  app.get('/api/mcp/config', (req, res) => {
    try {
      const config = generateMCPConfigPayload();
      res.json(config);
    } catch (error) {
      console.error('Error getting MCP config:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Anything-to-NotebookLM Multi-Source Processor (joeseesun/qiaomu-anything-to-notebooklm)
  app.post('/api/mcp/ingest-anything', async (req, res) => {
    try {
      const { inputType = 'RAW_TEXT', inputContent, title } = req.body;
      if (!inputContent) {
        return res.status(400).json({ error: 'inputContent is required' });
      }
      const result = await processAnythingToNotebookLM(inputType, inputContent, title);
      res.json({ success: true, result });
    } catch (error: any) {
      console.error('Error in ingest-anything:', error);
      res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
  });

  // Audio Overview / Podcast Generator (teng-lin/notebooklm-py & claude-world/notebooklm-skill)
  app.post('/api/mcp/generate-audio', async (req, res) => {
    try {
      const { focusTopic } = req.body;
      const artifact = await generateAudioOverview(focusTopic);
      res.json({ success: true, artifact });
    } catch (error: any) {
      console.error('Error in generate-audio:', error);
      res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
  });

  // Study Guide Generator (teng-lin/notebooklm-py & PleasePrompto/notebooklm-mcp)
  app.post('/api/mcp/generate-study-guide', async (req, res) => {
    try {
      const { depth = 'COMPREHENSIVE' } = req.body;
      const artifact = await generateStudyGuide(depth);
      res.json({ success: true, artifact });
    } catch (error: any) {
      console.error('Error in generate-study-guide:', error);
      res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
  });

  // Briefing Document Generator
  app.post('/api/mcp/generate-briefing', async (req, res) => {
    try {
      const { audience = 'CORE_ENGINEERS' } = req.body;
      const artifact = await generateBriefingDoc(audience);
      res.json({ success: true, artifact });
    } catch (error: any) {
      console.error('Error in generate-briefing:', error);
      res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
  });

  // Verification Quiz Generator
  app.post('/api/mcp/generate-quiz', async (req, res) => {
    try {
      const { questionCount = 5, difficulty = 'STANDARD' } = req.body;
      const artifact = await generateQuiz(questionCount, difficulty);
      res.json({ success: true, artifact });
    } catch (error: any) {
      console.error('Error in generate-quiz:', error);
      res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
  });

  // Mindmap Generator
  app.post('/api/mcp/generate-mindmap', async (req, res) => {
    try {
      const artifact = await generateMindmap();
      res.json({ success: true, artifact });
    } catch (error: any) {
      console.error('Error in generate-mindmap:', error);
      res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
  });

  // List Generated Artifacts
  app.get('/api/mcp/artifacts', (req, res) => {
    try {
      const artifacts = listGeneratedArtifacts();
      res.json({ success: true, artifacts });
    } catch (error) {
      console.error('Error listing artifacts:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Export Python SDK Script (teng-lin/notebooklm-py)
  app.get('/api/mcp/export-python-sdk', (req, res) => {
    try {
      const script = exportPythonSDKScript();
      res.json({ success: true, script });
    } catch (error) {
      console.error('Error exporting Python SDK script:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Export Claude Code Skill Markdown (claude-world/notebooklm-skill & PleasePrompto/notebooklm-skill)
  app.get('/api/mcp/export-claude-skill', (req, res) => {
    try {
      const skillMd = exportClaudeSkillDefinition();
      res.json({ success: true, skillMd });
    } catch (error) {
      console.error('Error exporting Claude Skill:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // ========================================================
  // MERLIN AGENCY COGNITIVE PLAYGROUND & DEBATE ENDPOINTS
  // ========================================================

  // Archmage Council Metadata
  app.get('/api/council/archmages', (req, res) => {
    res.json({ success: true, archmages: ARCHMAGE_METADATA });
  });

  // Execute a multi-agent debate turn
  app.post('/api/council/debate-turn', async (req, res) => {
    try {
      const { topic, mode = 'SOCRATIC_IDEATION', messageHistory = [], userPrompt, requestedPersona } = req.body;
      if (!topic) {
        return res.status(400).json({ error: 'topic is required' });
      }
      const turnResult = await executeCouncilDebateTurn(topic, mode, messageHistory, userPrompt, requestedPersona);
      res.json({ success: true, ...turnResult });
    } catch (error: any) {
      console.error('Error executing council debate turn:', error);
      res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
  });

  // Crystallize debate into formal PRD Blueprint
  app.post('/api/council/crystallize-prd', async (req, res) => {
    try {
      const { topic, mode = 'SOCRATIC_IDEATION', messages = [] } = req.body;
      const prd = await crystallizeDebateToPRD(topic, mode, messages);
      res.json({ success: true, prd });
    } catch (error: any) {
      console.error('Error crystallizing PRD:', error);
      res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
  });

  // ========================================================
  // GENESIS INTAKE CARTRIDGE 5-STAGE CRUCIBLE & SCAFFOLDING
  // ========================================================

  // Execute 5-Stage Failure Archetype Crucible
  app.post('/api/genesis/crucible-audit', async (req, res) => {
    try {
      const { projectName = 'Genesis Intake Cartridge' } = req.body;
      const report = await runGenesisCrucibleAudit(projectName);
      res.json({ success: true, report });
    } catch (error: any) {
      console.error('Error running Genesis Crucible audit:', error);
      res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
  });

  // Generate Physical Code Scaffolds
  app.post('/api/genesis/scaffold-bundle', (req, res) => {
    try {
      const { projectName = 'Genesis Intake Cartridge' } = req.body;
      const bundle = generateGenesisScaffoldBundle(projectName);
      res.json({ success: true, bundle });
    } catch (error: any) {
      console.error('Error generating Genesis scaffold bundle:', error);
      res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
  });

  // ========================================================
  // ARTHURIAN OMNI-DIGITAL FORGE SOVEREIGN MCP SERVER (v1)
  // ========================================================

  // Primary JSON-RPC 2.0 Protocol Handler
  app.post(['/api/mcp/v1/rpc', '/api/mcp/rpc'], async (req, res) => {
    try {
      const response = await handleMCPJsonRpcRequest(req.body);
      res.json(response);
    } catch (error: any) {
      console.error('Error handling MCP JSON-RPC 2.0 request:', error);
      res.status(500).json({
        jsonrpc: '2.0',
        id: req.body?.id || null,
        error: { code: -32603, message: 'Internal Server Error', data: { details: error.message } }
      });
    }
  });

  // Server-Sent Events (SSE) Transport Endpoint for MCP Clients (Claude Desktop / Cursor)
  app.get('/api/mcp/v1/sse', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Initial handshake ping event
    const sessionId = `session_${Math.random().toString(36).substr(2, 9)}`;
    res.write(`event: endpoint\ndata: ${JSON.stringify({ endpoint: '/api/mcp/v1/rpc', sessionId })}\n\n`);

    const heartbeat = setInterval(() => {
      res.write(`event: ping\ndata: ${JSON.stringify({ timestamp: new Date().toISOString(), status: 'ONLINE' })}\n\n`);
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeat);
      res.end();
    });
  });

  // Server Info & Capabilities Telemetry
  app.get('/api/mcp/v1/info', (req, res) => {
    try {
      const host = `${req.protocol}://${req.get('host')}`;
      res.json(getArthurianMCPServerInfo(host));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // List Registered Tools
  app.get('/api/mcp/v1/tools', (req, res) => {
    res.json({ tools: ARTHURIAN_MCP_TOOLS, count: ARTHURIAN_MCP_TOOLS.length });
  });

  // List Registered Resources
  app.get('/api/mcp/v1/resources', (req, res) => {
    res.json({ resources: ARTHURIAN_MCP_RESOURCES, count: ARTHURIAN_MCP_RESOURCES.length });
  });

  // List Registered Prompts
  app.get('/api/mcp/v1/prompts', (req, res) => {
    res.json({ prompts: ARTHURIAN_MCP_PROMPTS, count: ARTHURIAN_MCP_PROMPTS.length });
  });

  // Client Configs (Claude Desktop, Cursor, Windsurf)
  app.get('/api/mcp/v1/clients', (req, res) => {
    try {
      const host = `${req.protocol}://${req.get('host')}`;
      res.json(generateAllMCPClientConfigs(host));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Real-Time MCP Execution Logs
  app.get('/api/mcp/v1/logs', (req, res) => {
    res.json({ logs: getMCPExecutionLogs() });
  });

  // ========================================================
  // MCP SERVER REGISTRY DASHBOARD ENDPOINTS
  // ========================================================

  // List all registered MCP Servers
  app.get('/api/mcp/v1/registry', (req, res) => {
    try {
      const servers = getRegisteredMCPServers();
      res.json({ servers, count: servers.length });
    } catch (error: any) {
      console.error('Error fetching MCP server registry:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get MCP Server Registry Summary Metrics
  app.get('/api/mcp/v1/registry/summary', (req, res) => {
    try {
      const summary = getMCPServerRegistrySummary();
      res.json(summary);
    } catch (error: any) {
      console.error('Error fetching MCP server registry summary:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Register New Custom MCP Server
  app.post('/api/mcp/v1/registry/register', (req, res) => {
    try {
      const newServer = registerCustomMCPServer(req.body);
      res.status(201).json({ success: true, server: newServer });
    } catch (error: any) {
      console.error('Error registering custom MCP server:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Toggle MCP Server Connection Status
  app.post('/api/mcp/v1/registry/:id/toggle', (req, res) => {
    try {
      const updated = toggleMCPServerStatus(req.params.id);
      if (!updated) {
        return res.status(404).json({ error: 'Server not found in registry' });
      }
      res.json({ success: true, server: updated });
    } catch (error: any) {
      console.error('Error toggling MCP server status:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Ping MCP Server for Live Round-Trip Latency
  app.post('/api/mcp/v1/registry/:id/ping', (req, res) => {
    try {
      const pingResult = pingMCPServer(req.params.id);
      if (!pingResult) {
        return res.status(404).json({ error: 'Server not found in registry' });
      }
      res.json({ success: true, ...pingResult });
    } catch (error: any) {
      console.error('Error pinging MCP server:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Remove Custom MCP Server
  app.delete('/api/mcp/v1/registry/:id', (req, res) => {
    try {
      const removed = removeCustomMCPServer(req.params.id);
      res.json({ success: removed });
    } catch (error: any) {
      console.error('Error removing custom MCP server:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // ANYA PROMPT ENHANCEMENT ENGINE (APEE v7.0)
  // ==========================================
  
  // Compile Raw Intent to [νKG_CRYSTAL] or [Ω_TITAN_OMNI_FORGE]
  app.post('/api/apee/compile', (req, res) => {
    try {
      const { rawIntent, mode } = req.body;
      const result = compileRawIntentWithAPEE(rawIntent || '', mode || 'OMEGA_TITAN_OMNI_FORGE');
      res.json(result);
    } catch (error) {
      console.error('Error in APEE compilation:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Retrieve Master System Instruction (anya_compiler_rules.md & TITAN_OMNI_FORGE)
  app.get('/api/apee/rules', (req, res) => {
    try {
      res.json({ 
        rules: ANYA_COMPILER_RULES_MD,
        titanOmniForgePrompt: TITAN_OMNI_FORGE_V1000_PROMPT
      });
    } catch (error) {
      console.error('Error getting APEE rules:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // ==========================================
  // OMNI-FORGE & AGENTIC CLI SYSTEM FORGE
  // ==========================================

  // Get Omni-Forge state (Blueprint OS, Merlin Foundry, Hive IDE, CLI Forge)
  app.get('/api/forge/omni/status', (req, res) => {
    try {
      res.json(getOmniForgeState());
    } catch (error) {
      console.error('Error getting Omni-Forge status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // List all forged CLIs in the vault
  app.get('/api/forge/cli/list', (req, res) => {
    try {
      res.json(getAllForgedCLIs());
    } catch (error) {
      console.error('Error listing forged CLIs:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Execute the 7-stage Agentic CLI Forge generation pipeline
  app.post('/api/forge/cli/generate', async (req, res) => {
    try {
      const { toolName, targetCodebase, category, authorKnight } = req.body;
      const result = await runAgenticCLIForgePipeline(
        toolName || 'Custom Service',
        targetCodebase || '',
        category || 'CUSTOM',
        authorKnight || 'Sir Forge (Hive IDE)'
      );
      res.json(result);
    } catch (error) {
      console.error('Error in CLI Forge pipeline:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Execute a subcommand on a forged CLI
  app.post('/api/forge/cli/execute', (req, res) => {
    try {
      const { cliId, subcommand, args } = req.body;
      const result = executeForgedCLISubcommand(cliId, subcommand, args || {});
      res.json(result);
    } catch (error) {
      console.error('Error executing forged CLI subcommand:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Issue a new Sentinel Capability Lease
  app.post('/api/forge/lease/issue', (req, res) => {
    try {
      const { capability, targetAgent, manifestId } = req.body;
      const lease = issueCapabilityLease(
        capability || 'GENERIC_EXECUTION',
        targetAgent || 'Sir Forge',
        manifestId || `manifest_${Date.now().toString(36)}`
      );
      res.json(lease);
    } catch (error) {
      console.error('Error issuing Sentinel lease:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Get active Sentinel leases & VFS worktrees
  app.get('/api/forge/leases', (req, res) => {
    try {
      res.json({
        leases: getCapabilityLeases(),
        worktrees: getVFSWorktrees()
      });
    } catch (error) {
      console.error('Error getting leases:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Save [νKG_CRYSTAL] to NotebookLM Knowledge Vault
  app.post('/api/apee/save-to-vault', async (req, res) => {
    try {
      const { title, crystalPrompt, targetProject } = req.body;
      const docTitle = title || `[νKG_CRYSTAL]: ${targetProject || 'Kinetic Module'}`;
      const source = await uploadSourceToNotebook(docTitle, crystalPrompt, 'markdown_blueprint', 'Anya Ω (APEE v7.0)');
      res.json({ success: true, source });
    } catch (error) {
      console.error('Error saving crystal to vault:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // ==========================================
  // FOR-LOOP ENGINEERING & 24D LEECH LATTICE APIS
  // ==========================================
  app.get('/api/for-loop/status', (req, res) => {
    try {
      res.json(getForLoopEngineeringState());
    } catch (error) {
      console.error('Error getting for-loop state:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/for-loop/boot', (req, res) => {
    try {
      const { task } = req.body;
      const state = bootForLoopEngineering(task);
      res.json(state);
    } catch (error) {
      console.error('Error booting for-loop engineering:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/for-loop/step', (req, res) => {
    try {
      const state = stepForLoopEngineering();
      res.json(state);
    } catch (error) {
      console.error('Error stepping for-loop engineering:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // ==========================================
  // SWARM SCALING & TIER-0 HYPER-ORCHESTRATION APIS
  // ==========================================
  app.get('/api/swarm/status', (req, res) => {
    try {
      res.json(getSwarmScalingState());
    } catch (error) {
      console.error('Error getting swarm status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/swarm/expand', (req, res) => {
    try {
      const { scale } = req.body;
      const state = triggerSwarmExpansion(scale || 1024);
      res.json(state);
    } catch (error) {
      console.error('Error triggering swarm expansion:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/swarm/race', (req, res) => {
    try {
      const { mission } = req.body;
      const state = launchParallelRace(mission || 'Hotfix: Sentinel capability lease recovery');
      res.json(state);
    } catch (error) {
      console.error('Error launching parallel race:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/swarm/tte/toggle', (req, res) => {
    try {
      const { skillId } = req.body;
      const state = toggleTTEJitSkill(skillId);
      res.json(state);
    } catch (error) {
      console.error('Error toggling TTE skill:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // ==========================================
  // ANYA'S SYNAPTIC LOOM: SELF-OPTIMIZING COGNITIVE COMPILER
  // 5-LAYER PROMPTING FRAMEWORKS & DAO ET AL. (2025) CYCLE
  // ==========================================
  app.get('/api/synaptic-loom/state', (req, res) => {
    try {
      res.json(getSynapticLoomState());
    } catch (error) {
      console.error('Error fetching synaptic loom state:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/synaptic-loom/cycle', async (req, res) => {
    try {
      const { rawIntent } = req.body;
      const pipeline = await executeCognitiveCycle(rawIntent || 'Synthesize low-latency Wasmtime hash kernel');
      res.json(pipeline);
    } catch (error) {
      console.error('Error executing cognitive cycle:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/synaptic-loom/protegi-gradient', async (req, res) => {
    try {
      const { signatureId, simulatedPanic } = req.body;
      const gradient = await triggerProTeGiGradientFeedback(
        signatureId || 'sig-intent-to-wasm',
        simulatedPanic || 'Memory out of bounds at pointer 0x4A; attempted to read uninitialized MsgPack buffer'
      );
      res.json(gradient);
    } catch (error) {
      console.error('Error triggering ProTeGi gradient descent:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/synaptic-loom/mipro-overnight', async (req, res) => {
    try {
      const miproResult = await runMIPROv2OvernightForge();
      res.json(miproResult);
    } catch (error) {
      console.error('Error running MIPROv2 overnight forge:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // ==========================================
  // BLUEPRINT OS: CONTRACT & LEASE ARCHITECTURE
  // RESPONSIBILITY SPLIT & 15-STAGE LIFECYCLE
  // ==========================================
  app.get('/api/blueprints/state', (req, res) => {
    try {
      res.json(getBlueprintOSState());
    } catch (error) {
      console.error('Error getting Blueprint OS state:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/blueprints/:id', (req, res) => {
    try {
      const bp = getBlueprintById(req.params.id);
      if (!bp) return res.status(404).json({ error: 'Blueprint not found' });
      res.json(bp);
    } catch (error) {
      console.error('Error getting blueprint by id:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/blueprints/compile', (req, res) => {
    try {
      const { tenant_id, workspace_id, intent, constitution_ref, data_classification } = req.body;
      const blueprint = compileBlueprintIntent({
        tenant_id: tenant_id || 'tenant_omega_01',
        workspace_id: workspace_id || 'engineering',
        intent: intent || 'Tenant-scoped receipt filtering and pagination isolation',
        constitution_ref: constitution_ref || 'const_engineering_v1',
        data_classification: data_classification || 'internal'
      });
      res.json(blueprint);
    } catch (error) {
      console.error('Error compiling blueprint:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/blueprints/:id/clarify', (req, res) => {
    try {
      const { responses } = req.body;
      const blueprint = resolveClarifications(req.params.id, responses || {});
      res.json(blueprint);
    } catch (error) {
      console.error('Error resolving clarifications:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/blueprints/:id/preflight', (req, res) => {
    try {
      const blueprint = runPreflight(req.params.id);
      res.json(blueprint);
    } catch (error) {
      console.error('Error running preflight:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/blueprints/:id/lease', (req, res) => {
    try {
      const blueprint = issueSentinelLease(req.params.id);
      res.json(blueprint);
    } catch (error) {
      console.error('Error issuing Sentinel lease:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/blueprints/:id/execute', (req, res) => {
    try {
      const blueprint = executeBoundedSandbox(req.params.id);
      res.json(blueprint);
    } catch (error) {
      console.error('Error executing bounded sandbox:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/blueprints/:id/verify', (req, res) => {
    try {
      const blueprint = runGideonVerification(req.params.id);
      res.json(blueprint);
    } catch (error) {
      console.error('Error running Gideon verification:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/blueprints/:id/promote', (req, res) => {
    try {
      const { operator_id } = req.body;
      const blueprint = promoteBlueprintEffect(req.params.id, operator_id || 'operator_alchemist_v1');
      res.json(blueprint);
    } catch (error) {
      console.error('Error promoting blueprint:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/blueprints/:id/fast-forward', (req, res) => {
    try {
      const blueprint = fastForwardBlueprint(req.params.id);
      res.json(blueprint);
    } catch (error) {
      console.error('Error fast-forwarding blueprint:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // ==========================================
  // HYDRA LOOP & WORKFLOW RUNNERS
  // ==========================================
  app.post('/api/loop/run', async (req, res) => {
      try {
        const task = req.body.task || 'Default Loop Task';
        const result = await runHydraLoop(task);
        res.json(result);
      } catch (error) {
        console.error('Error in run loop:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  });

  app.post('/api/loop/simulate', async (req, res) => {
      try {
        const states = ['MAKER-PROCESS', 'CHECKER-VERIFY', 'NODE-OPTIMIZE', 'LEDGER-SYNC'];
        const task = states[Math.floor(Math.random() * states.length)];
        const result = await runHydraLoop(task);
        res.json(result);
      } catch (error) {
        console.error('Error in simulate:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  });

  app.post('/api/workflows/excel-tracker', async (req, res) => {
      try {
        const data = req.body;
        const result = await runExcelTrackerWorkflow(data);
        res.json(result);
      } catch (error) {
        console.error('Error in excel-tracker:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  });

  app.post('/api/workflows/podcast-bot', async (req, res) => {
      try {
        const { podcastId } = req.body;
        const result = await runPodcastBotWorkflow(podcastId);
        res.json(result);
      } catch (error) {
        console.error('Error in podcast-bot:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  });

  app.post('/api/workflows/shopify-flow', async (req, res) => {
      try {
        const { productId } = req.body;
        const result = await runShopifyFlowWorkflow(productId);
        res.json(result);
      } catch (error) {
        console.error('Error in shopify-flow:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  });

  // ==========================================
  // GEMINI SINGULARITY MULTI-MODAL & LIVE APIS
  // ==========================================

  // 1. Multi-turn Chat & Intelligence (gemini-3.1-pro-preview, gemini-3.5-flash, gemini-3.1-flash-lite)
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { messages, model, systemInstruction, enableThinking } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required' });
      }
      const response = await executeGeminiChat({
        messages,
        model,
        systemInstruction,
        enableThinking
      });
      res.json(response);
    } catch (error: any) {
      console.error('Error in /api/gemini/chat:', error);
      res.status(500).json({ error: error.message || 'Gemini Chat Execution Failed' });
    }
  });

  // 2. Google Search Grounding with gemini-3.5-flash
  app.post('/api/gemini/search', async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }
      const response = await executeSearchGrounding({ prompt, systemInstruction });
      res.json(response);
    } catch (error: any) {
      console.error('Error in /api/gemini/search:', error);
      res.status(500).json({ error: error.message || 'Google Search Grounding Failed' });
    }
  });

  // 3. Low-Latency Responses with gemini-3.1-flash-lite
  app.post('/api/gemini/low-latency', async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }
      const response = await executeLowLatency({ prompt, systemInstruction });
      res.json(response);
    } catch (error: any) {
      console.error('Error in /api/gemini/low-latency:', error);
      res.status(500).json({ error: error.message || 'Low Latency Query Failed' });
    }
  });

  // 4. Image Analysis & Understanding with gemini-3.1-pro-preview
  app.post('/api/gemini/image-analyze', async (req, res) => {
    try {
      const { imageBase64, mimeType, prompt } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 is required' });
      }
      const response = await analyzeImage({ imageBase64, mimeType: mimeType || 'image/png', prompt });
      res.json(response);
    } catch (error: any) {
      console.error('Error in /api/gemini/image-analyze:', error);
      res.status(500).json({ error: error.message || 'Image Analysis Failed' });
    }
  });

  // 5. Video Analysis & Understanding with gemini-3.1-pro-preview
  app.post('/api/gemini/video-analyze', async (req, res) => {
    try {
      const { videoBase64, mimeType, prompt } = req.body;
      if (!videoBase64) {
        return res.status(400).json({ error: 'videoBase64 is required' });
      }
      const response = await analyzeVideo({ videoBase64, mimeType: mimeType || 'video/mp4', prompt });
      res.json(response);
    } catch (error: any) {
      console.error('Error in /api/gemini/video-analyze:', error);
      res.status(500).json({ error: error.message || 'Video Analysis Failed' });
    }
  });

  // 6. Audio Transcription with gemini-3.5-flash
  app.post('/api/gemini/transcribe', async (req, res) => {
    try {
      const { audioBase64, mimeType, prompt } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ error: 'audioBase64 is required' });
      }
      const response = await transcribeAudio({ audioBase64, mimeType: mimeType || 'audio/webm', prompt });
      res.json(response);
    } catch (error: any) {
      console.error('Error in /api/gemini/transcribe:', error);
      res.status(500).json({ error: error.message || 'Audio Transcription Failed' });
    }
  });

  // 7. High Thinking Reasoning Mode with gemini-3.1-pro-preview
  app.post('/api/gemini/high-thinking', async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }
      const response = await executeHighThinking({ prompt, systemInstruction });
      res.json(response);
    } catch (error: any) {
      console.error('Error in /api/gemini/high-thinking:', error);
      res.status(500).json({ error: error.message || 'High Thinking Execution Failed' });
    }
  });

  // 8. Gemini Neural TTS for Knights Voice Audio
  app.post('/api/gemini/tts', async (req, res) => {
    try {
      const { text, voiceName } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'text is required' });
      }
      const response = await synthesizeKnightSpeech({ text, voiceName });
      res.json(response);
    } catch (error: any) {
      console.error('Error in /api/gemini/tts:', error);
      res.status(500).json({ error: error.message || 'TTS synthesis failed' });
    }
  });

  // 9. Anya Ω Prompt Enhancement Engine (APEE v7.0)
  app.post('/api/gemini/enhance-prompt', async (req, res) => {
    try {
      const { rawPrompt, targetStudio, targetTier } = req.body;
      if (!rawPrompt) {
        return res.status(400).json({ error: 'rawPrompt is required' });
      }
      const response = await enhancePromptWithAnya({ rawPrompt, targetStudio, targetTier });
      res.json(response);
    } catch (error: any) {
      console.error('Error in /api/gemini/enhance-prompt:', error);
      res.status(500).json({ error: error.message || 'Prompt Enhancement failed' });
    }
  });

  // 10. Multi-Turn Knight Conversation & Voice Interaction
  app.post('/api/gemini/knight-chat', async (req, res) => {
    try {
      const { knightId, messages, includeAudio } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array is required' });
      }
      const response = await executeKnightChat({ 
        knightId: knightId || 'merlin', 
        messages, 
        includeAudio: !!includeAudio 
      });
      res.json(response);
    } catch (error: any) {
      console.error('Error in /api/gemini/knight-chat:', error);
      res.status(500).json({ error: error.message || 'Knight chat failed' });
    }
  });

  // 11. Knight Profile Catalog
  app.get('/api/gemini/knights', (req, res) => {
    res.json({ knights: KNIGHT_PROFILES });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production setup: serve static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error handler to prevent HTML fallbacks
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  // Create HTTP Server & WebSocket Bridge for Live API (gemini-3.1-flash-live-preview)
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on('connection', async (clientWs: WebSocket, req) => {
    // Parse query parameter for initial knight if present
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    const knightParam = url.searchParams.get('knight') || 'merlin';
    const voiceParam = url.searchParams.get('voice');
    
    const initialProfile = KNIGHT_PROFILES[knightParam] || KNIGHT_PROFILES.merlin;
    const initialVoice = (voiceParam as any) || initialProfile.voiceName || 'Zephyr';

    console.log(`Gemini Live API client connected for Knight [${initialProfile.name}] with voice [${initialVoice}]`);
    let session: any = null;

    async function initLiveSession(profile: typeof initialProfile, voice: string) {
      if (session && typeof session.close === 'function') {
        try {
          session.close();
        } catch (e) {
          // non fatal
        }
      }

      try {
        const ai = getGeminiClient();
        session = await ai.live.connect({
          model: 'gemini-3.1-flash-live-preview',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
            },
            systemInstruction: profile.systemInstruction,
          },
          callbacks: {
            onmessage: (message: LiveServerMessage) => {
              const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audio && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ audio, type: 'audio', knightId: profile.id }));
              }
              if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ interrupted: true, type: 'interrupted' }));
              }
            },
            onclose: () => {
              console.log(`Gemini Live session closed for ${profile.name}`);
            },
            onerror: (err) => {
              console.error(`Gemini Live session error for ${profile.name}:`, err);
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ error: err?.message || 'Live session error' }));
              }
            }
          },
        });

        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({ 
            status: 'connected', 
            model: 'gemini-3.1-flash-live-preview', 
            knight: profile,
            voice 
          }));
        }
      } catch (err: any) {
        console.error(`Failed to initialize Live session for ${profile.name}:`, err);
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({ error: err?.message || 'Failed to initialize Live session' }));
        }
      }
    }

    // Initialize default session
    await initLiveSession(initialProfile, initialVoice);

    clientWs.on('message', async (data) => {
      try {
        const parsed = JSON.parse(data.toString());

        // Dynamic Knight Switching in live session
        if (parsed.type === 'switch_knight' && parsed.knightId) {
          const newProfile = KNIGHT_PROFILES[parsed.knightId] || KNIGHT_PROFILES.merlin;
          const newVoice = parsed.voice || newProfile.voiceName;
          console.log(`Live Session switching to knight [${newProfile.name}] with voice [${newVoice}]`);
          await initLiveSession(newProfile, newVoice);
          return;
        }

        if (parsed.audio && session) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        }
        if (parsed.text && session) {
          session.sendRealtimeInput({
            text: parsed.text
          });
        }
      } catch (e) {
        console.error('Error handling client message:', e);
      }
    });

    clientWs.on('close', () => {
      if (session && typeof session.close === 'function') {
        try {
          session.close();
        } catch (err) {
          console.error('Error closing Gemini Live session:', err);
        }
      }
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running with Gemini Live API WebSocket on port ${PORT}`);
  });
}

startServer();
