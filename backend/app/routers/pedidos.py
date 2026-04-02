from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.client import get_supabase_client
from pydantic import BaseModel
from typing import List
from supabase import Client

router = APIRouter(prefix="/pedidos", tags=["pedidos"])
security = HTTPBearer()


def get_db() -> Client:
    return get_supabase_client()


class ItemPedidoCreate(BaseModel):
    variante_id: int
    cantidad: int
    precio_unitario: float


class PedidoCreate(BaseModel):
    items: List[ItemPedidoCreate]
    total: float


@router.post("", status_code=201)
async def crear_pedido(
    body: PedidoCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    """Crea un pedido con sus items. Requiere usuario autenticado."""
    token = credentials.credentials
    try:
        user_resp = db.auth.get_user(token)
        user_id = user_resp.user.id
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    if not body.items:
        raise HTTPException(status_code=400, detail="El pedido no tiene items")

    try:
        pedido_res = db.table("pedidos").insert({
            "usuario_id": user_id,
            "total": body.total,
            "estado": "pendiente",
        }).execute()

        if not pedido_res.data:
            raise HTTPException(status_code=500, detail="Error al crear pedido")

        pedido_id = pedido_res.data[0]["id"]

        items_data = [
            {
                "pedido_id": pedido_id,
                "variante_id": item.variante_id,
                "cantidad": item.cantidad,
                "precio_unitario": item.precio_unitario,
            }
            for item in body.items
        ]
        db.table("items_pedido").insert(items_data).execute()

        return pedido_res.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mis-pedidos")
async def mis_pedidos(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    """Devuelve los pedidos del usuario autenticado con sus items."""
    token = credentials.credentials
    try:
        user_resp = db.auth.get_user(token)
        user_id = user_resp.user.id
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    try:
        pedidos_res = db.table("pedidos") \
            .select("*, items_pedido(id, cantidad, precio_unitario, variantes(id, talla, color, productos(id, nombre, imagen_url)))") \
            .eq("usuario_id", user_id) \
            .order("created_at", desc=True) \
            .execute()

        return pedidos_res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
