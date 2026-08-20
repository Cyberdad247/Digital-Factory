import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Activity,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Users,
  Compass,
  Layers,
  Download,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { CouncilMessage, ArchmagePersona, CouncilDebateMode } from '../types';

export interface ConsensusDataPoint {
  turn: number;
  timestamp: string;
  speaker: string;
  persona: ArchmagePersona;
  avatar: string;
  color: string;
  argumentType: string;
  consensusScore: number; // 0 - 100%
  velocity: number; // Delta % from previous turn
  acceleration: number; // Delta velocity from previous turn
  ambiguityScore: number; // 0 - 1
  z3Satisfied: boolean;
  phase: 'DIVERGENCE' | 'CRUCIBLE' | 'SYNTHESIS' | 'SATURATION';
  keyContribution: string;
  stanceBreakdown: Record<string, number>; // Persona -> stance (-1 to +1)
}

interface ConsensusVelocityChartProps {
  messages: CouncilMessage[];
  currentConsensus: number;
  ambiguityScore: number;
  z3Verified: boolean;
  debateMode: CouncilDebateMode;
  topic: string;
  className?: string;
  onSelectTurn?: (turnIndex: number) => void;
}

const ARCHMAGE_COLORS: Record<string, string> = {
  MERLIN_OMEGA: '#D4AF37',
  ANYA_OMEGA: '#EC4899',
  LADY_APIS: '#06B6D4',
  SIR_GIDEON: '#EF4444',
  FORMALIS_OMEGA: '#8B5CF6',
  SIR_CODEX: '#10B981',
  GEOMETRA_OMEGA: '#F59E0B',
  GRAPHAEL_OMEGA: '#3B82F6',
  SIR_CASTOR: '#6366F1',
  OPERATOR: '#38BDF8'
};

