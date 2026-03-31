-- Migration: 005_create_eventos_and_recomendaciones.sql
-- Description: Crea tablas para tracking de eventos y motor de recomendaciones
-- Date: 2026-03-27

-- Tabla de eventos de usuario (comportamiento)
CREATE TABLE eventos_usuario (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  tipo_evento TEXT NOT NULL CHECK (tipo_evento IN ('vista', 'wishlist', 'carrito', 'compra')),
  peso INTEGER NOT NULL DEFAULT 1,
  duracion_segundos INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para eventos
CREATE INDEX idx_eventos_session ON eventos_usuario(session_id);
CREATE INDEX idx_eventos_usuario ON eventos_usuario(usuario_id);
CREATE INDEX idx_eventos_producto ON eventos_usuario(producto_id);
CREATE INDEX idx_eventos_tipo ON eventos_usuario(tipo_evento);
CREATE INDEX idx_eventos_created ON eventos_usuario(created_at DESC);

-- Tabla de perfil de intereses (pre-calculado)
CREATE TABLE perfil_intereses (
  id SERIAL PRIMARY KEY,
  session_id UUID,
  usuario_id UUID UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  categorias_ids INTEGER[],
  precio_min DECIMAL(10, 2),
  precio_max DECIMAL(10, 2),
  tallas_interes TEXT[],
  colores_interes TEXT[],
  score_total INTEGER DEFAULT 0,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK ((session_id IS NOT NULL) OR (usuario_id IS NOT NULL))
);

-- Índices para perfil
CREATE INDEX idx_perfil_session ON perfil_intereses(session_id);
CREATE INDEX idx_perfil_usuario ON perfil_intereses(usuario_id);

-- Tabla de similitud de productos (pre-calculada por cron)
CREATE TABLE producto_similares (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  similar_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  tipo_similitud TEXT NOT NULL CHECK (tipo_similitud IN ('colaborativo', 'complementario')),
  score DECIMAL(5, 3) DEFAULT 0.5,
  calculado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(producto_id, similar_id, tipo_similitud)
);

-- Índices para similitud
CREATE INDEX idx_similares_producto ON producto_similares(producto_id);
CREATE INDEX idx_similares_tipo ON producto_similares(tipo_similitud);

-- RLS: Disable RLS on eventos_usuario (backend writes)
-- Backend registra eventos silenciosamente sin bloquear UI

-- RLS: Enable on perfil_intereses
ALTER TABLE perfil_intereses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own perfil"
  ON perfil_intereses FOR SELECT
  USING (usuario_id = auth.uid());

-- RLS: Enable on producto_similares
ALTER TABLE producto_similares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view producto_similares"
  ON producto_similares FOR SELECT
  USING (TRUE);
