/**
 * Tests del Zustand cart store.
 * No necesitan DOM — prueban la lógica pura del carrito.
 */
import { act } from 'react';
import { useCartStore } from '@/store/cart';

// Limpiar el store antes de cada test
beforeEach(() => {
  useCartStore.setState({ items: [], total: 0, itemCount: 0, isOpen: false });
});

const itemBase = {
  producto_id: 1,
  variante_id: 10,
  nombre: 'Vestido Lino',
  precio: 15000,
  talla: 'M',
  color: 'Blanco',
  cantidad: 1,
  stock_disponible: 5,
};

describe('CartStore — addItem', () => {
  it('agrega un item nuevo al carrito', () => {
    act(() => useCartStore.getState().addItem(itemBase));

    const { items, total, itemCount } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].nombre).toBe('Vestido Lino');
    expect(total).toBe(15000);
    expect(itemCount).toBe(1);
  });

  it('incrementa cantidad si el mismo item ya existe', () => {
    act(() => useCartStore.getState().addItem(itemBase));
    act(() => useCartStore.getState().addItem(itemBase));

    const { items, itemCount } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].cantidad).toBe(2);
    expect(itemCount).toBe(2);
  });

  it('no supera el stock disponible', () => {
    act(() => useCartStore.getState().addItem({ ...itemBase, cantidad: 4 }));
    act(() => useCartStore.getState().addItem({ ...itemBase, cantidad: 3 })); // stock=5, ya hay 4

    const { items } = useCartStore.getState();
    expect(items[0].cantidad).toBe(5); // limitado al stock
  });

  it('trata variantes distintas como items distintos', () => {
    act(() => useCartStore.getState().addItem(itemBase));
    act(() => useCartStore.getState().addItem({ ...itemBase, variante_id: 99, talla: 'L' }));

    expect(useCartStore.getState().items).toHaveLength(2);
  });
});

describe('CartStore — removeItem', () => {
  it('elimina un item por id', () => {
    act(() => useCartStore.getState().addItem(itemBase));
    const id = useCartStore.getState().items[0].id;

    act(() => useCartStore.getState().removeItem(id));

    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().total).toBe(0);
  });
});

describe('CartStore — updateQuantity', () => {
  it('actualiza la cantidad de un item', () => {
    act(() => useCartStore.getState().addItem(itemBase));
    const id = useCartStore.getState().items[0].id;

    act(() => useCartStore.getState().updateQuantity(id, 3));

    expect(useCartStore.getState().items[0].cantidad).toBe(3);
    expect(useCartStore.getState().total).toBe(45000);
  });

  it('elimina el item si la cantidad es 0', () => {
    act(() => useCartStore.getState().addItem(itemBase));
    const id = useCartStore.getState().items[0].id;

    act(() => useCartStore.getState().updateQuantity(id, 0));

    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('CartStore — clearCart', () => {
  it('vacía el carrito completamente', () => {
    act(() => useCartStore.getState().addItem(itemBase));
    act(() => useCartStore.getState().addItem({ ...itemBase, variante_id: 20 }));

    act(() => useCartStore.getState().clearCart());

    const { items, total, itemCount } = useCartStore.getState();
    expect(items).toHaveLength(0);
    expect(total).toBe(0);
    expect(itemCount).toBe(0);
  });
});

describe('CartStore — totales', () => {
  it('calcula el total correcto con múltiples items', () => {
    act(() => useCartStore.getState().addItem({ ...itemBase, precio: 10000, cantidad: 2 }));
    act(() => useCartStore.getState().addItem({ ...itemBase, variante_id: 20, precio: 5000, cantidad: 1 }));

    const { total, itemCount } = useCartStore.getState();
    expect(total).toBe(25000); // 10000*2 + 5000*1
    expect(itemCount).toBe(3);
  });
});
