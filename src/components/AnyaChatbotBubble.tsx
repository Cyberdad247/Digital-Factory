import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  MessageSquare, 
  X, 
  Send, 
  Wand2, 
  Compass, 
  CheckSquare, 
  Copy, 
  Check, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Zap, 
  Flame, 
  Layers, 
  Terminal, 
  Network, 
  Boxes, 
  Cpu, 
  RefreshCw, 
  BookOpen, 
  ShieldCheck,
  ChevronRight,
  Database,
  ExternalLink
} from 'lucide-react';
import { MainView } from '../App';
import { auth, saveAnyaEnhancement, fetchAnyaEnhancements, AnyaEnhancementModel } from '../lib/firebase';

interface AnyaChatbotBubbleProps {
  onHotSwapMode: (mode: MainView) => void;
  onNotify: (msg: string, type?: 'success' | 'warning') => void;
  onInjectVoiceTask?: (task: { title: string; priority: string; category: string; description: string }) => void;
  onOpenEvolution?: () => void;
  currentStudio: MainView;
}

type AnyaTab = 'ENHANCE' | 'NAVIGATE' | 'ONBOARD' | 'CHAT';

interface ChatMessage {
  id: string;
  sender: 'user' | 'anya';
  text: string;
  timestamp: string;
  enhancedData?: any;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetStudio: MainView;
  completed: boolean;
}

const INITIAL_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'step_1',
    title: '1. Inspect 14-Stage Blueprint OS Engine',
    description: 'Explore the Tier 2 Holographic Specification Chassis and dependency DAG.',
    targetStudio: 'BLUEPRINT_OS',
    completed: false
  },
  {
    id: 'step_2',
    title: '2. Query Cloudbrain Worldtree via NotebookLM',
    description: 'Run grounded retrieval against MCP knowledge vaults with strict citations.',
    targetStudio: 'MCP_SERVER',
    completed: false
  },
  {
    id: 'step_3',
    title: '3. Execute Multi-Cursor Hive IDE Swarms',
    description: 'Launch parallel code branches across Knights and test with the Gideon Crucible.',
    targetStudio: 'HIVE_IDE',
    completed: false
  },
  {
    id: 'step_4',
    title: '4. Explore 3D Topological Graph Mesh',
    description: 'Inspect live system states and isolate dependency bottlenecks with force-directed physics.',
    targetStudio: 'TOPOLOGICAL_MESH',
    completed: false
  },
  {
    id: 'step_5',
    title: '5. Multi-Signature Quorum for PROD Deployment',
    description: 'Sign consequential effects in Swarm Command Center with multi-role cryptographic authorization.',
    targetStudio: 'SWARM_COMMAND_CENTER',
    completed: false
  }
];

