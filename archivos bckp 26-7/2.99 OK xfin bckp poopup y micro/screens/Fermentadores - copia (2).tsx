import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Droplets, FlaskConical, Clock, Cpu, X, Activity, Beaker } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { BATCHES } from '../data/mockData';

interface Fermentador {
  id: string;
  batch: string;
  recipe: string;
  temp: number;
  plato: number;
  ph: number;
  progress: number;
  timeLeft: string;
  status: 'activo' | 'vacio';
}

const FERMENTADORES: Fermentador[] = [
  { id: 'F-01', batch: BATCHES[0]?.batch ?? '26-017', recipe: BATCHES[0]?.recipe ?? 'Golden Ale', temp: 20.5, plato: 9.2, ph: 5.25, progress: 68, timeLeft: '4d 12h', status: 'activo' },
  { id: 'F-02', batch: BATCHES[1]?.batch ?? '26-018', recipe: BATCHES[1]?.recipe ?? 'IPA', temp: 18.0, plato: 12.5, ph: 5.18, progress: 42, timeLeft: '6d 04h', status: 'activo' },
  { id: 'F-03', batch: '—', recipe: 'Vacío', temp: 0, plato: 0, ph: 0, progress: 0, timeLeft: '—', status: 'vacio' },
  { id: 'F-04', batch: '26-019', recipe: 'Stout', temp: 22.0, plato: 14.8, ph: 5.30, progress: 85, timeLeft: '2d 08h', status: 'activo' },
  { id: 'F-05', batch: '—', recipe: 'Vacío', temp: 0, plato: 0, ph: 0, progress: 0, timeLeft: '—', status: 'vacio' },
  { id: 'F-06', batch: '26-020', recipe: 'Lager', temp: 12.0, plato: 11.2, ph: 5.22, progress: 15, timeLeft: '12d 00h', status: 'activo' },
];

