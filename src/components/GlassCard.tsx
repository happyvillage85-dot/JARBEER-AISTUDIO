import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode; className?: string; delay?: number;
  style?: React.CSSProperties; corners?: boolean; onClick?: () => void;
}

export function GlassCard({ children, className='', delay=0, style, corners=false, onClick }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity:0, y:10 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.45, delay, ease:[0.22,1,0.36,1] }}
      className={`hud relative ${className}`}
      style={style}
      onClick={onClick}
    >
      {corners && (
        <>
          <span className="hud-corner hud-corner-tl" />
          <span className="hud-corner hud-corner-tr" />
          <span className="hud-corner hud-corner-bl" />
          <span className="hud-corner hud-corner-br" />
        </>
      )}
      {children}
    </motion.div>
  );
}
