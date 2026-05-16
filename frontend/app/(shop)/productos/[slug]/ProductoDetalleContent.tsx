'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Producto } from '@/types/producto';
import { useCart } from '@/hooks/useCart';
import { useTracking } from '@/hooks/useTracking';
import { useWishlist } from '@/hooks/useWishlist';
import { useTiendaConfig } from '@/hooks/useTiendaConfig';
import { RecoShelf } from '@/components/recomendaciones/RecoShelf';

// Recibe el producto pre-renderizado por ISR — solo maneja interactividad
export function ProductoDetalleClient({ producto }: { producto: Producto }) {
  const { addToCart } = useCart();
  const { track } = useTracking();
  const wishlist = useWishlist();
  const { formatPrice } = useTiendaConfig();

  const [fotoActiva, setFotoActiva] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [atributosPorVariante, setAtributosPorVariante] = useState<Record<number, Array<{nombre: string; valor: string}>>>({});

  const availableSizes = [...new Set(producto.variantes.map(v => v.talla))].filter(Boolean) as string[];
  const availableColors = [...new Set(producto.variantes.map(v => v.color))].filter(Boolean) as string[];

  useEffect(() => {
    if (availableSizes.length > 0) setSelectedSize(availableSizes[0]);
    if (availableColors.length > 0) setSelectedColor(availableColors[0]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    track(producto.id, 'vista');
  }, [producto.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Cargar atributos dinamicos del producto (catalogo generalizado)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${producto.id}/atributos`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.por_variante) setAtributosPorVariante(data.por_variante);
      })
      .catch(() => {});
  }, [producto.id]);

  const selectedVariant = producto.variantes.find(v =>
    v.talla === selectedSize && v.color === selectedColor
  ) ?? null;
  const maxQuantity = selectedVariant?.stock || 0;
  const isOutOfStock = maxQuantity === 0;
  const isWishlisted = wishlist.ids.has(producto.id);
  const tieneOferta = !!producto.precio_original && producto.precio_original > producto.precio;
  const descuento = tieneOferta ? Math.round((1 - producto.precio / producto.precio_original!) * 100) : 0;

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;
    track(producto.id, 'carrito');
    addToCart({
      producto_id: producto.id,
      variante_id: selectedVariant.id,
      nombre: producto.nombre,
      precio: producto.precio,
      talla: selectedSize,
      color: selectedColor,
      cantidad: quantity,
      stock_disponible: selectedVariant.stock,
      imagen_url: producto.imagen_url ?? undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const totalImagenes = producto.imagenes?.length ?? 0;
  const imagenes = producto.imagenes ?? [];
  const { sessionId } = useTracking();
  const ctaRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-amanda-white pt-16 pb-20 md:pb-0">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 md:py-6">

        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-[10px] tracking-widest uppercase text-amanda-gray">
          <Link href="/productos" className="hover:text-amanda-black transition-colors">Tienda</Link>
          <span>/</span>
          {producto.categoria && (
            <>
              <Link href={`/productos?categoria=${producto.categoria.slug}`} className="hover:text-amanda-black transition-colors">
                {producto.categoria.nombre}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-amanda-black">{producto.nombre}</span>
        </nav>

        {/* Grid: imagen izquierda, info derecha — misma altura */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 md:items-start">

          {/* Galería */}
          <div className="relative bg-stone-100 overflow-hidden w-full" style={{ aspectRatio: '3/4', maxHeight: '75vh' }}>

            {/* Imagen activa */}
            {totalImagenes > 0 ? (
              <Image
                src={imagenes[fotoActiva]?.url ?? imagenes[0].url}
                alt={producto.nombre}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : producto.imagen_url ? (
              <Image
                src={producto.imagen_url}
                alt={producto.nombre}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                <span className="text-stone-400 text-xs tracking-widest uppercase">{producto.nombre.slice(0, 2)}</span>
              </div>
            )}


            {/* Flechas */}
            {totalImagenes > 1 && (
              <>
                <button
                  onClick={() => setFotoActiva(i => (i - 1 + totalImagenes) % totalImagenes)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors z-10"
                  aria-label="Imagen anterior"
                >
                  <svg className="w-4 h-4 text-amanda-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setFotoActiva(i => (i + 1) % totalImagenes)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors z-10"
                  aria-label="Imagen siguiente"
                >
                  <svg className="w-4 h-4 text-amanda-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {imagenes.map((_, idx) => (
                    <button key={idx} onClick={() => setFotoActiva(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${fotoActiva === idx ? 'bg-white' : 'bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
              {tieneOferta && <span className="bg-rose-500 text-white text-[10px] tracking-widest uppercase px-2 py-1 leading-none">-{descuento}%</span>}
              {producto.es_nuevo && !tieneOferta && <span className="bg-amanda-black text-amanda-white text-[10px] tracking-widest uppercase px-2 py-1 leading-none">Nuevo</span>}
              {producto.pocas_unidades && <span className="bg-amber-500 text-white text-[10px] tracking-widest uppercase px-2 py-1 leading-none">Últimas</span>}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => { track(producto.id, 'wishlist'); wishlist.toggle(producto.id); }}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm z-10"
            >
              <svg className={`w-4 h-4 transition-colors ${isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-stone-400 fill-none'}`} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>

          {/* Info */}
          <div className="flex flex-col md:sticky md:top-20 md:self-start">
            <div className="mb-6">
              {producto.categoria && <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-2">{producto.categoria.nombre}</p>}
              <h1 className="font-serif text-2xl md:text-3xl tracking-wide text-amanda-black mb-3">{producto.nombre}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <p className={`text-xl ${tieneOferta ? 'text-rose-500 font-medium' : 'text-amanda-black'}`}>{formatPrice(producto.precio ?? 0)}</p>
                {tieneOferta && (
                  <>
                    <p className="text-base text-amanda-gray line-through">{formatPrice(producto.precio_original ?? 0)}</p>
                    <span className="text-xs tracking-widest uppercase bg-rose-500 text-white px-2 py-0.5">-{descuento}%</span>
                  </>
                )}
              </div>
            </div>

            {producto.descripcion && <p className="text-sm text-amanda-gray leading-relaxed mb-4">{producto.descripcion}</p>}

            {/* Atributos dinamicos de la variante seleccionada (catalogo generalizado) */}
            {selectedVariant && atributosPorVariante[selectedVariant.id]?.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-2">
                {atributosPorVariante[selectedVariant.id].map((a, i) => (
                  <div key={i} className="border-l-2 border-amanda-lightgray pl-3">
                    <p className="text-[10px] tracking-widest uppercase text-amanda-gray">{a.nombre}</p>
                    <p className="text-xs text-amanda-black mt-0.5">{a.valor}</p>
                  </div>
                ))}
              </div>
            )}

            {availableSizes.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-3">Talla <span className="text-amanda-black ml-1">{selectedSize}</span></p>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(size => {
                    const hasStock = producto.variantes.some(v => v.talla === size && v.color === selectedColor && v.stock > 0);
                    return (
                      <button key={size} onClick={() => setSelectedSize(size)} disabled={!hasStock}
                        className={`text-xs px-3 py-2 border transition-colors min-w-[42px] ${selectedSize === size ? 'border-amanda-black bg-amanda-black text-amanda-white' : hasStock ? 'border-amanda-lightgray text-amanda-black hover:border-amanda-black' : 'border-amanda-lightgray text-amanda-lightgray line-through cursor-not-allowed'}`}>
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {availableColors.length > 1 && (
              <div className="mb-4">
                <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-3">Color <span className="text-amanda-black ml-1">{selectedColor}</span></p>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(color => (
                    <button key={color} onClick={() => setSelectedColor(color)}
                      className={`text-xs px-3 py-2 border transition-colors ${selectedColor === color ? 'border-amanda-black bg-amanda-black text-amanda-white' : 'border-amanda-lightgray text-amanda-black hover:border-amanda-black'}`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-3">Cantidad</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}
                  className="w-8 h-8 border border-amanda-lightgray text-amanda-black hover:border-amanda-black disabled:opacity-30 transition-colors flex items-center justify-center text-lg">−</button>
                <span className="text-sm w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))} disabled={quantity >= maxQuantity}
                  className="w-8 h-8 border border-amanda-lightgray text-amanda-black hover:border-amanda-black disabled:opacity-30 transition-colors flex items-center justify-center text-lg">+</button>
                {selectedVariant && maxQuantity <= 3 && maxQuantity > 0 && (
                  <span className="text-[10px] tracking-widest uppercase text-amber-600">{maxQuantity} disponibles</span>
                )}
              </div>
            </div>

            <div ref={ctaRef} className="hidden md:block mt-4">
              {isOutOfStock ? (
                <div className="w-full py-4 text-center text-[10px] tracking-widest uppercase text-amanda-gray border border-amanda-lightgray">Sin stock</div>
              ) : (
                <button onClick={handleAddToCart}
                  className={`w-full py-4 text-[10px] tracking-widest uppercase transition-all ${added ? 'bg-stone-700 text-white' : 'bg-amanda-black text-amanda-white hover:bg-stone-800'}`}>
                  {added ? '✓ Agregado al carrito' : 'Agregar al carrito'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Recomendaciones basadas en este producto */}
        <div className="mt-6 border-t border-amanda-lightgray pt-6">
          <RecoShelf
            titulo="También te puede gustar"
            productoId={producto.id}
            sessionId={sessionId}
            limit={8}
          />
        </div>
      </div>

      {/* Barra fija mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-amanda-white border-t border-amanda-lightgray px-4 py-3">
        {isOutOfStock ? (
          <div className="w-full py-3.5 text-center text-[10px] tracking-widest uppercase text-amanda-gray border border-amanda-lightgray">Sin stock</div>
        ) : (
          <button onClick={handleAddToCart}
            className={`w-full py-3.5 text-[10px] tracking-widest uppercase transition-all ${added ? 'bg-stone-700 text-white' : 'bg-amanda-black text-amanda-white'}`}>
            {added ? '✓ Agregado al carrito' : 'Agregar al carrito'}
          </button>
        )}
      </div>
    </div>
  );
}
