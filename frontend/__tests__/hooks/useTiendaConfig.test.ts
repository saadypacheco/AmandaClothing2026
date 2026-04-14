/**
 * Tests del hook useTiendaConfig.
 */

// Mock fetch globalmente
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});

describe('useTiendaConfig — invalidateConfigCache', () => {
  it('elimina el cache de localStorage', () => {
    const { invalidateConfigCache } = require('@/hooks/useTiendaConfig');
    localStorageMock.setItem('tienda_config', JSON.stringify({ data: {}, timestamp: Date.now() }));
    invalidateConfigCache();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('tienda_config');
  });
});

describe('useTiendaConfig — cache', () => {
  it('usa cache si no expiró', () => {
    const cached = { data: { nombre_tienda: 'Cached Store' }, timestamp: Date.now() };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(cached));

    // Import should use cache
    const mod = require('@/hooks/useTiendaConfig');
    expect(localStorageMock.getItem).toHaveBeenCalled();
  });
});
