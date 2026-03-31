# tracking-eventos.md

## Registro de eventos de comportamiento

### Fire-and-forget
No bloquea la UI. POST /eventos → insert asincrónico.

### Tipos de evento
- vista: peso 1
- vista > 30s: +2
- wishlist: 3
- carrito: 5
- compra: 10

### Hook useTracking
```ts
const { registrarEvento } = useTracking();
registrarEvento(productoId, 'vista');
```

### Tabla eventos_usuario
- id, session_id, usuario_id, producto_id, tipo_evento, peso, duracion_segundos, created_at
- usuario_id puede ser NULL (sesión anónim
