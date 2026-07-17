import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Droplets, FlaskConical, Leaf, FileText, Check, Clock, User, Pencil, X, CheckCircle2, CircleDot, Plus, Loader2, Beaker, Package, Download, ChevronDown, Calendar, CalendarCheck, CalendarPlus, LogOut, LogIn, AlertTriangle, Pin, PlusCircle, Trash2, Sparkles } from 'lucide-react';
import { 
  initAuth, googleSignIn, getAccessToken, logout, 
  createCalendarEvent, listCalendarEvents, calculateTimelineDates,
  listKeepNotes, createKeepNote
} from '../lib/googleAuth';
import type { User as FirebaseUser } from 'firebase/auth';
import { ScreenHeader } from '../components/ScreenHeader';
import { GlassCard } from '../components/GlassCard';
import { BATCHES, type BatchData } from '../data/mockData';
import { generateProductionPdfHtml } from '../lib/pdf';

type PdfState = 'idle'|'preparing'|'generating'|'done';

function fieldsFromBatch(b: BatchData) {
  return {
    batch: b.batch, brewer: b.brewer,
    startDate: b.startDate, plato: String(b.plato),
    ph: String(b.ph), currentTemp: String(b.currentTemp),
    observations: b.observations,
    h2oInicial: b.h2oInicial, tempInicial: b.tempInicial, acidoFosforico: b.acidoFosforico,
    mixTempReal: b.mixTempReal, phMaceracion: b.phMaceracion, fosfMaceracion: b.fosfMaceracion,
    enjuagueDir: b.enjuagueDir, spargeTotal: b.spargeTotal,
    platoPreHervido: b.platoPreHervido, phMacerado: b.phMacerado, transferencia: b.transferencia,
    tempHervidoReal: b.tempHervidoReal, fosfMediaHora: b.fosfMediaHora,
    whirlpoolRemolino: b.whirlpoolRemolino, whirlpoolReposo: b.whirlpoolReposo,
    platoFinal: b.platoFinal, litrosTransfReal: b.litrosTransfReal,
    fermentadorNum: b.fermentadorNum, phFinal: b.phFinal, regFermentacion: b.regFermentacion,
    fechaEnvasado: b.fechaEnvasado, totalBotellas: b.totalBotellas,
    numPalets: b.numPalets, lotesPalets: b.lotesPalets,
    barriles20: b.barriles20, barriles30: b.barriles30, barriles50: b.barriles50,
  };
}

interface LocalNote {
  id: string;
  title: string;
  content: string;
  date: string;
  isKeepFallback?: boolean;
}

const DEFAULT_LOCAL_NOTES: LocalNote[] = [
  {
    id: 'note-1',
    title: '🌿 Dry Hopping IPA Lote F-02',
    content: 'Se añadieron 5kg de lúpulo Citra y 3kg de Mosaic en la cuba F-02. Temperatura estable a 18°C. Controlar pH y densidad mañana por la tarde para verificar atenuación.',
    date: '2026-07-16'
  },
  {
    id: 'note-2',
    title: '❄️ Ajuste de Temperatura Maduración',
    content: 'Lote de Imperial Stout bajó de 22°C a 4°C para iniciar frío. Tiempo estimado de maduración: 14 días. Perfil organoléptico excelente, notas marcadas a cacao y café.',
    date: '2026-07-15'
  },
  {
    id: 'note-3',
    title: '🧪 Control de Levadura Kveik',
    content: 'Densidad actual 12.5°Plato. Atenuación aproximada del 75%. El lote de Ale de verano está listo para transferir. Levadura Kveik fermentó extremadamente limpia a 32°C.',
    date: '2026-07-14'
  }
];

