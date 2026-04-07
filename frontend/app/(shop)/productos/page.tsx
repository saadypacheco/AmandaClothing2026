import { Suspense } from 'react';
import { ProductosContent } from './ProductosContent';
import { Producto, Categoria } from '@/types/producto';

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

function getString(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] : val || '';
}

function buildProductosParams(searchParams: PageProps['searchParams']): string {
  const params = new URLSearchParams();
  const categoria = getString(searchParams.categoria);
  const talla = getString(searchParams.talla);
  const color = getString(searchParams.color);
  const precioMin = getString(searchParams.precio_min);
  const precioMax = getString(searchParams.precio_max);
  const search = getString(searchParams.search);

  if (categoria) {
    if (isNaN(Number(categoria))) params.append('categoria_slug', categoria);
    else params.append('categoria_id', categoria);
  }
  if (talla) params.append('talla', talla);
  if (color) params.append('color', color);
  if (precioMin) params.append('precio_min', precioMin);
  if (precioMax) params.append('precio_max', precioMax);
  if (search) params.append('search', search);

  return params.toString();
}

async function fetchInitialData(searchParams: PageProps['searchParams']) {
  const API = process.env.API_URL || 'http://localhost:8000';
  const productosParams = buildProductosParams(searchParams);

  const [productos, categorias] = await Promise.all([
    fetch(`${API}/productos/?${productosParams}`, { next: { revalidate: 60 } })
      .then(r => r.ok ? r.json() : [])
      .catch(() => [] as Producto[]),
    fetch(`${API}/categorias`, { next: { revalidate: 300 } })
      .then(r => r.ok ? r.json() : [])
      .catch(() => [] as Categoria[]),
  ]);

  return { productos: productos as Producto[], categorias: categorias as Categoria[] };
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-amanda-white pt-16">
      <div className="border-b border-amanda-lightgray px-6 py-6">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="font-serif text-2xl md:text-3xl">Tienda</h1>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] bg-amanda-lightgray animate-pulse mb-3" />
              <div className="h-2 bg-amanda-lightgray animate-pulse w-3/4 mb-2" />
              <div className="h-2 bg-amanda-lightgray animate-pulse w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function ProductosPage({ searchParams }: PageProps) {
  const { productos, categorias } = await fetchInitialData(searchParams);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProductosContent
        initialProductos={productos}
        initialCategorias={categorias}
        initialFilters={{
          categoria: getString(searchParams.categoria),
          talla: getString(searchParams.talla),
          color: getString(searchParams.color),
          precioMin: getString(searchParams.precio_min),
          precioMax: getString(searchParams.precio_max),
          search: getString(searchParams.search),
        }}
      />
    </Suspense>
  );
}
