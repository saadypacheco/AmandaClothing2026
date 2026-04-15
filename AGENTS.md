# AGENTS.md — Plataforma SaaS de e-commerce white-label
> Stack: Next.js 14 · FastAPI · Supabase · MercadoPago · WhatsApp (enlace web)
> Última modificación: 2026-04-15 — conversión a plataforma SaaS white-label (config dinámica, branding, wizard onboarding)
> Límite: 500 líneas. Detalles específicos → ver `/skills/` y `/docs/`

---

## 1. Visión del proyecto

Plataforma **SaaS white-label** de e-commerce con IA. Cada deploy es una tienda
independiente con su propia marca, colores, moneda, dominio y base Supabase.
La tienda de referencia (Amanda Clothing) validó el modelo; ahora el código
es genérico y se replica con un script + un wizard de onboarding.

**Diferenciales de producto:**
- Agente IA 24/7 (Gemini) que responde consultas sobre productos, talles, envíos
- Motor de recomendaciones personalizado por sesión y por usuaria logueada
- Chat en tiempo real producto-por-producto (Supabase Realtime)
- WhatsApp integrado en todos los touchpoints (consultar, reservar, cerrar venta)
- Configuración white-label completa sin tocar código

**Audiencia del software:** emprendedores/PyMEs LATAM que quieren vender online
sin pagar Shopify + contratar diseñador + contratar programador.
**Métrica clave del software:** onboardear cliente nuevo en < 1 día.
**Métrica clave de la tienda final:** tasa de conversión consulta → compra.

---

## 2. Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | Next.js App Router + TypeScript | 14.x |
| Estilos | Tailwind CSS | 3.x |
| Estado cliente | Zustand | 4.x |
| Backend | FastAPI + Python | 3.12 / 0.111+ |
| Validación | Pydantic v2 | 2.x |
| Base de datos | Supabase (PostgreSQL 15) | — |
| Auth | Supabase Auth (JWT) | — |
| Storage | Supabase Storage | — |
| Realtime | Supabase Realtime (WebSockets) | — |
| Pagos | MercadoPago Checkout Pro | — |
| Contacto | WhatsApp (enlace web `wa.me`) | — |
| Deploy FE | Vercel | — |
| Deploy BE | Railway | — |
| CI/CD | GitHub Actions | — |

---

## 3. Estructura de carpetas

```
boutique/
├── AGENTS.md
├── frontend/
│   ├── app/
│   │   ├── (shop)/
│   │   │   ├── page.tsx              # Home
│   │   │   ├── productos/
│   │   │   │   ├── page.tsx          # Catálogo
│   │   │   │   └── [slug]/page.tsx   # Detalle producto
│   │   │   └── lookbook/page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── registro/page.tsx
│   │   ├── (cuenta)/
│   │   │   ├── pedidos/page.tsx
│   │   │   └── wishlist/page.tsx
│   │   ├── admin/
│   │   │   ├── productos/page.tsx
│   │   │   ├── pedidos/page.tsx
│   │   │   └── consultas/page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                       # Button, Input, Badge, Modal
│   │   ├── producto/                 # ProductCard, Gallery, SizeSelector
│   │   ├── carrito/                  # CartDrawer, CartItem, CartSummary
│   │   ├── chat/                     # ChatWidget, MessageBubble
│   │   ├── recomendaciones/          # RecoShelf, RecoCard, CompletarLook
│   │   └── admin/                    # Componentes del panel
│   ├── hooks/
│   │   ├── useCart.ts
│   │   ├── useRealtime.ts
│   │   ├── useWishlist.ts
│   │   └── useTracking.ts            # Registro de eventos de comportamiento
│   ├── lib/
│   │   ├── supabase/                 # client.ts, types generados
│   │   └── api/                     # fetchers para FastAPI
│   ├── store/                        # Zustand stores
│   └── types/                        # Tipos de dominio globales
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── productos.py
│   │   │   ├── pedidos.py
│   │   │   ├── pagos.py
│   │   │   ├── contacto.py
│   │   │   ├── auth.py
│   │   │   ├── eventos.py            # Recibe eventos de comportamiento
│   │   │   └── recomendaciones.py    # Devuelve recomendaciones calculadas
│   │   ├── models/                   # Pydantic schemas
│   │   ├── services/
│   │   │   ├── recomendaciones.py    # Motor: collaborative + perfil + look
│   │   │   └── tracking.py           # Procesamiento de eventos
│   │   ├── db/                       # Supabase client + queries
│   │   └── core/                     # Config, seguridad, deps
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
└── skills/
    ├── crear-producto.md
    ├── mercadopago.md
    ├── chat-realtime.md
    ├── tracking-eventos.md
    ├── motor-recomendaciones.md
    └── ci-cd.md
```

