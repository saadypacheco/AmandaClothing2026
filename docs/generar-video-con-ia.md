# Cómo generar el video demo con IA — pipeline práctico

Este documento traduce el guion de `docs/video-demo-guion.md` en un flujo concreto
de herramientas para producir el video sin contratar equipo. Costo total estimado:
**USD 20–60 la primera vez** (créditos de ElevenLabs + Runway/Kling).

---

## Arquitectura del video

El video tiene **3 tipos de material** que se combinan en la edición final:

| Tipo | Cómo se genera | % del video |
|------|----------------|-------------|
| **Screen recording real** | Grabar el sitio en producción (amandaclouthing.cloud) | ~60% |
| **B-roll generado por IA** | Runway Gen-3 / Kling / Pika a partir de prompts | ~25% |
| **Motion graphics + texto** | CapCut / Descript con templates | ~15% |

La voz: **ElevenLabs** (una sola voz consistente para todo el video).
La música: **Epidemic Sound** o **Artlist** (suscripción) o **YouTube Audio Library** (gratis).

---

## Paso 1 — Generar la voz en off (ElevenLabs)

1. Entrá a https://elevenlabs.io. Plan Starter (USD 5/mes) o Creator (USD 22/mes).
2. Voces recomendadas para español rioplatense:
   - **"Mauro" / "Sofia"** (voces de ElevenLabs con acento latino neutro)
   - O clonar tu propia voz con 1 minuto de audio (Voice Clone)
3. **Configuración de voz** para estilo vendedor SaaS:
   - Stability: **50–55** (natural, con expresión)
   - Clarity + Similarity Enhancement: **75**
   - Style Exaggeration: **20** (sutil)
   - Speaker Boost: ON
4. Pegar el guion **bloque por bloque** (no todo junto — si algo queda raro, regenerás solo ese bloque).
5. Descargar cada bloque como `.mp3` a 192kbps.
6. Organizar en carpeta: `voiceover/bloque_01.mp3`, `bloque_02.mp3`... hasta `bloque_09.mp3`.

**Tips de prompting de voz:**
- Para pausas naturales, usar `...` o guiones largos `—` en el texto.
- Para énfasis, escribir la palabra en MAYÚSCULAS.
- Si la IA pronuncia mal "TiendaIA", escribirlo fonéticamente: *"Tien-da-I-A"*.

---

## Paso 2 — Grabar el screen recording del sitio real

