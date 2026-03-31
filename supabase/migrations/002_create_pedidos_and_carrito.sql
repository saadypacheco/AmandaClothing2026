-- Migration: 002_create_pedidos_and_carrito.sql
-- Description: Crea tablas para pedidos, items de pedido y carrito
-- Date: 2026-03-27

-- Tabla de pedidos
CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado')),
  total DECIMAL(10, 2) NOT NULL,
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para pedidos
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_created ON pedidos(created_at DESC);

-- Tabla de items en pedidos
CREATE TABLE items_pedido (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  variante_id INTEGER NOT NULL REFERENCES variantes(id) ON DELETE RESTRICT,
  cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  precio_unitario DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para items de pedidos
CREATE INDEX idx_items_pedido_pedido ON items_pedido(pedido_id);
CREATE INDEX idx_items_pedido_variante ON items_pedido(variante_id);

-- Tabla de carrito (sesión persistente)
CREATE TABLE carritos (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  variante_id INTEGER NOT NULL REFERENCES variantes(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, variante_id)
);

-- Índices para carrito
CREATE INDEX idx_carritos_usuario ON carritos(usuario_id);

-- RLS: Enable on pedidos
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pedidos"
  ON pedidos FOR SELECT
  USING (usuario_id = auth.uid());

CREATE POLICY "Users can insert their own pedidos"
  ON pedidos FOR INSERT
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Admins can view all pedidos"
  ON pedidos FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Only admins can update pedidos"
  ON pedidos FOR UPDATE
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

-- RLS: Enable on items_pedido
ALTER TABLE items_pedido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items of their pedidos"
  ON items_pedido FOR SELECT
  USING (
    pedido_id IN (
      SELECT id FROM pedidos WHERE usuario_id = auth.uid()
    ) OR
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

-- RLS: Enable on carritos
ALTER TABLE carritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own carrito"
  ON carritos FOR SELECT
  USING (usuario_id = auth.uid());

CREATE POLICY "Users can insert items to their carrito"
  ON carritos FOR INSERT
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Users can update their own carrito"
  ON carritos FOR UPDATE
  USING (usuario_id = auth.uid());

CREATE POLICY "Users can delete from their carrito"
  ON carritos FOR DELETE
  USING (usuario_id = auth.uid());
