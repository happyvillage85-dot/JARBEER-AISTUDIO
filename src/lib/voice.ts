// ─────────────────────────────────────────────────────────────────────────
// Voz — reconocimiento real (Web Speech API) y síntesis cinematográfica
// ─────────────────────────────────────────────────────────────────────────

export type SpeechRecognitionResultHandler = (transcript: string, isFinal: boolean) => void;
export type SpeechRecognitionErrorHandler = (error: string) => void;

interface MinimalSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

function getSpeechRecognitionCtor(): (new () => MinimalSpeechRecognition) | null {
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isVoiceRecognitionAvailable(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

let activeRecognition: MinimalSpeechRecognition | null = null;
let starting = false;

/**
 * Detiene y descarta por completo cualquier instancia de reconocimiento
 * previa. Es clave llamarlo ANTES de crear una nueva instancia: reusar o
 * solapar instancias es lo que provoca que el micrófono deje de responder
 * a partir del segundo uso en Chrome.
 */
function hardReset(): void {
  if (activeRecognition) {
    try { activeRecognition.onresult = null; activeRecognition.onerror = null; activeRecognition.onend = null; activeRecognition.onstart = null; } catch { /* noop */ }
    try { activeRecognition.abort(); } catch { /* noop */ }
  }
  activeRecognition = null;
  starting = false;
}

export function startListening(
  onResult: SpeechRecognitionResultHandler,
  onError: SpeechRecognitionErrorHandler,
  onEnd: () => void
): boolean {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    onError('not-supported');
    return false;
  }

  // Si había una instancia previa colgada, la limpiamos por completo antes
  // de crear una nueva. Un pequeño respiro evita el InvalidStateError que
  // Chrome lanza si se llama a start() demasiado pronto tras un abort/stop.
  hardReset();
  starting = true;

  const create = () => {
    try {
      const rec = new Ctor();
      rec.lang = 'es-ES';
      rec.continuous = false; // una frase por activación: más fiable entre usos repetidos
      rec.interimResults = true;

      rec.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) isFinal = true;
        }
        onResult(transcript, isFinal);
      };
      rec.onerror = (event: any) => {
        starting = false;
        onError(event?.error ?? 'unknown');
      };
      rec.onend = () => {
        starting = false;
        activeRecognition = null;
        onEnd();
      };

      rec.start();
      activeRecognition = rec;
      starting = false;
    } catch {
      starting = false;
      onError('start-failed');
    }
  };

  // Pequeño margen tras el hardReset para que el motor de voz del
  // navegador quede realmente libre antes de arrancar una instancia nueva.
  setTimeout(create, 60);
  return true;
}

export function stopListening(): void {
  hardReset();
}

// ─────────────────────────────────────────────────────────────────────────
// Síntesis de voz — timbre grave, tecnológico, tipo "Jarvis"
// ─────────────────────────────────────────────────────────────────────────

let preferredVoice: SpeechSynthesisVoice | null = null;
let audioUnlocked = false;

// Nombres de voces es-* conocidas por sonar naturales/masculinas y graves
// en los principales navegadores (Chrome/Edge en Windows, macOS, Android).
const VOZ_PREFERIDA_REGEX = /jorge|diego|juan|pablo|google español|microsoft.*(pablo|jorge|dario)|male/i;
// Voces que suelen sonar peor (robóticas, muy agudas, "compact") — evitarlas si hay alternativa.
const VOZ_EVITAR_REGEX = /compact|novelty|whisper|female|mujer|paulina|monica|helena/i;

function pickSpanishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const esES  = voices.filter(v => v.lang?.toLowerCase().startsWith('es-es'));
  const esAny = voices.filter(v => v.lang?.toLowerCase().startsWith('es'));
  const pool  = esES.length > 0 ? esES : esAny;
  if (pool.length === 0) return null;

  const preferida = pool.find(v => VOZ_PREFERIDA_REGEX.test(v.name) && !VOZ_EVITAR_REGEX.test(v.name));
  if (preferida) return preferida;

  const noEvitar = pool.find(v => !VOZ_EVITAR_REGEX.test(v.name));
  return noEvitar ?? pool[0];
}

function refreshVoice() {
  preferredVoice = pickSpanishVoice();
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = refreshVoice;
  refreshVoice();
}

/**
 * Debe llamarse una vez dentro de un manejador de clic/toque real del
 * usuario para desbloquear la síntesis de voz en navegadores que la
 * bloquean hasta la primera interacción (Safari/iOS sobre todo).
 */
export function unlockSpeechSynthesis(): void {
  if (audioUnlocked || typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    const silent = new SpeechSynthesisUtterance('');
    silent.volume = 0;
    window.speechSynthesis.speak(silent);
    audioUnlocked = true;
    refreshVoice();
  } catch { /* noop */ }
}

export function speak(text: string, enabled: boolean = true): void {
  if (!enabled) return;
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Salvaguarda: cancela cualquier emisión previa antes de iniciar una nueva.
  window.speechSynthesis.cancel();

  if (!preferredVoice) refreshVoice();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.pitch = 0.85;
  utterance.rate = 0.95;
  utterance.volume = 1;
  if (preferredVoice) utterance.voice = preferredVoice;

  // Chrome a veces "traga" la primera emisión si se llama justo después de
  // cancel(); un pequeño margen lo evita de forma fiable.
  setTimeout(() => window.speechSynthesis.speak(utterance), 40);
}

export function cancelSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechSynthesisAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function listAvailableSpanishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices().filter(v => v.lang?.toLowerCase().startsWith('es'));
}
