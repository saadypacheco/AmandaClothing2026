# Progreso — Boutique de Moda Online

> Actualizar al completar cada tarea. Fecha de última actualización: 2026-04-01.

---

## Estado general

```
Fase actual: Completada hasta Fase 9
Próximo paso: Mejoras — tests E2E, kanban de pedidos, bandeja de consultas
```

---

## Hecho

- [x] AGENTS.md — visión, stack, módulos, modelo de datos, reglas críticas
- [x] CLAUDE.md — reglas de trabajo con Claude Code
- [x] docs/progreso.md — este archivo
- [x] **Fase 1 — Scaffold**
  - [x] Estructura de carpetas completa (frontend, backend, supabase, skills)
  - [x] Next.js 14 con App Router + TypeScript + Tailwind CSS
  - [x] FastAPI con estructura modular (routers, models, services, db, core)
  - [x] package.json con dependencias (Zustand, TanStack Query, Supabase client)
  - [x] requirements.txt con dependencias Python
  - [x] Configuración base: tsconfig.json, next.config.js, tailwind.config.js, postcss.config.js
  - [x] archivos `.env.local` (frontend) y `.env` (backend) con variables vacías
  - [x] `.gitignore` para ambos proyectos
  - [x] `app/layout.tsx` y `app/globals.css` base
  - [x] `app/main.py` con CORS y health check
  - [x] Dockerfile para backend
  - [x] supabase/seed.sql (plantilla)
  - [x] Guías iniciales en skills/ (crear-producto, mercadopago, chat, tracking, motor-recomendaciones, ci-cd)

- [x] **Fase 2 — Auth**
  - [x] Cliente Supabase SSR en `lib/supabase/client.ts`
  - [x] Tipos TypeScript en `lib/supabase/types.ts`
  - [x] Hook `useAuth` con login, register, logout, estado de usuario
  - [x] Componentes UI: `Button` y `Input` con validación
  - [x] Página `/login` con formulario y validación
  - [x] Página `/registro` con formulario y validación
  - [x] Layout auth con fondo gradiente
  - [x] Modelos Pydantic en `app/models/usuario.py`: Usuario, Login, Register
  - [x] Router `/auth` con endpoints:
    - POST /auth/login
    - POST /auth/register
    - GET /auth/me (requiere token)
    - POST /auth/logout
  - [x] Middleware de validación de token en FastAPI
  - [x] Guía en `skills/auth-supabase.md`

- [x] **Fase 3 — Modelo de datos SQL**
  - [x] Migración 001: usuarios, categorías, productos, variantes (+ RLS)
  - [x] Migración 002: pedidos, items_pedido, carritos (+ RLS)
  - [x] Migración 003: wishlist, consultas (+ RLS)
  - [x] Migración 004: chats, mensajes_chat, Realtime (+ RLS)
  - [x] Migración 005: eventos_usuario, perfil_intereses, producto_similares
  - [x] Migración 006: lookbooks y lookbook_productos (+ RLS)
  - [x] Migración 007: Storage buckets (productos, lookbooks, avatares) con RLS
  - [x] Índices optimizados en todas las tablas críticas
  - [x] RLS habilitado en todas las tablas con datos de usuario
  - [x] seed.sql con 10 productos + variantes + 3 lookbooks de ejemplo
  - [x] Guía en `skills/migraciones-sql.md`

- [x] **Fase 4 — Catálogo (lectura)**
  - [x] Modelos Pydantic para productos, variantes, categorías
  - [x] Router `/productos` en FastAPI con endpoints GET /productos/ y GET /productos/{id}
  - [x] Filtros por categoría, talla, color, precio, búsqueda full-text
  - [x] Servidor FastAPI funcionando con productos router incluido
  - [x] Página catálogo con grid y filtros (`/productos`)
  - [x] Componente `ProductCard` reutilizable
  - [x] Tipos TypeScript en `types/producto.ts`
  - [x] Filtros funcionales con URL params
  - [x] Página detalle de producto (`/productos/[id]`)
  - [x] Galería de fotos (placeholder con Supabase Storage ready)
  - [x] Selector de talla y color interactivo
  - [x] Badge "pocas unidades" (stock ≤ 3)
  - [x] Componentes reutilizables: ProductGallery, SizeSelector, ColorSelector
  - [x] Servidor Next.js funcionando correctamente

### Fase 5 — Carrito y Checkout ✅ COMPLETADA
- [x] Zustand store del carrito (localStorage persist)
- [x] CartDrawer component (estilo Amanda editorial)
- [x] WhatsApp floating button (+5491133821989)
- [x] Página `/checkout` con resumen + QR placeholder + alias AMANDA.CLOTHING
- [x] Página `/checkout/confirmado` con CTA WhatsApp
- [ ] Estados del pedido guardados en Supabase (pendiente)

### Fase 6 — Chat en tiempo real ✅ COMPLETADA
- [x] Chat privado con Amanda (`ChatWidget` flotante, bottom-left)
- [x] Chat por producto (`ProductoChat` inline en detalle)
- [x] Supabase Realtime (suscripción INSERT en mensajes_chat)
- [x] `useChat` hook: getOrCreateChat, cargarMensajes, enviarMensaje, Realtime

### Fase 7 — Motor de recomendaciones ✅ COMPLETADA
- [x] `useTracking` hook: session_id en sessionStorage, fire-and-forget
- [x] `POST /eventos`: registro silencioso (vista/wishlist/carrito/compra)
- [x] `GET /recomendaciones`: similares → misma categoría → historial → novedades
- [x] `RecoShelf` component: scroll horizontal, skeleton loading, nunca vacío
- [x] Tracking en página de detalle (vista al montar, carrito al agregar)
- [x] Home: novedades dinámicas reemplazando placeholders estáticos

### Fase 8 — Panel admin ✅ COMPLETADA
- [x] Rutas `/admin/productos`
- [x] CRUD productos: crear, editar precio/estado, subir imagen (Supabase Storage)
- [x] CRUD variantes: crear, editar stock/talla/color/sku, eliminar (soft delete)
- [x] Rutas protegidas por rol `admin` (frontend: layout.tsx + backend: require_admin dep)
- [x] `authFetch` helper en admin: inyecta Bearer token en todas las llamadas
- [x] Sidebar lateral en layout admin con navegación completa
- [x] Dashboard (`/admin/dashboard`): métricas 2x2 (ventas mes, pedidos pendientes, pedidos hoy, stock bajo) + últimos 5 pedidos + top 3 productos vendidos
- [x] Pedidos (`/admin/pedidos`): tabla con email cliente, badges por estado con colores, select para cambiar estado (update directo a Supabase)
- [x] Categorías (`/admin/categorias`): tabla + modal inline para crear con slug autogenerado
- [x] Backend: `POST /admin/categorias` endpoint
- [x] Redirect `/admin` → `/admin/dashboard`

### Fase 9 — WhatsApp ✅ COMPLETADA
- [x] Ícono flotante con enlace `wa.me/5491133821989`

### Tests & CI ✅ COMPLETADO
- [x] Backend: 22 tests con pytest + anyio (admin auth, productos, health)
- [x] Frontend: 14 tests con Jest + RTL (cart store, ProductCard)
- [x] CI: GitHub Actions corre tests reales en cada PR (sin curl ni servidores efímeros)
- [x] Bug fix: links de categoría (slug → ID resolution via GET /categorias)

---

## Bloqueado

_Nada bloqueado actualmente._

---

## Decisiones tomadas

> Ver `docs/decisiones.md` para el detalle de cada una.

- WhatsApp: solo enlace web (`wa.me`), sin API
