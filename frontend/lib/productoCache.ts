import { Producto } from '@/types/producto';

// Cache compartido entre ProductCard (prefetch on hover) y ProductoDetalle (read/write)
export const productoCache = new Map<string, Producto>();

export function prefetchProducto(id: number) {
  const key = String(id);
  if (productoCache.has(key)) return; // ya cacheado
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${key}`)
    .then(r => r.ok ? r.json() : null)
    .then((data: Producto | null) => {
      if (!data) return;
      data.imagenes = Array.isArray(data.imagenes) ? data.imagenes : [];
      productoCache.set(key, data);
    })
    .catch(() => {});
}
