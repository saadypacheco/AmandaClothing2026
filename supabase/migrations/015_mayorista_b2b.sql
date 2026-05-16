-- Migration: 015_mayorista_b2b.sql
-- Cimientos del modo mayorista B2B: switch maestro, campos B2B en usuarios/productos/pedidos,
-- tablas de listas de precios, cuenta corriente y atributos dinámicos.
-- Todas las tablas y campos nuevos tienen defaults compatibles con modo minorista:
-- una tienda sin estos datos sigue funcionando exactamente como antes.

-- =============================================================================
-- 1. SWITCH MAESTRO + CONFIG B2B
-- =============================================================================

INSERT INTO tienda_config (clave, valor, tipo, grupo, descripcion) VALUES
  ('modo', 'minorista', 'texto', 'sistema',
    'Modo de la tienda: minorista (B2C) o mayorista (B2B)'),
  ('mayorista_requiere_aprobacion', 'true', 'booleano', 'mayorista',
    'Si true, las cuentas mayoristas nuevas quedan pendientes hasta aprobación del admin'),
  ('mayorista_aprobacion_pedido_monto', '0', 'texto', 'mayorista',
    'Monto sobre el cual un pedido requiere aprobación manual (0 = nunca auto-aprobar)'),
  ('mayorista_metodos_pago', '["mercadopago","cuenta_corriente","transferencia","cotizacion"]',
    'json', 'mayorista', 'Métodos de pago habilitados en checkout mayorista'),
  ('mayorista_condicion_pago_default', 'contado', 'texto', 'mayorista',
    'Condición de pago default al aprobar una cuenta nueva')
ON CONFLICT (clave) DO NOTHING;

-- =============================================================================
-- 2. LISTAS DE PRECIOS
-- =============================================================================

