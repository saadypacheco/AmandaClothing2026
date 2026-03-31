import { useCartStore } from '@/store/cart';

export const useCart = () => {
  const store = useCartStore();

  const addToCart = (productData: {
    producto_id: number;
    variante_id: number;
    nombre: string;
    precio: number;
    talla: string;
    color: string;
    cantidad: number;
    stock_disponible: number;
    imagen_url?: string;
  }) => {
    store.addItem(productData);
    store.openCart(); // Open cart drawer when adding items
  };

  return {
    ...store,
    addToCart
  };
};