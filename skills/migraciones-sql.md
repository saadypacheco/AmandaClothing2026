# Fase 3 — Modelo de datos SQL completo

## Resumen de migraciones

Todas las migraciones están en `supabase/migrations/`:

1. **001_create_usuarios_table.sql** — Usuarios, categorías, productos, variantes + RLS
2. **002_create_pedidos_and_carrito.sql** — Pedidos, items de pedido, carrito + RLS
3. **003_create_wishlist_and_consultas.sql** — Wishlist, consultas de productos + RLS
4. **004_create_chat.sql** — Chats, mensajes, Realtime + RLS
5. **005_create_eventos_and_recomendaciones.sql** — Eventos, perfil de intereses, similitud
6. **006_create_lookbooks.sql** — Lookbooks y productos en lookbooks + RLS
7. **007_create_storage_buckets.sql** — Buckets de Supabase Storage + Object RLS

## Instrucciones para aplicar

### Option 1: Supabase Dashboard (recomendado)

1. Ve a tu proyecto Supabase
2. SQL Editor > New Query
3. Copia el contenido de cada migración (en orden) y ejecuta
4. Luego ejecuta `seed.sql` para datos de ejemplo

### Option 2: CLI de Supabase

```bash
# Instalar CLI (si no lo tienes)
npm install -g supabase

# Link con tu proyecto
supabase link --project-ref <project-id>

# Ejecutar migraciones
supabase migration up

# Ejecutar seed
psql $SUPABASE_DB_URL -f supabase/seed.sql
```

## Características de RLS

### Por tabla

- **usuarios**: Solo ven su perfil; admins ven todo
- **productos**: Todos ven productos activos; solo admins pueden modificar
- **variantes**: Todos ven variantes de productos activos; solo admins pueden modificar
- **pedidos**: Usuarios ven sus pedidos; admins ven todos
- **carrito**: Usuarios solo ven su carrito
- **wishlist**: Usuarios solo ven su wishlist
- **consultas**: Todos ven consultas públicas; usuarios ven sus consultas
- **chats**: Usuarios ven sus chats; admins ven todos
- **mensajes_chat**: Usuarios ven mensajes de sus chats
- **Storage**: Productos y lookbooks públicos; avatares privados; admins acceso total

## Índices creados

Para optimizar queries:

- `usuarios.email` (UNIQUE)
- `productos` (categoria, activo)
- `carritos.usuario_id`
- `pedidos` (usuario, estado, created_at)
- `eventos_usuario` (session, usuario, producto, tipo, fecha)
- `perfil_intereses` (session, usuario)
- `producto_similares` (producto, tipo)
- `chats` (tipo, producto, usuario)
- `mensajes_chat` (chat, leido)

## Realtime

Habilitado en:

- `mensajes_chat` → actualizaciones en tiempo real para chat

## Storage buckets

- `productos/` — público, imágenes de productos
- `lookbooks/` — público, portadas de lookbooks
- `avatares/` — privado, avatares de usuarios

## Notas importantes

1. **RLS activo**: Todas las tablas con datos de usuario tienen Row Level Security
2. **Soft delete**: No hay DELETE statements; se usa `activo = false`
3. **Cascadas**: ON DELETE CASCADE donde aplicable para integridad referencial
4. **Índices**: Optimizados para queries más comunes
5. **Eventos sin RLS**: `eventos_usuario` no tiene RLS — backend escribe silenciosamente
6. **UUID para usuarios**: Vinculado directamente a `auth.users(id)` de Supabase Auth
