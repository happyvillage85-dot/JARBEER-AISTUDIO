import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { BatchRecord } from '../data/plantillasBeer';

interface BatchDetailsPanelProps {
  tankId: string | null;
  lote: BatchRecord | null;
  onClose: () => void;
  onOpenFicha: () => void;
  onOpenHistorico: () => void;
  onOpenDocumentos: () => void;
  onHablarIA: () => void;
}

export function BatchDetailsPanel({
  tankId,
  lote,
  onClose,
  onOpenFicha,
  onOpenHistorico,
  onOpenDocumentos,
  onHablarIA,
}: BatchDetailsPanelProps) {
  return (
    <AnimatePresence>
      {tankId && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-4 top-4 z-30 w-full max-w-sm rounded-3xl p-5"
          style={{ background: 'rgba(2,5,10,0.92)', border: '1px solid rgba(0,225,255,0.2)', backdropFilter: 'blur(10px)' }}
        >
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#00e1ff] bg-[#00e1ff]/10 px-2.5 py-1 rounded-full border border-[#00e1ff]/20">
                Detalle de Fermentación
              </span>
              <h2 className="font-display text-lg font-bold text-white mt-2">
                TQ-{tankId} {lote && <span className="text-gray-400 text-sm font-normal">({lote.recipe})</span>}
              </h2>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {!lote ? (
            <p className="font-mono text-xs text-zinc-400">Tanque disponible para un nuevo lote.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
                  <p className="font-mono text-[9px] text-gray-400 uppercase">Temperatura</p>
                  <p className="font-display text-lg font-bold text-[#FFAA00] mt-1">{lote.currentTemp}°C</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
                  <p className="font-mono text-[9px] text-gray-400 uppercase">°Plato</p>
                  <p className="font-display text-lg font-bold text-[#FFD060] mt-1">{lote.plato}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
                  <p className="font-mono text-[9px] text-gray-400 uppercase">pH Actual</p>
                  <p className="font-display text-lg font-bold text-[#00e1ff] mt-1">{lote.ph}</p>
                </div>
              </div>

              <div className="mb-5 space-y-2 font-mono text-xs text-zinc-300">
                <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                  <span>Lote:</span>
                  <span className="font-bold text-white">{lote.batch}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                  <span>ABV:</span>
                  <span className="font-bold text-white">{lote.abv}%</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                  <span>Estado:</span>
                  <span className="font-bold text-white">{lote.stage}</span>
                </div>
                {lote.observations && (
                  <p className="pt-1 text-[11px] text-zinc-400 leading-relaxed">{lote.observations}</p>
                )}
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button onClick={onOpenFicha} className="rounded-xl py-2 text-xs font-mono border border-[#00e1ff]/30 text-[#00e1ff] hover:bg-[#00e1ff]/10 transition-colors">
              Ficha de Producción
            </button>
            <button onClick={onOpenHistorico} className="rounded-xl py-2 text-xs font-mono border border-[#00e1ff]/30 text-[#00e1ff] hover:bg-[#00e1ff]/10 transition-colors">
              Histórico
            </button>
            <button onClick={onOpenDocumentos} className="rounded-xl py-2 text-xs font-mono border border-[#00e1ff]/30 text-[#00e1ff] hover:bg-[#00e1ff]/10 transition-colors">
              Documentos
            </button>
            <button onClick={onHablarIA} className="rounded-xl py-2 text-xs font-mono border border-[#FFAA00]/40 text-[#FFAA00] hover:bg-[#FFAA00]/10 transition-colors">
              Hablar con IA
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
