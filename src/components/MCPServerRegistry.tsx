import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, YAxis } from 'recharts';
import {
  Server,
  Zap,
  Search,
  Filter,
  Activity,
  Radio,
  Terminal,
  Cpu,
  Layers,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ExternalLink,
  Code2,
  Copy,
  Check,
  Database,
  Sparkles,
  Plus,
  Trash2,
  Play,
  LayoutGrid,
  List,
  Network,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowUpRight,
  Globe,
  SlidersHorizontal,
  FolderCode,
  BookOpen,
  Settings,
  HelpCircle,
  Pin,
  PinOff,
  MoreVertical,
  Download,
  FileCheck,
  FileCode,
  Share2,
  FileText
} from 'lucide-react';
import {
  MCPServerRegistryEntry,
  MCPServerToolCapability,
  MCPServerRegistrySummary,
  MCPConnectionStatus,
  MCPTransportType,
  MCPJsonRpcRequest,
  MCPJsonRpcResponse,
  MCPToolCapabilityProof
} from '../types';
import {
  fetchMCPServers,
  fetchRegistrySummary,
  toggleServerConnection,
  pingServerEndpoint,
  registerNewServer,
  deleteCustomServer
} from '../services/mcpRegistryService';

// Mock history data for microcharts (similar to Xamarin Microcharts style)
const generateMockMicrochartData = (baseVal: number, points: number, variance: number) => {
  return Array.from({ length: points }).map((_, i) => ({
    val: Math.max(0, baseVal + (Math.random() * variance * 2 - variance))
  }));
};

const LATENCY_HISTORY = generateMockMicrochartData(15, 20, 5);
const INVOCATION_HISTORY = generateMockMicrochartData(500, 20, 200);

export interface MCPServerRegistryProps {
  onOpenSettings?: (tab?: string) => void;
  onSelectToolToExecute?: (toolName: string, serverId: string) => void;
  className?: string;
}

type ViewMode = 'GRID' | 'TABLE' | 'CAPABILITY_MATRIX';
type StatusFilter = 'ALL' | 'ONLINE_CONNECTED' | 'SYNCING' | 'STANDBY' | 'DISCONNECTED';
type TransportFilter = 'ALL' | MCPTransportType;
type CategoryFilter = 'ALL' | 'ROUTING' | 'SPECIFICATION' | 'CRUCIBLE' | 'SYNTHESIS' | 'TOPOLOGY' | 'MOTION' | 'WORKSPACE' | 'COGNITION' | 'HARDWARE' | 'KNOWLEDGE' | 'MULTIMODAL' | 'CUSTOM';

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  ROUTING: { bg: 'bg-purple-950/70', border: 'border-purple-500/50', text: 'text-purple-300' },
  SPECIFICATION: { bg: 'bg-blue-950/70', border: 'border-blue-500/50', text: 'text-blue-300' },
  CRUCIBLE: { bg: 'bg-rose-950/70', border: 'border-rose-500/50', text: 'text-rose-300' },
  SYNTHESIS: { bg: 'bg-emerald-950/70', border: 'border-emerald-500/50', text: 'text-emerald-300' },
  TOPOLOGY: { bg: 'bg-indigo-950/70', border: 'border-indigo-500/50', text: 'text-indigo-300' },
  MOTION: { bg: 'bg-pink-950/70', border: 'border-pink-500/50', text: 'text-pink-300' },
  WORKSPACE: { bg: 'bg-amber-950/70', border: 'border-amber-500/50', text: 'text-amber-300' },
  COGNITION: { bg: 'bg-cyan-950/70', border: 'border-cyan-500/50', text: 'text-cyan-300' },
  HARDWARE: { bg: 'bg-orange-950/70', border: 'border-orange-500/50', text: 'text-orange-300' },
  KNOWLEDGE: { bg: 'bg-teal-950/70', border: 'border-teal-500/50', text: 'text-teal-300' },
  MULTIMODAL: { bg: 'bg-violet-950/70', border: 'border-violet-500/50', text: 'text-violet-300' },
  CUSTOM: { bg: 'bg-gray-800/70', border: 'border-gray-600/50', text: 'text-gray-300' }
};

