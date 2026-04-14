/**
 * Tests del hook useTracking.
 */

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

global.fetch = jest.fn().mockResolvedValue({ ok: true });

describe('useTracking module', () => {
  it('exports useTracking hook', () => {
    const mod = require('@/hooks/useTracking');
    expect(mod.useTracking).toBeDefined();
  });
});
