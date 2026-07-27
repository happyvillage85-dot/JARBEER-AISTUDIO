import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MessageSquare, Activity, FlaskConical, Clock, Cpu, 
  ChevronRight, Home as HomeIcon, BarChart3, FileText, 
  Settings, Users, AlertTriangle, Thermometer, Droplets,
  Gauge, Calendar, Zap, Beaker, Microscope, ClipboardList
} from 'lucide-react';

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

export function Home() {
  const [selected, setSelected] = useState<Tank | null>(null);
  const [tab, setTab] = useState<DetailTab>('resumen');

  return (
    <div className="min-h-screen bg-[#050a15] p-4 md:p-6">
      {/* ─── HEADER ─── */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 font-mono tracking-wider">
            J.A.R.B.E.E.R.
          </h1>
          <p className="text-xs text-gray-500 font-mono tracking-[0.2em]">
            Just A Real Brewing Engineering Expert Reasoner
          </p>
          <p className="text-[10px] text-amber-500 font-mono tracking-widest mt-1">
            FERMENTANDO SUEÑOS
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-green-400 font-mono flex items-center gap-2">
            <span className="live-dot" />
            AI CORE ONLINE
          </div>
          <p className="text-[10px] text-gray-600 font-mono">v1.0.0 BETA</p>
        </div>
      </div>

      {/* ─── TANQUES GRID (6 tanques) ─── */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-mono text-cyan-400 tracking-wider flex items-center gap-2">
            <Beaker size={14} />
            FERMENTADORES PRINCIPALES
          </h2>
          <span className="text-[10px] text-gray-600 font-mono">6 ACTIVOS</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {TANKS.map((tank, i) => (
            <TankCard
              key={tank.id}
              tank={tank}
              delay={i * 0.05}
              onClick={() => setSelected(tank)}
            />
          ))}
        </div>
      </div>

      {/* ─── DETALLE DEL TANQUE SELECCIONADO ─── */}
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

      {/* ─── CURVA DE FERMENTACIÓN (para F3 por defecto) ─── */}
      <div className="glass p-4 rounded-xl mt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-mono text-cyan-400 tracking-wider">CURVA DE FERMENTACIÓN</h3>
          <div className="flex gap-4 text-[10px]">
            <span className="text-amber-400">● Temperatura (°C)</span>
            <span className="text-cyan-400">● Densidad (SG)</span>
          </div>
        </div>
        <FermentationChart />
      </div>

      {/* ─── RECOMENDACIÓN IA ─── */}
      <div className="glass p-4 rounded-xl mt-4 border border-amber-500/10">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
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

      {/* ─── FOOTER ─── */}
      <div className="mt-6 flex justify-between text-[10px] text-gray-700 font-mono border-t border-gray-800/50 pt-3">
        <span>FÁBRICA: CERVECERÍA ARTESANAL PREMIUM</span>
        <span>LOTES ACTIVOS: 6</span>
        <span>CAPACIDAD UTILIZADA: 78%</span>
        <span>PRÓXIMA LIMPIEZA CIP: 12:45</span>
        <span>24°C</span>
        <span>55% HR</span>
      </div>
    </div>
  );
}

// ─── TANK CARD ──────────────────────────────────────────────────────────────
function TankCard({ tank, delay, onClick }: { tank: Tank; delay: number; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.95 }}
      className="glass p-3 rounded-xl text-center transition-all"
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-sm font-bold text-amber-400">{tank.id}</span>
        <span className="text-[8px] text-green-400 font-mono">ACTIVO</span>
      </div>
      
      <div className="flex justify-center my-2">
        <TankSVG progress={tank.fermentation} size={48} />
      </div>

      <div className="grid grid-cols-3 gap-1 text-[9px] font-mono">
        <div>
          <p className="text-gray-600">{tank.temp}°C</p>
          <p className="text-gray-700 text-[7px]">TEMP</p>
        </div>
        <div>
          <p className="text-cyan-400">{tank.sg.toFixed(3)}</p>
          <p className="text-gray-700 text-[7px]">SG</p>
        </div>
        <div>
          <p className="text-gray-300">{tank.ph.toFixed(2)}</p>
          <p className="text-gray-700 text-[7px]">pH</p>
        </div>
      </div>

      <div className="mt-2 text-[8px] text-gray-600 font-mono">
        {tank.kpi}
      </div>

      <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
          style={{ width: `${tank.fermentation}%` }}
        />
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
      <polygon points="18,45 30,52 42,45" fill="none" stroke="#FFAA00" strokeWidth="1.5" opacity="0.4" />
      {/* Tapa superior */}
      <ellipse cx="30" cy="10" rx="12" ry="2" fill="rgba(255,200,80,0.1)" stroke="#FFD060" strokeWidth="0.8" />
    </svg>
  );
}

// ─── TANK DETAIL (POPUP) ──────────────────────────────────────────────────
function TankDetail({ tank, tab, setTab, onClose }: {
  tank: Tank;
  tab: DetailTab;
  setTab: (t: DetailTab) => void;
  onClose: () => void;
}) {
  const tabs = [
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto glass p-6 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-amber-400">{tank.id}</h2>
            <p className="text-sm text-gray-500 font-mono">DETALLE DE FERMENTACIÓN</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-gray-800/50 pb-2">
          {tabs.map((t) => (
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
      <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.15) font-mono">DÍAS</text>

      {/* Leyenda */}
      <text x={pad.left} y={10} fontSize="7" fill="#FFAA00">● Temperatura</text>
      <text x={pad.left + 80} y={10} fontSize="7" fill="#00e1ff">● Densidad</text>
    </svg>
  );
}