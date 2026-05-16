"""
Router de reportes B2B.

Endpoints:
- GET /admin/reportes/ventas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&group_by=cliente|producto|mes
- GET /admin/reportes/abc?desde=&hasta= — clasifica productos por Pareto
- GET /admin/reportes/margen?desde=&hasta= — margen por producto (requiere productos.costo)
- GET /admin/reportes/cobranzas-resumen — KPIs cobranzas
- GET /admin/reportes/top-clientes?desde=&hasta=&limit=

Todos aceptan ?export=csv para descargar como CSV.
"""
from fastapi import APIRouter, Depends, Query, Response
from app.db.client import get_supabase_client
from app.routers.admin import require_admin
from supabase import Client
from typing import Optional
from datetime import datetime, date, timedelta
import csv
import io

router = APIRouter(prefix="/admin/reportes", tags=["mayorista-reportes"])

# Estados que cuentan como "venta valida"
ESTADOS_VENTA = {"pagado", "aprobado", "preparacion", "preparando", "despacho", "enviado", "entregado", "facturado"}


def get_db() -> Client:
    return get_supabase_client()


def _csv_response(rows: list, fieldnames: list, filename: str) -> Response:
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for r in rows:
        writer.writerow({k: r.get(k, "") for k in fieldnames})
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


def _parse_fechas(desde: Optional[str], hasta: Optional[str]) -> tuple:
    """Devuelve (desde_iso, hasta_iso) con defaults: ultimos 30 dias."""
    if not desde:
        desde = (date.today() - timedelta(days=30)).isoformat()
    if not hasta:
        hasta = date.today().isoformat()
    return desde, hasta


# ── Ventas ───────────────────────────────────────────────────────────────────

