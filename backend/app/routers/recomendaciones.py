from fastapi import APIRouter, Depends, Query, HTTPException
from app.db.client import get_supabase_client
from app.models.producto import ProductoResponse, VarianteResponse, CategoriaResponse
from supabase import Client
from typing import Optional, List

router = APIRouter(prefix="/recomendaciones", tags=["recomendaciones"])


def get_db() -> Client:
    return get_supabase_client()


def _build_producto(p: dict, variantes_by_product: dict, cats_by_id: dict) -> ProductoResponse:
    raw_variantes = variantes_by_product.get(p['id'], [])
    variantes = []
    stock_total = 0
    for v in raw_variantes:
        variantes.append(VarianteResponse(
            id=v['id'], producto_id=v['producto_id'],
            talla=v['talla'], color=v['color'],
            stock=v['stock'], sku=v['sku']
        ))
        stock_total += v['stock']

    category = None
    c = cats_by_id.get(p.get('categoria_id'))
    if c:
        category = CategoriaResponse(
            id=c['id'], nombre=c['nombre'], slug=c['slug'],
            padre_id=c.get('padre_id'), complementos=c.get('complementos', [])
        )

    return ProductoResponse(
        id=p['id'], nombre=p['nombre'], descripcion=p['descripcion'],
        precio=p['precio'], categoria_id=p['categoria_id'], activo=p['activo'],
        imagen_url=p.get('imagen_url'),
        categoria=category, variantes=variantes,
        stock_total=stock_total, pocas_unidades=stock_total <= 3
    )


def _enrich(productos: list, db: Client) -> List[ProductoResponse]:
    if not productos:
        return []
    ids = [p['id'] for p in productos]

    variantes_result = db.table('variantes').select('*').in_('producto_id', ids).execute()
    variantes_by_product: dict = {}
    for v in (variantes_result.data or []):
        variantes_by_product.setdefault(v['producto_id'], []).append(v)

    cat_ids = list({p['categoria_id'] for p in productos if p.get('categoria_id')})
    cats_by_id: dict = {}
    if cat_ids:
        cats = db.table('categorias').select('*').in_('id', cat_ids).execute()
        for c in (cats.data or []):
            cats_by_id[c['id']] = c

    return [_build_producto(p, variantes_by_product, cats_by_id) for p in productos]


@router.get("", response_model=List[ProductoResponse])
async def obtener_recomendaciones(
    producto_id: Optional[int] = Query(None, description="ID del producto actual"),
    session_id: Optional[str] = Query(None, description="Session ID del visitante"),
    usuario_id: Optional[str] = Query(None, description="UUID del usuario logueado"),
    limit: int = Query(6, le=12),
    db: Client = Depends(get_db)
):
    """
    Retorna productos recomendados.
    - Si se provee producto_id: similares precalculados → misma categoría → novedades
    - Si se provee session_id/usuario_id: basado en eventos → novedades
    - Fallback siempre a novedades activas
    """
    try:
        recos: list = []
        excluir_ids: set = set()
        if producto_id:
            excluir_ids.add(producto_id)

        # ── 1. Similares pre-calculados (si hay producto_id) ────────────────
        if producto_id and len(recos) < limit:
            sim_result = db.table('producto_similares') \
                .select('similar_id') \
                .eq('producto_id', producto_id) \
                .order('score', desc=True) \
                .limit(limit).execute()

            sim_ids = [r['similar_id'] for r in (sim_result.data or [])
                       if r['similar_id'] not in excluir_ids]

            if sim_ids:
                prods = db.table('productos').select('*') \
                    .in_('id', sim_ids).eq('activo', True).execute()
                recos.extend(prods.data or [])
                excluir_ids.update(p['id'] for p in recos)

        # ── 2. Por historial de sesión/usuario ─────────────────────────────
        if (session_id or usuario_id) and len(recos) < limit:
            ev_query = db.table('eventos_usuario') \
                .select('producto_id') \
                .order('created_at', desc=True) \
                .limit(30)

            if usuario_id:
                ev_query = ev_query.eq('usuario_id', usuario_id)
            elif session_id:
                ev_query = ev_query.eq('session_id', session_id)

            ev_result = ev_query.execute()
            hist_ids = list({r['producto_id'] for r in (ev_result.data or [])})

            if hist_ids:
                # Obtener categorías de los productos vistos
                hist_prods = db.table('productos').select('categoria_id') \
                    .in_('id', hist_ids).eq('activo', True).execute()
                cat_ids_hist = list({p['categoria_id'] for p in (hist_prods.data or []) if p.get('categoria_id')})

                if cat_ids_hist:
                    faltan = limit - len(recos)
                    cat_prods = db.table('productos').select('*') \
                        .in_('categoria_id', cat_ids_hist) \
                        .eq('activo', True) \
                        .not_.in_('id', list(excluir_ids)) \
                        .limit(faltan).execute()
                    recos.extend(cat_prods.data or [])
                    excluir_ids.update(p['id'] for p in recos)

        # ── 3. Misma categoría (si hay producto_id) ────────────────────────
        if producto_id and len(recos) < limit:
            prod_result = db.table('productos').select('categoria_id') \
                .eq('id', producto_id).execute()
            if prod_result.data and prod_result.data[0].get('categoria_id'):
                cat_id = prod_result.data[0]['categoria_id']
                faltan = limit - len(recos)
                same_cat = db.table('productos').select('*') \
                    .eq('categoria_id', cat_id).eq('activo', True) \
                    .not_.in_('id', list(excluir_ids)) \
                    .limit(faltan).execute()
                recos.extend(same_cat.data or [])
                excluir_ids.update(p['id'] for p in recos)

        # ── 4. Fallback: novedades ─────────────────────────────────────────
        if len(recos) < limit:
            faltan = limit - len(recos)
            novedades = db.table('productos').select('*') \
                .eq('activo', True) \
                .not_.in_('id', list(excluir_ids) if excluir_ids else [-1]) \
                .order('id', desc=True) \
                .limit(faltan).execute()
            recos.extend(novedades.data or [])

        # Dedup por id manteniendo orden
        seen: set = set()
        recos_unique = []
        for p in recos:
            if p['id'] not in seen:
                seen.add(p['id'])
                recos_unique.append(p)

        return _enrich(recos_unique[:limit], db)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
