import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronRight } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { MicButton, type MicState } from '../components/MicButton';
import type { ChatMessage, Screen } from '../data/mockData';
import { voiceCommands } from '../data/mockData';
import { MODE_LABELS, type SystemMode } from '../lib/config';

const SUGGESTIONS = ['Abre la Golden','Buscar Cascade','Temperatura actual','Abrir receta IPA','Mostrar documentos','Estado del F-04'];

interface AssistantProps {
  messages: ChatMessage[]; micState: MicState;
  onMic: () => void; onSend: (t: string) => void;
  typing: boolean; onNavigate: (s: Screen) => void;
  mode: SystemMode;
}

export function Assistant({ messages, micState, onMic, onSend, typing, onNavigate, mode }: AssistantProps) {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const isActive = micState !== 'idle';
  const labels = MODE_LABELS[mode];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, typing]);

  const send = () => { const t=draft.trim(); if(!t)return; setDraft(''); onSend(t); };

  return (
    <div className="flex min-h-full flex-col pb-32">
      <ScreenHeader title="Asistente IA" subtitle={`J.A.R.B.E.E.R. · ${labels.full}`}
        right={<div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: labels.dot, boxShadow:`0 0 6px ${labels.dot}`, animation:'live-pulse 2s ease-in-out infinite' }}/><span className="font-mono text-[10px]" style={{color: labels.color}}>{labels.short === 'ONLINE' ? 'EN LÍNEA' : 'LOCAL'}</span></div>}
      />

      <div className="flex-1 overflow-y-auto px-4">
        {/* Suggestions */}
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.15}} className="mb-5">
          <p className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.3em]" style={{color:'rgba(42,61,82,0.9)'}}>Comandos de ejemplo</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(cmd=>(
              <button key={cmd} onClick={()=>onSend(cmd)} disabled={isActive}
                className="flex items-center gap-1 rounded-xl px-3 py-1.5 font-mono text-[11px] transition-all duration-200"
                style={{background:'rgba(255,170,0,0.05)',border:'1px solid rgba(255,170,0,0.14)',color:'#FFAA00',opacity:isActive?0.4:1}}
              ><ChevronRight size={9}/>{cmd}</button>
            ))}
          </div>
        </motion.div>

        {/* Messages */}
        <div className="space-y-3 pb-4">
          {messages.map((msg,i)=><Bubble key={msg.id} msg={msg} delay={i===0?0.22:0} onNavigate={onNavigate}/>)}
          {typing && <TypingDots/>}
          <div ref={bottomRef}/>
        </div>
      </div>

      {/* Input bar */}
      <div className="fixed bottom-16 left-0 right-0 z-10 mx-auto max-w-2xl px-4 pb-2 pt-3"
        style={{background:'rgba(2,4,8,0.94)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',borderTop:'1px solid rgba(255,255,255,0.05)'}}
      >
        <div className="flex items-center gap-3">
          <MicButton state={micState} onPress={onMic} size="normal"/>
          <div className="relative flex-1">
            <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send();}}
              disabled={isActive} placeholder="Escribe un comando..."
              className="w-full rounded-2xl py-3.5 pl-4 pr-11 font-mono text-sm focus:outline-none disabled:opacity-40"
              style={{background:'rgba(13,24,36,0.8)',border:'1px solid rgba(255,255,255,0.07)',color:'#e8f0f8',transition:'border-color 0.2s'}}
              onFocus={e=>{(e.target as HTMLInputElement).style.borderColor='rgba(255,170,0,0.28)';}}
              onBlur={e=>{(e.target as HTMLInputElement).style.borderColor='rgba(255,255,255,0.07)';}}
            />
            <button onClick={send} disabled={!draft.trim()||isActive}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl transition-all duration-200 disabled:opacity-30"
              style={{background:draft.trim()?'rgba(255,170,0,0.1)':'transparent',border:draft.trim()?'1px solid rgba(255,170,0,0.18)':'1px solid transparent'}}
            ><Send size={13} style={{color:'#FFAA00'}}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({msg,delay,onNavigate}:{msg:ChatMessage;delay:number;onNavigate:(s:Screen)=>void}) {
  const user=msg.role==='user';
  return (
    <motion.div initial={{opacity:0,y:10,scale:0.97}} animate={{opacity:1,y:0,scale:1}} transition={{duration:0.32,delay,ease:[0.22,1,0.36,1]}}
      className={`flex ${user?'justify-end':'justify-start'}`}
    >
      {!user && <div className="mr-2.5 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-[9px] font-bold"
        style={{background:'rgba(255,170,0,0.1)',border:'1px solid rgba(255,170,0,0.18)',color:'#FFAA00',boxShadow:'0 0 10px rgba(255,170,0,0.18)'}}
      >AI</div>}
      <div className="max-w-[76%]">
        <div className="rounded-2xl px-4 py-3"
          style={user
            ? {background:'rgba(255,170,0,0.09)',border:'1px solid rgba(255,170,0,0.18)',borderBottomRightRadius:6}
            : {background:'rgba(13,24,36,0.75)',border:'1px solid rgba(255,255,255,0.07)',borderBottomLeftRadius:6}
          }
        >
          <p className="font-sans text-sm leading-relaxed whitespace-pre-wrap" style={{color:user?'#e8f0f8':'rgba(180,200,216,0.9)'}}>{msg.content}</p>
          {msg.navigateTo && !user && (
            <motion.button initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{delay:0.28}}
              onClick={()=>onNavigate(msg.navigateTo!)}
              className="mt-3 flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all duration-200"
              style={{background:'rgba(255,170,0,0.06)',border:'1px solid rgba(255,170,0,0.18)',color:'#FFAA00'}}
            ><ChevronRight size={10}/> Navegar</motion.button>
          )}
        </div>
        <p className="mt-1.5 px-1 font-mono text-[9px]" style={{color:'rgba(42,61,82,0.9)'}}>{msg.timestamp}</p>
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-[9px] font-bold"
        style={{background:'rgba(255,170,0,0.1)',border:'1px solid rgba(255,170,0,0.18)',color:'#FFAA00'}}
      >AI</div>
      <div className="flex items-center gap-1.5 rounded-2xl px-4 py-3" style={{background:'rgba(13,24,36,0.75)',border:'1px solid rgba(255,255,255,0.07)'}}>
        {[0,0.18,0.36].map((d,i)=>(
          <motion.div key={i} className="h-1.5 w-1.5 rounded-full" style={{background:'#FFAA00'}}
            animate={{opacity:[0.2,1,0.2],y:[0,-4,0]}} transition={{duration:0.9,repeat:Infinity,delay:d,ease:'easeInOut'}}
          />
        ))}
      </div>
    </motion.div>
  );
}

export { voiceCommands };
