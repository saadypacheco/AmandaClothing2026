-- Migration: 004_create_chat.sql
-- Description: Crea tablas para chat público y privado
-- Date: 2026-03-27

-- Tabla de chats (conversaciones)
CREATE TABLE chats (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('producto', 'privado')),
  producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  vendedora_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  nombre TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para chats
CREATE INDEX idx_chats_type_producto ON chats(tipo, producto_id);
CREATE INDEX idx_chats_usuario ON chats(usuario_id);
CREATE INDEX idx_chats_vendedora ON chats(vendedora_id);

-- Tabla de mensajes
CREATE TABLE mensajes_chat (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  remitente_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
  contenido TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mensajes
CREATE INDEX idx_mensajes_chat ON mensajes_chat(chat_id);
CREATE INDEX idx_mensajes_remitente ON mensajes_chat(remitente_id);
CREATE INDEX idx_mensajes_leido ON mensajes_chat(chat_id, leido);

-- RLS: Enable on chats
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chats"
  ON chats FOR SELECT
  USING (usuario_id = auth.uid() OR vendedora_id = auth.uid());

CREATE POLICY "Admins can view all chats"
  ON chats FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Users can insert chats"
  ON chats FOR INSERT
  WITH CHECK (usuario_id = auth.uid());

-- RLS: Enable on mensajes_chat
ALTER TABLE mensajes_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their chats"
  ON mensajes_chat FOR SELECT
  USING (
    chat_id IN (
      SELECT id FROM chats WHERE usuario_id = auth.uid() OR vendedora_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their chats"
  ON mensajes_chat FOR INSERT
  WITH CHECK (
    chat_id IN (
      SELECT id FROM chats WHERE usuario_id = auth.uid() OR vendedora_id = auth.uid()
    )
  );

CREATE POLICY "Users can update message read status"
  ON mensajes_chat FOR UPDATE
  USING (
    chat_id IN (
      SELECT id FROM chats WHERE usuario_id = auth.uid() OR vendedora_id = auth.uid()
    )
  );

-- Enable realtime on mensajes_chat for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE mensajes_chat;
