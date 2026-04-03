from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text, func
from typing import List, Optional
from app.db.client import get_supabase_client
from app.models.producto import (
    ProductoResponse, ProductoFilters, ProductoCreate, ProductoUpdate,
    VarianteResponse, VarianteCreate, VarianteUpdate, CategoriaResponse, ImagenProducto
)
from supabase import Client

router = APIRouter(prefix="/productos", tags=["productos"])

def get_db() -> Client:
    return get_supabase_client()

@router.get("/", response_model=List[ProductoResponse])
async def listar_productos(
    categoria_id: Optional[int] = Query(None, description="Filtrar por categoría (ID)"),
    categoria_slug: Optional[str] = Query(None, description="Filtrar por categoría (slug)"),
    talla: Optional[str] = Query(None, description="Filtrar por talla"),
    color: Optional[str] = Query(None, description="Filtrar por color"),
    precio_min: Optional[float] = Query(None, description="Precio mínimo"),
    precio_max: Optional[float] = Query(None, description="Precio máximo"),
    search: Optional[str] = Query(None, description="Búsqueda full-text"),
    limit: int = Query(20, description="Límite de resultados"),
    offset: int = Query(0, description="Offset para paginación"),
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

        # 4. Build response
        productos = []
        for p in productos_data:
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
    db: Client = Depends(get_db)
):
    """Obtiene un producto por ID con sus variantes y categoría"""

    try:
        prod_result = db.table('productos').select('*').eq('id', producto_id).eq('activo', True).execute()
        if not prod_result.data:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        p = prod_result.data[0]

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
            imagen_url=p.get('imagen_url'),
            imagenes=imagenes,
            categoria=category, variantes=variantes,
            stock_total=stock_total, pocas_unidades=stock_total <= 3
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener producto: {str(e)}")

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