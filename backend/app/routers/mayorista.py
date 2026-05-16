"""
Router del modo mayorista B2B.

Endpoints:
- POST /auth/register-mayorista — registro con campos B2B, queda pendiente.
- GET  /admin/cuentas — lista cuentas mayoristas (filtro por estado).
- GET  /admin/cuentas/{id} — detalle de cuenta.
- PATCH /admin/cuentas/{id} — editar campos de cuenta.
- POST /admin/cuentas/{id}/aprobar — aprobar cuenta + crear CC.
- POST /admin/cuentas/{id}/rechazar — rechazar cuenta.
- POST /admin/cuentas/{id}/suspender — suspender cuenta.
- GET  /me/estado-cuenta — el cliente consulta su propio estado.

Endpoints de listas de precios, atributos y CC viven en sus propios sub-modulos.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.client import get_supabase_client
from app.routers.admin import require_admin
from app.models.mayorista import (
    RegistroMayoristaRequest, CuentaMayoristaResponse,
    AprobarCuentaRequest, CuentaUpdateRequest,
)
from supabase import Client
from typing import Optional
from datetime import datetime

router = APIRouter(tags=["mayorista"])
security = HTTPBearer()


def get_db() -> Client:
    return get_supabase_client()


def _config_get(db: Client, clave: str, default: str = "") -> str:
    try:
        result = db.table("tienda_config").select("valor").eq("clave", clave).single().execute()
        return result.data["valor"] if result.data else default
    except Exception:
        return default


def _es_modo_mayorista(db: Client) -> bool:
    return _config_get(db, "modo", "minorista") == "mayorista"


def _requiere_aprobacion(db: Client) -> bool:
    return _config_get(db, "mayorista_requiere_aprobacion", "true") == "true"


# ── Registro mayorista ───────────────────────────────────────────────────────

@router.post("/auth/register-mayorista")
async def register_mayorista(request: RegistroMayoristaRequest, db: Client = Depends(get_db)):
    """Registro de cuenta mayorista. Crea usuario con tipo_cuenta='mayorista'.

    Si la tienda esta en modo='mayorista' y mayorista_requiere_aprobacion='true',
    la cuenta queda con estado='pendiente' hasta que un admin la apruebe.
    """
    if not _es_modo_mayorista(db):
        raise HTTPException(status_code=400, detail="Esta tienda no es mayorista")

    pendiente = _requiere_aprobacion(db)
    estado_inicial = "pendiente" if pendiente else "activo"

    try:
        auth_response = db.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {"data": {"nombre": request.nombre}},
        })
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="No se pudo crear el usuario")

        perfil = {
            "id": auth_response.user.id,
            "email": auth_response.user.email,
            "nombre": request.nombre,
            "rol": "cliente",
            "tipo_cuenta": "mayorista",
            "estado_cuenta": estado_inicial,
            "razon_social": request.razon_social,
            "cuit": request.cuit,
            "condicion_iva": request.condicion_iva,
            "telefono_contacto": request.telefono_contacto,
            "direccion_fiscal": request.direccion_fiscal,
            "whatsapp": request.telefono_contacto,
        }
        db.table("usuarios").insert(perfil).execute()

        return {
            "ok": True,
            "estado": estado_inicial,
            "mensaje": (
                "Tu solicitud fue registrada. Un administrador revisara tu cuenta antes de activarla."
                if pendiente
                else "Cuenta creada. Confirma tu email para ingresar."
            ),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al registrar: {str(e)}")


# ── Bandeja de cuentas (admin) ───────────────────────────────────────────────

@router.get("/admin/cuentas")
async def listar_cuentas(
    estado: Optional[str] = None,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Lista cuentas mayoristas. Filtro por estado (pendiente/activo/suspendido/rechazado)."""
    q = db.table("usuarios").select(
        "id, email, nombre, tipo_cuenta, estado_cuenta, cuit, razon_social, condicion_iva, "
        "lista_precio_id, descuento_general, condicion_pago_default, telefono_contacto, "
        "direccion_fiscal, notas_internas, aprobado_en, created_at"
    ).eq("tipo_cuenta", "mayorista")
    if estado:
        q = q.eq("estado_cuenta", estado)
    result = q.order("created_at", desc=True).execute()
    return result.data or []


