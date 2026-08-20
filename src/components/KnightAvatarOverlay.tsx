import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Mic, 
  MicOff,
  Zap, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  ChevronUp, 
  ChevronDown, 
  Radio, 
  Flame, 
  Cpu, 
  Layers,
  MessageSquare,
  Activity,
  RadioTower,
  Waves,
  Send,
  RefreshCw,
  Sliders,
  AudioWaveform as WaveformIcon,
  Play,
  Square
} from 'lucide-react';

interface KnightAvatarOverlayProps {
  onNotify?: (msg: string, type?: 'success' | 'warning') => void;
  onOpenVoiceHUD?: () => void;
  onOpenEvolveModal?: () => void;
  activeViewTitle?: string;
  isProcessingVoiceIntent?: boolean;
}

export interface KnightPersona {
  id: string;
  name: string;
  role: string;
  color: string;
  badge: string;
  avatarIcon: string;
  greeting: string;
  currentThought: string;
  defaultVoice: 'Kore' | 'Zephyr' | 'Fenrir' | 'Puck' | 'Charon';
  quickActionLabel: string;
  quickActionPrompt: string;
}

export const KNIGHT_PERSONAS: KnightPersona[] = [
  {
    id: 'merlin',
    name: 'MERLIN_Ω',
    role: 'Orchestrator & Loop Core',
    color: '#00F0FF',
    badge: 'ROUTER',
    avatarIcon: '🧙‍♂️',
    greeting: 'The 7-Gate Grill is locked. State DAG flows without entropy.',
    currentThought: 'Monitoring Wasmtime IPC stream. Sub-millisecond agent calls nominal.',
    defaultVoice: 'Zephyr',
    quickActionLabel: 'Route 7-Gate Grill',
    quickActionPrompt: 'Merlin, run a 7-Gate intake audit on the active system state.'
  },
  {
    id: 'anya',
    name: 'HELPER_KNIGHT_ANYA',
    role: 'Sovereign Guide & Prompt Alchemist',
    color: '#D4AF37',
    badge: 'ALCHEMIST',
    avatarIcon: '👑',
    greeting: 'Anya Ω online. Let us alchemize your intent into zero-entropy specifications.',
    currentThought: 'APEE v7.0 compiler ready. Context compression at 68% optimal.',
    defaultVoice: 'Kore',
    quickActionLabel: 'Enhance Intent',
    quickActionPrompt: 'Anya, guide me through enhancing my prompt for the active studio.'
  },
  {
    id: 'lancelot',
    name: 'SIR_LANCELOT',
    role: 'UI/UX Vanguard & Holographic Shaders',
    color: '#F59E0B',
    badge: 'FRONTEND',
    avatarIcon: '⚔️',
    greeting: 'Holographic Armor Plate renders at pure 60fps.',
    currentThought: 'Framer motion sweep active. Zero frame drops across active viewport.',
    defaultVoice: 'Fenrir',
    quickActionLabel: 'Audit 60fps Shaders',
    quickActionPrompt: 'Lancelot, verify UI shader framerates and responsive micro-frontends.'
  },
  {
    id: 'galahad',
    name: 'SIR_GALAHAD',
    role: 'Security Sentinel & SMT Theorem Prover',
    color: '#10B981',
    badge: 'SENTINEL',
    avatarIcon: '🛡️',
    greeting: 'Sentinel capability lease granted. Fail-closed invariants sealed.',
    currentThought: 'Z3 formal verification pass rate: 100%. No memory leaks detected.',
    defaultVoice: 'Puck',
    quickActionLabel: 'Prove Invariants',
    quickActionPrompt: 'Galahad, execute SMT formal verification on active security leases.'
  },
  {
    id: 'warden',
    name: 'SIR_WARDEN',
    role: 'Gideon Protocol & SRE Continuous Audit',
    color: '#EC4899',
    badge: 'AUDITOR',
    avatarIcon: '⚖️',
    greeting: 'Gideon Level 5 active. 5 failure archetypes continuously audited.',
    currentThought: 'Automated regression rollback ready. 24h background cron monitoring.',
    defaultVoice: 'Charon',
    quickActionLabel: 'Gideon Audit',
    quickActionPrompt: 'Warden, initiate continuous SRE telemetry and regression checks.'
  },
  {
    id: 'animator',
    name: 'SIR_ANIMATOR',
    role: 'Kinetic Motion & Particle Shaders',
    color: '#A855F7',
    badge: 'MOTION',
    avatarIcon: '✨',
    greeting: 'Kinetic Hand injects preview in under 200ms.',
    currentThought: 'Cyber glitch keyframes synchronizing on multi-frontend tab changes.',
    defaultVoice: 'Zephyr',
    quickActionLabel: 'Trigger Kinetic Hand',
    quickActionPrompt: 'Animator, inject instant kinetic transition preview.'
  },
  {
    id: 'apis',
    name: 'LADY_APIS',
    role: 'ETL Pipeline & MCP Forager',
    color: '#14B8A6',
    badge: 'FORAGER',
    avatarIcon: '🍯',
    greeting: 'MCP Bifrost stdio tunnel synchronized. Source vaults indexed.',
    currentThought: 'Continuous ETL foraging from Perplexity MCP and NotebookLM.',
    defaultVoice: 'Kore',
    quickActionLabel: 'Forage MCP Vaults',
    quickActionPrompt: 'Lady Apis, forage and index active MCP tool definitions.'
  },
  {
    id: 'scout',
    name: 'SIR_SCOUT',
    role: 'Competitive Intel & SEO Recon',
    color: '#3B82F6',
    badge: 'RECON',
    avatarIcon: '🦅',
    greeting: 'Radar sweep active. Competitive positioning vector mapped.',
    currentThought: 'Continuous market landscape reconnaissance active.',
    defaultVoice: 'Puck',
    quickActionLabel: 'Run Recon Sweep',
    quickActionPrompt: 'Scout, summarize competitive intelligence telemetry.'
  },
  {
    id: 'scribe',
    name: 'SIR_SCRIBE',
    role: 'Blueprint Documentation & Scope',
    color: '#94A3B8',
    badge: 'SCRIBE',
    avatarIcon: '📜',
    greeting: 'Immutable scope records written to Markdown configuration harness.',
    currentThought: 'Schema contracts locked. Zero ambiguity in API boundaries.',
    defaultVoice: 'Charon',
    quickActionLabel: 'Compile Blueprint',
    quickActionPrompt: 'Scribe, compile immutable scope contracts into markdown harness.'
  }
];

