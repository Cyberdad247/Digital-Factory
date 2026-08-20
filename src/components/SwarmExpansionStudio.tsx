/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import { 
  Users, 
  Cpu, 
  Layers, 
  Zap, 
  Radio, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  Network, 
  Share2, 
  Play, 
  Copy, 
  Check, 
  FileText, 
  GitBranch, 
  Flame, 
  CheckCircle2, 
  Activity,
  Award,
  Maximize2
} from 'lucide-react';
import { 
  SwarmScalingState, 
  RegionalClusterLead, 
  SwarmAgentWorker, 
  TTENode, 
  ParallelRaceCandidate 
} from '../types';

interface SwarmExpansionStudioProps {
  onNotify: (message: string, type?: 'success' | 'warning') => void;
}

export function SwarmExpansionStudio({ onNotify }: SwarmExpansionStudioProps) {
  const [state, setState] = useState<SwarmScalingState | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<RegionalClusterLead | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<SwarmAgentWorker | null>(null);
  const [raceMissionInput, setRaceMissionInput] = useState('Critical Hotfix: Sentinel Capability Lease Recovery');
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'HIERARCHY' | 'SARDA_CACHE' | 'TTE_GRAPH' | 'PARALLEL_RACES' | 'EDGE_DISTRIBUTED' | 'MANIFEST'>('HIERARCHY');

  const fetchSwarmState = async () => {
    try {
      const res = await fetch('/api/swarm/status');
      if (res.ok) {
        const data: SwarmScalingState = await res.json();
        setState(data);
        if (!selectedCluster && data.regionalLeads && data.regionalLeads.length > 0) {
          setSelectedCluster(data.regionalLeads[0]);
        }
        if (!selectedWorker && data.activeWorkers && data.activeWorkers.length > 0) {
          setSelectedWorker(data.activeWorkers[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch swarm scaling status:', err);
    }
  };

  useEffect(() => {
    fetchSwarmState();
  }, []);

  const handleTriggerExpansion = async (scale: number = 1024) => {
    setLoading(true);
    try {
      const res = await fetch('/api/swarm/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scale })
      });
      if (res.ok) {
        const updated: SwarmScalingState = await res.json();
        setState(updated);
        onNotify(`Swarm Scaled to ${scale} Agents // TIER_0_HYPER_ORCHESTRATION Active`, 'success');
      }
    } catch (err) {
      onNotify('Failed to expand swarm', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchRace = async () => {
    if (!raceMissionInput) return;
    setLoading(true);
    try {
      const res = await fetch('/api/swarm/race', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mission: raceMissionInput })
      });
      if (res.ok) {
        const updated: SwarmScalingState = await res.json();
        setState(updated);
        onNotify('Parallel Hotfix Race Triggered across Models with Adversarial Audit', 'success');
      }
    } catch (err) {
      onNotify('Failed to launch parallel race', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTTE = async (skillId: string) => {
    try {
      const res = await fetch('/api/swarm/tte/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId })
      });
      if (res.ok) {
        const updated: SwarmScalingState = await res.json();
        setState(updated);
        onNotify(`TTE JIT Assembly Toggled for [${skillId}]`, 'success');
      }
    } catch (err) {
      onNotify('Failed to toggle TTE skill', 'warning');
    }
  };

  const copyYaml = () => {
    if (!state) return;
    navigator.clipboard.writeText(state.scalingManifestYaml);
    setCopiedYaml(true);
    onNotify('Copied OMEGA SWARM SCALING MANIFEST (TOON v11.0)', 'success');
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  if (!state) {
    return (
      <div className="p-8 text-center bg-[#101017] border border-[#252532] rounded-lg text-gray-400">
        <Activity className="animate-spin inline-block mr-2 text-[#D4AF37]" size={20} />
        Synchronizing Tier-0 Hyper-Orchestration Swarm Matrix...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sovereign Boot Telemetry Header Banner */}
      <div className="bg-[#0B0B12] border-2 border-[#D4AF37] p-4 sm:p-5 rounded-lg shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="bg-[#D4AF37] text-black font-black text-[11px] px-2 py-0.5 rounded tracking-wider uppercase">
                //boot Swarm Hyper-Orchestration
              </span>
              <span className="text-xs text-green-400 flex items-center gap-1 font-mono">
                <Radio size={12} className="animate-ping" /> {state.bootTelemetry.status}
              </span>
              <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800 font-mono">
                {state.bootTelemetry.mode}
              </span>
            </div>

            <div className="font-mono text-sm sm:text-base font-bold text-white tracking-wide">
              [CPU: <span className="text-red-400">██████████ 120%</span> - OMNI_EXECUTION_ACTIVE] &nbsp;
              [RAM: <span className="text-[#D4AF37]">3.4GB/8.0GB</span> - SCARCITY PROTOCOL]
            </div>

            <div className="text-xs text-gray-300 font-mono mt-1 flex flex-wrap items-center gap-2">
              <span className="text-blue-300 font-semibold">[KNIGHT_SYNC: ANYA_Ω ⚡ MERLIN_Ω ⚡ SIR_LINK]</span>
              <span>•</span>
              <span className="text-purple-300">[LATTICE: 24D_LEECH_LATTICE_ACTIVE]</span>
              <span>•</span>
              <span className="text-[#D4AF37] font-bold">1,024 Active Agents</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleTriggerExpansion(1024)}
              disabled={loading}
              className="bg-[#D4AF37] hover:bg-[#e6c148] text-black px-3.5 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Zap size={13} />
              <span>Scale 1,000+ Swarm</span>
            </button>

            <button
              onClick={copyYaml}
              className="bg-[#181824] hover:bg-[#222232] text-gray-300 border border-[#3A3A4E] px-3.5 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
            >
              {copiedYaml ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
              <span>{copiedYaml ? 'Manifest Copied' : 'Manifest YAML'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Anya & Merlin Sovereign Guidance Dispatch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#12121A] border-l-4 border-l-[#D4AF37] border-y border-r border-[#222230] p-4 rounded-r-lg">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={16} className="text-[#D4AF37]" />
            <span className="font-bold text-white text-sm">Anya Ω 🎭 (Sovereign Gatekeeper)</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            &ldquo;Terminal locked, Sovereign! Scaling to 1,000+ agents without breaking the 8GB edge ceiling requires our five physical laws. The single greatest rule to remember: <strong>Add skills to a single agent before you ever reach for a fleet</strong>. But when it’s time to unleash the fleet, this blueprint guarantees zero context rot!&rdquo;
          </p>
        </div>

        <div className="bg-[#12121A] border-l-4 border-l-blue-500 border-y border-r border-[#222230] p-4 rounded-r-lg">
          <div className="flex items-center gap-2 mb-1.5">
            <Cpu size={16} className="text-blue-400" />
            <span className="font-bold text-white text-sm">Merlin Ω 🧙‍♂️ (Cognitive Architect)</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            &ldquo;Multi-agent systems inherently burn 10 to 15 times more tokens than isolated processes. To scale the Invisioned Marketing Swarm safely, we implement <strong>Three-Tier Hierarchical Orchestration</strong>, <strong>Centralized SARDA Leech Shell Caching</strong>, and <strong>TTE Dynamic Assembly</strong>.&rdquo;
          </p>
        </div>
      </div>

      {/* Sub-Navigation for the 5 Scaling Pillars */}
      <div className="flex flex-wrap gap-2 border-b border-[#252532] pb-2">
        <button
          onClick={() => setActiveSubTab('HIERARCHY')}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded font-semibold transition-all ${
            activeSubTab === 'HIERARCHY'
              ? 'bg-[#D4AF37] text-black font-bold'
              : 'bg-[#121218] border border-[#252532] text-gray-300 hover:text-white'
          }`}
        >
          <Users size={13} />
          <span>I. Three-Tier Swarm Hierarchy</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SARDA_CACHE')}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded font-semibold transition-all ${
            activeSubTab === 'SARDA_CACHE'
              ? 'bg-[#D4AF37] text-black font-bold'
              : 'bg-[#121218] border border-[#252532] text-gray-300 hover:text-white'
          }`}
        >
          <Database size={13} />
          <span>II. Centralized SARDA Search (14.8x)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('TTE_GRAPH')}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded font-semibold transition-all ${
            activeSubTab === 'TTE_GRAPH'
              ? 'bg-[#D4AF37] text-black font-bold'
              : 'bg-[#121218] border border-[#252532] text-gray-300 hover:text-white'
          }`}
        >
          <Network size={13} />
          <span>III. Topology Task Execution (TTE)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PARALLEL_RACES')}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded font-semibold transition-all ${
            activeSubTab === 'PARALLEL_RACES'
              ? 'bg-[#D4AF37] text-black font-bold'
              : 'bg-[#121218] border border-[#252532] text-gray-300 hover:text-white'
          }`}
        >
          <Flame size={13} />
          <span>IV. Kinetic Parallel Races</span>
        </button>

        <button
          onClick={() => setActiveSubTab('EDGE_DISTRIBUTED')}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded font-semibold transition-all ${
            activeSubTab === 'EDGE_DISTRIBUTED'
              ? 'bg-[#D4AF37] text-black font-bold'
              : 'bg-[#121218] border border-[#252532] text-gray-300 hover:text-white'
          }`}
        >
          <Share2 size={13} />
          <span>V. Distributed Edge Inference</span>
        </button>

        <button
          onClick={() => setActiveSubTab('MANIFEST')}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded font-semibold transition-all ${
            activeSubTab === 'MANIFEST'
              ? 'bg-[#D4AF37] text-black font-bold'
              : 'bg-[#121218] border border-[#252532] text-gray-300 hover:text-white'
          }`}
        >
          <FileText size={13} />
          <span>Manifest (TOON v11.0)</span>
        </button>
      </div>

      {/* PILLAR I: THREE-TIER HIERARCHICAL ORCHESTRATION */}
      {activeSubTab === 'HIERARCHY' && (
        <div className="space-y-6">
          {/* Architecture Overview Banner */}
          <div className="bg-[#12121A] border border-[#252532] p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users size={16} className="text-[#D4AF37]" /> Three-Tier Command Hierarchy & Flat Communication Matrix
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Global Orchestrator assigns quantization and mission &rarr; Regional Leads cluster agents &rarr; Local Workers operate on compressed memory. Any agent can flat-prompt any peer.
              </p>
            </div>
            <div className="text-right text-xs font-mono">
              <span className="text-gray-400">Total Swarm Agents:</span> <strong className="text-green-400 text-sm">1,024</strong>
            </div>
          </div>

          {/* Regional Leads & Cluster Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.regionalLeads.map((cluster) => {
              const isSelected = selectedCluster?.id === cluster.id;
              return (
                <div
                  key={cluster.id}
                  onClick={() => setSelectedCluster(cluster)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#181826] border-[#D4AF37] shadow-lg'
                      : 'bg-[#101016] border-[#252532] hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-xs truncate max-w-[180px]">
                      {cluster.clusterName}
                    </span>
                    <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800 font-bold">
                      {cluster.workerCount} Agents
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 line-clamp-2 mb-3">
                    {cluster.activeMission}
                  </p>

                  <div className="text-[10px] font-mono text-gray-400 space-y-1 bg-[#09090E] p-2 rounded">
                    <div className="flex justify-between">
                      <span>SARDA Shell Hit Rate:</span>
                      <strong className="text-green-400">{cluster.sardaCacheHitRate}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Regional Lead:</span>
                      <strong className="text-[#D4AF37]">{cluster.leadAgentId}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Local Worker Inspector & Flat Communication Matrix */}
          <div className="bg-[#101018] border border-[#252532] p-5 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity size={14} className="text-green-400" /> Active Local Workers (Tier 3) & Clamped Context Bounds
              </h4>
              <span className="text-[11px] text-gray-400 font-mono">
                Context Clamp: <strong className="text-white">&le; 1.5 KB per agent</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {state.activeWorkers.map((worker) => (
                <div
                  key={worker.id}
                  onClick={() => setSelectedWorker(worker)}
                  className={`p-3 rounded border text-xs font-mono cursor-pointer transition-all ${
                    selectedWorker?.id === worker.id
                      ? 'bg-[#181828] border-[#D4AF37]'
                      : 'bg-[#0E0E14] border-[#222230] hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-bold">{worker.name}</span>
                    <span className="text-[10px] text-[#D4AF37] bg-[#1C1A14] px-1.5 py-0.5 rounded border border-[#D4AF37]/30">
                      {worker.activeModel}
                    </span>
                  </div>

                  <div className="text-gray-400 text-[11px] mb-1.5 truncate">
                    Task: <span className="text-gray-200">{worker.currentTask}</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-500">
                    <span>Context: <strong className="text-blue-300">{worker.compressedContextBytes} B</strong></span>
                    <span>Burn: <strong className="text-red-300">{worker.tokenBurnRatePerSec} tok/s</strong></span>
                    <span className="text-green-400 font-bold">{worker.status}</span>
                  </div>

                  <div className="mt-2 text-[10px] text-gray-400 bg-[#08080C] p-1.5 rounded border border-[#1A1A26]">
                    &ldquo;{worker.lastMessage}&rdquo;
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PILLAR II: CENTRALIZED SARDA SEARCH */}
      {activeSubTab === 'SARDA_CACHE' && (
        <div className="space-y-6">
          <div className="bg-[#12121A] border border-[#252532] p-4 rounded-lg">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Database size={16} className="text-[#D4AF37]" /> Centralized SARDA Angular Shell Search & Ouroboros Cache
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Never search Leech lattice memory independently across 1,000+ agents. Angular shell representatives are cached in the SARDA layer, amortizing search computation and reducing token consumption by <strong>14.8x</strong> across the swarm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#101018] border border-[#252532] p-4 rounded-lg text-center">
              <div className="text-xs text-gray-400 uppercase">Swarm Token Savings</div>
              <div className="text-2xl font-black text-green-400 my-1">
                {state.sardaCentralizedCache.swarmAmortizedTokenSavingsMultiplier}x
              </div>
              <div className="text-[11px] text-gray-500">Amortized compute reduction</div>
            </div>

            <div className="bg-[#101018] border border-[#252532] p-4 rounded-lg text-center">
              <div className="text-xs text-gray-400 uppercase">Global Shell Hit Rate</div>
              <div className="text-2xl font-black text-[#D4AF37] my-1">
                {state.sardaCentralizedCache.globalSearchHitRate}%
              </div>
              <div className="text-[11px] text-gray-500">Cached within Ouroboros anchors</div>
            </div>

            <div className="bg-[#101018] border border-[#252532] p-4 rounded-lg text-center">
              <div className="text-xs text-gray-400 uppercase">Total Cached Shells</div>
              <div className="text-2xl font-black text-purple-400 my-1">
                {state.sardaCentralizedCache.totalCachedShells} Shells
              </div>
              <div className="text-[11px] text-gray-500">24D Leech Angular Sectors</div>
            </div>
          </div>

          <div className="bg-[#101018] border border-[#252532] p-5 rounded-lg space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Ouroboros Anchored Semantic Shell Table
            </h4>

            <div className="space-y-2">
              {state.sardaCentralizedCache.ouroborosAnchoredEntries.map((shell) => (
                <div
                  key={shell.shellId}
                  className="bg-[#0A0A0F] border border-[#222230] p-3 rounded text-xs font-mono flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="text-[#D4AF37]">{shell.shellId}</span>
                      <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 rounded">
                        Sector #{shell.angularSector} (Theta: {shell.thetaCoefficient})
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">
                      Anchor: <code className="text-gray-300">{shell.ouroborosAnchorHash}</code> • Representatives: {shell.cachedRepresentatives.join(', ')}
                    </div>
                  </div>

                  <div className="text-right text-[11px]">
                    <div className="text-green-400 font-bold">{shell.hitCount} hits</div>
                    <div className="text-gray-500 text-[10px]">{shell.amortizedComputeSavings}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PILLAR III: TOPOLOGY-AWARE TASK EXECUTION (TTE) */}
      {activeSubTab === 'TTE_GRAPH' && (
        <div className="space-y-6">
          <div className="bg-[#12121A] border border-[#252532] p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Network size={16} className="text-[#D4AF37]" /> Topology-Aware Task Execution (TTE) Routable Graph
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Eliminates context overload by dynamically assembling only the specific capability nodes required for the current mission.
              </p>
            </div>
            <div className="text-right text-xs font-mono">
              <span className="text-gray-400">Context Reduction:</span> <strong className="text-green-400 text-sm">{state.tteGraph.averageContextReductionPercent}%</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.tteGraph.nodes.map((node) => (
              <div
                key={node.skillId}
                className={`p-3.5 rounded-lg border text-xs transition-all ${
                  node.isJITLoaded
                    ? 'bg-[#181826] border-[#D4AF37]'
                    : 'bg-[#0E0E14] border-[#222230] opacity-75'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-white">{node.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    node.isJITLoaded ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {node.isJITLoaded ? 'JIT LOADED' : 'IN CORPUS'}
                  </span>
                </div>

                <div className="text-[11px] text-gray-400 font-mono mb-2">
                  Category: <span className="text-purple-300">{node.category}</span>
                  <br />
                  Token Cost: <span className="text-red-300">{node.tokenCost} tokens</span>
                </div>

                <button
                  onClick={() => handleToggleTTE(node.skillId)}
                  className={`w-full py-1 rounded text-[11px] font-bold transition-all ${
                    node.isJITLoaded
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'bg-[#D4AF37] hover:bg-[#e6c148] text-black'
                  }`}
                >
                  {node.isJITLoaded ? 'Unload Node (Conserve Tokens)' : 'JIT Assemble to Swarm'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PILLAR IV: KINETIC PARALLEL RACES */}
      {activeSubTab === 'PARALLEL_RACES' && (
        <div className="space-y-6">
          <div className="bg-[#12121A] border border-[#252532] p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Flame size={16} className="text-[#D4AF37]" /> Kinetic Swarm Tactics: Parallel Races & Maker/Checker Separation
              </h3>
              <span className="text-[10px] bg-green-950 text-green-400 px-2 py-0.5 rounded border border-green-800 font-mono">
                ADVERSARIAL_SEPARATION_STRICT
              </span>
            </div>

            <p className="text-xs text-gray-400">
              For high-priority hotfixes or revenue strikes, spawn parallel agent races across models (Sonnet, Haiku, Opus, Gemini). The maker agent is strictly separated from the checker plane (Sir Gideon). Only candidate solutions passing the verification threshold are merged into permanent system skills.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={raceMissionInput}
                onChange={(e) => setRaceMissionInput(e.target.value)}
                placeholder="Enter critical mission for parallel race..."
                className="flex-1 bg-[#09090D] border border-[#2A2A38] text-white px-3 py-1.5 rounded text-xs focus:border-[#D4AF37] focus:outline-none font-mono"
              />
              <button
                onClick={handleLaunchRace}
                disabled={loading}
                className="bg-[#D4AF37] hover:bg-[#e6c148] text-black px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5"
              >
                <Play size={13} />
                <span>Launch Race</span>
              </button>
            </div>
          </div>

          {/* Active Races List */}
          <div className="space-y-4">
            {state.activeParallelRaces.map((race) => (
              <div key={race.raceId} className="bg-[#101018] border border-[#252532] p-4 rounded-lg space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-[#20202E]">
                  <div>
                    <span className="text-xs font-bold text-white">{race.mission}</span>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                      Maker: {race.separationOfPowersAudit.makerAgent} • Checker: {race.separationOfPowersAudit.checkerAuditor}
                    </div>
                  </div>
                  <span className="text-[10px] bg-green-950 text-green-300 px-2 py-0.5 rounded border border-green-800 font-mono">
                    Score-Guided Merged (Confidence: {race.separationOfPowersAudit.confidence}%)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {race.candidates.map((cand, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded border text-xs font-mono ${
                        cand.isWinner
                          ? 'bg-[#181828] border-[#D4AF37]'
                          : (cand.verdict === 'DISCARDED_FLAWED' ? 'bg-[#140E0E] border-red-900/50' : 'bg-[#0E0E14] border-[#222230]')
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white flex items-center gap-1">
                          {cand.isWinner && <Award size={12} className="text-[#D4AF37]" />}
                          {cand.modelName}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          cand.verdict === 'MERGED_TO_SYSTEM' ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'
                        }`}>
                          {cand.verdict}
                        </span>
                      </div>

                      <div className="text-[10px] text-gray-400 space-y-0.5 my-1.5">
                        <div>Latency: <strong className="text-white">{cand.latencyMs} ms</strong></div>
                        <div>Tokens: <strong className="text-blue-300">{cand.tokenConsumption}</strong></div>
                        <div>Maker Score: <strong className="text-gray-300">{cand.makerScore}%</strong></div>
                        <div>Checker Audit: <strong className={cand.checkerAuditScore >= 95 ? 'text-green-400' : 'text-amber-400'}>{cand.checkerAuditScore}%</strong></div>
                      </div>

                      <pre className="bg-[#08080C] p-2 rounded text-[10px] text-gray-300 overflow-x-auto max-h-24">
                        {cand.responseSnippet}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PILLAR V: DISTRIBUTED EDGE INFERENCE */}
      {activeSubTab === 'EDGE_DISTRIBUTED' && (
        <div className="space-y-6">
          <div className="bg-[#12121A] border border-[#252532] p-4 rounded-lg">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Share2 size={16} className="text-[#D4AF37]" /> Distributed Edge Inference & Hardware Layer-Splitting
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              When exceeding single-box 8GB edge bounds, do not retreat to cloud servers. Distribute model layers across physical machines via high-speed Thunderbolt 4 (40Gbps) direct DMA channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.distributedInference.nodes.map((node) => (
              <div key={node.nodeId} className="bg-[#101018] border border-[#252532] p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-white text-xs">{node.machineName}</div>
                  <span className="text-[10px] bg-green-950 text-green-400 px-2 py-0.5 rounded border border-green-800">
                    {node.status}
                  </span>
                </div>

                <div className="text-xs font-mono text-gray-400 space-y-1.5 bg-[#09090E] p-3 rounded">
                  <div>Hardware: <strong className="text-white">{node.hardware}</strong></div>
                  <div>Interconnect: <strong className="text-[#D4AF37]">{node.interconnect}</strong></div>
                  <div>Assigned Layers: <strong className="text-blue-300">{node.assignedLayers}</strong></div>
                  <div>Tensor Handoff Latency: <strong className="text-green-400">{node.tensorStateHandoffLatencyMs} ms</strong></div>
                  <div>VRAM Allocation: <strong className="text-purple-300">{node.vramUsedMB} MB</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PILLAR VI: OMEGA SWARM SCALING MANIFEST (TOON v11.0) */}
      {activeSubTab === 'MANIFEST' && (
        <div className="space-y-4">
          <div className="bg-[#12121A] border border-[#252532] p-4 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-[#D4AF37]" /> OMEGA SWARM SCALING MANIFEST (TOON v11.0)
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Canonical declaration and compliance signature for sovereign 1,000+ agent kinetic swarm scaling.
              </p>
            </div>
            <button
              onClick={copyYaml}
              className="bg-[#D4AF37] hover:bg-[#e6c148] text-black px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-1.5"
            >
              {copiedYaml ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedYaml ? 'Copied' : 'Copy YAML'}</span>
            </button>
          </div>

          <pre className="bg-[#08080D] p-4 rounded-lg border border-[#20202E] text-xs font-mono text-green-400 overflow-x-auto leading-relaxed">
            {state.scalingManifestYaml}
          </pre>

          <div className="text-xs font-mono text-gray-400 flex items-center gap-2 bg-[#0C0C12] p-3 rounded border border-[#1A1A24]">
            <ShieldCheck size={14} className="text-[#D4AF37]" />
            <span>Compliance Signature: <code className="text-[#D4AF37] font-bold">{state.complianceSignature}</code></span>
          </div>
        </div>
      )}
    </div>
  );
}
