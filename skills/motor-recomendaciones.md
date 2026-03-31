# motor-recomendaciones.md

## Motor de recomendaciones

### Tres tipos de recomendación

#### 1. Completá el look (4 cards)
Productos complementarios + afinidad de estilo
- Basado en `categorias.complementos[]`
- Ordenado por similitud de precio

#### 2. Otras también vieron (6 cards)
Collaborative filtering light
- Co-ocurrencias de sesión en últimos 30 días
- Usa tabla pre-calculada `producto_similares`

#### 3. Para vos (8 cards)
Perfil de la sesión actual
- Mínimo 3 eventos para mostrar
- Suma: categorías vistas + rango de precio + tallas
- Excluye productos ya vistos

### Cron nocturno (02:00)
1. TRUNCATE producto_similares
2. Collaborative filtering: co-ocurrencias
3. Complementarios: query por categorías
4. Actualiza perfil_intereses de usuarios activos

### Endpoint
GET /recomendaciones/detalle?producto_id=X&session_id=Y
Devuelve: { completar_look, otras_vieron, para_vos }
