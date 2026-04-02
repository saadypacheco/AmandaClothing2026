'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ItemPedido {
  id: number;
  cantidad: number;
  precio_unitario: number;
  variantes: {
    id: number;
    talla: string;
    color: string;
    productos: {
      id: number;
      nombre: string;
      imagen_url: string | null;
    };
  };
}

interface Pedido {
  id: number;
  total: number;
  estado: string;
  created_at: string;
  items_pedido: ItemPedido[];
}

const estadoBadge: Record<string, string> = {
  pendiente:  'bg-amber-100 text-amber-700',
  pagado:     'bg-blue-100 text-blue-700',
  preparando: 'bg-orange-100 text-orange-700',
  enviado:    'bg-violet-100 text-violet-700',
  entregado:  'bg-emerald-100 text-emerald-700',
  cancelado:  'bg-rose-100 text-rose-700',
};

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatMoney(n: number) {
  return '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

export default function MisPedidosPage() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [abierto, setAbierto] = useState<number | null>(null);

  useEffect(() => {
    const cargar = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/login?mensaje=Iniciá sesión para ver tus pedidos'); return; }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos/mis-pedidos`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) setPedidos(await res.json());
      setLoading(false);
    };
    cargar();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-stone-400">Cargando pedidos...</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-amanda-white pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        <div className="mb-8">
          <p className="text-[10px] tracking-widest uppercase text-amanda-gray">Mi cuenta</p>
          <h1 className="text-2xl tracking-wide uppercase text-amanda-black mt-1">Mis pedidos</h1>
        </div>

        {pedidos.length === 0 ? (
          <div className="text-center py-16 border border-amanda-lightgray">
            <p className="text-sm text-amanda-gray mb-4">Todavía no realizaste ningún pedido.</p>
            <Link href="/productos" className="text-[10px] tracking-widest uppercase text-amanda-black border-b border-amanda-black pb-0.5">
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map(p => (
              <div key={p.id} className="border border-stone-200 bg-white">
                {/* Header del pedido */}
                <button
                  onClick={() => setAbierto(abierto === p.id ? null : p.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-4 text-left">
                    <span className="text-xs font-medium text-stone-700">#{p.id}</span>
                    <span className="text-xs text-stone-400">{formatFecha(p.created_at)}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${estadoBadge[p.estado] || 'bg-stone-100 text-stone-500'}`}>
                      {p.estado}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-stone-800">{formatMoney(p.total)}</span>
                    <svg className={`w-4 h-4 text-stone-400 transition-transform ${abierto === p.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Items del pedido */}
                {abierto === p.id && (
                  <div className="border-t border-stone-100 divide-y divide-stone-50">
                    {p.items_pedido.map(item => (
                      <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                        <div className="w-10 h-12 bg-stone-100 shrink-0 overflow-hidden">
                          {item.variantes?.productos?.imagen_url ? (
                            <Image src={item.variantes.productos.imagen_url} alt={item.variantes.productos.nombre} width={40} height={48} className="w-full h-full object-cover object-top" />
                          ) : (
                            <div className="w-full h-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-stone-800 truncate">{item.variantes?.productos?.nombre}</p>
                          <p className="text-[10px] text-stone-400 mt-0.5 uppercase tracking-wide">
                            {item.variantes?.talla} · {item.variantes?.color} · x{item.cantidad}
                          </p>
                        </div>
                        <span className="text-xs text-stone-600 shrink-0">{formatMoney(item.precio_unitario * item.cantidad)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href="/productos" className="text-[10px] tracking-widest uppercase text-amanda-gray hover:text-amanda-black transition-colors">
            ← Seguir comprando
          </Link>
        </div>
      </div>
    </main>
  );
}
