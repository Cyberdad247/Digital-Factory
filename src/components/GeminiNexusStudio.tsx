import React, { useState, useRef, useEffect } from 'react';
import { 
  Radio, 
  Mic, 
  MicOff, 
  Search, 
  Bot, 
  Zap, 
  Image as ImageIcon, 
  Video, 
  BrainCircuit, 
  FileAudio, 
  Send, 
  Play, 
  Square, 
  Upload, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Volume2, 
  Activity,
  Layers,
  ChevronRight,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import Markdown from 'react-markdown';

type NexusSubTab = 'LIVE_VOICE' | 'CHAT_INTELLIGENCE' | 'SEARCH_GROUNDING' | 'IMAGE_VISION' | 'VIDEO_ANALYSIS' | 'HIGH_THINKING' | 'AUDIO_TRANSCRIBE' | 'LOW_LATENCY';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  thinkingEnabled?: boolean;
}

interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export function GeminiNexusStudio() {
  const [activeTab, setActiveTab] = useState<NexusSubTab>('LIVE_VOICE');

  // =========================================================================
  // 1. LIVE VOICE (gemini-3.1-flash-live-preview)
  // =========================================================================
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [liveStatusText, setLiveStatusText] = useState('Idle - Click Connect to initiate Live API session');
  const [liveTranscript, setLiveTranscript] = useState<Array<{ sender: 'user' | 'gemini'; text: string; time: string }>>([
    { sender: 'gemini', text: 'Sovereign Live Voice Core primed (gemini-3.1-flash-live-preview). Connect your microphone to converse in real-time.', time: '00:00:00' }
  ]);
  const liveWsRef = useRef<WebSocket | null>(null);
  const liveAudioCtxRef = useRef<AudioContext | null>(null);
  const liveOutputCtxRef = useRef<AudioContext | null>(null);
  const liveNextStartTimeRef = useRef<number>(0);
  const liveMediaStreamRef = useRef<MediaStream | null>(null);
  const liveProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const startLiveSession = async () => {
    try {
      setLiveStatusText('Connecting to Live API bridge (gemini-3.1-flash-live-preview)...');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      liveWsRef.current = ws;

      // Audio contexts
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      liveAudioCtxRef.current = inputCtx;
      liveOutputCtxRef.current = outputCtx;
      liveNextStartTimeRef.current = outputCtx.currentTime;

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      liveMediaStreamRef.current = stream;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      liveProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN && !isMicMuted) {
          const inputData = e.inputBuffer.getChannelData(0);
          
          // Calculate volume level for visualizer
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
          }
          const rms = Math.sqrt(sum / inputData.length);
          setAudioLevel(Math.min(100, Math.round(rms * 400)));

          // Convert Float32 to 16-bit PCM little-endian
          const pcmBuffer = new ArrayBuffer(inputData.length * 2);
          const view = new DataView(pcmBuffer);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
          }

          // Convert buffer to base64
          const bytes = new Uint8Array(pcmBuffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64Audio = btoa(binary);

          ws.send(JSON.stringify({ audio: base64Audio }));
        }
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);

      ws.onopen = () => {
        setIsLiveConnected(true);
        setLiveStatusText('LIVE STREAM ACTIVE: gemini-3.1-flash-live-preview (Bidirectional 16kHz In / 24kHz Out)');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.audio) {
            playLivePCMChunk(outputCtx, msg.audio);
          }
          if (msg.interrupted) {
            liveNextStartTimeRef.current = outputCtx.currentTime;
          }
          if (msg.error) {
            setLiveStatusText(`Live API Error: ${msg.error}`);
          }
        } catch (err) {
          console.error('Error handling WS message:', err);
        }
      };

      ws.onclose = () => {
        setIsLiveConnected(false);
        setLiveStatusText('Live Session Terminated.');
        cleanupLiveAudio();
      };

      ws.onerror = (err) => {
        console.error('WS Error:', err);
        setLiveStatusText('WebSocket connection failed. Ensure server is active.');
      };

    } catch (err: any) {
      console.error('Error starting live session:', err);
      setLiveStatusText(`Microphone/Live API error: ${err.message || 'Permission denied'}`);
    }
  };

  const playLivePCMChunk = (outputCtx: AudioContext, base64PCM: string) => {
    try {
      const binaryString = window.atob(base64PCM);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const dataView = new DataView(bytes.buffer);
      const numSamples = Math.floor(bytes.byteLength / 2);
      const float32Data = new Float32Array(numSamples);

      for (let i = 0; i < numSamples; i++) {
        const int16 = dataView.getInt16(i * 2, true);
        float32Data[i] = int16 / (int16 < 0 ? 32768 : 32767);
      }

      const audioBuffer = outputCtx.createBuffer(1, numSamples, 24000);
      audioBuffer.copyToChannel(float32Data, 0);

      const source = outputCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputCtx.destination);

      const currentTime = outputCtx.currentTime;
      const startTime = Math.max(currentTime, liveNextStartTimeRef.current);
      source.start(startTime);
      liveNextStartTimeRef.current = startTime + audioBuffer.duration;
    } catch (err) {
      console.error('Error playing live PCM audio:', err);
    }
  };

  const cleanupLiveAudio = () => {
    if (liveMediaStreamRef.current) {
      liveMediaStreamRef.current.getTracks().forEach(track => track.stop());
      liveMediaStreamRef.current = null;
    }
    if (liveProcessorRef.current) {
      liveProcessorRef.current.disconnect();
      liveProcessorRef.current = null;
    }
    if (liveAudioCtxRef.current) {
      liveAudioCtxRef.current.close();
      liveAudioCtxRef.current = null;
    }
    if (liveOutputCtxRef.current) {
      liveOutputCtxRef.current.close();
      liveOutputCtxRef.current = null;
    }
    if (liveWsRef.current) {
      liveWsRef.current.close();
      liveWsRef.current = null;
    }
    setIsLiveConnected(false);
    setAudioLevel(0);
  };

  const stopLiveSession = () => {
    cleanupLiveAudio();
    setLiveStatusText('Live Session Closed.');
  };

  // =========================================================================
  // 2. CHAT & INTELLIGENCE (gemini-3.1-pro-preview, gemini-3.5-flash, gemini-3.1-flash-lite)
  // =========================================================================
  const knightRoles = [
    { id: 'ANYA', name: 'Anya Ω (Gatekeeper)', role: 'You are Anya Ω, Sovereign Cognitive Gatekeeper of Camelot-OS. You possess razor-sharp intelligence, mathematical rigor, and uncompromising architectural standards.', defaultModel: 'gemini-3.1-pro-preview' },
    { id: 'MERLIN', name: 'Merlin Ω (Architect)', role: 'You are Merlin Ω, Chief Cognitive Architect of the Camelot-OS Software Foundry. You specialize in full-stack architecture, DAG task graphs, and algorithmic synthesis.', defaultModel: 'gemini-3.1-pro-preview' },
    { id: 'SIR_LINK', name: 'Sir Link (Ledger)', role: 'You are Sir Link, Sovereign Retail, Commerce & Inventory Sentinel. You analyze transactions, orders, and ledger balances with exact precision.', defaultModel: 'gemini-3.5-flash' },
    { id: 'MNEMOSYNE', name: 'Lady Mnemosyne (Oracle)', role: 'You are Lady Mnemosyne, Keeper of the Grounded Knowledge Vault and semantic memory.', defaultModel: 'gemini-3.5-flash' },
    { id: 'SPEED_COREFLEX', name: 'Reflex Core (Fast)', role: 'You are Reflex Core. Provide instantaneous, ultra-concise, low-latency tactical feedback.', defaultModel: 'gemini-3.1-flash-lite' }
  ];

  const [selectedRole, setSelectedRole] = useState(knightRoles[0]);
  const [selectedChatModel, setSelectedChatModel] = useState('gemini-3.5-flash');
  const [chatThinkingEnabled, setChatThinkingEnabled] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: 'Greetings. I am Anya Ω. Multi-turn intelligence and multi-model dispatch are active. How shall we direct the Camelot cognitive nexus today?',
      timestamp: new Date().toLocaleTimeString(),
      modelUsed: 'gemini-3.1-pro-preview'
    }
  ]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userText = chatInput.trim();
    setChatInput('');

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString()
    };

    const updatedMessages = [...chatMessages, newMsg];
    setChatMessages(updatedMessages);
    setIsChatLoading(true);

    try {
      // Format payload for multi-turn history
      const formattedHistory = updatedMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: formattedHistory,
          model: chatThinkingEnabled ? 'gemini-3.1-pro-preview' : selectedChatModel,
          systemInstruction: selectedRole.role,
          enableThinking: chatThinkingEnabled
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: data.text || 'No response text returned.',
          timestamp: new Date().toLocaleTimeString(),
          modelUsed: data.modelUsed,
          thinkingEnabled: chatThinkingEnabled
        }
      ]);
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: `⚠️ Error executing Gemini Chat: ${err.message || 'Server request failed'}`,
          timestamp: new Date().toLocaleTimeString(),
          modelUsed: selectedChatModel
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // =========================================================================
  // 3. SEARCH GROUNDING (gemini-3.5-flash with googleSearch)
  // =========================================================================
  const [searchPrompt, setSearchPrompt] = useState('What are the latest breakthroughs in AI agent swarms and quantum-resistant cryptographic lattices in 2026?');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [webQueries, setWebQueries] = useState<string[]>([]);

  const runSearchGrounding = async (queryText?: string) => {
    const q = queryText || searchPrompt;
    if (!q.trim() || searchLoading) return;
    setSearchLoading(true);
    setSearchResult(null);
    setGroundingChunks([]);
    setWebQueries([]);

    try {
      const res = await fetch('/api/gemini/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: q,
          systemInstruction: 'You are an accurate, real-time intelligence research agent with Google Search grounding. Cite factual data points.'
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSearchResult(data.text);
      setGroundingChunks(data.groundingChunks || []);
      setWebQueries(data.searchQueries || []);
    } catch (err: any) {
      setSearchResult(`⚠️ Google Search Grounding error: ${err.message}`);
    } finally {
      setSearchLoading(false);
    }
  };

  // =========================================================================
  // 4. LOW-LATENCY ENGINE (gemini-3.1-flash-lite)
  // =========================================================================
  const [lowLatencyPrompt, setLowLatencyPrompt] = useState('Calculate optimal routing index for 1,024 worker threads on 24D lattice.');
  const [lowLatencyLoading, setLowLatencyLoading] = useState(false);
  const [lowLatencyResult, setLowLatencyResult] = useState<{ text: string; latencyMs: number } | null>(null);

  const runLowLatency = async () => {
    if (!lowLatencyPrompt.trim() || lowLatencyLoading) return;
    setLowLatencyLoading(true);
    try {
      const res = await fetch('/api/gemini/low-latency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: lowLatencyPrompt })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLowLatencyResult({ text: data.text, latencyMs: data.latencyMs });
    } catch (err: any) {
      setLowLatencyResult({ text: `⚠️ Error: ${err.message}`, latencyMs: 0 });
    } finally {
      setLowLatencyLoading(false);
    }
  };

  // =========================================================================
  // 5. IMAGE UNDERSTANDING (gemini-3.1-pro-preview)
  // =========================================================================
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/png');
  const [imagePrompt, setImagePrompt] = useState('Perform high-precision multimodal analysis of this visual artifact. Extract UI components, diagrams, architectural topology, and semantic anomalies.');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageMime(file.type || 'image/png');
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        const base64Data = result.split(',')[1];
        setImageBase64(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const runImageAnalysis = async () => {
    if (!imageBase64 || imageLoading) return;
    setImageLoading(true);
    setImageResult(null);

    try {
      const res = await fetch('/api/gemini/image-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType: imageMime,
          prompt: imagePrompt
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setImageResult(data.text);
    } catch (err: any) {
      setImageResult(`⚠️ Image analysis error: ${err.message}`);
    } finally {
      setImageLoading(false);
    }
  };

  // Sample placeholder image generator
  const loadSampleImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0F0F1A';
      ctx.fillRect(0, 0, 600, 400);
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, 520, 320);

      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('CAMELOT-OS TOPOLOGY MATRIX', 80, 80);

      ctx.fillStyle = '#38BDF8';
      ctx.font = '14px monospace';
      ctx.fillText('Node A (Tier-0 Anya Ω) --> Node B (1,024 Swarm Workers)', 80, 140);
      ctx.fillText('Quantization: 24D Leech Lattice (24 Dim)', 80, 180);
      ctx.fillText('SARDA Cache Hit Rate: 96.4%', 80, 220);
      ctx.fillText('Memory Clamping: <= 1.5 KB per agent', 80, 260);

      const dataUrl = canvas.toDataURL('image/png');
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(',')[1]);
      setImageMime('image/png');
    }
  };

  // =========================================================================
  // 6. VIDEO UNDERSTANDING (gemini-3.1-pro-preview)
  // =========================================================================
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoBase64, setVideoBase64] = useState<string | null>(null);
  const [videoMime, setVideoMime] = useState<string>('video/mp4');
  const [videoPrompt, setVideoPrompt] = useState('Analyze this video sequence for temporal transitions, key actions, visual cues, and timestamped insights.');
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoMime(file.type || 'video/mp4');
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setVideoPreview(result);
        const base64Data = result.split(',')[1];
        setVideoBase64(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const runVideoAnalysis = async () => {
    if (!videoBase64 || videoLoading) return;
    setVideoLoading(true);
    setVideoResult(null);

    try {
      const res = await fetch('/api/gemini/video-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoBase64,
          mimeType: videoMime,
          prompt: videoPrompt
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVideoResult(data.text);
    } catch (err: any) {
      setVideoResult(`⚠️ Video analysis error: ${err.message}`);
    } finally {
      setVideoLoading(false);
    }
  };

  // =========================================================================
  // 7. HIGH THINKING MODE (gemini-3.1-pro-preview with ThinkingLevel.HIGH)
  // =========================================================================
  const [thinkingPrompt, setThinkingPrompt] = useState(`Prove that sphere-packing in 24 dimensions via the Leech Lattice $\\Lambda_{24}$ with kissing number 196,560 yields an optimal mathematical quantization scheme for distributed agent memory representations under the 1.5 KB per-agent boundary.`);
  const [thinkingLoading, setThinkingLoading] = useState(false);
  const [thinkingResult, setThinkingResult] = useState<string | null>(null);

  const runHighThinking = async () => {
    if (!thinkingPrompt.trim() || thinkingLoading) return;
    setThinkingLoading(true);
    setThinkingResult(null);

    try {
      const res = await fetch('/api/gemini/high-thinking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: thinkingPrompt,
          systemInstruction: 'You are an advanced sovereign reasoning engine. Perform deep multi-step verification, formal logic proofs, and structural derivation.'
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setThinkingResult(data.text);
    } catch (err: any) {
      setThinkingResult(`⚠️ High thinking error: ${err.message}`);
    } finally {
      setThinkingLoading(false);
    }
  };

  // =========================================================================
  // 8. AUDIO TRANSCRIBE (gemini-3.5-flash)
  // =========================================================================
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [transcribeAudioBase64, setTranscribeAudioBase64] = useState<string | null>(null);
  const [transcribeMime, setTranscribeMime] = useState<string>('audio/webm');
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const startAudioRecording = async () => {
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
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
        setTranscribeMime(audioBlob.type);

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          setTranscribeAudioBase64(base64);
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecordingAudio(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Audio recording failed:', err);
      alert(`Microphone permission error: ${err.message}`);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTranscribeMime(file.type || 'audio/webm');
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        setTranscribeAudioBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAudioTranscription = async () => {
    if (!transcribeAudioBase64 || transcribeLoading) return;
    setTranscribeLoading(true);
    setTranscriptionResult(null);

    try {
      const res = await fetch('/api/gemini/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: transcribeAudioBase64,
          mimeType: transcribeMime,
          prompt: 'Transcribe this spoken audio verbatim with exact punctuation and speaker cues.'
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTranscriptionResult(data.transcript);
    } catch (err: any) {
      setTranscriptionResult(`⚠️ Audio transcription error: ${err.message}`);
    } finally {
      setTranscribeLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="gemini-nexus-studio">
      {/* Header Banner */}
      <div className="bg-[#12121A] border border-[#2A2A3A] rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#D4AF37]/10 via-[#38BDF8]/5 to-transparent pointer-events-none rounded-full blur-3xl" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-[#D4AF37] animate-spin" style={{ animationDuration: '8s' }} />
              <h2 className="text-lg font-bold text-white tracking-wider uppercase flex items-center gap-2">
                Gemini Singularity Intelligence Nexus
                <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-0.5 rounded font-mono">
                  ACTIVE_SUITE_V3
                </span>
              </h2>
            </div>
            <p className="text-xs text-gray-400">
              Live API Voice (gemini-3.1-flash-live-preview) • Search Grounding (gemini-3.5-flash) • Multimodal Vision & Video (gemini-3.1-pro-preview) • High Thinking Mode
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-gray-400 font-mono uppercase">API Connection</div>
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                @google/genai Server-Side Proxy
              </div>
            </div>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mt-5 pt-4 border-t border-[#222230]">
          <button
            id="tab-live-voice"
            onClick={() => setActiveTab('LIVE_VOICE')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'LIVE_VOICE'
                ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-bold'
                : 'bg-[#181824] text-gray-300 hover:bg-[#202030] hover:text-white border border-[#2A2A3A]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="truncate">Live Voice</span>
          </button>

          <button
            id="tab-chat-intelligence"
            onClick={() => setActiveTab('CHAT_INTELLIGENCE')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'CHAT_INTELLIGENCE'
                ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-bold'
                : 'bg-[#181824] text-gray-300 hover:bg-[#202030] hover:text-white border border-[#2A2A3A]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="truncate">Gemini Chat</span>
          </button>

          <button
            id="tab-search-grounding"
            onClick={() => setActiveTab('SEARCH_GROUNDING')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'SEARCH_GROUNDING'
                ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-bold'
                : 'bg-[#181824] text-gray-300 hover:bg-[#202030] hover:text-white border border-[#2A2A3A]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="truncate">Search Grounding</span>
          </button>

          <button
            id="tab-high-thinking"
            onClick={() => setActiveTab('HIGH_THINKING')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'HIGH_THINKING'
                ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-bold'
                : 'bg-[#181824] text-gray-300 hover:bg-[#202030] hover:text-white border border-[#2A2A3A]'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span className="truncate">High Thinking</span>
          </button>

          <button
            id="tab-low-latency"
            onClick={() => setActiveTab('LOW_LATENCY')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'LOW_LATENCY'
                ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-bold'
                : 'bg-[#181824] text-gray-300 hover:bg-[#202030] hover:text-white border border-[#2A2A3A]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="truncate">Low Latency</span>
          </button>

          <button
            id="tab-image-vision"
            onClick={() => setActiveTab('IMAGE_VISION')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'IMAGE_VISION'
                ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-bold'
                : 'bg-[#181824] text-gray-300 hover:bg-[#202030] hover:text-white border border-[#2A2A3A]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="truncate">Image Vision</span>
          </button>

          <button
            id="tab-video-analysis"
            onClick={() => setActiveTab('VIDEO_ANALYSIS')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'VIDEO_ANALYSIS'
                ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-bold'
                : 'bg-[#181824] text-gray-300 hover:bg-[#202030] hover:text-white border border-[#2A2A3A]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span className="truncate">Video Analysis</span>
          </button>

          <button
            id="tab-audio-transcribe"
            onClick={() => setActiveTab('AUDIO_TRANSCRIBE')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'AUDIO_TRANSCRIBE'
                ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-bold'
                : 'bg-[#181824] text-gray-300 hover:bg-[#202030] hover:text-white border border-[#2A2A3A]'
            }`}
          >
            <FileAudio className="w-3.5 h-3.5" />
            <span className="truncate">Transcribe</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. LIVE VOICE CONVERSATIONS (gemini-3.1-flash-live-preview)           */}
      {/* ===================================================================== */}
      {activeTab === 'LIVE_VOICE' && (
        <div className="bg-[#12121A] border border-[#2A2A3A] rounded-xl p-6 space-y-6" id="panel-live-voice">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Real-Time Voice Stream (Live API)
                </h3>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Model: <span className="text-[#38BDF8] font-mono font-bold">gemini-3.1-flash-live-preview</span> • Ultra low-latency bidirectional voice bridge (16kHz PCM In / 24kHz PCM Out)
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isLiveConnected ? (
                <>
                  <button
                    id="btn-mute-mic"
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      isMicMuted ? 'bg-amber-600/30 text-amber-400 border border-amber-500/50' : 'bg-[#1E1E2C] text-gray-200 hover:bg-[#28283C]'
                    }`}
                  >
                    {isMicMuted ? <MicOff className="w-4 h-4 text-amber-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                    {isMicMuted ? 'Muted' : 'Mic Active'}
                  </button>
                  <button
                    id="btn-disconnect-live"
                    onClick={stopLiveSession}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded-lg text-xs font-bold transition-all"
                  >
                    <Square className="w-4 h-4" />
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  id="btn-connect-live"
                  onClick={startLiveSession}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B38F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-black font-black rounded-lg text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#D4AF37]/20"
                >
                  <Radio className="w-4 h-4" />
                  Connect Live Voice
                </button>
              )}
            </div>
          </div>

          {/* Audio Waveform / Visualizer */}
          <div className="bg-[#0A0A10] border border-[#222230] rounded-xl p-6 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-md">
              {[...Array(24)].map((_, i) => {
                const height = isLiveConnected && !isMicMuted 
                  ? Math.max(8, Math.sin((i + Date.now() / 150) * 0.5) * (audioLevel * 0.8) + 12)
                  : 6;
                return (
                  <div
                    key={i}
                    className={`w-2 rounded-full transition-all duration-75 ${
                      isLiveConnected ? (isMicMuted ? 'bg-amber-500/40' : 'bg-gradient-to-t from-[#D4AF37] to-[#38BDF8]') : 'bg-gray-800'
                    }`}
                    style={{ height: `${Math.min(60, height)}px` }}
                  />
                );
              })}
            </div>

            <div className="font-mono text-xs text-gray-300">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
              {liveStatusText}
            </div>
          </div>

          {/* Quick Voice Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-[#161622] border border-[#242434] p-3.5 rounded-lg">
              <div className="text-[11px] font-bold text-[#D4AF37] uppercase flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" /> High-Definition Audio
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Raw 16-bit PCM little-endian audio streaming directly to Gemini Live backend.
              </div>
            </div>
            <div className="bg-[#161622] border border-[#242434] p-3.5 rounded-lg">
              <div className="text-[11px] font-bold text-[#38BDF8] uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Natural Interruption
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Speak over the model at any moment; the Live API detects user speech and instantly yields.
              </div>
            </div>
            <div className="bg-[#161622] border border-[#242434] p-3.5 rounded-lg">
              <div className="text-[11px] font-bold text-purple-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Zephyr Voice Persona
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Crystal clear resonant synthetic voice calibrated for Camelot sovereign command.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. CHAT & INTELLIGENCE                                                */}
      {/* ===================================================================== */}
      {activeTab === 'CHAT_INTELLIGENCE' && (
        <div className="bg-[#12121A] border border-[#2A2A3A] rounded-xl p-5 space-y-4" id="panel-gemini-chat">
          {/* Controls bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#222230]">
            {/* Knight Persona Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">ROLE:</span>
              <select
                id="select-knight-role"
                value={selectedRole.id}
                onChange={(e) => {
                  const role = knightRoles.find(r => r.id === e.target.value) || knightRoles[0];
                  setSelectedRole(role);
                  setSelectedChatModel(role.defaultModel);
                }}
                className="bg-[#181824] border border-[#2A2A3A] text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#D4AF37]"
              >
                {knightRoles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Model Selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">MODEL:</span>
                <select
                  id="select-gemini-model"
                  value={selectedChatModel}
                  onChange={(e) => setSelectedChatModel(e.target.value)}
                  className="bg-[#181824] border border-[#2A2A3A] text-[#38BDF8] text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#38BDF8]"
                >
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Tasks)</option>
                  <option value="gemini-3.5-flash">gemini-3.5-flash (General Tasks)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Tasks)</option>
                </select>
              </div>

              {/* High Thinking Toggle */}
              <button
                id="btn-toggle-thinking"
                onClick={() => setChatThinkingEnabled(!chatThinkingEnabled)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  chatThinkingEnabled 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' 
                    : 'bg-[#181824] text-gray-400 hover:text-gray-200 border border-[#2A2A3A]'
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                Thinking: {chatThinkingEnabled ? 'HIGH' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Thread messages */}
          <div className="h-[420px] overflow-y-auto space-y-4 pr-2 font-sans" id="chat-messages-container">
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10px] font-mono text-gray-400">{msg.timestamp}</span>
                  {msg.modelUsed && (
                    <span className="text-[9px] font-mono bg-[#1E1E2C] text-[#38BDF8] px-1.5 py-0.5 rounded border border-[#28283C]">
                      {msg.modelUsed}
                    </span>
                  )}
                  {msg.thinkingEnabled && (
                    <span className="text-[9px] font-mono bg-purple-900/40 text-purple-300 px-1.5 py-0.5 rounded border border-purple-700/50">
                      THINKING.HIGH
                    </span>
                  )}
                </div>

                <div
                  className={`max-w-[85%] rounded-xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#1E1E2C] border border-[#2E2E40] text-gray-100'
                      : 'bg-[#14141E] border border-[#222232] text-gray-200'
                  }`}
                >
                  <div className="prose prose-invert prose-xs sm:prose-sm max-w-none">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-400 italic p-3 bg-[#14141E] rounded-lg border border-[#222232] w-fit">
                <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" />
                Gemini intelligence synthesising response...
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2 pt-2">
            <input
              id="input-chat-prompt"
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
              placeholder={`Message ${selectedRole.name}...`}
              className="flex-1 bg-[#0A0A12] border border-[#2A2A3A] text-white text-xs sm:text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              id="btn-send-chat"
              onClick={sendChatMessage}
              disabled={isChatLoading || !chatInput.trim()}
              className="px-5 py-3 bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-50 text-black font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. SEARCH GROUNDING (gemini-3.5-flash + googleSearch)                 */}
      {/* ===================================================================== */}
      {activeTab === 'SEARCH_GROUNDING' && (
        <div className="bg-[#12121A] border border-[#2A2A3A] rounded-xl p-6 space-y-6" id="panel-search-grounding">
          <div>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-[#38BDF8]" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Google Search Grounding Engine
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Model: <span className="text-[#38BDF8] font-mono font-bold">gemini-3.5-flash</span> • Live web knowledge grounded with verifiable citations & real-time metadata.
            </p>
          </div>

          {/* Search Query Input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                id="input-search-prompt"
                type="text"
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
                placeholder="Enter query for Google Search Grounding..."
                className="flex-1 bg-[#0A0A12] border border-[#2A2A3A] text-white text-xs sm:text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#38BDF8]"
              />
              <button
                id="btn-run-search"
                onClick={() => runSearchGrounding()}
                disabled={searchLoading || !searchPrompt.trim()}
                className="px-6 py-3 bg-[#38BDF8] hover:bg-[#60A5FA] disabled:opacity-50 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2"
              >
                {searchLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search & Ground
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] text-gray-400 py-1">Try asking:</span>
              {[
                'Latest AI research benchmarks in 2026',
                'Global semiconductor supply chain status',
                'Recent discoveries in gravitational wave astronomy',
                'Current space exploration missions update'
              ].map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchPrompt(query);
                    runSearchGrounding(query);
                  }}
                  className="text-[11px] bg-[#1A1A28] hover:bg-[#252538] text-gray-300 hover:text-white px-2.5 py-1 rounded-full border border-[#2E2E42] transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>

          {/* Grounding Results */}
          {searchResult && (
            <div className="space-y-4 pt-2">
              <div className="bg-[#0A0A12] border border-[#222230] rounded-xl p-5 font-sans">
                <div className="flex items-center justify-between border-b border-[#20202E] pb-3 mb-4">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Grounded Synthesis Response
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 bg-[#141420] px-2 py-0.5 rounded border border-[#202030]">
                    gemini-3.5-flash + googleSearch
                  </span>
                </div>
                <div className="prose prose-invert prose-sm max-w-none leading-relaxed text-gray-200">
                  <Markdown>{searchResult}</Markdown>
                </div>
              </div>

              {/* Source Citations & Web Links */}
              {groundingChunks.length > 0 && (
                <div className="bg-[#141420] border border-[#262638] rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-[#38BDF8]" /> Verified Web Sources ({groundingChunks.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groundingChunks.map((chunk, idx) => chunk.web ? (
                      <a
                        key={idx}
                        href={chunk.web.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start gap-2 p-2.5 bg-[#0C0C14] hover:bg-[#181826] border border-[#202030] hover:border-[#38BDF8]/40 rounded-lg transition-all text-xs group"
                      >
                        <div className="w-4 h-4 rounded bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">
                          {idx + 1}
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-gray-200 group-hover:text-[#38BDF8] font-medium truncate">
                            {chunk.web.title || 'Web Reference'}
                          </div>
                          <div className="text-[10px] text-gray-400 truncate">{chunk.web.uri}</div>
                        </div>
                      </a>
                    ) : null)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. HIGH THINKING (gemini-3.1-pro-preview with ThinkingLevel.HIGH)       */}
      {/* ===================================================================== */}
      {activeTab === 'HIGH_THINKING' && (
        <div className="bg-[#12121A] border border-[#2A2A3A] rounded-xl p-6 space-y-6" id="panel-high-thinking">
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                High Thinking Reasoning Engine (Deep STEM & Proofs)
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Model: <span className="text-purple-400 font-mono font-bold">gemini-3.1-pro-preview</span> • Config: <code className="text-[11px] bg-purple-950/40 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/40">thinkingLevel: ThinkingLevel.HIGH</code> (No maxOutputTokens constraint)
            </p>
          </div>

          <div className="space-y-3">
            <textarea
              id="input-thinking-prompt"
              rows={4}
              value={thinkingPrompt}
              onChange={(e) => setThinkingPrompt(e.target.value)}
              placeholder="Enter complex mathematical, logical, or architectural problem to reason through..."
              className="w-full bg-[#0A0A12] border border-[#2A2A3A] text-white text-xs sm:text-sm p-4 rounded-xl focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
            />

            <div className="flex justify-between items-center">
              <div className="text-[11px] text-gray-400">
                Executes unconstrained multi-step reasoning before outputting final formal proof.
              </div>
              <button
                id="btn-run-thinking"
                onClick={runHighThinking}
                disabled={thinkingLoading || !thinkingPrompt.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-purple-900/30"
              >
                {thinkingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                Execute High Thinking
              </button>
            </div>
          </div>

          {thinkingResult && (
            <div className="bg-[#0A0A12] border border-purple-900/40 rounded-xl p-5 font-sans space-y-3">
              <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Formal Reasoning & Proof Result
                </span>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                  ThinkingLevel.HIGH Active
                </span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-gray-200 leading-relaxed">
                <Markdown>{thinkingResult}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. LOW-LATENCY (gemini-3.1-flash-lite)                                */}
      {/* ===================================================================== */}
      {activeTab === 'LOW_LATENCY' && (
        <div className="bg-[#12121A] border border-[#2A2A3A] rounded-xl p-6 space-y-6" id="panel-low-latency">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Ultra Low-Latency Quick Reflex Engine
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Model: <span className="text-amber-400 font-mono font-bold">gemini-3.1-flash-lite</span> • Sub-second tactical reflexes for high-throughput operational tasks.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                id="input-low-latency-prompt"
                type="text"
                value={lowLatencyPrompt}
                onChange={(e) => setLowLatencyPrompt(e.target.value)}
                placeholder="Enter prompt for instantaneous reflex response..."
                className="flex-1 bg-[#0A0A12] border border-[#2A2A3A] text-white text-xs sm:text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-amber-400"
              />
              <button
                id="btn-run-low-latency"
                onClick={runLowLatency}
                disabled={lowLatencyLoading || !lowLatencyPrompt.trim()}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2"
              >
                {lowLatencyLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Fire Reflex
              </button>
            </div>
          </div>

          {lowLatencyResult && (
            <div className="bg-[#0A0A12] border border-amber-500/30 rounded-xl p-5 font-sans space-y-3">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Reflex Response
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 font-bold">
                  Latency: {lowLatencyResult.latencyMs} ms
                </span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-gray-200">
                <Markdown>{lowLatencyResult.text}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. IMAGE VISION UNDERSTANDING (gemini-3.1-pro-preview)                */}
      {/* ===================================================================== */}
      {activeTab === 'IMAGE_VISION' && (
        <div className="bg-[#12121A] border border-[#2A2A3A] rounded-xl p-6 space-y-6" id="panel-image-vision">
          <div>
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#38BDF8]" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Multimodal Image Vision Understanding
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Model: <span className="text-[#38BDF8] font-mono font-bold">gemini-3.1-pro-preview</span> • Deep visual parsing, OCR, diagrams, topological analysis, and UI decoding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload & Preview */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-gray-300 uppercase">Input Visual Artifact</div>
              
              <div 
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-[#2A2A3A] hover:border-[#38BDF8] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-[#0A0A12] transition-colors min-h-[220px]"
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Upload Preview" 
                    className="max-h-48 max-w-full rounded-lg object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <Upload className="w-8 h-8 text-gray-500 mx-auto" />
                    <div className="text-xs text-gray-300">Click to upload photo or diagram (PNG/JPEG)</div>
                    <div className="text-[10px] text-gray-400">or use sample topology below</div>
                  </div>
                )}
              </div>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={loadSampleImage}
                  className="text-xs text-[#38BDF8] hover:underline"
                >
                  Load Camelot Topology Sample Image
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setImageBase64(null); }}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Clear Image
                  </button>
                )}
              </div>
            </div>

            {/* Prompt & Action */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-300 uppercase">Analysis Instruction</div>
                <textarea
                  rows={4}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="w-full bg-[#0A0A12] border border-[#2A2A3A] text-white text-xs sm:text-sm p-3.5 rounded-xl focus:outline-none focus:border-[#38BDF8] leading-relaxed"
                />
              </div>

              <button
                id="btn-analyze-image"
                onClick={runImageAnalysis}
                disabled={imageLoading || !imageBase64}
                className="w-full py-3.5 bg-[#38BDF8] hover:bg-[#60A5FA] disabled:opacity-50 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                {imageLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                Analyze with Gemini 3.1 Pro
              </button>
            </div>
          </div>

          {imageResult && (
            <div className="bg-[#0A0A12] border border-[#222230] rounded-xl p-5 font-sans space-y-3">
              <div className="flex items-center justify-between border-b border-[#20202E] pb-3">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Visual Analysis Result
                </span>
                <span className="text-[10px] font-mono text-gray-400 bg-[#141420] px-2 py-0.5 rounded border border-[#202030]">
                  gemini-3.1-pro-preview
                </span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-gray-200">
                <Markdown>{imageResult}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. VIDEO UNDERSTANDING (gemini-3.1-pro-preview)                        */}
      {/* ===================================================================== */}
      {activeTab === 'VIDEO_ANALYSIS' && (
        <div className="bg-[#12121A] border border-[#2A2A3A] rounded-xl p-6 space-y-6" id="panel-video-analysis">
          <div>
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Video Content Understanding & Temporal Reasoning
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Model: <span className="text-indigo-400 font-mono font-bold">gemini-3.1-pro-preview</span> • Extracts timestamped events, actions, audio cues, and key scene transitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="text-xs font-bold text-gray-300 uppercase">Input Video File</div>
              
              <div 
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-[#2A2A3A] hover:border-indigo-400 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-[#0A0A12] transition-colors min-h-[220px]"
              >
                {videoPreview ? (
                  <video 
                    src={videoPreview} 
                    controls 
                    className="max-h-48 max-w-full rounded-lg"
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <Video className="w-8 h-8 text-gray-500 mx-auto" />
                    <div className="text-xs text-gray-300">Click to select MP4/WebM video file</div>
                    <div className="text-[10px] text-gray-400">Gemini Pro analyzes all frames & audio tracks</div>
                  </div>
                )}
              </div>

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-300 uppercase">Analysis Directives</div>
                <textarea
                  rows={4}
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  className="w-full bg-[#0A0A12] border border-[#2A2A3A] text-white text-xs sm:text-sm p-3.5 rounded-xl focus:outline-none focus:border-indigo-400 leading-relaxed"
                />
              </div>

              <button
                id="btn-analyze-video"
                onClick={runVideoAnalysis}
                disabled={videoLoading || !videoBase64}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                {videoLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                Analyze Video with Gemini Pro
              </button>
            </div>
          </div>

          {videoResult && (
            <div className="bg-[#0A0A12] border border-indigo-900/40 rounded-xl p-5 font-sans space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-900/30 pb-3">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Video Analysis Summary
                </span>
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                  gemini-3.1-pro-preview
                </span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-gray-200">
                <Markdown>{videoResult}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 8. AUDIO TRANSCRIBE (gemini-3.5-flash)                                */}
      {/* ===================================================================== */}
      {activeTab === 'AUDIO_TRANSCRIBE' && (
        <div className="bg-[#12121A] border border-[#2A2A3A] rounded-xl p-6 space-y-6" id="panel-audio-transcribe">
          <div>
            <div className="flex items-center gap-2">
              <FileAudio className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Precision Audio Speech-to-Text Transcription
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Model: <span className="text-emerald-400 font-mono font-bold">gemini-3.5-flash</span> • Record live from microphone or upload audio files for verbatim transcripts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Live Mic Recording */}
            <div className="bg-[#0A0A12] border border-[#222230] rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#181824] flex items-center justify-center border border-[#2A2A3A]">
                <Mic className={`w-7 h-7 ${isRecordingAudio ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`} />
              </div>

              <div>
                <div className="text-sm font-bold text-white">
                  {isRecordingAudio ? `Recording: ${recordingSeconds}s` : 'Live Microphone Capture'}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Record spoken instructions directly from your browser.
                </div>
              </div>

              {isRecordingAudio ? (
                <button
                  id="btn-stop-audio-record"
                  onClick={stopAudioRecording}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <Square className="w-4 h-4" /> Stop Recording
                </button>
              ) : (
                <button
                  id="btn-start-audio-record"
                  onClick={startAudioRecording}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <Mic className="w-4 h-4" /> Record From Mic
                </button>
              )}
            </div>

            {/* File Upload */}
            <div className="bg-[#0A0A12] border border-[#222230] rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#181824] flex items-center justify-center border border-[#2A2A3A]">
                <Upload className="w-7 h-7 text-[#38BDF8]" />
              </div>

              <div>
                <div className="text-sm font-bold text-white">Upload Audio File</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Supports MP3, WAV, WebM, M4A, OGG
                </div>
              </div>

              <label className="px-6 py-2.5 bg-[#1A1A28] hover:bg-[#252538] text-gray-200 border border-[#2E2E42] font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors">
                <FileAudio className="w-4 h-4" /> Choose File
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {transcribeAudioBase64 && (
            <div className="flex justify-end">
              <button
                id="btn-run-transcribe"
                onClick={runAudioTranscription}
                disabled={transcribeLoading}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/30"
              >
                {transcribeLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Transcribe Spoken Audio with Gemini 3.5 Flash
              </button>
            </div>
          )}

          {transcriptionResult && (
            <div className="bg-[#0A0A12] border border-emerald-900/40 rounded-xl p-5 font-sans space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-900/30 pb-3">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Audio Transcript Result
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  gemini-3.5-flash
                </span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-gray-200 leading-relaxed font-mono text-xs sm:text-sm">
                <Markdown>{transcriptionResult}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
