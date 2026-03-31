# chat-realtime.md

## Chat en tiempo real con Supabase Realtime

### Tipos de chat
1. **Público por producto**: preguntas visibles para todas
2. **Privado**: solo entre usuaria y vendedora

### Flujo
- Supabase Realtime (WebSockets) escucha cambios en tabla `mensajes_chat`
- No pasa por FastAPI
- Realtime broadcast automático

### Hook useRealtime
```ts
const { mensajes } = useRealtime('chat/{id}');
```

### Tabla mensajes_chat
- id, chat_id, remitente_id, contenido, leido, created_at