export function AnyaChatbotBubble({
  onHotSwapMode,
  onNotify,
  onInjectVoiceTask,
  onOpenEvolution,
  currentStudio
}: AnyaChatbotBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AnyaTab>('ENHANCE');
  
  // Prompt Enhancer State
  const [rawPrompt, setRawPrompt] = useState('');
  const [targetStudioSelect, setTargetStudioSelect] = useState<string>('AUTO_DETECT');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<any>(null);
  const [copiedEnhanced, setCopiedEnhanced] = useState(false);
  const [savedEnhancements, setSavedEnhancements] = useState<AnyaEnhancementModel[]>([]);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_0',
      sender: 'anya',
      text: 'Greetings, Architect! I am Anya Ω, your Sovereign Cognitive Guide and Prompt Alchemist. How may I accelerate your engineering mission today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [voicePlaybackEnabled, setVoicePlaybackEnabled] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Onboarding State
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>(() => {
    const saved = localStorage.getItem('camelot_onboarding_steps');
    return saved ? JSON.parse(saved) : INITIAL_ONBOARDING_STEPS;
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'CHAT') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen, activeTab]);

  useEffect(() => {
    localStorage.setItem('camelot_onboarding_steps', JSON.stringify(onboardingSteps));
  }, [onboardingSteps]);

  // Load saved enhancements from Firestore
  useEffect(() => {
    async function loadSaved() {
      try {
        const data = await fetchAnyaEnhancements();
        if (data && data.length > 0) {
          setSavedEnhancements(data);
        }
      } catch (err) {
        console.warn('Could not load enhancements from Firestore:', err);
      }
    }
    if (isOpen) {
      loadSaved();
    }
  }, [isOpen]);

  const completedCount = onboardingSteps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / onboardingSteps.length) * 100);

  const handleToggleStep = (id: string) => {
    setOnboardingSteps(prev => 
      prev.map(step => step.id === id ? { ...step, completed: !step.completed } : step)
    );
  };

  const handleEnhancePrompt = async (textToEnhance?: string) => {
    const text = textToEnhance || rawPrompt;
    if (!text.trim()) {
      onNotify('Please enter a prompt or idea to enhance!', 'warning');
      return;
    }

    setIsEnhancing(true);
    try {
      const res = await fetch('/api/gemini/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPrompt: text,
          targetStudio: targetStudioSelect,
          targetTier: 'V1000_EXCALIBUR_ASCENDED'
        })
      });

      if (!res.ok) throw new Error('Enhancement server request failed');
      const data = await res.json();
      setEnhancedResult(data);
      onNotify('✨ Prompt transformed by Anya Ω into 3-Tier Specification Harness!', 'success');

      // Auto-save to Firestore if user logged in
      const user = auth.currentUser;
      if (user && user.uid) {
        const record: AnyaEnhancementModel = {
          id: `enh_${Date.now()}`,
          originalPrompt: text,
          enhancedPrompt: data.enhancedPrompt,
          category: 'PROMPT_ALCHEMIST',
          targetStudio: data.targetStudio || targetStudioSelect,
          invariantsAdded: data.invariantsAdded || [],
          authorUid: user.uid,
          createdAt: new Date().toISOString()
        };
        await saveAnyaEnhancement(record);
        setSavedEnhancements(prev => [record, ...prev.slice(0, 9)]);
      }
    } catch (err: any) {
      console.error(err);
      onNotify('Could not enhance prompt: ' + (err?.message || 'Server latency'), 'warning');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCopyEnhanced = () => {
    if (!enhancedResult?.enhancedPrompt) return;
    navigator.clipboard.writeText(enhancedResult.enhancedPrompt);
    setCopiedEnhanced(true);
    setTimeout(() => setCopiedEnhanced(false), 2000);
    onNotify('📋 Enhanced 3-Tier prompt copied to clipboard!', 'success');
  };

  const handleInjectIntoStudio = () => {
    if (!enhancedResult) return;
    const target = (enhancedResult.targetStudio as MainView) || currentStudio;
    onHotSwapMode(target);
    if (onInjectVoiceTask) {
      onInjectVoiceTask({
        title: enhancedResult.oneShotCommand || rawPrompt.slice(0, 40),
        priority: 'CRITICAL',
        category: 'FEATURE',
        description: enhancedResult.summary || 'Anya-enhanced engineering specification.'
      });
    }
    onNotify(`🚀 Enhanced specification injected into ${target}!`, 'success');
    setIsOpen(false);
  };

  const handleSendChat = async (presetText?: string) => {
    const text = presetText || chatInput;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!presetText) setChatInput('');
    setIsChatting(true);

    try {
      const history = chatMessages.map(m => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: m.text }]
      }));
      history.push({ role: 'user' as const, parts: [{ text }] });

      const res = await fetch('/api/gemini/knight-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          knightId: 'anya',
          messages: history,
          includeAudio: voicePlaybackEnabled
        })
      });

      if (!res.ok) throw new Error('Anya chat request failed');
      const data = await res.json();

      const anyaMsg: ChatMessage = {
        id: `anya_${Date.now()}`,
        sender: 'anya',
        text: data.text || 'Understood, Architect. My cognitive sensors are aligned.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, anyaMsg]);

      // Play audio response if audio returned
      if (voicePlaybackEnabled && data.audioBase64) {
        playBase64Audio(data.audioBase64);
      }
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        {
          id: `anya_err_${Date.now()}`,
          sender: 'anya',
          text: 'I detected a micro-flux in the neural bridge. Let me re-route through the Arthurian Core.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  const playBase64Audio = (base64Audio: string) => {
    try {
      setIsAudioPlaying(true);
      const binaryString = window.atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes.buffer], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsAudioPlaying(false);
      audio.onerror = () => setIsAudioPlaying(false);
      audio.play();
    } catch (e) {
      console.warn('Audio playback error:', e);
      setIsAudioPlaying(false);
    }
  };

  const STUDIO_CARDS = [
    {
      id: 'MERLIN_AGENCY' as MainView,
      title: 'Merlin Strategic Agency',
      tier: 'Tier 1 HUD',
      icon: Flame,
      color: '#D4AF37',
      desc: 'Voice HUD, intent categorization, 7-Gate intake router.'
    },
    {
      id: 'BLUEPRINT_OS' as MainView,
      title: 'Blueprint OS Studio',
      tier: 'Tier 2 Chassis',
      icon: Layers,
      color: '#00F0FF',
      desc: '14-stage lifecycle, exploded dependency DAG, JSON contracts.'
    },
    {
      id: 'HIVE_IDE' as MainView,
      title: 'Hive IDE Kinetic Melee',
      tier: 'Tier 3 Melee',
      icon: Terminal,
      color: '#10B981',
      desc: 'Multi-cursor swarms, thermal matrices, Gideon Crucible validation.'
    },
    {
      id: 'TOPOLOGICAL_MESH' as MainView,
      title: 'Topological Graph Mesh',
      tier: 'Topology',
      icon: Network,
      color: '#3B82F6',
      desc: '3D force-directed dependency visualizer & state physics.'
    },
    {
      id: 'SWARM_COMMAND_CENTER' as MainView,
      title: 'Swarm Command Center',
      tier: 'Command',
      icon: Boxes,
      color: '#F59E0B',
      desc: 'Multi-signature quorum, PROD promotion, cryptographically signed receipts.'
    },
    {
      id: 'GEMINI_NEXUS' as MainView,
      title: 'Gemini Nexus Studio',
      tier: 'Intelligence',
      icon: Sparkles,
      color: '#8B5CF6',
      desc: 'High Thinking, Google Search Grounding, Gemini 3.1 Pro & 3.7 Flash.'
    },
    {
      id: 'GOOGLE_WORKSPACE' as MainView,
      title: 'Google Workspace Hub',
      tier: 'Integration',
      icon: BookOpen,
      color: '#EC4899',
      desc: 'OAuth sync for Drive, Sheets, Docs, and Calendar artifacts.'
    },
    {
      id: 'MCP_SERVER' as MainView,
      title: 'MCP Server Forge Studio',
      tier: 'Protocol',
      icon: Cpu,
      color: '#14B8A6',
      desc: 'NotebookLM Cloudbrain retrieval, Bifrost stdio, TOON compression.'
    }
  ];

  return (
    <>
      {/* Floating Anya Orb Button */}
      <div className="fixed bottom-4 left-4 z-40 font-mono select-none">
        <motion.button
          id="anya-companion-bubble-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(prev => !prev)}
          className={`group flex items-center gap-2.5 px-3.5 py-2.5 rounded-full border-2 transition-all shadow-2xl backdrop-blur-xl ${
            isOpen
              ? 'bg-amber-950/90 border-[#D4AF37] text-amber-200 shadow-[0_0_25px_rgba(212,175,55,0.6)]'
              : 'bg-[#0B0B14]/90 border-amber-500/50 text-amber-300 hover:border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.35)]'
          }`}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 flex items-center justify-center text-black font-black text-sm shadow-inner">
              👑
            </div>
            {/* Pulsing Aura */}
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0B0B14] animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0B0B14]" />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wide text-amber-300 group-hover:text-yellow-200">
                ANYA Ω
              </span>
              <span className="text-[9px] px-1 py-0.2 bg-amber-900/60 border border-amber-500/40 rounded text-amber-300">
                HELPER
              </span>
            </div>
            <p className="text-[10px] text-gray-400 truncate max-w-[130px]">
              {isAudioPlaying ? 'Speaking audio...' : 'Prompt Alchemist & Guide'}
            </p>
          </div>

          {progressPercent < 100 && (
            <div className="hidden sm:flex flex-col items-end pl-1 border-l border-amber-500/30 text-[10px] text-amber-400/80">
              <span>{progressPercent}%</span>
              <span className="text-[8px] text-gray-400">Onboard</span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Expandable Anya Companion Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="anya-companion-drawer"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-20 left-4 z-50 w-[94vw] sm:w-[540px] md:w-[600px] max-h-[85vh] bg-[#0A0A12]/95 border-2 border-[#D4AF37]/60 rounded-2xl shadow-[0_0_40px_rgba(212,175,55,0.35)] backdrop-blur-2xl flex flex-col overflow-hidden font-mono text-gray-200"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#17130A] via-[#1A1824] to-[#0A0A12] border-b border-[#D4AF37]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-300 flex items-center justify-center text-xl shadow-lg border border-amber-200/50">
                  👑
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider">
                      Knight Anya Ω
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-950/80 border border-amber-500/50 text-amber-300 rounded font-bold">
                      COGNITIVE GATEKEEPER
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Prompt Enhancement • Studio Navigation • Onboarding Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVoicePlaybackEnabled(!voicePlaybackEnabled)}
                  title={voicePlaybackEnabled ? 'Mute Anya Voice' : 'Enable Anya Voice (Kore)'}
                  className={`p-1.5 rounded-lg border transition-all ${
                    voicePlaybackEnabled
                      ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                      : 'bg-black/40 border-gray-700 text-gray-500'
                  }`}
                >
                  {voicePlaybackEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-4 bg-[#08080E] border-b border-gray-800 text-xs">
              <button
                id="anya-tab-enhance"
                onClick={() => setActiveTab('ENHANCE')}
                className={`py-2.5 px-2 flex items-center justify-center gap-1.5 font-bold transition-all border-b-2 ${
                  activeTab === 'ENHANCE'
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Wand2 size={13} />
                <span className="truncate">Enhance</span>
              </button>

              <button
                id="anya-tab-navigate"
                onClick={() => setActiveTab('NAVIGATE')}
                className={`py-2.5 px-2 flex items-center justify-center gap-1.5 font-bold transition-all border-b-2 ${
                  activeTab === 'NAVIGATE'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Compass size={13} />
                <span className="truncate">Navigate</span>
              </button>

              <button
                id="anya-tab-onboard"
                onClick={() => setActiveTab('ONBOARD')}
                className={`py-2.5 px-2 flex items-center justify-center gap-1.5 font-bold transition-all border-b-2 relative ${
                  activeTab === 'ONBOARD'
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-950/20'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <CheckSquare size={13} />
                <span className="truncate">Onboard ({progressPercent}%)</span>
              </button>

              <button
                id="anya-tab-chat"
                onClick={() => setActiveTab('CHAT')}
                className={`py-2.5 px-2 flex items-center justify-center gap-1.5 font-bold transition-all border-b-2 ${
                  activeTab === 'CHAT'
                    ? 'border-purple-400 text-purple-300 bg-purple-950/20'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <MessageSquare size={13} />
                <span className="truncate">Chat</span>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[55vh] custom-scrollbar text-xs">
              
              {/* TAB 1: PROMPT ALCHEMIST */}
              {activeTab === 'ENHANCE' && (
                <div className="space-y-4">
                  <div className="bg-[#12121D] border border-amber-500/30 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-400" />
                        Anya Prompt Enhancement Engine (APEE v7.0)
                      </span>
                      <span className="text-[10px] text-gray-400">Model: gemini-3.7-flash</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      Type your raw intent or software concept. Anya will alchemize it into a zero-entropy 3-Tier specification harness with an exploded assembly DAG and invariant boundaries.
                    </p>

                    <div className="space-y-2">
                      <textarea
                        value={rawPrompt}
                        onChange={e => setRawPrompt(e.target.value)}
                        placeholder="e.g., Build a real-time multiplayer collaborative pixel canvas with WebSockets, room leases, and undo-redo stack..."
                        rows={3}
                        className="w-full bg-[#08080E] border border-gray-700 focus:border-[#D4AF37] rounded-lg p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none resize-none font-mono"
                      />

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-400">Target Studio:</span>
                          <select
                            value={targetStudioSelect}
                            onChange={e => setTargetStudioSelect(e.target.value)}
                            className="bg-[#08080E] border border-gray-700 text-gray-300 text-[11px] rounded px-2 py-1 focus:outline-none"
                          >
                            <option value="AUTO_DETECT">Auto-Detect Studio</option>
                            <option value="BLUEPRINT_OS">Blueprint OS Studio</option>
                            <option value="HIVE_IDE">Hive IDE Kinetic Melee</option>
                            <option value="TOPOLOGICAL_MESH">Topological Graph Mesh</option>
                            <option value="SWARM_COMMAND_CENTER">Swarm Command Center</option>
                            <option value="MCP_SERVER">MCP Server Forge</option>
                          </select>
                        </div>

                        <button
                          onClick={() => handleEnhancePrompt()}
                          disabled={isEnhancing || !rawPrompt.trim()}
                          className="px-4 py-1.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-black rounded-lg transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
                        >
                          {isEnhancing ? <RefreshCw size={13} className="animate-spin" /> : <Wand2 size={13} />}
                          <span>{isEnhancing ? 'Alchemizing...' : 'Enhance Prompt'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="pt-2 border-t border-gray-800 flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1 mr-1">Presets:</span>
                      {[
                        'Agentic CLI with subcommands & capability leases',
                        'Topological graph visualizer with force layout physics',
                        'PROD multi-sig quorum gate & SHA256 receipt logger'
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setRawPrompt(preset);
                            handleEnhancePrompt(preset);
                          }}
                          className="text-[10px] bg-black/40 hover:bg-amber-950/40 border border-gray-800 hover:border-amber-500/50 text-gray-300 hover:text-amber-300 px-2 py-0.5 rounded transition-all"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Output View */}
                  {enhancedResult && (
                    <div className="bg-[#0B0B14] border border-[#D4AF37]/50 rounded-xl p-3.5 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                        <div className="flex items-center gap-2 text-amber-300 font-bold">
                          <ShieldCheck size={15} />
                          <span>Enhanced Specification Output</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCopyEnhanced}
                            className="px-2 py-1 bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 rounded text-[10px] font-bold flex items-center gap-1"
                          >
                            {copiedEnhanced ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                            <span>{copiedEnhanced ? 'Copied' : 'Copy'}</span>
                          </button>
                          <button
                            onClick={handleInjectIntoStudio}
                            className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/80 rounded text-[10px] font-bold flex items-center gap-1"
                          >
                            <span>Inject into {enhancedResult.targetStudio || 'Studio'}</span>
                            <ArrowRight size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Summary & Invariants */}
                      <div className="text-[11px] text-gray-300 space-y-1.5 bg-black/40 p-2.5 rounded border border-gray-800">
                        <div className="text-amber-200 font-semibold">{enhancedResult.summary}</div>
                        {enhancedResult.invariantsAdded && enhancedResult.invariantsAdded.length > 0 && (
                          <div className="pt-1">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Invariants Bound:</span>
                            <ul className="list-disc list-inside text-[10px] text-emerald-400 mt-0.5 space-y-0.5">
                              {enhancedResult.invariantsAdded.map((inv: string, i: number) => (
                                <li key={i}>{inv}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Full Prompt Display */}
                      <div className="bg-[#050508] border border-gray-800 rounded p-2.5 max-h-48 overflow-y-auto text-[10.5px] font-mono text-cyan-300 whitespace-pre-wrap">
                        {enhancedResult.enhancedPrompt}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: STUDIO NAVIGATION & TELEMETRY */}
              {activeTab === 'NAVIGATE' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Active Cartridge: <strong className="text-amber-400">{currentStudio}</strong></span>
                    <span>8 Sovereign Micro-Frontends</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {STUDIO_CARDS.map(studio => {
                      const Icon = studio.icon;
                      const isActive = currentStudio === studio.id;
                      return (
                        <div
                          key={studio.id}
                          className={`p-3 rounded-xl border transition-all ${
                            isActive
                              ? 'bg-amber-950/30 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                              : 'bg-[#11111B] border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div
                                className="p-1 rounded text-black"
                                style={{ backgroundColor: studio.color }}
                              >
                                <Icon size={14} />
                              </div>
                              <h4 className="text-xs font-bold text-white">{studio.title}</h4>
                            </div>
                            <span className="text-[9px] px-1.5 py-0.2 bg-black/50 border border-gray-700 rounded text-gray-300">
                              {studio.tier}
                            </span>
                          </div>

                          <p className="text-[10.5px] text-gray-400 mb-2.5 leading-tight">{studio.desc}</p>

                          <button
                            onClick={() => {
                              onHotSwapMode(studio.id);
                              onNotify(`Switched to ${studio.title}`, 'success');
                              setIsOpen(false);
                            }}
                            className={`w-full py-1 rounded text-[10.5px] font-bold flex items-center justify-center gap-1 transition-all ${
                              isActive
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-default'
                                : 'bg-white/5 hover:bg-white/10 text-gray-200 border border-gray-700'
                            }`}
                          >
                            <span>{isActive ? 'Active Viewport' : 'Hot-Swap to Studio'}</span>
                            {!isActive && <ChevronRight size={12} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: ONBOARDING CHECKLIST */}
              {activeTab === 'ONBOARD' && (
                <div className="space-y-4">
                  {/* Progress Header */}
                  <div className="bg-[#12121D] border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <CheckSquare size={14} />
                        Camelot-OS Cartridge Onboarding
                      </span>
                      <span className="text-xs font-black text-emerald-400">{progressPercent}%</span>
                    </div>

                    <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-gray-800">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-gray-400">
                      Complete these 5 sovereign milestones to unlock full mastery of the Titan Omni-Forge cartridge.
                    </p>
                  </div>

                  {/* Steps List */}
                  <div className="space-y-2">
                    {onboardingSteps.map(step => (
                      <div
                        key={step.id}
                        className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                          step.completed
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-[#11111B] border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={step.completed}
                          onChange={() => handleToggleStep(step.id)}
                          className="mt-0.5 accent-emerald-500 cursor-pointer w-4 h-4 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-xs font-bold ${step.completed ? 'text-emerald-300 line-through' : 'text-white'}`}>
                              {step.title}
                            </h4>
                            <button
                              onClick={() => {
                                onHotSwapMode(step.targetStudio);
                                setIsOpen(false);
                              }}
                              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
                            >
                              <span>Jump</span>
                              <ExternalLink size={10} />
                            </button>
                          </div>
                          <p className="text-[10.5px] text-gray-400 mt-0.5">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {progressPercent === 100 && (
                    <div className="p-3 bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-cyan-950/80 border border-[#D4AF37] rounded-xl text-center space-y-1">
                      <div className="text-sm font-black text-amber-300">🎉 Singularity Mastery Achieved!</div>
                      <p className="text-[11px] text-gray-300">You have completed all Camelot-OS onboarding gates.</p>
                      {onOpenEvolution && (
                        <button
                          onClick={onOpenEvolution}
                          className="mt-2 px-3 py-1 bg-amber-500 text-black font-bold rounded text-xs hover:bg-yellow-400"
                        >
                          Trigger Evolution Matrix
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: CHAT WITH ANYA */}
              {activeTab === 'CHAT' && (
                <div className="space-y-3">
                  {/* Messages Stream */}
                  <div className="space-y-2.5">
                    {chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.sender === 'anya' && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center text-xs text-black shrink-0 font-bold">
                            👑
                          </div>
                        )}
                        <div
                          className={`p-2.5 rounded-xl max-w-[82%] text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-amber-900/40 border border-amber-500/40 text-amber-100 rounded-br-none'
                              : 'bg-[#12121C] border border-gray-800 text-gray-200 rounded-bl-none font-sans'
                          }`}
                        >
                          <div>{msg.text}</div>
                          <div className="text-[9px] text-gray-500 mt-1 text-right">{msg.timestamp}</div>
                        </div>
                      </div>
                    ))}
                    {isChatting && (
                      <div className="flex gap-2 items-center text-gray-400 text-xs italic">
                        <RefreshCw size={12} className="animate-spin text-amber-400" />
                        <span>Anya is synthesizing neural response...</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Preset Starters */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-800">
                    {[
                      'How do I forge an agentic CLI?',
                      'Explain the 14-stage Blueprint OS lifecycle',
                      'How does the PROD multi-sig gate work?'
                    ].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendChat(q)}
                        className="text-[10px] bg-black/40 hover:bg-amber-950/40 border border-gray-800 hover:border-amber-500/40 text-gray-300 hover:text-amber-300 px-2 py-0.5 rounded transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Input Form */}
                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                      placeholder="Ask Anya for navigation advice, prompt rules, or architecture specs..."
                      className="flex-1 bg-[#08080E] border border-gray-700 focus:border-[#D4AF37] text-white text-xs px-3 py-2 rounded-lg focus:outline-none placeholder-gray-600"
                    />
                    <button
                      onClick={() => handleSendChat()}
                      disabled={isChatting || !chatInput.trim()}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Status */}
            <div className="p-2.5 bg-[#07070D] border-t border-gray-800 flex items-center justify-between text-[10px] text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span>Anya Ω Live Cognitive Link Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Memory: 8GB Edge Ceiling</span>
                <span className="text-amber-500">•</span>
                <span>Firestore Synced</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
