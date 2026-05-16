from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.client import get_supabase_client
from app.services.precios import (
    cargar_lista, resolver_precio_producto, get_lista_y_descuento_usuario,
)
from pydantic import BaseModel, field_validator
from typing import List, Optional
from supabase import Client
from datetime import datetime, timedelta
import uuid

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


class PedidoGuestCreate(BaseModel):
    nombre: str
    telefono: str
    items: List[ItemPedidoCreate]


class PedidoMayoristaCreate(BaseModel):
    items: List[ItemPedidoCreate]
    metodo_pago: str  # 'mercadopago' | 'cuenta_corriente' | 'transferencia' | 'cotizacion'
    nota_interna: Optional[str] = None


_DIAS_MAP = {"contado": 0, "15_dias": 15, "30_dias": 30, "60_dias": 60, "90_dias": 90}


def _config_get(db: Client, clave: str, default: str = "") -> str:
    try:
        r = db.table("tienda_config").select("valor").eq("clave", clave).single().execute()
        return r.data["valor"] if r.data else default
    except Exception:
        return default


def _calcular_estado_inicial(metodo_pago: str, total: float, monto_umbral: float) -> str:
    """Calcula el estado inicial del pedido segun metodo de pago y umbral de aprobacion."""
    if metodo_pago == "cotizacion":
        return "cotizado"
    if metodo_pago == "cuenta_corriente":
        return "pendiente_aprobacion"
    if metodo_pago == "transferencia":
        return "pendiente"
    if metodo_pago == "mercadopago":
        if monto_umbral > 0 and total >= monto_umbral:
            return "pendiente_aprobacion"
        return "pendiente"
    raise HTTPException(status_code=400, detail=f"Metodo de pago invalido: {metodo_pago}")


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


