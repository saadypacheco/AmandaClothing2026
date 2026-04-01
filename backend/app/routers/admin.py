from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.db.client import get_supabase_client
from app.models.producto import ProductoResponse, CategoriaResponse, VarianteResponse
from supabase import Client
from typing import Optional
import uuid

router = APIRouter(prefix="/admin", tags=["admin"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_MB = 5


def get_db() -> Client:
    return get_supabase_client()


# ── Productos ────────────────────────────────────────────────────────────────

@router.get("/productos")
async def listar_productos_admin(db: Client = Depends(get_db)):
    try:
        result = db.table('productos').select('*, categorias(id, nombre, slug)').order('id').execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/productos/{producto_id}")
async def actualizar_producto_admin(
    producto_id: int,
    nombre: Optional[str] = Form(None),
    descripcion: Optional[str] = Form(None),
    precio: Optional[float] = Form(None),
    activo: Optional[bool] = Form(None),
    db: Client = Depends(get_db)
):
    update_data = {}
    if nombre is not None: update_data['nombre'] = nombre
    if descripcion is not None: update_data['descripcion'] = descripcion
    if precio is not None: update_data['precio'] = precio
    if activo is not None: update_data['activo'] = activo

    if not update_data:
        raise HTTPException(status_code=400, detail="No se enviaron campos")

    try:
        result = db.table('productos').update(update_data).eq('id', producto_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/productos/{producto_id}/imagen")
async def subir_imagen_producto(
    producto_id: int,
    file: UploadFile = File(...),
    db: Client = Depends(get_db)
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Formato no soportado. Usá JPG, PNG o WebP.")

    content = await file.read()
    if len(content) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"El archivo supera los {MAX_SIZE_MB}MB.")

    check = db.table('productos').select('id').eq('id', producto_id).execute()
    if not check.data:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in (file.filename or '') else 'jpg'
    filename = f"{producto_id}-{uuid.uuid4().hex[:8]}.{ext}"

    try:
        db.storage.from_('productos').upload(
            path=filename,
            file=content,
            file_options={"content-type": file.content_type, "upsert": "true"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir imagen: {str(e)}")

    public_url = db.storage.from_('productos').get_public_url(filename)
    db.table('productos').update({'imagen_url': public_url}).eq('id', producto_id).execute()

    return {"imagen_url": public_url}


@router.delete("/productos/{producto_id}/imagen")
async def eliminar_imagen_producto(
    producto_id: int,
    db: Client = Depends(get_db)
):
    db.table('productos').update({'imagen_url': None}).eq('id', producto_id).execute()
    return {"ok": True}


# ── Categorías ───────────────────────────────────────────────────────────────

@router.get("/categorias")
async def listar_categorias_admin(db: Client = Depends(get_db)):
    try:
        result = db.table('categorias').select('*').order('nombre').execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
