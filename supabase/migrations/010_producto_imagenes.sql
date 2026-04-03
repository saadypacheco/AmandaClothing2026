-- Migration: 010_producto_imagenes.sql
-- Description: Tabla de múltiples imágenes por producto (máx 4)
-- Date: 2026-04-02

CREATE TABLE producto_imagenes (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  orden SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_producto_imagenes_producto ON producto_imagenes(producto_id, orden);

-- RLS
ALTER TABLE producto_imagenes ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver imágenes de productos activos
CREATE POLICY "Public read producto_imagenes"
  ON producto_imagenes FOR SELECT
  USING (true);

-- Solo admins pueden insertar/borrar (el backend usa service_role → bypasea RLS igual)
CREATE POLICY "Admins manage producto_imagenes"
  ON producto_imagenes FOR ALL
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );
