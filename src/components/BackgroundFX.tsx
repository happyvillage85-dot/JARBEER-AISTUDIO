import { motion } from 'framer-motion';

export function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={{ background: '#020408' }} />

      {/* Brewery blueprint SVG */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.05, filter: 'blur(1px)' }}
      >
        <rect x="60"  y="180" width="80"  height="240" rx="8" fill="none" stroke="#8ab4cc" strokeWidth="2"/>
        <ellipse cx="100" cy="180" rx="40" ry="10" fill="none" stroke="#8ab4cc" strokeWidth="2"/>
        <rect x="180" y="150" width="90"  height="280" rx="8" fill="none" stroke="#8ab4cc" strokeWidth="2"/>
        <ellipse cx="225" cy="150" rx="45" ry="11" fill="none" stroke="#8ab4cc" strokeWidth="2"/>
        <path d="M140 300 Q160 280 180 260" fill="none" stroke="#8ab4cc" strokeWidth="1.5"/>
        <path d="M270 300 Q340 260 340 200 Q340 180 360 180 L800 180" fill="none" stroke="#8ab4cc" strokeWidth="1.5"/>
        <circle cx="100" cy="260" r="12" fill="none" stroke="#8ab4cc" strokeWidth="1.5"/>
        <circle cx="225" cy="240" r="14" fill="none" stroke="#8ab4cc" strokeWidth="1.5"/>
        <rect x="620" y="200" width="140" height="180" rx="6" fill="none" stroke="#8ab4cc" strokeWidth="1.5"/>
        <rect x="630" y="210" width="50"  height="30"  rx="3" fill="none" stroke="#00e1ff" strokeWidth="1"/>
        <line x1="0" y1="500" x2="800" y2="500" stroke="#8ab4cc" strokeWidth="1" opacity="0.4"/>
      </svg>

      {/* Central reactor glow */}
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
        style={{ width:600, height:600, background:'radial-gradient(circle, rgba(0,135,255,0.07) 0%, transparent 65%)', borderRadius:'50%' }}
      />

      {/* Ambient orbs */}
      <motion.div className="absolute rounded-full"
        style={{ width:300, height:300, top:'10%', left:'5%', background:'radial-gradient(circle, rgba(0,225,255,0.035) 0%, transparent 70%)' }}
        animate={{ x:[0,18,0], y:[0,-12,0], opacity:[0.5,1,0.5] }}
        transition={{ duration:20, repeat:Infinity, ease:'easeInOut' }}
      />
      <motion.div className="absolute rounded-full"
        style={{ width:240, height:240, bottom:'18%', right:'6%', background:'radial-gradient(circle, rgba(255,170,0,0.025) 0%, transparent 70%)' }}
        animate={{ x:[0,-12,0], y:[0,10,0], opacity:[0.4,0.8,0.4] }}
        transition={{ duration:25, repeat:Infinity, ease:'easeInOut', delay:4 }}
      />

      {/* Vignettes */}
      <div className="absolute bottom-0 left-0 right-0 h-48" style={{ background:'linear-gradient(to top, rgba(2,4,8,0.92) 0%, transparent 100%)' }} />
      <div className="absolute top-0 left-0 right-0 h-24"  style={{ background:'linear-gradient(to bottom, rgba(2,4,8,0.75) 0%, transparent 100%)' }} />

      {/* Scan line */}
      <motion.div className="absolute left-0 right-0 h-px"
        style={{ background:'linear-gradient(90deg, transparent, rgba(0,225,255,0.035), transparent)' }}
        animate={{ top:['0%','100%'] }}
        transition={{ duration:9, repeat:Infinity, ease:'linear', repeatDelay:7 }}
      />
    </div>
  );
}
