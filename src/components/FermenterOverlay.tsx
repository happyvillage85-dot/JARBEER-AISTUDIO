import { motion } from 'framer-motion';
import type { BatchRecord } from '../data/plantillasBeer';

interface FermenterOverlayProps {
  id: string;
  lote: BatchRecord | null;
  position: { top: string; left: string };
  onClick: () => void;
}

export function FermenterOverlay({
  id,
  lote,
  position,
  onClick,
}: FermenterOverlayProps) {
  const isActive = lote !== null;
  const terminado = isActive && lote.stage === 'Finalizado';
  const neonColor = isActive ? '#00e1ff' : '#34d399';
  const glowColor = isActive ? 'rgba(0,225,255,0.6)' : 'rgba(52,211,153,0.6)';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="absolute cursor-pointer select-none"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translate(-50%, -50%)',
        color: neonColor,
        textShadow: `0 0 20px ${glowColor}, 0 0 60px ${glowColor}`,
      }}
      onClick={onClick}
    >
      <div className="flex flex-col items-center font-mono">
        <span className="text-2xl font-bold tracking-widest">{id}</span>
        {isActive && (
          <div className="mt-1 flex flex-col items-center gap-0.5 text-xs font-light tracking-wider">
            <span>{lote.currentTemp} °C</span>
            {terminado ? (
              <span>ABV {lote.abv}%</span>
            ) : (
              <>
                <span>{lote.plato} °P</span>
                <span>pH {lote.ph}</span>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
