import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, FlaskConical, BookOpen, FileText, BarChart3, Settings, Bell, Volume2, VolumeX, Wheat, MessageSquare } from 'lucide-react';
import type { Screen } from '../data/mockData';
import { MODE_LABELS, USER_NAME, type SystemMode } from '../lib/config';

const NAV: { id: Screen; label: string; Icon: typeof Home }[] = [
  { id: 'home',          label: 'Dashboard',    Icon: Home },
  { id: 'fermentadores', label: 'Tanques',       Icon: FlaskConical },
  { id: 'recetas',       label: 'Recetas',       Icon: BookOpen },
  { id: 'production',   label: 'Reportes',      Icon: FileText },
  { id: 'analisis',      label: 'Análisis',      Icon: BarChart3 },
  { id: 'alertas',       label: 'Ajustes',       Icon: Settings },
];

interface TopNavProps {
  active: Screen;
  onNavigate: (s: Screen) => void;
  mode: SystemMode;
  onToggleMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAssistant: () => void;
  alertCount?: number;
  onOpenLogs?: () => void;
}

export function TopNav({ active, onNavigate, mode, onToggleMode, soundEnabled, onToggleSound, onOpenAssistant, alertCount = 0, onOpenLogs }: TopNavProps) {
  const [time, setTime] = useState(fmtTime);
  const [clickCount, setClickCount] = useState(0);
  const modeLabel = MODE_LABELS[mode];
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches';

  useEffect(() => {
    const t = setInterval(() => setTime(fmtTime()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 1500);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  const handleLogoClick = () => {
    if (clickCount >= 4) {
      setClickCount(0);
      if (onOpenLogs) onOpenLogs();
    } else {
      setClickCount(prev => prev + 1);
    }
  };

  return (
    <div className="relative z-30 flex items-center justify-between px-5 py-2.5"
      style={{
        background: 'rgba(2,4,8,0.95)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderBottom: '1px solid rgba(255,170,0,0.12)',
      }}
    >
      {/* ── Logo + Brand ── */}
      <div className="flex items-center gap-3 shrink-0 min-w-[260px] cursor-pointer" onClick={handleLogoClick}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: 'linear-gradient(135deg,rgba(255,170,0,0.22),rgba(255,170,0,0.06))', border: '1.5px solid rgba(255,170,0,0.45)' }}
        >
          <Wheat size={18} style={{ color: '#FFAA00' }} />
        </div>
        <div>
          <p className="font-display text-sm font-black tracking-[0.14em] leading-tight" style={{ color: '#FFAA00' }}>J.A.R.B.E.E.R.</p>
          <p className="font-mono text-[8px] leading-tight" style={{ color: 'rgba(74,96,112,0.7)' }}>Just A Real Brewing Engineering Expert Reasoner</p>
          <p className="font-mono text-[7.5px] leading-tight uppercase tracking-widest" style={{ color: 'rgba(255,170,0,0.45)' }}>Inteligencia que fermenta resultados</p>
        </div>
      </div>

      {/* ── Navigation tabs ── */}
      <nav className="flex items-center gap-0.5">
        {NAV.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <button key={id} onClick={() => onNavigate(id)}
              className="relative flex flex-col items-center gap-0.5 rounded-xl px-3.5 py-2 transition-all duration-200"
              style={{
                background: on ? 'rgba(255,170,0,0.1)' : 'transparent',
                border: on ? '1px solid rgba(255,170,0,0.2)' : '1px solid transparent',
              }}
            >
              <Icon size={15} strokeWidth={on ? 2 : 1.5}
                style={{ color: on ? '#FFAA00' : 'rgba(74,96,112,0.65)', transition: 'color 0.2s' }}
              />
              <span className="font-mono text-[8.5px] uppercase tracking-wider"
                style={{ color: on ? '#FFAA00' : 'rgba(74,96,112,0.55)', transition: 'color 0.2s' }}
              >{label}</span>
              {on && (
                <motion.div layoutId="topnav-indicator"
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                  style={{ background: '#FFAA00' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Right cluster ── */}
      <div className="flex items-center gap-3 shrink-0 min-w-[260px] justify-end">

        {/* Mode toggle */}
        <button onClick={onToggleMode}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all duration-300"
          style={{ background: `${modeLabel.color}12`, border: `1px solid ${modeLabel.color}30` }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: modeLabel.dot, boxShadow: `0 0 6px ${modeLabel.dot}`, animation: 'live-pulse 2s ease-in-out infinite' }} />
          <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: modeLabel.color }}>{modeLabel.short}</span>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button onClick={onOpenAssistant}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200"
            style={{ background: 'rgba(0,225,255,0.07)', border: '1px solid rgba(0,225,255,0.18)' }}
            title="Asistente J.A.R.B.E.E.R."
          >
            <MessageSquare size={14} style={{ color: '#00e1ff' }} />
          </button>
          <button onClick={onToggleSound}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {soundEnabled ? <Volume2 size={14} style={{ color: 'rgba(74,96,112,0.8)' }} /> : <VolumeX size={14} style={{ color: 'rgba(74,96,112,0.5)' }} />}
          </button>
          <button className="relative flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Bell size={14} style={{ color: 'rgba(74,96,112,0.8)' }} />
            {alertCount > 0 && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full" style={{ background: '#FA6A00', boxShadow: '0 0 5px rgba(250,106,0,0.8)' }} />}
          </button>
        </div>

        <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.07)' }} />

        {/* System status */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: modeLabel.dot, boxShadow: `0 0 6px ${modeLabel.dot}` }} />
            <span className="font-mono text-[9px] font-bold tracking-wider" style={{ color: modeLabel.color }}>SISTEMA {modeLabel.short}</span>
          </div>
          <span className="font-mono text-[8px]" style={{ color: 'rgba(74,96,112,0.6)' }}>Sincronizado {time}</span>
        </div>

        <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.07)' }} />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <p className="font-display text-sm font-bold leading-tight text-white">{greeting}, {USER_NAME}</p>
            <p className="font-mono text-[9px] leading-tight" style={{ color: 'rgba(74,96,112,0.7)' }}>Administrador</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl font-display text-sm font-black"
            style={{ background: 'rgba(255,170,0,0.12)', border: '1.5px solid rgba(255,170,0,0.35)', color: '#FFAA00' }}
          >{USER_NAME.slice(0, 2).toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
}

function fmtTime() {
  return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
