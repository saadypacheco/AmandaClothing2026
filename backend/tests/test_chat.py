"""Tests del chat — seguridad de endpoints."""
import pytest
from unittest.mock import MagicMock


AUTH_HEADER = {"Authorization": "Bearer valid-admin-token"}


@pytest.mark.anyio
async def test_chat_agente_sin_auth(client):
    """POST /chat/agente sin token → 403."""
    res = await client.post("/chat/agente", json={
        "chat_id": 1, "mensaje": "hola"
    })
    assert res.status_code == 403


@pytest.mark.anyio
async def test_admin_listar_chats_sin_auth(client):
    """GET /admin/chats sin token → 403."""
    res = await client.get("/admin/chats")
    assert res.status_code == 403


@pytest.mark.anyio
async def test_admin_listar_chats(client, supabase_mock):
    """GET /admin/chats con admin → 200."""
    user_mock = MagicMock()
    user_mock.user.id = "admin-uuid"
    supabase_mock.auth.get_user.return_value = user_mock
    supabase_mock.auth.get_user.side_effect = None
    supabase_mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {"rol": "admin"}
    supabase_mock.table.return_value.select.return_value.order.return_value.execute.return_value.data = []

    res = await client.get("/admin/chats", headers=AUTH_HEADER)
    assert res.status_code == 200
