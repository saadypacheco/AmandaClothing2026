'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Producto } from '@/types/producto';

interface ProductCardProps {
  producto: Producto;
  className?: string;
}

export function ProductCard({ producto, className = '' }: ProductCardProps) {
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

        {/* Overlay rápido en hover */}
        <div className="absolute inset-0 bg-amanda-black/0 group-hover:bg-amanda-black/5 transition-all duration-500 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
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
