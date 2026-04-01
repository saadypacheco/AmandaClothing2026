'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { CartItem } from '@/types/cart';

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
  const router = useRouter();
  const { items, total, itemCount, isOpen, updateQuantity, removeItem, clearCart, closeCart } = useCartStore();

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

  if (!isOpen) return null;

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
          <div className="border-t border-amanda-lightgray px-6 py-6 space-y-4">
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
