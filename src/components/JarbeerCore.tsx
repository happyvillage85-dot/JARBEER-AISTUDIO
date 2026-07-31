import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface JarbeerCoreProps {
  estado?: 'idle' | 'escuchando' | 'pensando' | 'hablando' | 'error';
  size?: number;
}

export function JarbeerCore({
  estado = 'idle',
  size = 300,
}: JarbeerCoreProps) {
  const center = size / 2;
  const radius = size * 0.35;

  // Configuraciones por estado
  const config = useMemo(() => {
    const base = {
      anilloRotacion: 8,
      anilloEscala: [1, 1.05, 1],
      nucleoBoxShadow: `0 0 60px rgba(255,170,0,0.44), 0 0 120px rgba(0,225,255,0.33)`,
      nucleoGradiente: 'radial-gradient(circle at 30% 30%, rgba(255,170,0,0.33), rgba(0,225,255,0.22), transparent 70%)',
      nucleoPulsacion: { escala: [1, 1.02, 1], duracion: 3 },
      ondaDuracion: 3,
      ondaColor: '#FFAA00',
      particulasVisibles: true,
      particulasColor1: '#FFAA00',
      particulasColor2: '#00e1ff',
    };

    switch (estado) {
      case 'escuchando':
        return {
          ...base,
          anilloRotacion: 4,
          anilloEscala: [1, 1.08, 1],
          nucleoBoxShadow: `0 0 80px rgba(0,225,255,0.8), 0 0 160px rgba(0,225,255,0.5)`,
          nucleoGradiente: 'radial-gradient(circle at 30% 30%, rgba(0,225,255,0.5), rgba(0,150,255,0.3), transparent 70%)',
          nucleoPulsacion: { escala: [1, 1.04, 1], duracion: 1.5 },
          ondaDuracion: 1.5,
          ondaColor: '#00e1ff',
        };
      case 'pensando':
        return {
          ...base,
          anilloRotacion: 2,
          anilloEscala: [1, 1.1, 1],
          nucleoBoxShadow: `0 0 100px rgba(255,170,0,0.9), 0 0 200px rgba(255,100,0,0.5)`,
          nucleoGradiente: 'radial-gradient(circle at 30% 30%, rgba(255,170,0,0.6), rgba(255,100,0,0.3), transparent 70%)',
          nucleoPulsacion: { escala: [1, 1.06, 1], duracion: 1 },
          ondaDuracion: 2,
          ondaColor: '#FFAA00',
        };
      case 'hablando':
        // Latido: dos pulsos rápidos, pausa
        return {
          ...base,
          anilloRotacion: 6,
          anilloEscala: [1, 1.03, 1],
          nucleoBoxShadow: `0 0 80px rgba(255,170,0,0.7), 0 0 160px rgba(0,225,255,0.5)`,
          nucleoGradiente: 'radial-gradient(circle at 30% 30%, rgba(255,170,0,0.4), rgba(0,225,255,0.3), transparent 70%)',
          nucleoPulsacion: {
            escala: [1, 1.08, 1, 1.08, 1],
            duracion: 2,
            times: [0, 0.2, 0.3, 0.5, 1],
          },
          ondaDuracion: 1.8,
          ondaColor: '#FFAA00',
        };
      case 'error':
        return {
          ...base,
          anilloRotacion: 12,
          anilloEscala: [1, 1.02, 1],
          nucleoBoxShadow: `0 0 30px rgba(255,100,50,0.3), 0 0 60px rgba(255,50,0,0.2)`,
          nucleoGradiente: 'radial-gradient(circle at 30% 30%, rgba(255,80,40,0.2), rgba(200,50,0,0.1), transparent 70%)',
          nucleoPulsacion: { escala: [1, 1.01, 1], duracion: 5 },
          ondaDuracion: 5,
          ondaColor: '#ff6633',
          particulasVisibles: false,
        };
      default: // idle
        return base;
    }
  }, [estado]);

  // Partículas: 20 puntos, calculadas una sola vez
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

  const mostrarParticulas = config.particulasVisibles;
  const anilloDuracion = config.anilloRotacion;

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
            borderColor: idx === 1 ? config.ondaColor : (idx === 0 ? '#00e1ff' : '#FFAA00'),
            borderWidth: 1.5,
            opacity: 0.3 - idx * 0.08,
          }}
          animate={{
            scale: config.anilloEscala,
            rotate: [0, 360, 0],
          }}
          transition={{
            duration: anilloDuracion + idx * 1.5,
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
          background: config.nucleoGradiente,
          boxShadow: config.nucleoBoxShadow,
        }}
        animate={{
          scale: config.nucleoPulsacion.escala,
          boxShadow: [
            config.nucleoBoxShadow,
            config.nucleoBoxShadow.replace('60px', '80px').replace('120px', '160px'),
            config.nucleoBoxShadow,
          ],
        }}
        transition={{
          duration: config.nucleoPulsacion.duracion,
          repeat: Infinity,
          ease: 'easeInOut',
          times: config.nucleoPulsacion.times || [0, 0.5, 1],
        }}
      />

      {/* Partículas orbitando (solo si no está en error) */}
      {mostrarParticulas &&
        particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: 4,
              height: 4,
              background: p.id % 2 === 0 ? config.particulasColor1 : config.particulasColor2,
              boxShadow: `0 0 8px ${p.id % 2 === 0 ? config.particulasColor1 : config.particulasColor2}`,
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
            borderColor: config.ondaColor,
            borderWidth: 1,
          }}
          animate={{
            scale: [1, 1.8],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: config.ondaDuracion,
            repeat: Infinity,
            ease: 'easeOut',
            delay: delay,
          }}
        />
      ))}
    </div>
  );
}