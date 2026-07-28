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
    currentTemp: '18.7',
    plato: '2.50',
    ph: '4.35',
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
    currentTemp: '1.5',
    plato: '3.00',
    ph: '4.31',
    observations: 'Densidad Original: 10.50 ºP. Densidad Final: 3.00 ºP. ABV: 4.2%. IBU: 20. EBC: 7.0. Lote con temperatura actual 1.5 ºC.'
  }
];

export const INITIAL_FERMENTATION_HISTORY: Record<string, FermentationHistory> = {
  '26001': { lecturas: [] },
  '26002': { lecturas: [] },
  'L26003': { lecturas: [] },
  'L26004': { lecturas: [] }
};