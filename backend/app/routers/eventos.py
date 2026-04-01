from fastapi import APIRouter, Depends, HTTPException
from app.db.client import get_supabase_client
from supabase import Client
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter(prefix="/eventos", tags=["eventos"])


def get_db() -> Client:
    return get_supabase_client()


class EventoCreate(BaseModel):
    session_id: str
    producto_id: int
    tipo_evento: str  # vista | wishlist | carrito | compra
    usuario_id: Optional[str] = None
    duracion_segundos: Optional[int] = None


PESOS = {
    "vista": 1,
    "wishlist": 3,
    "carrito": 5,
    "compra": 10,
}


@router.post("", status_code=204)
async def registrar_evento(evento: EventoCreate, db: Client = Depends(get_db)):
    """Registra un evento de comportamiento. Fire-and-forget, no bloquea la UI."""
    if evento.tipo_evento not in PESOS:
        raise HTTPException(status_code=400, detail="tipo_evento inválido")

    try:
        db.table("eventos_usuario").insert({
            "session_id": evento.session_id,
            "usuario_id": evento.usuario_id,
            "producto_id": evento.producto_id,
            "tipo_evento": evento.tipo_evento,
            "peso": PESOS[evento.tipo_evento],
            "duracion_segundos": evento.duracion_segundos,
        }).execute()
    except Exception:
        # No propagamos el error — el tracking nunca bloquea al usuario
        pass
