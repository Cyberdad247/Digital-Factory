import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  ArrowDown, 
  Copy, 
  Check, 
  Shield, 
  Cpu, 
  Zap, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Scale, 
  Sparkles,
  Download,
  Flame,
  Volume2,
  Pin
} from 'lucide-react';
import { CouncilMessage, ArchmagePersona } from '../types';

interface ArchmageDeliberationLogViewerProps {
  messages: CouncilMessage[];
  topic: string;
  consensusPercentage: number;
  z3Verified: boolean;
  onAddPinnedInvariant?: (text: string) => void;
  onSimulateArchmageDeliberation?: (persona: ArchmagePersona) => void;
  onNotify?: (message: string, type?: 'success' | 'warning') => void;
  className?: string;
}

const ARCHMAGES_METADATA: Record<ArchmagePersona, { name: string; avatar: string; color: string; badgeBg: string; title: string }> = {
  MERLIN_OMEGA: { name: 'Merlin Ω', avatar: '🧙‍♂️', color: '#D4AF37', badgeBg: 'rgba(212, 175, 55, 0.15)', title: 'MFOE Orchestrator' },
  ANYA_OMEGA: { name: 'Anya Ω', avatar: '🎭', color: '#EC4899', badgeBg: 'rgba(236, 72, 153, 0.15)', title: 'Prompt Alchemist' },
  LADY_APIS: { name: 'Lady Apis', avatar: '🐝', color: '#06B6D4', badgeBg: 'rgba(6, 182, 212, 0.15)', title: 'Socratic Inquisitor' },
  SIR_GIDEON: { name: 'Sir Gideon', avatar: '🛡️', color: '#EF4444', badgeBg: 'rgba(239, 68, 68, 0.15)', title: 'SRE Warden' },
  FORMALIS_OMEGA: { name: 'Formalis Ω', avatar: '⚖️', color: '#8B5CF6', badgeBg: 'rgba(139, 92, 246, 0.15)', title: 'Z3 Theorem Prover' },
  SIR_CODEX: { name: 'Sir Codex', avatar: '📜', color: '#10B981', badgeBg: 'rgba(16, 185, 129, 0.15)', title: 'AST Code Synthesizer' },
  GEOMETRA_OMEGA: { name: 'Geometra Ω', avatar: '📐', color: '#F59E0B', badgeBg: 'rgba(245, 158, 11, 0.15)', title: 'Spatial UI Architect' },
  GRAPHAEL_OMEGA: { name: 'Graphael Ω', avatar: '🕸️', color: '#3B82F6', badgeBg: 'rgba(59, 130, 246, 0.15)', title: 'DAG Flow Optimizer' },
  SIR_CASTOR: { name: 'Sir Castor', avatar: '⚡', color: '#6366F1', badgeBg: 'rgba(99, 102, 241, 0.15)', title: 'Stdio / IPC Engine' },
};

