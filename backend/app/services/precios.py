"""
Resolución de precios para modo mayorista.

Orden de precedencia (mayor a menor):
1. precios_lista para (lista_id, variante_id) — precio especifico de variante en la lista.
2. precios_lista para (lista_id, producto_id) sin variante — precio del producto en la lista.
3. productos.precio — fallback al precio publico (lista "Minorista").

Sobre el precio resuelto se aplica `descuento_general` del usuario.
"""
from typing import Optional, Iterable
from supabase import Client


def _aplicar_descuento(precio: float, descuento_pct: float) -> float:
    if not descuento_pct:
        return precio
    return round(precio * (1 - descuento_pct / 100.0), 2)


def cargar_lista(db: Client, lista_id: int) -> dict:
    """Devuelve {(producto_id, variante_id|None): {'precio': X, 'descuento_pct': Y}} para la lista."""
    if not lista_id:
        return {}
    result = db.table("precios_lista").select(
        "producto_id, variante_id, precio, descuento_pct"
    ).eq("lista_id", lista_id).execute()

    mapa: dict = {}
    for row in result.data or []:
        key = (row.get("producto_id"), row.get("variante_id"))
        mapa[key] = {
            "precio": float(row["precio"]),
            "descuento_pct": float(row.get("descuento_pct") or 0),
        }
    return mapa


def resolver_precio_producto(
    mapa_lista: dict,
    producto_id: int,
    precio_default: float,
    descuento_usuario: float = 0,
    variante_id: Optional[int] = None,
) -> float:
    """Resuelve el precio segun precedencia. Aplica descuento de la lista + descuento del usuario."""
    precio = None
    descuento_lista = 0

    if variante_id is not None and (producto_id, variante_id) in mapa_lista:
        item = mapa_lista[(producto_id, variante_id)]
        precio = item["precio"]
        descuento_lista = item["descuento_pct"]
    elif (producto_id, None) in mapa_lista:
        item = mapa_lista[(producto_id, None)]
        precio = item["precio"]
        descuento_lista = item["descuento_pct"]
    else:
        precio = precio_default

    precio = _aplicar_descuento(precio, descuento_lista)
    precio = _aplicar_descuento(precio, descuento_usuario)
    return precio


def aplicar_lista_a_productos(
    db: Client,
    productos_data: Iterable[dict],
    lista_id: Optional[int],
    descuento_usuario: float = 0,
) -> Iterable[dict]:
    """Muta los productos in-place: reemplaza productos[i]['precio'] segun la lista."""
    if not lista_id:
        return productos_data

    mapa = cargar_lista(db, lista_id)
    for p in productos_data:
        precio = resolver_precio_producto(
            mapa_lista=mapa,
            producto_id=p["id"],
            precio_default=float(p.get("precio") or 0),
            descuento_usuario=descuento_usuario,
        )
        p["precio"] = precio
    return productos_data


def get_lista_y_descuento_usuario(db: Client, usuario_id: Optional[str]) -> tuple:
    """Devuelve (lista_precio_id, descuento_general) para un usuario. (None, 0) si no aplica."""
    if not usuario_id:
        return (None, 0.0)
    result = db.table("usuarios").select(
        "lista_precio_id, descuento_general, estado_cuenta"
    ).eq("id", usuario_id).single().execute()
    if not result.data or result.data.get("estado_cuenta") != "activo":
        return (None, 0.0)
    return (
        result.data.get("lista_precio_id"),
        float(result.data.get("descuento_general") or 0),
    )
