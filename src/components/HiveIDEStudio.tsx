import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Copy, 
  Check, 
  Sliders, 
  GitBranch, 
  RefreshCw, 
  Code, 
  Maximize2, 
  Activity, 
  Lock, 
  Radio, 
  Settings, 
  HelpCircle, 
  Boxes, 
  Zap, 
  BarChart3, 
  TrendingUp, 
  FastForward, 
  ArrowUpDown, 
  Filter, 
  AlertOctagon, 
  Clock, 
  ShieldAlert, 
  Download, 
  FileJson,
  CheckSquare,
  Square,
  ListTodo,
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff,
  Volume2,
  Plus,
  Send,
  X,
  Wrench,
  Bug,
  Rocket,
  FlaskConical,
  FileText,
  Tag,
  SlidersHorizontal
} from 'lucide-react';
import { CartridgeSettingsState } from './CartridgeSettingsModal';
import { parseVoiceTaskCommand, parseVoiceHiveAction, VoiceTaskParsed, VoiceHiveAction, TaskPriority, TaskCategory } from './SpatialVoiceHUD';
import { ApexReforgedArchitectureStudio } from './ApexReforgedArchitectureStudio';

interface HiveIDEStudioProps {
  onNotify?: (msg: string, type?: 'success' | 'warning') => void;
  onOpenSettings?: () => void;
  onTriggerEvolve?: () => void;
  onOpenVoiceHUD?: () => void;
  injectedVoiceTask?: (VoiceTaskParsed & { timestamp: number }) | null;
  injectedHiveAction?: { action: 'SMART_SORT'; timestamp: number } | null;
  settings?: CartridgeSettingsState['hiveIDE'];
}

export type { TaskPriority, TaskCategory };

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  category?: TaskCategory;
}

interface KnightStream {
  id: string;
  knight: 'MERLIN' | 'LANCELOT' | 'GALAHAD' | 'GIDEON' | 'ANIMATOR' | 'BORIS';
  title: string;
  role: string;
  color: string;
  status: 'ACTIVE_EXEC' | 'IDLE_WAIT' | 'PANIC_PATCHING' | 'PASS_Z3' | 'COMPLETED';
  progress: number; // 0 to 100
  activeTask: string;
  completedTasks: number;
  totalTasks: number;
  codeSnippet: string;
  lineCount: number;
  priority?: TaskPriority;
  category?: TaskCategory;
  subtasks: Subtask[];
}

export interface CategoryMeta {
  category: TaskCategory;
  label: string;
  shortCode: string;
  icon: React.ElementType;
  textColor: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
  glowClass: string;
  description: string;
}

export const ALL_CATEGORIES: TaskCategory[] = [
  'REFACTOR',
  'DEBUG',
  'DEPLOY',
  'FEATURE',
  'SECURITY',
  'TEST',
  'OPTIMIZE',
  'DOCS'
];

export const CATEGORY_CONFIGS: Record<TaskCategory, CategoryMeta> = {
  REFACTOR: {
    category: 'REFACTOR',
    label: 'Refactor',
    shortCode: 'REFACTOR',
    icon: Wrench,
    textColor: '#818CF8',
    bgColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(129, 140, 248, 0.45)',
    badgeClass: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50',
    glowClass: 'shadow-[0_0_10px_rgba(129,140,248,0.3)]',
    description: 'Code restructuring, schema migration, and architectural cleanup'
  },
  DEBUG: {
    category: 'DEBUG',
    label: 'Debug',
    shortCode: 'DEBUG',
    icon: Bug,
    textColor: '#F43F5E',
    bgColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: 'rgba(244, 63, 94, 0.45)',
    badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
    glowClass: 'shadow-[0_0_10px_rgba(244,63,94,0.3)]',
    description: 'Bug isolation, panic recovery, error diagnosis, and hotfixes'
  },
  DEPLOY: {
    category: 'DEPLOY',
    label: 'Deploy',
    shortCode: 'DEPLOY',
    icon: Rocket,
    textColor: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.45)',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
    glowClass: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    description: 'Wasm IPC broadcast, CI/CD pipeline, container rollout, and release'
  },
  FEATURE: {
    category: 'FEATURE',
    label: 'Feature',
    shortCode: 'FEATURE',
    icon: Sparkles,
    textColor: '#00F0FF',
    bgColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: 'rgba(0, 240, 255, 0.45)',
    badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50',
    glowClass: 'shadow-[0_0_10px_rgba(0,240,255,0.3)]',
    description: 'User-facing components, kinetic UI shaders, and new capabilities'
  },
  SECURITY: {
    category: 'SECURITY',
    label: 'Security',
    shortCode: 'SECURITY',
    icon: ShieldCheck,
    textColor: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.45)',
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
    glowClass: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]',
    description: 'Sentinel vaults, capability leases, zero-ambient VFS, and crypto verification'
  },
  TEST: {
    category: 'TEST',
    label: 'Test',
    shortCode: 'TEST',
    icon: FlaskConical,
    textColor: '#FB923C',
    bgColor: 'rgba(251, 146, 60, 0.15)',
    borderColor: 'rgba(251, 146, 60, 0.45)',
    badgeClass: 'bg-orange-950/80 text-orange-300 border-orange-500/50',
    glowClass: 'shadow-[0_0_10px_rgba(251,146,60,0.3)]',
    description: 'Gideon Level 5 crucible proofs, invariant fuzzing, and SRE regressions'
  },
  OPTIMIZE: {
    category: 'OPTIMIZE',
    label: 'Optimize',
    shortCode: 'OPTIMIZE',
    icon: Zap,
    textColor: '#FACC15',
    bgColor: 'rgba(250, 204, 21, 0.15)',
    borderColor: 'rgba(250, 204, 21, 0.45)',
    badgeClass: 'bg-yellow-950/80 text-yellow-300 border-yellow-500/50',
    glowClass: 'shadow-[0_0_10px_rgba(250,204,21,0.3)]',
    description: 'Performance acceleration, 60fps frame budgeting, and latency pruning'
  },
  DOCS: {
    category: 'DOCS',
    label: 'Docs',
    shortCode: 'DOCS',
    icon: FileText,
    textColor: '#38BDF8',
    bgColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.45)',
    badgeClass: 'bg-sky-950/80 text-sky-300 border-sky-500/50',
    glowClass: 'shadow-[0_0_10px_rgba(56,189,248,0.3)]',
    description: 'Blueprint documentation, schema specifications, and contract logs'
  }
};

export const getNextCategory = (current?: TaskCategory): TaskCategory => {
  const cur = current || 'FEATURE';
  const idx = ALL_CATEGORIES.indexOf(cur);
  return ALL_CATEGORIES[(idx + 1) % ALL_CATEGORIES.length];
};

/**
 * TaskCategoryTag - Renders a sleek color-coded categorization pill with
 * icon, custom hover effect, and click-to-cycle capability.
 */
export function TaskCategoryTag({
  category = 'FEATURE',
  interactive = true,
  onCycle,
  size = 'sm',
  className = ''
}: {
  category?: TaskCategory;
  interactive?: boolean;
  onCycle?: (e: React.MouseEvent) => void;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}) {
  const config = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS.FEATURE;
  const Icon = config.icon;

  const sizeClasses = 
    size === 'xs' ? 'text-[8px] px-1.5 py-0.5 gap-1' :
    size === 'sm' ? 'text-[9px] px-2 py-0.5 gap-1.5' :
    'text-[10px] px-2.5 py-1 gap-1.5 font-bold';

  return (
    <span
      onClick={(e) => {
        if (interactive && onCycle) {
          e.stopPropagation();
          onCycle(e);
        }
      }}
      title={interactive ? `Category: ${config.label} (${config.description}). Click to cycle category.` : `Category: ${config.label}`}
      className={`inline-flex items-center rounded-md border font-mono font-bold tracking-wider uppercase transition-all duration-200 ${
        config.badgeClass
      } ${sizeClasses} ${
        interactive ? 'cursor-pointer hover:scale-105 active:scale-95 select-none hover:shadow-md' : ''
      } ${className}`}
    >
      <Icon size={size === 'xs' ? 9 : size === 'sm' ? 10 : 12} style={{ color: config.textColor }} />
      <span>{config.label}</span>
    </span>
  );
}

/**
 * AnimatedTaskLabel - Provides an animated horizontal strike-through line
 * and graceful opacity fade effect when tasks are marked as complete.
 */
