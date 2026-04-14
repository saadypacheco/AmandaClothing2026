"""Tests del chat y agente IA endpoint."""
import pytest
from unittest.mock import MagicMock, patch


AUTH_HEADER = {"Authorization": "Bearer valid-token"}


def _user_auth(supabase_mock, user_id="user-uuid-123"):
    user_mock = MagicMock()
    user_mock.user.id = user_id
    supabase_mock.auth.get_user.return_value = user_mock
    supabase_mock.auth.get_user.side_effect = None


@pytest.mark.anyio
async def test_chat_agente_sin_auth(client):
    """POST /chat/agente sin token → 403."""
    res = await client.post("/chat/agente", json={
        "chat_id": 1, "mensaje": "hola"
    })
    assert res.status_code == 403


@pytest.mark.anyio
async def test_chat_agente_responde(client, supabase_mock):
    """POST /chat/agente retorna respuesta."""
    _user_auth(supabase_mock)

    # Chat pertenece al usuario
    supabase_mock.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value.execute.return_value.data = {
        "id": 1, "usuario_id": "user-uuid-123"
    }
    # Historial vacío
    supabase_mock.table.return_value.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = []
    # Insert mensaje usuario + bot
    supabase_mock.table.return_value.insert.return_value.execute.return_value.data = [{"id": 1}]

    with patch("app.routers.chat.get_respuesta", return_value="Hola! ¿En qué te puedo ayudar?"):
        res = await client.post("/chat/agente", json={
            "chat_id": 1, "mensaje": "hola"
        }, headers=AUTH_HEADER)
        assert res.status_code == 200


@pytest.mark.anyio
async def test_admin_listar_chats(client, supabase_mock):
    """GET /admin/chats lista todos los chats (admin)."""
    user_mock = MagicMock()
    user_mock.user.id = "admin-uuid"
    supabase_mock.auth.get_user.return_value = user_mock
    supabase_mock.auth.get_user.side_effect = None
    supabase_mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {"rol": "admin"}

    supabase_mock.table.return_value.select.return_value.order.return_value.execute.return_value.data = [
        {"id": 1, "tipo": "privado", "usuario_id": "user-123"}
    ]

    res = await client.get("/admin/chats", headers=AUTH_HEADER)
    assert res.status_code == 200
