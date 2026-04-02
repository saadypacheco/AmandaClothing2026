'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/producto/ProductCard';
import { useWishlist } from '@/hooks/useWishlist';
import { Producto, Categoria } from '@/types/producto';

function ProductosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const wishlist = useWishlist();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [selectedTalla, setSelectedTalla] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [precioMin, setPrecioMin] = useState<string>('');
  const [precioMax, setPrecioMax] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const precioTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Available filter options
  const [tallasDisponibles, setTallasDisponibles] = useState<string[]>([]);
  const [coloresDisponibles, setColoresDisponibles] = useState<string[]>([]);

  useEffect(() => {
    const categoriaParam = searchParams.get('categoria') || '';
    const talla = searchParams.get('talla') || '';
    const color = searchParams.get('color') || '';
    const min = searchParams.get('precio_min') || '';
    const max = searchParams.get('precio_max') || '';
    const search = searchParams.get('search') || '';

    setSelectedCategoria(categoriaParam);
    setSelectedTalla(talla);
    setSelectedColor(color);
    setPrecioMin(min);
    setPrecioMax(max);
    setSearchQuery(search);

    fetchCategorias();
    fetchProductos(categoriaParam, talla, color, min, max, search);
  }, [searchParams.toString()]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProductos = async (
    categoria = selectedCategoria,
    talla = selectedTalla,
    color = selectedColor,
    min = precioMin,
    max = precioMax,
    search = searchQuery
  ) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();

      if (categoria) {
        if (isNaN(Number(categoria))) {
          params.append('categoria_slug', categoria);
        } else {
          params.append('categoria_id', categoria);
        }
      }
      if (talla) params.append('talla', talla);
      if (color) params.append('color', color);
      if (min) params.append('precio_min', min);
      if (max) params.append('precio_max', max);
      if (search) params.append('search', search);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/?${params}`);
      if (!response.ok) throw new Error('Error al cargar productos. Intentá de nuevo.');

      const data: Producto[] = await response.json();
      setProductos(data);

      // Extract available filter options
      const tallas = new Set<string>();
      const colores = new Set<string>();

      data.forEach(producto => {
        producto.variantes.forEach(variante => {
          if (variante.talla) tallas.add(variante.talla);
          if (variante.color) colores.add(variante.color);
        });
      });

      setTallasDisponibles(Array.from(tallas).sort());
      setColoresDisponibles(Array.from(colores).sort());

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async (): Promise<Categoria[]> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categorias`);
      if (!res.ok) return [];
      const data: Categoria[] = await res.json();
      setCategorias(data);
      return data;
    } catch {
      return [];
    }
  };

  const updateFilters = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/productos?${params}`);
  };

  const handleCategoriaChange = (categoriaId: string) => {
    setSelectedCategoria(categoriaId);
    updateFilters({ categoria: categoriaId });
  };

  const handleTallaChange = (talla: string) => {
    setSelectedTalla(talla);
    updateFilters({ talla });
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    updateFilters({ color });
  };

  const handlePrecioChange = (min: string, max: string) => {
    setPrecioMin(min);
    setPrecioMax(max);
    if (precioTimeout.current) clearTimeout(precioTimeout.current);
    precioTimeout.current = setTimeout(() => updateFilters({ precio_min: min, precio_max: max }), 800);
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => updateFilters({ search }), 400);
  };

  const clearFilters = () => {
    setSelectedCategoria('');
    setSelectedTalla('');
    setSelectedColor('');
    setPrecioMin('');
    setPrecioMax('');
    setSearchQuery('');
    router.push('/productos');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <p className="text-xs tracking-widest uppercase text-amanda-gray animate-pulse">Cargando colección...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amanda-white pt-16">
      {/* Header catálogo */}
      <div className="border-b border-amanda-lightgray px-6 py-6">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl">Colección</h1>
            <p className="text-xs text-amanda-gray mt-1 tracking-wide">
              {productos.length} {productos.length === 1 ? 'prenda' : 'prendas'}
            </p>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar..."
              className="w-full border-b border-amanda-black bg-transparent text-xs tracking-wide py-2 pr-6 focus:outline-none placeholder:text-amanda-gray"
            />
            <svg className="absolute right-0 top-2 w-4 h-4 text-amanda-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filtros mobile — selectores compactos en una sola fila */}
      <div className="lg:hidden border-b border-amanda-lightgray bg-amanda-white px-4 py-3 flex items-center gap-2">
        <select
          value={selectedCategoria}
          onChange={e => handleCategoriaChange(e.target.value)}
          className="flex-1 min-w-0 text-[10px] tracking-widest uppercase border border-amanda-lightgray bg-transparent py-2 px-2 focus:outline-none focus:border-amanda-black text-amanda-black"
        >
          <option value="">Categoría</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.slug}>{cat.nombre}</option>
          ))}
        </select>

        <select
          value={selectedTalla}
          onChange={e => handleTallaChange(e.target.value)}
          className="flex-1 min-w-0 text-[10px] tracking-widest uppercase border border-amanda-lightgray bg-transparent py-2 px-2 focus:outline-none focus:border-amanda-black text-amanda-black"
        >
          <option value="">Talla</option>
          {tallasDisponibles.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <div className="flex items-center gap-1 flex-1 min-w-0">
          <input
            type="number"
            placeholder="$ Mín"
            value={precioMin}
            onChange={e => handlePrecioChange(e.target.value, precioMax)}
            className="w-full border border-amanda-lightgray bg-transparent text-[10px] py-2 px-2 focus:outline-none focus:border-amanda-black placeholder:text-amanda-gray"
          />
        </div>

        {(selectedCategoria || selectedTalla || precioMin || precioMax) && (
          <button onClick={clearFilters} className="shrink-0 text-[10px] tracking-widest uppercase text-amanda-gray border border-amanda-lightgray px-2 py-2">
            ✕
          </button>
        )}
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-10">

        {/* Filtros desktop */}
        <aside className="hidden lg:block lg:w-48 shrink-0">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs tracking-widest uppercase">Filtros</span>
            <button onClick={clearFilters} className="text-[10px] tracking-widest uppercase text-amanda-gray hover:text-amanda-black">
              Limpiar
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-3">Categoría</p>
              <div className="space-y-2">
                <button onClick={() => handleCategoriaChange('')} className={`block text-xs tracking-wide w-full text-left ${!selectedCategoria ? 'text-amanda-black font-medium' : 'text-amanda-gray hover:text-amanda-black'}`}>
                  Todas
                </button>
                {categorias.map(cat => (
                  <button key={cat.id} onClick={() => handleCategoriaChange(cat.slug)} className={`block text-xs tracking-wide w-full text-left ${selectedCategoria === cat.slug ? 'text-amanda-black font-medium' : 'text-amanda-gray hover:text-amanda-black'}`}>
                    {cat.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-3">Talla</p>
              <div className="flex flex-wrap gap-2">
                {tallasDisponibles.map(t => (
                  <button key={t} onClick={() => handleTallaChange(selectedTalla === t ? '' : t)} className={`text-[10px] px-2 py-1 border transition-colors ${selectedTalla === t ? 'border-amanda-black bg-amanda-black text-white' : 'border-amanda-lightgray text-amanda-gray hover:border-amanda-black hover:text-amanda-black'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-3">Precio</p>
              <div className="space-y-2">
                <input type="number" placeholder="Mínimo" value={precioMin} onChange={(e) => handlePrecioChange(e.target.value, precioMax)} className="w-full border-b border-amanda-lightgray bg-transparent text-xs py-1 focus:outline-none focus:border-amanda-black placeholder:text-amanda-gray" />
                <input type="number" placeholder="Máximo" value={precioMax} onChange={(e) => handlePrecioChange(precioMin, e.target.value)} className="w-full border-b border-amanda-lightgray bg-transparent text-xs py-1 focus:outline-none focus:border-amanda-black placeholder:text-amanda-gray" />
              </div>
            </div>
          </div>
        </aside>

        {/* Grid productos */}
        <div className="flex-1">
          {error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <p className="text-xs tracking-widest uppercase text-red-400">Error al cargar productos</p>
              <button onClick={clearFilters} className="text-[10px] tracking-widest uppercase border-b border-amanda-black pb-0.5">
                Ver toda la colección
              </button>
            </div>
          ) : productos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <p className="text-xs tracking-widest uppercase text-amanda-gray">Sin resultados</p>
              <button onClick={clearFilters} className="text-[10px] tracking-widest uppercase border-b border-amanda-black pb-0.5">
                Ver toda la colección
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
              {productos.map((producto) => (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  isWishlisted={wishlist.ids.has(producto.id)}
                  onWishlistToggle={wishlist.toggle}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center pt-16">
        <p className="text-xs tracking-widest uppercase text-amanda-gray animate-pulse">Cargando colección...</p>
      </div>
    }>
      <ProductosContent />
    </Suspense>
  );
}