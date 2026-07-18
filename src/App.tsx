import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { BottomNav } from './components/BottomNav';
import { TopNav } from './components/TopNav';
import { StatusBar } from './components/StatusBar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { BootScreen } from './screens/BootScreen';
import { Home } from './screens/Home';
import { Production } from './screens/Production';
import { Documents } from './screens/Documents';
import { Assistant } from './screens/Assistant';
import { Fermentadores } from './screens/Fermentadores';
import { Recetas } from './screens/Recetas';
import { Alertas } from './screens/Alertas';
import { Analisis } from './screens/Analisis';
import { Logs } from './screens/Logs';
import { DiagnosticConsole } from './components/DiagnosticConsole';
import type { Screen, ChatMessage } from './data/mockData';
import { initialChat, voiceCommands, BATCHES, documents } from './data/mockData';
import type { MicState } from './components/MicButton';
import { playSound } from './lib/sound';
import { haptics } from './lib/haptics';
import { getMode, setMode as persistMode, type SystemMode } from './lib/config';
import { api, setMissingApiKeyHandler } from './lib/api';
import {
  startListening, stopListening, isVoiceRecognitionAvailable,
  speak, cancelSpeech,
} from './lib/voice';

const PV = {
  initial: { opacity:0, y:14, filter:'blur(5px)' },
  animate: { opacity:1, y:0,  filter:'blur(0px)' },
  exit:    { opacity:0, y:-10, filter:'blur(4px)' },
};
const PT = { duration:0.37, ease:[0.22,1,0.36,1] as [number,number,number,number] };

