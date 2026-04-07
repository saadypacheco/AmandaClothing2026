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
  const [fotoActiva, setFotoActiva] = useState(0);

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
      // Normalizar imagenes por si el backend devuelve null o undefined
      data.imagenes = Array.isArray(data.imagenes) ? data.imagenes : [];
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
          Ver tienda
        </Link>
      </div>
    </div>
  );

  const isWishlisted = wishlist.ids.has(producto.id);

  const tieneOferta = !!producto.precio_original && producto.precio_original > producto.precio;
  const descuento = tieneOferta ? Math.round((1 - producto.precio / producto.precio_original!) * 100) : 0;

  return (
    <div className="min-h-screen bg-amanda-white pt-16 pb-28 md:pb-0">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 md:py-12">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-[10px] tracking-widest uppercase text-amanda-gray">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">

          {/* Galería de imágenes */}
          <div className="flex flex-col gap-3">
            {/* Imagen principal */}
            <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
              {producto.imagenes?.length > 0 ? (
                <Image
                  src={producto.imagenes[fotoActiva]?.url ?? producto.imagenes[0].url}
                  alt={producto.nombre}
                  fill
                  className="object-cover object-top transition-opacity duration-200"
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

              <div className="absolute top-4 left-4 flex flex-col gap-1">
                {tieneOferta && (
                  <span className="bg-rose-500 text-white text-[10px] tracking-widest uppercase px-2 py-1 leading-none">
                    -{descuento}%
                  </span>
                )}
                {producto.es_nuevo && !tieneOferta && (
                  <span className="bg-amanda-black text-amanda-white text-[10px] tracking-widest uppercase px-2 py-1 leading-none">
                    Nuevo
                  </span>
                )}
                {producto.pocas_unidades && (
                  <span className="bg-amber-500 text-white text-[10px] tracking-widest uppercase px-2 py-1 leading-none">
                    Últimas
                  </span>
                )}
              </div>

              <button
                onClick={() => { track(producto.id, 'wishlist'); wishlist.toggle(producto.id); }}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm"
              >
                <svg className={`w-4 h-4 transition-colors ${isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-stone-400 fill-none'}`} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>

            {/* Miniaturas — solo si hay más de 1 imagen */}
            {producto.imagenes?.length > 1 && (
              <div className="flex gap-2">
                {producto.imagenes.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setFotoActiva(idx)}
                    className={`relative w-16 h-20 shrink-0 overflow-hidden border-2 transition-colors ${
                      fotoActiva === idx ? 'border-amanda-black' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`${producto.nombre} foto ${idx + 1}`}
                      fill
                      className="object-cover object-top"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col md:sticky md:top-20 md:self-start">
            <div className="mb-6">
              {producto.categoria && (
                <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-2">{producto.categoria.nombre}</p>
              )}
              <h1 className="font-serif text-2xl md:text-3xl tracking-wide text-amanda-black mb-3">
                {producto.nombre}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <p className={`text-xl ${tieneOferta ? 'text-rose-500 font-medium' : 'text-amanda-black'}`}>
                  ${producto.precio.toLocaleString('es-AR')}
                </p>
                {tieneOferta && (
                  <>
                    <p className="text-base text-amanda-gray line-through">${producto.precio_original!.toLocaleString('es-AR')}</p>
                    <span className="text-xs tracking-widest uppercase bg-rose-500 text-white px-2 py-0.5">-{descuento}%</span>
                  </>
                )}
              </div>
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

            {/* CTA — visible en desktop, oculto en mobile (usa barra fija abajo) */}
            <div className="hidden md:block mt-6 space-y-3">
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

              {/* WhatsApp contextual */}
              <a
                href={`https://wa.me/5491133821989?text=${encodeURIComponent(`Hola Amanda! Me interesa este producto: *${producto.nombre}*\nhttps://amandaclothing.vercel.app/productos/${producto.id}\n\n¿Podés darme más info?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 border border-[#25D366] text-[#25D366] text-[10px] tracking-widest uppercase py-3.5 hover:bg-[#25D366] hover:text-white transition-colors duration-200"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Consultar por WhatsApp
              </a>
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

      {/* Barra fija mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-amanda-white border-t border-amanda-lightgray px-4 py-3 flex gap-3">
        {isOutOfStock ? (
          <div className="flex-1 py-3.5 text-center text-[10px] tracking-widest uppercase text-amanda-gray border border-amanda-lightgray">
            Sin stock
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-3.5 text-[10px] tracking-widest uppercase transition-all ${
              added ? 'bg-stone-700 text-white' : 'bg-amanda-black text-amanda-white'
            }`}
          >
            {added ? '✓ Agregado' : 'Agregar al carrito'}
          </button>
        )}
        <a
          href={`https://wa.me/5491133821989?text=${encodeURIComponent(`Hola Amanda! Me interesa: *${producto.nombre}*`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
