'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useChat, Mensaje } from '@/hooks/useChat';
import { useTiendaConfig } from '@/hooks/useTiendaConfig';

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
  const pathname = usePathname();
  const { user } = useAuth();
  const { get } = useTiendaConfig();
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (pathname === '/software') return null;

  const waNumero = get('whatsapp_numero', '5491133821989');

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

      {/* Botones flotantes — chat IA + WhatsApp */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 flex flex-col gap-2 z-50">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/${waNumero}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 md:w-14 md:h-14 bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:bg-[#1ebe57] transition-colors relative"
          aria-label="WhatsApp"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>

        {/* Chat IA Amanda */}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-12 h-12 md:w-14 md:h-14 bg-amanda-black text-amanda-white flex items-center justify-center shadow-lg hover:bg-amanda-gray transition-colors relative"
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
      </div>
    </>
  );
}
