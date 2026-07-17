import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import { getMode } from './config';
import { systemStatus as mockStatus } from '../data/mockData';

type SystemStatus = typeof mockStatus;

const POLL_INTERVAL_MS = 3000;

/**
 * ONLINE  → datos simulados (sin backend, Gemini está en cloud)
 * BÚNKER  → polling real cada 3s al backend local; fallback a mocks si no responde
 */
export function useSystemStatus(mode: 'bunker' | 'online') {
  const [status, setStatus] = useState<SystemStatus>(mockStatus);
  const [connected, setConnected] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      if (getMode() !== 'bunker') {
        if (!cancelled) { setStatus(mockStatus); setConnected(true); }
        return;
      }
      try {
        const data = await api.getStatus();
        if (cancelled) return;
        setStatus(data);
        setConnected(true);
      } catch {
        if (cancelled) return;
        setStatus(mockStatus);
        setConnected(false);
      }
    };

    fetchStatus();

    if (mode === 'bunker') {
      intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);
    }

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mode]);

  return { status, connected };
}
