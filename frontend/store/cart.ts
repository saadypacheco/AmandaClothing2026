import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartStore, CartItem } from '@/types/cart';

const CART_STORAGE_KEY = 'boutique-cart';

const calculateTotals = (items: CartItem[]) => {
  const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);
  return { total, itemCount };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // State
      items: [],
      total: 0,
      itemCount: 0,
      isOpen: false,

      // Actions
      addItem: (newItem) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          item => item.producto_id === newItem.producto_id &&
                  item.variante_id === newItem.variante_id
        );

        let updatedItems: CartItem[];

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          updatedItems = [...items];
          const existingItem = updatedItems[existingItemIndex];
          const newQuantity = Math.min(
            existingItem.cantidad + newItem.cantidad,
            existingItem.stock_disponible
          );

          if (newQuantity > existingItem.cantidad) {
            updatedItems[existingItemIndex] = {
              ...existingItem,
              cantidad: newQuantity
            };
          }
        } else {
          // Add new item
          const cartItem: CartItem = {
            ...newItem,
            id: `${newItem.producto_id}-${newItem.variante_id}-${Date.now()}`
          };
          updatedItems = [...items, cartItem];
        }

        const { total, itemCount } = calculateTotals(updatedItems);
        set({ items: updatedItems, total, itemCount });
      },

      removeItem: (itemId) => {
        const { items } = get();
        const updatedItems = items.filter(item => item.id !== itemId);
        const { total, itemCount } = calculateTotals(updatedItems);
        set({ items: updatedItems, total, itemCount });
      },

      updateQuantity: (itemId, quantity) => {
        const { items } = get();

        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const updatedItems = items.map(item => {
          if (item.id === itemId) {
            const newQuantity = Math.min(quantity, item.stock_disponible);
            return { ...item, cantidad: newQuantity };
          }
          return item;
        });

        const { total, itemCount } = calculateTotals(updatedItems);
        set({ items: updatedItems, total, itemCount });
      },

      clearCart: () => {
        set({ items: [], total: 0, itemCount: 0 });
      },

      restoreItems: (items) => {
        const { total, itemCount } = calculateTotals(items);
        set({ items, total, itemCount });
      },

      toggleCart: () => {
        set(state => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      syncWithStorage: () => {
        // This is handled automatically by persist middleware
        // but we can add custom logic here if needed
      },

      syncWithSupabase: async () => {
        // TODO: Implement sync with Supabase for logged-in users
        // This will load cart items from database and merge with local storage
        try {
          // const user = getCurrentUser();
          // if (user) {
          //   const dbCart = await fetchUserCart(user.id);
          //   // Merge logic here
          // }
        } catch (error) {
          console.error('Error syncing cart with Supabase:', error);
        }
      }
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount
      })
    }
  )
);

// Helper functions
export const getCartItemCount = () => useCartStore.getState().itemCount;
export const getCartTotal = () => useCartStore.getState().total;
export const getCartItems = () => useCartStore.getState().items;