export function Fermentadores() {
  const [selected, setSelected] = useState<Fermentador | null>(null);

  return (
    <div className="flex min-h-full flex-col pb-32">
      <ScreenHeader title="Fermentadores" subtitle="6 fermentadores · 4 activos · 2 vacíos" />

      <div className="grid grid-cols-2 gap-2 px-4 sm:grid-cols-3 lg:grid-cols-6">
        {FERMENTADORES.map((f, i) => (
          <FermentadorVista key={f.id} f={f} delay={0.06 + i * 0.04} onClick={() => setSelected(f)} />
        ))}
      </div>

      <RealtimeDashboard />

      <AnimatePresence>
        {selected && <FermentadorModal f={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

function FermentadorVista({ f, delay, onClick }: { f: Fermentador; delay: number; onClick: () => void }) {
  const vacio = f.status === 'vacio';

  // 🌟 LÓGICA DE CONTROL: Evaluación de desviaciones de rango seguro
  // Rango de referencia estándar de la industria — PENDIENTE de validar con el maestro cervecero, no son datos oficiales de la planta
  const isLager = f.recipe.toLowerCase().includes('lager');
  const hasTempDeviation = !vacio && (isLager ? (f.temp < 11.0 || f.temp > 13.0) : (f.temp < 17.5 || f.temp > 21.5));
  const hasPhDeviation = !vacio && (f.ph < 5.15 || f.ph > 5.35);
  const hasAnyDeviation = hasTempDeviation || hasPhDeviation;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center rounded-2xl py-4 transition-colors"
      style={{
        background: vacio ? 'rgba(74,96,112,0.04)' : 'rgba(255,170,0,0.03)',
        border: vacio ? '1px solid rgba(74,96,112,0.1)' : '1px solid rgba(255,170,0,0.12)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Tank ID label */}
      <span
        className="absolute top-2 left-2 font-mono text-[10px] font-bold"
        style={{ color: vacio ? 'rgba(74,96,112,0.4)' : '#FFAA00' }}
      >
        {f.id}
      </span>

      {/* Status dot */}
      {!vacio && (
        <span
          className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full"
          style={{ 
            background: hasAnyDeviation ? '#FFC107' : '#34d399', 
            boxShadow: hasAnyDeviation ? '0 0 6px rgba(255,193,7,0.7)' : '0 0 6px rgba(52,211,153,0.7)', 
            animation: 'live-pulse 2s ease-in-out infinite' 
          }}
        />
      )}

      {/* SVG tank visual */}
      <TankSVG size={90} vacio={vacio} progress={f.progress} />

      {/* Recipe name */}
      <span
        className="mt-1 font-display text-[11px] font-bold"
        style={{ color: vacio ? 'rgba(74,96,112,0.4)' : 'rgba(255,255,255,0.85)' }}
      >
        {vacio ? 'Vacío' : f.recipe}
      </span>

      {/* Progress bar */}
      {!vacio && (
        <div className="mt-1.5 h-0.5 w-12 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg,#FFAA00,#FA6A00)' }}
            initial={{ width: 0 }}
            animate={{ width: `${f.progress}%` }}
            transition={{ duration: 1, delay: delay + 0.15, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      )}
    </motion.button>
  );
}

function TankSVG({ size, vacio, progress }: { size: number; vacio: boolean; progress: number }) {
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

  const glow = vacio ? '74,96,112' : '255,170,0';
  const beerLevel = bodyTop + bodyH * (1 - progress / 100 * 0.7);
  const beerHeight = bodyBottom - beerLevel;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`beer-${vacio ? 'v' : 'a'}-${size}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8A040" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#A8651E" stopOpacity="0.6" />
        </linearGradient>
        <filter id={`glow-${vacio ? 'v' : 'a'}-${size}`}>
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {!vacio && (
        <motion.ellipse
          cx={cx} cy={bodyTop + bodyH * 0.4}
          rx={bodyW * 0.6} ry={bodyH * 0.5}
          fill={`rgba(${glow},0.08)`}
          filter={`url(#glow-a-${size})`}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {!vacio && (
        <rect
          x={bodyLeft}
          y={beerLevel}
          width={bodyW}
          height={beerHeight + coneH * 0.5}
          fill={`url(#beer-a-${size})`}
        />
      )}

      <path
        d={`M ${bodyLeft} ${bodyTop} L ${bodyRight} ${bodyTop} L ${bodyRight} ${bodyBottom} L ${cx + bodyW * 0.2} ${coneBottom} L ${cx - bodyW * 0.2} ${coneBottom} L ${bodyLeft} ${bodyBottom} Z`}
        fill="none"
        stroke={vacio ? 'rgba(74,96,112,0.3)' : '#FFAA00'}
        strokeWidth="1.5"
        filter={vacio ? undefined : `url(#glow-a-${size})`}
        opacity={vacio ? 0.5 : 0.9}
      />

      <ellipse
        cx={cx} cy={bodyTop}
        rx={bodyW * 0.35} ry={size * 0.02}
        fill={vacio ? 'rgba(74,96,112,0.1)' : 'rgba(255,200,80,0.15)'}
        stroke={vacio ? 'rgba(74,96,112,0.3)' : '#FFD060'}
        strokeWidth="1.2"
      />

      <line x1={cx} y1={coneBottom} x2={cx} y2={coneBottom + size * 0.04}
        stroke={vacio ? 'rgba(74,96,112,0.25)' : '#FFAA00'} strokeWidth="1.5" />
      <circle cx={cx} cy={coneBottom + size * 0.045} r={size * 0.015}
        fill={vacio ? 'rgba(74,96,112,0.25)' : '#FFAA00'} />
    </svg>
  );
}

function FermentadorModal({ f, onClose }: { f: Fermentador; onClose: () => void }) {
  const vacio = f.status === 'vacio';
  const batchData = BATCHES.find(b => b.fermentadorNum === f.id);

  // 🌟 LÓGICA DE CONTROL: Evaluación de desviaciones en el Modal
  const isLager = f.recipe.toLowerCase().includes('lager');
  const hasTempDeviation = !vacio && (isLager ? (f.temp < 11.0 || f.temp > 13.0) : (f.temp < 17.5 || f.temp > 21.5));
  const hasPhDeviation = !vacio && (f.ph < 5.15 || f.ph > 5.35);
  const hasAnyDeviation = hasTempDeviation || hasPhDeviation;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(2,4,8,0.7)', backdropFilter: 'blur(8px)' }} />

      <motion.div
        className="relative z-10 w-full max-w-lg"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="rounded-2xl p-6" style={{ background: 'rgba(2,5,10,0.92)', border: '1px solid rgba(255,170,0,0.15)', backdropFilter: 'blur(24px)', boxShadow: '0 0 40px rgba(255,170,0,0.08)' }}>
          <div className="mb-5 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl font-display text-base font-bold"
                style={{
                  background: vacio ? 'rgba(74,96,112,0.08)' : (hasAnyDeviation ? 'rgba(255,193,7,0.08)' : 'rgba(255,170,0,0.08)'),
                  border: vacio ? '1px solid rgba(74,96,112,0.15)' : (hasAnyDeviation ? '1px solid rgba(255,193,7,0.3)' : '1px solid rgba(255,170,0,0.22)'),
                  color: vacio ? 'rgba(74,96,112,0.6)' : (hasAnyDeviation ? '#FFC107' : '#FFAA00'),
                }}
              >{f.id}</div>
              <div>
                <p className="font-display text-xl font-bold text-white">{f.recipe}</p>
                <p className="font-mono text-xs" style={{ color: 'rgba(74,96,112,0.7)' }}>
