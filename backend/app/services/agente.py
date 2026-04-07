"""
Servicio de agente IA para Amanda Clothing.
Usar este archivo para cambiar de modelo — el resto del sistema no cambia.
"""
import os
import re
import google.generativeai as genai

SYSTEM_PROMPT = """Sos Amanda, la asistente virtual de Amanda Clothing, una boutique de moda argentina.
Tu rol es ayudar a clientas con consultas sobre productos, talles, colores, disponibilidad y políticas de la tienda.

Información de la tienda:
- Horario de atención humana: lunes a sábado de 9 a 21hs
- Cambios y devoluciones: hasta 30 días con etiqueta y sin uso
- Envíos: a todo el país por correo, 3 a 7 días hábiles
- Medios de pago: tarjeta de crédito/débito, transferencia y MercadoPago
- WhatsApp para consultas urgentes: +5491133821989

Reglas:
- Respondé en español rioplatense (usá "vos", "te", "acá", etc.)
- Sé cálida, concisa y útil — máximo 2 o 3 oraciones
- Si no sabés el stock exacto, sugerí que consulten por WhatsApp
- No inventes precios ni características que no te dieron
- Si la consulta no tiene que ver con la tienda, redirigí amablemente
- Si la clienta quiere hablar con una persona, decile que puede escribir por WhatsApp al +5491133821989
"""

# ── Capa 1: FAQ predefinidas ──────────────────────────────────────────────────
# Cada entrada: lista de patrones (regex) → respuesta inmediata
FAQ: list[tuple[list[str], str]] = [
    (
        [r"horario", r"atienden", r"abren", r"cierran", r"a qué hora"],
        "Atendemos de lunes a sábado de 9 a 21hs. Fuera de ese horario podés escribirnos y te respondemos a la brevedad 😊"
    ),
    (
        [r"envío", r"envio", r"despacho", r"llega", r"demora", r"correo", r"entreg"],
        "Enviamos a todo el país por correo, el pedido llega en 3 a 7 días hábiles. El costo de envío se calcula al hacer el pedido."
    ),
    (
        [r"cambio", r"devolución", r"devolucion", r"devolver", r"cambiar"],
        "Aceptamos cambios y devoluciones hasta 30 días desde la compra, con etiqueta y sin uso. ¡Sin problema!"
    ),
    (
        [r"pago", r"pagar", r"tarjeta", r"transferencia", r"mercadopago", r"efectivo"],
        "Aceptamos tarjeta de crédito/débito, transferencia bancaria y MercadoPago. Podés elegir el método al finalizar la compra."
    ),
    (
        [r"whatsapp", r"teléfono", r"telefono", r"llamar", r"número", r"numero", r"contacto"],
        "Podés escribirnos por WhatsApp al +5491133821989, respondemos de lunes a sábado de 9 a 21hs."
    ),
    (
        [r"persona", r"humano", r"vendedor", r"hablar con alguien", r"atención real", r"atencion real"],
        "¡Por supuesto! Escribinos por WhatsApp al +5491133821989 y te atiende una persona de nuestro equipo 💬"
    ),
    (
        [r"talle", r"talla", r"medida", r"tallaje", r"qué talle", r"que talle", r"tabla de talle"],
        "Nuestros talles van de XS a XL. Si tenés dudas con una prenda específica escribime y te ayudo a encontrar tu talle ideal."
    ),
]


def check_faq(mensaje: str) -> str | None:
    """Devuelve respuesta FAQ si el mensaje coincide, None si no."""
    texto = mensaje.lower().strip()
    for patrones, respuesta in FAQ:
        if any(re.search(p, texto) for p in patrones):
            return respuesta
    return None


# ── Capa 2: Agente Gemini ─────────────────────────────────────────────────────

def get_respuesta(historial: list[dict], contexto_producto: str | None = None) -> str:
    """
    Capa 1: intenta responder con FAQ.
    Capa 2: si no hay match, llama a Gemini.

    historial: lista de {"rol": "user"|"model", "contenido": str}
    contexto_producto: descripción del producto en consulta (opcional)
    """
    # Capa 1 — FAQ solo con el último mensaje del usuario
    ultimo_user = next(
        (m["contenido"] for m in reversed(historial) if m["rol"] == "user"),
        None
    )
    if ultimo_user:
        faq_resp = check_faq(ultimo_user)
        if faq_resp:
            return faq_resp

    # Capa 2 — Gemini
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "En este momento no puedo responder automáticamente. ¡Escribinos por WhatsApp al +5491133821989!"

    system = SYSTEM_PROMPT
    if contexto_producto:
        system += f"\n\nProducto sobre el que está consultando la clienta:\n{contexto_producto}"

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=system,
    )

    history = []
    for msg in historial[:-1]:
        history.append({
            "role": msg["rol"],
            "parts": [msg["contenido"]],
        })

    chat = model.start_chat(history=history)

    try:
        response = chat.send_message(
            historial[-1]["contenido"],
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=250,
                temperature=0.7,
            ),
        )
        return response.text.strip()
    except Exception:
        return "En este momento no puedo responder. ¡Escribinos por WhatsApp al +5491133821989!"
