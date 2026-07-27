import React, { createContext, useContext, useState } from 'react';
import { INITIAL_PRODUCCION_RECORDS, INITIAL_FERMENTATION_HISTORY, BatchRecord, FermentationHistory } from '../data/plantillasBeer';

interface RegistrosContextType {
  registrosProduccion: BatchRecord[];
  registrosFermentacion: Record<string, FermentationHistory>;
  actualizarRegistroProduccion: (id: string, updates: Partial<BatchRecord>) => void;
}

const RegistrosContext = createContext<RegistrosContextType | undefined>(undefined);

export function RegistrosProvider({ children }: { children: React.ReactNode }) {
  const [registrosProduccion, setRegistrosProduccion] = useState<BatchRecord[]>(INITIAL_PRODUCCION_RECORDS);
  const [registrosFermentacion] = useState<Record<string, FermentationHistory>>(INITIAL_FERMENTATION_HISTORY);

  const actualizarRegistroProduccion = (id: string, updates: Partial<BatchRecord>) => {
    setRegistrosProduccion(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  return (
    <RegistrosContext.Provider value={{ registrosProduccion, registrosFermentacion, actualizarRegistroProduccion }}>
      {children}
    </RegistrosContext.Provider>
  );
}

export function useRegistros() {
  const context = useContext(RegistrosContext);
  if (!context) {
    throw new Error('useRegistros debe ser usado dentro de un RegistrosProvider');
  }
  return context;
}