export function KnightAvatarOverlay({
  onNotify,
  onOpenVoiceHUD,
  onOpenEvolveModal,
  activeViewTitle = 'MERLIN_AGENCY',
  isProcessingVoiceIntent = false
}: KnightAvatarOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedKnight, setSelectedKnight] = useState<KnightPersona>(KNIGHT_PERSONAS[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Zephyr' | 'Fenrir' | 'Puck' | 'Charon'>('Zephyr');
  const [chatInput, setChatInput] = useState('');
  
  // Audio Spectrum Simulation Bars
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 30, 45, 60, 40, 25, 50, 70, 35, 20]);

  // Dialogue History
  const [knightResponseText, setKnightResponseText] = useState<string>(KNIGHT_PERSONAS[0].greeting);
  const [userTranscript, setUserTranscript] = useState<string>('');

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Update selected voice when knight changes
  useEffect(() => {
    setSelectedVoice(selectedKnight.defaultVoice);
    setKnightResponseText(selectedKnight.greeting);
  }, [selectedKnight]);

  // Audio spectrum visualizer animation
  useEffect(() => {
    let interval: any;
    if (isRecording || isPlayingAudio || isThinking) {
      interval = setInterval(() => {
        setAudioLevels([
          Math.floor(Math.random() * 80) + 15,
          Math.floor(Math.random() * 95) + 10,
          Math.floor(Math.random() * 90) + 20,
          Math.floor(Math.random() * 100) + 10,
          Math.floor(Math.random() * 85) + 25,
          Math.floor(Math.random() * 70) + 20,
          Math.floor(Math.random() * 90) + 15,
          Math.floor(Math.random() * 65) + 10,
        ]);
      }, 100);
    } else {
      setAudioLevels([10, 15, 20, 25, 20, 15, 12, 10]);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPlayingAudio, isThinking]);

  const isActivelyEngaged = isProcessingVoiceIntent || isRecording || isThinking || isPlayingAudio;

  // Speak with Gemini Neural TTS or browser fallback
  const handleVocalizeText = async (text: string, voiceName?: string) => {
    if (isMuted) {
      onNotify?.('Voice audio is muted. Click speaker icon to unmute.', 'warning');
      return;
    }

    const voice = voiceName || selectedVoice || selectedKnight.defaultVoice;
    setIsPlayingAudio(true);

    try {
      // Call server-side Gemini TTS
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName: voice })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          playAudioFromBase64(data.audioBase64);
          return;
        }
      }
      throw new Error('TTS server fallback');
    } catch (e) {
      // Web Speech API fallback
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`${selectedKnight.name}: ${text}`);
        utterance.pitch = selectedKnight.id === 'galahad' ? 0.9 : selectedKnight.id === 'anya' ? 1.1 : 1.0;
        utterance.rate = 1.05;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlayingAudio(false), 2000);
      }
    }
  };

  const playAudioFromBase64 = (base64Audio: string) => {
    try {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      const binaryString = window.atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes.buffer], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
      audio.play();
    } catch (e) {
      console.warn('Audio playback error:', e);
      setIsPlayingAudio(false);
    }
  };

  // Start Mic recording for live voice conversation
  const handleToggleRecord = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await processRecordedVoice(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      onNotify?.(`🎙️ Listening for ${selectedKnight.name}... Speak now!`, 'success');
    } catch (err: any) {
      console.warn('Mic access error, falling back to prompt mode:', err);
      onNotify?.('Microphone permission needed for live speech stream.', 'warning');
      setIsRecording(false);
    }
  };

  const processRecordedVoice = async (audioBlob: Blob) => {
    setIsThinking(true);
    try {
      // Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        // Transcribe voice input with Gemini
        const transRes = await fetch('/api/gemini/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64: base64Data, mimeType: 'audio/webm' })
        });

        const transData = await transRes.json();
        const recognizedText = transData.transcript || 'Hello Knight, report current status.';
        setUserTranscript(recognizedText);

        // Send to Knight Chat
        await handleSendKnightMessage(recognizedText);
      };
    } catch (e: any) {
      console.error(e);
      setIsThinking(false);
      onNotify?.('Audio transcription error: ' + (e?.message || 'timeout'), 'warning');
    }
  };

  const handleSendKnightMessage = async (messageText?: string) => {
    const text = messageText || chatInput;
    if (!text.trim()) return;

    setUserTranscript(text);
    setChatInput('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/gemini/knight-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          knightId: selectedKnight.id,
          messages: [{ role: 'user', parts: [{ text }] }],
          includeAudio: !isMuted
        })
      });

      if (!res.ok) throw new Error('Knight conversation stream error');
      const data = await res.json();
      setKnightResponseText(data.text);

      if (!isMuted && data.audioBase64) {
        playAudioFromBase64(data.audioBase64);
      } else if (!isMuted) {
        handleVocalizeText(data.text, selectedVoice);
      }

      onNotify?.(`⚡ ${selectedKnight.name} responded!`, 'success');
    } catch (err: any) {
      console.error(err);
      setKnightResponseText(`[Transmission Lag] ${selectedKnight.name} received message but neural bridge experienced latency.`);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-4 z-40 font-mono select-none">
      {/* Expanded Operative Console */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="knight-avatar-voice-hud"
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            className="mb-3 w-84 sm:w-96 md:w-[420px] bg-[#0A0A14]/95 border-2 border-[#00F0FF]/60 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.35)] backdrop-blur-2xl overflow-hidden text-gray-200"
          >
            {/* Header */}
            <div className="p-3.5 bg-gradient-to-r from-[#111126] via-[#14142D] to-[#0A0A16] border-b border-[#24243A] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                  {selectedKnight.avatarIcon}
                </span>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-2">
                    <span>{selectedKnight.name}</span>
                    <span 
                      className="text-[9px] px-1.5 py-0.2 rounded font-bold"
                      style={{ 
                        backgroundColor: `${selectedKnight.color}25`, 
                        color: selectedKnight.color, 
                        border: `1px solid ${selectedKnight.color}60` 
                      }}
                    >
                      {selectedKnight.badge}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 truncate max-w-[200px]">
                    {selectedKnight.role}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Voice Tone Selector */}
                <select
                  value={selectedVoice}
                  onChange={e => setSelectedVoice(e.target.value as any)}
                  className="bg-black/50 border border-gray-700 text-[10px] text-cyan-300 rounded px-1.5 py-0.5 focus:outline-none"
                  title="Gemini Neural Voice"
                >
                  <option value="Zephyr">Zephyr</option>
                  <option value="Kore">Kore</option>
                  <option value="Fenrir">Fenrir</option>
                  <option value="Puck">Puck</option>
                  <option value="Charon">Charon</option>
                </select>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title={isMuted ? 'Unmute Voice' : 'Mute Voice'}
                >
                  {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-emerald-400" />}
                </button>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <ChevronDown size={15} />
                </button>
              </div>
            </div>

            {/* Knight Selection Strip (All 9 Knights) */}
            <div className="p-2 bg-[#07070F] border-b border-[#1C1C2C] flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
              {KNIGHT_PERSONAS.map(knight => (
                <button
                  key={knight.id}
                  onClick={() => setSelectedKnight(knight)}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    selectedKnight.id === knight.id
                      ? 'bg-gradient-to-r from-cyan-950 to-blue-950 text-white border border-cyan-400/80 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                      : 'bg-[#10101C] text-gray-400 hover:text-white hover:bg-[#18182A] border border-gray-800'
                  }`}
                >
                  <span className="text-xs">{knight.avatarIcon}</span>
                  <span>{knight.name.replace('SIR_', '').replace('HELPER_KNIGHT_', '').replace('LADY_', '')}</span>
                </button>
              ))}
            </div>

            {/* Live Audio Spectrum & Processing Banner */}
            <div className="px-3.5 py-2.5 bg-[#0D0D18] border-b border-[#1E1E30] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-end gap-0.5 h-5 w-24">
                  {audioLevels.map((lvl, idx) => (
                    <div
                      key={idx}
                      className="w-1.5 rounded-t transition-all duration-75"
                      style={{
                        height: `${Math.max(15, lvl)}%`,
                        backgroundColor: isRecording 
                          ? '#EF4444' 
                          : isPlayingAudio 
                          ? '#10B981' 
                          : isThinking 
                          ? '#D4AF37' 
                          : '#00F0FF'
                      }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase text-cyan-300">
                  {isRecording ? '🎙️ LISTENING...' : isThinking ? '⚡ SYNTHESIZING...' : isPlayingAudio ? '🔊 SPEAKING...' : 'LIVE READY'}
                </span>
              </div>

              <div className="text-[9px] text-gray-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live API / 24kHz PCM</span>
              </div>
            </div>

            {/* Conversation Dialogue Bubble */}
            <div className="p-3.5 space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
              {/* User last transcript */}
              {userTranscript && (
                <div className="p-2.5 rounded-xl bg-[#18182E] border border-cyan-500/30 text-right space-y-1">
                  <div className="text-[9px] text-cyan-400 uppercase font-black">You (Voice / Text)</div>
                  <div className="text-xs text-cyan-100 font-sans italic">"{userTranscript}"</div>
                </div>
              )}

              {/* Knight Active Speech */}
              <div className="p-3 rounded-xl bg-[#121222] border border-[#23233D] space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black text-gray-400">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Activity size={12} className="text-amber-400" />
                    <span>{selectedKnight.name} RESPONSES</span>
                  </div>
                  <button
                    onClick={() => handleVocalizeText(knightResponseText)}
                    className="p-1 text-gray-400 hover:text-amber-300 flex items-center gap-1 text-[10px]"
                    title="Repeat Spoken Audio"
                  >
                    <Play size={10} />
                    <span>Repeat</span>
                  </button>
                </div>

                <p className="text-xs text-white leading-relaxed font-sans font-medium">
                  "{knightResponseText}"
                </p>

                <div className="text-[10.5px] text-gray-400 font-mono italic pt-1 border-t border-gray-800/60">
                  &gt; {selectedKnight.currentThought}
                </div>
              </div>

              {/* Quick Tactical Prompt Trigger */}
              <div className="pt-1">
                <button
                  onClick={() => handleSendKnightMessage(selectedKnight.quickActionPrompt)}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-black/40 hover:bg-cyan-950/40 border border-gray-800 hover:border-cyan-500/40 text-[10.5px] text-cyan-300 font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <Zap size={11} className="text-amber-400" />
                    <span>Quick: {selectedKnight.quickActionLabel}</span>
                  </span>
                  <span className="text-[9px] text-gray-400 font-normal">One-Click Dispatch</span>
                </button>
              </div>
            </div>

            {/* Real-Time Live Input Strip (Mic + Text) */}
            <div className="p-3 bg-[#080812] border-t border-gray-800 space-y-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleToggleRecord}
                  className={`p-2.5 rounded-xl border font-bold flex items-center justify-center transition-all ${
                    isRecording
                      ? 'bg-red-600 text-white border-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]'
                      : 'bg-cyan-950/80 hover:bg-cyan-900/80 border-cyan-500/60 text-cyan-300'
                  }`}
                  title={isRecording ? 'Stop Recording' : 'Hold to Speak via Microphone'}
                >
                  {isRecording ? <Square size={14} /> : <Mic size={14} />}
                </button>

                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendKnightMessage()}
                  placeholder={`Speak or type to ${selectedKnight.name}...`}
                  className="flex-1 bg-[#10101C] border border-gray-700 focus:border-cyan-400 text-white text-xs px-3 py-2 rounded-xl focus:outline-none placeholder-gray-600 font-mono"
                />

                <button
                  onClick={() => handleSendKnightMessage()}
                  disabled={isThinking || !chatInput.trim()}
                  className="p-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-40 flex items-center justify-center"
                >
                  <Send size={13} />
                </button>
              </div>

              {/* Utility shortcuts */}
              <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                <button
                  onClick={() => {
                    setIsExpanded(false);
                    onOpenVoiceHUD?.();
                  }}
                  className="hover:text-cyan-300 flex items-center gap-1"
                >
                  <Radio size={11} />
                  <span>Full Spatial Voice HUD</span>
                </button>

                <button
                  onClick={() => {
                    setIsExpanded(false);
                    onOpenEvolveModal?.();
                  }}
                  className="hover:text-amber-300 flex items-center gap-1"
                >
                  <Zap size={11} />
                  <span>//EVOLVE MATRIX</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Pill Trigger */}
      <div className="relative inline-flex items-center justify-center">
        {/* Animated Concentric Pulse Wave Rings when Processing Voice Intent */}
        {isActivelyEngaged && (
          <>
            <motion.div
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ 
                scale: [1, 1.45, 1.85],
                opacity: [0.8, 0.4, 0]
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: 'easeOut'
              }}
              className="absolute inset-0 rounded-full border-2 border-[#00F0FF] pointer-events-none shadow-[0_0_20px_#00F0FF]"
            />
            <motion.div
              initial={{ scale: 1, opacity: 0.9 }}
              animate={{ 
                scale: [1, 1.3, 1.65],
                opacity: [0.9, 0.45, 0]
              }}
              transition={{
                duration: 1.6,
                delay: 0.4,
                repeat: Infinity,
                ease: 'easeOut'
              }}
              className="absolute inset-0 rounded-full border border-[#D4AF37] pointer-events-none shadow-[0_0_15px_#D4AF37]"
            />
          </>
        )}

        <motion.button
          id="knight-avatar-trigger-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative z-10 px-3.5 py-2 rounded-full border-2 text-white flex items-center gap-2.5 cursor-pointer backdrop-blur-md transition-all duration-300 ${
            isActivelyEngaged
              ? 'bg-gradient-to-r from-[#0E2436] via-[#1A1832] to-[#241C12] border-[#00F0FF] shadow-[0_0_30px_rgba(0,240,255,0.65)] ring-2 ring-[#00F0FF]/60 animate-pulse'
              : 'bg-gradient-to-r from-[#0C1424] to-[#1E172A] border-[#00F0FF]/80 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span className="text-base">{selectedKnight.avatarIcon}</span>
            {isActivelyEngaged && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-80" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
              </span>
            )}
          </div>

          <div className="text-left hidden sm:block">
            <div className="text-[11px] font-black text-white leading-tight flex items-center gap-1.5">
              <span>{selectedKnight.name}</span>
              {isActivelyEngaged ? (
                <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-400 animate-pulse">
                  VOICE ACTIVE
                </span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>

            <div className={`text-[9px] font-mono flex items-center gap-1 ${
              isActivelyEngaged ? 'text-[#00F0FF] font-bold animate-pulse' : 'text-gray-400'
            }`}>
              {isActivelyEngaged ? (
                <>
                  <Waves size={10} className="text-[#00F0FF] animate-spin" />
                  <span>VOICE CONVERSATION LIVE</span>
                </>
              ) : (
                <span>TALK WITH KNIGHTS</span>
              )}
            </div>
          </div>

          {isExpanded ? (
            <ChevronDown size={14} className="text-gray-400" />
          ) : (
            <ChevronUp size={14} className={isActivelyEngaged ? 'text-[#00F0FF] animate-bounce' : 'text-[#00F0FF]'} />
          )}
        </motion.button>
      </div>
    </div>
  );
}
