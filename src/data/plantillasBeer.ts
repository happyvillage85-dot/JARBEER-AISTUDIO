// src/data/plantillasBeer.ts

export interface RegistroProduccion {
  nombreCerveza: string;
  lote: string;
  fecha: string;
  h2oInicialLiters: number;
  temperaturaInicialC: number;
  acidoFosforico1aAportacionMl: number;
  maltas: Array<{ nombre: string; cantidadKg: number | string }>;
  maceracion: {
    mixTempC: number | string; // Permitimos string porque en el 26002 pone "1250 l"
    pH: number;
    acidoFosforicoMl?: number | string;
    escalones: Array<{ nombre: string; duracionMin: number }>;
    enjuagueL: number;
    spargingL: number | string;
    degPlato: number | string;
    pHDespuesEnjuague: number;
    transfL: number | string;
  };
  hervido: {
    degPlatoAntesHervido: number;
    pHAntesHervido: number;
    acidoFosforicoMedioHervidoMl: number;
    tiempoHervidoMin: number | string;
    tempHervidoC: number | string;
  };
  lupulosYAdjuntos: Array<{
    momento: string;
    variedad: string;
    cantidadGrOrKg: string;
    tiempoDetalle?: string;
  }>;
  levadura: {
    cepa: string;
    cantidadGr: number;
    degPlatoFinal: number | string;
    pHFinal: number;
    litrosTransferidos: number;
    fermentadorNum: number;
  };
  fermentacionLogistica: {
    purgaTotalL?: number | string;
    envasadoFecha?: string;
    botellas?: number;
    lotesPalets?: string;
    numeroPalets?: number;
    barriles20L?: number;
    barriles30L?: number;
    barriles50L?: number;
    observaciones?: string;
  };
  observacionesProduccion?: string[]; // Para las anotaciones a mano en los márgenes
}

export interface RegistroFermentacion {
  nombreCerveza: string;
  lote: string;
  fechaProduccion: string;
  fermentadorNumero: number;
  controles: Array<{
    fechaControl?: string;
    temperaturaC: number;
    pH?: number;
    degPlato: number;
    observaciones: string;
  }>;
}

