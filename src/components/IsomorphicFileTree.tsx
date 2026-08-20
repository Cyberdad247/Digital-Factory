import React, { useState, useEffect } from 'react';
import { FolderTree, CheckCircle2, AlertTriangle, Wrench, RefreshCw, ShieldAlert, FileText, Folder, Check } from 'lucide-react';
import { IsomorphicFileTreeResult } from '../types';

interface IsomorphicFileTreeProps {
  onNotify: (message: string, type: 'success' | 'warning') => void;
}

export function IsomorphicFileTree({ onNotify }: IsomorphicFileTreeProps) {
  const [audit, setAudit] = useState<IsomorphicFileTreeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [repairLog, setRepairLog] = useState<string[]>([]);

  const runAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mcp/filetree-audit');
      const data: IsomorphicFileTreeResult = await res.json();
      setAudit(data);
    } catch (err) {
      console.error(err);
      onNotify('Failed to audit isomorphic filetree', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, []);

  const handleAutoRepair = async () => {
    setRepairing(true);
    try {
      const res = await fetch('/api/mcp/filetree-repair', { method: 'POST' });
      const data = await res.json();
      setRepairLog(data.details || []);
      onNotify(`Self-Healing Complete: ${data.repairedCount} nodes materialized`, 'success');
      runAudit();
    } catch (err) {
      console.error(err);
      onNotify('Auto-repair failed', 'warning');
    } finally {
      setRepairing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A35] pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <FolderTree size={16} className="text-[#D4AF37]" /> The Law of Isomorphic Structure
          </h3>
          <p className="text-xs text-gray-400">Lady Mnemosyne Sovereign Pre-Flight • 1:1 Edge-to-Cloudbrain Mirror</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runAudit}
            disabled={loading}
            className="bg-[#1C1C26] hover:bg-[#282836] text-gray-300 border border-[#2A2A35] text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-all"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Rescan Tree</span>
          </button>

          <button
            onClick={handleAutoRepair}
            disabled={repairing}
            className="bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B0B0E] font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-all shadow-sm"
          >
            {repairing ? <RefreshCw size={13} className="animate-spin" /> : <Wrench size={13} />}
            <span>Auto-Heal Missing Nodes</span>
          </button>
        </div>
      </div>

      {/* Audit Banner */}
      {audit && (
        <div className={`p-4 rounded-lg border space-y-2 ${
          audit.isomorphicIntegrityScore >= 80 
            ? 'bg-[#0E1712] border-green-700/60 text-green-300'
            : 'bg-[#1C140E] border-yellow-700/60 text-yellow-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
              {audit.isomorphicIntegrityScore >= 80 ? (
                <CheckCircle2 size={16} className="text-green-400" />
              ) : (
                <ShieldAlert size={16} className="text-yellow-400" />
              )}
              <span>Isomorphic Integrity: {audit.isomorphicIntegrityScore}%</span>
            </div>
            <div className="text-xs font-mono">
              <span className="text-white font-bold">{audit.synchronizedCount}</span> / {audit.totalNodesAudited} Synchronized Nodes
            </div>
          </div>
          <p className="text-[11px] text-gray-300 font-mono">
            {audit.remedyAction}
          </p>
        </div>
      )}

      {/* Tree Nodes List */}
      {audit && (
        <div className="bg-[#121217] border border-[#2A2A35] rounded-lg p-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center justify-between">
            <span>Canonical Master Tree Manifest (.agents, /skills, /memory)</span>
            <span className="text-[10px] text-gray-400 font-mono">Schema Hash: SHA256:CANONICAL_BLUEPRINT</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {audit.items.map((node, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between bg-[#171722] p-2.5 rounded border border-[#252532] text-xs font-mono"
              >
                <div className="flex items-center gap-2.5 truncate max-w-[340px]">
                  {node.type === 'directory' ? (
                    <Folder size={14} className="text-[#D4AF37] shrink-0" />
                  ) : (
                    <FileText size={14} className="text-blue-400 shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="text-white font-semibold">{node.path}</span>
                    <p className="text-[10px] text-gray-400 truncate">{node.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-gray-500 hidden sm:inline">{node.vikingBlockId}</span>
                  {node.localEdgeStatus === 'SYNCHRONIZED_1_TO_1' ? (
                    <span className="text-[10px] bg-[#16291C] text-green-400 px-2 py-0.5 rounded border border-green-800/40 flex items-center gap-1">
                      <Check size={11} /> 1:1 Parity
                    </span>
                  ) : (
                    <span className="text-[10px] bg-[#2E1B15] text-amber-400 px-2 py-0.5 rounded border border-amber-800/40 flex items-center gap-1">
                      <AlertTriangle size={11} /> Missing At Edge
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Repair Logs */}
      {repairLog.length > 0 && (
        <div className="bg-[#0B0B0F] border border-[#2A2A35] rounded-lg p-3 space-y-1.5 font-mono text-[11px]">
          <div className="text-xs font-bold text-[#D4AF37]">Lady Mnemosyne Auto-Materialization Log:</div>
          {repairLog.map((log, i) => (
            <div key={i} className="text-emerald-400">⚡ {log}</div>
          ))}
        </div>
      )}
    </div>
  );
}
