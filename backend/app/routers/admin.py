from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.client import get_supabase_client
from app.models.producto import ProductoResponse, CategoriaResponse, VarianteResponse
from supabase import Client
from typing import Optional
import uuid

router = APIRouter(prefix="/admin", tags=["admin"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_MB = 5

security = HTTPBearer()


def get_db() -> Client:
    return get_supabase_client()


def require_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    """Verifica que el token sea válido y que el usuario tenga rol 'admin'."""
    token = credentials.credentials
    try:
        user_resp = db.auth.get_user(token)
        user_id = user_resp.user.id
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    profile = db.table("usuarios").select("rol").eq("id", user_id).single().execute()
    if not profile.data or profile.data.get("rol") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso restringido a administradores")


# ── Productos ────────────────────────────────────────────────────────────────

@router.get("/productos")
async def listar_productos_admin(db: Client = Depends(get_db), _: None = Depends(require_admin)):
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
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
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
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
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
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    db.table('productos').update({'imagen_url': None}).eq('id', producto_id).execute()
    return {"ok": True}


# ── Crear producto ───────────────────────────────────────────────────────────

@router.post("/productos")
async def crear_producto_admin(
    nombre: str = Form(...),
    descripcion: str = Form(...),
    precio: float = Form(...),
    categoria_id: int = Form(...),
    activo: bool = Form(True),
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    try:
        result = db.table('productos').insert({
            'nombre': nombre,
            'descripcion': descripcion,
            'precio': precio,
            'categoria_id': categoria_id,
            'activo': activo,
        }).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Error al crear producto")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Variantes ────────────────────────────────────────────────────────────────

@router.get("/productos/{producto_id}/variantes")
async def listar_variantes(producto_id: int, db: Client = Depends(get_db), _: None = Depends(require_admin)):
    try:
        result = db.table('variantes').select('*').eq('producto_id', producto_id).order('talla').execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/productos/{producto_id}/variantes")
async def crear_variante(
    producto_id: int,
    talla: str = Form(...),
    color: str = Form(...),
    stock: int = Form(...),
    sku: str = Form(...),
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    try:
        result = db.table('variantes').insert({
            'producto_id': producto_id,
            'talla': talla,
            'color': color,
            'stock': stock,
            'sku': sku,
        }).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Error al crear variante")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/variantes/{variante_id}")
async def actualizar_variante(
    variante_id: int,
    stock: Optional[int] = Form(None),
    talla: Optional[str] = Form(None),
    color: Optional[str] = Form(None),
    sku: Optional[str] = Form(None),
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    update_data = {}
    if stock is not None: update_data['stock'] = stock
    if talla is not None: update_data['talla'] = talla
    if color is not None: update_data['color'] = color
    if sku is not None: update_data['sku'] = sku

    if not update_data:
        raise HTTPException(status_code=400, detail="No se enviaron campos")
    try:
        result = db.table('variantes').update(update_data).eq('id', variante_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Variante no encontrada")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/variantes/{variante_id}")
async def eliminar_variante(variante_id: int, db: Client = Depends(get_db), _: None = Depends(require_admin)):
    try:
        db.table('variantes').update({'activo': False}).eq('id', variante_id).execute()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Categorías ───────────────────────────────────────────────────────────────

@router.get("/categorias")
async def listar_categorias_admin(db: Client = Depends(get_db), _: None = Depends(require_admin)):
    try:
        result = db.table('categorias').select('*').order('nombre').execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