// ---------------------------------------------------------
// PRODUCCIONES
// ---------------------------------------------------------
export const registrosProduccion: RegistroProduccion[] = [
  {
    nombreCerveza: "Golden Ale",
    lote: "26001",
    fecha: "",
    h2oInicialLiters: 1250,
    temperaturaInicialC: 52,
    acidoFosforico1aAportacionMl: 200,
    maltas: [
      { nombre: "Best Pale", cantidadKg: 150 },
      { nombre: "Finest Lager", cantidadKg: 25 },
      { nombre: "Caramalt", cantidadKg: 10 },
      { nombre: "CRYSTAL", cantidadKg: 2.5 },
      { nombre: "DEXTRINE", cantidadKg: 5 }
    ],
    maceracion: {
      mixTempC: 52,
      pH: 5.5,
      escalones: [
        { nombre: "54°C", duracionMin: 10 },
        { nombre: "64°C", duracionMin: 50 },
        { nombre: "72°C", duracionMin: 20 },
        { nombre: "78°C", duracionMin: 10 }
      ],
      enjuagueL: 100,
      spargingL: 150,
      degPlato: 9.3,
      pHDespuesEnjuague: 5.87,
      transfL: 1450
    },
    hervido: {
      degPlatoAntesHervido: 8.8,
      pHAntesHervido: 5.81,
      acidoFosforicoMedioHervidoMl: 50,
      tiempoHervidoMin: 75,
      tempHervidoC: 100.3
    },
    lupulosYAdjuntos: [
      { momento: "5' del inicio", variedad: "MAGNUM", cantidadGrOrKg: "200 gr" },
      { momento: "5' del final", variedad: "SIMCOE", cantidadGrOrKg: "325 gr" },
      { momento: "Whirlpool", variedad: "MAGNUM / SIMCOE", cantidadGrOrKg: "-", tiempoDetalle: "20' remolino, 25' reposo" }
    ],
    levadura: {
      cepa: "Lalleman Essential Ale",
      cantidadGr: 500,
      degPlatoFinal: 9.2,
      pHFinal: 5.3,
      litrosTransferidos: 1300,
      fermentadorNum: 2
    },
    fermentacionLogistica: {},
    observacionesProduccion: [
      "Anotación en Maceración - A. Fosfórico: [54º = 10']",
      "El valor Directo está tachado en la hoja."
    ]
  },
  {
    nombreCerveza: "BLONDE",
    lote: "26002",
    fecha: "",
    h2oInicialLiters: 1250,
    temperaturaInicialC: 51,
    acidoFosforico1aAportacionMl: 300,
    maltas: [
      { nombre: "PALE", cantidadKg: 100 },
      { nombre: "FINEST", cantidadKg: 100 },
      { nombre: "MUNICH", cantidadKg: 25 },
      { nombre: "CARAMALT", cantidadKg: 4 },
      { nombre: "CRYSTAL", cantidadKg: 1.5 }
    ],
    maceracion: {
      mixTempC: "1250 l",
      pH: 5.5,
      escalones: [
        { nombre: "54°C", duracionMin: 10 },
        { nombre: "64°C", duracionMin: 50 },
        { nombre: "72°C", duracionMin: 20 },
        { nombre: "78°C", duracionMin: 10 }
      ],
      enjuagueL: 100,
      spargingL: "150 (+ 50/100 l)",
      degPlato: "±11",
      pHDespuesEnjuague: 5.6,
      transfL: 1400
    },
    hervido: {
      degPlatoAntesHervido: 11.3,
      pHAntesHervido: 5.6,
      acidoFosforicoMedioHervidoMl: 150,
      tiempoHervidoMin: 75,
      tempHervidoC: 100.1
    },
    lupulosYAdjuntos: [
      { momento: "5' del inicio", variedad: "NORTHER BREW", cantidadGrOrKg: "1225 gr" },
      { momento: "1/2 Hervido", variedad: "CANDY + Az. Blanco", cantidadGrOrKg: "5kg + 5kg" },
      { momento: "5' del final", variedad: "HALLERTAUER HERSBRUCKER", cantidadGrOrKg: "1385 gr" },
      { momento: "Whirlpool", variedad: "-", cantidadGrOrKg: "-", tiempoDetalle: "20' remolino, 25' reposo" }
    ],
    levadura: {
      cepa: "Lalleman Essential Ale",
      cantidadGr: 500,
      degPlatoFinal: 12.1,
      pHFinal: 5.4,
      litrosTransferidos: 1300,
      fermentadorNum: 1
    },
    fermentacionLogistica: {},
    observacionesProduccion: [
      "Bajo Ácido Fosfórico 1ª aportación pone: (7'35 PL) - x +",
      "En Mix Tº se escribió 1250 l por error aparente.",
      "Transferencia (Trasf): MUY LENTO - ATASCO"
    ]
  },
  {
    nombreCerveza: "Red Ale",
    lote: "L26003",
    fecha: "",
    h2oInicialLiters: 1200,
    temperaturaInicialC: 50.5,
    acidoFosforico1aAportacionMl: 200,
    maltas: [
      { nombre: "Malta Munich", cantidadKg: 150 },
      { nombre: "Malta Pale Ale (SL0751497)", cantidadKg: 25 },
      { nombre: "Malta Caramalt", cantidadKg: 25 },
      { nombre: "Malta Crystal T50", cantidadKg: 1.5 }
    ],
    maceracion: {
      mixTempC: 51,
      pH: 6.1,
      acidoFosforicoMl: 0,
      escalones: [
        { nombre: "54°C", duracionMin: 10 },
        { nombre: "64°C", duracionMin: 50 },
        { nombre: "72°C", duracionMin: 20 },
        { nombre: "78°C", duracionMin: 10 }
      ],
      enjuagueL: 50,
      spargingL: 150,
      degPlato: 10.4,
      pHDespuesEnjuague: 5.3,
      transfL: 1300
    },
    hervido: {
      degPlatoAntesHervido: 10.4,
      pHAntesHervido: 5.3,
      acidoFosforicoMedioHervidoMl: 0,
      tiempoHervidoMin: 60,
      tempHervidoC: 100.5
    },
    lupulosYAdjuntos: [
      { momento: "5' del inicio", variedad: "East Kent Goldings (EKG)", cantidadGrOrKg: "1.1 kg" },
      { momento: "5' del final", variedad: "Cascade", cantidadGrOrKg: "1.55 kg" },
      { momento: "Whirlpool", variedad: "-", cantidadGrOrKg: "-", tiempoDetalle: "10' remolino, 20' reposo" }
    ],
    levadura: {
      cepa: "Layman Essential Ale",
      cantidadGr: 500,
      degPlatoFinal: 10.5,
      pHFinal: 4.2,
      litrosTransferidos: 1250,
      fermentadorNum: 3
    },
    fermentacionLogistica: {
      observaciones: "Siguiendo las instrucciones profesionales actuales, no se realiza parada de diacetilo."
    },
    observacionesProduccion: [
      "En la línea de Hervido, se anotó '100,5 ºC' en el campo de tiempo (Hervido) y el campo Tº se dejó en blanco."
    ]
  },
  {
    nombreCerveza: "Golden Ale",
    lote: "L26004",
    fecha: "",
    h2oInicialLiters: 1250,
    temperaturaInicialC: 52,
    acidoFosforico1aAportacionMl: 200,
    maltas: [
      { nombre: "Best Pale", cantidadKg: 150 },
      { nombre: "Finest Lager", cantidadKg: 25 },
      { nombre: "Caramalt", cantidadKg: 10 },
      { nombre: "CRYSTAL", cantidadKg: 2.5 },
      { nombre: "DEXTRINE", cantidadKg: 5 }
    ],
    maceracion: {
      mixTempC: 52,
      pH: 5.8,
      escalones: [
        { nombre: "54°C", duracionMin: 10 },
        { nombre: "64°C", duracionMin: 50 },
        { nombre: "72°C", duracionMin: 20 },
        { nombre: "78°C", duracionMin: 10 }
      ],
      enjuagueL: 100,
      spargingL: 150,
      degPlato: 9.3,
      pHDespuesEnjuague: 5.87,
      transfL: 1350
    },
    hervido: {
      degPlatoAntesHervido: 9.75,
      pHAntesHervido: 5.8,
      acidoFosforicoMedioHervidoMl: 50,
      tiempoHervidoMin: 75,
      tempHervidoC: 100.3
    },
    lupulosYAdjuntos: [
      { momento: "5' del inicio", variedad: "MAGNUM", cantidadGrOrKg: "200 gr" },
      { momento: "5' del final", variedad: "SIMCOE", cantidadGrOrKg: "325 gr" },
      { momento: "Whirlpool", variedad: "-", cantidadGrOrKg: "-", tiempoDetalle: "20' remolino, 25' reposo" }
    ],
    levadura: {
      cepa: "Lallemand Essential Ale",
      cantidadGr: 500,
      degPlatoFinal: "11.5 (Anotación 10'5)",
      pHFinal: 5.3,
      litrosTransferidos: 1050,
      fermentadorNum: 4
    },
    fermentacionLogistica: {},
    observacionesProduccion: [
      "En ºP final de la levadura, el 11,5 está rodeado con un círculo y tiene un '10'5' escrito justo encima."
    ]
  }
];

