/**
 * Tests del componente Navbar.
 */
import { render, screen } from '@testing-library/react';

// Mock next modules
jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/productos'),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

jest.mock('@/store/cart', () => ({
  useCartStore: jest.fn((selector) => {
    const state = { itemCount: 0, openCart: jest.fn(), items: [] };
    return selector ? selector(state) : state;
  }),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue({ data: null })
          })
        })
      })
    }),
  }),
}));

jest.mock('@/hooks/useTiendaConfig', () => ({
  useTiendaConfig: () => ({
    get: (key: string, fallback: string) => {
      const config: Record<string, string> = { nombre_tienda: 'Test Store', nombre_corto: 'Test' };
      return config[key] || fallback;
    },
    loading: false,
    config: {},
    getJSON: jest.fn(),
    refresh: jest.fn(),
  }),
}));

global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve([
    { id: 1, nombre: 'Vestidos', slug: 'vestidos' },
    { id: 2, nombre: 'Pantalones', slug: 'pantalones' },
  ]),
});

describe('Navbar', () => {
  it('muestra nombre dinámico de la tienda', async () => {
    const { Navbar } = require('@/components/layout/Navbar');
    render(<Navbar />);
    expect(screen.getByText('Test Store')).toBeInTheDocument();
  });

  it('no se renderiza en /software', () => {
    const { usePathname } = require('next/navigation');
    usePathname.mockReturnValue('/software');

    const { Navbar } = require('@/components/layout/Navbar');
    const { container } = render(<Navbar />);
    expect(container.innerHTML).toBe('');
  });
});
