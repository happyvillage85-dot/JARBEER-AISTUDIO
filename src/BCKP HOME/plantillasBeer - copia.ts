export interface EscalonMaceracion {
  id: number;
  nombre: string;
  temp: string;
  tiempo: string;
}

export interface IngredienteMalta {
  name: string;
  amount: string;
  ebc: number;
  supplier: string;
}

export interface IngredienteLupulo {
  name: string;
  alpha: string;
  amount: string;
  addition: string;
}

export interface LevaduraInfo {
  name: string;
  lab: string;
  format: string;
  pitch: string;
  attenuation: string;
  tempRange: string;
}

export interface TimelinePaso {
  stage: string;
  done: boolean;
  temp: number;
  duration: string;
}

export interface RegistroProduccion {
  lote: string;
  nombreCerveza: string;
  cervecero: string;
  fechaInicio: string;
  etapa: string;
  progresoEtapa: number;
  volumenLitros: number;
  temperaturaActual: number;
  temperaturaObjetivo: number;
  plato: number;
  ph: number;
  og: number;
  fg: number;
  abv: number;
  ibu: number;
  ebc: number;
  carbonatacion: number;
  observaciones: string;
  maltas: IngredienteMalta[];
  lupulos: IngredienteLupulo[];
  levadura: LevaduraInfo;
  timeline: TimelinePaso[];
  alcohol: string;
  color: string;
  ibuObjetivo: string;
  h2oInicial: string;
  tempInicial: string;
  acidoFosforico: string;
  mixTempReal: string;
  phMaceracion: string;
  fosfMaceracion: string;
  escalones: EscalonMaceracion[];
  enjuagueDir: string;
  spargeTotal: string;
  platoPreHervido: string;
  phMacerado: string;
  transferencia: string;
  tempHervidoReal: string;
  fosfMediaHora: string;
  lupulosPlantilla: { id: number; momento: string; variedad: string; cantidad: string }[];
  whirlpoolRemolino: string;
  whirlpoolReposo: string;
  platoFinal: string;
  litrosTransfReal: string;
  fermentadorNum: string;
  phFinal: string;
  regFermentacion: string;
  fechaEnvasado: string;
  totalBotellas: string;
  numPalets: string;
  lotesPalets: string;
  barriles20: string;
  barriles30: string;
  barriles50: string;
}

export const ejemploProduccionGoldenAle: RegistroProduccion = {
  lote: '26001',
  nombreCerveza: 'Golden Ale',
  cervecero: 'Juanfran',
  fechaInicio: '2026-07-09',
  etapa: 'Fermentación',
  progresoEtapa: 68,
  volumenLitros: 1300,
  temperaturaActual: 20.5,
  temperaturaObjetivo: 22.5,
  plato: 9.2,
  ph: 5.25,
  og: 1.052,
  fg: 1.012,
  abv: 5.2,
  ibu: 28,
  ebc: 8,
  carbonatacion: 2.6,
  observaciones: 'Rango registrado histórico (lotes 26001 / 24005). Gestión térmica: inoculación a 22.5°C, descensos por purgas controladas (21°C → 20.5°C → 20.2°C), estabilización final en frío a 2°C.',
  maltas: [
    { name: 'Best Pale', amount: '75–150 kg', ebc: 4, supplier: 'Weyermann' },
    { name: 'Finest Lager', amount: '25–75 kg', ebc: 3, supplier: 'Weyermann' },
    { name: 'Dextrine', amount: '5–10 kg', ebc: 2, supplier: 'Weyermann' },
    { name: 'Caramalt / Carapils', amount: '5–10 kg', ebc: 6, supplier: 'Weyermann' },
    { name: 'Carahell / Crystal', amount: '2.5–3 kg', ebc: 25, supplier: 'Weyermann' },
  ],
  lupulos: [
    { name: 'Magnum', alpha: '—', amount: '200 g', addition: 'F.W.H.' },
    { name: 'Simcoe', alpha: '—', amount: '300–325 g', addition: "5' Final" },
  ],
  levadura: {
    name: 'Essential Ale',
    lab: 'Lallemand',
    format: 'Seca · 500 g',
    pitch: '500 g / ~1300 L',
    attenuation: '—',
    tempRange: '—',
  },
  timeline: [
    { stage: 'Maceración', done: true, temp: 72, duration: '10-50-20-10 min' },
    { stage: 'Filtrado', done: true, temp: 78, duration: '15 min' },
    { stage: 'Ebullición', done: true, temp: 100.7, duration: '75 min' },
    { stage: 'Whirlpool', done: true, temp: 85, duration: '10-20 min' },
    { stage: 'Fermentación', done: false, temp: 20.5, duration: '7 días' },
    { stage: 'Maduración', done: false, temp: 2, duration: '14 días' },
    { stage: 'Envasado', done: false, temp: 0, duration: '2 h' },
  ],
  alcohol: '5.2',
  color: '8',
  ibuObjetivo: '28',
  h2oInicial: '1150–1250',
  tempInicial: '50.2–52',
  acidoFosforico: '200–330',
  mixTempReal: '50.2–52',
  phMaceracion: '5.53',
  fosfMaceracion: '200–330',
  escalones: [
    { id: 1, nombre: 'E1', temp: '54', tiempo: '10 min' },
    { id: 2, nombre: 'E2', temp: '64', tiempo: '50 min' },
    { id: 3, nombre: 'E3', temp: '72', tiempo: '20 min' },
    { id: 4, nombre: 'E4', temp: '78', tiempo: '10 min' },
  ],
  enjuagueDir: '50–100',
  spargeTotal: '150–180',
  platoPreHervido: '—',
  phMacerado: '5.53',
  transferencia: '1510',
  tempHervidoReal: '100.7',
  fosfMediaHora: '50–180',
  lupulosPlantilla: [
    { id: 1, momento: 'F.W.H.', variedad: 'Magnum', cantidad: '200' },
    { id: 2, momento: "5' Final", variedad: 'Simcoe', cantidad: '300–325' },
  ],
  whirlpoolRemolino: '10–20',
  whirlpoolReposo: '20–25',
  platoFinal: '9.2',
  litrosTransfReal: '1300',
  fermentadorNum: 'F-01',
  phFinal: '5.21–5.30',
  regFermentacion: '—',
  fechaEnvasado: '',
  totalBotellas: '',
  numPalets: '',
  lotesPalets: '',
  barriles20: '',
  barriles30: '',
  barriles50: '',
};