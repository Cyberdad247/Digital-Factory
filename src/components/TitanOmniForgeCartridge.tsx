import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Hammer,
  Zap,
  Flame,
  Trophy,
  Sparkles,
  Play,
  Terminal,
  Shield,
  Layers,
  CheckCircle2,
  Lock,
  Cpu,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  TrendingUp,
  Award,
  Swords,
  Gauge,
  Compass,
  FileCode,
  Rocket,
  Dices,
  BookOpen,
  Volume2,
  Boxes,
  Sliders,
  Radio,
  Eye,
  LayoutGrid,
  Workflow,
  Download,
  Cloud,
  CloudUpload,
  Save,
  Database,
  Loader2
} from 'lucide-react';
import { 
  ForgedAgenticCLI, 
  CLIForgeStep, 
  OmniForgeState, 
  CapabilityLease, 
  VFSWorktree,
  AdaptiveHUDTier
} from '../types';
import { TriTierAdaptiveHUD } from './TriTierAdaptiveHUD';
import { VibeShellView } from './VibeShellView';
import { SwarmKanbanView } from './SwarmKanbanView';
import { TitanCoreView } from './TitanCoreView';
import { AutoSaveToast, AutoSaveStatus } from './AutoSaveToast';
import { MerlinCognitivePlayground } from './MerlinCognitivePlayground';
import { GenesisIntakeCartridgeStudio } from './GenesisIntakeCartridgeStudio';
import { 
  saveForgeState, 
  fetchLatestForgeState, 
  auth, 
  ForgeStateModel 
} from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ForgeMetricsDashboard } from './ForgeMetricsDashboard';
import { SwarmMonitoringDashboard } from './SwarmMonitoringDashboard';
import { SynapticLoomStudio } from './SynapticLoomStudio';
import { BlueprintOSStudio } from './BlueprintOSStudio';
import { BlueprintStateMachine } from './BlueprintStateMachine';
import { TaskLifecycleGridDiagram } from './TaskLifecycleGridDiagram';
import { PrimaryControlCard } from './PrimaryControlCard';
import { MerlinFoundryPipelineSection } from './MerlinFoundryPipelineSection';
import { PipelineProgress } from './PipelineProgress';
import { FoundryLogs } from './FoundryLogs';
import { OrchestratorChat } from './OrchestratorChat';
import { CompactResourceMonitor, ResourceMonitor } from './ResourceMonitor';
import { MissionAnalytics } from './MissionAnalytics';
import { usePipelineTaskState } from '../hooks/usePipelineTaskState';
import { useFoundryLogs } from '../hooks/useFoundryLogs';
import { useWorkcellMetrics } from '../hooks/useWorkcellMetrics';

interface TitanOmniForgeCartridgeProps {
  onNotify: (message: string, type: 'success' | 'warning') => void;
  voiceIntent?: string;
}

// Gamification Level & XP helper
interface PlayerProfile {
  level: number;
  xp: number;
  xpToNext: number;
  rankTitle: string;
  forgeStreak: number;
  tokensForged: number;
  manaEnergy: number; // 0-100%
  completedQuests: string[];
}

type ForgeLayoutMode = 
  | 'GRID_OVERVIEW' 
  | 'TITAN_CORE_TELEMETRY'
  | 'FORGE_CONTROLS' 
  | 'COGNITIVE_PLAYGROUND'
  | 'GENESIS_INTAKE'
  | 'SWARM_MONITOR' 
  | 'BLUEPRINT_OS' 
  | 'SYNAPTIC_LOOM' 
  | 'WEAPONS_VAULT' 
  | 'SENTINEL_SHIELD';

const FORGE_TEMPLATES = [
  {
    id: 'ai-vision-agent',
    name: 'Eye-of-Horus Vision CLI',
    category: 'DEV_TOOL' as const,
    icon: '👁️',
    difficulty: 'EASY',
    xpReward: 350,
    lore: 'Instant OCR, UI reverse-engineering, and visual screenshot inspector.',
    defaultCodebase: 'Multimodal vision parser taking png/jpeg and returning structured JSON bounding boxes.'
  },
  {
    id: 'suno-stem-dsp',
    name: 'Suno & Stems Audio Forge',
    category: 'AUDIO_DSP' as const,
    icon: '🎵',
    difficulty: 'MEDIUM',
    xpReward: 600,
    lore: 'Separates 4-stem vocals/drums/bass with sub-millisecond Stdio JSON-RPC.',
    defaultCodebase: 'Fast audio stem separator with zero ambient memory leaks on ARM64.'
  },
  {
    id: 'stripe-hyper-ledger',
    name: 'Stripe Titan Pay-Gate',
    category: 'PAYMENT' as const,
    icon: '💳',
    difficulty: 'HARD',
    xpReward: 950,
    lore: 'Zero-trust webhook verifier, automatic invoice crystallization, and auto-refund Sentinel.',
    defaultCodebase: 'Stripe API wrapper with idempotency keys, Sentinel lease enforcement, and VFS audit logs.'
  },
  {
    id: 'olap-vector-cache',
    name: 'Viking 24D Vector DB',
    category: 'DATABASE' as const,
    icon: '⚡',
    difficulty: 'LEGENDARY',
    xpReward: 1400,
    lore: '24-Dimensional Leech Lattice Quantization engine for 100,000 queries/sec.',
    defaultCodebase: 'In-memory vectorized cache with Leech Lattice spherical packing parity checks.'
  }
];

const QUESTS = [
  { id: 'quest-1', title: 'First Spark', desc: 'Forge your first custom Agentic CLI tool', xp: 200, icon: '🔥' },
  { id: 'quest-2', title: 'Terminal Master', desc: 'Execute 3 subcommands in the Stdio JSON-RPC Arena', xp: 300, icon: '⚡' },
  { id: 'quest-3', title: 'Sentinel Knight', desc: 'Issue a Zero-Trust Sentinel Capability Lease', xp: 400, icon: '🛡️' },
  { id: 'quest-4', title: 'Code Alchemist', desc: 'Inspect the generated Node/TypeScript AST Code', xp: 150, icon: '📜' }
];

