import { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Shield, 
  Cpu, 
  Radio, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Terminal, 
  Layers, 
  GitBranch, 
  FastForward, 
  Zap, 
  Sliders, 
  Play, 
  RotateCcw, 
  Maximize2,
  Wrench,
  Gauge,
  Boxes,
  Lock,
  Workflow
} from 'lucide-react';
import { 
  CPPSStationNode, 
  CPPSPipelineEdge, 
  GideonFailureMode, 
  GideonTDDContract, 
  KineticCommandItem, 
  SRESafetyInvariant, 
  IndustrialKPIMetrics 
} from '../types';

interface IndustrialForgeStudioProps {
  onNotify?: (msg: string, type?: 'success' | 'warning') => void;
}

type ActiveStudioLayer = 'VISUAL_TOPOLOGY' | 'CODE_DSL' | 'TELEMETRY_IOT' | 'GIDEON_SIMULATION' | 'AUTONOMOUS_SRE';

const INITIAL_STATIONS: CPPSStationNode[] = [
  {
    id: 'st-ingestion',
    name: '01. Ingestion Staging',
    type: 'INGESTION',
    x: 8,
    y: 45,
    status: 'NOMINAL',
    throughputPartsMin: 32,
    bufferLevel: 78,
    bufferCapacity: 100,
    cycleTimeMs: 1850,
    toleranceUm: 50.0,
    temperatureC: 23.4,
    vibrationMmS: 0.18,
    activeRecipe: 'RECIPE_TITAN_BILLET_AL6061'
  },
  {
    id: 'st-stamping',
    name: '02. Stamping & Extrusion',
    type: 'STAMPING',
    x: 26,
    y: 30,
    status: 'NOMINAL',
    throughputPartsMin: 30,
    bufferLevel: 64,
    bufferCapacity: 100,
    cycleTimeMs: 1980,
    toleranceUm: 15.2,
    temperatureC: 68.2,
    vibrationMmS: 1.42,
    activeRecipe: 'STAMP_HYDRAULIC_400KN'
  },
  {
    id: 'st-welding',
    name: '03. Robotic Spot-Weld Array',
    type: 'ROBOTIC_WELD',
    x: 46,
    y: 60,
    status: 'NOMINAL',
    throughputPartsMin: 28,
    bufferLevel: 82,
    bufferCapacity: 100,
    cycleTimeMs: 2140,
    toleranceUm: 8.5,
    temperatureC: 184.5,
    vibrationMmS: 0.85,
    activeRecipe: 'WELD_PULSE_TIG_4AXIS'
  },
  {
    id: 'st-cnc',
    name: '04. Precision 5-Axis CNC',
    type: 'CNC_MILL',
    x: 66,
    y: 32,
    status: 'NOMINAL',
    throughputPartsMin: 26,
    bufferLevel: 45,
    bufferCapacity: 100,
    cycleTimeMs: 2300,
    toleranceUm: 2.1,
    temperatureC: 41.8,
    vibrationMmS: 0.44,
    activeRecipe: 'MILL_5AXIS_AEROSPACE_TOL'
  },
  {
    id: 'st-optical-qa',
    name: '05. Multi-Spectral Optical QA',
    type: 'OPTICAL_QA',
    x: 82,
    y: 62,
    status: 'NOMINAL',
    throughputPartsMin: 30,
    bufferLevel: 32,
    bufferCapacity: 100,
    cycleTimeMs: 1400,
    toleranceUm: 0.5,
    temperatureC: 22.0,
    vibrationMmS: 0.05,
    activeRecipe: 'VISION_DEFECT_DETECTION_3D'
  },
  {
    id: 'st-packaging',
    name: '06. JIT Packaging & Dispatch',
    type: 'JIT_PACKAGING',
    x: 94,
    y: 45,
    status: 'NOMINAL',
    throughputPartsMin: 30,
    bufferLevel: 20,
    bufferCapacity: 100,
    cycleTimeMs: 1200,
    toleranceUm: 100.0,
    temperatureC: 21.5,
    vibrationMmS: 0.12,
    activeRecipe: 'JIT_AUTO_PALLET_RFID'
  }
];

const INITIAL_EDGES: CPPSPipelineEdge[] = [
  { id: 'e1-2', from: 'st-ingestion', to: 'st-stamping', weight: 1.2, flowRatePartsMin: 30, status: 'OPTIMAL' },
  { id: 'e2-3', from: 'st-stamping', to: 'st-welding', weight: 1.8, flowRatePartsMin: 28, status: 'OPTIMAL' },
  { id: 'e3-4', from: 'st-welding', to: 'st-cnc', weight: 2.1, flowRatePartsMin: 26, status: 'OPTIMAL' },
  { id: 'e4-5', from: 'st-cnc', to: 'st-optical-qa', weight: 1.4, flowRatePartsMin: 26, status: 'OPTIMAL' },
  { id: 'e5-6', from: 'st-optical-qa', to: 'st-packaging', weight: 1.0, flowRatePartsMin: 26, status: 'OPTIMAL' }
];

