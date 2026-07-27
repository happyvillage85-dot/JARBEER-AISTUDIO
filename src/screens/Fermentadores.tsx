import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Droplets, FlaskConical, Clock, Cpu, X, Activity, Beaker } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { useRegistros } from '../lib/registrosState';

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

export function Fermentadores() {
  const [selected, setSelected] = useState<Fermentador | null>(null);
  const { registrosProduccion } = useRegistros();

  const FERMENTADORES: Fermentador[] = Array.from({ length: 6 }, (_, i) => {
    const id = `F-0${i + 1}`;
    const registro = registrosProduccion?.[i];

    if (!registro) {
      return {
        id,
        batch: '—',
        recipe: 'Vacío',
        temp: 0,
        plato: 0,
        ph: 0,
        progress: 0,
        timeLeft: '—',
        status: 'vacio',
      };
    }

    return {
      id,
      batch: registro.batch ?? '—',
      recipe: registro.recipe ?? 'Lote',
      temp: registro.currentTemp ?? 20.0,
      plato: registro.plato ?? 10.0,
      ph: registro.ph ?? 5.2,
      progress: 50,
      timeLeft: '4d 00h',
      status: 'activo',
    };
  });

  const activosCount = FERMENTADORES.filter(f => f.status === 'activo').length;
  const vaciosCount = FERMENTADORES.filter(f => f.status === 'vacio').length;

  return (
    <div className="flex min-h-full flex-col pb-32">
      <ScreenHeader title="Fermentadores" subtitle={`6 fermentadores · ${activosCount} activos · ${vaciosCount} vacíos`} />
      <div className="grid grid-cols-2 gap-2 px-4 sm:grid-cols-3 lg:grid-cols-6">
        {FERMENTADORES.map((f, i) => (
          <FermentadorVista key={f.id} f={f} delay={0.06 + i * 0.04} onClick={() => setSelected(f)} />
        ))}
      </div>
      <div className="h-4" />
      <AnimatePresence>
        {selected && <FermentadorModal f={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

function FermentadorVista({ f, delay, onClick }: { f: Fermentador; delay: number; onClick: () => void }) {
  const vacio = f.status === 'vacio';
  const isLager = f.recipe.toLowerCase().includes('lager');
  const hasTempDeviation = !vacio && (isLager ? (f.temp < 11.0 || f.temp > 13.0) : (f.temp < 17.5 || f.temp > 21.5));
  const hasPhDeviation = !vacio && (f.ph < 5.15 || f.ph > 5.35);
  const hasAnyDeviation = hasTempDeviation || hasPhDeviation;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, ease: [0.22, 1, 0.36, 1] }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      onClick={onClick} className="relative flex flex-col items-center justify-center rounded-2xl py-4 transition-colors"
      style={{
        background: vacio ? 'rgba(74,96,112,0.04)' : 'rgba(255,170,0,0.03)',
        border: vacio ? '1px solid rgba(74,96,112,0.1)' : '1px solid rgba(255,170,0,0.12)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span className="absolute top-2 left-2 font-mono text-[10px] font-bold" style={{ color: vacio ? 'rgba(74,96,112,0.4)' : '#FFAA00' }}>{f.id}</span>
      {!vacio && (
        <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full"
          style={{ background: hasAnyDeviation ? '#FFC107' : '#34d399', boxShadow: hasAnyDeviation ? '0 0 6px rgba(255,193,7,0.7)' : '0 0 6px rgba(52,211,153,0.7)' }}
        />
      )}
      <TankSVG size={90} vacio={vacio} progress={f.progress} />
      <span className="mt-1 font-display text-[11px] font-bold" style={{ color: vacio ? 'rgba(74,96,112,0.4)' : 'rgba(255,255,255,0.85)' }}>{vacio ? 'Vacío' : f.recipe}</span>
      {!vacio && (
        <div className="mt-1.5 h-0.5 w-12 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#FFAA00,#FA6A00)', width: `${f.progress}%` }} />
        </div>
      )}
    </motion.button>
  );
}

function TankSVG({ size, vacio, progress }: { size: number; vacio: boolean; progress: number }) {
  const cx = size / 2; const bodyW = size * 0.4; const bodyH = size * 0.38; const coneH = size * 0.12; const topY = size * 0.18;
  const bodyTop = topY + size * 0.03; const bodyBottom = bodyTop + bodyH; const coneBottom = bodyBottom + coneH;
  const bodyLeft = cx - bodyW / 2; const bodyRight = cx + bodyW / 2;
  const glow = vacio ? '74,96,112' : '255,170,0';
  const beerLevel = bodyTop + bodyH * (1 - (progress / 100) * 0.7);
  const beerHeight = bodyBottom - beerLevel;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ overflow: 'visible' }}>
      {!vacio && <ellipse cx={cx} cy={bodyTop + bodyH * 0.4} rx={bodyW * 0.6} ry={bodyH * 0.5} fill={`rgba(${glow},0.08)`} />}
      {!vacio && <rect x={bodyLeft} y={beerLevel} width={bodyW} height={beerHeight + coneH * 0.5} fill="rgba(232,160,64,0.6)" />}
      <path d={`M ${bodyLeft} ${bodyTop} L ${bodyRight} ${bodyTop} L ${bodyRight} ${bodyBottom} L ${cx + bodyW * 0.2} ${coneBottom} L ${cx - bodyW * 0.2} ${coneBottom} L ${bodyLeft} ${bodyBottom} Z`} fill="none" stroke={vacio ? 'rgba(74,96,112,0.3)' : '#FFAA00'} strokeWidth="1.5" opacity={vacio ? 0.5 : 0.9} />
      <ellipse cx={cx} cy={bodyTop} rx={bodyW * 0.35} ry={size * 0.02} fill={vacio ? 'rgba(74,96,112,0.1)' : 'rgba(255,200,80,0.15)'} stroke={vacio ? 'rgba(74,96,112,0.3)' : '#FFD060'} strokeWidth="1.2" />
      <line x1={cx} y1={coneBottom} x2={cx} y2={coneBottom + size * 0.04} stroke={vacio ? 'rgba(74,96,112,0.25)' : '#FFAA00'} strokeWidth="1.5" />
      <circle cx={cx} cy={coneBottom + size * 0.045} r={size * 0.015} fill={vacio ? 'rgba(74,96,112,0.25)' : '#FFAA00'} />
    </svg>
  );
}

function FermentadorModal({ f, onClose }: { f: Fermentador; onClose: () => void }) {
  const vacio = f.status === 'vacio';
  const isLager = f.recipe.toLowerCase().includes('lager');
  const hasTempDeviation = !vacio && (isLager ? (f.temp < 11.0 || f.temp > 13.0) : (f.temp < 17.5 || f.temp > 21.5));
  const hasPhDeviation = !vacio && (f.ph < 5.15 || f.ph > 5.35);
  const hasAnyDeviation = hasTempDeviation || hasPhDeviation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-sm rounded-2xl p-5" style={{ background: 'rgba(2,5,10,0.95)', border: '1px solid rgba(255,170,0,0.15)' }} onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg font-mono text-sm font-bold bg-zinc-900 border border-zinc-800 text-[#FFAA00]">{f.id}</div>
            <div>
              <p className="font-display text-base font-bold text-white">{f.recipe}</p>
              <p className="font-mono text-[10px] text-zinc-500">{vacio ? 'Sin lote' : `Lote ${f.batch}`}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={18} /></button>
        </div>
        {!vacio && (
          <div className="space-y-3 font-mono text-xs text-zinc-300">
            <div className="flex justify-between border-b border-zinc-900 pb-1.5">
              <span>Estado:</span>
              <span className="font-bold" style={{ color: hasAnyDeviation ? '#FFC107' : '#34d399' }}>{hasAnyDeviation ? '⚠️ ADVERTENCIA' : '✓ ESTABLE'}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-900 pb-1.5">
              <span>Temperatura:</span>
              <span className="font-bold" style={{ color: hasTempDeviation ? '#FFC107' : '#ffffff' }}>{f.temp}°C</span>
            </div>
            <div className="flex justify-between border-b border-zinc-900 pb-1.5">
              <span>Parámetro pH:</span>
              <span className="font-bold" style={{ color: hasPhDeviation ? '#FFC107' : '#ffffff' }}>{f.ph.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-900 pb-1.5">
              <span>Rendimiento:</span>
              <span>{f.progress}%</span>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-500">
              <span>Tiempo Restante:</span>
              <span>{f.timeLeft}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}