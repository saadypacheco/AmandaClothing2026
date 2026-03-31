# crear-producto.md

## Cómo crear un nuevo producto

### En el panel admin
1. Navegar a Admin > Productos > Nuevo
2. Llenar:
   - Nombre
   - Descripción
   - Precio
   - Categoría
   - Imágenes (4+ fotos)
3. Guardar
4. Agregar variantes (talla/color/stock)

### Desde FastAPI
POST /productos
```json
{
  "nombre": "...",
  "descripcion": "...",
  "precio": 0,
  "categoria_id": 1,
  "activo": true
}
```

Luego agregar variantes:
POST /productos/{id}/variantes
```json
{
  "talla": "M",
  "color": "Negro",
  "stock": 10,
  "sku": "..."
}
```