const INITIAL_CONTRACTS: GideonTDDContract[] = [
  {
    id: 'gid-1',
    name: 'Sensor Dropout Resilience',
    targetStation: 'st-optical-qa',
    failureType: 'SENSOR_DROPOUT',
    precondition: 'Telemetry stream valid & Optical QA camera sync at 60 FPS',
    postcondition: 'Fallback to edge-state Kalman estimator with zero line stalls',
    safetyInvariant: 'Defect escape rate must remain <= 15 PPM',
    verdict: 'PASS_ROBUST',
    resilienceDelta: +0.03,
    lastSimulatedAt: '2026-08-16 17:42:10 UTC',
    details: 'Simulated 100% optical camera frame drop for 4000ms. Edge Kalman surrogate model seamlessly predicted dimensions within 0.8μm tolerance.'
  },
  {
    id: 'gid-2',
    name: 'Actuator Lag Compensation',
    targetStation: 'st-welding',
    failureType: 'ACTUATOR_LAG',
    precondition: 'Spot-Weld 4-Axis robotic servo response time <= 12ms',
    postcondition: 'Kinetic compiler automatically interleaves weld current ramp-down',
    safetyInvariant: 'Weld thermal envelope strictly <= 210°C',
    verdict: 'PASS_ROBUST',
    resilienceDelta: +0.02,
    lastSimulatedAt: '2026-08-16 17:44:02 UTC',
    details: 'Injected 380ms pneumatic valve lag. Kinetic hand compiler issued CAN bus micro-pause interrupt, preserving weld seam integrity.'
  },
  {
    id: 'gid-3',
    name: 'Material Starvation Buffer Failsafe',
    targetStation: 'st-ingestion',
    failureType: 'MATERIAL_STARVATION',
    precondition: 'Upstream supply hopper >= 20% billet capacity',
    postcondition: 'Autonomous SRE triggers JIT buffer re-routing without station deadlock',
    safetyInvariant: 'WIP queue strictly strictly bounded; no pipeline deadlock',
    verdict: 'PASS_ROBUST',
    resilienceDelta: +0.02,
    lastSimulatedAt: '2026-08-16 17:45:30 UTC',
    details: 'Starvation injected for 60s. Downstream CNC and Welding throttled smoothly without pneumatic emergency crash stops.'
  },
  {
    id: 'gid-4',
    name: 'EtherCAT Communication Partition',
    targetStation: 'st-cnc',
    failureType: 'COMMUNICATION_PARTITION',
    precondition: 'EtherCAT ring network topology closed and synchronized at 1kHz',
    postcondition: 'Isolate affected ring segment and execute local deterministic micro-code',
    safetyInvariant: 'Tool spindle brake engaged under 250ms on unrecoverable partition',
    verdict: 'PASS_ROBUST',
    resilienceDelta: +0.04,
    lastSimulatedAt: '2026-08-16 17:47:15 UTC',
    details: 'Partition injected between CNC and Optical QA. CNC executed autonomous safe-retract cycle.'
  },
  {
    id: 'gid-5',
    name: 'Quality Anomaly Auto-Rejection',
    targetStation: 'st-stamping',
    failureType: 'QUALITY_ANOMALY',
    precondition: 'Stamping die wear profile baseline <= 12μm burr height',
    postcondition: 'Automated optical sort gate diverts anomalous piece to re-melt bin',
    safetyInvariant: 'Zero defective parts reach downstream precision 5-axis CNC',
    verdict: 'PASS_ROBUST',
    resilienceDelta: +0.03,
    lastSimulatedAt: '2026-08-16 17:48:50 UTC',
    details: 'Injected 55μm burr defect. Optical QA diverter actuated in 42ms with proof logged to immutable ledger.'
  }
];

const INITIAL_INVARIANTS: SRESafetyInvariant[] = [
  {
    id: 'inv-1',
    name: 'No Deadlock Invariant',
    codeName: 'NO_DEADLOCK',
    status: 'VERIFIED',
    metric: 'Pipeline Cyclic Wait Graph',
    limitValue: '0 cycles',
    currentValue: '0 cycles (Acyclic Directed DAG)',
    enforceable: true
  },
  {
    id: 'inv-2',
    name: 'No WIP Overflow Invariant',
    codeName: 'NO_WIP_OVERFLOW',
    status: 'VERIFIED',
    metric: 'Buffer Occupancy %',
    limitValue: '< 95.0%',
    currentValue: '62.4% (Max at Welding: 82%)',
    enforceable: true
  },
  {
    id: 'inv-3',
    name: 'Safety Invariants Maintained',
    codeName: 'SAFETY_GUARDS_ACTIVE',
    status: 'VERIFIED',
    metric: 'Light Curtain & E-Stop Interlocks',
    limitValue: '100% armed',
    currentValue: '100% Armed & Verified',
    enforceable: true
  },
  {
    id: 'inv-4',
    name: 'Bounded Cyber-Physical Drift',
    codeName: 'BOUNDED_DRIFT',
    status: 'VERIFIED',
    metric: 'Physical vs Twin Parameter Delta',
    limitValue: '< 5.0%',
    currentValue: '0.84% RMS Drift',
    enforceable: true
  },
  {
    id: 'inv-5',
    name: 'Recovery Time Bound',
    codeName: 'RECOVERY_TIME_BOUND',
    status: 'VERIFIED',
    metric: 'Max Auto-Mitigation Latency',
    limitValue: '< 1,200 ms',
    currentValue: '342 ms mean recovery',
    enforceable: true
  },
  {
    id: 'inv-6',
    name: 'Rollback Readiness Guard',
    codeName: 'ROLLBACK_READINESS',
    status: 'VERIFIED',
    metric: 'Snapshot State Parity',
    limitValue: '100% Snapshot Parity',
    currentValue: 'Clean (Shadow MicroVM Ready)',
    enforceable: true
  }
];

