"""
Endpoints admin de gestion de pedidos B2B.

Estados B2B:
  borrador → cotizado → pendiente_aprobacion → aprobado
                                          ↓
                                       preparacion → despacho → entregado → facturado
  → cancelado (desde cualquier estado)

Reglas:
- Al aprobar un pedido con metodo_pago='cuenta_corriente', se genera un
  movimiento_cc tipo 'cargo' con vencimiento = aprobado_en + dias_pago_default.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.client import get_supabase_client
from app.routers.admin import require_admin
from supabase import Client
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta

router = APIRouter(prefix="/admin/pedidos", tags=["admin-pedidos"])
security = HTTPBearer()

ESTADOS_VALIDOS = {
    "borrador", "cotizado", "pendiente_aprobacion", "aprobado",
    "preparacion", "despacho", "entregado", "facturado", "cancelado",
    # estados legacy minoristas (mantener retro-compat)
    "pendiente", "pagado", "preparando", "enviado",
}

_DIAS_MAP = {"contado": 0, "15_dias": 15, "30_dias": 30, "60_dias": 60, "90_dias": 90}


def get_db() -> Client:
    return get_supabase_client()


class CambiarEstadoRequest(BaseModel):
    estado: str
    nota_interna: Optional[str] = None


class AsignarDocumentoRequest(BaseModel):
    numero: str


@router.get("")
async def listar_pedidos(
    estado: Optional[str] = None,
    tipo: Optional[str] = None,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Lista pedidos con filtros opcionales por estado y tipo (minorista/mayorista)."""
    q = db.table("pedidos").select(
        "id, total, estado, tipo, metodo_pago, condicion_pago, vencimiento, "
        "comprobante_url, remito_numero, factura_numero, nota_interna, "
        "aprobado_en, created_at, usuario_id, "
        "usuarios(email, nombre, razon_social, tipo_cuenta)"
    )
    if estado:
        q = q.eq("estado", estado)
    if tipo:
        q = q.eq("tipo", tipo)
    result = q.order("created_at", desc=True).execute()
    return result.data or []


