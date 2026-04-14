"""Tests para endpoints de configuración de tienda."""
import pytest
from unittest.mock import MagicMock


AUTH_HEADER = {"Authorization": "Bearer valid-admin-token"}


def _admin_auth(supabase_mock):
    user_mock = MagicMock()
    user_mock.user.id = "admin-uuid"
    supabase_mock.auth.get_user.return_value = user_mock
    supabase_mock.auth.get_user.side_effect = None
    supabase_mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {"rol": "admin"}


@pytest.mark.anyio
async def test_get_config_publica(client, supabase_mock):
    """GET /config retorna dict clave:valor sin auth."""
    supabase_mock.table.return_value.select.return_value.execute.return_value.data = [
        {"clave": "nombre_tienda", "valor": "Amanda Clothing", "tipo": "texto"},
        {"clave": "whatsapp_numero", "valor": "5491133821989", "tipo": "texto"},
    ]

    res = await client.get("/config")
    assert res.status_code == 200
    data = res.json()
    assert data["nombre_tienda"] == "Amanda Clothing"
    assert data["whatsapp_numero"] == "5491133821989"


@pytest.mark.anyio
async def test_get_config_admin_sin_auth(client):
    """GET /admin/config sin token → 403."""
    res = await client.get("/admin/config")
    assert res.status_code == 403


@pytest.mark.anyio
async def test_get_config_admin_con_auth(client, supabase_mock):
    """GET /admin/config retorna lista completa con tipos y grupos."""
    _admin_auth(supabase_mock)

    supabase_mock.table.return_value.select.return_value.order.return_value.order.return_value.execute.return_value.data = [
        {"id": 1, "clave": "nombre_tienda", "valor": "Amanda Clothing", "tipo": "texto", "grupo": "marca"},
    ]

    res = await client.get("/admin/config", headers=AUTH_HEADER)
    assert res.status_code == 200


@pytest.mark.anyio
async def test_update_config(client, supabase_mock):
    """PATCH /admin/config/{clave} actualiza valor."""
    _admin_auth(supabase_mock)

    supabase_mock.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [
        {"clave": "nombre_tienda", "valor": "Nueva Tienda"}
    ]

    res = await client.patch("/admin/config/nombre_tienda", json={"valor": "Nueva Tienda"}, headers=AUTH_HEADER)
    assert res.status_code == 200


@pytest.mark.anyio
async def test_update_config_bulk(client, supabase_mock):
    """POST /admin/config/bulk actualiza múltiples claves."""
    _admin_auth(supabase_mock)

    supabase_mock.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [{"clave": "x"}]

    res = await client.post("/admin/config/bulk", json={
        "items": {"nombre_tienda": "Test Store", "whatsapp_numero": "123456"}
    }, headers=AUTH_HEADER)
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert data["updated"] == 2