export function ArchmageDeliberationLogViewer({
  messages,
  topic,
  consensusPercentage,
  z3Verified,
  onAddPinnedInvariant,
  onSimulateArchmageDeliberation,
  onNotify,
  className = ''
}: ArchmageDeliberationLogViewerProps) {
  const [selectedPersonaFilter, setSelectedPersonaFilter] = useState<ArchmagePersona | 'ALL'>('ALL');
  const [selectedArgumentTypeFilter, setSelectedArgumentTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [rawViewMode, setRawViewMode] = useState<'FORMATTED_FEED' | 'JSON_RPC' | 'RAW_STDIO'>('FORMATTED_FEED');
  
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new messages arrive if enabled
  useEffect(() => {
    if (isAutoScroll && !isPaused && logContainerRef.current) {
      logContainerRef.current.scrollTo({
        top: logContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isAutoScroll, isPaused]);

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    if (selectedPersonaFilter !== 'ALL' && msg.persona !== selectedPersonaFilter) {
      return false;
    }
    if (selectedArgumentTypeFilter !== 'ALL' && msg.argumentType !== selectedArgumentTypeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = msg.text.toLowerCase().includes(q);
      const matchName = msg.name.toLowerCase().includes(q);
      const matchZ3 = msg.z3Constraint?.toLowerCase().includes(q) || false;
      const matchType = msg.argumentType?.toLowerCase().includes(q) || false;
      if (!matchText && !matchName && !matchZ3 && !matchType) return false;
    }
    return true;
  });

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onNotify?.('📋 Copied deliberation log snippet to clipboard', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportFullLog = () => {
    const formatted = messages.map((m, idx) => {
      return `[#${idx + 1}] [${new Date(m.timestamp).toLocaleTimeString()}] ${m.name} (${m.avatar} ${m.title})\nType: ${m.argumentType || 'PROPOSAL'} | Tone: ${m.tone}\nText: ${m.text}\n${m.z3Constraint ? `Z3 Invariant: ${m.z3Constraint}\n` : ''}${m.suggestedAction ? `Action: ${m.suggestedAction}\n` : ''}\n----------------------------------------\n`;
    }).join('\n');

    const blob = new Blob([formatted], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archmage_council_deliberation_${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify?.('💾 Deliberation transcript exported as .log file!', 'success');
  };

  // Generate JSON-RPC representation of the discourse stream
  const jsonRpcLogs = messages.map((m, idx) => ({
    jsonrpc: '2.0',
    id: `rpc-delib-${idx + 1}`,
    method: 'camelot.council.streamDeliberation',
    params: {
      seq: idx + 1,
      archmageId: m.persona,
      name: m.name,
      avatar: m.avatar,
      role: m.role,
      argumentType: m.argumentType || 'PROPOSAL',
      tone: m.tone,
      z3Satisfied: z3Verified,
      deltaMemoryMib: 0.12,
      latencyMs: (Math.random() * 3 + 1.2).toFixed(2),
      invariantConstraint: m.z3Constraint || null,
      discoursePayload: m.text,
      timestamp: m.timestamp
    }
  }));

  return (
    <div className={`bg-[#0A0A14] border-2 border-[#1E1E34] rounded-2xl overflow-hidden shadow-2xl flex flex-col ${className}`}>
      {/* 🔮 TOP TELEMETRY BAR */}
      <div className="bg-[#0D0E1C] border-b border-gray-800/80 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] text-lg shadow-[0_0_12px_rgba(212,175,55,0.2)]">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 font-mono font-bold uppercase tracking-wider border border-purple-500/40">
                REAL-TIME LOG VIEWER
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>STREAM_LIVE</span>
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
              <span>Archmage Council Argument Telemetry</span>
              <span className="text-xs text-gray-400 font-normal hidden md:inline">({messages.length} discourse events)</span>
            </h3>
          </div>
        </div>

        {/* Real-time stats badges */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-[#06070E] border border-cyan-500/30 rounded-lg text-center">
            <span className="text-[9px] text-gray-400 block">CONSENSUS</span>
            <span className="text-xs font-mono font-bold text-cyan-400">{consensusPercentage}%</span>
          </div>

          <div className="px-2.5 py-1 bg-[#06070E] border border-purple-500/30 rounded-lg text-center">
            <span className="text-[9px] text-gray-400 block">Z3 SAT</span>
            <span className={`text-xs font-mono font-bold ${z3Verified ? 'text-emerald-400' : 'text-purple-300'}`}>
              {z3Verified ? 'PROVED' : 'ACTIVE'}
            </span>
          </div>

          <div className="px-2.5 py-1 bg-[#06070E] border border-amber-500/30 rounded-lg text-center">
            <span className="text-[9px] text-gray-400 block">MEM DELTA</span>
            <span className="text-xs font-mono font-bold text-amber-400">Δ ≤ 0.12 MiB</span>
          </div>

          <button
            onClick={handleExportFullLog}
            className="p-2 bg-[#121324] hover:bg-[#1A1B30] border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg transition-all cursor-pointer"
            title="Export full log transcript"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* 🎛️ CONTROLS & FILTERING RETICLE */}
      <div className="bg-[#080812] border-b border-gray-800/60 p-3 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#05050A] p-1 rounded-lg border border-gray-800 text-xs">
            <button
              onClick={() => setRawViewMode('FORMATTED_FEED')}
              className={`px-2.5 py-1 rounded font-bold transition-all ${
                rawViewMode === 'FORMATTED_FEED'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Formatted Discourse
            </button>
            <button
              onClick={() => setRawViewMode('JSON_RPC')}
              className={`px-2.5 py-1 rounded font-bold transition-all font-mono ${
                rawViewMode === 'JSON_RPC'
                  ? 'bg-purple-900 text-purple-200 shadow'
                  : 'text-gray-400 hover:text-purple-300'
              }`}
            >
              JSON-RPC 2.0
            </button>
            <button
              onClick={() => setRawViewMode('RAW_STDIO')}
              className={`px-2.5 py-1 rounded font-bold transition-all font-mono ${
                rawViewMode === 'RAW_STDIO'
                  ? 'bg-emerald-950 text-emerald-300 shadow'
                  : 'text-gray-400 hover:text-emerald-300'
              }`}
            >
              Raw Stdio
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-xs min-w-[160px]">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search argument or invariant..."
              className="w-full pl-7 pr-3 py-1.5 bg-[#0D0E1A] border border-gray-800 focus:border-cyan-400 rounded-lg text-xs text-white placeholder:text-gray-600 outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Stream Controls: Pause, Auto-scroll */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isPaused
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                  : 'bg-[#101122] border-gray-800 text-gray-300 hover:text-white'
              }`}
              title={isPaused ? 'Resume stream' : 'Pause stream'}
            >
              {isPaused ? <Play size={12} /> : <Pause size={12} />}
              <span>{isPaused ? 'Paused' : 'Live'}</span>
            </button>

            <button
              onClick={() => setIsAutoScroll(!isAutoScroll)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isAutoScroll
                  ? 'bg-blue-950/60 border-blue-500/50 text-blue-300'
                  : 'bg-[#101122] border-gray-800 text-gray-400'
              }`}
              title="Toggle auto-scroll to latest argument"
            >
              <ArrowDown size={12} className={isAutoScroll ? 'animate-bounce' : ''} />
              <span>Auto-Scroll</span>
            </button>
          </div>
        </div>

        {/* Agent Persona Quick-Filter Reticle */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase shrink-0">Filter Agent:</span>
          
          <button
            onClick={() => setSelectedPersonaFilter('ALL')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
              selectedPersonaFilter === 'ALL'
                ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black shadow'
                : 'bg-[#0E1020] text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            All Archmages ({messages.length})
          </button>

          {(Object.keys(ARCHMAGES_METADATA) as ArchmagePersona[]).map((personaId) => {
            const meta = ARCHMAGES_METADATA[personaId];
            const count = messages.filter(m => m.persona === personaId).length;
            const isSelected = selectedPersonaFilter === personaId;
            return (
              <button
                key={personaId}
                onClick={() => setSelectedPersonaFilter(personaId)}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'border shadow'
                    : 'bg-[#0E1020] text-gray-400 hover:text-white border border-gray-800'
                }`}
                style={isSelected ? { 
                  backgroundColor: meta.badgeBg, 
                  borderColor: meta.color, 
                  color: meta.color,
                  boxShadow: `0 0 10px ${meta.color}30`
                } : {}}
              >
                <span>{meta.avatar}</span>
                <span>{meta.name}</span>
                <span className="text-[9px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Argument Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase shrink-0">Category:</span>
          {[
            { id: 'ALL', label: 'All Categories' },
            { id: 'PROPOSAL', label: 'Proposals 💡' },
            { id: 'SOCRATIC_CHALLENGE', label: 'Socratic Challenges 🐝' },
            { id: 'Z3_ASSERTION', label: 'Z3 Invariants ⚖️' },
            { id: 'FAILURE_WARNING', label: 'SRE Warnings 🛡️' },
            { id: 'SYNTHESIS', label: 'Syntheses 🧙‍♂️' },
            { id: 'CONSENSUS_VOTE', label: 'Votes 🗳️' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedArgumentTypeFilter(cat.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all shrink-0 cursor-pointer ${
                selectedArgumentTypeFilter === cat.id
                  ? 'bg-gray-200 text-black font-bold'
                  : 'bg-[#06070E] text-gray-500 hover:text-gray-300 border border-gray-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 📜 MAIN REAL-TIME LOG VIEW CONTAINER */}
      <div 
        ref={logContainerRef}
        className="flex-1 min-h-[380px] max-h-[520px] overflow-y-auto p-4 space-y-3 font-sans bg-[#04040A] relative"
      >
        {/* FORMATTED DISCOURSE STREAM */}
        {rawViewMode === 'FORMATTED_FEED' && (
          <>
            {filteredMessages.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <Terminal size={32} className="mb-2 text-gray-700 animate-pulse" />
                <p className="text-sm font-bold text-gray-400">No discourse logs match the current reticle filter.</p>
                <p className="text-xs text-gray-600 mt-1">Try resetting the Archmage or Category filters above.</p>
              </div>
            ) : (
              filteredMessages.map((msg, index) => {
                const meta = ARCHMAGES_METADATA[msg.persona] || {
                  name: msg.name || 'Archmage',
                  avatar: msg.avatar || '🧙‍♂️',
                  color: msg.color || '#D4AF37',
                  badgeBg: 'rgba(212, 175, 55, 0.1)',
                  title: msg.title || 'Council Member'
                };

                const isOperator = msg.role === 'operator';

                return (
                  <motion.div
                    key={msg.id || index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-xl border p-3.5 transition-all relative group ${
                      isOperator
                        ? 'bg-[#0E1022] border-blue-500/40 ml-4 sm:ml-8 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                        : 'bg-[#070712] border-gray-800/80 hover:border-gray-700 mr-2 sm:mr-4'
                    }`}
                  >
                    {/* Header: Avatar, Name, Title, Timestamp, Type Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        {/* Avatar Identifier Badge */}
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-base border shadow-sm"
                          style={{ 
                            backgroundColor: meta.badgeBg, 
                            borderColor: `${meta.color}60`
                          }}
                        >
                          {meta.avatar}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black tracking-wide" style={{ color: meta.color }}>
                              {meta.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              [{meta.title}]
                            </span>
                          </div>
                          <span className="text-[9px] text-gray-500 font-mono">
                            Seq #{index + 1} • {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      {/* Right Header Badges & Actions */}
                      <div className="flex items-center gap-2">
                        {msg.argumentType && (
                          <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                            msg.argumentType === 'SOCRATIC_CHALLENGE' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50' :
                            msg.argumentType === 'Z3_ASSERTION' ? 'bg-purple-950 text-purple-300 border border-purple-500/50' :
                            msg.argumentType === 'FAILURE_WARNING' ? 'bg-rose-950 text-rose-300 border border-rose-500/50' :
                            msg.argumentType === 'SYNTHESIS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' :
                            msg.argumentType === 'CONSENSUS_VOTE' ? 'bg-amber-950 text-amber-300 border border-amber-500/50' :
                            'bg-[#141424] text-gray-300 border border-gray-700'
                          }`}>
                            {msg.argumentType}
                          </span>
                        )}

                        {/* Quick Pin Invariant Button */}
                        {onAddPinnedInvariant && (
                          <button
                            onClick={() => onAddPinnedInvariant(msg.text.slice(0, 140))}
                            className="p-1 text-gray-500 hover:text-amber-400 rounded transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                            title="Pin invariant from this argument"
                          >
                            <Pin size={12} />
                          </button>
                        )}

                        {/* Copy button */}
                        <button
                          onClick={() => handleCopyText(msg.text, `copy_${msg.id}`)}
                          className="p-1 text-gray-500 hover:text-gray-300 rounded transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                          title="Copy argument text"
                        >
                          {copiedKey === `copy_${msg.id}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>

                    {/* Argument Body Text */}
                    <div className="text-xs text-gray-200 leading-relaxed font-sans pl-1 sm:pl-10">
                      {msg.text}
                    </div>

                    {/* Z3 Invariant Formal Proof Snippet (if attached) */}
                    {msg.z3Constraint && (
                      <div className="mt-2.5 sm:ml-10 p-2 bg-[#030308] border border-purple-500/40 rounded-lg text-[11px] font-mono text-purple-300 space-y-1">
                        <div className="flex items-center justify-between text-[9px] text-purple-400 uppercase font-bold tracking-wider">
                          <span className="flex items-center gap-1">
                            <Scale size={11} />
                            <span>Z3 SMT-LIB Invariant Theorem</span>
                          </span>
                          <span className="text-emerald-400 font-bold">SAT_VERIFIED</span>
                        </div>
                        <div className="text-[10px] text-purple-200 bg-[#070712] p-1.5 rounded border border-purple-900/50">
                          <code>{msg.z3Constraint}</code>
                        </div>
                      </div>
                    )}

                    {/* Suggested Action Bar (if attached) */}
                    {msg.suggestedAction && (
                      <div className="mt-2 sm:ml-10 p-1.5 bg-[#03070E] border border-cyan-500/30 rounded-lg text-[10px] text-cyan-300 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <Zap size={11} className="text-cyan-400 shrink-0" />
                          <span className="font-bold text-gray-400">Action Recommended:</span>
                          <span className="truncate">{msg.suggestedAction}</span>
                        </div>
                        <button
                          onClick={() => onNotify?.(`⚡ Executed Council action: "${msg.suggestedAction}"`, 'success')}
                          className="px-2 py-0.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded text-[9px] shrink-0 transition-all cursor-pointer"
                        >
                          Execute
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </>
        )}

        {/* JSON-RPC 2.0 RAW PACKET VIEW */}
        {rawViewMode === 'JSON_RPC' && (
          <div className="font-mono text-xs text-purple-300 bg-[#020206] p-3 rounded-xl border border-purple-900/40 overflow-x-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800 text-[10px] text-gray-400">
              <span>// CAMELOT_OS ARCHMAGE COUNCIL DISCOURSE JSON-RPC 2.0 PROTOCOL STREAM</span>
              <button 
                onClick={() => handleCopyText(JSON.stringify(jsonRpcLogs, null, 2), 'all_json_rpc')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Copy size={11} />
                <span>{copiedKey === 'all_json_rpc' ? 'Copied JSON' : 'Copy All JSON'}</span>
              </button>
            </div>
            <pre className="text-[11px] leading-relaxed text-gray-300">
              {JSON.stringify(jsonRpcLogs, null, 2)}
            </pre>
          </div>
        )}

        {/* RAW STDIO STREAM VIEW */}
        {rawViewMode === 'RAW_STDIO' && (
          <div className="font-mono text-xs text-emerald-400 bg-[#020206] p-3 rounded-xl border border-emerald-900/40 overflow-x-auto space-y-1">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800 text-[10px] text-gray-400">
              <span>// BARE-METAL STDIO EVENT BUFFER (Wasmtime IPC / Memory Delta: 0.12 MiB)</span>
              <span className="text-emerald-400">BARE_METAL_SYNC_OK</span>
            </div>
            {messages.map((m, idx) => (
              <div key={idx} className="text-[10px] leading-relaxed text-gray-300 font-mono hover:bg-[#070D12] p-1 rounded">
                <span className="text-gray-500">[{new Date(m.timestamp).toLocaleTimeString()}]</span>{' '}
                <span className="text-cyan-400 font-bold">[{m.persona}]</span>{' '}
                <span className="text-purple-400">({m.argumentType || 'PROPOSAL'}):</span>{' '}
                <span className="text-gray-200">{m.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🚀 BOTTOM QUICK-PULSE ARCHMAGE SIMULATOR PANEL */}
      {onSimulateArchmageDeliberation && (
        <div className="bg-[#080814] border-t border-gray-800/80 p-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-[#D4AF37]" />
            <span className="text-xs font-bold text-white">Trigger Deliberation Step:</span>
            <span className="text-[10px] text-gray-500 hidden sm:inline">(Inject live argument from individual Archmage)</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => onSimulateArchmageDeliberation('LADY_APIS')}
              className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>🐝</span>
              <span>Lady Apis (Socratic)</span>
            </button>

            <button
              onClick={() => onSimulateArchmageDeliberation('SIR_GIDEON')}
              className="px-2 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>🛡️</span>
              <span>Sir Gideon (Crucible)</span>
            </button>

            <button
              onClick={() => onSimulateArchmageDeliberation('FORMALIS_OMEGA')}
              className="px-2 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>⚖️</span>
              <span>Formalis Ω (Z3 SAT)</span>
            </button>

            <button
              onClick={() => onSimulateArchmageDeliberation('MERLIN_OMEGA')}
              className="px-2 py-1 bg-amber-950 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>🧙‍♂️</span>
              <span>Merlin Ω (Synthesis)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
