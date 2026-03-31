-- Migration: 003_create_wishlist_and_consultas.sql
-- Description: Crea tablas para wishlist y consultas de productos
-- Date: 2026-03-27

-- Tabla de wishlist
CREATE TABLE wishlist (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, producto_id)
);

-- Índices para wishlist
CREATE INDEX idx_wishlist_usuario ON wishlist(usuario_id);
CREATE INDEX idx_wishlist_producto ON wishlist(producto_id);

-- Tabla de consultas (preguntas públicas por producto)
CREATE TABLE consultas (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  nombre_anonimo TEXT,
  pregunta TEXT NOT NULL,
  respuesta TEXT,
  publico BOOLEAN DEFAULT TRUE,
  respondida_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  respondida_en TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas
CREATE INDEX idx_consultas_producto ON consultas(producto_id);
CREATE INDEX idx_consultas_usuario ON consultas(usuario_id);
CREATE INDEX idx_consultas_publico ON consultas(publico);

-- RLS: Enable on wishlist
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist"
  ON wishlist FOR SELECT
  USING (usuario_id = auth.uid());

CREATE POLICY "Users can insert to their wishlist"
  ON wishlist FOR INSERT
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Users can delete from their wishlist"
  ON wishlist FOR DELETE
  USING (usuario_id = auth.uid());

-- RLS: Enable on consultas
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public consultas"
  ON consultas FOR SELECT
  USING (publico = TRUE);

CREATE POLICY "Users can view their own consultas"
  ON consultas FOR SELECT
  USING (usuario_id = auth.uid() OR respondida_por = auth.uid());

CREATE POLICY "Anyone can insert consultas"
  ON consultas FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can update consultas"
  ON consultas FOR UPDATE
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );
