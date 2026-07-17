import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Droplets, X, MessageSquare, Activity, TrendingDown, TrendingUp, Minus, FlaskConical, Clock, Cpu, ChevronRight, Beaker } from 'lucide-react';
import type { Screen } from '../data/mockData';
import type { MicState } from '../components/MicButton';

// ─── Tank data (matches the mockup) ──────────────────────────────────────────
const TANKS = [
  { id: 'TQ-01', batch: '26-017', recipe: 'Golden Ale',  temp: 18.5, sg: 1.046, ph: 5.25, fermentation: 82, timeLeft: '3d 12h', status: 'activo' as const, trend: 'stable'   as const },
  { id: 'TQ-02', batch: '26-018', recipe: 'IPA',         temp: 17.8, sg: 1.046, ph: 5.18, fermentation: 74, timeLeft: '5d 04h', status: 'activo' as const, trend: 'stable'   as const },
  { id: 'TQ-03', batch: '26-019', recipe: 'APA',         temp: 18.7, sg: 1.048, ph: 4.35, fermentation: 92, timeLeft: '2d 14h', status: 'activo' as const, trend: 'dropping' as const },
  { id: 'TQ-04', batch: '26-020', recipe: 'Stout',       temp: 18.1, sg: 1.047, ph: 5.22, fermentation: 67, timeLeft: '6d 00h', status: 'activo' as const, trend: 'stable'   as const },
  { id: 'TQ-05', batch: '26-021', recipe: 'Session IPA', temp: 17.6, sg: 1.046, ph: 5.15, fermentation: 73, timeLeft: '5d 08h', status: 'activo' as const, trend: 'stable'   as const },
  { id: 'TQ-06', batch: '26-022', recipe: 'Lager',       temp: 18.2, sg: 1.047, ph: 5.20, fermentation: 88, timeLeft: '2d 18h', status: 'activo' as const, trend: 'rising'   as const },
];

type Tank = typeof TANKS[0];
type DetailTab = 'resumen' | 'graficas' | 'parametros' | 'historial';

interface HomeProps {
  micState: MicState;
  onMic: () => void;
  onNavigate: (s: Screen) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  mode: 'online' | 'bunker';
  onToggleMode: () => void;
}

