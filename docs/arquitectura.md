# Arquitectura técnica — Boutique de Moda Online
> Documento de referencia para arquitectos y desarrolladores.
> Stack: Next.js 14 · FastAPI · Supabase · Zustand · Tailwind CSS
> Última actualización: 2026-04-02

---

## 1. Visión general

Tienda de moda online con identidad de marca fuerte. El diferencial no es el catálogo sino la **conexión directa con la vendedora**: chat en tiempo real por producto, motor de recomendaciones personalizadas basado en comportamiento, y checkout con transferencia bancaria (sin tarjeta de crédito).

**Audiencia objetivo:** mujeres 25–45 años, Argentina, mobile-first.
**Métrica clave:** tasa de conversión consulta → compra.

---

## 2. Stack tecnológico

| Capa | Tecnología | Versión | Rol |
|------|-----------|---------|-----|
| Frontend | Next.js App Router + TypeScript | 14.x | UI, routing, SSR/SSG |
| Estilos | Tailwind CSS | 3.x | Design system completo sin CSS externo |
| Estado cliente | Zustand + localStorage | 4.x | Carrito persistido, estado global |
| Backend | FastAPI + Python | 3.12 / 0.111+ | API REST, lógica de negocio, auth guard |
| Validación | Pydantic v2 | 2.x | Schemas de entrada/salida en backend |
| Base de datos | Supabase (PostgreSQL 15) | — | Datos principales |
| Auth | Supabase Auth (JWT) | — | Login, registro, sesión |
| Storage | Supabase Storage | — | Imágenes de productos |
| Realtime | Supabase Realtime (WebSockets) | — | Chat en vivo |
| Deploy FE | Vercel | — | CI/CD automático en push a main |
| Deploy BE | VPS propio (Docker) | — | FastAPI dockerizado |
| CI/CD | GitHub Actions | — | Tests en cada PR |

---

## 3. Arquitectura de capas

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                     │
│   Next.js 14 App Router · Zustand · Supabase JS Client       │
│   Tailwind CSS · TanStack Query (server state)               │
└───────────┬───────────────────────────────┬─────────────────┘
            │ REST (fetch)                  │ WebSocket
            ▼                               ▼
┌─────────────────────┐         ┌──────────────────────────┐
│    FastAPI (BE)      │         │   Supabase Realtime       │
│  /auth /productos    │         │   Canal: mensajes_chat    │
│  /pedidos /admin     │         │   Canal: consultas        │
│  /eventos /recos     │         └──────────────────────────┘
└──────────┬──────────┘
           │ supabase-py (service role key)
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL 15)                   │
│   Auth · Storage · RLS policies · Realtime                   │
└─────────────────────────────────────────────────────────────┘
```

### Decisión de arquitectura: dos clientes de Supabase

| Cliente | Dónde | Key usada | Bypass RLS |
|---------|-------|-----------|------------|
| `createClient()` | Frontend (browser) | `ANON_KEY` | No — respeta RLS |
| `get_supabase_client()` | Backend (FastAPI) | `SERVICE_ROLE_KEY` | Sí — acceso total |

El backend valida el JWT del usuario, aplica la lógica de negocio y usa la service role key para escribir en la base de datos. El frontend nunca recibe la service role key.

---

## 4. Estructura de carpetas

```
tienda/
├── frontend/
│   ├── app/
│   │   ├── (shop)/               # Rutas públicas de la tienda
│   │   │   ├── page.tsx          # Home
│   │   │   └── productos/
│   │   │       ├── page.tsx      # Catálogo con filtros
│   │   │       └── [slug]/       # Detalle de producto
│   │   ├── (auth)/               # Login y registro
│   │   ├── (cuenta)/             # Rutas privadas del usuario
│   │   │   ├── pedidos/          # Historial de pedidos
│   │   │   └── favoritos/        # Wishlist
│   │   ├── admin/                # Panel de administración
│   │   │   ├── layout.tsx        # Guard de rol + sidebar
│   │   │   ├── dashboard/
│   │   │   ├── productos/
│   │   │   ├── pedidos/
│   │   │   ├── categorias/
│   │   │   └── consultas/
│   │   ├── checkout/
│   │   └── layout.tsx            # Root layout (Navbar, CartDrawer, WhatsApp)
│   ├── components/
│   │   ├── layout/               # Navbar, Footer
│   │   ├── producto/             # ProductCard, Gallery, SizeSelector
│   │   ├── carrito/              # CartDrawer, CartItem
│   │   └── chat/                 # ChatWidget, MessageBubble
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useChat.ts
│   │   ├── useTracking.ts        # Fire-and-forget eventos de comportamiento
│   │   └── useWishlist.ts
│   ├── store/
│   │   └── cart.ts               # Zustand store con persist middleware
│   ├── lib/
│   │   └── supabase/client.ts    # createBrowserClient (anon key)
│   └── types/                    # Tipos de dominio compartidos
│
├── backend/
│   └── app/
│       ├── main.py               # CORS, routers, health check
│       ├── routers/
│       │   ├── auth.py           # POST /auth/login, /register, GET /me
│       │   ├── productos.py      # GET /productos/, /productos/{id}
│       │   ├── pedidos.py        # POST /pedidos, GET /pedidos/mis-pedidos
│       │   ├── admin.py          # CRUD admin (requiere rol admin)
│       │   ├── eventos.py        # POST /eventos (tracking)
│       │   └── recomendaciones.py# GET /recomendaciones/detalle
│       ├── models/               # Pydantic schemas (Create/Update/Response)
│       ├── services/             # Lógica de negocio desacoplada
│       ├── db/client.py          # get_supabase_client() con service role key
│       └── core/config.py        # Settings con pydantic-settings + lru_cache
│
├── supabase/
│   ├── migrations/               # 001–008: DDL incremental
│   └── seed.sql                  # 10 productos + variantes + lookbooks
│
└── docs/
    ├── progreso.md
    ├── arquitectura.md           # este archivo
    └── decisiones.md
