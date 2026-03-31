from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text, func
from typing import List, Optional
from app.db.client import get_supabase_client
from app.models.producto import (
    ProductoResponse, ProductoFilters, ProductoCreate, ProductoUpdate,
    VarianteResponse, VarianteCreate, VarianteUpdate, CategoriaResponse
)
from supabase import Client

router = APIRouter(prefix="/productos", tags=["productos"])

def get_db() -> Client:
    return get_supabase_client()

@router.get("/", response_model=List[ProductoResponse])
async def listar_productos(
    categoria_id: Optional[int] = Query(None, description="Filtrar por categoría"),
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
        query = db.table('productos').select('*, variantes(*), categorias(*)').eq('activo', True)

        if categoria_id:
            query = query.eq('categoria_id', categoria_id)
        if precio_min:
            query = query.gte('precio', precio_min)
        if precio_max:
            query = query.lte('precio', precio_max)
        if search:
            query = query.ilike('nombre', f'%{search}%')

        query = query.range(offset, offset + limit - 1)
        result = query.execute()

        productos = []
        for p in result.data:
            variantes_data = p.get('variantes', []) or []
            categoria_data = p.get('categorias')

            variantes = []
            stock_total = 0
            for v in variantes_data:
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
            if categoria_data:
                category = CategoriaResponse(
                    id=categoria_data['id'], nombre=categoria_data['nombre'],
                    slug=categoria_data['slug'], padre_id=categoria_data.get('padre_id'),
                    complementos=categoria_data.get('complementos', [])
                )

            productos.append(ProductoResponse(
                id=p['id'], nombre=p['nombre'], descripcion=p['descripcion'],
                precio=p['precio'], categoria_id=p['categoria_id'], activo=p['activo'],
                imagen_url=p.get('imagen_url'),
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
        result = db.table('productos').select('*, variantes(*), categorias(*)').eq('id', producto_id).eq('activo', True).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        p = result.data[0]
        variantes_data = p.get('variantes', []) or []
        categoria_data = p.get('categorias')

        variantes = []
        stock_total = 0
        for v in variantes_data:
            variantes.append(VarianteResponse(
                id=v['id'], producto_id=v['producto_id'],
                talla=v['talla'], color=v['color'],
                stock=v['stock'], sku=v['sku']
            ))
            stock_total += v['stock']

        category = None
        if categoria_data:
            category = CategoriaResponse(
                id=categoria_data['id'], nombre=categoria_data['nombre'],
                slug=categoria_data['slug'], padre_id=categoria_data.get('padre_id'),
                complementos=categoria_data.get('complementos', [])
            )

        return ProductoResponse(
            id=p['id'], nombre=p['nombre'], descripcion=p['descripcion'],
            precio=p['precio'], categoria_id=p['categoria_id'], activo=p['activo'],
            imagen_url=p.get('imagen_url'),
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