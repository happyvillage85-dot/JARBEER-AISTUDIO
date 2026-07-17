import { motion } from 'framer-motion';
import { BookOpen, Clock, Droplets, Thermometer, ChevronRight } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { GlassCard } from '../components/GlassCard';
import { BATCHES } from '../data/mockData';

const RECETAS = BATCHES.map((b, i) => ({
  id: `R-${String(i + 1).padStart(2, '0')}`,
  name: b.recipe,
  batch: b.batch,
  plato: b.plato,
  ph: b.ph,
  temp: b.currentTemp,
  og: b.og,
  fg: b.fg,
  abv: b.abv,
  ibu: b.ibu,
  ebc: b.ebc,
  stage: b.stage,
}));

export function Recetas() {
  return (
    <div className="flex min-h-full flex-col pb-32">
      <ScreenHeader title="Recetas" subtitle={`${RECETAS.length} recetas disponibles`} />
      <div className="space-y-3 px-4">
        {RECETAS.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + i * 0.06 }}>
            <GlassCard className="p-4" corners delay={0.06 + i * 0.06}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: 'rgba(255,170,0,0.08)', border: '1px solid rgba(255,170,0,0.22)', color: '#FFAA00' }}
                  ><BookOpen size={16} /></div>
                  <div>
                    <p className="font-display text-sm font-bold text-white">{r.name}</p>
                    <p className="font-mono text-[10px]" style={{ color: 'rgba(74,96,112,0.7)' }}>{r.id} · Lote {r.batch} · {r.stage}</p>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'rgba(74,96,112,0.4)' }} />
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                <Mini label="°Plato" value={`${r.plato}°P`} />
                <Mini label="pH" value={r.ph.toFixed(2)} />
                <Mini label="ABV" value={`${r.abv}%`} />
                <Mini label="IBU" value={String(r.ibu)} />
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="font-mono text-[8px] uppercase tracking-wider" style={{ color: 'rgba(74,96,112,0.6)' }}>{label}</p>
      <p className="font-display text-sm font-bold text-white">{value}</p>
    </div>
  );
}
