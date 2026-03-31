# Progreso — Boutique de Moda Online

> Actualizar al completar cada tarea. Fecha de última actualización: 2026-03-30.

---

## Estado general

```
Fase actual: Fase 4 — Catálogo ✅ COMPLETADA
Próximo paso: Fase 5 — Carrito y Checkout
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

### Fase 5 — Carrito y Checkout
- [ ] Zustand store del carrito
- [ ] Persistencia en localStorage (guest) y Supabase (logueado)
- [ ] CartDrawer component
- [ ] Integración MercadoPago Checkout Pro
- [ ] Webhook de confirmación de pago
- [ ] Estados del pedido (pendiente → pagado → preparando → enviado → entregado)
- [ ] Crear `skills/mercadopago.md`

### Fase 6 — Chat en tiempo real
- [ ] Chat público por producto (preguntas y respuestas)
- [ ] Chat privado con la vendedora
- [ ] Supabase Realtime (directo desde frontend, sin FastAPI)
- [ ] Componentes: ChatWidget, MessageBubble
- [ ] Crear `skills/chat-realtime.md`

### Fase 7 — Motor de recomendaciones
- [ ] Registro de eventos de comportamiento (`useTracking`)
- [ ] Router `/eventos` en FastAPI
- [ ] Router `/recomendaciones` en FastAPI
- [ ] Servicio de recomendaciones (collaborative + complementario + para vos)
- [ ] Componentes: RecoShelf, RecoCard, CompletarLook
- [ ] Cron job nocturno de pre-cálculo (02:00 AM)
- [ ] Crear `skills/motor-recomendaciones.md`

### Fase 8 — Panel admin
- [ ] Rutas protegidas por rol `admin`
- [ ] CRUD de productos con subida de imágenes (Supabase Storage)
- [ ] Kanban de pedidos por estado
- [ ] Bandeja de consultas
- [ ] Analytics básico (ventas/día, productos más vistos, tasa de conversión)

### Fase 9 — WhatsApp
- [ ] Ícono flotante con enlace `https://wa.me/{NEXT_PUBLIC_WA_NUMBER}`
- [ ] Mensaje pre-formateado con nombre del producto en cada página de detalle

---

## Bloqueado

_Nada bloqueado actualmente._

---

## Decisiones tomadas

> Ver `docs/decisiones.md` para el detalle de cada una.

- WhatsApp: solo enlace web (`wa.me`), sin API
