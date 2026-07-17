import { API_BASE_URL, GEMINI_FUNCTION_URL, IS_PRODUCTION, getMode } from './config';
import { systemStatus, productionData, BATCHES, documents } from '../data/mockData';

async function get<T>(path: string, timeoutMs = 2500): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

async function post<T>(path: string, body: unknown, timeoutMs = 2500): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const customKey = localStorage.getItem('GEMINI_API_KEY') || '';
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-gemini-api-key': customKey
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Arquitectura híbrida:
//   ONLINE  → Gemini API vía Netlify Function (cloud)
//   BÚNKER → backend local real (sin internet). Si falla, fallback a mocks.
// ─────────────────────────────────────────────────────────────────────────

let onMissingApiKeyHandler: (() => void) | null = null;

export const setMissingApiKeyHandler = (handler: () => void) => {
  onMissingApiKeyHandler = handler;
};

export const checkApiKey = (): boolean => {
  if (getMode() !== 'online') return true;
  const key = localStorage.getItem('GEMINI_API_KEY');
  if (!key || key.trim() === '') {
    if (onMissingApiKeyHandler) onMissingApiKeyHandler();
    return false;
  }
  return true;
};

type SystemStatusResponse = typeof systemStatus;
type BatchResponse = typeof productionData;
type DocumentsResponse = typeof documents;
type ChatResponse = { reply: string };