// ---------------------------------------------------------
// FERMENTACIONES
// ---------------------------------------------------------
export const registrosFermentacion: RegistroFermentacion[] = [
  {
    nombreCerveza: "Golden Ale",
    lote: "26001",
    fechaProduccion: "2026-07-27",
    fermentadorNumero: 2,
    controles: [
      { temperaturaC: 22.5, pH: 5.3, degPlato: 9.2, observaciones: "Llenado +/- 1300 l" },
      { temperaturaC: 21.0, pH: 3.8, degPlato: 6.4, observaciones: "1ª purga" },
      { temperaturaC: 21.0, pH: 3.7, degPlato: 1.8, observaciones: "PURGA" },
      { temperaturaC: 21.0, pH: 3.7, degPlato: 1.7, observaciones: "PURGA" },
      { temperaturaC: 20.5, degPlato: 1.6, observaciones: "PURGA" },
      { temperaturaC: 20.2, degPlato: 1.6, observaciones: "PURGA" },
      { temperaturaC: 19.5, pH: 3.7, degPlato: 1.6, observaciones: "Bajamos a 2°C" }
    ]
  },
  {
    nombreCerveza: "BLONDE",
    lote: "26002",
    fechaProduccion: "",
    fermentadorNumero: 1,
    controles: []
  },
  {
    nombreCerveza: "Red Ale",
    lote: "L26003",
    fechaProduccion: "",
    fermentadorNumero: 3,
    controles: []
  },
  {
    nombreCerveza: "Golden Ale",
    lote: "L26004",
    fechaProduccion: "",
    fermentadorNumero: 4,
    controles: []
  }
];