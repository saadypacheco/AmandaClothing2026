'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Producto } from '@/types/producto';
import { useCart } from '@/hooks/useCart';
import { useTracking } from '@/hooks/useTracking';
import { useWishlist } from '@/hooks/useWishlist';
import { RecoShelf } from '@/components/recomendaciones/RecoShelf';
import { ProductoChat } from '@/components/chat/ProductoChat';

export default function ProductoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { track, sessionId } = useTracking();
  const wishlist = useWishlist();
  const productId = params.slug as string;

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);

  const fetchProducto = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${productId}`);
      if (!response.ok) throw new Error(response.status === 404 ? 'Producto no encontrado' : 'Error al cargar el producto');
      const data: Producto = await response.json();
      setProducto(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) fetchProducto();
  }, [productId, fetchProducto]);

  useEffect(() => {
    if (producto) {
      const sizes = [...new Set(producto.variantes.map(v => v.talla))].filter(Boolean);
      const colors = [...new Set(producto.variantes.map(v => v.color))].filter(Boolean);
      setAvailableSizes(sizes);
      setAvailableColors(colors);
      if (sizes.length > 0) setSelectedSize(sizes[0]);
      if (colors.length > 0) setSelectedColor(colors[0]);
    }
  }, [producto]);

  useEffect(() => {
    if (producto) track(producto.id, 'vista');
  }, [producto?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedVariant = producto?.variantes.find(v =>
    v.talla === selectedSize && v.color === selectedColor
  ) ?? null;
  const maxQuantity = selectedVariant?.stock || 0;
  const isOutOfStock = maxQuantity === 0;

  const handleAddToCart = () => {
    if (!producto || !selectedVariant || isOutOfStock) return;
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <p className="text-xs tracking-widest uppercase text-amanda-gray animate-pulse">Cargando producto...</p>
    </div>
  );

  if (error || !producto) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="text-center">
        <p className="text-xs tracking-widest uppercase text-amanda-gray mb-6">{error || 'Producto no encontrado'}</p>
        <Link href="/productos" className="text-[10px] tracking-widest uppercase text-amanda-black border-b border-amanda-black pb-0.5">
          Ver colección
        </Link>
      </div>
    </div>
  );

  const isWishlisted = wishlist.ids.has(producto.id);

  return (
    <div className="min-h-screen bg-amanda-white pt-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 md:py-12">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-[10px] tracking-widest uppercase text-amanda-gray">
          <Link href="/productos" className="hover:text-amanda-black transition-colors">Colección</Link>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">

          {/* Imagen */}
          <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
            {producto.imagen_url ? (
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

            {producto.pocas_unidades && (
              <div className="absolute top-4 left-4 bg-amanda-black text-amanda-white text-[10px] tracking-widest uppercase px-3 py-1">
                Últimas unidades
              </div>
            )}

            {/* Botón wishlist */}
            <button
              onClick={() => { track(producto.id, 'wishlist'); wishlist.toggle(producto.id); }}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm"
            >
              <svg className={`w-4 h-4 transition-colors ${isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-stone-400 fill-none'}`} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              {producto.categoria && (
                <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-2">{producto.categoria.nombre}</p>
              )}
              <h1 className="font-serif text-2xl md:text-3xl tracking-wide text-amanda-black mb-3">
                {producto.nombre}
              </h1>
              <p className="text-xl text-amanda-black">${producto.precio.toLocaleString('es-AR')}</p>
            </div>

            {producto.descripcion && (
              <p className="text-sm text-amanda-gray leading-relaxed mb-8">{producto.descripcion}</p>
            )}

            {/* Talla */}
            {availableSizes.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-3">
                  Talla <span className="text-amanda-black ml-1">{selectedSize}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(size => {
                    const hasStock = producto.variantes.some(v => v.talla === size && v.color === selectedColor && v.stock > 0);
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={!hasStock}
                        className={`text-xs px-3 py-2 border transition-colors min-w-[42px] ${
                          selectedSize === size
                            ? 'border-amanda-black bg-amanda-black text-amanda-white'
                            : hasStock
                              ? 'border-amanda-lightgray text-amanda-black hover:border-amanda-black'
                              : 'border-amanda-lightgray text-amanda-lightgray line-through cursor-not-allowed'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color */}
            {availableColors.length > 1 && (
              <div className="mb-6">
                <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-3">
                  Color <span className="text-amanda-black ml-1">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`text-xs px-3 py-2 border transition-colors ${
                        selectedColor === color
                          ? 'border-amanda-black bg-amanda-black text-amanda-white'
                          : 'border-amanda-lightgray text-amanda-black hover:border-amanda-black'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cantidad */}
            <div className="mb-6">
              <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-3">Cantidad</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 border border-amanda-lightgray text-amanda-black hover:border-amanda-black disabled:opacity-30 transition-colors flex items-center justify-center text-lg"
                >
                  −
                </button>
                <span className="text-sm w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))}
                  disabled={quantity >= maxQuantity}
                  className="w-8 h-8 border border-amanda-lightgray text-amanda-black hover:border-amanda-black disabled:opacity-30 transition-colors flex items-center justify-center text-lg"
                >
                  +
                </button>
                {selectedVariant && maxQuantity <= 3 && maxQuantity > 0 && (
                  <span className="text-[10px] tracking-widest uppercase text-amber-600">{maxQuantity} disponibles</span>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-auto space-y-3">
              {isOutOfStock ? (
                <div className="w-full py-4 text-center text-[10px] tracking-widest uppercase text-amanda-gray border border-amanda-lightgray">
                  Sin stock
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-4 text-[10px] tracking-widest uppercase transition-all ${
                    added
                      ? 'bg-stone-700 text-white'
                      : 'bg-amanda-black text-amanda-white hover:bg-stone-800'
                  }`}
                >
                  {added ? '✓ Agregado al carrito' : 'Agregar al carrito'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="mt-16 md:mt-24">
          <RecoShelf productoId={producto.id} sessionId={sessionId} />
        </div>

        {/* Chat */}
        <div className="mt-12 max-w-2xl">
          <ProductoChat productoId={producto.id} productoNombre={producto.nombre} />
        </div>
      </div>
    </div>
  );
}
