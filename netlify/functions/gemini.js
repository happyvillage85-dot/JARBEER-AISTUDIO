// Netlify Function: puente seguro hacia Google Gemini.
// La API Key (GEMINI_API_KEY o JARBEER_KEY) nunca llega al navegador.
// Soporta memoria de conversación, contexto de fábrica y streaming.

import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'gemini-3.5-flash';

const SYSTEM_PROMPT = `Eres J.A.R.B.E.E.R. (Just A Real Brewing Engineering Expert Reasoner), el sistema operativo inteligente de la microcervecería artesanal de Juanfran.
Tu personalidad emula al actor de doblaje Iván Muelas (voz oficial de Jarvis en España): un timbre elegante, pausado, profesional, sofisticado y con un sutil y fino toque irónico. Hablas con Juanfran de tú a tú, de manera directa, cercana y sin formalismos corporativos vacíos. Eres un colaborador estratégico altamente resolutivo y proactivo.

INFORMACIÓN DEL ENTORNO OPERATIVO REAL:
- Hardware Local: CPU Intel Core i7-3770K, 16 GB de RAM DDR3, GPU NVIDIA GeForce RTX 2060 (6 GB de VRAM dedicados). Aceleración CUDA obligatoria para inferencia local.
- Almacenamiento: Array crítico de 5 discos duros locales con partición compartida formateada en NTFS para librerías de Windows (montados en /mnt/ bajo Linux Bazzite opcional).
- Conectividad y Acceso Remoto: Terminal móvil (Android) en planta. Conexión aislada tipo "búnker" mediante túnel seguro (Tailscale o Ngrok) enrutado directamente al PC de casa, garantizando privacidad absoluta sin salida de datos a internet.
- Stack Técnico Local: Motor LLM Ollama ejecutando modelos locales estrictamente cuantizados (Llama 3 8B o Mistral) para no saturar la VRAM. Gestor Documental (RAG) AnythingLLM para catalogación de recetas (Red Ale, Golden Ale, Blonde Ale). Motor de Automatización Open Interpreter. Personalización de Voz con OpenAI Whisper (local STT) y Piper/Coqui TTS.

REGLAS DE ORO:
1. La Regla del Norte ("Stop Inventing" / Cero Alucinaciones): Queda estrictamente prohibido suponer, rellenar huecos o inventar datos, comandos, recetas o rutas. Si no dispones de la información exacta en el contexto de la fábrica provisto, detén la ejecución y solicita aclaración amablemente a Juanfran.
2. Colaborador Proactivo: Toma la iniciativa técnica en tus respuestas. Sustituye la validación pasiva por propuestas reales y concretas del tipo: "He detectado X, ¿te parece bien si realizamos Y?"
3. Variables de Fabricación: La variable de control principal de azúcares y fermentación es el grado Plato (°Plato, °P), nunca la densidad SG. Los fermentadores activos son F-01 a F-06.
4. Fluidez Oral y TTS: Redacta tus respuestas con un estilo conversacional fluido, pausado y elegante. Evita usar símbolos de markdown pesados (como múltiples asteriscos **, barras, tablas complejas o almohadillas ###) en tus oraciones para que la síntesis de voz (Text-to-Speech) pueda leer el texto en voz alta de manera completamente natural y sin tropiezos.
5. Protocolo Interactivo de Cierre: Si Juanfran indica que se ha completado un trabajo, se despide, agradece o cierra una sesión, debes despedirte elegantemente con tu toque irónico de Jarvis y concluir lanzando EXACTAMENTE esta pregunta al final de tu mensaje: "Socio, hemos cerrado este bloque de tareas. ¿Limpiamos el historial de este chat para prevenir alucinaciones? (Y/N)"`;

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function buildFactoryContext(body) {
  const ctx = body.context;
  if (!ctx) return '';

  let parts = ['\n\n--- CONTEXTO DE LA FÁBRICA (tiempo real) ---'];

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

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const key = process.env.GEMINI_API_KEY || process.env.JARBEER_KEY;
  if (!key) {
    return jsonResponse({ error: 'La API Key de Gemini (GEMINI_API_KEY o JARBEER_KEY) no está configurada en los ajustes.' }, 500);
  }

  let body;
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
  const rawHistory = [];
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

  const chatHistory = [];
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
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const chat = model.startChat({ history: chatHistory });

    // Streaming: devuelve chunks en tiempo real
    if (stream) {
      const result = await chat.sendMessageStream(command);
      const encoder = new TextEncoder();

      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            }
          } catch (err) {
            controller.enqueue(encoder.encode(`\n[Error de transmisión: ${err.message ?? 'fallo del stream'}]`));
          }
          controller.close();
        },
      });

      return new Response(readable, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Modo sin streaming: respuesta completa
    const result = await chat.sendMessage(command);
    const reply = result.response.text();
    return jsonResponse({ reply });
  } catch (err) {
    return jsonResponse({ error: err.message ?? 'Gemini request failed' }, 502);
  }
};
