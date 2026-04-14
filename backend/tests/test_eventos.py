"""Tests de registro de eventos de tracking."""
import pytest
from unittest.mock import MagicMock


@pytest.mark.anyio
async def test_registrar_evento_vista(client, supabase_mock):
    """Registra evento tipo vista → 204."""
    supabase_mock.table.return_value.insert.return_value.execute.return_value.data = [{"id": 1}]

    res = await client.post("/eventos", json={
        "session_id": "test-session-uuid",
        "producto_id": 1,
        "tipo_evento": "vista",
    })
    assert res.status_code == 204


@pytest.mark.anyio
async def test_registrar_evento_tipo_invalido(client, supabase_mock):
    """Tipo de evento inválido → 400."""
    res = await client.post("/eventos", json={
        "session_id": "test-session-uuid",
        "producto_id": 1,
        "tipo_evento": "invalido",
    })
    assert res.status_code in (400, 422)


@pytest.mark.anyio
async def test_registrar_evento_carrito(client, supabase_mock):
    """Registra evento tipo carrito → 204."""
    supabase_mock.table.return_value.insert.return_value.execute.return_value.data = [{"id": 2}]

    res = await client.post("/eventos", json={
        "session_id": "test-session-uuid",
        "producto_id": 1,
        "tipo_evento": "carrito",
    })
    assert res.status_code == 204


@pytest.mark.anyio
async def test_registrar_evento_sin_session(client):
    """Sin session_id → 422 (validación pydantic)."""
    res = await client.post("/eventos", json={
        "producto_id": 1,
        "tipo_evento": "vista",
    })
    assert res.status_code == 422
