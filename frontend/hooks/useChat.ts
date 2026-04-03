'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Mensaje {
  id: number;
  chat_id: number;
  remitente_id: string;
  contenido: string;
  leido: boolean;
  created_at: string;
}

interface UseChatOptions {
  tipo: 'privado' | 'producto';
  productoId?: number;
  user: User | null;
}

export function useChat({ tipo, productoId, user }: UseChatOptions) {
  const supabase = createClient();
  const [chatId, setChatId] = useState<number | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const getOrCreateChat = useCallback(async () => {
    if (!user) return null;

    setLoading(true);
    try {
      // Buscar chat existente
      let query = supabase
        .from('chats')
        .select('id')
        .eq('tipo', tipo)
        .eq('usuario_id', user.id);

      if (tipo === 'producto' && productoId) {
        query = query.eq('producto_id', productoId);
      }

      const { data: existente } = await query.maybeSingle();

      if (existente) {
        return existente.id as number;
      }

      // Crear chat nuevo
      const insertData: Record<string, unknown> = {
        tipo,
        usuario_id: user.id,
        nombre: user.email,
      };
      if (tipo === 'producto' && productoId) {
        insertData.producto_id = productoId;
      }

      const { data: nuevo, error } = await supabase
        .from('chats')
        .insert(insertData)
        .select('id')
        .single();

      if (error) throw error;
      return nuevo.id as number;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, tipo, productoId, supabase]);

  const cargarMensajes = useCallback(async (id: number) => {
    const { data } = await supabase
      .from('mensajes_chat')
      .select('*')
      .eq('chat_id', id)
      .order('created_at', { ascending: true });

    setMensajes((data as Mensaje[]) || []);
  }, [supabase]);

  const suscribirRealtime = useCallback((id: number) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`chat-${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensajes_chat', filter: `chat_id=eq.${id}` },
        (payload) => {
          setMensajes(prev => [...prev, payload.new as Mensaje]);
        }
      )
      .subscribe();

    channelRef.current = channel;
  }, [supabase]);

  useEffect(() => {
    if (!user) {
      setMensajes([]);
      setChatId(null);
      return;
    }

    getOrCreateChat().then(id => {
      if (!id) return;
      setChatId(id);
      cargarMensajes(id);
      suscribirRealtime(id);
    });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, getOrCreateChat, cargarMensajes, suscribirRealtime, supabase]);

  const enviarMensaje = useCallback(async (contenido: string, productoId?: number) => {
    if (!user || !chatId || !contenido.trim()) return false;

    setSending(true);
    try {
      const { error } = await supabase.from('mensajes_chat').insert({
        chat_id: chatId,
        remitente_id: user.id,
        contenido: contenido.trim(),
      });

      if (error) throw error;

      // Llamar al agente IA (fire-and-forget — la respuesta llega por Realtime)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/agente`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ chat_id: chatId, mensaje: contenido.trim(), producto_id: productoId ?? null }),
        }).catch(() => {}); // silenciar errores de red
      }

      return true;
    } catch {
      return false;
    } finally {
      setSending(false);
    }
  }, [user, chatId, supabase]);

  return { mensajes, loading, sending, enviarMensaje, chatId };
}
