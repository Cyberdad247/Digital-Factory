/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  Shield, 
  Sparkles, 
  Flame, 
  Terminal, 
  Radio, 
  Boxes, 
  Hammer, 
  Trophy, 
  Swords, 
  Layers, 
  Workflow, 
  Mic, 
  Volume2, 
  Settings, 
  Cpu, 
  FileCode2,
  Zap,
  Network,
  Server
} from 'lucide-react';
import { Notification } from './components/Notification';
import { TitanOmniForgeCartridge } from './components/TitanOmniForgeCartridge';
import { BlueprintOSStudio } from './components/BlueprintOSStudio';
import { HiveIDEStudio } from './components/HiveIDEStudio';
import { SwarmCommandCenterStudio } from './components/SwarmCommandCenterStudio';
import { GeminiNexusStudio } from './components/GeminiNexusStudio';
import { GoogleWorkspaceHub } from './components/GoogleWorkspaceHub';
import { MCPServerForgeStudio } from './components/MCPServerForgeStudio';
import { MerlinCognitivePlayground } from './components/MerlinCognitivePlayground';
import { GenesisIntakeCartridgeStudio } from './components/GenesisIntakeCartridgeStudio';
import { GenesisCartridgeInstance } from './types';
import { SpatialVoiceHUD, VoiceTaskParsed, VoiceViewNavigation, VoiceHiveAction } from './components/SpatialVoiceHUD';
import { HolographicWorkspaceContainer } from './components/HolographicWorkspaceContainer';
import { CartridgeSettingsModal, DEFAULT_CARTRIDGE_SETTINGS, CartridgeSettingsState } from './components/CartridgeSettingsModal';
import { EvolutionMatrixModal } from './components/EvolutionMatrixModal';
import { KnightAvatarOverlay } from './components/KnightAvatarOverlay';
import { AnyaChatbotBubble } from './components/AnyaChatbotBubble';
import { TopologicalGraphVisualizer } from './components/TopologicalGraphVisualizer';
import { getModeSystemInstruction } from './services/modeSystemInstructionEngine';
import { HeaderHardwareResourceChart } from './components/HeaderHardwareResourceChart';

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

