import { useState } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import { useRegistros } from '../lib/registrosState';
import { FermenterOverlay } from '../components/FermenterOverlay';
import { BatchDetailsPanel } from '../components/BatchDetailsPanel';
import type { Screen } from '../data/mockData';

interface FermentadoresProps {
  onNavigate?: (s: Screen) => void;
}

// Layout en cuadrícula (no hay imagen de fondo en esta pantalla,
// así que las posiciones son simples porcentajes de una grid 3x2).
const GRID_POSITIONS: Record<string, { top: string; left: string }> = {
  F1: { top: '20%', left: '17%' },
  F2: { top: '20%', left: '50%' },
  F3: { top: '20%', left: '83%' },
  F4: { top: '60%', left: '17%' },
  F5: { top: '60%', left: '50%' },
  F6: { top: '60%', left: '83%' },
};

export function Fermentadores({ onNavigate }: FermentadoresProps) {
  const { registrosProduccion } = useRegistros();
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);

  const batchesByTank = new Map(registrosProduccion.map((batch) => [batch.fermentadorNum, batch]));
  const selectedLote = selectedTankId ? batchesByTank.get(selectedTankId) ?? null : null;

  const activosCount = registrosProduccion.length;
  const vaciosCount = 6 - activosCount;

  return (
    <div className="flex min-h-full flex-col pb-32">
      <ScreenHeader title="Fermentadores" subtitle={`6 fermentadores · ${activosCount} activos · ${vaciosCount} vacíos`} />

      <div className="relative flex-1 min-h-[420px] px-4">
        {Object.keys(GRID_POSITIONS).map((tankId) => (
          <FermenterOverlay
            key={tankId}
            id={tankId}
            lote={batchesByTank.get(tankId) ?? null}
            position={GRID_POSITIONS[tankId]}
            onClick={() => setSelectedTankId(tankId)}
          />
        ))}

        <BatchDetailsPanel
          tankId={selectedTankId}
          lote={selectedLote}
          onClose={() => setSelectedTankId(null)}
          onOpenFicha={() => onNavigate?.('production')}
          onOpenHistorico={() => setSelectedTankId(selectedTankId)}
          onOpenDocumentos={() => onNavigate?.('documents')}
          onHablarIA={() => onNavigate?.('assistant')}
        />
      </div>
    </div>
  );
}
