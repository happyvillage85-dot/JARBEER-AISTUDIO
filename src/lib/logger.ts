import { haptics } from './haptics';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  details?: string;
  type: 'error' | 'info' | 'warn';
}

const MAX_LOGS = 200;
let logs: LogEntry[] = [];
let listeners: (() => void)[] = [];

export const logger = {
  getLogs: () => [...logs],
  addLog: (type: LogEntry['type'], message: string, details?: string) => {
    logs.unshift({
      id: Math.random().toString(36).slice(2, 9),
      timestamp: new Date().toISOString(),
      message,
      details,
      type
    });
    if (logs.length > MAX_LOGS) logs.pop();
    listeners.forEach(l => l());
    
    // Trigger vibration for system alerts
    if (type === 'error') {
      haptics.error();
    } else if (type === 'warn') {
      haptics.warning();
    }
  },
  error: (msg: string, details?: any) => logger.addLog('error', msg, typeof details === 'string' ? details : JSON.stringify(details)),
  info: (msg: string, details?: any) => logger.addLog('info', msg, typeof details === 'string' ? details : JSON.stringify(details)),
  warn: (msg: string, details?: any) => logger.addLog('warn', msg, typeof details === 'string' ? details : JSON.stringify(details)),
  subscribe: (l: () => void) => {
    listeners.push(l);
    return () => {
      listeners = listeners.filter(cb => cb !== l);
    };
  },
  clear: () => {
    logs = [];
    listeners.forEach(l => l());
  }
};
