import React, { useState, useEffect } from 'react';
import { Database, Plus, UploadCloud, Radio, FileCode, CheckCircle, RefreshCw, FileText, Layers } from 'lucide-react';
import { NotebookSource } from '../types';

interface SourceVaultsProps {
  onNotify: (message: string, type: 'success' | 'warning') => void;
}

export function SourceVaults({ onNotify }: SourceVaultsProps) {
  const [sources, setSources] = useState<NotebookSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceType, setSourceType] = useState<NotebookSource['type']>('markdown_blueprint');
  const [summaryData, setSummaryData] = useState<any>(null);
  const [summarizing, setSummarizing] = useState(false);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mcp/sources');
      const data = await res.json();
      setSources(data.sources || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      const res = await fetch('/api/mcp/sources/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          type: sourceType,
          authorAgent: 'Lady Apis (Perplexity MCP Sync)'
        })
      });
      const data = await res.json();
      if (data.success) {
        onNotify(`Uploaded & Indexed: ${title} (${data.source.blockCount} blocks)`, 'success');
        setShowUploadModal(false);
        setTitle('');
        setContent('');
        fetchSources();
      }
    } catch (err) {
      console.error(err);
      onNotify('Failed to upload source to NotebookLM vault', 'warning');
    }
  };

  const handleGenerateSummary = async () => {
    setSummarizing(true);
    try {
      const res = await fetch('/api/mcp/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebookId: 'nb_sovereign_camelot_v10000' })
      });
      const data = await res.json();
      setSummaryData(data);
      onNotify('Cloudbrain Executive Synthesis & Podcast Brief generated', 'success');
    } catch (err) {
      console.error(err);
      onNotify('Summary generation failed', 'warning');
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A35] pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Database size={16} className="text-[#D4AF37]" /> NotebookLM Source Vaults
          </h3>
          <p className="text-xs text-gray-400">Canonical Master Grounding Vaults • Indexed Block-Level URI Mapping</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateSummary}
            disabled={summarizing}
            className="bg-[#1C1C24] hover:bg-[#282834] text-[#D4AF37] border border-[#2A2A35] text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all"
          >
            {summarizing ? <RefreshCw size={13} className="animate-spin" /> : <Radio size={13} />}
            <span>Synthesize / Podcast Script</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B0B0E] font-bold text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all"
          >
            <Plus size={14} />
            <span>Upload Forage Source</span>
          </button>
        </div>
      </div>

      {/* Summary View if generated */}
      {summaryData && (
        <div className="bg-[#121218] border border-[#D4AF37]/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#2A2A35] pb-2">
            <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
              <Radio size={14} className="animate-pulse" /> {summaryData.title}
            </span>
            <span className="text-[10px] text-green-400 font-mono bg-[#192A1F] px-2 py-0.5 rounded border border-green-700/50">
              Audio Podcast Format Ready
            </span>
          </div>

          <p className="text-xs text-gray-300 font-sans leading-relaxed">
            {summaryData.executiveSummary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            {summaryData.keyTakeaways.map((point: string, idx: number) => (
              <div key={idx} className="bg-[#171720] p-2 rounded border border-[#2A2A35] text-xs text-gray-300 flex items-start gap-2">
                <CheckCircle size={13} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <span className="text-[11px]">{point}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-400 pt-2 border-t border-[#2A2A35]">
            <span>Total Tokens Indexed: {summaryData.totalTokensIndexed?.toLocaleString()}</span>
            <span>Total Grounded Blocks: {summaryData.totalBlocks}</span>
            <span className="text-[#D4AF37]">Host Duo: Lady Apis ⊕ Sir Gideon</span>
          </div>
        </div>
      )}

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src) => (
          <div 
            key={src.id}
            className="bg-[#121217] border border-[#2A2A35] hover:border-[#D4AF37]/60 rounded-lg p-4 transition-all space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#1C1C26] rounded text-[#D4AF37] border border-[#2A2A35]">
                  {src.type === 'pdf_vault' && <FileText size={15} />}
                  {src.type === 'markdown_blueprint' && <FileCode size={15} />}
                  {src.type === 'codebase_graph' && <Layers size={15} />}
                  {src.type === 'api_contract' && <Database size={15} />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{src.title}</h4>
                  <span className="text-[10px] text-gray-400 font-mono">By {src.authorAgent}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-green-400 bg-[#16221A] px-2 py-0.5 rounded border border-green-800/40">
                {src.status}
              </span>
            </div>

            <p className="text-xs text-gray-400 line-clamp-2 font-sans">
              {src.summary}
            </p>

            <div className="bg-[#0A0A0E] p-2 rounded border border-[#20202A] text-[10px] font-mono text-[#D4AF37]/90 truncate">
              {src.vikingUri}
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-[#20202A]">
              <span>Blocks: <strong className="text-white">{src.blockCount}</strong></span>
              <span>Tokens: <strong className="text-white">{src.tokenEstimate.toLocaleString()}</strong></span>
              <span>Synced: {new Date(src.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#121217] border border-[#D4AF37] rounded-lg max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2A2A35] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <UploadCloud size={16} className="text-[#D4AF37]" /> Upload Daily Forage Source
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white text-sm">✕</button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. OpenViking Memory Integration Protocol"
                  className="w-full bg-[#181820] border border-[#2A2A35] focus:border-[#D4AF37] text-white text-xs px-3 py-2 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">Source Type</label>
                <select
                  value={sourceType}
                  onChange={e => setSourceType(e.target.value as any)}
                  className="w-full bg-[#181820] border border-[#2A2A35] focus:border-[#D4AF37] text-white text-xs px-3 py-2 rounded focus:outline-none"
                >
                  <option value="markdown_blueprint">Markdown Blueprint (.md)</option>
                  <option value="pdf_vault">PDF Research Vault (.pdf)</option>
                  <option value="strategy_doc">Strategy Document (.doc)</option>
                  <option value="api_contract">API Contract Schema (.json)</option>
                  <option value="codebase_graph">Codebase Knowledge Graph</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">Document Content / Payload</label>
                <textarea
                  required
                  rows={6}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Paste raw research findings, syntax dependencies, or system rules to index into NotebookLM..."
                  className="w-full bg-[#181820] border border-[#2A2A35] focus:border-[#D4AF37] text-white text-xs p-3 rounded focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#2A2A35]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-white border border-[#2A2A35] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B0B0E] font-bold text-xs px-4 py-1.5 rounded flex items-center gap-1.5"
                >
                  <UploadCloud size={14} />
                  <span>Index into Cloudbrain</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