@router.post("/guest", status_code=201)
async def crear_pedido_guest(
    body: PedidoGuestCreate,
    db: Client = Depends(get_db),
):
    """
    Crea un pedido para un usuario no registrado.
    No requiere autenticación. El backend usa service_role para bypasear RLS.
    """
    if not body.nombre.strip():
        raise HTTPException(status_code=400, detail="El nombre es requerido")
    if not body.telefono.strip():
        raise HTTPException(status_code=400, detail="El teléfono es requerido")
    if not body.items:
        raise HTTPException(status_code=400, detail="El pedido no tiene items")

    try:
        variante_ids = [item.variante_id for item in body.items]
        variantes_res = db.table("variantes") \
            .select("id, stock, productos(precio)") \
            .in_("id", variante_ids) \
            .execute()

        variantes_map = {v["id"]: v for v in (variantes_res.data or [])}

        for item in body.items:
            variante = variantes_map.get(item.variante_id)
            if not variante:
                raise HTTPException(status_code=400, detail=f"Variante {item.variante_id} no encontrada")
            if variante["stock"] < item.cantidad:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para variante {item.variante_id} (disponible: {variante['stock']})"
                )

        total_real = sum(
            variantes_map[item.variante_id]["productos"]["precio"] * item.cantidad
            for item in body.items
        )

        pedido_res = db.table("pedidos").insert({
            "usuario_id": None,
            "nombre_guest": body.nombre.strip(),
            "telefono_guest": body.telefono.strip(),
            "total": round(total_real, 2),
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


@router.post("/mayorista", status_code=201)
async def crear_pedido_mayorista(
    body: PedidoMayoristaCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    """
    Crea un pedido mayorista. Diferencias con el flujo minorista:
    - Aplica la lista de precios del usuario.
    - El metodo_pago define el estado inicial y la condicion de pago.
    - Cuenta corriente: verifica limite de credito + crea movimiento.
    """
    token = credentials.credentials
    try:
        user_id = db.auth.get_user(token).user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Token invalido")

    user_res = db.table("usuarios").select(
        "tipo_cuenta, estado_cuenta, lista_precio_id, descuento_general, condicion_pago_default"
    ).eq("id", user_id).single().execute()
    if not user_res.data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if user_res.data["tipo_cuenta"] != "mayorista" or user_res.data["estado_cuenta"] != "activo":
        raise HTTPException(status_code=403, detail="Cuenta mayorista no activa")

    metodos_permitidos = _config_get(db, "mayorista_metodos_pago",
        '["mercadopago","cuenta_corriente","transferencia","cotizacion"]')
    try:
        import json
        permitidos = json.loads(metodos_permitidos)
    except Exception:
        permitidos = ["mercadopago", "cuenta_corriente", "transferencia", "cotizacion"]
    if body.metodo_pago not in permitidos:
        raise HTTPException(status_code=400, detail="Metodo de pago no habilitado")

    if not body.items:
        raise HTTPException(status_code=400, detail="El pedido no tiene items")

    # Cargar variantes + stock + minimo de compra del producto
    variante_ids = [i.variante_id for i in body.items]
    variantes_res = db.table("variantes").select(
        "id, stock, producto_id, productos(precio, nombre, minimo_compra_mayorista)"
    ).in_("id", variante_ids).execute()
    variantes_map = {v["id"]: v for v in (variantes_res.data or [])}

    for item in body.items:
        v = variantes_map.get(item.variante_id)
        if not v:
            raise HTTPException(status_code=400, detail=f"Variante {item.variante_id} no encontrada")
        if v["stock"] < item.cantidad:
            raise HTTPException(status_code=400,
                detail=f"Stock insuficiente para variante {item.variante_id}")

    # Validar minimo de compra mayorista por producto (sumando variantes del mismo producto)
    cantidad_por_producto: dict = {}
    for item in body.items:
        v = variantes_map[item.variante_id]
        pid = v["producto_id"]
        cantidad_por_producto[pid] = cantidad_por_producto.get(pid, 0) + item.cantidad

    for item in body.items:
        v = variantes_map[item.variante_id]
        producto = v.get("productos") or {}
        minimo = int(producto.get("minimo_compra_mayorista") or 1)
        total_producto = cantidad_por_producto[v["producto_id"]]
        if total_producto < minimo:
            nombre = producto.get("nombre") or f"producto {v['producto_id']}"
            raise HTTPException(
                status_code=400,
                detail=f"Minimo de compra para '{nombre}': {minimo} unidades (tenes {total_producto})"
            )

    # Resolver precios con la lista del usuario
    lista_id, descuento_usuario = get_lista_y_descuento_usuario(db, user_id)
    mapa = cargar_lista(db, lista_id) if lista_id else {}

    items_data = []
    total_real = 0.0
    for item in body.items:
        v = variantes_map[item.variante_id]
        precio_base = float(v["productos"]["precio"])
        precio_final = resolver_precio_producto(
            mapa_lista=mapa, producto_id=v["producto_id"],
            precio_default=precio_base, descuento_usuario=descuento_usuario,
            variante_id=item.variante_id,
        )
        items_data.append({
            "variante_id": item.variante_id,
            "cantidad": item.cantidad,
            "precio_unitario": precio_final,
        })
        total_real += precio_final * item.cantidad

    monto_umbral = float(_config_get(db, "mayorista_aprobacion_pedido_monto", "0") or 0)
    estado = _calcular_estado_inicial(body.metodo_pago, total_real, monto_umbral)

    condicion_pago = user_res.data.get("condicion_pago_default") or "contado"
    vencimiento = None
    if body.metodo_pago == "cuenta_corriente":
        dias = _DIAS_MAP.get(condicion_pago, 30)
        if dias > 0:
            vencimiento = (datetime.utcnow() + timedelta(days=dias)).date().isoformat()

    # Verificar limite de credito si es CC
    if body.metodo_pago == "cuenta_corriente":
        cc = db.table("cuentas_corriente").select("limite_credito, saldo_actual") \
            .eq("usuario_id", user_id).single().execute()
        if cc.data:
            saldo = float(cc.data.get("saldo_actual") or 0)
            limite = float(cc.data.get("limite_credito") or 0)
            if limite > 0 and (saldo + total_real) > limite:
                estado = "pendiente_aprobacion"

    pedido_payload = {
        "usuario_id": user_id,
        "total": round(total_real, 2),
        "estado": estado,
        "tipo": "mayorista",
        "metodo_pago": body.metodo_pago,
        "condicion_pago": condicion_pago,
        "vencimiento": vencimiento,
        "nota_interna": body.nota_interna,
    }
    pedido_res = db.table("pedidos").insert(pedido_payload).execute()
    if not pedido_res.data:
        raise HTTPException(status_code=500, detail="Error al crear pedido")

    pedido_id = pedido_res.data[0]["id"]
    for d in items_data:
        d["pedido_id"] = pedido_id
    db.table("items_pedido").insert(items_data).execute()

    return {**pedido_res.data[0], "total": total_real}


@router.post("/{pedido_id}/comprobante")
async def subir_comprobante(
    pedido_id: int,
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    """Sube un comprobante de transferencia para un pedido. Lo deja en estado 'pendiente_aprobacion'."""
    if file.content_type not in {"image/jpeg", "image/png", "image/webp", "application/pdf"}:
        raise HTTPException(status_code=400, detail="Formato no soportado")
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Maximo 5 MB")

    try:
        user_id = db.auth.get_user(credentials.credentials).user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Token invalido")

    pedido = db.table("pedidos").select("id, usuario_id").eq("id", pedido_id).single().execute()
    if not pedido.data or pedido.data["usuario_id"] != user_id:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else "jpg"
    filename = f"comprobantes/{pedido_id}-{uuid.uuid4().hex[:8]}.{ext}"
    try:
        db.storage.from_("productos").upload(
            path=filename, file=content,
            file_options={"content-type": file.content_type, "upsert": "true"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir: {str(e)}")

    url = db.storage.from_("productos").get_public_url(filename)
    db.table("pedidos").update({
        "comprobante_url": url,
        "estado": "pendiente_aprobacion",
    }).eq("id", pedido_id).execute()

    return {"comprobante_url": url}


@router.post("/vincular-telefono")
async def vincular_pedidos_telefono(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    """
    Vincula los pedidos guest del teléfono registrado al usuario autenticado.
    Se llama automáticamente justo después del registro.
    """
    token = credentials.credentials
    try:
        user_resp = db.auth.get_user(token)
        user_id = user_resp.user.id
        telefono = user_resp.user.user_metadata.get("telefono", "")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    if not telefono:
        return {"vinculados": 0}

    try:
        res = db.table("pedidos") \
            .update({"usuario_id": user_id}) \
            .eq("telefono_guest", telefono) \
            .is_("usuario_id", "null") \
            .execute()

        return {"vinculados": len(res.data or [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
