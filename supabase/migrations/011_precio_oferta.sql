-- Migration: 011_precio_oferta.sql
-- Description: Agrega campos de oferta a productos
-- Date: 2026-04-02

ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS precio_original DECIMAL(10,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS es_nuevo BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS oferta_hasta TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- índice para filtrar ofertas activas rápido
CREATE INDEX idx_productos_oferta ON productos(precio_original) WHERE precio_original IS NOT NULL;
