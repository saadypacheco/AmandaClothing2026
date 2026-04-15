// Server component: fetch config desde la API y devuelve un <style> con
// las CSS variables de branding. Se renderiza en layout.tsx (root) para
// que las variables esten disponibles globalmente antes de la primera pintura.
// Revalidate 300s para que cambios en admin se reflejen dentro de 5 min.

const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Defaults replican la identidad Amanda Clothing original
const DEFAULTS: Record<string, string> = {
  color_primario: '#0a0a0a',
  color_fondo: '#fafafa',
  color_acento: '#c9a882',
  color_acento_claro: '#e8d5c0',
  color_texto_suave: '#8a8a8a',
  color_gris_claro: '#f2f2f2',
  fuente_titulo: 'Georgia, Cambria, Times New Roman, serif',
  fuente_cuerpo: 'Helvetica Neue, Helvetica, Arial, sans-serif',
};

async function fetchConfig(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API}/config`, { next: { revalidate: 300 } });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

export async function BrandingStyles() {
  const cfg = await fetchConfig();
  const v = (k: string) => cfg[k] || DEFAULTS[k];

  const css = `:root {
  --color-primario: ${v('color_primario')};
  --color-fondo: ${v('color_fondo')};
  --color-acento: ${v('color_acento')};
  --color-acento-claro: ${v('color_acento_claro')};
  --color-texto-suave: ${v('color_texto_suave')};
  --color-gris-claro: ${v('color_gris_claro')};
  --font-titulo: ${v('fuente_titulo')};
  --font-cuerpo: ${v('fuente_cuerpo')};
}`;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
