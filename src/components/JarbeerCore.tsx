import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface JarbeerCoreProps {
  size?: number; // tamaño en píxeles
  glowColor?: string; // color principal del glow (naranja por defecto)
  secondaryGlow?: string; // color secundario (azul)
}

export function JarbeerCore({
  size = 300,
  glowColor = '#FFAA00',
  secondaryGlow = '#00e1ff',
}: JarbeerCoreProps) {
  const center = size / 2;
  const radius = size * 0.35;

  // Partículas: 20 puntos que orbitan alrededor, calculados una sola vez
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const distance = radius * (0.6 + Math.random() * 0.4);
        return {
          id: i,
          x: center + Math.cos(angle) * distance,
          y: center + Math.sin(angle) * distance,
          delay: Math.random() * 2,
          duration: 2 + Math.random() * 3,
        };
      }),
    [center, radius]
  );

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Anillos concéntricos animados */}
      {[0.7, 1.0, 1.3].map((scale, idx) => (
        <motion.div
          key={idx}
          className="absolute rounded-full border"
          style={{
            width: radius * 2 * scale,
            height: radius * 2 * scale,
            borderColor: idx === 1 ? glowColor : secondaryGlow,
            borderWidth: 1.5,
            opacity: 0.3 - idx * 0.08,
          }}
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 360, 0],
          }}
          transition={{
            duration: 8 + idx * 2,
            repeat: Infinity,
            ease: 'linear',
            delay: idx * 0.5,
          }}
        />
      ))}

      {/* Núcleo central con gradiente y glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: radius * 1.2,
          height: radius * 1.2,
          background: `radial-gradient(circle at 30% 30%, ${glowColor}33, ${secondaryGlow}22, transparent 70%)`,
          boxShadow: `0 0 60px ${glowColor}44, 0 0 120px ${secondaryGlow}33`,
        }}
        animate={{
          scale: [1, 1.02, 1],
          boxShadow: [
            `0 0 60px ${glowColor}44, 0 0 120px ${secondaryGlow}33`,
            `0 0 80px ${glowColor}66, 0 0 160px ${secondaryGlow}44`,
            `0 0 60px ${glowColor}44, 0 0 120px ${secondaryGlow}33`,
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Partículas orbitando */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: 4,
            height: 4,
            background: p.id % 2 === 0 ? glowColor : secondaryGlow,
            boxShadow: `0 0 8px ${p.id % 2 === 0 ? glowColor : secondaryGlow}`,
          }}
          animate={{
            x: [
              p.x,
              p.x + Math.sin(p.id) * 20,
              p.x,
              p.x - Math.sin(p.id) * 20,
              p.x,
            ],
            y: [
              p.y,
              p.y + Math.cos(p.id) * 20,
              p.y,
              p.y - Math.cos(p.id) * 20,
              p.y,
            ],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}

      {/* Anillo de ondas que se expande */}
      {[0, 0.5, 1].map((delay) => (
        <motion.div
          key={`wave-${delay}`}
          className="absolute rounded-full border"
          style={{
            width: radius * 1.4,
            height: radius * 1.4,
            borderColor: glowColor,
            borderWidth: 1,
          }}
          animate={{
            scale: [1, 1.8],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeOut',
            delay: delay,
          }}
        />
      ))}
    </div>
  );
}