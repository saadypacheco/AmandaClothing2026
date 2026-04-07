'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useChat, Mensaje } from '@/hooks/useChat';

function BurbujaMensaje({ msg, esPropio }: { msg: Mensaje; esPropio: boolean }) {
  return (
    <div className={`flex ${esPropio ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[75%] px-3 py-2 text-xs leading-relaxed ${
          esPropio
            ? 'bg-amanda-black text-amanda-white'
            : 'bg-amanda-lightgray text-amanda-black'
        }`}
      >
        {msg.contenido}
      </div>
    </div>
  );
}

// Horario de atención: lun–sáb 9–21hs (Argentina UTC-3)
function estaEnHorario(): boolean {
  const ar = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
  const dia = ar.getDay();
  const hora = ar.getHours();
  return dia >= 1 && dia <= 6 && hora >= 9 && hora < 21;
}

export function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mensajes, loading, sending, enviarMensaje } = useChat({
    tipo: 'privado',
    user,
  });

  const noLeidos = mensajes.filter(m => !m.leido && m.remitente_id !== user?.id).length;
  const enHorario = estaEnHorario();

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensajes, open]);

  useEffect(() => {
    if (open && user) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, user]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || sending) return;
    const ok = await enviarMensaje(texto);
    if (ok) setTexto('');
  };

  if (!user) return null;

  return (
    <>
      {/* Panel de chat */}
      {open && (
        <div className="fixed bottom-20 left-4 w-80 bg-amanda-white border border-amanda-lightgray shadow-2xl z-50 flex flex-col" style={{ height: '420px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-amanda-lightgray bg-amanda-black">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-amanda-white">Chat con Amanda</p>
              <p className="text-[9px] text-amanda-gray mt-0.5">Responde a la brevedad</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-amanda-gray hover:text-amanda-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!enHorario && (
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
              <p className="text-[10px] text-amber-700">Fuera de horario. Respondemos lun–sáb 9–21hs.</p>
            </div>
          )}

          {!user ? (
            /* No logueado */
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
              <svg className="w-8 h-8 text-amanda-lightgray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-xs text-amanda-gray">Iniciá sesión para chatear con Amanda</p>
              <Link
                href="/login"
                className="text-[10px] tracking-widest uppercase text-amanda-black border border-amanda-black px-4 py-2 hover:bg-amanda-black hover:text-amanda-white transition-colors"
                onClick={() => setOpen(false)}
              >
                Iniciar sesión
              </Link>
            </div>
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[10px] tracking-widest uppercase text-amanda-gray">Cargando...</p>
            </div>
          ) : (
            <>
              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {mensajes.length === 0 && (
                  <div className="text-center mt-8">
                    <p className="text-[10px] tracking-widest uppercase text-amanda-gray">
                      Hola! Escribime tu consulta 👋
                    </p>
                  </div>
                )}
                {mensajes.map((msg) => (
                  <BurbujaMensaje
                    key={msg.id}
                    msg={msg}
                    esPropio={msg.remitente_id === user.id}
                  />
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleEnviar} className="border-t border-amanda-lightgray flex">
                <input
                  ref={inputRef}
                  type="text"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Escribí tu mensaje..."
                  className="flex-1 px-3 py-3 text-xs text-amanda-black placeholder-amanda-gray bg-transparent outline-none"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!texto.trim() || sending}
                  className="px-3 text-amanda-gray hover:text-amanda-black disabled:opacity-40 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-20 md:bottom-6 left-4 md:left-6 w-12 h-12 md:w-14 md:h-14 bg-amanda-black text-amanda-white flex items-center justify-center shadow-lg hover:bg-amanda-gray transition-colors z-50 relative"
        aria-label="Chat con Amanda"
      >
        {!open && noLeidos > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center font-medium">
            {noLeidos}
          </span>
        )}
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </>
  );
}
