# CLAUDE.md — Boutique de Moda Online

> Este archivo es leído automáticamente por Claude Code en cada sesión.
> Contiene las reglas de trabajo, no la lógica del proyecto (eso está en AGENTS.md).

---

## Archivos clave

| Archivo | Qué contiene |
|---------|-------------|
| `AGENTS.md` | Visión, stack, módulos, modelo de datos, reglas críticas |
| `docs/progreso.md` | Estado actual: qué está hecho, en progreso, bloqueado |
| `docs/decisiones.md` | Por qué se eligió X sobre Y (crear cuando haya decisiones) |
| `skills/*.md` | Guías técnicas detalladas por feature (crear al implementar cada una) |

---

## Cómo trabajamos

### Antes de escribir código
- Leer siempre el archivo antes de editarlo
- Si el cambio toca más de 2 archivos, confirmar el approach primero
- Si hay ambigüedad en el requerimiento, preguntar antes de asumir

### Al escribir código
- Seguir las convenciones de AGENTS.md §6 (PascalCase FE, snake_case BE, etc.)
- Respetar las reglas críticas de AGENTS.md §8 sin excepción
- No agregar dependencias sin preguntar
- No crear archivos de documentación salvo que se pida explícitamente
- No refactorizar código adyacente que no fue pedido

### Al terminar una tarea
- Actualizar `docs/progreso.md` marcando lo completado
- Si se tomó una decisión no obvia, agregarla a `docs/decisiones.md`

---

## Lo que NO hacer

- No usar `DELETE` en base de datos — siempre `activo = false`
- No poner `SUPABASE_SERVICE_ROLE_KEY` en ningún archivo del frontend
- No bloquear la UI con el registro de eventos (fire-and-forget)
- No mostrar shelves de recomendaciones vacíos — fallback a "novedades"
- No commitear archivos `.env` ni `.env.local`

---

## Orden de implementación acordado

1. Scaffold (estructura de carpetas, dependencias, variables de entorno vacías)
2. Auth (Supabase login/registro)
3. Migraciones SQL (modelo de datos completo)
4. Catálogo solo lectura (productos + variantes + filtros)
5. Carrito + Checkout (MercadoPago)
6. Chat en tiempo real (Supabase Realtime)
7. Motor de recomendaciones
8. Panel admin
9. WhatsApp (ícono enlace web — trivial, va al final)

---

## Entorno

- Frontend: `cd frontend && npm run dev` → http://localhost:3000
- Backend: `cd backend && uvicorn app.main:app --reload` → http://localhost:8000
- Supabase: instancia en la nube (no local)