const TRANSPORT_LABELS: Record<MCPTransportType, { label: string; icon: React.ComponentType<any>; color: string }> = {
  HTTP_JSON_RPC: { label: 'HTTP JSON-RPC', icon: Globe, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/60' },
  SSE_EVENT_STREAM: { label: 'SSE Stream', icon: Radio, color: 'text-purple-400 border-purple-500/40 bg-purple-950/60' },
  STDIO_BIFROST: { label: 'Stdio Bifrost', icon: Terminal, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/60' },
  WSS_SOCKET: { label: 'WebSocket (WSS)', icon: Activity, color: 'text-violet-400 border-violet-500/40 bg-violet-950/60' },
  WASM_FFI: { label: 'WASM FFI', icon: Cpu, color: 'text-amber-400 border-amber-500/40 bg-amber-950/60' },
  ETHERCAT_OPC_UA: { label: 'EtherCAT / OPC-UA', icon: Network, color: 'text-orange-400 border-orange-500/40 bg-orange-950/60' }
};

export function MCPServerRegistry({
  onOpenSettings,
  onSelectToolToExecute,
  className = ''
}: MCPServerRegistryProps) {
  const [servers, setServers] = useState<MCPServerRegistryEntry[]>([]);
  const [summary, setSummary] = useState<MCPServerRegistrySummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [transportFilter, setTransportFilter] = useState<TransportFilter>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('GRID');
  const [expandedServers, setExpandedServers] = useState<Record<string, boolean>>({
    'srv-arthurian-core': true,
    'srv-notebooklm-vault': true
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pingingMap, setPingingMap] = useState<Record<string, boolean>>({});

  // Pinned Tools State (persisted in localStorage)
  const [pinnedToolKeys, setPinnedToolKeys] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('arthurian_pinned_mcp_tools');
      return saved ? JSON.parse(saved) : ['srv-arthurian-core::forge_grill_intent', 'srv-notebooklm-vault::vault_synthesize_study_guide'];
    } catch (_) {
      return ['srv-arthurian-core::forge_grill_intent'];
    }
  });

  // Context Menu Floating State
  const [contextMenu, setContextMenu] = useState<{
    tool: MCPServerToolCapability;
    server: MCPServerRegistryEntry;
    x: number;
    y: number;
  } | null>(null);

  // Capability Proof Modal State
  const [proofModal, setProofModal] = useState<{
    proof: MCPToolCapabilityProof;
    tool: MCPServerToolCapability;
    server: MCPServerRegistryEntry;
    activeTab: 'CERTIFICATE' | 'JSON' | 'CURL' | 'BADGE';
  } | null>(null);

  // Notification Toast State
  const [toastNotification, setToastNotification] = useState<{
    id: string;
    title: string;
    description?: string;
    type: 'PIN' | 'UNPIN' | 'PROOF' | 'COPY' | 'INFO';
  } | null>(null);

  const showToast = (toast: {
    id: string;
    title: string;
    description?: string;
    type: 'PIN' | 'UNPIN' | 'PROOF' | 'COPY' | 'INFO';
  }) => {
    setToastNotification(toast);
    setTimeout(() => {
      setToastNotification(curr => (curr?.id === toast.id ? null : curr));
    }, 3200);
  };

  // Close context menu on outside click or escape
  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu) setContextMenu(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu]);

  // Tool Inspector Modal State
  const [inspectingTool, setInspectingTool] = useState<{
    tool: MCPServerToolCapability;
    server: MCPServerRegistryEntry;
  } | null>(null);
  const [toolArgsJson, setToolArgsJson] = useState<string>('{}');
  const [isExecutingTool, setIsExecutingTool] = useState<boolean>(false);
  const [toolExecutionResult, setToolExecutionResult] = useState<any>(null);

  // Register Server Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [newServerForm, setNewServerForm] = useState({
    displayName: '',
    name: '',
    description: '',
    transport: 'SSE_EVENT_STREAM' as MCPTransportType,
    endpointUrl: '',
    securityType: 'SENTINEL_LEASE' as any,
    tags: 'External, Custom',
    toolName: '',
    toolDescription: '',
    toolCategory: 'CUSTOM'
  });

  // Client Config Export Modal
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [selectedConfigTarget, setSelectedConfigTarget] = useState<'CLAUDE' | 'CURSOR' | 'WINDSURF' | 'STDIO'>('CLAUDE');

  // Load Servers
  const loadData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const [fetchedServers, fetchedSummary] = await Promise.all([
        fetchMCPServers(),
        fetchRegistrySummary()
      ]);
      setServers(fetchedServers);
      if (fetchedSummary) {
        setSummary(fetchedSummary);
      }
    } catch (err) {
      console.error('Failed to load MCP server registry data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(false), 12000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedServers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handlePing = async (serverId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPingingMap(prev => ({ ...prev, [serverId]: true }));
    try {
      const res = await pingServerEndpoint(serverId);
      if (res) {
        setServers(prev =>
          prev.map(s => (s.id === serverId ? { ...s, latencyMs: res.latencyMs, lastPingTimestamp: res.timestamp } : s))
        );
      }
    } finally {
      setTimeout(() => {
        setPingingMap(prev => ({ ...prev, [serverId]: false }));
      }, 500);
    }
  };

  const handlePingAll = async () => {
    setIsRefreshing(true);
    for (const server of servers) {
      if (server.status === 'ONLINE_CONNECTED') {
        await pingServerEndpoint(server.id);
      }
    }
    await loadData(false);
  };

  const handleToggleConnection = async (serverId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = await toggleServerConnection(serverId);
    if (updated) {
      setServers(prev => prev.map(s => (s.id === serverId ? updated : s)));
    }
  };

  const handleDeleteServer = async (serverId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this custom MCP server from the registry?')) {
      return;
    }
    const success = await deleteCustomServer(serverId);
    if (success) {
      setServers(prev => prev.filter(s => s.id !== serverId));
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleOpenToolInspector = (tool: MCPServerToolCapability, server: MCPServerRegistryEntry) => {
    setInspectingTool({ tool, server });
    setToolExecutionResult(null);

    // Prepare default arguments
    const defaultArgs: Record<string, any> = {};
    if (tool.inputSchema?.properties) {
      Object.entries(tool.inputSchema.properties).forEach(([k, v]: [string, any]) => {
        if (v.type === 'boolean') defaultArgs[k] = true;
        else if (v.type === 'number') defaultArgs[k] = 10;
        else if (v.enum && v.enum.length > 0) defaultArgs[k] = v.enum[0];
        else defaultArgs[k] = `Sample ${k}`;
      });
    }
    setToolArgsJson(JSON.stringify(defaultArgs, null, 2));
  };

  const handleExecuteToolInModal = async () => {
    if (!inspectingTool) return;
    setIsExecutingTool(true);
    setToolExecutionResult(null);

    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(toolArgsJson);
    } catch (e: any) {
      setToolExecutionResult({
        error: `Invalid JSON syntax: ${e.message}`
      });
      setIsExecutingTool(false);
      return;
    }

    const rpcReq: MCPJsonRpcRequest = {
      jsonrpc: '2.0',
      id: `reg_call_${Date.now()}`,
      method: 'tools/call',
      params: {
        name: inspectingTool.tool.name,
        arguments: parsedArgs
      }
    };

    try {
      const resp = await fetch('/api/mcp/v1/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcReq)
      });
      const data = await resp.json();
      setToolExecutionResult(data);
      loadData(false);
    } catch (err: any) {
      setToolExecutionResult({
        jsonrpc: '2.0',
        error: { code: -32603, message: err.message || 'Execution error' }
      });
    } finally {
      setIsExecutingTool(false);
    }
  };

  const handleCreateCustomServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerForm.displayName.trim()) return;

    const identifier = (newServerForm.name || newServerForm.displayName).toLowerCase().replace(/\s+/g, '-');
    const tagsArray = newServerForm.tags.split(',').map(t => t.trim()).filter(Boolean);

    const toolsList: MCPServerToolCapability[] = [];
    if (newServerForm.toolName.trim()) {
      toolsList.push({
        name: newServerForm.toolName.trim().replace(/\s+/g, '_'),
        description: newServerForm.toolDescription.trim() || 'Custom registered MCP tool capability.',
        category: newServerForm.toolCategory,
        handler: `${newServerForm.displayName} Handler`,
        parametersCount: 1,
        totalCalls: 0,
        avgLatencyMs: 10.0,
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string', description: 'Input payload parameter' }
          }
        }
      });
    }

    const created = await registerNewServer({
      displayName: newServerForm.displayName.trim(),
      name: identifier,
      description: newServerForm.description.trim() || 'Custom user-registered MCP server.',
      transport: newServerForm.transport,
      endpointUrl: newServerForm.endpointUrl.trim() || 'http://localhost:8080/mcp',
      securityType: newServerForm.securityType,
      tags: tagsArray.length > 0 ? tagsArray : ['Custom'],
      tools: toolsList.length > 0 ? toolsList : undefined
    });

    if (created) {
      setServers(prev => [...prev, created]);
      setIsRegisterModalOpen(false);
      setNewServerForm({
        displayName: '',
        name: '',
        description: '',
        transport: 'SSE_EVENT_STREAM',
        endpointUrl: '',
        securityType: 'SENTINEL_LEASE',
        tags: 'External, Custom',
        toolName: '',
        toolDescription: '',
        toolCategory: 'CUSTOM'
      });
    }
  };

  const computePseudoSha256 = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hex1 = Math.abs(hash).toString(16).padStart(8, '0');
    const hex2 = Math.abs((hash * 31) | 0).toString(16).padStart(8, '0');
    const hex3 = Math.abs((hash * 67) | 0).toString(16).padStart(8, '0');
    const hex4 = Math.abs((hash * 127) | 0).toString(16).padStart(8, '0');
    return `sha256:0x${hex1}${hex2}${hex3}${hex4}`;
  };

  const generateCapabilityProof = (
    tool: MCPServerToolCapability,
    server: MCPServerRegistryEntry
  ): MCPToolCapabilityProof => {
    const schemaStr = JSON.stringify(tool.inputSchema || {});
    const proofId = `proof_mcp_${tool.name}_${Date.now().toString(36)}`;
    const schemaHash = computePseudoSha256(tool.name + schemaStr + server.endpointUrl);
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const sampleArgs: Record<string, any> = {};
    if (tool.inputSchema?.properties) {
      Object.keys(tool.inputSchema.properties).forEach(k => {
        sampleArgs[k] = `sample_${k}`;
      });
    }

    const curlPayload = `curl -X POST "${server.endpointUrl}" \\
  -H "Content-Type: application/json" \\
  -H "X-Arthurian-Capability-Proof: ${proofId}" \\
  -d '${JSON.stringify(
    {
      jsonrpc: '2.0',
      id: `proof_call_${Date.now()}`,
      method: 'tools/call',
      params: {
        name: tool.name,
        arguments: sampleArgs
      }
    },
    null,
    2
  )}'`;

    return {
      proofId,
      toolName: tool.name,
      serverName: server.displayName,
      serverId: server.id,
      endpointUrl: server.endpointUrl,
      transport: server.transport,
      category: tool.category,
      handler: tool.handler,
      schemaHash,
      protocolVersion: server.protocolVersion || '2024-11-05',
      issuedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      zeroTrustLease: `sentinel_lease_${server.securityType}_active`,
      inputSchema: tool.inputSchema || { type: 'object', properties: {} },
      verificationSignature: `sig_ed25519_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      curlPayload
    };
  };

  const handleOpenContextMenu = (
    e: React.MouseEvent,
    tool: MCPServerToolCapability,
    server: MCPServerRegistryEntry
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 240;
    const menuHeight = 310;
    const clampedX = Math.max(10, Math.min(e.clientX, window.innerWidth - menuWidth - 20));
    const clampedY = Math.max(10, Math.min(e.clientY, window.innerHeight - menuHeight - 20));
    setContextMenu({
      tool,
      server,
      x: clampedX,
      y: clampedY
    });
  };

  const handleTogglePin = (toolName: string, serverId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const key = `${serverId}::${toolName}`;
    setPinnedToolKeys(prev => {
      const isPinned = prev.includes(key);
      let next: string[];
      if (isPinned) {
        next = prev.filter(k => k !== key);
        showToast({
          id: `toast_${Date.now()}`,
          title: `Tool Unpinned`,
          description: `Removed '${toolName}' from Dashboard Quick Access`,
          type: 'UNPIN'
        });
      } else {
        next = [...prev, key];
        showToast({
          id: `toast_${Date.now()}`,
          title: `Pinned to Dashboard!`,
          description: `'${toolName}' is now locked in the Pinned Sovereign Tools tray`,
          type: 'PIN'
        });
      }
      try {
        localStorage.setItem('arthurian_pinned_mcp_tools', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
    setContextMenu(null);
  };

  const handleExportProof = (
    tool: MCPServerToolCapability,
    server: MCPServerRegistryEntry,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    const proof = generateCapabilityProof(tool, server);
    setProofModal({
      proof,
      tool,
      server,
      activeTab: 'CERTIFICATE'
    });
    setContextMenu(null);
  };

  const downloadProofJson = (proof: MCPToolCapabilityProof) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(proof, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mcp-capability-proof-${proof.toolName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast({
      id: `toast_${Date.now()}`,
      title: 'Capability Proof Exported',
      description: `Saved mcp-capability-proof-${proof.toolName}.json to Downloads`,
      type: 'PROOF'
    });
  };

  const handleCopyRpcPayload = (tool: MCPServerToolCapability, server: MCPServerRegistryEntry) => {
    const sampleArgs: Record<string, any> = {};
    if (tool.inputSchema?.properties) {
      Object.keys(tool.inputSchema.properties).forEach(k => {
        sampleArgs[k] = `sample_${k}`;
      });
    }
    const payload = JSON.stringify(
      {
        jsonrpc: '2.0',
        id: `rpc_call_${Date.now()}`,
        method: 'tools/call',
        params: {
          name: tool.name,
          arguments: sampleArgs
        }
      },
      null,
      2
    );
    copyToClipboard(payload, `rpc_${tool.name}`);
    showToast({
      id: `toast_${Date.now()}`,
      title: 'JSON-RPC Payload Copied',
      description: `Ready-to-paste tools/call payload copied to clipboard`,
      type: 'COPY'
    });
    setContextMenu(null);
  };

  const handleCopyCurlCommand = (tool: MCPServerToolCapability, server: MCPServerRegistryEntry) => {
    const proof = generateCapabilityProof(tool, server);
    copyToClipboard(proof.curlPayload, `curl_${tool.name}`);
    showToast({
      id: `toast_${Date.now()}`,
      title: 'cURL Command Copied',
      description: `Terminal command for testing ${tool.name} copied to clipboard`,
      type: 'COPY'
    });
    setContextMenu(null);
  };

  // Pinned Tools Resolved List
  const pinnedToolsList = useMemo(() => {
    const list: Array<{ tool: MCPServerToolCapability; server: MCPServerRegistryEntry; key: string }> = [];
    pinnedToolKeys.forEach(key => {
      const [serverId, toolName] = key.split('::');
      const server = servers.find(s => s.id === serverId);
      if (server) {
        const tool = server.tools.find(t => t.name === toolName);
        if (tool) {
          list.push({ tool, server, key });
        }
      }
    });
    return list;
  }, [pinnedToolKeys, servers]);

  // Filtered & Sorted Servers
  const filteredServers = useMemo(() => {
    return servers.filter(s => {
      // 1. Status Filter
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;

      // 2. Transport Filter
      if (transportFilter !== 'ALL' && s.transport !== transportFilter) return false;

      // 3. Category Filter
      if (categoryFilter !== 'ALL') {
        const hasCategory = s.tools.some(t => t.category === categoryFilter);
        if (!hasCategory) return false;
      }

      // 4. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesServer =
          s.displayName.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.endpointUrl.toLowerCase().includes(q) ||
          s.hostRuntime.toLowerCase().includes(q) ||
          s.tags.some(tag => tag.toLowerCase().includes(q));

        const matchesTool = s.tools.some(
          t =>
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.handler.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)
        );

        if (!matchesServer && !matchesTool) return false;
      }

      return true;
    });
  }, [servers, statusFilter, transportFilter, categoryFilter, searchQuery]);

  // Aggregate All Tools across matching servers for Capability Matrix view
  const allToolCapabilities = useMemo(() => {
    const list: Array<{ tool: MCPServerToolCapability; server: MCPServerRegistryEntry }> = [];
    filteredServers.forEach(server => {
      server.tools.forEach(tool => {
        if (categoryFilter === 'ALL' || tool.category === categoryFilter) {
          if (!searchQuery.trim()) {
            list.push({ tool, server });
          } else {
            const q = searchQuery.toLowerCase();
            if (
              tool.name.toLowerCase().includes(q) ||
              tool.description.toLowerCase().includes(q) ||
              tool.handler.toLowerCase().includes(q) ||
              tool.category.toLowerCase().includes(q) ||
              server.displayName.toLowerCase().includes(q)
            ) {
              list.push({ tool, server });
            }
          }
        }
      });
    });
    return list;
  }, [filteredServers, categoryFilter, searchQuery]);

  // Generate Client Config Snippets
  const getGeneratedClientConfig = (target: string) => {
    const host = window.location.origin;
    if (target === 'CLAUDE') {
      const config: Record<string, any> = { mcpServers: {} };
      servers.forEach(s => {
        config.mcpServers[s.name] = {
          url: s.endpointUrl.startsWith('http') ? s.endpointUrl : `${host}${s.endpointUrl}`,
          headers: { Accept: s.transport === 'SSE_EVENT_STREAM' ? 'text/event-stream' : 'application/json' }
        };
      });
      return JSON.stringify(config, null, 2);
    } else if (target === 'CURSOR') {
      const config: Record<string, any> = { mcpServers: {} };
      servers.forEach(s => {
        config.mcpServers[s.name] = {
          command: 'npx',
          args: ['-y', 'mcp-proxy', s.endpointUrl.startsWith('http') ? s.endpointUrl : `${host}${s.endpointUrl}`]
        };
      });
      return JSON.stringify(config, null, 2);
    } else if (target === 'WINDSURF') {
      const config: Record<string, any> = { mcpServers: {} };
      servers.forEach(s => {
        config.mcpServers[s.name] = {
          serverUrl: s.endpointUrl.startsWith('http') ? s.endpointUrl : `${host}${s.endpointUrl}`
        };
      });
      return JSON.stringify(config, null, 2);
    } else {
      return `npx -y @modelcontextprotocol/inspector --url ${host}/api/mcp/v1/sse`;
    }
  };

  const handleGenerateAuditLog = () => {
    const auditData = {
      generatedAt: new Date().toISOString(),
      fleetSummary: summary || {
        onlineServers: servers.filter(s => s.status === 'ONLINE_CONNECTED').length,
        totalServers: servers.length,
        totalToolCapabilities: servers.reduce((acc, s) => acc + s.tools.length, 0),
        avgGlobalLatencyMs: servers.length ? (servers.reduce((a, s) => a + s.latencyMs, 0) / servers.length).toFixed(1) : '0',
        totalInvocations: servers.reduce((a, s) => a + s.totalInvocations, 0),
      },
      servers: servers.map(s => ({
        id: s.id,
        name: s.name,
        displayName: s.displayName,
        description: s.description,
        status: s.status,
        latencyMs: s.latencyMs,
        transport: s.transport,
        endpointUrl: s.endpointUrl,
        protocolVersion: s.protocolVersion,
        securityType: s.securityType,
        totalInvocations: s.totalInvocations,
        hostRuntime: s.hostRuntime,
        tags: s.tags,
        tools: s.tools.map(t => ({
          name: t.name,
          description: t.description,
          category: t.category,
          handler: t.handler,
          inputSchema: t.inputSchema,
          isStreaming: t.isStreaming,
        }))
      }))
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mcp-audit-log-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast({
      id: `toast_${Date.now()}`,
      title: 'Audit Log Generated',
      description: 'Downloaded fleet audit report as JSON',
      type: 'INFO'
    });
  };

  return (
    <div className={`space-y-5 font-mono text-gray-200 ${className}`}>
      {/* 1. HEADER & KPI SUMMARY BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B0C18] via-[#090A14] to-[#120D22] border-2 border-[#8B5CF6]/40 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
        {/* Glow corner accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-xl bg-purple-950/90 border border-purple-500/50 text-purple-300 shadow-inner flex items-center justify-center">
              <Server size={26} className="animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>MCP Server Registry</span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>FLEET ACTIVE • v4.0.0</span>
                  </span>
                </h1>
              </div>
              <p className="text-xs text-gray-400 font-sans mt-0.5 max-w-2xl">
                Unified Model Context Protocol registry displaying connection status, real-time round-trip latency, and searchable tool capabilities across all connected Arthurian agent nodes.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerateAuditLog}
              className="px-3 py-1.5 rounded-xl bg-[#0F1322] hover:bg-[#1A2038] border border-[#2B3550] hover:border-emerald-500/60 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Generate Audit Log (JSON)"
            >
              <FileText size={13} />
              <span>Audit Log</span>
            </button>

            <button
              onClick={handlePingAll}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-xl bg-[#0F1322] hover:bg-[#1A2038] border border-[#2B3550] hover:border-cyan-500/60 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              title="Ping all active servers"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Ping Fleet</span>
            </button>

            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#0F1322] hover:bg-[#1A2038] border border-[#2B3550] hover:border-purple-500/60 text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Export client configurations for Claude Desktop, Cursor, and Windsurf"
            >
              <Download size={13} />
              <span>Export MCP Config</span>
            </button>

            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.4)] cursor-pointer"
            >
              <Plus size={14} />
              <span>Register Server</span>
            </button>
          </div>
        </div>

        {/* High-Density Summary KPI Row */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-4 border-t border-[#1C2038]">
          <div className="p-2.5 rounded-xl bg-[#080912]/90 border border-[#1E2338]">
            <div className="text-[10px] text-gray-400 font-sans flex items-center gap-1">
              <Server size={11} className="text-purple-400" />
              <span>Connected Servers</span>
            </div>
            <div className="text-base font-black text-white mt-1 flex items-baseline gap-1.5">
              <span>{summary?.onlineServers ?? servers.filter(s => s.status === 'ONLINE_CONNECTED').length}</span>
              <span className="text-[10px] text-gray-500">/ {servers.length}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#080912]/90 border border-[#1E2338]">
            <div className="text-[10px] text-gray-400 font-sans flex items-center gap-1">
              <Zap size={11} className="text-cyan-400" />
              <span>Tool Capabilities</span>
            </div>
            <div className="text-base font-black text-cyan-300 mt-1">
              {summary?.totalToolCapabilities ?? servers.reduce((acc, s) => acc + s.tools.length, 0)}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#080912]/90 border border-[#1E2338] relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <div className="text-[10px] text-gray-400 font-sans flex items-center gap-1">
                <Clock size={11} className="text-emerald-400" />
                <span>Fleet Avg Latency</span>
              </div>
              <div className="text-base font-black text-emerald-300 mt-1 flex items-baseline gap-1">
                <span>{summary?.avgGlobalLatencyMs ?? (servers.length ? (servers.reduce((a, s) => a + s.latencyMs, 0) / servers.length).toFixed(1) : '0')}</span>
                <span className="text-[10px] text-emerald-500 font-normal">ms</span>
              </div>
            </div>
            {/* Microchart - Area */}
            <div className="absolute bottom-0 left-0 right-0 h-10 opacity-40 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={LATENCY_HISTORY}>
                  <YAxis domain={['auto', 'auto']} hide />
                  <Area type="monotone" dataKey="val" stroke="#10B981" fill="#10B981" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#080912]/90 border border-[#1E2338] relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <div className="text-[10px] text-gray-400 font-sans flex items-center gap-1">
                <Activity size={11} className="text-amber-400" />
                <span>Total Invocations</span>
              </div>
              <div className="text-base font-black text-amber-300 mt-1">
                {(summary?.totalInvocations ?? servers.reduce((a, s) => a + s.totalInvocations, 0)).toLocaleString()}
              </div>
            </div>
            {/* Microchart - Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-8 opacity-30 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={INVOCATION_HISTORY} barCategoryGap={1}>
                  <Bar dataKey="val" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#080912]/90 border border-[#1E2338]">
            <div className="text-[10px] text-gray-400 font-sans flex items-center gap-1">
              <Database size={11} className="text-teal-400" />
              <span>Resource Vaults</span>
            </div>
            <div className="text-base font-black text-teal-300 mt-1">
              {servers.reduce((a, s) => a + s.resourceCount, 0)}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#080912]/90 border border-[#1E2338]">
            <div className="text-[10px] text-gray-400 font-sans flex items-center gap-1">
              <Sparkles size={11} className="text-pink-400" />
              <span>Prompt Templates</span>
            </div>
            <div className="text-base font-black text-pink-300 mt-1">
              {servers.reduce((a, s) => a + s.promptCount, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH, FILTER & VIEW CONTROLS */}
      <div className="bg-[#0A0C16] border border-[#1B1F32] rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Universal Search Input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search connected MCP servers, tool capabilities, handlers, or transports (e.g. 'crucible', 'forge_grill', 'sse')..."
              className="w-full pl-9 pr-8 py-2 bg-[#06070D] border border-[#23273D] focus:border-cyan-500/70 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#06070D] p-1 rounded-xl border border-[#20253A] self-start md:self-auto">
            <button
              onClick={() => setViewMode('GRID')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid size={13} />
              <span className="hidden sm:inline">Grid Cards</span>
            </button>

            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Dense Table Matrix View"
            >
              <List size={13} />
              <span className="hidden sm:inline">Dense Table</span>
            </button>

            <button
              onClick={() => setViewMode('CAPABILITY_MATRIX')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'CAPABILITY_MATRIX'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Tool Capability Directory"
            >
              <Zap size={13} />
              <span className="hidden sm:inline">All Capabilities ({allToolCapabilities.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#161928] text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-gray-500 mr-1 flex items-center gap-1">
              <Filter size={11} /> Status:
            </span>
            {(['ALL', 'ONLINE_CONNECTED', 'SYNCING', 'STANDBY', 'DISCONNECTED'] as StatusFilter[]).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-[#0E101D] text-gray-400 hover:text-gray-200 border border-[#1A1E30]'
                }`}
              >
                {st === 'ONLINE_CONNECTED' ? 'ONLINE' : st}
              </button>
            ))}
          </div>

          {/* Transport Filter */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[11px] text-gray-500 mr-1">Transport:</span>
            <select
              value={transportFilter}
              onChange={e => setTransportFilter(e.target.value as TransportFilter)}
              className="bg-[#0E101D] border border-[#1A1E30] text-gray-300 text-[11px] rounded-lg px-2 py-0.5 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Transports</option>
              <option value="SSE_EVENT_STREAM">SSE Stream</option>
              <option value="HTTP_JSON_RPC">HTTP JSON-RPC</option>
              <option value="STDIO_BIFROST">Stdio Bifrost</option>
              <option value="WASM_FFI">WASM FFI</option>
              <option value="ETHERCAT_OPC_UA">EtherCAT / OPC-UA</option>
              <option value="WSS_SOCKET">WebSocket</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-gray-500 mr-1">Category:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as CategoryFilter)}
              className="bg-[#0E101D] border border-[#1A1E30] text-gray-300 text-[11px] rounded-lg px-2 py-0.5 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Categories</option>
              <option value="ROUTING">Routing</option>
              <option value="SPECIFICATION">Specification</option>
              <option value="CRUCIBLE">Crucible SRE</option>
              <option value="SYNTHESIS">Synthesis</option>
              <option value="WORKSPACE">Workspace</option>
              <option value="COGNITION">Cognition</option>
              <option value="HARDWARE">Hardware</option>
              <option value="KNOWLEDGE">Knowledge</option>
              <option value="MULTIMODAL">Multimodal</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2.5 PINNED SOVEREIGN TOOLS DASHBOARD BAR */}
      {pinnedToolsList.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#141026] via-[#0E1020] to-[#0A0D1A] border border-amber-500/40 shadow-lg space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-500/50 flex items-center justify-center">
                <Pin size={12} className="fill-amber-400 text-amber-300" />
              </span>
              <span className="text-xs font-black text-amber-200 uppercase tracking-wider font-mono">
                Pinned Sovereign Tools ({pinnedToolsList.length})
              </span>
              <span className="text-[10px] text-gray-400 font-sans hidden md:inline">
                — Right-click any tool or click menu icon to manage pins & capability proofs
              </span>
            </div>
            <button
              onClick={() => {
                setPinnedToolKeys([]);
                try {
                  localStorage.removeItem('arthurian_pinned_mcp_tools');
                } catch (_) {}
                showToast({
                  id: `toast_${Date.now()}`,
                  title: 'Cleared Pinned Tools',
                  description: 'All tools unpinned from Dashboard quick access',
                  type: 'INFO'
                });
              }}
              className="text-[10px] text-gray-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <PinOff size={10} />
              <span>Unpin All</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {pinnedToolsList.map(({ tool, server, key }) => {
              const catStyle = CATEGORY_COLORS[tool.category] || CATEGORY_COLORS.CUSTOM;
              return (
                <div
                  key={key}
                  onContextMenu={e => handleOpenContextMenu(e, tool, server)}
                  className="group flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl bg-[#090A14] hover:bg-[#121526] border border-[#262B44] hover:border-amber-500/60 transition-all shadow-sm"
                >
                  <button
                    onClick={() => handleOpenToolInspector(tool, server)}
                    className="flex items-center gap-1.5 text-left cursor-pointer"
                    title={`Click to test run ${tool.name}`}
                  >
                    <Zap size={11} className="text-amber-400" />
                    <code className="text-[11px] font-bold text-amber-300 group-hover:text-amber-100">
                      {tool.name}
                    </code>
                    <span className="text-[9px] text-gray-400 font-mono hidden lg:inline">
                      ({server.displayName})
                    </span>
                  </button>

                  <div className="flex items-center gap-1 border-l border-[#1F253C] pl-1.5">
                    <button
                      onClick={e => handleExportProof(tool, server, e)}
                      className="p-1 rounded-lg text-gray-400 hover:text-cyan-300 hover:bg-[#1A2035] transition-colors cursor-pointer"
                      title="Export capability proof certificate"
                    >
                      <FileCheck size={11} />
                    </button>
                    <button
                      onClick={e => handleOpenContextMenu(e, tool, server)}
                      className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A2035] transition-colors cursor-pointer"
                      title="Quick Action context menu"
                    >
                      <MoreVertical size={11} />
                    </button>
                    <button
                      onClick={e => handleTogglePin(tool.name, server.id, e)}
                      className="p-1 rounded-lg text-amber-400 hover:text-rose-400 hover:bg-[#1A2035] transition-colors cursor-pointer"
                      title="Unpin tool"
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MAIN DASHBOARD CONTENT (SWITCHABLE VIEWS) */}
      {isLoading ? (
        <div className="p-12 text-center bg-[#090A14] border border-[#1B1E30] rounded-2xl space-y-3">
          <RefreshCw size={28} className="animate-spin text-purple-400 mx-auto" />
          <p className="text-xs text-gray-400">Synchronizing MCP Server Registry telemetry...</p>
        </div>
      ) : filteredServers.length === 0 ? (
        <div className="p-12 text-center bg-[#090A14] border border-[#1B1E30] rounded-2xl space-y-3">
          <AlertTriangle size={32} className="text-amber-400 mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase">No MCP Servers Found</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            No connected MCP servers match your current search query or filter criteria. Try clearing the filter or registering a new server.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setTransportFilter('ALL');
              setCategoryFilter('ALL');
            }}
            className="px-3 py-1.5 bg-[#141829] hover:bg-[#1E243D] border border-[#27304F] text-cyan-300 text-xs rounded-xl transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'GRID' ? (
        /* ==================== VIEW 1: GRID CARDS ==================== */
        <div className="grid grid-cols-1 gap-4">
          {filteredServers.map(server => {
            const isExpanded = !!expandedServers[server.id];
            const transportMeta = TRANSPORT_LABELS[server.transport] || {
              label: server.transport,
              icon: Globe,
              color: 'text-gray-400 border-gray-600 bg-gray-900'
            };
            const TransportIcon = transportMeta.icon;
            const isPinging = !!pingingMap[server.id];

            return (
              <div
                key={server.id}
                className={`rounded-2xl border transition-all duration-300 bg-[#090A15] shadow-xl overflow-hidden ${
                  server.status === 'ONLINE_CONNECTED'
                    ? 'border-[#222740] hover:border-purple-500/50'
                    : 'border-rose-900/40 opacity-80'
                }`}
              >
                {/* Card Header Top */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#171B2D] bg-gradient-to-r from-[#0C0E1C] to-[#090A14]">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#121626] border border-[#242C44] text-purple-300 flex items-center justify-center">
                      <Server size={20} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                          <span>{server.displayName}</span>
                        </h3>
                        <span className="text-[10px] text-gray-400 font-mono px-2 py-0.5 rounded bg-[#131627] border border-[#232940]">
                          {server.name} • {server.version}
                        </span>
                        {server.isCustom && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-600/40 font-bold">
                            CUSTOM
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-sans mt-0.5 line-clamp-2">{server.description}</p>
                    </div>
                  </div>

                  {/* Status, Latency & Quick Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                    {/* Status Pill */}
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 border ${
                        server.status === 'ONLINE_CONNECTED'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                          : server.status === 'SYNCING'
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                          : server.status === 'STANDBY'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                          : 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          server.status === 'ONLINE_CONNECTED'
                            ? 'bg-emerald-400 animate-ping'
                            : 'bg-rose-400'
                        }`}
                      />
                      <span>{server.status}</span>
                    </span>

                    {/* Latency badge with Ping button */}
                    <button
                      onClick={e => handlePing(server.id, e)}
                      disabled={isPinging}
                      className="px-2.5 py-1 rounded-full bg-[#111526] hover:bg-[#1C223A] border border-[#262E4A] hover:border-cyan-500/60 text-[10px] text-cyan-300 font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="Test live round-trip ping"
                    >
                      <Clock size={10} className={isPinging ? 'animate-spin text-cyan-400' : 'text-cyan-400'} />
                      <span>{server.latencyMs} ms</span>
                    </button>

                    {/* Transport pill */}
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border ${transportMeta.color}`}
                    >
                      <TransportIcon size={10} />
                      <span>{transportMeta.label}</span>
                    </span>

                    {/* Toggle Connection Button */}
                    <button
                      onClick={e => handleToggleConnection(server.id, e)}
                      className={`text-[10px] px-2.5 py-1 rounded-xl border font-bold transition-all cursor-pointer ${
                        server.status === 'ONLINE_CONNECTED'
                          ? 'bg-[#181320] hover:bg-rose-950/60 text-gray-300 hover:text-rose-300 border-[#2A2336] hover:border-rose-500/50'
                          : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/60'
                      }`}
                      title={server.status === 'ONLINE_CONNECTED' ? 'Disconnect server' : 'Connect server'}
                    >
                      {server.status === 'ONLINE_CONNECTED' ? 'Disconnect' : 'Connect'}
                    </button>

                    {/* Delete Custom Server */}
                    {server.isCustom && (
                      <button
                        onClick={e => handleDeleteServer(server.id, e)}
                        className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 hover:text-rose-100 transition-all cursor-pointer"
                        title="Remove custom server"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}

                    {/* Expand/Collapse Accordion */}
                    <button
                      onClick={() => toggleExpand(server.id)}
                      className="p-1.5 rounded-xl bg-[#121626] hover:bg-[#1A2038] border border-[#242C44] text-gray-300 hover:text-white transition-all cursor-pointer"
                      title={isExpanded ? 'Collapse server details' : 'Expand server details'}
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* Sub-Header Metadata Strip */}
                <div className="px-4 sm:px-5 py-2.5 bg-[#070810] border-b border-[#141728] flex flex-wrap items-center justify-between gap-3 text-[11px]">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Globe size={11} className="text-cyan-400" />
                      <strong className="text-gray-200">Endpoint:</strong>
                      <code className="text-cyan-300 bg-[#0B0D18] px-1.5 py-0.5 rounded border border-[#1A2035]">
                        {server.endpointUrl}
                      </code>
                    </span>

                    <span className="text-gray-400 flex items-center gap-1">
                      <Shield size={11} className="text-purple-400" />
                      <strong className="text-gray-200">Security:</strong>
                      <span className="text-purple-300">{server.securityType}</span>
                    </span>

                    <span className="text-gray-400 flex items-center gap-1">
                      <Terminal size={11} className="text-emerald-400" />
                      <strong className="text-gray-200">Runtime:</strong>
                      <span className="text-gray-300">{server.hostRuntime}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-400">
                    <span>
                      Calls: <strong className="text-white">{server.totalInvocations}</strong>
                    </span>
                    <span>
                      Clients: <strong className="text-white">{server.connectedClientsCount}</strong>
                    </span>
                    <span>
                      Tools: <strong className="text-cyan-300">{server.tools.length}</strong>
                    </span>
                  </div>
                </div>

                {/* Expanded Section: Tool Capabilities Accordion */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="p-4 sm:p-5 space-y-3 bg-[#080914]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                          <Zap size={13} className="text-yellow-400" />
                          <span>Exposed Tool Capabilities ({server.tools.length})</span>
                        </h4>
                        <span className="text-[10px] text-gray-400">
                          Right-click any tool for Quick Actions (Pin, Export Proof, Copy RPC).
                        </span>
                      </div>

                      {/* Tool Grid within Server */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {server.tools.map(tool => {
                          const catStyle = CATEGORY_COLORS[tool.category] || CATEGORY_COLORS.CUSTOM;
                          const isPinned = pinnedToolKeys.includes(`${server.id}::${tool.name}`);

                          return (
                            <div
                              key={tool.name}
                              onContextMenu={e => handleOpenContextMenu(e, tool, server)}
                              onClick={() => handleOpenToolInspector(tool, server)}
                              className={`group p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 relative shadow-sm ${
                                isPinned
                                  ? 'bg-[#0E1020] border-amber-500/50 hover:border-amber-400'
                                  : 'bg-[#0C0E1A] hover:bg-[#121526] border-[#1E2338] hover:border-cyan-500/60'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  {isPinned && (
                                    <div title="Pinned to Dashboard" className="shrink-0 flex items-center">
                                      <Pin
                                        size={11}
                                        className="fill-amber-400 text-amber-300"
                                      />
                                    </div>
                                  )}
                                  <code className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200 truncate">
                                    {tool.name}
                                  </code>
                                  {tool.isStreaming && (
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-600/40 shrink-0">
                                      STREAM
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${catStyle.bg} ${catStyle.border} ${catStyle.text}`}
                                  >
                                    {tool.category}
                                  </span>

                                  {/* Quick Action Button */}
                                  <button
                                    onClick={e => handleOpenContextMenu(e, tool, server)}
                                    className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#181C30] transition-colors cursor-pointer"
                                    title="Quick Action context menu"
                                  >
                                    <MoreVertical size={12} />
                                  </button>
                                </div>
                              </div>

                              <p className="text-[11px] text-gray-400 font-sans line-clamp-2 leading-relaxed">
                                {tool.description}
                              </p>

                              <div className="flex items-center justify-between pt-1 border-t border-[#171B2D] text-[10px] text-gray-400">
                                <span className="truncate max-w-[120px]" title={tool.handler}>
                                  👤 {tool.handler}
                                </span>

                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                  <button
                                    onClick={e => handleExportProof(tool, server, e)}
                                    className="text-gray-400 hover:text-cyan-300 transition-colors flex items-center gap-0.5"
                                    title="Export capability proof"
                                  >
                                    <FileCheck size={11} />
                                    <span className="text-[9px] hidden sm:inline">Proof</span>
                                  </button>

                                  <button
                                    onClick={e => handleTogglePin(tool.name, server.id, e)}
                                    className={`transition-colors flex items-center gap-0.5 ${
                                      isPinned ? 'text-amber-400' : 'text-gray-400 hover:text-amber-300'
                                    }`}
                                    title={isPinned ? 'Unpin tool' : 'Pin to Dashboard'}
                                  >
                                    <Pin size={10} className={isPinned ? 'fill-amber-400' : ''} />
                                    <span className="text-[9px] hidden sm:inline">{isPinned ? 'Pinned' : 'Pin'}</span>
                                  </button>

                                  <span
                                    onClick={() => handleOpenToolInspector(tool, server)}
                                    className="text-gray-400 group-hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer ml-1"
                                  >
                                    <span>Run</span>
                                    <ArrowUpRight size={11} />
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Server Tags */}
                      {server.tags && server.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#141728]">
                          <span className="text-[10px] text-gray-400 mr-1">Tags:</span>
                          {server.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-[9px] px-2 py-0.5 rounded-md bg-[#0F1220] border border-[#1D2338] text-gray-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'TABLE' ? (
        /* ==================== VIEW 2: DENSE TABLE ==================== */
        <div className="overflow-x-auto rounded-2xl border border-[#1D2136] bg-[#090A14] shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0D0F1E] border-b border-[#1D2136] text-gray-400 uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Server / Identity</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Transport</th>
                <th className="p-3.5">Endpoint</th>
                <th className="p-3.5">Latency</th>
                <th className="p-3.5">Tools</th>
                <th className="p-3.5">Calls</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151829]">
              {filteredServers.map(server => {
                const transportMeta = TRANSPORT_LABELS[server.transport] || {
                  label: server.transport,
                  icon: Globe,
                  color: 'text-gray-400'
                };
                const isPinging = !!pingingMap[server.id];

                return (
                  <tr key={server.id} className="hover:bg-[#0E1122] transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{server.displayName}</span>
                        {server.isCustom && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-600/40">
                            CUSTOM
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {server.name} • {server.version}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border inline-flex items-center gap-1 ${
                          server.status === 'ONLINE_CONNECTED'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                            : 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                        }`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${
                            server.status === 'ONLINE_CONNECTED' ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        <span>{server.status === 'ONLINE_CONNECTED' ? 'ONLINE' : server.status}</span>
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="text-[10px] text-purple-300 font-bold">{transportMeta.label}</span>
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-cyan-300">
                      <code>{server.endpointUrl}</code>
                    </td>

                    <td className="p-3.5">
                      <button
                        onClick={() => handlePing(server.id)}
                        disabled={isPinging}
                        className="text-[11px] text-cyan-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        title="Click to ping"
                      >
                        <Clock size={10} className={isPinging ? 'animate-spin' : ''} />
                        <span>{server.latencyMs} ms</span>
                      </button>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-[#131627] border border-[#21273E] text-cyan-300 font-bold text-[10px]">
                        {server.tools.length} Tools
                      </span>
                    </td>

                    <td className="p-3.5 text-gray-300 font-bold">{server.totalInvocations}</td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleExpand(server.id)}
                          className="px-2 py-1 bg-[#121526] hover:bg-[#1B2038] border border-[#232B44] text-gray-300 hover:text-white rounded-lg text-[10px] cursor-pointer"
                        >
                          View Tools
                        </button>
                        <button
                          onClick={() => handleToggleConnection(server.id)}
                          className="px-2 py-1 bg-[#121526] hover:bg-[#1B2038] border border-[#232B44] text-purple-300 hover:text-purple-200 rounded-lg text-[10px] cursor-pointer"
                        >
                          Toggle
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ==================== VIEW 3: CAPABILITY MATRIX DIRECTORY ==================== */
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-[#090A14] border border-[#1C2034] text-xs text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap size={14} className="text-yellow-400" />
              <span>
                Showing <strong>{allToolCapabilities.length}</strong> active tool capabilities across{' '}
                <strong>{filteredServers.length}</strong> connected MCP servers.
              </span>
            </span>
            <span className="text-[10px] text-gray-400 hidden sm:inline">
              Right-click or use 3-dots menu on any tool for Quick Actions (Pin, Proof, JSON-RPC, cURL).
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allToolCapabilities.map(({ tool, server }) => {
              const catStyle = CATEGORY_COLORS[tool.category] || CATEGORY_COLORS.CUSTOM;
              const isPinned = pinnedToolKeys.includes(`${server.id}::${tool.name}`);

              return (
                <div
                  key={`${server.id}-${tool.name}`}
                  onContextMenu={e => handleOpenContextMenu(e, tool, server)}
                  onClick={() => handleOpenToolInspector(tool, server)}
                  className={`group p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 shadow-lg relative ${
                    isPinned
                      ? 'bg-[#0D0F1F] border-amber-500/50 hover:border-amber-400'
                      : 'bg-[#090A15] hover:bg-[#101324] border-[#1E2338] hover:border-cyan-500/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {isPinned && (
                          <div title="Pinned tool" className="shrink-0 flex items-center">
                            <Pin size={11} className="fill-amber-400 text-amber-300" />
                          </div>
                        )}
                        <code className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200 truncate block">
                          {tool.name}
                        </code>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        via <strong className="text-gray-300">{server.displayName}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold border ${catStyle.bg} ${catStyle.border} ${catStyle.text}`}
                      >
                        {tool.category}
                      </span>
                      <button
                        onClick={e => handleOpenContextMenu(e, tool, server)}
                        className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#181C30] transition-colors cursor-pointer"
                        title="Quick Actions menu"
                      >
                        <MoreVertical size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 font-sans line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>

                  <div className="pt-2 border-t border-[#16192A] flex items-center justify-between text-[10px] text-gray-400">
                    <span className="truncate max-w-[130px]">👤 {tool.handler}</span>

                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => handleExportProof(tool, server, e)}
                        className="text-gray-400 hover:text-cyan-300 transition-colors flex items-center gap-0.5"
                        title="Export capability proof"
                      >
                        <FileCheck size={11} />
                        <span className="text-[9px] hidden sm:inline">Proof</span>
                      </button>

                      <button
                        onClick={e => handleTogglePin(tool.name, server.id, e)}
                        className={`transition-colors flex items-center gap-0.5 ${
                          isPinned ? 'text-amber-400' : 'text-gray-400 hover:text-amber-300'
                        }`}
                        title={isPinned ? 'Unpin from Dashboard' : 'Pin to Dashboard'}
                      >
                        <Pin size={10} className={isPinned ? 'fill-amber-400' : ''} />
                        <span className="text-[9px] hidden sm:inline">{isPinned ? 'Pinned' : 'Pin'}</span>
                      </button>

                      <span
                        onClick={() => handleOpenToolInspector(tool, server)}
                        className="text-cyan-400 font-bold group-hover:underline flex items-center gap-0.5 cursor-pointer ml-1"
                      >
                        <span>Run</span>
                        <Play size={10} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MODAL: TOOL CAPABILITY INSPECTOR & LIVE JSON-RPC RUNNER */}
      <AnimatePresence>
        {inspectingTool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-2xl bg-[#0A0C16] border-2 border-cyan-500/50 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#1E2338] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                      <span>{inspectingTool.tool.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/50">
                        {inspectingTool.tool.category}
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      Provided by <strong className="text-gray-200">{inspectingTool.server.displayName}</strong> (
                      {inspectingTool.server.endpointUrl})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectingTool(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white bg-[#121526] border border-[#22283E]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-gray-300 uppercase">Tool Description</div>
                <p className="text-xs text-gray-300 font-sans leading-relaxed bg-[#06070D] p-3 rounded-xl border border-[#1A1E30]">
                  {inspectingTool.tool.description}
                </p>
              </div>

              {/* Input Schema Parameters */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-300 uppercase">Input JSON Arguments</span>
                  <span className="text-[10px] text-gray-500">Edit JSON payload and click Run to test</span>
                </div>
                <textarea
                  rows={5}
                  value={toolArgsJson}
                  onChange={e => setToolArgsJson(e.target.value)}
                  className="w-full p-3 bg-[#06070D] border border-[#22273D] focus:border-cyan-500 rounded-xl font-mono text-xs text-cyan-300 focus:outline-none shadow-inner"
                />
              </div>

              {/* Execution Action Button */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => copyToClipboard(toolArgsJson, 'tool_args')}
                  className="px-3 py-1.5 rounded-xl bg-[#101324] hover:bg-[#1A2038] border border-[#222B42] text-xs text-gray-300 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'tool_args' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedKey === 'tool_args' ? 'Copied' : 'Copy Arguments'}</span>
                </button>

                <button
                  onClick={handleExecuteToolInModal}
                  disabled={isExecutingTool}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer disabled:opacity-50"
                >
                  <Play size={13} className={isExecutingTool ? 'animate-spin' : ''} />
                  <span>{isExecutingTool ? 'Executing JSON-RPC...' : 'Execute Tool Call'}</span>
                </button>
              </div>

              {/* Live JSON-RPC Result Output */}
              {toolExecutionResult && (
                <div className="space-y-1.5 pt-2 border-t border-[#1C2034]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                      <CheckCircle2 size={12} /> JSON-RPC 2.0 Response Result:
                    </span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(toolExecutionResult, null, 2), 'tool_res')}
                      className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      <Copy size={10} />
                      <span>{copiedKey === 'tool_res' ? 'Copied' : 'Copy Result'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-[#06070D] border border-[#1C2136] rounded-xl text-[11px] font-mono text-emerald-300 max-h-48 overflow-y-auto select-all">
                    {JSON.stringify(toolExecutionResult, null, 2)}
                  </pre>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MODAL: REGISTER NEW MCP SERVER */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl rounded-2xl bg-[#0A0C16] border-2 border-purple-500/50 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#1E2338] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-950 text-purple-300 border border-purple-500/50">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white uppercase">Register New MCP Server</h3>
                    <p className="text-xs text-gray-400">
                      Connect external Stdio, SSE, or HTTP JSON-RPC 2.0 Model Context Protocol endpoints.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white bg-[#121526] border border-[#22283E]"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateCustomServer} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Server Display Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Postgres DB MCP or GitHub Workflows Hub"
                    value={newServerForm.displayName}
                    onChange={e => setNewServerForm({ ...newServerForm, displayName: e.target.value })}
                    className="w-full p-2.5 bg-[#06070D] border border-[#23283E] rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-bold mb-1">Transport Protocol *</label>
                    <select
                      value={newServerForm.transport}
                      onChange={e => setNewServerForm({ ...newServerForm, transport: e.target.value as any })}
                      className="w-full p-2.5 bg-[#06070D] border border-[#23283E] rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="SSE_EVENT_STREAM">Server-Sent Events (SSE)</option>
                      <option value="HTTP_JSON_RPC">HTTP JSON-RPC 2.0</option>
                      <option value="STDIO_BIFROST">Stdio Subprocess</option>
                      <option value="WSS_SOCKET">WebSocket (WSS)</option>
                      <option value="WASM_FFI">WASM Host FFI</option>
                      <option value="ETHERCAT_OPC_UA">EtherCAT / OPC-UA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-bold mb-1">Security Model</label>
                    <select
                      value={newServerForm.securityType}
                      onChange={e => setNewServerForm({ ...newServerForm, securityType: e.target.value as any })}
                      className="w-full p-2.5 bg-[#06070D] border border-[#23283E] rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="SENTINEL_LEASE">Sentinel Zero-Trust Lease</option>
                      <option value="X25519_ECC">X25519 ECC Cryptographic</option>
                      <option value="ZERO_TRUST_OAUTH">OAuth 2.0 / Client GSI</option>
                      <option value="MUTUAL_TLS">Mutual TLS</option>
                      <option value="NONE">None / Localhost</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Endpoint URL / Stdio Command *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. http://localhost:8080/mcp or /api/custom/mcp"
                    value={newServerForm.endpointUrl}
                    onChange={e => setNewServerForm({ ...newServerForm, endpointUrl: e.target.value })}
                    className="w-full p-2.5 bg-[#06070D] border border-[#23283E] rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the server role..."
                    value={newServerForm.description}
                    onChange={e => setNewServerForm({ ...newServerForm, description: e.target.value })}
                    className="w-full p-2.5 bg-[#06070D] border border-[#23283E] rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="border-t border-[#1C2034] pt-3 space-y-2">
                  <div className="text-[11px] font-bold text-cyan-300 uppercase">Initial Tool Capability (Optional)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Tool Name (e.g. db_query)"
                      value={newServerForm.toolName}
                      onChange={e => setNewServerForm({ ...newServerForm, toolName: e.target.value })}
                      className="p-2 bg-[#06070D] border border-[#23283E] rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                    <select
                      value={newServerForm.toolCategory}
                      onChange={e => setNewServerForm({ ...newServerForm, toolCategory: e.target.value })}
                      className="p-2 bg-[#06070D] border border-[#23283E] rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="CUSTOM">Category: CUSTOM</option>
                      <option value="ROUTING">Category: ROUTING</option>
                      <option value="CRUCIBLE">Category: CRUCIBLE</option>
                      <option value="WORKSPACE">Category: WORKSPACE</option>
                      <option value="KNOWLEDGE">Category: KNOWLEDGE</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1C2034]">
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="px-3.5 py-1.5 bg-[#121526] hover:bg-[#1C2038] border border-[#22283E] text-gray-300 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-[0_0_12px_rgba(139,92,246,0.4)] cursor-pointer"
                  >
                    Register & Ping
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. MODAL: EXPORT MCP CLIENT CONFIGS */}
      <AnimatePresence>
        {isConfigModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-2xl bg-[#0A0C16] border-2 border-purple-500/50 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#1E2338] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-950 text-purple-300 border border-purple-500/50">
                    <DownloadIcon size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white uppercase">Export MCP Client Configs</h3>
                    <p className="text-xs text-gray-400">
                      Copy and paste configurations into Claude Desktop, Cursor, or Windsurf.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white bg-[#121526] border border-[#22283E]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Target Selector Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-[#181C2E] pb-2">
                {[
                  { id: 'CLAUDE', label: 'Claude Desktop' },
                  { id: 'CURSOR', label: 'Cursor IDE' },
                  { id: 'WINDSURF', label: 'Windsurf' },
                  { id: 'STDIO', label: 'CLI Inspector' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedConfigTarget(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedConfigTarget === tab.id
                        ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                        : 'bg-[#121526] text-gray-400 hover:text-white border border-[#20263C]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-400">Configuration JSON / Command:</span>
                  <button
                    onClick={() => copyToClipboard(getGeneratedClientConfig(selectedConfigTarget), 'client_config')}
                    className="text-xs text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1"
                  >
                    {copiedKey === 'client_config' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedKey === 'client_config' ? 'Copied to Clipboard!' : 'Copy Config'}</span>
                  </button>
                </div>

                <pre className="p-3.5 bg-[#06070D] border border-[#1E2338] rounded-xl text-xs font-mono text-cyan-300 max-h-64 overflow-y-auto select-all">
                  {getGeneratedClientConfig(selectedConfigTarget)}
                </pre>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DownloadIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
