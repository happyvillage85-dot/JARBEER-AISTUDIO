import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Bell, CheckCircle2, Clock, Key, Save } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { GlassCard } from '../components/GlassCard';
import { haptics } from '../lib/haptics';

const ALERTAS = [
  { id: 1, level: 'warning', title: 'F-04 · Temperatura elevada', desc: 'Stout a 22°C — rango objetivo 18-20°C', time: 'Hace 12 min' },
  { id: 2, level: 'info',    title: 'F-01 · Fermentación al 68%',  desc: 'Golden Ale en curso, 4d 12h restantes', time: 'Hace 1h' },
  { id: 3, level: 'success', title: 'F-04 · °Plato estable',       desc: 'Lectura estable durante 6h consecutivas', time: 'Hace 2h' },
  { id: 4, level: 'info',    title: 'F-06 · Inicio de fermentación', desc: 'Lager inoculada, levadura W-34/70', time: 'Hace 5h' },
  { id: 5, level: 'warning', title: 'F-02 · pH ligeramente bajo',  desc: 'IPA a pH 5.18 — revisar en 24h', time: 'Hace 6h' },
];

const STYLES = {
  warning: { color: '#FA6A00', bg: 'rgba(250,106,0,0.06)', border: 'rgba(250,106,0,0.18)', icon: AlertTriangle },
  info:    { color: '#00e1ff', bg: 'rgba(0,225,255,0.04)', border: 'rgba(0,225,255,0.12)', icon: Bell },
  success: { color: '#34d399', bg: 'rgba(52,211,153,0.04)', border: 'rgba(52,211,153,0.12)', icon: CheckCircle2 },
};

export function Alertas() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('GEMINI_API_KEY');
    if (stored) setApiKey(stored);
  }, []);

  const handleSave = () => {
    localStorage.setItem('GEMINI_API_KEY', apiKey);
    setSaved(true);
    haptics.success();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex min-h-full flex-col pb-32">
      <ScreenHeader title="Ajustes y Alertas" subtitle="Configuración del sistema y notificaciones" />
      
      <div className="space-y-6 px-4">
        {/* API Key Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <GlassCard className="p-5" corners>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'rgba(255,170,0,0.06)', border: '1px solid rgba(255,170,0,0.18)', color: '#FFAA00' }}
              >
                <Key size={18} />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white">Núcleo de Inteligencia (Gemini)</h3>
                <p className="font-sans text-xs text-gray-400 mt-0.5">Configura la clave API para el modo ONLINE.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Introduce tu GEMINI_API_KEY"
                className="w-full flex-1 rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-[#FFAA00]/50 transition-colors"
              />
              <button
                onClick={handleSave}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-all"
                style={{
                  background: saved ? 'rgba(52,211,153,0.1)' : 'rgba(255,170,0,0.1)',
                  border: saved ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,170,0,0.3)',
                  color: saved ? '#34d399' : '#FFAA00'
                }}
              >
                {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                {saved ? 'Guardada' : 'Guardar'}
              </button>
            </div>
            <p className="font-sans text-[10px] text-gray-500 mt-3 flex items-center gap-1.5">
              <AlertTriangle size={10} /> Esta clave se guarda localmente en tu navegador para interactuar con la IA de la planta.
            </p>
          </GlassCard>
        </motion.div>

        {/* Separator */}
        <div className="flex items-center gap-3 pt-2 pb-1">
          <div className="flex-1 h-px bg-white/5" />
          <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Alertas Activas</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {ALERTAS.map((a, i) => {
            const s = STYLES[a.level as keyof typeof STYLES];
            const Icon = s.icon;
            return (
              <motion.div key={a.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
                <GlassCard className="p-4" corners delay={0.1 + i * 0.06}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
                    ><Icon size={16} /></div>
                    <div className="flex-1">
                      <p className="font-display text-sm font-bold text-white">{a.title}</p>
                      <p className="mt-0.5 font-sans text-xs leading-relaxed" style={{ color: 'rgba(180,200,216,0.8)' }}>{a.desc}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <Clock size={10} style={{ color: 'rgba(74,96,112,0.5)' }} />
                        <span className="font-mono text-[9px]" style={{ color: 'rgba(74,96,112,0.6)' }}>{a.time}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
