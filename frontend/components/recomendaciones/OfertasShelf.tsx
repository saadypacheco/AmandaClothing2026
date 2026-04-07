'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Producto } from '@/types/producto';

function calcDescuento(precio: number, precioOriginal: number): number {
  return Math.round((1 - precio / precioOriginal) * 100);
}

function OfertaCard({ producto }: { producto: Producto }) {
  const descuento = calcDescuento(producto.precio, producto.precio_original!);

  return (
    <Link href={`/productos/${producto.id}`} className="group shrink-0 w-44 sm:w-52">
      <div className="aspect-[3/4] bg-stone-100 overflow-hidden mb-3 relative">
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 176px, 208px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-stone-300 text-2xl font-light">{producto.nombre.slice(0, 2).toUpperCase()}</span>
          </div>
        )}
        <span className="absolute top-2 left-2 text-[10px] tracking-widest uppercase bg-rose-500 text-white px-2 py-0.5">
          -{descuento}%
        </span>
      </div>
      <p className="text-[10px] tracking-widest uppercase text-amanda-black truncate">{producto.nombre}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <p className="text-xs text-rose-500 font-medium">${producto.precio.toLocaleString('es-AR')}</p>
        <p className="text-xs text-amanda-gray line-through">${producto.precio_original!.toLocaleString('es-AR')}</p>
      </div>
    </Link>
  );
}

export function OfertasShelf() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/?tiene_oferta=true&limit=12`)
      .then(r => r.ok ? r.json() : [])
      .then((data: Producto[]) => setProductos(data))
      .catch(() => setProductos([]))
      .finally(() => setLoading(false));
  }, []);

  // No mostrar si no hay ofertas activas
  if (!loading && productos.length === 0) return null;

  return (
    <section className="px-6 pb-20 max-w-screen-xl mx-auto">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-rose-500 mb-1">Tiempo limitado</p>
          <h2 className="font-serif text-2xl md:text-3xl text-amanda-black">Rebajas</h2>
        </div>
        <Link href="/productos" className="text-[9px] tracking-widest uppercase text-amanda-gray hover:text-amanda-black transition-colors">
          Ver todo
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 w-44 sm:w-52">
              <div className="aspect-[3/4] bg-amanda-lightgray animate-pulse mb-3" />
              <div className="h-2 bg-amanda-lightgray animate-pulse w-3/4 mb-1" />
              <div className="h-2 bg-amanda-lightgray animate-pulse w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {productos.map(p => (
            <OfertaCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </section>
  );
}
