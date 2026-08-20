import React, { useState, useEffect } from 'react';
import { Network, Copy, Check, Terminal, Shield, Cpu, Code2, Wrench } from 'lucide-react';
import { MCPServerStatus } from '../types';

interface BifrostConfigProps {
  onNotify: (message: string, type: 'success' | 'warning') => void;
}

export function BifrostConfig({ onNotify }: BifrostConfigProps) {
  const [status, setStatus] = useState<MCPServerStatus | null>(null);
  const [configJson, setConfigJson] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/mcp/status')
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(console.error);

    fetch('/api/mcp/config')
      .then(res => res.json())
      .then(data => setConfigJson(JSON.stringify(data, null, 2)))
      .catch(console.error);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(configJson);
    setCopied(true);
    onNotify('mcp.json payload copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A35] pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Network size={16} className="text-[#D4AF37]" /> Bifrost Transport & MCP Swarm Registry
          </h3>
          <p className="text-xs text-gray-400">Model Context Protocol 2.0 • Stdio Tunnel • X25519 ECC Zero-Trust</p>
        </div>

        <button
          onClick={handleCopy}
          className="bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B0B0E] font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-all shadow-sm"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied to Clipboard' : 'Copy mcp.json Payload'}</span>
        </button>
      </div>

      {/* Telemetry Metrics Cards */}
      {status && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#121217] border border-[#2A2A35] p-3 rounded-lg">
            <div className="text-[10px] uppercase font-mono text-gray-400">Server Status</div>
            <div className="text-xs font-bold text-green-400 flex items-center gap-1.5 mt-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              {status.status}
            </div>
          </div>
          <div className="bg-[#121217] border border-[#2A2A35] p-3 rounded-lg">
            <div className="text-[10px] uppercase font-mono text-gray-400">Tunnel Protocol</div>
            <div className="text-xs font-bold text-white mt-1 font-mono">{status.protocol.split('_')[0]} JSON-RPC 2.0</div>
          </div>
          <div className="bg-[#121217] border border-[#2A2A35] p-3 rounded-lg">
            <div className="text-[10px] uppercase font-mono text-gray-400">Edge Compression</div>
            <div className="text-xs font-bold text-[#D4AF37] mt-1 font-mono">{status.bifrostSecurity.toonCompressionRatio}</div>
          </div>
          <div className="bg-[#121217] border border-[#2A2A35] p-3 rounded-lg">
            <div className="text-[10px] uppercase font-mono text-gray-400">Zero-Hallucination</div>
            <div className="text-xs font-bold text-emerald-400 mt-1 font-mono">{status.bifrostSecurity.zeroHallucinationPolicy}</div>
          </div>
        </div>
      )}

      {/* Registered MCP Tools Grid */}
      {status && (
        <div className="bg-[#121217] border border-[#2A2A35] rounded-lg p-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Wrench size={14} /> Registered MCP Tools ({status.tools.length})</span>
            <span className="text-[10px] text-gray-400">Exposed via stdio / SSE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {status.tools.map(tool => (
              <div key={tool.name} className="bg-[#181822] p-3 rounded border border-[#2A2A35] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                    <Terminal size={12} className="text-[#D4AF37]" /> {tool.name}
                  </span>
                  <span className="text-[9px] font-mono bg-[#20202E] text-amber-300 px-1.5 py-0.5 rounded">
                    {tool.thread.replace('THREAD_', '')}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-sans">{tool.description}</p>
                <div className="text-[10px] font-mono text-gray-500 pt-1 border-t border-[#252535] flex justify-between">
                  <span>Handler: {tool.handlerAgent}</span>
                  <span className="text-emerald-400">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Configuration Payload */}
      <div className="bg-[#121217] border border-[#2A2A35] rounded-lg p-4 space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Code2 size={14} className="text-[#D4AF37]" /> Root mcp.json / Claude Desktop Configuration</span>
          <span className="text-[10px] text-gray-400 font-mono">Location: ./mcp.json</span>
        </div>
        <pre className="p-3 bg-[#08080B] rounded border border-[#252535] text-xs font-mono text-gray-300 overflow-x-auto">
          {configJson || '// Loading mcp.json configuration payload...'}
        </pre>
      </div>
    </div>
  );
}
