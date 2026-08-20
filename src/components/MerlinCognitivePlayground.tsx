import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Terminal, 
  Send, 
  RefreshCw, 
  Flame, 
  ShieldCheck, 
  CheckCircle2, 
  Sliders, 
  Layers, 
  Copy, 
  Check, 
  Cpu, 
  Zap, 
  Volume2, 
  MessageSquare, 
  BookOpen, 
  FileText, 
  Download, 
  UserCheck, 
  Code2, 
  Gauge, 
  ChevronRight,
  Play,
  Save,
  History,
  GitFork,
  Trash2,
  Plus,
  Pin,
  PinOff,
  Vote,
  Compass,
  Tag,
  Clock,
  Shield,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  TrendingUp,
  Activity,
  BarChart2,
  Columns,
  X
} from 'lucide-react';
import { 
  ArchmagePersona, 
  CouncilDebateMode, 
  CouncilMessage, 
  CouncilDebateSession,
  GenesisCartridgeInstance,
  GenesisTargetArchetype
} from '../types';
import { ConsensusVelocityChart } from './ConsensusVelocityChart';
import { ArchmageDeliberationLogViewer } from './ArchmageDeliberationLogViewer';
import {
  saveCouncilDebate,
  fetchUserCouncilDebates,
  subscribeUserCouncilDebates,
  fetchCouncilDebateById,
  deleteCouncilDebate,
  saveGenesisCartridge,
  auth
} from '../lib/firebase';

interface MerlinCognitivePlaygroundProps {
  onNotify: (message: string, type?: 'success' | 'warning') => void;
  onDeployToGenesis?: (topic: string, prd: string) => void;
  onForkToGenesis?: (cartridge: GenesisCartridgeInstance) => void;
}

const ARCHMAGE_LIST: { id: ArchmagePersona; name: string; avatar: string; color: string; role: string }[] = [
  { id: 'MERLIN_OMEGA', name: 'Merlin Ω', avatar: '🧙‍♂️', color: '#D4AF37', role: 'MFOE Orchestrator' },
  { id: 'ANYA_OMEGA', name: 'Anya Ω', avatar: '🎭', color: '#EC4899', role: 'Prompt Alchemist' },
  { id: 'LADY_APIS', name: 'Lady Apis', avatar: '🐝', color: '#06B6D4', role: 'Socratic Inquisitor' },
  { id: 'SIR_GIDEON', name: 'Sir Gideon', avatar: '🛡️', color: '#EF4444', role: 'SRE Warden' },
  { id: 'FORMALIS_OMEGA', name: 'Formalis Ω', avatar: '⚖️', color: '#8B5CF6', role: 'Z3 Theorem Prover' },
  { id: 'SIR_CODEX', name: 'Sir Codex', avatar: '📜', color: '#10B981', role: 'AST Code Synthesizer' },
  { id: 'GEOMETRA_OMEGA', name: 'Geometra Ω', avatar: '📐', color: '#F59E0B', role: 'Spatial UI Architect' },
  { id: 'GRAPHAEL_OMEGA', name: 'Graphael Ω', avatar: '🕸️', color: '#3B82F6', role: 'DAG Flow Optimizer' },
  { id: 'SIR_CASTOR', name: 'Sir Castor', avatar: '⚡', color: '#6366F1', role: 'Stdio / IPC Engine' }
];

const PRESET_TOPICS = [
  'Genesis Intake Cartridge: Autonomous Human Intent Compiler',
  'Wasmtime MicroVM Linear Memory Invariant Sandbox',
  'Topological Graph Vector Cache with 24D Leech Lattice',
  'Zero-Trust Capability Leases with Stripe Instant Billing Gate'
];

