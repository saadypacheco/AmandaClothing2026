// Formateo de precios sensible al locale + moneda configurada en tienda_config.
// Se usa via useTiendaConfig: `const { formatPrice } = useTiendaConfig()`
// o directamente con `formatPriceWith(config, precio)` en lugares sin hook.

export interface MonedaConfig {
  locale: string;
  codigo: string;
  simbolo?: string;
}

export function getMonedaConfig(config: Record<string, string>): MonedaConfig {
  return {
    locale: config.moneda_locale || 'es-AR',
    codigo: config.moneda_codigo || 'ARS',
    simbolo: config.moneda_simbolo || '',
  };
}

export function formatPriceWith(config: Record<string, string>, precio: number | string): string {
  const n = typeof precio === 'string' ? parseFloat(precio) : precio;
  if (isNaN(n)) return '';

  const { locale, codigo, simbolo } = getMonedaConfig(config);

  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: codigo,
      maximumFractionDigits: 0,
    }).format(n);

    // Si hay simbolo custom, lo reemplazamos por el que devuelve Intl
    if (simbolo) {
      return formatted.replace(/[^\d.,\s-]/g, '').trim().replace(/^/, simbolo + ' ').trim();
    }
    return formatted;
  } catch {
    // Fallback si el locale/codigo son invalidos
    return `$${n.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
  }
}