export function Home({ onNavigate, micState, onMic, soundEnabled, onToggleSound, mode, onToggleMode }: HomeProps) {
  // Default to TQ-03 (third tank, F3) selected on start to match the mockup
  const [selected, setSelected] = useState<Tank | null>(() => TANKS[2]);
  const [tab, setTab] = useState<DetailTab>('resumen');

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* ── Left main container: Control Room Perspective + Stats (Desktop) ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
        
        {/* Section label */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="live-dot" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: 'rgba(74,96,112,0.8)' }}>
              Fermentadores activos — 6/6
            </span>
          </div>
          <button onClick={() => onNavigate('fermentadores')}
            className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider transition-colors hover:text-[#00e1ff]"
            style={{ color: '#00e1ff' }}
          >
            Ver todos <ChevronRight size={11} />
          </button>
        </div>

        {/* ── Immersive Interactive Control Room Panel with Holographic Overlays ── */}
        <div className="relative w-full aspect-[16/10] md:aspect-[16/11] lg:aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950/40 select-none shrink-0">
          <img
            src="/src/assets/images/fondo_pc_1784321905664.jpg"
            alt="Control Room"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
            referrerPolicy="no-referrer"
          />
          {/* Ambient overlays to increase contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-slate-950/40" />

          {/* Six Holographic Overlays lined up with the visual fermenters */}
          {TANKS.map((tank, idx) => {
            const isSel = selected?.id === tank.id;
            // Precise horizontal percentage positions mapping to the tanks in the generated 3D image
            const leftPositions = ['3.5%', '16.5%', '29.5%', '42.5%', '55.5%', '68.5%'];
            const leftPos = leftPositions[idx] || '0%';
            const platoVal = (259 - (259 / tank.sg)).toFixed(1);

            return (
              <motion.button
                key={tank.id}
                onClick={() => { setSelected(tank); setTab('resumen'); }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="absolute transition-all duration-300 rounded-xl p-1.5 md:p-3 text-left flex flex-col justify-between"
                style={{
                  left: leftPos,
                  top: '11%',
                  width: '11.5%',
                  height: '52%',
                  background: isSel ? 'rgba(0, 225, 255, 0.14)' : 'rgba(2, 6, 12, 0.58)',
                  border: isSel ? '2px solid rgba(0, 225, 255, 0.95)' : '1px solid rgba(0, 225, 255, 0.28)',
                  backdropFilter: 'blur(5px)',
                  boxShadow: isSel 
                    ? '0 0 30px rgba(0, 225, 255, 0.5), inset 0 0 15px rgba(0, 225, 255, 0.25)' 
                    : '0 4px 15px rgba(0, 0, 0, 0.6)',
                }}
              >
                {/* Glowing status line */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-gradient-to-r from-transparent ${isSel ? 'via-[#00e1ff]' : 'via-[#00e1ff]/40'} to-transparent`} />

                {/* Header with tank label & status dot */}
                <div className="flex items-center justify-between">
                  <span className={`font-display text-xs md:text-lg font-black tracking-wider ${isSel ? 'text-[#00e1ff] drop-shadow-[0_0_10px_rgba(0,225,255,0.7)]' : 'text-white'}`}>
                    F{idx + 1}
                  </span>
                  <span className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-[#34d399]" style={{ boxShadow: '0 0 6px #34d399', animation: 'live-pulse 2s ease-in-out infinite' }} />
                </div>

                {/* Quick stats on the holographic overlay card */}
                <div className="space-y-1 md:space-y-3 font-mono text-[8px] md:text-xs">
                  {/* Temperature */}
                  <div className="flex items-center gap-1 md:gap-1.5">
                    <Thermometer size={12} className="text-[#00e1ff] shrink-0" />
                    <div>
                      <p className="text-[6.5px] md:text-[8px] uppercase text-gray-500 leading-none">Temp</p>
                      <p className="font-bold text-[#00e1ff] text-[9px] md:text-[13px] leading-tight">{tank.temp}°C</p>
                    </div>
                  </div>

                  {/* Plato density */}
                  <div className="flex items-center gap-1 md:gap-1.5">
                    <Droplets size={12} className="text-amber-400 shrink-0" />
                    <div>
                      <p className="text-[6.5px] md:text-[8px] uppercase text-gray-500 leading-none">Plato</p>
                      <p className="font-bold text-amber-400 text-[9px] md:text-[13px] leading-tight">{platoVal}°P</p>
                    </div>
                  </div>

                  {/* pH value */}
                  <div className="flex items-center gap-1 md:gap-1.5">
                    <Beaker size={12} className="text-[#34d399] shrink-0" />
                    <div>
                      <p className="text-[6.5px] md:text-[8px] uppercase text-gray-500 leading-none">pH</p>
                      <p className="font-bold text-[#34d399] text-[9px] md:text-[13px] leading-tight">{tank.ph.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Progress bar at bottom */}
                <div className="w-full">
                  <div className="flex justify-between text-[6px] md:text-[7.5px] text-gray-500 font-mono mb-0.5 leading-none">
                    <span className="hidden sm:inline">FERM</span>
                    <span className="text-white font-bold">{tank.fermentation}%</span>
                  </div>
                  <div className="h-0.5 md:h-1 w-full rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00e1ff] to-blue-500" style={{ width: `${tank.fermentation}%` }} />
                  </div>
                </div>
              </motion.button>
            );
          })}

          {/* Floating tablet/assistant status card inside the main control room screen */}
          <div 
            className="absolute bottom-3 left-3 md:bottom-4 md:left-4 p-2 md:p-3 rounded-xl border border-[#00e1ff]/30 bg-slate-950/80 backdrop-blur-md flex items-center gap-2.5 max-w-[200px] md:max-w-[280px]"
            style={{ boxShadow: '0 0 15px rgba(0,225,255,0.15)' }}
          >
            <div className="h-7 w-7 rounded-lg bg-[#00e1ff]/10 border border-[#00e1ff]/30 flex items-center justify-center shrink-0">
              <Cpu size={14} className="text-[#00e1ff] animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-mono text-[7.5px] md:text-[9px] uppercase text-[#00e1ff] block tracking-wider font-bold">SISTEMA ACTIVO — J.A.R.B.E.E.R.</span>
              <span className="font-sans text-[9px] md:text-[11px] text-gray-300 block truncate">Inteligencia de fermentación optimizada.</span>
            </div>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 shrink-0">
          <QuickStat label="Temp. Exterior" value="31°C" sub="Estimación carga: Alta" color="#f43f5e" />
          <QuickStat label="Temperatura media" value="18.2°C" sub="Objetivo 18.0–19.0°C" color="#FFAA00" />
          <QuickStat label="SG promedio" value="1.047" sub="Fermentación activa" color="#00e1ff" />
          <QuickStat label="Fermentación media" value="79.3%" sub="6 tanques en proceso" color="#34d399" />
          <QuickStat label="Tiempo medio restante" value="4d 06h" sub="Estimado por IA" color="#FA6A00" />
        </div>

        {/* AI Core status */}
        <div className="rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 shrink-0"
          style={{ background: 'rgba(6,12,20,0.7)', border: '1px solid rgba(255,170,0,0.1)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.25)' }}
          >
            <Cpu size={18} style={{ color: '#FFAA00' }} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'rgba(74,96,112,0.7)' }}>J.A.R.B.E.E.R. Core</p>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-1 mt-1">
              <CoreStat label="IA Core" value="Online" dot="#34d399" />
              <CoreStat label="Flujo de datos" value="Activo" dot="#34d399" />
              <CoreStat label="Aprendizaje" value="Continuo" dot="#FFAA00" />
              <CoreStat label="Sincronización" value="Tiempo real" dot="#34d399" />
            </div>
          </div>
          <button onClick={() => onNavigate('assistant')}
            className="shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-sm font-bold uppercase tracking-widest transition-all duration-200"
            style={{ background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)', color: '#FFAA00' }}
          >
            <MessageSquare size={14} />
            Hablar con J.A.R.B.E.E.R.
          </button>
        </div>
      </div>

      {/* ── Right sidebar container: Detail Panel (Desktop only) ── */}
      <div className="hidden md:flex md:w-[320px] lg:w-[360px] xl:w-[400px] shrink-0 h-full border-l border-white/5 bg-slate-950/20 backdrop-blur-md overflow-y-auto">
        {selected ? (
          <DetailPanel 
            tank={selected} 
            tab={tab} 
            setTab={setTab} 
            onClose={() => setSelected(null)} 
            onNavigate={onNavigate} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full space-y-3">
            <div className="h-12 w-12 rounded-full border border-dashed border-white/10 flex items-center justify-center text-gray-500">
              <FlaskConical size={20} />
            </div>
            <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">
              Seleccione un fermentador
            </p>
          </div>
        )}
      </div>

      {/* ── Mobile-only Detail Drawer/Modal ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="md:hidden fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <div className="absolute inset-0" style={{ background: 'rgba(2,4,8,0.7)', backdropFilter: 'blur(8px)' }} />
            <motion.div
              key={selected.id}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
              onClick={e => e.stopPropagation()}
              className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl"
              style={{
                background: 'rgba(2,5,10,0.92)',
                border: '1px solid rgba(255,170,0,0.15)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 0 40px rgba(255,170,0,0.08)',
              }}
            >
              <DetailPanel tank={selected} tab={tab} setTab={setTab} onClose={() => setSelected(null)} onNavigate={onNavigate} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tank Card — holographic tank visual ───────────────────────────────────
function TankCard({ tank, delay, selected, onClick }: { tank: Tank; delay: number; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative flex flex-col items-center justify-center rounded-2xl py-3 transition-colors"
      style={{
        background: selected ? 'rgba(255,170,0,0.08)' : 'rgba(255,170,0,0.03)',
        border: selected ? '1.5px solid rgba(255,170,0,0.4)' : '1px solid rgba(255,170,0,0.12)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Tank ID */}
      <span className="absolute top-1.5 left-2 font-mono text-[9px] font-bold" style={{ color: selected ? '#FFAA00' : 'rgba(255,170,0,0.7)' }}>{tank.id}</span>

      {/* Status dot */}
      <span className="absolute top-2 right-2 h-2 w-2 rounded-full" style={{ background: '#34d399', boxShadow: '0 0 5px rgba(52,211,153,0.7)', animation: 'live-pulse 2s ease-in-out infinite' }} />

      {/* SVG tank */}
      <HomeTankSVG size={70} progress={tank.fermentation} active={selected} />

      {/* Recipe */}
      <span className="mt-0.5 font-display text-[10px] font-bold" style={{ color: selected ? '#FFAA00' : 'rgba(255,255,255,0.8)' }}>{tank.recipe}</span>

      {/* Progress bar */}
      <div className="mt-1 h-0.5 w-10 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg,#FFAA00,#FA6A00)' }}
          initial={{ width: 0 }}
          animate={{ width: `${tank.fermentation}%` }}
          transition={{ duration: 1, delay: delay + 0.15, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.button>
  );
}

function HomeTankSVG({ size, progress, active }: { size: number; progress: number; active: boolean }) {
  const cx = size / 2;
  const bodyW = size * 0.4;
  const bodyH = size * 0.38;
  const coneH = size * 0.12;
  const topY = size * 0.18;
  const bodyTop = topY + size * 0.03;
  const bodyBottom = bodyTop + bodyH;
  const coneBottom = bodyBottom + coneH;
  const bodyLeft = cx - bodyW / 2;
  const bodyRight = cx + bodyW / 2;
  const beerLevel = bodyTop + bodyH * (1 - progress / 100 * 0.7);
  const beerHeight = bodyBottom - beerLevel;
  const gid = `home-tank-${size}`;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${gid}-beer`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8A040" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#A8651E" stopOpacity="0.6" />
        </linearGradient>
        <filter id={`${gid}-glow`}>
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Glow */}
      <motion.ellipse cx={cx} cy={bodyTop + bodyH * 0.4} rx={bodyW * 0.6} ry={bodyH * 0.5}
        fill={`rgba(255,170,0,${active ? 0.12 : 0.06})`}
        filter={`url(#${gid}-glow)`}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Beer fill */}
      <rect x={bodyLeft} y={beerLevel} width={bodyW} height={beerHeight + coneH * 0.5} fill={`url(#${gid}-beer)`} />

      {/* Tank outline */}
      <path
        d={`M ${bodyLeft} ${bodyTop} L ${bodyRight} ${bodyTop} L ${bodyRight} ${bodyBottom} L ${cx + bodyW * 0.2} ${coneBottom} L ${cx - bodyW * 0.2} ${coneBottom} L ${bodyLeft} ${bodyBottom} Z`}
        fill="none" stroke="#FFAA00" strokeWidth="1.5" filter={`url(#${gid}-glow)`} opacity={active ? 1 : 0.8}
      />

      {/* Top cap */}
      <ellipse cx={cx} cy={bodyTop} rx={bodyW * 0.35} ry={size * 0.02}
        fill="rgba(255,200,80,0.15)" stroke="#FFD060" strokeWidth="1.2" />

      {/* Valve */}
      <line x1={cx} y1={coneBottom} x2={cx} y2={coneBottom + size * 0.04}
        stroke="#FFAA00" strokeWidth="1.5" />
      <circle cx={cx} cy={coneBottom + size * 0.045} r={size * 0.015} fill="#FFAA00" />
    </svg>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function DetailPanel({ tank, tab, setTab, onClose, onNavigate }: {
  tank: Tank; tab: DetailTab; setTab: (t: DetailTab) => void; onClose: () => void; onNavigate: (s: Screen) => void;
}) {
  const TABS: { id: DetailTab; label: string }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'graficas', label: 'Gráficas' },
    { id: 'parametros', label: 'Parámetros' },
    { id: 'historial', label: 'Historial' },
  ];

  const sgFinal = (tank.sg - 0.037).toFixed(3);
  const daysLeft = Math.ceil(parseFloat(tank.timeLeft));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-display text-base font-black" style={{ color: '#FFAA00' }}>{tank.id}</span>
            <span className="ml-2 font-mono text-[10px] uppercase tracking-wider" style={{ color: 'rgba(74,96,112,0.7)' }}>Detalle de fermentación</span>
          </div>
          <button onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <X size={13} style={{ color: 'rgba(74,96,112,0.7)' }} />
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-0.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 rounded-lg py-1.5 font-mono text-[9px] uppercase tracking-wider transition-all duration-150"
              style={{
                background: tab === t.id ? 'rgba(255,170,0,0.1)' : 'transparent',
                border: tab === t.id ? '1px solid rgba(255,170,0,0.2)' : '1px solid transparent',
                color: tab === t.id ? '#FFAA00' : 'rgba(74,96,112,0.65)',
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <AnimatePresence mode="wait">
          {tab === 'resumen' && (
            <motion.div key="resumen" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Status row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
                  <p className="font-mono text-[8px] uppercase tracking-wider mb-1" style={{ color: 'rgba(52,211,153,0.7)' }}>Estado actual</p>
                  <p className="font-display text-lg font-black" style={{ color: '#34d399' }}>Activo</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,170,0,0.06)', border: '1px solid rgba(255,170,0,0.18)' }}>
                  <p className="font-mono text-[8px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,170,0,0.7)' }}>Fermentación</p>
                  <p className="font-display text-lg font-black" style={{ color: '#FFAA00' }}>{tank.fermentation}%</p>
                </div>
              </div>

              {/* Three metric tiles */}
              <div className="grid grid-cols-3 gap-2">
                <MetricTile label="Temperatura" value={`${tank.temp}°C`} sub={`Rango óptimo: ${(tank.temp-0.8).toFixed(1)}-${(tank.temp+0.3).toFixed(1)}°C`} color="#FFAA00" />
                <MetricTile label="Densidad (SG)" value={tank.sg.toFixed(3)} sub="Objetivo: 1.010-1.012" color="#00e1ff" />
                <MetricTile label="pH Actual" value={tank.ph.toFixed(2)} sub="Rango óptimo: 4.20-4.60" color="#34d399" />
              </div>

              {/* IA Prediction */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,170,0,0.04)', border: '1px solid rgba(255,170,0,0.12)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Cpu size={11} style={{ color: '#FFAA00' }} />
                    <span className="font-mono text-[8px] uppercase tracking-wider" style={{ color: '#FFAA00' }}>Predicción IA</span>
                  </div>
                  <p className="font-sans text-xs leading-relaxed" style={{ color: 'rgba(180,200,216,0.85)' }}>
                    La fermentación alcanzará su punto final en
                  </p>
                  <p className="mt-1 font-display text-base font-bold" style={{ color: '#FFAA00' }}>{tank.timeLeft}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(0,225,255,0.04)', border: '1px solid rgba(0,225,255,0.12)' }}>
                  <p className="font-mono text-[8px] uppercase tracking-wider mb-2" style={{ color: 'rgba(0,225,255,0.7)' }}>Densidad final est.</p>
                  <p className="font-display text-xl font-black" style={{ color: '#00e1ff' }}>{sgFinal} SG</p>
                </div>
              </div>

              {/* Recommendation */}
              <div className="rounded-xl p-3.5" style={{ background: 'rgba(255,170,0,0.04)', border: '1px solid rgba(255,170,0,0.1)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={12} style={{ color: '#FFAA00' }} />
                  <span className="font-mono text-[9px] uppercase tracking-wider font-bold" style={{ color: '#FFAA00' }}>Recomendación de J.A.R.B.E.E.R.</span>
                </div>
                <div className="space-y-1">
                  {getRecommendations(tank).map((r, i) => (
                    <p key={i} className="font-sans text-[11px] leading-relaxed flex items-center gap-2" style={{ color: 'rgba(180,200,216,0.85)' }}>
                      <span className="h-1 w-1 rounded-full shrink-0" style={{ background: '#FFAA00' }} />{r}
                    </p>
                  ))}
                </div>
              </div>

              {/* Lote info */}
              <div className="flex items-center justify-between rounded-xl px-3.5 py-2.5"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2">
                  <FlaskConical size={12} style={{ color: 'rgba(74,96,112,0.65)' }} />
                  <span className="font-mono text-[10px]" style={{ color: 'rgba(74,96,112,0.75)' }}>Lote {tank.batch} · {tank.recipe}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={11} style={{ color: 'rgba(74,96,112,0.55)' }} />
                  <span className="font-mono text-[10px]" style={{ color: 'rgba(74,96,112,0.75)' }}>{tank.timeLeft} restante</span>
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'graficas' && (
            <motion.div key="graficas" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="rounded-xl p-3" style={{ background: 'rgba(6,12,20,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider font-bold text-white">Curva de fermentación</p>
                  <div className="flex items-center gap-3 ml-auto">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-0.5 rounded-full" style={{ background: '#FFAA00' }} />
                      <span className="font-mono text-[8px]" style={{ color: 'rgba(74,96,112,0.7)' }}>Temperatura (°C)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-0.5 rounded-full" style={{ background: '#00e1ff', borderTop: '2px dashed #00e1ff' }} />
                      <span className="font-mono text-[8px]" style={{ color: 'rgba(74,96,112,0.7)' }}>Densidad (SG)</span>
                    </div>
                  </div>
                </div>
                <FermentationChart fermentation={tank.fermentation} />
              </div>
            </motion.div>
          )}

          {tab === 'parametros' && (
            <motion.div key="parametros" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {[
                { label: 'Temperatura actual', value: `${tank.temp}°C`, opt: `Óptimo: ${(tank.temp-0.8).toFixed(1)}-${(tank.temp+0.3).toFixed(1)}°C` },
                { label: 'Densidad (SG)', value: tank.sg.toFixed(3), opt: 'Objetivo: 1.010-1.012' },
                { label: 'pH', value: tank.ph.toFixed(2), opt: 'Rango: 4.20-4.60' },
                { label: 'Fermentación', value: `${tank.fermentation}%`, opt: 'Etapa activa' },
                { label: 'Tiempo restante', value: tank.timeLeft, opt: 'Estimado por IA' },
                { label: 'Lote', value: tank.batch, opt: tank.recipe },
              ].map(p => (
                <div key={p.label} className="flex items-center justify-between rounded-xl px-3.5 py-3"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="font-mono text-xs" style={{ color: 'rgba(74,96,112,0.8)' }}>{p.label}</span>
                  <div className="text-right">
                    <p className="font-display text-sm font-bold text-white">{p.value}</p>
                    <p className="font-mono text-[9px]" style={{ color: 'rgba(74,96,112,0.55)' }}>{p.opt}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {tab === 'historial' && (
            <motion.div key="historial" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
              {getHistory(tank).map((h, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl px-3.5 py-3"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full" style={{ background: h.color }} />
                  <div>
                    <p className="font-mono text-xs text-white">{h.event}</p>
                    <p className="font-mono text-[9px]" style={{ color: 'rgba(74,96,112,0.6)' }}>{h.time} · {h.user}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA button */}
        <button onClick={() => onNavigate('assistant')}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-sm font-bold uppercase tracking-widest transition-all duration-200"
          style={{ background: 'rgba(255,170,0,0.1)', border: '1.5px solid rgba(255,170,0,0.3)', color: '#FFAA00' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,170,0,0.18)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,170,0,0.1)'; }}
        >
          <MessageSquare size={15} />
          Hablar con J.A.R.B.E.E.R.
        </button>
      </div>
    </div>
  );
}

// ─── Fermentation chart (SVG) ─────────────────────────────────────────────────
function FermentationChart({ fermentation }: { fermentation: number }) {
  const W = 280, H = 110;
  const PAD = { t: 10, r: 34, b: 22, l: 26 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const DAYS = 20;

  const tempData = [19.0, 19.2, 19.4, 19.5, 19.3, 19.1, 18.9, 18.7, 18.6, 18.4, 18.2, 18.0, 17.8, 17.5, 17.2, 17.0, 16.8, 16.5, 16.3, 16.0];
  const sgData   = [1.080,1.073,1.066,1.060,1.054,1.050,1.047,1.043,1.040,1.037,1.033,1.030,1.027,1.024,1.021,1.019,1.017,1.015,1.013,1.011];

  const tempMin = 12, tempMax = 22;
  const sgMin = 0.978, sgMax = 1.084;

  const xOf = (i: number) => PAD.l + (i / (DAYS - 1)) * cW;
  const tempY = (t: number) => PAD.t + cH - ((t - tempMin) / (tempMax - tempMin)) * cH;
  const sgY   = (sg: number) => PAD.t + cH - ((sg - sgMin) / (sgMax - sgMin)) * cH;

  const tempPath = tempData.map((t, i) => `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${tempY(t).toFixed(1)}`).join(' ');
  const sgPath   = sgData.map((sg, i) => `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${sgY(sg).toFixed(1)}`).join(' ');

  const curDay = Math.round((fermentation / 100) * (DAYS - 1));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
      {/* Grid */}
      {[0, 0.33, 0.66, 1].map((f, i) => (
        <line key={i} x1={PAD.l} y1={PAD.t + cH * f} x2={W - PAD.r} y2={PAD.t + cH * f}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      {[0, 5, 10, 15, 20].map(d => (
        <line key={d} x1={xOf(d)} y1={PAD.t} x2={xOf(d)} y2={PAD.t + cH}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}

      {/* Current day marker */}
      <line x1={xOf(curDay)} y1={PAD.t} x2={xOf(curDay)} y2={PAD.t + cH}
        stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Temperature line */}
      <path d={tempPath} fill="none" stroke="#FFAA00" strokeWidth="2" strokeLinejoin="round" />

      {/* SG line */}
      <path d={sgPath} fill="none" stroke="#00e1ff" strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="5 3" />

      {/* Current point dots */}
      <circle cx={xOf(curDay)} cy={tempY(tempData[curDay])} r="3.5" fill="#FFAA00" style={{ filter: 'drop-shadow(0 0 4px rgba(255,170,0,0.8))' }} />
      <circle cx={xOf(curDay)} cy={sgY(sgData[curDay])} r="3" fill="#00e1ff" style={{ filter: 'drop-shadow(0 0 4px rgba(0,225,255,0.8))' }} />

      {/* Y-axis left (temp) */}
      {[20, 16, 12].map((t, i) => (
        <text key={i} x={PAD.l - 4} y={tempY(t) + 3} textAnchor="end" fontSize="7" fontFamily="JetBrains Mono, monospace" fill="rgba(255,170,0,0.55)">{t}</text>
      ))}

      {/* Y-axis right (SG) */}
      <text x={W - PAD.r + 4} y={PAD.t + 4} textAnchor="start" fontSize="7" fontFamily="JetBrains Mono, monospace" fill="rgba(0,225,255,0.55)">1.080</text>
      <text x={W - PAD.r + 4} y={sgY(1.040) + 3} textAnchor="start" fontSize="7" fontFamily="JetBrains Mono, monospace" fill="rgba(0,225,255,0.55)">1.040</text>
      <text x={W - PAD.r + 4} y={H - PAD.b + 3} textAnchor="start" fontSize="7" fontFamily="JetBrains Mono, monospace" fill="rgba(0,225,255,0.55)">0.980</text>

      {/* X-axis labels */}
      {[0, 5, 10, 15, 20].map(d => (
        <text key={d} x={xOf(d)} y={H - 4} textAnchor="middle" fontSize="7" fontFamily="JetBrains Mono, monospace" fill="rgba(74,96,112,0.65)">{d}</text>
      ))}
      <text x={W / 2} y={H} textAnchor="middle" fontSize="6.5" fontFamily="JetBrains Mono, monospace" fill="rgba(74,96,112,0.45)">DÍAS</text>
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function MetricTile({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-xl p-2.5 text-center" style={{ background: `${color}09`, border: `1px solid ${color}20` }}>
      <p className="font-mono text-[8px] uppercase tracking-wide mb-1" style={{ color: `${color}aa` }}>{label}</p>
      <p className="font-display text-base font-black leading-tight" style={{ color }}>{value}</p>
      <p className="font-mono text-[7.5px] mt-1 leading-tight" style={{ color: 'rgba(74,96,112,0.6)' }}>{sub}</p>
    </div>
  );
}

function QuickStat({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-2xl p-3.5" style={{ background: 'rgba(6,12,20,0.65)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
      <p className="font-mono text-[9px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(74,96,112,0.7)' }}>{label}</p>
      <p className="font-display text-xl font-black leading-none" style={{ color }}>{value}</p>
      <p className="font-mono text-[9px] mt-1" style={{ color: 'rgba(74,96,112,0.6)' }}>{sub}</p>
    </div>
  );
}

function CoreStat({ label, value, dot }: { label: string; value: string; dot: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'rgba(74,96,112,0.6)' }}>{label}</p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />
        <span className="font-mono text-[10px] font-bold" style={{ color: dot }}>{value}</span>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRecommendations(tank: Tank): string[] {
  if (tank.fermentation >= 85) return [
    'Fermentación en fase final. Preparar trasvase.',
    'La densidad está en el rango óptimo.',
    'Vigilar pH durante las próximas 24h.',
  ];
  if (tank.fermentation >= 60) return [
    'Mantener la temperatura actual.',
    'Controlar °Plato cada 24h.',
    'Verificar actividad visual del airlock.',
  ];
  return [
    'Fermentación inicial activa. Vigilar temperatura.',
    'Verificar actividad de la levadura.',
    'No abrir el fermentador en las próximas 48h.',
  ];
}

function getHistory(tank: Tank) {
  return [
    { event: `Lectura °Plato: ${tank.fermentation * 0.09 + 3}°P`, time: 'Hoy 08:30', user: 'Juanfran', color: '#34d399' },
    { event: `Temperatura ajustada a ${tank.temp}°C`, time: 'Ayer 16:00', user: 'Sistema', color: '#FFAA00' },
    { event: 'Muestra tomada para análisis pH', time: 'Ayer 09:15', user: 'Juanfran', color: '#00e1ff' },
    { event: `Lote ${tank.batch} transferido a ${tank.id}`, time: '3 días', user: 'Juanfran', color: '#FFAA00' },
    { event: 'Levadura inoculada. Inicio fermentación', time: '4 días', user: 'Sistema', color: '#34d399' },
  ];
}
