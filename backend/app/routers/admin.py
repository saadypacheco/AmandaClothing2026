from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.client import get_supabase_client
from app.services.social import publicar_en_redes
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
    precio_original: Optional[str] = Form(None),  # "0" para quitar la oferta
    es_nuevo: Optional[bool] = Form(None),
    activo: Optional[bool] = Form(None),
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    update_data = {}
    if nombre is not None:
        update_data['nombre'] = nombre
    if descripcion is not None:
        update_data['descripcion'] = descripcion
    if precio is not None:
        update_data['precio'] = precio
    if activo is not None:
        update_data['activo'] = activo
    if es_nuevo is not None:
        update_data['es_nuevo'] = es_nuevo
    if precio_original is not None:
        val = float(precio_original) if precio_original.strip() else None
        update_data['precio_original'] = val if val and val > 0 else None

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


# ── Galería de imágenes (multi-foto) ─────────────────────────────────────────

@router.get("/productos/{producto_id}/imagenes")
async def listar_imagenes_producto(
    producto_id: int,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    result = db.table('producto_imagenes').select('*').eq('producto_id', producto_id).order('orden').execute()
    return result.data or []


@router.post("/productos/{producto_id}/imagenes")
async def agregar_imagen_producto(
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

    # Verificar que el producto existe y no tiene ya 4 imágenes
    check = db.table('productos').select('id').eq('id', producto_id).execute()
    if not check.data:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    count_res = db.table('producto_imagenes').select('id', count='exact').eq('producto_id', producto_id).execute()
    count = count_res.count or 0
    if count >= 4:
        raise HTTPException(status_code=400, detail="El producto ya tiene 4 imágenes (máximo permitido).")

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

    # El orden es la posición siguiente
    insert_res = db.table('producto_imagenes').insert({
        'producto_id': producto_id,
        'url': public_url,
        'orden': count,
    }).execute()

    # Si es la primera imagen, también actualiza imagen_url del producto (retrocompatibilidad)
    if count == 0:
        db.table('productos').update({'imagen_url': public_url}).eq('id', producto_id).execute()

    return insert_res.data[0] if insert_res.data else {"url": public_url}


@router.delete("/productos/{producto_id}/imagenes/{imagen_id}")
async def eliminar_imagen_galeria(
    producto_id: int,
    imagen_id: int,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    # Obtener la imagen a borrar
    img_res = db.table('producto_imagenes').select('*').eq('id', imagen_id).eq('producto_id', producto_id).execute()
    if not img_res.data:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")

    db.table('producto_imagenes').delete().eq('id', imagen_id).execute()

    # Reordenar las restantes
    remaining = db.table('producto_imagenes').select('id').eq('producto_id', producto_id).order('orden').execute()
    for i, row in enumerate(remaining.data or []):
        db.table('producto_imagenes').update({'orden': i}).eq('id', row['id']).execute()

    # Actualizar imagen_url del producto con la primera imagen restante (o null)
    first_res = db.table('producto_imagenes').select('url').eq('producto_id', producto_id).order('orden').limit(1).execute()
    nueva_principal = first_res.data[0]['url'] if first_res.data else None
    db.table('productos').update({'imagen_url': nueva_principal}).eq('id', producto_id).execute()

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
    if stock is not None:
        update_data['stock'] = stock
    if talla is not None:
        update_data['talla'] = talla
    if color is not None:
        update_data['color'] = color
    if sku is not None:
        update_data['sku'] = sku

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


# ── Publicar en redes sociales ───────────────────────────────────────────────

@router.post("/productos/{producto_id}/publicar")
async def publicar_producto_redes(
    producto_id: int,
    redes: list[str] = Form(...),
    caption: Optional[str] = Form(None),
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    """
    Publica un producto en redes sociales.

    Body:
    - redes: ["telegram", "whatsapp", "facebook", "instagram", "tiktok"]
    - caption: texto personalizado (opcional, se genera automáticamente si falta)
    """
    try:
        # Obtener datos del producto
        prod_res = db.table('productos').select('*').eq('id', producto_id).execute()
        if not prod_res.data:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        producto = prod_res.data[0]
        imagen_url = producto.get('imagen_url') or ''

        if not imagen_url:
            raise HTTPException(status_code=400, detail="El producto no tiene imagen. Sube una imagen antes de publicar.")

        # Publicar en las redes seleccionadas
        resultados = await publicar_en_redes(
            redes=redes,
            producto_nombre=producto['nombre'],
            producto_precio=producto['precio'],
            producto_descripcion=producto.get('descripcion', ''),
            producto_id=producto_id,
            imagen_url=imagen_url,
            caption_personalizado=caption,
        )

        return {"ok": True, "resultados": resultados}

    except HTTPException:
        raise
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


@router.post("/categorias")
async def crear_categoria_admin(
    nombre: str = Form(...),
    slug: str = Form(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    require_admin(credentials, db)
    try:
        result = db.table('categorias').insert({'nombre': nombre, 'slug': slug, 'complementos': []}).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Error al crear categoría")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/categorias/{categoria_id}")
async def editar_categoria_admin(
    categoria_id: int,
    nombre: str = Form(...),
    slug: str = Form(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    require_admin(credentials, db)
    try:
        result = db.table('categorias').update({'nombre': nombre, 'slug': slug}).eq('id', categoria_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Bandeja de chats ─────────────────────────────────────────────────────────

@router.get("/chats")
async def listar_chats_admin(db: Client = Depends(get_db), _: None = Depends(require_admin)):
    try:
        result = db.table('chats') \
            .select('id, tipo, created_at, updated_at, usuario_id, producto_id, usuarios!chats_usuario_id_fkey(email, nombre), productos(nombre)') \
            .order('updated_at', desc=True) \
            .execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chats/{chat_id}/mensajes")
async def mensajes_chat_admin(chat_id: int, db: Client = Depends(get_db), _: None = Depends(require_admin)):
    try:
        result = db.table('mensajes_chat') \
            .select('id, contenido, created_at, remitente_id, usuarios(email, nombre)') \
            .eq('chat_id', chat_id) \
            .order('created_at') \
            .execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chats/{chat_id}/mensajes")
async def responder_chat_admin(
    chat_id: int,
    contenido: str = Form(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
):
    require_admin(credentials, db)
    token = credentials.credentials
    try:
        user_resp = db.auth.get_user(token)
        user_id = user_resp.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")
    try:
        result = db.table('mensajes_chat').insert({
            'chat_id': chat_id,
            'remitente_id': user_id,
            'contenido': contenido,
        }).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
