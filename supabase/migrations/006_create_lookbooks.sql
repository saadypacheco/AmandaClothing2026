-- Migration: 006_create_lookbooks.sql
-- Description: Crea tabla para lookbooks (colecciones curadas)
-- Date: 2026-03-27

-- Tabla de lookbooks
CREATE TABLE lookbooks (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  portada_url TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos en lookbooks (muchos a muchos)
CREATE TABLE lookbook_productos (
  id SERIAL PRIMARY KEY,
  lookbook_id INTEGER NOT NULL REFERENCES lookbooks(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  posicion INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lookbook_id, producto_id)
);

-- Índices para lookbooks
CREATE INDEX idx_lookbooks_activo ON lookbooks(activo);
CREATE INDEX idx_lookbook_productos_lookbook ON lookbook_productos(lookbook_id);
CREATE INDEX idx_lookbook_productos_producto ON lookbook_productos(producto_id);

-- RLS: Enable on lookbooks
ALTER TABLE lookbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active lookbooks"
  ON lookbooks FOR SELECT
  USING (activo = TRUE);

CREATE POLICY "Admins can view all lookbooks"
  ON lookbooks FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Only admins can modify lookbooks"
  ON lookbooks FOR ALL
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

-- RLS: Enable on lookbook_productos
ALTER TABLE lookbook_productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lookbook_productos of active lookbooks"
  ON lookbook_productos FOR SELECT
  USING (
    lookbook_id IN (SELECT id FROM lookbooks WHERE activo = TRUE)
  );

CREATE POLICY "Admins can modify lookbook_productos"
  ON lookbook_productos FOR ALL
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );
