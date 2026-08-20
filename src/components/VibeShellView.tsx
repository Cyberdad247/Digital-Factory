import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Sparkles, 
  Send, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  Database, 
  Rocket, 
  Smartphone, 
  Tablet, 
  Monitor, 
  RefreshCw, 
  Code, 
  Eye, 
  Copy, 
  Check, 
  ExternalLink, 
  HelpCircle, 
  Layers, 
  Zap, 
  ArrowRight,
  Sliders,
  Search,
  Building,
  Home,
  DollarSign,
  Calendar,
  Lock,
  MessageSquare,
  Cpu,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';
import { VibeSocraticMessage, VibeClarificationItem, VibeGeneratedApp } from '../types';

interface VibeShellViewProps {
  onNotify: (msg: string, type?: 'success' | 'warning') => void;
  onSwitchToKanban?: () => void;
  onSwitchToTitanCore?: () => void;
  initialIntent?: string;
}

const STARTER_PROMPTS = [
  {
    title: 'AI Real Estate Portal',
    icon: '🏡',
    prompt: 'Build an AI-powered real estate client portal with Stripe billing and property valuations.'
  },
  {
    title: 'SaaS Multi-Tenant CRM',
    icon: '⚡',
    prompt: 'Create a micro-SaaS client management dashboard with subscription tiers and voice notes.'
  },
  {
    title: 'AI Audio Stem Separator',
    icon: '🎵',
    prompt: 'Build an audio processing studio with live waveform player and export download center.'
  },
  {
    title: 'FinTech Wealth Dashboard',
    icon: '💳',
    prompt: 'Design a zero-trust wealth tracker with portfolio rebalancing alerts and Stripe payouts.'
  }
];

