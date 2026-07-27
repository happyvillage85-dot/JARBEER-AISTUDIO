import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Activity, Volume2, VolumeX, Shield, Wifi, Mic, Zap, Beaker
} from 'lucide-react';

import type { Screen } from '../data/mockData';
import type { SystemMode } from '../lib/config';
import type { MicState } from '../components/MicButton';

// ─── Datos de tanques (F1-F6) ──────────────────────────────────────────────
const TANKS = [
  { id: 'F1', batch: '26-017', recipe: 'Golden Ale', temp: 18.5, sg: 1.046, ph: 5.25, fermentation: 82, timeLeft: '3d 12h', status: 'activo', kpi: '85% EN PROCESO' },
  { id: 'F2', batch: '26-018', recipe: 'IPA', temp: 17.8, sg: 1.046, ph: 5.18, fermentation: 74, timeLeft: '5d 04h', status: 'activo', kpi: '78% EN PROCESO' },
  { id: 'F3', batch: '26-019', recipe: 'APA', temp: 18.7, sg: 1.048, ph: 4.35, fermentation: 92, timeLeft: '2d 14h', status: 'activo', kpi: '92% EN PROCESO' },
  { id: 'F4', batch: '26-020', recipe: 'Stout', temp: 18.1, sg: 1.047, ph: 5.22, fermentation: 67, timeLeft: '6d 00h', status: 'activo', kpi: '67% EN PROCESO' },
  { id: 'F5', batch: '26-021', recipe: 'Session IPA', temp: 17.6, sg: 1.046, ph: 5.15, fermentation: 73, timeLeft: '5d 08h', status: 'activo', kpi: '73% EN PROCESO' },
  { id: 'F6', batch: '26-022', recipe: 'Lager', temp: 18.2, sg: 1.047, ph: 5.20, fermentation: 88, timeLeft: '2d 18h', status: 'activo', kpi: '88% EN PROCESO' },
];

type Tank = typeof TANKS[0];
type DetailTab = 'resumen' | 'graficas' | 'parametros' | 'historial';

// ─── Posiciones de cada tanque sobre la imagen de fondo (fondo_pc.png) ────
// Ajusta estos porcentajes (top/left) hasta que cada marcador quede
// exactamente encima del tanque físico correspondiente en tu imagen.
const TANK_POSITIONS: Record<string, { top: string; left: string }> = {
  F1: { top: '48%', left: '10%' },
  F2: { top: '48%', left: '26%' },
  F3: { top: '48%', left: '42%' },
  F4: { top: '48%', left: '58%' },
  F5: { top: '48%', left: '74%' },
  F6: { top: '48%', left: '90%' },
};

interface HomeProps {
  micState: MicState;
  onMic: () => void;
  onNavigate: (screen: Screen) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  mode: SystemMode;
  onToggleMode: () => void;
}