@router.get("/admin/cuentas/{cuenta_id}")
async def get_cuenta(cuenta_id: str, db: Client = Depends(get_db), _: None = Depends(require_admin)):
    result = db.table("usuarios").select(
        "*, listas_precio(nombre)"
    ).eq("id", cuenta_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")

    cc_res = db.table("cuentas_corriente").select("*").eq("usuario_id", cuenta_id).execute()
    cc = cc_res.data[0] if cc_res.data else None

    return {"usuario": result.data, "cuenta_corriente": cc}


@router.patch("/admin/cuentas/{cuenta_id}")
async def editar_cuenta(
    cuenta_id: str,
    body: CuentaUpdateRequest,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    update_data = {k: (str(v) if hasattr(v, "is_integer") else v)
                   for k, v in body.model_dump(exclude_unset=True).items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No se enviaron campos")
    result = db.table("usuarios").update(update_data).eq("id", cuenta_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    return result.data[0]


@router.post("/admin/cuentas/{cuenta_id}/aprobar")
async def aprobar_cuenta(
    cuenta_id: str,
    body: AprobarCuentaRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    """Aprueba una cuenta mayorista: setea estado='activo', asigna lista y crea CC."""
    require_admin(credentials, db)
    try:
        admin_id = db.auth.get_user(credentials.credentials).user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Token invalido")

    # Verificar que la cuenta existe y es mayorista
    user_res = db.table("usuarios").select("id, tipo_cuenta, estado_cuenta") \
        .eq("id", cuenta_id).single().execute()
    if not user_res.data:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    if user_res.data["tipo_cuenta"] != "mayorista":
        raise HTTPException(status_code=400, detail="La cuenta no es mayorista")

    # Update usuario
    db.table("usuarios").update({
        "estado_cuenta": "activo",
        "lista_precio_id": body.lista_precio_id,
        "condicion_pago_default": body.condicion_pago_default,
        "descuento_general": float(body.descuento_general),
        "notas_internas": body.notas_internas,
        "aprobado_por": admin_id,
        "aprobado_en": datetime.utcnow().isoformat(),
    }).eq("id", cuenta_id).execute()

    # Crear cuenta corriente si no existe
    cc_existente = db.table("cuentas_corriente").select("id").eq("usuario_id", cuenta_id).execute()
    if not cc_existente.data:
        db.table("cuentas_corriente").insert({
            "usuario_id": cuenta_id,
            "limite_credito": float(body.limite_credito),
            "dias_pago_default": body.dias_pago_default,
            "saldo_actual": 0,
            "activo": True,
        }).execute()
    else:
        db.table("cuentas_corriente").update({
            "limite_credito": float(body.limite_credito),
            "dias_pago_default": body.dias_pago_default,
            "activo": True,
        }).eq("usuario_id", cuenta_id).execute()

    return {"ok": True, "estado": "activo"}


@router.post("/admin/cuentas/{cuenta_id}/rechazar")
async def rechazar_cuenta(
    cuenta_id: str,
    motivo: Optional[str] = None,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    update = {"estado_cuenta": "rechazado"}
    if motivo:
        update["notas_internas"] = motivo
    db.table("usuarios").update(update).eq("id", cuenta_id).execute()
    return {"ok": True}


@router.post("/admin/cuentas/{cuenta_id}/suspender")
async def suspender_cuenta(
    cuenta_id: str,
    motivo: Optional[str] = None,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    update = {"estado_cuenta": "suspendido"}
    if motivo:
        update["notas_internas"] = motivo
    db.table("usuarios").update(update).eq("id", cuenta_id).execute()
    return {"ok": True}


# ── Estado de cuenta del cliente logueado ────────────────────────────────────

@router.get("/me/estado-cuenta")
async def get_mi_estado(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    """Devuelve estado de cuenta del usuario logueado. Util para middleware frontend."""
    try:
        user_id = db.auth.get_user(credentials.credentials).user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Token invalido")

    user = db.table("usuarios").select(
        "id, email, nombre, tipo_cuenta, estado_cuenta, lista_precio_id, "
        "descuento_general, condicion_pago_default"
    ).eq("id", user_id).single().execute()
    if not user.data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user.data
