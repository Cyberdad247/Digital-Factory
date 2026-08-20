import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Columns, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Cpu, 
  ArrowRight, 
  Plus, 
  Search, 
  Sliders, 
  Filter, 
  Zap, 
  ShieldCheck, 
  Flame, 
  AlertTriangle, 
  ChevronRight, 
  Sparkles,
  Bot,
  User,
  Radio,
  FileCode,
  X,
  Play
} from 'lucide-react';
import { 
  SwarmKanbanTask, 
  SwarmKanbanStage, 
  SwarmAgentId, 
  SwarmSmartQuestion 
} from '../types';

interface SwarmKanbanViewProps {
  onNotify: (msg: string, type?: 'success' | 'warning') => void;
  onSwitchToVibe?: () => void;
  onSwitchToTitanCore?: () => void;
}

const KANBAN_COLUMNS: { stage: SwarmKanbanStage; title: string; subtitle: string; color: string; icon: string }[] = [
  { stage: 'INTENT', title: '1. Intent', subtitle: 'Ingress & Socratic intake', color: 'border-blue-500/40 text-blue-400 bg-blue-950/20', icon: '🎯' },
  { stage: 'SPEC', title: '2. Spec', subtitle: 'JSON-LD Contracts & ADRs', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20', icon: '📜' },
  { stage: 'PLAN', title: '3. Plan', subtitle: 'Agent role allocation', color: 'border-purple-500/40 text-purple-400 bg-purple-950/20', icon: '🗺️' },
  { stage: 'DAG', title: '4. DAG', subtitle: 'Topological dependency graph', color: 'border-indigo-500/40 text-indigo-400 bg-indigo-950/20', icon: '🕸️' },
  { stage: 'SANDBOX', title: '5. Sandbox', subtitle: 'WASM / QuickJS compilation', color: 'border-amber-500/40 text-amber-400 bg-amber-950/20', icon: '⚡' },
  { stage: 'VERIFICATION', title: '6. Verification', subtitle: 'Z3 Theorem & Gideon TDD', color: 'border-rose-500/40 text-rose-400 bg-rose-950/20', icon: '🛡️' },
  { stage: 'COMMITTED', title: '7. Committed', subtitle: 'Receipt sealed in VFS ledger', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20', icon: '💎' },
];

const AGENT_PROFILES: Record<SwarmAgentId, { name: string; avatar: string; role: string; color: string }> = {
  MERLIN_OMEGA: { name: 'Merlin Ω', avatar: '🧙‍♂️', role: 'Orchestrator & Router', color: '#00F0FF' },
  SIR_ARCHITECT: { name: 'Sir Architect', avatar: '🏛️', role: 'Code Generator & Tokenizer', color: '#D4AF37' },
  SIR_SCOUT: { name: 'Sir Scout', avatar: '🦅', role: 'Competitive Intelligence & SEO', color: '#38BDF8' },
  SIR_WARDEN: { name: 'Sir Warden', avatar: '🛡️', role: 'Compliance & Z3 Invariants', color: '#A855F7' },
  SIR_ANIMATOR: { name: 'Sir Animator', avatar: '✨', role: 'Motion Physics & 3D Drone', color: '#EC4899' },
  LADY_APIS: { name: 'Lady APIS', avatar: '⚡', role: 'ETL & Memory Map Slots', color: '#10B981' },
  SIR_SCRIBE: { name: 'Sir Scribe', avatar: '📜', role: 'Blueprint Specs & Doc Gen', color: '#F59E0B' }
};

const INITIAL_KANBAN_TASKS: SwarmKanbanTask[] = [
  {
    id: 'task-1',
    title: 'Decompose AI Real Estate Portal Scope',
    summary: 'Clarify buyer tiers, property valuation feeds, and map projection requirements.',
    stage: 'INTENT',
    assignedAgent: 'MERLIN_OMEGA',
    priority: 'CRITICAL',
    progress: 100,
    memoryBudgetMib: 0.08,
    latencyMs: 1.4,
    artifactsCount: 3,
    updatedAt: 'Just now'
  },
  {
    id: 'task-2',
    title: 'Auth Protocol Architectural Fork',
    summary: 'Choose token validation strategy for multi-tenant property broker accounts.',
    stage: 'SPEC',
    assignedAgent: 'SIR_WARDEN',
    priority: 'HIGH',
    progress: 45,
    memoryBudgetMib: 0.11,
    latencyMs: 3.2,
    z3FormalContract: '(assert (forall ((u User)) (=> (isAuthenticated u) (validClaims u))))',
    artifactsCount: 2,
    updatedAt: '2m ago',
    smartQuestion: {
      id: 'sq-auth-1',
      title: 'Choose Multi-Tenant Auth Architecture',
      description: 'Sir Warden has flagged two competing authorization models for broker data privacy.',
      category: 'SECURITY_PROTOCOL',
      status: 'PENDING_CHOICE',
      options: [
        {
          id: 'opt-oauth-pkce',
          label: 'OAuth 2.0 + PKCE with Firebase RLS',
          description: 'Client-side tokens, fine-grained Firestore security rules, sub-5ms verification.',
          tradeoffs: 'Higher client flexibility, zero server secret risk in browser.',
          recommended: true,
          isZ3Compliant: true
        },
        {
          id: 'opt-jwt-stateless',
          label: 'Stateless Ed25519 Signed JWTs',
          description: 'Edge-verified signed tokens stored in ephemeral Wasmtime memory slots.',
          tradeoffs: 'Requires custom token revocation list synchronization.',
          isZ3Compliant: true
        }
      ]
    }
  },
  {
    id: 'task-3',
    title: 'Topological Role Allocation Matrix',
    summary: 'Coordinate parallel task compilation & capability lease contracts across worker threads.',
    stage: 'PLAN',
    assignedAgent: 'SIR_ARCHITECT',
    priority: 'HIGH',
    progress: 85,
    memoryBudgetMib: 0.15,
    latencyMs: 2.1,
    artifactsCount: 5,
    updatedAt: '4m ago'
  },
  {
    id: 'task-3b',
    title: 'Topological DAG Dependency Graph',
    summary: 'Assemble non-blocking acyclic execution nodes for concurrent Wasmtime workers.',
    stage: 'DAG',
    assignedAgent: 'MERLIN_OMEGA',
    priority: 'CRITICAL',
    progress: 70,
    memoryBudgetMib: 0.14,
    latencyMs: 1.8,
    artifactsCount: 4,
    updatedAt: '6m ago'
  },
  {
    id: 'task-4',
    title: 'Stripe Webhook Pay-Gate Sandbox',
    summary: 'Compile zero-trust idempotency engine in QuickJS ephemeral workcell.',
    stage: 'SANDBOX',
    assignedAgent: 'LADY_APIS',
    priority: 'CRITICAL',
    progress: 60,
    memoryBudgetMib: 0.19,
    latencyMs: 4.8,
    z3FormalContract: '(assert (forall ((inv Invoice)) (=> (paid inv) (issuedReceipt inv))))',
    artifactsCount: 4,
    updatedAt: '8m ago',
    smartQuestion: {
      id: 'sq-stripe-1',
      title: 'Payment Settlement Flow Selection',
      description: 'Lady APIS requires confirmation on recurring billing interval webhooks.',
      category: 'INTEGRATION_TIER',
      status: 'PENDING_CHOICE',
      options: [
        {
          id: 'opt-stripe-elements',
          label: 'Embedded Stripe Elements',
          description: 'Seamless in-app checkout without leaving portal page.',
          tradeoffs: 'Requires PCI compliance SAQ-A adherence.',
          recommended: true,
          isZ3Compliant: true
        },
        {
          id: 'opt-stripe-hosted',
          label: 'Stripe Hosted Checkout URL',
          description: 'Redirects to Stripe secure domain, instant zero-maintenance.',
          tradeoffs: 'Introduces a 1-click external navigation jump.',
          isZ3Compliant: true
        }
      ]
    }
  },
  {
    id: 'task-5',
    title: 'Z3 SMT Invariant & Gideon TDD Suite',
    summary: 'Validate sub-0.7% theorem proofs across all 5 failure archetypes.',
    stage: 'VERIFICATION',
    assignedAgent: 'SIR_WARDEN',
    priority: 'CRITICAL',
    progress: 90,
    memoryBudgetMib: 0.09,
    latencyMs: 3.6,
    z3FormalContract: '(check-sat) ; Proved SAT with 0 counter-examples',
    artifactsCount: 6,
    updatedAt: '12m ago'
  },
  {
    id: 'task-6',
    title: 'AuraEstates Portal Genesis Seed VFS',
    summary: 'All invariants verified. Sealed bundle committed to Hydra VFS worktree ledger.',
    stage: 'COMMITTED',
    assignedAgent: 'SIR_SCRIBE',
    priority: 'MEDIUM',
    progress: 100,
    memoryBudgetMib: 0.06,
    latencyMs: 1.1,
    artifactsCount: 8,
    updatedAt: '15m ago'
  }
];

export function SwarmKanbanView({
  onNotify,
  onSwitchToVibe,
  onSwitchToTitanCore
}: SwarmKanbanViewProps) {
  const [tasks, setTasks] = useState<SwarmKanbanTask[]>(INITIAL_KANBAN_TASKS);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<SwarmAgentId | 'ALL'>('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [activeSmartQuestionTask, setActiveSmartQuestionTask] = useState<SwarmKanbanTask | null>(null);
  const [activeDetailTask, setActiveDetailTask] = useState<SwarmKanbanTask | null>(null);
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [newIntentInput, setNewIntentInput] = useState('');
  const [showDecomposeModal, setShowDecomposeModal] = useState(false);

  // Advance task to next stage
  const handleAdvanceTask = (taskId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const stageOrder: SwarmKanbanStage[] = ['INTENT', 'SPEC', 'PLAN', 'DAG', 'SANDBOX', 'VERIFICATION', 'COMMITTED'];
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const currentIndex = stageOrder.indexOf(task.stage);
        if (currentIndex < stageOrder.length - 1) {
          const nextStage = stageOrder[currentIndex + 1];
          onNotify(`⚡ Task "${task.title}" advanced to [${nextStage}]!`, 'success');
          return {
            ...task,
            stage: nextStage,
            progress: nextStage === 'COMMITTED' ? 100 : Math.min(100, task.progress + 20),
            updatedAt: 'Just now'
          };
        }
      }
      return task;
    }));
  };

  // Resolve a Smart Question Choice
  const handleResolveSmartQuestion = (taskId: string, optionId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && task.smartQuestion) {
        const chosenOption = task.smartQuestion.options.find(o => o.id === optionId);
        onNotify(`🔱 Architectural Fork Resolved: Selected "${chosenOption?.label}"! Card unblocked and progressing.`, 'success');
        
        // Advance stage as question is resolved
        const stageOrder: SwarmKanbanStage[] = ['INTENT', 'SPEC', 'PLAN', 'DAG', 'SANDBOX', 'VERIFICATION', 'COMMITTED'];
        const currentIndex = stageOrder.indexOf(task.stage);
        const nextStage = currentIndex < stageOrder.length - 1 ? stageOrder[currentIndex + 1] : task.stage;

        return {
          ...task,
          stage: nextStage,
          progress: Math.min(100, task.progress + 25),
          smartQuestion: {
            ...task.smartQuestion,
            status: 'RESOLVED',
            selectedOptionId: optionId,
            resolvedAt: new Date().toLocaleTimeString(),
            resolvedBy: 'Product Owner'
          }
        };
      }
      return task;
    }));
    setActiveSmartQuestionTask(null);
  };

  // Decompose a new intent into 7 kanban tasks
  const handleDecomposeNewIntent = () => {
    if (!newIntentInput.trim()) return;
    setIsDecomposing(true);
    const intentTitle = newIntentInput.trim();
    setShowDecomposeModal(false);
    setNewIntentInput('');

    setTimeout(() => {
      const generatedTasks: SwarmKanbanTask[] = [
        {
          id: `task-gen-${Date.now()}-1`,
          title: `[Ingress] ${intentTitle.slice(0, 35)}...`,
          summary: `Decompose requirements for: "${intentTitle}"`,
          stage: 'INTENT',
          assignedAgent: 'MERLIN_OMEGA',
          priority: 'CRITICAL',
          progress: 100,
          memoryBudgetMib: 0.08,
          latencyMs: 1.2,
          artifactsCount: 2,
          updatedAt: 'Just now'
        },
        {
          id: `task-gen-${Date.now()}-2`,
          title: `[Spec & Contracts] Schema Definition`,
          summary: `Generate MsgPack schemas and ADRs for ${intentTitle.slice(0, 25)}`,
          stage: 'SPEC',
          assignedAgent: 'SIR_SCRIBE',
          priority: 'HIGH',
          progress: 50,
          memoryBudgetMib: 0.12,
          latencyMs: 2.4,
          artifactsCount: 3,
          updatedAt: 'Just now'
        }
      ];

      setTasks(prev => [...generatedTasks, ...prev]);
      setIsDecomposing(false);
      onNotify(`✨ Decomposed intent into 6-Stage Swarm Kanban pipeline tasks!`, 'success');
    }, 800);
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedAgentFilter !== 'ALL' && task.assignedAgent !== selectedAgentFilter) return false;
    if (searchFilter && !task.title.toLowerCase().includes(searchFilter.toLowerCase()) && !task.summary.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Kanban Header */}
      <div className="bg-gradient-to-r from-[#14120A] via-[#0D0B14] to-[#121A1A] border border-[#D4AF37]/30 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] rounded-full text-[10px] font-black tracking-widest uppercase">
                TIER 2 • THE SWARM KANBAN
              </span>
              <span className="text-gray-400 text-xs">• 6-Stage Visual State Machine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Card-Based Swarm Orchestrator & Smart Questions</span>
              <Sliders size={20} className="text-[#D4AF37]" />
            </h2>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              Track tasks seamlessly from Intent to Committed. Sub-agents pause on architectural forks with Smart Question cards so you make decisions in 1 click instead of debugging config panics.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Auto-Decompose Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDecomposeModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black font-black text-xs rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Decompose New Intent</span>
            </motion.button>

            {/* Quick Switch */}
            <button
              onClick={onSwitchToVibe}
              className="px-3 py-2 bg-[#12121E] hover:bg-[#1A1A2C] border border-[#00F0FF]/40 text-[#00F0FF] rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Switch to Tier 1: Vibe Shell"
            >
              <Zap size={13} />
              <span>Vibe Mode</span>
            </button>
            <button
              onClick={onSwitchToTitanCore}
              className="px-3 py-2 bg-[#12121E] hover:bg-[#1A1A2C] border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Switch to Tier 3: Titan Core"
            >
              <Cpu size={13} />
              <span>Titan Core</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-800/80 text-xs">
          {/* Agent Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[10px] text-gray-500 font-bold uppercase mr-1">Assignee:</span>
            <button
              onClick={() => setSelectedAgentFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                selectedAgentFilter === 'ALL' ? 'bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37]' : 'bg-[#101018] border border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              All Agents ({tasks.length})
            </button>
            {(Object.keys(AGENT_PROFILES) as SwarmAgentId[]).map((agentKey) => {
              const agent = AGENT_PROFILES[agentKey];
              const count = tasks.filter(t => t.assignedAgent === agentKey).length;
              return (
                <button
                  key={agentKey}
                  onClick={() => setSelectedAgentFilter(agentKey)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all whitespace-nowrap ${
                    selectedAgentFilter === agentKey 
                      ? 'bg-purple-950 border border-purple-400 text-purple-300 shadow' 
                      : 'bg-[#101018] border border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{agent.avatar}</span>
                  <span>{agent.name}</span>
                  <span className="text-[9px] px-1 bg-black/40 rounded">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-gray-500" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search Kanban tasks..."
              className="pl-7 pr-3 py-1.5 bg-[#080810] border border-gray-800 rounded-lg text-xs text-white placeholder:text-gray-600 outline-none focus:border-[#D4AF37] w-48"
            />
          </div>
        </div>
      </div>

      {/* 7-COLUMN KANBAN BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3 items-start">
        {KANBAN_COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter(t => t.stage === col.stage);
          return (
            <div
              key={col.stage}
              className="bg-[#090912] border border-[#1A1A28] rounded-xl p-3 flex flex-col min-h-[560px] space-y-3 shadow-lg"
            >
              {/* Column Header */}
              <div className={`p-2 rounded-lg border flex items-center justify-between ${col.color}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{col.icon}</span>
                  <div>
                    <div className="text-xs font-black tracking-wide">{col.title}</div>
                    <div className="text-[9px] opacity-80">{col.subtitle}</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-black/40">
                  {colTasks.length}
                </span>
              </div>

              {/* Column Task Cards */}
              <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5 custom-scroll">
                {colTasks.map((task) => {
                  const agent = AGENT_PROFILES[task.assignedAgent];
                  const hasPendingQuestion = task.smartQuestion && task.smartQuestion.status === 'PENDING_CHOICE';

                  return (
                    <motion.div
                      key={task.id}
                      layout
                      onClick={() => setActiveDetailTask(task)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                        hasPendingQuestion
                          ? 'bg-[#181208] border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                          : 'bg-[#0D0D18] hover:bg-[#121222] border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {/* Top Row: Priority & Agent Badge */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1">
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            task.priority === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                            task.priority === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                            'bg-blue-950 text-blue-300 border border-blue-500/40'
                          }`}>
                            {task.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold" style={{ color: agent?.color }}>
                          <span>{agent?.avatar}</span>
                          <span className="truncate max-w-[80px]">{agent?.name}</span>
                        </div>
                      </div>

                      {/* Title & Summary */}
                      <h4 className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug mb-1">
                        {task.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed mb-2">
                        {task.summary}
                      </p>

                      {/* SMART QUESTION PROMPT CALLOUT (If fork exists) */}
                      {hasPendingQuestion && (
                        <div className="bg-amber-950/80 border border-amber-500/60 rounded-lg p-2 mb-2 space-y-1.5">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300">
                            <AlertTriangle size={12} className="text-amber-400 animate-pulse" />
                            <span>Architectural Fork: Input Needed</span>
                          </div>
                          <p className="text-[10px] text-gray-300 leading-snug">
                            {task.smartQuestion?.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSmartQuestionTask(task);
                            }}
                            className="w-full py-1 bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] rounded flex items-center justify-center gap-1 transition-all shadow"
                          >
                            <HelpCircle size={10} />
                            <span>Resolve Architectural Choice</span>
                          </button>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden mb-2">
                        <div 
                          className="bg-gradient-to-r from-[#00F0FF] to-emerald-400 h-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>

                      {/* Metrics Footer */}
                      <div className="flex items-center justify-between text-[9px] text-gray-500 font-mono">
                        <span>{task.memoryBudgetMib} MiB • {task.latencyMs}ms</span>
                        
                        {/* Advance Arrow Action */}
                        {col.stage !== 'COMMITTED' && !hasPendingQuestion && (
                          <button
                            onClick={(e) => handleAdvanceTask(task.id, e)}
                            className="text-gray-400 hover:text-[#D4AF37] p-0.5 rounded hover:bg-gray-800 transition-colors flex items-center gap-0.5 text-[9px]"
                            title="Advance to next state machine stage"
                          >
                            <span>Next</span>
                            <ArrowRight size={10} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="h-32 border border-dashed border-gray-800/80 rounded-xl flex items-center justify-center text-center p-3 text-[11px] text-gray-600">
                    No active tasks in {col.title}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🛡️ THE IRON GATE PORTAL & SMART DECISION CONTROLS */}
      <div className="bg-gradient-to-r from-[#0B0C18] via-[#101428] to-[#0A0D18] border-2 border-emerald-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 text-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold uppercase tracking-wider border border-emerald-500/50">
                  IRON GATE PORTAL ACTIVE
                </span>
                <span className="text-xs text-gray-400">• Gideon Protocol Pass Mandatory</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Pre-Deployment Verification & Smart Decision Terminal
              </h3>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-[#060812] border border-emerald-500/30 rounded-xl text-center">
              <div className="text-[9px] text-gray-400 font-bold">UNIT TESTS</div>
              <div className="text-xs font-mono font-black text-emerald-400">100% (42/42 PASS)</div>
            </div>
            <div className="px-3 py-1.5 bg-[#060812] border border-cyan-500/30 rounded-xl text-center">
              <div className="text-[9px] text-gray-400 font-bold">CODE LINT</div>
              <div className="text-xs font-mono font-black text-cyan-400">0 ERRORS</div>
            </div>
            <div className="px-3 py-1.5 bg-[#060812] border border-purple-500/30 rounded-xl text-center">
              <div className="text-[9px] text-gray-400 font-bold">Z3 INVARIANTS</div>
              <div className="text-xs font-mono font-black text-purple-300">SAT (0 DRIFT)</div>
            </div>
          </div>
        </div>

        {/* SMART DECISION BUTTONS */}
        <div className="p-4 bg-[#05060D] border border-gray-800/90 rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-300 space-y-0.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>⚡ Human-Friendly Action Controls</span>
              <span className="text-[10px] text-gray-500 font-normal">(Replaces terminal debugging panics)</span>
            </span>
            <p className="text-[11px] text-gray-400">
              Trigger autonomous migration verification, sandbox rollback, or instant staging deploy.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNotify('✅ Schema Migration Approved! All Firestore RLS contracts & MsgPack schemas locked.', 'success')}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>Approve Schema Migration</span>
            </button>

            <button
              onClick={() => onNotify('🔄 Rolled back workspace to last verified stable VFS checkpoint (Commit #000a42).', 'warning')}
              className="px-3 py-2 bg-[#121422] hover:bg-[#1A1C30] border border-amber-500/40 text-amber-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Clock size={13} />
              <span>Rollback to Last Stable</span>
            </button>

            <button
              onClick={() => onNotify('🚀 Deployed isolated microcubicVM sandbox with hot-swappable Dioxus MFE preview!', 'success')}
              className="px-3 py-2 bg-[#121422] hover:bg-[#1A1C30] border border-cyan-500/40 text-cyan-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap size={13} />
              <span>Deploy to Ephemeral Sandbox</span>
            </button>
          </div>
        </div>
      </div>

      {/* SMART QUESTION RESOLUTION DRAWER / MODAL */}
      {activeSmartQuestionTask && activeSmartQuestionTask.smartQuestion && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C0F1A] border border-amber-500/60 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Smart Question: Architectural Fork</h3>
                  <p className="text-[11px] text-amber-400 font-mono">{activeSmartQuestionTask.title}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveSmartQuestionTask(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-gray-300 font-medium">
                {activeSmartQuestionTask.smartQuestion.description}
              </div>
              <div className="text-[11px] text-gray-400">
                Choose the preferred direction to unblock sub-agents and bind the formal architectural decision record (ADR).
              </div>
            </div>

            {/* Option Cards */}
            <div className="space-y-3">
              {activeSmartQuestionTask.smartQuestion.options.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleResolveSmartQuestion(activeSmartQuestionTask.id, opt.id)}
                  className="p-3.5 rounded-xl bg-[#070912] hover:bg-[#0F1424] border border-gray-800 hover:border-amber-400 transition-all cursor-pointer space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                      <span>{opt.label}</span>
                      {opt.recommended && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded font-bold">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-purple-950 text-purple-300 rounded font-mono">
                      Z3 Proved
                    </span>
                  </div>

                  <p className="text-xs text-gray-300">{opt.description}</p>
                  
                  <div className="text-[10px] text-gray-500 pt-1 border-t border-gray-800">
                    <span className="text-amber-400/80">Tradeoffs: </span>
                    <span>{opt.tradeoffs}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveSmartQuestionTask(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-xl"
              >
                Decide Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TASK DETAIL DRAWER */}
      {activeDetailTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C0F1A] border border-cyan-500/40 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{AGENT_PROFILES[activeDetailTask.assignedAgent]?.avatar}</span>
                <div>
                  <h3 className="text-sm font-bold text-white">{activeDetailTask.title}</h3>
                  <p className="text-[11px] text-cyan-400">Assigned to {AGENT_PROFILES[activeDetailTask.assignedAgent]?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveDetailTask(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-[10px] text-gray-500 uppercase font-bold">Summary</div>
                <p className="text-gray-200 mt-0.5">{activeDetailTask.summary}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-[#060812] border border-gray-800 rounded-lg">
                  <div className="text-[10px] text-gray-500 font-bold">Stage</div>
                  <div className="font-bold text-cyan-300">{activeDetailTask.stage}</div>
                </div>
                <div className="p-2.5 bg-[#060812] border border-gray-800 rounded-lg">
                  <div className="text-[10px] text-gray-500 font-bold">Memory Budget</div>
                  <div className="font-bold text-amber-300">{activeDetailTask.memoryBudgetMib} MiB</div>
                </div>
              </div>

              {activeDetailTask.z3FormalContract && (
                <div>
                  <div className="text-[10px] text-purple-400 font-bold">Z3 SMT-LIB Invariant Assertion</div>
                  <pre className="p-2.5 bg-[#05050A] border border-purple-500/30 rounded-lg text-[10px] font-mono text-purple-300 overflow-x-auto mt-1">
                    {activeDetailTask.z3FormalContract}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-800">
              <span className="text-[10px] text-gray-500">Artifacts: {activeDetailTask.artifactsCount} files generated</span>
              <button
                onClick={() => {
                  handleAdvanceTask(activeDetailTask.id);
                  setActiveDetailTask(null);
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs rounded-xl"
              >
                Advance Stage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DECOMPOSE NEW INTENT MODAL */}
      {showDecomposeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C0F1A] border border-[#D4AF37]/50 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#D4AF37]" />
                <h3 className="text-sm font-bold text-white">Decompose Intent into 6-Stage Swarm Tasks</h3>
              </div>
              <button
                onClick={() => setShowDecomposeModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-gray-300 font-bold">Feature or Product Intent Description</label>
              <textarea
                value={newIntentInput}
                onChange={(e) => setNewIntentInput(e.target.value)}
                placeholder="e.g. Build an autonomous real estate valuation webhook with Stripe invoice crystallization..."
                className="w-full h-28 p-3 bg-[#060812] border border-gray-700 focus:border-[#D4AF37] rounded-xl text-xs text-white outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDecomposeModal(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDecomposeNewIntent}
                disabled={!newIntentInput.trim() || isDecomposing}
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#C29B27] text-black font-black text-xs rounded-xl shadow"
              >
                {isDecomposing ? 'Decomposing Tasks...' : 'Generate 6-Stage Tasks'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
