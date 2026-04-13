'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Metricas {
  ventasMes: number;
  pedidosPendientes: number;
  pedidosHoy: number;
  stockBajo: number;
}

interface ProductoStockBajo {
  producto_id: number;
  nombre: string;
  variantes: { talla: string; color: string; stock: number }[];
}

interface UltimoPedido {
  id: number;
  total: number;
  estado: string;
  created_at: string;
}

interface ProductoVendido {
  nombre: string;
  total_vendido: number;
}

const estadoClases: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  pagado: 'bg-blue-100 text-blue-700',
  preparando: 'bg-orange-100 text-orange-700',
  enviado: 'bg-violet-100 text-violet-700',
  entregado: 'bg-emerald-100 text-emerald-700',
  cancelado: 'bg-rose-100 text-rose-700',
};

const barColors = ['bg-stone-800', 'bg-stone-500', 'bg-stone-300'];

function formatMoney(n: number) {
  return '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function DashboardPage() {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [ultimosPedidos, setUltimosPedidos] = useState<UltimoPedido[]>([]);
  const [topProductos, setTopProductos] = useState<ProductoVendido[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockBajoProductos, setStockBajoProductos] = useState<ProductoStockBajo[]>([]);
  const [showStockBajo, setShowStockBajo] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      const supabase = createClient();

      const ahora = new Date();
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).toISOString();
      const manana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1).toISOString();

      const { data: pedidosMes } = await supabase
        .from('pedidos').select('total').gte('created_at', inicioMes).neq('estado', 'cancelado');
      const ventasMes = (pedidosMes || []).reduce((acc, p) => acc + (p.total || 0), 0);

      const { count: pedidosPendientes } = await supabase
        .from('pedidos').select('id', { count: 'exact', head: true }).eq('estado', 'pendiente');

      const { count: pedidosHoy } = await supabase
        .from('pedidos').select('id', { count: 'exact', head: true }).gte('created_at', hoy).lt('created_at', manana);

      const { data: variantesLow } = await supabase
        .from('variantes').select('producto_id, talla, color, stock, productos(nombre)').lte('stock', 3);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const productosUnicos = new Set((variantesLow || []).map((v: any) => v.producto_id));

      // Agrupar por producto para el detalle
      const byProducto: Record<number, ProductoStockBajo> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const v of (variantesLow || []) as any[]) {
        if (!byProducto[v.producto_id]) {
          byProducto[v.producto_id] = { producto_id: v.producto_id, nombre: v.productos?.nombre || '—', variantes: [] };
        }
        byProducto[v.producto_id].variantes.push({ talla: v.talla, color: v.color, stock: v.stock });
      }
      setStockBajoProductos(Object.values(byProducto));

      setMetricas({
        ventasMes,
        pedidosPendientes: pedidosPendientes || 0,
        pedidosHoy: pedidosHoy || 0,
        stockBajo: productosUnicos.size,
      });

      const { data: pedidos } = await supabase
        .from('pedidos').select('id, total, estado, created_at')
        .order('created_at', { ascending: false }).limit(5);
      setUltimosPedidos(pedidos || []);

      const { data: items } = await supabase
        .from('items_pedido').select('cantidad, variantes(producto_id, productos(nombre))');

      const conteo: Record<string, { nombre: string; total: number }> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (items || []).forEach((item: any) => {
        const nombre = item.variantes?.productos?.nombre;
        const producto_id = item.variantes?.producto_id;
        if (!nombre || !producto_id) return;
        const key = String(producto_id);
        if (!conteo[key]) conteo[key] = { nombre, total: 0 };
        conteo[key].total += item.cantidad || 0;
      });
      setTopProductos(Object.values(conteo).sort((a, b) => b.total - a.total).slice(0, 3).map(p => ({ nombre: p.nombre, total_vendido: p.total })));
      setLoading(false);
    };
    cargar();
  }, []);

  if (loading) return (
    <div className="flex items-center gap-3">
      <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-stone-400">Cargando dashboard...</p>
    </div>
  );

  const maxVendido = topProductos.length > 0 ? topProductos[0].total_vendido : 1;

  const tarjetas = [
    {
      label: 'Ventas del mes',
      valor: formatMoney(metricas?.ventasMes || 0),
      accent: 'border-l-emerald-400',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valorColor: 'text-emerald-700',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    },
    {
      label: 'Pedidos pendientes',
      valor: String(metricas?.pedidosPendientes ?? 0),
      accent: 'border-l-amber-400',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      valorColor: (metricas?.pedidosPendientes || 0) > 0 ? 'text-amber-600' : 'text-stone-900',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    },
    {
      label: 'Pedidos hoy',
      valor: String(metricas?.pedidosHoy ?? 0),
      accent: 'border-l-blue-400',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valorColor: 'text-stone-900',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    },
    {
      label: 'Stock bajo',
      valor: String(metricas?.stockBajo ?? 0),
      accent: (metricas?.stockBajo || 0) > 0 ? 'border-l-rose-400' : 'border-l-stone-200',
      iconBg: (metricas?.stockBajo || 0) > 0 ? 'bg-rose-50' : 'bg-stone-50',
      iconColor: (metricas?.stockBajo || 0) > 0 ? 'text-rose-500' : 'text-stone-400',
      valorColor: (metricas?.stockBajo || 0) > 0 ? 'text-rose-600' : 'text-stone-900',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
        <p className="text-sm text-stone-400 mt-1 capitalize">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {tarjetas.map(t => {
          const isStockBajo = t.label === 'Stock bajo';
          const clickable = isStockBajo && (metricas?.stockBajo || 0) > 0;
          return (
            <div
              key={t.label}
              onClick={clickable ? () => setShowStockBajo(s => !s) : undefined}
              className={`bg-white rounded-xl shadow-sm border border-stone-100 border-l-4 ${t.accent} p-5 ${clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] text-stone-400 uppercase tracking-wider font-medium leading-tight">{t.label}</p>
                <div className={`w-7 h-7 ${t.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                  <svg className={`w-3.5 h-3.5 ${t.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {t.icon}
                  </svg>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className={`text-3xl font-bold tracking-tight ${t.valorColor}`}>{t.valor}</p>
                {clickable && <p className="text-[9px] text-stone-400 uppercase tracking-wider">{showStockBajo ? 'Ocultar ▲' : 'Ver detalle ▼'}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock bajo — detalle expandible */}
      {showStockBajo && stockBajoProductos.length > 0 && (
        <div className="bg-white rounded-xl border border-rose-100 shadow-sm mb-6 overflow-hidden">
          <div className="px-5 py-3 bg-rose-50 border-b border-rose-100">
            <p className="text-[10px] text-rose-600 uppercase tracking-widest font-medium">Productos con stock bajo (≤ 3 unidades)</p>
          </div>
          <div className="divide-y divide-stone-100">
            {stockBajoProductos.map(p => (
              <div key={p.producto_id} className="px-4 py-3 flex flex-wrap items-start gap-2">
                <p className="text-sm font-medium text-stone-800 w-full sm:w-36 shrink-0 truncate">{p.nombre}</p>
                <div className="flex flex-wrap gap-2">
                  {p.variantes.map((v, i) => (
                    <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${v.stock === 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                      {v.talla}/{v.color}: {v.stock} u.
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos pedidos */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
            <h2 className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">Últimos pedidos</h2>
          </div>
          {ultimosPedidos.length === 0 ? (
            <p className="text-sm text-stone-400 px-6 py-8">Sin pedidos aún.</p>
          ) : (
            <div>
              <div className="overflow-x-auto">
              <div className="min-w-[320px]">
              <div className="grid grid-cols-[40px_1fr_90px_70px] gap-2 px-4 py-2.5 border-b border-stone-100">
                {['#', 'Fecha', 'Estado', 'Total'].map(h => (
                  <span key={h} className="text-[10px] text-stone-400 uppercase tracking-wider">{h}</span>
                ))}
              </div>
              {ultimosPedidos.map(p => (
                <div key={p.id} className="grid grid-cols-[40px_1fr_90px_70px] gap-2 px-4 py-3 border-b border-stone-50 last:border-0 hover:bg-stone-50 transition-colors">
                  <span className="text-xs font-medium text-stone-700">#{p.id}</span>
                  <span className="text-xs text-stone-400">{formatFecha(p.created_at)}</span>
                  <span className={`inline-flex items-center self-center rounded-full px-2 py-0.5 text-[10px] font-medium ${estadoClases[p.estado] || 'bg-stone-100 text-stone-500'}`}>
                    {p.estado}
                  </span>
                  <span className="text-xs font-semibold text-stone-800">{formatMoney(p.total)}</span>
                </div>
              ))}
              </div>
              </div>
            </div>
          )}
        </div>

        {/* Top productos */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
            <h2 className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">Top productos vendidos</h2>
          </div>
          {topProductos.length === 0 ? (
            <p className="text-sm text-stone-400 px-6 py-8">Sin ventas registradas aún.</p>
          ) : (
            <div className="px-6 py-5 space-y-5">
              {topProductos.map((p, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${barColors[i]}`}>{i + 1}</span>
                      <span className="text-sm font-medium text-stone-800 truncate">{p.nombre}</span>
                    </div>
                    <span className="text-xs text-stone-400 shrink-0 ml-2">{p.total_vendido} u.</span>
                  </div>
                  <div className="ml-8 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColors[i]} rounded-full transition-all`}
                      style={{ width: `${Math.round((p.total_vendido / maxVendido) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
