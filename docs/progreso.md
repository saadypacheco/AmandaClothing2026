# Progreso — Boutique de Moda Online

> Actualizar al completar cada tarea. Fecha de última actualización: 2026-05-16.

---

## Estado general

```
Fase actual: Modo mayorista B2B implementado (Fases 0-8)
Próximo paso: Probar flujo end-to-end, ejecutar migración 015 en una Supabase de staging
```

---

## Modo mayorista B2B (2026-05)

El SaaS pasó de ser solo minorista a soportar también **B2B mayorista**. Cada deploy
elige su modo en onboarding (`minorista` o `mayorista`). Amanda Clothing queda en
modo minorista y no se ve afectada — todo el desarrollo va detrás del flag.

Plan completo: ver `docs/decisiones.md` y `skills/mayorista-b2b.md`.

### ✅ Fase 0 — Cimientos del data model
- [x] Migración 015 con: `tienda_config.modo`, campos B2B en `usuarios`/`productos`/`pedidos`, tablas `listas_precio`, `precios_lista`, `cuentas_corriente`, `movimientos_cc`, `atributo_definicion`, `atributo_valor_variante`

### ✅ Fase 1 — Onboarding mayorista
- [x] Registro mayorista crea cuenta con `estado_cuenta='pendiente'`
- [x] Bandeja `/admin/cuentas` con cuentas pendientes y activas
- [x] Endpoint aprobación: asigna lista de precios + condición de pago + crea CC
- [x] Middleware: si `modo='mayorista'` redirige a `/login` o `/cuenta-pendiente`

### ✅ Fase 2 — Listas de precios
- [x] CRUD `/admin/listas-precio` con import CSV
- [x] Función `resolver_precio(usuario, variante)` con orden de precedencia
- [x] Frontend muestra precio de la lista del cliente logueado

### ✅ Fase 3 — Checkout multi-método
- [x] Selector en checkout: MP / cuenta corriente / transferencia / cotización
- [x] Subida de comprobante para transferencia
- [x] Flujo "cotización" entra como estado `cotizado`

### ✅ Fase 4 — Workflow de pedidos B2B
- [x] Estados nuevos: `borrador → cotizado → pendiente_aprobacion → aprobado → preparacion → despacho → entregado → facturado`
- [x] Auto-aprobación por monto configurable
- [x] Vista admin "Pedidos a aprobar" con un click

### ✅ Fase 5 — Cuenta corriente
- [x] Movimientos (`cargo`, `pago`, `nota_credito`, `nota_debito`) con vencimiento
- [x] Saldo recalculado desde movimientos (no in-place)
- [x] Alertas: deuda vencida, exceso de límite de crédito
- [x] Estado de cuenta exportable

### ✅ Fase 6 — Reportes y analytics
- [x] Ventas por cliente / producto / período
- [x] ABC de productos (Pareto)
- [x] Margen bruto (requiere `productos.costo` cargado)
- [x] Cobranzas: deuda total, vencida, próximos vencimientos
- [x] Export CSV de cada reporte

### ✅ Fase 7 — Dashboard mayorista
- [x] Cuando `modo='mayorista'`, el dashboard renderiza widgets B2B
- [x] KPIs: cobranzas vencidas, pendientes de aprobación, ventas vs mes anterior, top clientes, stock crítico, pagos a vencer

### ✅ Fase 8 — Atributos dinámicos
- [x] Tablas `atributo_definicion` + `atributo_valor_variante`
- [x] Editor de atributos en categoría
- [x] Formulario de variante con campos dinámicos según categoría
- [x] Catálogo no-ropa habilitado (talles → cualquier dimensión)

---

## Conversión a plataforma SaaS white-label (2026-04)

El proyecto pasó de ser "una tienda" a **"un template replicable"**.
Cada cliente tiene su propio deploy con su propia Supabase; la marca (nombre,
logo, colores, textos, moneda) es configurable desde el panel admin.

### ✅ Fase 1 — Config dinámica (hecho)
- [x] Tabla `tienda_config` (migración 013) con grupos: marca, contacto, home, pago, ia, sitio
- [x] Backend: router `/config` (público) + `/admin/config` (PATCH + bulk)
- [x] Frontend: hook `useTiendaConfig` con caché localStorage (TTL 5 min)
- [x] Admin: `/admin/configuracion` edita todos los valores
- [x] Refactor de componentes: Navbar, CartDrawer, ChatWidget, checkout, login, registro, ProductoChat, WhatsAppButton, layout.tsx (metadata dinámica), page.tsx (home)
- [x] Backend: `agente.py` y `social.py` leen de `tienda_config`

### ✅ Fase 2 — Branding visual dinámico (hecho)
- [x] Migración 014 agrega grupo `branding`: 6 colores + 2 font stacks
- [x] Tailwind con CSS variables: clases `amanda-*` y `brand-*` resuelven a `var(--color-*)`
- [x] `BrandingStyles` server component inyecta las CSS vars en `<head>`
- [x] Navbar renderiza `logo_url` como `<img>` si está seteado, sino texto
- [x] `tienda_config.color_*` editable desde admin y onboarding