```

---

## 5. Modelo de datos

```sql
-- Usuarios y autenticación
usuarios        (id uuid PK → auth.users, email, nombre, rol, whatsapp, created_at)
-- rol: 'cliente' | 'admin'

-- Catálogo
categorias      (id, nombre, slug, padre_id, complementos text[])
productos       (id, nombre, descripcion, precio, categoria_id, imagen_url, activo)
variantes       (id, producto_id, talla, color, stock, sku)

-- Comercio
pedidos         (id, usuario_id, estado, total, mp_preference_id, created_at)
-- estado: 'pendiente' | 'pagado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado'
items_pedido    (id, pedido_id, variante_id, cantidad, precio_unitario)
carritos        (id, usuario_id, variante_id, cantidad)
wishlist        (id, usuario_id, producto_id)

-- Comunicación
consultas       (id, producto_id, usuario_id, pregunta, respuesta, publico)
chats           (id, usuario_id, vendedora_id, created_at)
mensajes_chat   (id, chat_id, remitente_id, contenido, leido, created_at)

-- Motor de recomendaciones
eventos_usuario (id, session_id, usuario_id nullable, producto_id,
                 tipo_evento, peso, duracion_segundos, created_at)
perfil_intereses(id, session_id, usuario_id nullable,
                 categorias_ids, precio_min, precio_max,
                 tallas_interes, score_total, actualizado_en)
producto_similares(producto_id, similar_id, tipo_similitud, score, calculado_en)
-- tipo_similitud: 'colaborativo' | 'complementario'

-- Contenido
lookbooks       (id, titulo, portada_url, activo)
```

### Reglas de integridad
- **Soft delete siempre**: `activo = false` en productos, nunca `DELETE`
- **RLS habilitado** en todas las tablas con datos de usuario
- **Precio leído de BD en backend**: el frontend solo envía `variante_id + cantidad`, el precio nunca viene del cliente
- **session_id**: UUID generado en localStorage, identifica sesiones anónimas. Al login se asocia al `usuario_id` real

---

## 6. Seguridad

### Row Level Security (Supabase)
Cada tabla tiene políticas RLS. Ejemplos clave:

```sql
-- pedidos: solo el dueño puede ver los suyos
CREATE POLICY "usuario ve sus pedidos"
ON pedidos FOR SELECT
USING (auth.uid() = usuario_id);

