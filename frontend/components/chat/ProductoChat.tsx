'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useChat, Mensaje } from '@/hooks/useChat';

function MensajeRow({ msg, esPropio }: { msg: Mensaje; esPropio: boolean }) {
  const hora = new Date(msg.created_at).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex flex-col ${esPropio ? 'items-end' : 'items-start'} gap-1 mb-4`}>
      <p className={`text-[9px] tracking-widest uppercase ${esPropio ? 'text-amanda-gray' : 'text-amanda-nude'}`}>
        {esPropio ? 'Vos' : 'Amanda'} · {hora}
      </p>
      <div
        className={`max-w-sm px-4 py-3 text-xs leading-relaxed ${
          esPropio
            ? 'bg-amanda-lightgray text-amanda-black'
            : 'bg-amanda-black text-amanda-white'
        }`}
      >
        {msg.contenido}
      </div>
    </div>
  );
}

interface ProductoChatProps {
  productoId: number;
  productoNombre: string;
}

export function ProductoChat({ productoId, productoNombre }: ProductoChatProps) {
  const { user } = useAuth();
  const [texto, setTexto] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { mensajes, loading, sending, enviarMensaje } = useChat({
    tipo: 'producto',
    productoId,
    user,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || sending) return;
    const ok = await enviarMensaje(texto, productoId);
    if (ok) setTexto('');
  };

  return (
    <section className="mt-16 border-t border-amanda-lightgray pt-10">
      <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-1">Consultas</p>
      <h2 className="text-lg tracking-wide uppercase text-amanda-black mb-6">
        Preguntale a Amanda
      </h2>

      {!user ? (
        <div className="bg-amanda-lightgray px-6 py-8 text-center">
          <p className="text-xs text-amanda-gray mb-4">
            Iniciá sesión para consultar sobre <span className="text-amanda-black">{productoNombre}</span>
          </p>
          <Link
            href="/login"
            className="inline-block text-[10px] tracking-widest uppercase text-amanda-black border border-amanda-black px-6 py-3 hover:bg-amanda-black hover:text-amanda-white transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      ) : loading ? (
        <p className="text-[10px] tracking-widest uppercase text-amanda-gray">Cargando...</p>
      ) : (
        <div>
          {/* Historial */}
          {mensajes.length === 0 ? (
            <p className="text-xs text-amanda-gray mb-6">
              Sé el primero en preguntar sobre este producto.
            </p>
          ) : (
            <div className="mb-6 max-h-80 overflow-y-auto">
              {mensajes.map((msg) => (
                <MensajeRow
                  key={msg.id}
                  msg={msg}
                  esPropio={msg.remitente_id === user.id}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleEnviar} className="flex gap-3">
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="¿Tenés dudas sobre talle, color o disponibilidad?"
              className="flex-1 border border-amanda-lightgray px-4 py-3 text-xs text-amanda-black placeholder-amanda-gray outline-none focus:border-amanda-gray transition-colors"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!texto.trim() || sending}
              className="bg-amanda-black text-amanda-white text-[10px] tracking-widest uppercase px-6 py-3 hover:bg-amanda-gray disabled:opacity-40 transition-colors shrink-0"
            >
              {sending ? '...' : 'Enviar'}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
