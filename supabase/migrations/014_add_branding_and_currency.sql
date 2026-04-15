-- Migration: 014_add_branding_and_currency.sql
-- Agrega claves de branding visual (colores, fuentes) y moneda a tienda_config
-- Permite que cada deploy tenga identidad visual + moneda propia sin tocar codigo

INSERT INTO tienda_config (clave, valor, tipo, grupo, descripcion) VALUES
  -- Branding: colores (hex sin #)
  ('color_primario', '#0a0a0a', 'color', 'branding', 'Color principal (texto, fondos oscuros, botones)'),
  ('color_fondo', '#fafafa', 'color', 'branding', 'Color de fondo general del sitio'),
  ('color_acento', '#c9a882', 'color', 'branding', 'Color de acento / marca (CTA, destacados)'),
  ('color_acento_claro', '#e8d5c0', 'color', 'branding', 'Variante clara del acento'),
  ('color_texto_suave', '#8a8a8a', 'color', 'branding', 'Color de texto secundario / gris'),
  ('color_gris_claro', '#f2f2f2', 'color', 'branding', 'Gris claro (bordes, fondos sutiles)'),

  -- Branding: tipografia
  ('fuente_titulo', 'Georgia, Cambria, Times New Roman, serif', 'texto', 'branding', 'Font stack para titulos (H1-H6)'),
  ('fuente_cuerpo', 'Helvetica Neue, Helvetica, Arial, sans-serif', 'texto', 'branding', 'Font stack para cuerpo de texto'),

  -- Moneda: locale + codigo ISO
  ('moneda_codigo', 'ARS', 'texto', 'moneda', 'Codigo ISO 4217 de la moneda (ARS, USD, EUR, MXN, CLP, PEN, UYU, BRL)'),
  ('moneda_locale', 'es-AR', 'texto', 'moneda', 'Locale para formateo de numero (es-AR, es-MX, en-US, pt-BR)'),
  ('moneda_simbolo', '$', 'texto', 'moneda', 'Simbolo a mostrar (vacio = usa el del locale)'),

  -- Onboarding: flag de completado
  ('onboarding_completado', 'false', 'booleano', 'sistema', 'Si el wizard de onboarding fue completado por el admin')
ON CONFLICT (clave) DO NOTHING;
