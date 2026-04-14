"""Tests de publicación en redes sociales."""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock


def test_telegram_sin_config():
    """Sin bot token → error."""
    from app.services.social import publicar_telegram
    import asyncio
    result = asyncio.get_event_loop().run_until_complete(
        publicar_telegram("", "", "http://img.jpg", "caption")
    )
    assert result["ok"] is False
    assert "no configurado" in result["error"].lower()


def test_whatsapp_link_genera_url():
    """Genera URL wa.me válida con mensaje encoded."""
    from app.services.social import generar_whatsapp_link
    result = generar_whatsapp_link("Hola mundo", "5491133821989")
    assert result["ok"] is True
    assert "wa.me/5491133821989" in result["url"]
    assert "Hola" in result["url"]


def test_whatsapp_link_sin_numero():
    """Sin número usa el default."""
    from app.services.social import generar_whatsapp_link
    result = generar_whatsapp_link("Test")
    assert result["ok"] is True
    assert "wa.me/" in result["url"]


def test_tiktok_genera_contenido():
    """Retorna caption + imagen para copiar."""
    from app.services.social import generar_tiktok_content
    result = generar_tiktok_content("http://img.jpg", "Mi caption")
    assert result["ok"] is True
    assert result["tipo"] == "manual"
    assert result["caption"] == "Mi caption"
    assert result["imagen_url"] == "http://img.jpg"


def test_facebook_sin_config():
    """Sin token → error."""
    from app.services.social import publicar_facebook
    import asyncio
    result = asyncio.get_event_loop().run_until_complete(
        publicar_facebook("", "", "http://img.jpg", "caption")
    )
    assert result["ok"] is False
    assert "no configurado" in result["error"].lower()


def test_instagram_sin_config():
    """Sin token → error."""
    from app.services.social import publicar_instagram
    import asyncio
    result = asyncio.get_event_loop().run_until_complete(
        publicar_instagram("", "", "http://img.jpg", "caption")
    )
    assert result["ok"] is False
    assert "no configurado" in result["error"].lower()


@pytest.mark.anyio
async def test_publicar_en_redes_multiples():
    """Publica en múltiples redes y retorna resultado por cada una."""
    from app.services.social import publicar_en_redes

    with patch("app.services.social.get_settings") as mock_settings:
        settings = MagicMock()
        settings.telegram_bot_token = ""
        settings.telegram_channel_id = ""
        settings.fb_page_id = ""
        settings.fb_access_token = ""
        settings.ig_user_id = ""
        settings.site_url = "http://test.com"
        mock_settings.return_value = settings

        result = await publicar_en_redes(
            redes=["telegram", "whatsapp", "tiktok"],
            producto_nombre="Vestido",
            producto_precio=15000,
            producto_descripcion="Test",
            producto_id=1,
            imagen_url="http://img.jpg",
        )
        assert "telegram" in result
        assert "whatsapp" in result
        assert "tiktok" in result
        assert result["whatsapp"]["ok"] is True
        assert result["tiktok"]["ok"] is True
