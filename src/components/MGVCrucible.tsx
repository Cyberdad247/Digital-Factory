import React, { useState } from 'react';
import { ShieldCheck, Flame, Play, AlertOctagon, CheckCircle2, RotateCcw, Activity, ArrowRight } from 'lucide-react';
import { MGVAuditResult } from '../types';

interface MGVCrucibleProps {
  onNotify: (message: string, type: 'success' | 'warning') => void;
}

export function MGVCrucible({ onNotify }: MGVCrucibleProps) {
  const [testQuery, setTestQuery] = useState('Audit Isomorphic FileTree Law and Zero-Hallucination Mandate');
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<MGVAuditResult | null>(null);
  const [auditHistory, setAuditHistory] = useState<MGVAuditResult[]>([]);

  const handleRunAudit = async (forcedQuery?: string) => {
    const q = forcedQuery || testQuery;
    if (!q) return;
    setLoading(true);
    try {
      const res = await fetch('/api/mcp/mgv-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testQuery: q })
      });
      const data: MGVAuditResult = await res.json();
      setAuditResult(data);
      setAuditHistory(prev => [data, ...prev].slice(0, 10));

      if (data.status === 'VERIFIED') {
        onNotify(`Crucible Verified: Rigor Score ${data.citationRigorScore}%`, 'success');
      } else {
        onNotify(`//REZERO Triggered: Citation threshold violation`, 'warning');
      }
    } catch (err) {
      console.error(err);
      onNotify('MGV Crucible test execution failed', 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A35] pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Flame size={16} className="text-[#D4AF37]" /> Sir Gideon's MGV Crucible Gate
          </h3>
          <p className="text-xs text-gray-400">Monitor-Generate-Verify Engine • Alexandrian Crucible Citation Rigor • //REZERO Fail-Safe</p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="bg-[#1C1C26] px-2.5 py-1 rounded border border-[#2A2A35] text-gray-300">
            Crucible Threshold: <strong className="text-[#D4AF37]">≥ 85% Rigor</strong>
          </span>
        </div>
      </div>

      {/* Test Controls */}
      <div className="bg-[#121217] border border-[#2A2A35] rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={e => setTestQuery(e.target.value)}
            placeholder="Enter test query for adversarial citation verification..."
            className="flex-1 bg-[#181822] border border-[#2A2A35] focus:border-[#D4AF37] text-white text-xs px-3 py-2 rounded focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleRunAudit()}
              disabled={loading}
              className="bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-50 text-[#0B0B0E] font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 transition-all shadow-sm"
            >
              {loading ? <Activity size={14} className="animate-spin" /> : <Play size={14} />}
              <span>Execute Crucible Audit</span>
            </button>
            <button
              onClick={() => handleRunAudit('Trigger Unverified Hallucination Speculation [TEST]')}
              disabled={loading}
              className="bg-[#24171A] hover:bg-[#331C20] text-red-400 border border-red-800/40 text-xs px-3 py-2 rounded flex items-center gap-1 transition-all"
              title="Simulates a zero-citation hallucination request to test //REZERO fail-safe"
            >
              <AlertOctagon size={13} />
              <span>Simulate ReZero</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 flex items-center gap-2">
          <ShieldCheck size={13} className="text-green-400" />
          <span>If citations are missing or score drops below 85%, the system automatically executes <code>//REZERO</code> and halts kinetic code execution.</span>
        </div>
      </div>

      {/* Active Audit Result */}
      {auditResult && (
        <div className={`p-4 rounded-lg border space-y-3 transition-all ${
          auditResult.status === 'VERIFIED'
            ? 'bg-[#0E1712] border-green-700/60 text-green-300'
            : 'bg-[#1C0E10] border-red-700/60 text-red-300'
        }`}>
          <div className="flex items-center justify-between border-b border-current/20 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              {auditResult.status === 'VERIFIED' ? (
                <CheckCircle2 size={16} className="text-green-400" />
              ) : (
                <RotateCcw size={16} className="text-red-400 animate-spin" />
              )}
              Audit Status: {auditResult.status}
            </span>
            <span className="text-xs font-mono">
              Rigor Score: <strong className="text-white text-sm">{auditResult.citationRigorScore}%</strong> ({auditResult.latencyMs}ms)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-black/30 p-2.5 rounded border border-current/20 space-y-1">
              <div className="text-[10px] uppercase font-bold text-gray-400">Maker Output & Retrieval</div>
              <p className="text-[11px] font-mono line-clamp-3 text-gray-200">{auditResult.makerOutput}</p>
            </div>
            <div className="bg-black/30 p-2.5 rounded border border-current/20 space-y-1">
              <div className="text-[10px] uppercase font-bold text-gray-400">Checker Verdict (Watchdog)</div>
              <p className="text-[11px] font-mono text-gray-200">{auditResult.checkerVerdict}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono pt-1 border-t border-current/20 text-gray-300">
            <span>Action: {auditResult.actionTaken}</span>
            <span className="text-xs">{auditResult.crucibleProof}</span>
          </div>
        </div>
      )}

      {/* Audit History Log */}
      {auditHistory.length > 0 && (
        <div className="bg-[#121217] border border-[#2A2A35] rounded-lg p-3 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center justify-between">
            <span>Crucible Audit History</span>
            <span className="text-[10px] text-gray-400">{auditHistory.length} audits logged</span>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {auditHistory.map((item) => (
              <div key={item.auditId} className="flex items-center justify-between text-[11px] font-mono bg-[#181822] p-2 rounded border border-[#2A2A35]/60">
                <span className="flex items-center gap-2 truncate max-w-[280px]">
                  {item.status === 'VERIFIED' ? (
                    <span className="text-green-400 font-bold">[PASS]</span>
                  ) : (
                    <span className="text-red-400 font-bold">[REZERO]</span>
                  )}
                  <span className="text-gray-300 truncate">{item.testQuery}</span>
                </span>
                <span className="text-gray-400 flex items-center gap-2">
                  <span>Score: {item.citationRigorScore}%</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
