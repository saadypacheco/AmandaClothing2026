-- Migration: 008_add_imagen_url_to_productos.sql
-- Description: Agrega campo imagen_url a la tabla productos

ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagen_url TEXT;
