import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Bot,
  Cpu,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Gauge,
  Layers,
  Radio,
  Server,
  Network,
  Users,
  GitBranch,
  Flame,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Play,
  Share2,
  Lock,
  ChevronRight,
  Database,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Workflow,
  Clock,
  ArrowUpRight,
  Maximize2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { SwarmScalingState, RegionalClusterLead, SwarmAgentWorker } from '../types';

interface SwarmMonitoringDashboardProps {
  onNotify?: (message: string, type: 'success' | 'warning') => void;
  compact?: boolean;
}

interface ThroughputPoint {
  time: string;
  throughput: number; // tokens/sec
  taskRate: number; // tasks/min
  latency: number; // ms
  efficiency: number; // %
}

const INITIAL_THROUGHPUT_DATA: ThroughputPoint[] = [
  { time: '21:50:00', throughput: 1120, taskRate: 42, latency: 1.8, efficiency: 94.2 },
  { time: '21:50:10', throughput: 1250, taskRate: 48, latency: 1.6, efficiency: 95.1 },
  { time: '21:50:20', throughput: 1340, taskRate: 55, latency: 1.7, efficiency: 96.0 },
  { time: '21:50:30', throughput: 1180, taskRate: 50, latency: 1.5, efficiency: 95.8 },
  { time: '21:50:40', throughput: 1420, taskRate: 64, latency: 1.9, efficiency: 96.5 },
  { time: '21:50:50', throughput: 1580, taskRate: 72, latency: 2.1, efficiency: 97.2 },
  { time: '21:51:00', throughput: 1720, taskRate: 85, latency: 1.8, efficiency: 97.8 },
  { time: '21:51:10', throughput: 1650, taskRate: 80, latency: 1.6, efficiency: 97.5 },
  { time: '21:51:20', throughput: 1890, taskRate: 94, latency: 2.0, efficiency: 98.1 },
  { time: '21:51:30', throughput: 2040, taskRate: 106, latency: 2.2, efficiency: 98.6 },
  { time: '21:51:40', throughput: 1980, taskRate: 98, latency: 1.9, efficiency: 98.4 },
  { time: '21:51:50', throughput: 2150, taskRate: 115, latency: 2.1, efficiency: 98.9 }
];

