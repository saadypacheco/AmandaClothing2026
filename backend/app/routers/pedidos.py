from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.client import get_supabase_client
from pydantic import BaseModel, field_validator
from typing import List
from supabase import Client

router = APIRouter(prefix="/pedidos", tags=["pedidos"])
security = HTTPBearer()


def get_db() -> Client:
    return get_supabase_client()


class ItemPedidoCreate(BaseModel):
    variante_id: int
    cantidad: int

    @field_validator("cantidad")
    @classmethod
    def cantidad_positiva(cls, v: int) -> int:
        if v < 1:
            raise ValueError("La cantidad debe ser al menos 1")
        return v


class PedidoCreate(BaseModel):
    items: List[ItemPedidoCreate]


@router.post("", status_code=201)
async def crear_pedido(
    body: PedidoCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    """
    Crea un pedido. El precio se lee siempre de la base de datos,
    nunca del frontend, para evitar manipulación de precios.
    También verifica stock disponible antes de confirmar.
    """
    token = credentials.credentials
    try:
        user_resp = db.auth.get_user(token)
        user_id = user_resp.user.id
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    if not body.items:
        raise HTTPException(status_code=400, detail="El pedido no tiene items")

    try:
        # Obtener variantes + precio real desde la BD
        variante_ids = [item.variante_id for item in body.items]
        variantes_res = db.table("variantes") \
            .select("id, stock, productos(precio)") \
            .in_("id", variante_ids) \
            .execute()

        variantes_map = {v["id"]: v for v in (variantes_res.data or [])}

        # Validar que todas las variantes existen y tienen stock suficiente
        for item in body.items:
            variante = variantes_map.get(item.variante_id)
            if not variante:
                raise HTTPException(status_code=400, detail=f"Variante {item.variante_id} no encontrada")
            if variante["stock"] < item.cantidad:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para variante {item.variante_id} (disponible: {variante['stock']})"
                )

        # Calcular total real desde la BD
        total_real = sum(
            variantes_map[item.variante_id]["productos"]["precio"] * item.cantidad
            for item in body.items
        )

        # Crear pedido con total verificado
        pedido_res = db.table("pedidos").insert({
            "usuario_id": user_id,
            "total": round(total_real, 2),
            "estado": "pendiente",
        }).execute()

        if not pedido_res.data:
            raise HTTPException(status_code=500, detail="Error al crear pedido")

        pedido_id = pedido_res.data[0]["id"]

        # Crear items con precio real de la BD
        items_data = [
            {
                "pedido_id": pedido_id,
                "variante_id": item.variante_id,
                "cantidad": item.cantidad,
                "precio_unitario": variantes_map[item.variante_id]["productos"]["precio"],
            }
            for item in body.items
        ]
        db.table("items_pedido").insert(items_data).execute()

        return {**pedido_res.data[0], "total": total_real}

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