export default function App() {
  const [latticeTier, setLatticeTier] = useState('V1000_EXCALIBUR_ASCENDED');
  const [activeTab, setActiveTab] = useState<MainView>('MERLIN_AGENCY');
  const activeModeSpec = getModeSystemInstruction(activeTab);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);
  const [isVoiceHUDOpen, setIsVoiceHUDOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isEvolveModalOpen, setIsEvolveModalOpen] = useState(false);
  const [voiceIntent, setVoiceIntent] = useState<string>('');
  const [injectedVoiceTask, setInjectedVoiceTask] = useState<(VoiceTaskParsed & { timestamp: number }) | null>(null);
  const [injectedHiveAction, setInjectedHiveAction] = useState<{ action: 'SMART_SORT'; timestamp: number } | null>(null);
  const [cartridgeSettings, setCartridgeSettings] = useState<CartridgeSettingsState>(DEFAULT_CARTRIDGE_SETTINGS);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const [activeGenesisCartridge, setActiveGenesisCartridge] = useState<GenesisCartridgeInstance | null>(null);

  const notify = (message: string, type: 'success' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Hot-swap handler enforcing resource constraint partitioning & system instruction binding
  const handleHotSwapMode = (targetMode: MainView) => {
    if (targetMode === activeTab) return;
    const nextSpec = getModeSystemInstruction(targetMode);
    setActiveTab(targetMode);
    notify(
      `⚡ Hot-Swapped to ${nextSpec.title}: Quarantined unneeded subsystems, bound to [${nextSpec.instructionId}] (${nextSpec.resourceConstraint.allocatedRamGB}GB RAM / ${nextSpec.resourceConstraint.activeCores} Cores).`,
      'success'
    );
  };

  // Keyboard shortcut: Ctrl+E or Cmd+E to toggle Evolution Matrix
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsEvolveModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleEvolutionComplete = (newTier: string) => {
    setLatticeTier(newTier);
    notify(`🔥 Singularity Evolution Complete: Lattice ascended to ${newTier}!`, 'success');
  };

  const handleVoiceIntentDispatched = (parsedIntent: {
    rawTranscript: string;
    hudXml: string;
    merlinRoute: string;
    lancelotTasks: string[];
    galahadTasks: string[];
    domain: string;
    taskCapture?: VoiceTaskParsed;
    viewNavigation?: VoiceViewNavigation;
    hiveAction?: VoiceHiveAction;
  }) => {
    setVoiceIntent(parsedIntent.rawTranscript);
    setIsVoiceProcessing(true);
    setTimeout(() => setIsVoiceProcessing(false), 4000);
    
    // 1. Direct Voice Hive Action Execution (e.g. Sort Hive tasks)
    if (parsedIntent.hiveAction) {
      setInjectedHiveAction({
        action: parsedIntent.hiveAction.actionType,
        timestamp: Date.now()
      });
      handleHotSwapMode('HIVE_IDE');
      notify(
        '⚡ Voice Command Executed: Smart Sort activated in Hive IDE (Critical & Delayed tasks prioritized)!',
        'success'
      );
      return;
    }

    // 2. Direct Voice View Navigation Routing
    if (parsedIntent.viewNavigation) {
      if (parsedIntent.viewNavigation.isModalTrigger === 'EVOLVE') {
        setIsEvolveModalOpen(true);
        notify('⚡ Evolution Matrix initiated from Spatial Voice Command!', 'success');
        return;
      }
      if (parsedIntent.viewNavigation.isModalTrigger === 'SETTINGS') {
        setIsSettingsModalOpen(true);
        notify('⚡ Cartridge Settings opened from Spatial Voice Command!', 'success');
        return;
      }
      if (parsedIntent.viewNavigation.targetView) {
        handleHotSwapMode(parsedIntent.viewNavigation.targetView);
        notify(`⚡ Switched to ${parsedIntent.viewNavigation.matchedPhrase} via Spatial Voice HUD!`, 'success');
        return;
      }
    }

    // 3. Direct Voice Task Capture Ingestion
    if (parsedIntent.taskCapture) {
      setInjectedVoiceTask({
        ...parsedIntent.taskCapture,
        timestamp: Date.now()
      });
      handleHotSwapMode('HIVE_IDE');
      notify(
        `⚡ Voice task "${parsedIntent.taskCapture.taskTitle}" with [${parsedIntent.taskCapture.priority}] priority injected into Hive IDE!`,
        'success'
      );
      return;
    }

    // 4. Fallback Evolution check
    if (parsedIntent.domain.includes('Evolution') || parsedIntent.rawTranscript.toLowerCase().includes('evolve')) {
      setIsEvolveModalOpen(true);
      notify('Evolution Matrix initiated from Spatial Voice Command!', 'success');
      return;
    }

    // 5. Default intent routing
    if (parsedIntent.merlinRoute.includes('BLUEPRINT') || parsedIntent.merlinRoute.includes('SPEC')) {
      handleHotSwapMode('BLUEPRINT_OS');
    } else if (parsedIntent.merlinRoute.includes('IDE') || parsedIntent.merlinRoute.includes('SWARM')) {
      handleHotSwapMode('HIVE_IDE');
    } else {
      handleHotSwapMode('MERLIN_AGENCY');
    }
    notify(`Voice Command "${parsedIntent.rawTranscript.slice(0, 30)}..." locked into Tier 1 HUD!`, 'success');
  };

  const handleOpenSettings = (targetTab?: string) => {
    setIsSettingsModalOpen(true);
  };

  return (
    <div className="h-screen w-screen bg-[#07070B] text-gray-200 flex flex-col overflow-hidden font-mono selection:bg-[#D4AF37] selection:text-black relative z-10">
      <div className="scanline-overlay"></div>
      
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {/* Cartridge Harness Configuration Modal */}
      <CartridgeSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        activeCartridgeTab={activeTab}
        settings={cartridgeSettings}
        onSaveSettings={setCartridgeSettings}
        onNotify={notify}
      />

      {/* Spatial Voice HUD Modal */}
      <SpatialVoiceHUD
        isOpen={isVoiceHUDOpen}
        onClose={() => setIsVoiceHUDOpen(false)}
        onDispatchIntent={handleVoiceIntentDispatched}
        onNotify={notify}
        currentActiveView={activeTab}
        onSwitchView={handleHotSwapMode}
      />

      {/* Omni-Evolution Matrix Modal */}
      <EvolutionMatrixModal
        isOpen={isEvolveModalOpen}
        onClose={() => setIsEvolveModalOpen(false)}
        onNotify={notify}
        onEvolutionComplete={handleEvolutionComplete}
        currentTier={latticeTier}
      />

      {/* Floating Holographic Knight Avatar HUD */}
      <KnightAvatarOverlay
        onNotify={notify}
        onOpenVoiceHUD={() => setIsVoiceHUDOpen(true)}
        onOpenEvolveModal={() => setIsEvolveModalOpen(true)}
        activeViewTitle={activeTab}
        isProcessingVoiceIntent={isVoiceProcessing || isVoiceHUDOpen}
      />

      {/* Floating Helper Knight Anya Prompt Alchemist & Navigation Bubble */}
      <AnyaChatbotBubble
        onHotSwapMode={handleHotSwapMode}
        onNotify={notify}
        onInjectVoiceTask={(task) => {
          setInjectedVoiceTask({
            isTaskCapture: true,
            taskTitle: task.title,
            priority: (task.priority as any) || 'CRITICAL',
            category: (task.category as any) || 'FEATURE',
            targetKnight: 'LANCELOT',
            rawCommand: task.title,
            timestamp: Date.now()
          });
        }}
        onOpenEvolution={() => setIsEvolveModalOpen(true)}
        currentStudio={activeTab}
      />

      {/* Compact Top Header Bar */}
      <header className="hud-panel px-4 py-2.5 border-b border-[#2A2A40] flex flex-wrap justify-between items-center gap-3 shrink-0 bg-[#0B0B12]/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#00F0FF] animate-ping absolute opacity-75"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#D4AF37] relative z-10 shadow-[0_0_10px_#D4AF37]"></div>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-widest uppercase text-white flex items-center gap-2">
              <span className="arc-text">CAMELOT-OS</span>
              <span className="text-gray-600 font-normal">/</span>
              <span className="gold-text">MERLIN FORGE</span>
              <span className={`text-[9px] font-black text-black px-2 py-0.5 rounded shadow-[0_0_10px_rgba(0,240,255,0.4)] ${
                latticeTier.includes('V2000')
                  ? 'bg-gradient-to-r from-emerald-400 to-[#00F0FF]'
                  : 'bg-gradient-to-r from-[#D4AF37] to-[#00F0FF]'
              }`}>
                {latticeTier.includes('V2000') ? 'V2000_SINGULARITY' : 'TRI_GLASS_AGENCY'}
              </span>
            </h1>
            <p className="text-[10px] text-[#00F0FF]/80 uppercase tracking-widest font-bold hidden sm:block">
              Arthurian Omni-Digital Forge • Sovereign WASM Master Architecture v4.0
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          {/* Initiate //evolve Header Button */}
          <button
            id="btn-header-evolve"
            onClick={() => setIsEvolveModalOpen(true)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-lg ${
              latticeTier.includes('V2000')
                ? 'bg-emerald-950 border border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-gradient-to-r from-[#00F0FF]/20 to-[#D4AF37]/20 border border-[#00F0FF] text-[#00F0FF] hover:text-white hover:bg-[#00F0FF]/30 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
            }`}
            title="Initiate //evolve Ascension (Ctrl+E)"
          >
            <Zap size={13} className="text-[#D4AF37] animate-pulse" />
            <span>//EVOLVE</span>
          </button>

          {/* Spatial Voice HUD Button */}
          <button
            id="btn-voice-hud-listen"
            onClick={() => setIsVoiceHUDOpen(true)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-2 bg-[#00F0FF]/10 border border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF]/20 hover:text-white transition-all cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.25)]"
            title="Open Spatial Voice HUD"
          >
            <Mic size={13} className="animate-pulse" />
            <span>VOICE HUD</span>
          </button>

          {/* Global Cartridge Settings Button */}
          <button
            id="btn-cartridge-settings"
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-[#161626] border border-[#303048] text-gray-300 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all cursor-pointer"
            title="Configure Cartridge Settings (Agency, Blueprint OS, Hive IDE)"
          >
            <Settings size={13} />
            <span className="hidden sm:inline">DIALS</span>
          </button>

          {/* Real-Time Hardware Resource Consumption HUD & Popover Chart */}
          <HeaderHardwareResourceChart activeTab={activeTab} onOpenSettings={handleOpenSettings} />
        </div>
      </header>

      {/* Primary Multi-Frontend Navigation Bar with Mode-Specific Hot-Swapping */}
      <nav className="px-4 py-2 bg-[#090910] border-b border-[#1E1E2C] flex items-center gap-2 overflow-x-auto shrink-0 text-xs">
        {/* Frontend 1: Merlin's Software Agency */}
        <motion.button
          id="nav-merlin-agency"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleHotSwapMode('MERLIN_AGENCY')}
          className={`flex items-center gap-2 text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg font-black transition-all cursor-pointer shrink-0 ${
            activeTab === 'MERLIN_AGENCY'
              ? 'bg-[#D4AF37]/15 border-2 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.35)]'
              : 'hover:bg-[#151522] border border-[#222234] text-gray-400 hover:text-[#D4AF37]'
          }`}
        >
          <Flame size={14} className={activeTab === 'MERLIN_AGENCY' ? 'animate-pulse drop-shadow-[0_0_5px_#D4AF37]' : ''} />
          <span>1. Merlin's Agency</span>
        </motion.button>

        {/* Frontend 1.5: Cognitive Playground & Archmage Debate Chamber */}
        <motion.button
          id="nav-cognitive-playground"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleHotSwapMode('COGNITIVE_PLAYGROUND')}
          className={`flex items-center gap-2 text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg font-black transition-all cursor-pointer shrink-0 ${
            activeTab === 'COGNITIVE_PLAYGROUND'
              ? 'bg-purple-600/20 border-2 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.35)]'
              : 'hover:bg-[#151522] border border-[#222234] text-gray-400 hover:text-purple-300'
          }`}
        >
          <Sparkles size={14} className={activeTab === 'COGNITIVE_PLAYGROUND' ? 'animate-pulse drop-shadow-[0_0_5px_#C084FC]' : ''} />
          <span>1.5 Archmage Debate</span>
        </motion.button>

        {/* Frontend 1.8: Genesis Intake Cartridge Studio */}
        <motion.button
          id="nav-genesis-intake"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleHotSwapMode('GENESIS_INTAKE')}
          className={`flex items-center gap-2 text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg font-black transition-all cursor-pointer shrink-0 ${
            activeTab === 'GENESIS_INTAKE'
              ? 'bg-rose-600/20 border-2 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.35)]'
              : 'hover:bg-[#151522] border border-[#222234] text-gray-400 hover:text-rose-300'
          }`}
        >
          <Flame size={14} className={activeTab === 'GENESIS_INTAKE' ? 'animate-pulse drop-shadow-[0_0_5px_#FB7185]' : ''} />
          <span>1.8 Genesis Intake</span>
        </motion.button>

        {/* Frontend 2: Blueprint OS (The Oracle Glass) */}
        <motion.button
          id="nav-blueprint-os"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleHotSwapMode('BLUEPRINT_OS')}
          className={`flex items-center gap-2 text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg font-black transition-all cursor-pointer shrink-0 ${
            activeTab === 'BLUEPRINT_OS'
              ? 'bg-[#00F0FF]/15 border-2 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.35)]'
              : 'hover:bg-[#151522] border border-[#222234] text-gray-400 hover:text-[#00F0FF]'
          }`}
        >
          <Layers size={14} className={activeTab === 'BLUEPRINT_OS' ? 'animate-pulse drop-shadow-[0_0_5px_#00F0FF]' : ''} />
          <span>2. Blueprint OS</span>
        </motion.button>

        {/* Frontend 3: Hive IDE (Multi-Persona Swarm Coding Platform) */}
        <motion.button
          id="nav-hive-ide"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleHotSwapMode('HIVE_IDE')}
          className={`flex items-center gap-2 text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg font-black transition-all cursor-pointer shrink-0 ${
            activeTab === 'HIVE_IDE'
              ? 'bg-[#10B981]/15 border-2 border-[#10B981] text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.35)]'
              : 'hover:bg-[#151522] border border-[#222234] text-gray-400 hover:text-[#10B981]'
          }`}
        >
          <Terminal size={14} className={activeTab === 'HIVE_IDE' ? 'animate-pulse drop-shadow-[0_0_5px_#10B981]' : ''} />
          <span>3. Hive IDE Swarm</span>
        </motion.button>

        {/* Topological Mesh Live Visualizer */}
        <motion.button
          id="nav-topological-mesh"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleHotSwapMode('TOPOLOGICAL_MESH')}
          className={`flex items-center gap-2 text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer shrink-0 ${
            activeTab === 'TOPOLOGICAL_MESH'
              ? 'bg-cyan-500/15 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
              : 'hover:bg-[#151522] border border-[#222234] text-gray-400 hover:text-cyan-400'
          }`}
        >
          <Network size={13} className={activeTab === 'TOPOLOGICAL_MESH' ? 'animate-pulse drop-shadow-[0_0_5px_#06B6D4]' : ''} />
          <span>Topological Mesh</span>
        </motion.button>

        <div className="h-4 w-[1px] bg-gray-800 mx-1 shrink-0"></div>

        {/* Swarm Command Center */}
        <motion.button
          id="nav-swarm-command-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleHotSwapMode('SWARM_COMMAND_CENTER')}
          className={`flex items-center gap-2 text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer shrink-0 ${
            activeTab === 'SWARM_COMMAND_CENTER'
              ? 'bg-[#10B981]/15 border-2 border-[#10B981] text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.35)]'
              : 'hover:bg-[#151522] border border-[#222234] text-gray-400 hover:text-[#10B981]'
          }`}
        >
          <Terminal size={13} className={activeTab === 'SWARM_COMMAND_CENTER' ? 'animate-pulse drop-shadow-[0_0_5px_#10B981]' : ''} />
          <span>Swarm Command</span>
        </motion.button>

        <motion.button
          id="nav-gemini-nexus"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleHotSwapMode('GEMINI_NEXUS')}
          className={`flex items-center gap-2 text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer shrink-0 ${
            activeTab === 'GEMINI_NEXUS'
              ? 'bg-[#A855F7]/15 border-2 border-[#A855F7] text-[#A855F7] shadow-[0_0_15px_rgba(168,85,247,0.35)]'
              : 'hover:bg-[#151522] border border-[#222234] text-gray-400 hover:text-[#A855F7]'
          }`}
        >
          <Sparkles size={13} className={activeTab === 'GEMINI_NEXUS' ? 'animate-pulse drop-shadow-[0_0_5px_#A855F7]' : ''} />
          <span>Gemini Nexus</span>
        </motion.button>

        <motion.button
          id="nav-google-workspace"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleHotSwapMode('GOOGLE_WORKSPACE')}
          className={`flex items-center gap-2 text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer shrink-0 ${
            activeTab === 'GOOGLE_WORKSPACE'
              ? 'bg-[#38BDF8]/15 border-2 border-[#38BDF8] text-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.35)]'
              : 'hover:bg-[#151522] border border-[#222234] text-gray-400 hover:text-[#38BDF8]'
          }`}
        >
          <Radio size={13} className={activeTab === 'GOOGLE_WORKSPACE' ? 'animate-pulse drop-shadow-[0_0_5px_#38BDF8]' : ''} />
          <span>Grid Sync</span>
        </motion.button>

        <motion.button
          id="nav-mcp-server"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleHotSwapMode('MCP_SERVER')}
          className={`flex items-center gap-2 text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer shrink-0 ${
            activeTab === 'MCP_SERVER'
              ? 'bg-purple-600/20 border-2 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(139,92,246,0.35)]'
              : 'hover:bg-[#151522] border border-[#222234] text-gray-400 hover:text-purple-300'
          }`}
        >
          <Server size={13} className={activeTab === 'MCP_SERVER' ? 'animate-pulse drop-shadow-[0_0_5px_#8B5CF6]' : ''} />
          <span>MCP Server Forge</span>
        </motion.button>
      </nav>

      {/* Main Workspace Render (Contained Scrollable Viewport) */}
      <main className="flex-1 overflow-y-auto min-h-0 px-3 sm:px-5 py-3 relative z-10 custom-scroll">
        <HolographicWorkspaceContainer activeTab={activeTab} onOpenSettings={handleOpenSettings}>
          {activeTab === 'MERLIN_AGENCY' && (
            <TitanOmniForgeCartridge onNotify={notify} voiceIntent={voiceIntent} />
          )}

          {activeTab === 'COGNITIVE_PLAYGROUND' && (
            <div className="bg-[#0B0B12] border border-purple-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl">
              <MerlinCognitivePlayground 
                onNotify={notify} 
                onDeployToGenesis={(topic, prd) => {
                  setActiveTab('GENESIS_INTAKE');
                  notify(`Deployed "${topic}" PRD to Genesis Intake Studio!`, 'success');
                }}
                onForkToGenesis={(cartridge) => {
                  setActiveGenesisCartridge(cartridge);
                  setActiveTab('GENESIS_INTAKE');
                  notify(`🔱 Strategy Forked: "${cartridge.name}" instantiated in Genesis Intake Cartridge Studio!`, 'success');
                }}
              />
            </div>
          )}

          {activeTab === 'GENESIS_INTAKE' && (
            <div className="bg-[#0B0B12] border border-rose-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl">
              <GenesisIntakeCartridgeStudio 
                onNotify={notify} 
                activeCartridge={activeGenesisCartridge}
                onSelectCartridge={(cart) => setActiveGenesisCartridge(cart)}
              />
            </div>
          )}

          {activeTab === 'BLUEPRINT_OS' && (
            <BlueprintOSStudio onNotify={notify} onOpenSettings={handleOpenSettings} />
          )}

          {activeTab === 'HIVE_IDE' && (
            <HiveIDEStudio 
              onNotify={notify} 
              onOpenSettings={handleOpenSettings} 
              onTriggerEvolve={() => setIsEvolveModalOpen(true)}
              onOpenVoiceHUD={() => setIsVoiceHUDOpen(true)}
              injectedVoiceTask={injectedVoiceTask}
              injectedHiveAction={injectedHiveAction}
              settings={cartridgeSettings.hiveIDE} 
            />
          )}

          {activeTab === 'TOPOLOGICAL_MESH' && (
            <TopologicalGraphVisualizer 
              onNotify={notify} 
              isEvolved={latticeTier.includes('V2000')} 
            />
          )}

          {activeTab === 'SWARM_COMMAND_CENTER' && (
            <SwarmCommandCenterStudio onNotify={notify} />
          )}

          {activeTab === 'GEMINI_NEXUS' && (
            <GeminiNexusStudio />
          )}

          {activeTab === 'GOOGLE_WORKSPACE' && (
            <GoogleWorkspaceHub onNotify={notify} />
          )}

          {activeTab === 'MCP_SERVER' && (
            <MCPServerForgeStudio onOpenSettings={handleOpenSettings} />
          )}
        </HolographicWorkspaceContainer>
      </main>

      {/* Fixed Compact Footer */}
      <footer className="py-2 px-4 bg-[#090910] border-t border-[#202030] text-[10px] uppercase font-bold tracking-widest flex flex-wrap justify-between items-center gap-2 text-gray-500 shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#00F0FF] drop-shadow-[0_0_5px_#00F0FF]">
            <Shield size={11} /> Camelot Sentinel Active
          </span>
          <span className="text-[#D4AF37]">•</span>
          <span className="flex items-center gap-1 text-[#D4AF37] drop-shadow-[0_0_5px_#D4AF37]">
            <Radio size={11} /> Ephemeral Grid
          </span>
        </div>

        <div className="flex items-center gap-3 text-gray-400">
          <span>{latticeTier}</span>
          <span className="text-[#D4AF37]">•</span>
          <span className="text-emerald-400">ARM64 Core Locked</span>
        </div>
      </footer>
    </div>
  );
}
