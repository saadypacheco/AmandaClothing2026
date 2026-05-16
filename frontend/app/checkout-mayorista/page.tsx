'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart';
import { CartItem } from '@/types/cart';
import { createClient } from '@/lib/supabase/client';
import { useTiendaConfig } from '@/hooks/useTiendaConfig';

const API = process.env.NEXT_PUBLIC_API_URL;

interface MetodoPagoOption {
  value: string;
  label: string;
  descripcion: string;
}

const TODOS_METODOS: MetodoPagoOption[] = [
  { value: 'mercadopago', label: 'MercadoPago', descripcion: 'Pago online con tarjeta o transferencia inmediata' },
  { value: 'cuenta_corriente', label: 'Cuenta corriente', descripcion: 'Cargo a tu CC. Vencimiento según condición de pago.' },
  { value: 'transferencia', label: 'Transferencia bancaria', descripcion: 'Subís el comprobante y aprobamos el pedido' },
  { value: 'cotizacion', label: 'Solicitar cotización', descripcion: 'Sin pago inmediato. Revisamos y te devolvemos cotización ajustada.' },
];

export default function CheckoutMayoristaPage() {
  const router = useRouter();
  const { get, formatPrice } = useTiendaConfig();
  const { items, total, clearCart } = useCartStore();

  const [metodosHabilitados, setMetodosHabilitados] = useState<string[]>([]);
  const [metodoElegido, setMetodoElegido] = useState<string>('');
  const [nota, setNota] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/productos');
      return;
    }
    // Parsear metodos habilitados
    try {
      const raw = get('mayorista_metodos_pago', '["mercadopago","cuenta_corriente","transferencia","cotizacion"]');
      const arr = JSON.parse(raw);
      setMetodosHabilitados(arr);
      if (arr.length > 0) setMetodoElegido(arr[0]);
    } catch {
      setMetodosHabilitados(['mercadopago']);
      setMetodoElegido('mercadopago');
    }
  }, [items.length, router, get]);

  const metodos = TODOS_METODOS.filter(m => metodosHabilitados.includes(m.value));

  async function confirmar() {
    if (!metodoElegido) return;
    setWorking(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      const res = await fetch(`${API}/pedidos/mayorista`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          items: items.map(i => ({ variante_id: i.variante_id, cantidad: i.cantidad })),
          metodo_pago: metodoElegido,
          nota_interna: nota || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || 'Error al crear pedido');
        setWorking(false);
        return;
      }
      const pedido = await res.json();
      clearCart();
      router.push(`/checkout-mayorista/confirmado?pedido=${pedido.id}&metodo=${metodoElegido}&estado=${pedido.estado}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      setWorking(false);
    }
  }

  if (items.length === 0) return null;

  return (
    <main className="min-h-screen bg-stone-50 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl tracking-wide text-stone-900">Finalizar pedido mayorista</h1>
          <Link href="/productos" className="text-[10px] tracking-widest uppercase text-stone-500 hover:text-stone-900">
            ← Seguir comprando
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumen */}
          <section className="bg-white border border-stone-200 rounded-xl p-5">
            <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-4">Tu pedido</p>
            {items.map(item => <ResumenItem key={item.id} item={item} formatPrice={formatPrice} />)}
            <div className="mt-5 pt-3 border-t border-stone-200">
              <div className="flex justify-between text-base">
                <span className="text-xs tracking-widest uppercase text-stone-700">Total</span>
                <span className="font-semibold text-stone-900">{formatPrice(total)}</span>
              </div>
            </div>
          </section>

          {/* Método de pago */}
          <section className="space-y-4">
            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-4">Método de pago</p>
              <div className="space-y-2">
                {metodos.map(m => (
                  <label
                    key={m.value}
                    className={`block border rounded-lg p-4 cursor-pointer transition-colors ${
                      metodoElegido === m.value ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="metodo"
                        value={m.value}
                        checked={metodoElegido === m.value}
                        onChange={e => setMetodoElegido(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-stone-900">{m.label}</p>
                        <p className="text-xs text-stone-500 mt-0.5">{m.descripcion}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-2">
                Nota interna (opcional)
              </label>
              <textarea
                value={nota}
                onChange={e => setNota(e.target.value)}
                rows={3}
                placeholder="Ej: enviar a sucursal X, factura A separada, etc."
                className="w-full border border-stone-200 px-3 py-2 text-sm rounded outline-none focus:border-stone-900"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 px-4 py-3 rounded">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={confirmar}
              disabled={working || !metodoElegido}
              className="w-full bg-stone-900 text-white text-xs tracking-widest uppercase py-4 hover:bg-stone-700 transition-colors disabled:opacity-50 rounded"
            >
              {working ? 'Procesando...' : 'Confirmar pedido'}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

function ResumenItem({ item, formatPrice }: { item: CartItem; formatPrice: (n: number) => string }) {
  return (
    <div className="flex gap-4 py-3 border-b border-stone-100 last:border-0">
      <div className="w-12 h-14 bg-stone-100 shrink-0 flex items-center justify-center rounded">
        {item.imagen_url ? (
          <Image src={item.imagen_url} alt={item.nombre} width={48} height={56} className="object-cover w-full h-full rounded" />
        ) : (
          <span className="text-stone-400 text-[10px] uppercase">{item.nombre.slice(0, 2)}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase text-stone-900 truncate">{item.nombre}</p>
        <p className="text-[10px] text-stone-400 mt-0.5">{item.talla} / {item.color} · x{item.cantidad}</p>
      </div>
      <p className="text-xs text-stone-900 shrink-0 self-center">{formatPrice(item.precio * item.cantidad)}</p>
    </div>
  );
}