---

## 4. Módulos funcionales

### Catálogo
- Grid con filtros: categoría, talla, color, precio
- Búsqueda full-text con `pg_trgm`
- Detalle: galería 4+ fotos, selector talla/color, stock live, guía de talles
- Badge "pocas unidades" cuando stock ≤ 3

### Carrito y checkout
- Estado en Zustand + localStorage (guest) / Supabase (logueado)
- Checkout Pro de MercadoPago → webhook de confirmación
- Estados: `pendiente` → `pagado` → `preparando` → `enviado` → `entregado`

### Contacto (diferencial)
- **Chat en producto:** hilo público de preguntas por producto (Supabase Realtime)
- **Chat privado:** mensajes directos con la vendedora (Supabase Realtime)
- **WhatsApp:** ícono flotante que abre `https://wa.me/{NUMERO}` con mensaje pre-formateado. Sin API — solo enlace web directo al número de la dueña.

### Sistema de intereses y recomendaciones

**Registro de comportamiento:** cada acción de la usuaria genera un evento con peso.
```
vista de producto        → peso 1
vista > 30 segundos      → peso 2 adicional
wishlist                 → peso 3
agregar al carrito       → peso 5
compra efectiva          → peso 10
volver a ver el mismo    → peso 2 adicional por visita
```

El `session_id` (UUID en localStorage) identifica sesiones sin login.
Al hacer login, los eventos de la sesión se asocian al `usuario_id`.
Fire-and-forget: el registro nunca bloquea la UI.

**Tres tipos de recomendación mostradas en el detalle de producto:**

- **"Completá el look"** (4 cards): productos de categorías complementarias
  con afinidad de estilo. Calculado con similitud de categoría y precio.
  Mapa de complementos: camperas↔pantalones, vestidos↔calzado, etc.

- **"Otras también vieron"** (6 cards): collaborative filtering simple.
  Productos que usuarias con comportamiento similar miraron juntos.
  Calculado con co-ocurrencias de `session_id` en últimos 30 días.

- **"Para vos"** (8 cards): basado en el perfil de la sesión actual.
  Aparece solo si la usuaria tiene ≥ 3 eventos en la sesión.
  Analiza: categorías más vistas, rango de precio navegado, tallas exploradas.
  Excluye productos ya vistos en la sesión.

**Cron job nocturno (02:00 AM):** pre-calcula la tabla `producto_similares`
y actualiza `perfil_intereses` de usuarias registradas con historial.
Las recomendaciones en vivo usan los pre-calculados + ajuste por sesión actual.

### Panel admin
- CRUD productos con imágenes (Supabase Storage)
- Kanban de pedidos por estado
- Bandeja de consultas
- Analytics: ventas/día, productos más vistos, tasa de conversión,
  productos más recomendados y tasa de click en recomendaciones

---

## 5. Modelo de datos (resumen)

```sql
-- Dominio principal
productos       (id, nombre, descripcion, precio, categoria_id, activo)
variantes       (id, producto_id, talla, color, stock, sku)
categorias      (id, nombre, slug, padre_id, complementos text[])
usuarios        (id, email, nombre, rol, whatsapp)
pedidos         (id, usuario_id, estado, total, mp_preference_id)
items_pedido    (id, pedido_id, variante_id, cantidad, precio_unitario)
carritos        (id, usuario_id, variante_id, cantidad)
wishlist        (id, usuario_id, producto_id)
consultas       (id, producto_id, usuario_id, pregunta, respuesta, publico)
mensajes_chat   (id, chat_id, remitente_id, contenido, leido)
lookbooks       (id, titulo, portada_url, activo)

-- Sistema de intereses y recomendaciones
eventos_usuario (
  id, session_id, usuario_id (nullable),
  producto_id, tipo_evento, peso,
  duracion_segundos, created_at
)
-- tipo_evento: 'vista' | 'wishlist' | 'carrito' | 'compra'

perfil_intereses (
  id, session_id, usuario_id (nullable),
  categorias_ids text[],
  precio_min, precio_max,
  tallas_interes text[],
  colores_interes text[],
  score_total, actualizado_en
)

producto_similares (
  producto_id, similar_id,
  tipo_similitud,   -- 'colaborativo' | 'complementario'
  score,
  calculado_en
)
```

