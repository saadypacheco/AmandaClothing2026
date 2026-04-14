"""Tests de autenticación — seguridad de endpoints."""
import pytest
from unittest.mock import MagicMock


AUTH_HEADER = {"Authorization": "Bearer valid-token"}


@pytest.mark.anyio
async def test_login_sin_credenciales(client):
    """Login sin email/password → 422."""
    res = await client.post("/auth/login", json={})
    assert res.status_code == 422


@pytest.mark.anyio
async def test_register_sin_datos(client):
    """Registro sin campos → 422."""
    res = await client.post("/auth/register", json={})
    assert res.status_code == 422


@pytest.mark.anyio
async def test_get_me_sin_token(client):
    """GET /auth/me sin token → 403."""
    res = await client.get("/auth/me")
    assert res.status_code == 403


@pytest.mark.anyio
async def test_get_me_token_invalido(client, supabase_mock):
    """GET /auth/me con token inválido → 401."""
    supabase_mock.auth.get_user.side_effect = Exception("invalid token")
    res = await client.get("/auth/me", headers=AUTH_HEADER)
    assert res.status_code == 401
