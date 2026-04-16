# Video demo TiendaIA — Storyboard de producción

**Duración:** 2:30–3:00
**Formato:** Screen recording del sitio real + voz en off + subtítulos
**Sitio a grabar:** https://amandaclouthing.cloud (producción)
**Admin:** https://amandaclouthing.cloud/admin
**Landing:** https://amandaclouthing.cloud/software

---

## Preparación antes de grabar

1. Abrir Chrome en ventana limpia (sin tabs, sin bookmarks, sin extensiones visibles)
2. Resolución: 1920x1080
3. Tener 2 pestañas listas: home del sitio + admin
4. Tener abierto OBS o Loom grabando
5. En Supabase: `UPDATE tienda_config SET valor = 'false' WHERE clave = 'onboarding_completado';`

---

## ESCENA 1 — La tienda del cliente (0:00 – 0:40)

**Objetivo:** mostrar que es una tienda real, profesional, que funciona.

### Toma 1.1 — Home (10s)
- **URL:** https://amandaclouthing.cloud
- **Acción:** página carga, scroll lento hacia abajo
- **Lo que se tiene que ver:**
  - Navbar con "AMANDA CLOTHING" centrado
  - Hero con imagen grande
  - Categorías con fotos
  - Statement "Ropa que habla por vos"
  - Sección de productos destacados
- **Voz:** *"Esto es una tienda real. Funcionando ahora mismo. Con dominio propio, SSL, y atención 24/7."*

### Toma 1.2 — Catálogo de productos (8s)
- **URL:** https://amandaclouthing.cloud/productos
- **Acción:** scroll por la grilla, usar filtro de categoría (click en "Vestidos")
- **Lo que se tiene que ver:**
  - Grid de productos con fotos profesionales
  - Filtros funcionando (categoría, talla)
  - Badges "Nuevo", "Últimas", descuento "%"
  - Precios formateados
- **Voz:** *"Catálogo con filtros, búsqueda, badges automáticos de oferta y stock bajo."*

### Toma 1.3 — Detalle de producto (8s)
- **URL:** click en cualquier producto
- **Acción:** ver galería (click en thumbnails), seleccionar talle y color
- **Lo que se tiene que ver:**
  - Galería multi-imagen (click entre fotos)
  - Selector de talle y color
  - Precio (si tiene oferta: tachado + nuevo)
  - Badge "Pocas unidades" si stock bajo
  - Sección "También te puede gustar" abajo (recomendaciones)
- **Voz:** *"Galería de fotos, selección de talle y color, recomendaciones inteligentes debajo de cada producto."*

### Toma 1.4 — Carrito y checkout (14s)
- **Acción:** click "Agregar al carrito" → se abre CartDrawer → click "Finalizar compra"
- **Lo que se tiene que ver:**
  - CartDrawer abre desde la derecha
  - Producto con nombre, talle, color, precio, cantidad
  - Botón "Finalizar compra" + botón verde "Consultar/Reservar" (WhatsApp)
  - Página de checkout con resumen + datos + alias bancario
  - Botón de WhatsApp con mensaje pre-armado
- **Voz:** *"Carrito, checkout con alias bancario, y WhatsApp integrado para coordinar el pago. El cliente compra en 3 clicks."*

---

## ESCENA 2 — La IA que vende sola (0:40 – 1:05)

**Objetivo:** demostrar que la IA responde real, rápido, con datos del producto.

### Toma 2.1 — Chat widget (15s)
- **URL:** https://amandaclouthing.cloud (cualquier página)
- **Acción:**
  1. Click en el widget de chat (esquina inferior)
  2. Tipear: *"¿Tienen el vestido en talle M?"*
  3. Esperar respuesta de la IA (1-2 seg)
  4. Tipear: *"¿Cuánto sale?"*
  5. IA responde con precio y link
- **Lo que se tiene que ver:**
  - Chat flotante que se abre suave
  - La IA responde con datos reales del producto
  - Tono natural en español ("vos", "acá")
- **Voz:** *"La inteligencia artificial responde al instante. Conoce todos los productos, talles, precios y políticas. A las 3 de la mañana o a las 3 de la tarde."*

### Toma 2.2 — WhatsApp integrado (10s)
- **URL:** detalle de producto
- **Acción:** click en el botón flotante verde de WhatsApp
- **Lo que se tiene que ver:**
  - Se abre wa.me con mensaje pre-armado: "Hola Amanda! Me interesa este producto: *Vestido Milano*"
  - El número de WhatsApp es configurable
