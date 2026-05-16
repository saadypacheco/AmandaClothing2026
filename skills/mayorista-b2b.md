# mayorista-b2b.md

Guía técnica del **modo mayorista B2B** del SaaS. Activo cuando `tienda_config.modo = 'mayorista'`.

---

## 1. Switch maestro

`tienda_config.modo` controla todo el comportamiento. Valores:

- `minorista` (default, o ausencia de la clave) → tienda actúa como B2C (Amanda Clothing).
- `mayorista` → tienda actúa como B2B (catálogo privado, listas de precios, cuenta corriente, etc.).

**Helper de detección:**
- Frontend: `useTiendaConfig().modo === 'mayorista'`.
- Backend: `await config_get('modo') == 'mayorista'`.

Los componentes que tienen comportamiento divergente leen el modo y bifurcan. Las rutas B2B (`/admin/cuentas`, `/admin/listas-precio`, etc.) montan siempre, pero verifican el modo y devuelven 404 si no aplica.

---

## 2. Modelo de datos (delta sobre el minorista)

### Tablas nuevas

```sql
-- Listas de precios
listas_precio          (id, nombre, descripcion, es_default, activo, created_at)
precios_lista          (id, lista_id, producto_id, variante_id, precio, descuento_pct)

-- Cuenta corriente
cuentas_corriente      (id, usuario_id, limite_credito, dias_pago_default, saldo_actual, activo)
movimientos_cc         (id, cuenta_id, tipo, monto, pedido_id, descripcion,
                        fecha_vencimiento, fecha_pago, created_at)
-- tipo: 'cargo' | 'pago' | 'nota_credito' | 'nota_debito'

-- Atributos dinámicos (catalogo generalizado)
atributo_definicion    (id, categoria_id, clave, nombre, tipo, valores_permitidos, orden)
atributo_valor_variante (id, variante_id, atributo_id, valor)
```

### Campos agregados

```sql
-- usuarios (B2B)
ALTER TABLE usuarios ADD COLUMN tipo_cuenta TEXT DEFAULT 'minorista';
  -- 'minorista' | 'mayorista'
ALTER TABLE usuarios ADD COLUMN estado_cuenta TEXT DEFAULT 'activo';
  -- 'pendiente' | 'activo' | 'suspendido' | 'rechazado'
ALTER TABLE usuarios ADD COLUMN cuit TEXT;
ALTER TABLE usuarios ADD COLUMN razon_social TEXT;
ALTER TABLE usuarios ADD COLUMN condicion_iva TEXT;
  -- 'responsable_inscripto' | 'monotributo' | 'exento' | 'consumidor_final'
ALTER TABLE usuarios ADD COLUMN lista_precio_id INT REFERENCES listas_precio(id);
ALTER TABLE usuarios ADD COLUMN descuento_general NUMERIC(5,2) DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN vendedor_asignado_id UUID REFERENCES usuarios(id);
ALTER TABLE usuarios ADD COLUMN notas_internas TEXT;
ALTER TABLE usuarios ADD COLUMN aprobado_por UUID REFERENCES usuarios(id);
ALTER TABLE usuarios ADD COLUMN aprobado_en TIMESTAMPTZ;

-- productos (B2B)
ALTER TABLE productos ADD COLUMN unidad_venta TEXT DEFAULT 'unidad';
  -- 'unidad' | 'pack' | 'bulto' | 'caja'
ALTER TABLE productos ADD COLUMN unidades_por_pack INT DEFAULT 1;
ALTER TABLE productos ADD COLUMN minimo_compra_mayorista INT DEFAULT 1;
ALTER TABLE productos ADD COLUMN costo NUMERIC(12,2);
  -- usado para calcular margen en reportes

-- pedidos (B2B)
ALTER TABLE pedidos ADD COLUMN tipo TEXT DEFAULT 'minorista';
  -- 'minorista' | 'mayorista'
ALTER TABLE pedidos ADD COLUMN metodo_pago TEXT;
  -- 'mercadopago' | 'cuenta_corriente' | 'transferencia' | 'cotizacion'
ALTER TABLE pedidos ADD COLUMN comprobante_url TEXT;
ALTER TABLE pedidos ADD COLUMN aprobado_por UUID REFERENCES usuarios(id);
ALTER TABLE pedidos ADD COLUMN aprobado_en TIMESTAMPTZ;
ALTER TABLE pedidos ADD COLUMN nota_interna TEXT;
ALTER TABLE pedidos ADD COLUMN condicion_pago TEXT;
  -- 'contado' | '15_dias' | '30_dias' | '60_dias' | '90_dias'
ALTER TABLE pedidos ADD COLUMN vencimiento DATE;
ALTER TABLE pedidos ADD COLUMN remito_numero TEXT;
ALTER TABLE pedidos ADD COLUMN factura_numero TEXT;

-- tienda_config (B2B switches)
INSERT INTO tienda_config (clave, valor, tipo, grupo) VALUES
  ('modo', 'minorista', 'texto', 'sistema'),
  ('mayorista_requiere_aprobacion', 'true', 'booleano', 'mayorista'),
  ('mayorista_aprobacion_pedido_monto', '0', 'texto', 'mayorista'),
    -- monto sobre el cual el pedido requiere aprobación manual (0 = nunca)
  ('mayorista_metodos_pago', '["mercadopago","cuenta_corriente","transferencia","cotizacion"]',
   'json', 'mayorista');
```

---

## 3. Estados de pedido (B2B)

```
borrador → cotizado → pendiente_aprobacion → aprobado
                                          ↓
                                       preparacion → despacho → entregado → facturado
                                          ↓
                                       cancelado
```