export function Production() {
  const [batchIdx, setBatchIdx] = useState(0);
  const productionData = BATCHES[batchIdx];
  const [showBatchMenu, setShowBatchMenu] = useState(false);

  const [fields, setFields] = useState(() => fieldsFromBatch(productionData));
  const [editing, setEditing] = useState<string|null>(null);
  const [pdfState, setPdfState] = useState<PdfState>('idle');
  const [maltas, setMaltas]   = useState(() => productionData.maltas.map((m,i)=>({...m,id:`m${i}`})));
  const [lupulos, setLupulos] = useState(() => productionData.lupulos.map((l,i)=>({...l,id:`l${i}`})));
  const [lupulosFicha, setLupulosFicha] = useState(() => productionData.lupulosPlantilla.map((l,i)=>({...l,id:`h${i}`})));

  // --- Google Calendar integration states ---
  const [needsAuth, setNeedsAuth] = useState(true);
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [syncConfirm, setSyncConfirm] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // --- Google Keep integration states ---
  const [keepNotes, setKeepNotes] = useState<any[]>([]);
  const [isLoadingKeep, setIsLoadingKeep] = useState(false);
  const [isKeepFallback, setIsKeepFallback] = useState(false);
  const [keepError, setKeepError] = useState<string | null>(null);

  // New quick note form states
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  // Local persisted notes (synchronized with Documents.tsx storage key)
  const [localNotes, setLocalNotes] = useState<LocalNote[]>(() => {
    const saved = localStorage.getItem('jarbeer-local-notes');
    return saved ? JSON.parse(saved) : DEFAULT_LOCAL_NOTES;
  });

  // Keep local notes updated
  useEffect(() => {
    localStorage.setItem('jarbeer-local-notes', JSON.stringify(localNotes));
  }, [localNotes]);

  // Parse stages of current batch
  const computedStages = useMemo(() => {
    return calculateTimelineDates(fields.startDate || productionData.startDate, productionData.timeline);
  }, [fields.startDate, productionData.startDate, productionData.timeline]);

  // Track selected stages to sync (by default, select all)
  const [selectedStages, setSelectedStages] = useState<string[]>([]);

  // Update selected stages when batch index or computedStages change
  useEffect(() => {
    setSelectedStages(computedStages.map(s => s.stage));
    setSyncDone(false);
    setSyncError(null);
  }, [computedStages]);

  // Init Google auth state listener on component mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setNeedsAuth(false);
        fetchUpcomingEvents();
        fetchKeepNotes();
      },
      () => {
        setGoogleUser(null);
        setNeedsAuth(true);
        setKeepNotes([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setSyncError(null);
    setKeepError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setNeedsAuth(false);
        // Fetch list of upcoming events from Google Calendar and Google Keep
        fetchUpcomingEvents();
        fetchKeepNotes();
      }
    } catch (err: any) {
      console.error('Google login failed:', err);
      setSyncError(err.message || 'Error al iniciar sesión con Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setGoogleUser(null);
      setNeedsAuth(true);
      setCalendarEvents([]);
      setKeepNotes([]);
    } catch (err: any) {
      console.error('Google logout failed:', err);
    }
  };

  const fetchUpcomingEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const data = await listCalendarEvents(5);
      setCalendarEvents(data.items || []);
    } catch (err: any) {
      console.error('Failed to list events:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const fetchKeepNotes = async () => {
    setIsLoadingKeep(true);
    setKeepError(null);
    try {
      const res = await listKeepNotes();
      setKeepNotes(res.notes || []);
      setIsKeepFallback(false);
    } catch (err: any) {
      console.warn('Keep API call warning/failure in Production:', err);
      // Fallback to local storage if API restricted or fails
      if (err.status === 403 || err.status === 400 || String(err.message).includes('403') || String(err.message).includes('restricted')) {
        setIsKeepFallback(true);
      } else {
        setKeepError(err.message || 'Error al conectar con Google Keep');
      }
    } finally {
      setIsLoadingKeep(false);
    }
  };

  const handleAddQuickNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;

    setIsCreatingNote(true);
    setKeepError(null);

    const titleText = noteTitle.trim() || 'Apunte de producción';
    const bodyText = noteContent.trim();

    try {
      if (!isKeepFallback && googleUser) {
        await createKeepNote({ title: titleText, text: bodyText });
        await fetchKeepNotes();
      } else {
        const newNote: LocalNote = {
          id: 'local-' + Date.now(),
          title: titleText,
          content: bodyText,
          date: new Date().toISOString().split('T')[0],
          isKeepFallback: true
        };
        setLocalNotes(prev => [newNote, ...prev]);
      }
      setNoteTitle('');
      setNoteContent('');
    } catch (err: any) {
      console.error('Failed to create note in Production:', err);
      if (err.status === 403 || String(err.message).includes('403')) {
        setIsKeepFallback(true);
        const newNote: LocalNote = {
          id: 'local-' + Date.now(),
          title: titleText,
          content: bodyText,
          date: new Date().toISOString().split('T')[0],
          isKeepFallback: true
        };
        setLocalNotes(prev => [newNote, ...prev]);
        setNoteTitle('');
        setNoteContent('');
      } else {
        setKeepError(err.message || 'Error al crear la nota');
      }
    } finally {
      setIsCreatingNote(false);
    }
  };

  const handleSyncToCalendar = async () => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncDone(false);

    try {
      // Loop through all selected stages and create events
      for (const stageName of selectedStages) {
        const stageInfo = computedStages.find(s => s.stage === stageName);
        if (!stageInfo) continue;

        // Build a detailed description of the event
        const description = `
🍺 [Lote ${fields.batch}] - Etapa de ${stageInfo.stage} para la receta ${productionData.recipe}.
👨‍🍳 Maestro Cervecero: ${fields.brewer}
🥛 Volumen: ${productionData.volume} L
🧪 pH: ${fields.ph} | Densidad actual: ${fields.plato}°P
📝 Notas: ${fields.observations}

Generado automáticamente por J.A.R.B.E.E.R. OS
        `.trim();

        const event = {
          summary: `🍺 [Lote ${fields.batch}] ${productionData.recipe} - ${stageInfo.stage}`,
          description,
          start: {
            date: stageInfo.start,
          },
          end: {
            date: stageInfo.end,
          },
          // Customize color based on stage
          colorId: stageInfo.stage === 'Fermentación' ? '6' : stageInfo.stage === 'Maduración' ? '7' : '5'
        };

        await createCalendarEvent(event);
      }

      setSyncDone(true);
      setSyncConfirm(false);
      // Refresh the upcoming events list
      fetchUpcomingEvents();
    } catch (err: any) {
      console.error('Google Calendar synchronization failed:', err);
      setSyncError(err.message || 'Error al sincronizar con Google Calendar');
    } finally {
      setIsSyncing(false);
    }
  };

  const selectBatch = (idx: number) => {
    setBatchIdx(idx);
    const b = BATCHES[idx];
    setFields(fieldsFromBatch(b));
    setMaltas(b.maltas.map((m,i)=>({...m,id:`m${i}`})));
    setLupulos(b.lupulos.map((l,i)=>({...l,id:`l${i}`})));
    setLupulosFicha(b.lupulosPlantilla.map((l,i)=>({...l,id:`h${i}`})));
    setShowBatchMenu(false);
  };

  const handlePdf = () => {
    if (pdfState !== 'idle') return;
    setPdfState('preparing');
    setTimeout(()=>setPdfState('generating'), 1500);
    setTimeout(()=>{
      setPdfState('done');
      const html = generateProductionPdfHtml({ ...productionData, ...fields }, maltas, lupulosFicha);
      const win = window.open('', '_blank');
      if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(()=>win.print(), 400); }
    }, 3000);
    setTimeout(()=>setPdfState('idle'), 5200);
  };

  const stageIdx = ['Maceración','Filtrado','Ebullición','Whirlpool','Fermentación','Maduración','Envasado'].indexOf(productionData.stage);

  return (
    <div className="flex min-h-full flex-col pb-32">
      <ScreenHeader
        title="Ficha de Producción"
        subtitle={`Lote ${fields.batch} · ${productionData.recipe}`}
        right={
          <span className="rounded-lg px-3 py-1 font-mono text-[10px] uppercase tracking-wider"
            style={{ background:'rgba(0,225,255,0.07)', border:'1px solid rgba(0,225,255,0.18)', color:'#00e1ff' }}
          >{productionData.stage}</span>
        }
      />
      <div className="flex flex-col gap-4 px-4">

        {/* Selector de lote */}
        <div className="relative">
          <motion.button
            onClick={() => setShowBatchMenu(v => !v)}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-between rounded-2xl px-4 py-3"
            style={{ background:'rgba(13,24,36,0.6)', border:'1px solid rgba(0,225,255,0.16)' }}
          >
            <div className="flex items-center gap-2.5">
              <FlaskConical size={15} style={{ color:'#00e1ff' }} />
              <span className="font-mono text-xs" style={{ color:'rgba(74,96,112,0.7)' }}>Lote:</span>
              <span className="font-display text-sm font-bold text-white">{productionData.recipe} <span style={{ color:'#00e1ff' }}>{productionData.batch}</span></span>
            </div>
            <motion.span animate={{ rotate: showBatchMenu ? 180 : 0 }}><ChevronDown size={16} style={{ color:'rgba(74,96,112,0.7)' }} /></motion.span>
          </motion.button>

          <AnimatePresence>
            {showBatchMenu && (
              <motion.div
                initial={{ opacity:0, y:-8, height:0 }} animate={{ opacity:1, y:0, height:'auto' }} exit={{ opacity:0, y:-8, height:0 }}
                transition={{ duration:0.22 }}
                className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl"
                style={{ background:'rgba(9,16,24,0.97)', border:'1px solid rgba(0,225,255,0.2)', backdropFilter:'blur(20px)' }}
              >
                {BATCHES.map((b, i) => (
                  <button key={b.batch} onClick={() => selectBatch(i)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors"
                    style={{ background: i === batchIdx ? 'rgba(0,225,255,0.06)' : 'transparent', borderBottom: i < BATCHES.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                  >
                    <div>
                      <p className="font-display text-sm font-bold text-white">{b.recipe}</p>
                      <p className="font-mono text-[10.5px]" style={{ color:'rgba(74,96,112,0.7)' }}>Lote {b.batch} · {b.stage} · {b.startDate}</p>
                    </div>
                    {i === batchIdx && <Check size={15} style={{ color:'#00e1ff' }} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Timeline */}
        <GlassCard className="overflow-hidden px-0 py-0" corners delay={0.08}>
          <div className="flex overflow-x-auto px-4 pb-3 pt-4" style={{ scrollbarWidth:'none' }}>
            {productionData.timeline.map((item, i) => {
              const isCur  = i === stageIdx;
              const isDone = item.done;
              return (
                <div key={item.stage} className="flex shrink-0 flex-col items-center" style={{ minWidth:70 }}>
                  <div className="relative flex flex-col items-center">
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300"
                      style={{ background:isDone?'rgba(0,225,255,0.1)':isCur?'rgba(255,170,0,0.12)':'rgba(13,24,36,0.6)', border:isDone?'1.5px solid rgba(0,225,255,0.35)':isCur?'1.5px solid rgba(255,170,0,0.55)':'1px solid rgba(255,255,255,0.07)' }}
                    >
                      {isDone ? <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:500,damping:20}}><Check size={13} style={{color:'#00e1ff'}} strokeWidth={2.5}/></motion.div>
                        : isCur ? <CircleDot size={13} style={{color:'#FFAA00'}}/>
                        : <Clock size={11} style={{color:'rgba(74,96,112,0.45)'}}/>
                      }
                      {isCur && <motion.div className="absolute inset-0 rounded-full" style={{border:'1px solid rgba(255,170,0,0.38)'}} animate={{scale:[1,1.65],opacity:[0.55,0]}} transition={{duration:2,repeat:Infinity,ease:'easeOut'}}/>}
                    </div>
                    {i < productionData.timeline.length-1 && (
                      <div className="absolute left-[calc(50%+18px)] top-4 h-px" style={{width:34, background:isDone?'rgba(0,225,255,0.28)':'rgba(255,255,255,0.06)'}}/>
                    )}
                  </div>
                  <span className="mt-2 text-center font-mono text-[8px] leading-tight" style={{color:isDone?'#00e1ff':isCur?'#FFAA00':'rgba(74,96,112,0.45)',maxWidth:60}}>{item.stage}</span>
                </div>
              );
            })}
          </div>
          <div className="mx-4 mb-4 h-1 overflow-hidden rounded-full" style={{background:'rgba(255,255,255,0.05)'}}>
            <motion.div className="h-full rounded-full" style={{background:'linear-gradient(90deg,#00e1ff,#FFAA00)'}}
              initial={{width:0}} animate={{width:`${productionData.stageProgress}%`}} transition={{duration:1.2,delay:0.4,ease:[0.22,1,0.36,1]}}
            />
          </div>
        </GlassCard>

        {/* WIDGET UNIFICADO: CALENDAR & KEEP */}
        <GlassCard className="p-4" corners delay={0.10}>
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00e1ff]/10 border border-[#00e1ff]/20 text-[#00e1ff]">
                <Sparkles size={14} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">Asistente Unificado: Agenda y Notas</h3>
                <p className="font-mono text-[8.5px] text-gray-500">Google Workspace & Backup Local</p>
              </div>
            </div>
            {googleUser && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#34d399]/5 border border-[#34d399]/20 font-mono text-[8.5px] text-[#34d399]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34d399] animate-ping" />
                Sincronizado
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* PANEL 1: CALENDAR AGENDA */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Calendar size={11} className="text-[#00e1ff]" />
                  Google Calendar (Próximos Pasos)
                </span>
                {!needsAuth && (
                  <button
                    onClick={fetchUpcomingEvents}
                    disabled={isLoadingEvents}
                    className="font-mono text-[8px] text-[#00e1ff] hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingEvents ? 'Cargando...' : 'Actualizar'}
                  </button>
                )}
              </div>

              {needsAuth ? (
                /* Offline / Not logged in Calendar mode - show computed local timeline steps nicely as preview/local agenda! */
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-white/5 space-y-2">
                    <p className="font-mono text-[8.5px] text-gray-500">
                      📅 Planificación de este Lote (Local):
                    </p>
                    <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                      {computedStages.slice(0, 3).map((stage) => (
                        <div key={stage.stage} className="flex items-center justify-between text-[10.5px]">
                          <span className="text-gray-300 truncate font-sans font-bold">{stage.stage}</span>
                          <span className="font-mono text-[8px] text-gray-500">{stage.start}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#00e1ff]/10 border border-[#00e1ff]/20 hover:bg-[#00e1ff]/20 text-[#00e1ff] font-display text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {isLoggingIn ? <Loader2 size={10} className="animate-spin" /> : <LogIn size={10} />}
                    Vincular Google Calendar
                  </button>
                </div>
              ) : (
                /* Live authenticated Calendar mode */
                <div className="space-y-2">
                  {isLoadingEvents ? (
                    <div className="py-6 text-center">
                      <Loader2 size={16} className="animate-spin mx-auto text-[#00e1ff]" />
                      <p className="font-mono text-[8px] text-gray-500 mt-1">Leyendo agenda...</p>
                    </div>
                  ) : calendarEvents.length === 0 ? (
                    <div className="py-6 text-center border border-dashed border-white/5 rounded-xl">
                      <CalendarCheck size={16} className="mx-auto mb-1 text-[#00e1ff] opacity-40" />
                      <p className="font-mono text-[9px] text-gray-500">No hay tareas agendadas</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                      {calendarEvents.map((ev, i) => (
                        <div key={ev.id || i} className="flex items-start justify-between p-2 rounded-lg bg-slate-950/40 border border-white/5 hover:border-[#00e1ff]/20 transition-all">
                          <div className="min-w-0 flex-1 pr-2">
                            <span className="font-sans text-[11px] font-bold text-gray-200 block truncate" title={ev.summary}>
                              {ev.summary}
                            </span>
                            <span className="font-mono text-[8px] text-gray-500 block mt-0.5">
                              🕒 {ev.start?.date || ev.start?.dateTime?.split('T')[0] || 'Todo el día'}
                            </span>
                          </div>
                          <span className="h-1.5 w-1.5 rounded-full bg-[#00e1ff] mt-1 shrink-0" style={{ boxShadow: '0 0 5px rgba(0,225,255,0.4)' }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PANEL 2: KEEP NOTES */}
            <div className="space-y-3 border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Pin size={11} className="text-amber-400" />
                  Google Keep (Notas Rápidas)
                </span>
                {!needsAuth && (
                  <button
                    onClick={fetchKeepNotes}
                    disabled={isLoadingKeep}
                    className="font-mono text-[8px] text-amber-400 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingKeep ? 'Cargando...' : 'Actualizar'}
                  </button>
                )}
              </div>

              {/* Banner if fallback mode active for Keep */}
              {!needsAuth && isKeepFallback && (
                <div className="px-2.5 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10 text-amber-400/90 font-mono text-[8px] leading-normal">
                  ⚠️ Google Keep API restringido para cuentas personales. Guardado local habilitado (Sincronizado con Biblioteca).
                </div>
              )}

              {/* Notes List */}
              <div className="space-y-2">
                {isLoadingKeep ? (
                  <div className="py-6 text-center">
                    <Loader2 size={16} className="animate-spin mx-auto text-amber-500" />
                    <p className="font-mono text-[8px] text-gray-500 mt-1">Cargando notas...</p>
                  </div>
                ) : (isKeepFallback || needsAuth ? localNotes : keepNotes).length === 0 ? (
                  <div className="py-6 text-center border border-dashed border-white/5 rounded-xl">
                    <Pin size={16} className="mx-auto mb-1 text-amber-500 opacity-40 rotate-12" />
                    <p className="font-mono text-[9px] text-gray-500">Sin notas registradas</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {(isKeepFallback || needsAuth ? localNotes : keepNotes).slice(0, 3).map((note) => {
                      const isL = isKeepFallback || needsAuth || !note.name;
                      const title = isL ? note.title : (note.title || 'Nota sin título');
                      const text = isL ? note.content : (note.body?.text?.text || '');

                      return (
                        <div key={isL ? note.id : note.name} className="p-2 rounded-lg bg-slate-950/40 border border-white/5 hover:border-amber-500/20 transition-all flex flex-col justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-sans text-[11px] font-bold text-white block truncate">
                                {title}
                              </span>
                              <span className="font-mono text-[7px] text-amber-400 bg-amber-500/5 px-1 py-0.2 rounded shrink-0">
                                {isL ? 'LOCAL' : 'KEEP'}
                              </span>
                            </div>
                            <p className="font-sans text-[10px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                              {text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Note Add Form inside unified widget */}
              <form onSubmit={handleAddQuickNote} className="pt-1.5 space-y-1.5 border-t border-white/5">
                <p className="font-mono text-[8px] text-gray-500 uppercase tracking-wider">Añadir apunte rápido de lote:</p>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={e => setNoteTitle(e.target.value)}
                    placeholder="Título..."
                    className="flex-1 rounded bg-slate-950/60 border border-white/5 px-2 py-1 text-white font-sans text-[10px] focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={noteContent}
                    onChange={e => setNoteContent(e.target.value)}
                    placeholder="Contenido técnico..."
                    className="flex-[2] rounded bg-slate-950/60 border border-white/5 px-2 py-1 text-white font-sans text-[10px] focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={isCreatingNote || (!noteTitle.trim() && !noteContent.trim())}
                    className="rounded bg-amber-500 hover:bg-amber-400 text-slate-950 px-2 py-1 font-display text-[9px] font-bold uppercase tracking-wider transition-colors disabled:opacity-30 flex items-center justify-center cursor-pointer"
                  >
                    {isCreatingNote ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} strokeWidth={3} />}
                  </button>
                </div>
                {keepError && (
                  <p className="font-mono text-[8px] text-rose-400 mt-1">{keepError}</p>
                )}
              </form>
            </div>
          </div>
        </GlassCard>

        {/* Datos generales */}
        <Sec title="Datos generales" icon={<FileText size={14}/>} delay={0.12}>
          <div className="grid grid-cols-2 gap-3">
            {([
              {key:'batch',      label:'Nº Lote',       icon:<FileText size={12}/>},
              {key:'brewer',     label:'Maestro',        icon:<User size={12}/>},
              {key:'startDate',  label:'Fecha inicio',   icon:<Clock size={12}/>},
              {key:'plato',      label:'°Plato',         icon:<Droplets size={12}/>},
              {key:'ph',         label:'pH',             icon:<Droplets size={12}/>},
              {key:'currentTemp',label:'Temperatura (°C)',icon:<Thermometer size={12}/>},
            ] as {key:string;label:string;icon:React.ReactNode}[]).map(({key,label,icon})=>(
              <EditField key={key} fkey={key} label={label} icon={icon}
                value={fields[key as keyof typeof fields]}
                isEditing={editing===key}
                onEdit={()=>setEditing(key)}
                onSave={v=>{setFields(p=>({...p,[key]:v}));setEditing(null);}}
                onCancel={()=>setEditing(null)}
              />
            ))}
          </div>
        </Sec>

        {/* Métricas de fermentación — °Plato como variable principal */}
        <Sec title="Fermentación" icon={<Beaker size={14}/>} delay={0.18}>
          {/* °Plato — variable principal destacada */}
          <div className="mb-3 rounded-2xl p-4 text-center"
            style={{ background:'rgba(255,208,96,0.06)', border:'1px solid rgba(255,208,96,0.22)', boxShadow:'0 4px 18px rgba(255,208,96,0.1)' }}
          >
            <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color:'rgba(255,208,96,0.7)' }}>°Plato (variable principal)</p>
            <p className="mt-1 font-display text-3xl font-bold" style={{ color:'#FFD060', textShadow:'0 0 12px rgba(255,208,96,0.4)' }}>{fields.plato}°P</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FermentMetric icon={<Thermometer size={11}/>} label="Temp" value={`${fields.currentTemp}°C`} color="#FFAA00" />
            <FermentMetric icon={<Droplets size={11}/>} label="pH" value={fields.ph} color="#00e1ff" />
            <FermentMetric icon={<Beaker size={11}/>} label="Estado" value={`${productionData.stageProgress}%`} color="#34d399" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <FermentMetric icon={<Clock size={11}/>} label="Tiempo restante" value={productionData.stage === 'Envasado' ? 'Completado' : `${Math.ceil((100 - productionData.stageProgress) / 10)}d`} color="#00e1ff" />
            <FermentMetric icon={<Beaker size={11}/>} label="CO₂ estimado" value={`${productionData.carbonation}`} color="#34d399" />
          </div>
          {/* Recomendación IA */}
          <div className="mt-3 rounded-xl p-3" style={{ background:'rgba(255,170,0,0.04)', border:'1px solid rgba(255,170,0,0.12)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color:'#FFAA00' }}>Recomendación IA</span>
            </div>
            <p className="font-sans text-xs leading-relaxed" style={{ color:'rgba(180,200,216,0.85)' }}>
              {productionData.stageProgress >= 80
                ? 'Fermentación avanzada. Preparar trasvase a maduración en 24-48h.'
                : productionData.stageProgress >= 40
                  ? 'Fermentación en curso. Mantener temperatura estable. Controlar °Plato diariamente.'
                  : 'Fermentación inicial. Verificar actividad de la levadura y control de temperatura.'}
            </p>
          </div>
        </Sec>

        {/* Métricas técnicas */}
        <Sec title="Métricas técnicas" icon={<Beaker size={14}/>} delay={0.20}>
          <div className="grid grid-cols-3 gap-3">
            {[
              {l:'OG',  v:productionData.og.toFixed(3)},
              {l:'FG',  v:productionData.fg.toFixed(3)},
              {l:'ABV', v:`${productionData.abv}%`},
              {l:'IBU', v:String(productionData.ibu)},
              {l:'EBC', v:String(productionData.ebc)},
              {l:'CO₂', v:`${productionData.carbonation}`},
            ].map(m=>(
              <div key={m.l} className="rounded-xl p-3 text-center" style={{background:'rgba(0,135,255,0.05)',border:'1px solid rgba(0,135,255,0.1)'}}>
                <p className="font-mono text-[9px] uppercase tracking-wider" style={{color:'rgba(74,96,112,0.7)'}}>{m.l}</p>
                <p className="mt-1 font-display text-lg font-bold text-white">{m.v}</p>
              </div>
            ))}
          </div>
        </Sec>

        {/* Maceración y lavado — bloque 3 de la plantilla oficial */}
        <Sec title="Maceración y lavado" icon={<Thermometer size={14}/>} delay={0.20}>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <MiniField label="Mix Tº real" value={fields.mixTempReal} unit="°C" onChange={v=>setFields(p=>({...p,mixTempReal:v}))}/>
            <MiniField label="pH" value={fields.phMaceracion} onChange={v=>setFields(p=>({...p,phMaceracion:v}))}/>
            <MiniField label="Fosf." value={fields.fosfMaceracion} unit="ml" onChange={v=>setFields(p=>({...p,fosfMaceracion:v}))}/>
          </div>
          <p className="mb-2 font-mono text-[9px] uppercase tracking-wider" style={{color:'rgba(74,96,112,0.6)'}}>Escalones programados</p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {productionData.escalones.map(e=>(
              <div key={e.id} className="rounded-xl p-2 text-center" style={{background:'rgba(0,225,255,0.04)',border:'1px solid rgba(0,225,255,0.09)'}}>
                <p className="font-mono text-[9px]" style={{color:'rgba(74,96,112,0.6)'}}>{e.nombre}</p>
                <p className="font-display text-base font-bold" style={{color:'#00e1ff'}}>{e.temp}°</p>
                <p className="font-mono text-[8px]" style={{color:'rgba(74,96,112,0.55)'}}>{e.tiempo}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MiniField label="Enjuague dir." value={fields.enjuagueDir} unit="L" onChange={v=>setFields(p=>({...p,enjuagueDir:v}))}/>
            <MiniField label="Sparge total" value={fields.spargeTotal} unit="L" onChange={v=>setFields(p=>({...p,spargeTotal:v}))}/>
            <MiniField label="°P pre-hervido" value={fields.platoPreHervido} unit="°P" onChange={v=>setFields(p=>({...p,platoPreHervido:v}))}/>
            <MiniField label="pH" value={fields.phMacerado} onChange={v=>setFields(p=>({...p,phMacerado:v}))}/>
          </div>
        </Sec>

        {/* Maltas */}
        <Sec title="Maltas" icon={<Leaf size={14}/>} delay={0.22} action={<AddBtn onClick={()=>setMaltas(p=>[...p,{id:`m${Date.now()}`,name:'Nueva malta',amount:'0 kg',ebc:0,supplier:'—'}])}/>}>
          <div className="space-y-2">
            {maltas.map(m=><IRow key={m.id} c1={m.name} c2={m.amount} c3={`EBC ${m.ebc}`} badge={m.supplier} accent="cyan"/>)}
          </div>
        </Sec>

        {/* Lúpulos (recetario) */}
        <Sec title="Lúpulos" icon={<FlaskConical size={14}/>} delay={0.26} action={<AddBtn onClick={()=>setLupulos(p=>[...p,{id:`l${Date.now()}`,name:'Nuevo lúpulo',alpha:'0%',amount:'0 g',addition:'—'}])}/>}>
          <div className="space-y-2">
            {lupulos.map(l=><IRow key={l.id} c1={l.name} c2={l.amount} c3={l.alpha} badge={l.addition} accent="amber"/>)}
          </div>
        </Sec>

        {/* Ebullición y lúpulos — bloque 4 de la plantilla oficial (por momento) */}
        <Sec title="Ebullición y lúpulos (60 min)" icon={<Beaker size={14}/>} delay={0.28} action={<AddBtn onClick={()=>setLupulosFicha(p=>[...p,{id:`h${Date.now()}`,momento:'—',variedad:'Nuevo',cantidad:'0'}])}/>}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <MiniField label="Tº hervido real" value={fields.tempHervidoReal} unit="°C" onChange={v=>setFields(p=>({...p,tempHervidoReal:v}))}/>
            <MiniField label="Ac. fosfórico (½h)" value={fields.fosfMediaHora} unit="ml" onChange={v=>setFields(p=>({...p,fosfMediaHora:v}))}/>
          </div>
          <div className="space-y-2 mb-3">
            {lupulosFicha.map(l=><IRow key={l.id} c1={l.variedad} c2={`${l.cantidad} g`} c3={l.momento} badge="Plan." accent="amber"/>)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MiniField label="Whirlpool remolino" value={fields.whirlpoolRemolino} unit="min" onChange={v=>setFields(p=>({...p,whirlpoolRemolino:v}))}/>
            <MiniField label="Reposo" value={fields.whirlpoolReposo} unit="min" onChange={v=>setFields(p=>({...p,whirlpoolReposo:v}))}/>
          </div>
        </Sec>

        {/* Levadura */}
        <Sec title="Levadura" icon={<Droplets size={14}/>} delay={0.30}>
          <div className="rounded-xl p-4" style={{background:'rgba(52,211,153,0.04)',border:'1px solid rgba(52,211,153,0.1)'}}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-base font-bold text-white">{productionData.levadura.name}</p>
                <p className="font-mono text-xs" style={{color:'rgba(74,96,112,0.7)'}}>{productionData.levadura.lab} · {productionData.levadura.format}</p>
              </div>
              <span className="rounded-lg px-2 py-1 font-mono text-[10px]" style={{background:'rgba(52,211,153,0.1)',border:'1px solid rgba(52,211,153,0.18)',color:'#34d399'}}>{productionData.levadura.attenuation}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div><p className="font-mono text-[9px] uppercase tracking-wider" style={{color:'rgba(74,96,112,0.6)'}}>Pitching</p><p className="mt-0.5 font-mono text-xs text-white">{productionData.levadura.pitch}</p></div>
              <div><p className="font-mono text-[9px] uppercase tracking-wider" style={{color:'rgba(74,96,112,0.6)'}}>Temp. rango</p><p className="mt-0.5 font-mono text-xs text-white">{productionData.levadura.tempRange}</p></div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <MiniField label="Litros transf. real" value={fields.litrosTransfReal} unit="L" onChange={v=>setFields(p=>({...p,litrosTransfReal:v}))}/>
              <MiniField label="Fermentador Nº" value={fields.fermentadorNum} onChange={v=>setFields(p=>({...p,fermentadorNum:v}))}/>
              <MiniField label="Reg. ferm./purga" value={fields.regFermentacion} unit="L" onChange={v=>setFields(p=>({...p,regFermentacion:v}))}/>
            </div>
          </div>
        </Sec>

        {/* Envasado y logística — bloque 6 de la plantilla oficial */}
        <Sec title="Envasado y logística" icon={<Package size={14}/>} delay={0.32}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <MiniField label="Fecha envasado" value={fields.fechaEnvasado} placeholder="dd/mm/aaaa" onChange={v=>setFields(p=>({...p,fechaEnvasado:v}))}/>
            <MiniField label="Total botellas" value={fields.totalBotellas} unit="uds" onChange={v=>setFields(p=>({...p,totalBotellas:v}))}/>
            <MiniField label="Nº palets" value={fields.numPalets} onChange={v=>setFields(p=>({...p,numPalets:v}))}/>
            <MiniField label="Lotes palets" value={fields.lotesPalets} onChange={v=>setFields(p=>({...p,lotesPalets:v}))}/>
          </div>
          <p className="mb-2 font-mono text-[9px] uppercase tracking-wider" style={{color:'rgba(74,96,112,0.6)'}}>Distribución de barriles</p>
          <div className="grid grid-cols-3 gap-3">
            <MiniField label="Barriles 20L" value={fields.barriles20} unit="uds" onChange={v=>setFields(p=>({...p,barriles20:v}))}/>
            <MiniField label="Barriles 30L" value={fields.barriles30} unit="uds" onChange={v=>setFields(p=>({...p,barriles30:v}))}/>
            <MiniField label="Barriles 50L" value={fields.barriles50} unit="uds" onChange={v=>setFields(p=>({...p,barriles50:v}))}/>
          </div>
        </Sec>

        {/* Observaciones */}
        <Sec title="Observaciones" icon={<Pencil size={14}/>} delay={0.34}>
          {editing==='observations'
            ? <div className="space-y-2">
                <textarea value={fields.observations} onChange={e=>setFields(p=>({...p,observations:e.target.value}))}
                  className="w-full resize-none rounded-xl p-3 font-sans text-sm focus:outline-none" style={{minHeight:80,background:'rgba(13,24,36,0.7)',border:'1px solid rgba(0,225,255,0.3)',color:'#e8f0f8'}}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={()=>setEditing(null)} className="flex-1 rounded-xl py-2 font-mono text-xs" style={{background:'rgba(0,225,255,0.09)',border:'1px solid rgba(0,225,255,0.18)',color:'#00e1ff'}}>Guardar</button>
                  <button onClick={()=>setEditing(null)} className="flex-1 rounded-xl py-2 font-mono text-xs" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',color:'rgba(74,96,112,0.75)'}}>Cancelar</button>
                </div>
              </div>
            : <button onClick={()=>setEditing('observations')} className="w-full rounded-xl p-3 text-left transition-all duration-200" style={{background:'rgba(255,255,255,0.028)',border:'1px solid rgba(255,255,255,0.06)'}}>
                <p className="font-sans text-sm leading-relaxed" style={{color:'rgba(180,200,216,0.85)'}}>{fields.observations}</p>
                <div className="mt-2 flex items-center gap-1.5"><Pencil size={10} style={{color:'rgba(0,225,255,0.45)'}}/><span className="font-mono text-[9px]" style={{color:'rgba(74,96,112,0.55)'}}>Toca para editar</span></div>
              </button>
          }
        </Sec>

        {/* Google Calendar Synchronization */}
        <Sec title="Integración con Google Calendar" icon={<Calendar size={14}/>} delay={0.36}>
          {needsAuth ? (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: 'rgba(255,170,0,0.07)', border: '1px solid rgba(255,170,0,0.2)' }}
              >
                <CalendarPlus size={22} style={{ color: '#FFAA00' }} />
              </div>
              <p className="font-display text-sm font-bold text-white mb-1">Vincula tu Google Calendar</p>
              <p className="font-sans text-xs text-gray-400 max-w-xs mb-4 leading-relaxed">
                Agenda automáticamente las etapas de producción, fermentación y envasado del lote activo en tu calendario oficial con un solo toque.
              </p>
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="gsi-material-button flex items-center justify-center gap-3 w-full rounded-xl py-3 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white font-display text-xs font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                <div className="gsi-material-button-icon h-5 w-5">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span>{isLoggingIn ? 'Iniciando sesión...' : 'Sincronizar con Google'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* User profile & logout row */}
              <div className="flex items-center justify-between rounded-xl p-3 bg-slate-900/50 border border-white/5">
                <div className="flex items-center gap-2">
                  {googleUser?.photoURL ? (
                    <img src={googleUser.photoURL} alt="Avatar" className="h-6 w-6 rounded-full border border-white/20" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-[#00e1ff]/10 border border-[#00e1ff]/20 flex items-center justify-center font-bold text-[#00e1ff] text-xs">
                      {googleUser?.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-display text-xs font-bold text-white truncate max-w-[150px]">
                      {googleUser?.displayName || 'Usuario Google'}
                    </p>
                    <p className="font-mono text-[9px] text-gray-500 truncate max-w-[150px]">
                      {googleUser?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-wider text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 transition-all duration-150 cursor-pointer"
                >
                  <LogOut size={10} />
                  Salir
                </button>
              </div>

              {/* Step-by-step interactive stages planner */}
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider mb-2 text-gray-400">
                  Selecciona las etapas a sincronizar:
                </p>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {computedStages.map((stage) => {
                    const isChecked = selectedStages.includes(stage.stage);
                    return (
                      <div
                        key={stage.stage}
                        onClick={() => {
                          setSelectedStages(prev =>
                            prev.includes(stage.stage)
                              ? prev.filter(s => s !== stage.stage)
                              : [...prev, stage.stage]
                          );
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                          isChecked
                            ? 'bg-slate-950/40 border-[#00e1ff]/30'
                            : 'bg-white/5 border-white/5 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`h-4 w-4 rounded flex items-center justify-center border transition-all ${
                            isChecked
                              ? 'bg-[#00e1ff]/10 border-[#00e1ff] text-[#00e1ff]'
                              : 'border-white/20'
                          }`}>
                            {isChecked && <Check size={11} strokeWidth={3} />}
                          </div>
                          <div className="min-w-0">
                            <span className="font-display text-xs font-bold text-white block">
                              {stage.stage}
                            </span>
                            <span className="font-mono text-[9px] text-gray-400">
                              🕒 {stage.start} {stage.start !== stage.end && `al ${stage.end}`}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-[9px] bg-white/5 px-2 py-0.5 rounded text-gray-400 border border-white/5">
                          {productionData.timeline.find(t => t.stage === stage.stage)?.duration || '1 día'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sync Actions & Success Statuses */}
              {syncConfirm ? (
                <div className="p-3 rounded-xl bg-[#FFAA00]/5 border border-[#FFAA00]/25 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle size={15} className="text-[#FFAA00] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-display text-xs font-bold text-[#FFAA00]">Confirmar Sincronización</p>
                      <p className="font-sans text-[11px] text-gray-300 leading-relaxed mt-0.5">
                        Se agregarán <strong className="text-white">{selectedStages.length} eventos</strong> con la planificación técnica del lote <strong className="text-white">{fields.batch} ({productionData.recipe})</strong> a tu Google Calendar principal.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSyncToCalendar}
                      disabled={isSyncing}
                      className="flex-1 rounded-lg py-2 bg-[#FFAA00] text-slate-950 font-display text-xs font-bold uppercase tracking-wider hover:bg-[#ffb732] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSyncing ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Agendando...
                        </>
                      ) : (
                        'Sí, Añadir al Calendario'
                      )}
                    </button>
                    <button
                      onClick={() => setSyncConfirm(false)}
                      disabled={isSyncing}
                      className="flex-1 rounded-lg py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-mono text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (selectedStages.length === 0) return;
                    setSyncConfirm(true);
                  }}
                  disabled={selectedStages.length === 0 || isSyncing}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-display text-xs font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer"
                  style={{
                    background: syncDone ? 'rgba(52,211,153,0.08)' : 'rgba(0,225,255,0.08)',
                    border: syncDone ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(0,225,255,0.3)',
                    color: syncDone ? '#34d399' : '#00e1ff'
                  }}
                >
                  {syncDone ? (
                    <>
                      <CheckCircle2 size={13} />
                      ¡Planificación Sincronizada con Éxito!
                    </>
                  ) : (
                    <>
                      <CalendarPlus size={13} />
                      Sincronizar {selectedStages.length} Etapas con Google Calendar
                    </>
                  )}
                </button>
              )}

              {/* Status errors if any */}
              {syncError && (
                <div className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <p className="font-mono text-[9px] text-rose-400">{syncError}</p>
                </div>
              )}

              {/* Real-time upcoming agenda fetch list */}
              <div className="border-t border-white/5 pt-3 mt-1">
                <p className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-2 flex items-center justify-between">
                  <span>Agenda de tu calendario (Próximos eventos):</span>
                  {isLoadingEvents && <Loader2 size={8} className="animate-spin text-[#00e1ff]" />}
                </p>
                {calendarEvents.length === 0 ? (
                  <p className="font-mono text-[9px] text-gray-500 text-center py-2 bg-slate-900/10 rounded-lg">
                    {isLoadingEvents ? 'Cargando eventos de Google...' : 'No tienes eventos agendados para hoy.'}
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {calendarEvents.map((ev, i) => (
                      <div key={ev.id || i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/30 border border-white/5">
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="font-sans text-[10.5px] font-bold text-gray-200 block truncate">
                            {ev.summary}
                          </span>
                          <span className="font-mono text-[8px] text-gray-500">
                            {ev.start?.date || ev.start?.dateTime?.split('T')[0] || 'Todo el día'}
                          </span>
                        </div>
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: '#00e1ff', boxShadow: '0 0 5px rgba(0,225,255,0.4)' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Sec>

        {/* PDF */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}} className="pb-4 pt-2">
          <button onClick={handlePdf} disabled={pdfState!=='idle'}
            className="relative w-full overflow-hidden rounded-2xl py-4 font-display text-sm font-bold uppercase tracking-widest transition-all duration-300"
            style={{ background:pdfState==='done'?'rgba(52,211,153,0.1)':'rgba(0,225,255,0.07)', border:pdfState==='done'?'1px solid rgba(52,211,153,0.3)':'1px solid rgba(0,225,255,0.18)', color:pdfState==='done'?'#34d399':'#00e1ff' }}
          >
            <AnimatePresence mode="wait">
              {pdfState==='idle'      && <motion.span key="i" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex items-center justify-center gap-2"><FileText size={14}/> Generar PDF</motion.span>}
              {pdfState==='preparing' && <motion.span key="p" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin"/> Preparando...</motion.span>}
              {pdfState==='generating'&& <motion.span key="g" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin"/> Generando PDF...</motion.span>}
              {pdfState==='done'      && <motion.span key="d" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0}} className="flex items-center justify-center gap-2"><CheckCircle2 size={14}/> PDF listo</motion.span>}
            </AnimatePresence>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function MiniField({label,value,onChange,unit,placeholder}:{label:string;value:string;onChange:(v:string)=>void;unit?:string;placeholder?:string}) {
  return (
    <div>
      <p className="mb-1 font-mono text-[8.5px] uppercase tracking-wider" style={{color:'rgba(74,96,112,0.6)'}}>{label}</p>
      <div className="relative">
        <input
          value={value}
          placeholder={placeholder}
          onChange={e=>onChange(e.target.value)}
          className="w-full rounded-lg px-2.5 py-2 font-mono text-xs focus:outline-none"
          style={{background:'rgba(13,24,36,0.6)',border:'1px solid rgba(255,255,255,0.07)',color:'#e8f0f8'}}
          onFocus={e=>{(e.target as HTMLInputElement).style.borderColor='rgba(0,225,255,0.3)';}}
          onBlur={e=>{(e.target as HTMLInputElement).style.borderColor='rgba(255,255,255,0.07)';}}
        />
        {unit && <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[9px]" style={{color:'rgba(74,96,112,0.55)'}}>{unit}</span>}
      </div>
    </div>
  );
}

function Sec({title,icon,children,delay,action}:{title:string;icon:React.ReactNode;children:React.ReactNode;delay:number;action?:React.ReactNode}) {
  return (
    <GlassCard className="p-4" corners delay={delay}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><span style={{color:'#00e1ff'}}>{icon}</span><span className="font-display text-sm font-bold text-white">{title}</span></div>
        {action}
      </div>
      {children}
    </GlassCard>
  );
}

function AddBtn({onClick}:{onClick:()=>void}) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider"
      style={{background:'rgba(0,225,255,0.06)',border:'1px solid rgba(0,225,255,0.16)',color:'#00e1ff'}}
    ><Plus size={11}/> Añadir</button>
  );
}

function FermentMetric({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-2.5 text-center" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.06)' }}>
      <div className="mb-0.5 flex items-center justify-center gap-1">
        <span style={{ color, opacity: 0.6 }}>{icon}</span>
        <span className="font-mono text-[8px] uppercase tracking-wider" style={{ color:'rgba(74,96,112,0.6)' }}>{label}</span>
      </div>
      <p className="font-display text-base font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function IRow({c1,c2,c3,badge,accent}:{c1:string;c2:string;c3:string;badge:string;accent:'cyan'|'amber'}) {
  const C = accent==='cyan'
    ? {border:'rgba(0,225,255,0.09)',bg:'rgba(0,225,255,0.04)',bb:'rgba(0,225,255,0.07)',bbc:'rgba(0,225,255,0.16)',bc:'#00e1ff'}
    : {border:'rgba(255,170,0,0.09)',bg:'rgba(255,170,0,0.04)',bb:'rgba(255,170,0,0.07)',bbc:'rgba(255,170,0,0.18)',bc:'#FFAA00'};
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-3" style={{background:C.bg,border:`1px solid ${C.border}`}}>
      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-sm font-medium text-white">{c1}</p>
        <p className="font-mono text-[10px]" style={{color:'rgba(74,96,112,0.65)'}}>{c2} · {c3}</p>
      </div>
      <span className="shrink-0 rounded-lg px-2 py-0.5 font-mono text-[10px]" style={{background:C.bb,border:`1px solid ${C.bbc}`,color:C.bc}}>{badge}</span>
    </div>
  );
}

function EditField({fkey,label,icon,value,isEditing,onEdit,onSave,onCancel}:{
  fkey:string;label:string;icon:React.ReactNode;value:string;
  isEditing:boolean;onEdit:()=>void;onSave:(v:string)=>void;onCancel:()=>void;
}) {
  const [draft,setDraft]=useState(value);
  if (isEditing) return (
    <div className="col-span-2 flex gap-2">
      <input value={draft} onChange={e=>setDraft(e.target.value)}
        className="flex-1 rounded-xl px-3 py-2 font-mono text-sm focus:outline-none"
        style={{background:'rgba(13,24,36,0.8)',border:'1px solid rgba(0,225,255,0.32)',color:'#e8f0f8'}}
        autoFocus onKeyDown={e=>{if(e.key==='Enter')onSave(draft);if(e.key==='Escape')onCancel();}}
      />
      <button onClick={()=>onSave(draft)} className="flex h-10 w-10 items-center justify-center rounded-xl" style={{background:'rgba(0,225,255,0.09)',border:'1px solid rgba(0,225,255,0.18)'}}><Check size={13} style={{color:'#00e1ff'}}/></button>
      <button onClick={onCancel} className="flex h-10 w-10 items-center justify-center rounded-xl" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}><X size={13} style={{color:'rgba(74,96,112,0.65)'}}/></button>
    </div>
  );
  return (
    <button onClick={onEdit}
      className="rounded-xl p-3 text-left transition-all duration-200"
      style={{background:'rgba(255,255,255,0.022)',border:'1px solid rgba(255,255,255,0.06)'}}
      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(0,225,255,0.18)';}}
      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.06)';}}
    >
      <div className="mb-1 flex items-center gap-1.5"><span style={{color:'rgba(0,225,255,0.45)'}}>{icon}</span><span className="font-mono text-[9px] uppercase tracking-wider" style={{color:'rgba(74,96,112,0.6)'}}>{label}</span></div>
      <p className="font-display text-sm font-semibold text-white">{value}</p>
    </button>
  );
}