- **Voz:** *"Y si el cliente quiere hablar con una persona, lo deriva a WhatsApp con el mensaje ya listo."*

---

## ESCENA 3 — Panel de administración (1:05 – 1:50)

**Objetivo:** mostrar que cualquiera puede gestionar la tienda sin saber programar.

### Toma 3.1 — Dashboard (10s)
- **URL:** https://amandaclouthing.cloud/admin/dashboard
- **Acción:** pan lento por el dashboard
- **Lo que se tiene que ver:**
  - 4 métricas: Ventas del mes, Pedidos pendientes, Pedidos hoy, Stock bajo
  - Últimos 5 pedidos con badges de estado (Pendiente, Pagado, Enviado)
  - Top 3 productos más vendidos con barras
  - Banner amarillo "Tu tienda no está personalizada" (si onboarding está en false)
- **Voz:** *"El dashboard te muestra todo de un vistazo. Ventas, pedidos, stock, productos más vendidos."*

### Toma 3.2 — Gestión de productos (12s)
- **URL:** https://amandaclouthing.cloud/admin/productos
- **Acción:**
  1. Mostrar la tabla de productos
  2. Click en "Editar" en uno
  3. Cambiar el precio
  4. Click en "Guardar"
- **Lo que se tiene que ver:**
  - Lista de productos con foto, nombre, precio, stock
  - Modal/formulario de edición con campos
  - Guardado rápido (< 1 segundo)
- **Voz:** *"Subís fotos, manejás talles, colores, stock. Cambiás un precio y se actualiza al instante."*

### Toma 3.3 — Pedidos y seguimiento (10s)
- **URL:** https://amandaclouthing.cloud/admin/pedidos
- **Acción:**
  1. Mostrar tabla de pedidos
  2. Click en un pedido para cambiar estado (de "Pagado" a "Preparando")
- **Lo que se tiene que ver:**
  - Tabla con columnas: #, Cliente, Total, Estado, Fecha
  - Badges de color por estado
  - Selector inline para cambiar estado
- **Voz:** *"Cada pedido tiene su seguimiento: pendiente, pagado, preparando, enviado, entregado. Tu cliente sabe en qué etapa está."*

### Toma 3.4 — Publicación en redes sociales (13s)
- **URL:** https://amandaclouthing.cloud/admin/productos
- **Acción:**
  1. Click en botón "Publicar" de un producto
  2. Se abre modal con preview del post
  3. Seleccionar Instagram + Telegram
  4. Click en "Publicar"
- **Lo que se tiene que ver:**
  - Modal con la foto del producto
  - Caption generado automáticamente con nombre, precio, link
  - Checkboxes de redes: Instagram, Facebook, Telegram, WhatsApp, TikTok
  - Botón de publicar
- **Voz:** *"Publicar en redes sociales con un click. El caption se genera solo. Elegís en qué redes y listo. Sin salir del panel."*

---

## ESCENA 4 — Personalización total (1:50 – 2:20)

**Objetivo:** demostrar que el cliente puede cambiar todo sin código.

### Toma 4.1 — Wizard de onboarding (20s)
- **URL:** https://amandaclouthing.cloud/admin/onboarding
- **Acción (a velocidad normal, no acelerado):**
  1. Paso 1: escribir nombre "Luna Boutique"
  2. Paso 2: pegar número de WhatsApp
  3. Paso 3: click en paleta "Rosa suave" → se ven los 3 colores cambiar → seleccionar moneda USD
  4. Paso 4: escribir "Luna Boutique" como hero title
  5. Click "Finalizar"
- **Lo que se tiene que ver:**
  - Barra de progreso (4 pasos con checks verdes)
  - Inputs limpios, sin código
  - Paletas de colores clickeables con preview instantáneo
  - Selector de moneda con 8 opciones
  - Botón "Finalizar" → redirect al dashboard
- **Voz:** *"El wizard de configuración toma 3 minutos. Nombre, logo, contacto, colores, moneda, textos del home. Sin tocar una línea de código."*