---

## 6. Convenciones de código

### Frontend
- Componentes: PascalCase → `ProductCard.tsx`
- Hooks: prefijo `use` → `useCart.ts`
- Server Components por defecto; `'use client'` solo cuando sea necesario
- Fetching server: `fetch` nativo con `revalidate`
- Fetching client: TanStack Query
- Estilos: solo Tailwind, sin CSS modules

### Backend
- Rutas: snake_case plural → `/productos`, `/pedidos/{id}/items`
- Schemas: `NombreCreate`, `NombreUpdate`, `NombreResponse`
- Una función = una responsabilidad en services/
- Errores: `HTTPException` con `detail` descriptivo en español
- Tests: pytest, un archivo por router

### Git
- Branches: `feature/nombre`, `fix/descripcion`, `chore/tarea`
- Commits: `feat(módulo): descripción en infinitivo`
- PR con descripción + checklist + screenshot si hay UI

---

## 7. Variables de entorno

```bash
# frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_MP_PUBLIC_KEY=
NEXT_PUBLIC_WA_NUMBER=5491112345678   # número de la dueña, formato internacional sin +

# backend/.env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
MP_ACCESS_TOKEN=
MP_WEBHOOK_SECRET=
JWT_SECRET=
RECO_EVENTOS_VENTANA_DIAS=30       # ventana para collaborative filtering
RECO_SESION_MIN_EVENTOS=3          # mínimo de eventos para mostrar "Para vos"
RECO_CRON_HORA=2                   # hora del cron de pre-cálculo (02:00 AM)
```

---

## 8. Reglas críticas

1. `SUPABASE_SERVICE_ROLE_KEY` nunca va al frontend
2. RLS activo en todas las tablas con datos de usuario
3. Imágenes → Supabase Storage, nunca base64 en DB
4. Carrito: actualización optimista en UI, sync con API después
5. Chat: Supabase Realtime directo, no pasa por FastAPI
6. Cada endpoint que modifica datos tiene al menos un test
7. Webhooks de MercadoPago se validan con firma antes de procesar
8. Registro de eventos: fire-and-forget, nunca bloquea la UI ni el render
9. Páginas de producto: SSG con ISR 60s (no SSR puro)
10. Soft delete siempre: `activo = false`, nunca `DELETE`
11. `evento_usuario` con `usuario_id = null` es válido (sesión sin login)
12. Al hacer login: asociar `session_id` anónimo al `usuario_id` real
13. Recomendaciones vacías: si no hay datos suficientes, mostrar "novedades"
    — nunca mostrar un shelf vacío en la UI
14. El cron de pre-cálculo no bloquea requests — usa tabla pre-calculada

---

## 9. Flujos críticos

### Compra
```
carrito → POST /pagos/preference → redirect MP
→ webhook → validar firma → UPDATE pedido "pagado"
→ INSERT evento (tipo=compra, peso=10)
→ (la vendedora es notificada por otros medios; WA no se usa en este flujo)
```

### Registro de evento de comportamiento
```
usuaria entra al detalle de producto
→ useTracking.registrarEvento(productoId, 'vista') → fire & forget
→ POST /eventos → INSERT eventos_usuario (con session_id + usuario_id si existe)
→ al salir: registrar duración si > 30s → peso extra
→ si agrega a wishlist/carrito → nuevo evento con peso correspondiente
```

