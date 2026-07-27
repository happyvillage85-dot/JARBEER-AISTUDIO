import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Cpu, Activity, Thermometer, Clock, Calculator, FileSpreadsheet, FileDown, AlertTriangle, Bell, CheckCircle, Sliders, X, Pin, Maximize2, Minimize2 } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { jsPDF } from 'jspdf';
import { ScreenHeader } from '../components/ScreenHeader';
import { GlassCard } from '../components/GlassCard';
import { BATCHES } from '../data/mockData';

// Histórico de temperaturas de las últimas 12 horas y proyecciones futuras (últimas 3 entradas)
const tempHistoryData = [
  { 
    time: '12h ago', 
    'F-01 (IPA)': 20.1, 'F-02 (Red Ale)': 17.8, 'F-04 (Stout)': 19.2, 'F-06 (Lager)': 11.9,
    'F-01 (Proj)': null, 'F-02 (Proj)': null, 'F-04 (Proj)': null, 'F-06 (Proj)': null 
  },
  { 
    time: '10h ago', 
    'F-01 (IPA)': 20.3, 'F-02 (Red Ale)': 17.9, 'F-04 (Stout)': 19.5, 'F-06 (Lager)': 12.0,
    'F-01 (Proj)': null, 'F-02 (Proj)': null, 'F-04 (Proj)': null, 'F-06 (Proj)': null 
  },
  { 
    time: '8h ago',  
    'F-01 (IPA)': 20.4, 'F-02 (Red Ale)': 18.0, 'F-04 (Stout)': 20.1, 'F-06 (Lager)': 12.1,
    'F-01 (Proj)': null, 'F-02 (Proj)': null, 'F-04 (Proj)': null, 'F-06 (Proj)': null 
  },
  { 
    time: '6h ago',  
    'F-01 (IPA)': 20.2, 'F-02 (Red Ale)': 18.2, 'F-04 (Stout)': 20.8, 'F-06 (Lager)': 12.0,
    'F-01 (Proj)': null, 'F-02 (Proj)': null, 'F-04 (Proj)': null, 'F-06 (Proj)': null 
  },
  { 
    time: '4h ago',  
    'F-01 (IPA)': 20.5, 'F-02 (Red Ale)': 18.1, 'F-04 (Stout)': 21.4, 'F-06 (Lager)': 11.9,
    'F-01 (Proj)': null, 'F-02 (Proj)': null, 'F-04 (Proj)': null, 'F-06 (Proj)': null 
  },
  { 
    time: '2h ago',  
    'F-01 (IPA)': 20.6, 'F-02 (Red Ale)': 18.0, 'F-04 (Stout)': 21.8, 'F-06 (Lager)': 12.1,
    'F-01 (Proj)': null, 'F-02 (Proj)': null, 'F-04 (Proj)': null, 'F-06 (Proj)': null 
  },
  { 
    time: 'Actual',  
    'F-01 (IPA)': 20.5, 'F-02 (Red Ale)': 18.0, 'F-04 (Stout)': 22.0, 'F-06 (Lager)': 12.0,
    'F-01 (Proj)': 20.5, 'F-02 (Proj)': 18.0, 'F-04 (Proj)': 22.0, 'F-06 (Proj)': 12.0 
  },
  { 
    time: 'Est +4h',  
    'F-01 (IPA)': null, 'F-02 (Red Ale)': null, 'F-04 (Stout)': null, 'F-06 (Lager)': null,
    'F-01 (Proj)': 20.2, 'F-02 (Proj)': 17.5, 'F-04 (Proj)': 21.0, 'F-06 (Proj)': 12.1 
  },
  { 
    time: 'Est +8h',  
    'F-01 (IPA)': null, 'F-02 (Red Ale)': null, 'F-04 (Stout)': null, 'F-06 (Lager)': null,
    'F-01 (Proj)': 19.8, 'F-02 (Proj)': 17.0, 'F-04 (Proj)': 19.8, 'F-06 (Proj)': 12.2 
  },
  { 
    time: 'Est +12h', 
    'F-01 (IPA)': null, 'F-02 (Red Ale)': null, 'F-04 (Stout)': null, 'F-06 (Lager)': null,
    'F-01 (Proj)': 19.5, 'F-02 (Proj)': 16.5, 'F-04 (Proj)': 18.5, 'F-06 (Proj)': 12.3 
  },
];

const FERMENTADORES_METADATA = [
  { key: 'F-01 (IPA)', label: 'F-01 (IPA)', color: '#00e1ff', border: 'rgba(0,225,255,0.4)' },
  { key: 'F-02 (Red Ale)', label: 'F-02 (Red Ale)', color: '#FFAA00', border: 'rgba(255,170,0,0.4)' },
  { key: 'F-04 (Stout)', label: 'F-04 (Stout)', color: '#FA6A00', border: 'rgba(250,106,0,0.4)' },
  { key: 'F-06 (Lager)', label: 'F-06 (Lager)', color: '#34d399', border: 'rgba(52,211,153,0.4)' },
];

interface FermenterEstimation {
  id: string;
  recipe: string;
  currentPlato: number;
  targetPlato: number;
  temp: number;
  speed: number; // °P / hora
  hoursRemaining: number;
  status: 'active' | 'completed';
  confidence: number;
  notes: string;
}

const ESTIMATIONS: FermenterEstimation[] = [
  {
    id: 'F-01',
    recipe: 'Golden Ale (Lote 26001)',
    currentPlato: 9.2,
    targetPlato: 2.2,
    temp: 20.5,
    speed: 0.18,
    hoursRemaining: 38.8, // (9.2 - 2.2) / 0.18
    status: 'active',
    confidence: 96,
    notes: 'Descendiendo de manera constante. Temperatura estable en el rango recomendado.'
  },
  {
    id: 'F-02',
    recipe: 'Red Ale (Lote 23018)',
    currentPlato: 8.8,
    targetPlato: 2.2,
    temp: 18.0,
    speed: 0,
    hoursRemaining: 0,
    status: 'completed',
    confidence: 100,
    notes: 'Fermentación totalmente concluida. Listo para envasado.'
  },
  {
    id: 'F-04',
    recipe: 'Stout (Lote 24006)',
    currentPlato: 10.5,
    targetPlato: 2.5,
    temp: 22.0,
    speed: 0.28, // Mayor debido a alta temperatura (22°C)
    hoursRemaining: 28.5, // (10.5 - 2.5) / 0.28
    status: 'active',
    confidence: 91,
    notes: 'Fermentación acelerada por alta temperatura. Recomendado enfriar a 18°C.'
  },
  {
    id: 'F-06',
    recipe: 'Lager (Lote Activo 26019)',
    currentPlato: 6.8,
    targetPlato: 2.0,
    temp: 12.0,
    speed: 0.065, // Muy lento por temperatura baja
    hoursRemaining: 73.8, // (6.8 - 2.0) / 0.065
    status: 'active',
    confidence: 94,
    notes: 'Perfil de fermentación en frío típico de levadura Lager. Curva saludable.'
  },
];

// Función para generar automáticamente eventos basados en cambios significativos de estado
const detectSystemEvents = (): Array<{
  time: string;
  fermenterId: string;
  text: string;
  type: 'temp_adjust' | 'hops' | 'sample' | 'other' | 'system_auto';
}> => {
  const autoEvents: Array<{
    time: string;
    fermenterId: string;
    text: string;
    type: 'temp_adjust' | 'hops' | 'sample' | 'other' | 'system_auto';
  }> = [];

  ESTIMATIONS.forEach(est => {
    // 1. Inicio de fermentación
    autoEvents.push({
      time: '12h ago',
      fermenterId: est.id,
      text: `Inicio de fermentación del lote: ${est.recipe}`,
      type: 'system_auto'
    });

    // 2. Estado Completado
    if (est.status === 'completed') {
      autoEvents.push({
        time: 'Actual',
        fermenterId: est.id,
        text: `Fermentación concluida con éxito. Gravedad estable en ${est.targetPlato.toFixed(1)}°P. Lote listo para envasado.`,
        type: 'system_auto'
      });
    }

    // 3. Alcanzada temperatura objetivo o estabilizada
    if (est.id === 'F-02') {
      autoEvents.push({
        time: '8h ago',
        fermenterId: est.id,
        text: `Alcanzada temperatura de fermentación objetivo de 18.0°C para Red Ale`,
        type: 'system_auto'
      });
    } else if (est.id === 'F-06') {
      autoEvents.push({
        time: '10h ago',
        fermenterId: est.id,
        text: `Alcanzada temperatura objetivo de fermentación en frío (12.0°C) para Lager`,
        type: 'system_auto'
      });
    }

    // 4. Desviación térmica (Alerta / Picos)
    if (est.id === 'F-04') {
      autoEvents.push({
        time: 'Actual',
        fermenterId: est.id,
        text: `⚠️ Alerta: Desviación térmica detectada (+2.8°C sobre consigna). Iniciando enfriamiento correctivo automático.`,
        type: 'system_auto'
      });
    }

    // 5. Proyecciones futuras basadas en IA
    if (est.id === 'F-04') {
      autoEvents.push({
        time: 'Est +12h',
        fermenterId: est.id,
        text: `🔮 Proyección IA: Temperatura objetivo recomendada (18.5°C) alcanzada mediante refrigeración controlada.`,
        type: 'system_auto'
      });
    }
    if (est.id === 'F-01') {
      autoEvents.push({
        time: 'Est +12h',
        fermenterId: est.id,
        text: `🔮 Proyección IA: Transición térmica completada a 19.5°C para estabilización del perfil de ésteres.`,
        type: 'system_auto'
      });
    }
  });

  return autoEvents;
};

