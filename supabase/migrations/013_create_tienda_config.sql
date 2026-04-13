-- Migration: 013_create_tienda_config.sql
-- Tabla central de configuración de la tienda (white-label)
-- Permite configurar nombre, contacto, textos, pagos, IA sin tocar código

CREATE TABLE tienda_config (
  id SERIAL PRIMARY KEY,
  clave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL DEFAULT '',
  tipo TEXT NOT NULL DEFAULT 'texto',
  grupo TEXT NOT NULL DEFAULT 'general',
  descripcion TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tienda_config_clave ON tienda_config(clave);
CREATE INDEX idx_tienda_config_grupo ON tienda_config(grupo);

ALTER TABLE tienda_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tienda_config"
  ON tienda_config FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admins can modify tienda_config"
  ON tienda_config FOR ALL
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

-- Seed: valores iniciales de Amanda Clothing
INSERT INTO tienda_config (clave, valor, tipo, grupo, descripcion) VALUES
  -- Marca
  ('nombre_tienda', 'Amanda Clothing', 'texto', 'marca', 'Nombre completo de la tienda'),
  ('nombre_corto', 'Amanda', 'texto', 'marca', 'Nombre corto (sidebar, chat)'),
  ('descripcion', 'Moda con identidad. Conectá directamente con la vendedora.', 'texto', 'marca', 'Descripción SEO de la tienda'),
  ('logo_url', '', 'texto', 'marca', 'URL del logo (vacío = usa nombre como texto)'),

  -- Contacto
  ('whatsapp_numero', '5491133821989', 'texto', 'contacto', 'Número de WhatsApp sin + (ej: 5491133821989)'),
  ('email', '', 'texto', 'contacto', 'Email de contacto'),
  ('horario', '{"dias":[1,2,3,4,5,6],"desde":9,"hasta":21,"zona":"America/Argentina/Buenos_Aires"}', 'json', 'contacto', 'Horario de atención en formato JSON'),

  -- Home
  ('hero_titulo', 'Amanda Clothing', 'texto', 'home', 'Título grande del hero en la home'),
  ('hero_subtitulo', 'nueva colección', 'texto', 'home', 'Subtítulo debajo del hero'),
  ('hero_imagen', '/hero.jpg', 'texto', 'home', 'URL de la imagen del hero'),
  ('hero_cta_texto', 'Entrá', 'texto', 'home', 'Texto del botón principal del hero'),
  ('statement_1', 'Ropa que habla por vos.', 'texto', 'home', 'Primera línea del statement'),
  ('statement_2', 'Diseñada para quedarse.', 'texto', 'home', 'Segunda línea del statement (color nude)'),
  ('seccion_ia_subtitulo', 'Tecnología al servicio de tu estilo', 'texto', 'home', 'Subtítulo sección IA'),
  ('seccion_ia_titulo', 'Consultá con asistente IA 24/7', 'texto', 'home', 'Título sección IA'),
  ('seccion_ia_descripcion', 'Respondemos tus dudas al instante, cualquier día, a cualquier hora. Talles, colores, envíos, cambios — sin esperas.', 'texto', 'home', 'Descripción sección IA'),
  ('seccion_ia_cta', 'Chatear con Amanda', 'texto', 'home', 'Texto del botón del chat IA'),

  -- Pago
  ('alias_bancario', 'AMANDA.CLOTHING', 'texto', 'pago', 'Alias de cuenta bancaria para transferencias'),
  ('metodos_pago', '["mercadopago","transferencia","whatsapp"]', 'json', 'pago', 'Métodos de pago habilitados'),

  -- IA
  ('ia_system_prompt', 'Sos Amanda, la asistente virtual de Amanda Clothing, una boutique de moda argentina.', 'texto', 'ia', 'Introducción del system prompt del agente IA'),

  -- Sitio
  ('sitio_url', 'https://amandaclothing.vercel.app', 'texto', 'sitio', 'URL pública del sitio'),
  ('footer_texto', '© 2026 Amanda Clothing', 'texto', 'sitio', 'Texto del footer');
