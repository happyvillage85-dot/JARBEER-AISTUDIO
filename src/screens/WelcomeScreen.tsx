import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectUser: (name: string) => void;
}

const USERS = ['Juanfran', 'Gabi', 'Diego', 'Ciccio', 'Invitado'];

export function WelcomeScreen({ onSelectUser }: WelcomeScreenProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (name: string) => {
    setSelected(name);
    try {
      localStorage.setItem('jarbeer_user', name);
    } catch {
      // noop
    }
    setTimeout(() => onSelectUser(name), 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8"
      style={{ background: '#020408' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-12 text-center"
      >
        <h1 className="font-display text-3xl font-black tracking-[0.1em] text-white">
          Bienvenido a J.A.R.B.E.E.R.
        </h1>
        <p className="mt-2 font-mono text-sm" style={{ color: 'rgba(0,225,255,0.6)' }}>
          La inteligencia para la cerveza artesanal.
        </p>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em]" style={{ color: 'rgba(74,96,112,0.7)' }}>
          ¿Quién utilizará el sistema?
        </p>
      </motion.div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <AnimatePresence>
          {USERS.map((name, idx) => (
            <motion.button
              key={name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.08 }}
              onClick={() => handleSelect(name)}
              disabled={selected !== null}
              className="flex items-center justify-between rounded-lg px-5 py-3 font-mono text-sm text-white transition-all"
              style={{
                background: selected === name ? 'rgba(0,225,255,0.15)' : 'rgba(13,24,36,0.6)',
                border: selected === name ? '1px solid rgba(0,225,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {name}
              <ChevronRight size={16} style={{ color: 'rgba(0,225,255,0.6)' }} />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}