-- usuarios: solo el propio perfil, no se puede ver el rol ajeno
CREATE POLICY "usuario ve su propio perfil"
ON usuarios FOR SELECT
USING (auth.uid() = id);
```

El backend usa `SERVICE_ROLE_KEY` que bypasea RLS. Esto es intencional: el backend valida el rol en código antes de operar.

### Guard de admin en FastAPI
```python
def require_admin(credentials, db):
    token = credentials.credentials
    user_resp = db.auth.get_user(token)          # valida JWT
    profile = db.table("usuarios")               # verifica rol en BD
        .select("rol").eq("id", user_id).single().execute()
    if profile.data.get("rol") != "admin":
        raise HTTPException(403, "Acceso restringido")
```

### Guard de admin en frontend
```tsx
// admin/layout.tsx — ejecutado antes de renderizar cualquier ruta /admin/*
const { data: { user } } = await supabase.auth.getUser();
const { data } = await supabase.from('usuarios').select('rol').eq('id', user.id).single();
if (data?.rol !== 'admin') router.replace('/');
```

Doble validación: frontend redirige, backend rechaza. Nunca solo uno.

### Registro seguro
El registro llama al backend (`POST /auth/register`) en vez de `supabase.auth.signUp()` directo. Esto garantiza que siempre se inserta la fila en `usuarios` con `rol: 'cliente'`. Si se llamara a Supabase directo, el usuario podría autenticarse sin fila en `usuarios` y el campo `rol` quedaría indefinido.

---

## 7. Flujos críticos

### Flujo de compra
```
1. Usuario agrega productos al carrito (Zustand + localStorage)
2. Va a /checkout → ve resumen
3. Hace click en "Confirmar" → POST /pedidos con { items: [{variante_id, cantidad}] }
4. Backend:
   a. Valida JWT
   b. Consulta stock en BD para cada variante
   c. Lee precio real de BD (nunca confía en el frontend)
   d. INSERT pedidos con total calculado en servidor
   e. INSERT items_pedido
5. Frontend limpia el carrito y redirige a /checkout/confirmado
6. Página de confirmado muestra CTA para pagar por WhatsApp/transferencia
```

### Flujo de auth + Navbar reactivo
```
1. Login → supabase.auth.signInWithPassword → JWT en cookie httpOnly
2. onAuthStateChange listener en Navbar detecta cambio de sesión
3. Navbar actualiza isLoggedIn, isAdmin sin recargar la página
4. Logout → supabase.auth.signOut → onAuthStateChange dispara con session=null
5. Navbar vuelve a estado de invitado en tiempo real
```

### Flujo de recomendaciones
```
1. Usuario entra a detalle de producto
2. useTracking.registrarEvento(productoId, 'vista') — fire & forget
3. POST /eventos → INSERT eventos_usuario (session_id + usuario_id si existe)
4. Al salir del producto: si > 30s → peso extra
5. GET /recomendaciones/detalle?producto_id=X&session_id=Y retorna:
   - completar_look: productos de categorías complementarias (pre-calculado)
   - otras_vieron:   collaborative filtering por co-ocurrencias de session_id
   - para_vos:       perfil on-the-fly si sesión tiene ≥ 3 eventos
