"""Tests extendidos de admin — CRUD de productos, categorías, variantes."""
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
async def test_admin_crear_producto(client, supabase_mock):
    """Admin puede crear producto."""
    _admin_auth(supabase_mock)
    supabase_mock.table.return_value.insert.return_value.execute.return_value.data = [
        {"id": 1, "nombre": "Vestido", "precio": 15000}
    ]

    form = {"nombre": "Vestido", "descripcion": "Test", "precio": "15000", "categoria_id": "1"}
    res = await client.post("/admin/productos", data=form, headers=AUTH_HEADER)
    assert res.status_code == 200


@pytest.mark.anyio
async def test_admin_editar_producto(client, supabase_mock):
    """PATCH actualiza campos correctos."""
    _admin_auth(supabase_mock)
    supabase_mock.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [
        {"id": 1, "precio": 20000}
    ]

    res = await client.patch("/admin/productos/1", data={"precio": "20000"}, headers=AUTH_HEADER)
    assert res.status_code == 200


@pytest.mark.anyio
async def test_admin_editar_sin_campos(client, supabase_mock):
    """PATCH sin campos → 400."""
    _admin_auth(supabase_mock)
    res = await client.patch("/admin/productos/1", data={}, headers=AUTH_HEADER)
    assert res.status_code == 400


@pytest.mark.anyio
async def test_admin_subir_imagen_formato_invalido(client, supabase_mock):
    """Subir .txt → 400."""
    _admin_auth(supabase_mock)
    supabase_mock.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{"id": 1}]

    res = await client.post(
        "/admin/productos/1/imagen",
        files={"file": ("test.txt", b"hello", "text/plain")},
        headers=AUTH_HEADER,
    )
    assert res.status_code == 400


@pytest.mark.anyio
async def test_admin_crear_categoria(client, supabase_mock):
    """Crea categoría con nombre y slug."""
    _admin_auth(supabase_mock)
    supabase_mock.table.return_value.insert.return_value.execute.return_value.data = [
        {"id": 1, "nombre": "Vestidos", "slug": "vestidos"}
    ]

    res = await client.post("/admin/categorias", data={"nombre": "Vestidos", "slug": "vestidos"}, headers=AUTH_HEADER)
    assert res.status_code == 200


@pytest.mark.anyio
async def test_admin_crear_variante(client, supabase_mock):
    """Crea variante con talla, color, stock, sku."""
    _admin_auth(supabase_mock)
    supabase_mock.table.return_value.insert.return_value.execute.return_value.data = [
        {"id": 1, "talla": "M", "color": "Negro", "stock": 10, "sku": "V-M-N"}
    ]

    res = await client.post("/admin/productos/1/variantes", data={
        "talla": "M", "color": "Negro", "stock": "10", "sku": "V-M-N"
    }, headers=AUTH_HEADER)
    assert res.status_code == 200


@pytest.mark.anyio
async def test_admin_eliminar_variante_soft_delete(client, supabase_mock):
    """DELETE variante usa activo=false, no borra de BD."""
    _admin_auth(supabase_mock)
    supabase_mock.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [{"id": 1}]

    res = await client.delete("/admin/variantes/1", headers=AUTH_HEADER)
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True


@pytest.mark.anyio
async def test_admin_publicar_sin_imagen(client, supabase_mock):
    """Publicar producto sin imagen → 400."""
    _admin_auth(supabase_mock)
    supabase_mock.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
        {"id": 1, "nombre": "Test", "precio": 1000, "descripcion": "", "imagen_url": None}
    ]

    res = await client.post("/admin/productos/1/publicar", data={"redes": "telegram"}, headers=AUTH_HEADER)
    assert res.status_code == 400
