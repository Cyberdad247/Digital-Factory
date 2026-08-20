import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Network, 
  Activity, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  Zap, 
  Sliders, 
  ArrowRight,
  Boxes,
  Radio,
  Lock
} from 'lucide-react';

interface TopologicalGraphVisualizerProps {
  onNotify?: (msg: string, type?: 'success' | 'warning') => void;
  isEvolved?: boolean;
}

interface MeshNode {
  id: string;
  label: string;
  knight: string;
  role: string;
  x: number;
  y: number;
  status: 'OPTIMAL' | 'DEGRADED' | 'HEALING' | 'LOCKED';
  latencyMs: number;
  throughput: string;
  invariantsPassed: number;
}

const INITIAL_NODES: MeshNode[] = [
  { id: 'n1', label: 'User Intake & Grill Gate', knight: 'GRILL_7GATE', role: 'Entropy Prover', x: 80, y: 140, status: 'OPTIMAL', latencyMs: 0.4, throughput: '120 req/s', invariantsPassed: 7 },
  { id: 'n2', label: 'Merlin Router & DAG Orchestrator', knight: 'MERLIN_Ω', role: 'Loop Core', x: 280, y: 140, status: 'OPTIMAL', latencyMs: 0.8, throughput: '94k tok/s', invariantsPassed: 15 },
  { id: 'n3', label: 'Scribe Blueprint Specifier', knight: 'SIR_SCRIBE', role: 'Contracts & Scope', x: 480, y: 70, status: 'OPTIMAL', latencyMs: 1.2, throughput: '100% Valid', invariantsPassed: 12 },
  { id: 'n4', label: 'Scout Competitive Intel', knight: 'SIR_SCOUT', role: 'SEO & Threat Matrix', x: 480, y: 210, status: 'OPTIMAL', latencyMs: 1.5, throughput: '48 Sources/s', invariantsPassed: 9 },
  { id: 'n5', label: 'Architect Token & Code Synthesizer', knight: 'SIR_ARCHITECT', role: 'ARM64 Wasm', x: 680, y: 70, status: 'OPTIMAL', latencyMs: 2.1, throughput: '120k tok/s', invariantsPassed: 24 },
  { id: 'n6', label: 'Animator Kinetic Shaders', knight: 'SIR_ANIMATOR', role: '60fps WebGL/DOM', x: 680, y: 210, status: 'OPTIMAL', latencyMs: 0.9, throughput: '60.0 FPS', invariantsPassed: 18 },
  { id: 'n7', label: 'Warden Gideon Protocol & SRE', knight: 'SIR_WARDEN', role: 'Level 5 Invariant Audit', x: 880, y: 140, status: 'OPTIMAL', latencyMs: 1.1, throughput: '0 Regressions', invariantsPassed: 42 }
];

const EDGES = [
  { from: 'n1', to: 'n2' },
  { from: 'n2', to: 'n3' },
  { from: 'n2', to: 'n4' },
  { from: 'n3', to: 'n5' },
  { from: 'n4', to: 'n6' },
  { from: 'n5', to: 'n7' },
  { from: 'n6', to: 'n7' }
];