### Recomendaciones en detalle de producto
```
GET /recomendaciones/detalle?producto_id=X&session_id=Y

backend:
1. "Completá el look": buscar en producto_similares WHERE tipo='complementario'
   → si vacío: buscar por categorías complementarias de categorias.complementos[]

2. "Otras también vieron": buscar en producto_similares WHERE tipo='colaborativo'
   → si vacío (producto nuevo): misma categoría ordenada por vistas recientes

3. "Para vos": contar eventos_usuario WHERE session_id = Y
   → si < 3 eventos: no devolver este shelf
   → si >= 3: calcular perfil on-the-fly → query con filtros de categoría y precio
   → excluir productos ya vistos en la sesión

→ response: { completar_look: [], otras_vieron: [], para_vos: [] }
→ frontend muestra solo los shelves con datos (mínimo 2 productos c/u)
```

### Cron nocturno de pre-cálculo (02:00 AM)
```
[cron 02:00 diario]
→ TRUNCATE producto_similares

→ collaborative filtering:
   SELECT e2.producto_id, COUNT(*) score
   FROM eventos_usuario e1 JOIN eventos_usuario e2
     ON e1.session_id = e2.session_id AND e2.producto_id != e1.producto_id
   WHERE e1.created_at > NOW() - INTERVAL '30 days'
   GROUP BY e1.producto_id, e2.producto_id
   → INSERT producto_similares (tipo='colaborativo')

→ complementarios:
   Para cada producto, buscar productos de categorías complementarias
   ordenados por vistas totales del último mes
   → INSERT producto_similares (tipo='complementario')

→ actualizar perfil_intereses de usuarios con actividad en últimos 7 días
→ log duración + cantidad de registros insertados
```

### Consulta en producto
```
pregunta → INSERT consultas → Realtime broadcast
→ vendedora responde en admin → UPDATE consulta
→ Realtime actualiza vista del comprador
```

---

## 10. Arquitectura white-label

Cada cliente es un **deploy independiente**: su propio repo clonado en `/docker/<cliente>/`
en el VPS, su propia Supabase, su propio dominio con SSL automático via Traefik.
La personalización vive en una sola tabla: `tienda_config`.

### Tabla `tienda_config`
Clave/valor con tipo (`texto`, `json`, `color`, `booleano`) y grupo (`marca`, `contacto`,
`home`, `pago`, `ia`, `sitio`, `branding`, `moneda`, `sistema`). RLS:
lectura pública, escritura solo admin.

### Flujo de configuración
```
Frontend (useTiendaConfig hook)
  ↓ GET /config (público) — caché localStorage TTL 5min
  ↓ muestra nombre, textos, WA, moneda, colores, etc.

Admin (/admin/configuracion o /admin/onboarding)
  ↓ POST /admin/config/bulk (JWT admin) — actualiza N claves
  ↓ invalida caché → próximo render usa los nuevos valores
```

### CSS variables + Tailwind
`tailwind.config.js` define colores como `var(--color-*, <default>)`.
`BrandingStyles` (server component) hace fetch de `/config` en el root layout
y emite un `<style>` con `:root { --color-primario: ...; }`. Revalidate 300s.
Resultado: cambios en admin se reflejan a los 5 min sin rebuild.

### Formateo de moneda
`lib/format.ts` exporta `formatPriceWith(config, precio)` que usa `Intl.NumberFormat`
con `locale + currency`. Soporta ARS, USD, EUR, MXN, CLP, PEN, UYU, BRL.

### Wizard de onboarding
`/admin/onboarding` (4 pasos): Identidad → Contacto → Branding → Home.
Al finalizar, `onboarding_completado=true`. Banner en dashboard si está pendiente.

### Deploy de cliente nuevo
Ver `docs/deploy-cliente-nuevo.md`. Resumen:
1. Crear proyecto Supabase, correr migraciones 001–014
2. VPS: `bash scripts/crear-tienda.sh <cliente> <dominio> <wa_numero>`
3. Completar `.env` y `backend/.env`
4. Configurar DNS (A records @, www, api → VPS IP)
5. `docker compose up -d --build` — Traefik emite cert SSL automáticamente
6. Promover usuario a admin vía SQL
7. Admin completa `/admin/onboarding` en 3 minutos

### Qué NO está automatizado (decisiones conscientes)
- **i18n**: toda la UI sigue en es-AR. Se agregará cuando llegue cliente no-AR.
- **Billing**: cobro manual offline. Stripe cuando haya ≥ 3 clientes activos.
- **Multi-tenant en una BD**: cada cliente tiene su Supabase (aislamiento > economía).