### Toma 4.2 — Resultado: la tienda cambió (10s)
- **URL:** https://amandaclouthing.cloud (recargar con Ctrl+Shift+R)
- **Acción:** mostrar el home con los nuevos colores/nombre
- **Lo que se tiene que ver:**
  - Navbar ahora dice "LUNA BOUTIQUE" en vez de "AMANDA CLOTHING"
  - Colores rosados en vez de nude
  - Hero con el nuevo título
  - Precios en USD
- **Voz:** *"Y así se ve la tienda. Otro nombre, otros colores, otra moneda. El mismo motor. Listo para vender."*

**IMPORTANTE:** después de grabar esta toma, volver a setear los valores de Amanda en Supabase para que la tienda de producción quede bien:
```sql
UPDATE tienda_config SET valor = 'Amanda Clothing' WHERE clave = 'nombre_tienda';
UPDATE tienda_config SET valor = 'Amanda' WHERE clave = 'nombre_corto';
UPDATE tienda_config SET valor = 'ARS' WHERE clave = 'moneda_codigo';
UPDATE tienda_config SET valor = 'true' WHERE clave = 'onboarding_completado';
-- Y resetear color_primario, color_acento, color_fondo a los originales
```

---

## ESCENA 5 — Cierre y CTA (2:20 – 2:45)

### Toma 5.1 — Landing /software (15s)
- **URL:** https://amandaclouthing.cloud/software
- **Acción:** scroll lento por la landing mostrando:
  1. Hero "Tu tienda que vende mientras dormís"
  2. "Cómo funciona en 3 pasos"
  3. Diferenciadores (IA, redes, stock, BD dedicada)
  4. Planes Growth / Pro
  5. Garantía
- **Lo que se tiene que ver:**
  - La landing completa como un "resumen visual" de todo lo que se mostró
  - Los precios reales
  - El botón "Probar 14 días gratis"
- **Voz:** *"14 días de prueba. Sin tarjeta. Tu próxima venta puede ocurrir mientras dormís."*

### Toma 5.2 — Pantalla final (10s)
- **Pantalla negra o fondo oscuro del hero de /software**
- **Texto en pantalla (grande, centrado):**
  - "TiendaIA"
  - "amandaclouthing.cloud/software"
  - "Probá la demo gratis →"
- **Voz:** silencio, solo música de cierre.

---

## Resumen de URLs a grabar (en orden)

| # | URL | Qué se graba |
|---|-----|-------------|
| 1 | /                          | Home scroll completo |
| 2 | /productos                 | Catálogo + filtro categoría |
| 3 | /productos/{id}            | Detalle: galería, talles, recomendaciones |
| 4 | /productos/{id} → carrito  | Agregar + CartDrawer + checkout |
| 5 | / (chat widget)            | Conversación con IA |
| 6 | /productos/{id} (WA)       | Click botón WhatsApp |
| 7 | /admin/dashboard           | Métricas + pedidos + top productos |
| 8 | /admin/productos           | Editar producto + cambiar precio |
| 9 | /admin/pedidos             | Tabla + cambiar estado pedido |
| 10 | /admin/productos (publicar) | Modal publicar en redes |
| 11 | /admin/onboarding          | Wizard completo 4 pasos |
| 12 | / (post-wizard)            | Home con colores/nombre cambiados |
| 13 | /software                  | Scroll por landing de venta |

---

## Lo que tiene que quedar claro al terminar el video

El espectador tiene que sentir estas 5 cosas:

1. **"Es una tienda real, profesional"** — no un template vacío, se ve con productos, fotos, y funciona
2. **"La IA es impresionante"** — responde en 1 segundo con datos reales del producto
3. **"Yo puedo administrarla"** — el panel es visual, simple, sin código
4. **"Es MI marca, no una plantilla genérica"** — el wizard demuestra que cambiás todo en 3 minutos
5. **"Tengo que probarlo"** — los 14 días gratis sin tarjeta bajan la barrera a cero

---

## Cómo grabarlo con Loom (la forma más rápida)

1. Instalá Loom (gratis): https://www.loom.com
2. Click en "New Recording" → "Screen only" → resolución 1920x1080
3. Seguí este storyboard escena por escena
4. Podés narrar en vivo mientras grabás, o grabar sin audio y agregar voz después en CapCut
5. Exportá desde Loom → descargá MP4
6. Abrí CapCut → importá → agregá subtítulos automáticos + música de YouTube Audio Library
7. Exportá en 1080p

**Tiempo estimado:** 1 hora de grabación + 1 hora de edición en CapCut = **2 horas total, costo $0.**
