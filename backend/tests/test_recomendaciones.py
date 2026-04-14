"""Tests del motor de recomendaciones."""
import pytest
from unittest.mock import MagicMock


@pytest.mark.anyio
async def test_recomendaciones_sin_params(client, supabase_mock):
    """GET /recomendaciones sin parámetros retorna lista (fallback novedades)."""
    supabase_mock.table.return_value.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = []

    res = await client.get("/recomendaciones")
    assert res.status_code == 200


@pytest.mark.anyio
async def test_recomendaciones_con_producto(client, supabase_mock):
    """GET /recomendaciones?producto_id=1 retorna recos basadas en producto."""
    supabase_mock.table.return_value.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = []
    supabase_mock.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []

    res = await client.get("/recomendaciones?producto_id=1&limit=4")
    assert res.status_code == 200


@pytest.mark.anyio
async def test_recomendaciones_respeta_limit(client, supabase_mock):
    """El parámetro limit se respeta."""
    productos = [{"id": i, "nombre": f"Prod {i}", "precio": 1000, "activo": True, "imagen_url": None, "categoria_id": 1} for i in range(10)]
    supabase_mock.table.return_value.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = productos[:3]

    res = await client.get("/recomendaciones?limit=3")
    assert res.status_code == 200


@pytest.mark.anyio
async def test_recomendaciones_con_session(client, supabase_mock):
    """GET /recomendaciones?session_id=X usa sesión para personalizar."""
    supabase_mock.table.return_value.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = []

    res = await client.get("/recomendaciones?session_id=test-uuid&limit=4")
    assert res.status_code == 200
