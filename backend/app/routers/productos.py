from fastapi import APIRouter, Depends, HTTPException, Query, Header
from typing import List, Optional
from app.db.client import get_supabase_client
from app.models.producto import (
    ProductoResponse, ProductoCreate, ProductoUpdate,
    VarianteResponse, VarianteCreate, VarianteUpdate, CategoriaResponse, ImagenProducto
)
from app.services.precios import (
    cargar_lista, resolver_precio_producto, get_lista_y_descuento_usuario,
)
from supabase import Client

router = APIRouter(prefix="/productos", tags=["productos"])

def get_db() -> Client:
    return get_supabase_client()


def _resolver_contexto_precio(db: Client, authorization: Optional[str], lista_id_query: Optional[int]):
    """Determina (lista_id, descuento_general) priorizando:
    1. usuario autenticado (lista asignada en su perfil).
    2. lista_id pasado como query param (override de admin).
    3. (None, 0) → precios publicos.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        try:
            user = db.auth.get_user(token).user
            lista_id, descuento = get_lista_y_descuento_usuario(db, user.id)
            if lista_id:
                return lista_id, descuento
        except Exception:
            pass
    return (lista_id_query, 0.0)

@router.get("/", response_model=List[ProductoResponse])
async def listar_productos(
    categoria_id: Optional[int] = Query(None, description="Filtrar por categoría (ID)"),
    categoria_slug: Optional[str] = Query(None, description="Filtrar por categoría (slug)"),
    talla: Optional[str] = Query(None, description="Filtrar por talla"),
    color: Optional[str] = Query(None, description="Filtrar por color"),
    precio_min: Optional[float] = Query(None, description="Precio mínimo"),
    precio_max: Optional[float] = Query(None, description="Precio máximo"),
    search: Optional[str] = Query(None, description="Búsqueda full-text"),
    tiene_oferta: Optional[bool] = Query(None, description="Solo productos con precio_original > precio"),
    limit: int = Query(20, description="Límite de resultados"),
    offset: int = Query(0, description="Offset para paginación"),
    lista_id: Optional[int] = Query(None, description="Lista de precios a aplicar (override admin)"),
    authorization: Optional[str] = Header(None),
    db: Client = Depends(get_db)
):
    """Lista productos con filtros opcionales y búsqueda full-text"""

    try:
        # 1. Fetch products
        # Resolver slug a ID si se pasa categoria_slug
        if categoria_slug and not categoria_id:
            slug_result = db.table('categorias').select('id').eq('slug', categoria_slug).execute()
            if slug_result.data:
                categoria_id = slug_result.data[0]['id']

        q = db.table('productos').select('*').eq('activo', True)
        if categoria_id:
            q = q.eq('categoria_id', categoria_id)
        if precio_min:
            q = q.gte('precio', precio_min)
        if precio_max:
            q = q.lte('precio', precio_max)
        if tiene_oferta:
            q = q.not_.is_('precio_original', 'null').gt('precio_original', 0)
        # Con búsqueda traemos todo para filtrar en Python
        if not search:
            q = q.range(offset, offset + limit - 1)
        result = q.execute()

        if not result.data:
            return []

        # Filtro search en Python (evita problemas con ilike en Supabase)
        productos_data = result.data
        if search:
            term = search.lower()
            productos_data = [
                p for p in productos_data
                if term in (p.get('nombre') or '').lower()
                or term in (p.get('descripcion') or '').lower()
            ]

        # 2. Fetch all variantes for these products in one query
        product_ids = [p['id'] for p in productos_data]
        variantes_result = db.table('variantes').select('*').in_('producto_id', product_ids).execute()
        variantes_by_product: dict = {}
        for v in (variantes_result.data or []):
            pid = v['producto_id']
            if pid not in variantes_by_product:
                variantes_by_product[pid] = []
            variantes_by_product[pid].append(v)

        # 2b. Fetch all images for these products
        imagenes_by_product: dict = {}
        try:
            imagenes_result = db.table('producto_imagenes').select('*').in_('producto_id', product_ids).order('orden').execute()
            for img in (imagenes_result.data or []):
                pid = img['producto_id']
                if pid not in imagenes_by_product:
                    imagenes_by_product[pid] = []
                imagenes_by_product[pid].append(img)
        except Exception:
            pass

        # 3. Fetch all categories needed in one query
        cat_ids = list({p['categoria_id'] for p in productos_data if p.get('categoria_id')})
        cats_by_id: dict = {}
        if cat_ids:
            cats_result = db.table('categorias').select('*').in_('id', cat_ids).execute()
            for c in (cats_result.data or []):
                cats_by_id[c['id']] = c

        # 3b. Resolver lista de precios si aplica
        ctx_lista_id, descuento_usuario = _resolver_contexto_precio(db, authorization, lista_id)
        mapa_lista = cargar_lista(db, ctx_lista_id) if ctx_lista_id else {}

        # 4. Build response
        productos = []
        for p in productos_data:
            if mapa_lista or descuento_usuario:
                p['precio'] = resolver_precio_producto(
                    mapa_lista=mapa_lista,
                    producto_id=p['id'],
                    precio_default=float(p.get('precio') or 0),
                    descuento_usuario=descuento_usuario,
                )
            raw_variantes = variantes_by_product.get(p['id'], [])
            variantes = []
            stock_total = 0
            for v in raw_variantes:
                if talla and v.get('talla') != talla:
                    continue
                if color and v.get('color') != color:
                    continue
                variantes.append(VarianteResponse(
                    id=v['id'], producto_id=v['producto_id'],
                    talla=v['talla'], color=v['color'],
                    stock=v['stock'], sku=v['sku']
                ))
                stock_total += v['stock']

            if (talla or color) and not variantes:
                continue

            category = None
            c = cats_by_id.get(p.get('categoria_id'))
            if c:
                category = CategoriaResponse(
                    id=c['id'], nombre=c['nombre'], slug=c['slug'],
                    padre_id=c.get('padre_id'), complementos=c.get('complementos', [])
                )

            raw_imgs = imagenes_by_product.get(p['id'], [])
            imagenes = [ImagenProducto(id=i['id'], url=i['url'], orden=i['orden']) for i in raw_imgs]

            productos.append(ProductoResponse(
                id=p['id'], nombre=p['nombre'], descripcion=p['descripcion'],
                precio=p['precio'], categoria_id=p['categoria_id'], activo=p['activo'],
                precio_original=p.get('precio_original'),
                es_nuevo=p.get('es_nuevo', False),
                oferta_hasta=str(p['oferta_hasta']) if p.get('oferta_hasta') else None,
                imagen_url=p.get('imagen_url'),
                imagenes=imagenes,
                categoria=category, variantes=variantes,
                stock_total=stock_total, pocas_unidades=stock_total <= 3
            ))

        return productos

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar productos: {str(e)}")

@router.get("/{producto_id}", response_model=ProductoResponse)
async def obtener_producto(
    producto_id: int,
    lista_id: Optional[int] = Query(None),
    authorization: Optional[str] = Header(None),
    db: Client = Depends(get_db)
):
    """Obtiene un producto por ID con sus variantes y categoría"""

    try:
        prod_result = db.table('productos').select('*').eq('id', producto_id).eq('activo', True).execute()
        if not prod_result.data:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        p = prod_result.data[0]

        # Aplicar lista de precios si corresponde
        ctx_lista_id, descuento_usuario = _resolver_contexto_precio(db, authorization, lista_id)
        if ctx_lista_id or descuento_usuario:
            mapa_lista = cargar_lista(db, ctx_lista_id) if ctx_lista_id else {}
            p['precio'] = resolver_precio_producto(
                mapa_lista=mapa_lista,
                producto_id=p['id'],
                precio_default=float(p.get('precio') or 0),
                descuento_usuario=descuento_usuario,
            )

        variantes_result = db.table('variantes').select('*').eq('producto_id', producto_id).execute()
        variantes = []
        stock_total = 0
        for v in (variantes_result.data or []):
            variantes.append(VarianteResponse(
                id=v['id'], producto_id=v['producto_id'],
                talla=v['talla'], color=v['color'],
                stock=v['stock'], sku=v['sku']
            ))
            stock_total += v['stock']

        try:
            imagenes_result = db.table('producto_imagenes').select('*').eq('producto_id', producto_id).order('orden').execute()
            imagenes = [
                ImagenProducto(id=i['id'], url=i['url'], orden=i['orden'])
                for i in (imagenes_result.data or [])
            ]
        except Exception:
            imagenes = []

        category = None
        if p.get('categoria_id'):
            cat_result = db.table('categorias').select('*').eq('id', p['categoria_id']).execute()
            if cat_result.data:
                c = cat_result.data[0]
                category = CategoriaResponse(
                    id=c['id'], nombre=c['nombre'], slug=c['slug'],
                    padre_id=c.get('padre_id'), complementos=c.get('complementos', [])
                )

        return ProductoResponse(
            id=p['id'], nombre=p['nombre'], descripcion=p['descripcion'],
            precio=p['precio'], categoria_id=p['categoria_id'], activo=p['activo'],
            precio_original=p.get('precio_original'),
            es_nuevo=p.get('es_nuevo', False),
            oferta_hasta=str(p['oferta_hasta']) if p.get('oferta_hasta') else None,
            imagen_url=p.get('imagen_url'),
            imagenes=imagenes,
            categoria=category, variantes=variantes,
            stock_total=stock_total, pocas_unidades=stock_total <= 3
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener producto: {str(e)}")

@router.get("/{producto_id}/atributos")
async def atributos_producto(producto_id: int, db: Client = Depends(get_db)):
    """Devuelve los valores de atributos dinamicos por variante.

    Response: {
      "definiciones": [{id, clave, nombre, tipo, ...}, ...],
      "por_variante": { variante_id: [{atributo_id, clave, nombre, valor}, ...] }
    }
    """
    # Categoria del producto
    prod = db.table("productos").select("categoria_id").eq("id", producto_id).single().execute()
    if not prod.data or not prod.data.get("categoria_id"):
        return {"definiciones": [], "por_variante": {}}

    categoria_id = prod.data["categoria_id"]

    defs_res = db.table("atributo_definicion").select("*") \
        .eq("categoria_id", categoria_id).order("orden").execute()
    defs = defs_res.data or []
    if not defs:
        return {"definiciones": [], "por_variante": {}}

    # Mapeo id → definicion
    by_id = {d["id"]: d for d in defs}

    # Variantes del producto
    var_res = db.table("variantes").select("id").eq("producto_id", producto_id).execute()
    variante_ids = [v["id"] for v in (var_res.data or [])]
    if not variante_ids:
        return {"definiciones": defs, "por_variante": {}}

    # Valores asignados
    vals_res = db.table("atributo_valor_variante").select("variante_id, atributo_id, valor") \
        .in_("variante_id", variante_ids).execute()

    por_variante: dict = {}
    for v in vals_res.data or []:
        vid = v["variante_id"]
        if vid not in por_variante:
            por_variante[vid] = []
        d = by_id.get(v["atributo_id"])
        if not d:
            continue
        por_variante[vid].append({
            "atributo_id": v["atributo_id"],
            "clave": d["clave"],
            "nombre": d["nombre"],
            "valor": v["valor"],
        })

    return {"definiciones": defs, "por_variante": por_variante}


@router.post("/", response_model=ProductoResponse)
async def crear_producto(
    producto: ProductoCreate,
    db: Client = Depends(get_db)
):
    """Crea un nuevo producto (solo admin)"""

    try:
        # TODO: Add admin authentication check

        result = db.table('productos').insert({
            'nombre': producto.nombre,
            'descripcion': producto.descripcion,
            'precio': producto.precio,
            'categoria_id': producto.categoria_id,
            'activo': producto.activo
        }).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Error al crear producto")

        # Get the created product with full data
        return await obtener_producto(result.data[0]['id'], db)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear producto: {str(e)}")

@router.put("/{producto_id}", response_model=ProductoResponse)
async def actualizar_producto(
    producto_id: int,
    producto: ProductoUpdate,
    db: Client = Depends(get_db)
):
    """Actualiza un producto (solo admin)"""

    try:
        # TODO: Add admin authentication check

        update_data = {}
        if producto.nombre is not None:
            update_data['nombre'] = producto.nombre
        if producto.descripcion is not None:
            update_data['descripcion'] = producto.descripcion
        if producto.precio is not None:
            update_data['precio'] = producto.precio
        if producto.categoria_id is not None:
            update_data['categoria_id'] = producto.categoria_id
        if producto.activo is not None:
            update_data['activo'] = producto.activo

        if not update_data:
            raise HTTPException(status_code=400, detail="No se proporcionaron campos para actualizar")

        result = db.table('productos').update(update_data).eq('id', producto_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        return await obtener_producto(producto_id, db)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar producto: {str(e)}")

# Variant endpoints
@router.post("/{producto_id}/variantes", response_model=VarianteResponse)
async def crear_variante(
    producto_id: int,
    variante: VarianteCreate,
    db: Client = Depends(get_db)
):
    """Crea una variante para un producto (solo admin)"""

    try:
        # TODO: Add admin authentication check
        # TODO: Verify product exists

        result = db.table('variantes').insert({
            'producto_id': producto_id,
            'talla': variante.talla,
            'color': variante.color,
            'stock': variante.stock,
            'sku': variante.sku
        }).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Error al crear variante")

        return VarianteResponse(**result.data[0])

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear variante: {str(e)}")

@router.put("/variantes/{variante_id}", response_model=VarianteResponse)
async def actualizar_variante(
    variante_id: int,
    variante: VarianteUpdate,
    db: Client = Depends(get_db)
):
    """Actualiza una variante (solo admin)"""

    try:
        # TODO: Add admin authentication check

        update_data = {}
        if variante.talla is not None:
            update_data['talla'] = variante.talla
        if variante.color is not None:
            update_data['color'] = variante.color
        if variante.stock is not None:
            update_data['stock'] = variante.stock
        if variante.sku is not None:
            update_data['sku'] = variante.sku

        if not update_data:
            raise HTTPException(status_code=400, detail="No se proporcionaron campos para actualizar")

        result = db.table('variantes').update(update_data).eq('id', variante_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Variante no encontrada")

        return VarianteResponse(**result.data[0])

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar variante: {str(e)}")