export function ConsensusVelocityChart({
  messages,
  currentConsensus,
  ambiguityScore,
  z3Verified,
  debateMode,
  topic,
  className = '',
  onSelectTurn
}: ConsensusVelocityChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Visualization View Modes
  const [viewMode, setViewMode] = useState<'COMPOSITE' | 'VELOCITY_STREAM' | 'PERSONA_STREAMS' | 'PHASE_PORTRAIT'>('COMPOSITE');
  const [showGrid, setShowGrid] = useState(true);
  const [showInvariants, setShowInvariants] = useState(true);
  const [activeTurnHover, setActiveTurnHover] = useState<ConsensusDataPoint | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Scrubber / Replay State
  const [playbackTurn, setPlaybackTurn] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Compute Turn-by-Turn Consensus Trajectory & Velocity
  const trajectoryData = useMemo<ConsensusDataPoint[]>(() => {
    if (!messages || messages.length === 0) {
      // Generate synthetic baseline initial trajectory if no messages exist yet
      return [
        {
          turn: 0,
          timestamp: new Date().toISOString(),
          speaker: 'System Protocol',
          persona: 'MERLIN_OMEGA',
          avatar: '🧙‍♂️',
          color: '#D4AF37',
          argumentType: 'INTAKE_INIT',
          consensusScore: 25,
          velocity: 0,
          acceleration: 0,
          ambiguityScore: 0.65,
          z3Satisfied: false,
          phase: 'DIVERGENCE',
          keyContribution: 'Awaiting Archmage debate inquest on project thesis',
          stanceBreakdown: { MERLIN_OMEGA: 0.2, SIR_GIDEON: -0.3, FORMALIS_OMEGA: 0.1 }
        }
      ];
    }

    let runningScore = 20; // Starting baseline consensus before deliberation
    let runningAmbiguity = 0.75;
    const points: ConsensusDataPoint[] = [];

    // Turn 0: Initialization
    points.push({
      turn: 0,
      timestamp: messages[0]?.timestamp || new Date().toISOString(),
      speaker: 'Sovereign Chassis Init',
      persona: 'MERLIN_OMEGA',
      avatar: '👑',
      color: '#D4AF37',
      argumentType: 'PROPOSAL',
      consensusScore: 20,
      velocity: 0,
      acceleration: 0,
      ambiguityScore: 0.75,
      z3Satisfied: false,
      phase: 'DIVERGENCE',
      keyContribution: `Initial thesis proposition: "${topic.slice(0, 45)}..."`,
      stanceBreakdown: { MERLIN_OMEGA: 0.5, LADY_APIS: -0.4, SIR_GIDEON: -0.5, FORMALIS_OMEGA: 0.0 }
    });

    messages.forEach((msg, idx) => {
      const turnNum = idx + 1;
      let delta = 0;
      let ambDelta = -0.05;

      // Weight impact based on argument type
      switch (msg.argumentType) {
        case 'PROPOSAL':
          delta = 6;
          ambDelta = -0.03;
          break;
        case 'SOCRATIC_CHALLENGE':
          delta = -4; // temporary divergence for rigorous testing
          ambDelta = 0.04;
          break;
        case 'Z3_ASSERTION':
          delta = 16; // major convergence jump on theorem validation
          ambDelta = -0.15;
          break;
        case 'FAILURE_WARNING':
          delta = -8; // SRE friction drops consensus until resolved
          ambDelta = 0.08;
          break;
        case 'SYNTHESIS':
          delta = 18; // rapid alignment
          ambDelta = -0.18;
          break;
        case 'CONSENSUS_VOTE':
          delta = 12;
          ambDelta = -0.10;
          break;
        default:
          delta = msg.role === 'operator' ? 10 : 8;
      }

      // If it's near the end of debate, guide towards currentConsensus
      const progress = turnNum / messages.length;
      const targetScore = 20 + progress * (currentConsensus - 20);
      runningScore = Math.min(100, Math.max(10, (runningScore + delta) * 0.65 + targetScore * 0.35));
      runningAmbiguity = Math.max(0.05, Math.min(0.9, runningAmbiguity + ambDelta));

      if (idx === messages.length - 1) {
        runningScore = currentConsensus;
        runningAmbiguity = ambiguityScore;
      }

      const prevScore = points[points.length - 1].consensusScore;
      const velocity = Number((runningScore - prevScore).toFixed(2));
      const prevVelocity = points[points.length - 1].velocity;
      const acceleration = Number((velocity - prevVelocity).toFixed(2));

      let phase: ConsensusDataPoint['phase'] = 'DIVERGENCE';
      if (runningScore >= 85) phase = 'SATURATION';
      else if (runningScore >= 60) phase = 'SYNTHESIS';
      else if (turnNum >= 2) phase = 'CRUCIBLE';

      // Stance estimate for personas
      const stanceBreakdown: Record<string, number> = {
        MERLIN_OMEGA: Math.min(1, runningScore / 90),
        LADY_APIS: Math.min(1, (runningScore - 15) / 80),
        SIR_GIDEON: msg.argumentType === 'FAILURE_WARNING' ? -0.4 : Math.min(1, (runningScore - 25) / 75),
        FORMALIS_OMEGA: msg.z3Constraint ? 0.95 : (z3Verified ? 0.9 : 0.3),
        ANYA_OMEGA: 0.85,
        SIR_CODEX: Math.min(1, runningScore / 85)
      };

      points.push({
        turn: turnNum,
        timestamp: msg.timestamp,
        speaker: msg.name,
        persona: msg.persona,
        avatar: msg.avatar,
        color: msg.color || ARCHMAGE_COLORS[msg.persona] || '#D4AF37',
        argumentType: msg.argumentType || 'PROPOSAL',
        consensusScore: Number(runningScore.toFixed(1)),
        velocity,
        acceleration,
        ambiguityScore: Number(runningAmbiguity.toFixed(2)),
        z3Satisfied: z3Verified || !!msg.z3Constraint,
        phase,
        keyContribution: msg.text.slice(0, 90) + (msg.text.length > 90 ? '...' : ''),
        stanceBreakdown
      });
    });

    return points;
  }, [messages, currentConsensus, ambiguityScore, z3Verified, topic]);

  // Derived Telemetry Metrics
  const activeData = playbackTurn !== null ? trajectoryData.slice(0, playbackTurn + 1) : trajectoryData;
  const currentPoint = activeData[activeData.length - 1] || trajectoryData[0];

  const peakVelocity = useMemo(() => {
    let maxV = 0;
    let turn = 0;
    trajectoryData.forEach(p => {
      if (p.velocity > maxV) {
        maxV = p.velocity;
        turn = p.turn;
      }
    });
    return { velocity: maxV, turn };
  }, [trajectoryData]);

  const avgVelocity = useMemo(() => {
    if (trajectoryData.length <= 1) return '0.0';
    const totalDelta = trajectoryData[trajectoryData.length - 1].consensusScore - trajectoryData[0].consensusScore;
    return (totalDelta / (trajectoryData.length - 1)).toFixed(1);
  }, [trajectoryData]);

  const timeToGateEta = useMemo(() => {
    const remaining = 90 - currentPoint.consensusScore;
    if (remaining <= 0) return 'LOCKED (Consensus ≥ 90%)';
    const rate = parseFloat(avgVelocity);
    if (rate <= 0) return 'Stalled in Adversarial Critique';
    const turnsNeeded = Math.ceil(remaining / rate);
    return `~${turnsNeeded} turns remaining at current velocity`;
  }, [currentPoint.consensusScore, avgVelocity]);

  // Playback timer loop
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackTurn(prev => {
          const next = (prev ?? 0) + 1;
          if (next >= trajectoryData.length) {
            setIsPlaying(false);
            return trajectoryData.length - 1;
          }
          return next;
        });
      }, 750);
    }
    return () => clearInterval(timer);
  }, [isPlaying, trajectoryData.length]);

  // Main D3 Rendering Engine
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 700;
    const height = isFullscreen ? 520 : 340;
    const margin = { top: 35, right: 45, bottom: 45, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'overflow-visible font-mono select-none');

    // Create SVG Definitions (Gradients, filters)
    const defs = svg.append('defs');

    // Consensus Area Gradient
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'consensus-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#D4AF37')
      .attr('stop-opacity', 0.35);

    areaGradient
      .append('stop')
      .attr('offset', '60%')
      .attr('stop-color', '#10B981')
      .attr('stop-opacity', 0.12);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#06B6D4')
      .attr('stop-opacity', 0.0);

    // Velocity Bar Positive Gradient
    const velocityGradPos = defs
      .append('linearGradient')
      .attr('id', 'velocity-bar-pos')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    velocityGradPos.append('stop').attr('offset', '0%').attr('stop-color', '#10B981').attr('stop-opacity', 0.8);
    velocityGradPos.append('stop').attr('offset', '100%').attr('stop-color', '#059669').attr('stop-opacity', 0.2);

    // Velocity Bar Negative Gradient
    const velocityGradNeg = defs
      .append('linearGradient')
      .attr('id', 'velocity-bar-neg')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    velocityGradNeg.append('stop').attr('offset', '0%').attr('stop-color', '#EF4444').attr('stop-opacity', 0.8);
    velocityGradNeg.append('stop').attr('offset', '100%').attr('stop-color', '#991B1B').attr('stop-opacity', 0.2);

    // Glow Filter
    const filter = defs.append('filter').attr('id', 'gold-glow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    filter.append('feMerge').selectAll('feMergeNode').data(['blur', 'SourceGraphic']).enter().append('feMergeNode').attr('in', d => d);

    // Main Chart Canvas Group
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: Turn indices (0 to max turns)
    const maxTurns = Math.max(5, trajectoryData.length - 1);
    const xScale = d3
      .scaleLinear()
      .domain([0, maxTurns])
      .range([0, innerWidth]);

    // Y Scale: Consensus Percentage (0% to 100%)
    const yScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Secondary Y Scale for Velocity (Delta % / turn)
    const maxAbsVelocity = Math.max(25, d3.max(trajectoryData, d => Math.abs(d.velocity)) || 25);
    const yVelScale = d3
      .scaleLinear()
      .domain([-maxAbsVelocity, maxAbsVelocity])
      .range([innerHeight, 0]);

    // Draw Phase Background Bands
    const phaseBands = [
      { name: 'Socratic Divergence', minC: 0, maxC: 45, color: 'rgba(6, 182, 212, 0.04)' },
      { name: 'Adversarial Crucible (Z3 / SRE)', minC: 45, maxC: 75, color: 'rgba(139, 92, 246, 0.05)' },
      { name: 'Synthesis Acceleration', minC: 75, maxC: 90, color: 'rgba(212, 175, 55, 0.06)' },
      { name: 'Consensus Saturation (≥90%)', minC: 90, maxC: 100, color: 'rgba(16, 185, 129, 0.08)' }
    ];

    phaseBands.forEach(band => {
      const bandTop = yScale(band.maxC);
      const bandBottom = yScale(band.minC);
      g.append('rect')
        .attr('x', 0)
        .attr('y', bandTop)
        .attr('width', innerWidth)
        .attr('height', bandBottom - bandTop)
        .attr('fill', band.color)
        .attr('class', 'transition-all');

      // Phase Watermark Label
      g.append('text')
        .attr('x', innerWidth - 8)
        .attr('y', bandTop + 14)
        .attr('text-anchor', 'end')
        .attr('fill', '#6B7280')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('opacity', 0.6)
        .text(band.name.toUpperCase());
    });

    // Draw Grid Lines
    if (showGrid) {
      // Horizontal grid
      [25, 50, 75, 90, 100].forEach(level => {
        g.append('line')
          .attr('x1', 0)
          .attr('x2', innerWidth)
          .attr('y1', yScale(level))
          .attr('y2', yScale(level))
          .attr('stroke', level === 90 ? '#D4AF37' : '#1F2937')
          .attr('stroke-dasharray', level === 90 ? '4 3' : '2 2')
          .attr('stroke-width', level === 90 ? 1.5 : 1)
          .attr('opacity', level === 90 ? 0.8 : 0.4);

        if (level === 90) {
          g.append('text')
            .attr('x', 6)
            .attr('y', yScale(level) - 4)
            .attr('fill', '#D4AF37')
            .attr('font-size', '9px')
            .attr('font-weight', 'bold')
            .text('⚡ 90% SOVEREIGN CONSENSUS GATE');
        }
      });

      // Vertical Turn grid
      for (let t = 0; t <= maxTurns; t++) {
        g.append('line')
          .attr('x1', xScale(t))
          .attr('x2', xScale(t))
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('stroke', '#1F2937')
          .attr('stroke-dasharray', '2 2')
          .attr('stroke-width', 0.75)
          .attr('opacity', 0.4);
      }
    }

    // Velocity Histogram Bars (Rendered if viewMode is COMPOSITE or VELOCITY_STREAM)
    if (viewMode === 'COMPOSITE' || viewMode === 'VELOCITY_STREAM') {
      const barWidth = Math.min(22, (innerWidth / (maxTurns + 1)) * 0.4);
      
      activeData.forEach(d => {
        if (d.turn === 0) return;
        const x = xScale(d.turn);
        const y0 = yScale(0); // baseline
        const barHeight = Math.abs(d.velocity) * (innerHeight / (maxAbsVelocity * 2.5));
        const isPos = d.velocity >= 0;
        const y = isPos ? innerHeight - barHeight : innerHeight;

        g.append('rect')
          .attr('x', x - barWidth / 2)
          .attr('y', y)
          .attr('width', barWidth)
          .attr('height', barHeight)
          .attr('fill', isPos ? 'url(#velocity-bar-pos)' : 'url(#velocity-bar-neg)')
          .attr('rx', 2)
          .attr('opacity', 0.75)
          .append('title')
          .text(`Turn ${d.turn}: Velocity ${d.velocity > 0 ? '+' : ''}${d.velocity}%`);
      });
    }

    // Persona Trajectory Streams (Rendered if viewMode is PERSONA_STREAMS)
    if (viewMode === 'PERSONA_STREAMS') {
      const personas = ['MERLIN_OMEGA', 'LADY_APIS', 'SIR_GIDEON', 'FORMALIS_OMEGA', 'ANYA_OMEGA'];
      personas.forEach(p => {
        const lineGen = d3
          .line<ConsensusDataPoint>()
          .x(d => xScale(d.turn))
          .y(d => {
            const stance = d.stanceBreakdown[p] ?? 0;
            // Map stance -1..1 to 10%..95%
            const val = ((stance + 1) / 2) * 85 + 10;
            return yScale(val);
          })
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(activeData)
          .attr('fill', 'none')
          .attr('stroke', ARCHMAGE_COLORS[p] || '#888')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', p === 'SIR_GIDEON' ? '4 2' : 'none')
          .attr('opacity', 0.7)
          .attr('d', lineGen);
      });
    }

    // Consensus Area Fill (COMPOSITE / VELOCITY_STREAM)
    if (viewMode === 'COMPOSITE' || viewMode === 'VELOCITY_STREAM') {
      const areaGen = d3
        .area<ConsensusDataPoint>()
        .x(d => xScale(d.turn))
        .y0(innerHeight)
        .y1(d => yScale(d.consensusScore))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(activeData)
        .attr('fill', 'url(#consensus-area-grad)')
        .attr('d', areaGen);

      // Consensus Spline Curve
      const lineGen = d3
        .line<ConsensusDataPoint>()
        .x(d => xScale(d.turn))
        .y(d => yScale(d.consensusScore))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(activeData)
        .attr('fill', 'none')
        .attr('stroke', '#D4AF37')
        .attr('stroke-width', 3)
        .attr('filter', 'url(#gold-glow)')
        .attr('d', lineGen);

      g.append('path')
        .datum(activeData)
        .attr('fill', 'none')
        .attr('stroke', '#FFF8DC')
        .attr('stroke-width', 1.5)
        .attr('d', lineGen);
    }

    // Phase Portrait View (Phase Space: Consensus vs Velocity)
    if (viewMode === 'PHASE_PORTRAIT') {
      const xPhase = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);
      const yPhase = d3.scaleLinear().domain([-maxAbsVelocity, maxAbsVelocity]).range([innerHeight, 0]);

      // Phase Axis Center Line
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yPhase(0))
        .attr('y2', yPhase(0))
        .attr('stroke', '#374151')
        .attr('stroke-dasharray', '3 3');

      // Trajectory in Phase Space
      const phaseLine = d3
        .line<ConsensusDataPoint>()
        .x(d => xPhase(d.consensusScore))
        .y(d => yPhase(d.velocity))
        .curve(d3.curveCatmullRom);

      g.append('path')
        .datum(activeData)
        .attr('fill', 'none')
        .attr('stroke', '#38BDF8')
        .attr('stroke-width', 2.5)
        .attr('filter', 'url(#gold-glow)')
        .attr('d', phaseLine);

      // Attractor Goal Target (100%, 0 velocity)
      g.append('circle')
        .attr('cx', xPhase(100))
        .attr('cy', yPhase(0))
        .attr('r', 8)
        .attr('fill', '#10B981')
        .attr('stroke', '#FFF')
        .attr('stroke-width', 2);

      g.append('text')
        .attr('x', xPhase(100) - 12)
        .attr('y', yPhase(0) - 12)
        .attr('fill', '#10B981')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'end')
        .text('TARGET ATTRACTOR (100% SAT)');
    }

    // Turn Markers / Archmage Nodes (Interactive Data Points)
    activeData.forEach((d, idx) => {
      const cx = xScale(d.turn);
      const cy = yScale(d.consensusScore);

      const nodeGroup = g
        .append('g')
        .attr('class', 'cursor-pointer group-node transition-transform')
        .attr('transform', `translate(${cx}, ${cy})`);

      // Outer Halo
      nodeGroup
        .append('circle')
        .attr('r', d.turn === currentPoint.turn ? 12 : 7)
        .attr('fill', d.color)
        .attr('fill-opacity', d.turn === currentPoint.turn ? 0.35 : 0.2)
        .attr('stroke', d.color)
        .attr('stroke-width', d.turn === currentPoint.turn ? 2 : 1.2);

      // Inner Core Circle
      nodeGroup
        .append('circle')
        .attr('r', d.turn === currentPoint.turn ? 6 : 4)
        .attr('fill', d.z3Satisfied ? '#10B981' : d.color)
        .attr('stroke', '#0E0E18')
        .attr('stroke-width', 1.5);

      // Turn Label
      nodeGroup
        .append('text')
        .attr('y', -14)
        .attr('text-anchor', 'middle')
        .attr('fill', '#E5E7EB')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .text(`T${d.turn}`);

      // Interactive hover & click behaviors
      nodeGroup
        .on('mouseenter', (event) => {
          setActiveTurnHover(d);
          d3.select(event.currentTarget).select('circle').transition().duration(150).attr('r', 14);
        })
        .on('mouseleave', (event) => {
          setActiveTurnHover(null);
          d3.select(event.currentTarget).select('circle').transition().duration(150).attr('r', d.turn === currentPoint.turn ? 12 : 7);
        })
        .on('click', () => {
          if (onSelectTurn) onSelectTurn(d.turn);
        });
    });

    // Invariant / Z3 Milestone Callouts (if enabled)
    if (showInvariants) {
      activeData.forEach(d => {
        if (d.argumentType === 'Z3_ASSERTION' || d.z3Satisfied && d.velocity > 12) {
          const cx = xScale(d.turn);
          const cy = yScale(d.consensusScore);

          g.append('line')
            .attr('x1', cx)
            .attr('x2', cx)
            .attr('y1', cy)
            .attr('y2', cy - 28)
            .attr('stroke', '#8B5CF6')
            .attr('stroke-width', 1.2)
            .attr('stroke-dasharray', '2 1');

          g.append('rect')
            .attr('x', cx - 35)
            .attr('y', cy - 42)
            .attr('width', 70)
            .attr('height', 14)
            .attr('rx', 3)
            .attr('fill', '#1E1B4B')
            .attr('stroke', '#8B5CF6')
            .attr('stroke-width', 0.8);

          g.append('text')
            .attr('x', cx)
            .attr('y', cy - 32)
            .attr('text-anchor', 'middle')
            .attr('fill', '#C4B5FD')
            .attr('font-size', '8px')
            .attr('font-weight', 'bold')
            .text('Z3 SMT PROOF');
        }
      });
    }

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(maxTurns, 10))
      .tickFormat(t => `Turn ${t}`);

    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .attr('class', 'text-gray-400')
      .call(xAxis);

    xAxisGroup.select('.domain').attr('stroke', '#374151');
    xAxisGroup.selectAll('.tick line').attr('stroke', '#374151');
    xAxisGroup.selectAll('.tick text').attr('fill', '#9CA3AF').attr('font-size', '10px');

    // Y Axis (Consensus %)
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat(v => `${v}%`);

    const yAxisGroup = g
      .append('g')
      .attr('class', 'text-gray-400')
      .call(yAxis);

    yAxisGroup.select('.domain').attr('stroke', '#374151');
    yAxisGroup.selectAll('.tick line').attr('stroke', '#374151');
    yAxisGroup.selectAll('.tick text').attr('fill', '#9CA3AF').attr('font-size', '10px');

    // Y Axis Label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -38)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#D4AF37')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text('CONSENSUS PERCENTAGE (%)');

    // Secondary Y Axis for Velocity (Right)
    if (viewMode === 'COMPOSITE' || viewMode === 'VELOCITY_STREAM') {
      const yAxisRight = d3
        .axisRight(yVelScale)
        .ticks(4)
        .tickFormat(v => `${Number(v) > 0 ? '+' : ''}${v}%`);

      const yRightGroup = g
        .append('g')
        .attr('transform', `translate(${innerWidth}, 0)`)
        .attr('class', 'text-gray-500')
        .call(yAxisRight);

      yRightGroup.select('.domain').attr('stroke', '#222');
      yRightGroup.selectAll('.tick line').attr('stroke', '#222');
      yRightGroup.selectAll('.tick text').attr('fill', '#6B7280').attr('font-size', '9px');

      g.append('text')
        .attr('transform', 'rotate(90)')
        .attr('y', -innerWidth - 36)
        .attr('x', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#10B981')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .text('VELOCITY (Δ%/TURN)');
    }
  }, [
    trajectoryData,
    activeData,
    currentPoint,
    viewMode,
    showGrid,
    showInvariants,
    isFullscreen
  ]);

  // Export SVG Snapshot
  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `council_consensus_velocity_${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={containerRef}
      className={`bg-[#0A0A12] border border-[#D4AF37]/30 rounded-xl p-4 font-mono space-y-3.5 shadow-2xl relative transition-all ${className} ${
        isFullscreen ? 'fixed inset-4 z-50 overflow-y-auto max-h-[95vh] bg-[#0A0A12]/98 backdrop-blur-xl border-[#D4AF37]' : ''
      }`}
    >
      {/* Top Header & Mode Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#D4AF37]/15 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37]">
            <TrendingUp size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Consensus Velocity Engine (D3.js)
              </h4>
              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded font-bold">
                REAL-TIME SMT DYNAMICS
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Multi-Agent convergence rate, turn-by-turn velocity acceleration, and Z3 SAT trajectory
            </p>
          </div>
        </div>

        {/* View Mode Controls */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'COMPOSITE' as const, label: 'Composite Curve', icon: Activity },
            { id: 'VELOCITY_STREAM' as const, label: 'Velocity Vector', icon: Zap },
            { id: 'PERSONA_STREAMS' as const, label: 'Persona Matrix', icon: Users },
            { id: 'PHASE_PORTRAIT' as const, label: 'Phase Attractor', icon: Compass }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
                  viewMode === tab.id
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50 shadow-sm'
                    : 'bg-[#12121E] text-gray-400 hover:text-gray-200 border border-gray-800'
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="h-4 w-px bg-gray-800 mx-1 hidden sm:block" />

          {/* Fullscreen & Export Buttons */}
          <button
            onClick={handleExportSVG}
            className="p-1.5 bg-[#12121E] hover:bg-[#1E1E2E] text-gray-400 hover:text-white rounded border border-gray-800 transition-colors"
            title="Export D3 Vector Chart as SVG"
          >
            <Download size={13} />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-[#12121E] hover:bg-[#1E1E2E] text-gray-400 hover:text-white rounded border border-gray-800 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen View'}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Real-Time Telemetry HUD Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* Instantaneous Consensus */}
        <div className="bg-[#0D0D18] p-2.5 rounded-lg border border-gray-800 space-y-1">
          <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center justify-between">
            <span>Instant Consensus</span>
            <span className="text-[#D4AF37]">T{currentPoint.turn}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">{currentPoint.consensusScore}%</span>
            <span className={`text-[10px] font-bold ${currentPoint.consensusScore >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {currentPoint.consensusScore >= 90 ? 'GATE ACHIEVED' : 'CONVERGING'}
            </span>
          </div>
        </div>

        {/* Current Velocity */}
        <div className="bg-[#0D0D18] p-2.5 rounded-lg border border-gray-800 space-y-1">
          <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center justify-between">
            <span>Velocity (Δ/Turn)</span>
            <Zap size={11} className="text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-lg font-bold ${currentPoint.velocity >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {currentPoint.velocity > 0 ? '+' : ''}{currentPoint.velocity}%
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              Acc: {currentPoint.acceleration > 0 ? '+' : ''}{currentPoint.acceleration}%
            </span>
          </div>
        </div>

        {/* Peak Breakthrough */}
        <div className="bg-[#0D0D18] p-2.5 rounded-lg border border-gray-800 space-y-1">
          <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center justify-between">
            <span>Peak Velocity</span>
            <Sparkles size={11} className="text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-amber-300">+{peakVelocity.velocity}%</span>
            <span className="text-[10px] text-gray-400 font-mono">Turn {peakVelocity.turn}</span>
          </div>
        </div>

        {/* Convergence ETA */}
        <div className="bg-[#0D0D18] p-2.5 rounded-lg border border-gray-800 space-y-1">
          <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center justify-between">
            <span>Avg Convergence</span>
            <ShieldCheck size={11} className="text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-cyan-300">+{avgVelocity}%/turn</span>
            <span className="text-[9px] text-gray-500 truncate" title={timeToGateEta}>
              {currentPoint.consensusScore >= 90 ? 'SAT' : 'To Gate: ~' + timeToGateEta.slice(0, 10)}
            </span>
          </div>
        </div>
      </div>

      {/* Main D3 SVG Canvas Container */}
      <div className="relative bg-[#06060C] border border-gray-800/80 rounded-xl p-2 overflow-hidden">
        <svg ref={svgRef} className="w-full h-auto min-h-[300px]" />

        {/* Hover / Active Turn Tooltip Overlay */}
        {activeTurnHover && (
          <div
            ref={tooltipRef}
            className="absolute top-4 right-4 bg-[#11111E]/95 border border-[#D4AF37]/60 rounded-xl p-3 shadow-2xl max-w-xs space-y-2 pointer-events-none text-xs backdrop-blur-md transition-all animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{activeTurnHover.avatar}</span>
                <span className="font-bold text-white" style={{ color: activeTurnHover.color }}>
                  {activeTurnHover.speaker}
                </span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded font-bold">
                Turn {activeTurnHover.turn}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-gray-500">Consensus:</span>{' '}
                <span className="font-bold text-white">{activeTurnHover.consensusScore}%</span>
              </div>
              <div>
                <span className="text-gray-500">Velocity:</span>{' '}
                <span className={`font-bold ${activeTurnHover.velocity >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {activeTurnHover.velocity > 0 ? '+' : ''}{activeTurnHover.velocity}%/turn
                </span>
              </div>
              <div>
                <span className="text-gray-500">Argument:</span>{' '}
                <span className="font-bold text-purple-300">{activeTurnHover.argumentType}</span>
              </div>
              <div>
                <span className="text-gray-500">Phase:</span>{' '}
                <span className="font-bold text-cyan-300">{activeTurnHover.phase}</span>
              </div>
            </div>

            <p className="text-[10px] text-gray-300 italic border-t border-gray-800/80 pt-1.5 leading-snug">
              "{activeTurnHover.keyContribution}"
            </p>
          </div>
        )}
      </div>

      {/* Bottom Timeline Scrubber & Deliberation Playback Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0B14] p-2.5 rounded-lg border border-gray-800/80 text-xs">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={trajectoryData.length <= 1}
            className="p-1.5 bg-[#D4AF37] hover:bg-[#C29B27] disabled:opacity-40 text-black font-bold rounded-lg flex items-center gap-1 transition-all shadow-sm"
            title={isPlaying ? 'Pause Replay' : 'Play Turn-by-Turn Convergence'}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span className="text-[11px]">{isPlaying ? 'Pause' : 'Replay'}</span>
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setPlaybackTurn(null);
            }}
            className="p-1.5 bg-[#141424] hover:bg-[#1C1C30] text-gray-400 hover:text-white rounded-lg border border-gray-800 transition-colors"
            title="Reset to live turn state"
          >
            <RotateCcw size={12} />
          </button>

          <span className="text-[11px] text-gray-400 font-mono ml-1">
            Turn {currentPoint.turn} of {trajectoryData.length - 1}
          </span>
        </div>

        {/* Turn Step Scrubber Range */}
        <div className="flex-1 max-w-xs flex items-center gap-2">
          <span className="text-[10px] text-gray-500">T0</span>
          <input
            type="range"
            min={0}
            max={trajectoryData.length - 1}
            value={playbackTurn ?? trajectoryData.length - 1}
            onChange={e => {
              setIsPlaying(false);
              setPlaybackTurn(parseInt(e.target.value));
            }}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
          />
          <span className="text-[10px] text-gray-500">T{trajectoryData.length - 1}</span>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-2 text-[11px]">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-0.5 rounded transition-colors ${
              showGrid ? 'bg-gray-800 text-gray-300' : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            Grid: {showGrid ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setShowInvariants(!showInvariants)}
            className={`px-2 py-0.5 rounded transition-colors ${
              showInvariants ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30' : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            Z3 Pins: {showInvariants ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
}
