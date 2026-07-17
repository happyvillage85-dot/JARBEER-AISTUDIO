import { useId } from 'react';
import { motion } from 'framer-motion';

interface FermentadorHologramaProps {
  size?: number;
  active?: boolean;
  responding?: boolean;
}

/**
 * Holograma del fermentador — icono central de J.A.R.B.E.E.R.
 * Fermentador cilíndrico cónico con glow dorado, anillos de energía,
 * partículas ascendentes y nivel de cerveza animado.
 */
export function FermentadorHolograma({ size = 280, active = false, responding = false }: FermentadorHologramaProps) {
  const id = useId().replace(/:/g, '');
  const cx = size / 2;
  const w = size;

  // Dimensiones del fermentador (cilindro cónico)
  const bodyW = w * 0.42;
  const bodyH = w * 0.38;
  const coneH = w * 0.14;
  const topY = size * 0.14;
  const bodyTop = topY + w * 0.04;
  const bodyBottom = bodyTop + bodyH;
  const coneBottom = bodyBottom + coneH;
  const bodyLeft = cx - bodyW / 2;
  const bodyRight = cx + bodyW / 2;

  const glowRgb = responding ? '255,170,0' : active ? '255,200,60' : '255,170,0';
  const baseColor = responding ? '#FFAA00' : active ? '#FFD060' : '#FFAA00';
  const accentColor = active ? '#FFD060' : '#FFAA00';
  const beerColor = '#D4862A';
  const beerTop = '#E8A040';
  const breathDur = responding ? 1.1 : active ? 1.8 : 3.5;
  const glowAlpha = responding ? 0.95 : active ? 0.75 : 0.45;

  // Nivel de cerveza (70% del cuerpo)
  const beerLevel = bodyTop + bodyH * 0.30;
  const beerHeight = bodyBottom - beerLevel;

  return (
    <div className="relative select-none" style={{ width: size, height: size }} aria-hidden>

      {/* ── Halo ambiental exterior ── */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(${glowRgb},${glowAlpha * 0.28}) 0%, rgba(${glowRgb},0.04) 55%, transparent 75%)`,
          filter: `blur(${size * 0.14}px)`,
          transition: 'background 0.6s',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
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
          {/* Glow filter */}
          <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          <filter id={`${id}-glow-strong`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Cerveza gradiente */}
          <linearGradient id={`${id}-beer`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={beerTop} stopOpacity="0.85" />
            <stop offset="50%" stopColor={beerColor} stopOpacity="0.7" />
            <stop offset="100%" stopColor="#A8651E" stopOpacity="0.8" />
          </linearGradient>

          {/* Brillo del cristal */}
          <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="20%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="80%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
          </linearGradient>

          {/* Tapa superior metálica */}
          <linearGradient id={`${id}-cap`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,200,80,0.3)" />
            <stop offset="100%" stopColor="rgba(180,130,40,0.2)" />
          </linearGradient>

          {/* Clip para el interior del cuerpo */}
          <clipPath id={`${id}-body-clip`}>
            <path d={`M ${bodyLeft} ${bodyTop} L ${bodyRight} ${bodyTop} L ${bodyRight} ${bodyBottom} L ${cx + bodyW * 0.18} ${coneBottom} L ${cx - bodyW * 0.18} ${coneBottom} L ${bodyLeft} ${bodyBottom} Z`} />
          </clipPath>

          {/* Scan line gradient */}
          <linearGradient id={`${id}-scan`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor={`rgba(${glowRgb},0.6)`} />
            <stop offset="60%" stopColor={`rgba(${glowRgb},0.6)`} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* ── Anillos orbitales exteriores ── */}
        <motion.circle
          cx={cx} cy={size * 0.52} r={w * 0.48}
          fill="none"
          stroke={`rgba(${glowRgb},0.08)`}
          strokeWidth="1"
          strokeDasharray="4 16"
          style={{ transformOrigin: `${cx}px ${size * 0.52}px` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        />
        <motion.circle
          cx={cx} cy={size * 0.52} r={w * 0.44}
          fill="none"
          stroke={`rgba(${glowRgb},0.14)`}
          strokeWidth="1.2"
          strokeDasharray="6 12"
          filter={`url(#${id}-glow)`}
          style={{ transformOrigin: `${cx}px ${size * 0.52}px` }}
          animate={{ rotate: -360 }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        />
        <motion.circle
          cx={cx} cy={size * 0.52} r={w * 0.44}
          fill="none"
          stroke={`rgba(${glowRgb},0.1)`}
          strokeWidth="0.8"
          strokeDasharray="2 6"
          style={{ transformOrigin: `${cx}px ${size * 0.52}px` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />

        {/* ── Corona de glow detrás del fermentador ── */}
        <motion.ellipse
          cx={cx} cy={bodyTop + bodyH * 0.4}
          rx={bodyW * 0.7} ry={bodyH * 0.6}
          fill={`rgba(${glowRgb},${glowAlpha * 0.1})`}
          filter={`url(#${id}-glow-strong)`}
          animate={{ scale: [1, 1.06, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: breathDur, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: `${cx}px ${bodyTop + bodyH * 0.4}px` }}
        />

        {/* ── Cuerpo del fermentador (cilindro cónico) ── */}
        {/* Interior: cerveza */}
        <g clipPath={`url(#${id}-body-clip)`}>
          {/* Fondo oscuro del tanque */}
          <rect x={bodyLeft} y={bodyTop} width={bodyW} height={bodyH + coneH} fill="rgba(10,8,4,0.6)" />

          {/* Cerveza con nivel animado */}
          <motion.rect
            x={bodyLeft}
            width={bodyW}
            fill={`url(#${id}-beer)`}
            initial={{ y: beerLevel, height: beerHeight }}
            animate={{
              y: [beerLevel, beerLevel - 3, beerLevel],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ height: beerHeight + coneH * 0.5 }}
          />

          {/* Superficie de la cerveza (línea ondulada) */}
          <motion.path
            d={`M ${bodyLeft} ${beerLevel} Q ${cx} ${beerLevel - 4} ${bodyRight} ${beerLevel}`}
            fill="none"
            stroke={beerTop}
            strokeWidth="1.5"
            opacity="0.6"
            animate={{ d: [
              `M ${bodyLeft} ${beerLevel} Q ${cx} ${beerLevel - 4} ${bodyRight} ${beerLevel}`,
              `M ${bodyLeft} ${beerLevel} Q ${cx} ${beerLevel + 3} ${bodyRight} ${beerLevel}`,
              `M ${bodyLeft} ${beerLevel} Q ${cx} ${beerLevel - 4} ${bodyRight} ${beerLevel}`,
            ]}}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Burbujas ascendentes */}
          {[...Array(8)].map((_, i) => {
            const bx = bodyLeft + bodyW * (0.15 + (i * 0.11) % 0.7);
            const by = bodyBottom - (i * (beerHeight / 8));
            const br = 1.5 + (i % 3) * 0.8;
            return (
              <motion.circle
                key={i}
                cx={bx}
                cy={by}
                r={br}
                fill="rgba(255,220,150,0.5)"
                animate={{
                  cy: [bodyBottom - 5, beerLevel + 2],
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2.5 + i * 0.4,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: i * 0.3,
                }}
              />
            );
          })}

          {/* Scan line dentro del fermentador */}
          <motion.rect
            x={bodyLeft}
            width={bodyW}
            height={1.5}
            fill={`url(#${id}-scan)`}
            clipPath={`url(#${id}-body-clip)`}
            animate={{
              y: [bodyTop, bodyBottom + coneH * 0.5, bodyTop],
              opacity: [0, 0.7, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </g>

        {/* Brillo del cristal (overlay) */}
        <path
          d={`M ${bodyLeft} ${bodyTop} L ${bodyRight} ${bodyTop} L ${bodyRight} ${bodyBottom} L ${cx + bodyW * 0.18} ${coneBottom} L ${cx - bodyW * 0.18} ${coneBottom} L ${bodyLeft} ${bodyBottom} Z`}
          fill={`url(#${id}-glass)`}
        />

        {/* Borde del fermentador con glow */}
        <motion.path
          d={`M ${bodyLeft} ${bodyTop} L ${bodyLeft} ${bodyBottom} L ${cx - bodyW * 0.18} ${coneBottom}`}
          fill="none"
          stroke={baseColor}
          strokeWidth="2"
          filter={`url(#${id}-glow)`}
          animate={{ opacity: [0.5, glowAlpha, 0.5] }}
          transition={{ duration: breathDur * 0.7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d={`M ${bodyRight} ${bodyTop} L ${bodyRight} ${bodyBottom} L ${cx + bodyW * 0.18} ${coneBottom}`}
          fill="none"
          stroke={baseColor}
          strokeWidth="2"
          filter={`url(#${id}-glow)`}
          animate={{ opacity: [0.5, glowAlpha, 0.5] }}
          transition={{ duration: breathDur * 0.7, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />

        {/* Tapa superior (cuello + domo) */}
        <rect
          x={cx - bodyW * 0.35}
          y={bodyTop - w * 0.03}
          width={bodyW * 0.7}
          height={w * 0.03}
          rx="2"
          fill={`url(#${id}-cap)`}
          stroke={accentColor}
          strokeWidth="1.5"
          filter={`url(#${id}-glow)`}
        />
        <ellipse
          cx={cx}
          cy={bodyTop - w * 0.03}
          rx={bodyW * 0.35}
          ry={w * 0.025}
          fill="rgba(255,200,80,0.15)"
          stroke={accentColor}
          strokeWidth="1.5"
          filter={`url(#${id}-glow)`}
        />

        {/* Válvula superior */}
        <line
          x1={cx} y1={bodyTop - w * 0.055}
          x2={cx} y2={bodyTop - w * 0.08}
          stroke={accentColor}
          strokeWidth="2"
          filter={`url(#${id}-glow)`}
        />
        <circle cx={cx} cy={bodyTop - w * 0.085} r={w * 0.018} fill={accentColor} filter={`url(#${id}-glow)`} />

        {/* Válvula inferior (salida del cono) */}
        <line
          x1={cx} y1={coneBottom}
          x2={cx} y2={coneBottom + w * 0.04}
          stroke={accentColor}
          strokeWidth="2"
          filter={`url(#${id}-glow)`}
        />
        <circle cx={cx} cy={coneBottom + w * 0.045} r={w * 0.015} fill={accentColor} filter={`url(#${id}-glow)`} />

        {/* Bridas / bandas del tanque */}
        {[0.25, 0.55, 0.85].map((pct, i) => (
          <motion.line
            key={i}
            x1={bodyLeft - 2}
            x2={bodyRight + 2}
            y1={bodyTop + bodyH * pct}
            y2={bodyTop + bodyH * pct}
            stroke={`rgba(${glowRgb},0.25)`}
            strokeWidth="1"
            animate={{ opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
          />
        ))}

        {/* ── HUD data ticks (alrededor del fermentador) ── */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const r = w * 0.36;
          const x1 = cx + Math.cos(rad) * r;
          const y1 = size * 0.52 + Math.sin(rad) * r;
          const x2 = cx + Math.cos(rad) * (r + 8);
          const y2 = size * 0.52 + Math.sin(rad) * (r + 8);
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
          { deg: 0,   val: '°P 9.2' },
          { deg: 120, val: '68%'    },
          { deg: 240, val: '20.5°C' },
        ].map(({ deg, val }) => {
          const rad = (deg * Math.PI) / 180;
          const r = w * 0.40;
          const tx = cx + Math.cos(rad) * r;
          const ty = size * 0.52 + Math.sin(rad) * r;
          return (
            <motion.text
              key={deg} x={tx} y={ty}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="8" fontFamily="JetBrains Mono, monospace"
              fill={`rgba(${glowRgb},0.6)`}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, delay: deg / 120 * 0.5, ease: 'easeInOut' }}
            >
              {val}
            </motion.text>
          );
        })}
      </svg>

      {/* ── Partículas doradas ascendentes (fuera del SVG, CSS-driven) ── */}
      {[...Array(12)].map((_, i) => (
        <Particle key={i} index={i} size={size} baseColor={baseColor} glowRgb={glowRgb} />
      ))}

      {/* ── Anillos de pulso activo ── */}
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
  const angle = (index / 12) * Math.PI * 2;
  const orbit = size * (0.32 + (index % 4) * 0.05);
  const px = size / 2 + Math.cos(angle) * orbit - 2.5;
  const py = size / 2 + Math.sin(angle) * orbit - 2.5;
  const dur = 2.5 + index * 0.5;
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
        y: [0, -15, 0],
        x: [0, Math.cos(angle + 1.1) * 8, 0],
      }}
      transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay: index * 0.28 }}
    />
  );
}
