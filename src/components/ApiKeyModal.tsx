import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Save, X, CheckCircle2 } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}

export function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('GEMINI_API_KEY');
      if (stored) setApiKey(stored);
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
    setSaved(true);
    onSave(apiKey.trim());
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md"
          >
            <GlassCard className="p-6 shadow-2xl" corners>
              <button 
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.2)', color: '#FFAA00' }}
                >
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Configurar API Key</h3>
                  <p className="font-sans text-xs text-gray-400 mt-0.5">Se requiere clave para el modo ONLINE</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="font-sans text-sm text-gray-300">
                  Para utilizar el núcleo de IA avanzado (Gemini) necesitas configurar tu API Key. Si no tienes una, puedes usar el modo BÚNKER (offline).
                </p>
                
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="GEMINI_API_KEY"
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-[#FFAA00]/50 transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  autoFocus
                />

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!apiKey.trim()}
                    className="flex items-center gap-2 rounded-lg px-6 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
