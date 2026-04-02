'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { CartItem } from '@/types/cart';
import { createClient } from '@/lib/supabase/client';

function ResumenItem({ item }: { item: CartItem }) {
  return (
    <div className="flex gap-4 py-4 border-b border-amanda-lightgray">
      <div className="w-14 h-18 bg-stone-100 shrink-0 flex items-center justify-center" style={{ height: '4.5rem' }}>
        {item.imagen_url ? (
          <Image src={item.imagen_url} alt={item.nombre} width={56} height={72} className="object-cover w-full h-full" />
        ) : (
          <span className="text-stone-400 text-[10px] uppercase">{item.nombre.slice(0, 2)}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs tracking-wide uppercase text-amanda-black truncate">{item.nombre}</p>
        <p className="text-[10px] tracking-widest uppercase text-amanda-gray mt-0.5">
          {item.talla} · {item.color}
        </p>
        <p className="text-[10px] tracking-widest uppercase text-amanda-gray mt-0.5">
          Cant. {item.cantidad}
        </p>
      </div>
      <p className="text-xs text-amanda-black shrink-0">
        ${(item.precio * item.cantidad).toLocaleString('es-AR')}
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [guardando, setGuardando] = useState(false);
  const [errorPedido, setErrorPedido] = useState('');

  useEffect(() => {
    if (items.length === 0) {
      router.push('/');
    }
  }, [items.length, router]);

  if (items.length === 0) return null;

  const handleConfirmar = async () => {
    setGuardando(true);
    setErrorPedido('');
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            total,
            items: items.map(i => ({
              variante_id: i.variante_id,
              cantidad: i.cantidad,
              precio_unitario: i.precio,
            })),
          }),
        });
      }
      // Si no está logueado se confirma igual (guest checkout)
    } catch {
      // No bloquear al usuario si falla el guardado
    } finally {
      setGuardando(false);
    }
    clearCart();
    router.push('/checkout/confirmado');
  };

  return (
    <main className="min-h-screen bg-amanda-white pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Título */}
        <div className="mb-10">
          <p className="text-[10px] tracking-widest uppercase text-amanda-gray">Amanda Clothing</p>
          <h1 className="text-2xl tracking-wide uppercase text-amanda-black mt-1">Finalizar compra</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Columna izq — Resumen */}
          <section>
            <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-4">Tu pedido</p>

            <div>
              {items.map((item) => (
                <ResumenItem key={item.id} item={item} />
              ))}
            </div>

            <div className="mt-4 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-[10px] tracking-widest uppercase text-amanda-gray">Subtotal</span>
                <span className="text-xs text-amanda-black">${total.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] tracking-widest uppercase text-amanda-gray">Envío</span>
                <span className="text-[10px] tracking-widest uppercase text-amanda-gray">A coordinar</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-amanda-lightgray">
                <span className="text-xs tracking-widest uppercase text-amanda-black">Total</span>
                <span className="text-sm text-amanda-black font-medium">${total.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </section>

          {/* Columna der — Pago */}
          <section>
            <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-4">Cómo pagar</p>

            <div className="border border-amanda-lightgray p-6 space-y-6">

              {/* Instrucciones */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-[10px] tracking-widest uppercase text-amanda-nude font-medium shrink-0">01</span>
                  <p className="text-xs text-amanda-black">
                    Escaneá el QR con la app de Mercado Pago o transferí al alias.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[10px] tracking-widest uppercase text-amanda-nude font-medium shrink-0">02</span>
                  <p className="text-xs text-amanda-black">
                    Envianos el comprobante por WhatsApp para confirmar el pedido.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[10px] tracking-widest uppercase text-amanda-nude font-medium shrink-0">03</span>
                  <p className="text-xs text-amanda-black">
                    Coordinamos el envío o retiro una vez confirmado el pago.
                  </p>
                </div>
              </div>

              {/* QR */}
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-48 h-48 border border-amanda-lightgray flex items-center justify-center bg-stone-50">
                  {/* Reemplazar con <Image src="/qr-mercadopago.png" alt="QR Mercado Pago" width={192} height={192} /> */}
                  <div className="text-center px-4">
                    <svg className="w-10 h-10 text-amanda-lightgray mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <p className="text-[10px] tracking-widest uppercase text-amanda-gray">QR Mercado Pago</p>
                    <p className="text-[9px] text-amanda-gray mt-1">Próximamente</p>
                  </div>
                </div>
              </div>

              {/* Alias */}
              <div className="bg-amanda-lightgray px-5 py-4">
                <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-1">Alias CBU</p>
                <p className="text-sm tracking-widest uppercase text-amanda-black select-all">AMANDA.CLOTHING</p>
                <p className="text-[9px] text-amanda-gray mt-1">Bancario · Mercado Pago · Cuenta DNI</p>
              </div>

              {/* WhatsApp */}
              <a
                href="https://wa.me/5491133821989?text=Hola%20Amanda!%20Acabo%20de%20hacer%20un%20pedido%20y%20quiero%20enviarte%20el%20comprobante."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white text-[10px] tracking-widest uppercase py-4 hover:bg-[#20b858] transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enviar comprobante por WhatsApp
              </a>

              {errorPedido && <p className="text-red-500 text-xs text-center">{errorPedido}</p>}
              <button
                onClick={handleConfirmar}
                disabled={guardando}
                className="w-full bg-amanda-black text-amanda-white text-[10px] tracking-widest uppercase py-4 hover:bg-amanda-gray transition-colors disabled:opacity-50"
              >
                {guardando ? 'Guardando pedido...' : 'Confirmar pedido'}
              </button>
            </div>
          </section>
        </div>

        <div className="mt-10">
          <Link
            href="/productos"
            className="text-[10px] tracking-widest uppercase text-amanda-gray hover:text-amanda-black transition-colors"
          >
            ← Seguir comprando
          </Link>
        </div>
      </div>
    </main>
  );
}