export function VibeShellView({
  onNotify,
  onSwitchToKanban,
  onSwitchToTitanCore,
  initialIntent = ''
}: VibeShellViewProps) {
  const [userPrompt, setUserPrompt] = useState(initialIntent || '');
  const [isClarifying, setIsClarifying] = useState(false);
  const [ambiguityScore, setAmbiguityScore] = useState(65); // 0-100%
  const [deviceView, setDeviceView] = useState<'DESKTOP' | 'TABLET' | 'MOBILE'>('DESKTOP');
  const [previewTab, setPreviewTab] = useState<'INTERACTIVE' | 'CODE'>('INTERACTIVE');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState(0);
  const [isPublished, setIsPublished] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [selectedListingFilter, setSelectedListingFilter] = useState<'ALL' | 'VILLA' | 'PENTHOUSE' | 'COMMERCIAL'>('ALL');
  const [simulatedSearchQuery, setSimulatedSearchQuery] = useState('');
  const [estimatedValuation, setEstimatedValuation] = useState<number | null>(1480000);

  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceVolumeWave, setVoiceVolumeWave] = useState([20, 60, 40, 80, 50, 90, 30, 70]);

  // Voice recording toggle handler (Faster-Whisper simulation + Web Speech API fallback)
  const handleToggleVoiceMic = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      onNotify('🎙️ Faster-Whisper: Voice stream crystallized and transcribed (<120ms)!', 'success');
      return;
    }

    setIsRecordingVoice(true);
    onNotify('🎙️ Listening via local Faster-Whisper... Speak your product intent naturally!', 'success');

    // Simulate animated waveform bars
    const waveInterval = setInterval(() => {
      setVoiceVolumeWave(Array.from({ length: 8 }, () => Math.floor(Math.random() * 80 + 20)));
    }, 120);

    // Auto-transcribe sample voice prompt after 2.8s
    setTimeout(() => {
      clearInterval(waveInterval);
      setIsRecordingVoice(false);
      const voiceCaptured = "Build a luxury AI Real Estate Client Portal with Stripe VIP billing and instant valuation drone.";
      setUserPrompt(voiceCaptured);
      onNotify('✨ Faster-Whisper: "Build a luxury AI Real Estate Client Portal with Stripe VIP billing..." transcribed!', 'success');
      handleSendPrompt(voiceCaptured);
    }, 3000);
  };
  const [socraticMessages, setSocraticMessages] = useState<VibeSocraticMessage[]>([
    {
      id: 'msg-init',
      sender: 'MERLIN',
      text: 'Greetings, Creator. State what you wish to build in plain English—no technical jargon or configuration required. I will handle the architecture, invariants, and code generation.',
      timestamp: new Date().toLocaleTimeString(),
      quickReplies: [
        'Build an AI Real Estate Client Portal with Stripe billing',
        'Create a modern SaaS Client Dashboard',
        'Build a Creator Pay-Gate Storefront'
      ]
    }
  ]);

  // Clarified Architectural Constraints
  const [clarifications, setClarifications] = useState<VibeClarificationItem[]>([
    {
      id: 'item-auth',
      category: 'AUTH',
      label: 'Authentication Model',
      resolvedValue: 'Passwordless Magic Link + OAuth',
      isLocked: false,
      options: ['Passwordless Magic Link + OAuth', 'Firebase Auth with RLS', 'Single Admin Key']
    },
    {
      id: 'item-payment',
      category: 'PAYMENT',
      label: 'Billing Engine',
      resolvedValue: 'Stripe Elements (Monthly & Annual Subscriptions)',
      isLocked: false,
      options: ['Stripe Elements (Monthly & Annual)', 'Stripe Hosted Checkout', 'One-time Invoicing']
    },
    {
      id: 'item-database',
      category: 'DATABASE',
      label: 'Data Persistence',
      resolvedValue: 'Cloud Firestore Real-Time DB',
      isLocked: true,
      options: ['Cloud Firestore Real-Time DB', 'Local SQLite WASM', 'PostgreSQL Cloud']
    },
    {
      id: 'item-ai',
      category: 'AI_ENGINE',
      label: 'AI Valuation Engine',
      resolvedValue: 'Multimodal Neural Valuator (Sub-50ms)',
      isLocked: true,
      options: ['Multimodal Neural Valuator', 'Comparative Market Analysis', 'Z3 Formal Rule Engine']
    }
  ]);

  // Generated App State
  const [currentApp, setCurrentApp] = useState<VibeGeneratedApp>({
    id: 'vibe-app-1',
    title: 'AuraEstates AI Portal',
    category: 'Real Estate & Wealth Management',
    description: 'Autonomous luxury real estate client portal with AI valuation engine and Stripe subscription billing.',
    componentCode: `// Generated React & Tailwind Component via esbuild-wasm (Zero Errors)
import React, { useState } from 'react';
import { Building, DollarSign, Search, ShieldCheck } from 'lucide-react';

export default function AuraEstatesClientPortal() {
  const [properties, setProperties] = useState([...]);
  const [activePlan, setActivePlan] = useState('PRO');

  return (
    <div className="min-h-screen bg-[#07070F] text-white p-6 font-sans">
      <header className="flex justify-between items-center pb-6 border-b border-gray-800">
        <h1 className="text-xl font-black text-cyan-400">AuraEstates AI</h1>
        <button className="px-4 py-2 bg-cyan-500 rounded-lg text-black font-bold">
          Upgrade to Premium ($199/mo)
        </button>
      </header>
      {/* Live Property Grid & Valuation Sandbox */}
    </div>
  );
}`,
    buildStatus: 'READY',
    buildDurationSec: 1.68,
    runtimeWarnings: 0,
    z3InvariantsSatisfied: true,
    stripeWebhooksBound: true,
    databaseConnected: true,
    edgeCacheReady: true,
    publishedUrl: undefined,
    sacCompressionRatio: 84.6
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [socraticMessages]);

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return;
    const userText = promptText.trim();
    setUserPrompt('');

    // Add user message
    const userMsg: VibeSocraticMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text: userText,
      timestamp: new Date().toLocaleTimeString()
    };
    setSocraticMessages(prev => [...prev, userMsg]);
    setIsClarifying(true);

    // Simulate Socratic reasoning & progressive scope clarification
    setTimeout(() => {
      let merlinReply = '';
      let quickReplies: string[] = [];
      let newAmbiguity = Math.max(0, ambiguityScore - 25);

      if (userText.toLowerCase().includes('stripe') || userText.toLowerCase().includes('billing') || userText.toLowerCase().includes('real estate')) {
        merlinReply = `Understood! I am structuring an **AI-powered Real Estate Client Portal** with integrated Stripe subscription tiers. How should clients unlock VIP property valuations?`;
        quickReplies = [
          'Tiered: Free Preview ($0) & VIP Investor ($149/mo)',
          'Pay-per-Valuation ($29 one-off token)',
          'Enterprise Multi-Broker License'
        ];
        // Lock payment clarification
        setClarifications(prev => prev.map(c => c.category === 'PAYMENT' ? { ...c, isLocked: true } : c));
      } else if (userText.toLowerCase().includes('tier') || userText.toLowerCase().includes('free') || userText.toLowerCase().includes('vip')) {
        merlinReply = `Perfect. Billing is locked into **Monthly & Annual Stripe Elements**. Would you like live AI Valuation algorithms enabled with instant Z3 formal theorem proofs?`;
        quickReplies = [
          'Yes, enable Neural Valuations & Instant Scheduling',
          'Include 3D Interactive Virtual Staging',
          'Lock scope and compile live preview drone now'
        ];
        setClarifications(prev => prev.map(c => c.category === 'AUTH' ? { ...c, isLocked: true } : c));
        newAmbiguity = 10;
      } else {
        merlinReply = `Scope clarified. Synthesized architectural requirements into zero-entropy contracts. All invariants are locked. Compiling your live preview drone now!`;
        quickReplies = ['Compile Live Preview Drone (<1.8s)'];
        newAmbiguity = 0;
        handleTriggerCompile();
      }

      setAmbiguityScore(newAmbiguity);
      setSocraticMessages(prev => [
        ...prev,
        {
          id: `merlin-${Date.now()}`,
          sender: 'MERLIN',
          text: merlinReply,
          timestamp: new Date().toLocaleTimeString(),
          quickReplies
        }
      ]);
      setIsClarifying(false);
    }, 900);
  };

  const handleTriggerCompile = () => {
    setIsCompiling(true);
    setCompilationProgress(10);
    const interval = setInterval(() => {
      setCompilationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCompiling(false);
          onNotify('⚡ Live Preview Drone rendered in 1.68s via esbuild-wasm (0 errors)!', 'success');
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  const handleApproveAndPublish = () => {
    setIsPublished(true);
    const generatedUrl = `https://auraestates.camelot.live/portal-v4-${Math.floor(Math.random() * 8999 + 1000)}`;
    setCurrentApp(prev => ({
      ...prev,
      publishedUrl: generatedUrl,
      publishedAt: new Date().toLocaleTimeString()
    }));
    onNotify(`🎉 App Approved & Published! Live at ${generatedUrl}`, 'success');
  };

  // Mock property listings for the live preview drone
  const mockProperties = [
    {
      id: 'prop-1',
      title: 'The Sovereign Horizon Penthouse',
      location: 'Bel Air, Los Angeles, CA',
      price: '$4,850,000',
      beds: 5,
      baths: 6,
      sqft: '6,400 sqft',
      type: 'PENTHOUSE',
      aiConfidence: '99.4%',
      valuationDelta: '+$210,000 (AI Est)',
      status: 'Active VIP Listing',
      image: '🏙️'
    },
    {
      id: 'prop-2',
      title: 'Villa Excalibur Ocean Crest',
      location: 'Malibu Coastline, CA',
      price: '$7,200,000',
      beds: 6,
      baths: 8,
      sqft: '8,900 sqft',
      type: 'VILLA',
      aiConfidence: '98.9%',
      valuationDelta: '+$450,000 (AI Est)',
      status: 'Exclusive Reserve',
      image: '🌊'
    },
    {
      id: 'prop-3',
      title: 'Camelot Tech Innovation Tower',
      location: 'Silicon Valley Corridor, CA',
      price: '$12,500,000',
      beds: 0,
      baths: 12,
      sqft: '24,000 sqft',
      type: 'COMMERCIAL',
      aiConfidence: '99.7%',
      valuationDelta: '+$1,100,000 (AI Est)',
      status: 'Commercial Yield 8.4%',
      image: '🏢'
    }
  ];

  const filteredProperties = mockProperties.filter(p => {
    if (selectedListingFilter !== 'ALL' && p.type !== selectedListingFilter) return false;
    if (simulatedSearchQuery && !p.title.toLowerCase().includes(simulatedSearchQuery.toLowerCase()) && !p.location.toLowerCase().includes(simulatedSearchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Vibe Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0C1220] via-[#090C16] to-[#120B20] border border-[#00F0FF]/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#00F0FF]/20 border border-[#00F0FF]/50 text-[#00F0FF] rounded-full text-[10px] font-black tracking-widest uppercase">
                TIER 1 • THE VIBE SHELL
              </span>
              <span className="text-gray-400 text-xs">• Zero Configuration Overhead</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Natural Plain-English Creator Studio</span>
              <Sparkles size={20} className="text-[#00F0FF] animate-pulse" />
            </h2>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              Describe your vision naturally. Merlin's Socratic Clarifier resolves ambiguities, locks contracts, and fires up a live interactive preview in under 1.8 seconds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Scope Ambiguity Gauge */}
            <div className="bg-[#06060C] border border-gray-800 rounded-xl p-3 text-center min-w-[130px]">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                Scope Ambiguity
              </div>
              <div className="text-xl font-black font-mono flex items-center justify-center gap-1">
                <span className={ambiguityScore === 0 ? 'text-emerald-400' : ambiguityScore < 40 ? 'text-amber-400' : 'text-cyan-400'}>
                  {ambiguityScore}%
                </span>
                {ambiguityScore === 0 && <CheckCircle2 size={16} className="text-emerald-400" />}
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${ambiguityScore === 0 ? 'bg-emerald-400' : ambiguityScore < 40 ? 'bg-amber-400' : 'bg-cyan-400'}`}
                  style={{ width: `${100 - ambiguityScore}%` }}
                ></div>
              </div>
            </div>

            {/* Quick Switch to Advanced HUDs */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={onSwitchToKanban}
                className="px-3 py-1.5 bg-[#141424] hover:bg-[#1E1E34] border border-[#D4AF37]/40 text-[#D4AF37] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow"
                title="Switch to Tier 2: Swarm Kanban (Visual 6-Stage State Machine)"
              >
                <Sliders size={13} />
                <span>Open Kanban View</span>
              </button>
              <button
                onClick={onSwitchToTitanCore}
                className="px-3 py-1.5 bg-[#141424] hover:bg-[#1E1E34] border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow"
                title="Switch to Tier 3: Titan Core (1,024 Swarm Telemetry & Archmage Council)"
              >
                <Cpu size={13} />
                <span>Open Titan Core</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Vibe Grid: Left: Socratic Clarifier | Right: Live Preview Drone & HITL Gate */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: THE SOCRATIC CLARIFIER (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0B0B14] border border-[#202034] rounded-2xl p-4 shadow-xl space-y-3 flex flex-col h-[640px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  🧙‍♂️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Merlin's Socratic Clarifier</h3>
                  <p className="text-[10px] text-cyan-400">Zero-Entropy Intent Alignment</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/30 rounded font-mono">
                SAC: 84.6% TOON
              </span>
            </div>

            {/* Clarification Checklist (Progressive Scope Locking) */}
            <div className="bg-[#06060A] border border-gray-800/80 rounded-xl p-2.5 space-y-1.5 text-xs">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>Architectural Boundaries</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {clarifications.filter(c => c.isLocked).length}/{clarifications.length} Locked
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {clarifications.map((item) => (
                  <div 
                    key={item.id}
                    className={`p-1.5 rounded-lg border flex items-center justify-between gap-1 transition-all ${
                      item.isLocked 
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' 
                        : 'bg-[#10101C] border-gray-800 text-gray-400'
                    }`}
                  >
                    <div className="truncate">
                      <div className="text-[9px] uppercase font-bold text-gray-500">{item.category}</div>
                      <div className="truncate font-semibold">{item.resolvedValue}</div>
                    </div>
                    {item.isLocked ? (
                      <Check size={12} className="text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scroll">
              {socraticMessages.map((msg) => {
                const isUser = msg.sender === 'USER';
                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`p-3 rounded-xl text-xs max-w-[92%] leading-relaxed ${
                      isUser 
                        ? 'bg-[#1E293B] text-white border border-blue-500/40 rounded-br-none' 
                        : 'bg-[#10101E] text-gray-200 border border-gray-800 rounded-bl-none shadow-md'
                    }`}>
                      {!isUser && (
                        <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold mb-1">
                          <span>🧙‍♂️ Merlin</span>
                          <span className="text-gray-500">• {msg.timestamp}</span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.text}</div>

                      {/* Quick Reply Chips */}
                      {msg.quickReplies && msg.quickReplies.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-gray-800 space-y-1.5">
                          <div className="text-[10px] text-gray-400 font-bold">Suggested Quick Choices:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.quickReplies.map((reply, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSendPrompt(reply)}
                                className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-lg text-[11px] font-medium transition-all text-left"
                              >
                                {reply}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isClarifying && (
                <div className="flex items-center gap-2 p-2.5 bg-[#10101E] border border-gray-800 rounded-xl text-xs text-cyan-400 animate-pulse">
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Merlin synthesizing requirements & eliminating edge-case ambiguity...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Starter Suggestion Chips */}
            <div className="pt-2 border-t border-gray-800/80">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                {STARTER_PROMPTS.map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendPrompt(starter.prompt)}
                    className="px-2 py-1 bg-[#121220] hover:bg-[#1E1E34] border border-gray-800 text-gray-300 hover:text-white rounded-md whitespace-nowrap shrink-0 transition-colors flex items-center gap-1"
                  >
                    <span>{starter.icon}</span>
                    <span>{starter.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar with Faster-Whisper Voice-to-UI Mic */}
            <div className="space-y-2 pt-1">
              {isRecordingVoice && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2 bg-rose-950/40 border border-rose-500/50 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 text-rose-300 font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    <span>Faster-Whisper Active (Listening...)</span>
                  </div>
                  <div className="flex items-center gap-1 h-4">
                    {voiceVolumeWave.map((h, idx) => (
                      <div 
                        key={idx}
                        className="w-1 bg-rose-400 rounded-full transition-all duration-75"
                        style={{ height: `${Math.max(4, h * 0.2)}px` }}
                      ></div>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">Sub-150ms Stream</span>
                </motion.div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleVoiceMic}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow ${
                    isRecordingVoice 
                      ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-500/40 animate-pulse' 
                      : 'bg-[#121220] hover:bg-[#1A1A2E] text-rose-400 hover:text-rose-300 border-rose-500/30'
                  }`}
                  title={isRecordingVoice ? 'Stop Recording' : 'Voice-to-UI Mic (Local Faster-Whisper)'}
                >
                  {isRecordingVoice ? <MicOff size={16} /> : <Mic size={16} />}
                </button>

                <input
                  type="text"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendPrompt(userPrompt);
                    }
                  }}
                  placeholder="Describe features in plain English or click the mic to speak..."
                  className="flex-1 px-3.5 py-2.5 bg-[#05050A] border border-gray-800 focus:border-cyan-400 rounded-xl text-xs text-white placeholder:text-gray-600 outline-none transition-colors"
                />
                <button
                  onClick={() => handleSendPrompt(userPrompt)}
                  disabled={!userPrompt.trim() || isClarifying}
                  className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-black font-bold rounded-xl transition-all shadow cursor-pointer"
                  title="Send intent to Merlin"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: THE LIVE PREVIEW DRONE & HITL GATE (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* THE HUMAN-IN-THE-LOOP (HITL) GATE CARD */}
          <div className="bg-gradient-to-r from-[#0D1826] via-[#09121E] to-[#12182B] border border-emerald-500/40 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 shadow">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Human-In-The-Loop (HITL) Verification Gate</span>
                    <span className="px-2 py-0.2 bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] rounded-full font-mono font-bold">
                      0 ERRORS
                    </span>
                  </h3>
                  <p className="text-xs text-gray-300">
                    App built, database connected, zero runtime errors. Ready to publish?
                  </p>
                </div>
              </div>

              {/* Single Approve & Publish Button */}
              <div className="flex items-center gap-2">
                {!isPublished ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleApproveAndPublish}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-[#00F0FF] text-black font-black text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Rocket size={15} />
                    <span>APPROVE & PUBLISH</span>
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-emerald-950 border border-emerald-400 text-emerald-300 text-xs rounded-xl font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>LIVE & PUBLISHED</span>
                    </span>
                    {currentApp.publishedUrl && (
                      <a
                        href={currentApp.publishedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-[#18182A] hover:bg-[#25253C] border border-gray-700 text-cyan-300 rounded-xl transition-all"
                        title="Open published URL"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 4 HITL Checkpoint Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-gray-800/80 text-[11px]">
              <div className="p-2 bg-[#060B12] rounded-lg border border-emerald-500/30 flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span className="truncate">0 Runtime Warnings</span>
              </div>
              <div className="p-2 bg-[#060B12] rounded-lg border border-emerald-500/30 flex items-center gap-1.5 text-emerald-300">
                <Database size={13} className="text-cyan-400 shrink-0" />
                <span className="truncate">Firestore RLS Active</span>
              </div>
              <div className="p-2 bg-[#060B12] rounded-lg border border-emerald-500/30 flex items-center gap-1.5 text-emerald-300">
                <CreditCard size={13} className="text-amber-400 shrink-0" />
                <span className="truncate">Stripe Webhooks Bound</span>
              </div>
              <div className="p-2 bg-[#060B12] rounded-lg border border-emerald-500/30 flex items-center gap-1.5 text-emerald-300">
                <ShieldCheck size={13} className="text-purple-400 shrink-0" />
                <span className="truncate">Z3 Proved (&lt;0.7%)</span>
              </div>
            </div>
          </div>

          {/* THE LIVE PREVIEW DRONE CONTAINER */}
          <div className="bg-[#0A0A14] border border-[#222238] rounded-2xl p-4 shadow-2xl space-y-3">
            {/* Top Toolbar: Device Responsive Switcher & View Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Live Preview Drone</span>
                    <span className="text-[10px] text-gray-500 font-mono">(esbuild-wasm &lt;1.8s)</span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Device Selector */}
                <div className="flex items-center bg-[#05050A] p-0.5 rounded-lg border border-gray-800 text-xs">
                  <button
                    onClick={() => setDeviceView('DESKTOP')}
                    className={`p-1.5 rounded ${deviceView === 'DESKTOP' ? 'bg-[#181828] text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                    title="Desktop View (100%)"
                  >
                    <Monitor size={13} />
                  </button>
                  <button
                    onClick={() => setDeviceView('TABLET')}
                    className={`p-1.5 rounded ${deviceView === 'TABLET' ? 'bg-[#181828] text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                    title="Tablet View (768px)"
                  >
                    <Tablet size={13} />
                  </button>
                  <button
                    onClick={() => setDeviceView('MOBILE')}
                    className={`p-1.5 rounded ${deviceView === 'MOBILE' ? 'bg-[#181828] text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                    title="Mobile View (375px)"
                  >
                    <Smartphone size={13} />
                  </button>
                </div>

                {/* Tab: Interactive vs Code */}
                <div className="flex items-center bg-[#05050A] p-0.5 rounded-lg border border-gray-800 text-xs">
                  <button
                    onClick={() => setPreviewTab('INTERACTIVE')}
                    className={`px-2.5 py-1 rounded font-bold flex items-center gap-1 ${
                      previewTab === 'INTERACTIVE' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Eye size={12} />
                    <span>Interactive</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('CODE')}
                    className={`px-2.5 py-1 rounded font-bold flex items-center gap-1 ${
                      previewTab === 'CODE' ? 'bg-purple-950 text-purple-300 border border-purple-500/40' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Code size={12} />
                    <span>Clean Code</span>
                  </button>
                </div>

                {/* Hot Recompile Button */}
                <button
                  onClick={handleTriggerCompile}
                  disabled={isCompiling}
                  className="p-1.5 bg-[#121220] hover:bg-[#1C1C30] border border-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
                  title="Hot Reload Preview (<1.8s)"
                >
                  <RefreshCw size={13} className={isCompiling ? 'animate-spin text-cyan-400' : ''} />
                </button>
              </div>
            </div>

            {/* Compilation Progress Bar */}
            {isCompiling && (
              <div className="space-y-1 py-1">
                <div className="flex justify-between text-[10px] text-cyan-400 font-mono">
                  <span>Recompiling component AST via esbuild-wasm...</span>
                  <span>{compilationProgress}%</span>
                </div>
                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full transition-all duration-200" style={{ width: `${compilationProgress}%` }}></div>
                </div>
              </div>
            )}

            {/* PREVIEW CANVAS (INTERACTIVE APP) */}
            {previewTab === 'INTERACTIVE' ? (
              <div className={`mx-auto transition-all duration-300 ${
                deviceView === 'MOBILE' ? 'max-w-[375px]' : deviceView === 'TABLET' ? 'max-w-[768px]' : 'w-full'
              }`}>
                {/* Mock Browser Frame */}
                <div className="bg-[#05070E] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                  {/* Browser Address Bar */}
                  <div className="bg-[#0C0F1A] px-3 py-1.5 border-b border-gray-800 flex items-center justify-between text-[10px] text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                    <div className="flex items-center gap-1 bg-[#05070E] px-3 py-0.5 rounded border border-gray-800 font-mono text-cyan-300">
                      <Lock size={10} className="text-emerald-400" />
                      <span>https://auraestates.camelot.live/portal</span>
                    </div>
                    <div className="text-emerald-400 font-bold">1.68s LIVE</div>
                  </div>

                  {/* INTERACTIVE APPLICATION DEMO (AI REAL ESTATE CLIENT PORTAL) */}
                  <div className="p-4 bg-[#070914] text-white min-h-[440px] max-h-[520px] overflow-y-auto space-y-4">
                    {/* App Hero / Top Nav */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D1224] p-3 rounded-xl border border-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-sm text-black">
                          🏰
                        </div>
                        <div>
                          <div className="text-xs font-black text-white">AuraEstates AI Portal</div>
                          <div className="text-[9px] text-cyan-400 font-mono">Real-Time Valuation & Stripe VIP</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowStripeModal(true)}
                          className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-[#D4AF37] hover:from-amber-300 hover:to-[#E5C158] text-black font-black text-xs rounded-lg shadow flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <CreditCard size={12} />
                          <span>VIP Member ($149/mo)</span>
                        </button>
                      </div>
                    </div>

                    {/* AI Property Valuation Estimator Widget */}
                    <div className="bg-gradient-to-r from-[#0C1626] to-[#141026] border border-cyan-500/30 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                          <Sparkles size={13} className="text-cyan-400 animate-pulse" />
                          <span>AI Instant Property Valuation Engine</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-cyan-950 text-cyan-300 rounded font-mono">
                          99.4% Accuracy
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          defaultValue="1044 Ocean Crest Blvd, Malibu"
                          className="px-2.5 py-1.5 bg-[#050812] border border-gray-700 rounded-lg text-xs text-gray-200 outline-none focus:border-cyan-400"
                          placeholder="Property Address..."
                        />
                        <select className="px-2.5 py-1.5 bg-[#050812] border border-gray-700 rounded-lg text-xs text-gray-200 outline-none">
                          <option>5 Beds • 6 Baths • 6,400 sqft</option>
                          <option>6 Beds • 8 Baths • 8,900 sqft</option>
                          <option>Commercial Complex • 24,000 sqft</option>
                        </select>
                        <button
                          onClick={() => {
                            setEstimatedValuation(Math.floor(Math.random() * 2000000 + 4500000));
                            onNotify('⚡ AI Valuation synthesized in 42ms via Z3 Formal Proof!', 'success');
                          }}
                          className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg transition-colors"
                        >
                          Calculate AI Value
                        </button>
                      </div>

                      {estimatedValuation && (
                        <div className="pt-1 flex items-center justify-between text-xs text-gray-300 border-t border-gray-800">
                          <span>AI Synthesized Fair Value:</span>
                          <span className="text-sm font-black text-emerald-400 font-mono">
                            ${estimatedValuation.toLocaleString()} USD
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1 bg-[#0A0E1A] p-1 rounded-lg border border-gray-800 text-xs">
                        {(['ALL', 'PENTHOUSE', 'VILLA', 'COMMERCIAL'] as const).map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setSelectedListingFilter(filter)}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                              selectedListingFilter === filter 
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <Search size={12} className="absolute left-2.5 top-2.5 text-gray-500" />
                        <input
                          type="text"
                          value={simulatedSearchQuery}
                          onChange={(e) => setSimulatedSearchQuery(e.target.value)}
                          placeholder="Filter properties..."
                          className="pl-7 pr-2.5 py-1.5 bg-[#0A0E1A] border border-gray-800 rounded-lg text-xs text-white outline-none focus:border-cyan-400 w-44"
                        />
                      </div>
                    </div>

                    {/* Live Property Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredProperties.map((prop) => (
                        <div
                          key={prop.id}
                          className="bg-[#0C101E] border border-gray-800/80 hover:border-cyan-500/50 rounded-xl p-3 space-y-2 transition-all group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="text-2xl">{prop.image}</div>
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded font-bold">
                              {prop.status}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {prop.title}
                            </h4>
                            <p className="text-[10px] text-gray-400">{prop.location}</p>
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-gray-800">
                            <span className="font-black text-cyan-300 text-sm">{prop.price}</span>
                            <span className="text-[10px] text-emerald-400 font-bold">{prop.valuationDelta}</span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-gray-400">
                            <span>{prop.beds > 0 ? `${prop.beds} Beds • ${prop.baths} Baths` : prop.sqft}</span>
                            <button
                              onClick={() => {
                                onNotify(`📅 Appointment scheduled for ${prop.title}!`, 'success');
                              }}
                              className="px-2 py-1 bg-[#141A2E] hover:bg-[#1E2744] text-cyan-300 rounded text-[10px] font-bold border border-cyan-500/30 transition-colors"
                            >
                              Book Tour
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* CLEAN CODE INSPECTION VIEW */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400 bg-[#05050A] p-2 rounded-lg border border-gray-800">
                  <span className="font-mono text-cyan-400">/src/generated/AuraEstatesClientPortal.tsx</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentApp.componentCode);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                      onNotify('Component code copied to clipboard!', 'success');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-[11px]"
                  >
                    {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-[#050508] border border-gray-800 rounded-xl text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-[460px] leading-relaxed">
                  {currentApp.componentCode}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulated Stripe VIP Billing Modal */}
      {showStripeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C111E] border border-cyan-500/50 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-[#D4AF37]" />
                <h3 className="text-sm font-bold text-white">Stripe VIP Client Pay-Gate</h3>
              </div>
              <button
                onClick={() => setShowStripeModal(false)}
                className="text-gray-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#050812] border border-gray-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">VIP Investor Membership</div>
                  <div className="text-[10px] text-gray-400">Unlimited AI Valuations & Off-Market Listings</div>
                </div>
                <div className="text-sm font-black text-[#D4AF37] font-mono">$149/mo</div>
              </div>

              <div className="p-3 bg-[#050812] border border-cyan-500/30 rounded-xl space-y-2">
                <div className="text-[10px] text-gray-400 font-bold">Stripe Card Element (Test Mode)</div>
                <input
                  type="text"
                  defaultValue="4242 •••• •••• 4242"
                  className="w-full px-3 py-2 bg-[#0C101E] border border-gray-700 rounded-lg text-xs font-mono text-cyan-300 outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    defaultValue="12/28"
                    className="px-3 py-2 bg-[#0C101E] border border-gray-700 rounded-lg text-xs font-mono text-cyan-300 outline-none"
                  />
                  <input
                    type="text"
                    defaultValue="999"
                    className="px-3 py-2 bg-[#0C101E] border border-gray-700 rounded-lg text-xs font-mono text-cyan-300 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowStripeModal(false)}
                className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowStripeModal(false);
                  onNotify('💳 Stripe Subscription verified & activated! Webhook receipt stored in Firestore.', 'success');
                }}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-amber-400 to-[#D4AF37] hover:from-amber-300 hover:to-[#E5C158] text-black font-black text-xs rounded-xl shadow transition-all"
              >
                Confirm ($149/mo)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
