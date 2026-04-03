-- Migration: 009_guest_checkout.sql
-- Description: Permite pedidos de usuarios no registrados (guest checkout)
-- Date: 2026-04-02

-- usuario_id pasa a ser nullable para admitir pedidos de guests
ALTER TABLE pedidos
  ALTER COLUMN usuario_id DROP NOT NULL,
  ADD COLUMN nombre_guest TEXT,
  ADD COLUMN telefono_guest TEXT;

-- Índice para buscar pedidos por teléfono al vincular con cuenta nueva
CREATE INDEX idx_pedidos_telefono_guest ON pedidos(telefono_guest) WHERE telefono_guest IS NOT NULL;

-- La política de INSERT existente solo permite usuarios autenticados.
-- Los pedidos guest se insertan desde el backend con service_role_key → bypasea RLS.
-- Actualizamos la política de SELECT para que un usuario recién registrado
-- pueda ver sus pedidos vinculados (usuario_id ya seteado).
-- No se requiere cambio en las políticas porque:
--   - INSERT guest: backend con service_role → bypasea RLS ✓
--   - UPDATE vincular: backend con service_role → bypasea RLS ✓
--   - SELECT mis-pedidos: filtra por usuario_id = auth.uid() → funciona post-vinculación ✓
