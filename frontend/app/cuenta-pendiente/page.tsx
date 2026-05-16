'use client';

import Link from 'next/link';
import { useTiendaConfig } from '@/hooks/useTiendaConfig';

export default function CuentaPendientePage() {
  const { get } = useTiendaConfig();
  const whatsapp = get('whatsapp_numero', '');
  const email = get('email', '');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50">
      <div className="max-w-md w-full bg-white rounded-xl border border-stone-200 p-8 text-center shadow-sm">
        <div className="mb-5 inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50">
          <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-xl text-stone-900 mb-2">Tu cuenta está en revisión</h1>
        <p className="text-sm text-stone-500 mb-6 leading-relaxed">
          Recibimos tu solicitud de cuenta mayorista. Un administrador la revisará y te avisará por email
          cuando esté aprobada. Mientras tanto, no podrás acceder al catálogo.
        </p>

        <div className="border-t border-stone-100 pt-5 space-y-2">
          <p className="text-[10px] tracking-widest uppercase text-stone-400">¿Necesitás contactarnos?</p>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}?text=Hola,%20mi%20cuenta%20mayorista%20está%20pendiente%20de%20aprobación.`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-stone-700 hover:underline"
            >
              WhatsApp: {whatsapp}
            </a>
          )}
          {email && <p className="text-sm text-stone-700">Email: {email}</p>}
        </div>

        <div className="mt-6 pt-6 border-t border-stone-100">
          <Link href="/login" className="text-[10px] tracking-widest uppercase text-stone-400 hover:text-stone-700">
            ← Cerrar sesión y volver a login
          </Link>
        </div>
      </div>
    </div>
  );
}
