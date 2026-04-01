'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Producto } from '@/types/producto';

interface RecoShelfProps {
  titulo?: string;
  productoId?: number;
  sessionId?: string;
  usuarioId?: string;
  limit?: number;
}

function RecoCard({ producto }: { producto: Producto }) {
  return (
    <Link href={`/productos/${producto.id}`} className="group shrink-0 w-44 sm:w-52">
      {/* Imagen */}
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
        {producto.pocas_unidades && (
          <span className="absolute top-2 left-2 text-[9px] tracking-widest uppercase bg-amanda-nude text-amanda-white px-2 py-0.5">
            Últimas
          </span>
        )}
      </div>

      {/* Info */}
      <p className="text-[10px] tracking-widest uppercase text-amanda-black truncate">{producto.nombre}</p>
      <p className="text-xs text-amanda-gray mt-0.5">${producto.precio.toLocaleString('es-AR')}</p>
    </Link>
  );
}

export function RecoShelf({
  titulo = 'También te puede gustar',
  productoId,
  sessionId,
  usuarioId,
  limit = 6,
}: RecoShelfProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (productoId) params.set('producto_id', String(productoId));
    if (sessionId) params.set('session_id', sessionId);
    if (usuarioId) params.set('usuario_id', usuarioId);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/recomendaciones?${params}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setProductos(data))
      .catch(() => setProductos([]))
      .finally(() => setLoading(false));
  }, [productoId, sessionId, usuarioId, limit]);

  // No mostrar shelf vacío — cumple regla CLAUDE.md
  if (!loading && productos.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="flex items-baseline justify-between mb-6">
        <p className="text-[10px] tracking-widest uppercase text-amanda-gray">{titulo}</p>
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
            <RecoCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </section>
  );
}
