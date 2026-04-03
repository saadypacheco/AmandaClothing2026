-- Migration: 012_agente_bot.sql
-- Description: Permite mensajes del agente IA (sin remitente en auth.users)
-- Date: 2026-04-03

-- Hacer remitente_id nullable para mensajes del bot
ALTER TABLE mensajes_chat ALTER COLUMN remitente_id DROP NOT NULL;

-- Columna para identificar mensajes del agente IA
ALTER TABLE mensajes_chat ADD COLUMN IF NOT EXISTS es_bot BOOLEAN DEFAULT FALSE;

-- El backend (service_role) puede insertar mensajes del bot
-- La RLS existente ya permite que el service_role bypass todas las políticas
