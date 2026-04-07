'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Session ID persistido en sessionStorage
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('boutique_session');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('boutique_session', id);
  }
  return id;
}

type TipoEvento = 'vista' | 'wishlist' | 'carrito' | 'compra';

export function useTracking() {
  const { user } = useAuth();

  const track = useCallback((productoId: number, tipo: TipoEvento, duracion?: number) => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    // Fire-and-forget: no await, timeout de 3s para no bloquear si el backend está caído
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        producto_id: productoId,
        tipo_evento: tipo,
        usuario_id: user?.id ?? null,
        duracion_segundos: duracion ?? null,
      }),
      signal: AbortSignal.timeout(3000),
    }).catch(() => {/* silencioso */});
  }, [user]);

  return { track, sessionId: typeof window !== 'undefined' ? getSessionId() : '' };
}

// Hook para trackear "vista" con duración al desmontar
export function useTrackVista(productoId: number | null) {
  const { track } = useTracking();
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!productoId) return;
    startRef.current = Date.now();

    return () => {
      const duracion = Math.round((Date.now() - startRef.current) / 1000);
      track(productoId, 'vista', duracion);
    };
  }, [productoId, track]);
}
