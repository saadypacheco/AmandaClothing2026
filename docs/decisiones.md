# Decisiones — Boutique / Plataforma SaaS

> Registro de decisiones no obvias. Una línea: **qué se decidió**, **por qué**, **alternativa descartada**.

---

## 2026-04 — WhatsApp solo como enlace web

- **Qué:** WhatsApp se integra con `https://wa.me/<numero>`, sin API oficial.
- **Por qué:** WhatsApp Business API requiere proveedor pago + aprobación de plantillas. El enlace web cubre el 95% del caso de uso (consulta puntual, sin automatización).
- **Descartado:** WhatsApp Cloud API (costo + fricción de onboarding).

## 2026-04 — Cada cliente del SaaS tiene su propia Supabase

- **Qué:** No hay multi-tenant en una sola BD. Cada deploy clona el repo y conecta a un proyecto Supabase propio.
- **Por qué:** Aislamiento total de datos, escala independiente, restore por cliente, cero riesgo de filtración cruzada. Para 10-50 clientes el costo extra es marginal.
- **Descartado:** RLS por `tienda_id` (mayor complejidad, riesgo si una policy falla).

## 2026-04 — i18n se posterga hasta primer cliente no-AR

- **Qué:** Todos los textos de UI siguen en es-AR. La **moneda** sí es configurable (8 monedas LATAM + USD/EUR).
- **Por qué:** YAGNI. Hasta que entre un cliente que no hable español-AR, hardcodear es más barato que mantener archivos de traducción.

## 2026-04 — Branding visual vía CSS variables, no rebuild

- **Qué:** Los colores y fuentes viven en `tienda_config` y se inyectan al `<head>` por un server component. Tailwind resuelve `var(--color-*)`.
- **Por qué:** El admin cambia colores desde el panel y se reflejan en ~5 min sin redeploy ni rebuild.
- **Descartado:** Variables en `next.config.js` (requiere rebuild) y CSS-in-JS (peso extra en bundle).

---

## 2026-05 — Modo mayorista B2B como rama del SaaS

- **Qué:** Cada deploy del SaaS elige `modo` en onboarding: `minorista` (default) o `mayorista`. Una tienda no puede ser mixta — son deploys separados.
- **Por qué:** Evita código condicional `if mixto` esparcido por toda la UI. Mantiene la tienda actual (Amanda) intacta. Si un cliente vende a ambos canales, se crean dos deploys con dos dominios.
- **Descartado:**
  - **Tienda mixta misma URL**: UI compleja, el visitor no logueado siempre ve precios "menos buenos" → mata SEO y conversión.
  - **Subdominios** (tienda.com + mayorista.tienda.com): punto medio, pero comparten data y se necesitan reglas finas. Se pospone hasta que un cliente lo pida.

## 2026-05 — Mayorista: login obligatorio + aprobación manual

- **Qué:** En `modo='mayorista'` el catálogo es **privado**. Al registrarse el usuario queda `estado_cuenta='pendiente'`. Admin aprueba y le asigna lista de precios + condición de pago.
- **Por qué:** Es el estándar en B2B textil/indumentaria argentino. Filtra revendedores legítimos y permite asignar precios diferenciados desde el primer momento.
- **Descartado:** Catálogo público con precios al loguearse (SEO friendly pero menos control sobre quién ve qué precio).

## 2026-05 — Checkout B2B multi-método

- **Qué:** El checkout mayorista soporta cuatro métodos, configurables por tienda:
  1. **MercadoPago** (contado, pedidos chicos).
  2. **Cuenta corriente** (cargo a CC con vencimiento 15/30/60/90 días).
  3. **Transferencia bancaria con comprobante** (cliente sube comprobante, admin confirma).
  4. **Solicitud de cotización** (entra como `cotizado`, admin revisa, ajusta y devuelve al cliente).
- **Por qué:** Cada cliente B2B opera distinto. Algunos compran al contado, otros con CC, otros piden cotización por pedidos grandes.
- **Descartado:** Solo MercadoPago (mata el caso B2B con CC, que es el más rentable).

## 2026-05 — Estados de pedido B2B extendidos

- **Qué:** En modo mayorista, los pedidos pasan por estados adicionales:
  `borrador → cotizado → pendiente_aprobacion → aprobado → preparacion → despacho → entregado → facturado`.
- **Por qué:** En B2B el ciclo de venta no termina con el pago — hay aprobación interna, preparación de pedido, remito, despacho y facturación posterior.
- **Auto-aprobación:** Hay reglas configurables por monto y cliente para no cuellos de botella.

## 2026-05 — Catálogo se generaliza con atributos dinámicos

- **Qué:** El modelo `variantes (talla, color)` se mantiene para retro-compatibilidad, pero se agrega `atributo_definicion` + `atributo_valor_variante` para rubros no-ropa (talles → tamaños, colores → sabores, etc.).
- **Por qué:** El SaaS apunta a varios rubros, no solo indumentaria. Generalizar ahora evita migración masiva después.
- **Descartado:** Schema separado por rubro (mantenimiento N veces mayor).

## 2026-05 — Amanda Clothing no se modifica

- **Qué:** Todo el desarrollo B2B va detrás del flag `modo`. Amanda queda con `modo='minorista'` (o sin la clave seteada, que se interpreta como minorista) y su UX no cambia.
- **Por qué:** Está en producción con tráfico real. Cero riesgo de regresión.
