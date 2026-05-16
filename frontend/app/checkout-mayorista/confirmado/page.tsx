'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const API = process.env.NEXT_PUBLIC_API_URL;

const TEXTOS_ESTADO: Record<string, { titulo: string; mensaje: string; color: string }> = {
  pendiente: {
    titulo: 'Pedido registrado',
    mensaje: 'Tu pedido fue creado. Procedé a pagar siguiendo las instrucciones del método elegido.',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  pendiente_aprobacion: {
    titulo: 'Pedido en revisión',
    mensaje: 'Tu pedido quedó pendiente de aprobación por el administrador. Te avisaremos por email.',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  cotizado: {
    titulo: 'Cotización solicitada',
    mensaje: 'Tu solicitud entró como cotización. Vamos a revisarla y enviarte el detalle por email.',
    color: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  aprobado: {
    titulo: 'Pedido aprobado',
    mensaje: 'Tu pedido está aprobado y entró en preparación.',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

function ConfirmadoContent() {
  const params = useSearchParams();
  const pedidoId = params.get('pedido');
  const metodo = params.get('metodo') || 'pendiente';
  const estado = params.get('estado') || 'pendiente';

  const fileRef = useRef<HTMLInputElement>(null);
  const [comprobanteSubido, setComprobanteSubido] = useState(false);
  const [uploading, setUploading] = useState(false);

  const info = TEXTOS_ESTADO[estado] || TEXTOS_ESTADO.pendiente;

  async function subirComprobante(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !pedidoId) return;
    setUploading(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API}/pedidos/${pedidoId}/comprobante`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
      body: fd,
    });
    setUploading(false);
    if (res.ok) setComprobanteSubido(true);
  }

  return (
    <div className="max-w-lg w-full bg-white rounded-xl border border-stone-200 p-8">
      <div className={`inline-block px-3 py-1 rounded-full text-[10px] tracking-widest uppercase border mb-4 ${info.color}`}>
        {estado.replace('_', ' ')}
      </div>
      <h1 className="text-2xl font-semibold text-stone-900 mb-2">{info.titulo}</h1>
      <p className="text-sm text-stone-500 mb-6">{info.mensaje}</p>

      {pedidoId && (
        <div className="bg-stone-50 border border-stone-200 px-4 py-3 rounded mb-6">
          <p className="text-[10px] tracking-widest uppercase text-stone-400">N° de pedido</p>
          <p className="text-xl font-mono text-stone-900">#{pedidoId}</p>
        </div>
      )}

      {/* Acción específica según método */}
      {metodo === 'transferencia' && !comprobanteSubido && (
        <div className="border border-stone-200 rounded-lg p-5 mb-6">
          <p className="text-sm font-medium text-stone-900 mb-2">Subí el comprobante</p>
          <p className="text-xs text-stone-500 mb-3">Una vez verificado, tu pedido pasa a preparación.</p>
          <label className="block w-full bg-stone-900 text-white text-xs tracking-widest uppercase py-3 text-center rounded cursor-pointer hover:bg-stone-700">
            {uploading ? 'Subiendo...' : 'Elegir archivo (JPG / PNG / PDF)'}
            <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={subirComprobante} className="hidden" disabled={uploading} />
          </label>
        </div>
      )}

      {metodo === 'transferencia' && comprobanteSubido && (
        <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-emerald-700">Comprobante subido. Vamos a verificarlo.</p>
        </div>
      )}

      {metodo === 'mercadopago' && (
        <div className="border border-stone-200 rounded-lg p-5 mb-6">
          <p className="text-sm font-medium text-stone-900 mb-2">Próximo paso: pagar</p>
          <p className="text-xs text-stone-500">Recibirás un email con el link de pago de MercadoPago.</p>
        </div>
      )}

      {metodo === 'cuenta_corriente' && (
        <div className="border border-stone-200 rounded-lg p-5 mb-6">
          <p className="text-sm font-medium text-stone-900 mb-2">Cargado en tu cuenta corriente</p>
          <p className="text-xs text-stone-500">Vencimiento según tu condición de pago. Podés verlo en /mi-cuenta.</p>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-stone-100">
        <Link href="/pedidos" className="flex-1 text-center bg-stone-900 text-white text-xs tracking-widest uppercase py-3 hover:bg-stone-700 rounded">
          Ver mis pedidos
        </Link>
        <Link href="/productos" className="flex-1 text-center border border-stone-300 text-stone-900 text-xs tracking-widest uppercase py-3 hover:bg-stone-50 rounded">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmadoPage() {
  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-20">
      <Suspense fallback={<p className="text-sm text-stone-400">Cargando...</p>}>
        <ConfirmadoContent />
      </Suspense>
    </main>
  );
}
