import { useState } from 'react';
import { useRegistros } from '../lib/registrosState';

export function Home() {
  const { registrosProduccion } = useRegistros();
  const [selectedTankIndex, setSelectedTankIndex] = useState(0);

  // Tanques F1 al F6 mapeados dinámicamente con los registros
  const batchesByTank = new Map(registrosProduccion.map((batch) => [batch.fermentadorNum, batch]));
  const tanks = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'].map((tankNum) => {
    const batch = batchesByTank.get(tankNum);
    const isEmpty = !batch;
    const color = isEmpty
      ? tankNum === 'F5'
        ? '#f97316'
        : tankNum === 'F6'
          ? '#34d399'
          : '#ffffff'
      : '#00e1ff';

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
      color,
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

      {/* Contenedor principal de la interfaz superpuesta */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 h-full items-start">
        
        {/* ZONA IZQUIERDA / CENTRAL: Botones interactivos sobre los Tanques F1 - F6 */}
        <div className="lg:col-span-7 grid grid-cols-3 md:grid-cols-6 gap-3 pt-12">
          {tanks.map((tank, idx) => {
            const isSelected = selectedTankIndex === idx;
            return (
              <button
                key={tank.id}
                onClick={() => setSelectedTankIndex(idx)}
                className="flex flex-col items-start p-3 rounded-2xl backdrop-blur-md transition-all cursor-pointer text-left border"
                style={{
                  borderColor: isSelected ? '#00e1ff' : tank.color,
                  boxShadow: isSelected ? `0 0 20px ${tank.color}33` : undefined,
                  background: isSelected ? 'rgba(0,225,255,0.14)' : undefined,
                }}
              >
                <span className="font-display text-sm font-bold mb-2" style={{ color: tank.isEmpty ? tank.color : '#00e1ff' }}>{tank.id}</span>
                <div className="space-y-1 font-mono text-[10px] text-gray-300 w-full">
                  {tank.isEmpty ? (
                    <div className="text-[12px] font-semibold uppercase tracking-[0.22em]" style={{ color: tank.color }}>
                      Ready
                    </div>
                  ) : (
                    <div className="space-y-2 text-center">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-[#00e1ff]">Temperatura</div>
                      <div className="text-lg font-bold text-[#00e1ff]">{tank.temp}°C</div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-[#00e1ff]">ABV</div>
                      <div className="text-lg font-bold text-[#00e1ff]">{tank.abv}%</div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* ZONA DERECHA: Panel Detalle (TQ-03 / Panel Dinámico) */}
        <div className="lg:col-span-5 bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
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

          {/* Métricas del Panel */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
              <p className="font-mono text-[9px] text-gray-400 uppercase">Temperatura</p>
              <p className="font-display text-lg font-bold text-[#FFAA00] mt-1">{activeTank.temp}°C</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
              <p className="font-mono text-[9px] text-gray-400 uppercase">Densidad (SG)</p>
              <p className="font-display text-lg font-bold text-[#FFD060] mt-1">1.048</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
              <p className="font-mono text-[9px] text-gray-400 uppercase">pH Actual</p>
              <p className="font-display text-lg font-bold text-[#00e1ff] mt-1">{activeTank.ph}</p>
            </div>
          </div>

          {/* Recomendación de la IA */}
          <div className="p-4 rounded-2xl bg-[#00e1ff]/5 border border-[#00e1ff]/20 space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#00e1ff] font-bold">
              Recomendación de J.A.R.B.E.E.R.
            </p>
            <p className="font-sans text-xs text-gray-300 leading-relaxed">
              Mantener la temperatura actual. La densidad está en el rango óptimo. Vigilar pH del lote <span className="text-white font-bold">{activeTank.batchId}</span> durante las próximas 24h.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
