/**
 * Tests de RecoShelf y OfertasShelf.
 */
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, ...props }: any) => <img {...props} />,
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('RecoShelf', () => {
  it('no renderiza si no hay recomendaciones', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const { RecoShelf } = require('@/components/recomendaciones/RecoShelf');
    const { container } = render(<RecoShelf titulo="Test" limit={4} />);

    await waitFor(() => {
      expect(container.querySelector('section')).toBeNull();
    });
  });

  it('renderiza productos cuando hay datos', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        { id: 1, nombre: 'Vestido', precio: 15000, imagen_url: null, pocas_unidades: false },
      ]),
    });

    const { RecoShelf } = require('@/components/recomendaciones/RecoShelf');
    render(<RecoShelf titulo="También te puede gustar" limit={4} />);

    await waitFor(() => {
      expect(screen.getByText('Vestido')).toBeInTheDocument();
    });
  });
});

describe('OfertasShelf', () => {
  it('no renderiza si no hay ofertas', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const { OfertasShelf } = require('@/components/recomendaciones/OfertasShelf');
    const { container } = render(<OfertasShelf />);

    await waitFor(() => {
      expect(container.querySelector('section')).toBeNull();
    });
  });
});
