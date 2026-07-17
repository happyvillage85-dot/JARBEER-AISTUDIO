export const APP_NAME = 'J.A.R.B.E.E.R.';
export const APP_FULL_NAME = 'Just A Real Brewing Expert Reasoner';
export const APP_TAGLINE = 'Inteligencia que fermenta resultados';
export const APP_VERSION = 'BETA 2.7';
export const USER_NAME = 'Juanfran';

// Modo producción: rutas relativas a Netlify (/.netlify/functions/*).
// Modo desarrollo: backend local (VITE_API_URL o localhost:8000).
export const IS_PRODUCTION = import.meta.env.PROD === true;
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';
export const GEMINI_FUNCTION_URL = '/.netlify/functions/gemini';

export type SystemMode = 'online' | 'bunker';

const MODE_KEY = 'jarbeer_mode';

/**
 * ONLINE  → Gemini API (cloud, requiere internet)
 * BÚNKER  → IA local (Gemma/Llama/Mistral/Qwen, sin internet, datos en la fábrica)
 */
export function getMode(): SystemMode {
  try {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === 'bunker' || stored === 'online') return stored;
  } catch { /* localStorage no disponible */ }
  return 'online';
}

export function setMode(mode: SystemMode): void {
  try { localStorage.setItem(MODE_KEY, mode); } catch { /* noop */ }
}

export const MODE_LABELS: Record<SystemMode, { short: string; full: string; dot: string; color: string }> = {
  online: { short: 'ONLINE',  full: 'IA ONLINE — Gemini',  dot: '#34d399', color: '#34d399' },
  bunker: { short: 'BÚNKER',  full: 'IA BÚNKER — Local',    dot: '#FFAA00', color: '#FFAA00' },
};
