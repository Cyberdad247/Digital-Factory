import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Shield, 
  Terminal, 
  Cpu, 
  Layers, 
  Activity, 
  Volume2, 
  Copy, 
  Check, 
  Play, 
  X, 
  Radio, 
  Zap, 
  ChevronRight,
  RefreshCw,
  Sliders,
  Send,
  CheckSquare,
  ListTodo,
  AlertOctagon,
  Clock,
  Network,
  Workflow,
  Server,
  Flame,
  Boxes,
  ArrowRight,
  Compass,
  LayoutGrid,
  ExternalLink,
  Settings,
  ArrowUpDown,
  SlidersHorizontal
} from 'lucide-react';

export type TaskPriority = 'CRITICAL' | 'DELAYED' | 'NORMAL' | 'SEALED';

export type TaskCategory = 
  | 'REFACTOR'
  | 'DEBUG'
  | 'DEPLOY'
  | 'FEATURE'
  | 'SECURITY'
  | 'TEST'
  | 'OPTIMIZE'
  | 'DOCS';

export type MainView = 
  | 'MERLIN_AGENCY' 
  | 'COGNITIVE_PLAYGROUND'
  | 'GENESIS_INTAKE'
  | 'BLUEPRINT_OS' 
  | 'HIVE_IDE' 
  | 'TOPOLOGICAL_MESH'
  | 'SWARM_COMMAND_CENTER' 
  | 'GEMINI_NEXUS' 
  | 'GOOGLE_WORKSPACE'
  | 'MCP_SERVER';

export interface ViewNavigationSpec {
  id: MainView;
  title: string;
  shortLabel: string;
  subtitle: string;
  badge: string;
  color: string;
  textColor: string;
  badgeClass: string;
  glowClass: string;
  borderClass: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  voiceKeywords: string[];
  sampleVoiceCommand: string;
  resourcePreview: string;
  instructionId: string;
}

export const VIEW_SPECS: ViewNavigationSpec[] = [
  {
    id: 'MERLIN_AGENCY',
    title: 'Merlin Strategic Agency',
    shortLabel: 'Merlin Agency',
    subtitle: 'Tier 1 Spatial Voice HUD, Cartridge Harness & Strategic Router',
    badge: 'TIER 1',
    color: '#D4AF37',
    textColor: 'text-[#D4AF37]',
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
    glowClass: 'shadow-[0_0_15px_rgba(212,175,55,0.35)]',
    borderClass: 'border-[#D4AF37]/50',
    icon: Flame,
    voiceKeywords: ['merlin', 'merlin agency', 'strategic agency', 'titan omni forge', 'titan forge', 'forge cartridge', 'home', 'tier 1', 'agency', 'titan'],
    sampleVoiceCommand: 'Switch to Merlin Agency',
    resourcePreview: '16GB RAM • 8 Cores • Router Engine',
    instructionId: 'TIER1_MERLIN_STRATEGIC_AGENCY'
  },
  {
    id: 'COGNITIVE_PLAYGROUND',
    title: 'Archmage Debate Chamber',
    shortLabel: 'Cognitive Playground',
    subtitle: 'Nine-Seat Archmage Socratic Debate, Z3 Verification & PRD Crystallizer',
    badge: 'COGNITIVE',
    color: '#A855F7',
    textColor: 'text-purple-300',
    badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
    glowClass: 'shadow-[0_0_15px_rgba(168,85,247,0.35)]',
    borderClass: 'border-purple-500/50',
    icon: Sparkles,
    voiceKeywords: ['cognitive playground', 'debate chamber', 'archmage', 'archmage council', 'brainstorm', 'socratic debate', 'debate'],
    sampleVoiceCommand: 'Switch to Cognitive Playground',
    resourcePreview: '24GB RAM • 8 Cores • Archmage LLM Swarm',
    instructionId: 'COGNITIVE_PLAYGROUND_DEBATE_CHAMBER'
  },
  {
    id: 'GENESIS_INTAKE',
    title: 'Genesis Intake Cartridge Studio',
    shortLabel: 'Genesis Intake',
    subtitle: '4-Layer Ingress Topology, 5-Stage Failure Archetype Crucible & MicroVM Sandbox',
    badge: 'GENESIS',
    color: '#F43F5E',
    textColor: 'text-rose-300',
    badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
    glowClass: 'shadow-[0_0_15px_rgba(244,63,94,0.35)]',
    borderClass: 'border-rose-500/50',
    icon: Flame,
    voiceKeywords: ['genesis', 'genesis intake', 'crucible', 'failure crucible', '5-stage crucible', 'genesis cartridge', 'intake cartridge'],
    sampleVoiceCommand: 'Switch to Genesis Intake',
    resourcePreview: '32GB RAM • 16 Cores • MicroVM Substrate',
    instructionId: 'GENESIS_INTAKE_CRUCIBLE_STUDIO'
  },
  {
    id: 'BLUEPRINT_OS',
    title: 'Blueprint OS Studio',
    shortLabel: 'Blueprint OS',
    subtitle: 'Tier 2 Holographic Specification Chassis & Exploded Dependency DAG',
    badge: 'TIER 2',
    color: '#00F0FF',
    textColor: 'text-[#00F0FF]',
    badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50',
    glowClass: 'shadow-[0_0_15px_rgba(0,240,255,0.35)]',
    borderClass: 'border-[#00F0FF]/50',
    icon: Layers,
    voiceKeywords: ['blueprint', 'blueprint os', 'specification harness', 'spec harness', 'specifications', 'chassis', 'tier 2', 'blueprint studio', 'blueprints'],
    sampleVoiceCommand: 'Switch to Blueprint OS',
    resourcePreview: '32GB RAM • 16 Cores • SMT Z3 Prover',
    instructionId: 'TIER2_BLUEPRINT_SPEC_CHASSIS'
  },
  {
    id: 'HIVE_IDE',
    title: 'Hive IDE Kinetic Melee',
    shortLabel: 'Hive IDE',
    subtitle: 'Tier 3 Multi-Cursor Thermal Matrix, Concurrent Swarms & Gideon Crucible',
    badge: 'TIER 3',
    color: '#10B981',
    textColor: 'text-emerald-400',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
    glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    borderClass: 'border-emerald-500/50',
    icon: Terminal,
    voiceKeywords: ['hive', 'hive ide', 'kinetic melee', 'multi cursor', 'thermal matrix', 'code editor', 'ide', 'swarm', 'tier 3', 'hive studio'],
    sampleVoiceCommand: 'Switch to Hive IDE',
    resourcePreview: '64GB RAM • 32 Cores • Multi-Cursor Matrix',
    instructionId: 'TIER3_HIVE_IDE_KINETIC_MELEE'
  },
  {
    id: 'TOPOLOGICAL_MESH',
    title: 'Topological Graph Mesh',
    shortLabel: 'Topological Mesh',
    subtitle: 'Interactive 3D Force-Directed Dependency Visualizer & Mesh Physics',
    badge: 'TOPOLOGY',
    color: '#3B82F6',
    textColor: 'text-blue-400',
    badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-500/50',
    glowClass: 'shadow-[0_0_15px_rgba(59,130,246,0.35)]',
    borderClass: 'border-blue-500/50',
    icon: Network,
    voiceKeywords: ['topological', 'topological mesh', 'topological graph', 'dependency graph', 'dag visualizer', 'mesh visualizer', 'force directed', 'graph mesh', 'topology', 'mesh'],
    sampleVoiceCommand: 'Switch to Topological Mesh',
    resourcePreview: '24GB RAM • 12 Cores • WebGL2 Shaders',
    instructionId: 'TOPOLOGICAL_GRAPH_MESH_V1000'
  },
  {
    id: 'SWARM_COMMAND_CENTER',
    title: 'Swarm Command Center',
    shortLabel: 'Swarm Command',
    subtitle: 'Digital Factory operator cockpit, evidence timeline, and consequential approvals',
    badge: 'EXECUTIVE',
    color: '#10B981',
    textColor: 'text-emerald-400',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
    glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    borderClass: 'border-emerald-500/50',
    icon: Workflow,
    voiceKeywords: ['swarm command', 'swarm command center', 'executive', 'digital factory', 'operator cockpit', 'evidence', 'approval'],
    sampleVoiceCommand: 'Switch to Swarm Command Center',
    resourcePreview: '12GB RAM • 8 Cores • Executive UI',
    instructionId: 'SENTINEL_SWARM_OPERATOR_COCKPIT_V1'
  },
  {
    id: 'GEMINI_NEXUS',
    title: 'Gemini Nexus Studio',
    shortLabel: 'Gemini Nexus',
    subtitle: 'Multimodal Live API Audio/Video Streaming & Dynamic Tool Calling',
    badge: 'LIVE API',
    color: '#A855F7',
    textColor: 'text-purple-400',
    badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
    glowClass: 'shadow-[0_0_15px_rgba(168,85,247,0.35)]',
    borderClass: 'border-purple-500/50',
    icon: Sparkles,
    voiceKeywords: ['gemini nexus', 'gemini', 'nexus', 'multimodal nexus', 'live api', 'gemini studio', 'live playground', 'nexus studio', 'multimodal'],
    sampleVoiceCommand: 'Switch to Gemini Nexus',
    resourcePreview: '48GB RAM • 24 Cores • WebSocket Stdio',
    instructionId: 'GEMINI_NEXUS_MULTIMODAL_STUDIO'
  },
  {
    id: 'GOOGLE_WORKSPACE',
    title: 'Google Workspace Hub',
    shortLabel: 'Workspace Hub',
    subtitle: 'OAuth 2.0 Real-Time Grid Sync for Drive, Sheets, Docs, Gmail & Calendar',
    badge: 'GRID SYNC',
    color: '#38BDF8',
    textColor: 'text-sky-400',
    badgeClass: 'bg-sky-950/80 text-sky-300 border-sky-500/50',
    glowClass: 'shadow-[0_0_15px_rgba(56,189,248,0.35)]',
    borderClass: 'border-sky-500/50',
    icon: Radio,
    voiceKeywords: ['google workspace', 'workspace', 'workspace hub', 'grid sync', 'google drive', 'sheets hub', 'google sync', 'workspace grid', 'docs', 'sheets', 'drive'],
    sampleVoiceCommand: 'Switch to Google Workspace',
    resourcePreview: '16GB RAM • 8 Cores • REST & GSI Hub',
    instructionId: 'GOOGLE_WORKSPACE_GRID_SYNC'
  },
  {
    id: 'MCP_SERVER',
    title: 'MCP Server Forge Studio',
    shortLabel: 'MCP Server Forge',
    subtitle: 'Model Context Protocol Server Runtime, Tool Registry & SSE Transports',
    badge: 'MCP PROTOCOL',
    color: '#C084FC',
    textColor: 'text-purple-300',
    badgeClass: 'bg-purple-950/80 text-purple-200 border-purple-400/50',
    glowClass: 'shadow-[0_0_15px_rgba(192,132,252,0.35)]',
    borderClass: 'border-purple-400/50',
    icon: Server,
    voiceKeywords: ['mcp server', 'mcp forge', 'mcp server forge', 'model context protocol', 'mcp studio', 'server forge', 'mcp tools', 'mcp'],
    sampleVoiceCommand: 'Switch to MCP Server Forge',
    resourcePreview: '32GB RAM • 16 Cores • SSE & Stdio Host',
    instructionId: 'MCP_SERVER_FORGE_CORE'
  }
];