export function MerlinCognitivePlayground({ 
  onNotify, 
  onDeployToGenesis,
  onForkToGenesis 
}: MerlinCognitivePlaygroundProps) {
  // Session Identity & Persistence
  const [sessionId, setSessionId] = useState<string>(() => `debate_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  const [topic, setTopic] = useState('Genesis Intake Cartridge: Autonomous Human Intent Compiler');
  const [mode, setMode] = useState<CouncilDebateMode>('SOCRATIC_IDEATION');
  const [messages, setMessages] = useState<CouncilMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [ambiguityScore, setAmbiguityScore] = useState(0.42);
  const [consensusPercentage, setConsensusPercentage] = useState(65);
  const [z3Verified, setZ3Verified] = useState(false);
  const [targetArchmage, setTargetArchmage] = useState<ArchmagePersona | 'ALL'>('ALL');
  
  // Collaborative Brainstorming: Pinned Invariants, Notes, & Tags
  const [pinnedInvariants, setPinnedInvariants] = useState<string[]>([
    'Memory_Delta <= 0.12 MiB per node',
    'Type_Safety == True (Strict AST Compiler)',
    'API_Key_Exposure == False (Zero Browser Leak)'
  ]);
  const [newInvariantInput, setNewInvariantInput] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionTags, setSessionTags] = useState<string[]>(['#Genesis', '#Archmage', '#Z3']);
  const [newTagInput, setNewTagInput] = useState('');
  const [forkCount, setForkCount] = useState(0);
  const [forkedCartridgeIds, setForkedCartridgeIds] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'SYNCED' | 'SAVING' | 'IDLE'>('IDLE');
  
  // History Vault Drawer & Saved Debates
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [savedDebates, setSavedDebates] = useState<CouncilDebateSession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilterSpecial, setHistoryFilterSpecial] = useState<'ALL' | 'PRD_ONLY' | 'Z3_ONLY' | 'FORKED_ONLY'>('ALL');
  const [historyFilterTag, setHistoryFilterTag] = useState<string | null>(null);
  const [previewingDebateId, setPreviewingDebateId] = useState<string | null>(null);

  // Fork Strategy Modal
  const [isForkModalOpen, setIsForkModalOpen] = useState(false);
  const [forkName, setForkName] = useState('');
  const [forkDescription, setForkDescription] = useState('');
  const [forkArchetype, setForkArchetype] = useState<GenesisTargetArchetype>('AUTONOMOUS_INTENT_COMPILER');
  const [forkInvariants, setForkInvariants] = useState<string[]>([]);
  const [forkGateThreshold, setForkGateThreshold] = useState(0.20);
  const [forkPublisher, setForkPublisher] = useState('Anya_Ingress_Node');
  const [forkQuarantine, setForkQuarantine] = useState(true);
  const [isForking, setIsForking] = useState(false);

  // Crystallized PRD Modal/Drawer
  const [crystallizedPRD, setCrystallizedPRD] = useState<string | null>(null);
  const [isCrystallizing, setIsCrystallizing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // UI Panels & Views
  const [showInvariantsPanel, setShowInvariantsPanel] = useState(true);
  const [userRoleBadge, setUserRoleBadge] = useState<'OPERATOR' | 'ARCHITECT' | 'SRE_AUDITOR'>('OPERATOR');
  const [mainChamberView, setMainChamberView] = useState<'STREAM' | 'LOG_VIEWER' | 'VELOCITY_D3' | 'SPLIT'>('STREAM');
  const [vaultVelocityDebate, setVaultVelocityDebate] = useState<CouncilDebateSession | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting from Merlin and Anya if new session
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'init_merlin',
          persona: 'MERLIN_OMEGA',
          role: 'archmage',
          name: 'Merlin Ω',
          title: 'MFOE Orchestrator & Supreme Router',
          avatar: '🧙‍♂️',
          color: '#D4AF37',
          text: `Welcome to the Nine-Seat Archmage Collective Brainstorming Sandbox. We stand ready to debate, test, and mathematically prove the architectural blueprint for "${topic}". State your constraints or challenge our invariants.`,
          tone: 'architectural',
          argumentType: 'PROPOSAL',
          timestamp: new Date().toISOString()
        },
        {
          id: 'init_anya',
          persona: 'ANYA_OMEGA',
          role: 'archmage',
          name: 'Anya Ω',
          title: 'Prompt Alchemist & Ingress Gatekeeper',
          avatar: '🎭',
          color: '#EC4899',
          text: `Yo, Creator! The collective brainstorming canvas is live. Formalis Ω is checking Z3 invariants, Lady Apis is hunting ambiguities, and Sir Gideon is armed with the 5-Stage Crucible. Once we reach consensus, you can fork this strategy directly into Genesis Intake!`,
          tone: 'poetic_chaos',
          argumentType: 'PROPOSAL',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, []);

  // Set up real-time subscription for debates from Firestore
  useEffect(() => {
    setIsLoadingHistory(true);
    const user = auth.currentUser;
    const unsubscribe = subscribeUserCouncilDebates(
      user?.uid,
      (debates) => {
        if (debates && debates.length > 0) {
          setSavedDebates(debates);
        } else {
          // Check local storage fallback
          const local = localStorage.getItem('camelot_saved_debates');
          if (local) {
            try {
              setSavedDebates(JSON.parse(local));
            } catch (e) {}
          }
        }
        setIsLoadingHistory(false);
      },
      (err) => {
        console.warn('Subscription fallback to one-time query:', err);
        loadSavedDebates();
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load debates from Firestore or local fallback
  const loadSavedDebates = async () => {
    setIsLoadingHistory(true);
    try {
      const user = auth.currentUser;
      const debates = await fetchUserCouncilDebates(user?.uid);
      if (debates && debates.length > 0) {
        setSavedDebates(debates);
      } else {
        // Check local storage fallback
        const local = localStorage.getItem('camelot_saved_debates');
        if (local) {
          try {
            setSavedDebates(JSON.parse(local));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Failed to load debates from Firestore:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Auto-Save / Explicit Save Current Debate Session
  const handleSaveDebate = async (silent = false) => {
    setSaveStatus('SAVING');
    const user = auth.currentUser;
    const currentSession: CouncilDebateSession = {
      id: sessionId,
      topic,
      mode,
      messages,
      ambiguityScore,
      consensusPercentage,
      activeArchmages: ARCHMAGE_LIST.map(a => a.id),
      crystallizedPRD: crystallizedPRD || undefined,
      z3Verified,
      authorUid: user?.uid || 'SYSTEM_CANONICAL',
      pinnedInvariants,
      notes: sessionNotes,
      tags: sessionTags,
      forkedCartridgeIds,
      forkCount,
      createdAt: messages[0]?.timestamp || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await saveCouncilDebate(currentSession);
      // Also update local list and storage
      setSavedDebates(prev => {
        const filtered = prev.filter(d => d.id !== currentSession.id);
        const updated = [currentSession, ...filtered];
        try {
          localStorage.setItem('camelot_saved_debates', JSON.stringify(updated.slice(0, 20)));
        } catch (e) {}
        return updated;
      });
      setSaveStatus('SYNCED');
      if (!silent) {
        onNotify('☁️ Debate session persisted to Firestore!', 'success');
      }
    } catch (err: any) {
      console.error('Failed to save debate session:', err);
      setSaveStatus('IDLE');
      if (!silent) {
        onNotify('Local debate buffer updated (Firestore offline)', 'warning');
      }
    }
  };

  // Restore a saved debate
  const handleRestoreDebate = (saved: CouncilDebateSession) => {
    setSessionId(saved.id);
    setTopic(saved.topic);
    setMode(saved.mode);
    setMessages(saved.messages || []);
    setAmbiguityScore(saved.ambiguityScore ?? 0.35);
    setConsensusPercentage(saved.consensusPercentage ?? 70);
    setZ3Verified(saved.z3Verified ?? false);
    setPinnedInvariants(saved.pinnedInvariants || []);
    setSessionNotes(saved.notes || '');
    setSessionTags(saved.tags || ['#Genesis']);
    setForkCount(saved.forkCount || 0);
    setForkedCartridgeIds(saved.forkedCartridgeIds || []);
    if (saved.crystallizedPRD) setCrystallizedPRD(saved.crystallizedPRD);
    setIsHistoryOpen(false);
    onNotify(`Restored debate: "${saved.topic}"`, 'success');
  };

  // Clone/Fork a saved debate into a new live thread
  const handleCloneDebate = (saved: CouncilDebateSession, e: React.MouseEvent) => {
    e.stopPropagation();
    const clonedId = `debate_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cloned: CouncilDebateSession = {
      ...saved,
      id: clonedId,
      topic: `${saved.topic} (Forked Thread)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    handleRestoreDebate(cloned);
    setTimeout(() => handleSaveDebate(true), 300);
    onNotify(`Branched into new thread: "${cloned.topic}"`, 'success');
  };

  // Export Debate as Markdown
  const handleExportDebateMarkdown = (saved: CouncilDebateSession, e: React.MouseEvent) => {
    e.stopPropagation();
    let md = `# ARCHMAGE COUNCIL DEBATE CHRONICLE\n`;
    md += `**Topic:** ${saved.topic}\n`;
    md += `**Mode:** ${saved.mode}\n`;
    md += `**Session ID:** ${saved.id}\n`;
    md += `**Timestamp:** ${new Date(saved.updatedAt).toLocaleString()}\n`;
    md += `**Ambiguity Score:** ${((saved.ambiguityScore ?? 0.4) * 100).toFixed(1)}%\n`;
    md += `**Consensus:** ${saved.consensusPercentage ?? 65}%\n`;
    md += `**Z3 SMT Invariant Proof:** ${saved.z3Verified ? 'SAT (VERIFIED)' : 'UNVERIFIED'}\n\n`;

    if (saved.pinnedInvariants && saved.pinnedInvariants.length > 0) {
      md += `## Pinned Architectural Invariants\n`;
      saved.pinnedInvariants.forEach(inv => {
        md += `- [x] \`${inv}\`\n`;
      });
      md += `\n`;
    }

    if (saved.crystallizedPRD) {
      md += `## Crystallized Product Requirements Document\n\n${saved.crystallizedPRD}\n\n`;
    }

    md += `## Debate Transcript (${saved.messages?.length || 0} turns)\n\n`;
    saved.messages?.forEach((msg, idx) => {
      md += `### [Turn ${idx + 1}] ${msg.name} (${msg.role.toUpperCase()}) - ${msg.argumentType || 'PROPOSAL'}\n`;
      md += `_${msg.timestamp}_\n\n`;
      md += `${msg.text}\n\n`;
      if (msg.z3Constraint) {
        md += `*Z3 Constraint:* \`${msg.z3Constraint}\`\n\n`;
      }
      if (msg.suggestedAction) {
        md += `*Suggested Action:* ${msg.suggestedAction}\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `council_debate_${saved.id.substring(0, 12)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Downloaded Debate Markdown Chronicle!', 'success');
  };

  // Export Debate as JSON
  const handleExportDebateJSON = (saved: CouncilDebateSession, e: React.MouseEvent) => {
    e.stopPropagation();
    const jsonStr = JSON.stringify(saved, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `council_debate_${saved.id.substring(0, 12)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Downloaded Debate JSON Payload!', 'success');
  };

  // Delete a saved debate
  const handleDeleteDebate = async (debateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteCouncilDebate(debateId);
      setSavedDebates(prev => prev.filter(d => d.id !== debateId));
      onNotify('Debate record deleted', 'success');
    } catch (err: any) {
      onNotify('Failed to delete debate record', 'warning');
    }
  };

  // Start a fresh debate
  const handleNewDebate = () => {
    const newId = `debate_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setSessionId(newId);
    setTopic('Genesis Intake Cartridge: Autonomous Human Intent Compiler');
    setMessages([
      {
        id: `init_merlin_${Date.now()}`,
        persona: 'MERLIN_OMEGA',
        role: 'archmage',
        name: 'Merlin Ω',
        title: 'MFOE Orchestrator & Supreme Router',
        avatar: '🧙‍♂️',
        color: '#D4AF37',
        text: `New collective brainstorming canvas initialized. What sovereign architecture or multi-agent pipeline shall we formulate?`,
        tone: 'architectural',
        argumentType: 'PROPOSAL',
        timestamp: new Date().toISOString()
      }
    ]);
    setAmbiguityScore(0.40);
    setConsensusPercentage(60);
    setZ3Verified(false);
    setCrystallizedPRD(null);
    setForkCount(0);
    setForkedCartridgeIds([]);
    onNotify('✨ Fresh brainstorming session started', 'success');
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onNotify('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Trigger a debate round
  const handleSendTurn = async (forcedPrompt?: string) => {
    const p = forcedPrompt !== undefined ? forcedPrompt : inputPrompt;
    setLoading(true);
    try {
      const res = await fetch('/api/council/debate-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          mode,
          messageHistory: messages,
          userPrompt: p ? `[${userRoleBadge}]: ${p}` : undefined,
          requestedPersona: targetArchmage === 'ALL' ? undefined : targetArchmage
        })
      });

      const data = await res.json();
      if (data.success && data.newMessages) {
        const updatedMsgs = [...messages, ...data.newMessages];
        setMessages(updatedMsgs);
        setAmbiguityScore(data.ambiguityScore);
        setConsensusPercentage(data.consensusPercentage);
        setZ3Verified(data.z3Verified);
        if (p) setInputPrompt('');
        onNotify(`Archmage debate round executed (${data.newMessages.length} responses)`, 'success');
        
        // Auto-save session
        setTimeout(() => handleSaveDebate(true), 500);
      } else {
        throw new Error(data.error || 'Failed to execute debate turn');
      }
    } catch (err: any) {
      console.error(err);
      onNotify(`Debate Error: ${err.message}`, 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Consensus Poll
  const handleTriggerConsensusVote = () => {
    handleSendTurn(`COUNCIL VOTE INITIATIVE: All Archmages cast an official consensus vote on the current architectural proposal for "${topic}". State [PASS/REFINE/FAIL] with primary invariant rationale.`);
  };

  // Trigger Socratic Ambiguity Inquest
  const handleTriggerSocraticInquest = () => {
    setTargetArchmage('LADY_APIS');
    handleSendTurn(`Lady Apis, conduct a rigorous Socratic Inquest. Extract exact missing entities, API boundaries, and clarify ambiguous variables to force our ambiguity score below 20%.`);
  };

  // Trigger Formalis Z3 Check
  const handleTriggerZ3Check = () => {
    setTargetArchmage('FORMALIS_OMEGA');
    handleSendTurn(`Formalis Ω, analyze all stated invariants in SMT-LIB logic. Prove or disprove satisfiability for memory bounds (<= 0.12 MiB), API key containment, and non-blocking streaming.`);
  };

  // Simulate or Trigger Targeted Archmage Deliberation in Real-Time Log Viewer
  const handleSimulateArchmageDeliberation = (persona: ArchmagePersona) => {
    setTargetArchmage(persona);
    const arch = ARCHMAGE_LIST.find(a => a.id === persona);
    
    // Check if we have standard turn logic or fallback synthetic argument
    const promptMap: Record<ArchmagePersona, string> = {
      MERLIN_OMEGA: 'Merlin Ω, synthesize the overarching architectural consensus and define the MFOE routing contract.',
      ANYA_OMEGA: 'Anya Ω, convert our current invariants into an executable Genesis prompt harness with strict boundary assertions.',
      LADY_APIS: 'Lady Apis, conduct a deep Socratic inquest on any remaining ambiguities, variable leaks, or missing schema boundaries.',
      SIR_GIDEON: 'Sir Gideon, test our system against the 5 Gideon failure modes (Sensor Dropout, Memory Partition, Lag, Quality Anomaly, WIP Overflow).',
      FORMALIS_OMEGA: 'Formalis Ω, assert SMT-LIB theorem satisfiability for linear memory Δ <= 0.12 MiB and AST invariance.',
      SIR_CODEX: 'Sir Codex, generate the strict AST grammar definition and verify that no untyped runtime escapes exist.',
      GEOMETRA_OMEGA: 'Geometra Ω, evaluate the spatial UI token hierarchy and ensure zero cognitive overload in multi-device rendering.',
      GRAPHAEL_OMEGA: 'Graphael Ω, compute topological DAG bottlenecks and optimize parallel execution flow resistance.',
      SIR_CASTOR: 'Sir Castor, inspect bare-metal Stdio / IPC stream latency and enforce sub-150ms packet delivery.'
    };

    const targetPrompt = promptMap[persona] || `Deliberate on topic "${topic}".`;
    handleSendTurn(`[DIRECTIVE TO ${arch?.name || persona}]: ${targetPrompt}`);
  };

  // Add / Pin Invariant
  const handleAddPinnedInvariant = (inv?: string) => {
    const text = inv || newInvariantInput.trim();
    if (!text) return;
    if (!pinnedInvariants.includes(text)) {
      const updated = [...pinnedInvariants, text];
      setPinnedInvariants(updated);
      onNotify(`Pinned Invariant: ${text}`, 'success');
      handleSaveDebate(true);
    }
    setNewInvariantInput('');
  };

  const handleRemovePinnedInvariant = (index: number) => {
    const updated = pinnedInvariants.filter((_, i) => i !== index);
    setPinnedInvariants(updated);
    handleSaveDebate(true);
  };

  // Add Tag
  const handleAddTag = () => {
    let t = newTagInput.trim();
    if (!t) return;
    if (!t.startsWith('#')) t = '#' + t;
    if (!sessionTags.includes(t)) {
      setSessionTags([...sessionTags, t]);
    }
    setNewTagInput('');
  };

  // Crystallize PRD Blueprint
  const handleCrystallizePRD = async () => {
    setIsCrystallizing(true);
    try {
      const res = await fetch('/api/council/crystallize-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          mode,
          messages
        })
      });
      const data = await res.json();
      if (data.success && data.prd) {
        setCrystallizedPRD(data.prd);
        onNotify('✨ Synthesized Sovereign PRD Specification!', 'success');
        handleSaveDebate(true);
      }
    } catch (err: any) {
      console.error(err);
      onNotify('Failed to crystallize PRD: ' + err.message, 'warning');
    } finally {
      setIsCrystallizing(false);
    }
  };

  // Open Fork Strategy Modal
  const handleOpenForkModal = () => {
    const cleanName = topic
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .split(' ')
      .slice(0, 4)
      .join('_')
      .toUpperCase() || 'GENESIS_INTAKE';
    
    setForkName(`FORK_${cleanName}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
    setForkDescription(`Forked strategy instance from Archmage Council debate on "${topic}". Inherited ${pinnedInvariants.length} verified invariants and PRD specification.`);
    setForkInvariants([...pinnedInvariants]);
    setIsForkModalOpen(true);
  };

  // Execute Fork Strategy into Genesis Intake Cartridge
  const handleExecuteFork = async () => {
    setIsForking(true);
    try {
      const user = auth.currentUser;
      const cartridgeId = `genesis_cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      
      const newCartridge: GenesisCartridgeInstance = {
        id: cartridgeId,
        name: forkName || `Genesis_Cartridge_${Date.now()}`,
        description: forkDescription,
        originDebateId: sessionId,
        originDebateTopic: topic,
        forkTimestamp: new Date().toISOString(),
        inheritedInvariants: forkInvariants,
        prdContent: crystallizedPRD || `# Sovereign PRD: ${forkName}\n\n## Topic\n${topic}\n\n## Inherited Invariants\n${forkInvariants.map(inv => `- ${inv}`).join('\n')}`,
        authorUid: user?.uid || 'SYSTEM_CANONICAL',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        targetArchetype: forkArchetype,
        ingressConfig: {
          gateThreshold: forkGateThreshold,
          defaultPublisher: forkPublisher,
          quarantineSecretBoundary: forkQuarantine
        },
        status: 'FORKED'
      };

      // Persist to Firestore
      await saveGenesisCartridge(newCartridge);

      // Update current debate tracking
      const updatedForkCount = forkCount + 1;
      const updatedForkIds = [...forkedCartridgeIds, cartridgeId];
      setForkCount(updatedForkCount);
      setForkedCartridgeIds(updatedForkIds);

      // Save debate with fork link
      await saveCouncilDebate({
        id: sessionId,
        topic,
        mode,
        messages,
        ambiguityScore,
        consensusPercentage,
        activeArchmages: ARCHMAGE_LIST.map(a => a.id),
        crystallizedPRD: crystallizedPRD || undefined,
        z3Verified,
        authorUid: user?.uid || 'SYSTEM_CANONICAL',
        pinnedInvariants,
        notes: sessionNotes,
        tags: sessionTags,
        forkedCartridgeIds: updatedForkIds,
        forkCount: updatedForkCount,
        createdAt: messages[0]?.timestamp || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setIsForkModalOpen(false);
      onNotify(`🔱 Successfully forked strategy to Genesis Cartridge: "${newCartridge.name}"!`, 'success');

      // Dispatch to Genesis Studio
      if (onForkToGenesis) {
        onForkToGenesis(newCartridge);
      } else if (onDeployToGenesis) {
        onDeployToGenesis(newCartridge.name, newCartridge.prdContent);
      }
    } catch (err: any) {
      console.error('Failed to fork strategy to Genesis:', err);
      onNotify(`Fork Error: ${err.message}`, 'warning');
    } finally {
      setIsForking(false);
    }
  };

  return (
    <div id="merlin-cognitive-playground-root" className="space-y-4 font-mono text-gray-200">
      {/* Top Header & Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A35] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#D4AF37]/10 border border-[#D4AF37]/40 rounded-lg text-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.25)]">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Collective Brainstorming Sandbox</h3>
              <span className="text-[10px] px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-500/40 rounded font-bold flex items-center gap-1">
                <Cpu size={11} />
                <span>9-SEAT ARCHMAGE COUNCIL</span>
              </span>
              {forkCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-500/40 rounded font-bold flex items-center gap-1">
                  <GitFork size={10} />
                  <span>{forkCount} FORK{forkCount > 1 ? 'S' : ''} ACTIVE</span>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">Multi-Agent Socratic Debate • Firestore History Persistence • Zero-Loss Strategy Forking to Genesis</p>
          </div>
        </div>

        {/* Action Controls & Real-Time Indicators */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* History Vault Button */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="bg-[#141420] hover:bg-[#1C1C2C] text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-gray-800 flex items-center gap-1.5 transition-all text-xs"
            title="Open Debate History Vault"
          >
            <History size={13} className="text-[#D4AF37]" />
            <span>Vault ({savedDebates.length})</span>
          </button>

          {/* Save Debate Button */}
          <button
            onClick={() => handleSaveDebate(false)}
            disabled={saveStatus === 'SAVING'}
            className="bg-[#141420] hover:bg-[#1C1C2C] text-gray-300 hover:text-[#D4AF37] px-3 py-1.5 rounded-lg border border-gray-800 flex items-center gap-1.5 transition-all text-xs"
            title="Persist Debate Session to Firestore"
          >
            <Save size={13} className={saveStatus === 'SAVING' ? 'animate-spin text-[#D4AF37]' : 'text-gray-400'} />
            <span>{saveStatus === 'SAVING' ? 'Saving...' : saveStatus === 'SYNCED' ? 'Synced ☁️' : 'Save Session'}</span>
          </button>

          {/* New Debate Button */}
          <button
            onClick={handleNewDebate}
            className="bg-[#141420] hover:bg-[#1C1C2C] text-gray-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-gray-800 flex items-center gap-1 text-xs"
            title="Start New Debate Session"
          >
            <Plus size={13} />
            <span>New</span>
          </button>

          {/* Ambiguity Score */}
          <div className="bg-[#101018] px-3 py-1.5 rounded-lg border border-gray-800 flex items-center gap-2">
            <span className="text-gray-400 text-[11px]">Ambiguity:</span>
            <span className={`font-bold ${ambiguityScore < 0.2 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {(ambiguityScore * 100).toFixed(1)}%
            </span>
            <span className="text-[10px] text-gray-500">(&lt;20% Gate)</span>
          </div>

          {/* Consensus Meter */}
          <div className="bg-[#101018] px-3 py-1.5 rounded-lg border border-gray-800 flex items-center gap-2">
            <span className="text-gray-400 text-[11px]">Consensus:</span>
            <span className="font-bold text-cyan-400">{consensusPercentage}%</span>
          </div>

          {/* D3 Consensus Velocity Quick Toggle */}
          <button
            onClick={() => setMainChamberView(mainChamberView === 'VELOCITY_D3' ? 'STREAM' : 'VELOCITY_D3')}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-all ${
              mainChamberView === 'VELOCITY_D3'
                ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                : 'bg-[#101018] border-gray-800 text-gray-300 hover:text-white'
            }`}
            title="Toggle D3.js Consensus Velocity Chart"
          >
            <TrendingUp size={13} className="text-[#D4AF37]" />
            <span>D3 Velocity</span>
          </button>

          {/* Z3 Status */}
          <div className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-bold ${
            z3Verified 
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' 
              : 'bg-purple-950/40 border-purple-500/30 text-purple-300'
          }`}>
            <ShieldCheck size={13} />
            <span>{z3Verified ? 'Z3 SAT' : 'Z3 PENDING'}</span>
          </div>

          {/* Primary Fork to Genesis Button */}
          <button
            onClick={handleOpenForkModal}
            className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <GitFork size={13} />
            <span>Fork to Genesis</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Control & Topics + Brainstorming Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left / Center Area: Main Debate Engine (9 cols on lg) */}
        <div className="lg:col-span-9 space-y-3">
          {/* Topic & Mode Control Bar */}
          <div className="bg-[#0D0D16] border border-gray-800 rounded-xl p-3 space-y-3">
            <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
              <div className="flex-1">
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Enter Project / Architectural Topic for Collective Brainstorming..."
                  className="w-full bg-[#07070C] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto">
                {[
                  { id: 'SOCRATIC_IDEATION' as CouncilDebateMode, label: 'Socratic Ideation' },
                  { id: 'ADVERSARIAL_CRITIQUE' as CouncilDebateMode, label: 'Adversarial SRE' },
                  { id: 'Z3_THEOREM_STRESS' as CouncilDebateMode, label: 'Z3 SMT Stress' },
                  { id: 'KINETIC_BRAINSTORM' as CouncilDebateMode, label: 'Kinetic Storm' },
                  { id: 'SPEED_SCAFFOLD' as CouncilDebateMode, label: 'Speed Scaffold' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      mode === m.id
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                        : 'bg-[#141420] text-gray-400 hover:text-gray-200 border border-gray-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Topic Presets & Fast Inquest Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-800/60 pt-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-gray-500">Presets:</span>
                {PRESET_TOPICS.map((pt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTopic(pt);
                      handleSendTurn(`Let's brainstorm & debate: ${pt}`);
                    }}
                    className="text-[10px] bg-[#141420] hover:bg-[#1C1C2C] text-gray-300 hover:text-[#D4AF37] px-2 py-1 rounded border border-gray-800 transition-colors"
                  >
                    {pt}
                  </button>
                ))}
              </div>

              {/* Fast Socratic Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleTriggerConsensusVote}
                  disabled={loading}
                  className="px-2.5 py-1 bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 rounded text-[11px] font-bold flex items-center gap-1 transition-all"
                  title="Trigger instant Council consensus poll"
                >
                  <Vote size={11} />
                  <span>Council Vote</span>
                </button>

                <button
                  onClick={handleTriggerSocraticInquest}
                  disabled={loading}
                  className="px-2.5 py-1 bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 rounded text-[11px] font-bold flex items-center gap-1 transition-all"
                  title="Trigger Lady Apis Ambiguity Resolution"
                >
                  <Compass size={11} />
                  <span>Ambiguity Inquest</span>
                </button>

                <button
                  onClick={handleTriggerZ3Check}
                  disabled={loading}
                  className="px-2.5 py-1 bg-purple-950/70 hover:bg-purple-900/80 text-purple-300 border border-purple-500/40 rounded text-[11px] font-bold flex items-center gap-1 transition-all"
                  title="Run Formalis Z3 Theorem Prover"
                >
                  <ShieldCheck size={11} />
                  <span>Z3 SMT Invariants</span>
                </button>
              </div>
            </div>
          </div>

          {/* Archmage Roster & Reticle Selector */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-10 gap-1.5">
            <button
              onClick={() => setTargetArchmage('ALL')}
              className={`p-2 rounded-lg border text-center transition-all text-xs font-bold ${
                targetArchmage === 'ALL'
                  ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                  : 'bg-[#0E0E18] border-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="text-base">👑</div>
              <div className="text-[10px] mt-0.5">Full Council</div>
            </button>

            {ARCHMAGE_LIST.map(arch => (
              <button
                key={arch.id}
                onClick={() => setTargetArchmage(arch.id)}
                className={`p-2 rounded-lg border text-center transition-all text-xs font-bold ${
                  targetArchmage === arch.id
                    ? 'bg-purple-900/30 border-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    : 'bg-[#0E0E18] border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="text-base">{arch.avatar}</div>
                <div className="text-[10px] mt-0.5 truncate" style={{ color: arch.color }}>{arch.name}</div>
              </button>
            ))}
          </div>

          {/* Chamber View Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#090910] p-1.5 rounded-lg border border-gray-800 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMainChamberView('STREAM')}
                className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                  mainChamberView === 'STREAM'
                    ? 'bg-[#181828] text-white border border-gray-700 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <MessageSquare size={13} className="text-blue-400" />
                <span>Socratic Stream ({messages.length})</span>
              </button>

              <button
                onClick={() => setMainChamberView('LOG_VIEWER')}
                className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                  mainChamberView === 'LOG_VIEWER'
                    ? 'bg-purple-950/80 text-purple-200 border border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                    : 'text-gray-400 hover:text-purple-300'
                }`}
              >
                <Terminal size={13} className="text-purple-400 animate-pulse" />
                <span>Real-Time Log Viewer</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping"></span>
              </button>

              <button
                onClick={() => setMainChamberView('VELOCITY_D3')}
                className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                  mainChamberView === 'VELOCITY_D3'
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50 shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                    : 'text-gray-400 hover:text-[#D4AF37]'
                }`}
              >
                <TrendingUp size={13} className="text-[#D4AF37]" />
                <span>Consensus Velocity (D3)</span>
                <span className="text-[9px] px-1 py-0.2 bg-[#D4AF37]/30 text-[#D4AF37] rounded font-mono">
                  {consensusPercentage}%
                </span>
              </button>

              <button
                onClick={() => setMainChamberView('SPLIT')}
                className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                  mainChamberView === 'SPLIT'
                    ? 'bg-purple-950/60 text-purple-200 border border-purple-500/50 shadow-sm'
                    : 'text-gray-400 hover:text-purple-300'
                }`}
              >
                <Columns size={13} className="text-purple-400" />
                <span>Split Stream & Velocity</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-gray-500 pr-1 hidden sm:flex">
              <span>SMT Invariant Mode:</span>
              <span className={z3Verified ? 'text-emerald-400 font-bold' : 'text-purple-400 font-bold'}>
                {z3Verified ? 'Z3_PROVED_SAT' : 'Z3_STRESS_ACTIVE'}
              </span>
            </div>
          </div>

          {/* Real-Time Log Viewer for Archmage Council Arguments */}
          {mainChamberView === 'LOG_VIEWER' && (
            <ArchmageDeliberationLogViewer
              messages={messages}
              topic={topic}
              consensusPercentage={consensusPercentage}
              z3Verified={z3Verified}
              onAddPinnedInvariant={handleAddPinnedInvariant}
              onSimulateArchmageDeliberation={handleSimulateArchmageDeliberation}
              onNotify={onNotify}
            />
          )}

          {/* D3 Consensus Velocity Chart (When in VELOCITY_D3 or SPLIT mode) */}
          {(mainChamberView === 'VELOCITY_D3' || mainChamberView === 'SPLIT') && (
            <ConsensusVelocityChart
              messages={messages}
              currentConsensus={consensusPercentage}
              ambiguityScore={ambiguityScore}
              z3Verified={z3Verified}
              debateMode={mode}
              topic={topic}
              className={mainChamberView === 'SPLIT' ? 'border-purple-500/30' : ''}
            />
          )}

          {/* Main Debate Chamber (Messages Stream) */}
          {(mainChamberView === 'STREAM' || mainChamberView === 'SPLIT') && (
            <div className={`bg-[#07070C] border border-gray-800 rounded-xl p-4 overflow-y-auto space-y-3 ${
              mainChamberView === 'SPLIT' ? 'min-h-[260px] max-h-[380px]' : 'min-h-[380px] max-h-[540px]'
            }`}>
              {messages.map((msg) => {
                const isOperator = msg.role === 'operator';
                return (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isOperator
                        ? 'bg-[#151522] border-blue-500/40 ml-6 text-white shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                        : 'bg-[#0D0D16] border-gray-800/80 mr-4'
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{msg.avatar}</span>
                        <div>
                          <span className="text-xs font-bold" style={{ color: msg.color }}>
                            {msg.name}
                          </span>
                          <span className="text-[10px] text-gray-500 ml-2">({msg.title})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {msg.argumentType && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            msg.argumentType === 'SOCRATIC_CHALLENGE' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' :
                            msg.argumentType === 'Z3_ASSERTION' ? 'bg-purple-950 text-purple-300 border border-purple-500/40' :
                            msg.argumentType === 'FAILURE_WARNING' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                            msg.argumentType === 'SYNTHESIS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                            msg.argumentType === 'CONSENSUS_VOTE' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                            'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                          }`}>
                            {msg.argumentType}
                          </span>
                        )}

                        {/* Pin Statement Action */}
                        <button
                          onClick={() => handleAddPinnedInvariant(msg.text.slice(0, 120))}
                          className="text-gray-500 hover:text-amber-400 p-0.5 transition-colors"
                          title="Pin this proposition into Invariant Vault"
                        >
                          <Pin size={12} />
                        </button>

                        <button
                          onClick={() => copyToClipboard(msg.text, `msg_${msg.id}`)}
                          className="text-gray-500 hover:text-gray-300 p-0.5 transition-colors"
                          title="Copy message"
                        >
                          {copiedKey === `msg_${msg.id}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>

                        <span className="text-[10px] text-gray-600">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    {/* Text Body */}
                    <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap pl-6">
                      {msg.text}
                    </div>

                    {/* Z3 Constraint Highlight */}
                    {msg.z3Constraint && (
                      <div className="mt-2.5 ml-6 bg-[#050508] p-2.5 rounded border border-purple-500/30 text-[11px] font-mono text-purple-300 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-gray-400 font-bold mb-0.5">SMT-LIB Contract Assertion:</div>
                          <code>{msg.z3Constraint}</code>
                        </div>
                        <button
                          onClick={() => handleAddPinnedInvariant(msg.z3Constraint)}
                          className="px-2 py-1 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/50 rounded text-[10px] flex items-center gap-1"
                        >
                          <Pin size={10} />
                          <span>Pin Invariant</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="p-3 bg-[#0D0D16] border border-gray-800 rounded-xl flex items-center gap-2 text-xs text-[#D4AF37] animate-pulse">
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Archmages calculating theorem assertions, debating tradeoffs, and synthesizing propositions...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input & Action Bar */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500">Speaking as:</span>
              {(['OPERATOR', 'ARCHITECT', 'SRE_AUDITOR'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setUserRoleBadge(role)}
                  className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all ${
                    userRoleBadge === role
                      ? 'bg-blue-900/60 text-blue-200 border border-blue-500/50'
                      : 'bg-[#101018] text-gray-500 border border-gray-800'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                value={inputPrompt}
                onChange={e => setInputPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && handleSendTurn()}
                placeholder={`Brainstorm, challenge, or instruct ${targetArchmage === 'ALL' ? 'the Council' : targetArchmage}...`}
                className="w-full bg-[#0E0E17] border border-gray-700 rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] pr-40"
              />
              <div className="absolute right-2 top-2 flex items-center gap-1.5">
                <button
                  onClick={() => handleSendTurn()}
                  disabled={loading}
                  className="bg-[#D4AF37] hover:bg-[#C29B27] disabled:opacity-50 text-black text-xs font-bold px-3.5 py-1.5 rounded transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {loading ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                  <span>{loading ? 'Debating...' : 'Speak'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Area: Pinned Invariants, Strategy Notes & Fork Portal (3 cols on lg) */}
        <div className="lg:col-span-3 space-y-3">
          {/* Pinned Invariants & Axioms Card */}
          <div className="bg-[#0D0D16] border border-gray-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Pin size={14} />
                <span>Pinned Invariants ({pinnedInvariants.length})</span>
              </div>
              <button
                onClick={() => setShowInvariantsPanel(!showInvariantsPanel)}
                className="text-gray-500 hover:text-gray-300 text-xs"
              >
                {showInvariantsPanel ? 'Hide' : 'Show'}
              </button>
            </div>

            {showInvariantsPanel && (
              <div className="space-y-2">
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {pinnedInvariants.map((inv, idx) => (
                    <div
                      key={idx}
                      className="group bg-[#06060A] border border-gray-800/80 rounded p-2 text-[11px] text-gray-300 flex items-start justify-between gap-1.5"
                    >
                      <span className="leading-snug">{inv}</span>
                      <button
                        onClick={() => handleRemovePinnedInvariant(idx)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-rose-400 transition-opacity"
                        title="Unpin invariant"
                      >
                        <PinOff size={11} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Invariant Input */}
                <div className="flex items-center gap-1 pt-1">
                  <input
                    type="text"
                    value={newInvariantInput}
                    onChange={e => setNewInvariantInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddPinnedInvariant()}
                    placeholder="Add invariant (e.g. TPS >= 10k)..."
                    className="flex-1 bg-[#06060A] border border-gray-700 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={() => handleAddPinnedInvariant()}
                    className="p-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded"
                    title="Add Invariant"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PRD Synthesis & Quick Fork Card */}
          <div className="bg-gradient-to-br from-[#12121E] to-[#0A0A10] border border-[#D4AF37]/40 rounded-xl p-3.5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#D4AF37] font-bold text-xs uppercase tracking-wider">
                <FileText size={14} />
                <span>Strategy Crystallizer</span>
              </div>
              <span className="text-[10px] text-gray-400">{messages.length} turns</span>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              Synthesize full multi-agent consensus into a formal PRD specification and immediately fork into a live Genesis Intake cartridge.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={handleCrystallizePRD}
                disabled={isCrystallizing || messages.length < 2}
                className="w-full bg-[#181828] hover:bg-[#202034] text-[#D4AF37] border border-[#D4AF37]/50 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                {isCrystallizing ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                <span>{isCrystallizing ? 'Crystallizing PRD...' : 'Crystallize PRD'}</span>
              </button>

              <button
                onClick={handleOpenForkModal}
                className="w-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <GitFork size={13} />
                <span>🔱 Fork to Genesis Intake</span>
              </button>
            </div>
          </div>

          {/* Session Notes & Tags Card */}
          <div className="bg-[#0D0D16] border border-gray-800 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
              <span>Session Notes</span>
              <span className="text-[10px] text-gray-500">Auto-saved</span>
            </div>

            <textarea
              value={sessionNotes}
              onChange={e => setSessionNotes(e.target.value)}
              onBlur={() => handleSaveDebate(true)}
              placeholder="Operator brainstorm notes, edge cases to explore, or architectural axioms..."
              rows={3}
              className="w-full bg-[#06060A] border border-gray-800 rounded p-2 text-[11px] text-gray-300 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
            />

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1 pt-1">
              {sessionTags.map((tag, idx) => (
                <span key={idx} className="text-[10px] bg-[#141424] text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                  placeholder="#tag"
                  className="bg-[#06060A] border border-gray-800 rounded px-1.5 py-0.5 text-[10px] text-white w-14 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: FORK STRATEGY TO GENESIS INTAKE CARTRIDGE INSTANCE */}
      {/* ========================================================= */}
      {isForkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E0E18] border border-[#D4AF37]/60 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 p-5 font-mono">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-br from-rose-600/20 to-amber-600/20 border border-amber-500/40 rounded-lg text-[#D4AF37]">
                  <GitFork size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase text-white tracking-wider flex items-center gap-2">
                    <span>Fork Strategy to Genesis Intake Instance</span>
                  </h3>
                  <p className="text-xs text-gray-400">Instantiate a Sovereign MicroVM Cartridge with inherited Council axioms</p>
                </div>
              </div>
              <button
                onClick={() => setIsForkModalOpen(false)}
                className="text-gray-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            {/* Cartridge Configuration Form */}
            <div className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block text-gray-300 font-bold mb-1">Genesis Cartridge Instance Name:</label>
                <input
                  type="text"
                  value={forkName}
                  onChange={e => setForkName(e.target.value)}
                  className="w-full bg-[#07070C] border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-300 font-bold mb-1">Strategy Description & Lineage:</label>
                <textarea
                  value={forkDescription}
                  onChange={e => setForkDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-[#07070C] border border-gray-700 rounded-lg px-3 py-2 text-gray-300 font-mono focus:outline-none focus:border-[#D4AF37] resize-none"
                />
              </div>

              {/* Target Archetype Selector */}
              <div>
                <label className="block text-gray-300 font-bold mb-1.5">Target Deployment Archetype:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'AUTONOMOUS_INTENT_COMPILER' as GenesisTargetArchetype, label: 'Autonomous Intent Compiler', desc: 'Anya Ingress + Merlin MFOE + Gideon 5-Stage Crucible' },
                    { id: 'LINEAR_MEMORY_SANDBOX' as GenesisTargetArchetype, label: 'Linear Memory MicroVM', desc: 'Wasmtime 64KB Page Linear Memory Invariant Sandbox' },
                    { id: 'VECTOR_GRAPH_CACHE' as GenesisTargetArchetype, label: 'Topological Graph Vector Cache', desc: '24D Leech Lattice DAG Vector Cache & Flow Optimizer' },
                    { id: 'CAPABILITY_LEASE_GATE' as GenesisTargetArchetype, label: 'Zero-Trust Capability Leases', desc: 'Sentinel Leases with Stripe Instant Billing Gate' },
                    { id: 'CUSTOM_MFE' as GenesisTargetArchetype, label: 'Sovereign Hot-Swap MFE', desc: 'Dioxus / React WASM-Native Micro-Frontend Module' }
                  ].map(arch => (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => setForkArchetype(arch.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        forkArchetype === arch.id
                          ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white'
                          : 'bg-[#07070C] border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-white">{arch.label}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{arch.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inherited Invariants Checklist */}
              <div>
                <label className="block text-gray-300 font-bold mb-1.5">Inherited Invariants & SMT-LIB Constraints ({forkInvariants.length}):</label>
                <div className="bg-[#07070C] border border-gray-800 rounded-lg p-2.5 max-h-32 overflow-y-auto space-y-1.5">
                  {forkInvariants.map((inv, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-gray-300">
                      <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                      <span>{inv}</span>
                    </div>
                  ))}
                  {forkInvariants.length === 0 && (
                    <span className="text-[11px] text-gray-500 italic">No pinned invariants. Default Z3 theorems will be injected.</span>
                  )}
                </div>
              </div>

              {/* Ingress Gateway Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#07070C] p-3 rounded-lg border border-gray-800">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">Gate Threshold:</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    max="0.5"
                    value={forkGateThreshold}
                    onChange={e => setForkGateThreshold(parseFloat(e.target.value))}
                    className="w-full bg-[#101018] border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">Publisher Node:</label>
                  <input
                    type="text"
                    value={forkPublisher}
                    onChange={e => setForkPublisher(e.target.value)}
                    className="w-full bg-[#101018] border border-gray-700 rounded px-2 py-1 text-white text-xs font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="quarantine_check"
                    checked={forkQuarantine}
                    onChange={e => setForkQuarantine(e.target.checked)}
                    className="rounded border-gray-700 text-amber-500"
                  />
                  <label htmlFor="quarantine_check" className="text-[11px] text-gray-300 cursor-pointer">
                    Quarantine Secrets
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-gray-800 pt-3">
              <div className="text-[10px] text-gray-500">
                Origin Debate: #{sessionId.substring(0, 14)}...
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsForkModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteFork}
                  disabled={isForking}
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow-lg"
                >
                  {isForking ? <RefreshCw size={13} className="animate-spin" /> : <GitFork size={13} />}
                  <span>{isForking ? 'Forging Cartridge...' : '🔱 Forge Forked Cartridge'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAWER / MODAL: DEBATE HISTORY VAULT (FIRESTORE PERSISTENCE) */}
      {/* ========================================================= */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0E0E18] border border-[#D4AF37]/40 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.8)] font-mono">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-[#141424] to-[#0A0A12]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#D4AF37]/15 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37]">
                  <History size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Archmage Debate History Vault</h3>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>FIRESTORE SYNCED</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">Persistent Chronicle of Multi-Agent Brainstorming & Architectural Syntheses</p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="p-3.5 border-b border-gray-800/80 bg-[#08080E] space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                    placeholder="Search debate history by topic, invariant, archmage, or tags..."
                    className="w-full bg-[#10101A] border border-gray-700 rounded-lg pl-3 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                  {historySearch && (
                    <button
                      onClick={() => setHistorySearch('')}
                      className="absolute right-2.5 top-2.5 text-gray-500 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  onClick={loadSavedDebates}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 rounded-lg flex items-center gap-1.5 border border-gray-700 transition-colors"
                  title="Force re-fetch from Firestore"
                >
                  <RefreshCw size={13} className={isLoadingHistory ? 'animate-spin text-[#D4AF37]' : ''} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase mr-1">Filter:</span>
                <button
                  onClick={() => { setHistoryFilterSpecial('ALL'); setHistoryFilterTag(null); }}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                    historyFilterSpecial === 'ALL' && !historyFilterTag
                      ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50 font-bold'
                      : 'bg-[#12121E] text-gray-400 hover:text-gray-200 border border-gray-800'
                  }`}
                >
                  All ({savedDebates.length})
                </button>

                <button
                  onClick={() => setHistoryFilterSpecial('PRD_ONLY')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all flex items-center gap-1 ${
                    historyFilterSpecial === 'PRD_ONLY'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                      : 'bg-[#12121E] text-gray-400 hover:text-gray-200 border border-gray-800'
                  }`}
                >
                  <Sparkles size={11} />
                  <span>PRD Synthesized ({savedDebates.filter(d => !!d.crystallizedPRD).length})</span>
                </button>

                <button
                  onClick={() => setHistoryFilterSpecial('Z3_ONLY')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all flex items-center gap-1 ${
                    historyFilterSpecial === 'Z3_ONLY'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold'
                      : 'bg-[#12121E] text-gray-400 hover:text-gray-200 border border-gray-800'
                  }`}
                >
                  <CheckCircle2 size={11} />
                  <span>Z3 Invariant SAT ({savedDebates.filter(d => !!d.z3Verified).length})</span>
                </button>

                <button
                  onClick={() => setHistoryFilterSpecial('FORKED_ONLY')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all flex items-center gap-1 ${
                    historyFilterSpecial === 'FORKED_ONLY'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold'
                      : 'bg-[#12121E] text-gray-400 hover:text-gray-200 border border-gray-800'
                  }`}
                >
                  <GitFork size={11} />
                  <span>Forked ({savedDebates.filter(d => (d.forkCount ?? 0) > 0).length})</span>
                </button>
              </div>
            </div>

            {/* Debates List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {savedDebates
                .filter(d => {
                  if (historyFilterSpecial === 'PRD_ONLY' && !d.crystallizedPRD) return false;
                  if (historyFilterSpecial === 'Z3_ONLY' && !d.z3Verified) return false;
                  if (historyFilterSpecial === 'FORKED_ONLY' && (!d.forkCount || d.forkCount <= 0)) return false;
                  if (historyFilterTag && (!d.tags || !d.tags.includes(historyFilterTag))) return false;

                  if (!historySearch) return true;
                  const q = historySearch.toLowerCase();
                  const topicMatch = d.topic?.toLowerCase().includes(q);
                  const notesMatch = d.notes?.toLowerCase().includes(q);
                  const tagsMatch = d.tags?.some(t => t.toLowerCase().includes(q));
                  const invMatch = d.pinnedInvariants?.some(i => i.toLowerCase().includes(q));
                  const msgMatch = d.messages?.some(m => m.text?.toLowerCase().includes(q) || m.name?.toLowerCase().includes(q));
                  return topicMatch || notesMatch || tagsMatch || invMatch || msgMatch;
                })
                .map((deb) => (
                  <div
                    key={deb.id}
                    className={`p-4 bg-[#07070C] border transition-all rounded-xl space-y-3 group ${
                      sessionId === deb.id 
                        ? 'border-[#D4AF37]/70 bg-[#121222]/80 shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                        : 'border-gray-800/80 hover:border-gray-700'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1 max-w-[70%]">
                        <div className="flex flex-wrap items-center gap-2">
                          {sessionId === deb.id && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-amber-950 text-[#D4AF37] border border-amber-500/40 rounded font-bold">
                              ACTIVE SESSION
                            </span>
                          )}
                          <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#D4AF37] transition-colors">
                            {deb.topic}
                          </h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
                          <span className="px-2 py-0.5 bg-gray-800/80 text-gray-300 rounded font-mono border border-gray-700">
                            {deb.mode}
                          </span>
                          <span>•</span>
                          <span>Updated: {new Date(deb.updatedAt).toLocaleString()}</span>
                          <span>•</span>
                          <span className="text-gray-500 font-mono">ID: #{deb.id.substring(0, 10)}</span>
                        </div>
                      </div>

                      {/* Top Badges & Delete */}
                      <div className="flex items-center gap-2">
                        {deb.crystallizedPRD && (
                          <span className="text-[10px] px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-500/40 rounded font-bold flex items-center gap-1">
                            <Sparkles size={10} />
                            <span>PRD</span>
                          </span>
                        )}
                        {(deb.forkCount ?? 0) > 0 && (
                          <span className="text-[10px] px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-500/40 rounded font-bold flex items-center gap-1">
                            <GitFork size={10} />
                            <span>{deb.forkCount} Fork{deb.forkCount! > 1 ? 's' : ''}</span>
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDeleteDebate(deb.id, e)}
                          className="text-gray-600 hover:text-rose-400 p-1.5 rounded hover:bg-rose-950/30 transition-all"
                          title="Delete debate from Firestore"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Telemetry Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0C0C16] p-2.5 rounded-lg border border-gray-800 text-[11px]">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <span className="text-gray-500">Messages:</span>
                        <span className="font-bold text-white">{deb.messages?.length || 0} turns</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">Ambiguity:</span>
                        <span className={`font-bold ${(deb.ambiguityScore ?? 0.4) < 0.2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {((deb.ambiguityScore ?? 0.4) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">Consensus:</span>
                        <span className="font-bold text-cyan-400">{deb.consensusPercentage ?? 65}%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">Z3 Logic:</span>
                        <span className={`font-bold ${deb.z3Verified ? 'text-emerald-400' : 'text-gray-400'}`}>
                          {deb.z3Verified ? '✓ SAT' : 'UNCHECKED'}
                        </span>
                      </div>
                    </div>

                    {/* Pinned Invariants Chips (if any) */}
                    {deb.pinnedInvariants && deb.pinnedInvariants.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Pinned Invariants ({deb.pinnedInvariants.length}):</div>
                        <div className="flex flex-wrap gap-1.5">
                          {deb.pinnedInvariants.map((inv, idx) => (
                            <span key={idx} className="text-[10px] bg-[#0E0E1A] text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                              <CheckCircle2 size={10} />
                              <span>{inv}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {deb.tags && deb.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {deb.tags.map((t, i) => (
                          <button
                            key={i}
                            onClick={() => setHistoryFilterTag(t === historyFilterTag ? null : t)}
                            className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${
                              historyFilterTag === t
                                ? 'bg-purple-600 text-white font-bold'
                                : 'bg-[#141424] text-purple-300 hover:bg-[#1E1E34]'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Expandable Transcript Preview */}
                    {previewingDebateId === deb.id && (
                      <div className="bg-[#05050A] border border-gray-800 rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-gray-800 pb-1">
                          <span className="font-bold text-gray-300">Debate Transcript Preview</span>
                          <span>{deb.messages?.length || 0} messages</span>
                        </div>
                        <div className="space-y-2">
                          {deb.messages?.map((msg, mIdx) => (
                            <div key={mIdx} className="text-xs space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px]">{msg.avatar}</span>
                                <span className="font-bold text-white text-[11px]">{msg.name}</span>
                                <span className="text-[9px] text-gray-500">[{msg.argumentType || 'PROPOSAL'}]</span>
                              </div>
                              <p className="text-gray-300 text-[11px] pl-4 border-l border-gray-800 leading-relaxed">
                                {msg.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-800/80">
                      <button
                        onClick={() => setPreviewingDebateId(previewingDebateId === deb.id ? null : deb.id)}
                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                      >
                        <ChevronDown size={12} className={`transition-transform ${previewingDebateId === deb.id ? 'rotate-180' : ''}`} />
                        <span>{previewingDebateId === deb.id ? 'Hide Transcript' : 'Preview Transcript'}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setVaultVelocityDebate(deb)}
                          className="px-2.5 py-1 bg-[#121826] hover:bg-[#1A2338] text-cyan-300 border border-cyan-500/30 text-xs rounded flex items-center gap-1"
                          title="View Historical D3 Consensus Velocity Chart"
                        >
                          <TrendingUp size={11} className="text-cyan-400" />
                          <span>D3 Velocity</span>
                        </button>

                        <button
                          onClick={(e) => handleExportDebateMarkdown(deb, e)}
                          className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded flex items-center gap-1"
                          title="Export as Markdown Chronicle"
                        >
                          <Download size={11} />
                          <span>MD</span>
                        </button>

                        <button
                          onClick={(e) => handleExportDebateJSON(deb, e)}
                          className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded flex items-center gap-1"
                          title="Export as JSON Schema"
                        >
                          <Code2 size={11} />
                          <span>JSON</span>
                        </button>

                        <button
                          onClick={(e) => handleCloneDebate(deb, e)}
                          className="px-2.5 py-1 bg-[#1A1A2E] hover:bg-[#252542] text-amber-300 border border-amber-500/30 text-xs rounded flex items-center gap-1"
                          title="Clone as new branch"
                        >
                          <GitFork size={11} />
                          <span>Branch</span>
                        </button>

                        <button
                          onClick={() => handleRestoreDebate(deb)}
                          className="px-3.5 py-1 bg-[#D4AF37] hover:bg-[#C29B27] text-black font-bold text-xs rounded flex items-center gap-1 transition-all shadow-sm"
                        >
                          <Play size={11} />
                          <span>Resume Debate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {savedDebates.length === 0 && !isLoadingHistory && (
                <div className="p-12 text-center text-gray-500 space-y-3 bg-[#07070C] border border-gray-800 rounded-xl">
                  <History size={32} className="mx-auto text-gray-600" />
                  <div className="text-sm font-bold text-gray-400">No Saved Debates in Firestore</div>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Brainstorm with the 9-Seat Archmage Council and your discussions will automatically persist to Firestore. You can also click "Save Session" at any time.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Crystallized PRD Modal */}
      {crystallizedPRD && (
        <div className="bg-[#0A0A12] border border-[#D4AF37]/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Sparkles size={16} />
              <h4 className="text-xs font-bold uppercase tracking-wider">Crystallized Sovereign Product Requirements Document (PRD)</h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(crystallizedPRD, 'prd_copy')}
                className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 rounded flex items-center gap-1"
              >
                {copiedKey === 'prd_copy' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedKey === 'prd_copy' ? 'Copied PRD' : 'Copy Markdown'}</span>
              </button>
              <button
                onClick={handleOpenForkModal}
                className="px-2.5 py-1 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs rounded flex items-center gap-1.5 shadow"
              >
                <GitFork size={12} />
                <span>Fork to Genesis Intake</span>
              </button>
              <button
                onClick={() => setCrystallizedPRD(null)}
                className="text-xs text-gray-400 hover:text-white px-2 py-1"
              >
                ✕ Close
              </button>
            </div>
          </div>
          <pre className="bg-[#050508] p-4 rounded-lg text-xs text-gray-200 overflow-x-auto border border-gray-800/80 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto font-mono">
            {crystallizedPRD}
          </pre>
        </div>
      )}
      {/* Historical D3 Consensus Velocity Modal */}
      {vaultVelocityDebate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A14] border border-cyan-500/50 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Archmage Consensus Velocity Chronicle:</span>
                    <span className="text-amber-300 font-mono">"{vaultVelocityDebate.topic}"</span>
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Historical D3.js trajectory across {vaultVelocityDebate.messages?.length || 0} debate turns • Final Consensus: {vaultVelocityDebate.consensusPercentage}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleRestoreDebate(vaultVelocityDebate);
                    setVaultVelocityDebate(null);
                    setIsHistoryOpen(false);
                    setMainChamberView('VELOCITY_D3');
                  }}
                  className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#C29B27] text-black font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow"
                >
                  <Play size={12} />
                  <span>Resume This Debate</span>
                </button>

                <button
                  onClick={() => setVaultVelocityDebate(null)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <ConsensusVelocityChart
              messages={vaultVelocityDebate.messages || []}
              currentConsensus={vaultVelocityDebate.consensusPercentage || 0}
              ambiguityScore={vaultVelocityDebate.ambiguityScore || 0.1}
              z3Verified={vaultVelocityDebate.z3Verified || false}
              debateMode={vaultVelocityDebate.mode || 'SOCRATIC_IDEATION'}
              topic={vaultVelocityDebate.topic}
            />
          </div>
        </div>
      )}
    </div>
  );
}

