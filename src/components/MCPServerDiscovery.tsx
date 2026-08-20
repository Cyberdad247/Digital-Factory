import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Compass,
  Search,
  Database,
  Cloud,
  Github,
  Zap,
  Globe,
  Plus,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export interface MCPServerDiscoveryProps {
  onOpenSettings?: (tab?: string) => void;
}

const DISCOVERY_RECOMMENDATIONS = [
  {
    id: 'rec_sqlite',
    name: 'SQLite MCP Server',
    description: 'Official MCP server for direct interaction with local SQLite ledger databases. Allows natural language querying and schema exploration.',
    icon: Database,
    color: 'text-blue-400',
    bg: 'bg-blue-950/40',
    border: 'border-blue-500/40',
    command: 'npx -y @modelcontextprotocol/server-sqlite --db ./ledger.db',
    category: 'DATABASE',
    tags: ['Official', 'Local', 'SQL']
  },
  {
    id: 'rec_gdrive',
    name: 'Google Drive MCP Server',
    description: 'Access and manage Google Slides exports, Docs, and Drive files directly in your workspace. Requires Workspace OAuth setup.',
    icon: Cloud,
    color: 'text-amber-400',
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/40',
    command: 'npx -y @modelcontextprotocol/server-gdrive',
    category: 'WORKSPACE',
    tags: ['Google', 'Files', 'OAuth']
  },
  {
    id: 'rec_github',
    name: 'GitHub MCP Server',
    description: 'Manage your React + Tailwind codebase, search repositories, create pull requests, and analyze issues using the GitHub API.',
    icon: Github,
    color: 'text-purple-400',
    bg: 'bg-purple-950/40',
    border: 'border-purple-500/40',
    command: 'npx -y @modelcontextprotocol/server-github',
    category: 'VCS',
    tags: ['Code', 'PR', 'Official']
  },
  {
    id: 'rec_puppeteer',
    name: 'Puppeteer/Browser MCP',
    description: 'Automate E2E testing of your WASM micro-frontends and capture screenshots directly through an integrated Chromium headless browser.',
    icon: Globe,
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/40',
    command: 'npx -y @modelcontextprotocol/server-puppeteer',
    category: 'TESTING',
    tags: ['E2E', 'Browser', 'Automation']
  },
  {
    id: 'rec_brave',
    name: 'Brave Search MCP',
    description: 'Provide your agent with real-time web search capabilities for foraging market data and competitive intelligence.',
    icon: Zap,
    color: 'text-rose-400',
    bg: 'bg-rose-950/40',
    border: 'border-rose-500/40',
    command: 'npx -y @modelcontextprotocol/server-brave-search',
    category: 'SEARCH',
    tags: ['Web', 'Live Data']
  }
];

export function MCPServerDiscovery({ onOpenSettings }: MCPServerDiscoveryProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 2500);
  };

  const filteredRecs = DISCOVERY_RECOMMENDATIONS.filter(rec =>
    rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-5 font-mono text-gray-200">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B0F18] via-[#091410] to-[#0A1A17] border-2 border-[#10B981]/40 p-5 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-inner flex items-center justify-center">
              <Compass size={26} className={isScanning ? "animate-spin" : ""} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>MCP Discovery</span>
                {hasScanned && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-bold">
                    SCAN COMPLETE
                  </span>
                )}
              </h1>
              <p className="text-xs text-gray-400 font-sans mt-0.5 max-w-xl">
                Analyze your current project workflow, tech stack, and agent patterns to discover officially supported and community-driven Model Context Protocol (MCP) servers that can expand Arthurian capabilities.
              </p>
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
              isScanning
                ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/50'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}
          >
            {isScanning ? (
              <>
                <Search size={14} className="animate-spin" />
                <span>ANALYZING WORKFLOW...</span>
              </>
            ) : (
              <>
                <Search size={14} />
                <span>RUN DISCOVERY SCAN</span>
              </>
            )}
          </button>
        </div>
      </div>

      {!hasScanned && !isScanning && (
        <div className="p-12 text-center bg-[#07090E] border border-[#141C1A] rounded-2xl">
          <Compass size={48} className="mx-auto text-emerald-900 mb-4" />
          <h3 className="text-lg font-black text-emerald-400 uppercase tracking-widest mb-2">Awaiting Context Scan</h3>
          <p className="text-sm text-gray-500 font-sans max-w-md mx-auto">
            Click the scan button above to analyze your Arthurian Agent's telemetry and current project state. The system will recommend tailored MCP servers to integrate into your fleet.
          </p>
        </div>
      )}

      {isScanning && (
        <div className="p-12 text-center bg-[#07090E] border border-[#141C1A] rounded-2xl">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="inline-block mb-4"
          >
            <Compass size={48} className="text-emerald-500" />
          </motion.div>
          <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2 animate-pulse">Running Semantic Search</h3>
          <p className="text-sm text-gray-400 font-sans max-w-md mx-auto">
            Cross-referencing GitHub MCP registries, npm packages, and official Model Context Protocol repositories against your workspace patterns...
          </p>
        </div>
      )}

      {hasScanned && !isScanning && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-emerald-300 uppercase tracking-widest">
              Recommended Integrations
            </h2>
            <div className="relative w-64">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Filter recommendations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#090C12] border border-[#1C2622] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecs.map((rec, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                key={rec.id}
                className="p-4 rounded-xl bg-[#0B0D14] hover:bg-[#11141D] border border-[#1B232E] hover:border-emerald-500/50 transition-all flex flex-col h-full shadow-lg"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2.5 rounded-lg ${rec.bg} border ${rec.border} shrink-0`}>
                    <rec.icon size={20} className={rec.color} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">{rec.name}</h3>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-900 border border-gray-700 text-gray-400 font-bold uppercase">
                        {rec.category}
                      </span>
                      {rec.tags.map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/50 text-emerald-400/80 uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed flex-grow">
                  {rec.description}
                </p>

                <div className="mt-4 pt-3 border-t border-[#1C232A]">
                  <div className="text-[9px] text-gray-500 mb-1 font-bold uppercase tracking-wider">NPX Command</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 block overflow-x-auto text-[10px] bg-[#05060A] p-1.5 rounded border border-[#141920] text-emerald-300 custom-scroll whitespace-nowrap">
                      {rec.command}
                    </code>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      className="flex-1 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                      onClick={() => {
                        if (onOpenSettings) onOpenSettings();
                      }}
                    >
                      <Plus size={11} />
                      Install via Settings
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredRecs.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-xs">
              No recommendations found matching "{searchQuery}".
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
