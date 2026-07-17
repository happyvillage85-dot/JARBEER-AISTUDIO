import { Package, BarChart3, Clock, Thermometer, Droplets, Sun } from 'lucide-react';

export function StatusBar() {
  return (
    <div className="relative z-30 flex items-center justify-between px-6 py-2"
      style={{
        background: 'rgba(2,4,8,0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Factory name */}
      <div className="flex items-center gap-2">
        <span className="live-dot" />
        <span className="font-mono text-[10px]" style={{ color: 'rgba(74,96,112,0.6)' }}>FÁBRICA:</span>
        <span className="font-mono text-[10px] font-bold" style={{ color: 'rgba(200,215,225,0.9)' }}>CERVECERÍA ARTESANAL PREMIUM</span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-5">
        <StatusItem icon={<Package size={10}/>} label="LOTES ACTIVOS:" value="6" />
        <div className="flex items-center gap-2">
          <BarChart3 size={10} style={{ color: 'rgba(74,96,112,0.55)' }} />
          <span className="font-mono text-[9px]" style={{ color: 'rgba(74,96,112,0.6)' }}>CAPACIDAD UTILIZADA:</span>
          <span className="font-mono text-[10px] font-bold" style={{ color: '#34d399' }}>78%</span>
          <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full" style={{ width: '78%', background: 'linear-gradient(90deg,#34d399,#00e1ff)' }} />
          </div>
        </div>
        <StatusItem icon={<Clock size={10}/>} label="PRÓXIMA LIMPIEZA CIP:" value="12:45" />
        <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <StatusItem icon={<Sun size={10}/>} label="EXT:" value="31°C" />
        <StatusItem icon={<Droplets size={10}/>} label="" value="55% HR" />
      </div>
    </div>
  );
}

function StatusItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color: 'rgba(74,96,112,0.55)' }}>{icon}</span>
      {label && <span className="font-mono text-[9px]" style={{ color: 'rgba(74,96,112,0.6)' }}>{label}</span>}
      <span className="font-mono text-[10px] font-bold" style={{ color: 'rgba(200,215,225,0.9)' }}>{value}</span>
    </div>
  );
}
