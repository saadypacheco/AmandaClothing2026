"""
Tests de seguridad: los endpoints /admin/* deben rechazar
peticiones sin token o con token de usuario no-admin.
"""
import pytest
from unittest.mock import MagicMock


@pytest.mark.anyio
async def test_admin_sin_token_retorna_403(client):
    """Sin Authorization header → 403 (HTTPBearer rechaza antes de llegar al handler)."""
    res = await client.get("/admin/productos")
    assert res.status_code == 403


@pytest.mark.anyio
async def test_admin_token_invalido_retorna_401(client, supabase_mock):
    """Token que falla en supabase.auth.get_user → 401."""
    supabase_mock.auth.get_user.side_effect = Exception("invalid token")

    res = await client.get(
        "/admin/productos",
        headers={"Authorization": "Bearer token-invalido"},
    )
    assert res.status_code == 401


@pytest.mark.anyio
async def test_admin_usuario_cliente_retorna_403(client, supabase_mock):
    """Token válido pero rol='cliente' → 403."""
    user_mock = MagicMock()
    user_mock.user.id = "user-uuid-123"
    supabase_mock.auth.get_user.return_value = user_mock
    supabase_mock.auth.get_user.side_effect = None

    supabase_mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
        "rol": "cliente"
    }

    res = await client.get(
        "/admin/productos",
        headers={"Authorization": "Bearer valid-token"},
    )
    assert res.status_code == 403


@pytest.mark.anyio
async def test_admin_usuario_admin_puede_listar(client, supabase_mock):
    """Token válido con rol='admin' → 200 con lista de productos."""
    user_mock = MagicMock()
    user_mock.user.id = "admin-uuid-456"
    supabase_mock.auth.get_user.return_value = user_mock
    supabase_mock.auth.get_user.side_effect = None

    # Perfil admin
    supabase_mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
        "rol": "admin"
    }
    # Lista de productos vacía
    supabase_mock.table.return_value.select.return_value.order.return_value.execute.return_value.data = []

    res = await client.get(
        "/admin/productos",
        headers={"Authorization": "Bearer valid-admin-token"},
    )
    assert res.status_code == 200
    assert res.json() == []
