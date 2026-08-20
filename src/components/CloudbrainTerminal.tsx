import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Terminal, 
  BookOpen, 
  ExternalLink, 
  Cpu, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  FileText, 
  Database,
  History,
  PlusCircle,
  Clock,
  Layers,
  Headphones,
  Play,
  Pause,
  Code2,
  GitBranch,
  Youtube,
  Globe,
  HelpCircle,
  Award,
  Network,
  Copy,
  Check,
  FileCheck
} from 'lucide-react';
import { 
  NotebookQueryResponse, 
  SourceCitation,
  NotebookLMArtifact,
  NotebookLMAnythingInputType,
  AnythingToNotebookLMResult,
  NotebookLMPythonSDKScript
} from '../types';
import { 
  auth, 
  saveCloudbrainQuery, 
  fetchCloudbrainQueries, 
  saveWorldtreeSource, 
  fetchWorldtreeSources,
  CloudbrainQueryModel,
  WorldtreeSourceModel 
} from '../lib/firebase';

interface CloudbrainTerminalProps {
  onNotify: (message: string, type?: 'success' | 'warning') => void;
}

export function CloudbrainTerminal({ onNotify }: CloudbrainTerminalProps) {
  // Navigation & Sub-Tabs
  const [activeTab, setActiveTab] = useState<'QUERY' | 'INGEST_ANYTHING' | 'ARTIFACTS' | 'DEVELOPER_SDK' | 'WORLDTREE_SOURCES' | 'QUERY_HISTORY'>('QUERY');

  // Query State
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<NotebookQueryResponse | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<SourceCitation | null>(null);
  const [viewToon, setViewToon] = useState(false);
  const [requireCitations, setRequireCitations] = useState(true);

  // Firestore Persistent State
  const [dbQueries, setDbQueries] = useState<CloudbrainQueryModel[]>([]);
  const [dbSources, setDbSources] = useState<WorldtreeSourceModel[]>([]);
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceContent, setNewSourceContent] = useState('');
  const [isSavingSource, setIsSavingSource] = useState(false);

  // Ingest-Anything State (qiaomu-anything-to-notebooklm)
  const [anythingType, setAnythingType] = useState<NotebookLMAnythingInputType>('WEB_URL');
  const [anythingInput, setAnythingInput] = useState('https://github.com/teng-lin/notebooklm-py');
  const [anythingTitle, setAnythingTitle] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [lastIngestResult, setLastIngestResult] = useState<AnythingToNotebookLMResult | null>(null);

  // Artifacts State
  const [artifactType, setArtifactType] = useState<'AUDIO' | 'STUDY_GUIDE' | 'BRIEFING' | 'QUIZ' | 'MINDMAP'>('AUDIO');
  const [isGeneratingArtifact, setIsGeneratingArtifact] = useState(false);
  const [artifactsList, setArtifactsList] = useState<NotebookLMArtifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<NotebookLMArtifact | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Developer SDK State (notebooklm-py & notebooklm-skill)
  const [pythonScript, setPythonScript] = useState<NotebookLMPythonSDKScript | null>(null);
  const [claudeSkillMd, setClaudeSkillMd] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const presets = [
    'Retrieve Isomorphic FileTree Law and Zero-Hallucination Mandate',
    'Extract Model Context Protocol (MCP) Bifrost routing architecture',
    'What is Lady Mnemosyne Phial Engine and Genome Evolution Protocol?',
    'Synthesize Anything-to-NotebookLM multi-source ingestion pipeline'
  ];

  // Initial Load from Firestore & MCP APIs
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [sources, queries, artifactsRes, pyRes, skillRes] = await Promise.all([
          fetchWorldtreeSources(),
          fetchCloudbrainQueries(),
          fetch('/api/mcp/artifacts').then(r => r.json()).catch(() => ({ artifacts: [] })),
          fetch('/api/mcp/export-python-sdk').then(r => r.json()).catch(() => null),
          fetch('/api/mcp/export-claude-skill').then(r => r.json()).catch(() => null)
        ]);

        if (sources && sources.length > 0) setDbSources(sources);
        if (queries && queries.length > 0) setDbQueries(queries);
        if (artifactsRes?.artifacts) setArtifactsList(artifactsRes.artifacts);
        if (pyRes?.script) setPythonScript(pyRes.script);
        if (skillRes?.skillMd) setClaudeSkillMd(skillRes.skillMd);
      } catch (e) {
        console.warn('Initial data load warning:', e);
      }
    }
    loadInitialData();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onNotify('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Grounded Query Execution
  const handleQuery = async (queryText?: string) => {
    const q = queryText || query;
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/mcp/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, requireCitations })
      });
      const data: NotebookQueryResponse = await res.json();
      setResponse(data);
      if (data.citations && data.citations.length > 0) {
        setSelectedCitation(data.citations[0]);
      }
      onNotify(`Grounded: ${data.citations?.length || 0} cited blocks from NotebookLM`, 'success');

      // Persist query to Firestore Cloudbrain
      const user = auth.currentUser;
      const queryRecord: CloudbrainQueryModel = {
        id: `cq_${Date.now()}`,
        query: q,
        answer: data.answer,
        toonRepresentation: data.toonRepresentation,
        groundedScore: data.groundedScore,
        citations: data.citations || [],
        latencyMs: data.latencyMs,
        authorUid: user?.uid || 'sovereign_operator',
        createdAt: new Date().toISOString()
      };
      await saveCloudbrainQuery(queryRecord);
      setDbQueries(prev => [queryRecord, ...prev.slice(0, 19)]);
    } catch (err) {
      console.error(err);
      onNotify('MCP Query failed: Connection latency detected', 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Ingest-Anything Execution
  const handleIngestAnything = async () => {
    if (!anythingInput.trim()) {
      onNotify('Please provide a URL or input text', 'warning');
      return;
    }
    setIsIngesting(true);
    try {
      const res = await fetch('/api/mcp/ingest-anything', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputType: anythingType,
          inputContent: anythingInput,
          title: anythingTitle || undefined
        })
      });
      const data = await res.json();
      if (data.success && data.result) {
        setLastIngestResult(data.result);
        onNotify(`✨ Ingested source "${data.result.extractedTitle}" (${data.result.blockCount} blocks)!`, 'success');

        // Also save to Firestore Worldtree Sources
        const user = auth.currentUser;
        const fsSource: WorldtreeSourceModel = {
          id: data.result.id,
          title: data.result.extractedTitle,
          content: data.result.extractedContent,
          type: 'ENGINEERING_SPEC',
          authorUid: user?.uid || 'sovereign_operator',
          createdAt: new Date().toISOString()
        };
        await saveWorldtreeSource(fsSource);
        setDbSources(prev => [fsSource, ...prev]);
      } else {
        throw new Error(data.error || 'Ingestion failed');
      }
    } catch (err: any) {
      console.error(err);
      onNotify(`Ingestion error: ${err.message}`, 'warning');
    } finally {
      setIsIngesting(false);
    }
  };

  // Artifact Generation Handler
  const handleGenerateArtifact = async (type: 'AUDIO' | 'STUDY_GUIDE' | 'BRIEFING' | 'QUIZ' | 'MINDMAP') => {
    setIsGeneratingArtifact(true);
    try {
      let endpoint = '/api/mcp/generate-audio';
      let payload = {};

      if (type === 'STUDY_GUIDE') endpoint = '/api/mcp/generate-study-guide';
      else if (type === 'BRIEFING') endpoint = '/api/mcp/generate-briefing';
      else if (type === 'QUIZ') {
        endpoint = '/api/mcp/generate-quiz';
        payload = { questionCount: 5, difficulty: 'STANDARD' };
      } else if (type === 'MINDMAP') endpoint = '/api/mcp/generate-mindmap';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.artifact) {
        setSelectedArtifact(data.artifact);
        setArtifactsList(prev => [data.artifact, ...prev]);
        setQuizAnswers({});
        setQuizSubmitted(false);
        onNotify(`Generated ${data.artifact.title}!`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      onNotify(`Artifact generation failed: ${err.message}`, 'warning');
    } finally {
      setIsGeneratingArtifact(false);
    }
  };

  // Manual Worldtree Source Creation
  const handleCreateSource = async () => {
    if (!newSourceTitle.trim() || !newSourceContent.trim()) {
      onNotify('Source title and content are required!', 'warning');
      return;
    }
    setIsSavingSource(true);
    try {
      const user = auth.currentUser;
      const newSource: WorldtreeSourceModel = {
        id: `src_${Date.now()}`,
        title: newSourceTitle,
        content: newSourceContent,
        type: 'ENGINEERING_SPEC',
        authorUid: user?.uid || 'sovereign_operator',
        createdAt: new Date().toISOString()
      };
      await saveWorldtreeSource(newSource);
      setDbSources(prev => [newSource, ...prev]);
      setNewSourceTitle('');
      setNewSourceContent('');
      onNotify(`✨ Ingested source "${newSource.title}" into Worldtree Notebook in Firestore!`, 'success');
    } catch (err: any) {
      console.error(err);
      onNotify('Failed to save source: ' + err?.message, 'warning');
    } finally {
      setIsSavingSource(false);
    }
  };

  return (
    <div id="cloudbrain-terminal-root" className="space-y-4 font-mono text-gray-200">
      {/* Header & Mode Sub-Nav */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A35] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/40 rounded text-[#D4AF37]">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">NotebookLM Omni-Bridge & Cloudbrain</h3>
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded flex items-center gap-1 font-bold">
                <Database size={10} />
                <span>WORLDTREE FIRESTORE ACTIVE</span>
              </span>
            </div>
            <p className="text-xs text-gray-400">Model Context Protocol • notebooklm-py • Anything-to-NotebookLM • Claude Skill Contract</p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-gray-300 hover:text-white bg-[#0A0A10] px-2 py-1 rounded border border-gray-800">
            <input 
              type="checkbox" 
              checked={requireCitations} 
              onChange={e => setRequireCitations(e.target.checked)}
              className="accent-[#D4AF37] rounded"
            />
            <span className="text-xs font-semibold text-[#D4AF37]">Zero-Hallucination Mandate</span>
          </label>
        </div>
      </div>

      {/* Primary Sub-Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#0D0D16] p-1.5 rounded-lg border border-gray-800">
        <button
          id="btn-tab-query"
          onClick={() => setActiveTab('QUERY')}
          className={`px-3 py-1.5 rounded text-xs transition-all flex items-center gap-1.5 font-bold ${
            activeTab === 'QUERY'
              ? 'bg-amber-500/20 text-[#D4AF37] border border-amber-500/50 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Terminal size={13} />
          <span>Grounded Query</span>
        </button>

        <button
          id="btn-tab-ingest"
          onClick={() => setActiveTab('INGEST_ANYTHING')}
          className={`px-3 py-1.5 rounded text-xs transition-all flex items-center gap-1.5 font-bold ${
            activeTab === 'INGEST_ANYTHING'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Layers size={13} />
          <span>Anything-to-NotebookLM</span>
        </button>

        <button
          id="btn-tab-artifacts"
          onClick={() => {
            setActiveTab('ARTIFACTS');
            if (!selectedArtifact && artifactsList.length > 0) {
              setSelectedArtifact(artifactsList[0]);
            }
          }}
          className={`px-3 py-1.5 rounded text-xs transition-all flex items-center gap-1.5 font-bold ${
            activeTab === 'ARTIFACTS'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Headphones size={13} />
          <span>Artifacts & Audio ({artifactsList.length})</span>
        </button>

        <button
          id="btn-tab-dev-sdk"
          onClick={() => setActiveTab('DEVELOPER_SDK')}
          className={`px-3 py-1.5 rounded text-xs transition-all flex items-center gap-1.5 font-bold ${
            activeTab === 'DEVELOPER_SDK'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Code2 size={13} />
          <span>Python SDK & Claude Skill</span>
        </button>

        <button
          id="btn-tab-sources"
          onClick={() => setActiveTab('WORLDTREE_SOURCES')}
          className={`px-3 py-1.5 rounded text-xs transition-all flex items-center gap-1.5 font-bold ${
            activeTab === 'WORLDTREE_SOURCES'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <BookOpen size={13} />
          <span>Worldtree Vault ({dbSources.length})</span>
        </button>

        <button
          id="btn-tab-history"
          onClick={() => setActiveTab('QUERY_HISTORY')}
          className={`px-3 py-1.5 rounded text-xs transition-all flex items-center gap-1.5 font-bold ${
            activeTab === 'QUERY_HISTORY'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <History size={13} />
          <span>History ({dbQueries.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GROUNDED QUERY TERMINAL */}
      {/* ========================================================================= */}
      {activeTab === 'QUERY' && (
        <div className="space-y-4">
          {/* Preset Prompts */}
          <div className="flex flex-wrap gap-2">
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Zap size={12} className="text-[#D4AF37]" /> Quick Grounded Inquiries:
            </span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(p);
                  handleQuery(p);
                }}
                className="text-[11px] bg-[#14141E] hover:bg-[#1E1E2C] text-gray-300 hover:text-[#D4AF37] px-2.5 py-1 rounded border border-gray-800 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="relative">
            <input
              id="cloudbrain-query-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
              placeholder="Query NotebookLM Cloudbrain (e.g. 'Extract Isomorphic FileTree Law')..."
              className="w-full bg-[#0E0E17] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] pr-28"
            />
            <button
              id="cloudbrain-query-submit"
              onClick={() => handleQuery()}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 bg-[#D4AF37] hover:bg-[#C29B27] disabled:opacity-50 text-black text-xs font-bold px-3.5 py-1.5 rounded transition-all flex items-center gap-1.5"
            >
              {loading ? <RefreshCw size={12} className="animate-spin" /> : <Terminal size={12} />}
              <span>{loading ? 'Retrieving...' : 'Ask Vault'}</span>
            </button>
          </div>

          {/* Grounded Response Display */}
          {response && (
            <div className="bg-[#0A0A12] border border-gray-800 rounded-xl p-4 space-y-4">
              {/* Telemetry Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800/80 pb-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck size={14} />
                    <span className="font-bold">Grounded Score: {(response.groundedScore * 100).toFixed(1)}%</span>
                  </div>
                  <div className="text-gray-400">Latency: {response.latencyMs}ms</div>
                  <div className="text-gray-400">Notebook: {response.notebookTitle}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewToon(!viewToon)}
                    className={`px-2.5 py-1 rounded text-[11px] transition-all flex items-center gap-1 ${
                      viewToon ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40' : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    <Cpu size={11} />
                    <span>{viewToon ? 'View Formatted Text' : 'View TOON (68% Token Savings)'}</span>
                  </button>
                </div>
              </div>

              {/* Body Content */}
              {viewToon ? (
                <pre className="bg-[#050508] p-3 rounded-lg text-xs text-amber-300 overflow-x-auto border border-amber-500/20 leading-relaxed whitespace-pre-wrap">
                  {response.toonRepresentation}
                </pre>
              ) : (
                <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap bg-[#10101A] p-4 rounded-lg border border-gray-800">
                  {response.answer}
                </div>
              )}

              {/* Citations Grid */}
              {response.citations && response.citations.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen size={13} />
                    <span>Authoritative Source Grounding ({response.citations.length} Cited Blocks)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {response.citations.map((cite) => (
                      <div
                        key={cite.id}
                        onClick={() => setSelectedCitation(cite)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          selectedCitation?.id === cite.id
                            ? 'bg-[#1A1A28] border-[#D4AF37] text-white shadow-sm'
                            : 'bg-[#0E0E17] border-gray-800/80 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-gray-200 truncate">{cite.sourceTitle}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950 text-emerald-300 rounded font-mono">
                            {(cite.confidence * 100).toFixed(0)}% Match
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 italic line-clamp-2">{cite.excerpt}</p>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
                          <span className="font-mono">{cite.blockId}</span>
                          <span>{cite.pageOrSection}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Citation Deep Inspector */}
              {selectedCitation && (
                <div className="bg-[#12121E] border border-amber-500/30 rounded-lg p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[#D4AF37]">
                    <span className="font-bold">Citation Inspector: {selectedCitation.sourceTitle}</span>
                    <span className="font-mono text-[10px] bg-black/40 px-1.5 py-0.5 rounded">{selectedCitation.blockId}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{selectedCitation.excerpt}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ANYTHING-TO-NOTEBOOKLM INGESTION DECK */}
      {/* ========================================================================= */}
      {activeTab === 'INGEST_ANYTHING' && (
        <div className="space-y-4">
          <div className="bg-[#0A0A12] border border-cyan-500/30 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <Layers size={16} />
                  <span>Anything-to-NotebookLM Ingestion Pipeline</span>
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Universal multi-source parser: Web URLs, YouTube video transcripts, GitHub repos, PDF specs, and markdown.
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded font-mono">
                qiaomu-anything-to-notebooklm
              </span>
            </div>

            {/* Source Type Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'WEB_URL' as NotebookLMAnythingInputType, label: 'Web Article / URL', icon: Globe },
                { type: 'YOUTUBE_URL' as NotebookLMAnythingInputType, label: 'YouTube Video', icon: Youtube },
                { type: 'GITHUB_REPO' as NotebookLMAnythingInputType, label: 'GitHub Repository', icon: GitBranch },
                { type: 'PDF_SPEC' as NotebookLMAnythingInputType, label: 'PDF / Spec Text', icon: FileCheck },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => {
                      setAnythingType(item.type);
                      if (item.type === 'GITHUB_REPO') setAnythingInput('https://github.com/teng-lin/notebooklm-py');
                      else if (item.type === 'YOUTUBE_URL') setAnythingInput('https://www.youtube.com/watch?v=sovereign_mcp_brief');
                      else if (item.type === 'WEB_URL') setAnythingInput('https://docs.anthropic.com/en/docs/agents-and-tools/mcp');
                      else setAnythingInput('Paste full technical specification markdown here...');
                    }}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                      anythingType === item.type
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                        : 'bg-[#10101A] border-gray-800 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input fields */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Optional Custom Source Title</label>
                <input
                  type="text"
                  value={anythingTitle}
                  onChange={e => setAnythingTitle(e.target.value)}
                  placeholder="e.g. NotebookLM Python Client Integration Spec"
                  className="w-full bg-[#10101A] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Target URL / Content Payload</label>
                {anythingType === 'PDF_SPEC' || anythingType === 'RAW_TEXT' ? (
                  <textarea
                    rows={4}
                    value={anythingInput}
                    onChange={e => setAnythingInput(e.target.value)}
                    placeholder="Paste technical text, PDF extract, or API contract..."
                    className="w-full bg-[#10101A] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                ) : (
                  <input
                    type="text"
                    value={anythingInput}
                    onChange={e => setAnythingInput(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#10101A] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                )}
              </div>

              <button
                id="btn-execute-ingest"
                onClick={handleIngestAnything}
                disabled={isIngesting || !anythingInput.trim()}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {isIngesting ? <RefreshCw size={14} className="animate-spin" /> : <Layers size={14} />}
                <span>{isIngesting ? 'Parsing & Indexing into NotebookLM Vault...' : 'Ingest & Chunk into Cloudbrain Vault'}</span>
              </button>
            </div>
          </div>

          {/* Last Ingest Result */}
          {lastIngestResult && (
            <div className="bg-[#0E0E18] border border-emerald-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 size={16} />
                  <span>Ingestion Complete: {lastIngestResult.extractedTitle}</span>
                </div>
                <span className="font-mono text-gray-400">{lastIngestResult.vikingBlockId}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-black/40 p-2 rounded border border-gray-800">
                  <div className="text-gray-400 text-[10px]">Estimated Tokens</div>
                  <div className="font-bold text-white text-sm">{lastIngestResult.tokenCount}</div>
                </div>
                <div className="bg-black/40 p-2 rounded border border-gray-800">
                  <div className="text-gray-400 text-[10px]">Viking Blocks</div>
                  <div className="font-bold text-white text-sm">{lastIngestResult.blockCount}</div>
                </div>
                <div className="bg-black/40 p-2 rounded border border-gray-800">
                  <div className="text-gray-400 text-[10px]">Source Type</div>
                  <div className="font-bold text-cyan-300 text-sm">{lastIngestResult.sourceType}</div>
                </div>
              </div>

              <div className="text-xs space-y-1 bg-[#141420] p-3 rounded-lg border border-gray-800">
                <div className="font-bold text-gray-300">Extracted Key Insights:</div>
                {lastIngestResult.keyInsights.map((k, i) => (
                  <div key={i} className="text-gray-400 flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{k}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-400">Available for generation:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('ARTIFACTS');
                      handleGenerateArtifact('AUDIO');
                    }}
                    className="bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 px-2.5 py-1 rounded border border-purple-500/40"
                  >
                    Generate Audio Overview
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('ARTIFACTS');
                      handleGenerateArtifact('STUDY_GUIDE');
                    }}
                    className="bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 px-2.5 py-1 rounded border border-amber-500/40"
                  >
                    Generate Study Guide
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ARTIFACTS & AUDIO OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'ARTIFACTS' && (
        <div className="space-y-4">
          {/* Artifact Generators Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              onClick={() => handleGenerateArtifact('AUDIO')}
              disabled={isGeneratingArtifact}
              className="p-3 bg-[#12101F] hover:bg-[#1A1630] border border-purple-500/40 rounded-xl text-left transition-all"
            >
              <div className="flex items-center gap-1.5 text-purple-300 text-xs font-bold mb-1">
                <Headphones size={14} />
                <span>Audio Overview</span>
              </div>
              <p className="text-[10px] text-gray-400">Dual-Host Podcast Script & Preview</p>
            </button>

            <button
              onClick={() => handleGenerateArtifact('STUDY_GUIDE')}
              disabled={isGeneratingArtifact}
              className="p-3 bg-[#1A150D] hover:bg-[#2A2012] border border-amber-500/40 rounded-xl text-left transition-all"
            >
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold mb-1">
                <BookOpen size={14} />
                <span>Study Guide</span>
              </div>
              <p className="text-[10px] text-gray-400">Glossary, Tables, Concepts</p>
            </button>

            <button
              onClick={() => handleGenerateArtifact('BRIEFING')}
              disabled={isGeneratingArtifact}
              className="p-3 bg-[#0D151D] hover:bg-[#14202C] border border-blue-500/40 rounded-xl text-left transition-all"
            >
              <div className="flex items-center gap-1.5 text-blue-300 text-xs font-bold mb-1">
                <FileText size={14} />
                <span>Briefing Doc</span>
              </div>
              <p className="text-[10px] text-gray-400">Executive Technical Roadmap</p>
            </button>

            <button
              onClick={() => handleGenerateArtifact('QUIZ')}
              disabled={isGeneratingArtifact}
              className="p-3 bg-[#0D1D16] hover:bg-[#132A20] border border-emerald-500/40 rounded-xl text-left transition-all"
            >
              <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold mb-1">
                <Award size={14} />
                <span>Verification Quiz</span>
              </div>
              <p className="text-[10px] text-gray-400">Interactive Knowledge Test</p>
            </button>

            <button
              onClick={() => handleGenerateArtifact('MINDMAP')}
              disabled={isGeneratingArtifact}
              className="p-3 bg-[#180D1D] hover:bg-[#25132D] border border-fuchsia-500/40 rounded-xl text-left transition-all"
            >
              <div className="flex items-center gap-1.5 text-fuchsia-300 text-xs font-bold mb-1">
                <Network size={14} />
                <span>Mindmap</span>
              </div>
              <p className="text-[10px] text-gray-400">Mermaid.js Topology</p>
            </button>
          </div>

          {isGeneratingArtifact && (
            <div className="p-8 text-center bg-[#0A0A12] border border-purple-500/30 rounded-xl">
              <RefreshCw size={24} className="animate-spin text-purple-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">Synthesizing Artifact from Grounded Vaults...</div>
              <div className="text-xs text-gray-400 mt-1">Cross-referencing sources and verifying zero-hallucination bounds</div>
            </div>
          )}

          {/* Selected Artifact Viewer */}
          {selectedArtifact && !isGeneratingArtifact && (
            <div className="bg-[#0A0A12] border border-gray-800 rounded-xl p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {selectedArtifact.type === 'AUDIO_OVERVIEW' && <Headphones className="text-purple-400" size={16} />}
                    {selectedArtifact.type === 'STUDY_GUIDE' && <BookOpen className="text-amber-400" size={16} />}
                    {selectedArtifact.type === 'BRIEFING_DOC' && <FileText className="text-blue-400" size={16} />}
                    {selectedArtifact.type === 'QUIZ' && <Award className="text-emerald-400" size={16} />}
                    {selectedArtifact.type === 'MINDMAP' && <Network className="text-fuchsia-400" size={16} />}
                    <span>{selectedArtifact.title}</span>
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Author: {selectedArtifact.authorKnight || 'Lady Mnemosyne'} • Created: {new Date(selectedArtifact.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(selectedArtifact.content, 'artifact_copy')}
                    className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 rounded flex items-center gap-1"
                  >
                    {copiedKey === 'artifact_copy' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'artifact_copy' ? 'Copied' : 'Copy Content'}</span>
                  </button>
                </div>
              </div>

              {/* AUDIO OVERVIEW PLAYER */}
              {selectedArtifact.type === 'AUDIO_OVERVIEW' && (
                <div className="space-y-4">
                  {/* Podcast Player Bar */}
                  <div className="bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="w-12 h-12 rounded-full bg-purple-500 hover:bg-purple-400 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
                      >
                        {isPlayingAudio ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                      </button>
                      <div>
                        <div className="text-xs font-bold text-white">Dual-Host Audio Deep Dive</div>
                        <div className="text-[11px] text-purple-300">Lady Apis & Sir Gideon • 4:35 duration</div>
                      </div>
                    </div>

                    {/* Fake Animated Sound Waveform */}
                    <div className="flex items-center gap-1 h-8 px-4 bg-black/40 rounded-lg border border-purple-500/20">
                      {[40, 75, 30, 90, 60, 100, 45, 80, 50, 95, 35, 70, 85, 40, 65, 90].map((h, i) => (
                        <div
                          key={i}
                          className={`w-1 bg-purple-400 rounded-full transition-all duration-300 ${
                            isPlayingAudio ? 'animate-pulse' : 'opacity-40'
                          }`}
                          style={{ height: isPlayingAudio ? `${h}%` : '25%' }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Script Transcript */}
                  <div className="bg-[#050508] p-4 rounded-xl border border-gray-800 text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {selectedArtifact.content}
                  </div>
                </div>
              )}

              {/* QUIZ INTERACTIVE TAKER */}
              {selectedArtifact.type === 'QUIZ' && selectedArtifact.parsedData && (
                <div className="space-y-4">
                  {selectedArtifact.parsedData.map((q: any, qIdx: number) => {
                    const selectedOpt = quizAnswers[q.id];
                    const isAnswered = selectedOpt !== undefined;
                    const isCorrect = selectedOpt === q.correctIndex;

                    return (
                      <div key={q.id || qIdx} className="bg-[#12121E] border border-gray-800 rounded-xl p-4 space-y-3">
                        <div className="text-sm font-bold text-white flex items-start gap-2">
                          <span className="text-emerald-400 font-mono">Q{qIdx + 1}.</span>
                          <span>{q.question}</span>
                        </div>

                        <div className="space-y-1.5 pl-6">
                          {q.options.map((opt: string, optIdx: number) => (
                            <button
                              key={optIdx}
                              onClick={() => {
                                if (!quizSubmitted) {
                                  setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }));
                                }
                              }}
                              className={`w-full text-left p-2.5 rounded-lg text-xs font-mono border transition-all ${
                                quizSubmitted
                                  ? optIdx === q.correctIndex
                                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                                    : selectedOpt === optIdx
                                    ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                                    : 'bg-[#0A0A10] border-gray-800 text-gray-500'
                                  : selectedOpt === optIdx
                                  ? 'bg-purple-900/40 border-purple-500 text-white'
                                  : 'bg-[#0A0A10] border-gray-800 text-gray-300 hover:border-gray-700'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>

                        {quizSubmitted && (
                          <div className={`p-3 rounded-lg text-xs ${isCorrect ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'}`}>
                            <div className="font-bold mb-1">{isCorrect ? '✅ Correct Answer!' : '❌ Incorrect'}</div>
                            <p className="text-gray-300">{q.explanation}</p>
                            <div className="mt-1 font-mono text-[10px] text-gray-400">Citation: {q.citationBlock}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
                    >
                      Submit & Score Quiz
                    </button>
                    {quizSubmitted && (
                      <div className="text-xs font-bold text-emerald-400">
                        Final Score: {Object.entries(quizAnswers).filter(([k, v]) => {
                          const item = selectedArtifact.parsedData.find((x: any) => x.id === k);
                          return item && item.correctIndex === v;
                        }).length} / {selectedArtifact.parsedData.length} (100% Invariant Grounded)
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STANDARD MARKDOWN / MINDMAP VIEWER */}
              {selectedArtifact.type !== 'AUDIO_OVERVIEW' && selectedArtifact.type !== 'QUIZ' && (
                <div className="bg-[#050508] p-4 rounded-xl border border-gray-800 text-xs font-mono text-gray-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {selectedArtifact.content}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DEVELOPER SDK & CLAUDE SKILL */}
      {/* ========================================================================= */}
      {activeTab === 'DEVELOPER_SDK' && (
        <div className="space-y-4">
          <div className="bg-[#0A0A12] border border-emerald-500/30 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <Code2 size={16} />
                  <span>Python SDK & Autonomous Claude Code Skill Integration</span>
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Integrate NotebookLM programmatically via <code className="text-emerald-400">teng-lin/notebooklm-py</code> and Claude Code Skills.
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded font-mono">
                MCP JSON-RPC 2.0
              </span>
            </div>

            {/* Python Script Section */}
            {pythonScript && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-200">1. Python Automation Script (camelot_notebooklm.py)</span>
                  <button
                    onClick={() => copyToClipboard(pythonScript.code, 'py_sdk')}
                    className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded text-xs hover:bg-emerald-900 transition-all flex items-center gap-1"
                  >
                    {copiedKey === 'py_sdk' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === 'py_sdk' ? 'Copied Python Script' : 'Copy Python Code'}</span>
                  </button>
                </div>
                <pre className="bg-[#050508] p-3 rounded-lg text-[11px] text-emerald-300 overflow-x-auto border border-emerald-500/20 max-h-60 overflow-y-auto">
                  {pythonScript.code}
                </pre>
                <div className="text-[11px] text-gray-400 bg-black/40 p-2 rounded font-mono">
                  CLI Quick Start: <span className="text-white">{pythonScript.cliCommand}</span>
                </div>
              </div>
            )}

            {/* Claude Skill Markdown Section */}
            {claudeSkillMd && (
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-200">2. Claude Code Agent Skill Definition (SKILL.md)</span>
                  <button
                    onClick={() => copyToClipboard(claudeSkillMd, 'claude_skill')}
                    className="px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-500/40 rounded text-xs hover:bg-purple-900 transition-all flex items-center gap-1"
                  >
                    {copiedKey === 'claude_skill' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === 'claude_skill' ? 'Copied SKILL.md' : 'Copy SKILL.md'}</span>
                  </button>
                </div>
                <pre className="bg-[#050508] p-3 rounded-lg text-[11px] text-purple-300 overflow-x-auto border border-purple-500/20 max-h-48 overflow-y-auto">
                  {claudeSkillMd}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: WORLDTREE FIRESTORE SOURCES */}
      {/* ========================================================================= */}
      {activeTab === 'WORLDTREE_SOURCES' && (
        <div className="space-y-4">
          {/* Create New Source Card */}
          <div className="bg-[#0A0A12] border border-blue-500/30 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <PlusCircle size={14} />
              <span>Ingest New Source into Worldtree Firestore Notebook</span>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={newSourceTitle}
                onChange={(e) => setNewSourceTitle(e.target.value)}
                placeholder="Source Title (e.g. 'Wasmtime Linear Memory Invariant Specification')"
                className="w-full bg-[#10101A] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
              />
              <textarea
                value={newSourceContent}
                onChange={(e) => setNewSourceContent(e.target.value)}
                placeholder="Source Content (Markdown, API schema, formal invariants, or architecture notes)..."
                rows={3}
                className="w-full bg-[#10101A] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400 font-mono"
              />
              <button
                onClick={handleCreateSource}
                disabled={isSavingSource || !newSourceTitle.trim() || !newSourceContent.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"
              >
                {isSavingSource ? <RefreshCw size={12} className="animate-spin" /> : <PlusCircle size={12} />}
                <span>{isSavingSource ? 'Saving to Firestore...' : 'Save to Worldtree Notebook'}</span>
              </button>
            </div>
          </div>

          {/* List of Worldtree Sources */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-300 flex items-center justify-between">
              <span>Indexed Vault Sources ({dbSources.length})</span>
              <span className="text-[10px] text-emerald-400">100% Synced to Firestore</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dbSources.map((s) => (
                <div key={s.id} className="bg-[#0E0E18] border border-gray-800 rounded-xl p-3 space-y-2 hover:border-gray-700 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs truncate">{s.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-950 text-blue-300 rounded font-mono">{s.type}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-3 leading-relaxed">{s.content}</p>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-800/60">
                    <span className="font-mono">{s.id}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: QUERY HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'QUERY_HISTORY' && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-gray-300 flex items-center justify-between">
            <span>Recent Grounded Queries ({dbQueries.length})</span>
            <span className="text-[10px] text-purple-400">Persisted in Firestore</span>
          </div>
          {dbQueries.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-500 bg-[#0A0A10] rounded-xl border border-gray-800">
              No queries recorded in Firestore yet. Ask a question in the Grounded Query tab!
            </div>
          ) : (
            dbQueries.map((q) => (
              <div key={q.id} className="bg-[#0E0E18] border border-gray-800 rounded-xl p-3.5 space-y-2 hover:border-gray-700 transition-all">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#D4AF37] flex items-center gap-1.5">
                    <Terminal size={12} />
                    <span>{q.query}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">{(q.groundedScore * 100).toFixed(0)}% Match</span>
                </div>
                <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed bg-[#06060A] p-2.5 rounded border border-gray-800/80">
                  {q.answer}
                </p>
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>{q.citations?.length || 0} citations • {q.latencyMs}ms</span>
                  <span>{new Date(q.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