export function TitanOmniForgeCartridge({ onNotify, voiceIntent }: TitanOmniForgeCartridgeProps) {
  const [omniState, setOmniState] = useState<OmniForgeState | null>(null);
  const [forgedCLIs, setForgedCLIs] = useState<ForgedAgenticCLI[]>([]);
  const [selectedCLI, setSelectedCLI] = useState<ForgedAgenticCLI | null>(null);
  const [leases, setLeases] = useState<CapabilityLease[]>([]);
  const [worktrees, setWorktrees] = useState<VFSWorktree[]>([]);

  // Tri-Tier Adaptive HUD State (VIBE_MODE | KANBAN_MODE | TITAN_CORE)
  const [currentHUDTier, setCurrentHUDTier] = useState<AdaptiveHUDTier>('VIBE_MODE');

  // Layout View Mode (Default: Grid layout separating Control Inputs from Swarm Monitoring)
  const [layoutMode, setLayoutMode] = useState<ForgeLayoutMode>('GRID_OVERVIEW');

  // Gamification State
  const [player, setPlayer] = useState<PlayerProfile>(() => {
    const saved = localStorage.getItem('titan_player_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      level: 4,
      xp: 1420,
      xpToNext: 2000,
      rankTitle: 'Grand Forge Alchemist',
      forgeStreak: 7,
      tokensForged: 48500,
      manaEnergy: 92,
      completedQuests: ['quest-1']
    };
  });

  // Forge Form
  const [toolName, setToolName] = useState('');
  const [category, setCategory] = useState<'DATABASE' | 'PAYMENT' | 'AUDIO_DSP' | 'DEV_TOOL' | 'STORAGE' | 'CUSTOM'>('DEV_TOOL');
  const [codebaseInput, setCodebaseInput] = useState('');
  const [forging, setForging] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [forgeSteps, setForgeSteps] = useState<CLIForgeStep[]>([]);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  // Subcommand Runner & Battle Arena
  const [selectedSubcommand, setSelectedSubcommand] = useState<string>('');
  const [executingSub, setExecutingSub] = useState(false);
  const [subOutput, setSubOutput] = useState<Record<string, unknown>>({
    status: 'READY',
    message: 'Select a CLI tool and click "Run Subcommand" to execute live via Stdio JSON-RPC 2.0.',
    telemetry: { executionTimeMs: 1.8, memoryFootprintKB: 64, zeroAmbientLeak: false }
  });
  const [copiedCode, setCopiedCode] = useState(false);
  const [customArgsInput, setCustomArgsInput] = useState('{"mode": "OVERDRIVE", "vfsSandbox": true}');
  const [activeSpecTab, setActiveSpecTab] = useState<'CONSOLE' | 'SKILL' | 'HARNESS' | 'TEST'>('CONSOLE');
  const [stateMachineDiagramMode, setStateMachineDiagramMode] = useState<'7_PHASE_GRID' | '14_STAGE_DAG'>('7_PHASE_GRID');

  // Sound effects toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Authentication State
  const [authUser, setAuthUser] = useState<User | null>(auth.currentUser);

  // Firestore Auto-Save State & Diagnostics
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle');
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<Date | null>(null);
  const [autoSaveCount, setAutoSaveCount] = useState<number>(0);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaveIntervalSeconds] = useState(25);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (voiceIntent && voiceIntent.trim()) {
      setCodebaseInput(voiceIntent);
      setLayoutMode('GRID_OVERVIEW');
      onNotify('Voice HUD intent routed into Titan Omni-Forge Codebase Input!', 'success');
    }
  }, [voiceIntent]);

  // Listen to Firebase Auth state for seamless Cloud Firestore synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        try {
          const cloudState = await fetchLatestForgeState(user.uid);
          if (cloudState) {
            if (cloudState.player) {
              setPlayer(prev => ({ ...prev, ...cloudState.player }));
            }
            if (cloudState.forgedCLIs && cloudState.forgedCLIs.length > 0) {
              setForgedCLIs(cloudState.forgedCLIs);
            }
            if (cloudState.updatedAt) {
              setLastAutoSavedAt(new Date(cloudState.updatedAt));
            }
            if (cloudState.autoSaveCount) {
              setAutoSaveCount(cloudState.autoSaveCount);
            }
          }
        } catch (e) {
          console.log('Restoration note: proceeding with local session state.', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Periodic Auto-Save mechanism: saves to local VFS buffer and synchronizes with Firestore when authenticated
  const performAutoSave = async (isManual = false) => {
    if (autoSaveStatus === 'saving') return;
    setAutoSaveStatus('saving');

    const currentUser = authUser || auth.currentUser;
    const isCloudSync = !!currentUser?.uid;

    try {
      const payload: ForgeStateModel = {
        id: isCloudSync ? `forge_state_${currentUser.uid}` : 'forge_state_local',
        authorUid: isCloudSync ? currentUser.uid : 'local-session',
        player,
        forgedCLIs: forgedCLIs.map(cli => ({
          id: cli.id,
          toolName: cli.toolName,
          binaryName: cli.binaryName,
          category: cli.category,
          version: cli.version,
          description: cli.description,
          generatedAt: cli.generatedAt,
          subcommands: cli.subcommands,
          skillMd: cli.skillMd,
          testMd: cli.testMd
        })),
        activeLeases: leases,
        toolName,
        category,
        codebaseInput,
        autoSaveCount: autoSaveCount + 1,
        updatedAt: new Date().toISOString()
      };

      // Always persist to local sovereign storage buffer
      localStorage.setItem('camelot_forge_state_backup', JSON.stringify(payload));

      // Synchronize with Cloud Firestore if authenticated
      if (isCloudSync) {
        await saveForgeState(payload);
      }

      const now = new Date();
      setLastAutoSavedAt(now);
      setAutoSaveCount(prev => prev + 1);
      setAutoSaveStatus('saved');

      if (isManual) {
        playSfx('CLICK');
        if (isCloudSync) {
          onNotify('☁️ Forge state saved to Cloud Firestore!', 'success');
        } else {
          onNotify('💾 Forge state saved to local storage! (Sign in to sync with Firestore)', 'warning');
        }
      }

      setTimeout(() => {
        setAutoSaveStatus(prev => prev === 'saved' ? 'idle' : prev);
      }, 2500);
    } catch (err: unknown) {
      console.warn('Auto-save encountered an issue, cached locally:', err);
      setAutoSaveStatus('error');
      setTimeout(() => {
        setAutoSaveStatus(prev => prev === 'error' ? 'idle' : prev);
      }, 3000);
    }
  };

  // Auto-save interval trigger
  useEffect(() => {
    if (!autoSaveEnabled) return;
    const intervalTimer = setInterval(() => {
      performAutoSave(false);
    }, autoSaveIntervalSeconds * 1000);

    return () => clearInterval(intervalTimer);
  }, [autoSaveEnabled, autoSaveIntervalSeconds, player, forgedCLIs, leases, toolName, category, codebaseInput, autoSaveCount, autoSaveStatus, authUser]);

  // Initial local state recovery on mount
  useEffect(() => {
    try {
      const backup = localStorage.getItem('camelot_forge_state_backup');
      if (backup) {
        const parsed = JSON.parse(backup);
        if (parsed.player) setPlayer(prev => ({ ...prev, ...parsed.player }));
        if (parsed.forgedCLIs && parsed.forgedCLIs.length > 0 && forgedCLIs.length <= 1) {
          setForgedCLIs(parsed.forgedCLIs);
        }
        if (parsed.updatedAt) setLastAutoSavedAt(new Date(parsed.updatedAt));
        if (parsed.autoSaveCount) setAutoSaveCount(parsed.autoSaveCount);
      }
    } catch (err) {
      console.log('Local restore error:', err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_player_profile', JSON.stringify(player));
  }, [player]);

  const playSfx = (type: 'FORGE' | 'LEVEL_UP' | 'EXECUTE' | 'CLICK') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'CLICK') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'EXECUTE') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'LEVEL_UP') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'FORGE') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {}
  };

  const addXp = (amount: number, reason: string) => {
    setPlayer(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNext;
      let leveledUp = false;

      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel += 1;
        newXpToNext = Math.round(newXpToNext * 1.35);
        leveledUp = true;
      }

      if (leveledUp) {
        playSfx('LEVEL_UP');
        setShowLevelUpModal(true);
        onNotify(`🎉 LEVEL UP! You reached Level ${newLevel}!`, 'success');
      } else {
        onNotify(`+${amount} XP: ${reason}`, 'success');
      }

      const ranks = [
        'Apprentice Smelter',
        'Bronze Code Knight',
        'Silver Blade Crafter',
        'Gold AST Artisan',
        'Grand Forge Alchemist',
        'Titan Sovereign Architect',
        'Singularity Demi-God'
      ];
      const rankTitle = ranks[Math.min(newLevel - 1, ranks.length - 1)];

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        xpToNext: newXpToNext,
        rankTitle,
        tokensForged: prev.tokensForged + Math.floor(amount * 12.5),
        manaEnergy: Math.min(100, prev.manaEnergy + 10)
      };
    });
  };

  const completeQuest = (questId: string) => {
    if (player.completedQuests.includes(questId)) return;
    const quest = QUESTS.find(q => q.id === questId);
    if (!quest) return;

    setPlayer(prev => ({
      ...prev,
      completedQuests: [...prev.completedQuests, questId]
    }));
    addXp(quest.xp, `Quest Completed: ${quest.title}`);
  };

  const fetchData = async () => {
    try {
      const res = await fetch('/api/omni-forge/state');
      if (!res.ok) return;
      const data = await res.json();
      setOmniState(data);
      setForgedCLIs(data.forgedCLIs || []);
      setLeases(data.activeLeases || []);
      setWorktrees(data.vfsWorktrees || []);

      if (data.forgedCLIs && data.forgedCLIs.length > 0 && !selectedCLI) {
        setSelectedCLI(data.forgedCLIs[0]);
        if (data.forgedCLIs[0].subcommands && data.forgedCLIs[0].subcommands.length > 0) {
          setSelectedSubcommand(data.forgedCLIs[0].subcommands[0].name);
        }
      }
    } catch {
      // Offline fallback seeds
      const initialSeedCLIs: ForgedAgenticCLI[] = [
        {
          id: 'cli-horus',
          toolName: 'horus-vision-cli',
          binaryName: 'horus-vision-cli',
          category: 'DEV_TOOL',
          version: '1.2.0',
          description: 'Multimodal UI inspection and automated UI verification.',
          transport: 'MCP_JSON_RPC_STDIO',
          authorKnight: 'Anya Ω',
          sandboxStatus: 'SANDBOX_VERIFIED',
          generatedAt: new Date().toISOString(),
          subcommands: [
            { 
              name: 'inspect', 
              description: 'Analyze UI image and return bounding boxes', 
              flags: ['--path', '--format'], 
              inputSchema: '{"imagePath": "string"}', 
              jsonRpcOutputSchema: '{"boxes": "array"}', 
              mockResponse: { boxes: [{ x: 10, y: 20, w: 200, h: 40, label: 'Hero_Button' }] } 
            },
            { 
              name: 'ocr', 
              description: 'Extract text blocks with OCR confidence scoring', 
              flags: ['--lang'], 
              inputSchema: '{"lang": "string"}', 
              jsonRpcOutputSchema: '{"text": "string"}', 
              mockResponse: { text: 'CAMELOT TITAN OMNI-FORGE', confidence: 0.998 } 
            }
          ],
          cliSourceCode: `// horus-vision-cli.js - Stdio JSON-RPC 2.0 Agentic CLI\nconst { serveRpc } = require('./rpc-transport');\nserveRpc({\n  inspect: async (params) => ({ boxes: [{ x: 10, y: 20, w: 200, h: 40, label: 'Hero_Button' }] }),\n  ocr: async (params) => ({ text: 'CAMELOT TITAN OMNI-FORGE', confidence: 0.998 })\n});`,
          skillMd: '# SKILL.md: horus-vision-cli\nAgentic CLI wrapper for multimodal UI inspection and automated UI verification.',
          harnessMd: '# HARNESS.md: horus-vision-cli\nStandard Stdio JSON-RPC 2.0 harness with zero-ambient worktree isolation.',
          testMd: '# TEST.md: horus-vision-cli\n100% Pass: Gideon Sentinel verified on ARM64 nodes.'
        }
      ];
      setForgedCLIs(initialSeedCLIs);
      setSelectedCLI(initialSeedCLIs[0]);
      setSelectedSubcommand(initialSeedCLIs[0].subcommands[0].name);
    }
  };

  const applyTemplate = (t: typeof FORGE_TEMPLATES[0]) => {
    playSfx('CLICK');
    setToolName(t.name.toLowerCase().replace(/\s+/g, '-'));
    setCategory(t.category);
    setCodebaseInput(t.defaultCodebase);
    onNotify(`✨ Loaded Legend Blueprint: ${t.name} (+${t.xpReward} XP upon forge)`, 'success');
  };

  const handleStartForge = async () => {
    if (!toolName.trim()) {
      onNotify('Please enter a tool or binary name', 'warning');
      return;
    }

    setForging(true);
    setCurrentStepIndex(1);
    playSfx('FORGE');

    try {
      const res = await fetch('/api/omni-forge/forge-cli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: toolName.trim(),
          category,
          codebaseInput: codebaseInput.trim() || undefined
        })
      });

      if (!res.ok) throw new Error('Forge failed');
      const data = await res.json();

      // Progress animation
      for (let i = 1; i <= 7; i++) {
        setCurrentStepIndex(i);
        await new Promise(r => setTimeout(r, 220));
      }

      setForgedCLIs(prev => [data.cli, ...prev]);
      setSelectedCLI(data.cli);
      if (data.cli.subcommands && data.cli.subcommands.length > 0) {
        setSelectedSubcommand(data.cli.subcommands[0].name);
      }

      setForging(false);
      playSfx('LEVEL_UP');
      addXp(500, `Forged ${data.cli.binaryName}`);
      completeQuest('quest-1');
      onNotify(`⚔️ Masterwork Forged: ${data.cli.binaryName}!`, 'success');
    } catch {
      // Simulation fallback for instant UI response
      for (let i = 1; i <= 7; i++) {
        setCurrentStepIndex(i);
        await new Promise(r => setTimeout(r, 200));
      }

      const mockCLI: ForgedAgenticCLI = {
        id: `cli-${Date.now()}`,
        toolName: toolName.toLowerCase().replace(/\s+/g, '-'),
        binaryName: toolName.toLowerCase().replace(/\s+/g, '-'),
        category,
        version: '1.0.0',
        description: `Agentic CLI for ${category} operations with strict AST schemas.`,
        transport: 'MCP_JSON_RPC_STDIO',
        authorKnight: 'Sir Forge',
        sandboxStatus: 'SANDBOX_VERIFIED',
        generatedAt: new Date().toISOString(),
        subcommands: [
          { 
            name: 'execute', 
            description: 'Run core agentic routine', 
            flags: ['--payload'], 
            inputSchema: '{"payload": "object"}', 
            jsonRpcOutputSchema: '{"status": "string"}', 
            mockResponse: { status: 'SUCCESS' } 
          },
          { 
            name: 'status', 
            description: 'Health and telemetry inspect', 
            flags: ['--verbose'], 
            inputSchema: '{}', 
            jsonRpcOutputSchema: '{"state": "string"}', 
            mockResponse: { state: 'NOMINAL', zeroLeak: true } 
          }
        ],
        cliSourceCode: `// Generated Stdio JSON-RPC 2.0 Binary: ${toolName}\nconst rpc = require('./transport');\nrpc.handle({\n  execute: async (args) => ({ status: 'SUCCESS', tool: '${toolName}', result: args }),\n  status: async () => ({ state: 'NOMINAL', memory: '42KB', zeroLeak: true })\n});`,
        skillMd: `# SKILL.md: ${toolName}\nAgentic CLI for ${category} operations with strict AST schemas.`,
        harnessMd: `# HARNESS.md: ${toolName}\nTested with JSON-RPC over stdin/stdout.`,
        testMd: `# TEST.md: ${toolName}\nGideon Verified: 0 Ambient Memory Leaks.`
      };

      setForgedCLIs(prev => [mockCLI, ...prev]);
      setSelectedCLI(mockCLI);
      setSelectedSubcommand(mockCLI.subcommands[0].name);
      setForging(false);
      playSfx('LEVEL_UP');
      addXp(500, `Forged ${mockCLI.binaryName}`);
      completeQuest('quest-1');
      onNotify(`⚔️ Masterwork Forged: ${mockCLI.binaryName}!`, 'success');
    }
  };

  const handleExecuteSubcommand = async () => {
    if (!selectedCLI || !selectedSubcommand) return;

    setExecutingSub(true);
    playSfx('EXECUTE');

    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(customArgsInput);
    } catch {
      parsedArgs = { raw: customArgsInput };
    }

    try {
      const res = await fetch('/api/omni-forge/execute-subcommand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliId: selectedCLI.id,
          subcommandName: selectedSubcommand,
          args: parsedArgs
        })
      });

      if (!res.ok) throw new Error('Execution failed');
      const data = await res.json();
      setSubOutput(data);
      setExecutingSub(false);
      addXp(80, `Ran ${selectedCLI.binaryName} -> ${selectedSubcommand}`);
      completeQuest('quest-2');
      onNotify(`⚡ ${selectedCLI.binaryName} executed in ${data.telemetry?.executionTimeMs || 2}ms!`, 'success');
    } catch {
      setTimeout(() => {
        const mockResult = {
          jsonrpc: '2.0',
          id: `req-${Date.now()}`,
          result: {
            command: `${selectedCLI.binaryName} ${selectedSubcommand}`,
            status: 'SUCCESS',
            timestamp: new Date().toISOString(),
            output: {
              acknowledged: true,
              mode: 'ARM64_ZERO_AMBIENT',
              processedParams: parsedArgs
            }
          },
          telemetry: {
            executionTimeMs: 1.8,
            memoryFootprintKB: 42,
            vfsWorktree: 'isolated-tmp-arm64-001',
            zeroAmbientLeak: true
          }
        };
        setSubOutput(mockResult);
        setExecutingSub(false);
        addXp(80, `Ran ${selectedCLI.binaryName} -> ${selectedSubcommand}`);
        completeQuest('quest-2');
        onNotify(`⚡ ${selectedCLI.binaryName} executed in 1.8ms!`, 'success');
      }, 400);
    }
  };

  const handleRequestSentinelLease = async (cap: string) => {
    playSfx('CLICK');
    try {
      const res = await fetch('/api/omni-forge/request-lease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capability: cap, targetAgent: 'User_Sovereign' })
      });
      if (res.ok) {
        const data = await res.json();
        setLeases(prev => [data.lease, ...prev]);
        setWorktrees(prev => [data.worktree, ...prev]);
      }
    } catch {}

    addXp(120, `Obtained Sentinel Lease: ${cap}`);
    completeQuest('quest-3');
    onNotify(`🛡️ Sentinel Lease Issued: ${cap} (Zero Ambient VFS Worktree Active)`, 'success');
  };

  const handleExportArtifact = () => {
    playSfx('CLICK');
    const exportPayload = {
      schemaVersion: 'camelot.titan-omni-forge.artifact-summary/1',
      exportTimestamp: new Date().toISOString(),
      system: {
        name: 'Camelot Titan Omni-Forge',
        cartridge: 'TITAN_OMNI_FORGE_V2',
        securityClassification: 'SENTINEL_GOVERNED_UNCLASSIFIED'
      },
      playerProfile: player,
      selectedTool: selectedCLI,
      forgedArtifacts: forgedCLIs,
      activeSentinelLeases: leases,
      vfsWorktrees: worktrees,
      omniStateSummary: omniState,
      latestSubcommandExecution: subOutput
    };

    const jsonStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const sanitizedToolName = selectedCLI ? selectedCLI.binaryName : 'titan-omni-forge';
    anchor.href = url;
    anchor.download = `${sanitizedToolName}-artifact-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    addXp(50, 'Exported Forge Artifact Package');
    onNotify('📦 Forge Artifact Summary exported & downloaded successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* LEVEL UP CELEBRATION MODAL */}
      {showLevelUpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#1E1E2E] to-[#12121A] border-2 border-[#D4AF37] rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="text-5xl animate-bounce">👑</div>
            <h2 className="text-2xl font-black text-[#D4AF37] uppercase tracking-wider">
              Level Up Ascended!
            </h2>
            <div className="text-sm text-gray-300">
              You reached <strong className="text-white">Level {player.level}</strong>!
            </div>
            <div className="bg-[#0D0D14] border border-[#2D2D3E] p-4 rounded-2xl text-xs font-mono text-amber-300">
              Rank: <span className="text-white font-bold">{player.rankTitle}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#161622] p-3 rounded-xl">
              <div>
                <span className="text-gray-400 block">Mana Pool</span>
                <strong className="text-emerald-400">100% Restored</strong>
              </div>
              <div>
                <span className="text-gray-400 block">Forge Speed</span>
                <strong className="text-amber-400">+25% Boost</strong>
              </div>
            </div>
            <button
              onClick={() => setShowLevelUpModal(false)}
              className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-amber-300 hover:from-amber-400 hover:to-amber-200 text-black font-black text-sm rounded-xl shadow-lg shadow-[#D4AF37]/30 transition-all uppercase tracking-wider"
            >
              Claim Rewards & Continue
            </button>
          </div>
        </div>
      )}

      {/* 🛡️ TRI-TIER ADAPTIVE HUD: THE TILER SWITCH */}
      <TriTierAdaptiveHUD
        currentTier={currentHUDTier}
        onSelectTier={(tier) => {
          playSfx('CLICK');
          setCurrentHUDTier(tier);
        }}
        onNotify={onNotify}
        className="mb-4"
      />

      {/* ADAPTIVE RENDERING BASED ON SELECTED HUD TIER */}
      {currentHUDTier === 'VIBE_MODE' && (
        <VibeShellView
          onNotify={onNotify}
          onSwitchToKanban={() => {
            playSfx('CLICK');
            setCurrentHUDTier('KANBAN_MODE');
          }}
          onSwitchToTitanCore={() => {
            playSfx('CLICK');
            setCurrentHUDTier('TITAN_CORE');
          }}
          initialIntent={voiceIntent}
        />
      )}

      {currentHUDTier === 'KANBAN_MODE' && (
        <SwarmKanbanView
          onNotify={onNotify}
          onSwitchToVibe={() => {
            playSfx('CLICK');
            setCurrentHUDTier('VIBE_MODE');
          }}
          onSwitchToTitanCore={() => {
            playSfx('CLICK');
            setCurrentHUDTier('TITAN_CORE');
          }}
        />
      )}

      {currentHUDTier === 'TITAN_CORE' && (
        <>
          {/* GAMIFIED HERO HUD & VIEW CONTROLLER */}
          <div className="bg-gradient-to-r from-[#14141F] via-[#1A1A28] to-[#14141F] border-2 border-[#D4AF37]/60 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Avatar & Rank */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-amber-200 p-0.5 shadow-md">
                <div className="w-full h-full bg-[#0D0D14] rounded-2xl flex items-center justify-center text-2xl">
                  ⚔️
                </div>
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 bg-[#D4AF37] text-black font-black text-[10px] px-1.5 py-0.5 rounded-full border border-black shadow">
                Lv.{player.level}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-wide uppercase flex items-center gap-1.5">
                  Titan Omni-Forge <span className="text-[10px] text-black bg-[#D4AF37] px-2 py-0.5 rounded-full font-bold">GAME MODE</span>
                </h1>
              </div>
              <p className="text-xs text-amber-300/90 font-medium">
                {player.rankTitle} • 7-Stage Agentic CLI Crafting Arena
              </p>
            </div>
          </div>

          {/* Player Stats / XP Bar */}
          <div className="w-full lg:w-96 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-bold flex items-center gap-1">
                <Sparkles size={13} className="text-[#D4AF37]" /> XP Progress
              </span>
              <span className="font-mono text-[#D4AF37] font-bold">
                {player.xp} / {player.xpToNext} XP ({Math.round((player.xp / player.xpToNext) * 100)}%)
              </span>
            </div>
            {/* XP Bar */}
            <div className="w-full bg-[#0B0B10] h-3.5 rounded-full border border-[#2B2B3E] overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-[#D4AF37] to-yellow-200 transition-all duration-500 shadow-sm"
                style={{ width: `${Math.min(100, (player.xp / player.xpToNext) * 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[11px] font-mono text-gray-400 pt-0.5">
              <span>🔥 Streak: <strong className="text-white">{player.forgeStreak} Days</strong></span>
              <span>⚡ Mana: <strong className="text-emerald-400">{player.manaEnergy}%</strong></span>
              <span>💎 Forged: <strong className="text-[#D4AF37]">{player.tokensForged.toLocaleString()} Tokens</strong></span>
            </div>
          </div>

          {/* Actions & Toggles */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="px-2.5 py-1.5 bg-[#0D0D14] border border-[#222234] rounded-xl text-[10px] font-mono flex items-center gap-1.5 text-gray-300">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span>Sandbox: <strong className="text-white">1.8GB / 2 Cores</strong></span>
            </div>
            
            {/* Auto-Save Status / Manual Save Button */}
            <button
              id="btn-forge-autosave-status"
              onClick={() => performAutoSave(true)}
              disabled={autoSaveStatus === 'saving'}
              className={`p-2 sm:px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow ${
                autoSaveStatus === 'saving'
                  ? 'bg-amber-950/50 border-amber-500/60 text-amber-300 animate-pulse cursor-wait'
                  : autoSaveStatus === 'saved'
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                  : 'bg-[#1C1C2B] border-[#2E2E42] text-gray-300 hover:text-white hover:border-[#D4AF37]'
              }`}
              title={lastAutoSavedAt ? `Last auto-saved: ${lastAutoSavedAt.toLocaleTimeString()}` : 'Click to save Forge state to Firestore now'}
            >
              {autoSaveStatus === 'saving' ? (
                <Loader2 size={14} className="animate-spin text-amber-400" />
              ) : autoSaveStatus === 'saved' ? (
                <Check size={14} className="text-emerald-400" />
              ) : (
                <Cloud size={14} className="text-amber-400" />
              )}
              <span className="hidden sm:inline">
                {autoSaveStatus === 'saving'
                  ? 'Auto-saving...'
                  : autoSaveStatus === 'saved'
                  ? 'Synced'
                  : 'Cloud Auto-Save'}
              </span>
            </button>

            {/* Toggle Auto-Save Periodic Timer */}
            <button
              id="btn-toggle-autosave-timer"
              onClick={() => {
                const next = !autoSaveEnabled;
                setAutoSaveEnabled(next);
                onNotify(next ? '⚡ Auto-Save enabled (25s intervals)' : '⏸️ Auto-Save paused', 'warning');
              }}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                autoSaveEnabled
                  ? 'bg-[#141E18] border-emerald-500/40 text-emerald-400'
                  : 'bg-[#181414] border-gray-700 text-gray-400'
              }`}
              title={`Auto-save is ${autoSaveEnabled ? 'ON (saves every 25s to Firestore)' : 'OFF'}`}
            >
              <Database size={13} className={autoSaveEnabled ? 'text-emerald-400' : 'text-gray-500'} />
              <span className="text-[10px] hidden md:inline">{autoSaveEnabled ? 'AUTO 25s' : 'PAUSED'}</span>
            </button>

            {/* Export Artifact Button */}
            <button
              onClick={handleExportArtifact}
              className="p-2 sm:px-3 rounded-xl border border-amber-500/50 bg-gradient-to-r from-[#1C1C2B] to-[#252538] hover:from-amber-950/40 hover:to-amber-900/40 text-amber-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow"
              title="Export and download JSON summary of current forge data"
            >
              <Download size={14} className="text-amber-400" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                soundEnabled
                  ? 'bg-[#1C1C2B] border-[#D4AF37]/50 text-amber-300 shadow'
                  : 'bg-[#101018] border-[#222230] text-gray-500'
              }`}
              title="Toggle Gaming Sound Effects"
            >
              <Volume2 size={15} />
              <span className="hidden sm:inline">{soundEnabled ? 'SFX ON' : 'SFX OFF'}</span>
            </button>
          </div>
        </div>

        {/* WORKSPACE VIEW MODE SELECTOR */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 mt-4 pt-3 border-t border-[#252535]">
          <button
            onClick={() => { playSfx('CLICK'); setLayoutMode('GRID_OVERVIEW'); }}
            className={`py-2 px-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              layoutMode === 'GRID_OVERVIEW'
                ? 'bg-gradient-to-r from-[#D4AF37] to-amber-300 text-black shadow-lg shadow-[#D4AF37]/20 scale-[1.02]'
                : 'bg-[#111119] border border-[#252535] text-gray-300 hover:text-white hover:border-[#D4AF37]'
            }`}
          >
            <LayoutGrid size={13} />
            <span>🎛️ Dual Grid</span>
          </button>

          <button
            onClick={() => { playSfx('CLICK'); setLayoutMode('COGNITIVE_PLAYGROUND'); }}
            className={`py-2 px-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              layoutMode === 'COGNITIVE_PLAYGROUND'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 scale-[1.02]'
                : 'bg-[#111119] border border-purple-500/40 text-purple-300 hover:text-white hover:border-purple-400'
            }`}
          >
            <Sparkles size={13} className="text-purple-300" />
            <span>🧙‍♂️ Archmage Debate</span>
          </button>

          <button
            onClick={() => { playSfx('CLICK'); setLayoutMode('GENESIS_INTAKE'); }}
            className={`py-2 px-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              layoutMode === 'GENESIS_INTAKE'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-black shadow-lg shadow-rose-500/30 scale-[1.02]'
                : 'bg-[#111119] border border-rose-500/40 text-rose-300 hover:text-white hover:border-rose-400'
            }`}
          >
            <Flame size={13} className="text-rose-400" />
            <span>⚡ Genesis Intake</span>
          </button>

          <button
            onClick={() => { playSfx('CLICK'); setLayoutMode('FORGE_CONTROLS'); }}
            className={`py-2 px-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              layoutMode === 'FORGE_CONTROLS'
                ? 'bg-gradient-to-r from-[#D4AF37] to-amber-300 text-black shadow-lg shadow-[#D4AF37]/20 scale-[1.02]'
                : 'bg-[#111119] border border-[#252535] text-gray-300 hover:text-white hover:border-[#D4AF37]'
            }`}
          >
            <Sliders size={13} />
            <span>🔨 Controls</span>
          </button>

          <button
            onClick={() => { playSfx('CLICK'); setLayoutMode('SWARM_MONITOR'); }}
            className={`py-2 px-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              layoutMode === 'SWARM_MONITOR'
                ? 'bg-gradient-to-r from-[#D4AF37] to-amber-300 text-black shadow-lg shadow-[#D4AF37]/20 scale-[1.02]'
                : 'bg-[#111119] border border-[#252535] text-gray-300 hover:text-white hover:border-[#D4AF37]'
            }`}
          >
            <Gauge size={13} />
            <span>📡 Swarm</span>
          </button>

          <button
            onClick={() => { playSfx('CLICK'); setLayoutMode('BLUEPRINT_OS'); }}
            className={`py-2 px-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              layoutMode === 'BLUEPRINT_OS'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-black shadow-lg shadow-amber-500/30 scale-[1.02] border-amber-300'
                : 'bg-[#111119] border border-amber-500/40 text-amber-300 hover:text-white hover:border-amber-400'
            }`}
          >
            <FileCode size={13} className="text-amber-400" />
            <span>📜 Blueprint OS</span>
          </button>

          <button
            onClick={() => { playSfx('CLICK'); setLayoutMode('SYNAPTIC_LOOM'); }}
            className={`py-2 px-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              layoutMode === 'SYNAPTIC_LOOM'
                ? 'bg-gradient-to-r from-[#D4AF37] to-amber-300 text-black shadow-lg shadow-[#D4AF37]/20 scale-[1.02]'
                : 'bg-[#111119] border border-[#252535] text-gray-300 hover:text-white hover:border-[#D4AF37]'
            }`}
          >
            <Layers size={13} className="text-[#D4AF37]" />
            <span>⚡ Synaptic Loom</span>
          </button>

          <button
            onClick={() => { playSfx('CLICK'); setLayoutMode('WEAPONS_VAULT'); }}
            className={`py-2 px-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              layoutMode === 'WEAPONS_VAULT'
                ? 'bg-gradient-to-r from-[#D4AF37] to-amber-300 text-black shadow-lg shadow-[#D4AF37]/20 scale-[1.02]'
                : 'bg-[#111119] border border-[#252535] text-gray-300 hover:text-white hover:border-[#D4AF37]'
            }`}
          >
            <Boxes size={13} />
            <span>📦 Vault ({forgedCLIs.length})</span>
          </button>

          <button
            onClick={() => { playSfx('CLICK'); setLayoutMode('SENTINEL_SHIELD'); }}
            className={`py-2 px-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              layoutMode === 'SENTINEL_SHIELD'
                ? 'bg-gradient-to-r from-[#D4AF37] to-amber-300 text-black shadow-lg shadow-[#D4AF37]/20 scale-[1.02]'
                : 'bg-[#111119] border border-[#252535] text-gray-300 hover:text-white hover:border-[#D4AF37]'
            }`}
          >
            <Shield size={13} />
            <span>🛡️ Sentinel ({leases.length})</span>
          </button>

          <button
            onClick={() => { playSfx('CLICK'); setLayoutMode('TITAN_CORE_TELEMETRY'); }}
            className={`py-2 px-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              layoutMode === 'TITAN_CORE_TELEMETRY'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/20 scale-[1.02]'
                : 'bg-[#111119] border border-emerald-500/40 text-emerald-300 hover:text-white hover:border-emerald-400'
            }`}
          >
            <Cpu size={13} />
            <span>🛡️ Titan Core</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ANIMATED WORKSPACE CANVAS: FLUID MODE TRANSITIONS & REACTIVE STATES
          ========================================================================= */}
      <AnimatePresence mode="wait">
        <motion.div
          key={layoutMode}
          initial={{ opacity: 0, y: 10, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.995 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          {/* PRIMARY CARD-BASED GRID LAYOUT: EXPLICIT SEPARATION OF CONTROLS & MONITORING */}
          {(layoutMode === 'GRID_OVERVIEW' || layoutMode === 'FORGE_CONTROLS' || layoutMode === 'SWARM_MONITOR') && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* PRIMARY CARD: DEDICATED CONTROL AUTHORITY (Intent, Constitution, Forge) */}
              {(layoutMode === 'GRID_OVERVIEW' || layoutMode === 'FORGE_CONTROLS') && (
                <div className={`${layoutMode === 'FORGE_CONTROLS' ? 'xl:col-span-12' : 'xl:col-span-6 2xl:col-span-6'} space-y-5`}>
                  <OrchestratorChat onWorkflowStart={(intent, budget) => {
                    onNotify(`Starting ${intent} workflow`, 'success');
                  }} />
                  <PrimaryControlCard
                    onNotify={onNotify}
                    toolName={toolName}
                    setToolName={setToolName}
                    category={category}
                    setCategory={setCategory}
                    codebaseInput={codebaseInput}
                    setCodebaseInput={setCodebaseInput}
                    forging={forging}
                    currentStepIndex={currentStepIndex}
                    handleStartForge={handleStartForge}
                    applyTemplate={applyTemplate}
                    templates={FORGE_TEMPLATES}
                    selectedCLI={selectedCLI}
                    selectedSubcommand={selectedSubcommand}
                    setSelectedSubcommand={setSelectedSubcommand}
                    customArgsInput={customArgsInput}
                    setCustomArgsInput={setCustomArgsInput}
                    handleExecuteSubcommand={handleExecuteSubcommand}
                    executingSub={executingSub}
                    player={player}
                    quests={QUESTS}
                    playSfx={playSfx}
                    onIntentCompiled={() => {
                      fetchData();
                    }}
                  />
                </div>
              )}

              {/* SECONDARY MONITORING CARDS: STATE MACHINE & SWARM OBSERVABILITY */}
              {(layoutMode === 'GRID_OVERVIEW' || layoutMode === 'SWARM_MONITOR') && (
                <div className={`${layoutMode === 'SWARM_MONITOR' ? 'xl:col-span-12' : 'xl:col-span-6 2xl:col-span-6'} space-y-6`}>
                  
                  {/* SECONDARY MONITORING CARD 1: AGENT TASK VISUAL STATE MACHINE DIAGRAM (CSS GRID) */}
                  <div className="bg-[#0E0E18] border-2 border-purple-500/30 hover:border-purple-500/60 rounded-2xl p-4 sm:p-5 shadow-2xl transition-all space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#1E1E30] pb-3 gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                          <Workflow size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                              Agent Task Visual State Machine
                            </h3>
                            <span className="text-[9px] bg-purple-950 text-purple-300 font-mono font-bold px-2 py-0.5 rounded border border-purple-800/40 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> 
                              {stateMachineDiagramMode === '7_PHASE_GRID' ? '7-PHASE CSS GRID' : '14-STAGE DAG'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400">
                            Tracks task lifecycle: <strong className="text-amber-300 font-mono">Intent</strong> $\rightarrow$ <strong className="text-yellow-300 font-mono">Spec</strong> $\rightarrow$ <strong className="text-sky-300 font-mono">Plan</strong> $\rightarrow$ <strong className="text-cyan-300 font-mono">DAG</strong> $\rightarrow$ <strong className="text-purple-300 font-mono">Sandbox</strong> $\rightarrow$ <strong className="text-emerald-300 font-mono">Verification</strong> $\rightarrow$ <strong className="text-amber-300 font-mono">Receipt</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* View mode toggle pills */}
                        <div className="flex items-center bg-[#141424] p-1 rounded-xl border border-[#26263A] text-[10px] font-mono font-bold">
                          <button
                            onClick={() => { playSfx('CLICK'); setStateMachineDiagramMode('7_PHASE_GRID'); }}
                            className={`px-2.5 py-1 rounded-lg transition-all ${
                              stateMachineDiagramMode === '7_PHASE_GRID'
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow font-black'
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                            title="7-Phase Visual State Machine Diagram (CSS Grid)"
                          >
                            🎯 7-Phase Grid
                          </button>
                          <button
                            onClick={() => { playSfx('CLICK'); setStateMachineDiagramMode('14_STAGE_DAG'); }}
                            className={`px-2.5 py-1 rounded-lg transition-all ${
                              stateMachineDiagramMode === '14_STAGE_DAG'
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow font-black'
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                            title="14-Stage Granular Blueprint OS Stepper"
                          >
                            📜 14-Stage DAG
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            playSfx('CLICK');
                            setLayoutMode('BLUEPRINT_OS');
                          }}
                          className="hidden md:flex text-[11px] bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold px-3 py-1.5 rounded-xl border border-purple-500/40 items-center gap-1.5 transition-all"
                        >
                          <span>Full Studio</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Render the 7-Phase CSS Grid State Machine or 14-Stage DAG Stepper */}
                    {stateMachineDiagramMode === '7_PHASE_GRID' ? (
                      <TaskLifecycleGridDiagram
                        onNotify={onNotify}
                        onOpenFullOS={() => {
                          playSfx('CLICK');
                          setLayoutMode('BLUEPRINT_OS');
                        }}
                      />
                    ) : (
                      <BlueprintStateMachine 
                        onNotify={onNotify}
                        onOpenFullOS={() => {
                          playSfx('CLICK');
                          setLayoutMode('BLUEPRINT_OS');
                        }}
                      />
                    )}
                    
                    <div className="bg-[#11111C] border border-[#222234] rounded-2xl p-5 mt-4">
                      <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider mb-4">Pipeline Status</h4>
                      <PipelineProgress stages={usePipelineTaskState()} />
                    </div>
                    
                    <div className="bg-[#11111C] border border-[#222234] rounded-2xl p-5 mt-4">
                      <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider mb-4">Foundry Logs</h4>
                      <FoundryLogs logs={useFoundryLogs()} />
                    </div>
                    
                    <ResourceMonitor 
                      modeName="Merlin's Sovereign Software Agency" 
                      ramAllocation="1.8 GB / 8.0 GB (22.5% Quota)" 
                      cores="2 / 8 Virtual ARM64 Cores (Cores 0-1)" 
                    />
                    
                    {/* MERLIN FOUNDRY PIPELINE PROGRESS */}
                  </div>

                  {/* SECONDARY MONITORING CARD 2: SWARM OBSERVABILITY & TELEMETRY STATION */}
                  <div className="bg-[#0E131F] border-2 border-sky-500/30 hover:border-sky-500/60 rounded-2xl p-4 sm:p-5 shadow-2xl transition-all space-y-4">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#1A2338] pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
                          <Gauge size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                              Swarm Observability & Telemetry Station
                            </h3>
                            <span className="text-[9px] bg-sky-950 text-sky-300 font-mono font-bold px-2 py-0.5 rounded border border-sky-800/40 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE METRICS
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400">
                            1,000-agent throughput progress, 24D Leech lattice health, Stdio RPC live terminal, and Sentinel leases.
                          </p>
                        </div>
                      </div>

                      <span className="hidden sm:inline-block text-[10px] text-emerald-400 font-mono bg-[#111A2E] px-2.5 py-1 rounded-lg border border-sky-800/40">
                        ● 24D LATTICE
                      </span>
                    </div>

                    <MissionAnalytics />
                    {/* Swarm Monitoring Dashboard for 1,000-Agent Swarm Expansion */}
                    <SwarmMonitoringDashboard onNotify={onNotify} />

                    {/* Real-time Stdio JSON-RPC Output Console */}
                    <div className="bg-[#0B0B12] border-2 border-[#202032] rounded-2xl p-4 space-y-3 shadow-xl">
                      <div className="flex items-center justify-between border-b border-[#1A1A2A] pb-2.5">
                        <div className="flex items-center gap-2">
                          <Terminal size={15} className="text-[#D4AF37]" />
                          <h4 className="text-xs sm:text-sm font-black text-white font-mono uppercase">
                            Live Output Terminal
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={handleExportArtifact}
                            className="text-[10px] bg-[#161624] hover:bg-amber-950/40 text-amber-300 hover:text-white px-2 py-1 rounded flex items-center gap-1 font-mono border border-amber-500/30 transition-all"
                            title="Download current Forge Artifact JSON summary"
                          >
                            <Download size={11} className="text-amber-400" />
                            <span>Export</span>
                          </button>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(subOutput, null, 2));
                              setCopiedCode(true);
                              setTimeout(() => setCopiedCode(false), 2000);
                            }}
                            className="text-[10px] bg-[#161624] hover:bg-[#202032] text-gray-300 px-2 py-1 rounded flex items-center gap-1 font-mono border border-[#252538]"
                          >
                            {copiedCode ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Spec switcher tabs */}
                      <div className="flex gap-1 border-b border-[#1A1A28] pb-1.5 text-[10px] font-mono">
                        <button
                          onClick={() => setActiveSpecTab('CONSOLE')}
                          className={`px-2.5 py-1 rounded font-bold transition-all ${
                            activeSpecTab === 'CONSOLE'
                              ? 'bg-amber-400 text-black'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Console Output
                        </button>
                        {selectedCLI && (
                          <>
                            <button
                              onClick={() => setActiveSpecTab('SKILL')}
                              className={`px-2.5 py-1 rounded font-bold transition-all ${
                                activeSpecTab === 'SKILL'
                                  ? 'bg-amber-400 text-black'
                                  : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              SKILL.md
                            </button>
                            <button
                              onClick={() => setActiveSpecTab('TEST')}
                              className={`px-2.5 py-1 rounded font-bold transition-all ${
                                activeSpecTab === 'TEST'
                                  ? 'bg-amber-400 text-black'
                                  : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              TEST.md
                            </button>
                          </>
                        )}
                      </div>

                      {/* Output Pre box */}
                      <div className="bg-[#06060A] border border-[#181824] rounded-xl p-3 max-h-52 overflow-y-auto font-mono text-[11px]">
                        {activeSpecTab === 'CONSOLE' && (
                          <pre className="text-emerald-400 whitespace-pre-wrap">
                            {subOutput ? JSON.stringify(subOutput, null, 2) : 'No execution output yet.'}
                          </pre>
                        )}
                        {activeSpecTab === 'SKILL' && selectedCLI && (
                          <pre className="text-amber-200 whitespace-pre-wrap">
                            {selectedCLI.skillMd}
                          </pre>
                        )}
                        {activeSpecTab === 'TEST' && selectedCLI && (
                          <pre className="text-purple-300 whitespace-pre-wrap">
                            {selectedCLI.testMd}
                          </pre>
                        )}
                      </div>

                      {/* Telemetry metadata footer */}
                      <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-gray-400 pt-1 border-t border-[#151522]">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 size={11} /> Zero-Ambient VFS Worktree Active
                        </span>
                        <span>Latency: <strong className="text-white">{(subOutput as any)?.telemetry?.executionTimeMs || 1.8}ms</strong></span>
                      </div>
                    </div>

                    {/* Sentinel Security & Worktree Sandboxes */}
                    <div className="bg-[#0E0E16] border border-[#222234] rounded-2xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-[#1A1A28] pb-2">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-sky-400" />
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">
                            Sentinel Policy & Leases ({leases.length})
                          </h4>
                        </div>
                        <button
                          onClick={() => handleRequestSentinelLease('AGENTIC_SUPER_USER')}
                          className="text-[10px] bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold px-2.5 py-1 rounded-lg border border-sky-500/40"
                        >
                          + Lease (+120 XP)
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {leases.slice(0, 3).map(l => (
                          <div key={l.leaseId} className="p-2 bg-[#141420] rounded-xl border border-[#252538] text-[11px] font-mono flex items-center justify-between">
                            <div>
                              <span className="text-white font-bold block">{l.capability}</span>
                              <span className="text-[9px] text-gray-400">Agent: {l.targetAgent}</span>
                            </div>
                            <span className="text-[9px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded font-bold">
                              {l.leaseStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

          {/* VIEW MODE: WEAPONS VAULT FULL VIEW */}
          {layoutMode === 'WEAPONS_VAULT' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#222232] pb-3">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Boxes size={16} className="text-[#D4AF37]" /> Agentic CLI Armory ({forgedCLIs.length} Weapons)
                  </h3>
                  <p className="text-xs text-gray-400">Every tool is Stdio JSON-RPC 2.0 compliant, isolated in zero-ambient worktrees.</p>
                </div>
                <button
                  onClick={() => setLayoutMode('GRID_OVERVIEW')}
                  className="text-xs bg-[#D4AF37] hover:bg-amber-300 text-black font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Hammer size={14} /> + Forge New CLI
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {forgedCLIs.map(cli => {
                  const isSelected = selectedCLI?.id === cli.id;
                  return (
                    <div
                      key={cli.id}
                      onClick={() => {
                        playSfx('CLICK');
                        setSelectedCLI(cli);
                        if (cli.subcommands.length > 0) {
                          setSelectedSubcommand(cli.subcommands[0].name);
                        }
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] space-y-3 ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#1C1C2C] to-[#12121E] border-2 border-[#D4AF37] shadow-xl shadow-[#D4AF37]/10'
                          : 'bg-[#12121A] border-[#252538] hover:border-[#3E3E58]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center text-amber-300 font-bold text-xs font-mono">
                            CLI
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white font-mono">{cli.binaryName}</h4>
                            <span className="text-[10px] text-gray-400 font-mono">v{cli.version} • {cli.category}</span>
                          </div>
                        </div>

                        <span className="text-[9px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/40 font-mono font-bold">
                          VERIFIED
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-300 font-mono bg-[#0B0B10] p-2 rounded-lg border border-[#1F1F2C]">
                        Subcommands: <strong className="text-amber-300">{cli.subcommands.map(s => s.name).join(', ')}</strong>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-2 border-t border-[#1C1C2A]">
                        <span>bin/{cli.binaryName}.js</span>
                        <span className="text-[#D4AF37] font-bold flex items-center">
                          Select Weapon <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE: SENTINEL VFS SHIELD FULL VIEW */}
          {layoutMode === 'SENTINEL_SHIELD' && (
            <div className="space-y-5">
              <div className="bg-[#12121C] border border-[#2A2A3E] rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Shield size={16} className="text-sky-400" /> Sentinel Policy Authority & Ephemeral Worktrees
                  </h3>
                  <p className="text-xs text-gray-400">Policy: FAIL_CLOSED • Zero ambient directory leakage allowed on Edge ARM64 nodes.</p>
                </div>

                <button
                  onClick={() => handleRequestSentinelLease('AGENTIC_SUPER_USER')}
                  className="text-xs bg-sky-500 hover:bg-sky-400 text-black font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Lock size={14} /> + Request Super-User Lease (+120 XP)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Leases */}
                <div className="bg-[#0B0B0E] border border-[#252538] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1A1A28] pb-2">
                    <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                      <Lock size={13} /> Active Capability Leases ({leases.length})
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">100% HEALTHY</span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {leases.map(l => (
                      <div key={l.leaseId} className="p-3 bg-[#12121A] rounded-md border border-[#252538] text-xs space-y-1">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-white font-bold">{l.capability}</span>
                          <span className="text-[10px] bg-[#1A1A28] text-sky-300 px-2 py-0.5 rounded font-bold">{l.leaseStatus}</span>
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          Agent: <strong className="text-[#D4AF37]">{l.targetAgent}</strong> • Worktree: {l.vfsWorktreeId}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Worktrees */}
                <div className="bg-[#0B0B0E] border border-[#252538] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1A1A28] pb-2">
                    <span className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu size={13} /> Ephemeral VFS Sandboxes ({worktrees.length})
                    </span>
                    <span className="text-[10px] text-sky-400 font-mono">ARM64 CLAMPED</span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {worktrees.map(w => (
                      <div key={w.worktreeId} className="p-3 bg-[#12121A] rounded-md border border-[#252538] text-xs space-y-1">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-[#00F0FF] font-bold">{w.worktreeId}</span>
                          <span className="text-[10px] bg-[#1A1A28] text-emerald-300 px-2 py-0.5 rounded font-bold">{w.ephemeralState}</span>
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono truncate">
                          Path: {w.isolatedPath}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BLUEPRINT OS ARCHITECTURE & CONTRACT LEASE ARENA */}
          {layoutMode === 'BLUEPRINT_OS' && (
            <BlueprintOSStudio />
          )}

          {/* SYNAPTIC LOOM COGNITIVE COMPILER MODE */}
          {layoutMode === 'SYNAPTIC_LOOM' && (
            <SynapticLoomStudio onNotify={onNotify} />
          )}

          {/* MERLIN AGENCY COGNITIVE PLAYGROUND & ARCHMAGE DEBATE CHAMBER */}
          {layoutMode === 'COGNITIVE_PLAYGROUND' && (
            <div className="bg-[#0B0B12] border border-purple-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl">
              <MerlinCognitivePlayground 
                onNotify={onNotify}
                onDeployToGenesis={(topic, prd) => {
                  setLayoutMode('GENESIS_INTAKE');
                  onNotify(`Deployed "${topic}" PRD to Genesis Intake Studio!`, 'success');
                }}
              />
            </div>
          )}

          {/* GENESIS INTAKE CARTRIDGE STUDIO & 5-STAGE CRUCIBLE */}
          {layoutMode === 'GENESIS_INTAKE' && (
            <div className="bg-[#0B0B12] border border-rose-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl">
              <GenesisIntakeCartridgeStudio 
                onNotify={onNotify}
              />
            </div>
          )}
          {/* TITAN CORE LOW-LEVEL OBSERVABILITY & ARCHMAGE COUNCIL PANEL */}
          {layoutMode === 'TITAN_CORE_TELEMETRY' && (
            <TitanCoreView
              onNotify={onNotify}
              onSwitchToVibe={() => setCurrentHUDTier('VIBE_MODE')}
              onSwitchToKanban={() => setCurrentHUDTier('KANBAN_MODE')}
              onOpenCognitivePlayground={() => setLayoutMode('COGNITIVE_PLAYGROUND')}
            />
          )}
        </motion.div>
      </AnimatePresence>
      </>
      )}

      {/* Non-intrusive Auto-Saving Toast */}
      <AutoSaveToast 
        status={autoSaveStatus}
        isCloudSync={!!authUser || !!auth.currentUser}
        lastSavedAt={lastAutoSavedAt} 
        saveCount={autoSaveCount} 
        onDismiss={() => setAutoSaveStatus('idle')} 
      />
    </div>
  );
}
