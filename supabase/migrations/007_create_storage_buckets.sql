-- Migration: 007_create_storage_buckets.sql
-- Description: Crea buckets en Supabase Storage para imágenes
-- Date: 2026-03-27

-- Bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, public)
VALUES ('productos', 'productos', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para imágenes de portadas de lookbooks
INSERT INTO storage.buckets (id, name, public)
VALUES ('lookbooks', 'lookbooks', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para avatares de usuarios (privado)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatares', 'avatares', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage.objects

-- Anyone can view productos images
CREATE POLICY "Public productos images" ON storage.objects
  FOR SELECT USING (bucket_id = 'productos');

-- Anyone can view lookbooks images
CREATE POLICY "Public lookbooks images" ON storage.objects
  FOR SELECT USING (bucket_id = 'lookbooks');

-- Users can view/upload/delete their own avatares
CREATE POLICY "Private avatares - select" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatares' AND owner = auth.uid());

CREATE POLICY "Private avatares - insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatares' AND owner = auth.uid());

CREATE POLICY "Private avatares - delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatares' AND owner = auth.uid());

-- Admins can manage all storage
CREATE POLICY "Admins full access - productos" ON storage.objects
  FOR ALL USING (
    bucket_id = 'productos' AND
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins full access - lookbooks" ON storage.objects
  FOR ALL USING (
    bucket_id = 'lookbooks' AND
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );
