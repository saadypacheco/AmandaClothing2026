'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

const API = process.env.NEXT_PUBLIC_API_URL;

async function authFetch(url: string, options: RequestInit = {}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';
  return fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
  });
}

interface Chat {
  id: number;
  tipo: string;
  updated_at: string;
  usuario_id: string;
  producto_id: number | null;
  usuarios: { email: string; nombre: string | null } | null;
  productos: { nombre: string } | null;
}

interface Mensaje {
  id: number;
  contenido: string;
  created_at: string;
  remitente_id: string;
  usuarios: { email: string; nombre: string | null } | null;
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function ConsultasPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatActivo, setChatActivo] = useState<number | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loadingMensajes, setLoadingMensajes] = useState(false);
  const [respuesta, setRespuesta] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setAdminId(user.id);
      const res = await authFetch(`${API}/admin/chats`);
      if (res.ok) setChats(await res.json());
      setLoading(false);
    };
    load();
  }, []);

  async function abrirChat(chatId: number) {
    setChatActivo(chatId);
    setLoadingMensajes(true);
    setRespuesta('');
    const res = await authFetch(`${API}/admin/chats/${chatId}/mensajes`);
    if (res.ok) setMensajes(await res.json());
    setLoadingMensajes(false);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    if (!respuesta.trim() || !chatActivo) return;
    setEnviando(true);
    const fd = new FormData();
    fd.append('contenido', respuesta.trim());
    const res = await authFetch(`${API}/admin/chats/${chatActivo}/mensajes`, { method: 'POST', body: fd });
    if (res.ok) {
      const nuevo = await res.json();
      setMensajes(prev => [...prev, { ...nuevo, usuarios: null }]);
      setRespuesta('');
      setChats(prev => prev.map(c => c.id === chatActivo ? { ...c, updated_at: nuevo.created_at } : c));
    }
    setEnviando(false);
  }

  if (loading) return (
    <div className="flex items-center gap-3">
      <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-stone-400">Cargando consultas...</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Consultas</h1>
          <p className="text-sm text-stone-400 mt-1">{chats.length} conversaciones</p>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-14rem)]">
        {/* Lista de chats */}
        <div className="w-64 shrink-0 bg-white rounded-xl border border-stone-200 overflow-y-auto">
          {chats.length === 0 ? (
            <p className="text-sm text-stone-400 p-6">Sin consultas aún.</p>
          ) : (
            chats.map(c => (
              <button
                key={c.id}
                onClick={() => abrirChat(c.id)}
                className={`w-full text-left px-4 py-3 border-b border-stone-100 last:border-0 transition-colors hover:bg-stone-50 ${chatActivo === c.id ? 'bg-stone-100' : ''}`}
              >
                <p className="text-xs font-medium text-stone-800 truncate">
                  {c.usuarios?.nombre || c.usuarios?.email || 'Usuario'}
                </p>
                {c.productos && (
                  <p className="text-[10px] text-stone-400 truncate mt-0.5">📦 {c.productos.nombre}</p>
                )}
                <p className="text-[10px] text-stone-400 mt-0.5">{formatFecha(c.updated_at)}</p>
              </button>
            ))
          )}
        </div>

        {/* Panel de mensajes */}
        <div className="flex-1 bg-white rounded-xl border border-stone-200 flex flex-col overflow-hidden">
          {!chatActivo ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-stone-400">Seleccioná una conversación</p>
            </div>
          ) : (
            <>
              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {loadingMensajes ? (
                  <div className="flex items-center gap-2 justify-center py-8">
                    <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : mensajes.map(m => {
                  const esAdmin = m.remitente_id === adminId;
                  return (
                    <div key={m.id} className={`flex ${esAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${esAdmin ? 'bg-stone-900 text-white rounded-br-sm' : 'bg-stone-100 text-stone-800 rounded-bl-sm'}`}>
                        {!esAdmin && (
                          <p className="text-[10px] font-medium mb-1 text-stone-500">
                            {m.usuarios?.nombre || m.usuarios?.email || 'Cliente'}
                          </p>
                        )}
                        <p className="text-sm">{m.contenido}</p>
                        <p className={`text-[9px] mt-1 ${esAdmin ? 'text-stone-400' : 'text-stone-400'}`}>
                          {formatFecha(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input respuesta */}
              <form onSubmit={handleEnviar} className="border-t border-stone-100 px-4 py-3 flex gap-2">
                <input
                  value={respuesta}
                  onChange={e => setRespuesta(e.target.value)}
                  placeholder="Escribí tu respuesta..."
                  className="flex-1 text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
                <button
                  type="submit"
                  disabled={enviando || !respuesta.trim()}
                  className="bg-stone-900 text-white text-xs tracking-widest uppercase px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-40"
                >
                  Enviar
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
