import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Trash2, AlertCircle, Info, AlertTriangle, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { ScreenHeader } from '../components/ScreenHeader';
import { GlassCard } from '../components/GlassCard';
import { logger, LogEntry } from '../lib/logger';

export function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    setLogs(logger.getLogs());
    return logger.subscribe(() => {
      setLogs(logger.getLogs());
    });
  }, []);

  const handleClear = () => {
    logger.clear();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('System Logs Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated at: ${new Date().toLocaleString()}`, 14, 28);
    
    let y = 40;
    
    logs.forEach(log => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      const time = new Date(log.timestamp).toLocaleTimeString();
      doc.setFont('helvetica', 'bold');
      
      if (log.type === 'error') doc.setTextColor(220, 38, 38);
      else if (log.type === 'warn') doc.setTextColor(217, 119, 6);
      else doc.setTextColor(37, 99, 235);
      
      doc.text(`[${log.type.toUpperCase()}] ${time}`, 14, y);
      
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      
      const msgLines = doc.splitTextToSize(log.message, 180);
      doc.text(msgLines, 14, y);
      y += msgLines.length * 5 + 2;
      
      if (log.details) {
        const detailLines = doc.splitTextToSize(log.details, 170);
        doc.setFont('courier', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(detailLines, 18, y);
        y += detailLines.length * 5 + 2;
      }
      
      y += 4;
    });
    
    doc.save('system-logs.pdf');
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return '#ef4444';
      case 'warn': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#9ca3af';
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return <AlertCircle size={14} color="#ef4444" />;
      case 'warn': return <AlertTriangle size={14} color="#f59e0b" />;
      case 'info': return <Info size={14} color="#3b82f6" />;
      default: return <Terminal size={14} color="#9ca3af" />;
    }
  };

  return (
    <div className="flex min-h-full flex-col pb-32">
      <ScreenHeader title="System Logs" subtitle="Diagnostics & Error Tracking" />
      
      <div className="px-4 mb-4 flex justify-end gap-2">
        <button
          onClick={handleExportPDF}
          disabled={logs.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors text-xs font-mono uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={14} /> Exportar PDF
        </button>
        <button
          onClick={handleClear}
          disabled={logs.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-xs font-mono uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 size={14} /> Borrar
        </button>
      </div>

      <div className="space-y-3 px-4">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Terminal size={32} className="text-gray-600 mb-3" />
            <p className="text-gray-500 font-mono text-sm">No system logs available.</p>
          </div>
        ) : (
          logs.map((log, i) => (
            <motion.div key={log.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard className="p-4" corners>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getLogIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold" style={{ color: getLogColor(log.type) }}>
                        [{log.type.toUpperCase()}]
                      </span>
                      <span className="font-mono text-[10px] text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="font-sans text-sm text-gray-200 mb-2 break-words">
                      {log.message}
                    </p>
                    {log.details && (
                      <pre className="font-mono text-[10px] text-gray-400 bg-black/40 p-2 rounded border border-white/5 overflow-x-auto whitespace-pre-wrap break-words">
                        {log.details}
                      </pre>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
