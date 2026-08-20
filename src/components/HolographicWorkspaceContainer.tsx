import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal, Activity, Layers, Settings, Flame } from 'lucide-react';
import { MainView } from '../App';
import { ModeResourceHUD } from './ModeResourceHUD';

interface HolographicWorkspaceContainerProps {
  activeTab: MainView;
  children: React.ReactNode;
  onOpenSettings?: (tab?: string) => void;
}

const TAB_METADATA: Record<MainView, { label: string; codename: string; protocol: string; color: string }> = {
  MERLIN_AGENCY: {
    label: "Merlin's Software Agency",
    codename: 'SOVEREIGN_CONSOLE // HIGH_TICKET_DECK',
    protocol: 'SENTINEL_LEASES_LOCKED',
    color: '#D4AF37'
  },
  BLUEPRINT_OS: {
    label: 'Blueprint OS (The Oracle Glass)',
    codename: 'STATE_MACHINE // DAG_ASSEMBLY',
    protocol: 'CONSTITUTION_VERIFIED',
    color: '#00F0FF'
  },
  HIVE_IDE: {
    label: 'Hive IDE Swarm & CLI Forge',
    codename: 'MULTI_PERSONA // MICRO_VM_ARM64',
    protocol: 'CRUCIBLE_TDD_NOMINAL',
    color: '#10B981'
  },
  TOPOLOGICAL_MESH: {
    label: 'Topological Mesh Visualizer',
    codename: 'SCOUT_WARDEN // UI_FLOW_GRAPH',
    protocol: 'SRE_REGRESSION_AUDIT',
    color: '#06B6D4'
  },
  SWARM_COMMAND_CENTER: {
    label: 'Swarm Command Center',
    codename: 'SENTINEL_COCKPIT // EXECUTIVE',
    protocol: 'EVIDENCE_TELEMETRY_ACTIVE',
    color: '#10B981'
  },
  GEMINI_NEXUS: {
    label: 'Gemini Nexus Cognitive Engine',
    codename: 'GEMINI_3.1_PRO // MULTIMODAL',
    protocol: 'SERVER_KEY_ENCRYPTED',
    color: '#A855F7'
  },
  GOOGLE_WORKSPACE: {
    label: 'Google Grid & Drive Sync',
    codename: 'CLIENT_OAUTH_GSI // REST_SYNC',
    protocol: 'AUDIT_RECEIPT_VALIDATED',
    color: '#38BDF8'
  },
  MCP_SERVER: {
    label: 'Arthurian Sovereign MCP Server Forge',
    codename: 'JSON_RPC_2.0 // SSE_STREAM_TRANSPORTS',
    protocol: 'SOVEREIGN_MCP_ONLINE',
    color: '#8B5CF6'
  },
  COGNITIVE_PLAYGROUND: {
    label: 'Archmage Debate Chamber & Cognitive Playground',
    codename: 'NINE_SEAT_COUNCIL // SOCRATIC_INQUEST',
    protocol: 'Z3_FORMAL_VERIFICATION_PASS',
    color: '#A855F7'
  },
  GENESIS_INTAKE: {
    label: 'Genesis Intake Cartridge Studio',
    codename: '4_LAYER_INGRESS // 5_STAGE_CRUCIBLE',
    protocol: 'MICROVM_DELTA_LOCKED',
    color: '#F43F5E'
  }
};

export function HolographicWorkspaceContainer({
  activeTab,
  children,
  onOpenSettings
}: HolographicWorkspaceContainerProps) {
  const currentMeta = TAB_METADATA[activeTab] || {
    label: activeTab,
    codename: 'WORKSPACE_LAYER',
    protocol: 'ACTIVE',
    color: '#00F0FF'
  };

  return (
    <div className="relative w-full">
      {/* Top Kinetic Laser Sweep Line */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`laser-${activeTab}`}
          initial={{ scaleX: 0, opacity: 0, x: '-50%' }}
          animate={{ scaleX: [0, 1.2, 1], opacity: [0, 1, 0], x: ['-50%', '0%', '50%'] }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute -top-2 left-0 right-0 h-[2px] z-30 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent shadow-[0_0_15px_#00F0FF]"
        />
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{
            opacity: 0,
            scale: 0.99,
            y: 6,
            filter: 'brightness(1.4) contrast(1.15) drop-shadow(0 0 16px rgba(0, 240, 255, 0.3))'
          }}
          animate={{
            opacity: [0, 0.9, 0.8, 1],
            scale: 1,
            y: 0,
            filter: [
              'brightness(1.5) contrast(1.1) drop-shadow(0 0 18px rgba(0, 240, 255, 0.3))',
              'brightness(0.98)',
              'brightness(1.1)',
              'brightness(1)'
            ]
          }}
          exit={{
            opacity: 0,
            scale: 0.995,
            y: -5,
            filter: 'brightness(0.7) blur(1px)'
          }}
          transition={{
            duration: 0.35,
            ease: [0.16, 1, 0.3, 1],
            opacity: { duration: 0.32, times: [0, 0.25, 0.5, 1] },
            filter: { duration: 0.35, times: [0, 0.3, 0.6, 1] }
          }}
          className="relative w-full"
        >
          {/* Constrained Resource Sandbox HUD & Active System Instruction Lock */}
          <ModeResourceHUD activeTab={activeTab} onOpenSettings={onOpenSettings} />

          {/* Module Content */}
          <div className="relative">
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
