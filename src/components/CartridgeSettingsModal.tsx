import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  X, 
  Shield, 
  Cpu, 
  Terminal, 
  Sparkles, 
  Sliders, 
  Check, 
  Flame, 
  Radio, 
  Lock, 
  Layers, 
  Zap, 
  Volume2, 
  Eye, 
  RotateCcw 
} from 'lucide-react';

export interface CartridgeSettingsState {
  agency: {
    tierMode: 'ENTERPRISE_TITAN' | 'GROWTH_AGENCY' | 'SOLO_SENTINEL';
    leaseTimeoutSec: number;
    visemeLipSync: boolean;
    autoPitchSynthesis: boolean;
    tenantIsolation: 'STRICT_PCI' | 'STANDARD_VFS' | 'EPHEMERAL_TEMP';
    rateLimiterRps: number;
  };
  blueprintOS: {
    constitutionEngine: 'const_engineering_v1' | 'const_strict_formal_v2' | 'const_sovereign_v3';
    dagExplodedView: '2D_HIGH_DENSITY' | '3D_HOLOGRAM' | 'AST_RAW_JSON';
    gideonFalsification: boolean;
    grilleGateEntropyThreshold: number; // e.g. 99.4
    stateMachineAutoStep: boolean;
    enforceASTPurity: boolean;
  };
  hiveIDE: {
    activeKnights: {
      merlin: boolean;
      lancelot: boolean;
      galahad: boolean;
      gideon: boolean;
      boris: boolean;
    };
    compilerTarget: 'ARM64_MICRO_VM' | 'WASMTIME_SANDBOX' | 'NODE_NATIVE';
    maxCrucibleAutoPatches: number;
    multicursorThermalDensity: 'HIGH_DENSITY' | 'COMPACT_CLI';
    streamTokenVelocityKps: number;
    showGlitchTransitions: boolean;
  };
}

export const DEFAULT_CARTRIDGE_SETTINGS: CartridgeSettingsState = {
  agency: {
    tierMode: 'ENTERPRISE_TITAN',
    leaseTimeoutSec: 600,
    visemeLipSync: true,
    autoPitchSynthesis: true,
    tenantIsolation: 'STRICT_PCI',
    rateLimiterRps: 120
  },
  blueprintOS: {
    constitutionEngine: 'const_engineering_v1',
    dagExplodedView: '2D_HIGH_DENSITY',
    gideonFalsification: true,
    grilleGateEntropyThreshold: 99.4,
    stateMachineAutoStep: false,
    enforceASTPurity: true
  },
  hiveIDE: {
    activeKnights: {
      merlin: true,
      lancelot: true,
      galahad: true,
      gideon: true,
      boris: false
    },
    compilerTarget: 'ARM64_MICRO_VM',
    maxCrucibleAutoPatches: 3,
    multicursorThermalDensity: 'HIGH_DENSITY',
    streamTokenVelocityKps: 120,
    showGlitchTransitions: true
  }
};

interface CartridgeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCartridgeTab?: string;
  settings: CartridgeSettingsState;
  onSaveSettings: (newSettings: CartridgeSettingsState) => void;
  onNotify?: (msg: string, type?: 'success' | 'warning') => void;
}