export interface VoiceViewNavigation {
  isViewNavigation: boolean;
  targetView?: MainView;
  viewSpec?: ViewNavigationSpec;
  isModalTrigger?: 'EVOLVE' | 'SETTINGS';
  modalTitle?: string;
  matchedPhrase: string;
  rawCommand: string;
}

export function parseVoiceNavigationCommand(transcript: string): VoiceViewNavigation | null {
  const clean = transcript.trim();
  if (!clean) return null;
  const lower = clean.toLowerCase();

  // 1. Check Modal Targets (Evolution Matrix / Cartridge Settings)
  if (
    lower.includes('evolve') || 
    lower.includes('evolution matrix') || 
    lower.includes('ascend') || 
    lower.includes('singularity') ||
    lower.includes('v2000')
  ) {
    return {
      isViewNavigation: true,
      isModalTrigger: 'EVOLVE',
      modalTitle: 'Omni-Evolution Matrix (Tier V2000 Singularity)',
      matchedPhrase: 'Evolution Matrix',
      rawCommand: clean
    };
  }

  if (
    lower.includes('open settings') || 
    lower.includes('cartridge settings') || 
    lower.includes('configure cartridge') || 
    lower.includes('harness settings') ||
    lower.includes('show settings')
  ) {
    return {
      isViewNavigation: true,
      isModalTrigger: 'SETTINGS',
      modalTitle: 'Cartridge Harness Configuration',
      matchedPhrase: 'Cartridge Settings',
      rawCommand: clean
    };
  }

  // 2. Check each of the 8 Major Views
  for (const view of VIEW_SPECS) {
    for (const keyword of view.voiceKeywords) {
      // Direct exact match
      if (lower === keyword || lower === `open ${keyword}` || lower === `show ${keyword}` || lower === `switch to ${keyword}` || lower === `go to ${keyword}`) {
        return {
          isViewNavigation: true,
          targetView: view.id,
          viewSpec: view,
          matchedPhrase: view.title,
          rawCommand: clean
        };
      }

      // Regex matching conversational navigation verbs
      const navPattern = new RegExp(
        `(?:(?:switch|go|navigate|jump|move|change|swap|transition|bring)\\s+(?:to|over to|into|up)?|open|show|display|launch|load|bring up|view|activate|enter)\\s+(?:the\\s+)?(?:${keyword.replace(/ /g, '\\s+')})(?:\\s+(?:view|studio|hub|matrix|mesh|ide|os|forge|tab|screen|chassis))?`,
        'i'
      );
      if (navPattern.test(lower)) {
        return {
          isViewNavigation: true,
          targetView: view.id,
          viewSpec: view,
          matchedPhrase: view.title,
          rawCommand: clean
        };
      }
    }
  }

  // Secondary fuzzy check with explicit navigation context
  if (
    lower.startsWith('switch to') || 
    lower.startsWith('go to') || 
    lower.startsWith('navigate to') || 
    lower.startsWith('open ') || 
    lower.startsWith('show ') ||
    lower.startsWith('view ')
  ) {
    for (const view of VIEW_SPECS) {
      for (const keyword of view.voiceKeywords) {
        if (lower.includes(keyword)) {
          return {
            isViewNavigation: true,
            targetView: view.id,
            viewSpec: view,
            matchedPhrase: view.title,
            rawCommand: clean
          };
        }
      }
    }
  }

  return null;
}

export interface VoiceHiveAction {
  isHiveAction: boolean;
  actionType: 'SMART_SORT';
  rawCommand: string;
  description: string;
}

