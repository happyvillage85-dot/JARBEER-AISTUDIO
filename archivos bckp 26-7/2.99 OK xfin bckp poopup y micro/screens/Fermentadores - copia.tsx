import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Droplets, FlaskConical, Clock, Cpu, X, Activity, Beaker } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
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
          style={{ background: '#34d399', boxShadow: '0 0 6px rgba(52,211,153,0.7)', animation: 'live-pulse 2s ease-in-out infinite' }}
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

      {/* Glow behind tank */}
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

      {/* Beer fill */}
      {!vacio && (
        <rect
          x={bodyLeft}
          y={beerLevel}
          width={bodyW}
          height={beerHeight + coneH * 0.5}
          fill={`url(#beer-a-${size})`}
        />
      )}

      {/* Tank body outline */}
      <path
        d={`M ${bodyLeft} ${bodyTop} L ${bodyRight} ${bodyTop} L ${bodyRight} ${bodyBottom} L ${cx + bodyW * 0.2} ${coneBottom} L ${cx - bodyW * 0.2} ${coneBottom} L ${bodyLeft} ${bodyBottom} Z`}
        fill="none"
        stroke={vacio ? 'rgba(74,96,112,0.3)' : '#FFAA00'}
        strokeWidth="1.5"
        filter={vacio ? undefined : `url(#glow-a-${size})`}
        opacity={vacio ? 0.5 : 0.9}
      />

      {/* Top cap */}
      <ellipse
        cx={cx} cy={bodyTop}
        rx={bodyW * 0.35} ry={size * 0.02}
        fill={vacio ? 'rgba(74,96,112,0.1)' : 'rgba(255,200,80,0.15)'}
        stroke={vacio ? 'rgba(74,96,112,0.3)' : '#FFD060'}
        strokeWidth="1.2"
      />

      {/* Bottom valve */}
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
          {/* Header */}
          <div className="mb-5 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl font-display text-base font-bold"
                style={{
                  background: vacio ? 'rgba(74,96,112,0.08)' : 'rgba(255,170,0,0.08)',
                  border: vacio ? '1px solid rgba(74,96,112,0.15)' : '1px solid rgba(255,170,0,0.22)',
                  color: vacio ? 'rgba(74,96,112,0.6)' : '#FFAA00',
                }}
              >{f.id}</div>
              <div>
                <p className="font-display text-xl font-bold text-white">{f.recipe}</p>
                <p className="font-mono text-xs" style={{ color: 'rgba(74,96,112,0.7)' }}>
                  {vacio ? 'Sin lote asignado' : `Lote ${f.batch}`}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 transition-colors hover:bg-white/10">
              <X size={20} style={{ color: 'rgba(232,240,248,0.6)' }} />
            </button>
          </div>

          {vacio ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Beaker size={40} style={{ color: 'rgba(74,96,112,0.4)' }} />
              <p className="font-display text-sm" style={{ color: 'rgba(232,240,248,0.5)' }}>
                Este fermentador está vacío y disponible para un nuevo lote.
              </p>
            </div>
          ) : (
            <>
              {/* Status badge */}
              <div className="mb-4 flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider"
                  style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)', color: '#34d399' }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#34d399', animation: 'live-pulse 2s ease-in-out infinite' }} />Activo
                </span>
                <span className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider"
                  style={{ background: 'rgba(0,225,255,0.08)', border: '1px solid rgba(0,225,255,0.18)', color: '#00e1ff' }}>
                  <Cpu size={11} /> IA: estable
                </span>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-3 gap-3">
                <DetailMetric icon={<Thermometer size={14} />} label="Temperatura" value={`${f.temp}°C`} color="#FFAA00" />
                <DetailMetric icon={<Droplets size={14} />} label="°Plato" value={`${f.plato}°P`} color="#FFD060" highlight />
                <DetailMetric icon={<FlaskConical size={14} />} label="pH" value={f.ph.toFixed(2)} color="#00e1ff" />
              </div>

              {/* Progress bar */}
              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'rgba(74,96,112,0.6)' }}>Fermentación</span>
                  <span className="font-display text-sm font-bold" style={{ color: '#FFAA00' }}>{f.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg,#FFAA00,#FA6A00)' }}
                    initial={{ width: 0 }} animate={{ width: `${f.progress}%` }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              {/* Time + stage */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock size={14} style={{ color: 'rgba(74,96,112,0.6)' }} />
                  <span className="font-mono text-xs" style={{ color: 'rgba(232,240,248,0.7)' }}>{f.timeLeft} restantes</span>
                </div>
                {batchData && (
                  <div className="flex items-center gap-2">
                    <Activity size={14} style={{ color: 'rgba(0,225,255,0.5)' }} />
                    <span className="font-mono text-xs" style={{ color: 'rgba(232,240,248,0.7)' }}>{batchData.stage}</span>
                  </div>
                )}
              </div>

              {/* Batch details */}
              {batchData && (
                <div className="mt-5 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-wider" style={{ color: 'rgba(74,96,112,0.6)' }}>Datos del lote</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <DetailRow label="Volumen" value={`${batchData.volume} L`} />
                    <DetailRow label="ABV est." value={`${batchData.abv}%`} />
                    <DetailRow label="IBU" value={String(batchData.ibu)} />
                    <DetailRow label="EBC" value={String(batchData.ebc)} />
                    <DetailRow label="OG" value={String(batchData.og)} />
                    <DetailRow label="FG est." value={String(batchData.fg)} />
                    <DetailRow label="Levadura" value={batchData.levadura.name} />
                    <DetailRow label="Laboratorio" value={batchData.levadura.lab} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function DetailMetric({ icon, label, value, color, highlight }: {
  icon: React.ReactNode; label: string; value: string; color: string; highlight?: boolean;
}) {
  return (
    <div className="rounded-xl p-3 text-center"
      style={{
        background: highlight ? 'rgba(255,208,96,0.08)' : 'rgba(255,255,255,0.025)',
        border: highlight ? `1px solid rgba(255,208,96,0.25)` : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="mb-1 flex items-center justify-center gap-1.5">
        <span style={{ color, opacity: 0.6 }}>{icon}</span>
        <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'rgba(74,96,112,0.6)' }}>{label}</span>
      </div>
      <p className="font-display text-xl font-bold" style={{ color, textShadow: highlight ? `0 0 8px rgba(255,208,96,0.4)` : 'none' }}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'rgba(74,96,112,0.6)' }}>{label}</span>
      <span className="font-display text-xs font-medium text-white">{value}</span>
    </div>
  );
}

function RealtimeDashboard() {
  const [data, setData] = useState<any[]>([]);
  const ACTIVE_FERMENTERS = FERMENTADORES.filter(f => f.status === 'activo');
  const COLORS = ['#00e1ff', '#34d399', '#FFAA00', '#f43f5e'];

  useEffect(() => {
    // Initial history data
    const initial = [];
    const now = new Date();
    for (let i = 20; i >= 0; i--) {
      const dp: any = { time: new Date(now.getTime() - i * 2000).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }) };
      ACTIVE_FERMENTERS.forEach(f => {
        dp[`${f.id}_temp`] = +(f.temp + (Math.random() * 0.4 - 0.2)).toFixed(2);
        dp[`${f.id}_ph`] = +(f.ph + (Math.random() * 0.04 - 0.02)).toFixed(2);
      });
      initial.push(dp);
    }
    setData(initial);

    const interval = setInterval(() => {
      setData(prev => {
        const next = [...prev.slice(1)];
        const dp: any = { time: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }) };
        ACTIVE_FERMENTERS.forEach(f => {
          dp[`${f.id}_temp`] = +(f.temp + (Math.random() * 0.4 - 0.2)).toFixed(2);
          dp[`${f.id}_ph`] = +(f.ph + (Math.random() * 0.04 - 0.02)).toFixed(2);
        });
        next.push(dp);
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-6 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Temp chart */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(2,5,10,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 className="text-sm font-display font-bold text-gray-300 mb-4 flex items-center gap-2">
            <Thermometer size={16} className="text-orange-400" />
            Temperatura en Tiempo Real (°C)
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={10} tickMargin={8} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={['auto', 'auto']} />
                <RechartsTooltip 
                  contentStyle={{ background: 'rgba(2,5,10,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {ACTIVE_FERMENTERS.map((f, i) => (
                  <Line key={`temp-${f.id}`} type="monotone" dataKey={`${f.id}_temp`} name={`${f.id}`} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} isAnimationActive={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* pH chart */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(2,5,10,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 className="text-sm font-display font-bold text-gray-300 mb-4 flex items-center gap-2">
            <FlaskConical size={16} className="text-blue-400" />
            pH en Tiempo Real
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={10} tickMargin={8} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={['auto', 'auto']} />
                <RechartsTooltip 
                  contentStyle={{ background: 'rgba(2,5,10,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {ACTIVE_FERMENTERS.map((f, i) => (
                  <Line key={`ph-${f.id}`} type="monotone" dataKey={`${f.id}_ph`} name={`${f.id}`} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} isAnimationActive={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