async function withBunkerFallback<T>(real: () => Promise<T>, mock: () => T): Promise<T> {
  if (getMode() !== 'bunker') return mock();
  try {
    return await real();
  } catch {
    return mock();
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Respuesta local inteligente para dev mode (sin Gemini)
// Analiza el comando y responde con datos reales de la fábrica
// ─────────────────────────────────────────────────────────────────────────
function generateLocalReply(command: string, context?: unknown): string {
  const lower = command.toLowerCase();
  const ctx = context as { batches?: typeof BATCHES; fermentadores?: unknown[]; documents?: typeof documents; mode?: string } | undefined;

  // Buscar fermentador por número
  const fMatch = lower.match(/f-?0?([1-6])/);
  if (fMatch) {
    const fNum = parseInt(fMatch[1]);
    const batch = ctx?.batches?.find(b => parseInt(b.fermentadorNum) === fNum) ?? BATCHES.find(b => parseInt(b.fermentadorNum) === fNum);
    if (batch) {
      return `Fermentador F-0${fNum}: ${batch.recipe} — Lote ${batch.batch}.\nEtapa: ${batch.stage} (${batch.stageProgress}% completado).\nTemperatura: ${batch.currentTemp}°C (objetivo ${batch.targetTemp}°C).\n°Plato: ${batch.plato} · pH: ${batch.ph}.\nVolumen: ${batch.volume} L.`;
    }
    return `Fermentador F-0${fNum}: sin lote activo asignado.`;
  }

  // Buscar por nombre de receta
  for (const b of BATCHES) {
    if (lower.includes(b.recipe.toLowerCase())) {
      return `${b.recipe} — Lote ${b.batch}.\nEtapa actual: ${b.stage} (${b.stageProgress}%).\nFermentador: F-${b.fermentadorNum}.\nTemperatura: ${b.currentTemp}°C → ${b.targetTemp}°C.\n°Plato: ${b.plato} · pH: ${b.ph} · ABV estimado: ${b.abv}%.\nIBU: ${b.ibu} · EBC: ${b.ebc}.\nLevadura: ${b.levadura.name} (${b.levadura.lab}).`;
    }
  }

  // Temperatura
  if (lower.includes('temperatura') || lower.includes('temp')) {
    const b = BATCHES[0];
    return `Temperatura actual del sistema: ${systemStatus.temperature.toFixed(1)}°C.\nObjetivo: ${systemStatus.targetTemp.toFixed(1)}°C.\nLote activo (${b.recipe}, F-${b.fermentadorNum}): ${b.currentTemp}°C → ${b.targetTemp}°C.\nEstado: dentro de rango operativo.`;
  }

  // Plato / densidad
  if (lower.includes('plato') || lower.includes('densidad')) {
    const b = BATCHES[0];
    return `°Plato del lote activo (${b.recipe}): ${b.plato}°P.\npH: ${b.ph}.\nOG: ${b.og} · FG estimada: ${b.fg}.\nABV estimado: ${b.abv}%.`;
  }

  // Documentos
  if (lower.includes('documento') || lower.includes('biblioteca') || lower.includes('libro')) {
    return `Biblioteca documental: ${documents.length} documentos indexados.\n${documents.slice(0, 4).map(d => `• ${d.title} (${d.reference})`).join('\n')}\nAccede desde la pestaña Documentos para buscar y filtrar.`;
  }

  // Lúpulos
  if (lower.includes('lúpulo') || lower.includes('lupulo') || lower.includes('cascade') || lower.includes('simcoe') || lower.includes('magnum')) {
    const hopName = ['cascade', 'simcoe', 'magnum', 'hallertauer', 'northern brewer', 'ekg'].find(h => lower.includes(h));
    if (hopName) {
      for (const b of BATCHES) {
        const hop = b.lupulos.find(l => l.name.toLowerCase().includes(hopName));
        if (hop) {
          return `Lúpulo ${hop.name} encontrado en ${b.recipe} (Lote ${b.batch}):\nAdición: ${hop.addition} · Cantidad: ${hop.amount}.\nAlfa-ácidos: ${hop.alpha || 'no especificado'}.`;
        }
      }
      return `No se encontró el lúpulo "${hopName}" en los lotes activos.`;
    }
    return `Lúpulos en uso:\n${BATCHES.flatMap(b => b.lupulos.map(l => `• ${l.name} — ${l.amount} (${l.addition}) en ${b.recipe}`)).join('\n')}`;
  }

  // Malta
  if (lower.includes('malta') || lower.includes('malt')) {
    const b = BATCHES[0];
    return `Maltas del lote activo (${b.recipe}):\n${b.maltas.map(m => `• ${m.name}: ${m.amount} (EBC ${m.ebc}) — ${m.supplier}`).join('\n')}`;
  }

  // Levadura
  if (lower.includes('levadura') || lower.includes('fermentación') || lower.includes('fermentacion')) {
    const b = BATCHES[0];
    return `Levadura del lote activo (${b.recipe}):\n• Cepa: ${b.levadura.name}\n• Laboratorio: ${b.levadura.lab}\n• Formato: ${b.levadura.format}\n• Inoculación: ${b.levadura.pitch}\nFermentador: F-${b.fermentadorNum} a ${b.currentTemp}°C.`;
  }

  // Estado general
  if (lower.includes('estado') || lower.includes('sistema') || lower.includes('general')) {
    return `Estado del sistema J.A.R.B.E.E.R.:\n• Estado: ${systemStatus.state}\n• Uptime: ${systemStatus.uptime}\n• Lote activo: ${systemStatus.activeBatch}\n• Alertas: ${systemStatus.alerts}\n• Documentos indexados: ${systemStatus.docsIndexed}\n• IA: ${systemStatus.aiModel} (${systemStatus.aiStatus})\n• Red: ${systemStatus.network}`;
  }

  // Nuevo lote
  if (lower.includes('nuevo lote') || lower.includes('crear') || lower.includes('empieza')) {
    return `Para crear un nuevo lote, necesito:\n1. Receta base (Golden Ale, Red Ale, Blonde Ale o nueva)\n2. Volumen objetivo (L)\n3. Fecha de inicio\n\nUna vez confirmes, prepararé la ficha de producción con escalones de maceración, lúpulos y curva de fermentación.`;
  }

  // Saludo
  if (lower.includes('hola') || lower.includes('buenas') || lower.includes('hey')) {
    return `Hola, Juanfran. Sistema operativo. Tengo ${BATCHES.length} lotes en seguimiento.\nLote activo: ${BATCHES[0].recipe} (${BATCHES[0].batch}) en F-${BATCHES[0].fermentadorNum}, fermentación al ${BATCHES[0].stageProgress}%.\n¿En qué puedo ayudarte?`;
  }

  // Respuesta genérica
  return `Comando no reconocido: "${command}".\n\nSocio, actualmente operamos en modo BÚNKER (procesamiento local sin conexión a internet). Mis capacidades conversacionales están restringidas a la monitorización directa de la planta.\n\nPuedo informarte sobre:\n• Estado de lotes y fermentadores (F-01 a F-06)\n• Temperaturas, °Plato y pH\n• Recetas, maltas, lúpulos y levaduras\n• Documentos indexados\n\nSi deseas utilizar mi núcleo conversacional avanzado, cambia al modo ONLINE en el selector superior de la interfaz (asegúrate de haber configurado tu GEMINI_API_KEY).`;
}

export const api = {
  getStatus: (): Promise<SystemStatusResponse> =>
    withBunkerFallback(() => get<SystemStatusResponse>('/api/v1/status'), () => systemStatus),

  getBatches: (): Promise<BatchResponse[]> =>
    withBunkerFallback(() => get<BatchResponse[]>('/api/v1/batches'), () => BATCHES),
  getBatch: (id: string): Promise<BatchResponse> =>
    withBunkerFallback(() => get<BatchResponse>(`/api/v1/batches/${id}`), () => productionData),
  createBatch: (data: unknown): Promise<BatchResponse> =>
    withBunkerFallback(
      () => post<BatchResponse>('/api/v1/batches', data),
      () => ({ ...productionData, ...(data as object) })
    ),

  getDocuments: (): Promise<DocumentsResponse> =>
    withBunkerFallback(() => get<DocumentsResponse>('/api/v1/documents'), () => documents),

  // ── Chat / comandos ──────────────────────────────────────────────────────
  // ONLINE → Express / Netlify backend → Gemini (con historial + contexto de fábrica)
  // BÚNKER → respuesta local inteligente basada en contexto (modo offline aislado)
  sendCommand: async (command: string, history?: unknown[], context?: unknown): Promise<ChatResponse> => {
    if (getMode() === 'online') {
      if (!checkApiKey()) {
        throw new Error('API_KEY_REQUIRED');
      }
      return post<ChatResponse>(GEMINI_FUNCTION_URL, { command, history, context }, 25000);
    }
    return Promise.resolve({ reply: generateLocalReply(command, context) });
  },

  // ── Streaming ───────────────────────────────────────────────────────────
  sendCommandStream: async (
    command: string,
    history: unknown[],
    context: unknown,
    onChunk: (text: string) => void
  ): Promise<string> => {
    if (getMode() !== 'online') {
      const reply = generateLocalReply(command, context);
      // Simular streaming palabra a palabra
      const words = reply.split(' ');
      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? '' : ' ') + words[i];
        onChunk(chunk);
        await new Promise(r => setTimeout(r, 35));
      }
      return reply;
    }
    if (!checkApiKey()) {
      throw new Error('API_KEY_REQUIRED');
    }
    const customKey = localStorage.getItem('GEMINI_API_KEY') || '';
    const res = await fetch(GEMINI_FUNCTION_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-gemini-api-key': customKey
      },
      body: JSON.stringify({ command, history, context, stream: true }),
    });

    if (!res.ok) {
      let errMsg = '';
      try {
        const errJson = await res.json();
        errMsg = errJson.error || errJson.message || '';
      } catch {
        errMsg = await res.text();
      }
      throw new Error(errMsg || `Fallo del servidor (status ${res.status})`);
    }

    if (!res.body) {
      throw new Error('No response body stream received from backend.');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      full += text;
      onChunk(text);
    }
    return full;
  },

  chat: (message: string, history?: unknown[], context?: unknown): Promise<ChatResponse> =>
    api.sendCommand(message, history, context),

  resetAvatar: (): Promise<void> =>
    withBunkerFallback(
      () => post<void>('/api/v1/avatar/reset', {}),
      () => undefined
    ),
};

export { get, post };
