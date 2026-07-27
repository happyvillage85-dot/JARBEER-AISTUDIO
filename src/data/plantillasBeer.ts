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
    id: '26001',
    batch: '26001',
    recipe: 'Golden Ale',
    brewer: 'JuanFran',
    volume: 500,
    stage: 'Fermentación Principal',
    fermentadorNum: 'F1',
    currentTemp: '18.7',
    plato: '12.3',
    ph: '4.32',
    observations: 'Lote 26001 con historial completo de controles de temperatura, pH, grados Plato y purgas[cite: 1].'
  },
  {
    id: '26002',
    batch: '26002',
    recipe: 'Blonde',
    brewer: 'JuanFran',
    volume: 500,
    stage: 'Maduración',
    fermentadorNum: 'F2',
    currentTemp: '17.8',
    plato: '12.1',
    ph: '4.28',
    observations: 'Ficha configurada para actualización dinámica desde la aplicación[cite: 1].'
  },
  {
    id: 'L26003',
    batch: 'L26003',
    recipe: 'Red Ale',
    brewer: 'JuanFran',
    volume: 500,
    stage: 'Fermentación',
    fermentadorNum: 'F3',
    currentTemp: '18.7',
    plato: '12.5',
    ph: '4.35',
    observations: 'Ficha configurada para actualización dinámica desde la aplicación[cite: 1].'
  },
  {
    id: 'L26004',
    batch: 'L26004',
    recipe: 'Golden Ale',
    brewer: 'JuanFran',
    volume: 500,
    stage: 'Secundaria',
    fermentadorNum: 'F4',
    currentTemp: '18.1',
    plato: '11.8',
    ph: '4.31',
    observations: 'Ficha configurada para actualización dinámica desde la aplicación[cite: 1].'
  }
];

export const INITIAL_FERMENTATION_HISTORY: Record<string, FermentationHistory> = {
  '26001': {
    lecturas: [
      { fecha: 'Día 1', plato: 14.5, temp: 19.0, ph: 5.2 },
      { fecha: 'Día 3', plato: 13.2, temp: 18.8, ph: 4.5 },
      { fecha: 'Día 5', plato: 12.3, temp: 18.7, ph: 4.32 }
    ]
  },
  '26002': { lecturas: [] },
  'L26003': { lecturas: [] },
  'L26004': { lecturas: [] }
};