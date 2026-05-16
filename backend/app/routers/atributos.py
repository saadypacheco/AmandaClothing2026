"""
Router de atributos dinamicos. Generaliza el catalogo mas alla de talle/color.

Modelo:
- atributo_definicion: define un atributo a nivel categoria (ej: "sabor", "voltaje", "tamano")
- atributo_valor_variante: vincula una variante a un valor de un atributo

Endpoints admin:
- GET    /admin/categorias/{id}/atributos
- POST   /admin/categorias/{id}/atributos
- PATCH  /admin/atributos/{id}
- DELETE /admin/atributos/{id}
- GET    /admin/variantes/{id}/atributos
- POST   /admin/variantes/{id}/atributos  (bulk upsert)
"""
from fastapi import APIRouter, Depends, HTTPException
from app.db.client import get_supabase_client
from app.routers.admin import require_admin
from app.models.mayorista import AtributoDefinicionCreate, AtributoValorVarianteSet
from supabase import Client
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["mayorista-atributos"])


def get_db() -> Client:
    return get_supabase_client()


# ── Atributos por categoria ──────────────────────────────────────────────────

@router.get("/categorias/{categoria_id}/atributos")
async def listar_atributos(
    categoria_id: int,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    result = db.table("atributo_definicion").select("*") \
        .eq("categoria_id", categoria_id).order("orden").execute()
    return result.data or []


@router.post("/categorias/{categoria_id}/atributos")
async def crear_atributo(
    categoria_id: int,
    body: AtributoDefinicionCreate,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    payload = body.model_dump()
    payload["categoria_id"] = categoria_id
    result = db.table("atributo_definicion").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Error al crear atributo")
    return result.data[0]


class AtributoUpdate(BaseModel):
    nombre: str | None = None
    tipo: str | None = None
    valores_permitidos: list | None = None
    obligatorio: bool | None = None
    orden: int | None = None


@router.patch("/atributos/{atributo_id}")
async def editar_atributo(
    atributo_id: int,
    body: AtributoUpdate,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    update_data = {k: v for k, v in body.model_dump(exclude_unset=True).items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No se enviaron campos")
    result = db.table("atributo_definicion").update(update_data).eq("id", atributo_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Atributo no encontrado")
    return result.data[0]


@router.delete("/atributos/{atributo_id}")
async def eliminar_atributo(
    atributo_id: int,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    db.table("atributo_definicion").delete().eq("id", atributo_id).execute()
    return {"ok": True}


# ── Valores por variante ─────────────────────────────────────────────────────

@router.get("/variantes/{variante_id}/atributos")
async def listar_valores_variante(
    variante_id: int,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    result = db.table("atributo_valor_variante").select(
        "id, atributo_id, valor, atributo_definicion(clave, nombre, tipo)"
    ).eq("variante_id", variante_id).execute()
    return result.data or []


class SetValoresRequest(BaseModel):
    valores: List[AtributoValorVarianteSet]


@router.post("/variantes/{variante_id}/atributos")
async def setear_valores(
    variante_id: int,
    body: SetValoresRequest,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Reemplaza los valores de atributos de una variante."""
    db.table("atributo_valor_variante").delete().eq("variante_id", variante_id).execute()
    if body.valores:
        rows = [
            {"variante_id": variante_id, "atributo_id": v.atributo_id, "valor": v.valor}
            for v in body.valores
        ]
        db.table("atributo_valor_variante").insert(rows).execute()
    return {"ok": True, "cantidad": len(body.valores)}


# ── Endpoint publico: atributos por categoria (para filtros del frontend) ────

@router.get("/categorias/{categoria_id}/atributos/publico", include_in_schema=False)
async def listar_atributos_publico(categoria_id: int, db: Client = Depends(get_db)):
    """Version publica sin require_admin para filtros en el catalogo del shop."""
    result = db.table("atributo_definicion").select("clave, nombre, tipo, valores_permitidos") \
        .eq("categoria_id", categoria_id).order("orden").execute()
    return result.data or []
