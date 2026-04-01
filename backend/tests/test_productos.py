"""
Tests para el router de productos (lectura pública).
"""
import pytest
from unittest.mock import MagicMock


def _make_producto_raw(id=1, nombre="Vestido Lino", precio=15000.0, categoria_id=1, activo=True):
    return {
        "id": id, "nombre": nombre, "descripcion": "Descripción de prueba",
        "precio": precio, "categoria_id": categoria_id, "activo": activo, "imagen_url": None,
    }


def _make_variante_raw(id=1, producto_id=1):
    return {
        "id": id, "producto_id": producto_id,
        "talla": "M", "color": "Blanco", "stock": 10, "sku": f"SKU-{id:03d}",
    }


def _make_categoria_raw(id=1):
    return {"id": id, "nombre": "Vestidos", "slug": "vestidos", "padre_id": None, "complementos": []}


@pytest.mark.anyio
async def test_listar_productos_vacio(client, supabase_mock):
    """Cuando no hay productos, devuelve lista vacía."""
    # El router hace: .select('*').eq('activo', True).range(0, 19).execute()
    supabase_mock.table.return_value.select.return_value\
        .eq.return_value.range.return_value.execute.return_value.data = []

    res = await client.get("/productos/")
    assert res.status_code == 200
    assert res.json() == []


@pytest.mark.anyio
async def test_listar_productos_con_datos(client, supabase_mock):
    """Devuelve productos enriquecidos con variantes."""
    producto = _make_producto_raw()
    variante = _make_variante_raw()
    categoria = _make_categoria_raw()

    # Productos: .select('*').eq('activo', True).range(0,19).execute()
    supabase_mock.table.return_value.select.return_value\
        .eq.return_value.range.return_value.execute.return_value.data = [producto]

    # Variantes y categorías: .select('*').in_(...).execute() — dos llamadas distintas
    supabase_mock.table.return_value.select.return_value.in_\
        .return_value.execute.side_effect = [
            MagicMock(data=[variante]),
            MagicMock(data=[categoria]),
        ]

    res = await client.get("/productos/")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["nombre"] == "Vestido Lino"
    assert data[0]["precio"] == 15000.0
    assert len(data[0]["variantes"]) == 1


@pytest.mark.anyio
async def test_listar_productos_con_filtro_categoria(client, supabase_mock):
    """Filtrar por categoria_id reduce los resultados."""
    # Con filtro categoria_id: .eq('activo', T).eq('categoria_id', X).range().execute()
    supabase_mock.table.return_value.select.return_value\
        .eq.return_value.eq.return_value.range.return_value.execute.return_value.data = []

    res = await client.get("/productos/?categoria_id=1")
    assert res.status_code == 200
    assert res.json() == []


@pytest.mark.anyio
async def test_obtener_producto_no_encontrado(client, supabase_mock):
    """Devuelve 404 cuando el producto no existe."""
    # Router: .select('*').eq('id', X).eq('activo', True).execute()
    supabase_mock.table.return_value.select.return_value\
        .eq.return_value.eq.return_value.execute.return_value.data = []

    res = await client.get("/productos/9999")
    assert res.status_code == 404
    assert "no encontrado" in res.json()["detail"].lower()


@pytest.mark.anyio
async def test_categorias_publicas(client, supabase_mock):
    """GET /categorias devuelve lista sin autenticación."""
    supabase_mock.table.return_value.select.return_value\
        .order.return_value.execute.return_value.data = [
            {"id": 1, "nombre": "Vestidos", "slug": "vestidos"},
            {"id": 2, "nombre": "Pantalones", "slug": "pantalones"},
        ]

    res = await client.get("/categorias")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2
    assert data[0]["slug"] == "vestidos"
