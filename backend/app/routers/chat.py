from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from app.db.client import get_supabase_client
from app.services.agente import get_respuesta
from supabase import Client

router = APIRouter(prefix="/chat", tags=["chat"])
security = HTTPBearer()

MAX_HISTORIAL = 10  # mensajes a enviar como contexto


class AgenteRequest(BaseModel):
    chat_id: int
    mensaje: str
    producto_id: Optional[int] = None


def get_db() -> Client:
    return get_supabase_client()


@router.post("/agente")
async def responder_agente(
    req: AgenteRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    # Verificar token y obtener user_id
    try:
        user_resp = db.auth.get_user(credentials.credentials)
        user_id = user_resp.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")

    # Verificar que el chat pertenece al usuario
    chat_res = db.table("chats").select("id, producto_id").eq("id", req.chat_id).eq("usuario_id", user_id).execute()
    if not chat_res.data:
        raise HTTPException(status_code=403, detail="Chat no encontrado")

    # Obtener historial reciente (excluyendo mensajes del bot)
    msgs_res = db.table("mensajes_chat") \
        .select("remitente_id, contenido, es_bot") \
        .eq("chat_id", req.chat_id) \
        .order("created_at", desc=True) \
        .limit(MAX_HISTORIAL) \
        .execute()

    # Ordenar cronológicamente y construir historial
    msgs = list(reversed(msgs_res.data or []))
    historial = []
    for m in msgs:
        es_bot = m.get("es_bot") or m.get("remitente_id") is None
        rol = "model" if es_bot else "user"
        historial.append({"rol": rol, "contenido": m["contenido"]})

    # Si el historial está vacío o el último mensaje no es el del usuario, agregar el mensaje actual
    if not historial or historial[-1]["rol"] != "user":
        historial.append({"rol": "user", "contenido": req.mensaje})

    # Contexto del producto
    contexto_producto = None
    producto_id = req.producto_id or chat_res.data[0].get("producto_id")
    if producto_id:
        prod_res = db.table("productos") \
            .select("nombre, descripcion, precio, precio_original") \
            .eq("id", producto_id) \
            .execute()
        if prod_res.data:
            p = prod_res.data[0]
            contexto_producto = f"Nombre: {p['nombre']}\nDescripción: {p.get('descripcion', '')}\nPrecio: ${p['precio']}"
            if p.get("precio_original"):
                contexto_producto += f" (antes ${p['precio_original']})"

    # Llamar al agente
    respuesta = get_respuesta(historial, contexto_producto)

    # Insertar respuesta del bot (service_role bypasses RLS)
    db.table("mensajes_chat").insert({
        "chat_id": req.chat_id,
        "remitente_id": None,
        "contenido": respuesta,
        "es_bot": True,
    }).execute()

    return {"respuesta": respuesta}
