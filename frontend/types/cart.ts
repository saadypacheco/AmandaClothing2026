// Cart types
export interface CartItem {
  id: string; // Unique identifier for cart item
  producto_id: number;
  variante_id: number;
  nombre: string;
  precio: number;
  talla: string;
  color: string;
  cantidad: number;
  imagen_url?: string;
  stock_disponible: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isOpen: boolean;
}

export interface CartActions {
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  syncWithStorage: () => void;
  syncWithSupabase: () => Promise<void>;
}

export type CartStore = CartState & CartActions;