export function parseVoiceHiveAction(transcript: string): VoiceHiveAction | null {
  const clean = transcript.trim();
  if (!clean) return null;
  const lower = clean.toLowerCase();

  const sortPatterns = [
    /^(?:please\s+)?(?:smart\s+)?sort\s+(?:the\s+)?(?:hive\s+)?tasks?(?:\s+in\s+hive)?(?:\s+by\s+priority)?(?:\s+to\s+prioritize\s+(?:active|critical)\s+tasks?)?$/i,
    /^(?:please\s+)?prioritize\s+(?:the\s+)?(?:hive\s+)?tasks?(?:\s+by\s+priority)?(?:\s+to\s+prioritize\s+(?:active|critical)\s+tasks?)?$/i,
    /^(?:please\s+)?(?:smart\s+)?sort\s+hive$/i,
    /^(?:please\s+)?(?:auto\s+|smart\s+)?sort$/i,
    /^(?:please\s+)?organize\s+(?:the\s+)?(?:hive\s+)?tasks?$/i,
    /^(?:please\s+)?sort\s+(?:critical|active|delayed)\s+tasks?$/i
  ];

  if (sortPatterns.some(pattern => pattern.test(lower))) {
    return {
      isHiveAction: true,
      actionType: 'SMART_SORT',
      rawCommand: clean,
      description: 'Smart Sort Hive Tasks by Critical / Delayed / Normal Priority'
    };
  }

  if (
    lower.includes('sort hive tasks') || 
    lower.includes('smart sort tasks') || 
    lower.includes('smart sort hive') || 
    lower.includes('prioritize hive tasks') ||
    lower.includes('sort tasks in hive') ||
    (lower.startsWith('sort') && lower.includes('task') && !lower.includes('add task') && !lower.includes('create task'))
  ) {
    return {
      isHiveAction: true,
      actionType: 'SMART_SORT',
      rawCommand: clean,
      description: 'Smart Sort Hive Tasks by Critical / Delayed / Normal Priority'
    };
  }

  return null;
}

export interface VoiceTaskParsed {
  isTaskCapture: boolean;
  taskTitle: string;
  priority: TaskPriority;
  category: TaskCategory;
  targetKnight: 'MERLIN' | 'LANCELOT' | 'GALAHAD' | 'GIDEON' | 'ANIMATOR';
  rawCommand: string;
}

