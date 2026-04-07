import { notFound } from 'next/navigation';
import { Producto } from '@/types/producto';
import { ProductoDetalleContent } from './ProductoDetalleContent';

interface PageProps {
  params: { slug: string };
}

export default async function ProductoDetallePage({ params }: PageProps) {
  const API = process.env.API_URL || 'http://localhost:8000';

  const res = await fetch(`${API}/productos/${params.slug}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error('Error al cargar el producto');
  }

  const producto: Producto = await res.json();
  producto.imagenes = Array.isArray(producto.imagenes) ? producto.imagenes : [];

  return <ProductoDetalleContent producto={producto} />;
}
