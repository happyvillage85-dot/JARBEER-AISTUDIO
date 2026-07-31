import { useState } from 'react';
import { useRegistros } from '../lib/registrosState';
import { FermenterOverlay } from '../components/FermenterOverlay';
import { JarbeerCore } from '../components/JarbeerCore';
import { BatchDetailsPanel } from '../components/BatchDetailsPanel';
import type { Screen } from '../data/mockData';
import type { MicState } from '../components/MicButton';
import type { SystemMode } from '../lib/config';

// Posiciones aproximadas de los 6 tanques sobre fondo_pc.png (en %).
// Ajusta top/left mirando la imagen en pantalla hasta que encajen.
const TANK_POSITIONS: Record<string, { top: string; left: string }> = {
  F1: { top: '28%', left: '11%' },
  F2: { top: '28%', left: '24%' },
  F3: { top: '28%', left: '37%' },
  F4: { top: '30%', left: '50%' },
  F5: { top: '32%', left: '63%' },
  F6: { top: '32%', left: '76%' },
};

interface HomeProps {
  micState: MicState;
  onMic: () => void;
  onNavigate: (s: Screen) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  mode: SystemMode;
  onToggleMode: () => void;
}

const MIC_TO_ESTADO: Record<MicState, 'idle' | 'escuchando' | 'pensando' | 'hablando' | 'error'> = {
  idle: 'idle',
  listening: 'escuchando',
  processing: 'pensando',
  responding: 'hablando',
};

export function Home({ micState, onMic, onNavigate }: HomeProps) {
  const { registrosProduccion } = useRegistros();
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);

  const batchesByTank = new Map(registrosProduccion.map((batch) => [batch.fermentadorNum, batch]));
  const selectedLote = selectedTankId ? batchesByTank.get(selectedTankId) ?? null : null;

  const jarbeerEstado = MIC_TO_ESTADO[micState] ?? 'idle';

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden pb-24">
      {/* Overlay de tanques posicionado sobre el fondo global (definido en App.tsx) */}
      <div className="absolute inset-0 z-10">
        {Object.keys(TANK_POSITIONS).map((tankId) => (
          <FermenterOverlay
            key={tankId}
            id={tankId}
            lote={batchesByTank.get(tankId) ?? null}
            position={TANK_POSITIONS[tankId]}
            onClick={() => setSelectedTankId(tankId)}
          />
        ))}
      </div>

      {/* Panel de detalle del tanque seleccionado */}
      <BatchDetailsPanel
        tankId={selectedTankId}
        lote={selectedLote}
        onClose={() => setSelectedTankId(null)}
        onOpenFicha={() => onNavigate('production')}
        onOpenHistorico={() => onNavigate('fermentadores')}
        onOpenDocumentos={() => onNavigate('documents')}
        onHablarIA={() => { onNavigate('assistant'); onMic(); }}
      />

      {/* Núcleo J.A.R.B.E.E.R. flotante, siempre visible, abajo a la derecha */}
      <button
        onClick={onMic}
        className="absolute bottom-6 right-6 z-20 cursor-pointer"
        aria-label="Hablar con J.A.R.B.E.E.R."
      >
        <JarbeerCore estado={jarbeerEstado} size={140} />
      </button>
    </div>
  );
}