@router.get("/ventas")
async def reporte_ventas(
    desde: Optional[str] = None,
    hasta: Optional[str] = None,
    group_by: str = Query("mes", regex="^(cliente|producto|mes)$"),
    export: Optional[str] = None,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    desde_iso, hasta_iso = _parse_fechas(desde, hasta)
    hasta_lim = (datetime.fromisoformat(hasta_iso) + timedelta(days=1)).isoformat()

    pedidos = db.table("pedidos").select(
        "id, total, estado, created_at, usuario_id, "
        "usuarios(email, nombre, razon_social), "
        "items_pedido(cantidad, precio_unitario, variantes(producto_id, productos(nombre)))"
    ).gte("created_at", desde_iso).lte("created_at", hasta_lim).execute()

    rows = []
    if group_by == "cliente":
        agrup: dict = {}
        for p in pedidos.data or []:
            if p["estado"] not in ESTADOS_VENTA:
                continue
            u = p.get("usuarios") or {}
            cliente_nombre = u.get("razon_social") or u.get("nombre") or u.get("email") or "Sin cliente"
            key = p.get("usuario_id") or "guest"
            if key not in agrup:
                agrup[key] = {"cliente": cliente_nombre, "pedidos": 0, "total": 0.0}
            agrup[key]["pedidos"] += 1
            agrup[key]["total"] += float(p.get("total") or 0)
        rows = sorted(agrup.values(), key=lambda r: r["total"], reverse=True)
        fields = ["cliente", "pedidos", "total"]
    elif group_by == "producto":
        agrup = {}
        for p in pedidos.data or []:
            if p["estado"] not in ESTADOS_VENTA:
                continue
            for item in p.get("items_pedido") or []:
                variante = item.get("variantes") or {}
                producto = (variante.get("productos") or {}) if variante else {}
                nombre = producto.get("nombre") or "Sin producto"
                producto_id = variante.get("producto_id") or 0
                key = producto_id
                if key not in agrup:
                    agrup[key] = {"producto": nombre, "unidades": 0, "total": 0.0}
                cant = int(item.get("cantidad") or 0)
                agrup[key]["unidades"] += cant
                agrup[key]["total"] += float(item.get("precio_unitario") or 0) * cant
        rows = sorted(agrup.values(), key=lambda r: r["total"], reverse=True)
        fields = ["producto", "unidades", "total"]
    else:  # mes
        agrup = {}
        for p in pedidos.data or []:
            if p["estado"] not in ESTADOS_VENTA:
                continue
            mes = (p.get("created_at") or "")[:7]
            if mes not in agrup:
                agrup[mes] = {"mes": mes, "pedidos": 0, "total": 0.0}
            agrup[mes]["pedidos"] += 1
            agrup[mes]["total"] += float(p.get("total") or 0)
        rows = sorted(agrup.values(), key=lambda r: r["mes"])
        fields = ["mes", "pedidos", "total"]

    if export == "csv":
        return _csv_response(rows, fields, f"ventas-{group_by}-{desde_iso}-{hasta_iso}.csv")
    return {"desde": desde_iso, "hasta": hasta_iso, "group_by": group_by, "rows": rows}


# ── ABC de productos (Pareto) ────────────────────────────────────────────────

@router.get("/abc")
async def reporte_abc(
    desde: Optional[str] = None,
    hasta: Optional[str] = None,
    export: Optional[str] = None,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    desde_iso, hasta_iso = _parse_fechas(desde, hasta)
    hasta_lim = (datetime.fromisoformat(hasta_iso) + timedelta(days=1)).isoformat()

    pedidos = db.table("pedidos").select(
        "id, estado, created_at, items_pedido(cantidad, precio_unitario, variantes(producto_id, productos(nombre)))"
    ).gte("created_at", desde_iso).lte("created_at", hasta_lim).execute()

    agrup: dict = {}
    for p in pedidos.data or []:
        if p["estado"] not in ESTADOS_VENTA:
            continue
        for item in p.get("items_pedido") or []:
            variante = item.get("variantes") or {}
            producto = (variante.get("productos") or {}) if variante else {}
            pid = variante.get("producto_id") or 0
            if not pid:
                continue
            if pid not in agrup:
                agrup[pid] = {"producto_id": pid, "producto": producto.get("nombre") or "—", "unidades": 0, "total": 0.0}
            cant = int(item.get("cantidad") or 0)
            agrup[pid]["unidades"] += cant
            agrup[pid]["total"] += float(item.get("precio_unitario") or 0) * cant

    ordenados = sorted(agrup.values(), key=lambda r: r["total"], reverse=True)
    total_general = sum(r["total"] for r in ordenados) or 1
    acumulado = 0.0
    for r in ordenados:
        acumulado += r["total"]
        pct_acum = (acumulado / total_general) * 100
        r["pct_acum"] = round(pct_acum, 1)
        if pct_acum <= 80:
            r["abc"] = "A"
        elif pct_acum <= 95:
            r["abc"] = "B"
        else:
            r["abc"] = "C"

    if export == "csv":
        return _csv_response(ordenados, ["abc", "producto", "unidades", "total", "pct_acum"],
            f"abc-{desde_iso}-{hasta_iso}.csv")
    return {"desde": desde_iso, "hasta": hasta_iso, "rows": ordenados}


# ── Margen bruto ─────────────────────────────────────────────────────────────

@router.get("/margen")
async def reporte_margen(
    desde: Optional[str] = None,
    hasta: Optional[str] = None,
    export: Optional[str] = None,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    desde_iso, hasta_iso = _parse_fechas(desde, hasta)
    hasta_lim = (datetime.fromisoformat(hasta_iso) + timedelta(days=1)).isoformat()

    pedidos = db.table("pedidos").select(
        "id, estado, created_at, items_pedido(cantidad, precio_unitario, variantes(producto_id, productos(id, nombre, costo)))"
    ).gte("created_at", desde_iso).lte("created_at", hasta_lim).execute()

    agrup: dict = {}
    for p in pedidos.data or []:
        if p["estado"] not in ESTADOS_VENTA:
            continue
        for item in p.get("items_pedido") or []:
            variante = item.get("variantes") or {}
            producto = (variante.get("productos") or {}) if variante else {}
            pid = producto.get("id") or 0
            if not pid:
                continue
            costo = float(producto.get("costo") or 0)
            cant = int(item.get("cantidad") or 0)
            precio = float(item.get("precio_unitario") or 0)
            ingreso = precio * cant
            cogs = costo * cant
            margen_pct = ((precio - costo) / precio * 100) if precio > 0 else 0
            if pid not in agrup:
                agrup[pid] = {
                    "producto": producto.get("nombre") or "—",
                    "unidades": 0, "ingreso": 0.0, "costo": 0.0, "margen": 0.0,
                    "_margen_pct_sum": 0.0, "_margen_pct_n": 0,
                }
            agrup[pid]["unidades"] += cant
            agrup[pid]["ingreso"] += ingreso
            agrup[pid]["costo"] += cogs
            agrup[pid]["margen"] += (ingreso - cogs)
            agrup[pid]["_margen_pct_sum"] += margen_pct
            agrup[pid]["_margen_pct_n"] += 1

    rows = []
    for r in agrup.values():
        n = r["_margen_pct_n"] or 1
        r["margen_pct"] = round(r["_margen_pct_sum"] / n, 1)
        del r["_margen_pct_sum"]; del r["_margen_pct_n"]
        rows.append(r)
    rows.sort(key=lambda r: r["margen"], reverse=True)

    if export == "csv":
        return _csv_response(rows, ["producto", "unidades", "ingreso", "costo", "margen", "margen_pct"],
            f"margen-{desde_iso}-{hasta_iso}.csv")
    return {"desde": desde_iso, "hasta": hasta_iso, "rows": rows}


# ── Cobranzas resumen ────────────────────────────────────────────────────────

@router.get("/cobranzas-resumen")
async def cobranzas_resumen(db: Client = Depends(get_db), _: None = Depends(require_admin)):
    hoy = date.today().isoformat()
    en_7 = (date.today() + timedelta(days=7)).isoformat()

    cargos = db.table("movimientos_cc").select("monto, fecha_vencimiento") \
        .eq("tipo", "cargo").is_("fecha_pago", "null") \
        .not_.is_("fecha_vencimiento", "null").execute()

    total_vencido = 0.0
    total_proximos_7 = 0.0
    total_pendiente = 0.0
    for c in cargos.data or []:
        monto = float(c.get("monto") or 0)
        total_pendiente += monto
        vto = c.get("fecha_vencimiento") or ""
        if vto < hoy:
            total_vencido += monto
        elif vto <= en_7:
            total_proximos_7 += monto

    return {
        "total_pendiente": round(total_pendiente, 2),
        "total_vencido": round(total_vencido, 2),
        "total_proximos_7_dias": round(total_proximos_7, 2),
    }


# ── Top clientes ─────────────────────────────────────────────────────────────

@router.get("/top-clientes")
async def top_clientes(
    desde: Optional[str] = None,
    hasta: Optional[str] = None,
    limit: int = 10,
    db: Client = Depends(get_db),
    _: None = Depends(require_admin),
):
    desde_iso, hasta_iso = _parse_fechas(desde, hasta)
    hasta_lim = (datetime.fromisoformat(hasta_iso) + timedelta(days=1)).isoformat()

    pedidos = db.table("pedidos").select(
        "total, estado, usuario_id, usuarios(razon_social, nombre, email)"
    ).gte("created_at", desde_iso).lte("created_at", hasta_lim) \
     .not_.is_("usuario_id", "null").execute()

    agrup: dict = {}
    for p in pedidos.data or []:
        if p["estado"] not in ESTADOS_VENTA:
            continue
        u = p.get("usuarios") or {}
        key = p["usuario_id"]
        if key not in agrup:
            agrup[key] = {
                "cliente": u.get("razon_social") or u.get("nombre") or u.get("email") or "Sin nombre",
                "pedidos": 0, "total": 0.0,
            }
        agrup[key]["pedidos"] += 1
        agrup[key]["total"] += float(p.get("total") or 0)

    rows = sorted(agrup.values(), key=lambda r: r["total"], reverse=True)[:limit]
    return {"desde": desde_iso, "hasta": hasta_iso, "rows": rows}