**Herramienta:** [ScreenStudio](https://www.screen.studio) (Mac, USD 89 one-time) o
[OBS Studio](https://obsproject.com) (gratis, cualquier SO).

**Preparación de la tienda antes de grabar:**
1. Usar la tienda en producción: `https://amandaclouthing.cloud`
2. Crear un usuario admin de demo (no uses tu admin real)
3. Setear `onboarding_completado = false` en Supabase para que salga el banner
4. Cargar al menos 20 productos con fotos profesionales
5. Registrar 3 usuarios de prueba con historial de pedidos
6. Navegar en sesión privada para que los recomendadores tengan datos

**Grabar estas secuencias (cada una en archivo separado):**

| Archivo | Qué grabar | Duración |
|---------|-----------|----------|
| `rec_chat_ia.mp4` | Abrir chat widget, tipear "¿Talle M del Milano?", recibir respuesta | 15s |
| `rec_wizard.mp4` | Login admin → banner → wizard 4 pasos completo (paleta rosa, USD) | 25s |
| `rec_home_cambiado.mp4` | Refrescar home pública viendo colores nuevos | 5s |
| `rec_recomendaciones.mp4` | Scroll por detalle de producto hasta shelf "También te puede gustar" | 12s |
| `rec_admin_dashboard.mp4` | Pan por métricas + últimos pedidos + top 3 | 8s |
| `rec_admin_productos.mp4` | Editar un producto, cambiar precio, guardar | 8s |
| `rec_planes.mp4` | Scroll a `/software#planes` | 8s |

**Configuración de grabación:**
- Resolución: **1920x1080 @ 60fps**
- Cursor: magnificado/smooth (ScreenStudio lo hace; en OBS usar plugin "Mouse Effects")
- Zoom-in automático en clicks (ScreenStudio) — en OBS requiere edit post
- Ventana del navegador sin tabs ni bookmarks visibles
- **NO** grabar con dev tools abiertas ni con el cursor pasando por la barra del OS

---

## Paso 3 — Generar B-roll con IA

El B-roll cubre los momentos sin screen recording: hook, transiciones, tecnologías, CTA final.

### Herramientas (elegí una, no todas)

| Herramienta | Precio | Fuerte en | Debilidad |
|-------------|--------|-----------|-----------|
| **Runway Gen-3** | USD 15/mes (625 créditos) | Calidad cinematográfica, control fino | Lento, caro |
| **Kling 2.1** (kling.ai) | USD 10/mes | Movimiento fluido, personas realistas | Solo 5s clips |
| **Luma Dream Machine** | USD 10/mes | Buena coherencia temporal | Menos control |
| **Pika 2.0** | USD 10/mes | Estilos artísticos, rápido | Menos realista |

**Recomendado para este proyecto:** Kling 2.1 (relación calidad/precio/ritmo).

### Prompts para cada shot de B-roll

Copiar y pegar estos prompts literalmente (en inglés — los modelos responden mejor):

**Shot 1 — Hook de apertura (bloque 1):**
```
cinematic overhead shot, a young woman in her late 20s sitting on a couch at night,
phone glowing in her hands, replying to messages, soft warm lamp light, slightly
desaturated colors, mild exhaustion on her face, 4k, shallow depth of field,
subtle film grain, 24fps motion
```
Duración: 5s. Generar 2–3 variantes, quedarse con la mejor.

**Shot 2 — Timelapse de WhatsApps (bloque 1):**
```
close-up timelapse of hands typing quickly on a smartphone screen showing a
messaging app with many notifications appearing, desaturated warm tones,
slightly accelerated motion, cinematic shallow focus, late night mood
```
Duración: 4s.

**Shot 3 — Logos flotantes (bloque 8):**
```
abstract minimal animation of tech company logos floating in dark space with
soft golden particles, cinematic, premium SaaS aesthetic, 4k
```
Duración: 5s. **Alternativa más barata:** hacerlo en After Effects / Canva
con los logos reales.

**Shot 4 — Hero del CTA final (bloque 9):**
```
cinematic wide shot of a minimalist black background with subtle golden light
rays emanating from the center, premium elegant SaaS aesthetic, slow camera
push-in, 4k, film grain
```
Duración: 4s.

### Consejo clave sobre IA generativa de video
- **No intentes generar todo con IA.** Los modelos todavía fallan al generar texto
  legible, interfaces de software, o personas haciendo acciones específicas.
- **Usar IA para ambiente, no para información.** Screen recording real para
  mostrar el producto; IA para mood shots.
- **Seed + variantes.** Si un shot funciona, guardar el seed y regenerar con
  pequeñas variaciones para tener opciones.

---

## Paso 4 — Alternativa: avatar parlante (HeyGen o Synthesia)

Si no querés grabar voz ni mostrar tu cara, podés usar un **avatar IA de cuerpo presente**
hablando a cámara en los bloques de narración directa.

### HeyGen — el más usado en SaaS LATAM

1. https://www.heygen.com — plan Creator USD 29/mes o Business USD 89/mes.
2. **Instant Avatar** — subís 2 minutos de vos hablando a cámara → genera tu avatar.
   O usás uno de los avatares stock (más de 100).
3. Pegás el guion. El avatar lo dice con tu voz clonada (o con una voz de ElevenLabs
   que importes).
4. Exportás en 1080p sin watermark (solo en planes pagos).

**Cuándo usar HeyGen:** para los bloques 1, 2, 9 (apertura, promesa, CTA) donde
querés la *presencia humana* sin grabarte.

**Cuándo NO usar HeyGen:** para los bloques 3, 4, 6 que son screen recording.

### Synthesia — más corporativo

Similar a HeyGen pero más orientado a capacitación corporativa. Más caro (USD 30/mes)
y con avatares más serios. Menos recomendado para tono SaaS cercano.

---

## Paso 5 — Editar todo en una herramienta (elegí una)

### Opción A: CapCut (gratis, recomendado para empezar)
- https://www.capcut.com/es-es — versión Pro gratis (la Desktop).
- Importar `.mp3` de voz + todos los `.mp4` de grabación + clips IA.
- Bajar la música ambient debajo de la voz (automático con "auto ducking").
- **Subtítulos automáticos**: Text → Auto Captions. Revisá errores (nombres propios).
- Transiciones: solo **cortes secos**. Nada de "fade through white".
- Exportar: 1080p 60fps, bitrate 16 Mbps, formato MP4 (H.264).

### Opción B: Descript (USD 16/mes, profesional)
- https://www.descript.com
- **Killer feature:** editás el video editando el texto de la transcripción.
  Borrás una palabra en el texto → se borra del video.
- Genera subtítulos quemados mejor que CapCut.
- Overdub para corregir pronunciaciones de la voz sin regrabar.
- Exportar en 4K si querés más calidad.

### Opción C: DaVinci Resolve (gratis, avanzado)
- Editor profesional gratis. Curva de aprendizaje más alta.
- Solo si ya lo usás — no lo aprendas por este video.

---

## Paso 6 — Timeline de edición (para CapCut o Descript)

Mapa suciendo-por-bloque (referirse al timing exacto en `video-demo-guion.md`):

```
0:00 ─ B-roll IA "mujer noche" + B-roll "timelapse whatsapp" + voz_01.mp3
0:15 ─ Logo animado + voz_02.mp3 + música sube
0:30 ─ rec_chat_ia.mp4 + voz_03.mp3 (zoom sutil al chat bubble)
0:55 ─ rec_wizard.mp4 + voz_04.mp3 + rec_home_cambiado.mp4
1:25 ─ rec_recomendaciones.mp4 + voz_05.mp3 + overlay "40% más conversión"
1:50 ─ rec_admin_dashboard.mp4 + rec_admin_productos.mp4 + voz_06.mp3
2:10 ─ rec_planes.mp4 + voz_07.mp3 + overlays de precios animados
2:30 ─ B-roll IA "logos flotantes" + voz_08.mp3
2:45 ─ B-roll IA "hero negro" + voz_09.mp3 + botones pulsantes
3:00 ─ END
```

**Overlays de texto (motion graphics):**
- `24/7 IA · <1s carga · 40% conversiones · 8 monedas` — bloque 2, aparece con fade-in escalonado
- `3 minutos` — bloque 4, aparece grande al empezar el wizard
- `$29.900 · $59.900 · A medida` — bloque 7, uno por plan
- CapCut tiene estos templates en "Text → Animated"

---

## Paso 7 — Música de fondo

### Tracks recomendados (Epidemic Sound, suscripción USD 15/mes)
Buscar estos keywords, elegir una versión instrumental:
- *"minimalist corporate"* — para el grueso del video
- *"uplifting electronic"* — para el bloque 2 (promesa)
- *"cinematic reveal"* — para el bloque 4 (wizard, cambio de colores)
- *"confident finish"* — para el bloque 9 (CTA)

### Alternativa gratis: YouTube Audio Library
Filtrar por: Género = Cinematic, Mood = Inspirational, Instrumentos = Piano/Ambient.
Descargar, respetar los créditos si pide atribución.

**Regla de oro del audio:**
- Voz: -6 dB (normalizar)
- Música: -22 dB cuando habla, -15 dB en cortes sin voz
- Usar "Auto Ducking" en CapCut/Descript para que la música baje sola

---

## Paso 8 — Subtítulos quemados

**No-negociable para redes sociales.** 85% de los usuarios ven videos sin audio.

- CapCut: *Text → Auto Captions → Español (AR)*. Revisá 2 veces.
- Estilo: font **sans-serif bold**, tamaño grande, color **blanco** con
  **stroke negro** de 2px. Las **keywords** ("3 minutos", "IA 24/7", "tu marca")
  en color **dorado nude** (`#c9a882` — el color acento de TiendaIA).
- Posición: bottom center, margen 80px desde el borde inferior.
- Máximo 2 líneas por pantalla, 28 caracteres por línea.

---

## Paso 9 — Exportar las 4 versiones finales

| Versión | Formato | Dónde se usa |
|---------|---------|--------------|
| **3 min horizontal** | 1920x1080 MP4 | Landing `/software`, YouTube |
| **60 s vertical** | 1080x1920 MP4 | Instagram Reels, TikTok |
| **30 s horizontal** | 1920x1080 MP4 | YouTube pre-roll ads |
| **15 s vertical** | 1080x1920 MP4 | Instagram Stories ads |

**Para cortar las versiones cortas sin re-editar:**
1. Duplicar el proyecto en CapCut.
2. Cambiar canvas a 1080x1920 (vertical).
3. Arrastrar los clips y escalarlos/recortarlos.
4. Tijerear secciones que no entran según la duración objetivo.

---

## Paso 10 — Publicar el video

### En la landing `/software`
Subir a YouTube (no-listado) y embeber con:
```tsx
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1&loop=1"
  className="w-full aspect-video rounded-xl"
  allow="autoplay; encrypted-media"
/>
```
**NO** subirlo a Vercel directo — consume tu bandwidth.

### En redes sociales
- **Instagram Reels**: subir vertical 60s, caption con CTA a link en bio
- **TikTok**: subir vertical 60s, usar hashtags #emprendedores #tiendaonline #ecommerce
- **LinkedIn**: subir horizontal 3min, audiencia B2B curada
- **Facebook Ads**: usar las versiones 30s y 15s con targeting por interés

---

## Checklist antes de publicar

- [ ] La URL del sitio que aparece en el video es real y funciona (*amandaclouthing.cloud*)
- [ ] No hay datos reales de clientes en ninguna captura (emails, teléfonos)
- [ ] No aparecen logos de Cursor/VSCode/Claude en ningún frame
- [ ] La música tiene licencia o es libre de uso
- [ ] Los subtítulos están bien escritos en los nombres propios ("TiendaIA", no "tienda IA")
- [ ] El CTA final tiene la URL visible en pantalla por al menos 5 s
- [ ] Exportado a 60fps (no 30)
- [ ] Duración total entre 2:30 y 3:00

---

## Resumen de costos (estimación primera producción)

| Herramienta | Plan | Costo | Nota |
|-------------|------|-------|------|
| ElevenLabs | Creator | USD 22 | Una sola vez si cancelás tras exportar |
| Kling 2.1 | Standard | USD 10 | Suficiente para todo el B-roll |
| Epidemic Sound | Personal | USD 15 | Prorrateado — cancelable tras exportar |
| CapCut | Gratis | USD 0 | Suficiente para edición |
| Hosting del video | YouTube | USD 0 | No-listado |
| **TOTAL** | | **USD 47** | One-time de producción |

Con HeyGen en lugar de ElevenLabs + B-roll IA: USD 29–89 extra, pero te ahorra
tiempo de edición.

---

## Versión *"hago el video en 2 horas, ya"*

Si querés bajar al mínimo:

1. **Voz:** ElevenLabs free trial (10k caracteres gratis — alcanza).
2. **Grabación:** solo los bloques 3, 4, 6 (chat IA, wizard, admin) en ScreenStudio free.
3. **B-roll:** **saltearlo.** Reemplazar con texto animado sobre fondo negro
   (CapCut tiene templates listos).
4. **Música:** YouTube Audio Library.
5. **Edición:** CapCut, cortes secos, subtítulos auto.
6. **Duración final:** apuntá a **90 segundos** — corta los bloques 5, 7, 8.

Con este atajo tenés un video "funcional" para poner en la landing y hacer A/B
con la versión pulida después. Costo: USD 0.

---

## Tips finales

- **Iterá en 60 segundos antes de 3 minutos.** Si la versión 60s funciona en
  Reels/Stories, duplicá la inversión para la versión completa.
- **Medí con Hotjar o Microsoft Clarity** cuánto tiempo ve la gente el video
  en `/software`. Si abandonan antes del minuto 1, recortá intro.
- **Un solo video no mueve la aguja — la constancia sí.** Dos versiones por mes
  con variaciones del hook son más efectivas que un video perfecto cada 6 meses.
- **Regrabar la voz es barato. Regrabar el screen recording también.**
  Lo único caro es el tiempo de edición. Por eso, bloque-por-bloque.
