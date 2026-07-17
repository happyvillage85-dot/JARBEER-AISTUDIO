import { motion } from 'framer-motion';
import { AlertTriangle, Bell, CheckCircle2, Clock } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { GlassCard } from '../components/GlassCard';

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
  return (
    <div className="flex min-h-full flex-col pb-32">
      <ScreenHeader title="Alertas" subtitle="2 avisos · 3 informativas" />
      <div className="space-y-3 px-4">
        {ALERTAS.map((a, i) => {
          const s = STYLES[a.level as keyof typeof STYLES];
          const Icon = s.icon;
          return (
            <motion.div key={a.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 + i * 0.06 }}>
              <GlassCard className="p-4" corners delay={0.06 + i * 0.06}>
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
  );
}
