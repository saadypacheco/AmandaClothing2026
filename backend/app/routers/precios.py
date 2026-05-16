"""
Router de listas de precios B2B.

Endpoints:
- GET    /admin/listas-precio          — lista todas las listas
- POST   /admin/listas-precio          — crea una lista
- PATCH  /admin/listas-precio/{id}     — edita una lista
- DELETE /admin/listas-precio/{id}     — desactiva (soft delete) una lista
- GET    /admin/listas-precio/{id}/precios — precios cargados en la lista
- POST   /admin/listas-precio/{id}/precios — upsert masivo de precios (acepta CSV o JSON)
- DELETE /admin/listas-precio/{id}/precios/{precio_id} — borra una entrada de precio
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.db.client import get_supabase_client
from app.routers.admin import require_admin
from app.models.mayorista import ListaPrecioCreate, PrecioListaItem, PreciosBulkUpsert
from supabase import Client
from typing import Optional
import csv
import io

router = APIRouter(prefix="/admin/listas-precio", tags=["mayorista-precios"])


def get_db() -> Client:
    return get_supabase_client()


@router.get("")
async def listar_listas(db: Client = Depends(get_db), _: None = Depends(require_admin)):
    result = db.table("listas_precio").select("*").order("id").execute()
    return result.data or []


@router.post("")
async def crear_lista(
    body: ListaPrecioCreate,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    if body.es_default:
        db.table("listas_precio").update({"es_default": False}).neq("id", 0).execute()
    result = db.table("listas_precio").insert(body.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Error al crear lista")
    return result.data[0]


@router.patch("/{lista_id}")
async def editar_lista(
    lista_id: int,
    body: ListaPrecioCreate,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    if body.es_default:
        db.table("listas_precio").update({"es_default": False}).neq("id", lista_id).execute()
    result = db.table("listas_precio").update(body.model_dump()).eq("id", lista_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Lista no encontrada")
    return result.data[0]


@router.delete("/{lista_id}")
async def eliminar_lista(lista_id: int, db: Client = Depends(get_db), _: None = Depends(require_admin)):
    db.table("listas_precio").update({"activo": False}).eq("id", lista_id).execute()
    return {"ok": True}


# ── Precios dentro de una lista ──────────────────────────────────────────────

@router.get("/{lista_id}/precios")
async def listar_precios(lista_id: int, db: Client = Depends(get_db), _: None = Depends(require_admin)):
    result = db.table("precios_lista").select(
        "id, producto_id, variante_id, precio, descuento_pct, "
        "productos(nombre, precio), variantes(talla, color, sku)"
    ).eq("lista_id", lista_id).execute()
    return result.data or []


@router.post("/{lista_id}/precios")
async def upsert_precios(
    lista_id: int,
    body: PreciosBulkUpsert,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Upsert masivo de precios. Pisar la entrada si ya existe (producto_id, variante_id)."""
    if body.lista_id != lista_id:
        raise HTTPException(status_code=400, detail="lista_id no coincide")
    afectados = 0
    for item in body.items:
        if item.variante_id is None and item.producto_id is None:
            continue
        q = db.table("precios_lista").select("id").eq("lista_id", lista_id)
        if item.variante_id is not None:
            q = q.eq("variante_id", item.variante_id)
        else:
            q = q.eq("producto_id", item.producto_id).is_("variante_id", "null")
        existing = q.execute()

        payload = {
            "lista_id": lista_id,
            "producto_id": item.producto_id,
            "variante_id": item.variante_id,
            "precio": float(item.precio),
            "descuento_pct": float(item.descuento_pct),
        }
        if existing.data:
            db.table("precios_lista").update(payload).eq("id", existing.data[0]["id"]).execute()
        else:
            db.table("precios_lista").insert(payload).execute()
        afectados += 1
    return {"ok": True, "afectados": afectados}


@router.post("/{lista_id}/precios/import-csv")
async def importar_csv(
    lista_id: int,
    file: UploadFile = File(...),
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    """
    Importa precios desde un CSV. Formato esperado:
    sku,precio,descuento_pct

    Para cada fila busca la variante por SKU y crea/actualiza la entrada en la lista.
    """
    content = (await file.read()).decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))

    insertados = 0
    fallidos = 0
    errores = []

    for fila in reader:
        sku = (fila.get("sku") or "").strip()
        try:
            precio = float((fila.get("precio") or "0").replace(",", "."))
        except ValueError:
            fallidos += 1
            errores.append(f"SKU {sku}: precio invalido")
            continue
        try:
            descuento = float((fila.get("descuento_pct") or "0").replace(",", "."))
        except ValueError:
            descuento = 0

        if not sku:
            fallidos += 1
            continue

        var_res = db.table("variantes").select("id, producto_id").eq("sku", sku).execute()
        if not var_res.data:
            fallidos += 1
            errores.append(f"SKU {sku}: no encontrado")
            continue

        variante = var_res.data[0]
        existing = db.table("precios_lista").select("id") \
            .eq("lista_id", lista_id).eq("variante_id", variante["id"]).execute()

        payload = {
            "lista_id": lista_id,
            "producto_id": variante["producto_id"],
            "variante_id": variante["id"],
            "precio": precio,
            "descuento_pct": descuento,
        }
        if existing.data:
            db.table("precios_lista").update(payload).eq("id", existing.data[0]["id"]).execute()
        else:
            db.table("precios_lista").insert(payload).execute()
        insertados += 1

    return {
        "ok": True,
        "insertados": insertados,
        "fallidos": fallidos,
        "errores": errores[:20],  # limita para no inflar la response
    }


@router.delete("/{lista_id}/precios/{precio_id}")
async def eliminar_precio(
    lista_id: int,
    precio_id: int,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    db.table("precios_lista").delete().eq("id", precio_id).eq("lista_id", lista_id).execute()
    return {"ok": True}
