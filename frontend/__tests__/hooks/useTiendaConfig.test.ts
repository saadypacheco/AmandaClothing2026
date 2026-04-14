/**
 * Tests del hook useTiendaConfig.
 */

describe('useTiendaConfig — invalidateConfigCache', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('elimina el cache de localStorage', () => {
    const spy = jest.spyOn(Storage.prototype, 'removeItem');
    const { invalidateConfigCache } = require('@/hooks/useTiendaConfig');
    invalidateConfigCache();
    expect(spy).toHaveBeenCalledWith('tienda_config');
    spy.mockRestore();
  });
});