export function TopologicalGraphVisualizer({ onNotify, isEvolved = false }: TopologicalGraphVisualizerProps) {
  const [nodes, setNodes] = useState<MeshNode[]>(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState<MeshNode>(INITIAL_NODES[1]);
  const [isSimulatingLoad, setIsSimulatingLoad] = useState(false);

  useEffect(() => {
    if (isEvolved) {
      setNodes(prev => prev.map(n => ({
        ...n,
        status: 'OPTIMAL',
        latencyMs: Number((n.latencyMs * 0.4).toFixed(2)),
        invariantsPassed: n.invariantsPassed + 10
      })));
    }
  }, [isEvolved]);

  const handleSimulateLoad = () => {
    setIsSimulatingLoad(true);
    onNotify?.('Topological stress injection active across all 7 Knight vertices...', 'warning');

    setNodes(prev => prev.map((n, idx) => ({
      ...n,
      status: idx === 4 ? 'DEGRADED' : 'OPTIMAL',
      latencyMs: idx === 4 ? 18.4 : Number((n.latencyMs * 1.5).toFixed(2))
    })));

    setTimeout(() => {
      // Auto-heal via Gideon & Warden
      setNodes(prev => prev.map(n => ({
        ...n,
        status: 'HEALING'
      })));

      setTimeout(() => {
        setNodes(prev => prev.map(n => ({
          ...n,
          status: 'OPTIMAL',
          latencyMs: isEvolved ? Number((n.latencyMs * 0.5).toFixed(2)) : 1.2
        })));
        setIsSimulatingLoad(false);
        onNotify?.('Warden Gideon Level 5 auto-healed node bottleneck. Backpressure normalized.', 'success');
      }, 1200);
    }, 1500);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Top Controls Banner */}
      <div className="p-4 rounded-xl bg-[#0C0E1A] border border-[#202038] flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/40 text-cyan-400">
            <Network size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>SOVEREIGN TOPOLOGICAL GRAPH MESH</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                WASM IPC RING
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              Live directional acyclic dependency matrix across all 7 Knight micro-frontends
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateLoad}
            disabled={isSimulatingLoad}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              isSimulatingLoad
                ? 'bg-amber-950/60 border border-amber-500 text-amber-300 animate-pulse'
                : 'bg-[#18182C] border border-[#353550] text-gray-300 hover:text-cyan-300 hover:border-cyan-400'
            }`}
          >
            <RefreshCw size={13} className={isSimulatingLoad ? 'animate-spin' : ''} />
            <span>{isSimulatingLoad ? 'INJECTING LOAD...' : 'TEST BACKPRESSURE'}</span>
          </button>
        </div>
      </div>

      {/* SVG Topological Map */}
      <div className="p-4 rounded-2xl bg-[#07080E] border-2 border-[#18182A] relative overflow-hidden shadow-inner min-h-[340px] flex items-center justify-center">
        <svg viewBox="0 0 980 280" className="w-full h-full max-h-[320px] select-none">
          {/* Defs for gradients & markers */}
          <defs>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.8" />
            </linearGradient>
            <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#00F0FF" />
            </marker>
          </defs>

          {/* Edges */}
          {EDGES.map((edge, i) => {
            const src = nodes.find(n => n.id === edge.from)!;
            const dst = nodes.find(n => n.id === edge.to)!;
            return (
              <g key={i}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={dst.x}
                  y2={dst.y}
                  stroke="url(#edgeGrad)"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  className="animate-pulse"
                  markerEnd="url(#arrow)"
                />
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const isSelected = selectedNode.id === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer"
              >
                <circle
                  r={isSelected ? 26 : 22}
                  fill={
                    node.status === 'DEGRADED' ? '#7F1D1D' :
                    node.status === 'HEALING' ? '#78350F' :
                    '#0B1320'
                  }
                  stroke={
                    isSelected ? '#D4AF37' :
                    node.status === 'DEGRADED' ? '#EF4444' :
                    node.status === 'HEALING' ? '#F59E0B' :
                    '#00F0FF'
                  }
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all duration-300"
                />
                <circle
                  r={isSelected ? 32 : 28}
                  fill="none"
                  stroke={isSelected ? '#D4AF37' : '#00F0FF'}
                  strokeWidth="1"
                  strokeOpacity={isSelected ? '0.6' : '0.2'}
                  className="animate-ping"
                />
                <text
                  textAnchor="middle"
                  dy="4"
                  fill="#FFFFFF"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {node.knight.split('_')[0]}
                </text>
                <text
                  textAnchor="middle"
                  dy="38"
                  fill="#9CA3AF"
                  fontSize="8"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {node.latencyMs}ms
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Inspector */}
      {selectedNode && (
        <div className="p-4 rounded-xl bg-[#0E0E18] border border-[#222238] space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[#1C1C2C] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">{selectedNode.label}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#18182A] text-cyan-300 border border-[#303048]">
                {selectedNode.knight}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded font-bold ${
                selectedNode.status === 'OPTIMAL' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                selectedNode.status === 'DEGRADED' ? 'bg-red-950 text-red-400 border border-red-800' :
                'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {selectedNode.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-[#08080F] border border-[#1A1A28]">
              <div className="text-[10px] text-gray-500 uppercase font-bold">Latency Telemetry</div>
              <div className="text-sm font-black text-[#00F0FF] mt-0.5">{selectedNode.latencyMs} ms</div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#08080F] border border-[#1A1A28]">
              <div className="text-[10px] text-gray-500 uppercase font-bold">Throughput Stream</div>
              <div className="text-sm font-black text-[#D4AF37] mt-0.5">{selectedNode.throughput}</div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#08080F] border border-[#1A1A28]">
              <div className="text-[10px] text-gray-500 uppercase font-bold">Invariants Validated</div>
              <div className="text-sm font-black text-emerald-400 mt-0.5">{selectedNode.invariantsPassed} Passed</div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#08080F] border border-[#1A1A28]">
              <div className="text-[10px] text-gray-500 uppercase font-bold">Sovereign Role</div>
              <div className="text-sm font-black text-purple-400 mt-0.5 truncate">{selectedNode.role}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
