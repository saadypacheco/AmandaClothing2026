"""
Router de cuenta corriente B2B.

Endpoints admin:
- GET /admin/cuentas-corriente — lista cuentas con saldo y datos del cliente
- GET /admin/cuentas-corriente/cobranzas — movimientos con deuda (vencidos o por vencer)
- GET /admin/cuentas-corriente/{cuenta_id} — detalle de cuenta
- GET /admin/cuentas-corriente/{cuenta_id}/movimientos — historial
- POST /admin/cuentas-corriente/{cuenta_id}/movimientos — agregar pago / NC / ND
- DELETE /admin/movimientos-cc/{mov_id} — anular movimiento

Endpoints cliente:
- GET /me/cuenta-corriente — saldo del cliente logueado
- GET /me/cuenta-corriente/movimientos — historial del cliente logueado
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.client import get_supabase_client
from app.routers.admin import require_admin
from app.models.mayorista import MovimientoCCCreate
from supabase import Client
from typing import Optional
from datetime import datetime, date

router = APIRouter(tags=["mayorista-cc"])
security = HTTPBearer()


def get_db() -> Client:
    return get_supabase_client()


# ── Admin ────────────────────────────────────────────────────────────────────

@router.get("/admin/cuentas-corriente")
async def listar_cuentas(
    solo_con_saldo: bool = False,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Lista todas las cuentas corrientes con datos del cliente y saldo actual."""
    q = db.table("cuentas_corriente").select(
        "*, usuarios(id, email, nombre, razon_social, cuit, tipo_cuenta)"
    )
    if solo_con_saldo:
        q = q.gt("saldo_actual", 0)
    result = q.order("saldo_actual", desc=True).execute()
    return result.data or []


@router.get("/admin/cuentas-corriente/cobranzas")
async def listar_cobranzas(db: Client = Depends(get_db), _: None = Depends(require_admin)):
    """Movimientos tipo 'cargo' con fecha_pago nula. Agrupa por vencido vs por vencer."""
    hoy = date.today().isoformat()
    result = db.table("movimientos_cc").select(
        "id, cuenta_id, monto, descripcion, fecha_vencimiento, created_at, "
        "pedido_id, cuentas_corriente(usuarios(id, email, nombre, razon_social))"
    ).eq("tipo", "cargo").is_("fecha_pago", "null") \
     .not_.is_("fecha_vencimiento", "null").execute()

    cargos = result.data or []
    vencidos = [c for c in cargos if c["fecha_vencimiento"] and c["fecha_vencimiento"] < hoy]
    por_vencer = [c for c in cargos if c["fecha_vencimiento"] and c["fecha_vencimiento"] >= hoy]

    total_vencido = sum(float(c["monto"]) for c in vencidos)
    total_por_vencer = sum(float(c["monto"]) for c in por_vencer)

    return {
        "vencidos": vencidos,
        "por_vencer": por_vencer,
        "total_vencido": total_vencido,
        "total_por_vencer": total_por_vencer,
    }


@router.get("/admin/cuentas-corriente/{cuenta_id}")
async def detalle_cuenta(
    cuenta_id: int,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    result = db.table("cuentas_corriente").select(
        "*, usuarios(id, email, nombre, razon_social, cuit, condicion_iva, "
        "telefono_contacto, direccion_fiscal, lista_precio_id, condicion_pago_default)"
    ).eq("id", cuenta_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    return result.data


@router.get("/admin/cuentas-corriente/{cuenta_id}/movimientos")
async def movimientos_cuenta(
    cuenta_id: int,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    result = db.table("movimientos_cc").select("*").eq("cuenta_id", cuenta_id) \
        .order("created_at", desc=True).execute()
    return result.data or []


@router.post("/admin/cuentas-corriente/{cuenta_id}/movimientos")
async def crear_movimiento(
    cuenta_id: int,
    body: MovimientoCCCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    require_admin(credentials, db)
    if body.tipo not in {"cargo", "pago", "nota_credito", "nota_debito"}:
        raise HTTPException(status_code=400, detail=f"Tipo invalido: {body.tipo}")
    try:
        admin_id = db.auth.get_user(credentials.credentials).user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Token invalido")

    payload = body.model_dump()
    payload["cuenta_id"] = cuenta_id
    payload["monto"] = float(payload["monto"])
    payload["creado_por"] = admin_id
    if payload.get("fecha_vencimiento"):
        payload["fecha_vencimiento"] = payload["fecha_vencimiento"].isoformat() if hasattr(payload["fecha_vencimiento"], "isoformat") else payload["fecha_vencimiento"]
    if payload.get("fecha_pago"):
        payload["fecha_pago"] = payload["fecha_pago"].isoformat() if hasattr(payload["fecha_pago"], "isoformat") else payload["fecha_pago"]

    result = db.table("movimientos_cc").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Error al crear movimiento")

    # Si es pago aplicado a un cargo especifico, marcar el cargo como pagado
    if body.tipo == "pago" and body.pedido_id:
        cargo = db.table("movimientos_cc").select("id").eq("cuenta_id", cuenta_id) \
            .eq("tipo", "cargo").eq("pedido_id", body.pedido_id) \
            .is_("fecha_pago", "null").execute()
        if cargo.data:
            db.table("movimientos_cc").update({"fecha_pago": (body.fecha_pago or datetime.utcnow().date()).isoformat()}) \
                .eq("id", cargo.data[0]["id"]).execute()

    return result.data[0]


@router.delete("/admin/movimientos-cc/{mov_id}")
async def anular_movimiento(mov_id: int, db: Client = Depends(get_db), _: None = Depends(require_admin)):
    db.table("movimientos_cc").delete().eq("id", mov_id).execute()
    return {"ok": True}


# ── Cliente ──────────────────────────────────────────────────────────────────

@router.get("/me/cuenta-corriente")
async def mi_cuenta(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    try:
        user_id = db.auth.get_user(credentials.credentials).user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Token invalido")

    result = db.table("cuentas_corriente").select("*").eq("usuario_id", user_id).execute()
    if not result.data:
        return {"existe": False}
    return {"existe": True, **result.data[0]}


@router.get("/me/cuenta-corriente/movimientos")
async def mis_movimientos(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    try:
        user_id = db.auth.get_user(credentials.credentials).user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Token invalido")

    cc = db.table("cuentas_corriente").select("id").eq("usuario_id", user_id).execute()
    if not cc.data:
        return []
    result = db.table("movimientos_cc").select("*").eq("cuenta_id", cc.data[0]["id"]) \
        .order("created_at", desc=True).execute()
    return result.data or []
