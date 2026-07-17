export type Screen = 'home' | 'production' | 'documents' | 'assistant' | 'fermentadores' | 'recetas' | 'alertas' | 'analisis';

export const bootSequence = [
  { label: 'AI CORE',           icon: '◈', delay: 480, color: '#FFAA00' },
  { label: 'VOICE ENGINE',      icon: '◉', delay: 460, color: '#00e1ff' },
  { label: 'DOCUMENT VAULT',    icon: '▣', delay: 500, color: '#0087ff' },
  { label: 'PRODUCTION MODULE', icon: '⬡', delay: 520, color: '#00e1ff' },
  { label: 'MEMORY',            icon: '◎', delay: 440, color: '#34d399' },
  { label: 'LOCAL MODE',        icon: '⬢', delay: 480, color: '#FFAA00' },
];

export const systemStatus = {
  state: 'Operativo',
  uptime: '14d 06:42',
  activeBatch: 'Golden Ale 26-017',
  temperature: 64.5,
  targetTemp: 66.0,
  nextTask: 'Medir °Plato',
  network: 'Conectado',
  alerts: 0,
  docsIndexed: 6,
  aiModel: 'JAR-1.0',
  aiStatus: 'Activo',
};

export type RecipeStage = 'Maceración'|'Filtrado'|'Ebullición'|'Whirlpool'|'Fermentación'|'Maduración'|'Envasado';

