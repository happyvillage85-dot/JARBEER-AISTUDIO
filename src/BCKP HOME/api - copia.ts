import { API_BASE_URL, GEMINI_FUNCTION_URL, IS_PRODUCTION, getMode } from './config';
import { systemStatus, productionData, BATCHES, documents } from '../data/mockData';
import { logger } from './logger';

const sanitizeHeaderValue = (val: string) => val.replace(/[^\x00-\x7F]/g, "").trim();

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
    const customKey = sanitizeHeaderValue(localStorage.getItem('GEMINI_API_KEY') || '');
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-gemini-api-key': customKey
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      let errMsg = '';
      try {
        const errJson = await res.json();
        errMsg = errJson.error || errJson.message || JSON.stringify(errJson);
      } catch {
        errMsg = await res.text();
      }
      
      logger.error(`API Error POST ${path}`, errMsg);

      // If the error is about invalid API key, show the modal again
      if (
        res.status === 401 ||
        errMsg.includes('401 Unauthorized') ||
        errMsg.includes('API key') ||
        errMsg.includes('API_KEY_INVALID')
      ) {
        localStorage.removeItem('GEMINI_API_KEY');
        if (onMissingApiKeyHandler) onMissingApiKeyHandler();
        throw new Error('API_KEY_REQUIRED');
      }
      throw new Error(`API ${res.status}: ${path} - ${errMsg}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Arquitectura hÃ­brida:
//   ONLINE  â†’ Gemini API vÃ­a Netlify Function (cloud)
//   BÃšNKER â†’ backend local real (sin internet). Si falla, fallback a mocks.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  if (getMode() !== 'bunker') {
    return await real();
  }
  try {
    return await real();
  } catch {
    return mock();
  }
}


// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Respuesta local inteligente para dev mode (sin Gemini)
// Analiza el comando y responde con datos reales de la fÃ¡brica
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function generateLocalReply(command: string, context?: unknown): string {
  const lower = command.toLowerCase();
  const ctx = context as { batches?: typeof BATCHES; fermentadores?: unknown[]; documents?: typeof documents; mode?: string } | undefined;

  // Buscar fermentador por nÃºmero
  const fMatch = lower.match(/f-?0?([1-6])/);
  if (fMatch) {
    const fNum = parseInt(fMatch[1]);
    const batch = ctx?.batches?.find(b => parseInt(b.fermentadorNum) === fNum) ?? BATCHES.find(b => parseInt(b.fermentadorNum) === fNum);
    if (batch) {
      return `Fermentador F-0${fNum}: ${batch.recipe} — Lote ${batch.batch}.
Etapa: ${batch.stage} (${batch.stageProgress}% completado).
Temperatura: ${batch.currentTemp}Â°C (objetivo ${batch.targetTemp}Â°C).
Â°Plato: ${batch.plato} Â· pH: ${batch.ph}.
Volumen: ${batch.volume} L.`;
    }
    return `Fermentador F-0${fNum}: sin lote activo asignado.`;
  }

  // Buscar por nombre de receta
  for (const b of BATCHES) {
    if (lower.includes(b.recipe.toLowerCase())) {
      return `${b.recipe} — Lote ${b.batch}.
Etapa actual: ${b.stage} (${b.stageProgress}%).
Fermentador: F-${b.fermentadorNum}.
Temperatura: ${b.currentTemp}Â°C â†’ ${b.targetTemp}Â°C.
Â°Plato: ${b.plato} Â· pH: ${b.ph} Â· ABV estimado: ${b.abv}%.
IBU: ${b.ibu} Â· EBC: ${b.ebc}.
Levadura: ${b.levadura.name} (${b.levadura.lab}).`;
    }
  }

  // Temperatura
  if (lower.includes('temperatura') || lower.includes('temp')) {
    const b = BATCHES[0];
    return `Temperatura actual del sistema: ${systemStatus.temperature.toFixed(1)}Â°C.
Objetivo: ${systemStatus.targetTemp.toFixed(1)}Â°C.
Lote activo (${b.recipe}, F-${b.fermentadorNum}): ${b.currentTemp}Â°C â†’ ${b.targetTemp}Â°C.
Estado: dentro de rango operativo.`;
  }

  // Plato / densidad
  if (lower.includes('plato') || lower.includes('densidad')) {
    const b = BATCHES[0];
    return `Â°Plato del lote activo (${b.recipe}): ${b.plato}Â°P.
pH: ${b.ph}.
OG: ${b.og} Â· FG estimada: ${b.fg}.
ABV estimado: ${b.abv}%.`;
  }

  // Documentos
  if (lower.includes('documento') || lower.includes('biblioteca') || lower.includes('libro')) {
    return `Biblioteca documental: ${documents.length} documentos indexados.
${documents.slice(0, 4).map(d => `• ${d.title} (${d.reference})`).join("\n")}
Accede desde la pestaña Documentos para buscar y filtrar.`;
  }

  // LÃºpulos
  if (lower.includes('lÃºpulo') || lower.includes('lupulo') || lower.includes('cascade') || lower.includes('simcoe') || lower.includes('magnum')) {
    const hopName = ['cascade', 'simcoe', 'magnum', 'hallertauer', 'northern brewer', 'ekg'].find(h => lower.includes(h));
    if (hopName) {
      for (const b of BATCHES) {
        const hop = b.lupulos.find(l => l.name.toLowerCase().includes(hopName));
        if (hop) {
          return `LÃºpulo ${hop.name} encontrado en ${b.recipe} (Lote ${b.batch}):
AdiciÃ³n: ${hop.addition} Â· Cantidad: ${hop.amount}.
Alfa-Ã¡cidos: ${hop.alpha || 'no especificado'}.`;
        }
      }
      return `No se encontrÃ³ el lÃºpulo "${hopName}" en los lotes activos.`;
    }
    return `Lúpulos en uso:
${BATCHES.flatMap(b => b.lupulos.map(l => `• ${l.name} — ${l.amount} (${l.addition}) en ${b.recipe}`)).join("\n")}
`;
  }

  // Malta
  if (lower.includes('malta') || lower.includes('malt')) {
    const b = BATCHES[0];
    return `Maltas del lote activo (${b.recipe}):
${b.maltas.map(m => `• ${m.name}: ${m.amount} (EBC ${m.ebc}) — ${m.supplier}`).join('\n')}`;
  }

  // Levadura
  if (lower.includes('levadura') || lower.includes('fermentación') || lower.includes('fermentacion')) {
    const b = BATCHES[0];
    return `Levadura del lote activo (${b.recipe}):
• Cepa: ${b.levadura.name}
• Laboratorio: ${b.levadura.lab}
• Formato: ${b.levadura.format}
• Inoculación: ${b.levadura.pitch}
Fermentador: F-${b.fermentadorNum} a ${b.currentTemp}Â°C.`;
  }

  // Estado general
  if (lower.includes('estado') || lower.includes('sistema') || lower.includes('general')) {
    return `Estado del sistema J.A.R.B.E.E.R.:
• Estado: ${systemStatus.state}
• Uptime: ${systemStatus.uptime}
• Lote activo: ${systemStatus.activeBatch}
• Alertas: ${systemStatus.alerts}
• Documentos indexados: ${systemStatus.docsIndexed}
• IA: ${systemStatus.aiModel} (${systemStatus.aiStatus})
• Red: ${systemStatus.network}`;
  }

  // Nuevo lote
  if (lower.includes('nuevo lote') || lower.includes('crear') || lower.includes('empieza')) {
    return `Para crear un nuevo lote, necesito:
1. Receta base (Golden Ale, Red Ale, Blonde Ale o nueva)
2. Volumen objetivo (L)
3. Fecha de inicio

Una vez confirmes, prepararÃ© la ficha de producciÃ³n con escalones de maceraciÃ³n, lÃºpulos y curva de fermentaciÃ³n.`;
  }

  // Saludo
  if (lower.includes('hola') || lower.includes('buenas') || lower.includes('hey')) {
    return `Hola, Juanfran. Sistema operativo. Tengo ${BATCHES.length} lotes en seguimiento.
Lote activo: ${BATCHES[0].recipe} (${BATCHES[0].batch}) en F-${BATCHES[0].fermentadorNum}, fermentaciÃ³n al ${BATCHES[0].stageProgress}%.
Â¿En quÃ© puedo ayudarte?`;
  }

  // Respuesta genérica
  return `Comando no reconocido: "${command}".

Socio, actualmente operamos en modo BÚNKER (procesamiento local sin conexión a internet). Mis capacidades conversacionales están restringidas a la monitorización directa de la planta.

Puedo informarte sobre:
• Estado de lotes y fermentadores (F-01 a F-06)
• Temperaturas, °Plato y pH
• Recetas, maltas, lúpulos y levaduras
• Documentos indexados

Si deseas utilizar mi núcleo conversacional avanzado, cambia al modo ONLINE en el selector superior de la interfaz (asegúrate de haber configurado tu GEMINI_API_KEY).`;
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

  // â”€â”€ Chat / comandos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // ONLINE â†’ Express / Netlify backend â†’ Gemini (con historial + contexto de fÃ¡brica)
  // BÃšNKER â†’ respuesta local inteligente basada en contexto (modo offline aislado)
  sendCommand: async (command: string, history?: unknown[], context?: unknown): Promise<ChatResponse> => {
    if (getMode() === 'online') {
      if (!checkApiKey()) {
        throw new Error('API_KEY_REQUIRED');
      }
      return post<ChatResponse>(GEMINI_FUNCTION_URL, { command, history, context }, 25000);
    }
    return Promise.resolve({ reply: generateLocalReply(command, context) });
  },

  // â”€â”€ Streaming â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  sendCommandStream: async (
    command: string,
    history: unknown[],
    context: unknown,
    onChunk: (text: string) => void
  ): Promise<string> => {
    const mode = getMode();
    console.log("DEBUG: mode in sendCommandStream:", mode);
    if (mode !== 'online') {
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
    const customKey = sanitizeHeaderValue(localStorage.getItem('GEMINI_API_KEY') || '');
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
        errMsg = errJson.error || errJson.message || JSON.stringify(errJson);
      } catch {
        errMsg = await res.text();
      }
      
      logger.error(`Gemini Stream Error`, errMsg);

      // If the error is about invalid API key, show the modal again
      if (
        res.status === 401 ||
        errMsg.includes('401 Unauthorized') ||
        errMsg.includes('API key') ||
        errMsg.includes('API_KEY_INVALID')
      ) {
        localStorage.removeItem('GEMINI_API_KEY');
        if (onMissingApiKeyHandler) onMissingApiKeyHandler();
        throw new Error('API_KEY_REQUIRED');
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