**Reglas:**
- Si `metodo_pago = 'mercadopago'` y monto < `mayorista_aprobacion_pedido_monto` → salta a `aprobado` directo.
- Si `metodo_pago = 'cotizacion'` → entra como `cotizado`, admin lo edita y lo manda a `pendiente_aprobacion` o `aprobado`.
- Si `metodo_pago = 'cuenta_corriente'` → entra como `pendiente_aprobacion`, admin verifica límite de crédito y aprueba.
- Si `metodo_pago = 'transferencia'` → cliente sube comprobante, admin confirma → `aprobado`.

---

## 4. Listas de precios — lookup

El precio que ve un cliente se resuelve así (orden de precedencia):

1. `precios_lista` para `(usuario.lista_precio_id, variante_id)` → si existe, ese precio.
2. `precios_lista` para `(usuario.lista_precio_id, producto_id, variante_id IS NULL)` → precio a nivel producto en la lista.
3. `productos.precio` (precio "minorista" por default).

Sobre el precio resuelto se aplica `usuario.descuento_general` como porcentaje.

**Implementación:** función `resolver_precio(usuario, variante)` en `backend/app/services/precios.py`.

---

## 5. Cuenta corriente — invariantes

- `cuentas_corriente.saldo_actual` se recalcula desde `movimientos_cc` (no se actualiza in-place, evita drift).
- Un pedido aprobado con `metodo_pago = 'cuenta_corriente'` genera un `movimiento_cc` tipo `cargo` con `fecha_vencimiento = aprobado_en + dias_pago`.
- Un pago se registra como `movimiento_cc` tipo `pago`, monto negativo (resta del saldo).
- `saldo_actual = SUM(movimientos.monto)` siempre.
- Si `saldo_actual + monto_pedido > limite_credito` el pedido queda en `pendiente_aprobacion` aunque la auto-aprobación lo permita.

---

## 6. Aprobación manual de cuenta

Cuando alguien se registra en una tienda con `modo='mayorista'`:

1. Backend crea `usuarios` con `tipo_cuenta='mayorista'`, `estado_cuenta='pendiente'`.
2. Email de bienvenida → "tu cuenta está pendiente de aprobación".
3. Aparece en `/admin/cuentas` (bandeja).
4. Admin abre detalle, completa CUIT/razón social si falta, asigna `lista_precio_id`, `condicion_pago_default`, `limite_credito`.
5. `POST /admin/cuentas/{id}/aprobar` → `estado_cuenta='activo'`, crea `cuenta_corriente`.
6. Email al cliente → "tu cuenta fue aprobada, ya podés ingresar".

Middleware en frontend: si `modo='mayorista'` y `usuario.estado_cuenta != 'activo'`, redirige a una pantalla "tu cuenta está en revisión".

---

## 7. UI — qué cambia con `modo='mayorista'`

| Ruta | Minorista | Mayorista |
|------|-----------|-----------|
| `/` | Home pública con hero + shelves | Redirige a `/login` si no hay sesión |
| `/productos` | Pública con precios | Privada, precios de la lista del cliente |
| `/checkout` | MercadoPago | Selector de método (4 opciones) |
| `/mi-cuenta` | Pedidos + datos personales | + Estado de cuenta corriente + facturas |
| `/admin/dashboard` | KPIs B2C (ventas, productos top) | KPIs B2B (cobranzas, pendientes aprobación, top clientes) |
| `/admin/cuentas` | No existe | Bandeja de cuentas pendientes + listado de cuentas activas |
| `/admin/listas-precio` | No existe | CRUD de listas + import CSV |
| `/admin/cuentas-corriente` | No existe | Estado de cuenta por cliente, movimientos, alertas |
| `/admin/reportes` | No existe | Ventas, ABC, margen, cobranzas, export CSV |

---

## 8. Reportes (queries de referencia)

- **Ventas por cliente:** `pedidos JOIN usuarios` agrupado por `usuario_id`, filtrado por rango de fecha y `estado IN ('aprobado','preparacion','despacho','entregado','facturado')`.
- **ABC de productos:** `items_pedido JOIN productos`, calcula % acumulado de venta por producto, etiqueta A (top 80%), B (siguiente 15%), C (resto 5%).
- **Margen bruto:** `(precio_unitario - productos.costo) * cantidad` agregado por producto/categoría.
- **Cobranzas:** `movimientos_cc` con `fecha_vencimiento < NOW() AND fecha_pago IS NULL` → deuda vencida.

Todas las queries tienen export a CSV vía endpoint `GET /admin/reportes/<tipo>?export=csv`.

---

## 9. Activación en una tienda nueva

En el wizard de onboarding (`/admin/onboarding`):
1. Paso 1 — Identidad: incluye selector "Tipo de tienda" → minorista | mayorista.
2. Si elige mayorista, los pasos siguientes tienen campos extra (datos fiscales por defecto, condición de pago default, etc.).
3. Al finalizar: `tienda_config.modo` queda seteado.

Para cambiar modo en una tienda existente: editar `tienda_config.modo` desde `/admin/configuracion` (con warning de "cambia el comportamiento de toda la tienda").

---

## 10. Roadmap (estado de implementación)

- [x] Fase 0 — Migración 015 con cimientos del data model
- [x] Fase 1 — Onboarding mayorista con aprobación manual
- [x] Fase 2 — Listas de precios y descuentos por cliente
- [x] Fase 3 — Checkout multi-método (MP / CC / transferencia / cotización)
- [x] Fase 4 — Workflow de pedidos B2B con aprobación
- [x] Fase 5 — Cuenta corriente y cobranzas
- [x] Fase 6 — Reportes y analytics avanzados
- [x] Fase 7 — Dashboard mayorista B2B
- [x] Fase 8 — Atributos dinámicos para catálogo generalizado

Estado actualizado en `docs/progreso.md`.
