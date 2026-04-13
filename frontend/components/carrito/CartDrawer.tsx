'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { useTiendaConfig } from '@/hooks/useTiendaConfig';
import { CartItem } from '@/types/cart';

function buildWhatsAppLink(items: CartItem[], total: number, waNumber: string): string {
  const lineas = items.map(item =>
    `• ${item.nombre} (${item.talla} / ${item.color}) x${item.cantidad} — $${(item.precio * item.cantidad).toLocaleString('es-AR')}`
  ).join('\n');
  const mensaje =
    `Hola Amanda! Quería consultar sobre estos productos 👋\n\n${lineas}\n\nTotal: $${total.toLocaleString('es-AR')}\n\n¿Tienen algún descuento disponible o puedo hacer una reserva?`;
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(mensaje)}`;
}

function CartItemRow({ item, onUpdateQuantity, onRemove }: {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}) {
  return (
    <div className="flex gap-4 py-5 border-b border-amanda-lightgray">
      {/* Imagen placeholder */}
      <div className="w-16 h-20 bg-stone-100 shrink-0 flex items-center justify-center">
        <span className="text-stone-400 text-[10px] uppercase">{item.nombre.slice(0, 2)}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs tracking-wide uppercase text-amanda-black truncate">{item.nombre}</p>
        <p className="text-[10px] tracking-widest uppercase text-amanda-gray mt-0.5">
          {item.talla} · {item.color}
        </p>
        <p className="text-xs text-amanda-black mt-1">${item.precio.toLocaleString('es-AR')}</p>

        {/* Cantidad */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => onUpdateQuantity(item.id, item.cantidad - 1)}
            className="w-6 h-6 border border-amanda-lightgray flex items-center justify-center text-amanda-gray hover:border-amanda-black hover:text-amanda-black transition-colors"
            disabled={item.cantidad <= 1}
          >
            <span className="text-xs">−</span>
          </button>
          <span className="text-xs w-4 text-center">{item.cantidad}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
            className="w-6 h-6 border border-amanda-lightgray flex items-center justify-center text-amanda-gray hover:border-amanda-black hover:text-amanda-black transition-colors"
            disabled={item.cantidad >= item.stock_disponible}
          >
            <span className="text-xs">+</span>
          </button>
        </div>
      </div>

      {/* Eliminar */}
      <button onClick={() => onRemove(item.id)} className="text-amanda-gray hover:text-amanda-black transition-colors self-start mt-0.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function CartDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const { get } = useTiendaConfig();
  const { items, total, itemCount, isOpen, updateQuantity, removeItem, clearCart, closeCart } = useCartStore();

  const waNumero = get('whatsapp_numero', '5491133821989');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeCart]);

  if (pathname === '/software' || !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-amanda-black/30 z-40" onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-amanda-white z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-amanda-lightgray">
          <div>
            <p className="text-xs tracking-widest uppercase text-amanda-black">Carrito</p>
            <p className="text-[10px] tracking-widest uppercase text-amanda-gray mt-0.5">
              {itemCount} {itemCount === 1 ? 'prenda' : 'prendas'}
            </p>
          </div>
          <button onClick={closeCart} className="text-amanda-gray hover:text-amanda-black transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 pb-16">
              <svg className="w-10 h-10 text-amanda-lightgray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-xs tracking-widest uppercase text-amanda-gray">Tu carrito está vacío</p>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-amanda-lightgray px-6 py-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs tracking-widest uppercase text-amanda-gray">Total</span>
              <span className="text-sm text-amanda-black">${total.toLocaleString('es-AR')}</span>
            </div>

            <button
              onClick={() => { closeCart(); router.push('/checkout'); }}
              className="w-full bg-amanda-black text-amanda-white text-xs tracking-widest uppercase py-4 hover:bg-amanda-gray transition-colors duration-300"
            >
              Finalizar compra
            </button>

            {/* WhatsApp — consultar por descuento o reservar */}
            <a
              href={buildWhatsAppLink(items, total, waNumero)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 border border-[#25D366] text-[#25D366] text-xs tracking-widest uppercase py-3.5 hover:bg-[#25D366] hover:text-white transition-colors duration-200"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Consultar / Reservar
            </a>

            <button
              onClick={clearCart}
              className="w-full text-[10px] tracking-widest uppercase text-amanda-gray hover:text-amanda-black transition-colors py-1"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}
