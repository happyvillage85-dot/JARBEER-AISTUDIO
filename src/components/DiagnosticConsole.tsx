import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Cpu, Network, Zap } from 'lucide-react';

export function DiagnosticConsole({ isVisible }: { isVisible: boolean }) {
  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState(0);
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const calculateFPS = () => {
      const now = performance.now();
      frameCount++;
      
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;

        // Simulate memory reading (window.performance.memory is non-standard, we simulate if missing)
        const perfMemory = (performance as any).memory;
        if (perfMemory) {
          setMemory(Math.round(perfMemory.usedJSHeapSize / (1024 * 1024)));
        } else {
          // Mock varying memory
          setMemory(prev => {
            const newMem = prev === 0 ? 45 : prev + (Math.random() * 10 - 5);
            return Math.max(30, Math.min(120, Math.round(newMem)));
          });
        }

        // Simulate network latency check
        setLatency(Math.round(15 + Math.random() * 25));
      }
      
      animationFrameId = requestAnimationFrame(calculateFPS);
    };

    animationFrameId = requestAnimationFrame(calculateFPS);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          className="fixed top-20 right-4 z-50 pointer-events-none"
        >
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-4 font-mono text-xs w-64 shadow-2xl">
            <div className="flex items-center gap-2 mb-3 text-[#00e1ff] border-b border-white/10 pb-2">
              <Zap size={14} className="text-[#00e1ff]" />
              <span className="font-bold tracking-widest uppercase">System HUD</span>
              <span className="ml-auto flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e1ff] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e1ff]"></span>
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <Activity size={12} />
                  <span>FPS</span>
                </div>
                <div className={`font-bold ${fps > 45 ? 'text-green-400' : fps > 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {fps}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <Cpu size={12} />
                  <span>MEM</span>
                </div>
                <div className="font-bold text-gray-200">
                  {memory} <span className="text-[10px] text-gray-500">MB</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <Network size={12} />
                  <span>LAT</span>
                </div>
                <div className={`font-bold ${latency < 30 ? 'text-green-400' : latency < 100 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {latency} <span className="text-[10px] text-gray-500">ms</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 flex gap-1">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-3 flex-1 bg-[#00e1ff]/30 rounded-sm"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scaleY: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 1 + Math.random(),
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
