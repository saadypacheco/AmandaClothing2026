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
      <div className="w-14 bg-stone-100 shrink-0 flex items-center justify-center" style={{ height: '4.5rem' }}>
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

function buildWAMessageWithItems(items: CartItem[], total: number, nombre?: string): string {
  const lineas = items.map(i =>
    `• ${i.nombre} (${i.talla} / ${i.color}) x${i.cantidad} — $${(i.precio * i.cantidad).toLocaleString('es-AR')}`
  ).join('\n');
  const saludo = nombre ? `Hola Amanda! Soy ${nombre}.` : 'Hola Amanda!';
  return `${saludo} Acabo de hacer un pedido 🛍️\n\n${lineas}\n\nTotal: $${total.toLocaleString('es-AR')}\n\nQuiero enviarte el comprobante de pago.`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [guardando, setGuardando] = useState(false);
  const [errorPedido, setErrorPedido] = useState('');

  // Datos guest (solo si no está logueado)
  const [esGuest, setEsGuest] = useState(false);
  const [nombreGuest, setNombreGuest] = useState('');
  const [telefonoGuest, setTelefonoGuest] = useState('');
  const [erroresGuest, setErroresGuest] = useState<{ nombre?: string; telefono?: string }>({});

  useEffect(() => {
    if (items.length === 0) {
      router.push('/');
    }
    // Detectar si es guest
    createClient().auth.getSession().then(({ data: { session } }) => {
      setEsGuest(!session);
    });
  }, [items.length, router]);

  if (items.length === 0) return null;

  const validarGuest = () => {
    const errs: typeof erroresGuest = {};
    if (!nombreGuest.trim()) errs.nombre = 'Ingresá tu nombre';
    if (!telefonoGuest.trim()) errs.telefono = 'Ingresá tu celular';
    else if (telefonoGuest.replace(/\D/g, '').length < 8) errs.telefono = 'Celular inválido';
    setErroresGuest(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirmar = async () => {
    if (esGuest && !validarGuest()) return;

    setGuardando(true);
    setErrorPedido('');

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      let pedidoId: number | null = null;

      if (session?.access_token) {
        // Usuario registrado
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            items: items.map(i => ({ variante_id: i.variante_id, cantidad: i.cantidad })),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          pedidoId = data.id;
        }
      } else {
        // Guest
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos/guest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: nombreGuest.trim(),
            telefono: telefonoGuest.trim(),
            items: items.map(i => ({ variante_id: i.variante_id, cantidad: i.cantidad })),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          pedidoId = data.id;
        } else {
          const err = await res.json();
          setErrorPedido(err.detail || 'Error al registrar el pedido');
          setGuardando(false);
          return;
        }
      }

      clearCart();
      const params = new URLSearchParams();
      if (pedidoId) params.set('pedido', String(pedidoId));
      if (esGuest && telefonoGuest) params.set('tel', telefonoGuest.trim());
      if (esGuest && nombreGuest) params.set('nombre', nombreGuest.trim());
      router.push(`/checkout/confirmado?${params.toString()}`);

    } catch {
      setErrorPedido('Error de conexión. Podés continuar por WhatsApp.');
      setGuardando(false);
    }
  };

  const waMessage = buildWAMessageWithItems(items, total, esGuest ? nombreGuest || undefined : undefined);

  return (
    <main className="min-h-screen bg-amanda-white pt-24 pb-32 lg:pb-16">
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

              {/* Formulario guest */}
              {esGuest && (
                <div className="space-y-3 pb-4 border-b border-amanda-lightgray">
                  <p className="text-[10px] tracking-widest uppercase text-amanda-gray">Tus datos</p>
                  <div>
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={nombreGuest}
                      onChange={e => setNombreGuest(e.target.value)}
                      className="w-full border border-amanda-lightgray px-3 py-2.5 text-xs text-amanda-black placeholder-amanda-gray outline-none focus:border-amanda-black transition-colors"
                    />
                    {erroresGuest.nombre && <p className="text-[10px] text-red-500 mt-1">{erroresGuest.nombre}</p>}
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Celular (ej: 1133821989)"
                      value={telefonoGuest}
                      onChange={e => setTelefonoGuest(e.target.value)}
                      className="w-full border border-amanda-lightgray px-3 py-2.5 text-xs text-amanda-black placeholder-amanda-gray outline-none focus:border-amanda-black transition-colors"
                    />
                    {erroresGuest.telefono && <p className="text-[10px] text-red-500 mt-1">{erroresGuest.telefono}</p>}
                  </div>
                  <p className="text-[10px] text-amanda-gray">
                    ¿Ya tenés cuenta?{' '}
                    <Link href="/login" className="text-amanda-black underline">Iniciá sesión</Link>
                  </p>
                </div>
              )}

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

              {/* WhatsApp con detalle del carrito */}
              <a
                href={`https://wa.me/5491133821989?text=${encodeURIComponent(waMessage)}`}
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

      {/* Barra fija mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-amanda-white border-t border-amanda-lightgray px-4 py-3 flex gap-3">
        <a
          href={`https://wa.me/5491133821989?text=${encodeURIComponent(waMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-14 shrink-0 bg-[#25D366] text-white hover:bg-[#20b858] transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
        <button
          onClick={handleConfirmar}
          disabled={guardando}
          className="flex-1 bg-amanda-black text-amanda-white text-[10px] tracking-widest uppercase py-3.5 hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Confirmar pedido'}
        </button>
      </div>
    </main>
  );
}