### ✅ Fase 3 — Moneda configurable (parcial: solo moneda, NO i18n)
- [x] `moneda_codigo` (ISO 4217) + `moneda_locale` + `moneda_simbolo` en config
- [x] Helper `formatPriceWith(config, precio)` usa `Intl.NumberFormat`
- [x] `useTiendaConfig.formatPrice()` expuesto al frontend
- [x] Refactor de ProductCard, RecoShelf, OfertasShelf, CartDrawer, checkout, ProductoDetalleContent, `/pedidos` — todos usan `formatPrice` del hook
- [ ] **NO se hace**: traducción de strings UI (i18n). Se pospone hasta primer cliente no-AR

### ✅ Fase 4 — Script de deploy de cliente (hecho)
- [x] `scripts/crear-tienda.sh <cliente> <dominio> <wa_numero>`: clona repo en `/docker/<cliente>/`, genera `docker-compose.yml` con labels Traefik, `.env` templates, `seed_cliente.sql`
- [x] `docs/deploy-cliente-nuevo.md` — guía paso a paso (Supabase, DNS, Let's Encrypt, creación de admin)

### ✅ Fase 5 — Wizard de onboarding (hecho)
- [x] `/admin/onboarding` con 4 pasos: Identidad, Contacto, Branding, Home
- [x] Paleta de colores con 5 presets + custom (color picker HTML5)
- [x] Selector de moneda (ARS/USD/EUR/MXN/CLP/PEN/UYU/BRL)
- [x] Al finalizar: `onboarding_completado = true` + invalidar caché
- [x] Banner en `/admin/dashboard` si onboarding pendiente

### 🚫 Lo que NO se hace en esta tanda
- **i18n de strings UI** (traducción a otros idiomas). Los textos fijos del sitio siguen en español-AR. Se hará cuando entre el primer cliente que requiera otro idioma.
- **Tema oscuro**. Los colores son paleta única; agregar variantes dark es trivial pero no pedido.
- **Sistema multi-tienda desde una sola BD**. Cada cliente tiene su propia Supabase (decisión arquitectónica: aislamiento completo, escala independiente).
- **Billing/suscripciones automáticas**. El cobro se maneja offline / MercadoPago manual por ahora. Stripe o Lemon Squeezy se evaluará con 3+ clientes.

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

## Próximas mejoras

### 🔴 Alta prioridad
- [x] **Guardar pedido al confirmar pago** — `POST /pedidos` desde checkout, si el usuario está logueado guarda en `pedidos` + `items_pedido`. Guest checkout pasa igual.
- [x] **Página "Mis pedidos"** — `/pedidos` con historial, estado y detalle expandible por pedido. Link en Navbar para usuarios logueados.

### 🟡 Media prioridad
- [x] **Wishlist UI** — corazón en `ProductCard`, hook `useWishlist`, página `/favoritos`. Link en Navbar para logueados.
- [x] **Bandeja de consultas en admin** — `/admin/consultas` con lista de chats, mensajes y respuesta desde el panel. Backend endpoints en `admin.py`.
- [x] **Stock bajo detallado en dashboard** — tarjeta clickable que expande lista de productos con talla/color y stock crítico (rojo si 0, ámbar si ≤ 3).

### 🔴 Bugs pendientes
- [x] **Layout mobile roto en admin** — sidebar oculto en mobile, reemplazado por nav inferior fija.
- [x] **Imagen en alta de producto** — modal de nuevo producto incluye campo de imagen opcional.

- [x] **Guest checkout** — nombre + teléfono sin cuenta, número de pedido visible, CTA crear cuenta post-compra, vinculación de pedidos por teléfono al registrarse.
- [x] **Galería multi-imagen** — hasta 4 fotos por producto, upload/delete en admin, thumbnails en detalle.
- [x] **Precio tachado + badges** — OFERTA %, NUEVO, ÚLTIMAS en cards y detalle. Migración 011.
- [x] **Sección Rebajas en home** — OfertasShelf con scroll horizontal, se oculta si no hay ofertas.
- [x] **Agente IA 24/7** — Gemini 2.0 Flash responde automáticamente en el chat de producto. Migración 012. Fácil migración a Claude.
- [x] **Fix chats vacíos** — chat se crea solo al enviar el primer mensaje, no al abrir la página.

### 🟡 Pendiente de activar en producción
- [ ] Ejecutar migración 011 en Supabase (precio_original, es_nuevo, oferta_hasta)
- [ ] Ejecutar migración 012 en Supabase (remitente_id nullable, es_bot)
- [ ] Agregar GEMINI_API_KEY al .env del VPS y rebuildar backend

### 🟢 Baja prioridad
- [ ] **Paginación en catálogo** — botón "cargar más" cuando hay más de 20 productos.
- [ ] **SEO dinámico** — `og:title` y `og:image` por producto con Next.js `generateMetadata`.
- [ ] **Zoom en imágenes** — lightbox al hacer click en la foto del producto.
- [ ] **Compartir producto** — botón copiar link / compartir por WhatsApp desde la página de detalle.

---

## Bloqueado

_Nada bloqueado actualmente._

---

## Decisiones tomadas

- WhatsApp: solo enlace web (`wa.me`), sin API
- Búsqueda: filtrado en Python para evitar error Cloudflare con Supabase `ilike`
- Registro: llama al backend para garantizar integridad de `usuarios` (no `signUp` directo)
- Admin sidebar: mismo estilo visual que sidebar de la tienda (texto, sin íconos)