export function IndustrialForgeStudio({ onNotify }: IndustrialForgeStudioProps) {
  const [activeLayer, setActiveLayer] = useState<ActiveStudioLayer>('VISUAL_TOPOLOGY');
  const [stations, setStations] = useState<CPPSStationNode[]>(INITIAL_STATIONS);
  const [edges, setEdges] = useState<CPPSPipelineEdge[]>(INITIAL_EDGES);
  const [selectedStationId, setSelectedStationId] = useState<string>('st-welding');
  const [contracts, setContracts] = useState<GideonTDDContract[]>(INITIAL_CONTRACTS);
  const [invariants, setInvariants] = useState<SRESafetyInvariant[]>(INITIAL_INVARIANTS);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<string>('');
  
  // KPI Metrics
  const [kpis, setKpis] = useState<IndustrialKPIMetrics>({
    oeePercent: 91.8,
    throughputPartsHr: 1540,
    defectRatePpm: 8,
    mtbfHours: 412,
    jitDriftMs: 3.4,
    resilienceScore: 0.96,
    aoiLatencyMs: 3.8,
    telemetryCompressionRatio: 88.6
  });

  // Kinetic Command Queue
  const [kineticQueue, setKineticQueue] = useState<KineticCommandItem[]>([
    {
      id: 'cmd-901',
      timestamp: '18:02:11.450',
      protocol: 'ETHERCAT',
      targetStation: 'st-welding',
      opcode: 'SERVO_INJECT_MICRO_STEP',
      hardwareInterruptVector: 'INT_VEC_0x4F',
      latencyMicroseconds: 240,
      status: 'EXECUTED_HARDWARE'
    },
    {
      id: 'cmd-902',
      timestamp: '18:02:11.780',
      protocol: 'CAN_BUS',
      targetStation: 'st-cnc',
      opcode: 'SPINDLE_RPM_PID_SYNC',
      hardwareInterruptVector: 'INT_VEC_0x3B',
      latencyMicroseconds: 310,
      status: 'EXECUTED_HARDWARE'
    },
    {
      id: 'cmd-903',
      timestamp: '18:02:12.105',
      protocol: 'PROFINET',
      targetStation: 'st-optical-qa',
      opcode: 'CAMERA_EXPOSURE_LATCH',
      hardwareInterruptVector: 'INT_VEC_0x82',
      latencyMicroseconds: 185,
      status: 'ACKNOWLEDGED'
    }
  ]);

  // DSL Station Code Editor State
  const [dslCode, setDslCode] = useState<string>(`// Sovereign Cyber-Physical Station DSL v1.0.0
// Target: STATION RoboticSpotWeld_Array_03

STATION RoboticSpotWeld_Array_03 {
  transport: ETHERCAT_RING_100MBPS;
  cycle_budget_ms: 2200;
  thermal_limit_celsius: 210.0;
  tolerance_envelope_um: 8.5;

  STAGE 01_Ingestion_Latch {
    require(JIT_BUFFER_LEVEL >= 10);
    actuate(PNEUMATIC_CLAMP, pressure_bar: 6.2);
  }

  STAGE 02_Kinetic_Spot_Weld {
    interrupt_vector: 0x4F;
    pulse_current_amps: 14500;
    dwell_time_ms: 380;
    sample_rate_khz: 10.0;
    
    on_fault(ACTUATOR_LAG) => {
      interleave_ramp_down();
      dispatch_sre_event("WELD_COMPENSATION_TRIGGERED");
    }
  }

  STAGE 03_Optical_Verification {
    assert(SEAM_CONTINUITY == 1.0);
    assert(THERMAL_DISSIPATION < 190.0);
    emit_telemetry(OPC_UA, topic: "factory/weld/telemetry");
  }
}`);

  const [compiledIR, setCompiledIR] = useState<string>(`[CYBER_PHYSICAL_IR_OUTPUT]
.target ARM64_MICRO_VM_HARDWARE_NATIVE
.section .kinetic_handlers
0x00004010: LDR X0, [PNEUMATIC_PRESSURE_REG]
0x00004014: CMP X0, #620000 // 6.2 bar
0x00004018: B.LT .FAULT_MATERIAL_STARVATION
0x0000401C: INJECT_ETHERCAT_FRAME 0x4F, #14500, #380
0x00004020: DWELL_HARDWARE_TIMER 380000_US
0x00004024: READ_PYROMETER_CALIBRATED X1
0x00004028: CMP X1, #210000
0x0000402C: B.GT .SRE_SAFETY_ROLLBACK_TRAP
.entropy_reduction: 86.4% (Raw AST 1,280 tokens -> 168 Byte Hardware Vector)`);

  const selectedStation = useMemo(() => {
    return stations.find(s => s.id === selectedStationId) || stations[0];
  }, [stations, selectedStationId]);

  // Live Telemetry tick simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setStations(prev => prev.map(station => {
        const tempJitter = (Math.random() - 0.5) * 0.4;
        const vibJitter = (Math.random() - 0.5) * 0.02;
        return {
          ...station,
          temperatureC: Math.max(20, +(station.temperatureC + tempJitter).toFixed(1)),
          vibrationMmS: Math.max(0.01, +(station.vibrationMmS + vibJitter).toFixed(2))
        };
      }));

      // Random synthetic kinetic packet
      if (Math.random() > 0.6) {
        const protocols: ('ETHERCAT' | 'CAN_BUS' | 'PROFINET' | 'OPC_UA')[] = ['ETHERCAT', 'CAN_BUS', 'PROFINET', 'OPC_UA'];
        const p = protocols[Math.floor(Math.random() * protocols.length)];
        const opcodes = ['SERVO_NATIVE_SETTER', 'OPTICAL_SYNC_LATCH', 'VALVE_PRESSURE_TOL', 'JIT_HOPPER_FEED'];
        const op = opcodes[Math.floor(Math.random() * opcodes.length)];
        const now = new Date();
        const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
        
        setKineticQueue(q => [
          {
            id: `cmd-${Date.now()}`,
            timestamp: timeStr,
            protocol: p,
            targetStation: 'st-welding',
            opcode: op,
            hardwareInterruptVector: `INT_0x${Math.floor(Math.random() * 255).toString(16).toUpperCase()}`,
            latencyMicroseconds: Math.floor(120 + Math.random() * 220),
            status: 'EXECUTED_HARDWARE'
          },
          ...q.slice(0, 14)
        ]);
      }
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  // Execute Gideon Edge-Case Simulation
  const injectGideonFailure = async (failureType: GideonFailureMode) => {
    if (isSimulating) return;
    setIsSimulating(true);

    const failureNames: Record<GideonFailureMode, string> = {
      SENSOR_DROPOUT: '⚡ Injecting Sensor Dropout (Optical QA Frame Starvation)...',
      ACTUATOR_LAG: '⏱️ Injecting Actuator Lag (+400ms Robotic Weld Servo Latency)...',
      MATERIAL_STARVATION: '📦 Injecting Material Starvation (Upstream JIT Hopper Empty)...',
      COMMUNICATION_PARTITION: '🌐 Injecting Communication Partition (EtherCAT Ring Segment Split)...',
      QUALITY_ANOMALY: '🔍 Injecting Quality Anomaly (+55μm Dimensional Burr Tolerance Drift)...'
    };

    setSimStep(failureNames[failureType]);
    if (onNotify) onNotify(`Gideon Protocol: ${failureNames[failureType]}`, 'warning');

    // Update target station to faulted
    let targetStationId = 'st-welding';
    if (failureType === 'SENSOR_DROPOUT') targetStationId = 'st-optical-qa';
    if (failureType === 'MATERIAL_STARVATION') targetStationId = 'st-ingestion';
    if (failureType === 'COMMUNICATION_PARTITION') targetStationId = 'st-cnc';
    if (failureType === 'QUALITY_ANOMALY') targetStationId = 'st-stamping';

    setStations(prev => prev.map(s => s.id === targetStationId ? { ...s, status: 'FAULT_INJECTED' } : s));

    await new Promise(r => setTimeout(r, 1200));
    setSimStep('🔬 Running Adversarial Skeptic Agent TDD Assertions...');

    await new Promise(r => setTimeout(r, 1400));
    setSimStep('🛡️ Autonomous SRE Closed-Loop Mitigation & Kalman Estimation Engaged...');

    await new Promise(r => setTimeout(r, 1200));

    // Restore station status & update contract
    setStations(prev => prev.map(s => s.id === targetStationId ? { ...s, status: 'NOMINAL' } : s));
    
    setContracts(prev => prev.map(c => {
      if (c.failureType === failureType) {
        return {
          ...c,
          verdict: 'PASS_ROBUST',
          lastSimulatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
        };
      }
      return c;
    }));

    setKpis(prev => ({
      ...prev,
      resilienceScore: Math.min(1.00, +(prev.resilienceScore + 0.01).toFixed(2)),
      mtbfHours: prev.mtbfHours + 4
    }));

    setIsSimulating(false);
    setSimStep('');
    if (onNotify) onNotify(`✅ Gideon Protocol Verified: ${failureType} safely mitigated with 0 unhandled halts!`, 'success');
  };

  // Trigger SRE Rollback Simulation
  const handleTriggerRollback = () => {
    if (onNotify) onNotify('🔄 Autonomous SRE: Executing deterministic snapshot rollback on shadow MicroVM...', 'warning');
    setTimeout(() => {
      if (onNotify) onNotify('🛡️ Rollback verified: Factory pipeline state restored to checkpoint in 142ms with 0 WIP loss.', 'success');
    }, 1200);
  };

  // Compile DSL Station logic
  const handleCompileDSL = () => {
    if (onNotify) onNotify('⚙️ Compiling Cyber-Physical Station DSL via GRILLE_GATE Entropy Gate...', 'success');
    setCompiledIR(`[CYBER_PHYSICAL_IR_OUTPUT - RE-COMPILED ${new Date().toLocaleTimeString()}]
.target ARM64_MICRO_VM_HARDWARE_NATIVE
.entropy_reduction: 88.2% (Raw AST 1,340 tokens -> 158 Byte Vector)
.invariants_verified: [NO_DEADLOCK, NO_WIP_OVERFLOW, BOUNDED_DRIFT]
0x00004010: SET_OPCODE_RING_LATCH 0x4F, #14500
0x00004014: HARDWARE_INTERRUPT_VECTOR_ARMED
0x00004018: JIT_VERIFIED_NOMINAL`);
  };

  return (
    <div className="space-y-6">
      {/* Sovereign Header Monograph Banner */}
      <section className="bg-gradient-to-r from-[#14141E] via-[#0E0E14] to-[#14141E] border border-[#D4AF37]/40 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#D4AF37]/20 border border-[#D4AF37]/60 text-[#D4AF37] text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-widest uppercase">
                νKG_CRYSTAL: TREATISE // SOVEREIGN_ARCHIVE
              </span>
              <span className="text-emerald-400 text-xs flex items-center gap-1 font-bold">
                <Activity size={13} className="animate-spin" /> CPPS MASTER CONTROL NEXUS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-wider text-white flex items-center gap-2">
              Industrial IDE Forge <span className="text-amber-400 font-light">| Cyber-Physical Production System</span>
            </h2>
            <p className="text-xs text-gray-300 max-w-3xl mt-1 leading-relaxed">
              Synthesizing the three-layer CPPS architecture (Visual, Code, Telemetry) with the Gideon Protocol epistemological verification, 
              hardware-native kinetic hand execution, and autonomous SRE safety governance.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto">
            <div className="bg-[#0B0B0F] border border-[#252535] p-2.5 rounded-xl text-center">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Resilience Score</div>
              <div className="text-lg font-black text-amber-300 font-mono">{(kpis.resilienceScore * 100).toFixed(0)}%</div>
              <div className="text-[9px] text-emerald-400">Gideon Certified</div>
            </div>
            <div className="bg-[#0B0B0F] border border-[#252535] p-2.5 rounded-xl text-center">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Factory OEE</div>
              <div className="text-lg font-black text-emerald-400 font-mono">{kpis.oeePercent}%</div>
              <div className="text-[9px] text-gray-400">{kpis.throughputPartsHr} parts/hr</div>
            </div>
            <div className="bg-[#0B0B0F] border border-[#252535] p-2.5 rounded-xl text-center">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Defect Escape</div>
              <div className="text-lg font-black text-blue-400 font-mono">{kpis.defectRatePpm} PPM</div>
              <div className="text-[9px] text-gray-400">6-Sigma Target</div>
            </div>
            <div className="bg-[#0B0B0F] border border-[#252535] p-2.5 rounded-xl text-center">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Age of Info (AoI)</div>
              <div className="text-lg font-black text-purple-400 font-mono">{kpis.aoiLatencyMs} ms</div>
              <div className="text-[9px] text-amber-300">{kpis.telemetryCompressionRatio}% Compr.</div>
            </div>
          </div>
        </div>

        {/* Global Action Trigger Bar */}
        <div className="mt-5 pt-4 border-t border-[#252535] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-bold">GIDEON FALSIFICATION SUITE:</span>
            <button
              onClick={() => injectGideonFailure('SENSOR_DROPOUT')}
              disabled={isSimulating}
              className="bg-[#1A1A26] hover:bg-[#252538] border border-[#3A3A52] text-amber-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition disabled:opacity-50"
            >
              <Zap size={12} className="text-amber-400" /> Sensor Dropout
            </button>
            <button
              onClick={() => injectGideonFailure('ACTUATOR_LAG')}
              disabled={isSimulating}
              className="bg-[#1A1A26] hover:bg-[#252538] border border-[#3A3A52] text-amber-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition disabled:opacity-50"
            >
              <Zap size={12} className="text-amber-400" /> Actuator Lag
            </button>
            <button
              onClick={() => injectGideonFailure('MATERIAL_STARVATION')}
              disabled={isSimulating}
              className="bg-[#1A1A26] hover:bg-[#252538] border border-[#3A3A52] text-amber-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition disabled:opacity-50"
            >
              <Zap size={12} className="text-amber-400" /> Starvation
            </button>
            <button
              onClick={() => injectGideonFailure('COMMUNICATION_PARTITION')}
              disabled={isSimulating}
              className="bg-[#1A1A26] hover:bg-[#252538] border border-[#3A3A52] text-amber-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition disabled:opacity-50"
            >
              <Zap size={12} className="text-amber-400" /> Partition
            </button>
            <button
              onClick={() => injectGideonFailure('QUALITY_ANOMALY')}
              disabled={isSimulating}
              className="bg-[#1A1A26] hover:bg-[#252538] border border-[#3A3A52] text-amber-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition disabled:opacity-50"
            >
              <Zap size={12} className="text-amber-400" /> Quality Anomaly
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerRollback}
              className="bg-red-950/60 hover:bg-red-900/80 border border-red-500/50 text-red-300 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition"
            >
              <RotateCcw size={12} /> Autonomous SRE Rollback
            </button>
          </div>
        </div>

        {isSimulating && (
          <div className="mt-3 bg-amber-950/40 border border-amber-500/50 text-amber-200 px-3 py-2 rounded-xl text-xs flex items-center gap-2 animate-pulse">
            <RefreshCw size={14} className="animate-spin text-amber-400" />
            <strong className="font-bold">GIDEON FALSIFIER ACTIVE:</strong> {simStep}
          </div>
        )}
      </section>

      {/* Layer Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#252535] pb-3">
        <button
          onClick={() => setActiveLayer('VISUAL_TOPOLOGY')}
          className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl font-black transition ${
            activeLayer === 'VISUAL_TOPOLOGY'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'bg-[#12121A] border border-[#252535] text-gray-300 hover:text-white'
          }`}
        >
          <Workflow size={14} /> Layer 1: Visual Topological Graph G=(V,E,W)
        </button>

        <button
          onClick={() => setActiveLayer('CODE_DSL')}
          className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl font-black transition ${
            activeLayer === 'CODE_DSL'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'bg-[#12121A] border border-[#252535] text-gray-300 hover:text-white'
          }`}
        >
          <Terminal size={14} /> Layer 2: Station DSL & GRILLE_GATE
        </button>

        <button
          onClick={() => setActiveLayer('TELEMETRY_IOT')}
          className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl font-black transition ${
            activeLayer === 'TELEMETRY_IOT'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'bg-[#12121A] border border-[#252535] text-gray-300 hover:text-white'
          }`}
        >
          <Radio size={14} /> Layer 3: Telemetry IoT Bus & Freshness
        </button>

        <button
          onClick={() => setActiveLayer('GIDEON_SIMULATION')}
          className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl font-black transition ${
            activeLayer === 'GIDEON_SIMULATION'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'bg-[#12121A] border border-[#252535] text-gray-300 hover:text-white'
          }`}
        >
          <Shield size={14} /> Gideon Falsification Matrix (5 Archetypes)
        </button>

        <button
          onClick={() => setActiveLayer('AUTONOMOUS_SRE')}
          className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl font-black transition ${
            activeLayer === 'AUTONOMOUS_SRE'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'bg-[#12121A] border border-[#252535] text-gray-300 hover:text-white'
          }`}
        >
          <Lock size={14} /> Autonomous SRE & Safety Invariants
        </button>
      </div>

      {/* LAYER 1: VISUAL TOPOLOGICAL GRAPH & KINETIC HAND */}
      {activeLayer === 'VISUAL_TOPOLOGY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 2-Column: Interactive Factory Graph SVG */}
          <div className="lg:col-span-2 bg-[#0C0C12] border border-[#252535] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Workflow size={16} className="text-[#D4AF37]" /> Topological Factory Map (Cognitive Routing Graph)
                </h3>
                <p className="text-[11px] text-gray-400">
                  Directed weighted graph <code className="text-amber-300">G = (V, E, W)</code> enabling O(k) multi-hop lookup and spatial routing.
                </p>
              </div>
              <span className="text-[11px] bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 px-2.5 py-1 rounded-full font-bold">
                6 Station Vertices Active
              </span>
            </div>

            {/* SVG Visual Stage */}
            <div className="relative w-full h-80 bg-[#08080E] border border-[#1E1E2C] rounded-xl overflow-hidden p-4 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Edges */}
                {edges.map((edge) => {
                  const source = stations.find(s => s.id === edge.from);
                  const target = stations.find(s => s.id === edge.to);
                  if (!source || !target) return null;

                  const x1 = source.x * 10;
                  const y1 = source.y * 4;
                  const x2 = target.x * 10;
                  const y2 = target.y * 4;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#2D2D40"
                        strokeWidth="5"
                        strokeDasharray="6,6"
                      />
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="url(#edgeGrad)"
                        strokeWidth="2.5"
                      />
                      {/* Traveling Particle */}
                      <circle r="4" fill="#F59E0B" filter="url(#glow)">
                        <animateMotion
                          path={`M ${x1} ${y1} L ${x2} ${y2}`}
                          dur={`${(edge.weight * 1.5).toFixed(1)}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}

                {/* Station Vertices */}
                {stations.map((st) => {
                  const cx = st.x * 10;
                  const cy = st.y * 4;
                  const isSelected = st.id === selectedStationId;
                  const isFaulted = st.status === 'FAULT_INJECTED';

                  let fillColor = '#14141F';
                  let strokeColor = '#3B3B54';
                  if (isSelected) {
                    fillColor = '#241E0F';
                    strokeColor = '#D4AF37';
                  }
                  if (isFaulted) {
                    fillColor = '#381212';
                    strokeColor = '#EF4444';
                  }

                  return (
                    <g 
                      key={st.id} 
                      onClick={() => setSelectedStationId(st.id)}
                      className="cursor-pointer transition-transform hover:scale-105"
                    >
                      <circle
                        cx={cx}
                        cy={cy}
                        r="32"
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isSelected ? '3.5' : '2'}
                        filter={isSelected ? 'url(#glow)' : undefined}
                      />
                      <text
                        x={cx}
                        y={cy - 5}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="12"
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        {st.id.replace('st-', '').toUpperCase()}
                      </text>
                      <text
                        x={cx}
                        y={cy + 12}
                        textAnchor="middle"
                        fill={isFaulted ? '#EF4444' : '#10B981'}
                        fontSize="9"
                        fontWeight="600"
                        className="pointer-events-none"
                      >
                        {st.status}
                      </text>
                      <text
                        x={cx}
                        y={cy + 46}
                        textAnchor="middle"
                        fill="#A1A1AA"
                        fontSize="10"
                        fontWeight="500"
                        className="pointer-events-none"
                      >
                        {st.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Spatial Routing Footnote */}
            <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-gray-400 bg-[#12121A] p-3 rounded-xl border border-[#252535]">
              <span className="flex items-center gap-1.5 text-amber-300">
                <FastForward size={14} /> Chain-of-Symbol Spatial Mapping: Multi-hop resolution O(k) across 32,000 token context boundary.
              </span>
              <span className="text-gray-400 font-mono">Critical Path Resistance: <strong>8.5 ms</strong></span>
            </div>
          </div>

          {/* 1-Column: Selected Station Vertex Inspector */}
          <div className="bg-[#0C0C12] border border-[#252535] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#252535] pb-3 mb-4">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">VERTEX INSPECTOR</div>
                  <h4 className="text-base font-black text-white">{selectedStation.name}</h4>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                  selectedStation.status === 'NOMINAL' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50' : 'bg-red-950 text-red-400 border border-red-500/50 animate-pulse'
                }`}>
                  {selectedStation.status}
                </span>
              </div>

              {/* Station Parameters */}
              <div className="space-y-3 text-xs">
                <div className="bg-[#14141E] p-3 rounded-xl border border-[#252535] flex justify-between items-center">
                  <span className="text-gray-400">Active Recipe:</span>
                  <span className="text-amber-300 font-mono font-bold">{selectedStation.activeRecipe}</span>
                </div>

                <div className="bg-[#14141E] p-3 rounded-xl border border-[#252535] flex justify-between items-center">
                  <span className="text-gray-400">Cycle Time:</span>
                  <span className="text-white font-mono font-bold">{selectedStation.cycleTimeMs} ms</span>
                </div>

                <div className="bg-[#14141E] p-3 rounded-xl border border-[#252535] flex justify-between items-center">
                  <span className="text-gray-400">Tolerance Envelope:</span>
                  <span className="text-emerald-400 font-mono font-bold">±{selectedStation.toleranceUm} μm</span>
                </div>

                <div className="bg-[#14141E] p-3 rounded-xl border border-[#252535] flex justify-between items-center">
                  <span className="text-gray-400">Temperature & Vibration:</span>
                  <span className="text-amber-400 font-mono font-bold">{selectedStation.temperatureC}°C | {selectedStation.vibrationMmS} mm/s</span>
                </div>

                <div className="bg-[#14141E] p-3 rounded-xl border border-[#252535]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400">Buffer Occupancy:</span>
                    <span className="text-white font-mono font-bold">{selectedStation.bufferLevel} / {selectedStation.bufferCapacity} ({((selectedStation.bufferLevel/selectedStation.bufferCapacity)*100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-[#20202E] h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${selectedStation.bufferLevel > 80 ? 'bg-amber-400' : 'bg-emerald-400'}`} 
                      style={{ width: `${(selectedStation.bufferLevel/selectedStation.bufferCapacity)*100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kinetic Dispatch Trigger */}
            <div className="mt-4 pt-4 border-t border-[#252535]">
              <button
                onClick={() => {
                  if (onNotify) onNotify(`⚡ Kinetic Hand: Dispatched synthetic CAN bus interrupt to ${selectedStation.name}`, 'success');
                }}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Zap size={14} className="text-black" /> Inject Hardware Interrupt (Vector 0x4F)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LAYER 2: CODE LAYER & STATION DSL COMPILER */}
      {activeLayer === 'CODE_DSL' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DSL Source Code Editor */}
          <div className="bg-[#0C0C12] border border-[#252535] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Terminal size={16} className="text-amber-400" /> Cyber-Physical Station DSL Source
                </h3>
                <span className="text-[10px] text-gray-400 bg-[#161622] px-2.5 py-1 rounded-md border border-[#2A2A3E]">
                  Anya Meta-Compiler Target: ARM64 MicroVM
                </span>
              </div>
              <textarea
                value={dslCode}
                onChange={(e) => setDslCode(e.target.value)}
                rows={16}
                className="w-full bg-[#08080D] border border-[#20202F] text-amber-200 font-mono text-xs p-3.5 rounded-xl focus:outline-none focus:border-[#D4AF37] leading-relaxed"
                spellCheck={false}
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-gray-400">Syntax: Sovereign CPPS DSL v1.0</span>
              <button
                onClick={handleCompileDSL}
                className="bg-gradient-to-r from-[#D4AF37] to-amber-300 hover:from-amber-300 hover:to-amber-200 text-black font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
              >
                <Play size={14} /> Re-Compile via GRILLE_GATE
              </button>
            </div>
          </div>

          {/* Compiled MicroVM Kinetic IR Output */}
          <div className="bg-[#0C0C12] border border-[#252535] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Cpu size={16} className="text-emerald-400" /> GRILLE_GATE Entropy & Kinetic IR Output
                </h3>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/50 font-bold">
                  -88.2% Entropy Purge
                </span>
              </div>
              <pre className="w-full h-80 bg-[#08080D] border border-[#20202F] text-emerald-300 font-mono text-xs p-3.5 rounded-xl overflow-y-auto leading-relaxed">
                {compiledIR}
              </pre>
            </div>
            <div className="mt-4 p-3 bg-[#12121A] rounded-xl border border-[#252535] text-xs text-gray-300 flex items-center justify-between">
              <span>Skeptic Adversarial TDD Suite:</span>
              <span className="text-emerald-400 font-bold">5 / 5 Contracts Validated</span>
            </div>
          </div>
        </div>
      )}

      {/* LAYER 3: TELEMETRY IOT EVENT BUS & FRESHNESS */}
      {activeLayer === 'TELEMETRY_IOT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Telemetry Stream */}
          <div className="lg:col-span-2 bg-[#0C0C12] border border-[#252535] rounded-2xl p-5 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Radio size={16} className="text-blue-400" /> IoT High-Speed Event Bus (OPC UA / EtherCAT / PROFINET)
              </h3>
              <span className="text-xs text-purple-400 font-mono font-bold bg-purple-950/60 px-3 py-1 rounded-full border border-purple-500/50">
                Freshness AoI: {kpis.aoiLatencyMs} ms
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-xs pr-1">
              {kineticQueue.map((item) => (
                <div key={item.id} className="bg-[#12121B] border border-[#20202F] p-3 rounded-xl flex items-center justify-between hover:border-[#D4AF37]/50 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">{item.timestamp}</span>
                    <span className="bg-[#1A1A28] text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold border border-[#2A2A3E]">
                      {item.protocol}
                    </span>
                    <span className="text-white font-bold">{item.opcode}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-[11px]">{item.hardwareInterruptVector}</span>
                    <span className="text-emerald-400 font-bold">{item.latencyMicroseconds} μs</span>
                    <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Semantic Compression & Telemetry Footprint */}
          <div className="bg-[#0C0C12] border border-[#252535] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
                <Gauge size={16} className="text-amber-400" /> Semantic State Compression
              </h4>

              <div className="space-y-4 text-xs">
                <div className="bg-[#14141E] p-3.5 rounded-xl border border-[#252535]">
                  <div className="text-gray-400 mb-1">Raw Telemetry Stream Ingress:</div>
                  <div className="text-lg font-mono font-black text-white">4.82 MB / sec</div>
                  <div className="text-[10px] text-gray-500">Unfiltered high-frequency sensor ticks</div>
                </div>

                <div className="bg-[#14141E] p-3.5 rounded-xl border border-[#252535]">
                  <div className="text-gray-400 mb-1">Compressed Semantic State:</div>
                  <div className="text-lg font-mono font-black text-emerald-400">0.55 MB / sec</div>
                  <div className="text-[10px] text-emerald-300/80">Fidelity focused on bottleneck vertices</div>
                </div>

                <div className="bg-[#14141E] p-3.5 rounded-xl border border-[#252535]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400">Bandwidth Reduction:</span>
                    <span className="text-amber-300 font-bold">{kpis.telemetryCompressionRatio}%</span>
                  </div>
                  <div className="w-full bg-[#20202E] h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400" style={{ width: `${kpis.telemetryCompressionRatio}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-[11px] text-gray-400 bg-[#12121A] p-3 rounded-xl border border-[#252535]">
              Freshness-Aware Policy: High-fidelity preservation around active bottlenecks, adaptive compression on quiescent stations.
            </div>
          </div>
        </div>
      )}

      {/* LAYER 4: GIDEON PROTOCOL FALSIFICATION MATRIX */}
      {activeLayer === 'GIDEON_SIMULATION' && (
        <div className="bg-[#0C0C12] border border-[#252535] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#252535] pb-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Shield size={16} className="text-[#D4AF37]" /> The Gideon Protocol Epistemological Falsification Matrix
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Karl Popper-inspired falsificationist test runner verifying resilience against 5 archetypal cyber-physical failure modes.
              </p>
            </div>
            <div className="text-xs bg-[#151522] border border-[#2C2C40] px-3 py-1.5 rounded-xl text-amber-300 font-bold">
              Resilience Score: {(kpis.resilienceScore * 100).toFixed(0)}% (Certified Robust)
            </div>
          </div>

          <div className="space-y-3">
            {contracts.map((contract) => (
              <div key={contract.id} className="bg-[#12121A] border border-[#20202E] rounded-xl p-4 hover:border-[#D4AF37]/40 transition space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-amber-950/80 text-amber-300 border border-amber-500/50 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      {contract.failureType}
                    </span>
                    <h4 className="text-sm font-bold text-white">{contract.name}</h4>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} /> {contract.verdict}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs pt-1">
                  <div className="bg-[#0B0B10] p-2.5 rounded-lg border border-[#1E1E2C]">
                    <div className="text-gray-400 text-[10px] font-bold uppercase">Precondition:</div>
                    <div className="text-gray-200 mt-0.5">{contract.precondition}</div>
                  </div>
                  <div className="bg-[#0B0B10] p-2.5 rounded-lg border border-[#1E1E2C]">
                    <div className="text-gray-400 text-[10px] font-bold uppercase">Postcondition:</div>
                    <div className="text-gray-200 mt-0.5">{contract.postcondition}</div>
                  </div>
                  <div className="bg-[#0B0B10] p-2.5 rounded-lg border border-[#1E1E2C]">
                    <div className="text-gray-400 text-[10px] font-bold uppercase">Safety Invariant:</div>
                    <div className="text-amber-300 mt-0.5">{contract.safetyInvariant}</div>
                  </div>
                </div>

                {contract.details && (
                  <div className="text-[11px] text-gray-400 pt-1 font-mono">
                    <strong className="text-gray-300">Proof Trace:</strong> {contract.details}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LAYER 5: AUTONOMOUS SRE & SAFETY INVARIANTS */}
      {activeLayer === 'AUTONOMOUS_SRE' && (
        <div className="space-y-6">
          <div className="bg-[#0C0C12] border border-[#252535] rounded-2xl p-5 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#252535] pb-4 mb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Lock size={16} className="text-emerald-400" /> SRE Safety Invariants & Closed-Loop Governance
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Hard operational constraints encoding ethical and physical manufacturing invariants.
                </p>
              </div>
              <button
                onClick={handleTriggerRollback}
                className="bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-300 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <RotateCcw size={13} /> Test Rollback Engine
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invariants.map((inv) => (
                <div key={inv.id} className="bg-[#12121A] border border-[#20202E] rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-xs font-black text-white">{inv.name}</h4>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono">{inv.metric}</div>
                  </div>

                  <div className="bg-[#0B0B10] p-2.5 rounded-lg border border-[#1C1C28] text-xs space-y-1">
                    <div className="flex justify-between text-gray-400 text-[10px]">
                      <span>Limit Constraint:</span>
                      <span className="text-gray-200">{inv.limitValue}</span>
                    </div>
                    <div className="flex justify-between text-amber-300 font-bold">
                      <span>Live Value:</span>
                      <span>{inv.currentValue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
