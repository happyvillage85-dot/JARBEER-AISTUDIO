import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, FileText, TestTube, Leaf, FlaskConical, History, Receipt, Library,
  Pin, Trash2, Plus, Loader2, Lock, AlertTriangle, LogIn, LogOut, CheckCircle2, 
  ChevronRight, BookOpen, PlusCircle
} from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { documents, type DocCategory, type DocItem } from '../data/mockData';
import { 
  initAuth, googleSignIn, logout, createKeepNote, listKeepNotes, deleteKeepNote 
} from '../lib/googleAuth';
import type { User as FirebaseUser } from 'firebase/auth';

const CATS: { id: DocCategory|'Todos'; label: string; icon: React.ReactNode }[] = [
  {id:'Todos',    label:'Todos',    icon:<Library size={12}/>},
  {id:'Receta',   label:'Receta',   icon:<FileText size={12}/>},
  {id:'COA',      label:'COA',      icon:<TestTube size={12}/>},
  {id:'Insumo',   label:'Insumo',   icon:<Leaf size={12}/>},
  {id:'Levadura', label:'Levadura', icon:<FlaskConical size={12}/>},
  {id:'Historial',label:'Historial',icon:<History size={12}/>},
  {id:'Factura',  label:'Factura',  icon:<Receipt size={12}/>},
];

const CC: Record<DocCategory, {text:string;border:string;bg:string}> = {
  Receta:    {text:'#00e1ff',border:'rgba(0,225,255,0.22)',   bg:'rgba(0,225,255,0.07)'},
  COA:       {text:'#FFAA00',border:'rgba(255,170,0,0.22)',   bg:'rgba(255,170,0,0.07)'},
  Insumo:    {text:'#34d399',border:'rgba(52,211,153,0.22)',  bg:'rgba(52,211,153,0.07)'},
  Levadura:  {text:'#a78bfa',border:'rgba(167,139,250,0.22)', bg:'rgba(167,139,250,0.07)'},
  Historial: {text:'#60a5fa',border:'rgba(96,165,250,0.22)',  bg:'rgba(96,165,250,0.07)'},
  Factura:   {text:'#fb923c',border:'rgba(251,146,60,0.22)',  bg:'rgba(251,146,60,0.07)'},
};

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

