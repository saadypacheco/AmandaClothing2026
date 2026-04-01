'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Producto } from '@/types/producto';
import { ProductGallery } from '@/components/producto/ProductGallery';
import { SizeSelector } from '@/components/producto/SizeSelector';
import { ColorSelector } from '@/components/producto/ColorSelector';
import { useCart } from '@/hooks/useCart';
import { ProductoChat } from '@/components/chat/ProductoChat';

export default function ProductoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const productId = params.slug as string;

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection states
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  // Available options
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);

  const fetchProducto = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${productId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Producto no encontrado');
        }
        throw new Error('Error al cargar el producto');
      }

      const data: Producto = await response.json();
      setProducto(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchProducto();
    }
  }, [productId, fetchProducto]);

  useEffect(() => {
    if (producto) {
      const sizes = [...new Set(producto.variantes.map(v => v.talla))].filter(Boolean);
      const colors = [...new Set(producto.variantes.map(v => v.color))].filter(Boolean);
      setAvailableSizes(sizes);
      setAvailableColors(colors);
      if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0]);
      if (colors.length > 0 && !selectedColor) setSelectedColor(colors[0]);
    }
  }, [producto]);

  const getSelectedVariant = () => {
    if (!producto) return null;
    return producto.variantes.find(v =>
      v.talla === selectedSize && v.color === selectedColor
    );
  };

  const selectedVariant = getSelectedVariant();
  const maxQuantity = selectedVariant?.stock || 0;
  const isOutOfStock = maxQuantity === 0;

  const addToCartHandler = () => {
    if (!producto || !selectedVariant || isOutOfStock) return;

    addToCart({
      producto_id: producto.id,
      variante_id: selectedVariant.id,
      nombre: producto.nombre,
      precio: producto.precio,
      talla: selectedSize,
      color: selectedColor,
      cantidad: quantity,
      stock_disponible: selectedVariant.stock,
      imagen_url: undefined // TODO: Add image URL when available
    });
  };

  const addToWishlistHandler = () => {
    // TODO: Implement wishlist functionality
    alert(`Agregado a wishlist: ${producto?.nombre}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando producto...</div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Producto no encontrado'}
          </h1>
          <button
            onClick={() => router.push('/productos')}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  // Placeholder images (TODO: integrate with Supabase Storage)
  const productImages = Array.from({ length: 4 }, (_, i) => `image-${i + 1}`);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image gallery */}
          <div className="w-full">
            <ProductGallery images={productImages} alt={producto.nombre} />
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {producto.nombre}
            </h1>

            {producto.categoria && (
              <p className="text-sm text-gray-500 mt-2">
                Categoría: {producto.categoria.nombre}
              </p>
            )}

            <div className="mt-3">
              <h2 className="sr-only">Información del producto</h2>
              <p className="text-3xl tracking-tight text-gray-900">
                ${producto.precio.toLocaleString('es-AR')}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Descripción</h3>
              <div className="text-base text-gray-700 space-y-6">
                <p>{producto.descripcion}</p>
              </div>
            </div>

            <div className="mt-8">
              {/* Size selector */}
              {availableSizes.length > 0 && (
                <div className="mb-6">
                  <SizeSelector
                    sizes={availableSizes}
                    selectedSize={selectedSize}
                    onSizeChange={setSelectedSize}
                  />
                </div>
              )}

              {/* Color selector */}
              {availableColors.length > 0 && (
                <div className="mb-6">
                  <ColorSelector
                    colors={availableColors}
                    selectedColor={selectedColor}
                    onColorChange={setSelectedColor}
                  />
                </div>
              )}

              {/* Quantity selector */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Cantidad</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={quantity >= maxQuantity}
                  >
                    +
                  </button>
                </div>
                {selectedVariant && (
                  <p className="text-sm text-gray-600 mt-2">
                    {maxQuantity} unidades disponibles
                  </p>
                )}
              </div>

              {/* Stock status */}
              <div className="mb-6">
                {isOutOfStock ? (
                  <p className="text-red-600 font-medium">Agotado</p>
                ) : producto.pocas_unidades ? (
                  <p className="text-orange-600 font-medium">¡Pocas unidades disponibles!</p>
                ) : (
                  <p className="text-green-600 font-medium">En stock</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={addToCartHandler}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3 px-8 rounded-lg font-medium ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-pink-600 text-white hover:bg-pink-700'
                  }`}
                >
                  {isOutOfStock ? 'Agotado' : 'Agregar al carrito'}
                </button>

                <button
                  onClick={addToWishlistHandler}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Additional info */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Stock total</h3>
                  <p className="text-sm text-gray-600">{producto.stock_total} unidades</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Categoría</h3>
                  <p className="text-sm text-gray-600">
                    {producto.categoria?.nombre || 'Sin categoría'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat por producto */}
        <div className="max-w-2xl mx-auto px-4 sm:px-0">
          <ProductoChat productoId={producto.id} productoNombre={producto.nombre} />
        </div>
      </div>
    </div>
  );
}