@router.get("/pendientes-aprobacion")
async def listar_pendientes_aprobacion(
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Pedidos en estado 'pendiente_aprobacion'. Atajo para el dashboard mayorista."""
    result = db.table("pedidos").select(
        "id, total, estado, tipo, metodo_pago, condicion_pago, comprobante_url, "
        "created_at, usuario_id, usuarios(email, nombre, razon_social)"
    ).eq("estado", "pendiente_aprobacion").order("created_at", desc=True).execute()
    return result.data or []


@router.get("/{pedido_id}")
async def detalle_pedido(pedido_id: int, db: Client = Depends(get_db), _: None = Depends(require_admin)):
    pedido_res = db.table("pedidos").select(
        "*, usuarios(id, email, nombre, razon_social, cuit, tipo_cuenta, lista_precio_id, "
        "condicion_pago_default), "
        "items_pedido(id, cantidad, precio_unitario, variantes(id, talla, color, sku, productos(id, nombre, imagen_url)))"
    ).eq("id", pedido_id).single().execute()
    if not pedido_res.data:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido_res.data


@router.post("/{pedido_id}/cambiar-estado")
async def cambiar_estado(
    pedido_id: int,
    body: CambiarEstadoRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    """Transiciona el estado de un pedido. Si es aprobacion + cuenta_corriente,
    crea automaticamente el cargo en CC."""
    require_admin(credentials, db)
    if body.estado not in ESTADOS_VALIDOS:
        raise HTTPException(status_code=400, detail=f"Estado invalido: {body.estado}")

    try:
        admin_id = db.auth.get_user(credentials.credentials).user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Token invalido")

    pedido_res = db.table("pedidos").select(
        "id, usuario_id, total, estado, tipo, metodo_pago, condicion_pago, vencimiento"
    ).eq("id", pedido_id).single().execute()
    if not pedido_res.data:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    pedido = pedido_res.data
    estado_anterior = pedido["estado"]

    update = {"estado": body.estado}
    if body.nota_interna:
        update["nota_interna"] = body.nota_interna

    # Hito de aprobacion
    if body.estado == "aprobado" and estado_anterior != "aprobado":
        update["aprobado_por"] = admin_id
        update["aprobado_en"] = datetime.utcnow().isoformat()

        # Si es cuenta corriente, generar cargo
        if pedido.get("metodo_pago") == "cuenta_corriente" and pedido.get("tipo") == "mayorista":
            cc = db.table("cuentas_corriente").select("id, dias_pago_default") \
                .eq("usuario_id", pedido["usuario_id"]).single().execute()
            if cc.data:
                dias = _DIAS_MAP.get(pedido.get("condicion_pago") or "contado", cc.data.get("dias_pago_default") or 30)
                vencimiento = (datetime.utcnow() + timedelta(days=dias)).date().isoformat() if dias > 0 else None
                db.table("movimientos_cc").insert({
                    "cuenta_id": cc.data["id"],
                    "tipo": "cargo",
                    "monto": float(pedido["total"]),
                    "pedido_id": pedido_id,
                    "descripcion": f"Pedido #{pedido_id}",
                    "fecha_vencimiento": vencimiento,
                    "creado_por": admin_id,
                }).execute()
                update["vencimiento"] = vencimiento

    db.table("pedidos").update(update).eq("id", pedido_id).execute()
    return {"ok": True, "estado_anterior": estado_anterior, "estado_nuevo": body.estado}


@router.post("/{pedido_id}/aprobar")
async def aprobar_pedido(
    pedido_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    """Atajo para aprobar pedido. Equivalente a cambiar-estado con 'aprobado'."""
    return await cambiar_estado(
        pedido_id, CambiarEstadoRequest(estado="aprobado"), credentials, db
    )


@router.post("/{pedido_id}/rechazar")
async def rechazar_pedido(
    pedido_id: int,
    body: CambiarEstadoRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    """Rechaza un pedido (lo deja en 'cancelado'). Se puede pasar motivo en nota_interna."""
    body.estado = "cancelado"
    return await cambiar_estado(pedido_id, body, credentials, db)


@router.post("/{pedido_id}/remito")
async def asignar_remito(
    pedido_id: int,
    body: AsignarDocumentoRequest,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    db.table("pedidos").update({"remito_numero": body.numero}).eq("id", pedido_id).execute()
    return {"ok": True}


@router.post("/{pedido_id}/factura")
async def asignar_factura(
    pedido_id: int,
    body: AsignarDocumentoRequest,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    db.table("pedidos").update({"factura_numero": body.numero}).eq("id", pedido_id).execute()
    return {"ok": True}


@router.get("/cotizado/{pedido_id}")
async def get_cotizacion(pedido_id: int, db: Client = Depends(get_db), _: None = Depends(require_admin)):
    """Devuelve el pedido para editar antes de enviar cotizacion al cliente."""
    return await detalle_pedido(pedido_id, db, None)


class EditarItemPedido(BaseModel):
    item_id: int
    cantidad: Optional[int] = None
    precio_unitario: Optional[float] = None


class EditarPedidoRequest(BaseModel):
    items: List[EditarItemPedido]


@router.patch("/{pedido_id}/items")
async def editar_items(
    pedido_id: int,
    body: EditarPedidoRequest,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Edita items de un pedido (cantidad/precio). Recalcula el total."""
    for it in body.items:
        upd = {}
        if it.cantidad is not None:
            upd["cantidad"] = it.cantidad
        if it.precio_unitario is not None:
            upd["precio_unitario"] = it.precio_unitario
        if upd:
            db.table("items_pedido").update(upd).eq("id", it.item_id).execute()

    # Recalcular total
    items_res = db.table("items_pedido").select("cantidad, precio_unitario").eq("pedido_id", pedido_id).execute()
    nuevo_total = sum(float(i["precio_unitario"] or 0) * int(i["cantidad"] or 0) for i in items_res.data or [])
    db.table("pedidos").update({"total": round(nuevo_total, 2)}).eq("id", pedido_id).execute()
    return {"ok": True, "total": nuevo_total}