CREATE TABLE IF NOT EXISTS listas_precio (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  es_default BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listas_precio_activo ON listas_precio(activo);

CREATE TABLE IF NOT EXISTS precios_lista (
  id SERIAL PRIMARY KEY,
  lista_id INT NOT NULL REFERENCES listas_precio(id) ON DELETE CASCADE,
  producto_id INT REFERENCES productos(id) ON DELETE CASCADE,
  variante_id INT REFERENCES variantes(id) ON DELETE CASCADE,
  precio NUMERIC(12,2) NOT NULL,
  descuento_pct NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (producto_id IS NOT NULL OR variante_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_precios_lista_lista ON precios_lista(lista_id);
CREATE INDEX IF NOT EXISTS idx_precios_lista_producto ON precios_lista(producto_id);
CREATE INDEX IF NOT EXISTS idx_precios_lista_variante ON precios_lista(variante_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_precios_lista_uniq_variante
  ON precios_lista(lista_id, variante_id) WHERE variante_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_precios_lista_uniq_producto
  ON precios_lista(lista_id, producto_id) WHERE variante_id IS NULL;

ALTER TABLE listas_precio ENABLE ROW LEVEL SECURITY;
ALTER TABLE precios_lista ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gestionan listas" ON listas_precio FOR ALL
  USING ((SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Cualquiera lee listas activas" ON listas_precio FOR SELECT
  USING (activo = TRUE);

CREATE POLICY "Admins gestionan precios_lista" ON precios_lista FOR ALL
  USING ((SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Lectura precios_lista de listas activas" ON precios_lista FOR SELECT
  USING (EXISTS (SELECT 1 FROM listas_precio l WHERE l.id = lista_id AND l.activo));

-- =============================================================================
-- 3. CAMPOS B2B EN USUARIOS
-- =============================================================================

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS tipo_cuenta TEXT DEFAULT 'minorista';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS estado_cuenta TEXT DEFAULT 'activo';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cuit TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS razon_social TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS condicion_iva TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS lista_precio_id INT REFERENCES listas_precio(id);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS descuento_general NUMERIC(5,2) DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS vendedor_asignado_id UUID REFERENCES usuarios(id);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS notas_internas TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS aprobado_por UUID REFERENCES usuarios(id);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS aprobado_en TIMESTAMPTZ;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS condicion_pago_default TEXT DEFAULT 'contado';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS direccion_fiscal TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono_contacto TEXT;

CREATE INDEX IF NOT EXISTS idx_usuarios_tipo_cuenta ON usuarios(tipo_cuenta);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado_cuenta ON usuarios(estado_cuenta);
CREATE INDEX IF NOT EXISTS idx_usuarios_lista_precio ON usuarios(lista_precio_id);

-- =============================================================================
-- 4. CAMPOS B2B EN PRODUCTOS
-- =============================================================================

ALTER TABLE productos ADD COLUMN IF NOT EXISTS unidad_venta TEXT DEFAULT 'unidad';
ALTER TABLE productos ADD COLUMN IF NOT EXISTS unidades_por_pack INT DEFAULT 1;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS minimo_compra_mayorista INT DEFAULT 1;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS costo NUMERIC(12,2);

-- =============================================================================
-- 5. CAMPOS B2B EN PEDIDOS
-- =============================================================================

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'minorista';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_pago TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS comprobante_url TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS aprobado_por UUID REFERENCES usuarios(id);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS aprobado_en TIMESTAMPTZ;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS nota_interna TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS condicion_pago TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS vencimiento DATE;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS remito_numero TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS factura_numero TEXT;

CREATE INDEX IF NOT EXISTS idx_pedidos_tipo ON pedidos(tipo);
CREATE INDEX IF NOT EXISTS idx_pedidos_metodo_pago ON pedidos(metodo_pago);
CREATE INDEX IF NOT EXISTS idx_pedidos_vencimiento ON pedidos(vencimiento) WHERE vencimiento IS NOT NULL;

-- =============================================================================
-- 6. CUENTA CORRIENTE
-- =============================================================================

CREATE TABLE IF NOT EXISTS cuentas_corriente (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  limite_credito NUMERIC(12,2) DEFAULT 0,
  dias_pago_default INT DEFAULT 30,
  saldo_actual NUMERIC(12,2) DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cuentas_corriente_usuario ON cuentas_corriente(usuario_id);
CREATE INDEX IF NOT EXISTS idx_cuentas_corriente_activo ON cuentas_corriente(activo);

CREATE TABLE IF NOT EXISTS movimientos_cc (
  id SERIAL PRIMARY KEY,
  cuenta_id INT NOT NULL REFERENCES cuentas_corriente(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  monto NUMERIC(12,2) NOT NULL,
  pedido_id INT REFERENCES pedidos(id) ON DELETE SET NULL,
  descripcion TEXT,
  fecha_vencimiento DATE,
  fecha_pago DATE,
  comprobante_url TEXT,
  creado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (tipo IN ('cargo', 'pago', 'nota_credito', 'nota_debito'))
);

CREATE INDEX IF NOT EXISTS idx_movimientos_cc_cuenta ON movimientos_cc(cuenta_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_cc_pedido ON movimientos_cc(pedido_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_cc_vencimiento ON movimientos_cc(fecha_vencimiento)
  WHERE fecha_vencimiento IS NOT NULL AND fecha_pago IS NULL;
CREATE INDEX IF NOT EXISTS idx_movimientos_cc_tipo ON movimientos_cc(tipo);

ALTER TABLE cuentas_corriente ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_cc ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cliente ve su CC" ON cuentas_corriente FOR SELECT
  USING (usuario_id = auth.uid());
CREATE POLICY "Admins gestionan CC" ON cuentas_corriente FOR ALL
  USING ((SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Cliente ve sus movimientos" ON movimientos_cc FOR SELECT
  USING (cuenta_id IN (SELECT id FROM cuentas_corriente WHERE usuario_id = auth.uid()));
CREATE POLICY "Admins gestionan movimientos" ON movimientos_cc FOR ALL
  USING ((SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin');

-- Función para recalcular saldo desde movimientos
-- (los cargos y notas de débito suman, los pagos y notas de crédito restan)
CREATE OR REPLACE FUNCTION recalcular_saldo_cc(p_cuenta_id INT)
RETURNS NUMERIC AS $$
DECLARE
  v_saldo NUMERIC;
BEGIN
  SELECT COALESCE(SUM(
    CASE
      WHEN tipo IN ('cargo', 'nota_debito') THEN monto
      WHEN tipo IN ('pago', 'nota_credito') THEN -monto
      ELSE 0
    END
  ), 0) INTO v_saldo
  FROM movimientos_cc WHERE cuenta_id = p_cuenta_id;

  UPDATE cuentas_corriente SET saldo_actual = v_saldo, updated_at = NOW()
    WHERE id = p_cuenta_id;

  RETURN v_saldo;
END;
$$ LANGUAGE plpgsql;

-- Trigger para recalcular saldo al insertar/actualizar/borrar movimientos
CREATE OR REPLACE FUNCTION trigger_recalcular_saldo()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalcular_saldo_cc(OLD.cuenta_id);
    RETURN OLD;
  ELSE
    PERFORM recalcular_saldo_cc(NEW.cuenta_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_movimientos_cc_saldo ON movimientos_cc;
CREATE TRIGGER trg_movimientos_cc_saldo
  AFTER INSERT OR UPDATE OR DELETE ON movimientos_cc
  FOR EACH ROW EXECUTE FUNCTION trigger_recalcular_saldo();

-- =============================================================================
-- 7. ATRIBUTOS DINÁMICOS (catálogo generalizado)
-- =============================================================================

CREATE TABLE IF NOT EXISTS atributo_definicion (
  id SERIAL PRIMARY KEY,
  categoria_id INT REFERENCES categorias(id) ON DELETE CASCADE,
  clave TEXT NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'texto',
  valores_permitidos JSONB,
  obligatorio BOOLEAN DEFAULT FALSE,
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (tipo IN ('texto', 'numero', 'select', 'multi_select', 'booleano'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_atributo_def_cat_clave
  ON atributo_definicion(categoria_id, clave);
CREATE INDEX IF NOT EXISTS idx_atributo_def_cat ON atributo_definicion(categoria_id);

CREATE TABLE IF NOT EXISTS atributo_valor_variante (
  id SERIAL PRIMARY KEY,
  variante_id INT NOT NULL REFERENCES variantes(id) ON DELETE CASCADE,
  atributo_id INT NOT NULL REFERENCES atributo_definicion(id) ON DELETE CASCADE,
  valor TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (variante_id, atributo_id)
);

CREATE INDEX IF NOT EXISTS idx_atributo_valor_variante ON atributo_valor_variante(variante_id);
CREATE INDEX IF NOT EXISTS idx_atributo_valor_atributo ON atributo_valor_variante(atributo_id);

ALTER TABLE atributo_definicion ENABLE ROW LEVEL SECURITY;
ALTER TABLE atributo_valor_variante ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica atributo_definicion" ON atributo_definicion FOR SELECT USING (TRUE);
CREATE POLICY "Admins gestionan atributos" ON atributo_definicion FOR ALL
  USING ((SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Lectura publica atributo_valor" ON atributo_valor_variante FOR SELECT USING (TRUE);
CREATE POLICY "Admins gestionan valores atributo" ON atributo_valor_variante FOR ALL
  USING ((SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin');

-- =============================================================================
-- 8. SEED: lista de precios default "minorista"
-- =============================================================================

INSERT INTO listas_precio (nombre, descripcion, es_default, activo)
VALUES ('Minorista', 'Lista pública. Refleja productos.precio.', TRUE, TRUE)
ON CONFLICT (nombre) DO NOTHING;
