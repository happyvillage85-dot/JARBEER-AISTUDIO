import { useId } from 'react';
import { motion } from 'framer-motion';

interface AvatarProps {
  size?: number;
  active?: boolean;
  responding?: boolean;
}

export function Avatar({ size = 280, active = false, responding = false }: AvatarProps) {
  const id = useId().replace(/:/g, '');
  const cx = size / 2;
  const cy = size / 2;
  const coreR = size * 0.33;   // radius of the image circle
  const r1 = size * 0.44;      // inner orbit ring
  const r2 = size * 0.50;      // outer orbit ring

  const glowRgb   = responding ? '255,170,0' : active ? '0,225,255' : '0,135,255';
  const baseColor = responding ? '#FFAA00'   : active ? '#00e1ff'   : '#0087ff';
  const breathDur = responding ? 1.1 : active ? 1.8 : 5.0;
  const glowAlpha = responding ? 0.9 : active ? 0.7 : 0.35;

  return (
    <div className="relative select-none" style={{ width: size, height: size }} aria-hidden>

      {/* ── Outer ambient halo (blur div) ── */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(${glowRgb},${glowAlpha * 0.3}) 0%, rgba(${glowRgb},0.04) 55%, transparent 75%)`,
          filter: `blur(${size * 0.14}px)`,
          transition: 'background 0.6s',
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: breathDur, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="relative z-10"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Image mask — circular crop */}
          <clipPath id={`${id}-clip`}>
            <circle cx={cx} cy={cy} r={coreR} />
          </clipPath>

          {/* Glow filter for rings */}
          <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Vignette gradient over image edge */}
          <radialGradient id={`${id}-vignette`} cx="50%" cy="50%">
            <stop offset="70%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(2,4,8,0.55)" />
          </radialGradient>

          {/* Scan line gradient */}
          <linearGradient id={`${id}-scan`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="transparent" />
            <stop offset="40%"  stopColor={`rgba(${glowRgb},0.55)`} />
            <stop offset="60%"  stopColor={`rgba(${glowRgb},0.55)`} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* ── Outermost faint ring ── */}
        <motion.circle
          cx={cx} cy={cy} r={r2 + size * 0.04}
          fill="none"
          stroke={`rgba(${glowRgb},0.08)`}
          strokeWidth="1"
          strokeDasharray="4 16"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        />

        {/* ── Outer orbit ring + dot ── */}
        <motion.circle
          cx={cx} cy={cy} r={r2}
          fill="none"
          stroke={`rgba(${glowRgb},0.18)`}
          strokeWidth="1.2"
          strokeDasharray="6 12"
          filter={`url(#${id}-glow)`}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        />
        <motion.circle
          cx={cx} cy={cy - r2} r={4.5}
          fill={baseColor}
          style={{ transformOrigin: `${cx}px ${cy}px`, filter: `drop-shadow(0 0 8px ${baseColor})` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        />

        {/* ── Inner orbit ring + counter dot ── */}
        <motion.circle
          cx={cx} cy={cy} r={r1}
          fill="none"
          stroke={`rgba(${glowRgb},0.22)`}
          strokeWidth="1"
          strokeDasharray="3 8"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
        <motion.circle
          cx={cx} cy={cy + r1} r={3}
          fill={`rgba(${glowRgb},0.8)`}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />

        {/* ── Equator belt ── */}
        <motion.ellipse
          cx={cx} cy={cy} rx={coreR} ry={coreR * 0.2}
          fill="none"
          stroke={`rgba(${glowRgb},0.18)`}
          strokeWidth="1"
          strokeDasharray="5 7"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        />

        {/* ── Glow corona behind image ── */}
        <motion.circle
          cx={cx} cy={cy} r={coreR + 6}
          fill={`rgba(${glowRgb},${glowAlpha * 0.12})`}
          animate={{ scale: [1, 1.06, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: breathDur, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* ── AVATAR IMAGE — clipped to circle ── */}
        <motion.image
          href="/avatar.png"
          x={cx - coreR}
          y={cy - coreR}
          width={coreR * 2}
          height={coreR * 2}
          clipPath={`url(#${id}-clip)`}
          preserveAspectRatio="xMidYMid slice"
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: breathDur, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Vignette overlay over image */}
        <circle
          cx={cx} cy={cy} r={coreR}
          fill={`url(#${id}-vignette)`}
          clipPath={`url(#${id}-clip)`}
        />

        {/* ── Glowing border ring over image ── */}
        <motion.circle
          cx={cx} cy={cy} r={coreR}
          fill="none"
          stroke={baseColor}
          strokeWidth="2"
          filter={`url(#${id}-glow)`}
          animate={{ opacity: [0.4, glowAlpha, 0.4] }}
          transition={{ duration: breathDur * 0.7, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* ── Scan line inside core ── */}
        <motion.rect
          x={cx - coreR * 0.85}
          y={cy - 0.6}
          width={coreR * 1.7}
          height={1.2}
          fill={`url(#${id}-scan)`}
          clipPath={`url(#${id}-clip)`}
          animate={{
            y: [cy - coreR * 0.78, cy + coreR * 0.78, cy - coreR * 0.78],
            opacity: [0, 0.8, 0],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* ── HUD data ticks (6 around core) ── */}
        {[0,60,120,180,240,300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = cx + Math.cos(rad) * (coreR + 2);
          const y1 = cy + Math.sin(rad) * (coreR + 2);
          const x2 = cx + Math.cos(rad) * (coreR + 10);
          const y2 = cy + Math.sin(rad) * (coreR + 10);
          return (
            <motion.line
              key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={baseColor} strokeWidth="1.5"
              animate={{ opacity: [0.15, 0.9, 0.15] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.35, ease: 'easeInOut' }}
            />
          );
        })}

        {/* ── Data readout labels ── */}
        {[
          { deg: 0,   val: '64.5°' },
          { deg: 120, val: '68%'   },
          { deg: 240, val: 'OK'    },
        ].map(({ deg, val }) => {
          const rad = (deg * Math.PI) / 180;
          const tx = cx + Math.cos(rad) * (coreR + 20);
          const ty = cy + Math.sin(rad) * (coreR + 20);
          return (
            <motion.text
              key={deg} x={tx} y={ty}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="8" fontFamily="JetBrains Mono, monospace"
              fill={`rgba(${glowRgb},0.55)`}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, delay: deg / 120 * 0.5, ease: 'easeInOut' }}
            >
              {val}
            </motion.text>
          );
        })}
      </svg>

      {/* ── Floating particles (outside SVG, CSS-driven) ── */}
      {[...Array(10)].map((_, i) => (
        <Particle key={i} index={i} size={size} baseColor={baseColor} glowRgb={glowRgb} />
      ))}

      {/* ── Active pulse rings ── */}
      {(active || responding) && [0, 0.5, 1.1].map((delay) => (
        <motion.div
          key={delay}
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ border: `1px solid rgba(${glowRgb},0.35)` }}
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.65, opacity: 0 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay }}
        />
      ))}
    </div>
  );
}

function Particle({ index, size, baseColor, glowRgb }: {
  index: number; size: number; baseColor: string; glowRgb: string;
}) {
  const seed = index / 10;
  const angle = seed * Math.PI * 2;
  const orbit = size * (0.36 + (index % 4) * 0.055);
  const px = size / 2 + Math.cos(angle) * orbit - 2.5;
  const py = size / 2 + Math.sin(angle) * orbit - 2.5;
  const dur = 2.5 + index * 0.6;
  const ps = index % 3 === 0 ? 5 : index % 2 === 0 ? 3.5 : 2.5;

  return (
    <motion.div
      className="pointer-events-none absolute rounded-full"
      style={{
        left: px, top: py, width: ps, height: ps,
        background: baseColor,
        boxShadow: `0 0 ${ps * 2.5}px rgba(${glowRgb},0.85)`,
      }}
      animate={{
        opacity: [0.04, 0.95, 0.04],
        scale: [0.4, 1.4, 0.4],
        x: [0, Math.cos(angle + 1.1) * 12, 0],
        y: [0, Math.sin(angle + 1.1) * 9, 0],
      }}
      transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay: index * 0.32 }}
    />
  );
}
