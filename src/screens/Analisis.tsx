import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, CheckCircle2 } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { GlassCard } from '../components/GlassCard';
import { useRegistros } from '../lib/registrosState';

export function Analisis() {
  const { registrosProduccion, registrosFermentacion } = useRegistros();
  const [selectedBatchId, setSelectedBatchId] = useState(registrosProduccion[0]?.id || '26001');

  const batch = registrosProduccion.find(r => r.id === selectedBatchId) || registrosProduccion[0];
  const fermentation = registrosFermentacion[selectedBatchId] || { lecturas: [] };

  return (
    <div className="flex min-h-full flex-col pb-32 px-4 space-y-6">
      <ScreenHeader
        title="Análisis y Curvas de Fermentación"
        subtitle="Métricas avanzadas conectadas a RegistrosProvider"
      />

      {/* Selector de Lotes */}
      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {registrosProduccion.map((b) => {
          const isSelected = b.id === selectedBatchId;
          return (
            <button
              key={b.id}
              onClick={() => setSelectedBatchId(b.id)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#00e1ff]/15 border border-[#00e1ff]/40 text-[#00e1ff]'
                  : 'bg-slate-900/40 border border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <BarChart2 size={14} />
              <span className="font-display text-xs font-bold">Lote {b.batch}</span>
              <span className="font-mono text-[10px] opacity-75">({b.recipe})</span>
            </button>
          );
        })}
      </div>

      {batch && (
        <GlassCard className="p-6 space-y-6" corners delay={0.05}>
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#00e1ff] bg-[#00e1ff]/10 px-2.5 py-1 rounded-full border border-[#00e1ff]/20">
                Análisis en Vivo
              </span>
              <h2 className="font-display text-xl font-bold text-white mt-2">
                Lote {batch.batch} - {batch.recipe}
              </h2>
            </div>
            <div className="text-right font-mono text-xs text-gray-400">
              Maestro: <span className="text-white">{batch.brewer}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
              <p className="font-mono text-[10px] text-gray-400 uppercase">Temperatura Actual</p>
              <p className="font-display text-xl font-bold text-[#FFAA00] mt-1">{batch.currentTemp} °C</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
              <p className="font-mono text-[10px] text-gray-400 uppercase">Grados Plato</p>
              <p className="font-display text-xl font-bold text-[#FFD060] mt-1">{batch.plato} °P</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
              <p className="font-mono text-[10px] text-gray-400 uppercase">pH</p>
              <p className="font-display text-xl font-bold text-[#00e1ff] mt-1">{batch.ph}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-gray-400">Historial Registrado:</p>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {fermentation.lecturas?.length > 0 ? (
                fermentation.lecturas.map((lec: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-white/5 font-mono text-xs">
                    <span className="text-gray-400">🕒 {lec.fecha || `Control ${idx + 1}`}</span>
                    <span className="text-[#FFD060]">Plato: {lec.plato}°P</span>
                    <span className="text-[#FFAA00]">Temp: {lec.temp}°C</span>
                    <span className="text-[#00e1ff]">pH: {lec.ph}</span>
                  </div>
                ))
              ) : (
                <p className="font-mono text-xs text-gray-500 text-center py-6 bg-slate-950/40 rounded-xl">
                  No hay lecturas adicionales registradas para este lote.
                </p>
              )}
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
