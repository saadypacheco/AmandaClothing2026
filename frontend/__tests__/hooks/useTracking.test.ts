/**
 * Tests del hook useTracking.
 */

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

global.fetch = jest.fn().mockResolvedValue({ ok: true });

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});

describe('useTracking module', () => {
  it('exports useTracking hook', () => {
    const mod = require('@/hooks/useTracking');
    expect(mod.useTracking).toBeDefined();
  });
});