export function Documents() {
  const [activeTab, setActiveTab] = useState<'docs'|'keep'>('docs');
  const [query, setQuery]   = useState('');
  const [cat, setCat]       = useState<DocCategory|'Todos'>('Todos');
  const [openId, setOpenId] = useState<string|null>(null);

  // --- Keep states ---
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [keepNotes, setKeepNotes] = useState<any[]>([]);
  const [isLoadingKeep, setIsLoadingKeep] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [keepError, setKeepError] = useState<string | null>(null);

  // Note creation inputs
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  // Local persisted fallback notes
  const [localNotes, setLocalNotes] = useState<LocalNote[]>(() => {
    const saved = localStorage.getItem('jarbeer-local-notes');
    return saved ? JSON.parse(saved) : DEFAULT_LOCAL_NOTES;
  });

  // Save local notes when changed
  useEffect(() => {
    localStorage.setItem('jarbeer-local-notes', JSON.stringify(localNotes));
  }, [localNotes]);

  // Auth setup
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setGoogleUser(user);
        setNeedsAuth(false);
        fetchKeepNotes();
      },
      () => {
        setGoogleUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setKeepError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setNeedsAuth(false);
        fetchKeepNotes();
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      setKeepError('Error de autenticación con Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setGoogleUser(null);
      setNeedsAuth(true);
      setKeepNotes([]);
      setIsFallbackMode(false);
    } catch (err: any) {
      console.error('Logout failed:', err);
    }
  };

  const fetchKeepNotes = async () => {
    setIsLoadingKeep(true);
    setKeepError(null);
    try {
      const res = await listKeepNotes();
      setKeepNotes(res.notes || []);
      setIsFallbackMode(false);
    } catch (err: any) {
      console.warn('Keep API call warning/failure:', err);
      // If 403 (unauthorized/consumer restriction), trigger fallback
      if (err.status === 403 || err.status === 400 || String(err.message).includes('403') || String(err.message).includes('restricted')) {
        setIsFallbackMode(true);
      } else {
        setKeepError(err.message || 'Error al conectar con Google Keep');
      }
    } finally {
      setIsLoadingKeep(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;

    setIsCreatingNote(true);
    setKeepError(null);

    const titleText = noteTitle.trim() || 'Nota sin título';
    const bodyText = noteContent.trim();

    try {
      if (!isFallbackMode) {
        // Attempt creating in Google Keep
        await createKeepNote({ title: titleText, text: bodyText });
        // Refresh Keep list
        await fetchKeepNotes();
      } else {
        // Create in Local fallbacks
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
      console.error('Failed to create note:', err);
      if (err.status === 403 || String(err.message).includes('403')) {
        setIsFallbackMode(true);
        // Save in Local instead immediately so they don't lose work!
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

  const handleDeleteNote = async (id: string, isLocal: boolean, resourceName?: string) => {
    setKeepError(null);
    try {
      if (isLocal) {
        setLocalNotes(prev => prev.filter(n => n.id !== id));
      } else if (resourceName) {
        await deleteKeepNote(resourceName);
        await fetchKeepNotes();
      }
    } catch (err: any) {
      console.error('Failed to delete note:', err);
      setKeepError('Error al eliminar la nota de Google Keep');
    }
  };

  // Filter static documents
  const filteredDocs = useMemo(() => {
    const q = query.toLowerCase();
    return documents.filter(d =>
      (cat==='Todos'||d.category===cat) &&
      (!q || d.title.toLowerCase().includes(q) || d.reference.toLowerCase().includes(q) || d.excerpt.toLowerCase().includes(q))
    );
  }, [query, cat]);

  // Filter notes (from local and Keep combined, depending on active state)
  const filteredNotes = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) {
      return isFallbackMode ? localNotes : keepNotes;
    }
    if (isFallbackMode) {
      return localNotes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    } else {
      return keepNotes.filter(n => 
        (n.title && n.title.toLowerCase().includes(q)) || 
        (n.body?.text?.text && n.body.text.text.toLowerCase().includes(q))
      );
    }
  }, [query, isFallbackMode, localNotes, keepNotes]);

  const openDoc = openId ? documents.find(d=>d.id===openId) : null;

  // Selected note for deep view modal
  const [selectedNote, setSelectedNote] = useState<any | null>(null);

  return (
    <div className="flex min-h-full flex-col pb-32">
      <ScreenHeader 
        title={activeTab === 'docs' ? 'Biblioteca' : 'Notas Keep'} 
        subtitle={activeTab === 'docs' ? `${documents.length} documentos indexados` : 'Registro técnico rápido y apuntes de lote'}
        right={
          <div className="flex rounded-xl bg-slate-900/80 p-1 border border-white/5">
            <button
              onClick={() => { setActiveTab('docs'); setQuery(''); }}
              className={`rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'docs' ? 'bg-[#00e1ff]/10 border border-[#00e1ff]/30 text-[#00e1ff]' : 'text-gray-400 hover:text-white'
              }`}
            >
              Biblioteca
            </button>
            <button
              onClick={() => { setActiveTab('keep'); setQuery(''); }}
              className={`rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'keep' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              Google Keep
            </button>
          </div>
        }
      />

      <div className="flex flex-col gap-4 px-4">
        
        {/* TAB 1: BIBLIOTECA TÉCNICA */}
        {activeTab === 'docs' && (
          <>
            {/* Search */}
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.4}} className="relative">
              <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{color:'rgba(74,96,112,0.6)'}}/>
              <input value={query} onChange={e=>setQuery(e.target.value)}
                placeholder="Buscar documentos..."
                className="w-full rounded-2xl py-3.5 pl-10 pr-9 font-mono text-sm placeholder:text-opacity-40 focus:outline-none"
                style={{background:'rgba(13,24,36,0.7)',border:'1px solid rgba(255,255,255,0.07)',color:'#e8f0f8','--tw-placeholder-opacity':'1',transition:'border-color 0.2s'} as React.CSSProperties}
                onFocus={e=>{(e.target as HTMLInputElement).style.borderColor='rgba(0,225,255,0.28)';}}
                onBlur={e=>{(e.target as HTMLInputElement).style.borderColor='rgba(255,255,255,0.07)';}}
              />
              {query && <button onClick={()=>setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2"><X size={13} style={{color:'rgba(74,96,112,0.6)'}}/></button>}
            </motion.div>

            {/* Category pills */}
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.1}} className="flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
              {CATS.map(({id,label,icon})=>{
                const on=cat===id;
                return (
                  <motion.button key={id} onClick={()=>setCat(id)} whileTap={{scale:0.94}}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-200"
                    style={{background:on?'rgba(0,225,255,0.09)':'rgba(13,24,36,0.7)',border:on?'1px solid rgba(0,225,255,0.26)':'1px solid rgba(255,255,255,0.06)',color:on?'#00e1ff':'rgba(74,96,112,0.7)'}}
                  >
                    <span style={{color:on?'#00e1ff':'rgba(74,96,112,0.55)'}}>{icon}</span>{label}
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Cards List */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredDocs.length===0
                  ? <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="py-12 text-center">
                      <Library size={32} className="mx-auto mb-3 opacity-20" style={{color:'#00e1ff'}}/>
                      <p className="font-mono text-sm" style={{color:'rgba(74,96,112,0.6)'}}>Sin resultados</p>
                    </motion.div>
                  : filteredDocs.map((doc,idx)=><DocCard key={doc.id} doc={doc} delay={idx*0.04} onOpen={()=>setOpenId(doc.id)}/>)
                }
              </AnimatePresence>
            </div>
          </>
        )}

        {/* TAB 2: GOOGLE KEEP NOTES */}
        {activeTab === 'keep' && (
          <div className="space-y-4">
            
            {needsAuth ? (
              <motion.div 
                initial={{opacity:0, y:15}} 
                animate={{opacity:1, y:0}}
                className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 text-center shadow-xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Pin size={24} className="rotate-12" />
                </div>
                <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-2">Bloc de Notas Integrado de J.A.R.B.E.E.R.</h3>
                <p className="font-sans text-xs text-gray-400 max-w-sm mx-auto mb-5 leading-relaxed">
                  Crea apuntes, registros técnicos, calibraciones o recordatorios rápidos de tus lotes activos. Sincroniza en tiempo real con Google Keep.
                </p>

                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="flex items-center justify-center gap-3 w-full max-w-xs mx-auto rounded-xl py-3 border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-display text-xs font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Conectando...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={14} />
                      <span>Sincronizar con Google</span>
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                
                {/* User Header Info Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl p-3 bg-slate-900/50 border border-white/5">
                  <div className="flex items-center gap-2">
                    {googleUser?.photoURL ? (
                      <img src={googleUser.photoURL} alt="Avatar" className="h-6 w-6 rounded-full border border-white/20" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400 text-xs">
                        {googleUser?.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-display text-xs font-bold text-white truncate max-w-[180px]">
                        {googleUser?.displayName || 'Usuario Google'}
                      </p>
                      <p className="font-mono text-[9px] text-gray-500 truncate max-w-[180px]">
                        {googleUser?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchKeepNotes}
                      disabled={isLoadingKeep}
                      className="px-2.5 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-wider text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/20 transition-all duration-150 cursor-pointer flex items-center gap-1 disabled:opacity-50"
                    >
                      {isLoadingKeep ? <Loader2 size={10} className="animate-spin" /> : 'Refrescar'}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-wider text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 transition-all duration-150 cursor-pointer"
                    >
                      <LogOut size={10} />
                      Salir
                    </button>
                  </div>
                </div>

                {/* Banner explaining Google API fallback restrictions */}
                {isFallbackMode && (
                  <motion.div 
                    initial={{opacity:0, y:-5}}
                    animate={{opacity:1, y:0}}
                    className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-display text-xs font-bold">Modo de Almacenamiento Local Activado</h4>
                        <p className="font-sans text-[11px] text-gray-300 leading-relaxed mt-0.5">
                          La API directa de Google Keep está restringida a cuentas empresariales (Google Workspace). Al usar tu cuenta personal <strong className="text-white">{googleUser?.email}</strong>, hemos activado el guardado seguro local de J.A.R.B.E.E.R. para que edites, busques y borres tus notas libremente sin limitaciones.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Create Note Form */}
                <form onSubmit={handleAddNote} className="rounded-xl border border-white/5 bg-slate-900/40 p-4 space-y-3 shadow-lg">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <PlusCircle size={14} className="text-amber-400" />
                    <span className="font-display text-xs font-bold text-gray-200 uppercase tracking-wider">Añadir Nuevo Apunte Técnico</span>
                  </div>
                  
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Título de la nota (ej. Control Densidad Cuba F-01)"
                      value={noteTitle}
                      onChange={e => setNoteTitle(e.target.value)}
                      className="w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-amber-500 transition-colors placeholder:text-gray-600"
                    />
                    <textarea
                      placeholder="Contenido de la nota (notas de cata, lúpulos, pH, ajustes de maduración, etc.)..."
                      value={noteContent}
                      onChange={e => setNoteContent(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-amber-500 transition-colors placeholder:text-gray-600 resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isCreatingNote || (!noteTitle.trim() && !noteContent.trim())}
                      className="rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 font-display text-xs font-bold text-slate-950 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isCreatingNote ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Plus size={12} strokeWidth={3} />
                          Guardar Nota
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Notes list and search */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-gray-400">
                      Tus Notas Guardadas ({filteredNotes.length}):
                    </p>
                    
                    {/* Tiny inline notes search */}
                    <div className="relative w-full sm:w-48">
                      <Search size={11} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Filtrar notas..."
                        className="w-full rounded-lg bg-slate-950/40 border border-white/5 py-1 pl-7 pr-6 font-mono text-[10px] text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/30"
                      />
                      {query && (
                        <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  </div>

                  {isLoadingKeep ? (
                    <div className="py-8 text-center space-y-2">
                      <Loader2 size={24} className="animate-spin mx-auto text-amber-500" />
                      <p className="font-mono text-[10px] text-gray-500">Cargando registros de Keep...</p>
                    </div>
                  ) : filteredNotes.length === 0 ? (
                    <div className="py-8 text-center rounded-xl border border-white/5 bg-slate-900/10">
                      <Pin size={20} className="mx-auto mb-2 opacity-10 text-amber-500" />
                      <p className="font-mono text-[10px] text-gray-500">No se encontraron notas en esta sección.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      {filteredNotes.map((note) => {
                        const isLocal = isFallbackMode || !note.name;
                        const title = isLocal ? note.title : (note.title || 'Nota sin título');
                        const text = isLocal ? note.content : (note.body?.text?.text || '');
                        const dateString = isLocal ? note.date : 'Sincronizado Keep';
                        
                        return (
                          <motion.div
                            layout
                            key={isLocal ? note.id : note.name}
                            className="group rounded-xl border border-white/5 bg-slate-900/40 p-3.5 flex flex-col justify-between shadow relative hover:border-amber-500/20 transition-all duration-200"
                          >
                            <div className="cursor-pointer min-w-0" onClick={() => setSelectedNote({ title, content: text, date: dateString })}>
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-display text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                                  {title}
                                </h4>
                                <span className="rounded bg-amber-500/5 border border-amber-500/10 px-1 py-0.5 font-mono text-[8px] text-amber-400 uppercase shrink-0">
                                  {isLocal ? 'LOCAL' : 'KEEP'}
                                </span>
                              </div>
                              <p className="mt-1.5 font-sans text-[11px] text-gray-400 line-clamp-3 leading-relaxed">
                                {text}
                              </p>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                              <span className="font-mono text-[8.5px] text-gray-600">{dateString}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteNote(isLocal ? note.id : '', isLocal, note.name)}
                                className="text-gray-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/5 transition-all cursor-pointer"
                                title="Eliminar nota"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Error status output */}
                {keepError && (
                  <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <p className="font-mono text-[10px] text-rose-400">{keepError}</p>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </div>

      <AnimatePresence>
        {openDoc && <DocDetail doc={openDoc} onClose={()=>setOpenId(null)}/>}
        {selectedNote && (
          <NoteDetail note={selectedNote} onClose={() => setSelectedNote(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function DocCard({doc,delay,onOpen}:{doc:DocItem;delay:number;onOpen:()=>void}) {
  const c=CC[doc.category];
  return (
    <motion.button layout initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.97}} transition={{duration:0.32,delay}}
      onClick={onOpen} className="group w-full rounded-2xl p-4 text-left transition-all duration-200"
      style={{background:'rgba(13,24,36,0.6)',border:'1px solid rgba(255,255,255,0.06)'}}
      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(0,225,255,0.16)';}}
      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.06)';}}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{background:c.bg,border:`1px solid ${c.border}`,color:c.text}}><FileText size={17}/></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display text-sm font-semibold text-white truncate">{doc.title}</p>
            <span className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide" style={{background:c.bg,border:`1px solid ${c.border}`,color:c.text}}>{doc.category}</span>
          </div>
          <p className="mt-0.5 font-mono text-[10px]" style={{color:'rgba(74,96,112,0.6)'}}>{doc.reference}</p>
          <p className="mt-1.5 line-clamp-2 font-sans text-xs leading-relaxed" style={{color:'rgba(100,128,150,0.8)'}}>{doc.excerpt}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t pt-2.5" style={{borderColor:'rgba(255,255,255,0.05)'}}>
        <span className="font-mono text-[9px]" style={{color:'rgba(74,96,112,0.55)'}}>{doc.date}</span>
        <div className="flex items-center gap-3">
          {doc.size&&<span className="font-mono text-[9px]" style={{color:'rgba(74,96,112,0.55)'}}>{doc.size}</span>}
          <span className="font-mono text-[9px]" style={{color:'rgba(74,96,112,0.55)'}}>{doc.pages} pág.</span>
          <span className="font-mono text-[10px] transition-colors group-hover:text-cyan-400" style={{color:'rgba(0,225,255,0.38)'}}>Ver →</span>
        </div>
      </div>
    </motion.button>
  );
}

function DocDetail({doc,onClose}:{doc:DocItem;onClose:()=>void}) {
  const c=CC[doc.category];
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-40 flex items-end justify-center p-4"
      style={{background:'rgba(2,4,8,0.85)',backdropFilter:'blur(10px)'}}
      onClick={onClose}
    >
      <motion.div initial={{y:55,opacity:0,scale:0.97}} animate={{y:0,opacity:1,scale:1}} exit={{y:40,opacity:0}}
        transition={{duration:0.35,ease:[0.22,1,0.36,1]}}
        className="hud w-full max-w-lg p-6" onClick={e=>e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{background:c.bg,border:`1px solid ${c.border}`,color:c.text}}><FileText size={21}/></div>
            <div>
              <h3 className="font-display text-base font-bold text-white">{doc.title}</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase" style={{background:c.bg,border:`1px solid ${c.border}`,color:c.text}}>{doc.category}</span>
                <span className="font-mono text-[10px]" style={{color:'rgba(74,96,112,0.6)'}}>{doc.reference}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}><X size={15} style={{color:'rgba(74,96,112,0.7)'}}/></button>
        </div>
        <div className="mb-5 rounded-xl p-4" style={{background:'rgba(255,255,255,0.022)',border:'1px solid rgba(255,255,255,0.05)'}}>
          <p className="font-sans text-sm leading-relaxed" style={{color:'rgba(180,200,216,0.85)'}}>{doc.excerpt}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[{l:'Fecha',v:doc.date},{l:'Páginas',v:`${doc.pages} pág.`},{l:'Tamaño',v:doc.size??'—'}].map(m=>(
            <div key={m.l} className="rounded-xl p-3 text-center" style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.05)'}}>
              <p className="font-mono text-[9px] uppercase tracking-wider" style={{color:'rgba(74,96,112,0.6)'}}>{m.l}</p>
              <p className="mt-1 font-mono text-xs text-white">{m.v}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function NoteDetail({note, onClose}:{note:{title:string; content:string; date:string}; onClose:()=>void}) {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-40 flex items-end justify-center p-4"
      style={{background:'rgba(2,4,8,0.85)',backdropFilter:'blur(10px)'}}
      onClick={onClose}
    >
      <motion.div initial={{y:55,opacity:0,scale:0.97}} animate={{y:0,opacity:1,scale:1}} exit={{y:40,opacity:0}}
        transition={{duration:0.35,ease:[0.22,1,0.36,1]}}
        className="hud w-full max-w-lg p-6 border-amber-500/20" onClick={e=>e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0"><Pin size={21} className="rotate-12"/></div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base font-bold text-white truncate pr-2">{note.title}</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded bg-amber-500/5 border border-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] text-amber-400 uppercase">Apunte Técnico</span>
                <span className="font-mono text-[10px] text-gray-500">{note.date}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"><X size={15}/></button>
        </div>
        
        <div className="mb-5 rounded-xl p-4 bg-slate-950/60 border border-white/5 max-h-[300px] overflow-y-auto">
          <p className="font-sans text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">{note.content}</p>
        </div>

        <div className="flex justify-between items-center text-gray-500 font-mono text-[9px]">
          <span>J.A.R.B.E.E.R. OS Control Terminal</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
              // Show absolute fallback toast by copying
              alert('Copiado al portapapeles');
            }}
            className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
          >
            Copiar al Portapapeles
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
