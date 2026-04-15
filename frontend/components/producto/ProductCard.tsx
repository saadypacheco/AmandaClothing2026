'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Producto } from '@/types/producto';
import { prefetchProducto } from '@/lib/productoCache';
import { useTiendaConfig } from '@/hooks/useTiendaConfig';

interface ProductCardProps {
  producto: Producto;
  className?: string;
  isWishlisted?: boolean;
  onWishlistToggle?: (id: number) => void;
  priority?: boolean;
}

function calcDescuento(precio: number, precioOriginal: number): number {
  return Math.round((1 - precio / precioOriginal) * 100);
}

export function ProductCard({ producto, className = '', isWishlisted, onWishlistToggle, priority = false }: ProductCardProps) {
  const { formatPrice } = useTiendaConfig();
  const tieneOferta = !!producto.precio_original && producto.precio_original > producto.precio;
  const descuento = tieneOferta ? calcDescuento(producto.precio, producto.precio_original!) : 0;

  return (
    <Link href={`/productos/${producto.id}`} className={`group block product-card ${className}`} onMouseEnter={() => prefetchProducto(producto.id)}>
      {/* Imagen */}
      <div className="aspect-[3/4] overflow-hidden bg-stone-100 relative mb-3">
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            priority={priority}
            className="product-card-img object-cover object-top"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="product-card-img w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
            <span className="text-stone-400 text-xs tracking-wide uppercase">{producto.nombre.slice(0, 2)}</span>
          </div>
        )}

        {/* Badges — apilados en columna, esquina superior izquierda */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {tieneOferta && (
            <span className="bg-rose-500 text-white text-[10px] tracking-widest uppercase px-2 py-1 leading-none">
              -{descuento}%
            </span>
          )}
          {producto.es_nuevo && !tieneOferta && (
            <span className="bg-amanda-black text-amanda-white text-[10px] tracking-widest uppercase px-2 py-1 leading-none">
              Nuevo
            </span>
          )}
          {producto.pocas_unidades && (
            <span className="bg-amber-500 text-white text-[10px] tracking-widest uppercase px-2 py-1 leading-none">
              Últimas
            </span>
          )}
        </div>

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

        {/* Overlay hover — solo desktop */}
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
        <div className="flex items-center gap-2 mt-1">
          <p className={`text-xs ${tieneOferta ? 'text-rose-500 font-medium' : 'text-amanda-black'}`}>
            {formatPrice(producto.precio ?? 0)}
          </p>
          {tieneOferta && (
            <p className="text-xs text-amanda-gray line-through">
              {formatPrice(producto.precio_original ?? 0)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
