"""Tests del agente IA — FAQ y generación de prompts."""
import pytest
from unittest.mock import patch, MagicMock


@pytest.fixture
def config_mock():
    return {
        "nombre_tienda": "Test Store",
        "nombre_corto": "Test",
        "whatsapp_numero": "1234567890",
        "ia_system_prompt": "Sos Test, la asistente virtual de Test Store.",
    }


def test_check_faq_horario(config_mock):
    from app.services.agente import check_faq
    resp = check_faq("¿a qué hora atienden?", config_mock)
    assert resp is not None
    assert "9" in resp and "21" in resp


def test_check_faq_envio(config_mock):
    from app.services.agente import check_faq
    resp = check_faq("¿cuánto tarda el envío?", config_mock)
    assert resp is not None
    assert "3 a 7 días" in resp


def test_check_faq_cambio(config_mock):
    from app.services.agente import check_faq
    resp = check_faq("quiero devolver un producto", config_mock)
    assert resp is not None
    assert "30 días" in resp


def test_check_faq_no_match(config_mock):
    from app.services.agente import check_faq
    resp = check_faq("hola qué tal cómo estás", config_mock)
    assert resp is None


def test_build_system_prompt_incluye_nombre():
    from app.services.agente import _build_system_prompt
    config = {"nombre_tienda": "Mi Tienda", "nombre_corto": "Asistente", "whatsapp_numero": "123", "ia_system_prompt": "Sos Asistente de Mi Tienda."}
    prompt = _build_system_prompt(config)
    assert "Mi Tienda" in prompt or "Asistente" in prompt
    assert "+123" in prompt


def test_get_respuesta_sin_api_key():
    from app.services.agente import get_respuesta
    with patch("app.services.agente._get_config", return_value={"whatsapp_numero": "999"}):
        with patch.dict("os.environ", {"GEMINI_API_KEY": ""}, clear=False):
            resp = get_respuesta([{"rol": "user", "contenido": "hola esto no es FAQ"}])
            assert "WhatsApp" in resp


def test_get_respuesta_faq_primero():
    from app.services.agente import get_respuesta
    with patch("app.services.agente._get_config", return_value={"whatsapp_numero": "999"}):
        resp = get_respuesta([{"rol": "user", "contenido": "¿a qué hora atienden?"}])
        assert "9" in resp and "21" in resp
