"""
Servicio de agente IA para Amanda Clothing.
Usar este archivo para cambiar de modelo — el resto del sistema no cambia.
"""
import os
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
"""


def get_respuesta(historial: list[dict], contexto_producto: str | None = None) -> str:
    """
    Llama a Gemini Flash y devuelve la respuesta del agente.

    historial: lista de {"rol": "user"|"model", "contenido": str}
    contexto_producto: descripción del producto en consulta (opcional)
    """
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

    # Construir historial para Gemini (todos menos el último mensaje)
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
    except Exception as e:
        return "En este momento no puedo responder. ¡Escribinos por WhatsApp al +5491133821989!"