export function AnimatedTaskLabel({
  text,
  completed,
  className = "",
  lineColor = "#10B981"
}: {
  text: string;
  completed: boolean;
  className?: string;
  lineColor?: string;
}) {
  return (
    <span className={`relative inline-block transition-all duration-300 ${completed ? 'text-gray-500 opacity-60' : 'text-gray-200 opacity-100'} ${className}`}>
      <span className={completed ? 'line-through decoration-transparent' : ''}>{text}</span>
      {/* Subtle animated strike-through line drawn from left to right */}
      <motion.span
        initial={false}
        animate={{
          scaleX: completed ? 1 : 0,
          opacity: completed ? 0.95 : 0
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] w-full pointer-events-none origin-left rounded-full shadow-[0_0_5px_rgba(16,185,129,0.6)]"
        style={{ backgroundColor: lineColor }}
      />
    </span>
  );
}

const DEFAULT_STREAMS: KnightStream[] = [
  {
    id: 'stream-merlin',
    knight: 'MERLIN',
    title: 'ROUTER_CORE // DAG SWARM DISPATCH',
    role: 'Topological Task Scheduling & Wasm IPC',
    color: '#00F0FF',
    status: 'ACTIVE_EXEC',
    progress: 92,
    priority: 'NORMAL',
    category: 'OPTIMIZE',
    activeTask: 'Topological state graph synchronization & invariant routing',
    completedTasks: 11,
    totalTasks: 12,
    subtasks: [
      { id: 'm-1', title: 'Topological DAG node parsing & boundary isolation', completed: true, category: 'REFACTOR' },
      { id: 'm-2', title: 'WasmBridge MsgPack RPC stream broadcast ("camelot-0")', completed: true, category: 'DEPLOY' },
      { id: 'm-3', title: 'Topological state graph synchronization & invariant routing', completed: false, category: 'OPTIMIZE' }
    ],
    codeSnippet: `// [KNIGHT_MERLIN_STREAM: ROUTER_CORE]
export const dispatchSwarmTask = async (dag: TopologicalDag) => {
  const channel = await WasmBridge.openIpcStream("camelot-0");
  return channel.broadcastMsgPack({ type: "SYNC_NODES", payload: dag.serialize() });
};`,
    lineCount: 7
  },
  {
    id: 'stream-lancelot',
    knight: 'LANCELOT',
    title: 'FRONTEND_CORE // KINETIC HUD',
    role: 'Tier 3 Dynamic DOM + Spatial View',
    color: '#D4AF37',
    status: 'ACTIVE_EXEC',
    progress: 84,
    priority: 'NORMAL',
    category: 'FEATURE',
    activeTask: 'Compiling Holographic Armor shaders & 60fps motion curves',
    completedTasks: 8,
    totalTasks: 10,
    subtasks: [
      { id: 'l-1', title: 'Sovereign Viewport telemetry ribbon shader binding', completed: true, category: 'FEATURE' },
      { id: 'l-2', title: 'Kinetic data stream 60fps motion spring layout', completed: true, category: 'OPTIMIZE' },
      { id: 'l-3', title: 'Compiling Holographic Armor shaders & 60fps motion curves', completed: false, category: 'REFACTOR' }
    ],
    codeSnippet: `// [KNIGHT_LANCELOT_STREAM: FRONTEND_CORE]
export function SovereignViewport({ telemetry, activeState }: ViewportProps) {
  const [glitchActive, setGlitchActive] = useState(false);

  return (
    <div className="hud-panel p-4 rounded-xl border border-[#D4AF37]/30">
      <TelemetryRibbon bufferState="NOMINAL_LOCKED" />
      <KineticDataStream lines={120} thermalLoad="38.2C" />
    </div>
  );
}`,
    lineCount: 12
  },
  {
    id: 'stream-galahad',
    knight: 'GALAHAD',
    title: 'SECURITY_BACKEND // SENTINEL GUARD',
    role: 'Zero-Ambient Sentinel Lease Validator',
    color: '#10B981',
    status: 'ACTIVE_EXEC',
    progress: 76,
    priority: 'CRITICAL',
    category: 'SECURITY',
    activeTask: 'Evaluating SMT Z3 formal proofs on capability lease sandbox',
    completedTasks: 9,
    totalTasks: 12,
    subtasks: [
      { id: 'g-1', title: 'Sentinel Vault token signature verification', completed: true, category: 'SECURITY' },
      { id: 'g-2', title: 'Evaluating SMT Z3 formal proofs on capability lease sandbox', completed: false, category: 'SECURITY' },
      { id: 'g-3', title: 'VFS worktree zero-ambient access enforcement', completed: false, category: 'DEBUG' }
    ],
    codeSnippet: `// [KNIGHT_GALAHAD_STREAM: SECURITY_BACKEND]
export async function validateCapabilityLease(req: Request, leaseId: string) {
  const sentinel = await SentinelVault.verifyToken(leaseId);
  if (!sentinel.isValid || sentinel.isExpired()) {
    throw new SecurityInvariantBreach("Sentinel lease revoked or expired");
  }
  return { status: "AUTHORIZED", vfsSandbox: sentinel.worktreeId };
}`,
    lineCount: 8
  },
  {
    id: 'stream-gideon',
    knight: 'GIDEON',
    title: 'ADVERSARIAL_SRE // TDD CRUCIBLE',
    role: 'Falsification Tests & Z3 Proofs',
    color: '#EF4444',
    status: 'PASS_Z3',
    progress: 100,
    priority: 'SEALED',
    category: 'TEST',
    activeTask: 'Gideon Level 5: 5 failure archetypes verified (0 regressions)',
    completedTasks: 15,
    totalTasks: 15,
    subtasks: [
      { id: 'gd-1', title: 'Falsification invariant fuzzing matrix', completed: true, category: 'TEST' },
      { id: 'gd-2', title: 'Zero-entropy concurrency race inoculation (50 threads)', completed: true, category: 'DEBUG' },
      { id: 'gd-3', title: 'Gideon Level 5: 5 failure archetypes verified (0 regressions)', completed: true, category: 'TEST' }
    ],
    codeSnippet: `// [KNIGHT_GIDEON_STREAM: ADVERSARIAL_SRE]
describe("Invariant Inoculation Matrix", () => {
  it("guarantees zero-entropy state transition under concurrency", async () => {
    const raceConditions = Array.from({ length: 50 }, () => forge.transact());
    const results = await Promise.allSettled(raceConditions);
    expect(results.every(r => r.status === "fulfilled")).toBe(true);
  });
});`,
    lineCount: 9
  },
  {
    id: 'stream-animator',
    knight: 'ANIMATOR',
    title: 'KINETIC_SHADERS // 60FPS ENGINE',
    role: 'WebGL Visemes & Ephemeral Hand Preview',
    color: '#A855F7',
    status: 'ACTIVE_EXEC',
    progress: 68,
    priority: 'DELAYED',
    category: 'OPTIMIZE',
    activeTask: 'Rendering kinetic particle buffer & sub-45ms preview inject (Lagging)',
    completedTasks: 6,
    totalTasks: 9,
    subtasks: [
      { id: 'a-1', title: 'WebGL visemes shader compilation & canvas binding', completed: true, category: 'FEATURE' },
      { id: 'a-2', title: 'Rendering kinetic particle buffer & sub-45ms preview inject', completed: false, category: 'OPTIMIZE' },
      { id: 'a-3', title: 'Ephemeral DOM tree shadow buffer synchronization', completed: false, category: 'DEPLOY' }
    ],
    codeSnippet: `// [KNIGHT_ANIMATOR_STREAM: KINETIC_SHADERS]
export const injectKineticPreview = (domRoot: HTMLElement) => {
  requestAnimationFrame(() => {
    WebGLRenderer.drawSubtree(domRoot, { frameRate: 60, antialias: true });
  });
};`,
    lineCount: 8
  }
];

// Helper to determine the effective real-time priority of a stream
export const getEffectivePriority = (
  stream: KnightStream,
  activeConflict: { resolved: boolean; targetFile: string } | null
): TaskPriority => {
  // If active conflict or panic, escalate immediately to CRITICAL
  if (
    (activeConflict && !activeConflict.resolved && (stream.knight === 'LANCELOT' || stream.knight === 'GALAHAD')) ||
    stream.status === 'PANIC_PATCHING'
  ) {
    return 'CRITICAL';
  }

  // If 100% or PASS_Z3, status is SEALED
  if (stream.status === 'PASS_Z3' || stream.progress >= 100) {
    return 'SEALED';
  }

  // If explicitly designated
  if (stream.priority === 'CRITICAL') {
    return 'CRITICAL';
  }

  if (stream.priority === 'DELAYED' || (stream.progress < 70 && stream.status === 'ACTIVE_EXEC')) {
    return 'DELAYED';
  }

  return 'NORMAL';
};

export function HiveIDEStudio({ onNotify, onOpenSettings, onTriggerEvolve, onOpenVoiceHUD, injectedVoiceTask, injectedHiveAction, settings }: HiveIDEStudioProps) {
  const [cliInput, setCliInput] = useState('');
  const [cliHistory, setCliHistory] = useState<Array<{ text: string; sender: string; type: 'cmd' | 'output' | 'error' | 'knight' }>>([
    { text: 'Arthurian Omni-Digital Forge CLI Kernel v3.4.1 (ARM64_Wasmtime)', sender: 'KERNEL', type: 'output' },
    { text: 'Merlin Router online. Multi-cursor thermal matrix listening on stdio RPC 2.0', sender: 'MERLIN', type: 'knight' },
    { text: 'Voice-to-Task Capture Engine Active: Say "Add task [task name] with [priority]" to inject tasks dynamically.', sender: 'VOICE_OS', type: 'knight' },
    { text: 'Voice Action Support Active: Say "Sort Hive tasks" to automatically rank Critical and Delayed Knight streams.', sender: 'VOICE_OS', type: 'knight' },
    { text: 'Color-coded Situational Border Indicators active: [RED: Critical | AMBER: Delayed | EMERALD: Sealed]', sender: 'SITUATION_OS', type: 'knight' },
    { text: 'Type "forge:build", "test:gideon", "arbitrate:conflict", or "//evolve" to test commands.', sender: 'HIVE_OS', type: 'output' }
  ]);

  const [activeStreams, setActiveStreams] = useState<KnightStream[]>(DEFAULT_STREAMS);
  const [isCompiling, setIsCompiling] = useState(false);
  const [autoProgressEnabled, setAutoProgressEnabled] = useState(true);
  const [smartSortEnabled, setSmartSortEnabled] = useState(true);
  const [highlightedStreamId, setHighlightedStreamId] = useState<string | null>(null);
  const [activeHiveView, setActiveHiveView] = useState<'HIVE_MELEE' | 'APEX_SPEC'>('HIVE_MELEE');

  // Task Categorization & Filtering Engine State
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'ALL' | TaskCategory>('ALL');
  const [manualSelectedCategory, setManualSelectedCategory] = useState<TaskCategory>('FEATURE');

  // Compute live category distribution across all active Knight streams
  const categoryMetrics = useMemo(() => {
    const counts: Record<string, number> = { ALL: 0 };
    ALL_CATEGORIES.forEach(c => { counts[c] = 0; });
    activeStreams.forEach(st => {
      st.subtasks?.forEach(sub => {
        const cat = sub.category || 'FEATURE';
        counts[cat] = (counts[cat] || 0) + 1;
        counts.ALL++;
      });
    });
    return counts;
  }, [activeStreams]);

  // Voice Task Capture Sub-System State
  const [isVoiceCaptureOpen, setIsVoiceCaptureOpen] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceTaskTranscript, setVoiceTaskTranscript] = useState('');
  const [voiceTaskInterim, setVoiceTaskInterim] = useState('');
  const [voiceAudioLevel, setVoiceAudioLevel] = useState(25);
  const speechRecognitionRef = useRef<any>(null);
  const audioSimIntervalRef = useRef<any>(null);
  const lastInjectedTimestampRef = useRef<number>(0);
  const lastInjectedHiveActionTimestampRef = useRef<number>(0);

  const [activeConflict, setActiveConflict] = useState<{
    targetFile: string;
    lancelotProp: string;
    galahadProp: string;
    resolved: boolean;
  } | null>(null);

  const [crucibleStatus, setCrucibleStatus] = useState<{
    panicDetected: boolean;
    panicDesc: string;
    patchedBy: string;
    status: 'SUCCESS' | 'FAIL' | 'IDLE';
  }>({
    panicDetected: false,
    panicDesc: '',
    patchedBy: '',
    status: 'IDLE'
  });

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [cliHistory]);

  // Handler to cycle category for a specific subtask item
  const handleCycleSubtaskCategory = (streamId: string, subtaskId: string) => {
    setActiveStreams(prev =>
      prev.map(st => {
        if (st.id !== streamId) return st;
        const nextSubtasks = (st.subtasks || []).map(sub => {
          if (sub.id !== subtaskId) return sub;
          const nextCat = getNextCategory(sub.category);
          onNotify?.(`Categorized task "${sub.title}" as [${CATEGORY_CONFIGS[nextCat].label}]`, 'success');
          return {
            ...sub,
            category: nextCat
          };
        });
        return {
          ...st,
          subtasks: nextSubtasks
        };
      })
    );
  };

  // Handler to cycle primary category for an entire Knight stream
  const handleCycleStreamCategory = (streamId: string) => {
    setActiveStreams(prev =>
      prev.map(st => {
        if (st.id !== streamId) return st;
        const nextCat = getNextCategory(st.category);
        onNotify?.(`Updated Knight ${st.knight} primary domain to [${CATEGORY_CONFIGS[nextCat].label}]`, 'success');
        return {
          ...st,
          category: nextCat
        };
      })
    );
  };

  // Handler to inject a voice-parsed task into a Knight's active stream & subtasks
  const injectVoiceTaskToStream = (
    taskTitle: string,
    priority: TaskPriority = 'NORMAL',
    targetKnightName: string = 'LANCELOT',
    category: TaskCategory = 'FEATURE'
  ) => {
    const newSubtaskId = 'vtask-' + Date.now();
    const normalizedKnight = targetKnightName.toUpperCase();
    const resolvedCategory = category || 'FEATURE';
    let matchedStreamId = '';

    setActiveStreams(prev =>
      prev.map(st => {
        const isTarget = st.knight === normalizedKnight || 
          (normalizedKnight === 'ROUTER' && st.knight === 'MERLIN') ||
          (normalizedKnight === 'ARCHITECT' && st.knight === 'MERLIN') ||
          (normalizedKnight === 'SECURITY' && st.knight === 'GALAHAD') ||
          (normalizedKnight === 'UI' && st.knight === 'LANCELOT') ||
          (normalizedKnight === 'SRE' && st.knight === 'GIDEON') ||
          (normalizedKnight === 'ANIMATION' && st.knight === 'ANIMATOR');

        if (!isTarget) return st;

        matchedStreamId = st.id;
        const isSealed = priority === 'SEALED';
        const newSubtask: Subtask = {
          id: newSubtaskId,
          title: taskTitle,
          completed: isSealed,
          category: resolvedCategory
        };

        const nextSubtasks = [...(st.subtasks || []), newSubtask];
        const completedCount = nextSubtasks.filter(s => s.completed).length;
        const totalCount = nextSubtasks.length;
        const nextProgress = isSealed ? 100 : Math.round((completedCount / totalCount) * 100);

        return {
          ...st,
          subtasks: nextSubtasks,
          totalTasks: Math.max(st.totalTasks + 1, totalCount),
          completedTasks: completedCount,
          progress: nextProgress,
          priority: priority,
          category: resolvedCategory,
          activeTask: priority === 'CRITICAL' ? taskTitle : st.activeTask,
          status: isSealed ? 'PASS_Z3' : 'ACTIVE_EXEC'
        };
      })
    );

    // Fallback: If no knight explicitly matched, add to Lancelot or first available stream
    if (!matchedStreamId) {
      setActiveStreams(prev =>
        prev.map((st, idx) => {
          if (idx !== 1 && (idx !== 0 || prev.length === 1)) return st;
          matchedStreamId = st.id;
          const isSealed = priority === 'SEALED';
          const newSubtask: Subtask = {
            id: newSubtaskId,
            title: taskTitle,
            completed: isSealed,
            category: resolvedCategory
          };
          const nextSubtasks = [...(st.subtasks || []), newSubtask];
          const completedCount = nextSubtasks.filter(s => s.completed).length;
          const totalCount = nextSubtasks.length;
          const nextProgress = isSealed ? 100 : Math.round((completedCount / totalCount) * 100);

          return {
            ...st,
            subtasks: nextSubtasks,
            totalTasks: Math.max(st.totalTasks + 1, totalCount),
            completedTasks: completedCount,
            progress: nextProgress,
            priority: priority,
            category: resolvedCategory,
            activeTask: priority === 'CRITICAL' ? taskTitle : st.activeTask,
            status: isSealed ? 'PASS_Z3' : 'ACTIVE_EXEC'
          };
        })
      );
    }

    setHighlightedStreamId(matchedStreamId || 'stream-lancelot');
    setTimeout(() => setHighlightedStreamId(null), 3800);

    setCliHistory(prev => [
      ...prev,
      {
        text: `[VOICE_TASK_INTAKE]: Injected task "${taskTitle}" into Knight ${normalizedKnight}'s stream with [${resolvedCategory}] category and [${priority}] priority.`,
        sender: 'VOICE_HUD',
        type: 'knight'
      }
    ]);

    onNotify?.(
      `⚡ Injected voice task "${taskTitle}" [${resolvedCategory}] [${priority}] into Knight ${normalizedKnight}!`,
      'success'
    );
  };

  // Synchronize when App.tsx passes an injected voice task from global Spatial Voice HUD
  useEffect(() => {
    if (!injectedVoiceTask || injectedVoiceTask.timestamp === lastInjectedTimestampRef.current) return;
    lastInjectedTimestampRef.current = injectedVoiceTask.timestamp;

    injectVoiceTaskToStream(
      injectedVoiceTask.taskTitle,
      injectedVoiceTask.priority,
      injectedVoiceTask.targetKnight,
      injectedVoiceTask.category || 'FEATURE'
    );
  }, [injectedVoiceTask]);

  // Synchronize when App.tsx passes a Hive Action (e.g. Sort Hive tasks) from global Spatial Voice HUD
  useEffect(() => {
    if (!injectedHiveAction || injectedHiveAction.timestamp === lastInjectedHiveActionTimestampRef.current) return;
    lastInjectedHiveActionTimestampRef.current = injectedHiveAction.timestamp;

    if (injectedHiveAction.action === 'SMART_SORT') {
      setSmartSortEnabled(true);
      setCliHistory(prev => [
        ...prev,
        {
          text: '[VOICE_ACTION_EXECUTED]: "Sort Hive tasks" command received from Spatial Voice HUD. Smart Priority Sort ON (Critical & Delayed Knight queues elevated).',
          sender: 'MERLIN',
          type: 'knight'
        }
      ]);
      onNotify?.('⚡ Smart Sort Enabled via Spatial Voice HUD: Critical & Delayed tasks prioritized!', 'success');
    }
  }, [injectedHiveAction]);

  // Real-time Web Speech Recognition for in-IDE Voice-to-Task capture
  const startVoiceTaskListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onNotify?.('Web Speech API not supported in this browser. You can type commands or use quick presets!', 'warning');
      setIsVoiceCaptureOpen(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      setIsListeningVoice(true);
      setIsVoiceCaptureOpen(true);

      audioSimIntervalRef.current = setInterval(() => {
        setVoiceAudioLevel(Math.floor(Math.random() * 65) + 30);
      }, 100);

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          const combined = (voiceTaskTranscript ? voiceTaskTranscript + ' ' : '') + final;
          setVoiceTaskTranscript(combined);
          setVoiceTaskInterim('');

          // 1. Check if final transcript is a Hive Action like "Sort Hive tasks"
          const hiveActionParsed = parseVoiceHiveAction(combined);
          if (hiveActionParsed && hiveActionParsed.actionType === 'SMART_SORT') {
            setSmartSortEnabled(true);
            setCliHistory(prev => [
              ...prev,
              {
                text: '[VOICE_ACTION_EXECUTED]: "Sort Hive tasks" spoken command recognized. Smart Priority Sorting engaged.',
                sender: 'VOICE_HUD',
                type: 'knight'
              }
            ]);
            onNotify?.('⚡ Voice Command: Smart Sort ON! Reordered Knight streams by Priority.', 'success');
            setVoiceTaskTranscript('');
            stopVoiceTaskListening();
            return;
          }

          // 2. Check if final transcript contains an Add task pattern, auto-inject!
          const parsed = parseVoiceTaskCommand(combined);
          if (parsed) {
            injectVoiceTaskToStream(
              parsed.taskTitle,
              parsed.priority,
              parsed.targetKnight,
              parsed.category || manualSelectedCategory
            );
            setVoiceTaskTranscript('');
            stopVoiceTaskListening();
          }
        } else {
          setVoiceTaskInterim(interim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          stopVoiceTaskListening();
        }
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
        setVoiceTaskInterim('');
        if (audioSimIntervalRef.current) {
          clearInterval(audioSimIntervalRef.current);
        }
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
      onNotify?.('🎤 Listening... Say "Sort Hive tasks" or "Add task [task name] with [priority]"', 'success');
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setIsListeningVoice(false);
      onNotify?.('Could not engage microphone. Please verify browser permissions.', 'warning');
    }
  };

  const stopVoiceTaskListening = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    if (audioSimIntervalRef.current) {
      clearInterval(audioSimIntervalRef.current);
    }
    setIsListeningVoice(false);
    setVoiceTaskInterim('');
  };

  const handleExecuteVoiceTaskInput = (customCommand?: string) => {
    const raw = (customCommand || voiceTaskTranscript).trim();
    if (!raw) {
      onNotify?.('Please speak or type a task command first (e.g. "Sort Hive tasks" or "Add refactor task DAG boundary isolation with critical")', 'warning');
      return;
    }

    // 1. Check for Hive Action command (e.g. Sort Hive tasks)
    const hiveActionParsed = parseVoiceHiveAction(raw);
    if (hiveActionParsed && hiveActionParsed.actionType === 'SMART_SORT') {
      setSmartSortEnabled(true);
      setCliHistory(prev => [
        ...prev,
        {
          text: '[VOICE_ACTION_EXECUTED]: "Sort Hive tasks" command processed. Smart Priority Sorting engaged (Critical & Delayed prioritized).',
          sender: 'VOICE_HUD',
          type: 'knight'
        }
      ]);
      onNotify?.('⚡ Smart Sort activated: Reordered Knight tasks by priority.', 'success');
      setVoiceTaskTranscript('');
      setVoiceTaskInterim('');
      return;
    }

    // 2. Check for Task Command
    const parsed = parseVoiceTaskCommand(raw);
    if (parsed) {
      injectVoiceTaskToStream(
        parsed.taskTitle,
        parsed.priority,
        parsed.targetKnight,
        parsed.category || manualSelectedCategory
      );
      setVoiceTaskTranscript('');
      setVoiceTaskInterim('');
    } else {
      // Direct raw task injection fallback
      injectVoiceTaskToStream(raw, 'NORMAL', 'LANCELOT', manualSelectedCategory);
      setVoiceTaskTranscript('');
      setVoiceTaskInterim('');
    }
  };

  // Live parsing preview of what is currently typed / spoken
  const currentParsedPreview = useMemo(() => {
    const raw = (voiceTaskTranscript + (voiceTaskInterim ? ' ' + voiceTaskInterim : '')).trim();
    if (!raw) return null;
    return parseVoiceTaskCommand(raw);
  }, [voiceTaskTranscript, voiceTaskInterim]);

  // Autonomous Swarm Task Progression Loop (Simulating live agent background velocity)
  useEffect(() => {
    if (!autoProgressEnabled) return;

    const interval = setInterval(() => {
      setActiveStreams(prev =>
        prev.map(st => {
          if (st.status === 'PASS_Z3' || st.progress >= 100) {
            return {
              ...st,
              progress: 100,
              priority: 'SEALED',
              status: 'PASS_Z3'
            };
          }

          const delta = Math.floor(Math.random() * 4) + 1;
          const nextProgress = Math.min(100, st.progress + delta);
          const nextCompleted = Math.min(st.totalTasks, Math.floor((nextProgress / 100) * st.totalTasks));

          // Auto-adjust priority if progress caught up
          let nextPriority = st.priority;
          if (nextProgress >= 100) {
            nextPriority = 'SEALED';
          } else if (nextProgress >= 75 && st.priority === 'DELAYED') {
            nextPriority = 'NORMAL';
          }

          return {
            ...st,
            progress: nextProgress,
            completedTasks: nextCompleted,
            priority: nextPriority,
            status: nextProgress === 100 ? 'PASS_Z3' : 'ACTIVE_EXEC'
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [autoProgressEnabled]);

  // Calculate composite swarm progress metrics
  const totalSubtasks = activeStreams.reduce((acc, curr) => acc + curr.totalTasks, 0);
  const totalCompletedSubtasks = activeStreams.reduce((acc, curr) => acc + curr.completedTasks, 0);
  const compositeProgress = Math.round((totalCompletedSubtasks / totalSubtasks) * 100) || 0;

  // Situational Counts for Operator Awareness
  const priorityMetrics = useMemo(() => {
    let criticalCount = 0;
    let delayedCount = 0;
    let normalCount = 0;
    let sealedCount = 0;

    activeStreams.forEach(st => {
      const p = getEffectivePriority(st, activeConflict);
      if (p === 'CRITICAL') criticalCount++;
      else if (p === 'DELAYED') delayedCount++;
      else if (p === 'SEALED') sealedCount++;
      else normalCount++;
    });

    return { criticalCount, delayedCount, normalCount, sealedCount };
  }, [activeStreams, activeConflict]);

  // Smart Sort: Automatically reorganizes tasks based on priority (Critical -> Delayed -> Normal -> Sealed)
  const sortedStreams = useMemo(() => {
    if (!smartSortEnabled) return activeStreams;

    return [...activeStreams].sort((a, b) => {
      const pA = getEffectivePriority(a, activeConflict);
      const pB = getEffectivePriority(b, activeConflict);

      const priorityWeight: Record<TaskPriority, number> = {
        CRITICAL: 0,
        DELAYED: 1,
        NORMAL: 2,
        SEALED: 3
      };

      if (priorityWeight[pA] !== priorityWeight[pB]) {
        return priorityWeight[pA] - priorityWeight[pB];
      }

      // Within the same priority group, sort by lowest progress first
      return a.progress - b.progress;
    });
  }, [activeStreams, smartSortEnabled, activeConflict]);

  const handleAccelerateSwarm = () => {
    setActiveStreams(prev =>
      prev.map(st => {
        const nextProg = Math.min(100, st.progress + 15);
        const subtasksCount = st.subtasks?.length || 3;
        const nextSubtasks = (st.subtasks || []).map((sub, idx) => {
          const threshold = ((idx + 1) / subtasksCount) * 100;
          return {
            ...sub,
            completed: nextProg >= threshold || sub.completed
          };
        });
        const completedCount = nextSubtasks.filter(s => s.completed).length;

        return {
          ...st,
          subtasks: nextSubtasks,
          progress: nextProg,
          completedTasks: Math.max(completedCount, Math.min(st.totalTasks, Math.floor((nextProg / 100) * st.totalTasks))),
          priority: nextProg >= 100 ? 'SEALED' : (st.priority === 'DELAYED' && nextProg >= 75 ? 'NORMAL' : st.priority),
          status: nextProg === 100 ? 'PASS_Z3' : 'ACTIVE_EXEC'
        };
      })
    );
    setCliHistory(prev => [
      ...prev,
      { text: '[SWARM_ACCELERATOR]: Boosted all Knight compilation streams by +15% completion velocity.', sender: 'MERLIN', type: 'knight' }
    ]);
    onNotify?.('Swarm velocity accelerated! Multi-cursor task queues advanced.', 'success');
  };

  const handleResetTasks = () => {
    setActiveStreams(prev =>
      prev.map(st => {
        const resetSubtasks = (st.subtasks || []).map((sub, idx) => ({
          ...sub,
          completed: idx === 0
        }));
        return {
          ...st,
          subtasks: resetSubtasks,
          progress: Math.floor(Math.random() * 25) + 30,
          completedTasks: 1,
          priority: st.id === 'stream-galahad' ? 'CRITICAL' : (st.id === 'stream-animator' ? 'DELAYED' : 'NORMAL'),
          status: 'ACTIVE_EXEC'
        };
      })
    );
    setCliHistory(prev => [
      ...prev,
      { text: '[TASK_RESET]: Initialized fresh task wave across 5 Knight personas with color-coded situational priorities.', sender: 'KERNEL', type: 'output' }
    ]);
    onNotify?.('Task progression wave reset for fresh execution cycle.', 'warning');
  };

  const handleAdvanceKnightTask = (streamId: string) => {
    setActiveStreams(prev =>
      prev.map(st => {
        if (st.id !== streamId) return st;
        const nextProgress = Math.min(100, st.progress + 20);
        const uncompletedIndex = (st.subtasks || []).findIndex(s => !s.completed);
        const nextSubtasks = (st.subtasks || []).map((sub, idx) =>
          idx === uncompletedIndex ? { ...sub, completed: true } : sub
        );
        const completedCount = nextSubtasks.filter(s => s.completed).length;
        const nextCompleted = Math.min(st.totalTasks, Math.max(completedCount, st.completedTasks + 1));
        const nextPriority = nextProgress >= 100 ? 'SEALED' : (st.priority === 'DELAYED' && nextProgress >= 75 ? 'NORMAL' : st.priority);
        return {
          ...st,
          subtasks: nextSubtasks,
          progress: nextProgress,
          completedTasks: nextCompleted,
          priority: nextPriority,
          status: nextProgress === 100 ? 'PASS_Z3' : 'ACTIVE_EXEC'
        };
      })
    );
    onNotify?.(`Advanced task completion for stream [${streamId}]`, 'success');
  };

  const handleToggleSubtask = (streamId: string, subtaskId: string) => {
    setActiveStreams(prev =>
      prev.map(st => {
        if (st.id !== streamId) return st;
        const nextSubtasks = (st.subtasks || []).map(sub =>
          sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
        );
        const completedCount = nextSubtasks.filter(s => s.completed).length;
        const progress = Math.round((completedCount / (nextSubtasks.length || 1)) * 100);
        const isSealed = progress >= 100;
        const nextPriority = isSealed ? 'SEALED' : (st.priority === 'SEALED' ? 'NORMAL' : st.priority);
        const toggled = nextSubtasks.find(s => s.id === subtaskId);

        onNotify?.(
          toggled?.completed
            ? `✓ Completed task: "${toggled.title}"`
            : `Task reopened: "${toggled?.title}"`,
          toggled?.completed ? 'success' : 'warning'
        );

        return {
          ...st,
          subtasks: nextSubtasks,
          completedTasks: completedCount,
          progress,
          priority: nextPriority,
          status: isSealed ? 'PASS_Z3' : 'ACTIVE_EXEC'
        };
      })
    );
  };

  const handleCyclePriority = (streamId: string) => {
    setActiveStreams(prev =>
      prev.map(st => {
        if (st.id !== streamId) return st;
        const current = st.priority || 'NORMAL';
        const next: TaskPriority = 
          current === 'NORMAL' ? 'CRITICAL' :
          current === 'CRITICAL' ? 'DELAYED' :
          current === 'DELAYED' ? 'NORMAL' : 'CRITICAL';
        
        onNotify?.(`Manually set ${st.knight} stream priority to [${next}]`, next === 'CRITICAL' ? 'warning' : 'success');
        return {
          ...st,
          priority: next
        };
      })
    );
  };

  const handleDownloadProvenanceLog = () => {
    const timestampIso = new Date().toISOString();
    const sessionId = `PROV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const provenanceReport = {
      forgeMetadata: {
        system: 'Arthurian Omni-Digital Forge // Camelot-OS',
        kernelVersion: 'v3.4.1 (ARM64_Wasmtime)',
        runtime: 'WasmBridge IPC / Zero-Ambient Sandbox',
        sessionId,
        exportTimestamp: timestampIso,
        operator: 'Vizion (System Architect)'
      },
      swarmExecutionTelemetry: {
        compositeProgress: `${compositeProgress}%`,
        totalSubtasks,
        totalCompletedSubtasks,
        isCompiling,
        autoProgressEnabled,
        smartSortEnabled,
        tokenVelocity: '120k tokens/s',
        situationalPriorityDiagnostics: {
          criticalTasks: priorityMetrics.criticalCount,
          delayedTasks: priorityMetrics.delayedCount,
          onTrackTasks: priorityMetrics.normalCount,
          sealedTasks: priorityMetrics.sealedCount
        },
        taskCategorizationDistribution: categoryMetrics
      },
      crucibleStatus: {
        panicDetected: crucibleStatus.panicDetected,
        panicDescription: crucibleStatus.panicDesc || 'None (System Nominal)',
        patchedBy: crucibleStatus.patchedBy || 'None Required',
        verificationStatus: crucibleStatus.status
      },
      activeConflictTelemetry: activeConflict ? {
        targetFile: activeConflict.targetFile,
        resolved: activeConflict.resolved,
        lancelotProposal: activeConflict.lancelotProp,
        galahadProposal: activeConflict.galahadProp
      } : {
        status: 'NO_ACTIVE_CONFLICTS',
        branchCollisionState: 'CONVERGED_LOCKED'
      },
      activeKnightStreams: activeStreams.map(stream => ({
        id: stream.id,
        knight: stream.knight,
        title: stream.title,
        role: stream.role,
        status: stream.status,
        effectivePriority: getEffectivePriority(stream, activeConflict),
        progressPercentage: `${stream.progress}%`,
        activeTask: stream.activeTask,
        completedTasks: `${stream.completedTasks}/${stream.totalTasks}`,
        lineCount: stream.lineCount,
        codeSnippetPreview: stream.codeSnippet
      })),
      sessionActivityLog: cliHistory.map((entry, idx) => ({
        sequenceId: idx + 1,
        sender: entry.sender,
        type: entry.type,
        message: entry.text
      })),
      gideonLevel5Attestation: {
        z3FormalProofStatus: 'PASS_SATISFIABLE',
        falsificationArchetypes: '5/5_VERIFIED',
        zeroEntropyInvariant: 'HELD',
        attestationHash: `0x${Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b => b.toString(16).padStart(2, '0')).join('')}`
      }
    };

    const jsonString = JSON.stringify(provenanceReport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    const safeDate = timestampIso.replace(/[:.]/g, '-');
    downloadAnchor.href = url;
    downloadAnchor.download = `camelot-swarm-provenance-${safeDate}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);

    setCliHistory(prev => [
      ...prev,
      {
        text: `[PROVENANCE_AUDIT]: Exported session activity provenance log (${downloadAnchor.download}) with cryptographically verifiable telemetry.`,
        sender: 'KERNEL',
        type: 'output'
      }
    ]);
    onNotify?.(`Provenance log downloaded successfully: ${downloadAnchor.download}`, 'success');
  };

  const handleRunCommand = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cmd = cliInput.trim();
    if (!cmd) return;

    setCliHistory(prev => [...prev, { text: `> ${cmd}`, sender: 'USER_VIZION', type: 'cmd' }]);
    setCliInput('');

    if (cmd === 'forge:build' || cmd === 'build') {
      setIsCompiling(true);
      setActiveStreams(prev =>
        prev.map(st => ({
          ...st,
          status: 'ACTIVE_EXEC',
          progress: Math.max(st.progress, 85)
        }))
      );

      setCliHistory(prev => [
        ...prev,
        { text: '[COMPILER]: Invoking esbuild + ARM64 MicroVM JIT container...', sender: 'MERLIN', type: 'knight' }
      ]);
      setTimeout(() => {
        setIsCompiling(false);
        setActiveStreams(prev =>
          prev.map(st => ({
            ...st,
            subtasks: (st.subtasks || []).map(sub => ({ ...sub, completed: true })),
            progress: 100,
            completedTasks: st.totalTasks,
            priority: 'SEALED',
            status: 'PASS_Z3'
          }))
        );
        setCliHistory(prev => [
          ...prev,
          { text: '[COMPILER]: Output bundle built in 14.2ms. Zero TypeScript diagnostics errors.', sender: 'LANCELOT', type: 'knight' },
          { text: 'Global Compilation Telemetry: 100% Pass Rate | All streams SEALED [GREEN]', sender: 'KERNEL', type: 'output' }
        ]);
        onNotify?.('HiveIDE Swarm build succeeded with 100% pass rate & all tasks completed!', 'success');
      }, 900);
    } else if (cmd === 'test:gideon' || cmd === 'test') {
      setCrucibleStatus({
        panicDetected: true,
        panicDesc: 'Z3 Memory Leak Invariant warning in VFS Ephemeral Worktree #42',
        patchedBy: 'Knight Galahad',
        status: 'SUCCESS'
      });
      setActiveStreams(prev =>
        prev.map(st =>
          st.knight === 'GIDEON'
            ? { ...st, progress: 100, status: 'PASS_Z3', priority: 'SEALED', activeTask: 'Gideon Level 5: Fuzzing Passed (0 Regressions)' }
            : st
        )
      );
      setCliHistory(prev => [
        ...prev,
        { text: '[GIDEON_ALERT]: Panic detected: Invariant race condition in tenant worktree #42', sender: 'GIDEON', type: 'error' },
        { text: '[CRUCIBLE_PATCH]: Knight Galahad automatically applied memory clamp mutex (commit #9df4a2)', sender: 'GALAHAD', type: 'knight' },
        { text: '[CRUCIBLE_VERIFIED]: Re-test passed. Status: GREEN.', sender: 'KERNEL', type: 'output' }
      ]);
      onNotify?.('Auto-Crucible resolved panic with automatic patch #9df4a2', 'success');
    } else if (cmd === 'arbitrate:conflict' || cmd === 'conflict') {
      setActiveConflict({
        targetFile: 'src/core/StateEngine.ts',
        lancelotProp: 'export const cacheStrategy = "HYDRATED_SESSION_STORAGE";',
        galahadProp: 'export const cacheStrategy = "ENCRYPTED_SENTINEL_IPC";',
        resolved: false
      });
      setCliHistory(prev => [
        ...prev,
        { text: '[COLLISION_PANEL]: Multi-cursor overlap detected on src/core/StateEngine.ts (Marked CRITICAL)', sender: 'MERLIN', type: 'error' },
        { text: 'Awaiting Operator Voice/UI override in Collision Debate Panel...', sender: 'KERNEL', type: 'output' }
      ]);
      onNotify?.('🚨 Critical Branch Collision detected! Task borders elevated to glowing red.', 'warning');
    } else if (cmd === '//evolve' || cmd === 'evolve' || cmd === 'initiate //evolve') {
      setCliHistory(prev => [
        ...prev,
        { text: '[QUANTUM_ASCENSION]: Invoking Omni-Evolution Matrix (Tier V2000 Singularity)...', sender: 'MERLIN', type: 'knight' },
        { text: '[KERNEL]: Opening Holographic Evolution Chassis for Operator Authorization.', sender: 'KERNEL', type: 'output' }
      ]);
      onTriggerEvolve?.();
      onNotify?.('Evolution Matrix opened via CLI command!', 'success');
    } else if (cmd === 'provenance:log' || cmd === 'export:provenance' || cmd === 'provenance' || cmd === 'download:log') {
      handleDownloadProvenanceLog();
    } else if (cmd === 'clear') {
      setCliHistory([]);
    } else {
      setCliHistory(prev => [
        ...prev,
        { text: `[EXEC_CLI]: Command "${cmd}" queued into Knight Merlin's task DAG.`, sender: 'MERLIN', type: 'output' }
      ]);
    }
  };

  const resolveConflict = (winner: 'LANCELOT' | 'GALAHAD') => {
    setActiveConflict(prev => prev ? { ...prev, resolved: true } : null);
    setCliHistory(prev => [
      ...prev,
      { text: `[ARBITRATION_LOCKED]: Operator selected ${winner}'s implementation proposal. DAG reconciled.`, sender: 'MERLIN', type: 'knight' }
    ]);
    onNotify?.(`Conflict resolved. Adopted ${winner}'s branch.`, 'success');
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Top Banner with Quick Settings & Smart Sort Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#101018] border border-[#252538] rounded-xl shadow-inner">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#10B981]/10 border border-[#10B981]/40 rounded-lg text-[#10B981]">
            <Terminal size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-white">Agentic HiveIDE • Swarm Coding Matrix</h2>
              <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                ARM64_VFS_ONLINE
              </span>
              <span className="text-[9px] bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 px-2 py-0.5 rounded font-bold">
                {compositeProgress}% SWARM COMPLETE
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Multi-cursor thermal execution matrix, dynamic task progress telemetry & interactive CLI harness
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* APEX Reforged Architecture Toggle */}
          <button
            id="btn-toggle-apex-spec"
            onClick={() => {
              const next = activeHiveView === 'HIVE_MELEE' ? 'APEX_SPEC' : 'HIVE_MELEE';
              setActiveHiveView(next);
              onNotify?.(
                next === 'APEX_SPEC'
                  ? '🏛️ APEX Omni-Nexus v0.1.0 Reforged Architecture Studio engaged.'
                  : '⚔️ Live HiveIDE Multi-Cursor Swarm Coding Matrix engaged.',
                'success'
              );
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeHiveView === 'APEX_SPEC'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-black border-[#D4AF37] shadow-[0_0_18px_rgba(212,175,55,0.5)]'
                : 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/50 hover:bg-[#D4AF37]/25 shadow-[0_0_10px_rgba(212,175,55,0.2)]'
            }`}
            title="Toggle APEX Omni-Nexus v0.1.0 Reforged Architecture Studio"
          >
            <Layers size={13} className={activeHiveView === 'APEX_SPEC' ? 'text-black' : 'text-[#D4AF37] animate-pulse'} />
            <span>{activeHiveView === 'APEX_SPEC' ? 'APEX Architecture (Active)' : 'APEX Reforged Spec'}</span>
          </button>

          {/* Smart Sort Toggle in Hive IDE Swarm Header */}
          <button
            onClick={() => {
              const next = !smartSortEnabled;
              setSmartSortEnabled(next);
              onNotify?.(
                next 
                  ? '⚡ Smart Sort Enabled: Active, Critical & Blocked tasks prioritized to top.' 
                  : 'Default Order: Standard architectural stream order restored.', 
                'success'
              );
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
              smartSortEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/80 shadow-[0_0_14px_rgba(245,158,11,0.3)]'
                : 'bg-[#161624] text-gray-400 border-[#262638] hover:text-gray-200 hover:border-gray-600'
            }`}
            title="Smart Sort: Automatically prioritizes critical & active execution tasks to the top"
          >
            <ArrowUpDown size={13} className={smartSortEnabled ? 'text-amber-400 animate-pulse' : 'text-gray-400'} />
            <span>Smart Sort {smartSortEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Voice-to-Task Capture Button */}
          <button
            id="btn-voice-task-capture"
            onClick={() => {
              if (isListeningVoice) {
                stopVoiceTaskListening();
              } else {
                startVoiceTaskListening();
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
              isListeningVoice
                ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.6)] animate-pulse'
                : isVoiceCaptureOpen
                ? 'bg-[#10B981]/25 text-[#10B981] border-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40 hover:bg-[#00F0FF]/25 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
            }`}
            title="Voice-to-Task Capture: Say 'Add task [task name] with [priority]' to inject dynamically into swarm"
          >
            {isListeningVoice ? <MicOff size={13} className="animate-bounce" /> : <Mic size={13} className="text-[#00F0FF]" />}
            <span>{isListeningVoice ? 'Listening...' : 'Voice Task'}</span>
          </button>

          {/* Download Provenance Log Button */}
          <button
            onClick={handleDownloadProvenanceLog}
            className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/25 hover:border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.2)] transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download Provenance Log: Export cryptographically signed JSON summarizing current swarm activity history"
          >
            <Download size={13} className="text-[#D4AF37]" />
            <span className="hidden sm:inline">Provenance Log</span>
            <span className="sm:hidden">Log</span>
          </button>

          <button
            onClick={handleAccelerateSwarm}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/25 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Accelerate Swarm Completion Velocity"
          >
            <FastForward size={13} />
            <span className="hidden sm:inline">Boost</span>
          </button>

          <button
            onClick={() => handleRunCommand({ preventDefault: () => {} } as any)}
            disabled={isCompiling}
            className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-400 text-emerald-300 hover:bg-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)]"
          >
            <Play size={13} className={isCompiling ? 'animate-spin' : ''} />
            <span>{isCompiling ? 'Compiling...' : 'Run Swarm'}</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-[#181826] border border-[#2A2A40] text-gray-300 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all cursor-pointer"
            title="Configure HiveIDE Swarm Settings"
          >
            <Settings size={15} />
          </button>
        </div>
      </div>

      {activeHiveView === 'APEX_SPEC' ? (
        <ApexReforgedArchitectureStudio
          onNotify={onNotify}
          onBackToIDE={() => setActiveHiveView('HIVE_MELEE')}
        />
      ) : (
        <>
          {/* Composite Swarm Task Progress Dashboard Ribbon */}
          <div className="p-3.5 bg-[#0C0D16] border-2 border-[#1E1E30] rounded-xl space-y-2.5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <BarChart3 size={15} className="text-[#00F0FF]" />
            <span className="font-black text-white uppercase tracking-wider">
              Composite Swarm Task Completion Status
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              ({totalCompletedSubtasks} / {totalSubtasks} Sub-tasks Sealed)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-[11px] font-black text-[#D4AF37]">
              Velocity: 120k tokens/s
            </span>
            <span className={`text-[11px] font-black px-2 py-0.5 rounded border ${
              compositeProgress >= 90
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
            }`}>
              {compositeProgress}% COMPLETE
            </span>
          </div>
        </div>

        {/* Global Master Multi-Knight Progress Bar */}
        <div className="w-full bg-[#08080E] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#2A2A42] flex items-center relative shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${compositeProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-[#00F0FF] via-[#D4AF37] to-[#10B981] shadow-[0_0_12px_rgba(0,240,255,0.6)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </motion.div>
        </div>

        {/* Knight Task Segment Micro-Tags */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px]">
          <div className="flex flex-wrap items-center gap-3">
            {activeStreams.map(st => (
              <div key={st.id} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                <span className="text-gray-400 font-bold">{st.knight}:</span>
                <span className="text-white font-mono font-bold">{st.progress}%</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoProgressEnabled(!autoProgressEnabled)}
              className={`text-[9px] px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                autoProgressEnabled
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {autoProgressEnabled ? '● Live Telemetry Active' : '○ Telemetry Paused'}
            </button>

            <button
              onClick={handleResetTasks}
              className="text-[9px] text-gray-400 hover:text-white px-2 py-0.5 rounded bg-[#161622] hover:bg-[#222234] border border-[#28283C] cursor-pointer"
            >
              Reset Wave
            </button>
          </div>
        </div>
      </div>

      {/* Voice-to-Task Capture Dynamic Micro-HUD Drawer */}
      <AnimatePresence>
        {(isVoiceCaptureOpen || isListeningVoice) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-r from-[#0C151B] via-[#0F1C1B] to-[#0C151B] border-2 border-[#00F0FF]/60 rounded-xl space-y-3 shadow-[0_0_30px_rgba(0,240,255,0.25)] relative">
              {/* Top status bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border flex items-center justify-center ${
                    isListeningVoice
                      ? 'bg-rose-950 border-rose-500 text-rose-400 animate-pulse'
                      : 'bg-cyan-950 border-cyan-500 text-cyan-300'
                  }`}>
                    {isListeningVoice ? <Mic size={15} className="animate-bounce" /> : <Volume2 size={15} />}
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-2">
                      <span>VOICE-TO-TASK CAPTURE ENGINE</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-mono font-bold">
                        NATURAL LANGUAGE PATTERN MATCHER
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Say <code className="text-[#00F0FF] bg-black/40 px-1 py-0.5 rounded font-mono">"Add task [task name] with [priority]"</code> to instantly inject tasks into the Knight Swarm.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenVoiceHUD && (
                    <button
                      onClick={onOpenVoiceHUD}
                      className="text-[10px] bg-[#141424] hover:bg-[#1E1E34] border border-[#2B2B44] text-[#D4AF37] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      title="Open full Spatial Voice HUD"
                    >
                      <Sparkles size={11} className="text-[#00F0FF]" />
                      <span>Spatial Voice HUD</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      stopVoiceTaskListening();
                      setIsVoiceCaptureOpen(false);
                    }}
                    className="p-1 rounded-lg bg-[#181824] border border-[#28283C] text-gray-400 hover:text-white cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Interactive Audio Wave & Real-time Command Bar */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-8 flex items-center gap-2">
                  <button
                    onClick={isListeningVoice ? stopVoiceTaskListening : startVoiceTaskListening}
                    className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                      isListeningVoice
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] animate-pulse'
                        : 'bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-black hover:scale-[1.02] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    }`}
                  >
                    {isListeningVoice ? (
                      <>
                        <MicOff size={14} />
                        <span>Stop Mic</span>
                      </>
                    ) : (
                      <>
                        <Mic size={14} />
                        <span>Start Mic</span>
                      </>
                    )}
                  </button>

                  {/* Waveform visualizer */}
                  <div className="flex items-center gap-1 h-9 bg-black/60 px-3 rounded-xl border border-[#252538] shrink-0">
                    {[20, 45, 75, 95, 60, 40, 80, 50, 30, 15].map((base, idx) => {
                      const h = isListeningVoice ? Math.min(100, Math.max(20, base * (voiceAudioLevel / 45))) : 20;
                      return (
                        <div
                          key={idx}
                          className={`w-1 rounded-full transition-all duration-75 ${
                            isListeningVoice ? 'bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]' : 'bg-gray-700'
                          }`}
                          style={{ height: `${h}%` }}
                        />
                      );
                    })}
                  </div>

                  {/* Command Input Box */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={voiceTaskTranscript + (voiceTaskInterim ? ` ${voiceTaskInterim}` : '')}
                      onChange={(e) => setVoiceTaskTranscript(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleExecuteVoiceTaskInput();
                        }
                      }}
                      placeholder='Say or type: "Add [refactor|debug|deploy] task [name] with [priority]"...'
                      className="w-full bg-[#070B0E] border border-[#263540] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] font-mono"
                    />
                    {voiceTaskInterim && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#00F0FF] font-bold animate-pulse">
                        Transcribing...
                      </span>
                    )}
                  </div>
                </div>

                <div className="md:col-span-4 flex items-center gap-2 justify-end">
                  <button
                    onClick={() => handleExecuteVoiceTaskInput()}
                    disabled={!voiceTaskTranscript.trim()}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer w-full md:w-auto justify-center ${
                      voiceTaskTranscript.trim()
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:scale-[1.02] shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                    }`}
                  >
                    <Plus size={14} />
                    <span>Inject Task</span>
                  </button>
                </div>
              </div>

              {/* Explicit Category Selection Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#1C2030]/60">
                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1 mr-1">
                  <Tag size={11} className="text-cyan-400" /> Default Task Category:
                </span>
                {ALL_CATEGORIES.map((cat) => {
                  const cfg = CATEGORY_CONFIGS[cat];
                  const Icon = cfg.icon;
                  const isSelected = manualSelectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setManualSelectedCategory(cat)}
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? `${cfg.badgeClass} ${cfg.glowClass} ring-1 ring-white/20 scale-105`
                          : 'bg-[#0E1018] text-gray-400 border-[#222636] hover:text-gray-200 hover:border-gray-600'
                      }`}
                    >
                      <Icon size={10} style={{ color: cfg.textColor }} />
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Intent Parser Live Feedback */}
              {currentParsedPreview && (
                <div className="p-2.5 bg-[#07110C] rounded-lg border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <CheckSquare size={14} className="text-emerald-400" />
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Detected Task:</span>
                    <strong className="text-white font-sans text-xs">"{currentParsedPreview.taskTitle}"</strong>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="text-gray-400">Category:</span>
                    <TaskCategoryTag category={currentParsedPreview.category || manualSelectedCategory} size="sm" />

                    <span className="text-gray-400 ml-1">Target Knight:</span>
                    <strong className="text-[#00F0FF] font-bold">[{currentParsedPreview.targetKnight}]</strong>
                    
                    <span className="text-gray-400 ml-1">Priority:</span>
                    <span className={`px-2 py-0.5 rounded font-black border ${
                      currentParsedPreview.priority === 'CRITICAL'
                        ? 'bg-red-950 text-red-300 border-red-500/60'
                        : currentParsedPreview.priority === 'DELAYED'
                        ? 'bg-amber-950 text-amber-300 border-amber-500/60'
                        : currentParsedPreview.priority === 'SEALED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                        : 'bg-cyan-950 text-cyan-300 border-cyan-500/60'
                    }`}>
                      {currentParsedPreview.priority}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Spoken Command Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1 mr-1">
                  <Zap size={11} className="text-[#D4AF37]" /> One-Click Voice Task Presets:
                </span>
                {[
                  { text: 'Sort Hive tasks', label: '⚡ Action: Sort Hive Tasks [Prioritize Critical]' },
                  { text: 'Add refactor task "Synthesize Open-Design token shaders" with critical', label: 'Refactor: Token Shaders [Critical]' },
                  { text: 'Add debug task "Resolve Sentinel lease lock contention" with critical', label: 'Debug: Lock Contention [Critical]' },
                  { text: 'Add deploy task "Deploy Wasmtime sandbox micro-frontend bundle" with high', label: 'Deploy: MFE Bundle [High]' },
                  { text: 'Add security task "Run zero-entropy race condition audit" with normal', label: 'Security: Zero-Entropy [Normal]' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExecuteVoiceTaskInput(item.text)}
                    className={`text-[10px] border px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      item.text === 'Sort Hive tasks'
                        ? 'bg-indigo-950/80 hover:bg-indigo-900 border-indigo-500/60 text-indigo-200 hover:text-white shadow-[0_0_8px_rgba(99,102,241,0.3)] font-bold'
                        : 'bg-[#121622] hover:bg-[#1A2234] border-[#222E42] hover:border-[#00F0FF] text-gray-300 hover:text-white'
                    }`}
                  >
                    "{item.label}"
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Multi-Cursor Streams (Left) + Interactive CLI & Crucible (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Multicursor Thermal Streams (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Header with Situational Awareness Legend Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-gray-300 flex items-center gap-1.5">
                <Cpu size={14} className="text-[#00F0FF]" /> Multicursor Thermal Matrix ({sortedStreams.length} Active Knights)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSmartSortEnabled(!smartSortEnabled)}
                className="text-[10px] text-gray-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="Toggle Smart Sort ranking"
              >
                <ArrowUpDown size={11} className={smartSortEnabled ? 'text-amber-400' : 'text-gray-500'} />
                <span>{smartSortEnabled ? 'Sort: Priority First' : 'Sort: Default'}</span>
              </button>
              <span className="text-[10px] text-gray-500 font-mono">CONCURRENT_EXEC: 120k/s</span>
            </div>
          </div>

          {/* Interactive Task Category Filter Bar */}
          <div className="px-3 py-2 bg-[#0A0C14] border border-[#1E2436] rounded-xl flex flex-wrap items-center justify-between gap-2 text-[10px]">
            <div className="flex items-center gap-1.5 text-gray-300">
              <Filter size={12} className="text-[#00F0FF]" />
              <span className="font-bold uppercase tracking-wider text-gray-200">Filter By Category:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('ALL')}
                className={`px-2 py-0.5 rounded-md font-mono font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                  selectedCategoryFilter === 'ALL'
                    ? 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/60 shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                    : 'bg-[#121420] text-gray-400 border-[#222638] hover:text-gray-200'
                }`}
              >
                <span>ALL</span>
                <span className="text-[9px] opacity-75">({categoryMetrics.ALL || 0})</span>
              </button>

              {ALL_CATEGORIES.map((cat) => {
                const cfg = CATEGORY_CONFIGS[cat];
                const Icon = cfg.icon;
                const isSelected = selectedCategoryFilter === cat;
                const count = categoryMetrics[cat] || 0;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded-md font-mono font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? `${cfg.badgeClass} ${cfg.glowClass} ring-1 ring-white/20`
                        : 'bg-[#121420] text-gray-400 border-[#222638] hover:text-gray-200'
                    }`}
                  >
                    <Icon size={10} style={{ color: cfg.textColor }} />
                    <span>{cfg.label}</span>
                    <span className="text-[9px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Automated Situational Awareness Indicator Bar */}
          <div className="px-3 py-2 bg-[#090A10] border border-[#202034] rounded-lg flex flex-wrap items-center justify-between gap-2 text-[10px]">
            <div className="flex items-center gap-1.5 text-gray-400">
              <ShieldAlert size={12} className="text-amber-400" />
              <span className="font-bold text-gray-300 uppercase tracking-wider">Situational Border Diagnostics:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Critical Indicator */}
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
                <span className="text-red-400 font-bold font-mono">CRITICAL: {priorityMetrics.criticalCount}</span>
                <span className="text-[9px] text-red-500/80">(Red Glow)</span>
              </div>

              {/* Delayed Indicator */}
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
                <span className="text-amber-400 font-bold font-mono">DELAYED: {priorityMetrics.delayedCount}</span>
                <span className="text-[9px] text-amber-500/80">(Amber Glow)</span>
              </div>

              {/* Normal / On Track Indicator */}
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="text-cyan-300 font-bold font-mono">ON TRACK: {priorityMetrics.normalCount}</span>
              </div>

              {/* Sealed Indicator */}
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-bold font-mono">SEALED: {priorityMetrics.sealedCount}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1 custom-scroll">
            {sortedStreams.map((stream, idx) => {
              const effectivePriority = getEffectivePriority(stream, activeConflict);
              const isCritical = effectivePriority === 'CRITICAL';
              const isDelayed = effectivePriority === 'DELAYED';
              const isSealed = effectivePriority === 'SEALED';
              const isBlocked = (activeConflict && !activeConflict.resolved && (stream.knight === 'LANCELOT' || stream.knight === 'GALAHAD')) || stream.status === 'PANIC_PATCHING';

              const isHighlighted = highlightedStreamId === stream.id;

              // Determine border styling based on automated priority & injection highlight
              const borderClasses = isHighlighted
                ? 'border-2 border-[#00F0FF] shadow-[0_0_35px_rgba(0,240,255,0.75)] ring-2 ring-[#00F0FF]/80 bg-gradient-to-b from-[#0A1820] to-[#0C0C14] animate-pulse'
                : isCritical
                ? 'border-2 border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.55)] ring-1 ring-red-500/60 bg-gradient-to-b from-[#180A0A] to-[#0C0C14]'
                : isDelayed
                ? 'border-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.45)] ring-1 ring-amber-500/50 bg-gradient-to-b from-[#161208] to-[#0C0C14]'
                : isSealed
                ? 'border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)] bg-[#0C0C14]'
                : 'border border-[#252538] hover:border-gray-500 bg-[#0C0C14]';

              return (
                <motion.div
                  layout
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  key={stream.id}
                  className={`rounded-xl overflow-hidden transition-all duration-300 relative ${borderClasses}`}
                >
                  {/* Glowing Edge Indicator for Immediate Situational Awareness */}
                  {isHighlighted && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#00F0FF] via-white to-[#00F0FF] animate-pulse shadow-[0_0_15px_#00F0FF]" />
                  )}
                  {isCritical && !isHighlighted && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-600 via-red-400 to-red-600 animate-pulse shadow-[0_0_10px_#EF4444]" />
                  )}
                  {isDelayed && !isHighlighted && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 animate-pulse shadow-[0_0_10px_#F59E0B]" />
                  )}

                  {/* Stream Header */}
                  <div className={`px-3.5 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 text-xs ${
                    isHighlighted ? 'bg-[#0E202A] border-[#00F0FF]/60' :
                    isCritical ? 'bg-[#1C0D0D] border-red-500/40' :
                    isDelayed ? 'bg-[#1C160B] border-amber-500/40' :
                    'bg-[#12121C] border-[#202030]'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${isHighlighted || isCritical || isDelayed ? 'animate-ping' : 'animate-pulse'}`}
                        style={{ 
                          backgroundColor: isHighlighted ? '#00F0FF' : isCritical ? '#EF4444' : isDelayed ? '#F59E0B' : stream.color,
                          boxShadow: isHighlighted ? '0 0 12px #00F0FF' : isCritical ? '0 0 10px #EF4444' : isDelayed ? '0 0 10px #F59E0B' : 'none'
                        }}
                      />
                      <strong 
                        style={{ color: isHighlighted ? '#00F0FF' : isCritical ? '#EF4444' : isDelayed ? '#F59E0B' : stream.color }} 
                        className="font-bold uppercase tracking-wider"
                      >
                        [{stream.knight}]
                      </strong>
                      <span className="text-gray-200 font-bold">{stream.title}</span>

                      {/* Primary Stream Category Tag */}
                      <TaskCategoryTag
                        category={stream.category || 'FEATURE'}
                        interactive={true}
                        size="xs"
                        onCycle={() => handleCycleStreamCategory(stream.id)}
                      />

                      {/* Injected Task Callout */}
                      {isHighlighted && (
                        <span className="text-[9px] bg-cyan-950 text-cyan-200 border border-[#00F0FF] px-2 py-0.5 rounded font-black flex items-center gap-1 shadow-[0_0_12px_rgba(0,240,255,0.6)] animate-bounce">
                          <Sparkles size={11} className="text-[#00F0FF]" />
                          VOICE INJECTED
                        </span>
                      )}

                      {/* Automated Situational Priority Badge */}
                      {isCritical ? (
                        <span className="text-[9px] bg-red-950 text-red-300 border border-red-500 px-2 py-0.5 rounded font-black flex items-center gap-1 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse">
                          <AlertOctagon size={11} className="text-red-400" />
                          CRITICAL PRIORITY
                        </span>
                      ) : isDelayed ? (
                        <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-500 px-2 py-0.5 rounded font-black flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                          <Clock size={11} className="text-amber-400 animate-spin" />
                          DELAYED (VELOCITY LAG)
                        </span>
                      ) : isSealed ? (
                        <span className="text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                          <CheckCircle2 size={11} className="text-emerald-400" />
                          SEALED
                        </span>
                      ) : (
                        <span className="text-[9px] bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-mono font-bold">
                          ON TRACK
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCyclePriority(stream.id)}
                        className="text-[9px] text-gray-400 hover:text-white px-2 py-0.5 rounded bg-[#1C1C2C] hover:bg-[#2A2A40] border border-[#303048] cursor-pointer"
                        title="Toggle manual priority override"
                      >
                        Priority: {effectivePriority}
                      </button>

                      <span className="text-[10px] text-gray-400 font-mono">
                        Task {stream.completedTasks}/{stream.totalTasks}
                      </span>

                      <span 
                        className="text-[10px] px-2 py-0.5 rounded font-mono font-bold"
                        style={{ 
                          backgroundColor: `${isCritical ? '#EF4444' : isDelayed ? '#F59E0B' : stream.color}15`, 
                          color: isCritical ? '#EF4444' : isDelayed ? '#F59E0B' : stream.color,
                          borderColor: `${isCritical ? '#EF4444' : isDelayed ? '#F59E0B' : stream.color}50`,
                          borderWidth: 1
                        }}
                      >
                        {stream.progress}%
                      </span>
                    </div>
                  </div>

                  {/* Individual Stream Dynamic Progress Bar & Active Task Tag */}
                  <div className={`px-3.5 py-2 border-b space-y-1.5 ${
                    isCritical ? 'bg-[#140808] border-red-500/20' :
                    isDelayed ? 'bg-[#140F06] border-amber-500/20' :
                    'bg-[#0E0E18] border-[#1A1A28]'
                  }`}>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-400 truncate max-w-[340px] font-sans flex items-center gap-1.5">
                        <Activity size={11} style={{ color: isCritical ? '#EF4444' : isDelayed ? '#F59E0B' : stream.color }} />
                        <strong className={isCritical ? 'text-red-300 font-bold' : isDelayed ? 'text-amber-200 font-bold' : 'text-gray-300'}>
                          {isBlocked ? (
                            '⚠️ Action Required: Sentinel lease collision in DAG'
                          ) : (
                            <AnimatedTaskLabel
                              text={stream.activeTask}
                              completed={isSealed}
                              lineColor="#10B981"
                            />
                          )}
                        </strong>
                      </span>
                      <button
                        onClick={() => handleAdvanceKnightTask(stream.id)}
                        className={`text-[9px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          isCritical
                            ? 'bg-red-950 text-red-300 border-red-600 hover:bg-red-900'
                            : isDelayed
                            ? 'bg-amber-950 text-amber-300 border-amber-600 hover:bg-amber-900'
                            : 'bg-[#181828] hover:bg-[#252538] text-gray-300 hover:text-white border-[#303048]'
                        }`}
                        title="Advance sub-task step"
                      >
                        + Step
                      </button>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-[#07070D] h-2 rounded-full overflow-hidden p-0.5 border border-[#202030]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stream.progress}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="h-full rounded-full relative"
                        style={{ 
                          backgroundColor: isCritical ? '#EF4444' : isDelayed ? '#F59E0B' : stream.color,
                          boxShadow: `0 0 10px ${isCritical ? '#EF4444' : isDelayed ? '#F59E0B' : stream.color}90` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Subtasks Execution Checklist with Categorization Tags & Animated Strike-Through */}
                  <div className="px-3.5 py-2.5 bg-[#090910] border-b border-[#1A1A28] space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                      <span className="font-bold uppercase tracking-wider flex items-center gap-1 text-gray-300">
                        <ListTodo size={11} className="text-cyan-400" />
                        <span>Execution Tasks & Verification:</span>
                      </span>
                      <span className="font-mono text-[9px] text-gray-400">
                        {stream.subtasks?.filter(s => s.completed).length || 0}/{stream.subtasks?.length || 0} Complete
                      </span>
                    </div>

                    <div className="space-y-1">
                      {stream.subtasks?.map((subtask) => {
                        const isDone = subtask.completed;
                        const subCat = subtask.category || 'FEATURE';
                        const matchesFilter = selectedCategoryFilter === 'ALL' || subCat === selectedCategoryFilter;

                        return (
                          <div
                            key={subtask.id}
                            onClick={() => handleToggleSubtask(stream.id, subtask.id)}
                            className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border transition-all duration-300 cursor-pointer group select-none ${
                              !matchesFilter
                                ? 'opacity-30 bg-[#0A0A10] border-gray-900'
                                : isDone
                                ? 'bg-[#0D1612]/60 border-emerald-500/30 opacity-60 hover:opacity-90'
                                : 'bg-[#12121A] border-[#222234] hover:border-gray-500 opacity-100'
                            }`}
                            title={isDone ? 'Task completed. Click to reopen.' : 'Click to mark task complete.'}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <button
                                type="button"
                                className={`p-0.5 rounded transition-colors ${
                                  isDone ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'
                                }`}
                              >
                                {isDone ? (
                                  <CheckSquare size={13} className="text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                ) : (
                                  <Square size={13} className="text-gray-500" />
                                )}
                              </button>

                              {/* Task Category Tag */}
                              <div onClick={(e) => e.stopPropagation()}>
                                <TaskCategoryTag
                                  category={subCat}
                                  interactive={true}
                                  size="xs"
                                  onCycle={() => handleCycleSubtaskCategory(stream.id, subtask.id)}
                                />
                              </div>

                              {/* Animated Strike-Through Label & Graceful Fade */}
                              <div className="min-w-0 flex-1 text-[11px] font-sans">
                                <AnimatedTaskLabel
                                  text={subtask.title}
                                  completed={isDone}
                                  lineColor="#10B981"
                                  className="font-medium"
                                />
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center">
                              {isDone ? (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                                  <CheckCircle2 size={9} className="text-emerald-400" />
                                  Done
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#181824] text-gray-400 border border-[#2A2A3E]">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Code Snippet */}
                  <div className="p-3 bg-[#08080C] overflow-x-auto text-[11px] font-mono text-gray-300 leading-relaxed custom-scroll">
                    <pre className="whitespace-pre">{stream.codeSnippet}</pre>
                  </div>
                </motion.div>
              );
            })}

            {/* Collision Debate Panel (When conflict exists) */}
            {activeConflict && !activeConflict.resolved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-[#181210] border-2 border-red-500 rounded-xl space-y-3 shadow-[0_0_25px_rgba(239,68,68,0.35)]"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle size={15} /> Collision Debate Panel • Target: {activeConflict.targetFile}
                  </span>
                  <span className="text-[10px] bg-red-950 text-red-300 border border-red-500/80 px-2 py-0.5 rounded font-black animate-pulse">
                    CRITICAL_ARBITRATION_REQUIRED
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-2.5 bg-[#0D0D12] border border-[#D4AF37]/40 rounded-lg space-y-1.5">
                    <span className="text-[#D4AF37] font-bold">Knight Lancelot's Proposition:</span>
                    <pre className="text-gray-300 text-[10px] bg-black/40 p-2 rounded">{activeConflict.lancelotProp}</pre>
                    <button
                      onClick={() => resolveConflict('LANCELOT')}
                      className="w-full py-1 bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] text-[10px] rounded font-bold hover:bg-[#D4AF37]/30 transition-all cursor-pointer"
                    >
                      Adopt Lancelot's Fix
                    </button>
                  </div>

                  <div className="p-2.5 bg-[#0D0D12] border border-[#10B981]/40 rounded-lg space-y-1.5">
                    <span className="text-[#10B981] font-bold">Knight Galahad's Counter-Fix:</span>
                    <pre className="text-gray-300 text-[10px] bg-black/40 p-2 rounded">{activeConflict.galahadProp}</pre>
                    <button
                      onClick={() => resolveConflict('GALAHAD')}
                      className="w-full py-1 bg-[#10B981]/20 border border-[#10B981] text-[#10B981] text-[10px] rounded font-bold hover:bg-[#10B981]/30 transition-all cursor-pointer"
                    >
                      Adopt Galahad's Fix
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive CLI Terminal + Auto-Crucible Status (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Crucible Status Card */}
          <div className="bg-[#0D0D14] border border-[#252538] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5 uppercase">
                <Flame size={14} className="text-amber-400" /> Auto-Debugging Crucible
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                {crucibleStatus.panicDetected ? 'PATCH_APPLIED' : 'STANDBY_NOMINAL'}
              </span>
            </div>

            <div className="p-2 bg-[#08080E] rounded-lg text-[11px] space-y-1 border border-[#1E1E2C]">
              {crucibleStatus.panicDetected ? (
                <>
                  <div className="text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle size={12} /> {crucibleStatus.panicDesc}
                  </div>
                  <div className="text-emerald-400 font-bold">
                    Automated Patch: {crucibleStatus.patchedBy} (Status: SUCCESS)
                  </div>
                </>
              ) : (
                <div className="text-gray-400">
                  Continuous invariant monitoring active. MicroVM self-heals test breaks under 150ms.
                </div>
              )}
            </div>
          </div>

          {/* Interactive CLI Terminal Window */}
          <div className="bg-[#0A0A10] border-2 border-[#1E1E2E] rounded-xl overflow-hidden flex flex-col h-[480px]">
            {/* Terminal Top Bar */}
            <div className="px-3 py-2 bg-[#12121A] border-b border-[#20202E] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                <span className="text-gray-400 text-[11px] font-bold ml-1">camelot-os@hive-ide:~$</span>
              </div>
              <span className="text-[9px] text-[#00F0FF] font-bold">STDIO_JSON_RPC_2.0</span>
            </div>

            {/* Terminal Stream Body */}
            <div className="p-3 overflow-y-auto flex-1 text-[11px] font-mono space-y-1.5 bg-black/70 custom-scroll">
              {cliHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    item.type === 'cmd' ? 'text-[#00F0FF] font-bold' :
                    item.type === 'knight' ? 'text-amber-300' :
                    item.type === 'error' ? 'text-red-400 font-bold' :
                    'text-gray-300'
                  }`}
                >
                  <span className="text-gray-600 mr-1.5">[{item.sender}]</span>
                  {item.text}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Quick Command Bar */}
            <div className="px-2 py-1.5 bg-[#0E0E16] border-t border-[#1C1C28] flex items-center gap-1.5 overflow-x-auto text-[10px] custom-scroll">
              <span className="text-gray-500 text-[9px] uppercase font-bold">Presets:</span>
              <button
                onClick={() => { setCliInput('//evolve'); }}
                className="px-2 py-0.5 rounded bg-[#00F0FF]/15 border border-[#00F0FF]/50 text-[#00F0FF] hover:bg-[#00F0FF]/25 cursor-pointer font-bold"
              >
                //evolve
              </button>
              <button
                onClick={() => { setCliInput('provenance:log'); }}
                className="px-2 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/25 cursor-pointer font-bold flex items-center gap-1"
                title="Export session provenance JSON log"
              >
                <Download size={10} />
                <span>provenance:log</span>
              </button>
              <button
                onClick={() => { setCliInput('forge:build'); }}
                className="px-2 py-0.5 rounded bg-[#161624] text-gray-300 hover:text-white hover:bg-[#202034] cursor-pointer"
              >
                forge:build
              </button>
              <button
                onClick={() => { setCliInput('test:gideon'); }}
                className="px-2 py-0.5 rounded bg-[#161624] text-gray-300 hover:text-white hover:bg-[#202034] cursor-pointer"
              >
                test:gideon
              </button>
              <button
                onClick={() => { setCliInput('arbitrate:conflict'); }}
                className="px-2 py-0.5 rounded bg-[#161624] text-gray-300 hover:text-white hover:bg-[#202034] cursor-pointer"
              >
                arbitrate:conflict
              </button>
              <button
                onClick={() => { setCliInput('clear'); }}
                className="px-2 py-0.5 rounded bg-[#161624] text-gray-300 hover:text-white hover:bg-[#202034] cursor-pointer"
              >
                clear
              </button>
            </div>

            {/* CLI Command Input */}
            <form onSubmit={handleRunCommand} className="p-2 bg-[#12121C] border-t border-[#20202E] flex items-center gap-2">
              <span className="text-[#00F0FF] font-bold text-xs pl-1">&gt;</span>
              <input
                type="text"
                value={cliInput}
                onChange={e => setCliInput(e.target.value)}
                placeholder="Enter CLI command or invoke Knight task..."
                className="w-full bg-transparent text-white text-xs font-mono outline-none placeholder-gray-600"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF] text-[10px] uppercase font-black rounded hover:bg-[#00F0FF]/25 transition-all cursor-pointer"
              >
                EXEC
              </button>
            </form>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
