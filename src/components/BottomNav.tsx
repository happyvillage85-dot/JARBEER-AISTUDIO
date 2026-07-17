import { motion } from 'framer-motion';
import { Home, FlaskConical, BookOpen, Bell, BarChart3, MessageSquare } from 'lucide-react';
import type { Screen } from '../data/mockData';
import { playSound } from '../lib/sound';

const NAV: { id: Screen; label: string; Icon: typeof Home }[] = [
  { id:'home',          label:'Dashboard',     Icon:Home },
  { id:'fermentadores', label:'Fermentadores', Icon:FlaskConical },
  { id:'recetas',       label:'Recetas',        Icon:BookOpen },
  { id:'alertas',       label:'Alertas',       Icon:Bell },
  { id:'analisis',      label:'Análisis',      Icon:BarChart3 },
  { id:'assistant',     label:'Asistente',     Icon:MessageSquare },
];

export function BottomNav({ active, onNavigate, soundEnabled=false }: {
  active: Screen; onNavigate:(s:Screen)=>void; soundEnabled?:boolean;
}) {
  return (
    <div className="relative z-20 shrink-0"
      style={{
        background:'rgba(3,6,12,0.94)',
        backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
        borderTop:'1px solid rgba(255,255,255,0.06)',
        paddingBottom:'env(safe-area-inset-bottom)',
      }}
    >
      <div className="absolute top-0 left-1/4 right-1/4 h-px"
        style={{ background:'linear-gradient(90deg,transparent,rgba(255,170,0,0.28),transparent)' }}
      />
      <div className="flex">
        {NAV.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <button key={id}
              onClick={() => { if (id !== active) { playSound('navigate', soundEnabled); onNavigate(id); } }}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5"
              aria-label={label} aria-current={on ? 'page' : undefined}
            >
              {on && (
                <motion.div layoutId="nav-bar"
                  className="absolute top-0 left-3 right-3 h-0.5 rounded-b-full"
                  style={{ background:'linear-gradient(90deg,transparent,#FFAA00,transparent)' }}
                  transition={{ type:'spring', stiffness:380, damping:30 }}
                />
              )}
              <motion.div animate={{ scale: on ? 1.12 : 1 }} transition={{ type:'spring', stiffness:400, damping:20 }}>
                <Icon size={18} strokeWidth={on?2:1.5}
                  style={{ color: on?'#FFAA00':'rgba(74,96,112,0.7)', filter: on?'drop-shadow(0 0 6px rgba(255,170,0,0.55))':'none', transition:'color 0.2s,filter 0.2s' }}
                />
              </motion.div>
              <span className="font-mono text-[8px] tracking-widest uppercase"
                style={{ color: on?'#FFAA00':'rgba(74,96,112,0.7)', transition:'color 0.2s' }}
              >{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
