export interface BatchRecord {
  id: string;
  batch: string;
  recipe: string;
  brewer: string;
  volume: number;
  stage: string;
  fermentadorNum: string; // F1, F2, F3, F4...
  currentTemp: string;
  plato: string;
  ph: string;
  abv: string;
  observations: string;
}

export interface FermentationHistory {
  lecturas: Array<{
    fecha: string;
    plato: number;
    temp: number;
    ph: number;
  }>;
}

export const INITIAL_PRODUCCION_RECORDS: BatchRecord[] = [
  {
    id: '26002',
    batch: '26002',
    recipe: 'Blonde Ale',
    brewer: 'JuanFran',
    volume: 1150,
    stage: 'Finalizado',
    fermentadorNum: 'F1',
    currentTemp: '2',
    plato: '3.30',
    ph: '4.28',
    abv: '5.5',
    observations: 'Densidad Original: 13.20 ºP. Densidad Final: 3.30 ºP. ABV: 5.5%. IBU: 28. EBC: 13.5. Lote finalizado, temperatura actual 2 ºC.'
  },
  {
    id: '26001',
    batch: '26001',
    recipe: 'Golden Ale',
    brewer: 'JuanFran',
    volume: 1200,
    stage: 'En proceso de envasado',
    fermentadorNum: 'F2',
    currentTemp: '18.7',
    plato: '1.60',
    ph: '4.32',
    abv: '4.2',
    observations: 'Densidad Original: 9.20 ºP. Densidad Final: 1.60 ºP. ABV: 4.2%. IBU: 18. EBC: 7.5. Lote en proceso de envasado.'
  },
  {
    id: 'L26003',
    batch: 'L26003',
    recipe: 'Red Ale',
    brewer: 'JuanFran',
    volume: 1100,
    stage: 'Trasegado',
    fermentadorNum: 'F3',
    currentTemp: '1.3',
    plato: '2.50',
    ph: '4.35',
    abv: '4.4',
    observations: 'Densidad Original: 10.50 ºP. Densidad Final: 2.50 ºP. ABV: 4.4%. IBU: 22. EBC: 28.0. Lote en trasegado.'
  },
  {
    id: 'L26004',
    batch: 'L26004',
    recipe: 'Golden Ale',
    brewer: 'JuanFran',
    volume: 1050,
    stage: 'Secundaria',
    fermentadorNum: 'F4',
    currentTemp: '1.8',
    plato: '3.00',
    ph: '4.31',
    abv: '4.2',
    observations: 'Densidad Original: 10.50 ºP. Densidad Final: 3.00 ºP. ABV: 4.2%. IBU: 20. EBC: 7.0. Lote con temperatura actual 1.8 ºC.'
  }
];


export const INITIAL_FERMENTATION_HISTORY: Record<string, FermentationHistory> = {
  '26001': {
    lecturas: [
      { fecha: '2026-07-09 08:00', plato: 10.8, temp: 22.5, ph: 5.52 },
      { fecha: '2026-07-10 12:00', plato: 9.8, temp: 21.0, ph: 5.40 },
      { fecha: '2026-07-11 16:30', plato: 9.2, temp: 20.5, ph: 5.25 },
    ]
  },
  '26002': {
    lecturas: [
      { fecha: '2026-07-02 09:15', plato: 5.8, temp: 5.2, ph: 4.60 },
      { fecha: '2026-07-05 10:45', plato: 3.8, temp: 3.5, ph: 4.45 },
      { fecha: '2026-07-08 14:20', plato: 3.3, temp: 2.0, ph: 4.28 },
    ]
  },
  'L26003': {
    lecturas: [
      { fecha: '2026-06-25 11:00', plato: 4.8, temp: 5.5, ph: 4.60 },
      { fecha: '2026-06-28 09:30', plato: 3.5, temp: 2.8, ph: 4.45 },
      { fecha: '2026-07-02 13:10', plato: 2.5, temp: 1.3, ph: 4.35 },
    ]
  },
  'L26004': {
    lecturas: [
      { fecha: '2026-06-20 08:00', plato: 5.2, temp: 3.0, ph: 4.50 },
      { fecha: '2026-06-23 12:15', plato: 4.1, temp: 2.3, ph: 4.38 },
      { fecha: '2026-06-27 15:40', plato: 3.0, temp: 1.8, ph: 4.31 },
    ]
  },
};