export default function App() {
  const [booted, setBooted]   = useState(false);
  const [screen, setScreen]   = useState<Screen>('home');
  const [mic, setMic]         = useState<MicState>('idle');
  const [msgs, setMsgs]       = useState<ChatMessage[]>(initialChat);
  const [typing, setTyping]   = useState(false);
  const [sound, setSound]     = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(() => localStorage.getItem('jarbeer-voice') || '');
  const [mode, setModeState]  = useState<SystemMode>(() => getMode());
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const timers                = useRef<ReturnType<typeof setTimeout>[]>([]);
  const transcriptRef         = useRef('');

  useEffect(() => {
    setMissingApiKeyHandler(() => setShowApiKeyModal(true));
  }, []);

  useEffect(() => {
    localStorage.setItem('jarbeer-voice', selectedVoice);
  }, [selectedVoice]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current=[]; };

  const toggleMode = useCallback(() => {
    setModeState(prev => {
      const next: SystemMode = prev === 'bunker' ? 'online' : 'bunker';
      persistMode(next);
      return next;
    });
  }, []);

  const navigate = useCallback((s: Screen) => {
    playSound('navigate', sound); setScreen(s);
  }, [sound]);

  const now = () => new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});

  // Construye el contexto de la fábrica para inyectar en Gemini
  const buildFactoryContext = useCallback(() => ({
    mode,
    batches: BATCHES.map(b => ({
      batch: b.batch, recipe: b.recipe, stage: b.stage, stageProgress: b.stageProgress,
      fermentadorNum: b.fermentadorNum, currentTemp: b.currentTemp, plato: b.plato, ph: b.ph,
    })),
    fermentadores: [
      { id: 'F-01', recipe: BATCHES[0]?.recipe, temp: 20.5, plato: 9.2, ph: 5.25, progress: 68, timeLeft: '4d 12h' },
      { id: 'F-02', recipe: BATCHES[1]?.recipe, temp: 18.0, plato: 12.5, ph: 5.18, progress: 42, timeLeft: '6d 04h' },
      { id: 'F-04', recipe: 'Stout', temp: 22.0, plato: 14.8, ph: 5.30, progress: 85, timeLeft: '2d 08h' },
      { id: 'F-06', recipe: 'Lager', temp: 12.0, plato: 11.2, ph: 5.22, progress: 15, timeLeft: '12d 00h' },
    ],
    documents: documents.map(d => ({ title: d.title, reference: d.reference, category: d.category })),
  }), [mode]);

  const respondTo = useCallback(async (userText: string) => {
    const lower = userText.trim().toLowerCase();

    // Interceptar la respuesta a la pregunta de limpieza del historial
    const lastMsg = msgs[msgs.length - 1];
    const isCleanHistoryPrompt = lastMsg && lastMsg.role === 'assistant' && lastMsg.content.includes('¿Limpiamos el historial de este chat para prevenir alucinaciones?');

    if (lower.includes('modo diagnóstico') || lower.includes('diagnostico')) {
      playSound('confirm', sound);
      setShowDiagnostic(prev => {
        const next = !prev;
        speak(next ? 'Modo diagnóstico activado. Mostrando telemetría.' : 'Modo diagnóstico desactivado.', voiceOn, selectedVoice);
        setMsgs(p => [
          ...p,
          { id: `u${Date.now()}`, role: 'user', content: userText, timestamp: now() },
          { id: `a${Date.now()}`, role: 'assistant', content: next ? 'Modo diagnóstico activado. Mostrando telemetría en pantalla.' : 'Modo diagnóstico desactivado.', timestamp: now() }
        ]);
        return next;
      });
      setTyping(false);
      setMic('idle');
      return;
    }

    if (isCleanHistoryPrompt) {
      if (lower === 'y' || lower === 'yes' || lower === 'si' || lower === 'sí' || lower === 'limpiar' || lower === 'clear' || lower === 's') {
        playSound('confirm', sound);
        setMsgs(initialChat);
        setTyping(false);
        setMic('idle');
        speak('Historial de chat limpiado, socio. Listo para empezar de cero sin interferencias.', voiceOn, selectedVoice);
        return;
      } else if (lower === 'n' || lower === 'no') {
        playSound('confirm', sound);
        setMsgs(p => [
          ...p,
          { id: `u${Date.now()}`, role: 'user', content: userText, timestamp: now() },
          { id: `a${Date.now()}`, role: 'assistant', content: 'Entendido, socio. Mantendremos la sesión de chat activa por si necesitas repasar algún cálculo o receta anterior. Tú decides.', timestamp: now() }
        ]);
        setTyping(false);
        setMic('idle');
        speak('Entendido, socio. Mantendremos la sesión activa.', voiceOn, selectedVoice);
        return;
      }
    }

    setMsgs(p=>[...p,{id:`u${Date.now()}`,role:'user',content:userText,timestamp:now()}]);
    setTyping(true);
    setMic('responding');

    const match = voiceCommands.find(c=>c.triggers.some(t=>lower.includes(t)));

    // Construir historial para Gemini (excluyendo el mensaje actual)
    const history = msgs
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))
      .slice(-10);

    const context = buildFactoryContext();

    let reply = match?.response ?? 'Comando recibido. Procesando...';
    let usedGemini = false;
    let geminiReply = '';

    if (lower.includes('hora')) {
      reply = `Son las ${now()}.`;
      usedGemini = false;
    }

    try {
      const msgId = `a${Date.now()}`;
      let accumulated = '';

      await api.sendCommandStream(
        userText,
        history,
        context,
        (chunk) => {
          accumulated += chunk;
          if (!usedGemini) {
            usedGemini = true;
            geminiReply = accumulated;
            setMsgs(p => [...p, { id: msgId, role: 'assistant', content: accumulated, timestamp: now() }]);
          } else {
            geminiReply = accumulated;
            setMsgs(p => p.map(m => m.id === msgId ? { ...m, content: accumulated } : m));
          }
        }
      );
    } catch (err: any) {
      if (err.message === 'API_KEY_REQUIRED') {
        setMsgs(p => p.slice(0, -1)); // Remove the user message that just got added
        setTyping(false);
        setMic('idle');
        return;
      }
      console.error("Error al invocar el asistente de Gemini:", err);
      const errorMsg = err.message || "Error desconocido en el servidor.";
      reply = `⚠️ *Error de conexión con el núcleo de Gemini:*\n"${errorMsg}"\n\nSocio, parece que hay un problema al contactar con mi servidor. Si estás en modo Online, asegúrate de añadir la clave de API (**GEMINI_API_KEY**) en los Ajustes. Si prefieres trabajar de forma local y offline, puedes cambiar al modo **Búnker** haciendo clic en el selector de la barra superior.`;
    }

    if (!usedGemini) {
      playSound('confirm', sound);
      speak(reply, voiceOn, selectedVoice);
      setMsgs(p=>[...p,{id:`a${Date.now()}`,role:'assistant',content:reply,timestamp:now(),navigateTo:match?.target}]);
    } else {
      playSound('confirm', sound);
      speak(geminiReply, voiceOn, selectedVoice);
      if (match?.target) {
        setMsgs(p => {
          const last = p[p.length-1];
          if (last && last.role === 'assistant') {
            return p.map(m => m.id === last.id ? { ...m, navigateTo: match.target } : m);
          }
          return p;
        });
      }
    }

    setTyping(false);
    setMic('idle');
    api.resetAvatar().catch(()=>{});
    if (match?.action==='navigate' && match.target) setTimeout(()=>setScreen(match.target!), 600);
  }, [sound, voiceOn, selectedVoice, msgs, mode, buildFactoryContext]);

  const handleMic = useCallback(() => {
    if (mic === 'listening') {
      stopListening();
      setMic('idle');
      haptics.micStop();
      return;
    }
    if (mic !== 'idle') return;
    clearTimers();
    cancelSpeech();

    if (!isVoiceRecognitionAvailable()) {
      const msg = 'Reconocimiento de voz no disponible en este navegador. Usa Chrome o Edge, o escribe tu comando.';
      speak(msg, voiceOn, selectedVoice);
      setMsgs(p=>[...p,{id:`a${Date.now()}`,role:'assistant',content:msg,timestamp:now()}]);
      haptics.error();
      return;
    }

    playSound('listen', sound);
    haptics.micStart();
    setMic('listening');
    transcriptRef.current = '';
    let resuelto = false;

    startListening(
      (transcript, isFinal) => {
        transcriptRef.current = transcript;
        if (isFinal && !resuelto) {
          resuelto = true;
          playSound('process', sound);
          haptics.light();
          setMic('processing');
          setTimeout(() => respondTo(transcript), 300);
        }
      },
      (_error) => {
        resuelto = true;
        setMic('idle');
        haptics.error();
      },
      () => {
        setMic(current => current === 'listening' ? 'idle' : current);
      }
    );
  }, [mic, sound, voiceOn, selectedVoice, respondTo]);

  const handleSend = useCallback((text: string) => {
    respondTo(text);
  }, [respondTo]);

  return (
    <>
      {/* Background image — full visibility */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <img 
          src="/src/assets/images/fondo_pc_1784321905664.jpg" 
          alt="" 
          className="absolute inset-0 h-full w-full object-cover" 
          style={{ opacity: 1 }} 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0" style={{ background: 'rgba(2,4,8,0.35)' }} />
      </div>
      <AnimatePresence>
        {!booted && <BootScreen key="boot" onComplete={()=>setBooted(true)} soundEnabled={sound}/>}
      </AnimatePresence>
      <ApiKeyModal 
        isOpen={showApiKeyModal} 
        onClose={() => setShowApiKeyModal(false)} 
        onSave={() => setShowApiKeyModal(false)} 
      />
      <DiagnosticConsole isVisible={showDiagnostic} />
      {booted && (
        <>
          {/* ── Desktop layout: TopNav + content + StatusBar ── */}
          <div className="hidden md:flex flex-col h-[100dvh]">
            <TopNav active={screen} onNavigate={navigate} mode={mode} onToggleMode={toggleMode}
              soundEnabled={sound} onToggleSound={()=>setSound(v=>!v)}
              onOpenAssistant={()=>navigate('assistant')} alertCount={0}
              onOpenLogs={()=>navigate('logs')}
            />
            <div className="relative z-10 flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div key={screen} variants={PV} initial="initial" animate="animate" exit="exit" transition={PT} className="h-full">
                  {screen==='home'          && <Home micState={mic} onMic={handleMic} onNavigate={navigate} soundEnabled={sound} onToggleSound={()=>setSound(v=>!v)} mode={mode} onToggleMode={toggleMode}/>}
                  {screen==='production'    && <Production/>}
                  {screen==='documents'     && <Documents/>}
                  {screen==='fermentadores'  && <Fermentadores/>}
                  {screen==='recetas'        && <Recetas/>}
                  {screen==='alertas'        && <Alertas/>}
                  {screen==='analisis'       && <Analisis/>}
                  {screen==='logs'           && <Logs/>}
                  {screen==='assistant'      && <Assistant messages={msgs} micState={mic} onMic={handleMic} onSend={handleSend} typing={typing} onNavigate={navigate} mode={mode} selectedVoice={selectedVoice} setSelectedVoice={setSelectedVoice}/>}
                </motion.div>
              </AnimatePresence>
            </div>
            <StatusBar/>
          </div>

          {/* ── Mobile layout: BottomNav ── */}
          <div className="md:hidden relative mx-auto flex h-[100dvh] max-w-2xl flex-col">
            <div className="relative z-10 flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div key={screen+'-m'} variants={PV} initial="initial" animate="animate" exit="exit" transition={PT} className="min-h-full">
                  {screen==='home'          && <Home micState={mic} onMic={handleMic} onNavigate={navigate} soundEnabled={sound} onToggleSound={()=>setSound(v=>!v)} mode={mode} onToggleMode={toggleMode}/>}
                  {screen==='production'    && <Production/>}
                  {screen==='documents'     && <Documents/>}
                  {screen==='fermentadores'  && <Fermentadores/>}
                  {screen==='recetas'        && <Recetas/>}
                  {screen==='alertas'        && <Alertas/>}
                  {screen==='analisis'       && <Analisis/>}
                  {screen==='logs'           && <Logs/>}
                  {screen==='assistant'      && <Assistant messages={msgs} micState={mic} onMic={handleMic} onSend={handleSend} typing={typing} onNavigate={navigate} mode={mode} selectedVoice={selectedVoice} setSelectedVoice={setSelectedVoice}/>}
                </motion.div>
              </AnimatePresence>
            </div>
            <BottomNav active={screen} onNavigate={navigate} soundEnabled={sound}/>
          </div>
        </>
      )}
    </>
  );
}
