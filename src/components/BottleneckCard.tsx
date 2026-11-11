import React, { useEffect, useRef, useState } from 'react';
import { 
  Gauge, 
  Info, 
  Zap, 
  Tv, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Droplets,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BottleneckEvaluation, Resolution } from '../types/hardware';

interface BottleneckCardProps {
  evaluation?: BottleneckEvaluation;
  resolution: Resolution;
  setResolution: (res: Resolution) => void;
  hasCpuAndGpu: boolean;
}

export const BottleneckCard: React.FC<BottleneckCardProps> = ({
  evaluation,
  resolution,
  setResolution,
  hasCpuAndGpu
}) => {
  const [showDidacticGuide, setShowDidacticGuide] = useState(false);
  const [displayPercent, setDisplayPercent] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  const physicsRef = useRef<{ current: number; velocity: number; target: number }>({
    current: 0,
    velocity: 0,
    target: 0
  });

  const targetPercentage = evaluation?.percentage ?? 0;

  // Spring physics animation loop for liquid charging and needle dampening
  useEffect(() => {
    physicsRef.current.target = targetPercentage;

    let lastTime = performance.now();

    const animatePhysics = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05); // Cap dt to avoid teleporting
      lastTime = time;

      const p = physicsRef.current;
      // Spring force toward target with damping (fluid wave physics)
      const springStiffness = 35; // Responsive spring
      const damping = 7.5; // Viscous fluid resistance

      const displacement = p.current - p.target;
      const springForce = -springStiffness * displacement;
      const dampingForce = -damping * p.velocity;
      const acceleration = springForce + dampingForce;

      p.velocity += acceleration * dt;
      p.current += p.velocity * dt;

      // When settled close enough, clamp and stop loop
      if (Math.abs(p.current - p.target) < 0.05 && Math.abs(p.velocity) < 0.05) {
        p.current = p.target;
        p.velocity = 0;
        setDisplayPercent(Math.round(p.current));
      } else {
        setDisplayPercent(Math.round(Math.max(0, Math.min(100, p.current))));
        animFrameRef.current = requestAnimationFrame(animatePhysics);
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animatePhysics);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [targetPercentage]);

  if (!hasCpuAndGpu || !evaluation) {
    return (
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 flex flex-col justify-center items-center text-center text-slate-400 py-10 shadow-xl">
        <Gauge className="w-12 h-12 mb-3 stroke-1 text-cyan-400/60 animate-pulse" />
        <p className="text-sm font-semibold text-slate-200">Calculador de Cuello de Botella</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Selecciona un Procesador (CPU) y una Tarjeta Gráfica (GPU) para activar el medidor líquido en tiempo real.
        </p>
      </div>
    );
  }

  const { limitingComponent, explanation, severity } = evaluation;

  // Clamped values for SVG rendering
  const clampedDisplay = Math.min(Math.max(displayPercent, 0), 100);
  // Needle angle (-90 deg at 0% to +90 deg at 100%)
  const needleAngle = -90 + (clampedDisplay / 100) * 180;

  // Hydrodynamic glass conduit arc geometry (R = 78)
  const arcRadius = 78;
  const arcLength = Math.PI * arcRadius; // ≈ 245.044
  const liquidOffset = arcLength - (clampedDisplay / 100) * arcLength;

  // Coordinates of the meniscus head along the fluid column
  const meniscusX = 100 - arcRadius * Math.cos((clampedDisplay / 100) * Math.PI);
  const meniscusY = 102 - arcRadius * Math.sin((clampedDisplay / 100) * Math.PI);

  // Status visual cues
  const statusConfig = {
    optimal: {
      bgBadge: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
      label: 'Ensamble Óptimo',
      icon: CheckCircle2,
      color: '#10b981',
      glow: 'shadow-emerald-500/30'
    },
    moderate: {
      bgBadge: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
      label: 'Desequilibrio Leve',
      icon: AlertTriangle,
      color: '#f59e0b',
      glow: 'shadow-amber-500/30'
    },
    high: {
      bgBadge: 'bg-rose-950/80 border-rose-500/50 text-rose-300',
      label: 'Cuello de Botella Notorio',
      icon: XCircle,
      color: '#f43f5e',
      glow: 'shadow-rose-500/30'
    }
  };

  const currentStatus = statusConfig[severity];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="bg-slate-900/95 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title and Resolution Tabs */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              <span>Cuello de Botella</span>
              <Droplets className="w-3 h-3 text-cyan-400 animate-pulse" />
            </h3>
            <span className="text-[10px] text-slate-400">Medidor Líquido Reactivo</span>
          </div>
        </div>

        {/* Resolution selector */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          {(['1080p', '1440p', '4k'] as Resolution[]).map((res) => (
            <button
              key={res}
              onClick={() => setResolution(res)}
              className={`px-2 py-0.5 rounded font-bold uppercase transition-all ${
                resolution === res
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* HYDRODYNAMIC PRECISION FLUID GAUGE */}
      <div className="flex flex-col items-center justify-center py-1">
        <div className="relative w-56 h-32 flex items-center justify-center">
          <svg className="w-56 h-32 overflow-visible" viewBox="0 0 200 120">
            <defs>
              {/* Dynamic Gradient for the Charging Liquid */}
              <linearGradient id="liquidFluidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="30%" stopColor="#06b6d4" />
                <stop offset="60%" stopColor="#f59e0b" />
                <stop offset="85%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>

              {/* Liquid Shimmer Glow Filter */}
              <filter id="liquidGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Recessed Dark Glass Tube Channel (Capillary Chamber) */}
            <path
              d="M 22 102 A 78 78 0 0 1 178 102"
              fill="none"
              stroke="#050a14"
              strokeWidth="11"
              strokeLinecap="round"
            />
            {/* Precision Capillary Glass Guide Stroke */}
            <path
              d="M 22 102 A 78 78 0 0 1 178 102"
              fill="none"
              stroke="#1e293b"
              strokeWidth="11"
              strokeLinecap="round"
              opacity="0.45"
            />
            <path
              d="M 22 102 A 78 78 0 0 1 178 102"
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray="2 4"
              opacity="0.4"
            />

            {/* UNIFORM HYDRODYNAMIC FLUID CORE (Fits cleanly inside the 11px chamber) */}
            <path
              d="M 22 102 A 78 78 0 0 1 178 102"
              fill="none"
              stroke="url(#liquidFluidGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={arcLength}
              strokeDashoffset={liquidOffset}
              filter="url(#liquidGlow)"
              className="transition-[stroke-dashoffset] duration-75 ease-out"
            />

            {/* Inner Fluid Specular Reflection (Glass conduit light refraction) */}
            {clampedDisplay > 1 && (
              <path
                d="M 22 102 A 78 78 0 0 1 178 102"
                fill="none"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={liquidOffset}
                className="transition-[stroke-dashoffset] duration-75 ease-out"
              />
            )}

            {/* Glowing Hydrodynamic Meniscus Node & Surface Tension Ripple */}
            {clampedDisplay > 1 && (
              <g className="transition-all duration-75 ease-out">
                {/* Surface tension meniscus pulse */}
                <circle
                  cx={meniscusX}
                  cy={meniscusY}
                  r="5.5"
                  fill="none"
                  stroke={currentStatus.color}
                  strokeWidth="1.2"
                  className="animate-ping origin-center"
                  opacity="0.5"
                />
                {/* Meniscus Core Bead */}
                <circle
                  cx={meniscusX}
                  cy={meniscusY}
                  r="3.5"
                  fill="#ffffff"
                  filter="url(#liquidGlow)"
                />
              </g>
            )}

            {/* Calibrated Bezel Tick Markers */}
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick) => {
              const angle = -Math.PI + (tick / 100) * Math.PI;
              const isMajor = tick % 25 === 0;
              const r1 = 87;
              const r2 = isMajor ? 94 : 90;
              const x1 = 100 + r1 * Math.cos(angle);
              const y1 = 102 + r1 * Math.sin(angle);
              const x2 = 100 + r2 * Math.cos(angle);
              const y2 = 102 + r2 * Math.sin(angle);
              const isActive = tick <= clampedDisplay;

              return (
                <line
                  key={tick}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isActive ? '#38bdf8' : '#334155'}
                  strokeWidth={isMajor ? '2' : '1'}
                  strokeLinecap="round"
                  opacity={isActive ? 1 : 0.6}
                />
              );
            })}

            {/* PRECISION VERNIER CALIPER BEZEL MARKER (Outside the text area) */}
            <g
              transform={`translate(100, 102) rotate(${needleAngle})`}
              className="transition-transform duration-75 ease-out"
            >
              {/* Outer Bezel Pointer Notch pointing directly to fluid meniscus */}
              <polygon
                points="-3,-94 0,-86 3,-94"
                fill={currentStatus.color}
                filter="drop-shadow(0px 0px 3px rgba(0, 240, 255, 0.8))"
              />
              <circle cx="0" cy="-95" r="1.5" fill="#ffffff" />
            </g>
          </svg>

          {/* Central Digital Display (Smoothly animated percentage counter, totally free of overlapping lines) */}
          <div className="absolute bottom-1 flex flex-col items-center select-none pointer-events-none">
            <div className="flex items-baseline">
              <span className="text-3xl font-black text-white font-mono tracking-tight leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {displayPercent}
              </span>
              <span className="text-sm font-bold text-cyan-400 font-mono ml-0.5">%</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1 flex items-center gap-1">
              <Droplets className="w-2.5 h-2.5 text-cyan-400" />
              Desequilibrio
            </span>
          </div>
        </div>

        {/* Status Badges with Clean Non-overlapping layout */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${currentStatus.bgBadge}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{currentStatus.label}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
            {limitingComponent === 'CPU' ? (
              <>
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>Limitado por: <b className="text-cyan-300">CPU</b></span>
              </>
            ) : limitingComponent === 'GPU' ? (
              <>
                <Tv className="w-3 h-3 text-cyan-400" />
                <span>Limitado por: <b className="text-cyan-300">GPU</b></span>
              </>
            ) : (
              <>
                <Scale className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Balance Óptimo</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Didactic explanation card */}
      <div className="mt-3 flex items-start gap-2 text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed text-slate-300">{explanation}</p>
      </div>

      {/* Interactive Didactic Guide: ¿Por qué cambia según la resolución? */}
      <div className="mt-2.5">
        <button
          onClick={() => setShowDidacticGuide(!showDidacticGuide)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-800/30 text-[11px] text-cyan-300 transition font-medium"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>¿Por qué cambia el cuello de botella según la resolución?</span>
          </span>
          {showDidacticGuide ? (
            <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
          )}
        </button>

        {showDidacticGuide && (
          <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-start gap-2 pb-2 border-b border-slate-900">
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold font-mono text-[10px]">
                1080p
              </span>
              <p className="text-slate-300 leading-tight">
                <strong className="text-white">CPU Dependiente:</strong> Hay pocos píxeles (~2M), por lo que la GPU genera cientos de FPS muy rápido y la CPU debe preparar todos esos cuadros sin descanso, llegando a saturarse.
              </p>
            </div>

            <div className="flex items-start gap-2 pb-2 border-b border-slate-900">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[10px]">
                1440p
              </span>
              <p className="text-slate-300 leading-tight">
                <strong className="text-white">Punto de Equilibrio:</strong> Con ~3.7M de píxeles (+80%), la GPU trabaja mucho más duro por fotograma. Los FPS son más moderados y la CPU trabaja sincronizada con holgura.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold font-mono text-[10px]">
                4K
              </span>
              <p className="text-slate-300 leading-tight">
                <strong className="text-white">100% GPU Dependiente:</strong> Con 8.3M de píxeles, la tarjeta gráfica va al 99-100%. Casi cualquier procesador moderno ofrece el mismo rendimiento aquí.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 text-center text-[10px] text-slate-500">
        Objetivo gaming: Desequilibrio &lt; 15% o carga en GPU
      </div>
    </div>
  );
};
