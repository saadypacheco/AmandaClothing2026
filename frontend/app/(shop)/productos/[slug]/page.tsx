import { notFound } from 'next/navigation';
import { Producto } from '@/types/producto';
import { ProductoDetalleClient } from './ProductoDetalleContent';

// ISR: regenera cada 60 segundos en background si hay visitas
export const revalidate = 60;

const API = process.env.API_URL || 'http://localhost:8000';

// Genera todas las páginas de producto en el build de Vercel
// → HTML estático servido desde CDN, ~50ms de carga
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API}/productos/?limit=200`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const productos: Producto[] = await res.json();
    return productos.map(p => ({ slug: String(p.id) }));
  } catch {
    return [];
  }
}

interface PageProps {
  params: { slug: string };
}

export default async function ProductoDetallePage({ params }: PageProps) {
  const res = await fetch(`${API}/productos/${params.slug}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    if (res.status === 404) notFound();
    // En error, renderiza con datos vacíos — el cliente maneja el fallback
    return notFound();
  }

  const producto: Producto = await res.json();
  producto.imagenes = Array.isArray(producto.imagenes) ? producto.imagenes : [];

  return <ProductoDetalleClient producto={producto} />;
}