export function CartridgeSettingsModal({
  isOpen,
  onClose,
  activeCartridgeTab = 'MERLIN_AGENCY',
  settings,
  onSaveSettings,
  onNotify
}: CartridgeSettingsModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'MERLIN_AGENCY' | 'BLUEPRINT_OS' | 'HIVE_IDE' | 'TELEMETRY'>(
    activeCartridgeTab === 'BLUEPRINT_OS' ? 'BLUEPRINT_OS' :
    activeCartridgeTab === 'HIVE_IDE' || activeCartridgeTab === 'INDUSTRIAL_FORGE' ? 'HIVE_IDE' :
    'MERLIN_AGENCY'
  );

  const [localSettings, setLocalSettings] = useState<CartridgeSettingsState>(settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateSetting = <T extends keyof CartridgeSettingsState>(
    section: T,
    updates: Partial<CartridgeSettingsState[T]>
  ) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    setHasUnsavedChanges(false);
    onNotify?.('Cartridge settings synchronized across Omni-Digital Forge!', 'success');
    onClose();
  };

  const handleResetDefaults = () => {
    setLocalSettings(DEFAULT_CARTRIDGE_SETTINGS);
    setHasUnsavedChanges(true);
    onNotify?.('Restored default cartridge harness parameters.', 'warning');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-[#0B0B10] border-2 border-[#D4AF37] rounded-xl shadow-[0_0_40px_rgba(212,175,55,0.25)] flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 bg-[#12121C] border-b border-[#252538] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37] text-[#D4AF37]">
                <Settings size={18} className="animate-spin" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-widest uppercase text-white flex items-center gap-2">
                  <span>Cartridge Harness Configuration</span>
                  <span className="text-[10px] bg-[#00F0FF]/15 text-[#00F0FF] px-2 py-0.5 rounded border border-[#00F0FF]/40 font-mono font-bold">
                    ARM64_DIALS
                  </span>
                </h2>
                <p className="text-[11px] text-gray-400 font-mono">
                  Runtime parameters for Merlin Agency, Blueprint OS & Swarm Hive IDE
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1A1A28] transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Subtabs Selector */}
          <div className="flex border-b border-[#252538] bg-[#0E0E16] px-4 gap-2 pt-2">
            <button
              onClick={() => setActiveSubTab('MERLIN_AGENCY')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'MERLIN_AGENCY'
                  ? 'bg-[#151522] text-[#D4AF37] border-t-2 border-x border-[#D4AF37] border-b-transparent'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Flame size={14} className={activeSubTab === 'MERLIN_AGENCY' ? 'animate-pulse' : ''} />
              <span>Merlin's Agency</span>
            </button>

            <button
              onClick={() => setActiveSubTab('BLUEPRINT_OS')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'BLUEPRINT_OS'
                  ? 'bg-[#151522] text-[#00F0FF] border-t-2 border-x border-[#00F0FF] border-b-transparent'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Layers size={14} className={activeSubTab === 'BLUEPRINT_OS' ? 'animate-pulse' : ''} />
              <span>Blueprint OS</span>
            </button>

            <button
              onClick={() => setActiveSubTab('HIVE_IDE')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'HIVE_IDE'
                  ? 'bg-[#151522] text-[#10B981] border-t-2 border-x border-[#10B981] border-b-transparent'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Terminal size={14} className={activeSubTab === 'HIVE_IDE' ? 'animate-pulse' : ''} />
              <span>Hive IDE Swarm</span>
            </button>
          </div>

          {/* Body Content with contained custom scroll */}
          <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs font-mono">
            {/* MERLIN'S AGENCY SETTINGS */}
            {activeSubTab === 'MERLIN_AGENCY' && (
              <div className="space-y-5">
                <div className="p-3.5 bg-[#141420] border border-[#2A2A40] rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-wider">Agency Operating Tier</h4>
                      <p className="text-[11px] text-gray-400">Controls autonomous rate limits and capability lease allocations</p>
                    </div>
                    <select
                      value={localSettings.agency.tierMode}
                      onChange={e => updateSetting('agency', { tierMode: e.target.value as any })}
                      className="bg-[#0B0B10] border border-[#D4AF37] text-[#D4AF37] text-xs rounded px-3 py-1.5 font-bold cursor-pointer"
                    >
                      <option value="ENTERPRISE_TITAN">ENTERPRISE_TITAN (High Throughput)</option>
                      <option value="GROWTH_AGENCY">GROWTH_AGENCY (Autonomous)</option>
                      <option value="SOLO_SENTINEL">SOLO_SENTINEL (Strict Quotas)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-[#141420] border border-[#252538] rounded-lg space-y-2">
                    <label className="text-gray-300 font-bold uppercase block">Sentinel Capability Lease Timeout</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="60"
                        max="3600"
                        step="60"
                        value={localSettings.agency.leaseTimeoutSec}
                        onChange={e => updateSetting('agency', { leaseTimeoutSec: Number(e.target.value) })}
                        className="w-full accent-[#D4AF37]"
                      />
                      <span className="text-[#D4AF37] font-bold min-w-[70px] text-right">
                        {localSettings.agency.leaseTimeoutSec}s
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400">Automatic release time for VFS worktrees and tool credentials.</p>
                  </div>

                  <div className="p-3.5 bg-[#141420] border border-[#252538] rounded-lg space-y-2">
                    <label className="text-gray-300 font-bold uppercase block">Tenant VFS Isolation Level</label>
                    <select
                      value={localSettings.agency.tenantIsolation}
                      onChange={e => updateSetting('agency', { tenantIsolation: e.target.value as any })}
                      className="w-full bg-[#0B0B10] border border-[#2A2A40] text-white text-xs rounded px-3 py-2 cursor-pointer"
                    >
                      <option value="STRICT_PCI">STRICT_PCI (Hard Ephemeral Sandboxes)</option>
                      <option value="STANDARD_VFS">STANDARD_VFS (Shared Memory Cache)</option>
                      <option value="EPHEMERAL_TEMP">EPHEMERAL_TEMP (Auto-Pruned in 60s)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3.5 bg-[#141420] border border-[#252538] rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-bold">3D Spatial Viseme Lip-Sync Avatar</span>
                      <p className="text-[11px] text-gray-400">Stream audio visemes to 3D Knight avatar over WebAudio bridge</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.agency.visemeLipSync}
                      onChange={e => updateSetting('agency', { visemeLipSync: e.target.checked })}
                      className="w-4 h-4 accent-[#00F0FF] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-[#1F1F2F] pt-2">
                    <div>
                      <span className="text-white font-bold">High-Ticket Auto-Pitch Synthesizer</span>
                      <p className="text-[11px] text-gray-400">Generate real-time client deck scripts and revenue arbitrage loops</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.agency.autoPitchSynthesis}
                      onChange={e => updateSetting('agency', { autoPitchSynthesis: e.target.checked })}
                      className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* BLUEPRINT OS SETTINGS */}
            {activeSubTab === 'BLUEPRINT_OS' && (
              <div className="space-y-5">
                <div className="p-3.5 bg-[#141420] border border-[#2A2A40] rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-wider">Constitutional Rule Engine</h4>
                      <p className="text-[11px] text-gray-400">AST boundary validator and zero-hallucination verification matrix</p>
                    </div>
                    <select
                      value={localSettings.blueprintOS.constitutionEngine}
                      onChange={e => updateSetting('blueprintOS', { constitutionEngine: e.target.value as any })}
                      className="bg-[#0B0B10] border border-[#00F0FF] text-[#00F0FF] text-xs rounded px-3 py-1.5 font-bold cursor-pointer"
                    >
                      <option value="const_engineering_v1">const_engineering_v1 (Standard)</option>
                      <option value="const_strict_formal_v2">const_strict_formal_v2 (Zero Drift)</option>
                      <option value="const_sovereign_v3">const_sovereign_v3 (Autonomous Hardened)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-[#141420] border border-[#252538] rounded-lg space-y-2">
                    <label className="text-gray-300 font-bold uppercase block">GRILLE_GATE Entropy Threshold (%)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="90"
                        max="99.9"
                        step="0.1"
                        value={localSettings.blueprintOS.grilleGateEntropyThreshold}
                        onChange={e => updateSetting('blueprintOS', { grilleGateEntropyThreshold: Number(e.target.value) })}
                        className="w-full accent-[#00F0FF]"
                      />
                      <span className="text-[#00F0FF] font-bold min-w-[60px] text-right">
                        {localSettings.blueprintOS.grilleGateEntropyThreshold}%
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400">Minimum structural confidence score required for code lock.</p>
                  </div>

                  <div className="p-3.5 bg-[#141420] border border-[#252538] rounded-lg space-y-2">
                    <label className="text-gray-300 font-bold uppercase block">DAG Exploded Assembly View</label>
                    <select
                      value={localSettings.blueprintOS.dagExplodedView}
                      onChange={e => updateSetting('blueprintOS', { dagExplodedView: e.target.value as any })}
                      className="w-full bg-[#0B0B10] border border-[#2A2A40] text-white text-xs rounded px-3 py-2 cursor-pointer"
                    >
                      <option value="2D_HIGH_DENSITY">2D High-Density Data Grid</option>
                      <option value="3D_HOLOGRAM">3D Holographic Interactive Node Graph</option>
                      <option value="AST_RAW_JSON">AST Raw JSON Representation</option>
                    </select>
                  </div>
                </div>

                <div className="p-3.5 bg-[#141420] border border-[#252538] rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-bold">Gideon Adversarial Falsification Matrix</span>
                      <p className="text-[11px] text-gray-400">Actively generate synthetic edge-case tests before emitting blueprints</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.blueprintOS.gideonFalsification}
                      onChange={e => updateSetting('blueprintOS', { gideonFalsification: e.target.checked })}
                      className="w-4 h-4 accent-[#00F0FF] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-[#1F1F2F] pt-2">
                    <div>
                      <span className="text-white font-bold">Strict AST Purity & Zero Unsolicited Features Rule</span>
                      <p className="text-[11px] text-gray-400">Lock generated outputs strictly to formal customer specifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.blueprintOS.enforceASTPurity}
                      onChange={e => updateSetting('blueprintOS', { enforceASTPurity: e.target.checked })}
                      className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* HIVE IDE SWARM SETTINGS */}
            {activeSubTab === 'HIVE_IDE' && (
              <div className="space-y-5">
                <div className="p-3.5 bg-[#141420] border border-[#2A2A40] rounded-lg space-y-3">
                  <h4 className="text-white font-bold uppercase tracking-wider">Active Swarm Knight Personas</h4>
                  <p className="text-[11px] text-gray-400">Toggle active concurrent coding personas in the multi-cursor matrix</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                    {[
                      { key: 'merlin', label: 'Merlin (Router)', color: '#00F0FF' },
                      { key: 'lancelot', label: 'Lancelot (Frontend/UI)', color: '#D4AF37' },
                      { key: 'galahad', label: 'Galahad (Security/Backend)', color: '#10B981' },
                      { key: 'gideon', label: 'Gideon (Adversarial SRE)', color: '#EF4444' },
                      { key: 'boris', label: 'Boris (Kinetic Audio/Live)', color: '#A855F7' }
                    ].map(k => (
                      <label
                        key={k.key}
                        className="flex items-center justify-between p-2 rounded bg-[#0A0A12] border border-[#252538] cursor-pointer hover:border-gray-500 transition-all"
                      >
                        <span className="text-xs font-bold" style={{ color: k.color }}>{k.label}</span>
                        <input
                          type="checkbox"
                          checked={(localSettings.hiveIDE.activeKnights as any)[k.key]}
                          onChange={e => {
                            const newKnights = {
                              ...localSettings.hiveIDE.activeKnights,
                              [k.key]: e.target.checked
                            };
                            updateSetting('hiveIDE', { activeKnights: newKnights });
                          }}
                          className="w-3.5 h-3.5 accent-[#10B981]"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-[#141420] border border-[#252538] rounded-lg space-y-2">
                    <label className="text-gray-300 font-bold uppercase block">MicroVM Compiler Target</label>
                    <select
                      value={localSettings.hiveIDE.compilerTarget}
                      onChange={e => updateSetting('hiveIDE', { compilerTarget: e.target.value as any })}
                      className="w-full bg-[#0B0B10] border border-[#2A2A40] text-[#10B981] font-bold text-xs rounded px-3 py-2 cursor-pointer"
                    >
                      <option value="ARM64_MICRO_VM">ARM64 MicroVM (Hardware Clamped)</option>
                      <option value="WASMTIME_SANDBOX">Wasmtime VFS Sandbox</option>
                      <option value="NODE_NATIVE">Node Native TypeScript Engine</option>
                    </select>
                  </div>

                  <div className="p-3.5 bg-[#141420] border border-[#252538] rounded-lg space-y-2">
                    <label className="text-gray-300 font-bold uppercase block">Auto-Crucible Self-Healing Limit</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={localSettings.hiveIDE.maxCrucibleAutoPatches}
                        onChange={e => updateSetting('hiveIDE', { maxCrucibleAutoPatches: Number(e.target.value) })}
                        className="w-full accent-[#10B981]"
                      />
                      <span className="text-[#10B981] font-bold min-w-[50px] text-right">
                        {localSettings.hiveIDE.maxCrucibleAutoPatches} cycles
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400">Max automatic repair loops before escalating to arbitration.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-[#141420] border border-[#252538] rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-bold">Kinetic Holographic Glitch Transitions</span>
                      <p className="text-[11px] text-gray-400">Enable CSS keyframe glitch and laser sweep on module switching</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.hiveIDE.showGlitchTransitions}
                      onChange={e => updateSetting('hiveIDE', { showGlitchTransitions: e.target.checked })}
                      className="w-4 h-4 accent-[#00F0FF] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-[#12121C] border-t border-[#252538] flex items-center justify-between">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-300 px-3 py-1.5 rounded hover:bg-[#1A1A28] transition-all cursor-pointer font-bold"
            >
              <RotateCcw size={14} />
              <span>Reset Dials</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-[#1C1C2C] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#00F0FF] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check size={14} />
                <span>Synchronize Dials</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
