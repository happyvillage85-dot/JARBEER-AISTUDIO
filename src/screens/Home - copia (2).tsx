import { useState } from 'react';
import { useRegistros } from '../lib/registrosState';

// Posiciones aproximadas de los 6 tanques sobre fondo_pc.png (en %).
// Ajusta top/left mirando la imagen en pantalla hasta que encajen.
const TANK_POSITIONS: Record<string, { top: string; left: string }> = {
  F1: { top: '28%', left: '5%' },
  F2: { top: '28%', left: '18%' },
  F3: { top: '28%', left: '31%' },
  F4: { top: '30%', left: '43%' },
  F5: { top: '32%', left: '55%' },
  F6: { top: '32%', left: '67%' },
};

export function Home() {
  const { registrosProduccion } = useRegistros();
  const [selectedTankIndex, setSelectedTankIndex] = useState(0);

  const batchesByTank = new Map(registrosProduccion.map((batch) => [batch.fermentadorNum, batch]));
  const tanks = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'].map((tankNum) => {
    const batch = batchesByTank.get(tankNum);
    const isEmpty = !batch;

    const progress = batch
      ? batch.stage === 'Finalizado'
        ? 100
        : batch.stage === 'En proceso de envasado'
          ? 92
          : batch.stage === 'Trasegado'
            ? 84
            : batch.stage === 'Secundaria'
              ? 68
              : 50
      : 0;

    return {
      id: tankNum,
      name: `Tanque ${tankNum}`,
      recipe: batch ? batch.recipe : 'Vacío',
      batchId: batch ? batch.batch : '—',
      temp: batch ? batch.currentTemp : '—',
      abv: batch ? batch.abv : '—',
      ph: batch ? batch.ph : '—',
      isEmpty,
      progress,
    };
  });

  const activeTank = tanks[selectedTankIndex];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden pb-24">
      {/* Imagen de fondo de la fábrica */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none select-none"
        style={{ backgroundImage: `url('/fondo_pc.png')` }}
      />

      {/* Overlay de tanques posicionado sobre la imagen */}
      <div className="absolute inset-0 z-10">
        {tanks.map((tank, idx) => {
          const isSelected = selectedTankIndex === idx;
          const pos = TANK_POSITIONS[tank.id];
          const color = tank.isEmpty ? '#ff9900' : '#00ff66';

          return (
            <button
              key={tank.id}
              onClick={() => setSelectedTankIndex(idx)}
              className="absolute flex flex-col items-center justify-center rounded-xl backdrop-blur-md transition-all cursor-pointer border px-3 py-2"
              style={{
                top: pos.top,
                left: pos.left,
                borderColor: color,
                color,
                background: `rgba(0,0,0,0.35)`,
                boxShadow: isSelected
                  ? `0 0 20px ${color}, inset 0 0 10px ${color}66`
                  : `0 0 10px ${color}66`,
              }}
            >
              <span className="font-display text-xs font-bold tracking-widest">{tank.id}</span>
              {tank.isEmpty ? (
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
                  Disponible
                </span>
              ) : (
                <div className="mt-1 space-y-0.5 text-center font-mono">
                  <div className="text-sm font-bold">{tank.temp}°C</div>
                  <div className="text-[10px] opacity-80">ABV {tank.abv}%</div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Panel de detalle (mismo panel que ya existía) */}
      <div className="relative z-20 grid grid-cols-1 gap-6 p-6 h-full items-start pt-[26rem] lg:pt-6 lg:pl-[52%]">
        <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl max-w-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#00e1ff] bg-[#00e1ff]/10 px-2.5 py-1 rounded-full border border-[#00e1ff]/20">
                Detalle de Fermentación
              </span>
              <h2 className="font-display text-xl font-bold text-white mt-2">
                TQ-{activeTank.id} <span className="text-gray-400 text-sm font-normal">({activeTank.recipe})</span>
              </h2>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] text-gray-400">Fermentación</p>
              <p className="font-display text-lg font-bold text-[#00e1ff]">{activeTank.progress}%</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
              <p className="font-mono text-[9px] text-gray-400 uppercase">Temperatura</p>
              <p className="font-display text-lg font-bold text-[#FFAA00] mt-1">{activeTank.temp}°C</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
              <p className="font-mono text-[9px] text-gray-400 uppercase">°Plato</p>
              <p className="font-display text-lg font-bold text-[#FFD060] mt-1">{tanks[selectedTankIndex].isEmpty ? '—' : registrosProduccion.find(r => r.fermentadorNum === activeTank.id)?.plato}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
              <p className="font-mono text-[9px] text-gray-400 uppercase">pH Actual</p>
              <p className="font-display text-lg font-bold text-[#00e1ff] mt-1">{activeTank.ph}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#00e1ff]/5 border border-[#00e1ff]/20 space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#00e1ff] font-bold">
              Recomendación de J.A.R.B.E.E.R.
            </p>
            <p className="font-sans text-xs text-gray-300 leading-relaxed">
              {activeTank.isEmpty
                ? 'Tanque disponible para un nuevo lote.'
                : <>Mantener la temperatura actual. Vigilar pH del lote <span className="text-white font-bold">{activeTank.batchId}</span> durante las próximas 24h.</>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}