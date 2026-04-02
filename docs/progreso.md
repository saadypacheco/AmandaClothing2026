# Progreso — Boutique de Moda Online

> Actualizar al completar cada tarea. Fecha de última actualización: 2026-04-01.

---

## Estado general

```
Fase actual: Completada hasta Fase 9 + mejoras post-lanzamiento
Próximo paso: Tests E2E, kanban de pedidos, bandeja de consultas
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

- [x] **Fase 2 — Auth**
  - [x] Cliente Supabase SSR en `lib/supabase/client.ts`
  - [x] Hook `useAuth` con login, register, logout, estado de usuario
  - [x] Páginas `/login` y `/registro` con formulario y validación
  - [x] Router `/auth` con endpoints: POST /auth/login, POST /auth/register, GET /auth/me, POST /auth/logout
  - [x] **Fix**: `register` ahora llama al backend (no `supabase.auth.signUp()` directo) para garantizar fila en `usuarios` con `rol: 'cliente'`

- [x] **Fase 3 — Modelo de datos SQL**
  - [x] Migraciones 001–007: usuarios, categorías, productos, variantes, pedidos, carritos, wishlist, consultas, chats, mensajes_chat, eventos, lookbooks, storage buckets
  - [x] RLS habilitado en todas las tablas con datos de usuario
  - [x] seed.sql con 10 productos + variantes + 3 lookbooks

- [x] **Fase 4 — Catálogo (lectura)**
  - [x] Router `/productos` en FastAPI con GET /productos/ y GET /productos/{id}
  - [x] Filtros por categoría (por slug), talla, color, precio
  - [x] Búsqueda full-text filtrada en Python (evita error Cloudflare 1101 con Supabase ilike)
  - [x] Página catálogo `/productos` con grid y filtros + debounce 400ms
  - [x] Página detalle `/productos/[id]` con galería, selector talla/color, badge stock bajo
  - [x] Error inline (no bloquea la página) cuando falla la búsqueda

- [x] **Fase 5 — Carrito y Checkout**
  - [x] Zustand store del carrito (localStorage persist)
  - [x] CartDrawer component
  - [x] Página `/checkout` con resumen + alias AMANDA.CLOTHING
  - [x] Página `/checkout/confirmado` con CTA WhatsApp

- [x] **Fase 6 — Chat en tiempo real**
  - [x] ChatWidget flotante + ProductoChat inline
  - [x] Supabase Realtime (suscripción INSERT en mensajes_chat)
  - [x] `useChat` hook completo

- [x] **Fase 7 — Motor de recomendaciones**
  - [x] `useTracking` hook: fire-and-forget
  - [x] `POST /eventos` y `GET /recomendaciones`
  - [x] `RecoShelf` component con fallback a novedades

- [x] **Fase 8 — Panel admin**
  - [x] Rutas protegidas por rol `admin` (frontend + backend)
  - [x] Layout sidebar blanco/minimal, estilo igual al sidebar de la tienda
  - [x] Sidebar fijo `top-16` (debajo del Navbar), `bg-stone-50`
  - [x] Contenido con `pt-16` para no quedar tapado por el Navbar
  - [x] Dashboard `/admin/dashboard`:
    - [x] 4 métricas con borde izquierdo de color por categoría (emerald/amber/blue/rose)
    - [x] Últimos 5 pedidos con badges de color
    - [x] Top 3 productos con barra y círculos numerados
  - [x] Productos `/admin/productos`: CRUD completo, imagen, variantes
  - [x] Pedidos `/admin/pedidos`: tabla con filas alternas, badges de estado, filtros pill, select inline
  - [x] Categorías `/admin/categorias`: tabla + modal crear/editar con slug autogenerado
  - [x] Todas las tablas: header `bg-stone-100`, filas alternas `bg-stone-50/40`, bordes `stone-200`
  - [x] Backend: endpoints CRUD completos para productos, variantes, categorías
  - [x] Redirect `/admin` → `/admin/dashboard`

- [x] **Fase 9 — WhatsApp**
  - [x] Ícono flotante con enlace `wa.me/5491133821989`

- [x] **Navbar**
  - [x] Link "Admin" visible solo para usuarios con `rol: 'admin'`
  - [x] Link "Admin" también en menú mobile

- [x] **Tests & CI**
  - [x] Backend: 22 tests con pytest + anyio (admin auth, productos, health)
  - [x] Frontend: 14 tests con Jest + RTL (cart store, ProductCard)
  - [x] CI: GitHub Actions corre tests reales en cada PR

---

## Bugs corregidos

- [x] Búsqueda devuelve error 500 → filtrado Python-side (evita Cloudflare 1101)
- [x] Filtro de categoría roto (slug vs ID) → backend acepta `categoria_slug` directamente
- [x] "Auth session missing" mostrado en login → ya no se muestra como error
- [x] Usuario admin redirigido a home tras login → fix de política RLS recursiva en `usuarios`
- [x] Registro creaba usuario sin fila en `usuarios` → register llama al backend
- [x] Imágenes Unsplash no cargaban → agregado a `remotePatterns` en next.config.js
- [x] Sidebar admin tapado por Navbar → sidebar `top-16`, main `pt-16`

---

## Bloqueado

_Nada bloqueado actualmente._

---

## Decisiones tomadas

- WhatsApp: solo enlace web (`wa.me`), sin API
- Búsqueda: filtrado en Python para evitar error Cloudflare con Supabase `ilike`
- Registro: llama al backend para garantizar integridad de `usuarios` (no `signUp` directo)
- Admin sidebar: mismo estilo visual que sidebar de la tienda (texto, sin íconos)
