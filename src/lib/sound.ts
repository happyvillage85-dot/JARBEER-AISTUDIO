type SoundName = 'boot' | 'checkmark' | 'navigate' | 'listen' | 'process' | 'confirm';

let ctx: AudioContext | null = null;
function getCtx() {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/**
 * Los navegadores crean el AudioContext en estado "suspended" hasta que
 * hay una interacción explícita del usuario (política anti-autoplay).
 * Sin este resume(), el audio se queda bloqueado para siempre aunque
 * el usuario haga clic, porque nadie reactiva el contexto ya creado.
 */
function ensureRunning(ac: AudioContext) {
  if (ac.state === 'suspended') {
    ac.resume().catch(() => { /* se reintentará en el próximo sonido */ });
  }
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.05, fi = 0.01, fo = 0.08) {
  try {
    const ac = getCtx();
    ensureRunning(ac);
    const osc = ac.createOscillator();
    const env = ac.createGain();
    osc.connect(env); env.connect(ac.destination);
    osc.type = type; osc.frequency.value = freq;
    const now = ac.currentTime;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(gain, now + fi);
    env.gain.setValueAtTime(gain, now + dur - fo);
    env.gain.linearRampToValueAtTime(0, now + dur);
    osc.start(now); osc.stop(now + dur);
  } catch { /* audio bloqueado por el navegador; no interrumpe la app */ }
}

/**
 * Debe llamarse una vez, dentro de un manejador de clic/toque real
 * (por ejemplo, el primer tap en la pantalla de arranque), para
 * desbloquear el audio en navegadores con política anti-autoplay estricta.
 */
export function unlockAudio() {
  try {
    const ac = getCtx();
    ensureRunning(ac);
  } catch { /* noop */ }
}

export function playSound(name: SoundName, enabled: boolean) {
  if (!enabled) return;
  switch (name) {
    case 'boot':      tone(220,0.3,'sine',0.06); setTimeout(()=>tone(440,0.35,'sine',0.06),300); break;
    case 'checkmark': tone(880,0.08,'sine',0.04); break;
    case 'navigate':  tone(660,0.1,'sine',0.04); break;
    case 'listen':    tone(440,0.15,'sine',0.05); setTimeout(()=>tone(550,0.12,'sine',0.04),100); break;
    case 'process':   tone(330,0.2,'triangle',0.04); break;
    case 'confirm':   tone(660,0.12,'sine',0.05); setTimeout(()=>tone(880,0.18,'sine',0.04),80); break;
  }
}
