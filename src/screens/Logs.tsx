import { motion } from 'framer-motion';
import { Activity, Clock, CheckCircle2 } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { GlassCard } from '../components/GlassCard';
import { useRegistros } from '../lib/registrosState';

export function Logs() {
  const { registrosProduccion, registrosFermentacion } = useRegistros();

  const logsList = registrosProduccion.map((batch) => {
    const ferm = registrosFermentacion[batch.id];
    const lastLectura = ferm?.lecturas?.[ferm.lecturas.length - 1];
    return {
      id: batch.id,
      batch: batch.batch,
      recipe: batch.recipe,
      stage: batch.stage,
      temp: lastLectura ? lastLectura.temp : batch.currentTemp,
      plato: lastLectura ? lastLectura.plato : batch.plato,
      ph: lastLectura ? lastLectura.ph : batch.ph,
      timestamp: 'Sincronizado en tiempo real'
    };
  });

  return (
    <div className="flex min-h-full flex-col pb-32 px-4 space-y-6">
      <ScreenHeader
        title="Historial de Logs y Controles"
        subtitle="Registro de lecturas y eventos de lotes desde RegistrosProvider"
      />

      <div className="space-y-3">
        {logsList.map((log) => (
          <GlassCard key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4" corners delay={0.03}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#00e1ff]/10 border border-[#00e1ff]/20 text-[#00e1ff]">
                <Activity size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-bold text-white">Lote {log.batch}</span>
                  <span className="font-mono text-[10px] text-[#00e1ff] bg-[#00e1ff]/10 px-2 py-0.5 rounded border border-[#00e1ff]/20">
                    {log.recipe}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-gray-400 mt-0.5">
                  Estado: {log.stage} • {log.timestamp}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 font-mono text-xs">
              <div className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-white/5 text-[#FFAA00]">
                🌡️ {log.temp}°C
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-white/5 text-[#FFD060]">
                📊 {log.plato}°P
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-white/5 text-[#00e1ff]">
                🧪 {log.ph} pH
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