export interface BatchData {
  batch: string; recipe: string; brewer: string;
  startDate: string; stage: RecipeStage;
  stageProgress: number; volume: number;
  currentTemp: number; targetTemp: number;
  plato: number; ph: number;
  og: number; fg: number; abv: number; ibu: number; ebc: number; carbonation: number;
  observations: string;
  maltas: { name: string; amount: string; ebc: number; supplier: string }[];
  lupulos: { name: string; alpha: string; amount: string; addition: string }[];
  levadura: { name: string; lab: string; format: string; pitch: string; attenuation: string; tempRange: string };
  timeline: { stage: string; done: boolean; temp: number; duration: string }[];
  alcohol: string; color: string; ibuObjetivo: string;
  h2oInicial: string; tempInicial: string; acidoFosforico: string;
  mixTempReal: string; phMaceracion: string; fosfMaceracion: string;
  escalones: { id: number; nombre: string; temp: string; tiempo: string }[];
  enjuagueDir: string; spargeTotal: string; platoPreHervido: string; phMacerado: string; transferencia: string;
  tempHervidoReal: string; fosfMediaHora: string;
  lupulosPlantilla: { id: number; momento: string; variedad: string; cantidad: string }[];
  whirlpoolRemolino: string; whirlpoolReposo: string;
  platoFinal: string; litrosTransfReal: string; fermentadorNum: string; phFinal: string; regFermentacion: string;
  fechaEnvasado: string; totalBotellas: string; numPalets: string; lotesPalets: string;
  barriles20: string; barriles30: string; barriles50: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Lotes reales — fichas técnicas oficiales "Sistema de Gestión JARBIT"
// ─────────────────────────────────────────────────────────────────────────

export const BATCHES: BatchData[] = [
  // ── Golden Ale — Lotes de referencia 26001 / 24005 ──
  {
    batch: '26001', recipe: 'Golden Ale', brewer: 'Juanfran',
    startDate: '2026-07-09', stage: 'Fermentación',
    stageProgress: 68, volume: 1300,
    currentTemp: 20.5, targetTemp: 22.5,
    plato: 9.2, ph: 5.25,
    og: 1.052, fg: 1.012, abv: 5.2, ibu: 28, ebc: 8, carbonation: 2.6,
    observations: 'Rango registrado histórico (lotes 26001 / 24005). Gestión térmica: inoculación a 22.5°C, descensos por purgas controladas (21°C → 20.5°C → 20.2°C), estabilización final en frío a 2°C.',
    maltas: [
      { name: 'Best Pale',           amount: '75–150 kg', ebc: 4,  supplier: 'Weyermann' },
      { name: 'Finest Lager',        amount: '25–75 kg',  ebc: 3,  supplier: 'Weyermann' },
      { name: 'Dextrine',            amount: '5–10 kg',   ebc: 2,  supplier: 'Weyermann' },
      { name: 'Caramalt / Carapils', amount: '5–10 kg',   ebc: 6,  supplier: 'Weyermann' },
      { name: 'Carahell / Crystal',  amount: '2.5–3 kg',  ebc: 25, supplier: 'Weyermann' },
    ],
    lupulos: [
      { name: 'Magnum', alpha: '—', amount: '200 g',     addition: 'F.W.H.' },
      { name: 'Simcoe', alpha: '—', amount: '300–325 g', addition: "5' Final" },
    ],
    levadura: { name: 'Essential Ale', lab: 'Lallemand', format: 'Seca · 500 g', pitch: '500 g / ~1300 L', attenuation: '—', tempRange: '—' },
    timeline: [
      { stage: 'Maceración',  done: true,  temp: 72,   duration: '10-50-20-10 min' },
      { stage: 'Filtrado',    done: true,  temp: 78,   duration: '15 min' },
      { stage: 'Ebullición',  done: true,  temp: 100.7, duration: '75 min' },
      { stage: 'Whirlpool',   done: true,  temp: 85,   duration: '10-20 min' },
      { stage: 'Fermentación',done: false, temp: 20.5, duration: '7 días' },
      { stage: 'Maduración',  done: false, temp: 2,    duration: '14 días' },
      { stage: 'Envasado',    done: false, temp: 0,    duration: '2 h' },
    ],
    alcohol: '5.2', color: '8', ibuObjetivo: '28',
    h2oInicial: '1150–1250', tempInicial: '50.2–52', acidoFosforico: '200–330',
    mixTempReal: '50.2–52', phMaceracion: '5.53', fosfMaceracion: '200–330',
    escalones: [
      { id: 1, nombre: 'E1', temp: '54', tiempo: '10 min' },
      { id: 2, nombre: 'E2', temp: '64', tiempo: '50 min' },
      { id: 3, nombre: 'E3', temp: '72', tiempo: '20 min' },
      { id: 4, nombre: 'E4', temp: '78', tiempo: '10 min' },
    ],
    enjuagueDir: '50–100', spargeTotal: '150–180', platoPreHervido: '—', phMacerado: '5.53', transferencia: '1510',
    tempHervidoReal: '100.7', fosfMediaHora: '50–180',
    lupulosPlantilla: [
      { id: 1, momento: 'F.W.H.', variedad: 'Magnum', cantidad: '200' },
      { id: 2, momento: "5' Final", variedad: 'Simcoe', cantidad: '300–325' },
    ],
    whirlpoolRemolino: '10–20', whirlpoolReposo: '20–25',
    platoFinal: '9.2', litrosTransfReal: '1300', fermentadorNum: 'F-01', phFinal: '5.21–5.30', regFermentacion: '—',
    fechaEnvasado: '', totalBotellas: '', numPalets: '', lotesPalets: '',
    barriles20: '', barriles30: '', barriles50: '',
  },

  // ── Red Ale — Lote de referencia 23018 ──
  {
    batch: '23018', recipe: 'Red Ale', brewer: 'Juanfran',
    startDate: '2026-06-05', stage: 'Envasado',
    stageProgress: 100, volume: 1400,
    currentTemp: 5.15, targetTemp: 5.15,
    plato: 8.8, ph: 5.15,
    og: 1.052, fg: 1.010, abv: 5.6, ibu: 32, ebc: 32, carbonation: 2.4,
    observations: 'Lote completo hasta envasado. Purga total 95 L. Sin desviaciones relevantes en el perfil de maceración.',
    maltas: [
      { name: 'Munich',   amount: '150 kg', ebc: 20, supplier: '—' },
      { name: 'Pale',     amount: '25 kg',  ebc: 5,  supplier: '—' },
      { name: 'Carared',  amount: '20 kg',  ebc: 60, supplier: '—' },
      { name: 'Carahell', amount: '15 kg',  ebc: 25, supplier: '—' },
    ],
    lupulos: [
      { name: 'E.K.G. (East Kent Golding)', alpha: '—', amount: '1400 g', addition: "5' Inicio" },
      { name: 'Cascade',                    alpha: '6.8%', amount: '2000 g', addition: "5' Final" },
    ],
    levadura: { name: 'Essential Ale', lab: 'Lallemand', format: 'Seca · 500 g', pitch: '500 g', attenuation: '—', tempRange: '—' },
    timeline: [
      { stage: 'Maceración',  done: true, temp: 71,   duration: '15-60-15-8 min' },
      { stage: 'Filtrado',    done: true, temp: 78,   duration: '15 min' },
      { stage: 'Ebullición',  done: true, temp: 100.7, duration: '60 min' },
      { stage: 'Whirlpool',   done: true, temp: 85,   duration: '10 min' },
      { stage: 'Fermentación',done: true, temp: 20,   duration: '7 días' },
      { stage: 'Maduración',  done: true, temp: 2,    duration: '14 días' },
      { stage: 'Envasado',    done: true, temp: 0,    duration: '2 h' },
    ],
    alcohol: '5.6', color: '32', ibuObjetivo: '32',
    h2oInicial: '1400', tempInicial: '48', acidoFosforico: '300',
    mixTempReal: '48', phMaceracion: '5.50', fosfMaceracion: '300',
    escalones: [
      { id: 1, nombre: 'E1', temp: '54', tiempo: '15 min' },
      { id: 2, nombre: 'E2', temp: '64', tiempo: '60 min' },
      { id: 3, nombre: 'E3', temp: '71', tiempo: '15 min' },
      { id: 4, nombre: 'E4', temp: '78', tiempo: '8 min' },
    ],
    enjuagueDir: '50', spargeTotal: '250', platoPreHervido: '9.5', phMacerado: '5.54', transferencia: '1410',
    tempHervidoReal: '100.7', fosfMediaHora: '—',
    lupulosPlantilla: [
      { id: 1, momento: "5' Inicio", variedad: 'E.K.G. (East Kent Golding)', cantidad: '1400' },
      { id: 2, momento: "5' Final", variedad: 'Cascade', cantidad: '2000' },
    ],
    whirlpoolRemolino: '10', whirlpoolReposo: '20',
    platoFinal: '8.8', litrosTransfReal: '1360', fermentadorNum: 'F-02', phFinal: '5.15', regFermentacion: '95',
    fechaEnvasado: '', totalBotellas: '2370', numPalets: '', lotesPalets: '893',
    barriles20: '', barriles30: '', barriles50: '',
  },

  // ── Blonde Ale — Lote de referencia 24006 ──
  {
    batch: '24006', recipe: 'Blonde Ale', brewer: 'Juanfran',
    startDate: '2026-05-18', stage: 'Fermentación',
    stageProgress: 55, volume: 1450,
    currentTemp: 18, targetTemp: 20,
    plato: 10.5, ph: 5.21,
    og: 1.061, fg: 1.014, abv: 6.2, ibu: 24, ebc: 6, carbonation: 2.5,
    observations: 'Perfil suave. Adición de ácido fosfórico a la media hora de hervido (130 ml).',
    maltas: [
      { name: 'Best Pale',    amount: '100 kg', ebc: 4,  supplier: '—' },
      { name: 'Finest Lager', amount: '100 kg', ebc: 3,  supplier: '—' },
      { name: 'Munich',       amount: '25 kg',  ebc: 20, supplier: '—' },
      { name: 'Carahell',     amount: '9 kg',   ebc: 25, supplier: '—' },
      { name: 'Carared',      amount: '3 kg',   ebc: 60, supplier: '—' },
    ],
    lupulos: [
      { name: 'Northern Brewer',            alpha: '—', amount: '885 g',  addition: "5' Inicio" },
      { name: 'Hallertauer Hersbruker',     alpha: '—', amount: '1425 g', addition: "5' Final" },
    ],
    levadura: { name: 'Essential Ale', lab: 'Lallemand', format: 'Seca · 500 g', pitch: '500 g', attenuation: '—', tempRange: '—' },
    timeline: [
      { stage: 'Maceración',  done: true,  temp: 72,   duration: '10-50-20-10 min' },
      { stage: 'Filtrado',    done: true,  temp: 78,   duration: '15 min' },
      { stage: 'Ebullición',  done: true,  temp: 100.7, duration: '75 min' },
      { stage: 'Whirlpool',   done: true,  temp: 85,   duration: '10 min' },
      { stage: 'Fermentación',done: false, temp: 18,   duration: '7 días' },
      { stage: 'Maduración',  done: false, temp: 0,    duration: '14 días' },
      { stage: 'Envasado',    done: false, temp: 0,    duration: '2 h' },
    ],
    alcohol: '6.2', color: '6', ibuObjetivo: '24',
    h2oInicial: '1400', tempInicial: '49', acidoFosforico: '330',
    mixTempReal: '49', phMaceracion: '5.53', fosfMaceracion: '330',
    escalones: [
      { id: 1, nombre: 'E1', temp: '54', tiempo: '10 min' },
      { id: 2, nombre: 'E2', temp: '64', tiempo: '50 min' },
      { id: 3, nombre: 'E3', temp: '72', tiempo: '20 min' },
      { id: 4, nombre: 'E4', temp: '78', tiempo: '10 min' },
    ],
    enjuagueDir: '60', spargeTotal: '250', platoPreHervido: '8.7', phMacerado: '5.68', transferencia: '1450',
    tempHervidoReal: '100.7', fosfMediaHora: '130',
    lupulosPlantilla: [
      { id: 1, momento: "5' Inicio", variedad: 'Northern Brewer', cantidad: '885' },
      { id: 2, momento: "5' Final", variedad: 'Hallertauer Hersbruker', cantidad: '1425' },
    ],
    whirlpoolRemolino: '10', whirlpoolReposo: '20',
    platoFinal: '10.5', litrosTransfReal: '1450', fermentadorNum: 'F-04', phFinal: '5.21', regFermentacion: '—',
    fechaEnvasado: '', totalBotellas: '', numPalets: '', lotesPalets: '',
    barriles20: '', barriles30: '', barriles50: '',
  },
];

// Compatibilidad: productionData sigue apuntando al lote activo por defecto (Golden Ale)
export const productionData: BatchData = BATCHES[0];

export type DocCategory = 'Receta'|'COA'|'Insumo'|'Levadura'|'Factura'|'Historial';

export interface DocItem {
  id: string; title: string; category: DocCategory;
  reference: string; date: string; pages: number; excerpt: string; size?: string;
}

export const documents: DocItem[] = [
  { id:'doc-1', title:'Receta Golden Ale',          category:'Receta',    reference:'REC-GA-001',   date:'2026-07-01', pages:4,  size:'840 KB', excerpt:'Ficha técnica completa. Perfil sensorial, maltas, lúpulos y curva de temperaturas.' },
  { id:'doc-1b', title:'Receta Red Ale',            category:'Receta',    reference:'REC-RA-002',   date:'2026-06-05', pages:4,  size:'810 KB', excerpt:'Ficha técnica completa. Maltas Saja/Munich/Pale Ale, lúpulos Cascade/EKG.' },
  { id:'doc-1c', title:'Receta Blonde Ale',         category:'Receta',    reference:'REC-BA-003',   date:'2026-05-18', pages:4,  size:'795 KB', excerpt:'Ficha técnica completa. Perfil suave, maltas Saja/Munich/Pale Ale, lúpulos Cascade/EKG.' },
  { id:'doc-2', title:'COA Cascade 2026',           category:'COA',       reference:'COA-CSC-2026', date:'2026-06-22', pages:2,  size:'320 KB', excerpt:'Certificado de análisis del lote Cascade. Alfa-ácidos 6.8%, aceites y trazabilidad.' },
  { id:'doc-3', title:'Malta Pilsner — Ficha Técnica', category:'Insumo', reference:'INS-PLS-014',  date:'2026-06-15', pages:3,  size:'620 KB', excerpt:'Especificación técnica malta Pilsner. Color EBC, humedad, extracto y poder diastásico.' },
  { id:'doc-4', title:'Levadura Nottingham',        category:'Levadura',  reference:'LEV-NOT-007',  date:'2026-06-10', pages:2,  size:'290 KB', excerpt:'Hoja técnica cepa Nottingham. Rango fermentación, atenuación y recomendaciones.' },
  { id:'doc-5', title:'Historial de lotes 2026',    category:'Historial', reference:'HIS-ALL-2026', date:'2026-07-09', pages:12, size:'1.8 MB', excerpt:'Registro completo de lotes 2026. Métricas, desviaciones y notas de cata.' },
  { id:'doc-6', title:'Factura Weyermann Julio',    category:'Factura',   reference:'FAC-WEY-0726', date:'2026-07-05', pages:1,  size:'180 KB', excerpt:'Factura insumos malteros julio 2026. Malta Pilsner 90 kg, Caramelo 15 kg.' },
];

export interface ChatMessage {
  id: string; role: 'user'|'assistant'; content: string; timestamp: string; navigateTo?: Screen;
}

export const initialChat: ChatMessage[] = [
  { id:'m1', role:'assistant', timestamp:'09:41',
    content:'Sistema en línea. Soy J.A.R.B.E.E.R., tu asistente de producción. Puedo abrir lotes, consultar recetas, registrar métricas y guiarte en cada etapa. ¿Cómo puedo ayudarte?' },
];

export interface VoiceCommand {
  triggers: string[]; userText: string; response: string;
  action?: 'navigate'; target?: Screen;
}

export const voiceCommands: VoiceCommand[] = [
  { triggers:['golden','producción','lote','abre'], userText:'JarBeer, abre la Golden.',
    response:'Abriendo ficha de producción. Lote 26-017 — Golden Ale — activo, fermentación al 68%.',
    action:'navigate', target:'production' },
  { triggers:['temperatura','temp'],    userText:'¿Cuál es la temperatura actual?', response:'Temperatura actual: 64.5 °C. Objetivo: 66.0 °C. Dentro de rango operativo.' },
  { triggers:['documentos','biblioteca'], userText:'Muéstrame los documentos.',
    response:'Abriendo biblioteca documental. 6 documentos disponibles.', action:'navigate', target:'documents' },
  { triggers:['cascade','lúpulo'],      userText:'Buscar Cascade.',
    response:'Localizando COA Cascade 2026. Referencia COA-CSC-2026. Abriendo biblioteca.', action:'navigate', target:'documents' },
  { triggers:['ipa','receta ipa'],      userText:'Abrir receta IPA.',
    response:'Buscando receta IPA en la biblioteca.', action:'navigate', target:'documents' },
  { triggers:['nuevo lote','empieza'],  userText:'Empieza una Golden de 500 litros.', response:'Lote creado. Ficha preparada. Próximo paso: preparar maceración.' },
];

export const quickActions: {
  id: Screen; label: string; description: string; icon: string; value?: string;
}[] = [
  { id:'production', label:'Producción',  description:'Golden Ale 26-017 · Fermentación', icon:'FlaskConical', value:'68%' },
  { id:'documents',  label:'Documentos',  description:'6 archivos indexados',               icon:'Library',      value:'6' },
  { id:'assistant',  label:'Asistente IA',description:'Comando de voz activo',              icon:'MessageSquare',value:'ON' },
];