6. Cron nocturno (02:00 AM) recalcula producto_similares y perfil_intereses
```

### Flujo de chat en tiempo real
```
1. Usuario abre ChatWidget → GET chats (crea si no existe)
2. Frontend suscribe a canal Supabase Realtime: mensajes_chat:chat_id=X
3. Usuario envía mensaje → INSERT mensajes_chat
4. Supabase broadcast → todos los suscriptores reciben el INSERT al instante
5. Admin en /admin/consultas ve el mismo canal en tiempo real
6. Respuesta del admin → INSERT con remitente_id=vendedora_id
```

---

## 8. Estado del cliente (Zustand)

El carrito es el único estado global complejo. Usa `persist` middleware de Zustand para sobrevivir recargas de página.

```typescript
// store/cart.ts — estructura del store
{
  items: CartItem[],       // productos en carrito
  total: number,           // calculado, nunca guardado en BD
  itemCount: number,       // badge del ícono
  isOpen: boolean,         // controla el CartDrawer

  addItem(item),           // respeta stock_disponible como máximo
  removeItem(id),
  updateQuantity(id, qty), // clampeado a stock_disponible
  clearCart(),
  openCart() / closeCart()
}
```

**Persistencia**: solo `items`, `total`, `itemCount` se serializan a `localStorage`. El estado de UI (`isOpen`) no se persiste.

---

## 9. Panel de administración

### Acceso y layout
- Guard doble: frontend (`admin/layout.tsx`) + backend (`require_admin`)
- Sidebar fijo desktop (`hidden md:flex`, `top-16`, `w-48`)
- Nav inferior mobile (`md:hidden fixed bottom-0`)
- Contenido con `pt-16 pb-16 md:pb-0` para no quedar tapado por Navbar o nav mobile

### Funcionalidades
| Sección | Operaciones |
|---------|-------------|
| Dashboard | Métricas del mes, últimos 5 pedidos, top 3 productos vendidos, stock bajo expandible |
| Productos | CRUD completo, imagen a Supabase Storage, variantes inline |
| Pedidos | Tabla paginada, filtros por estado, cambio de estado inline con select |
| Categorías | CRUD con slug autogenerado, modal crear/editar |
| Consultas | Lista de chats, mensajes en tiempo real, respuesta desde el panel |

### Validación de imágenes en backend
```python
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_MB = 5
# Verificación de content-type + tamaño antes de subir a Storage
```

---

## 10. Variables de entorno

```bash
# frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=              # URL del backend FastAPI
NEXT_PUBLIC_WA_NUMBER=            # número sin +, formato 5491112345678

# backend/.env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=        # NUNCA al frontend
JWT_SECRET=
MP_ACCESS_TOKEN=                  # MercadoPago (opcional si no se usa)
MP_WEBHOOK_SECRET=
RECO_EVENTOS_VENTANA_DIAS=30
RECO_SESION_MIN_EVENTOS=3
RECO_CRON_HORA=2
ENVIRONMENT=production
```

---

## 11. Deploy

### Frontend — Vercel
- Push a `main` → deploy automático
- Variables de entorno configuradas en dashboard de Vercel
- Dominio custom opcional

### Backend — VPS con Docker
```dockerfile
# Dockerfile (backend/)
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Deploy manual tras cada push:
```bash
cd /root/amanda
git pull origin main
docker compose -f docker-compose.prod.yml --env-file .env up -d --build amanda-backend
```

### CI/CD — GitHub Actions
- Tests de backend (pytest) y frontend (Jest) corren en cada PR
- No hace deploy automático al VPS (pendiente configurar secrets)

---

## 12. Diseño responsive — reglas y patrones

### Breakpoints (Tailwind defaults)
| Prefijo | Ancho mínimo | Uso |
|---------|-------------|-----|
| _(sin prefijo)_ | 0px | Mobile first — regla base |
| `sm:` | 640px | Teléfonos grandes / landscape |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktop pequeño |
| `xl:` | 1280px | Desktop normal |

### Reglas obligatorias

**Grids:**
- Nunca usar `grid-cols-N` sin breakpoints. Siempre empezar desde mobile:
  - 4 tarjetas: `grid-cols-2 lg:grid-cols-4`
  - 2 columnas laterales: `grid-cols-1 lg:grid-cols-2`
  - Grid de productos: `grid-cols-2 md:grid-cols-3 xl:grid-cols-4`

**Tablas con muchas columnas:**
- Siempre envolver con `overflow-x-auto` + `min-w-[Xpx]` interior:
```tsx
<div className="overflow-x-auto">
  <div className="min-w-[600px]">
    {/* tabla con grid-cols fijo */}
  </div>
</div>
```

**Paneles de dos columnas (ej: chat):**
- Mobile: mostrar uno u otro según estado activo (`hidden` / `flex`)
- Botón "← Volver" visible solo en mobile (`md:hidden`)
- Desktop: ambos paneles side by side (`md:flex-row`)

