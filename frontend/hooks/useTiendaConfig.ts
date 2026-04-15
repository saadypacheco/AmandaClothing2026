'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPriceWith } from '@/lib/format';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const CACHE_KEY = 'tienda_config';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

interface CacheEntry {
  data: Record<string, string>;
  timestamp: number;
}

function getFromCache(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setToCache(data: Record<string, string>) {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {}
}

let globalConfig: Record<string, string> | null = null;
let globalPromise: Promise<Record<string, string>> | null = null;

async function fetchConfig(): Promise<Record<string, string>> {
  const cached = getFromCache();
  if (cached) {
    globalConfig = cached;
    return cached;
  }

  if (globalPromise) return globalPromise;

  globalPromise = fetch(`${API}/config`)
    .then(r => r.ok ? r.json() : {})
    .then(data => {
      globalConfig = data;
      setToCache(data);
      globalPromise = null;
      return data;
    })
    .catch(() => {
      globalPromise = null;
      return {};
    });

  return globalPromise;
}

export function useTiendaConfig() {
  const [config, setConfig] = useState<Record<string, string>>(globalConfig || {});
  const [loading, setLoading] = useState(!globalConfig);

  useEffect(() => {
    if (globalConfig && Object.keys(globalConfig).length > 0) {
      setConfig(globalConfig);
      setLoading(false);
      return;
    }
    fetchConfig().then(data => {
      setConfig(data);
      setLoading(false);
    });
  }, []);

  const get = useCallback((clave: string, fallback = ''): string => {
    return config[clave] || fallback;
  }, [config]);

  const getJSON = useCallback((clave: string, fallback: any = null): any => {
    try {
      return JSON.parse(config[clave] || 'null') ?? fallback;
    } catch {
      return fallback;
    }
  }, [config]);

  const refresh = useCallback(async () => {
    localStorage.removeItem(CACHE_KEY);
    globalConfig = null;
    const data = await fetchConfig();
    setConfig(data);
  }, []);

  const formatPrice = useCallback(
    (precio: number | string) => formatPriceWith(config, precio),
    [config]
  );

  return { config, loading, get, getJSON, refresh, formatPrice };
}

export function invalidateConfigCache() {
  localStorage.removeItem(CACHE_KEY);
  globalConfig = null;
}
