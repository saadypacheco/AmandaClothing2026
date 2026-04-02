'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Metricas {
  ventasMes: number;
  pedidosPendientes: number;
  pedidosHoy: number;
  stockBajo: number;
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
  pendiente: 'bg-yellow-50 text-yellow-700',
  pagado: 'bg-blue-50 text-blue-700',
  preparando: 'bg-orange-50 text-orange-700',
  enviado: 'bg-purple-50 text-purple-700',
  entregado: 'bg-green-50 text-green-700',
  cancelado: 'bg-red-50 text-red-700',
};

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

  useEffect(() => {
    const cargar = async () => {
      const supabase = createClient();

      const ahora = new Date();
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).toISOString();
      const manana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1).toISOString();

      // Ventas del mes (no cancelados)
      const { data: pedidosMes } = await supabase
        .from('pedidos')
        .select('total')
        .gte('created_at', inicioMes)
        .neq('estado', 'cancelado');

      const ventasMes = (pedidosMes || []).reduce((acc, p) => acc + (p.total || 0), 0);

      // Pedidos pendientes
      const { count: pedidosPendientes } = await supabase
        .from('pedidos')
        .select('id', { count: 'exact', head: true })
        .eq('estado', 'pendiente');

      // Pedidos de hoy
      const { count: pedidosHoy } = await supabase
        .from('pedidos')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', hoy)
        .lt('created_at', manana);

      // Stock bajo: variantes con stock <= 3, contar productos únicos
      const { data: variantesLow } = await supabase
        .from('variantes')
        .select('producto_id')
        .lte('stock', 3);

      const productosUnicos = new Set((variantesLow || []).map(v => v.producto_id));
      const stockBajo = productosUnicos.size;

      setMetricas({
        ventasMes,
        pedidosPendientes: pedidosPendientes || 0,
        pedidosHoy: pedidosHoy || 0,
        stockBajo,
      });

      // Últimos 5 pedidos
      const { data: pedidos } = await supabase
        .from('pedidos')
        .select('id, total, estado, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setUltimosPedidos(pedidos || []);

      // Top 3 productos más vendidos via items_pedido → variantes → productos
      const { data: items } = await supabase
        .from('items_pedido')
        .select('cantidad, variantes(producto_id, productos(nombre))');

      // Agregar por producto
      const conteo: Record<string, { nombre: string; total: number }> = {};
      (items || []).forEach((item: any) => {
        const nombre = item.variantes?.productos?.nombre;
        const producto_id = item.variantes?.producto_id;
        if (!nombre || !producto_id) return;
        const key = String(producto_id);
        if (!conteo[key]) conteo[key] = { nombre, total: 0 };
        conteo[key].total += item.cantidad || 0;
      });

      const top = Object.values(conteo)
        .sort((a, b) => b.total - a.total)
        .slice(0, 3)
        .map(p => ({ nombre: p.nombre, total_vendido: p.total }));

      setTopProductos(top);
      setLoading(false);
    };

    cargar();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Cargando dashboard...</p>
      </div>
    );
  }

  const maxVendido = topProductos.length > 0 ? topProductos[0].total_vendido : 1;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1 capitalize">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Métricas 4 columnas */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {/* Ventas del mes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Ventas del mes</p>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatMoney(metricas?.ventasMes || 0)}</p>
        </div>

        {/* Pedidos pendientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Pedidos pendientes</p>
            <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metricas?.pedidosPendientes}</p>
        </div>

        {/* Pedidos hoy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Pedidos hoy</p>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metricas?.pedidosHoy}</p>
        </div>

        {/* Stock bajo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Stock bajo</p>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${(metricas?.stockBajo || 0) > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
              <svg className={`w-4 h-4 ${(metricas?.stockBajo || 0) > 0 ? 'text-red-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <p className={`text-3xl font-bold ${(metricas?.stockBajo || 0) > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {metricas?.stockBajo}
          </p>
        </div>
      </div>

      {/* Dos columnas: últimos pedidos | top productos */}
      <div className="grid grid-cols-2 gap-6">
        {/* Últimos pedidos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-5">Últimos pedidos</h2>
          {ultimosPedidos.length === 0 ? (
            <p className="text-sm text-gray-400">Sin pedidos aún.</p>
          ) : (
            <div>
              <div className="grid grid-cols-[60px_1fr_100px_80px] gap-3 pb-2 border-b border-gray-100 mb-2">
                {['#', 'Fecha', 'Estado', 'Total'].map(h => (
                  <span key={h} className="text-xs text-gray-500 uppercase tracking-wider">{h}</span>
                ))}
              </div>
              {ultimosPedidos.map(p => (
                <div key={p.id} className="grid grid-cols-[60px_1fr_100px_80px] gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-gray-900">#{p.id}</span>
                  <span className="text-sm text-gray-500">{formatFecha(p.created_at)}</span>
                  <span className={`inline-flex items-center self-center rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoClases[p.estado] || 'bg-gray-100 text-gray-600'}`}>
                    {p.estado}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{formatMoney(p.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top productos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-5">Top productos vendidos</h2>
          {topProductos.length === 0 ? (
            <p className="text-sm text-gray-400">Sin ventas registradas aún.</p>
          ) : (
            <div className="space-y-5">
              {topProductos.map((p, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                      <span className="text-sm font-medium text-gray-900 truncate">{p.nombre}</span>
                    </div>
                    <span className="text-xs text-gray-500 shrink-0 ml-2">{p.total_vendido} u.</span>
                  </div>
                  <div className="ml-7 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full transition-all"
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