**Menú mobile:**
- Panel `fixed inset-0 top-16 z-40` — cubre toda la pantalla, no empuja el contenido

**Filtros en catálogo:**
- Mobile: `<select>` nativos compactos en una sola fila
- Desktop: sidebar fijo `hidden lg:block`

**Padding de contenedores:**
- Mobile: `px-4 py-6`
- Desktop: `px-6 md:px-8 py-8 md:py-12`

**Botones flotantes (WhatsApp, Chat):**
- Mobile: `bottom-20` para no tapar el contenido ni la barra del browser
- Desktop: `bottom-6`

**Overlays y modales:**
- Mobile: `fixed inset-0` o `mx-4` para que no se salgan de la pantalla

### Checklist antes de publicar una página nueva
- [ ] ¿El layout principal tiene `grid-cols-1 md:grid-cols-N`?
- [ ] ¿Las tablas tienen `overflow-x-auto`?
- [ ] ¿Los paneles dobles tienen modo mobile (hidden/flex toggle)?
- [ ] ¿Los botones flotantes están en `bottom-20` mobile?
- [ ] ¿Los modales tienen `mx-4` en mobile?
- [ ] ¿Se probó en viewport 375px (iPhone SE)?

---

## 13. Convenciones de código

### Frontend
- Componentes: `PascalCase` → `ProductCard.tsx`
- Hooks: prefijo `use` → `useWishlist.ts`
- `'use client'` solo cuando es necesario (estado, eventos, browser APIs)
- Rutas agrupadas con paréntesis: `(shop)`, `(auth)`, `(cuenta)` — no afectan la URL
- Estilos: solo Tailwind, sin CSS modules ni styled-components

### Backend
- Rutas: `snake_case` plural → `/productos`, `/admin/pedidos/{id}`
- Schemas Pydantic: `NombreCreate`, `NombreUpdate`, `NombreResponse`
- Errores: `HTTPException` con `detail` descriptivo en español
- Una función = una responsabilidad en `services/`
- Tests: pytest + anyio, un archivo por router

### Git
- Branches: `feature/nombre`, `fix/descripcion`
- Commits: `feat(módulo): descripción` / `fix: descripción`
- Merge directo a `main` (proyecto unipersonal, sin PR requerido)

---

## 14. Reglas críticas (no negociables)

1. `SUPABASE_SERVICE_ROLE_KEY` nunca va al frontend
2. RLS activo en todas las tablas con datos de usuario
3. Precio en pedidos: siempre leído de BD en backend, nunca del cliente
4. Stock validado en backend antes de crear pedido
5. Soft delete siempre: `activo = false`, nunca `DELETE`
6. Imágenes en Supabase Storage, nunca base64 en columnas de BD
7. Tracking de eventos: fire-and-forget, nunca bloquea la UI
8. Recomendaciones vacías: fallback a "novedades", nunca shelf vacío
9. Registro de usuario: siempre via backend para garantizar fila en `usuarios` con `rol: 'cliente'`
10. Chat: Supabase Realtime directo desde el cliente, no pasa por FastAPI

---

## 15. Deuda técnica conocida

| Item | Impacto | Prioridad |
|------|---------|-----------|
| Carrito no sincroniza con Supabase para usuarios logueados | Bajo (localStorage alcanza) | Baja |
| Cron de recomendaciones no implementado en VPS | Motor funciona en modo on-the-fly | Media |
| Deploy backend no automatizado (manual en VPS) | Fricción en cada release | Media |
| Sin paginación en catálogo | Performance con >50 productos | Baja |
| Sin `generateMetadata` por producto | SEO subóptimo | Baja |

---

## 16. Próximas funcionalidades sugeridas

| Feature | Complejidad | Valor |
|---------|-------------|-------|
| Paginación catálogo (cargar más) | Baja | Media |
| SEO dinámico por producto (`og:image`, `og:title`) | Baja | Alta |
| Zoom / lightbox en galería de producto | Media | Media |
| Compartir producto por WhatsApp | Baja | Media |
| Deploy automático backend en VPS (GitHub Actions + SSH) | Media | Alta |
