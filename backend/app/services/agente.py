"""
Servicio de agente IA para tiendas white-label.
Lee configuración de tienda desde BD para personalizar respuestas.
"""
import os
import re
import google.generativeai as genai
from app.db.client import get_supabase_client


def _get_config() -> dict[str, str]:
    """Obtiene toda la configuración de la tienda como dict."""
    try:
        db = get_supabase_client()
        result = db.table("tienda_config").select("clave, valor").execute()
        return {row["clave"]: row["valor"] for row in (result.data or [])}
    except Exception:
        return {}


def _build_system_prompt(config: dict[str, str], contexto_producto: str | None = None) -> str:
    nombre = config.get("nombre_tienda", "la tienda")
    nombre_corto = config.get("nombre_corto", "la asistente")
    wa = config.get("whatsapp_numero", "")
    ia_intro = config.get("ia_system_prompt", f"Sos {nombre_corto}, la asistente virtual de {nombre}.")

    prompt = f"""{ia_intro}
Tu rol es ayudar a clientes con consultas sobre productos, talles, colores, disponibilidad y políticas de la tienda.

Información de la tienda:
- Horario de atención humana: lunes a sábado de 9 a 21hs
- Cambios y devoluciones: hasta 30 días con etiqueta y sin uso
- Envíos: a todo el país por correo, 3 a 7 días hábiles
- Medios de pago: tarjeta de crédito/débito, transferencia y MercadoPago
{f'- WhatsApp para consultas urgentes: +{wa}' if wa else ''}

Reglas:
- Respondé en español rioplatense (usá "vos", "te", "acá", etc.)
- Sé cálida, concisa y útil — máximo 2 o 3 oraciones
- Si no sabés el stock exacto, sugerí que consulten por WhatsApp
- No inventes precios ni características que no te dieron
- Si la consulta no tiene que ver con la tienda, redirigí amablemente
{f'- Si la clienta quiere hablar con una persona, decile que puede escribir por WhatsApp al +{wa}' if wa else ''}
"""
    if contexto_producto:
        prompt += f"\n\nProducto sobre el que está consultando:\n{contexto_producto}"
    return prompt


def _build_faq(config: dict[str, str]) -> list[tuple[list[str], str]]:
    wa = config.get("whatsapp_numero", "")
    wa_msg = f" al +{wa}" if wa else ""

    return [
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
            f"Podés escribirnos por WhatsApp{wa_msg}, respondemos de lunes a sábado de 9 a 21hs."
        ),
        (
            [r"persona", r"humano", r"vendedor", r"hablar con alguien", r"atención real", r"atencion real"],
            f"¡Por supuesto! Escribinos por WhatsApp{wa_msg} y te atiende una persona de nuestro equipo 💬"
        ),
        (
            [r"talle", r"talla", r"medida", r"tallaje", r"qué talle", r"que talle", r"tabla de talle"],
            "Nuestros talles van de XS a XL. Si tenés dudas con una prenda específica escribime y te ayudo a encontrar tu talle ideal."
        ),
    ]


def check_faq(mensaje: str, config: dict[str, str]) -> str | None:
    texto = mensaje.lower().strip()
    for patrones, respuesta in _build_faq(config):
        if any(re.search(p, texto) for p in patrones):
            return respuesta
    return None


def get_respuesta(historial: list[dict], contexto_producto: str | None = None) -> str:
    config = _get_config()
    wa = config.get("whatsapp_numero", "")
    wa_fallback = f" al +{wa}" if wa else ""

    ultimo_user = next(
        (m["contenido"] for m in reversed(historial) if m["rol"] == "user"),
        None
    )
    if ultimo_user:
        faq_resp = check_faq(ultimo_user, config)
        if faq_resp:
            return faq_resp

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return f"En este momento no puedo responder automáticamente. ¡Escribinos por WhatsApp{wa_fallback}!"

    system = _build_system_prompt(config, contexto_producto)

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
        return f"En este momento no puedo responder. ¡Escribinos por WhatsApp{wa_fallback}!"