export function Analisis() {
  const activos = BATCHES.filter(b => !['Envasado', 'Completado'].includes(b.stage)).length;
  const avgPlato = (BATCHES.reduce((s, b) => s + b.plato, 0) / BATCHES.length).toFixed(1);
  const avgAbv = (BATCHES.reduce((s, b) => s + b.abv, 0) / BATCHES.length).toFixed(1);
  const avgIbu = Math.round(BATCHES.reduce((s, b) => s + b.ibu, 0) / BATCHES.length);

  // Rangos de temperatura preestablecidos por receta
  const RECIPE_RANGES = {
    'F-01': { min: 18.0, max: 21.0, recipe: 'Golden Ale (Lote 26001)' },
    'F-02': { min: 17.0, max: 20.0, recipe: 'Red Ale (Lote 23018)' },
    'F-04': { min: 17.0, max: 20.0, recipe: 'Stout (Lote 24006)' },
    'F-06': { min: 10.0, max: 13.0, recipe: 'Lager (Lote Activo 26019)' },
  };

  // Estado para las temperaturas actuales de los fermentadores con persistencia local
  const [fermenterTemps, setFermenterTemps] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('fermenter_temps_persist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      'F-01': 20.5,
      'F-02': 18.0,
      'F-04': 22.0, // Stout comienza a 22.0°C (fuera de rango 17-20°C)
      'F-06': 12.0,
    };
  });

  // Guardar en localStorage las temperaturas actuales
  useEffect(() => {
    localStorage.setItem('fermenter_temps_persist', JSON.stringify(fermenterTemps));
  }, [fermenterTemps]);

  // Estado para registrar qué alertas han sido descartadas temporalmente
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Función para comprobar desviaciones térmicas
  const checkDeviation = (id: string, temp: number) => {
    const range = RECIPE_RANGES[id as keyof typeof RECIPE_RANGES];
    if (!range) return null;
    if (temp < range.min) {
      return {
        id,
        type: 'under' as const,
        diff: Number((range.min - temp).toFixed(1)),
        min: range.min,
        max: range.max,
        recipe: range.recipe,
      };
    }
    if (temp > range.max) {
      return {
        id,
        type: 'over' as const,
        diff: Number((temp - range.max).toFixed(1)),
        min: range.min,
        max: range.max,
        recipe: range.recipe,
      };
    }
    return null;
  };

  // Obtener todas las desviaciones térmicas actuales
  const activeDeviations = Object.entries(fermenterTemps)
    .map(([id, temp]) => checkDeviation(id, temp))
    .filter((d): d is NonNullable<typeof d> => d !== null);

  // Derivamos los datos de temperatura del gráfico dinámicamente según el estado interactivo de temperaturas
  const dynamicTempHistoryData = tempHistoryData.map(d => {
    if (d.time === 'Actual') {
      return {
        ...d,
        'F-01 (IPA)': fermenterTemps['F-01'] ?? 20.5,
        'F-02 (Red Ale)': fermenterTemps['F-02'] ?? 18.0,
        'F-04 (Stout)': fermenterTemps['F-04'] ?? 22.0,
        'F-06 (Lager)': fermenterTemps['F-06'] ?? 12.0,
        'F-01 (Proj)': fermenterTemps['F-01'] ?? 20.5,
        'F-02 (Proj)': fermenterTemps['F-02'] ?? 18.0,
        'F-04 (Proj)': fermenterTemps['F-04'] ?? 22.0,
        'F-06 (Proj)': fermenterTemps['F-06'] ?? 12.0,
      };
    }
    if (d.time.includes('Est')) {
      const f01Offset = (fermenterTemps['F-01'] ?? 20.5) - 20.5;
      const f02Offset = (fermenterTemps['F-02'] ?? 18.0) - 18.0;
      const f04Offset = (fermenterTemps['F-04'] ?? 22.0) - 22.0;
      const f06Offset = (fermenterTemps['F-06'] ?? 12.0) - 12.0;
      
      return {
        ...d,
        'F-01 (Proj)': d['F-01 (Proj)'] !== null ? Number(((d['F-01 (Proj)'] as number) + f01Offset).toFixed(1)) : null,
        'F-02 (Proj)': d['F-02 (Proj)'] !== null ? Number(((d['F-02 (Proj)'] as number) + f02Offset).toFixed(1)) : null,
        'F-04 (Proj)': d['F-04 (Proj)'] !== null ? Number(((d['F-04 (Proj)'] as number) + f04Offset).toFixed(1)) : null,
        'F-06 (Proj)': d['F-06 (Proj)'] !== null ? Number(((d['F-06 (Proj)'] as number) + f06Offset).toFixed(1)) : null,
      };
    }
    return d;
  });

  // Estado para controlar qué fermentadores están activos en el gráfico
  const [activeLines, setActiveLines] = useState<string[]>(FERMENTADORES_METADATA.map(f => f.key));

  // Estado para las fases de fermentación seleccionadas (Leyenda Interactiva)
  const [selectedPhases, setSelectedPhases] = useState<string[]>(['lag', 'active', 'late', 'conditioning']);

  // Mapeo de tiempos a sus fases de fermentación correspondientes
  const TIME_TO_PHASE: Record<string, string> = {
    '12h ago': 'lag',
    '10h ago': 'lag',
    '8h ago': 'active',
    '6h ago': 'active',
    '4h ago': 'active',
    '2h ago': 'late',
    'Actual': 'late',
    'Est +4h': 'conditioning',
    'Est +8h': 'conditioning',
    'Est +12h': 'conditioning',
  };

  const filteredTempHistoryData = dynamicTempHistoryData.filter(d => {
    const phaseId = TIME_TO_PHASE[d.time];
    return phaseId ? selectedPhases.includes(phaseId) : true;
  });

  const hasVisibleAlert = activeDeviations.some(dev => 
    !dismissedAlerts.includes(dev.id) && 
    activeLines.some(line => line.startsWith(dev.id))
  );

  // Obtener el fermentador único activo en el gráfico si aplica, para personalizar la leyenda
  const singleActiveId = activeLines.length === 1 ? activeLines[0].split(' ')[0] : null;

  // Detalles dinámicos de las fases según la receta y parámetros reales de la cuba seleccionada
  const getDynamicPhases = () => {
    const isLager = singleActiveId === 'F-06';
    const isStout = singleActiveId === 'F-04';

    return [
      {
        id: 'lag',
        name: 'Fase Lag (Inoculación)',
        times: ['12h ago', '10h ago'],
        icon: '🧪',
        color: '#a855f7',
        border: 'rgba(168,85,247,0.3)',
        bg: 'rgba(168,85,247,0.04)',
        desc: isLager 
          ? 'Inoculación en frío a 10.0°C. Crecimiento celular de levadura Lager lento.' 
          : isStout 
            ? 'Inoculación a 22.0°C (inicio cálido). Periodo de adaptación corto.'
            : 'Levadura se aclimata al mosto fresco y prepara la síntesis de enzimas a 18-20°C.',
        status: 'Completada',
      },
      {
        id: 'active',
        name: 'Fermentación Activa',
        times: ['8h ago', '6h ago', '4h ago'],
        icon: '🔥',
        color: '#f97316',
        border: 'rgba(249,115,22,0.3)',
        bg: 'rgba(249,115,22,0.04)',
        desc: isLager 
          ? 'Fermentación estable a 12.0°C. Descenso de densidad constante en frío.'
          : isStout 
            ? 'Atenuación vigorosa acelerada. El metabolismo genera calor intenso.'
            : 'Consumo masivo de azúcares y formación de ésteres aromáticos y alcohol.',
        status: 'Completada',
      },
      {
        id: 'late',
        name: 'Atenuación y Reposo',
        times: ['2h ago', 'Actual'],
        icon: '⚡',
        color: '#06b6d4',
        border: 'rgba(6,182,212,0.3)',
        bg: 'rgba(6,182,212,0.04)',
        desc: isLager 
          ? 'Descanso de diacetilo lento a 12.0°C - 13.0°C. Reducción de notas verdes.'
          : isStout 
            ? 'Fase tardía crítica. Se aconseja enfriamiento correctivo inmediato para mitigar exceso térmico.'
            : 'Fin de la atenuación principal. La levadura reabsorbe compuestos secundarios.',
        status: 'En Curso',
      },
      {
        id: 'conditioning',
        name: 'Maduración (Proyección)',
        times: ['Est +4h', 'Est +8h', 'Est +12h'],
        icon: '❄️',
        color: '#3b82f6',
        border: 'rgba(59,130,246,0.3)',
        bg: 'rgba(59,130,246,0.04)',
        desc: isLager 
          ? 'Proyección IA: Lagering prolongado proyectado a 2°C para clarificación cristalina.'
          : 'Proyección IA: Descenso progresivo de temperatura para maduración y decantación.',
        status: 'Proyectada',
      },
    ];
  };

  const fermentationPhases = getDynamicPhases();

  // Estado para el modo pantalla completa del gráfico (visualización en monitores de control)
  const [isChartExpanded, setIsChartExpanded] = useState(false);

  // Estado para marcadores de tiempo personalizados persistentes en la sesión
  const [customTimeMarkers, setCustomTimeMarkers] = useState<Array<{
    id: string;
    time: string;
    label: string;
    color: string;
  }>>(() => {
    const saved = localStorage.getItem('custom_time_markers_persist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing custom time markers:', e);
      }
    }
    // Marcadores iniciales preestablecidos
    return [
      { id: 'marker-1', time: 'Actual', label: 'Medición de densidad de control', color: '#ff007f' },
      { id: 'marker-2', time: '6h ago', label: 'Cambio de temperatura para diacetilo', color: '#00e1ff' }
    ];
  });

  // Guardar marcadores personalizados en localStorage
  useEffect(() => {
    localStorage.setItem('custom_time_markers_persist', JSON.stringify(customTimeMarkers));
  }, [customTimeMarkers]);

  // Estado para el formulario de adición de marcadores
  const [newMarkerLabel, setNewMarkerLabel] = useState('');
  const [newMarkerTime, setNewMarkerTime] = useState('Actual');
  const [newMarkerColor, setNewMarkerColor] = useState('#ff007f');

  // Estado para los eventos/notas de la línea temporal con persistencia local y autodetectados
  const [timelineEvents, setTimelineEvents] = useState<Array<{
    time: string;
    fermenterId: string;
    text: string;
    type: 'temp_adjust' | 'hops' | 'sample' | 'other' | 'system_auto';
  }>>(() => {
    const autoEvents = detectSystemEvents();
    const saved = localStorage.getItem('timeline_events_persist');
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Mezclamos los eventos guardados por el usuario con los eventos generados automáticamente
        // que no hayan sido borrados o duplicados
        const combined = [...parsed];
        autoEvents.forEach(autoEv => {
          const exists = parsed.some((p: any) => p.time === autoEv.time && p.fermenterId === autoEv.fermenterId && p.text === autoEv.text);
          if (!exists) {
            combined.push(autoEv);
          }
        });
        return combined;
      } catch (e) {
        console.error('Error parsing timeline events from localStorage:', e);
      }
    }
    
    // Si no hay datos guardados, combinamos los eventos manuales de demostración con todos los autodetectados
    const defaultManuals = [
      { time: '6h ago', fermenterId: 'F-04', text: 'Ajuste manual de temperatura de enfriamiento', type: 'temp_adjust' as const },
      { time: '2h ago', fermenterId: 'F-04', text: 'Adición de lúpulo (Dry Hopping)', type: 'hops' as const },
      { time: 'Actual', fermenterId: 'F-01', text: 'Toma de muestra de densidad de control', type: 'sample' as const },
    ];
    
    const combined = [...defaultManuals];
    autoEvents.forEach(autoEv => {
      const exists = combined.some(c => c.time === autoEv.time && c.fermenterId === autoEv.fermenterId && c.text === autoEv.text);
      if (!exists) {
        combined.push(autoEv);
      }
    });
    
    return combined;
  });

  // Efecto para persistir los eventos de la línea temporal en localStorage
  useEffect(() => {
    localStorage.setItem('timeline_events_persist', JSON.stringify(timelineEvents));
  }, [timelineEvents]);

  // Estados para modal de adición de eventos al hacer clic en el gráfico
  const [selectedTimeForEvent, setSelectedTimeForEvent] = useState<string | null>(null);
  const [newEventText, setNewEventText] = useState('');
  const [newEventFermenter, setNewEventFermenter] = useState('F-01');
  const [newEventType, setNewEventType] = useState<'temp_adjust' | 'hops' | 'sample' | 'other' | 'system_auto'>('temp_adjust');

  const toggleLine = (key: string) => {
    setActiveLines(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleChartClick = (state: any) => {
    if (state && state.activeLabel) {
      setSelectedTimeForEvent(state.activeLabel);
      if (activeLines.length > 0) {
        setNewEventFermenter(activeLines[0].split(' ')[0]);
      } else {
        setNewEventFermenter('F-01');
      }
      setNewEventText('');
      setNewEventType('temp_adjust');
    }
  };

  const exportToCSV = (est: typeof ESTIMATIONS[0]) => {
    const f = FERMENTADORES_METADATA.find(meta => meta.key.startsWith(est.id));
    if (!f) return;

    const lineKey = f.key;
    const baseId = est.id;
    const projKey = `${baseId} (Proj)`;

    const headers = ['Periodo', 'Tiempo', 'Temperatura (C)', 'Gravedad (Plato)'];
    const rows = tempHistoryData.map(d => {
      const isEstPeriod = d.time.includes('Est');
      const period = isEstPeriod ? 'Proyeccion IA' : 'Historial Real';
      const tempVal = isEstPeriod 
        ? d[projKey as keyof typeof d] 
        : d[lineKey as keyof typeof d];

      let platoVal = est.currentPlato;
      if (d.time === '12h ago') platoVal = est.currentPlato + (est.speed * 12);
      else if (d.time === '10h ago') platoVal = est.currentPlato + (est.speed * 10);
      else if (d.time === '8h ago') platoVal = est.currentPlato + (est.speed * 8);
      else if (d.time === '6h ago') platoVal = est.currentPlato + (est.speed * 6);
      else if (d.time === '4h ago') platoVal = est.currentPlato + (est.speed * 4);
      else if (d.time === '2h ago') platoVal = est.currentPlato + (est.speed * 2);
      else if (d.time === 'Actual') platoVal = est.currentPlato;
      else if (d.time === 'Est +4h') platoVal = Math.max(est.targetPlato, est.currentPlato - (est.speed * 4));
      else if (d.time === 'Est +8h') platoVal = Math.max(est.targetPlato, est.currentPlato - (est.speed * 8));
      else if (d.time === 'Est +12h') platoVal = Math.max(est.targetPlato, est.currentPlato - (est.speed * 12));

      return [
        period,
        d.time,
        tempVal !== null && tempVal !== undefined ? tempVal.toFixed(1) : 'N/A',
        platoVal.toFixed(2)
      ];
    });

    const csvContent = "\ufeff" + [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_${baseId}_${est.recipe.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (est: typeof ESTIMATIONS[0]) => {
    const f = FERMENTADORES_METADATA.find(meta => meta.key.startsWith(est.id));
    if (!f) return;

    const lineKey = f.key;
    const baseId = est.id;
    const projKey = `${baseId} (Proj)`;

    const doc = new jsPDF();
    
    // Encabezado principal elegante
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("J.A.R.B.E.E.R. OS - REPORTE DE FERMENTACIÓN", 14, 18);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("SISTEMA DE CONTROL INTELIGENTE DE PROCESO", 14, 25);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 32);

    // Detalles del lote / receta
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(`Detalles del Lote: ${est.recipe}`, 14, 50);
    
    doc.setFontSize(10);
    doc.setTextColor(70, 80, 90);
    
    // Caja con bordes para el resumen de parámetros
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(14, 55, 182, 45, 'FD');
    
    doc.text(`ID Cuba: ${est.id}`, 20, 63);
    doc.text(`Temperatura: ${est.temp.toFixed(1)}°C`, 20, 71);
    doc.text(`Gravedad Actual: ${est.currentPlato.toFixed(1)}°P`, 20, 79);
    doc.text(`Gravedad Objetivo: ${est.targetPlato.toFixed(1)}°P`, 20, 87);
    
    doc.text(`Atenuación: -${est.speed > 0 ? est.speed.toFixed(3) : 0}°P/hora`, 110, 63);
    doc.text(`Confianza IA: ${est.confidence}%`, 110, 71);
    doc.text(`Estado: ${est.status === 'completed' ? 'Completado' : 'Activo'}`, 110, 79);
    doc.text(`Tiempo Restante: ${est.status === 'completed' ? 'Listo' : `${est.hoursRemaining.toFixed(1)} h`}`, 110, 87);

    // Historial y proyecciones
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Registro Histórico y Curva de Proyección", 14, 112);
    
    // Tabla
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(14, 117, 182, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // slate-600
    
    doc.text("Periodo", 20, 122);
    doc.text("Tiempo", 70, 122);
    doc.text("Temperatura (°C)", 115, 122);
    doc.text("Densidad (°P)", 160, 122);
    
    let yOffset = 131;
    tempHistoryData.forEach((d, idx) => {
      const isEstPeriod = d.time.includes('Est');
      const period = isEstPeriod ? "Proyección IA" : "Historial Real";
      const tempVal = isEstPeriod ? d[projKey as keyof typeof d] : d[lineKey as keyof typeof d];
      
      let platoVal = est.currentPlato;
      if (d.time === '12h ago') platoVal = est.currentPlato + (est.speed * 12);
      else if (d.time === '10h ago') platoVal = est.currentPlato + (est.speed * 10);
      else if (d.time === '8h ago') platoVal = est.currentPlato + (est.speed * 8);
      else if (d.time === '6h ago') platoVal = est.currentPlato + (est.speed * 6);
      else if (d.time === '4h ago') platoVal = est.currentPlato + (est.speed * 4);
      else if (d.time === '2h ago') platoVal = est.currentPlato + (est.speed * 2);
      else if (d.time === 'Actual') platoVal = est.currentPlato;
      else if (d.time === 'Est +4h') platoVal = Math.max(est.targetPlato, est.currentPlato - (est.speed * 4));
      else if (d.time === 'Est +8h') platoVal = Math.max(est.targetPlato, est.currentPlato - (est.speed * 8));
      else if (d.time === 'Est +12h') platoVal = Math.max(est.targetPlato, est.currentPlato - (est.speed * 12));

      // Color alternado en filas
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, yOffset - 4, 182, 6.5, 'F');
      }

      if (isEstPeriod) {
        doc.setTextColor(217, 119, 6); // color dorado para proyección
      } else {
        doc.setTextColor(30, 41, 59);
      }
      
      doc.text(period, 20, yOffset);
      doc.text(d.time, 70, yOffset);
      doc.text(tempVal !== null && tempVal !== undefined ? `${tempVal.toFixed(1)}°C` : 'N/A', 115, yOffset);
      doc.text(`${platoVal.toFixed(2)}°P`, 160, yOffset);
      
      yOffset += 6.5;
    });

    yOffset += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, yOffset, 196, yOffset);
    yOffset += 8;

    // Caja de comentarios editables para el usuario
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("Anotaciones y Modificaciones del Maestro Cervecero (Editable):", 14, yOffset);
    yOffset += 4;

    try {
      const textField = new (jsPDF as any).API.AcroFormTextField();
      textField.Rect = [14, yOffset, 182, 28];
      textField.multiline = true;
      textField.value = est.notes || "Añadir observaciones sobre el lote...";
      doc.addField(textField);
    } catch (e) {
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(248, 250, 252);
      doc.rect(14, yOffset, 182, 28);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Escriba sus anotaciones aquí directamente en visores PDF compatibles.", 18, yOffset + 6);
    }

    yOffset += 38;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Firma de Liberación: _________________________", 14, yOffset);
    doc.text("Fecha: ____/____/________", 140, yOffset);

    doc.save(`reporte_control_fermentacion_${baseId}.pdf`);
  };

  // Cálculo automático de estadísticas de temperatura para los fermentadores activos
  const temperatureStats = activeLines.map(lineKey => {
    const f = FERMENTADORES_METADATA.find(meta => meta.key === lineKey);
    if (!f) return null;

    const baseId = f.key.split(' ')[0];
    const projKey = `${baseId} (Proj)`;

    // Obtener valores históricos (no nulos)
    const histVals = dynamicTempHistoryData
      .map(d => d[f.key as keyof typeof d] as number | null)
      .filter((v): v is number => v !== null && v !== undefined);

    // Obtener valores proyectados (no nulos)
    const projVals = dynamicTempHistoryData
      .map(d => d[projKey as keyof typeof d] as number | null)
      .filter((v): v is number => v !== null && v !== undefined);

    // Valores totales del periodo visualizado
    const allVals = [...histVals, ...projVals];

    const getStats = (vals: number[]) => {
      if (vals.length === 0) return { min: 0, max: 0, avg: 0 };
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const avg = vals.reduce((sum, v) => sum + v, 0) / vals.length;
      return { min, max, avg };
    };

    return {
      id: baseId,
      label: f.label,
      color: f.color,
      historical: getStats(histVals),
      projection: getStats(projVals),
      overall: getStats(allVals),
    };
  }).filter((s): s is NonNullable<typeof s> => s !== null);

  // Custom tooltip component matching the OS styling and handling projections
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Filtrar y agrupar para un tooltip limpio sin duplicar series históricas y de proyección
      const itemsMap: Record<string, { value: number; stroke: string; name: string }> = {};
      
      payload.forEach((item: any) => {
        const isProj = item.dataKey.endsWith('(Proj)');
        const baseId = item.dataKey.replace(' (Proj)', '').split(' ')[0];
        const meta = FERMENTADORES_METADATA.find(f => f.key.startsWith(baseId));
        
        if (meta) {
          const key = meta.label;
          if (item.value !== null && item.value !== undefined) {
            itemsMap[key] = {
              value: item.value,
              stroke: meta.color,
              name: meta.label + (isProj ? ' (Est.)' : ''),
            };
          }
        }
      });

      const items = Object.values(itemsMap);
      if (items.length === 0) return null;

      // Obtener eventos asociados a este momento
      const events = timelineEvents.filter(e => e.time === label);

      return (
        <div className="rounded-xl border border-white/10 bg-slate-950/90 p-3 shadow-2xl backdrop-blur-md">
          <p className="mb-1.5 font-mono text-[10px] text-gray-400 uppercase tracking-wider">
            {label.includes('Est') ? `🔮 Proyección ${label}` : `⏱️ Historial: ${label}`}
          </p>
          <div className="space-y-1">
            {items.map((item: any) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.stroke }} />
                <span className="font-mono text-xs text-white/90">{item.name}:</span>
                <span className="ml-auto font-mono text-xs font-bold" style={{ color: item.stroke }}>{item.value.toFixed(1)}°C</span>
              </div>
            ))}
          </div>

          {events.length > 0 && (
            <div className="mt-2.5 border-t border-white/5 pt-2 space-y-1.5">
              <p className="font-mono text-[8px] text-cyan-400 uppercase tracking-wider">📝 Eventos registrados:</p>
              {events.map((ev, i) => {
                const meta = FERMENTADORES_METADATA.find(f => f.key.startsWith(ev.fermenterId));
                return (
                  <div key={i} className="rounded bg-white/5 p-1 px-1.5 font-mono text-[9px] text-gray-300">
                    <span className="font-bold" style={{ color: meta?.color || '#a1a1aa' }}>[{ev.fermenterId}]</span> {ev.text}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-full flex-col pb-32">
      <ScreenHeader title="Análisis" subtitle="Rendimiento de producción · IA J.A.R.B.E.E.R." />
      <div className="space-y-3 px-4">

        {/* KPIs principales */}
        <div className="grid grid-cols-2 gap-3">
          <Kpi icon={<Activity size={14} />} label="Lotes activos" value={String(activos)} accent="amber" delay={0.08} />
          <Kpi icon={<BarChart3 size={14} />} label="°Plato medio" value={`${avgPlato}°P`} accent="gold" delay={0.12} />
          <Kpi icon={<TrendingUp size={14} />} label="ABV medio" value={`${avgAbv}%`} accent="cyan" delay={0.16} />
          <Kpi icon={<TrendingDown size={14} />} label="IBU medio" value={String(avgIbu)} accent="emerald" delay={0.20} />
        </div>

        {/* Sistema de Notificaciones de Desviación Térmica (Avisos Visuales) */}
        {activeDeviations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {activeDeviations.map((dev) => {
              const isDismissed = dismissedAlerts.includes(dev.id);
              if (isDismissed) return null;

              const isVisibleOnChart = activeLines.some(line => line.startsWith(dev.id));

              return (
                <div
                  key={dev.id}
                  className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/20 to-red-950/30 p-4 backdrop-blur-md shadow-lg shadow-red-950/20"
                >
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-rose-500 border border-red-500/20 animate-pulse">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-display text-xs font-bold uppercase tracking-wider text-rose-400">
                          ⚠️ ALERTA DE TEMPERATURA - Cuba {dev.id}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              // Autocorregir la temperatura al centro del rango
                              const range = RECIPE_RANGES[dev.id as keyof typeof RECIPE_RANGES];
                              const mid = Number(((range.min + range.max) / 2).toFixed(1));
                              setFermenterTemps(prev => ({
                                ...prev,
                                [dev.id]: mid
                              }));
                              
                              // Registrar el evento automático en la línea temporal
                              setTimelineEvents(prev => [
                                {
                                  time: 'Actual',
                                  fermenterId: dev.id,
                                  text: `Ajuste automático correctivo: Enfriando cuba de ${fermenterTemps[dev.id]}°C a ${mid}°C (Rango óptimo para ${range.recipe})`,
                                  type: 'temp_adjust'
                                },
                                ...prev
                              ]);
                            }}
                            className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                          >
                            🔧 Corregir Automáticamente ({((RECIPE_RANGES[dev.id as keyof typeof RECIPE_RANGES].min + RECIPE_RANGES[dev.id as keyof typeof RECIPE_RANGES].max)/2).toFixed(1)}°C)
                          </button>
                          <button
                            onClick={() => setDismissedAlerts(prev => [...prev, dev.id])}
                            className="rounded-lg bg-white/5 p-1 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="font-sans text-xs text-white/90">
                        La temperatura actual es de <span className="font-bold text-rose-400">{fermenterTemps[dev.id]}°C</span>, desviándose de los parámetros de la receta <span className="text-gray-300 font-medium">"{dev.recipe}"</span> (Rango óptimo: <span className="font-mono text-cyan-400">{dev.min}°C - {dev.max}°C</span>).
                      </p>
                      {!isVisibleOnChart && (
                        <p className="font-mono text-[9px] text-gray-500">
                          💡 Nota: Activa la visualización de la cuba <strong className="text-cyan-500">{dev.id}</strong> en el menú del gráfico para ver la línea.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Recomendación IA */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <GlassCard className="p-4" corners delay={0.24}>
            <div className="mb-3 flex items-center gap-2">
              <Cpu size={14} style={{ color: '#FFAA00' }} />
              <span className="font-display text-sm font-bold text-white">Recomendación IA</span>
            </div>
            <p className="font-sans text-sm leading-relaxed" style={{ color: 'rgba(180,200,216,0.9)' }}>
              El F-04 (Stout) presenta temperatura elevada (22°C). Recomendado bajar a 18-20°C en las próximas 2 horas para evitar ésteres no deseados. El resto de fermentadores muestran parámetros estables.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-lg px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                style={{ background: 'rgba(250,106,0,0.08)', border: '1px solid rgba(250,106,0,0.18)', color: '#FA6A00' }}>Prioridad media</span>
              <span className="font-mono text-[9px]" style={{ color: 'rgba(74,96,112,0.6)' }}>Generado por J.A.R.B.E.E.R.</span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Gráfico de Temperaturas */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }}>
          <GlassCard 
            className={`p-4 transition-all duration-300 ${
              hasVisibleAlert 
                ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-red-950/5 ring-1 ring-red-500/20' 
                : ''
            }`}
            corners 
            delay={0.27}
          >
            <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center border-b border-white/5 pb-3">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <Thermometer size={14} style={{ color: '#00e1ff' }} />
                  <span className="font-display text-sm font-bold text-white">Monitoreo Térmico con Proyección IA (12h)</span>
                </div>
                <p className="font-mono text-[9px] text-gray-500">
                  Visualización interactiva · <span className="text-cyan-400 font-semibold">Haz clic en el gráfico para añadir notas/eventos</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Menú Desplegable de Selección de Cuba */}
                <div className="flex items-center gap-1.5 rounded-xl bg-slate-950/40 px-2.5 py-1.5 border border-white/5">
                  <span className="font-mono text-[9px] text-gray-500 uppercase tracking-wider">Cuba:</span>
                  <select
                    value={activeLines.length === 1 ? activeLines[0] : activeLines.length === FERMENTADORES_METADATA.length ? 'all' : 'custom'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'all') {
                        setActiveLines(FERMENTADORES_METADATA.map(f => f.key));
                      } else if (val === 'custom') {
                        // mantener actual
                      } else {
                        setActiveLines([val]);
                      }
                    }}
                    className="bg-transparent text-white font-mono text-[10px] font-bold focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="all" className="bg-slate-950 text-white font-mono text-xs">📁 Mostrar Todas</option>
                    {FERMENTADORES_METADATA.map(f => (
                      <option key={f.key} value={f.key} className="bg-slate-950 text-white font-mono text-xs">
                        🍺 {f.label.split(' ')[0]}
                      </option>
                    ))}
                    {activeLines.length !== 1 && activeLines.length !== FERMENTADORES_METADATA.length && (
                      <option value="custom" className="bg-slate-950 text-white font-mono text-xs">⚙️ Selecc. Múltiple</option>
                    )}
                  </select>
                </div>

                <div className="hidden h-5 w-px bg-white/10 sm:block" />

                {/* Botones de Selección Rápida */}
                <div className="flex flex-wrap gap-1">
                  {FERMENTADORES_METADATA.map((f) => {
                    const active = activeLines.includes(f.key);
                    return (
                      <button
                        key={f.key}
                        onClick={() => toggleLine(f.key)}
                        className="rounded-full px-2 py-0.5 font-mono text-[9px] transition-all duration-200 border cursor-pointer select-none"
                        style={{
                          backgroundColor: active ? `${f.color}15` : 'transparent',
                          borderColor: active ? f.color : 'rgba(255,255,255,0.05)',
                          color: active ? f.color : 'rgba(180,200,216,0.4)',
                        }}
                      >
                        {f.label.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>

                <div className="hidden h-5 w-px bg-white/10 sm:block" />

                <button
                  type="button"
                  onClick={() => setIsChartExpanded(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-1.5 font-mono text-[10px] font-bold text-cyan-400 transition-all hover:scale-[1.02] cursor-pointer"
                  title="Modo pantalla completa para monitores de control"
                >
                  <Maximize2 size={11} className="text-cyan-400" />
                  <span>Expandir</span>
                </button>
              </div>
            </div>

            {/* Leyenda Interactiva de Fases de Fermentación de la Receta */}
            <div className="mb-4 rounded-2xl border border-white/5 bg-slate-950/40 p-3.5">
              <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Sliders size={13} className="text-cyan-400" />
                  <span className="font-display text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Leyenda de Fases de Fermentación {singleActiveId ? `(${singleActiveId})` : '(Vista Global)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPhases(['lag', 'active', 'late', 'conditioning'])}
                    className="font-mono text-[9px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                  >
                    Mostrar Todo
                  </button>
                  <span className="text-gray-600 text-[10px]">•</span>
                  <span className="font-mono text-[9px] text-gray-400">
                    {selectedPhases.length === 4 ? 'Todas las fases visibles' : `${selectedPhases.length}/4 fases filtradas`}
                  </span>
                </div>
              </div>

              <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {fermentationPhases.map((phase) => {
                  const isActive = selectedPhases.includes(phase.id);
                  return (
                    <div
                      key={phase.id}
                      onClick={() => {
                        setSelectedPhases(prev => {
                          if (prev.includes(phase.id)) {
                            if (prev.length === 1) return prev; // Mantener al menos una fase visible
                            return prev.filter(p => p !== phase.id);
                          } else {
                            return [...prev, phase.id];
                          }
                        });
                      }}
                      className={`group relative overflow-hidden rounded-xl border p-3 transition-all duration-300 cursor-pointer select-none ${
                        isActive
                          ? 'shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:scale-[1.01]'
                          : 'border-white/5 bg-slate-950/10 opacity-30 hover:opacity-50'
                      }`}
                      style={{
                        borderColor: isActive ? phase.border : 'rgba(255,255,255,0.05)',
                        backgroundColor: isActive ? phase.bg : 'rgba(15,23,42,0.1)',
                      }}
                    >
                      {/* Indicador de color lateral */}
                      <div 
                        className="absolute bottom-0 left-0 top-0 w-1 transition-all duration-300"
                        style={{ backgroundColor: phase.color }}
                      />

                      <div className="flex items-start justify-between gap-1.5 pl-1.5">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[8px] text-gray-500 block uppercase tracking-wider">
                            {phase.times.join(' - ')}
                          </span>
                          <span className="font-display text-[11px] font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1">
                            <span>{phase.icon}</span>
                            <span>{phase.name}</span>
                          </span>
                        </div>
                        <span 
                          className="rounded px-1 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider shrink-0"
                          style={{
                            backgroundColor: phase.id === 'conditioning' ? 'rgba(59,130,246,0.1)' : phase.id === 'late' ? 'rgba(6,182,212,0.1)' : 'rgba(168,85,247,0.1)',
                            color: phase.id === 'conditioning' ? '#60a5fa' : phase.id === 'late' ? '#22d3ee' : '#c084fc',
                            border: `1px solid ${phase.id === 'conditioning' ? 'rgba(59,130,246,0.2)' : phase.id === 'late' ? 'rgba(6,182,212,0.2)' : 'rgba(168,85,247,0.2)'}`
                          }}
                        >
                          {phase.status}
                        </span>
                      </div>

                      <p className="mt-2 font-sans text-[10px] text-gray-400 leading-relaxed pl-1.5">
                        {phase.desc}
                      </p>

                      <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-1.5 pl-1.5 font-mono text-[8px] text-gray-500">
                        <span>Filtrar: {isActive ? 'Ocultar' : 'Activar'}</span>
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: phase.color }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-48 w-full cursor-pointer" title="Haz clic en cualquier punto para añadir un evento o nota">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={filteredTempHistoryData} 
                  margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
                  onClick={handleChartClick}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="rgba(180,200,216,0.3)"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="rgba(180,200,216,0.3)"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    domain={[10, 24]}
                    tickFormatter={(v) => `${v}°`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Línea de Referencia que indica el momento "Actual" y divide datos reales de proyecciones */}
                  {selectedPhases.includes('late') && (
                    <ReferenceLine
                      x="Actual"
                      stroke="#FFAA00"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      label={{
                        value: 'Proyección IA 🔮',
                        fill: '#FFAA00',
                        fontSize: 8,
                        position: 'top',
                        fontFamily: 'monospace',
                      }}
                    />
                  )}

                  {/* Marcadores de tiempo personalizados en el Eje X */}
                  {customTimeMarkers.map((marker) => {
                    const isVisible = filteredTempHistoryData.some(d => d.time === marker.time);
                    if (!isVisible) return null;

                    return (
                      <ReferenceLine
                        key={marker.id}
                        x={marker.time}
                        stroke={marker.color}
                        strokeWidth={1.5}
                        strokeDasharray="5 5"
                        label={{
                          value: `📍 ${marker.label}`,
                          fill: marker.color,
                          fontSize: 8,
                          position: 'top',
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                        }}
                      />
                    );
                  })}

                  {/* Líneas de Referencia para Notas y Eventos de la Línea Temporal en el Gráfico */}
                  {timelineEvents.map((ev, idx) => {
                    // Verificar si el fermentador del evento está activo en el gráfico
                    const isFermenterActive = activeLines.some(key => key.startsWith(ev.fermenterId));
                    if (!isFermenterActive) return null;

                    // Verificar si la fase de este evento está activa/seleccionada
                    const eventPhase = TIME_TO_PHASE[ev.time];
                    if (eventPhase && !selectedPhases.includes(eventPhase)) return null;

                    // Asignar colores/estilos según el tipo de evento
                    let color = 'rgba(255, 255, 255, 0.25)';
                    let labelEmoji = '📝';
                    if (ev.type === 'temp_adjust') {
                      color = 'rgba(6, 182, 212, 0.45)'; // cyan-500
                      labelEmoji = '🔧';
                    } else if (ev.type === 'hops') {
                      color = 'rgba(16, 185, 129, 0.45)'; // emerald-500
                      labelEmoji = '🌿';
                    } else if (ev.type === 'sample') {
                      color = 'rgba(245, 158, 11, 0.45)'; // amber-500
                      labelEmoji = '🧪';
                    } else if (ev.type === 'system_auto') {
                      color = 'rgba(168, 85, 247, 0.5)'; // purple-500
                      labelEmoji = '🤖';
                    }

                    return (
                      <ReferenceLine
                        key={`ref-event-${idx}`}
                        x={ev.time}
                        stroke={color}
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        label={{
                          value: `${labelEmoji} [${ev.fermenterId}]`,
                          fill: color,
                          fontSize: 7,
                          position: 'insideBottomLeft',
                          fontFamily: 'monospace',
                        }}
                      />
                    );
                  })}

                  {/* Curvas históricas (Líneas sólidas con animación de entrada) */}
                  {FERMENTADORES_METADATA.map((f) => {
                    const active = activeLines.includes(f.key);
                    return (
                      <Line
                        key={`${f.key}-solid-${active ? 'on' : 'off'}`}
                        type="monotone"
                        dataKey={f.key}
                        stroke={f.color}
                        strokeWidth={active ? 2 : 0}
                        dot={active ? { r: 3, strokeWidth: 1, stroke: f.color } : false}
                        activeDot={active ? { r: 4, strokeWidth: 0 } : false}
                        hide={!active}
                        connectNulls={false}
                        isAnimationActive={true}
                        animationDuration={650}
                        animationEasing="ease-out"
                      />
                    );
                  })}

                  {/* Curvas estimadas de proyección futura (Líneas discontinuas con animación de entrada) */}
                  {FERMENTADORES_METADATA.map((f) => {
                    const active = activeLines.includes(f.key);
                    const projKey = `${f.key.split(' ')[0]} (Proj)`;
                    return (
                      <Line
                        key={`${f.key}-proj-${active ? 'on' : 'off'}`}
                        type="monotone"
                        dataKey={projKey}
                        stroke={f.color}
                        strokeWidth={active ? 1.5 : 0}
                        strokeDasharray="3 3"
                        dot={active ? { r: 2, strokeWidth: 1, stroke: f.color, fill: 'transparent' } : false}
                        activeDot={active ? { r: 3, strokeWidth: 0 } : false}
                        hide={!active}
                        connectNulls={false}
                        isAnimationActive={true}
                        animationDuration={850}
                        animationEasing="ease-out"
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Marcadores de Tiempo de Referencia Personalizados (Eje X) */}
            <div className="mt-4 border-t border-white/5 pt-4">
              <div className="mb-3 flex flex-col justify-between gap-1.5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Pin size={13} className="text-pink-500 animate-bounce" />
                  <span className="font-display text-xs font-bold text-white uppercase tracking-wider">
                    Marcadores de Referencia Personalizados (Eje X)
                  </span>
                </div>
                <span className="font-mono text-[8px] text-pink-400">
                  📍 Puntos de referencia persistentes en la sesión
                </span>
              </div>

              {/* Formulario rápido para añadir marcador */}
              <div className="mb-4 rounded-xl border border-pink-500/15 bg-pink-950/5 p-3.5 shadow-lg shadow-pink-950/10">
                <div className="grid gap-3 sm:grid-cols-12 items-end">
                  {/* Etiqueta */}
                  <div className="sm:col-span-5">
                    <label className="block font-mono text-[8px] uppercase tracking-wider text-gray-400 mb-1">
                      Etiqueta del Marcador:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Cambio de temperatura, Medición de densidad..."
                      value={newMarkerLabel}
                      onChange={(e) => setNewMarkerLabel(e.target.value)}
                      maxLength={40}
                      className="w-full rounded-lg bg-slate-950/60 border border-white/10 px-2.5 py-1.5 text-white font-sans text-xs focus:outline-none focus:border-pink-500 transition-colors placeholder:text-gray-600"
                    />
                  </div>

                  {/* Punto en el Eje X */}
                  <div className="sm:col-span-3">
                    <label className="block font-mono text-[8px] uppercase tracking-wider text-gray-400 mb-1">
                      Momento (Eje X):
                    </label>
                    <select
                      value={newMarkerTime}
                      onChange={(e) => setNewMarkerTime(e.target.value)}
                      className="w-full rounded-lg bg-slate-950/60 border border-white/10 px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-pink-500 transition-colors cursor-pointer"
                    >
                      <option value="Actual" className="bg-slate-950 text-white">⏱️ Actual (Momento Clave)</option>
                      <option value="2h ago" className="bg-slate-950 text-white">⏱️ Hace 2 horas</option>
                      <option value="4h ago" className="bg-slate-950 text-white">⏱️ Hace 4 horas</option>
                      <option value="6h ago" className="bg-slate-950 text-white">⏱️ Hace 6 horas</option>
                      <option value="8h ago" className="bg-slate-950 text-white">⏱️ Hace 8 horas</option>
                      <option value="10h ago" className="bg-slate-950 text-white">⏱️ Hace 10 horas</option>
                      <option value="12h ago" className="bg-slate-950 text-white">⏱️ Hace 12 horas</option>
                      <option value="Est +4h" className="bg-slate-950 text-white">🔮 Est +4 horas</option>
                      <option value="Est +8h" className="bg-slate-950 text-white">🔮 Est +8 horas</option>
                      <option value="Est +12h" className="bg-slate-950 text-white">🔮 Est +12 horas</option>
                    </select>
                  </div>

                  {/* Selección de Color */}
                  <div className="sm:col-span-2">
                    <label className="block font-mono text-[8px] uppercase tracking-wider text-gray-400 mb-1.5">
                      Color de Línea:
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[
                        { hex: '#ff007f', label: 'Rosa' },
                        { hex: '#00e1ff', label: 'Cian' },
                        { hex: '#FFAA00', label: 'Oro' },
                        { hex: '#34d399', label: 'Verde' },
                        { hex: '#c084fc', label: 'Morado' }
                      ].map((colorOpt) => (
                        <button
                          key={colorOpt.hex}
                          type="button"
                          onClick={() => setNewMarkerColor(colorOpt.hex)}
                          className={`h-4.5 w-4.5 rounded-full border transition-transform cursor-pointer hover:scale-125 ${
                            newMarkerColor === colorOpt.hex ? 'border-white scale-110 ring-1 ring-white/30' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: colorOpt.hex }}
                          title={colorOpt.label}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Botón Añadir */}
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!newMarkerLabel.trim()) return;
                        const id = 'marker-' + Date.now();
                        setCustomTimeMarkers(prev => [
                          ...prev,
                          {
                            id,
                            time: newMarkerTime,
                            label: newMarkerLabel.trim(),
                            color: newMarkerColor
                          }
                        ]);
                        setNewMarkerLabel('');
                      }}
                      disabled={!newMarkerLabel.trim()}
                      className="w-full rounded-lg bg-pink-600 hover:bg-pink-500 active:bg-pink-700 py-1.5 font-mono text-[10px] font-bold text-white shadow-md shadow-pink-500/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      📌 Fijar Punto
                    </button>
                  </div>
                </div>

                {/* Etiquetas preestablecidas rápidas */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-2.5">
                  <span className="font-mono text-[8px] text-gray-500 uppercase tracking-wider">Sugerencias:</span>
                  {[
                    'Cambio de temperatura',
                    'Medición de densidad',
                    'Ajuste de pH',
                    'Muestra de laboratorio',
                    'Adición de lúpulo (Dry-Hop)'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewMarkerLabel(preset)}
                      className="rounded bg-white/5 border border-white/5 px-2 py-0.5 font-mono text-[9px] text-gray-400 hover:text-pink-400 hover:border-pink-500/20 hover:bg-pink-950/5 transition-all cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de marcadores activos */}
              {customTimeMarkers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/5 bg-slate-900/10 p-4 text-center">
                  <p className="font-mono text-[10px] text-gray-500">
                    No tienes marcadores de tiempo personalizados. Añade uno arriba para ver la línea de referencia vertical en el gráfico.
                  </p>
                </div>
              ) : (
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {customTimeMarkers.map((marker) => {
                    const isVisible = filteredTempHistoryData.some(d => d.time === marker.time);
                    return (
                      <div
                        key={marker.id}
                        className={`relative overflow-hidden rounded-xl border bg-slate-950/20 p-2.5 transition-all ${
                          !isVisible ? 'opacity-40' : ''
                        }`}
                        style={{ borderColor: `${marker.color}25` }}
                      >
                        {/* Pequeña barra lateral de color */}
                        <div className="absolute top-0 bottom-0 left-0 w-1" style={{ backgroundColor: marker.color }} />
                        
                        <div className="flex items-start justify-between gap-1.5 pl-2">
                           <div className="space-y-0.5 min-w-0">
                             <span className="font-display text-[11px] font-bold text-white truncate block">
                               {marker.label}
                             </span>
                             <span className="font-mono text-[9px] text-gray-400 block">
                               Momento: <span style={{ color: marker.color }} className="font-bold">{marker.time}</span>
                               {!isVisible && <span className="text-gray-600"> (Ocultado)</span>}
                             </span>
                           </div>
                           <button
                             type="button"
                             onClick={() => {
                               setCustomTimeMarkers(prev => prev.filter(m => m.id !== marker.id));
                             }}
                             className="text-gray-500 hover:text-rose-400 p-0.5 transition-colors cursor-pointer text-xs shrink-0"
                             title="Eliminar marcador"
                           >
                             ✕
                           </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Registro de Eventos e Hitos (Línea Temporal) */}
            <div className="mt-4 border-t border-white/5 pt-4">
              <div className="mb-3 flex flex-col justify-between gap-1.5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Activity size={14} style={{ color: '#00e1ff' }} />
                  <span className="font-display text-xs font-bold text-white uppercase tracking-wider">
                    Línea Temporal de Notas y Ajustes de Proceso
                  </span>
                </div>
                <span className="font-mono text-[8px] text-gray-500">
                  Haz clic en el gráfico para registrar eventos
                </span>
              </div>

              {timelineEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-center border border-dashed border-white/5 rounded-xl bg-slate-900/10">
                  <p className="font-mono text-[10px] text-gray-500">No hay eventos registrados. Haz clic en un punto del gráfico arriba para registrar uno.</p>
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {timelineEvents.map((ev, idx) => {
                    const meta = FERMENTADORES_METADATA.find(f => f.key.startsWith(ev.fermenterId));
                    let typeLabel = 'Otro';
                    let typeColor = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
                    if (ev.type === 'temp_adjust') {
                      typeLabel = '🔧 Temp';
                      typeColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
                    } else if (ev.type === 'hops') {
                      typeLabel = '🌿 Lúpulo';
                      typeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                    } else if (ev.type === 'sample') {
                      typeLabel = '🧪 Muestra';
                      typeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    } else if (ev.type === 'system_auto') {
                      typeLabel = '🤖 Auto IA';
                      typeColor = 'bg-purple-500/15 text-purple-400 border-purple-500/30 font-bold';
                    }

                    return (
                      <div
                        key={idx}
                        className={`flex-shrink-0 w-52 rounded-xl border p-2.5 transition-all flex flex-col justify-between animate-none ${
                          ev.type === 'system_auto' 
                            ? 'border-purple-500/10 bg-purple-950/5 hover:bg-purple-950/10' 
                            : 'border-white/5 bg-slate-950/30 hover:bg-slate-950/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded border" style={{ color: meta?.color, borderColor: `${meta?.color}20`, backgroundColor: `${meta?.color}08` }}>
                              {ev.fermenterId}
                            </span>
                            <span className="font-mono text-[8px] text-gray-500 flex items-center gap-1">
                              {ev.time}
                            </span>
                          </div>
                          <p className="font-sans text-[10px] text-white/95 line-clamp-2 min-h-[30px] leading-relaxed">
                            {ev.text}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5">
                          <span className={`font-mono text-[8px] px-1 py-0.5 rounded border ${typeColor}`}>
                            {typeLabel}
                          </span>
                          <button
                            onClick={() => {
                              setTimelineEvents(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="font-mono text-[8px] text-rose-500 hover:text-rose-400 cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Panel de Simulación y Ajuste de Temperatura (Fácil Acceso para Pruebas e Interacción) */}
            <div className="mt-6 border-t border-white/5 pt-4">
              <div className="mb-3 flex items-center gap-2">
                <Sliders size={14} style={{ color: '#00e1ff' }} />
                <span className="font-display text-xs font-bold text-white uppercase tracking-wider">
                  Panel de Simulación Térmica de Cubas
                </span>
              </div>
              <p className="mb-3 font-sans text-[11px] text-gray-400 leading-normal">
                Modifica los rangos y temperaturas de cada cuba para ver cómo reacciona el gráfico, se actualizan las estimaciones, y se disparan/apagan las notificaciones del sistema en tiempo real.
              </p>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                {Object.entries(RECIPE_RANGES).map(([id, range]) => {
                  const currentTemp = fermenterTemps[id] ?? range.min;
                  const dev = checkDeviation(id, currentTemp);
                  const meta = FERMENTADORES_METADATA.find(m => m.key.startsWith(id));

                  return (
                    <div 
                      key={id}
                      className={`rounded-xl border p-3 bg-slate-950/20 backdrop-blur-sm transition-all ${
                        dev 
                          ? 'border-red-500/30 bg-red-950/5 shadow-[0_2px_10px_rgba(239,68,68,0.04)]' 
                          : 'border-white/5 bg-slate-950/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border" style={{ color: meta?.color, borderColor: `${meta?.color}20`, backgroundColor: `${meta?.color}08` }}>
                          {id}
                        </span>
                        <span className="font-mono text-[9px] text-gray-400 truncate max-w-[100px]" title={range.recipe}>
                          {range.recipe.split(' ')[0]}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="font-sans text-[10px] text-gray-500">Temp. actual:</span>
                        <span className={`font-mono text-xs font-bold ${dev ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {currentTemp.toFixed(1)}°C
                        </span>
                      </div>

                      <input 
                        type="range"
                        min={id === 'F-06' ? 8 : 14}
                        max={id === 'F-06' ? 18 : 26}
                        step="0.1"
                        value={currentTemp}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setFermenterTemps(prev => ({ ...prev, [id]: val }));
                          
                          // Si vuelve a rango o cambia, opcionalmente permitimos mostrar alertas nuevas
                          if (dismissedAlerts.includes(id)) {
                            setDismissedAlerts(prev => prev.filter(x => x !== id));
                          }
                        }}
                        className="w-full accent-cyan-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer mb-2"
                      />

                      <div className="flex justify-between font-mono text-[8px] text-gray-500">
                        <span>{range.min}°C (mín)</span>
                        <span>{range.max}°C (máx)</span>
                      </div>

                      {dev ? (
                        <div className="mt-2.5 rounded-lg bg-rose-500/10 p-1.5 border border-rose-500/20 text-center animate-pulse">
                          <span className="font-mono text-[8px] text-rose-400 font-bold uppercase block">
                            ⚠️ {dev.type === 'over' ? `Exceso (+${dev.diff}°C)` : `Déficit (-${dev.diff}°C)`}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-2.5 rounded-lg bg-emerald-500/5 p-1.5 border border-emerald-500/10 text-center">
                          <span className="font-mono text-[8px] text-emerald-400 uppercase block font-semibold">
                            ✅ Rango Óptimo
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel de Estimación de Tiempo Restante basado en Temperatura y Plato */}
            <div className="mt-6 border-t border-white/5 pt-4">
              <div className="mb-3 flex flex-col justify-between gap-1.5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Clock size={14} style={{ color: '#FFAA00' }} className="animate-pulse" />
                  <span className="font-display text-xs font-bold text-white uppercase tracking-wider">
                    Tiempo Restante Estimado (Modelado de Plato y Temperatura)
                  </span>
                </div>
                <span className="font-mono text-[9px] text-emerald-400 flex items-center gap-1 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10 self-start sm:self-auto">
                  <span className="h-1 w-1 rounded-full bg-emerald-400 animate-ping" /> Motor J.A.R.B.E.E.R. v1.1
                </span>
              </div>

              {/* Lista dinámica de fermentadores activos y sus predicciones de fin */}
              <div className="grid gap-3 sm:grid-cols-2">
                {ESTIMATIONS.filter(est => activeLines.some(lineKey => lineKey.includes(est.id))).map((est) => {
                  const metadata = FERMENTADORES_METADATA.find(f => f.key.includes(est.id));
                  const progressPercentage = est.status === 'completed' 
                    ? 100 
                    : Math.min(100, Math.round(((12 - est.currentPlato) / (12 - est.targetPlato)) * 100));

                  return (
                    <div
                      key={est.id}
                      className="rounded-xl border border-white/5 bg-slate-900/20 p-3 transition-all hover:bg-slate-900/40"
                      style={{ borderLeftWidth: '3px', borderLeftColor: metadata?.color }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-display text-xs font-bold text-white">{est.recipe}</p>
                          <p className="mt-0.5 font-mono text-[9px] text-gray-500">
                            ID Cuba: <span style={{ color: metadata?.color }} className="font-bold">{est.id}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-[10px] font-bold text-amber-400">
                            {est.status === 'completed' ? 'Completado' : `~${est.hoursRemaining.toFixed(1)} h`}
                          </span>
                          <p className="font-mono text-[8px] text-gray-500">
                            {est.status === 'completed' ? 'Listo' : `~${(est.hoursRemaining / 24).toFixed(1)} días`}
                          </p>
                        </div>
                      </div>

                      {/* Progreso estimado */}
                      <div className="mt-2.5">
                        <div className="mb-1 flex items-center justify-between font-mono text-[8px] text-gray-400">
                          <span>Plato: {est.currentPlato.toFixed(1)}°P → Objetivo: {est.targetPlato.toFixed(1)}°P</span>
                          <span>Progreso: {progressPercentage}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${progressPercentage}%`,
                              backgroundColor: metadata?.color,
                              boxShadow: `0 0 8px ${metadata?.color}40`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Parámetros en los que se fundamenta la proyección */}
                      <div className="mt-2.5 flex items-center justify-between rounded-lg bg-slate-950/40 px-2 py-1.5 font-mono text-[9px]">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Thermometer size={10} style={{ color: metadata?.color }} />
                          <span>T: {(fermenterTemps[est.id] ?? est.temp).toFixed(1)}°C</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <BarChart3 size={10} className="text-amber-500" />
                          <span>Velocidad: -{est.speed > 0 ? `${est.speed.toFixed(3)}°P/h` : '0°P/h'}</span>
                        </div>
                        <div className="text-gray-400">
                          <span>Fiabilidad: <span className="text-emerald-400 font-bold">{est.confidence}%</span></span>
                        </div>
                      </div>

                      <p className="mt-2 font-sans text-[10px] text-gray-400 italic leading-snug">
                        💡 {est.notes}
                      </p>

                      {/* Botones de Exportación */}
                      <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-white/5 pt-2.5">
                        <span className="font-mono text-[8px] text-gray-500 mr-auto">Análisis Externo:</span>
                        <button
                          onClick={() => exportToCSV(est)}
                          className="flex items-center gap-1 rounded bg-slate-800/50 hover:bg-slate-700/50 text-[9px] font-mono font-bold text-cyan-400 border border-cyan-400/10 px-2 py-1 transition-all cursor-pointer active:scale-95"
                          title="Descargar historial completo en CSV"
                        >
                          <FileSpreadsheet size={10} />
                          <span>CSV</span>
                        </button>
                        <button
                          onClick={() => exportToPDF(est)}
                          className="flex items-center gap-1 rounded bg-slate-800/50 hover:bg-slate-700/50 text-[9px] font-mono font-bold text-amber-400 border border-amber-400/10 px-2 py-1 transition-all cursor-pointer active:scale-95"
                          title="Generar reporte PDF oficial editable"
                        >
                          <FileDown size={10} />
                          <span>PDF Editable</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
                {ESTIMATIONS.filter(est => activeLines.some(lineKey => lineKey.includes(est.id))).length === 0 && (
                  <div className="col-span-2 flex flex-col items-center justify-center py-6 text-center border border-dashed border-white/5 rounded-xl">
                    <p className="font-mono text-xs text-gray-500">Selecciona algún fermentador arriba para estimar y proyectar parámetros.</p>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Resumen Estadístico de Temperatura */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <GlassCard className="p-4" corners delay={0.28}>
            <div className="mb-3 flex flex-col justify-between gap-1.5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Calculator size={14} style={{ color: '#00e1ff' }} />
                <span className="font-display text-sm font-bold text-white">Resumen Estadístico de Temperatura</span>
              </div>
              <span className="font-mono text-[9px] text-gray-400">
                Periodo: Historial (12h) + Proyección (12h)
              </span>
            </div>

            {temperatureStats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-white/5 rounded-xl">
                <p className="font-mono text-xs text-gray-500">Selecciona algún fermentador arriba para ver el cálculo estadístico en tiempo real.</p>
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {temperatureStats.map((stat) => (
                  <div
                    key={stat.id}
                    className="rounded-xl border border-white/5 bg-slate-900/20 p-3 transition-all hover:bg-slate-900/40"
                    style={{ borderTopWidth: '3px', borderTopColor: stat.color }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display text-xs font-bold text-white">{stat.label}</span>
                      <span
                        className="rounded-full px-1.5 py-0.5 font-mono text-[8px] font-bold"
                        style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                      >
                        {stat.id}
                      </span>
                    </div>

                    {/* Tabla de Estadísticas */}
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-3 gap-1 bg-slate-950/30 rounded-lg p-2 font-mono text-[10px]">
                        <div className="text-center">
                          <span className="block text-[8px] text-gray-500 uppercase tracking-wider mb-0.5">Mín</span>
                          <span className="font-bold text-cyan-400">{stat.overall.min.toFixed(1)}°C</span>
                        </div>
                        <div className="text-center border-x border-white/5">
                          <span className="block text-[8px] text-gray-500 uppercase tracking-wider mb-0.5">Med</span>
                          <span className="font-bold text-amber-400">{stat.overall.avg.toFixed(1)}°C</span>
                        </div>
                        <div className="text-center">
                          <span className="block text-[8px] text-gray-500 uppercase tracking-wider mb-0.5">Máx</span>
                          <span className="font-bold text-rose-400">{stat.overall.max.toFixed(1)}°C</span>
                        </div>
                      </div>

                      {/* Desglose Historial vs Proyección */}
                      <div className="rounded-lg bg-slate-950/15 p-2 font-mono text-[8px] space-y-1 text-gray-400">
                        <div className="flex justify-between">
                          <span>Historial (12h):</span>
                          <span className="text-white/80">
                            {stat.historical.min.toFixed(1)}° a {stat.historical.max.toFixed(1)}° (med: {stat.historical.avg.toFixed(1)}°)
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-1">
                          <span>🔮 Proyección:</span>
                          <span className="text-amber-300/80">
                            {stat.projection.min.toFixed(1)}° a {stat.projection.max.toFixed(1)}° (med: {stat.projection.avg.toFixed(1)}°)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Distribución de lotes */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.30 }}>
          <GlassCard className="p-4" corners delay={0.30}>
            <p className="mb-3 font-display text-sm font-bold text-white">Distribución de lotes</p>
            <div className="space-y-2.5">
              {BATCHES.map((b, i) => (
                <div key={b.batch} className="flex items-center gap-3">
                  <span className="w-20 truncate font-mono text-[10px]" style={{ color: 'rgba(180,200,216,0.8)' }}>{b.recipe}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg,#FFAA00,#FA6A00)' }}
                      initial={{ width: 0 }} animate={{ width: `${b.stageProgress}%` }}
                      transition={{ duration: 1, delay: 0.35 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[10px] font-bold" style={{ color: '#FFAA00' }}>{b.stageProgress}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Modal de adición de eventos al hacer clic en el gráfico */}
      {selectedTimeForEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-md"
          >
            <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-cyan-400 animate-pulse" />
                <h3 className="font-display text-sm font-bold text-white">Registrar Evento en Línea Temporal</h3>
              </div>
              <button
                onClick={() => setSelectedTimeForEvent(null)}
                className="font-mono text-xs text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                [CERRAR]
              </button>
            </div>

            <div className="space-y-4">
              {/* Momento */}
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-1">Momento Seleccionado:</span>
                <div className="rounded-xl bg-slate-950/40 border border-white/5 px-3 py-2 font-mono text-xs text-cyan-400 font-bold">
                  {selectedTimeForEvent.includes('Est') ? `🔮 Proyección ${selectedTimeForEvent}` : `⏱️ Historial: ${selectedTimeForEvent}`}
                </div>
              </div>

              {/* Cuba / Fermentador */}
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-1">Fermentador Relacionado:</span>
                <select
                  value={newEventFermenter}
                  onChange={(e) => setNewEventFermenter(e.target.value)}
                  className="w-full rounded-xl bg-slate-950/40 border border-white/5 px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  {FERMENTADORES_METADATA.map(f => {
                    const baseId = f.key.split(' ')[0];
                    return (
                      <option key={baseId} value={baseId} className="bg-slate-950 text-white font-mono text-xs">
                        {f.label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Tipo de Evento */}
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-1">Categoría del Evento:</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'temp_adjust', label: '🔧 Ajuste Temp.' },
                    { id: 'hops', label: '🌿 Lúpulo / Dry Hop' },
                    { id: 'sample', label: '🧪 Toma de Muestra' },
                    { id: 'other', label: '📝 Otro Evento' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewEventType(t.id as any)}
                      className={`rounded-xl border p-2 text-left font-mono text-xs transition-all cursor-pointer ${
                        newEventType === t.id
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 font-bold'
                          : 'border-white/5 bg-slate-950/20 text-gray-400 hover:bg-slate-950/40 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-1">Descripción / Nota:</span>
                <input
                  type="text"
                  placeholder="Ej. Adición de Cascade 50g, aumento a 20°C..."
                  value={newEventText}
                  onChange={(e) => setNewEventText(e.target.value)}
                  maxLength={60}
                  className="w-full rounded-xl bg-slate-950/40 border border-white/5 px-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-gray-600 animate-none"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelectedTimeForEvent(null)}
                  className="flex-1 rounded-xl border border-white/5 bg-slate-900/50 py-2.5 font-mono text-xs font-bold text-gray-400 hover:bg-slate-900 hover:text-white transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (newEventText.trim()) {
                      setTimelineEvents(prev => [
                        ...prev,
                        {
                          time: selectedTimeForEvent,
                          fermenterId: newEventFermenter,
                          text: newEventText,
                          type: newEventType
                        }
                      ]);
                      setSelectedTimeForEvent(null);
                    }
                  }}
                  disabled={!newEventText.trim()}
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 font-mono text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Guardar Evento
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODO PANTALLA COMPLETA PARA MONITORES DE CONTROL */}
      {isChartExpanded && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 p-4 md:p-8 overflow-y-auto">
          {/* Fondo decorativo con rejilla */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full max-w-7xl mx-auto w-full gap-4">
            
            {/* Cabecera del Monitor de Control */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 animate-pulse">
                  <Activity size={20} />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>SISTEMA DE MONITOREO TÉRMICO INTEGRAL</span>
                    <span className="rounded bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-rose-400 uppercase tracking-widest animate-pulse">MODO CONTROL ROOM</span>
                  </h2>
                  <p className="font-mono text-[10px] text-gray-500">
                    Visualización avanzada en tiempo real · IA J.A.R.B.E.E.R. · Sin elementos de navegación distractores
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Selector de Cuba en Pantalla Completa */}
                <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-white/10 px-3 py-2">
                  <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">Cuba Seleccionada:</span>
                  <select
                    value={activeLines.length === 1 ? activeLines[0] : activeLines.length === FERMENTADORES_METADATA.length ? 'all' : 'custom'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'all') {
                        setActiveLines(FERMENTADORES_METADATA.map(f => f.key));
                      } else if (val === 'custom') {
                        // mantener
                      } else {
                        setActiveLines([val]);
                      }
                    }}
                    className="bg-transparent text-white font-mono text-xs font-bold focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="all" className="bg-slate-950 text-white font-mono text-xs">📁 Mostrar Todas</option>
                    {FERMENTADORES_METADATA.map(f => (
                      <option key={f.key} value={f.key} className="bg-slate-950 text-white font-mono text-xs">
                        🍺 {f.label.split(' ')[0]}
                      </option>
                    ))}
                    {activeLines.length !== 1 && activeLines.length !== FERMENTADORES_METADATA.length && (
                      <option value="custom" className="bg-slate-950 text-white font-mono text-xs">⚙️ Selecc. Múltiple</option>
                    )}
                  </select>
                </div>

                {/* Botón de Salida */}
                <button
                  type="button"
                  onClick={() => setIsChartExpanded(false)}
                  className="flex items-center gap-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-4 py-2 font-mono text-xs font-bold text-rose-400 transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-rose-950/10"
                >
                  <Minimize2 size={13} className="text-rose-400" />
                  <span>Salir Pantalla Completa</span>
                </button>
              </div>
            </div>

            {/* Selector de Cuba Directo (Píldoras) */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 rounded-xl p-2 border border-white/5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-gray-400 uppercase tracking-wider pl-1.5">Filtro rápido:</span>
                <div className="flex flex-wrap gap-1.5">
                  {FERMENTADORES_METADATA.map((f) => {
                    const active = activeLines.includes(f.key);
                    return (
                      <button
                        key={f.key}
                        onClick={() => toggleLine(f.key)}
                        className="rounded-full px-2.5 py-1 font-mono text-[10px] transition-all duration-200 border cursor-pointer select-none"
                        style={{
                          backgroundColor: active ? `${f.color}15` : 'transparent',
                          borderColor: active ? f.color : 'rgba(255,255,255,0.05)',
                          color: active ? f.color : 'rgba(180,200,216,0.4)',
                        }}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2 pr-1.5 font-mono text-[9px] text-gray-500">
                <span>Haga clic en cualquier punto del gráfico para registrar un evento instantáneamente.</span>
              </div>
            </div>

            {/* El Gráfico a Pantalla Completa (Gran dimensión) */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-4 shadow-2xl relative min-h-[380px] h-[50vh] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={filteredTempHistoryData} 
                  margin={{ top: 20, right: 15, left: -20, bottom: 5 }}
                  onClick={handleChartClick}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(180,200,216,0.4)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    fontFamily="monospace"
                  />
                  <YAxis 
                    stroke="rgba(180,200,216,0.4)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    domain={[8, 25]} 
                    tickCount={8}
                    unit="°C"
                    fontFamily="monospace"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Línea de Referencia actual */}
                  {selectedPhases.includes('late') && (
                    <ReferenceLine
                      x="Actual"
                      stroke="#FFAA00"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      label={{
                        value: 'Proyección IA 🔮',
                        fill: '#FFAA00',
                        fontSize: 9,
                        position: 'top',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                      }}
                    />
                  )}

                  {/* Marcadores de tiempo personalizados */}
                  {customTimeMarkers.map((marker) => {
                    const isVisible = filteredTempHistoryData.some(d => d.time === marker.time);
                    if (!isVisible) return null;

                    return (
                      <ReferenceLine
                        key={marker.id}
                        x={marker.time}
                        stroke={marker.color}
                        strokeWidth={1.5}
                        strokeDasharray="5 5"
                        label={{
                          value: `📍 ${marker.label}`,
                          fill: marker.color,
                          fontSize: 9,
                          position: 'top',
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                        }}
                      />
                    );
                  })}

                  {/* Eventos de la Línea Temporal en el Gráfico */}
                  {timelineEvents.map((ev, idx) => {
                    const isFermenterActive = activeLines.some(key => key.startsWith(ev.fermenterId));
                    if (!isFermenterActive) return null;

                    const eventPhase = TIME_TO_PHASE[ev.time];
                    if (eventPhase && !selectedPhases.includes(eventPhase)) return null;

                    let color = 'rgba(255, 255, 255, 0.25)';
                    let labelEmoji = '📝';
                    if (ev.type === 'temp_adjust') { color = '#a855f7'; labelEmoji = '🔧'; }
                    else if (ev.type === 'hops') { color = '#34d399'; labelEmoji = '🌿'; }
                    else if (ev.type === 'sample') { color = '#00e1ff'; labelEmoji = '🧪'; }

                    return (
                      <ReferenceLine
                        key={idx}
                        x={ev.time}
                        stroke={color}
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        label={{
                          value: `${labelEmoji} [${ev.fermenterId}]`,
                          fill: color,
                          fontSize: 8,
                          position: 'insideBottomLeft',
                          fontFamily: 'monospace',
                          offset: 15,
                        }}
                      />
                    );
                  })}

                  {/* Líneas de Temperatura de Cubas */}
                  {FERMENTADORES_METADATA.map((f) => {
                    const active = activeLines.includes(f.key);
                    if (!active) return null;
                    return (
                      <Line
                        key={f.key}
                        type="monotone"
                        dataKey={f.key}
                        stroke={f.color}
                        strokeWidth={2.5}
                        dot={{ r: 3, strokeWidth: 1.5, stroke: '#020408' }}
                        activeDot={{ r: 5, strokeWidth: 1 }}
                        name={f.key}
                        connectNulls
                      />
                    );
                  })}

                  {/* Proyecciones de las Cubas */}
                  {FERMENTADORES_METADATA.map((f) => {
                    const active = activeLines.includes(f.key);
                    if (!active) return null;
                    const projKey = `${f.key.split(' ')[0]} (Proj)`;
                    return (
                      <Line
                        key={projKey}
                        type="monotone"
                        dataKey={projKey}
                        stroke={f.color}
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ r: 3, strokeWidth: 1, stroke: '#020408', fillOpacity: 0.6 }}
                        activeDot={{ r: 5 }}
                        name={`${f.key.split(' ')[0]} (Proyectado)`}
                        connectNulls
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bloque inferior: Leyenda interactiva y Marcadores / Historial en dos columnas para monitores anchos */}
            <div className="grid gap-4 md:grid-cols-12 items-start">
              
              {/* Columna Izquierda: Leyenda de Fases (6 cols) */}
              <div className="md:col-span-7 space-y-3">
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
                  <div className="mb-3 flex justify-between items-center">
                    <span className="font-display text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders size={13} className="text-cyan-400" />
                      Leyenda de Fases de Fermentación
                    </span>
                    <button
                      onClick={() => setSelectedPhases(['lag', 'active', 'late', 'conditioning'])}
                      className="font-mono text-[9px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                    >
                      Mostrar Todas
                    </button>
                  </div>
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                    {fermentationPhases.map((phase) => {
                      const isActive = selectedPhases.includes(phase.id);
                      return (
                        <div
                          key={phase.id}
                          onClick={() => {
                            setSelectedPhases(prev => {
                              if (prev.includes(phase.id)) {
                                if (prev.length === 1) return prev;
                                return prev.filter(p => p !== phase.id);
                              } else {
                                return [...prev, phase.id];
                              }
                            });
                          }}
                          className={`group relative overflow-hidden rounded-xl border p-2.5 transition-all cursor-pointer ${
                            isActive
                              ? 'bg-slate-950/40 shadow-lg'
                              : 'opacity-30 border-white/5 bg-slate-950/10'
                          }`}
                          style={{
                            borderColor: isActive ? phase.border : 'rgba(255,255,255,0.05)',
                          }}
                        >
                          <div 
                            className="absolute bottom-0 left-0 top-0 w-1"
                            style={{ backgroundColor: phase.color }}
                          />
                          <div className="flex items-start justify-between pl-1.5 gap-1">
                            <div className="min-w-0">
                              <span className="font-mono text-[8px] text-gray-500 block uppercase">
                                {phase.times.join(' - ')}
                              </span>
                              <span className="font-display text-[10.5px] font-bold text-white group-hover:text-cyan-400 transition-colors truncate block">
                                {phase.icon} {phase.name}
                              </span>
                            </div>
                            <span 
                              className="rounded px-1 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider shrink-0"
                              style={{
                                backgroundColor: phase.id === 'conditioning' ? 'rgba(59,130,246,0.1)' : phase.id === 'late' ? 'rgba(6,182,212,0.1)' : 'rgba(168,85,247,0.1)',
                                color: phase.id === 'conditioning' ? '#60a5fa' : phase.id === 'late' ? '#22d3ee' : '#c084fc',
                              }}
                            >
                              {phase.status}
                            </span>
                          </div>
                          <p className="mt-1.5 font-sans text-[10px] text-gray-400 leading-relaxed pl-1.5">
                            {phase.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Marcadores Personalizados Rápidos (5 cols) */}
              <div className="md:col-span-5 space-y-3">
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
                  <span className="font-display text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <Pin size={13} className="text-pink-500" />
                    Marcadores de Referencia Rápidos
                  </span>

                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Nueva marca..."
                      value={newMarkerLabel}
                      onChange={(e) => setNewMarkerLabel(e.target.value)}
                      maxLength={30}
                      className="flex-1 rounded-lg bg-slate-950/60 border border-white/10 px-2 py-1 text-white font-sans text-xs focus:outline-none focus:border-pink-500 transition-colors placeholder:text-gray-600"
                    />
                    <select
                      value={newMarkerTime}
                      onChange={(e) => setNewMarkerTime(e.target.value)}
                      className="rounded-lg bg-slate-950/60 border border-white/10 px-2 py-1 text-white font-mono text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="Actual">⏱️ Actual</option>
                      <option value="2h ago">Hace 2h</option>
                      <option value="4h ago">Hace 4h</option>
                      <option value="6h ago">Hace 6h</option>
                      <option value="Est +4h">🔮 Est +4h</option>
                      <option value="Est +8h">🔮 Est +8h</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newMarkerLabel.trim()) return;
                        const id = 'marker-' + Date.now();
                        setCustomTimeMarkers(prev => [
                          ...prev,
                          {
                            id,
                            time: newMarkerTime,
                            label: newMarkerLabel.trim(),
                            color: newMarkerColor
                          }
                        ]);
                        setNewMarkerLabel('');
                      }}
                      disabled={!newMarkerLabel.trim()}
                      className="rounded-lg bg-pink-600 hover:bg-pink-500 px-3 py-1 font-mono text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                    >
                      Fijar
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {['Densidad', 'Lúpulo', 'Temperatura', 'Muestra'].map(kw => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => setNewMarkerLabel(`Medición de ${kw.toLowerCase()}`)}
                        className="rounded bg-white/5 border border-white/5 px-2 py-0.5 font-mono text-[9px] text-gray-400 hover:text-pink-400 hover:border-pink-500/20 transition-all cursor-pointer"
                      >
                        + {kw}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 max-h-[110px] overflow-y-auto space-y-1.5 border-t border-white/5 pt-3">
                    {customTimeMarkers.length === 0 ? (
                      <p className="font-mono text-[9px] text-gray-500 text-center py-2">No hay marcadores fijados.</p>
                    ) : (
                      customTimeMarkers.map(m => (
                        <div key={m.id} className="flex items-center justify-between bg-slate-950/20 p-2 rounded-lg border border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                            <span className="font-sans text-[10px] text-gray-200 font-bold truncate max-w-[150px]">{m.label}</span>
                            <span className="font-mono text-[9px] text-gray-500">({m.time})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCustomTimeMarkers(prev => prev.filter(x => x.id !== m.id))}
                            className="text-gray-500 hover:text-rose-400 text-[10px] cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({ icon, label, value, accent, delay }: {
  icon: React.ReactNode; label: string; value: string; accent: string; delay: number;
}) {
  const colors: Record<string, { text: string; bg: string; border: string; glow: string }> = {
    amber:   { text: '#FFAA00', bg: 'rgba(255,170,0,0.04)',  border: 'rgba(255,170,0,0.11)',  glow: 'rgba(255,170,0,0.18)' },
    gold:    { text: '#FFD060', bg: 'rgba(255,208,96,0.04)', border: 'rgba(255,208,96,0.13)', glow: 'rgba(255,208,96,0.2)' },
    cyan:    { text: '#00e1ff', bg: 'rgba(0,225,255,0.04)',  border: 'rgba(0,225,255,0.11)', glow: 'rgba(0,225,255,0.18)' },
    emerald: { text: '#34d399', bg: 'rgba(52,211,153,0.04)', border: 'rgba(52,211,153,0.11)', glow: 'rgba(52,211,153,0.16)' },
  };
  const c = colors[accent] ?? colors.amber;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-4"
      style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: `0 4px 18px ${c.glow}` }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span style={{ color: c.text }}>{icon}</span>
        <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'rgba(74,96,112,0.75)' }}>{label}</span>
      </div>
      <p className="font-display text-xl font-bold" style={{ color: c.text, textShadow: `0 0 10px ${c.glow}` }}>{value}</p>
    </motion.div>
  );
}