export function parseVoiceTaskCommand(transcript: string): VoiceTaskParsed | null {
  const clean = transcript.trim();
  if (!clean) return null;

  // Matches phrases like:
  // "Add task [task name] with [priority]"
  // "Add refactor task [task name] with [priority]"
  // "Add debug task [task name] priority critical"
  // "Create task [task name] category deploy with [priority]"
  // "Add task to Lancelot [task name] with [priority]"
  const categoryKeywords = 'refactor|debug|deploy|feature|security|test|optimize|docs|fix';
  const patternWithPriority = new RegExp(
    `^(?:add|create|new|schedule|queue|inject)\\s+(?:a\\s+)?(?:(${categoryKeywords})\\s+)?task\\s+(?:for\\s+(merlin|lancelot|galahad|gideon|animator)\\s+|to\\s+(merlin|lancelot|galahad|gideon|animator)\\s+)?(.+?)(?:\\s+(?:category|tag|type)\\s+(${categoryKeywords}))?(?:\\s+(?:with(?:\\s+(?:a\\s+)?)?|priority|at)\\s+(critical|delayed|normal|sealed|high|medium|low|urgent|blocker|p0|p1|p2)(?:\\s+priority)?)?$`,
    'i'
  );

  const match = clean.match(patternWithPriority);
  if (!match) return null;

  const prefixCategory = (match[1] || '').toUpperCase();
  const knightCandidate = (match[2] || match[3] || '').toUpperCase();
  let taskRaw = (match[4] || '').trim();
  const explicitCategory = (match[5] || '').toUpperCase();
  let priorityRaw = (match[6] || '').toLowerCase();

  // Strip enclosing quotes if present (e.g. "task name" or 'task name')
  taskRaw = taskRaw.replace(/^["'“”‘’]/, '').replace(/["'“”‘’]$/, '').trim();

  // If task name ends with "with critical" / "with delayed" if regex grouped it inside
  const trailingWith = taskRaw.match(/^(.+?)\s+with\s+(critical|delayed|normal|sealed|high|medium|low|urgent|blocker|p0|p1|p2)(?:\s+priority)?$/i);
  if (trailingWith) {
    taskRaw = trailingWith[1].trim();
    priorityRaw = trailingWith[2].toLowerCase();
  }

  if (!taskRaw) return null;

  // Map priority string to TaskPriority
  let priority: TaskPriority = 'NORMAL';
  if (['critical', 'urgent', 'blocker', 'p0', 'high'].includes(priorityRaw)) {
    priority = 'CRITICAL';
  } else if (['delayed', 'lagging', 'behind', 'p2', 'medium', 'warn'].includes(priorityRaw)) {
    priority = 'DELAYED';
  } else if (['sealed', 'done', 'complete', 'verified', 'pass', 'finished'].includes(priorityRaw)) {
    priority = 'SEALED';
  } else {
    priority = 'NORMAL';
  }

  // Determine Category
  let category: TaskCategory = 'FEATURE';
  const matchedCat = explicitCategory || prefixCategory;
  if (matchedCat === 'REFACTOR') category = 'REFACTOR';
  else if (matchedCat === 'DEBUG' || matchedCat === 'FIX') category = 'DEBUG';
  else if (matchedCat === 'DEPLOY') category = 'DEPLOY';
  else if (matchedCat === 'SECURITY') category = 'SECURITY';
  else if (matchedCat === 'TEST') category = 'TEST';
  else if (matchedCat === 'OPTIMIZE') category = 'OPTIMIZE';
  else if (matchedCat === 'DOCS') category = 'DOCS';
  else if (matchedCat === 'FEATURE') category = 'FEATURE';
  else {
    // Infer category automatically from task keywords
    const lowerTask = taskRaw.toLowerCase();
    if (lowerTask.includes('debug') || lowerTask.includes('fix') || lowerTask.includes('panic') || lowerTask.includes('bug') || lowerTask.includes('patch') || lowerTask.includes('error') || lowerTask.includes('hotfix')) {
      category = 'DEBUG';
    } else if (lowerTask.includes('refactor') || lowerTask.includes('clean') || lowerTask.includes('rewrite') || lowerTask.includes('modular') || lowerTask.includes('migrate') || lowerTask.includes('restructure') || lowerTask.includes('rename')) {
      category = 'REFACTOR';
    } else if (lowerTask.includes('deploy') || lowerTask.includes('release') || lowerTask.includes('ship') || lowerTask.includes('k8s') || lowerTask.includes('docker') || lowerTask.includes('publish') || lowerTask.includes('broadcast') || lowerTask.includes('ci')) {
      category = 'DEPLOY';
    } else if (lowerTask.includes('security') || lowerTask.includes('sentinel') || lowerTask.includes('auth') || lowerTask.includes('proof') || lowerTask.includes('z3') || lowerTask.includes('sandbox') || lowerTask.includes('lease') || lowerTask.includes('vault') || lowerTask.includes('jwt')) {
      category = 'SECURITY';
    } else if (lowerTask.includes('test') || lowerTask.includes('crucible') || lowerTask.includes('fuzz') || lowerTask.includes('gideon') || lowerTask.includes('invariant') || lowerTask.includes('sre') || lowerTask.includes('spec') || lowerTask.includes('assert')) {
      category = 'TEST';
    } else if (lowerTask.includes('optimize') || lowerTask.includes('speed') || lowerTask.includes('perf') || lowerTask.includes('particle') || lowerTask.includes('fps') || lowerTask.includes('velocity') || lowerTask.includes('latency') || lowerTask.includes('boost') || lowerTask.includes('cache')) {
      category = 'OPTIMIZE';
    } else if (lowerTask.includes('doc') || lowerTask.includes('docs') || lowerTask.includes('readme') || lowerTask.includes('markdown') || lowerTask.includes('spec')) {
      category = 'DOCS';
    } else {
      category = 'FEATURE';
    }
  }

  // Determine target knight persona
  let targetKnight: 'MERLIN' | 'LANCELOT' | 'GALAHAD' | 'GIDEON' | 'ANIMATOR' = 'MERLIN';
  if (['MERLIN', 'LANCELOT', 'GALAHAD', 'GIDEON', 'ANIMATOR'].includes(knightCandidate)) {
    targetKnight = knightCandidate as any;
  } else {
    const lowerTask = taskRaw.toLowerCase();
    if (lowerTask.includes('ui') || lowerTask.includes('shader') || lowerTask.includes('viewport') || lowerTask.includes('css') || lowerTask.includes('theme') || lowerTask.includes('layout') || lowerTask.includes('frontend') || lowerTask.includes('render')) {
      targetKnight = 'LANCELOT';
    } else if (lowerTask.includes('security') || lowerTask.includes('sentinel') || lowerTask.includes('auth') || lowerTask.includes('proof') || lowerTask.includes('z3') || lowerTask.includes('vfs') || lowerTask.includes('sandbox') || lowerTask.includes('lease') || lowerTask.includes('backend') || lowerTask.includes('jwt')) {
      targetKnight = 'GALAHAD';
    } else if (lowerTask.includes('sre') || lowerTask.includes('test') || lowerTask.includes('adversarial') || lowerTask.includes('fuzz') || lowerTask.includes('gideon') || lowerTask.includes('invariant') || lowerTask.includes('matrix')) {
      targetKnight = 'GIDEON';
    } else if (lowerTask.includes('kinetic') || lowerTask.includes('particle') || lowerTask.includes('viseme') || lowerTask.includes('webgl') || lowerTask.includes('3d') || lowerTask.includes('motion') || lowerTask.includes('animation') || lowerTask.includes('fps')) {
      targetKnight = 'ANIMATOR';
    } else {
      targetKnight = 'MERLIN';
    }
  }

  return {
    isTaskCapture: true,
    taskTitle: taskRaw,
    priority,
    category,
    targetKnight,
    rawCommand: clean
  };
}

interface SpatialVoiceHUDProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatchIntent?: (parsedIntent: {
    rawTranscript: string;
    hudXml: string;
    merlinRoute: string;
    lancelotTasks: string[];
    galahadTasks: string[];
    domain: string;
    taskCapture?: VoiceTaskParsed;
    viewNavigation?: VoiceViewNavigation;
    hiveAction?: VoiceHiveAction;
  }) => void;
  onNotify: (message: string, type: 'success' | 'warning') => void;
  currentActiveView?: MainView;
  onSwitchView?: (view: MainView) => void;
}

export interface ParsedHUD {
  latencyMs: number;
  activeKnights: string[];
  intentParticles: {
    module: string;
    domain: string;
    techStack: string[];
    riskTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  merlinRoute: string;
  lancelotTasks: string[];
  galahadTasks: string[];
  rawXml: string;
  taskCapture?: VoiceTaskParsed | null;
  viewNavigation?: VoiceViewNavigation | null;
  hiveAction?: VoiceHiveAction | null;
}

export function parseTranscriptToTier1HUD(transcript: string): ParsedHUD {
  const clean = transcript.trim();
  const lower = clean.toLowerCase();

  // 1. Check Voice Hive Action: "Sort Hive tasks" / "Smart sort tasks"
  const hiveAction = parseVoiceHiveAction(clean);

  // 2. Check Voice-to-Task Capture command: "Add task [name] with [priority]"
  const taskCapture = !hiveAction ? parseVoiceTaskCommand(clean) : null;

  // 3. Check Voice View Navigation command: "Switch to [view]"
  const viewNavigation = (!hiveAction && !taskCapture) ? parseVoiceNavigationCommand(clean) : null;

  // Detect domain
  let domain = 'Full-Stack Architecture';
  let riskTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
  const techStack = ['TypeScript', 'React 19', 'Tailwind CSS'];

  if (hiveAction) {
    domain = 'Hive IDE Swarm • Smart Priority Sort';
    riskTier = 'LOW';
    techStack.push('Hive IDE Matrix', 'Priority Weighted Sort', 'Critical & Delayed First', 'Multi-Cursor Swarm');
  } else if (viewNavigation) {
    if (viewNavigation.isModalTrigger === 'EVOLVE') {
      domain = 'Singularity Evolution Matrix';
      riskTier = 'LOW';
      techStack.push('Topological Mesh', 'Wasmtime WAL2', 'Gideon Level 5', 'MsgPack FFI');
    } else if (viewNavigation.isModalTrigger === 'SETTINGS') {
      domain = 'Cartridge Configuration Harness';
      riskTier = 'LOW';
      techStack.push('VFS Sandbox Config', 'Sentinel Bounds', 'Cartridge Harness');
    } else if (viewNavigation.viewSpec) {
      domain = `Spatial View Navigation • ${viewNavigation.viewSpec.title}`;
      riskTier = 'LOW';
      techStack.push(viewNavigation.viewSpec.title, viewNavigation.viewSpec.instructionId, viewNavigation.viewSpec.resourcePreview);
    }
  } else if (taskCapture) {
    domain = `Hive IDE Swarm • Task Ingestion [${taskCapture.priority}]`;
    riskTier = taskCapture.priority === 'CRITICAL' ? 'CRITICAL' : taskCapture.priority === 'DELAYED' ? 'HIGH' : 'LOW';
    techStack.push('Hive IDE Matrix', 'Dynamic Subtask Queue', `Knight ${taskCapture.targetKnight}`);
  } else if (lower.includes('evolve') || lower.includes('ascend') || lower.includes('singularity') || lower.includes('v2000')) {
    domain = 'Omni-Evolution Matrix (Tier V2000)';
    riskTier = 'LOW';
    techStack.push('Topological Mesh', 'Wasmtime WAL2', 'Gideon Level 5', 'MsgPack FFI');
  } else if (lower.includes('auth') || lower.includes('security') || lower.includes('jwt') || lower.includes('lease') || lower.includes('pci')) {
    domain = 'Security & Capability Leases';
    riskTier = 'HIGH';
    techStack.push('Sentinel Engine', 'AES-GCM-256', 'Hydra Ledger');
  } else if (lower.includes('industrial') || lower.includes('plc') || lower.includes('sensor') || lower.includes('dsl') || lower.includes('grille')) {
    domain = 'Cyber-Physical Systems & MicroVM';
    riskTier = 'CRITICAL';
    techStack.push('Station DSL', 'ARM64 MicroVM', 'OPC UA');
  } else if (lower.includes('prompt') || lower.includes('loom') || lower.includes('protegi') || lower.includes('mipro') || lower.includes('gemini')) {
    domain = 'Cognitive Optimization & LLM Pipeline';
    riskTier = 'LOW';
    techStack.push('Synaptic Loom', 'Gemini 3.1 Pro', 'ProTeGi Gradient');
  } else if (lower.includes('ui') || lower.includes('css') || lower.includes('hud') || lower.includes('theme') || lower.includes('frontend')) {
    domain = 'Spatial Interface & Holographic HUD';
    riskTier = 'LOW';
    techStack.push('Lucide React', 'Glassmorphism Shaders', 'Web Audio/Speech');
  } else if (lower.includes('workspace') || lower.includes('sheet') || lower.includes('drive') || lower.includes('mail')) {
    domain = 'Google Workspace Integration';
    riskTier = 'MEDIUM';
    techStack.push('Google Workspace OAuth', 'GSI Client', 'Drive REST API');
  }

  // Generate persona allocations
  let merlinRoute = `Dual-stream intent routed to ${domain}. Formulating 12-stage execution DAG with ${riskTier} safety constraints and 8GB ARM64 Wasmtime memory clamp.`;
  let lancelotTasks = [
    `Scaffold high-density holographic interface with ${techStack.slice(0, 2).join(' & ')}.`,
    `Bind real-time telemetry visualizers with cubic-bezier kinetic transitions and .armor-plate shaders.`,
    `Establish responsive event handlers and stateful feedback matrices for operator controls.`
  ];
  let galahadTasks = [
    `Provision Sentinel capability lease with strict fail-closed boundary verification.`,
    `Inject Gideon Independent Verification test harness with adversarial invariant checks.`,
    `Enforce ephemeral VFS sandbox isolation and zero ambient network leakage.`
  ];

  if (hiveAction) {
    merlinRoute = `Voice "Sort Hive tasks" command locked. Engaging Smart Priority Sorting in Hive IDE: Reorganizing multi-cursor task streams with Critical -> Delayed -> Normal -> Sealed ordering.`;
    lancelotTasks = [
      `[SMART_SORT_ACTIVE]: Re-index multi-cursor thermal streams by priority hierarchy.`,
      `Elevate active execution queues and panic-patching Knights to top of viewport.`,
      `Render dynamic situational priority borders with kinetic smooth layout transition.`
    ];
    galahadTasks = [
      `Verify Sentinel capability lease locks across reordered task queues.`,
      `Preserve SMT Z3 formal verification invariants during task permutation.`
    ];
  } else if (viewNavigation) {
    if (viewNavigation.isModalTrigger === 'EVOLVE') {
      merlinRoute = `Singularity Ascension command parsed. Launching Tier V2000 Omni-Evolution Matrix modal.`;
      lancelotTasks[0] = `Display visual warp shaders and topological neural ascension matrix.`;
      galahadTasks[0] = `Unlock Level 5 Gideon invariant fuzzing and kernel state promotion.`;
    } else if (viewNavigation.isModalTrigger === 'SETTINGS') {
      merlinRoute = `Configuration command parsed. Opening Cartridge Settings Harness for hardware budgeting.`;
      lancelotTasks[0] = `Render real-time sliders for GPU/RAM allocation and sandbox latency controls.`;
      galahadTasks[0] = `Validate cryptographic signatures on cartridge parameter state.`;
    } else if (viewNavigation.viewSpec) {
      merlinRoute = `Spatial view navigation command locked: Hot-swapping studio viewport to "${viewNavigation.viewSpec.title}" [${viewNavigation.viewSpec.instructionId}].`;
      lancelotTasks = [
        `[HOT-SWAP_NAVIGATION]: Transition viewport to ${viewNavigation.viewSpec.title}.`,
        `Mount dedicated ${viewNavigation.viewSpec.badge} kinetic components and clear background CPU load.`,
        `Initialize live telemetry visualizers for ${viewNavigation.viewSpec.resourcePreview}.`
      ];
      galahadTasks = [
        `Quarantine unneeded subsystem memory and isolate ${viewNavigation.viewSpec.instructionId} runtime boundaries.`,
        `Enforce fail-closed resource constraints for allocated studio cores.`,
        `Synchronize cryptographic capability lease for ${viewNavigation.viewSpec.shortLabel}.`
      ];
    }
  } else if (taskCapture) {
    merlinRoute = `Voice task capture verified. Dispatching "${taskCapture.taskTitle}" directly to Knight ${taskCapture.targetKnight} with priority ${taskCapture.priority}.`;
    if (taskCapture.targetKnight === 'LANCELOT') {
      lancelotTasks = [
        `[INJECTED_VOICE_TASK]: "${taskCapture.taskTitle}" (Priority: ${taskCapture.priority})`,
        `Scaffold UI components and bind kinetic layout shaders for incoming task requirements.`,
        `Synchronize state transitions with 60fps Sovereign Viewport telemetry ribbon.`
      ];
    } else if (taskCapture.targetKnight === 'GALAHAD') {
      galahadTasks = [
        `[INJECTED_VOICE_TASK]: "${taskCapture.taskTitle}" (Priority: ${taskCapture.priority})`,
        `Evaluate SMT Z3 formal proofs and enforce fail-closed zero-ambient sandbox constraints.`,
        `Verify Sentinel capability lease token signatures for newly added task execution.`
      ];
    } else {
      lancelotTasks[0] = `Coordinate UI telemetry with Knight ${taskCapture.targetKnight} for new task "${taskCapture.taskTitle}".`;
      galahadTasks[0] = `Audit security invariant boundaries for new task "${taskCapture.taskTitle}".`;
    }
  }

  const latencyMs = Math.floor(Math.random() * 35) + 45; // ultra-fast <100ms
  const activeKnights = ['Knight Merlin (Router)', `Knight ${taskCapture ? taskCapture.targetKnight : hiveAction ? 'Swarm Fleet' : 'Lancelot'} (Active)`, 'Knight Galahad (Security)'];

  const rawXml = `<HUD_Intent_Parsing>
[PERIPHERAL_TELEMETRY]: Latency: ${latencyMs}ms | Active_Knights: [${activeKnights.join(', ')}]
[INTENT_PARTICLE_STREAM]: Module: ${domain} | Target: "${clean}" | Stack: [${techStack.join(', ')}] | Risk: ${riskTier}${hiveAction ? ` | HiveAction: [${hiveAction.actionType}]` : ''}${viewNavigation?.targetView ? ` | ViewNavigation: [${viewNavigation.targetView}]` : ''}${taskCapture ? ` | TaskCapture: [${taskCapture.priority}] => KNIGHT_${taskCapture.targetKnight}` : ''}
[PERSONA_RETICLE_ALLOCATION]: 
 - Knight Merlin (Router): ${merlinRoute}
 - Knight Lancelot (UI/Frontend): ${lancelotTasks.join(' ')}
 - Knight Galahad (Security/Backend): ${galahadTasks.join(' ')}
</HUD_Intent_Parsing>`;

  return {
    latencyMs,
    activeKnights,
    intentParticles: {
      module: domain,
      domain,
      techStack,
      riskTier
    },
    merlinRoute,
    lancelotTasks,
    galahadTasks,
    rawXml,
    taskCapture,
    viewNavigation,
    hiveAction
  };
}

const VOICE_PRESETS = [
  { text: 'Sort Hive tasks', label: 'Action: Smart Sort Hive Tasks', category: 'ACTION' },
  { text: 'Smart sort hive tasks to prioritize critical items', label: 'Action: Prioritize Critical Tasks', category: 'ACTION' },
  { text: 'Switch to Blueprint OS', label: 'View: Blueprint OS (Tier 2)', category: 'NAV' },
  { text: 'Switch to Hive IDE', label: 'View: Hive IDE (Tier 3)', category: 'NAV' },
  { text: 'Switch to Topological Mesh', label: 'View: Topological Mesh', category: 'NAV' },
  { text: 'Switch to Gemini Nexus', label: 'View: Gemini Nexus Studio', category: 'NAV' },
  { text: 'Switch to Synaptic Loom', label: 'View: Synaptic Loom', category: 'NAV' },
  { text: 'Switch to Google Workspace', label: 'View: Google Workspace Hub', category: 'NAV' },
  { text: 'Switch to MCP Server Forge', label: 'View: MCP Server Forge', category: 'NAV' },
  { text: 'Switch to Merlin Agency', label: 'View: Merlin Agency (Tier 1)', category: 'NAV' },
  { text: 'Initiate Evolution Matrix to ascend into Tier V2000 Singularity', label: 'Evolution: Ascend V2000', category: 'MODAL' },
  { text: 'Add refactor task "Synthesize Open-Design token shaders" with critical', label: 'Task: Token Shaders [Critical]', category: 'TASK' },
  { text: 'Add debug task "Resolve Sentinel lease lock contention" with critical', label: 'Task: Lock Contention [Critical]', category: 'TASK' }
];

export function SpatialVoiceHUD({ 
  isOpen, 
  onClose, 
  onDispatchIntent, 
  onNotify,
  currentActiveView = 'MERLIN_AGENCY',
  onSwitchView
}: SpatialVoiceHUDProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [parsedHUD, setParsedHUD] = useState<ParsedHUD | null>(null);
  const [copied, setCopied] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API availability
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
    }
  }, []);

  useEffect(() => {
    if (transcript.trim()) {
      const parsed = parseTranscriptToTier1HUD(transcript);
      setParsedHUD(parsed);
    }
  }, [transcript]);

  // Simulated audio levels during listening
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 80 + 20);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [isListening]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onNotify('Web Speech API is not supported in this browser. You can use text input or voice presets below!', 'warning');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        onNotify('Voice HUD Listening... Speak a navigation command or architectural task.', 'success');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscriptChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscriptChunk += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(currentInterim);
        if (finalTranscriptChunk) {
          setTranscript(prev => (prev ? `${prev} ${finalTranscriptChunk.trim()}` : finalTranscriptChunk.trim()));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          onNotify('Microphone permission was denied. Please allow microphone access or use presets.', 'warning');
        } else if (event.error !== 'no-speech') {
          onNotify(`Voice capture notice: ${event.error}. You can still type or choose a preset!`, 'warning');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Speech recognition start failed:', err);
      setIsListening(false);
      onNotify('Could not initialize microphone. Please check browser permissions.', 'warning');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
    setInterimTranscript('');
    onNotify('Voice capture paused. Transcript locked into HUD chassis.', 'success');
  };

  const handleCopyXML = () => {
    if (!parsedHUD) return;
    navigator.clipboard.writeText(parsedHUD.rawXml);
    setCopied(true);
    onNotify('Tier 1 <HUD_Intent_Parsing> XML copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectViewSwitch = (viewId: MainView) => {
    if (onSwitchView) {
      onSwitchView(viewId);
    }
    const spec = VIEW_SPECS.find(v => v.id === viewId);
    onNotify(`⚡ Hot-Swapped to ${spec?.title || viewId} via Spatial Voice HUD!`, 'success');
    onClose();
  };

  const handleDispatch = () => {
    if (!parsedHUD || !transcript.trim()) {
      onNotify('Please speak or type a command first.', 'warning');
      return;
    }

    if (onDispatchIntent) {
      onDispatchIntent({
        rawTranscript: transcript,
        hudXml: parsedHUD.rawXml,
        merlinRoute: parsedHUD.merlinRoute,
        lancelotTasks: parsedHUD.lancelotTasks,
        galahadTasks: parsedHUD.galahadTasks,
        domain: parsedHUD.intentParticles.domain,
        taskCapture: parsedHUD.taskCapture || undefined,
        viewNavigation: parsedHUD.viewNavigation || undefined,
        hiveAction: parsedHUD.hiveAction || undefined
      });
    }

    if (parsedHUD.hiveAction) {
      if (onSwitchView) {
        onSwitchView('HIVE_IDE');
      }
      onNotify('⚡ Voice Command: Smart Sort executed in Hive IDE (Prioritizing Critical & Active tasks)!', 'success');
    } else if (parsedHUD.viewNavigation?.targetView && onSwitchView) {
      onSwitchView(parsedHUD.viewNavigation.targetView);
    }

    if (parsedHUD.hiveAction) {
      // already notified above
    } else if (parsedHUD.viewNavigation) {
      if (parsedHUD.viewNavigation.isModalTrigger) {
        onNotify(`⚡ Voice Trigger: Launching ${parsedHUD.viewNavigation.modalTitle}!`, 'success');
      } else if (parsedHUD.viewNavigation.viewSpec) {
        onNotify(`⚡ Voice Navigation: View switched to ${parsedHUD.viewNavigation.viewSpec.title}!`, 'success');
      }
    } else if (parsedHUD.taskCapture) {
      onNotify(
        `⚡ Voice task "${parsedHUD.taskCapture.taskTitle}" with [${parsedHUD.taskCapture.priority}] priority dispatched directly to Knight ${parsedHUD.taskCapture.targetKnight}!`,
        'success'
      );
    } else {
      onNotify(`Intent parsed & dispatched to Merlin, Lancelot & Galahad!`, 'success');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="hud-panel armor-plate w-full max-w-5xl max-h-[94vh] flex flex-col rounded-2xl border-2 border-[#D4AF37] shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="p-4 border-b border-[#D4AF37]/40 bg-[#0F0F16] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#181824] border border-[#00F0FF]">
              <Radio size={18} className="text-[#00F0FF] animate-pulse" />
              {isListening && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-widest uppercase text-white arc-text">
                  TIER 1: SPATIAL VOICE HUD
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50">
                  DUAL-STREAM INTENT & VIEW ROUTER
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Voice-Driven Major View Navigation • Hive Task Capture • Arthurian Persona Allocation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#1A1A24] border border-[#2A2A3A] text-gray-400 hover:text-white hover:border-[#D4AF37] transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* HUD Interactive Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scroll">
          
          {/* Mic Controller Banner */}
          <div className="hud-panel p-4 rounded-xl border border-[#00F0FF]/30 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[#0F0F18] via-[#151522] to-[#0F0F18]">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`relative px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-lg cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/40 animate-pulse'
                    : 'bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff size={18} className="animate-bounce" />
                    <span>Halt Voice Capture</span>
                  </>
                ) : (
                  <>
                    <Mic size={18} />
                    <span>Engage Voice Capture</span>
                  </>
                )}
              </button>

              <div className="flex-1 md:flex-initial">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>STATUS:</span>
                  <span className={isListening ? 'text-[#00F0FF] animate-pulse font-black' : 'text-gray-400'}>
                    {isListening ? 'STREAMING REAL-TIME AUDIO...' : 'STANDBY (CLICK TO ENGAGE)'}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  Latency: <strong className="text-emerald-400">{parsedHUD ? `${parsedHUD.latencyMs}ms` : '<150ms'}</strong> | Active Studio: <span className="text-[#00F0FF] font-bold">[{currentActiveView}]</span>
                </div>
              </div>
            </div>

            {/* Audio Wave Visualizer Simulation */}
            <div className="flex items-center gap-1 h-8 bg-black/40 px-3 rounded-lg border border-[#2A2A3A] w-full md:w-48 justify-center">
              {[15, 30, 45, 70, 90, 60, 40, 75, 50, 30, 20].map((baseHeight, idx) => {
                const height = isListening ? Math.min(100, Math.max(15, baseHeight * (audioLevel / 50))) : 15;
                return (
                  <div
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      isListening ? 'bg-[#00F0FF] shadow-[0_0_5px_#00F0FF]' : 'bg-gray-700'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Spatial View Matrix: Interactive 8-View Voice Switcher Tiles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-1.5">
                <LayoutGrid size={14} className="text-[#00F0FF]" />
                <span>MAJOR FRONTEND VIEWS MATRIX (VOICE-ADDRESSABLE TARGETS):</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                Click tile or speak: <strong className="text-white">"Switch to [View]"</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VIEW_SPECS.map((spec) => {
                const IconComponent = spec.icon;
                const isCurrentActive = currentActiveView === spec.id;
                const isDetectedTarget = parsedHUD?.viewNavigation?.targetView === spec.id;

                return (
                  <button
                    key={spec.id}
                    onClick={() => {
                      setTranscript(`Switch to ${spec.shortLabel}`);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer relative group flex flex-col justify-between ${
                      isDetectedTarget
                        ? 'bg-gradient-to-b from-[#0C1A24] to-[#0A0D16] border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.45)] ring-2 ring-[#00F0FF]/80 scale-[1.02]'
                        : isCurrentActive
                        ? 'bg-[#121622] border-[#D4AF37]/80 shadow-[0_0_12px_rgba(212,175,55,0.25)] ring-1 ring-[#D4AF37]/50'
                        : 'bg-[#0B0B14] hover:bg-[#12121E] border-[#222234] hover:border-gray-500'
                    }`}
                  >
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div 
                        className="w-6 h-6 rounded-lg flex items-center justify-center border"
                        style={{
                          backgroundColor: `${spec.color}15`,
                          borderColor: `${spec.color}40`,
                          color: spec.color
                        }}
                      >
                        <IconComponent size={13} />
                      </div>

                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${spec.badgeClass}`}>
                        {spec.badge}
                      </span>
                    </div>

                    {/* View Name & Command Hint */}
                    <div>
                      <div className="text-[11px] font-black text-white group-hover:text-[#00F0FF] transition-colors truncate">
                        {spec.shortLabel}
                      </div>
                      <div className="text-[9px] text-gray-500 font-mono truncate mt-0.5">
                        Say: <span className="text-gray-300">"{spec.sampleVoiceCommand}"</span>
                      </div>
                    </div>

                    {/* Active/Target State Indicator */}
                    <div className="mt-2 pt-1 border-t border-white/5 flex items-center justify-between text-[8px] font-mono">
                      {isDetectedTarget ? (
                        <span className="text-[#00F0FF] font-bold flex items-center gap-1 animate-pulse">
                          <Check size={10} /> TARGET LOCKED
                        </span>
                      ) : isCurrentActive ? (
                        <span className="text-[#D4AF37] font-bold flex items-center gap-1">
                          <Activity size={10} /> ACTIVE VIEW
                        </span>
                      ) : (
                        <span className="text-gray-500 group-hover:text-gray-300">
                          {spec.resourcePreview.split('•')[0]}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time Voice Transcription Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-amber-300 flex items-center gap-2">
                <Volume2 size={14} className="text-[#00F0FF]" />
                <span>VOICE TRANSCRIPT STREAM:</span>
              </label>
              {transcript && (
                <button
                  onClick={() => { setTranscript(''); setInterimTranscript(''); setParsedHUD(null); }}
                  className="text-[10px] text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Clear Buffer
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                value={transcript + (interimTranscript ? ` ${interimTranscript}` : '')}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder='Speak into microphone or type: "Switch to Gemini Nexus", "Open Blueprint OS", "Add refactor task...", "Initiate Evolution"...'
                rows={2}
                className="w-full bg-[#08080E] border border-[#2A2A3A] rounded-xl p-3.5 text-xs sm:text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all font-mono leading-relaxed"
              />
              {interimTranscript && (
                <div className="absolute right-3 bottom-3 text-[10px] text-[#00F0FF] animate-pulse flex items-center gap-1 font-bold">
                  <Activity size={12} className="animate-spin" /> Transcribing...
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div className="pt-1">
              <div className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                <Zap size={11} className="text-[#D4AF37]" /> One-Click Voice & View Presets:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {VOICE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTranscript(preset.text)}
                    className="text-[10px] bg-[#12121A] hover:bg-[#1A1A28] border border-[#252535] hover:border-[#00F0FF]/60 text-gray-300 hover:text-white px-2.5 py-1 rounded-md transition-all text-left cursor-pointer flex items-center gap-1"
                  >
                    <span className={`text-[8px] font-mono px-1 py-0.2 rounded ${
                      preset.category === 'ACTION' ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/50 shadow-[0_0_8px_rgba(99,102,241,0.3)]' :
                      preset.category === 'NAV' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' :
                      preset.category === 'MODAL' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                      'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {preset.category}
                    </span>
                    <span>"{preset.label}"</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tier 1 Intent HUD Output Display */}
          {parsedHUD ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="border-t border-[#D4AF37]/30 pt-4 flex items-center justify-between">
                <div className="text-xs font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={14} className="text-[#00F0FF] animate-spin" />
                  <span>PARSED HOLOGRAPHIC RETICLE BREAKDOWN:</span>
                </div>
                <button
                  onClick={handleCopyXML}
                  className="flex items-center gap-1.5 text-[11px] bg-[#181824] border border-[#2A2A3A] hover:border-[#00F0FF] text-gray-300 hover:text-[#00F0FF] px-3 py-1 rounded-lg transition-all cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied XML' : 'Copy <HUD_Intent_Parsing>'}</span>
                </button>
              </div>

              {/* Special Voice Hive Action Detected Banner (Smart Sort) */}
              {parsedHUD.hiveAction && (
                <div className="p-4 rounded-xl border-2 border-[#818CF8] bg-gradient-to-r from-[#0E1026] via-[#090B1A] to-[#0E1026] shadow-[0_0_25px_rgba(129,140,248,0.35)] space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-black text-[#818CF8] uppercase tracking-wider">
                      <ArrowUpDown size={16} className="text-[#818CF8] animate-bounce" />
                      <span>⚡ HIVE SWARM ACTION: SMART TASK PRIORITY SORT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black font-mono px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/60 shadow-[0_0_10px_rgba(129,140,248,0.4)]">
                        ACTION: SMART_SORT
                      </span>
                      <span className="text-[10px] font-black bg-[#161624] text-emerald-400 px-2 py-0.5 rounded border border-[#2B2B3E]">
                        CRITICAL & DELAYED FIRST
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#070814] p-3 rounded-lg border border-indigo-500/30">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-gray-400 uppercase font-bold">EXECUTION ACTION TARGET:</div>
                      <div className="text-sm font-black text-white truncate mt-0.5 font-sans flex items-center gap-1.5">
                        <ArrowUpDown size={14} className="text-[#818CF8] shrink-0" />
                        <span>Smart Sort Hive IDE Tasks (Critical → Delayed → Normal → Sealed)</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        Prioritizes active execution queues and elevates critical / panic-patching Knights
                      </div>
                    </div>

                    <button
                      onClick={handleDispatch}
                      className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#818CF8] to-[#6366F1] text-white hover:scale-[1.02] transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-center justify-center gap-1.5 cursor-pointer shrink-0 font-mono"
                    >
                      <Zap size={14} />
                      <span>Execute Smart Sort Now</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Special Voice View Navigation Detected Banner */}
              {parsedHUD.viewNavigation && (
                <div className="p-4 rounded-xl border-2 border-[#00F0FF] bg-gradient-to-r from-[#071924] via-[#0A121E] to-[#071924] shadow-[0_0_25px_rgba(0,240,255,0.35)] space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-black text-[#00F0FF] uppercase tracking-wider">
                      <Compass size={16} className="text-[#00F0FF] animate-spin" />
                      <span>⚡ SPATIAL VIEW NAVIGATION INTENT DETECTED</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                        TARGET: {parsedHUD.viewNavigation.matchedPhrase}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#050C12] p-3 rounded-lg border border-cyan-500/30">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-gray-400 uppercase font-bold">NAVIGATION TARGET & CONSTRAINTS:</div>
                      <div className="text-sm font-black text-white truncate mt-0.5 font-sans flex items-center gap-1.5">
                        <ArrowRight size={14} className="text-[#00F0FF] shrink-0" />
                        <span>{parsedHUD.viewNavigation.modalTitle || parsedHUD.viewNavigation.viewSpec?.title}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {parsedHUD.viewNavigation.viewSpec?.resourcePreview || 'Modal Viewport Overlay'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {parsedHUD.viewNavigation.targetView && (
                        <button
                          onClick={() => handleDirectViewSwitch(parsedHUD.viewNavigation!.targetView!)}
                          className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-black hover:scale-[1.02] transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Zap size={14} />
                          <span>Hot-Swap & Navigate View</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Special Voice-to-Task Capture Detected Banner */}
              {parsedHUD.taskCapture && (
                <div className="p-4 rounded-xl border-2 border-[#10B981] bg-gradient-to-r from-[#0C1B14] via-[#091510] to-[#0C1B14] shadow-[0_0_25px_rgba(16,185,129,0.3)] space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider">
                      <ListTodo size={16} className="text-emerald-400 animate-pulse" />
                      <span>⚡ VOICE-TO-TASK CAPTURE DETECTED (HIVE IDE SWARM)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black font-mono px-2.5 py-0.5 rounded-full border ${
                        parsedHUD.taskCapture.priority === 'CRITICAL'
                          ? 'bg-red-950 text-red-300 border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                          : parsedHUD.taskCapture.priority === 'DELAYED'
                          ? 'bg-amber-950 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                          : parsedHUD.taskCapture.priority === 'SEALED'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                          : 'bg-cyan-950 text-cyan-300 border-cyan-500/60'
                      }`}>
                        PRIORITY: {parsedHUD.taskCapture.priority}
                      </span>
                      <span className="text-[10px] font-black bg-[#161624] text-gray-300 px-2 py-0.5 rounded border border-[#2B2B3E]">
                        TARGET: KNIGHT {parsedHUD.taskCapture.targetKnight}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#060E0A] p-3 rounded-lg border border-emerald-500/30">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-gray-400 uppercase font-bold">TASK SPECIFICATION:</div>
                      <div className="text-sm font-black text-white truncate mt-0.5 font-sans flex items-center gap-1.5">
                        <CheckSquare size={14} className="text-emerald-400 shrink-0" />
                        <span>"{parsedHUD.taskCapture.taskTitle}"</span>
                      </div>
                    </div>

                    <button
                      onClick={handleDispatch}
                      className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:scale-[1.02] transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Zap size={14} />
                      <span>Inject Task to Swarm</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Telemetry & Categorization Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="armor-plate p-3 rounded-lg border border-[#2A2A3A] bg-[#0C0C14]">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">DOMAIN CATEGORY</div>
                  <div className="text-xs font-black text-[#00F0FF] mt-1">{parsedHUD.intentParticles.domain}</div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    Risk Profile: <strong className="text-amber-400">{parsedHUD.intentParticles.riskTier}</strong>
                  </div>
                </div>

                <div className="armor-plate p-3 rounded-lg border border-[#2A2A3A] bg-[#0C0C14]">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">ACTIVE TECH CONSTRAINTS</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parsedHUD.intentParticles.techStack.map((tech, i) => (
                      <span key={i} className="text-[9px] bg-[#181828] text-gray-300 px-1.5 py-0.5 rounded border border-[#252535]">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="armor-plate p-3 rounded-lg border border-[#2A2A3A] bg-[#0C0C14]">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">PERIPHERAL TELEMETRY</div>
                  <div className="text-xs font-black text-emerald-400 mt-1">Latency: {parsedHUD.latencyMs}ms</div>
                  <div className="text-[10px] text-gray-500 mt-1">3 Coding Knights Synced</div>
                </div>
              </div>

              {/* Persona Allocation Grid */}
              <div className="space-y-2.5">
                {/* Merlin */}
                <div className="hud-panel p-3.5 rounded-xl border-l-4 border-l-[#D4AF37] border-y border-r border-[#2A2A38] bg-[#0D0D15]">
                  <div className="flex items-center gap-2 text-xs font-black text-[#D4AF37]">
                    <Cpu size={14} />
                    <span>KNIGHT MERLIN (ROUTER / ARCHITECT):</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                    {parsedHUD.merlinRoute}
                  </p>
                </div>

                {/* Lancelot */}
                <div className="hud-panel p-3.5 rounded-xl border-l-4 border-l-[#00F0FF] border-y border-r border-[#2A2A38] bg-[#0D0D15]">
                  <div className="flex items-center gap-2 text-xs font-black text-[#00F0FF]">
                    <Layers size={14} />
                    <span>KNIGHT LANCELOT (UI & SPATIAL FRONTEND):</span>
                  </div>
                  <ul className="mt-1.5 space-y-1 text-xs text-gray-300">
                    {parsedHUD.lancelotTasks.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <ChevronRight size={13} className="text-[#00F0FF] shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Galahad */}
                <div className="hud-panel p-3.5 rounded-xl border-l-4 border-l-emerald-400 border-y border-r border-[#2A2A38] bg-[#0D0D15]">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
                    <Shield size={14} />
                    <span>KNIGHT GALAHAD (SECURITY & BACKEND INTEGRITY):</span>
                  </div>
                  <ul className="mt-1.5 space-y-1 text-xs text-gray-300">
                    {parsedHUD.galahadTasks.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <ChevronRight size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Raw XML Preview */}
              <div className="bg-[#06060A] border border-[#222230] rounded-xl p-3">
                <div className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                  <Terminal size={12} className="text-[#00F0FF]" /> Exact Tier 1 XML Emission Format:
                </div>
                <pre className="text-[10px] font-mono text-[#00F0FF]/90 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {parsedHUD.rawXml}
                </pre>
              </div>
            </div>
          ) : (
            <div className="hud-panel p-6 rounded-xl border border-[#2A2A3A] text-center space-y-2 bg-[#090910]/50">
              <Radio size={28} className="mx-auto text-gray-600 animate-pulse" />
              <div className="text-xs font-bold text-gray-400">HUD INTAKE BUFFER STANDBY</div>
              <p className="text-[11px] text-gray-600 max-w-md mx-auto">
                Press "Engage Voice Capture", click one of the 8 major view tiles above, or choose a preset to hot-swap views or inject tasks.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#D4AF37]/40 bg-[#0A0A10] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[10px] text-gray-500 font-mono">
            Protocol: <strong className="text-[#D4AF37]">ARTHURIAN_OMNI_FORGE_V1000</strong> • Fail-Closed View Routing
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold bg-[#14141E] border border-[#2A2A3A] text-gray-300 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>

            <button
              onClick={handleDispatch}
              disabled={!parsedHUD || !transcript.trim()}
              className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                parsedHUD && transcript.trim()
                  ? 'bg-gradient-to-r from-[#D4AF37] via-amber-300 to-[#00F0FF] text-black shadow-lg shadow-[#D4AF37]/30 hover:scale-[1.02]'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
              }`}
            >
              <Send size={14} />
              <span>{parsedHUD?.viewNavigation?.targetView ? 'Hot-Swap & Execute Transition' : 'Inject into Blueprint OS Chassis'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
