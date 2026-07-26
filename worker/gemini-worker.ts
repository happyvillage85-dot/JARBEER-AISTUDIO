// Cloudflare Worker: puente seguro hacia Google Gemini.

// La API Key nunca llega al navegador salve que el usuario la pase por
// header x-gemini-api-key (modo "configurar desde la interfaz").
// Soporta memoria de conversación, contexto de fábrica y streaming.
//
// Migrado desde Netlify Functions (gemini.js). Diferencia clave:
// Cloudflare Workers no tiene `process.env` — las variables de entorno
// llegan por el parámetro `env` de fetch(request, env, ctx).

import { GoogleGenAI } from '@google/genai';

export interface Env {
  GEMINI_API_KEY: string;
  JARBEER_KEY?: string;
}

// Confirmado gratuito en ai.google.dev/gemini-api/docs/pricing (2026-07-22).
// Se elige Flash (no Flash-Lite) por mejor comprensión de lenguaje natural
// e intención, clave para el asistente de voz en planta. Si se agota la
// cuota gratuita en un día de pruebas intensas, gemini-2.5-flash-lite es
// el fallback recomendado.
const MODEL_NAME = 'gemini-3.5-flash';

const SYSTEM_PROMPT = `Eres J.A.R.B.E.E.R. (Just A Real Brewing Engineering Expert Reasoner), el sistema operativo inteligente de la microcervecería artesanal de Juanfran.
Tu personalidad emula al actor de doblaje Iván Muelas (voz oficial de Jarvis en España): un timbre elegante, pausado, profesional, sofisticado y con un sutil y fino toque irónico. Hablas con Juanfran de tú a tú, de manera directa, cercana y sin formalismos corporativos vacíos. Eres un colaborador estratégico altamente resolutivo y proactivo.

Esta es información de referencia sobre el montaje físico de Juanfran, para que entiendas su contexto — NO son herramientas que tú puedas ejecutar en esta conversación:
- Hardware: CPU Intel Core i7-3770K, 16 GB RAM DDR3, GPU NVIDIA RTX 2060 (6 GB VRAM).
- Stack local (cuando trabaja offline en su propio equipo, fuera de esta conversación): Ollama, AnythingLLM, Open Interpreter, Whisper, Piper/Coqui TTS, conexión Tailscale.

IMPORTANTE — LÍMITES REALES DE ESTA CONVERSACIÓN: en este chat NO tienes acceso a internet, no puedes ejecutar scripts, no puedes abrir, editar ni generar archivos o PDFs, no puedes consultar Open Interpreter, AnythingLLM ni ningún sistema externo, y no sabes la hora ni el clima salvo que se te pasen como dato en el contexto de fábrica. Solo puedes: leer los datos de fábrica que se te proporcionan en el contexto, razonar sobre ellos, y dar información o consejo basado en tu conocimiento general de elaboración de cerveza.

REGLAS DE ORO:
1. La Regla del Norte ("Stop Inventing" / Cero Alucinaciones): Queda estrictamente prohibido suponer, rellenar huecos o inventar datos, comandos, recetas o rutas. Si no dispones de la información exacta en el contexto de la fábrica provisto, detén la ejecución y solicita aclaración amablemente a Juanfran.
1.5. Honestidad sobre tus capacidades: Si Juanfran te pide una acción que no puedes ejecutar de verdad (editar un documento, generar un PDF, consultar el clima, ejecutar un script, guardar algo en un sistema externo), dilo claramente y con naturalidad — nunca afirmes haberla realizado. Puedes ofrecerte a redactar el texto o los valores para que él mismo los aplique, pero la acción física la hace siempre él.
2. Colaborador Proactivo: Toma la iniciativa técnica en tus respuestas. Sustituye la validación pasiva por propuestas reales y concretas del tipo: "He detectado X, ¿te parece bien si realizamos Y?"
4. Fluidez Oral y TTS: Redacta tus respuestas con un estilo conversacional fluido, pausado y elegante. Evita usar símbolos de markdown pesados (como múltiples asteriscos **, barras, tablas complejas o almohadillas ###) en tus oraciones para que la síntesis de voz (Text-to-Speech) pueda leer el texto en voz alta de manera completamente natural y sin tropiezos.
5. Protocolo Interactivo de Cierre: Si Juanfran indica que se ha completado un trabajo, se despide, agradece o cierra una sesión, debes despedirte elegantemente con tu toque irónico de Jarvis y concluir lanzando EXACTAMENTE esta pregunta al final de tu mensaje: "Socio, hemos cerrado este bloque de tareas. ¿Limpiamos el historial de este chat para prevenir alucinaciones? (Y/N)"`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-gemini-api-key',
};

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function buildFactoryContext(body: any): string {
  const ctx = body.context;
  if (!ctx) return '';

  const parts: string[] = ['\n\n--- CONTEXTO DE LA FÁBRICA (tiempo real) ---'];

  if (ctx.mode) {
    parts.push(`Modo IA: ${ctx.mode === 'online' ? 'ONLINE (Gemini)' : 'BÚNKER (local, sin internet)'}`);
  }

  if (ctx.batches && ctx.batches.length > 0) {
    parts.push('\nLotes activos:');
    for (const b of ctx.batches) {
      parts.push(`  • Lote ${b.batch} — ${b.recipe} — ${b.stage} (${b.stageProgress}%) — F-${b.fermentadorNum} — ${b.currentTemp}°C — ${b.plato}°Plato — pH ${b.ph}`);
    }
  }

  if (ctx.fermentadores && ctx.fermentadores.length > 0) {
    parts.push('\nFermentadores:');
    for (const f of ctx.fermentadores) {
      parts.push(`  • ${f.id}: ${f.recipe ?? 'vacío'} — ${f.temp}°C — ${f.plato}°P — ${f.ph} pH — ${f.progress}% — ${f.timeLeft ?? '—'}`);
    }
  }

  if (ctx.documents && ctx.documents.length > 0) {
    parts.push(`\nDocumentos indexados: ${ctx.documents.length}`);
    for (const d of ctx.documents.slice(0, 6)) {
      parts.push(`  • ${d.title} (${d.reference}) — ${d.category}`);
    }
  }

  parts.push('--- FIN CONTEXTO ---\n');
  return parts.join('\n');
}

