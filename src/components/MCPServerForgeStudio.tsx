import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Server,
  Terminal,
  Cpu,
  Zap,
  Play,
  Copy,
  Check,
  Download,
  Activity,
  Shield,
  Layers,
  Sparkles,
  Database,
  Radio,
  FileCode,
  Compass,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ExternalLink,
  Code2,
  Search,
  BookOpen,
  Send
} from 'lucide-react';
import {
  MCPToolItem,
  MCPResourceItem,
  MCPPromptItem,
  MCPExecutionLog,
  ArthurianMCPServerInfo,
  MCPClientConfig,
  MCPJsonRpcRequest,
  MCPJsonRpcResponse
} from '../types';
import { MCPServerRegistry } from './MCPServerRegistry';
import { MCPServerDiscovery } from './MCPServerDiscovery';

interface MCPServerForgeStudioProps {
  onOpenSettings?: (tab?: string) => void;
}

type StudioTab = 'REGISTRY' | 'TOOLS' | 'RESOURCES' | 'PROMPTS' | 'CLIENT_CONFIGS' | 'LIVE_RPC' | 'DISCOVERY';

const SAMPLE_PAYLOADS: Record<string, Record<string, any>> = {
  forge_grill_intent: {
    rawIntent: 'Build a sovereign high-ticket proposal deck generator with real-time Google Slides export and local SQLite ledger.',
    strictZeroEntropy: true
  },
  forge_blueprint_dag: {
    featureName: 'Sovereign Proposal Generator',
    scopeLevel: 'MODULE_SERVICE'
  },
  forge_execute_crucible: {
    targetModule: 'VFS_Worktree_Lease_Sentinel',
    failureArchetype: 'ALL_FIVE_ARCHETYPES'
  },
  forge_synthesize_cli: {
    toolName: 'excalibur-slides-sync',
    category: 'INTEGRATION',
    targetCodebase: 'Google Slides & Drive API Export Pipeline'
  },
  forge_topological_audit: {
    scanDepth: 'DEEP_SPECTRAL_GRAPH'
  },
  forge_style_dictionary: {
    archetype: 'CYBER_ROYAL_CAMELOT',
    motionTier: '60FPS_SPRING_PHYSICS'
  },
  forge_sync_workspace: {
    service: 'DRIVE',
    action: 'LIST_RECENT'
  },
  forge_hardware_telemetry: {
    modeFilter: 'MERLIN_AGENCY'
  },
  ask_notebook: {
    query: 'What is the Isomorphic FileTree Law in Camelot-OS?',
    requireCitations: true
  }
};