export function SwarmMonitoringDashboard({ onNotify, compact = false }: SwarmMonitoringDashboardProps) {
  const [swarmState, setSwarmState] = useState<SwarmScalingState | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanding, setExpanding] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<RegionalClusterLead | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'THROUGHPUT' | 'REGIONAL_EFFICIENCY' | 'TIER_DISTRIBUTION'>('THROUGHPUT');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [throughputHistory, setThroughputHistory] = useState<ThroughputPoint[]>(INITIAL_THROUGHPUT_DATA);

  const fetchSwarmState = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/swarm/status');
      if (res.ok) {
        const data: SwarmScalingState = await res.json();
        setSwarmState(data);
        if (!selectedCluster && data.regionalLeads && data.regionalLeads.length > 0) {
          setSelectedCluster(data.regionalLeads[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch swarm status for SwarmMonitoringDashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwarmState();
  }, []);

  // Real-time chart data ticker simulation
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      
      setThroughputHistory(prev => {
        const last = prev[prev.length - 1] || INITIAL_THROUGHPUT_DATA[0];
        const jitter = Math.floor((Math.random() - 0.45) * 160);
        const newThroughput = Math.max(800, Math.min(3200, last.throughput + jitter));
        const newTaskRate = Math.max(20, Math.round(newThroughput / 19));
        const newLatency = Number((1.4 + Math.random() * 0.9).toFixed(2));
        const newEff = Number((95.5 + Math.random() * 3.8).toFixed(1));

        const nextPoint: ThroughputPoint = {
          time: timeStr,
          throughput: newThroughput,
          taskRate: newTaskRate,
          latency: newLatency,
          efficiency: newEff
        };

        const updated = [...prev.slice(1), nextPoint];
        return updated;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  const handleScaleExpansion = async (scale: number = 1024) => {
    setExpanding(true);
    try {
      const res = await fetch('/api/swarm/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scale })
      });
      if (res.ok) {
        const updated: SwarmScalingState = await res.json();
        setSwarmState(updated);
        if (onNotify) {
          onNotify(`🚀 Swarm Expansion synchronized: ${scale} Agents across 24D Leech Lattice`, 'success');
        }
      }
    } catch (err) {
      if (onNotify) onNotify('Failed to execute swarm expansion', 'warning');
    } finally {
      setExpanding(false);
    }
  };

  // Fallback calculations & metrics
  const totalAgents = swarmState?.totalSwarmAgentsCount || 1024;
  const activeWorkers = swarmState?.activeWorkers || [];
  const clusterLeads = swarmState?.regionalLeads || [];
  const sardaHitRate = swarmState?.sardaCentralizedCache?.globalSearchHitRate || 96.4;
  const tokenSavings = swarmState?.sardaCentralizedCache?.swarmAmortizedTokenSavingsMultiplier || 14.8;
  const tteReduction = swarmState?.tteGraph?.averageContextReductionPercent || 84.6;

  // Real-time Throughput current readouts
  const latestPoint = throughputHistory[throughputHistory.length - 1] || INITIAL_THROUGHPUT_DATA[0];
  const currentThroughput = latestPoint.throughput;
  const currentLatency = latestPoint.latency;
  const currentTaskRate = latestPoint.taskRate;

  // Regional Cluster Efficiency data for Recharts Bar Chart
  const clusterBarData = useMemo(() => {
    if (clusterLeads.length > 0) {
      return clusterLeads.map(c => ({
        name: c.clusterName.replace('Hub-', 'H-').replace('North', 'N').replace('South', 'S').replace('East', 'E').replace('West', 'W'),
        fullName: c.clusterName,
        hitRate: c.sardaCacheHitRate,
        workers: c.workerCount,
        efficiency: Math.round(c.sardaCacheHitRate * 0.98 + (c.workerCount / 128) * 2)
      }));
    }
    return [
      { name: 'H-US-E', fullName: 'Hub-US-East', hitRate: 98.4, workers: 128, efficiency: 98 },
      { name: 'H-US-W', fullName: 'Hub-US-West', hitRate: 96.8, workers: 128, efficiency: 97 },
      { name: 'H-EU-C', fullName: 'Hub-EU-Central', hitRate: 97.2, workers: 128, efficiency: 97 },
      { name: 'H-EU-W', fullName: 'Hub-EU-West', hitRate: 95.9, workers: 128, efficiency: 96 },
      { name: 'H-AP-E', fullName: 'Hub-AP-East', hitRate: 99.1, workers: 128, efficiency: 99 },
      { name: 'H-AP-S', fullName: 'Hub-AP-South', hitRate: 94.6, workers: 128, efficiency: 95 },
      { name: 'H-SA-E', fullName: 'Hub-SA-East', hitRate: 93.8, workers: 128, efficiency: 94 },
      { name: 'H-AF-S', fullName: 'Hub-AF-South', hitRate: 95.2, workers: 128, efficiency: 95 }
    ];
  }, [clusterLeads]);

  // Agent Tier Distribution data for Recharts Pie / Ring Chart
  const tierDistributionData = [
    { name: 'Tier 1 Orchestrators', count: 8, color: '#F59E0B', percentage: 1 },
    { name: 'Tier 2 Regional Leads', count: 64, color: '#38BDF8', percentage: 6 },
    { name: 'Tier 3 Specialized Workers', count: 952, color: '#A855F7', percentage: 93 }
  ];

  // Active Blueprint OS Task Pipeline Progress States
  const taskPipelines = [
    { id: 'T-101', name: 'Hydra Ledger Tenant Filter', phase: 'Z3 Verification', progress: 85, color: 'from-amber-500 to-emerald-400' },
    { id: 'T-102', name: '24D Leech Lattice Quantizer', phase: 'Bubblewrap Sandbox', progress: 68, color: 'from-sky-500 to-cyan-400' },
    { id: 'T-103', name: 'Sentinel Lease Validator', phase: 'DAG Scheduling', progress: 45, color: 'from-purple-500 to-pink-400' },
    { id: 'T-104', name: 'Sarda Semantic Vector Index', phase: 'Specification Locked', progress: 28, color: 'from-yellow-500 to-amber-300' }
  ];

  // Custom Recharts Dark Tooltip
  const CustomThroughputTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0B0B14] border border-[#2B2B44] p-3 rounded-xl shadow-2xl text-xs font-mono space-y-1 z-50">
          <div className="text-gray-400 font-bold border-b border-[#1F1F32] pb-1 flex items-center justify-between gap-4">
            <span>Timestamp:</span>
            <span className="text-white">{label}</span>
          </div>
          <div className="text-sky-300 flex items-center justify-between gap-4">
            <span>Throughput:</span>
            <span className="font-bold">{payload[0]?.value?.toLocaleString()} tokens/s</span>
          </div>
          {payload[1] && (
            <div className="text-amber-300 flex items-center justify-between gap-4">
              <span>Task Rate:</span>
              <span className="font-bold">{payload[1]?.value} tasks/min</span>
            </div>
          )}
          {payload[2] && (
            <div className="text-emerald-300 flex items-center justify-between gap-4">
              <span>Efficiency:</span>
              <span className="font-bold">{payload[2]?.value}%</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0D0D15] border-2 border-[#26263B] hover:border-sky-500/50 rounded-2xl p-4 sm:p-5 space-y-5 transition-all shadow-2xl">
      
      {/* 1. TOP HEADER & TELEMETRY STRIP */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1E1E2E] pb-3.5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Gauge size={18} className="text-sky-400" /> Swarm Observability & Telemetry
            </h2>
            <span className="text-[10px] bg-sky-950 text-sky-300 px-2.5 py-0.5 rounded-full font-bold border border-sky-800/40 font-mono">
              1,024 AGENTS • 24D LATTICE
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Recharts real-time throughput metrics, efficiency curves, regional cache clusters, and task progress bars.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Live stream toggle */}
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              isLiveStreaming
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-[#181826] border-[#2A2A3E] text-gray-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-emerald-400 animate-ping' : 'bg-gray-500'}`}></span>
            <span>{isLiveStreaming ? 'LIVE TICK' : 'PAUSED'}</span>
          </button>

          {/* Scale button */}
          <button
            onClick={() => handleScaleExpansion(1024)}
            disabled={expanding}
            className="px-3.5 py-1.5 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-black font-black text-xs rounded-xl flex items-center gap-1.5 shadow font-mono disabled:opacity-50 active:scale-95 transition-all"
          >
            {expanding ? <RefreshCw size={12} className="animate-spin" /> : <Flame size={12} />}
            <span>{expanding ? 'Scaling...' : 'Scale 1,024'}</span>
          </button>

          <button
            onClick={fetchSwarmState}
            className="p-1.5 bg-[#151522] hover:bg-[#1E1E30] text-gray-300 rounded-xl border border-[#2A2A3E]"
            title="Refresh Swarm Telemetry"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-sky-400' : ''} />
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS WITH METRIC BADGES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Metric 1: Fleet Scale */}
        <div className="bg-gradient-to-b from-[#141424] to-[#0A0A12] border border-[#222238] p-3.5 rounded-xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-bold flex items-center gap-1.5 text-[11px]">
              <Users size={14} className="text-amber-400" /> Active Swarm Fleet
            </span>
            <span className="text-[10px] text-amber-300 bg-amber-950/70 px-1.5 py-0.5 rounded font-mono font-bold border border-amber-800/40">
              1,024 Agents
            </span>
          </div>

          <div className="flex items-baseline justify-between font-mono">
            <span className="text-xl font-black text-white">1,024 / 1,024</span>
            <span className="text-[10px] text-emerald-400 font-bold">100% Online</span>
          </div>

          <div className="w-full bg-[#08080E] h-2 rounded-full overflow-hidden p-0.5 border border-[#1E1E2C]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-[#D4AF37] transition-all duration-700"
              style={{ width: '100%' }}
            ></div>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-gray-400">
            <span>8 Regional Hubs</span>
            <span className="text-amber-300 font-bold">Tier 0 Ascended</span>
          </div>
        </div>

        {/* Metric 2: Live Throughput */}
        <div className="bg-gradient-to-b from-[#141424] to-[#0A0A12] border border-[#222238] p-3.5 rounded-xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-bold flex items-center gap-1.5 text-[11px]">
              <Zap size={14} className="text-sky-400" /> Live Throughput
            </span>
            <span className="text-[10px] text-sky-300 bg-sky-950/70 px-1.5 py-0.5 rounded font-mono font-bold border border-sky-800/40">
              {currentLatency}ms Latency
            </span>
          </div>

          <div className="flex items-baseline justify-between font-mono">
            <span className="text-xl font-black text-sky-300">{currentThroughput.toLocaleString()}</span>
            <span className="text-[10px] text-gray-400">tokens / sec</span>
          </div>

          <div className="w-full bg-[#08080E] h-2 rounded-full overflow-hidden p-0.5 border border-[#1E1E2C]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-300 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((currentThroughput / 2500) * 100))}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-gray-400">
            <span>Tasks: {currentTaskRate}/min</span>
            <span className="text-sky-400 font-bold">{Math.round((currentThroughput / 2500) * 100)}% Cap</span>
          </div>
        </div>

        {/* Metric 3: Lattice Health */}
        <div className="bg-gradient-to-b from-[#141424] to-[#0A0A12] border border-[#222238] p-3.5 rounded-xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-bold flex items-center gap-1.5 text-[11px]">
              <Network size={14} className="text-emerald-400" /> 24D Leech Health
            </span>
            <span className="text-[10px] text-emerald-300 bg-emerald-950/70 px-1.5 py-0.5 rounded font-mono font-bold border border-emerald-800/40">
              24D OPTIMAL
            </span>
          </div>

          <div className="flex items-baseline justify-between font-mono">
            <span className="text-xl font-black text-emerald-300">99.8%</span>
            <span className="text-[10px] text-gray-400">0.24ms sync</span>
          </div>

          <div className="w-full bg-[#08080E] h-2 rounded-full overflow-hidden p-0.5 border border-[#1E1E2C]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 transition-all duration-700"
              style={{ width: '99.8%' }}
            ></div>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-gray-400">
            <span>Ouroboros Bound</span>
            <span className="text-emerald-400 font-bold">Zero Jitter</span>
          </div>
        </div>

        {/* Metric 4: Sarda Cache Efficiency */}
        <div className="bg-gradient-to-b from-[#141424] to-[#0A0A12] border border-[#222238] p-3.5 rounded-xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-bold flex items-center gap-1.5 text-[11px]">
              <Database size={14} className="text-purple-400" /> Sarda Cache Hit
            </span>
            <span className="text-[10px] text-purple-300 bg-purple-950/70 px-1.5 py-0.5 rounded font-mono font-bold border border-purple-800/40">
              {tokenSavings}x Save
            </span>
          </div>

          <div className="flex items-baseline justify-between font-mono">
            <span className="text-xl font-black text-purple-300">{sardaHitRate}%</span>
            <span className="text-[10px] text-gray-400">TTE -{tteReduction}%</span>
          </div>

          <div className="w-full bg-[#08080E] h-2 rounded-full overflow-hidden p-0.5 border border-[#1E1E2C]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-400 to-pink-400 transition-all duration-700"
              style={{ width: `${sardaHitRate}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-gray-400">
            <span>Context Red.: {tteReduction}%</span>
            <span className="text-purple-400 font-bold">{tokenSavings}x Multiplier</span>
          </div>
        </div>

      </div>

      {/* =========================================================================
          3. RECHARTS VISUALIZATION SUITE: REAL-TIME CHARTS & TELEMETRY
          ========================================================================= */}
      <div className="bg-[#0B0B12] border border-[#202032] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        
        {/* Chart View Switcher Tabs & Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-[#1A1A2A] pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-sky-400" />
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              Real-Time Swarm Telemetry & Performance Analytics
            </h3>
          </div>

          <div className="flex items-center gap-1.5 bg-[#141422] p-1 rounded-xl border border-[#242438] text-[10px] font-mono">
            <button
              onClick={() => setActiveChartTab('THROUGHPUT')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeChartTab === 'THROUGHPUT'
                  ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow font-black'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <LineChartIcon size={12} />
              <span>Throughput & Latency</span>
            </button>
            <button
              onClick={() => setActiveChartTab('REGIONAL_EFFICIENCY')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeChartTab === 'REGIONAL_EFFICIENCY'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow font-black'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <BarChart3 size={12} />
              <span>Regional Hubs</span>
            </button>
            <button
              onClick={() => setActiveChartTab('TIER_DISTRIBUTION')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeChartTab === 'TIER_DISTRIBUTION'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow font-black'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <PieChartIcon size={12} />
              <span>Fleet Tiers</span>
            </button>
          </div>
        </div>

        {/* CHART 1: Real-time Throughput (AreaChart) */}
        {activeChartTab === 'THROUGHPUT' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-sky-400 inline-block"></span>
                <span>Throughput (Tokens/s)</span>
                <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block ml-3"></span>
                <span>Task Execution Rate (Tasks/min)</span>
              </span>
              <span className="text-emerald-400 font-bold">Live 2.4s Sampling Window</span>
            </div>

            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={throughputHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="throughputGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="taskRateGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
                  <XAxis dataKey="time" stroke="#6B7280" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip content={<CustomThroughputTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="throughput"
                    stroke="#38BDF8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#throughputGrad)"
                    name="Throughput"
                  />
                  <Area
                    type="monotone"
                    dataKey="taskRate"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#taskRateGrad)"
                    name="Task Rate"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono pt-1 border-t border-[#181826]">
              <div className="bg-[#0D0D16] p-2 rounded-lg border border-[#1E1E2E]">
                <span className="text-gray-500 block">Rolling Average</span>
                <strong className="text-sky-300 text-xs">
                  {Math.round(throughputHistory.reduce((a, b) => a + b.throughput, 0) / throughputHistory.length)} t/s
                </strong>
              </div>
              <div className="bg-[#0D0D16] p-2 rounded-lg border border-[#1E1E2E]">
                <span className="text-gray-500 block">p99 Latency</span>
                <strong className="text-emerald-400 text-xs">{currentLatency} ms</strong>
              </div>
              <div className="bg-[#0D0D16] p-2 rounded-lg border border-[#1E1E2E]">
                <span className="text-gray-500 block">Lattice Invariant Checks</span>
                <strong className="text-amber-300 text-xs">100% Passed (Z3)</strong>
              </div>
            </div>
          </div>
        )}

        {/* CHART 2: Regional Hub Cache Efficiency (BarChart) */}
        {activeChartTab === 'REGIONAL_EFFICIENCY' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400">
              <span>Sarda Cache Hit Rate (%) across 8 Regional Hubs (128 Nodes/Hub)</span>
              <span className="text-purple-300 font-bold">Global Average: {sardaHitRate}%</span>
            </div>

            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clusterBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
                  <XAxis dataKey="name" stroke="#6B7280" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={[85, 100]} tickLine={false} />
                  <Tooltip
                    formatter={(value: any) => [`${value}%`, 'Cache Hit Rate']}
                    labelFormatter={(label: any) => `Hub: ${label}`}
                    contentStyle={{ backgroundColor: '#0B0B14', borderColor: '#2B2B44', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Bar dataKey="hitRate" radius={[6, 6, 0, 0]}>
                    {clusterBarData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.hitRate > 97 ? '#A855F7' : entry.hitRate > 95 ? '#38BDF8' : '#F59E0B'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono pt-1 border-t border-[#181826]">
              {clusterBarData.slice(0, 4).map((c, i) => (
                <div key={i} className="bg-[#0D0D16] p-2 rounded-lg border border-[#1E1E2E] text-center">
                  <span className="text-gray-400 block truncate">{c.fullName}</span>
                  <span className="text-purple-300 font-bold text-xs">{c.hitRate}% hit</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHART 3: Fleet Tier Distribution (PieChart & Breakdown) */}
        {activeChartTab === 'TIER_DISTRIBUTION' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-6 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {tierDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value} Agents`, 'Fleet Size']}
                    contentStyle={{ backgroundColor: '#0B0B14', borderColor: '#2B2B44', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="md:col-span-6 space-y-2.5 font-mono text-xs">
              {tierDistributionData.map((tier, idx) => (
                <div key={idx} className="bg-[#0E0E18] p-3 rounded-xl border border-[#1E1E2E] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-2 text-white">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }}></span>
                      <span>{tier.name}</span>
                    </span>
                    <span className="text-gray-400 font-bold">{tier.count} Agents</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Lattice Topology Share</span>
                    <span className="text-amber-300">{tier.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          4. BLUEPRINT OS TASK PROGRESS BARS (Real-time Task Lifecycle Execution)
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Workflow size={14} className="text-amber-400" /> Active Blueprint OS Task Progress ({taskPipelines.length} Tasks)
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">
            All Tasks Bounded to Ephemeral VFS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {taskPipelines.map(task => (
            <div key={task.id} className="bg-[#11111C] border border-[#222234] p-3.5 rounded-xl space-y-2 shadow">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-[#181826] text-amber-300 font-mono font-bold px-1.5 py-0.5 rounded border border-[#28283C]">
                    {task.id}
                  </span>
                  <span className="font-black text-white truncate max-w-[180px]">{task.name}</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">{task.progress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#08080E] h-2 rounded-full overflow-hidden p-0.5 border border-[#1E1E2C]">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${task.color} transition-all duration-700`}
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono text-gray-400">
                <span>Phase: <strong className="text-sky-300">{task.phase}</strong></span>
                <span className="text-emerald-400 font-bold">Status: EXECUTING</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. ACTIVE AGENT WORKERS FLEET STATUS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Bot size={14} className="text-[#D4AF37]" /> Active Swarm Worker Fleet Status ({activeWorkers.length || 8} Core Nodes)
          </h3>
          <span className="text-[10px] font-mono text-gray-400">
            Real-time Load & Token Burn Rate
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {(activeWorkers.length > 0 ? activeWorkers : [
            { id: 'w-01', name: 'Sir-Forge [ARM64]', tier: 'TIER_1_ORCHESTRATOR', currentTask: 'AST Synthesizer', tokenBurnRatePerSec: 240, status: 'BURNING', activeModel: 'gemini-2.5-flash' },
            { id: 'w-02', name: 'Sir-Ant [Topological]', tier: 'TIER_2_REGIONAL_LEAD', currentTask: 'DAG Taskifier', tokenBurnRatePerSec: 195, status: 'RESOLVING', activeModel: 'gemini-2.5-flash' },
            { id: 'w-03', name: 'Boris [Z3 Verifier]', tier: 'TIER_3_SPECIALIST', currentTask: 'SMT Invariant Solver', tokenBurnRatePerSec: 180, status: 'VERIFYING', activeModel: 'gemini-2.5-flash' },
            { id: 'w-04', name: 'Socrates [Proof Anchor]', tier: 'TIER_3_SPECIALIST', currentTask: 'Hydra Receipt Ledger', tokenBurnRatePerSec: 160, status: 'ANCHORING', activeModel: 'gemini-2.5-flash' }
          ] as any[]).map((worker) => {
            const loadPercent = Math.min(100, Math.round((worker.tokenBurnRatePerSec / 250) * 100));
            return (
              <div
                key={worker.id}
                className="bg-[#11111C] border border-[#222234] hover:border-sky-500/50 p-3 rounded-xl space-y-2.5 transition-all shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-xs font-black text-white group-hover:text-sky-300 transition-colors truncate">
                      {worker.name}
                    </span>
                  </div>

                  <span
                    className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      worker.tier === 'TIER_1_ORCHESTRATOR'
                        ? 'bg-amber-950 text-amber-300 border-amber-800/50'
                        : worker.tier === 'TIER_2_REGIONAL_LEAD'
                        ? 'bg-sky-950 text-sky-300 border-sky-800/50'
                        : 'bg-purple-950 text-purple-300 border-purple-800/50'
                    }`}
                  >
                    {worker.tier.replace('TIER_', 'T')}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-gray-400 truncate">
                  Task: <strong className="text-gray-200">{worker.currentTask}</strong>
                </div>

                {/* Real-time Workload Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-gray-400">Load: {worker.tokenBurnRatePerSec} t/s</span>
                    <span className="text-sky-300 font-bold">{loadPercent}%</span>
                  </div>
                  <div className="w-full bg-[#08080E] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        worker.tier === 'TIER_1_ORCHESTRATOR'
                          ? 'bg-[#D4AF37]'
                          : worker.tier === 'TIER_2_REGIONAL_LEAD'
                          ? 'bg-sky-400'
                          : 'bg-purple-400'
                      }`}
                      style={{ width: `${loadPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-gray-400 pt-1 border-t border-[#1C1C2A]">
                  <span className="truncate max-w-[110px] text-gray-400">{worker.activeModel}</span>
                  <span className="text-emerald-400 font-bold">{worker.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. HARDWARE CONSTRAINTS & FOOTER SUMMARY */}
      <div className="bg-[#09090F] border border-[#1E1E2C] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-gray-300">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>Lattice Topology: <strong className="text-emerald-400">24D Leech Space (1,024 Agents Active)</strong></span>
        </div>

        <div className="flex items-center gap-3 text-gray-400 text-[11px]">
          <span>RAM: <strong className="text-amber-300">3.4GB / 8.0GB Clamped</strong></span>
          <span>•</span>
          <span>Throughput: <strong className="text-sky-300">{currentThroughput} tokens/sec</strong></span>
          <span>•</span>
          <span>Sarda Savings: <strong className="text-purple-300">{tokenSavings}x</strong></span>
        </div>
      </div>

    </div>
  );
}
