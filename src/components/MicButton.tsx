import { motion, AnimatePresence } from 'framer-motion';
import { Mic } from 'lucide-react';

export type MicState = 'idle' | 'listening' | 'processing' | 'responding';

const LABELS: Record<MicState, string> = {
  idle: 'Pulsar para hablar', listening: 'Escuchando...', processing: 'Procesando...', responding: 'Respondiendo...',
};

export function MicButton({ state, onPress, size='normal' }: {
  state: MicState; onPress: () => void; size?: 'normal'|'large';
}) {
  const isActive    = state !== 'idle';
  const isRespond   = state === 'responding';
  const isListen    = state === 'listening';
  const btnSize     = size === 'large' ? 68 : 54;
  const iconSize    = size === 'large' ? 26 : 21;
  const color       = isRespond ? '#FFAA00' : isActive ? '#00e1ff' : 'rgba(100,128,150,0.75)';
  const bg          = isRespond ? 'rgba(255,170,0,0.1)' : isActive ? 'rgba(0,225,255,0.09)' : 'rgba(13,24,36,0.8)';
  const border      = isRespond ? 'rgba(255,170,0,0.45)' : isActive ? 'rgba(0,225,255,0.38)' : 'rgba(255,255,255,0.1)';

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative flex items-center justify-center">
        <AnimatePresence>
          {isActive && [0,0.5,1].map(delay => (
            <motion.div key={delay} className="absolute rounded-full"
              style={{ width:btnSize+18, height:btnSize+18, border:`1px solid ${isRespond?'rgba(255,170,0,0.35)':'rgba(0,225,255,0.3)'}` }}
              initial={{ scale:1, opacity:0.55 }} animate={{ scale:1.85, opacity:0 }} exit={{ opacity:0 }}
              transition={{ duration:1.9, repeat:Infinity, ease:'easeOut', delay }}
            />
          ))}
        </AnimatePresence>
        <motion.button
          onClick={onPress} disabled={isActive}
          whileTap={{ scale:0.92 }}
          animate={{ scale: isListen ? [1,1.05,1] : 1 }}
          transition={isListen ? { duration:0.75, repeat:Infinity } : { duration:0.14 }}
          style={{ width:btnSize, height:btnSize, background:bg, border:`1px solid ${border}`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:isActive?'default':'pointer', boxShadow:isActive?`0 0 28px ${isRespond?'rgba(255,170,0,0.28)':'rgba(0,225,255,0.22)'}`:undefined, transition:'background 0.3s,border-color 0.3s,box-shadow 0.3s' }}
          aria-label={LABELS[state]}
        >
          {state === 'processing'
            ? <motion.div className="h-5 w-5 rounded-full border-2" style={{ borderColor:'#00e1ff', borderTopColor:'transparent' }} animate={{ rotate:360 }} transition={{ duration:0.7, repeat:Infinity, ease:'linear' }} />
            : <Mic size={iconSize} strokeWidth={1.8} style={{ color, filter:isActive?`drop-shadow(0 0 7px ${color})`:'none', transition:'color 0.3s,filter 0.3s' }} />
          }
        </motion.button>
      </div>
      <AnimatePresence mode="wait">
        <motion.span key={state}
          initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }}
          transition={{ duration:0.22 }}
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color: isActive ? color : 'rgba(74,96,112,0.55)' }}
        >
          {LABELS[state]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