export function Home({
  micState,
  onMic,
  onNavigate,
  soundEnabled,
  onToggleSound,
  mode,
  onToggleMode,
}: HomeProps) {
  const [selected, setSelected] = useState<Tank | null>(null);
  const [tab, setTab] = useState<DetailTab>('resumen');

  return (
    <div className="relative min-h-screen w-full">
      {/* ─── BARRA SUPERIOR MÍNIMA (no tapa el fondo) ─── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
        <div className="glass px-3 py-1.5 rounded-xl flex items-center gap-2">
          <span className="live-dot" />
          <div className="leading-tight">
            <p className="text-xs font-bold text-cyan-400 font-mono tracking-wider">J.A.R.B.E.E.R.</p>
            <p className="text-[8px] text-gray-500 font-mono tracking-widest">AI CORE ONLINE</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            className="glass p-2 rounded-xl text-gray-400 hover:text-cyan-400 transition-all"
            title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          <button
            onClick={onToggleMode}
            className={`glass p-2 rounded-xl transition-all ${
              mode === 'bunker' ? 'text-amber-400' : 'text-cyan-400'
            }`}
            title={mode === 'bunker' ? 'Modo Bunker (offline)' : 'Modo Online'}
          >
            {mode === 'bunker' ? <Shield size={14} /> : <Wifi size={14} />}
          </button>

          <button
            onClick={() => onNavigate('assistant')}
            className="glass p-2 rounded-xl text-gray-400 hover:text-amber-400 transition-all"
            title="Abrir asistente"
          >
            <Zap size={14} />
          </button>

          <button
            onClick={onMic}
            className={`glass p-2 rounded-xl transition-all ${
              micState === 'listening'
                ? 'text-red-400'
                : micState === 'processing'
                ? 'text-amber-400'
                : micState === 'responding'
                ? 'text-cyan-400'
                : 'text-gray-400'
            }`}
            title="Hablar con J.A.R.B.E.E.R."
          >
            <Mic size={14} className={micState === 'listening' ? 'animate-pulse' : ''} />
          </button>
        </div>
      </div>

      {/* ─── MARCADORES DE TANQUES SOBRE EL FONDO (solo datos básicos) ─── */}
      {TANKS.map((tank, i) => (
        <TankMarker
          key={tank.id}
          tank={tank}
          position={TANK_POSITIONS[tank.id]}
          delay={i * 0.05}
          onClick={() => setSelected(tank)}
        />
      ))}

      {/* ─── DETALLE DEL TANQUE SELECCIONADO (ventana flotante / modal) ─── */}
      <AnimatePresence>
        {selected && (
          <TankDetail
            tank={selected}
            tab={tab}
            setTab={setTab}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      {/* ─── PANEL INFERIOR: CURVA + RECOMENDACIÓN (sobre el fondo, con cristal) ─── */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-col md:flex-row gap-3">
        <div className="glass p-4 rounded-xl flex-1">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-mono text-cyan-400 tracking-wider flex items-center gap-2">
              <Beaker size={14} />
              CURVA DE FERMENTACIÓN
            </h3>
            <div className="flex gap-4 text-[10px]">
              <span className="text-amber-400">● Temperatura (°C)</span>
              <span className="text-cyan-400">● Densidad (SG)</span>
            </div>
          </div>
          <FermentationChart />
        </div>

        <div className="glass p-4 rounded-xl border border-amber-500/10 md:max-w-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
              <Zap size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-amber-400 tracking-wider">RECOMENDACIÓN DE J.A.R.B.E.E.R.</p>
              <p className="text-sm text-gray-300 mt-1">
                Mantener la temperatura actual. La densidad está en el rango óptimo. Vigilar pH durante las próximas 24h.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TANK MARKER ────────────────────────────────────────────────────────────
// Marcador mínimo y semitransparente: solo ID + % de fermentación.
// Al hacer clic, abre el modal TankDetail con toda la información.
function TankMarker({
  tank,
  position,
  delay,
  onClick,
}: {
  tank: Tank;
  position: { top: string; left: string };
  delay: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="absolute z-10 flex flex-col items-center gap-1 glass px-2 py-1.5 rounded-xl"
      style={{ top: position.top, left: position.left, transform: 'translate(-50%, -50%)' }}
    >
      <TankSVG progress={tank.fermentation} size={30} />
      <div className="text-center leading-tight">
        <p className="text-[10px] font-bold text-amber-400">{tank.id}</p>
        <p className="text-[8px] text-gray-400 font-mono">{tank.fermentation}%</p>
      </div>
    </motion.button>
  );
}

// ─── TANK SVG ──────────────────────────────────────────────────────────────
function TankSVG({ progress, size }: { progress: number; size: number }) {
  const fillHeight = (progress / 100) * size * 0.6;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs>
        <linearGradient id="beerGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8A040" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#A8651E" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {/* Cuerpo del tanque */}
      <rect x="15" y="10" width="30" height="35" rx="2" fill="none" stroke="#FFAA00" strokeWidth="1.5" opacity="0.6" />
      {/* Líquido */}
      <rect x="16" y={10 + 35 - fillHeight} width="28" height={fillHeight} fill="url(#beerGrad)" rx="1" opacity="0.7" />
      {/* Cono inferior */}
      <path d="M 15 45 L 45 45 L 30 55 Z" fill="none" stroke="#FFAA00" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

// ─── TANK DETAIL (modal) ────────────────────────────────────────────────────
function TankDetail({
  tank,
  tab,
  setTab,
  onClose,
}: {
  tank: Tank;
  tab: DetailTab;
  setTab: (t: DetailTab) => void;
  onClose: () => void;
}) {
  const TABS = [
    { id: 'resumen', label: 'RESUMEN' },
    { id: 'graficas', label: 'GRÁFICAS' },
    { id: 'parametros', label: 'PARÁMETROS' },
    { id: 'historial', label: 'HISTORIAL' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="glass rounded-2xl p-5 w-full max-w-md max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-lg font-bold text-amber-400">{tank.id}</p>
            <p className="text-[10px] text-gray-500 font-mono">DETALLE DE FERMENTACIÓN</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-gray-800 pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as DetailTab)}
              className={`px-3 py-1 text-[10px] font-mono tracking-wider rounded transition-all ${
                tab === t.id
                  ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'resumen' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-light p-3 text-center">
                <p className="text-[8px] text-gray-600 font-mono">ESTADO ACTUAL</p>
                <p className="text-lg font-bold text-green-400">ACTIVO</p>
                <p className="text-2xl font-bold text-amber-400">{tank.fermentation}%</p>
              </div>
              <div className="glass-light p-3 text-center">
                <p className="text-[8px] text-gray-600 font-mono">PREDICCIÓN IA</p>
                <p className="text-sm text-gray-300">Finaliza en</p>
                <p className="text-xl font-bold text-amber-400">{tank.timeLeft}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <ParamBox label="Temperatura" value={`${tank.temp}°C`} range="18.0-19.0°C" color="#FFAA00" />
              <ParamBox label="Densidad (SG)" value={tank.sg.toFixed(3)} range="Objetivo: 1.010-1.012" color="#00e1ff" />
              <ParamBox label="pH Actual" value={tank.ph.toFixed(2)} range="Rango: 4.20-4.60" color="#34d399" />
            </div>

            <div className="glass-light p-3">
              <p className="text-[10px] font-mono text-amber-400 tracking-wider flex items-center gap-2">
                <Activity size={12} />
                RECOMENDACIÓN
              </p>
              <p className="text-sm text-gray-300 mt-1">
                Mantener la temperatura actual. La densidad está en el rango óptimo. Vigilar pH durante las próximas 24h.
              </p>
            </div>
          </div>
        )}

        {tab === 'graficas' && (
          <div className="space-y-4">
            <div className="glass-light p-4">
              <p className="text-[10px] font-mono text-gray-500 tracking-wider mb-3">CURVA DE FERMENTACIÓN</p>
              <FermentationChart />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-light p-3 text-center">
                <p className="text-[8px] text-gray-600">DENSIDAD FINAL EST.</p>
                <p className="text-xl font-bold text-cyan-400">{(tank.sg - 0.037).toFixed(3)} SG</p>
              </div>
              <div className="glass-light p-3 text-center">
                <p className="text-[8px] text-gray-600">TIEMPO RESTANTE</p>
                <p className="text-xl font-bold text-amber-400">{tank.timeLeft}</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'parametros' && (
          <div className="space-y-2">
            {[
              { label: 'Temperatura actual', value: `${tank.temp}°C`, detail: 'Óptimo: 18.0-19.0°C' },
              { label: 'Densidad (SG)', value: tank.sg.toFixed(3), detail: 'Objetivo: 1.010-1.012' },
              { label: 'pH', value: tank.ph.toFixed(2), detail: 'Rango: 4.20-4.60' },
              { label: 'Fermentación', value: `${tank.fermentation}%`, detail: 'Etapa activa' },
              { label: 'Lote', value: tank.batch, detail: tank.recipe },
            ].map((p) => (
              <div key={p.label} className="flex justify-between items-center glass-light px-4 py-2">
                <span className="text-[10px] text-gray-600 font-mono">{p.label}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">{p.value}</span>
                  <p className="text-[8px] text-gray-700">{p.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'historial' && (
          <div className="space-y-2">
            {[
              { event: 'Lectura °Plato: 8.2°P', time: 'Hoy 08:30', user: 'Ciccio' },
              { event: 'Temperatura ajustada a 18.7°C', time: 'Ayer 16:00', user: 'Sistema' },
              { event: 'Muestra tomada para análisis pH', time: 'Ayer 09:15', user: 'Ciccio' },
              { event: 'Lote 26-019 transferido a F3', time: '3 días', user: 'Ciccio' },
              { event: 'Levadura inoculada. Inicio fermentación', time: '4 días', user: 'Sistema' },
            ].map((h, i) => (
              <div key={i} className="flex items-start gap-3 glass-light px-4 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" />
                <div>
                  <p className="text-xs text-white">{h.event}</p>
                  <p className="text-[8px] text-gray-600 font-mono">{h.time} · {h.user}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <button className="w-full mt-4 py-2 glass-light text-sm font-mono text-amber-400 tracking-wider hover:bg-amber-500/10 transition-all">
          HABLAR CON J.A.R.B.E.E.R.
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── PARAM BOX ─────────────────────────────────────────────────────────────
function ParamBox({ label, value, range, color }: { label: string; value: string; range: string; color: string }) {
  return (
    <div className="glass-light p-3 text-center">
      <p className="text-[8px] text-gray-600 font-mono uppercase">{label}</p>
      <p className="text-sm font-bold" style={{ color }}>{value}</p>
      <p className="text-[7px] text-gray-700">{range}</p>
    </div>
  );
}

// ─── FERMENTATION CHART (SVG) ─────────────────────────────────────────────
function FermentationChart() {
  const W = 600, H = 150;
  const data = [
    { day: 0, temp: 19.0, sg: 1.080 },
    { day: 2, temp: 19.5, sg: 1.073 },
    { day: 4, temp: 19.8, sg: 1.066 },
    { day: 6, temp: 19.5, sg: 1.060 },
    { day: 8, temp: 19.0, sg: 1.054 },
    { day: 10, temp: 18.5, sg: 1.050 },
    { day: 12, temp: 18.0, sg: 1.047 },
    { day: 14, temp: 17.5, sg: 1.043 },
    { day: 16, temp: 17.0, sg: 1.040 },
    { day: 18, temp: 16.5, sg: 1.037 },
    { day: 20, temp: 16.0, sg: 1.011 },
  ];

  const maxTemp = 20.5, minTemp = 15.5;
  const maxSg = 1.085, minSg = 1.000;
  const pad = { top: 15, right: 30, bottom: 25, left: 30 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const x = (d: number) => pad.left + (d / 20) * chartW;
  const yTemp = (t: number) => pad.top + chartH - ((t - minTemp) / (maxTemp - minTemp)) * chartH;
  const ySg = (s: number) => pad.top + chartH - ((s - minSg) / (maxSg - minSg)) * chartH;

  const tempPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(d.day)},${yTemp(d.temp)}`).join(' ');
  const sgPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(d.day)},${ySg(d.sg)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
      {/* Grid */}
      {[0, 5, 10, 15, 20].map((d) => (
        <line key={d} x1={x(d)} y1={pad.top} x2={x(d)} y2={pad.top + chartH} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      ))}
      <line x1={pad.left} y1={pad.top + chartH} x2={W - pad.right} y2={pad.top + chartH} stroke="rgba(255,255,255,0.05)" />

      {/* Líneas */}
      <path d={tempPath} fill="none" stroke="#FFAA00" strokeWidth="2" />
      <path d={sgPath} fill="none" stroke="#00e1ff" strokeWidth="1.5" strokeDasharray="4 2" />

      {/* Puntos */}
      {data.map((d, i) => (
        <circle key={i} cx={x(d.day)} cy={yTemp(d.temp)} r="2.5" fill="#FFAA00" />
      ))}
      {data.map((d, i) => (
        <circle key={i} cx={x(d.day)} cy={ySg(d.sg)} r="2" fill="#00e1ff" opacity="0.8" />
      ))}

      {/* Etiquetas eje X */}
      {[0, 5, 10, 15, 20].map((d) => (
        <text key={d} x={x(d)} y={pad.top + chartH + 14} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.2)">{d}</text>
      ))}
      <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.15)" fontFamily="monospace">DÍAS</text>

      {/* Leyenda */}
      <text x={pad.left} y={10} fontSize="7" fill="#FFAA00">● Temperatura</text>
      <text x={pad.left + 80} y={10} fontSize="7" fill="#00e1ff">● Densidad</text>
    </svg>
  );
}
