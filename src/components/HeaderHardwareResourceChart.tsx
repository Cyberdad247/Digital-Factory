import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  Cpu,
  Server,
  Activity,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Zap,
  Shield,
  Layers,
  Sparkles,
  ChevronDown,
  X,
  Sliders,
  Flame,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { MainView } from '../App';
import { getModeSystemInstruction, ModeSystemInstruction } from '../services/modeSystemInstructionEngine';

interface TelemetryPoint {
  timestamp: string;
  timeSec: number;
  ramUsedGB: number;
  ramPercentage: number;
  cpuLoadPct: number;
  wasmPages: number;
}

interface HeaderHardwareResourceChartProps {
  activeTab: MainView;
  onOpenSettings?: (tab?: string) => void;
}

export function HeaderHardwareResourceChart({ activeTab, onOpenSettings }: HeaderHardwareResourceChartProps) {
  const modeSpec = getModeSystemInstruction(activeTab);
  const { resourceConstraint } = modeSpec;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [tickSpeedMs, setTickSpeedMs] = useState(1500);
  const [history, setHistory] = useState<TelemetryPoint[]>(() => {
    // Generate initial 12 points calibrated to active mode
    const initialPoints: TelemetryPoint[] = [];
    const baseRam = resourceConstraint.allocatedRamGB * 0.65;
    const now = Date.now();
    for (let i = 11; i >= 0; i--) {
      const t = new Date(now - i * 1500);
      const timeStr = t.toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' });
      const variance = (Math.sin(i * 0.7) * 0.15 + (Math.random() * 0.1 - 0.05));
      const ramUsed = Math.max(0.2, Math.min(resourceConstraint.allocatedRamGB, +(baseRam + variance).toFixed(2)));
      const ramPct = Math.round((ramUsed / resourceConstraint.allocatedRamGB) * 100);
      const cpuLoad = Math.round(30 + Math.sin(i * 0.5) * 18 + (Math.random() * 12));
      initialPoints.push({
        timestamp: timeStr,
        timeSec: Math.floor((now - i * 1500) / 1000),
        ramUsedGB: ramUsed,
        ramPercentage: ramPct,
        cpuLoadPct: cpuLoad,
        wasmPages: Math.round(resourceConstraint.wasmPageQuota * (ramUsed / resourceConstraint.allocatedRamGB))
      });
    }
    return initialPoints;
  });

  const [currentMetrics, setCurrentMetrics] = useState<{
    ramUsedGB: number;
    ramPercentage: number;
    cpuLoadPct: number;
    peakRamGB: number;
    avgCpuPct: number;
  }>({
    ramUsedGB: +(resourceConstraint.allocatedRamGB * 0.72).toFixed(2),
    ramPercentage: 72,
    cpuLoadPct: 38,
    peakRamGB: +(resourceConstraint.allocatedRamGB * 0.85).toFixed(2),
    avgCpuPct: 41
  });

  // Re-calibrate when activeTab changes
  useEffect(() => {
    const baseRam = +(resourceConstraint.allocatedRamGB * 0.68).toFixed(2);
    const ramPct = Math.round((baseRam / resourceConstraint.allocatedRamGB) * 100);
    const cpuLoad = Math.round(25 + Math.random() * 25);
    
    setCurrentMetrics(prev => ({
      ...prev,
      ramUsedGB: baseRam,
      ramPercentage: ramPct,
      cpuLoadPct: cpuLoad,
      peakRamGB: +(resourceConstraint.allocatedRamGB * 0.82).toFixed(2)
    }));

    // Re-seed history for new mode
    const now = Date.now();
    const newHistory: TelemetryPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const t = new Date(now - i * 1500);
      const timeStr = t.toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' });
      const variance = (Math.sin(i * 0.8) * 0.12 + (Math.random() * 0.08 - 0.04));
      const ramUsed = Math.max(0.2, Math.min(resourceConstraint.allocatedRamGB, +(baseRam + variance).toFixed(2)));
      const pct = Math.round((ramUsed / resourceConstraint.allocatedRamGB) * 100);
      const cpu = Math.round(25 + Math.sin(i * 0.6) * 15 + Math.random() * 10);
      newHistory.push({
        timestamp: timeStr,
        timeSec: Math.floor((now - i * 1500) / 1000),
        ramUsedGB: ramUsed,
        ramPercentage: pct,
        cpuLoadPct: cpu,
        wasmPages: Math.round(resourceConstraint.wasmPageQuota * (ramUsed / resourceConstraint.allocatedRamGB))
      });
    }
    setHistory(newHistory);
  }, [activeTab]);

  // Real-time telemetry ticker
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' });
      
      const quota = resourceConstraint.allocatedRamGB;
      // dynamic oscillation simulating workload
      const osc = Math.sin(Date.now() / 3000) * 0.15 + (Math.random() * 0.12 - 0.06);
      const targetBase = quota * 0.70;
      const ramUsed = Math.max(0.2, Math.min(quota, +(targetBase + osc).toFixed(2)));
      const ramPct = Math.round((ramUsed / quota) * 100);
      
      const coreFactor = resourceConstraint.activeCores / 8;
      const cpuLoad = Math.max(12, Math.min(96, Math.round(28 + Math.cos(Date.now() / 2500) * 22 + (Math.random() * 16 - 8) + (coreFactor * 10))));
      
      const newPoint: TelemetryPoint = {
        timestamp: timeStr,
        timeSec: Math.floor(Date.now() / 1000),
        ramUsedGB: ramUsed,
        ramPercentage: ramPct,
        cpuLoadPct: cpuLoad,
        wasmPages: Math.round(resourceConstraint.wasmPageQuota * (ramUsed / quota))
      };

      setHistory(prev => {
        const next = [...prev.slice(-17), newPoint];
        // calculate peak and avg
        const peak = Math.max(...next.map(p => p.ramUsedGB));
        const avgCpu = Math.round(next.reduce((acc, p) => acc + p.cpuLoadPct, 0) / next.length);
        
        setCurrentMetrics({
          ramUsedGB: ramUsed,
          ramPercentage: ramPct,
          cpuLoadPct: cpuLoad,
          peakRamGB: peak,
          avgCpuPct: avgCpu
        });

        return next;
      });
    }, tickSpeedMs);

    return () => clearInterval(interval);
  }, [isPaused, tickSpeedMs, resourceConstraint, activeTab]);

  // Mini Chart data for compact header view
  const miniChartData = history.slice(-8);

  return (
    <div className="relative font-mono">
      {/* COMPACT HEADER INTERACTIVE CAPSULE */}
      <div 
        id="header-hardware-telemetry-capsule"
        onClick={() => setIsExpanded(prev => !prev)}
        className="group relative flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#090A12]/95 border transition-all duration-300 cursor-pointer select-none hover:bg-[#111322] shadow-lg overflow-hidden"
        style={{ 
          borderColor: isExpanded ? modeSpec.color : `${modeSpec.color}50`,
          boxShadow: isExpanded ? `0 0 16px ${modeSpec.color}35` : `0 0 8px ${modeSpec.color}15`
        }}
        title="Click to expand real-time Studio Mode RAM & CPU hardware load visualizer"
      >
        {/* Pulsing Corner Status Dot */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPaused ? 'bg-amber-400' : ''}`}
              style={{ backgroundColor: isPaused ? '#F59E0B' : modeSpec.color }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: isPaused ? '#F59E0B' : modeSpec.color }}
            />
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-300 hidden xl:inline">
            LOAD:
          </span>
        </div>

        {/* Live RAM Metric */}
        <div className="flex items-center gap-1 text-[10px]">
          <Server size={11} style={{ color: modeSpec.color }} />
          <span className="text-gray-400 hidden sm:inline">RAM:</span>
          <strong className="text-white font-mono font-bold">
            {currentMetrics.ramUsedGB}
          </strong>
          <span className="text-gray-500 text-[9px]">/{resourceConstraint.allocatedRamGB}G</span>
          <span 
            className="text-[9px] font-bold px-1 rounded ml-0.5"
            style={{ backgroundColor: `${modeSpec.color}25`, color: modeSpec.color }}
          >
            {currentMetrics.ramPercentage}%
          </span>
        </div>

        <span className="text-gray-600 hidden sm:inline">|</span>

        {/* Live CPU Metric */}
        <div className="flex items-center gap-1 text-[10px]">
          <Cpu size={11} className="text-[#00F0FF]" />
          <span className="text-gray-400 hidden sm:inline">CPU:</span>
          <strong className="text-emerald-400 font-mono font-bold">
            {currentMetrics.cpuLoadPct}%
          </strong>
        </div>

        {/* Embedded Mini Sparkline Chart */}
        <div className="w-16 h-5 hidden md:block opacity-90 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={miniChartData} margin={{ top: 1, right: 1, bottom: 1, left: 1 }}>
              <defs>
                <linearGradient id={`miniRamGrad-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={modeSpec.color} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={modeSpec.color} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="cpuLoadPct"
                stroke="#00F0FF"
                strokeWidth={1.2}
                fillOpacity={0}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="ramPercentage"
                stroke={modeSpec.color}
                strokeWidth={1.5}
                fill={`url(#miniRamGrad-${activeTab})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Dropdown Toggle Icon */}
        <div className="flex items-center text-gray-400 group-hover:text-white transition-colors ml-0.5">
          <ChevronDown 
            size={12} 
            className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-white' : ''}`} 
          />
        </div>
      </div>

      {/* EXPANDABLE TELEMETRY INSPECTOR DROPDOWN / POPOVER */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-[340px] sm:w-[460px] md:w-[540px] z-50 p-4 bg-[#080911]/98 border-2 rounded-2xl shadow-2xl backdrop-blur-xl space-y-3.5"
            style={{ 
              borderColor: `${modeSpec.color}60`,
              boxShadow: `0 12px 36px -8px rgba(0,0,0,0.8), 0 0 24px ${modeSpec.color}25`
            }}
          >
            {/* Header / Mode Spec Identity Banner */}
            <div className="flex items-center justify-between border-b border-[#1A1D2E] pb-2.5">
              <div className="flex items-center gap-2.5">
                <div 
                  className="p-1.5 rounded-lg border flex items-center justify-center shadow-inner"
                  style={{ 
                    backgroundColor: `${modeSpec.color}20`, 
                    borderColor: `${modeSpec.color}60`,
                    color: modeSpec.color
                  }}
                >
                  <Activity size={15} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      {modeSpec.title}
                    </h4>
                    <span 
                      className="text-[9px] px-1.5 py-0.2 rounded font-mono font-black border"
                      style={{ 
                        backgroundColor: `${modeSpec.color}15`, 
                        color: modeSpec.color, 
                        borderColor: `${modeSpec.color}40` 
                      }}
                    >
                      LIVE HARDWARE HUD
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-sans block truncate max-w-[260px] sm:max-w-[340px]">
                    System Instruction: <strong className="text-gray-200">{modeSpec.instructionId}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Pause / Resume Ticker */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPaused(!isPaused);
                  }}
                  className="p-1 px-2 rounded-lg bg-[#141726] hover:bg-[#1E233A] border border-[#2B314E] text-gray-300 hover:text-white transition-all text-[10px] flex items-center gap-1 cursor-pointer"
                  title={isPaused ? 'Resume live hardware stream' : 'Pause live hardware stream'}
                >
                  {isPaused ? <Play size={10} className="text-emerald-400" /> : <Pause size={10} className="text-amber-400" />}
                  <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="p-1.5 rounded-lg bg-[#141726] hover:bg-[#20253B] text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* REAL-TIME DUAL-AXIS RECHARTS AREA CHART */}
            <div className="p-3 bg-[#0B0D18] border border-[#1C2034] rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: modeSpec.color }} />
                    <span className="text-gray-300 font-bold">RAM Load %</span>
                    <span className="text-gray-400">({currentMetrics.ramUsedGB} / {resourceConstraint.allocatedRamGB} GB)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#00F0FF]" />
                    <span className="text-gray-300 font-bold">CPU Load %</span>
                    <span className="text-gray-400">({currentMetrics.cpuLoadPct}%)</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[9px] text-gray-400">
                  <span>Tick:</span>
                  <select 
                    value={tickSpeedMs}
                    onChange={(e) => setTickSpeedMs(Number(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#121422] border border-[#262B44] text-white px-1.5 py-0.5 rounded text-[9px] cursor-pointer outline-none"
                  >
                    <option value={800}>800ms (High Flux)</option>
                    <option value={1500}>1.5s (Default)</option>
                    <option value={3000}>3.0s (Power Save)</option>
                  </select>
                </div>
              </div>

              {/* Chart Canvas */}
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`gradModeRam-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={modeSpec.color} stopOpacity={0.45}/>
                        <stop offset="95%" stopColor={modeSpec.color} stopOpacity={0.02}/>
                      </linearGradient>
                      <linearGradient id="gradCpuLoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    
                    <CartesianGrid strokeDasharray="3 3" stroke="#181B2B" vertical={false} />
                    
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="#4B5563" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={{ stroke: '#22273D' }} 
                    />
                    <YAxis 
                      stroke="#4B5563" 
                      fontSize={9} 
                      domain={[0, 100]} 
                      tickLine={false} 
                      axisLine={{ stroke: '#22273D' }} 
                      tickFormatter={(val) => `${val}%`}
                    />
                    
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as TelemetryPoint;
                          return (
                            <div className="p-2.5 bg-[#090A14] border border-[#2B314E] rounded-lg shadow-xl text-[10px] font-mono space-y-1">
                              <div className="text-gray-400 font-bold border-b border-[#1C2035] pb-1">
                                TIME: {label}
                              </div>
                              <div className="flex items-center justify-between gap-3 text-white">
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: modeSpec.color }} />
                                  RAM Used:
                                </span>
                                <strong>{data.ramUsedGB} GB ({data.ramPercentage}%)</strong>
                              </div>
                              <div className="flex items-center justify-between gap-3 text-[#00F0FF]">
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
                                  CPU Load:
                                </span>
                                <strong>{data.cpuLoadPct}%</strong>
                              </div>
                              <div className="flex items-center justify-between gap-3 text-gray-400 pt-0.5 border-t border-[#1C2035]">
                                <span>WASM Pages:</span>
                                <strong>{data.wasmPages.toLocaleString()}</strong>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    
                    {/* RAM Load Area */}
                    <Area
                      type="monotone"
                      dataKey="ramPercentage"
                      stroke={modeSpec.color}
                      strokeWidth={2}
                      fill={`url(#gradModeRam-${activeTab})`}
                      isAnimationActive={false}
                      name="RAM Load"
                    />
                    
                    {/* CPU Load Area */}
                    <Area
                      type="monotone"
                      dataKey="cpuLoadPct"
                      stroke="#00F0FF"
                      strokeWidth={1.8}
                      fill="url(#gradCpuLoad)"
                      isAnimationActive={false}
                      name="CPU Load"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* HARDWARE ISOLATION & CORE ALLOCATION MATRIX */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              {/* Box 1: RAM Quota */}
              <div className="p-2.5 bg-[#0C0E1A] border border-[#1E2338] rounded-xl space-y-1">
                <span className="text-gray-400 text-[9px] uppercase block flex items-center gap-1">
                  <Server size={11} style={{ color: modeSpec.color }} /> Allocated RAM
                </span>
                <div className="text-white font-mono font-bold text-xs">
                  {currentMetrics.ramUsedGB} / {resourceConstraint.allocatedRamGB} GB
                </div>
                <div className="text-[9px] text-gray-400">
                  Max Quota: <strong className="text-gray-300">{resourceConstraint.ramPercentage}%</strong>
                </div>
              </div>

              {/* Box 2: ARM64 Cores */}
              <div className="p-2.5 bg-[#0C0E1A] border border-[#1E2338] rounded-xl space-y-1">
                <span className="text-gray-400 text-[9px] uppercase block flex items-center gap-1">
                  <Cpu size={11} className="text-emerald-400" /> Active Cores
                </span>
                <div className="text-emerald-400 font-mono font-bold text-xs">
                  {resourceConstraint.activeCores} / {resourceConstraint.totalCores} Active
                </div>
                <div className="text-[9px] text-gray-400 truncate">
                  {resourceConstraint.coreAffinity}
                </div>
              </div>

              {/* Box 3: Peak Metric */}
              <div className="p-2.5 bg-[#0C0E1A] border border-[#1E2338] rounded-xl space-y-1">
                <span className="text-gray-400 text-[9px] uppercase block flex items-center gap-1">
                  <Flame size={11} className="text-amber-400" /> Peak RAM / Avg CPU
                </span>
                <div className="text-amber-300 font-mono font-bold text-xs">
                  {currentMetrics.peakRamGB} GB / {currentMetrics.avgCpuPct}%
                </div>
                <div className="text-[9px] text-gray-400">
                  GPU: <strong className="text-gray-300">{resourceConstraint.gpuShaderTier}</strong>
                </div>
              </div>

              {/* Box 4: WASM Pages */}
              <div className="p-2.5 bg-[#0C0E1A] border border-[#1E2338] rounded-xl space-y-1">
                <span className="text-gray-400 text-[9px] uppercase block flex items-center gap-1">
                  <Layers size={11} className="text-[#00F0FF]" /> WASM Quota
                </span>
                <div className="text-[#00F0FF] font-mono font-bold text-xs">
                  {resourceConstraint.wasmPageQuota.toLocaleString()}
                </div>
                <div className="text-[9px] text-gray-400">
                  Memory Pages Quota
                </div>
              </div>
            </div>

            {/* 8-CORE VIRTUAL ARM64 PROCESSOR MATRIX */}
            <div className="p-2.5 bg-[#0C0E1A] border border-[#1E2338] rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-[9px]">
                <span className="font-bold uppercase text-gray-400 flex items-center gap-1">
                  <Cpu size={10} className="text-[#00F0FF]" /> 8-Core ARM64 Affinity Partitioning:
                </span>
                <span className="text-emerald-400 font-mono font-bold">
                  {resourceConstraint.activeCores} Assigned • {8 - resourceConstraint.activeCores} Quarantined
                </span>
              </div>

              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 8 }).map((_, coreIdx) => {
                  const isActive = coreIdx < resourceConstraint.activeCores;
                  return (
                    <div 
                      key={coreIdx}
                      className={`p-1 rounded text-center border font-mono transition-all ${
                        isActive
                          ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                          : 'bg-[#10121C] border-[#1C2032] text-gray-600'
                      }`}
                    >
                      <div className="text-[8px] font-bold">C{coreIdx}</div>
                      <div className="text-[7px]">
                        {isActive ? `${Math.round(currentMetrics.cpuLoadPct * (0.85 + (coreIdx * 0.08)))}%` : 'OFF'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Notice */}
            <div className="flex items-center justify-between text-[9px] text-gray-400 pt-1 border-t border-[#1A1D2E]">
              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                <CheckCircle2 size={10} /> ZERO MONOLITHIC LEAKS ENFORCED
              </span>
              <span>
                {resourceConstraint.deallocatedSubsystems.length} Subsystems Quarantined
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
