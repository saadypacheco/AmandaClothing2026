"""Tests para el flujo de pedidos — lógica crítica de negocio."""
import pytest
from unittest.mock import MagicMock


def _admin_auth(supabase_mock):
    """Helper: configura mock para usuario autenticado."""
    user_mock = MagicMock()
    user_mock.user.id = "user-uuid-123"
    supabase_mock.auth.get_user.return_value = user_mock
    supabase_mock.auth.get_user.side_effect = None


def _make_variante(id=1, producto_id=1, stock=10, precio=15000):
    return {"id": id, "producto_id": producto_id, "stock": stock}


def _make_producto(id=1, precio=15000):
    return {"id": id, "precio": precio, "nombre": "Vestido", "activo": True}


AUTH_HEADER = {"Authorization": "Bearer valid-token"}


@pytest.mark.anyio
async def test_crear_pedido_sin_auth(client):
    """Sin token → 403."""
    res = await client.post("/pedidos", json={"items": [{"variante_id": 1, "cantidad": 1}]})
    assert res.status_code == 403


@pytest.mark.anyio
async def test_crear_pedido_exitoso(client, supabase_mock):
    """Crea pedido con items, calcula total desde BD."""
    _admin_auth(supabase_mock)

    variante = _make_variante(stock=10)
    producto = _make_producto(precio=15000)

    # select variante
    supabase_mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = variante
    # select producto precio
    supabase_mock.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value.execute.return_value.data = producto
    # insert pedido
    supabase_mock.table.return_value.insert.return_value.execute.return_value.data = [{"id": 1, "total": 15000}]

    res = await client.post("/pedidos", json={"items": [{"variante_id": 1, "cantidad": 1}]}, headers=AUTH_HEADER)
    assert res.status_code in (200, 201)


@pytest.mark.anyio
async def test_crear_pedido_guest_exitoso(client, supabase_mock):
    """Guest puede comprar sin cuenta."""
    variante = _make_variante(stock=10)
    producto = _make_producto(precio=15000)

    supabase_mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = variante
    supabase_mock.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value.execute.return_value.data = producto
    supabase_mock.table.return_value.insert.return_value.execute.return_value.data = [{"id": 2, "total": 15000}]

    res = await client.post("/pedidos/guest", json={
        "nombre": "Test User",
        "telefono": "1133821989",
        "items": [{"variante_id": 1, "cantidad": 1}],
    })
    assert res.status_code in (200, 201)


@pytest.mark.anyio
async def test_crear_pedido_guest_sin_telefono(client):
    """Guest sin teléfono → 422 (validación pydantic)."""
    res = await client.post("/pedidos/guest", json={
        "nombre": "Test User",
        "items": [{"variante_id": 1, "cantidad": 1}],
    })
    assert res.status_code == 422


@pytest.mark.anyio
async def test_crear_pedido_cantidad_cero(client, supabase_mock):
    """Cantidad 0 o negativa → 422 (validación pydantic)."""
    _admin_auth(supabase_mock)
    res = await client.post("/pedidos", json={"items": [{"variante_id": 1, "cantidad": 0}]}, headers=AUTH_HEADER)
    assert res.status_code == 422


@pytest.mark.anyio
async def test_crear_pedido_items_vacio(client, supabase_mock):
    """Items vacío → 422."""
    _admin_auth(supabase_mock)
    res = await client.post("/pedidos", json={"items": []}, headers=AUTH_HEADER)
    assert res.status_code == 422


@pytest.mark.anyio
async def test_mis_pedidos_sin_auth(client):
    """Sin token → 403."""
    res = await client.get("/pedidos/mis-pedidos")
    assert res.status_code == 403


@pytest.mark.anyio
async def test_mis_pedidos_con_auth(client, supabase_mock):
    """Devuelve pedidos del usuario logueado."""
    _admin_auth(supabase_mock)

    supabase_mock.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value.data = [
        {"id": 1, "total": 15000, "estado": "nuevo"}
    ]

    res = await client.get("/pedidos/mis-pedidos", headers=AUTH_HEADER)
    assert res.status_code == 200


@pytest.mark.anyio
async def test_vincular_pedidos_sin_auth(client):
    """Sin token → 403."""
    res = await client.post("/pedidos/vincular-telefono")
    assert res.status_code == 403
