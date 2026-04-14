"""Tests para el flujo de pedidos — seguridad y validaciones."""
import pytest
from unittest.mock import MagicMock


AUTH_HEADER = {"Authorization": "Bearer valid-token"}


def _user_auth(supabase_mock, user_id="user-uuid-123"):
    user_mock = MagicMock()
    user_mock.user.id = user_id
    supabase_mock.auth.get_user.return_value = user_mock
    supabase_mock.auth.get_user.side_effect = None


@pytest.mark.anyio
async def test_crear_pedido_sin_auth(client):
    """Sin token → 403."""
    res = await client.post("/pedidos", json={"items": [{"variante_id": 1, "cantidad": 1}]})
    assert res.status_code == 403


@pytest.mark.anyio
async def test_mis_pedidos_sin_auth(client):
    """Sin token → 403."""
    res = await client.get("/pedidos/mis-pedidos")
    assert res.status_code == 403


@pytest.mark.anyio
async def test_vincular_pedidos_sin_auth(client):
    """Sin token → 403."""
    res = await client.post("/pedidos/vincular-telefono")
    assert res.status_code == 403


@pytest.mark.anyio
async def test_crear_pedido_guest_sin_nombre(client):
    """Guest sin nombre → 422."""
    res = await client.post("/pedidos/guest", json={
        "telefono": "1133821989",
        "items": [{"variante_id": 1, "cantidad": 1}],
    })
    assert res.status_code == 422


@pytest.mark.anyio
async def test_crear_pedido_guest_sin_telefono(client):
    """Guest sin teléfono → 422."""
    res = await client.post("/pedidos/guest", json={
        "nombre": "Test",
        "items": [{"variante_id": 1, "cantidad": 1}],
    })
    assert res.status_code == 422


@pytest.mark.anyio
async def test_crear_pedido_guest_sin_items(client):
    """Guest sin items → 422."""
    res = await client.post("/pedidos/guest", json={
        "nombre": "Test",
        "telefono": "1133821989",
        "items": [],
    })
    assert res.status_code == 422
