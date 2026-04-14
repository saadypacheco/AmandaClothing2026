"""Tests completos de autenticación."""
import pytest
from unittest.mock import MagicMock


AUTH_HEADER = {"Authorization": "Bearer valid-token"}


@pytest.mark.anyio
async def test_login_sin_credenciales(client):
    """Login sin email/password → 422."""
    res = await client.post("/auth/login", json={})
    assert res.status_code == 422


@pytest.mark.anyio
async def test_login_credenciales_invalidas(client, supabase_mock):
    """Email/password incorrecto → 401."""
    supabase_mock.auth.sign_in_with_password.side_effect = Exception("Invalid credentials")

    res = await client.post("/auth/login", json={"email": "test@test.com", "password": "wrong"})
    assert res.status_code == 401


@pytest.mark.anyio
async def test_login_exitoso(client, supabase_mock):
    """Login correcto retorna token."""
    session_mock = MagicMock()
    session_mock.session.access_token = "jwt-token-123"
    session_mock.session.refresh_token = "refresh-123"
    session_mock.user.id = "user-uuid"
    session_mock.user.email = "test@test.com"
    supabase_mock.auth.sign_in_with_password.return_value = session_mock

    supabase_mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
        "id": "user-uuid", "nombre": "Test", "rol": "cliente"
    }

    res = await client.post("/auth/login", json={"email": "test@test.com", "password": "pass123"})
    assert res.status_code == 200


@pytest.mark.anyio
async def test_register_sin_datos(client):
    """Registro sin campos → 422."""
    res = await client.post("/auth/register", json={})
    assert res.status_code == 422


@pytest.mark.anyio
async def test_register_exitoso(client, supabase_mock):
    """Registro correcto crea usuario."""
    signup_mock = MagicMock()
    signup_mock.user.id = "new-user-uuid"
    signup_mock.user.email = "new@test.com"
    signup_mock.session.access_token = "jwt-new"
    signup_mock.session.refresh_token = "refresh-new"
    supabase_mock.auth.sign_up.return_value = signup_mock

    supabase_mock.table.return_value.insert.return_value.execute.return_value.data = [
        {"id": "new-user-uuid", "email": "new@test.com", "nombre": "Nuevo", "rol": "cliente"}
    ]

    res = await client.post("/auth/register", json={
        "email": "new@test.com",
        "password": "pass123456",
        "nombre": "Nuevo User",
    })
    assert res.status_code in (200, 201)


@pytest.mark.anyio
async def test_get_me_sin_token(client):
    """GET /auth/me sin token → 403."""
    res = await client.get("/auth/me")
    assert res.status_code == 403


@pytest.mark.anyio
async def test_get_me_con_token(client, supabase_mock):
    """GET /auth/me con token válido retorna datos."""
    user_mock = MagicMock()
    user_mock.user.id = "user-uuid-123"
    user_mock.user.email = "test@test.com"
    supabase_mock.auth.get_user.return_value = user_mock
    supabase_mock.auth.get_user.side_effect = None

    supabase_mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
        "id": "user-uuid-123", "email": "test@test.com", "nombre": "Test", "rol": "cliente"
    }

    res = await client.get("/auth/me", headers=AUTH_HEADER)
    assert res.status_code == 200
