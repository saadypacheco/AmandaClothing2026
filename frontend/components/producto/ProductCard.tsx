'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Producto } from '@/types/producto';

interface ProductCardProps {
  producto: Producto;
  className?: string;
  isWishlisted?: boolean;
  onWishlistToggle?: (id: number) => void;
}

export function ProductCard({ producto, className = '', isWishlisted, onWishlistToggle }: ProductCardProps) {
  return (
    <Link href={`/productos/${producto.id}`} className={`group block product-card ${className}`}>
      {/* Imagen */}
      <div className="aspect-[3/4] overflow-hidden bg-stone-100 relative mb-3">
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            className="product-card-img object-cover object-top"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="product-card-img w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
            <span className="text-stone-400 text-xs tracking-wide uppercase">{producto.nombre.slice(0, 2)}</span>
          </div>
        )}

        {/* Badge pocas unidades */}
        {producto.pocas_unidades && (
          <div className="absolute top-3 left-3 bg-amanda-black text-amanda-white text-[10px] tracking-widest uppercase px-2 py-1">
            Últimas
          </div>
        )}

        {/* Botón wishlist */}
        {onWishlistToggle && (
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onWishlistToggle(producto.id); }}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
            aria-label={isWishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <svg className={`w-4 h-4 transition-colors ${isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-stone-400 fill-none'}`} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        )}

        {/* Overlay rápido en hover — solo desktop */}
        <div className="hidden md:flex absolute inset-0 bg-amanda-black/0 group-hover:bg-amanda-black/5 transition-all duration-500 items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <span className="bg-amanda-white text-amanda-black text-[10px] tracking-widest uppercase px-6 py-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            Ver producto
          </span>
        </div>
      </div>

      {/* Info */}
      <div>
        <p className="text-xs tracking-wide uppercase text-amanda-black truncate">{producto.nombre}</p>
        {producto.categoria && (
          <p className="text-[10px] tracking-widest uppercase text-amanda-gray mt-0.5">{producto.categoria.nombre}</p>
        )}
        <p className="text-xs text-amanda-black mt-1">${producto.precio.toLocaleString('es-AR')}</p>
      </div>
    </Link>
  );
}

export default ProductCard;
