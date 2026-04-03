/**
 * Tests del componente ProductCard.
 */
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/producto/ProductCard';
import { Producto } from '@/types/producto';

// Mock next/image para evitar errores en tests
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, ...props }: any) => <img {...props} />,
}));

const productoBase: Producto = {
  id: 1,
  nombre: 'Vestido Lino',
  descripcion: 'Un vestido cómodo',
  precio: 15000,
  categoria_id: 1,
  activo: true,
  imagen_url: null,
  imagenes: [],
  stock_total: 10,
  pocas_unidades: false,
  variantes: [
    { id: 1, producto_id: 1, talla: 'M', color: 'Blanco', stock: 10, sku: 'VL-M-BL' },
  ],
};

describe('ProductCard', () => {
  it('muestra el nombre del producto', () => {
    render(<ProductCard producto={productoBase} />);
    expect(screen.getByText('Vestido Lino')).toBeInTheDocument();
  });

  it('muestra el precio formateado', () => {
    render(<ProductCard producto={productoBase} />);
    expect(screen.getByText(/15\.000|15,000/)).toBeInTheDocument();
  });

  it('muestra "Últimas unidades" cuando pocas_unidades es true', () => {
    render(<ProductCard producto={{ ...productoBase, pocas_unidades: true, stock_total: 2 }} />);
    expect(screen.getByText(/últimas/i)).toBeInTheDocument();
  });

  it('muestra placeholder con iniciales cuando no hay imagen', () => {
    render(<ProductCard producto={productoBase} />);
    // Sin imagen_url, muestra los primeros 2 chars del nombre: "Ve"
    expect(screen.getByText('Ve')).toBeInTheDocument();
  });

  it('muestra imagen cuando hay imagen_url', () => {
    const conImagen = { ...productoBase, imagen_url: 'https://example.com/foto.jpg' };
    render(<ProductCard producto={conImagen} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/foto.jpg');
  });
});
