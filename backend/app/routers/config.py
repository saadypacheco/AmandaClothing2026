from fastapi import APIRouter, Depends, HTTPException, Form, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.client import get_supabase_client
from app.routers.admin import require_admin
from supabase import Client
from typing import Optional
from pydantic import BaseModel

router = APIRouter(tags=["config"])

security = HTTPBearer()


def get_db() -> Client:
    return get_supabase_client()


@router.get("/config")
async def get_config_publica(db: Client = Depends(get_db)):
    result = db.table("tienda_config").select("clave, valor, tipo").execute()
    config = {}
    for row in result.data or []:
        config[row["clave"]] = row["valor"]
    return config


# ── Admin endpoints ──────────────────────────────────────────────────────────

@router.get("/admin/config")
async def get_config_admin(db: Client = Depends(get_db), _: None = Depends(require_admin)):
    result = db.table("tienda_config").select("*").order("grupo").order("clave").execute()
    return result.data or []


class ConfigUpdate(BaseModel):
    valor: str


@router.patch("/admin/config/{clave}")
async def update_config(
    clave: str,
    body: ConfigUpdate,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    result = db.table("tienda_config").update(
        {"valor": body.valor, "updated_at": "now()"}
    ).eq("clave", clave).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail=f"Clave '{clave}' no encontrada")
    return result.data[0]


class BulkConfigUpdate(BaseModel):
    items: dict[str, str]


@router.post("/admin/config/bulk")
async def update_config_bulk(
    body: BulkConfigUpdate,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    updated = []
    for clave, valor in body.items.items():
        result = db.table("tienda_config").update(
            {"valor": valor, "updated_at": "now()"}
        ).eq("clave", clave).execute()
        if result.data:
            updated.append(result.data[0])
    return {"ok": True, "updated": len(updated)}