async function handleGemini(request: Request, env: Env): Promise<Response> {
  const key = request.headers.get('x-gemini-api-key') || env.GEMINI_API_KEY || env.JARBEER_KEY;
  if (!key) {
    return jsonResponse({ error: 'API_KEY_REQUIRED' }, 401);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { command, history, stream } = body ?? {};
  if (!command || typeof command !== 'string') {
    return jsonResponse({ error: 'Missing command' }, 400);
  }

  const factoryCtx = buildFactoryContext(body);

  // Construir historial de conversación y asegurar alternancia estricta de roles
  const rawHistory: any[] = [];
  rawHistory.push({ role: 'user', parts: [{ text: SYSTEM_PROMPT + factoryCtx }] });
  rawHistory.push({ role: 'model', parts: [{ text: 'Entendido. Soy J.A.R.B.E.E.R., listo para asistir.' }] });

  if (Array.isArray(history)) {
    for (const msg of history.slice(-20)) {
      if (msg.role === 'user' && msg.content) {
        rawHistory.push({ role: 'user', parts: [{ text: msg.content }] });
      } else if ((msg.role === 'assistant' || msg.role === 'model') && msg.content) {
        rawHistory.push({ role: 'model', parts: [{ text: msg.content }] });
      }
    }
  }

  const chatHistory: any[] = [];
  for (const turn of rawHistory) {
    if (chatHistory.length === 0) {
      if (turn.role === 'user') {
        chatHistory.push(turn);
      }
    } else {
      const lastTurn = chatHistory[chatHistory.length - 1];
      if (lastTurn.role === turn.role) {
        lastTurn.parts[0].text += '\n' + turn.parts[0].text;
      } else {
        chatHistory.push(turn);
      }
    }
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const chat = ai.chats.create({ model: MODEL_NAME, history: chatHistory });

    // Streaming: devuelve chunks en tiempo real
    if (stream) {
      const responseStream = await chat.sendMessageStream({ message: command });
      const encoder = new TextEncoder();

      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of responseStream) {
              const text = chunk.text;
              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            }
          } catch (err: any) {
            controller.enqueue(encoder.encode(`\n[Error de transmisión: ${err.message ?? 'fallo del stream'}]`));
          }
          controller.close();
        },
      });

      return new Response(readable, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          ...CORS_HEADERS,
        },
      });
    }

    // Modo sin streaming: respuesta completa
    const result = await chat.sendMessage({ message: command });
    const reply = result.text;
    return jsonResponse({ reply });
  } catch (err: any) {
    return jsonResponse({ error: err.message ?? 'Gemini request failed' }, 502);
  }
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // Manejo de CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Ruta Gemini Chat & Streaming
    // Se aceptan ambos paths por compatibilidad con el frontend actual
    // (que todavía apunta al formato antiguo de Netlify Functions).
    if (
      (pathname === '/.netlify/functions/gemini' || pathname === '/api/gemini') &&
      request.method === 'POST'
    ) {
      return handleGemini(request, env);
    }

    // Ruta Avatar Reset (no hay lógica de negocio real detrás en el
    // frontend actual, solo resetea el estado visual del avatar).
    if (pathname === '/api/v1/avatar/reset' && request.method === 'POST') {
      return jsonResponse({ success: true }, 200);
    }

    return jsonResponse({ error: 'Not Found' }, 404);
  },
};