export function MCPServerForgeStudio({ onOpenSettings }: MCPServerForgeStudioProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>('REGISTRY');
  const [serverInfo, setServerInfo] = useState<ArthurianMCPServerInfo | null>(null);
  const [tools, setTools] = useState<MCPToolItem[]>([]);
  const [resources, setResources] = useState<MCPResourceItem[]>([]);
  const [prompts, setPrompts] = useState<MCPPromptItem[]>([]);
  const [clientConfigs, setClientConfigs] = useState<MCPClientConfig | null>(null);
  const [executionLogs, setExecutionLogs] = useState<MCPExecutionLog[]>([]);
  
  // Interactive Tool Execution State
  const [selectedTool, setSelectedTool] = useState<MCPToolItem | null>(null);
  const [toolArgsJson, setToolArgsJson] = useState<string>('{}');
  const [toolCategoryFilter, setToolCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [lastRpcRequest, setLastRpcRequest] = useState<MCPJsonRpcRequest | null>(null);
  const [lastRpcResponse, setLastRpcResponse] = useState<MCPJsonRpcResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Resource & Prompt Tester State
  const [selectedResourceUri, setSelectedResourceUri] = useState<string>('forge://blueprints/master_schema');
  const [resourceContent, setResourceContent] = useState<string>('');
  const [selectedPromptName, setSelectedPromptName] = useState<string>('arthurian_knights_assembly');
  const [promptArgs, setPromptArgs] = useState<Record<string, string>>({ missionGoal: 'Build high-performance real-time telemetry dashboard', techStack: 'React + Tailwind + WASM' });
  const [promptResult, setPromptResult] = useState<any>(null);

  // Manual JSON-RPC 2.0 console state
  const [customRpcMethod, setCustomRpcMethod] = useState<string>('tools/list');
  const [customRpcParams, setCustomRpcParams] = useState<string>('{}');

  // Load Server State
  const fetchServerState = async () => {
    try {
      const [infoRes, toolsRes, resRes, promptsRes, clientsRes, logsRes] = await Promise.all([
        fetch('/api/mcp/v1/info'),
        fetch('/api/mcp/v1/tools'),
        fetch('/api/mcp/v1/resources'),
        fetch('/api/mcp/v1/prompts'),
        fetch('/api/mcp/v1/clients'),
        fetch('/api/mcp/v1/logs')
      ]);

      if (infoRes.ok) setServerInfo(await infoRes.json());
      if (toolsRes.ok) {
        const data = await toolsRes.json();
        setTools(data.tools || []);
        if (!selectedTool && data.tools?.length > 0) {
          setSelectedTool(data.tools[0]);
          setToolArgsJson(JSON.stringify(SAMPLE_PAYLOADS[data.tools[0].name] || {}, null, 2));
        }
      }
      if (resRes.ok) {
        const data = await resRes.json();
        setResources(data.resources || []);
      }
      if (promptsRes.ok) {
        const data = await promptsRes.json();
        setPrompts(data.prompts || []);
      }
      if (clientsRes.ok) setClientConfigs(await clientsRes.json());
      if (logsRes.ok) {
        const data = await logsRes.json();
        setExecutionLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load MCP server telemetry:', err);
    }
  };

  useEffect(() => {
    fetchServerState();
    const interval = setInterval(fetchServerState, 8000);
    return () => clearInterval(interval);
  }, []);

  // Handle Tool Selection
  const handleSelectTool = (tool: MCPToolItem) => {
    setSelectedTool(tool);
    const sample = SAMPLE_PAYLOADS[tool.name] || {};
    setToolArgsJson(JSON.stringify(sample, null, 2));
  };

  // Execute Tool Call via live JSON-RPC 2.0
  const handleExecuteTool = async () => {
    if (!selectedTool) return;
    setIsExecuting(true);

    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(toolArgsJson);
    } catch (e) {
      parsedArgs = {};
    }

    const rpcReq: MCPJsonRpcRequest = {
      jsonrpc: '2.0',
      id: `req_${Date.now()}`,
      method: 'tools/call',
      params: {
        name: selectedTool.name,
        arguments: parsedArgs
      }
    };

    setLastRpcRequest(rpcReq);

    try {
      const resp = await fetch('/api/mcp/v1/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcReq)
      });
      const data = await resp.json();
      setLastRpcResponse(data);
      fetchServerState(); // Refresh logs & invocations
    } catch (err: any) {
      setLastRpcResponse({
        jsonrpc: '2.0',
        id: rpcReq.id || null,
        error: { code: -32603, message: err.message || 'Execution failed' }
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Test custom JSON-RPC request
  const handleExecuteCustomRpc = async () => {
    setIsExecuting(true);
    let parsedParams = {};
    try {
      parsedParams = JSON.parse(customRpcParams);
    } catch (e) {
      parsedParams = {};
    }

    const rpcReq: MCPJsonRpcRequest = {
      jsonrpc: '2.0',
      id: `req_${Date.now()}`,
      method: customRpcMethod,
      params: parsedParams
    };

    setLastRpcRequest(rpcReq);

    try {
      const resp = await fetch('/api/mcp/v1/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcReq)
      });
      const data = await resp.json();
      setLastRpcResponse(data);
      fetchServerState();
    } catch (err: any) {
      setLastRpcResponse({
        jsonrpc: '2.0',
        id: rpcReq.id || null,
        error: { code: -32603, message: err.message }
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Ping Healthcheck
  const handlePing = async () => {
    const pingReq: MCPJsonRpcRequest = {
      jsonrpc: '2.0',
      id: `ping_${Date.now()}`,
      method: 'ping'
    };
    try {
      const resp = await fetch('/api/mcp/v1/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pingReq)
      });
      const data = await resp.json();
      setLastRpcRequest(pingReq);
      setLastRpcResponse(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Read Resource
  const handleReadResource = async (uri: string) => {
    setSelectedResourceUri(uri);
    try {
      const rpcReq: MCPJsonRpcRequest = {
        jsonrpc: '2.0',
        id: `res_${Date.now()}`,
        method: 'resources/read',
        params: { uri }
      };
      setLastRpcRequest(rpcReq);
      const resp = await fetch('/api/mcp/v1/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcReq)
      });
      const data = await resp.json();
      setLastRpcResponse(data);
      if (data?.result?.contents?.[0]?.text) {
        setResourceContent(data.result.contents[0].text);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Get Prompt
  const handleGetPrompt = async () => {
    try {
      const rpcReq: MCPJsonRpcRequest = {
        jsonrpc: '2.0',
        id: `prompt_${Date.now()}`,
        method: 'prompts/get',
        params: {
          name: selectedPromptName,
          arguments: promptArgs
        }
      };
      setLastRpcRequest(rpcReq);
      const resp = await fetch('/api/mcp/v1/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcReq)
      });
      const data = await resp.json();
      setLastRpcResponse(data);
      setPromptResult(data.result);
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Filtered Tools
  const filteredTools = tools.filter(t => {
    const matchesCategory = toolCategoryFilter === 'ALL' || t.category === toolCategoryFilter;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.handlerKnight.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 font-mono text-gray-200">
      {/* SOVEREIGN MCP SERVER IDENTITY & TELEMETRY BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D0E1C] via-[#090A14] to-[#120B24] border-2 border-[#8B5CF6]/40 p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
        {/* Glow corner accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-300 shadow-inner flex items-center justify-center">
              <Server size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Arthurian Sovereign MCP Server</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-bold">
                    ONLINE • v4.0.0
                  </span>
                </h2>
              </div>
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                Full-stack Model Context Protocol (MCP) server exposing Arthurian Knights, Blueprint OS DAG engines, Gideon Crucible SRE, and hardware partitions.
              </p>
            </div>
          </div>

          {/* Real-Time Live Telemetry Metrics */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {/* Protocol */}
            <div className="px-3 py-1.5 rounded-xl bg-[#090A14] border border-[#23273E] flex items-center gap-2 shadow-sm">
              <Radio size={12} className="text-[#00F0FF] animate-pulse" />
              <span className="text-gray-400">PROTOCOL:</span>
              <strong className="text-white font-bold">JSON-RPC 2.0 (v2024-11-05)</strong>
            </div>

            {/* Invocations */}
            <div className="px-3 py-1.5 rounded-xl bg-[#090A14] border border-[#23273E] flex items-center gap-2 shadow-sm">
              <Activity size={12} className="text-purple-400" />
              <span className="text-gray-400">CALLS:</span>
              <strong className="text-purple-300 font-bold">{serverInfo?.totalInvocations || 128}</strong>
            </div>

            {/* Endpoints */}
            <div className="px-3 py-1.5 rounded-xl bg-[#090A14] border border-[#23273E] flex items-center gap-2 shadow-sm">
              <Zap size={12} className="text-amber-400" />
              <span className="text-gray-400">TRANSPORTS:</span>
              <strong className="text-amber-300 font-bold">HTTP + SSE + Stdio</strong>
            </div>

            {/* Ping Button */}
            <button
              onClick={handlePing}
              className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-bold active:scale-95"
            >
              <RefreshCw size={11} className="animate-spin-slow" />
              <span>TEST PING</span>
            </button>
          </div>
        </div>

        {/* Live Transport Endpoints Strip */}
        <div className="mt-4 pt-3 border-t border-[#1C2035] grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
          <div className="p-2 rounded-lg bg-[#07080F]/90 border border-[#1B1E30] flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Code2 size={11} className="text-[#00F0FF]" /> HTTP JSON-RPC:
            </span>
            <code className="text-cyan-300 font-bold select-all">/api/mcp/v1/rpc</code>
          </div>

          <div className="p-2 rounded-lg bg-[#07080F]/90 border border-[#1B1E30] flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Radio size={11} className="text-purple-400" /> SSE Stream:
            </span>
            <code className="text-purple-300 font-bold select-all">/api/mcp/v1/sse</code>
          </div>

          <div className="p-2 rounded-lg bg-[#07080F]/90 border border-[#1B1E30] flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Terminal size={11} className="text-emerald-400" /> Host Process:
            </span>
            <code className="text-emerald-300 font-bold">Node.js / Express 3000</code>
          </div>
        </div>
      </div>

      {/* NAVIGATION SUB-TABS */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1C2034] pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('REGISTRY')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'REGISTRY'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] border border-purple-400/60'
                : 'text-gray-400 hover:text-white bg-[#0A0C16] hover:bg-[#121526] border border-transparent'
            }`}
          >
            <Server size={13} />
            <span>Server Registry (Fleet)</span>
          </button>

          <button
            onClick={() => setActiveTab('DISCOVERY')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'DISCOVERY'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'text-gray-400 hover:text-white bg-[#0A0C16] hover:bg-[#121526] border border-transparent'
            }`}
          >
            <Compass size={13} />
            <span>Discovery</span>
          </button>

          <button
            onClick={() => setActiveTab('TOOLS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'TOOLS'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/60 shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                : 'text-gray-400 hover:text-white bg-[#0A0C16] hover:bg-[#121526] border border-transparent'
            }`}
          >
            <Zap size={13} />
            <span>Sovereign Tools ({tools.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('RESOURCES')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'RESOURCES'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-gray-400 hover:text-white bg-[#0A0C16] hover:bg-[#121526] border border-transparent'
            }`}
          >
            <Database size={13} />
            <span>Resource Vaults ({resources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PROMPTS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'PROMPTS'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'text-gray-400 hover:text-white bg-[#0A0C16] hover:bg-[#121526] border border-transparent'
            }`}
          >
            <Sparkles size={13} />
            <span>Prompt Templates ({prompts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CLIENT_CONFIGS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'CLIENT_CONFIGS'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'text-gray-400 hover:text-white bg-[#0A0C16] hover:bg-[#121526] border border-transparent'
            }`}
          >
            <Download size={13} />
            <span>Client Configs (Claude/Cursor)</span>
          </button>

          <button
            onClick={() => setActiveTab('LIVE_RPC')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'LIVE_RPC'
                ? 'bg-rose-600/30 text-rose-300 border border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'text-gray-400 hover:text-white bg-[#0A0C16] hover:bg-[#121526] border border-transparent'
            }`}
          >
            <Terminal size={13} />
            <span>Raw JSON-RPC Console</span>
          </button>
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchServerState}
          className="p-1.5 px-3 rounded-xl bg-[#0F1120] hover:bg-[#181C30] border border-[#252A42] text-gray-400 hover:text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={11} />
          <span>SYNC TELEMETRY</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 0: MCP SERVER REGISTRY DASHBOARD                     */}
      {/* ======================================================== */}
      {activeTab === 'REGISTRY' && (
        <MCPServerRegistry onOpenSettings={onOpenSettings} />
      )}

      {/* ======================================================== */}
      {/* TAB 1: DISCOVERY SERVER REGISTRY                         */}
      {/* ======================================================== */}
      {activeTab === 'DISCOVERY' && (
        <MCPServerDiscovery onOpenSettings={onOpenSettings} />
      )}

      {/* ======================================================== */}
      {/* TAB 2: SOVEREIGN TOOLS EXECUTION MATRIX                  */}
      {/* ======================================================== */}
      {activeTab === 'TOOLS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Tools Catalog */}
          <div className="lg:col-span-5 space-y-3">
            {/* Search & Category Filter */}
            <div className="p-3 bg-[#0A0C16] border border-[#1C2034] rounded-xl space-y-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools or knights..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#111424] border border-[#222740] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 font-sans"
                />
              </div>

              {/* Category Chips */}
              <div className="flex flex-wrap gap-1 text-[9px]">
                {['ALL', 'ROUTING', 'SPECIFICATION', 'CRUCIBLE', 'SYNTHESIS', 'TOPOLOGY', 'MOTION', 'WORKSPACE', 'COGNITION'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setToolCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                      toolCategoryFilter === cat
                        ? 'bg-purple-600/40 text-purple-200 border border-purple-500/60'
                        : 'bg-[#121526] text-gray-400 hover:text-gray-200 border border-transparent'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Tools List */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 custom-scroll">
              {filteredTools.map(tool => {
                const isSelected = selectedTool?.name === tool.name;
                return (
                  <div
                    key={tool.name}
                    onClick={() => handleSelectTool(tool)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none space-y-1.5 ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                        : 'bg-[#090A14] hover:bg-[#111324] border-[#1C2034]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <code className="text-xs font-black text-purple-300">
                        {tool.name}
                      </code>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300 font-bold">
                        {tool.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-300 font-sans line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-[#181B2D]">
                      <span className="text-gray-400 truncate">
                        Knight: <strong className="text-white">{tool.handlerKnight}</strong>
                      </span>
                      <span className="text-gray-500 text-[9px]">
                        {Object.keys(tool.inputSchema?.properties || {}).length} params
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Interactive Execution Studio */}
          <div className="lg:col-span-7 space-y-3">
            {selectedTool ? (
              <div className="p-4 bg-[#090A14] border border-[#20253D] rounded-2xl space-y-3.5 shadow-xl">
                {/* Tool Header */}
                <div className="flex items-center justify-between border-b border-[#1C2034] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white uppercase">
                        {selectedTool.name}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-300">
                        JSON-RPC 2.0
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-sans block mt-0.5">
                      Handler: <strong className="text-purple-300">{selectedTool.handlerKnight}</strong>
                    </span>
                  </div>

                  <button
                    onClick={handleExecuteTool}
                    disabled={isExecuting}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isExecuting ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} className="fill-white" />}
                    <span>{isExecuting ? 'EXECUTING...' : 'CALL MCP TOOL'}</span>
                  </button>
                </div>

                {/* Parameter JSON Schema Viewer / Editor */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1 font-bold">
                      <Code2 size={12} className="text-purple-400" /> Arguments (JSON):
                    </span>
                    <button
                      onClick={() => {
                        const sample = SAMPLE_PAYLOADS[selectedTool.name] || {};
                        setToolArgsJson(JSON.stringify(sample, null, 2));
                      }}
                      className="text-[10px] text-purple-400 hover:text-purple-300 underline cursor-pointer"
                    >
                      Reset to Sample
                    </button>
                  </div>
                  <textarea
                    value={toolArgsJson}
                    onChange={(e) => setToolArgsJson(e.target.value)}
                    rows={6}
                    className="w-full p-3 rounded-xl bg-[#06070E] border border-[#1E2338] text-xs text-cyan-300 font-mono focus:outline-none focus:border-purple-500/60 custom-scroll leading-relaxed"
                  />
                </div>

                {/* Tool Input Schema Inspector */}
                <div className="p-2.5 rounded-xl bg-[#0C0E1B] border border-[#1B1F34] text-[10px] space-y-1">
                  <span className="font-bold text-gray-400 uppercase block">Input JSONSchema Properties:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-gray-300 font-sans">
                    {Object.entries(selectedTool.inputSchema?.properties || {}).map(([propName, propDef]: [string, any]) => {
                      const isRequired = selectedTool.inputSchema?.required?.includes(propName);
                      return (
                        <div key={propName} className="p-1.5 rounded bg-[#101324] border border-[#1E2338] font-mono">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-[11px]">{propName}</span>
                            <span className={`text-[9px] ${isRequired ? 'text-amber-400' : 'text-gray-500'}`}>
                              {isRequired ? 'REQUIRED' : 'OPTIONAL'} ({propDef.type})
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-sans mt-0.5">{propDef.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Execution Response Display */}
                {lastRpcResponse && (
                  <div className="space-y-2 pt-2 border-t border-[#1C2034]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                        <CheckCircle2 size={13} /> JSON-RPC 2.0 Response Result:
                      </span>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(lastRpcResponse, null, 2), 'tool-resp')}
                        className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'tool-resp' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        <span>{copiedKey === 'tool-resp' ? 'COPIED' : 'COPY JSON'}</span>
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-[#04050A] border border-[#1C2138] max-h-72 overflow-y-auto custom-scroll text-xs">
                      {lastRpcResponse.result?.content ? (
                        <div className="space-y-2">
                          {lastRpcResponse.result.content.map((c: any, idx: number) => (
                            <pre key={idx} className="whitespace-pre-wrap font-mono text-cyan-200 text-[11px] leading-relaxed">
                              {c.text}
                            </pre>
                          ))}
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap font-mono text-emerald-300 text-[11px]">
                          {JSON.stringify(lastRpcResponse, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500 bg-[#090A14] border border-[#1C2034] rounded-2xl">
                <Zap size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">Select a sovereign Arthurian MCP tool from the left catalog to inspect and test live.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: RESOURCE VAULTS                                  */}
      {/* ======================================================== */}
      {activeTab === 'RESOURCES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Available MCP Resources ({resources.length})
            </h3>
            {resources.map(res => {
              const isSelected = selectedResourceUri === res.uri;
              return (
                <div
                  key={res.uri}
                  onClick={() => handleReadResource(res.uri)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer select-none space-y-1 ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-[#090A14] hover:bg-[#111324] border-[#1C2034]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-black text-cyan-300">{res.uri}</code>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
                      {res.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{res.name}</h4>
                  <p className="text-[10px] text-gray-400 font-sans">{res.description}</p>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="p-4 bg-[#090A14] border border-[#20253D] rounded-2xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1C2034] pb-2.5">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Database size={13} className="text-cyan-400" />
                    <span>Resource Content Inspector: {selectedResourceUri}</span>
                  </h4>
                </div>
                <button
                  onClick={() => handleReadResource(selectedResourceUri)}
                  className="px-3 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold cursor-pointer"
                >
                  READ RESOURCE
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#04050A] border border-[#1C2138] max-h-96 overflow-y-auto custom-scroll">
                <pre className="whitespace-pre-wrap font-mono text-cyan-200 text-xs leading-relaxed">
                  {resourceContent || 'Click READ RESOURCE to stream URI data...'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PROMPT TEMPLATES                                 */}
      {/* ======================================================== */}
      {activeTab === 'PROMPTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              MCP Prompt Templates ({prompts.length})
            </h3>
            {prompts.map(p => {
              const isSelected = selectedPromptName === p.name;
              return (
                <div
                  key={p.name}
                  onClick={() => setSelectedPromptName(p.name)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer select-none space-y-1 ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'bg-[#090A14] hover:bg-[#111324] border-[#1C2034]'
                  }`}
                >
                  <code className="text-xs font-black text-amber-300">{p.name}</code>
                  <p className="text-[11px] text-gray-300 font-sans">{p.description}</p>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="p-4 bg-[#090A14] border border-[#20253D] rounded-2xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1C2034] pb-2.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Prompt: {selectedPromptName}</span>
                </h4>
                <button
                  onClick={handleGetPrompt}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 border border-amber-500/50 text-amber-200 text-xs font-bold cursor-pointer"
                >
                  GENERATE PROMPT
                </button>
              </div>

              {/* Argument inputs */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 uppercase block font-bold">Parameter Overrides:</label>
                <div className="space-y-1.5 font-sans">
                  {prompts.find(p => p.name === selectedPromptName)?.arguments?.map(arg => (
                    <div key={arg.name} className="space-y-0.5">
                      <span className="text-[10px] text-gray-300 font-mono font-bold">{arg.name}:</span>
                      <input
                        type="text"
                        value={promptArgs[arg.name] || ''}
                        onChange={(e) => setPromptArgs({ ...promptArgs, [arg.name]: e.target.value })}
                        placeholder={arg.description}
                        className="w-full p-2 rounded-lg bg-[#070810] border border-[#1E2338] text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {promptResult && (
                <div className="space-y-1.5 pt-2 border-t border-[#1C2034]">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">Compiled MCP Messages:</span>
                  <div className="p-3 rounded-xl bg-[#04050A] border border-[#1C2138] max-h-64 overflow-y-auto custom-scroll">
                    <pre className="whitespace-pre-wrap font-mono text-amber-200 text-xs leading-relaxed">
                      {promptResult.messages?.[0]?.content?.text || JSON.stringify(promptResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CLIENT CONFIGS (CLAUDE / CURSOR / WINDSURF)      */}
      {/* ======================================================== */}
      {activeTab === 'CLIENT_CONFIGS' && clientConfigs && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Claude Desktop */}
            <div className="p-4 bg-[#090A14] border border-[#20253D] rounded-2xl space-y-2.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <h4 className="text-xs font-bold text-white">Claude Desktop Configuration</h4>
                </div>
                <button
                  onClick={() => copyToClipboard(clientConfigs.claudeDesktop, 'claude')}
                  className="px-2.5 py-1 rounded-lg bg-[#141728] hover:bg-[#1E233C] border border-[#2B314E] text-[10px] text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer font-bold"
                >
                  {copiedKey === 'claude' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copiedKey === 'claude' ? 'COPIED' : 'COPY JSON'}</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-400 font-sans">
                Paste into your <code className="text-purple-300">claude_desktop_config.json</code>:
              </p>
              <pre className="p-3 rounded-xl bg-[#04050A] border border-[#1A1E32] text-[11px] text-purple-200 overflow-x-auto custom-scroll">
                {clientConfigs.claudeDesktop}
              </pre>
            </div>

            {/* Cursor IDE */}
            <div className="p-4 bg-[#090A14] border border-[#20253D] rounded-2xl space-y-2.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <h4 className="text-xs font-bold text-white">Cursor IDE Configuration</h4>
                </div>
                <button
                  onClick={() => copyToClipboard(clientConfigs.cursor, 'cursor')}
                  className="px-2.5 py-1 rounded-lg bg-[#141728] hover:bg-[#1E233C] border border-[#2B314E] text-[10px] text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer font-bold"
                >
                  {copiedKey === 'cursor' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copiedKey === 'cursor' ? 'COPIED' : 'COPY JSON'}</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-400 font-sans">
                Paste into <code className="text-cyan-300">.cursor/mcp.json</code> or Settings &gt; MCP:
              </p>
              <pre className="p-3 rounded-xl bg-[#04050A] border border-[#1A1E32] text-[11px] text-cyan-200 overflow-x-auto custom-scroll">
                {clientConfigs.cursor}
              </pre>
            </div>
          </div>

          {/* Stdio Inspector CLI Quick Command */}
          <div className="p-4 bg-[#0B0D1A] border border-[#1E2338] rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <Terminal size={14} /> Official MCP Inspector Command:
              </span>
              <button
                onClick={() => copyToClipboard(clientConfigs.stdioCommand, 'inspector')}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                {copiedKey === 'inspector' ? 'COPIED COMMAND' : 'COPY COMMAND'}
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-[#04050A] border border-[#1C2034] text-xs text-emerald-300 font-mono">
              <code>{clientConfigs.stdioCommand}</code>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: RAW JSON-RPC 2.0 PROTOCOL CONSOLE                */}
      {/* ======================================================== */}
      {activeTab === 'LIVE_RPC' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 space-y-3">
            <div className="p-4 bg-[#090A14] border border-[#20253D] rounded-2xl space-y-3 shadow-xl">
              <h4 className="text-xs font-black text-white uppercase flex items-center gap-2">
                <Terminal size={14} className="text-rose-400" />
                <span>JSON-RPC 2.0 Request Builder</span>
              </h4>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase">Method:</label>
                <select
                  value={customRpcMethod}
                  onChange={(e) => setCustomRpcMethod(e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#06070E] border border-[#1E2338] text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                >
                  <option value="initialize">initialize</option>
                  <option value="ping">ping</option>
                  <option value="tools/list">tools/list</option>
                  <option value="tools/call">tools/call</option>
                  <option value="resources/list">resources/list</option>
                  <option value="resources/read">resources/read</option>
                  <option value="prompts/list">prompts/list</option>
                  <option value="prompts/get">prompts/get</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase">Params (JSON):</label>
                <textarea
                  value={customRpcParams}
                  onChange={(e) => setCustomRpcParams(e.target.value)}
                  rows={6}
                  className="w-full p-2.5 rounded-lg bg-[#06070E] border border-[#1E2338] text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500 custom-scroll"
                />
              </div>

              <button
                onClick={handleExecuteCustomRpc}
                disabled={isExecuting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Send size={13} />
                <span>DISPATCH JSON-RPC 2.0 CALL</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="p-4 bg-[#090A14] border border-[#20253D] rounded-2xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1C2034] pb-2">
                <h4 className="text-xs font-black text-white uppercase flex items-center gap-2">
                  <Activity size={14} className="text-emerald-400" />
                  <span>Protocol Invocations &amp; Telemetry Stream</span>
                </h4>
                <span className="text-[10px] text-gray-400 font-mono">
                  {executionLogs.length} Events Logged
                </span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scroll pr-1">
                {executionLogs.length > 0 ? (
                  executionLogs.map(log => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-[#05060C] border border-[#1B1F34] font-mono text-[11px] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300 font-bold">{log.method}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">{log.latencyMs}ms</span>
                          <span className="text-[9px] px-1.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
                            {log.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-500">
                        <span>Knight: {log.knight}</span>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center py-8">
                    Execute a tool or protocol call to stream live telemetry events.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
