import { useEffect, useState } from 'react';
import { googleProductionConfig } from '../lib/googleProduction';

export interface SearchConsoleRow {
  query?: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchConsoleSnapshot {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  rows: SearchConsoleRow[];
  fetchedAt: string;
}

export type SearchConsoleStatus = 'NEEDS_PRODUCTION_CONFIGURATION' | 'LOADING' | 'READY' | 'ERROR';

function validSnapshot(value: unknown): value is SearchConsoleSnapshot {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.clicks === 'number' && typeof v.impressions === 'number' && typeof v.ctr === 'number' && typeof v.position === 'number' && Array.isArray(v.rows);
}

/**
 * Real hook only: it never fabricates Search Console numbers. The configured
 * endpoint must be a trusted server-side proxy that performs Google OAuth.
 */
export function useSearchConsole() {
  const endpoint = googleProductionConfig.searchConsoleEndpoint;
  const [status, setStatus] = useState<SearchConsoleStatus>(endpoint ? 'LOADING' : 'NEEDS_PRODUCTION_CONFIGURATION');
  const [data, setData] = useState<SearchConsoleSnapshot | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!endpoint) {
      setStatus('NEEDS_PRODUCTION_CONFIGURATION');
      setData(null);
      return;
    }
    const controller = new AbortController();
    setStatus('LOADING');
    fetch(endpoint, { signal: controller.signal, headers: { Accept: 'application/json' } })
      .then(async response => {
        if (!response.ok) throw new Error(`Search Console endpoint returned ${response.status}`);
        const json = await response.json();
        if (!validSnapshot(json)) throw new Error('Invalid Search Console response schema');
        setData(json);
        setStatus('READY');
        setError('');
      })
      .catch(err => {
        if (err?.name === 'AbortError') return;
        setData(null);
        setStatus('ERROR');
        setError(err instanceof Error ? err.message : 'Search Console request failed');
      });
    return () => controller.abort();
  }, [endpoint]);

  return { status, data, error };
}
