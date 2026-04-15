"""
Servicios para publicación en redes sociales.
Soporta: Telegram, WhatsApp, Facebook, Instagram, TikTok.
"""

import os
import httpx
from typing import Dict, Any, Optional
from urllib.parse import quote
from app.core.config import get_settings
from app.db.client import get_supabase_client


def _get_tienda_config() -> Dict[str, str]:
    """Lee configuración de tienda_config. Devuelve dict vacío si falla."""
    try:
        db = get_supabase_client()
        result = db.table("tienda_config").select("clave, valor").execute()
        return {row["clave"]: row["valor"] for row in (result.data or [])}
    except Exception:
        return {}


async def publicar_telegram(
    bot_token: str,
    channel_id: str,
    imagen_url: str,
    caption: str,
) -> Dict[str, Any]:
    """
    Publica foto en canal Telegram.
    """
    if not bot_token or not channel_id:
        return {"ok": False, "error": "Telegram no configurado (falta bot token o channel ID)"}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"https://api.telegram.org/bot{bot_token}/sendPhoto",
                data={
                    "chat_id": channel_id,
                    "photo": imagen_url,
                    "caption": caption,
                    "parse_mode": "HTML",
                },
            )
            if response.status_code == 200:
                return {"ok": True}
            else:
                return {"ok": False, "error": f"Telegram API error: {response.text}"}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def generar_whatsapp_link(mensaje: str, numero: str = "") -> Dict[str, Any]:
    """
    Genera URL wa.me para abrir WhatsApp con mensaje pre-armado.
    El admin abre la URL en el navegador.
    """
    if not numero:
        cfg = _get_tienda_config()
        numero = cfg.get("whatsapp_numero") or os.getenv("NEXT_PUBLIC_WA_NUMBER", "")

    url = f"https://wa.me/{numero}?text={quote(mensaje)}"
    return {"ok": True, "url": url, "mensaje": "Abre este link en tu navegador"}


async def publicar_facebook(
    page_id: str,
    access_token: str,
    imagen_url: str,
    caption: str,
) -> Dict[str, Any]:
    """
    Publica foto en página Facebook.
    """
    if not page_id or not access_token:
        return {"ok": False, "error": "Facebook no configurado"}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"https://graph.facebook.com/v18.0/{page_id}/photos",
                params={"access_token": access_token},
                data={
                    "url": imagen_url,
                    "caption": caption,
                },
            )
            if response.status_code == 200:
                data = response.json()
                return {
                    "ok": True,
                    "post_id": data.get("post_id"),
                    "url": f"https://facebook.com/{data.get('post_id')}",
                }
            else:
                return {"ok": False, "error": f"Facebook API error: {response.text}"}
    except Exception as e:
        return {"ok": False, "error": str(e)}


async def publicar_instagram(
    ig_user_id: str,
    access_token: str,
    imagen_url: str,
    caption: str,
) -> Dict[str, Any]:
    """
    Publica foto en Instagram via Graph API.
    Requiere Instagram Business Account.
    """
    if not ig_user_id or not access_token:
        return {
            "ok": False,
            "error": "Instagram no configurado",
        }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            # Paso 1: Crear container
            container_response = await client.post(
                f"https://graph.instagram.com/v18.0/{ig_user_id}/media",
                params={"access_token": access_token},
                data={
                    "image_url": imagen_url,
                    "caption": caption,
                },
            )

            if container_response.status_code != 200:
                return {
                    "ok": False,
                    "error": f"Instagram media creation error: {container_response.text}",
                }

            container_id = container_response.json()["id"]

            # Paso 2: Publicar container
            publish_response = await client.post(
                f"https://graph.instagram.com/v18.0/{ig_user_id}/media_publish",
                params={"access_token": access_token},
                data={"creation_id": container_id},
            )

            if publish_response.status_code == 200:
                post_id = publish_response.json()["id"]
                return {
                    "ok": True,
                    "post_id": post_id,
                    "url": f"https://instagram.com/p/{post_id}",
                }
            else:
                return {
                    "ok": False,
                    "error": f"Instagram publish error: {publish_response.text}",
                }

    except Exception as e:
        return {"ok": False, "error": str(e)}


def generar_tiktok_content(
    imagen_url: str,
    caption: str,
) -> Dict[str, Any]:
    """
    TikTok API es muy restrictiva (requiere app review).
    En su lugar, devolvemos el contenido listo para copiar/pegar.
    """
    return {
        "ok": True,
        "tipo": "manual",
        "mensaje": "Copia este contenido y pégalo en TikTok",
        "caption": caption,
        "imagen_url": imagen_url,
    }


async def publicar_en_redes(
    redes: list[str],
    producto_nombre: str,
    producto_precio: float,
    producto_descripcion: str,
    producto_id: int,
    imagen_url: str,
    caption_personalizado: Optional[str] = None,
) -> Dict[str, Dict[str, Any]]:
    """
    Publica un producto en las redes seleccionadas.

    Args:
        redes: Lista de redes ("telegram", "whatsapp", "facebook", "instagram", "tiktok")
        producto_*: Datos del producto
        imagen_url: URL de la imagen (debe ser accesible públicamente)
        caption_personalizado: Si None, se genera automáticamente

    Returns:
        Dict con resultado por red.
    """

    settings = get_settings()
    tienda_cfg = _get_tienda_config()
    site_url = tienda_cfg.get("sitio_url") or settings.site_url

    # Generar caption si no viene personalizado
    if not caption_personalizado:
        caption = f"✨ {producto_nombre}\n💰 ${producto_precio:,.0f}\n{producto_descripcion[:150]}\n\n👗 Ver más: {site_url}/productos/{producto_id}"
    else:
        caption = caption_personalizado

    resultados = {}

    # Telegram
    if "telegram" in redes:
        resultados["telegram"] = await publicar_telegram(
            settings.telegram_bot_token,
            settings.telegram_channel_id,
            imagen_url,
            caption,
        )

    # WhatsApp
    if "whatsapp" in redes:
        wa_caption = f"{producto_nombre}\n${producto_precio:,.0f}\n{caption}"
        resultados["whatsapp"] = generar_whatsapp_link(wa_caption)

    # Facebook
    if "facebook" in redes:
        resultados["facebook"] = await publicar_facebook(
            settings.fb_page_id,
            settings.fb_access_token,
            imagen_url,
            caption,
        )

    # Instagram
    if "instagram" in redes:
        resultados["instagram"] = await publicar_instagram(
            settings.ig_user_id,
            settings.fb_access_token,  # Mismo token que Facebook
            imagen_url,
            caption,
        )

    # TikTok
    if "tiktok" in redes:
        resultados["tiktok"] = generar_tiktok_content(imagen_url, caption)

    return resultados
