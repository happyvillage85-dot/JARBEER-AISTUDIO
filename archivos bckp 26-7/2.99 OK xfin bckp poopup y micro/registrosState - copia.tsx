import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { RegistroProduccion, ejemploProduccionGoldenAle } from '../data/plantillasBeer';

type ValorCampo = string | number | boolean;

interface RegistrosContextType {
  registros: RegistroProduccion[];
  loteActivoId: string;
  setLoteActivoId: (id: string) => void;
  registroActivo: RegistroProduccion | null;
  actualizarRegistro: (loteId: string, campo: string, valor: ValorCampo) => void;
  obtenerContextoLLM: () => string;
  toolActualizarRegistro: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, { type: string; description: string }>;
      required: string[];
    };
  };
}

const RegistrosContext = createContext<RegistrosContextType | undefined>(undefined);

export const RegistrosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [registros, setRegistros] = useState<RegistroProduccion[]>([ejemploProduccionGoldenAle]);
  const [loteActivoId, setLoteActivoId] = useState<string>("26001");

  const registroActivo = registros.find((r) => r.lote === loteActivoId) || null;

  const validarPropiedadYValor = (campo: string, valor: ValorCampo): boolean => {
    if (!registroActivo) return false;

    if (campo.includes('.')) {
      const partes = campo.split('.');
      let actual: any = registroActivo;
      
      for (let i = 0; i < partes.length - 1; i++) {
        const parte = partes[i];
        if (!actual || typeof actual !== 'object' || !(parte in actual)) {
          console.warn(`[J.A.R.B.E.E.R. OS] Propiedad intermedia inexistente rechazada: ${parte} en ${campo}`);
          return false;
        }
        actual = actual[parte];
      }

      const ultimaParte = partes[partes.length - 1];
      if (!actual || typeof actual !== 'object' || !(ultimaParte in actual)) {
        return false;
      }
    } else {
      if (!(campo in registroActivo)) {
        console.warn(`[J.A.R.B.E.E.R. OS] Propiedad inválida rechazada: ${campo}`);
        return false;
      }
    }

    const campoLower = campo.toLowerCase();
    if (campoLower.includes('temp') || campoLower.includes('ph') || campoLower.includes('litros') || campoLower.includes('kg') || campoLower.includes('gr') || campoLower.includes('ml')) {
      return typeof valor === 'number';
    }

    return true;
  };

  const actualizarRegistro = useCallback((loteId: string, campo: string, valor: ValorCampo) => {
    if (!validarPropiedadYValor(campo, valor)) {
      return;
    }

    setRegistros((prevRegistros) =>
      prevRegistros.map((registro) => {
        if (registro.lote !== loteId) return registro;

        const nuevoRegistro = { ...registro };

        if (campo.includes('.')) {
          const [padre, hijo] = campo.split('.');
          const clavePadre = padre as keyof RegistroProduccion;
          const subObjeto = nuevoRegistro[clavePadre];

          if (subObjeto && typeof subObjeto === 'object' && subObjeto !== null) {
            nuevoRegistro[clavePadre] = {
              ...(subObjeto as Record<string, unknown>),
              [hijo]: valor,
            } as RegistroProduccion[typeof clavePadre];
          }
        } else {
          const claveRaiz = campo as keyof RegistroProduccion;
          (nuevoRegistro[claveRaiz] as ValorCampo) = valor;
        }

        return nuevoRegistro;
      })
    );
  }, [registroActivo]);

  const obtenerContextoLLM = useCallback(() => {
    if (!registroActivo) return "";
    return JSON.stringify({
      lote: registroActivo.lote,
      nombreCerveza: registroActivo.nombreCerveza,
      maceracion: registroActivo.maceracion,
      hervido: registroActivo.hervido,
      levadura: registroActivo.levadura,
    });
  }, [registroActivo]);

  const toolActualizarRegistro = {
    name: "actualizarRegistro",
    description: "Actualiza un parámetro del registro de producción actual. Soporta valores numéricos, de texto o booleanos.",
    parameters: {
      type: "OBJECT",
      properties: {
        loteId: { type: "STRING", description: "El ID del lote (ej: '26001')" },
        campo: { type: "STRING", description: "Nombre de la propiedad exacta a modificar (ej: 'nombreCerveza' o 'maceracion.pH')" },
        valor: { type: "STRING", description: "El nuevo valor a asignar (compatible con cadenas, números y booleanos representados)" }
      },
      required: ["loteId", "campo", "valor"]
    }
  };

  return (
    <RegistrosContext.Provider
      value={{
        registros,
        loteActivoId,
        setLoteActivoId,
        registroActivo,
        actualizarRegistro,
        obtenerContextoLLM,
        toolActualizarRegistro,
      }}
    >
      {children}
    </RegistrosContext.Provider>
  );
};

export const useRegistros = () => {
  const context = useContext(RegistrosContext);
  if (!context) {
    throw new Error("useRegistros debe ser usado dentro de un RegistrosProvider");
  }
  return context;
};