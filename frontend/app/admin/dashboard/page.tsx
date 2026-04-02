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
  pendiente: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  pagado: 'bg-blue-50 text-blue-700 border-blue-200',
  preparando: 'bg-orange-50 text-orange-700 border-orange-200',
  enviado: 'bg-purple-50 text-purple-700 border-purple-200',
  entregado: 'bg-green-50 text-green-700 border-green-200',
  cancelado: 'bg-red-50 text-red-700 border-red-200',
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
      <p className="text-[10px] tracking-widest uppercase text-amanda-gray animate-pulse">
        Cargando dashboard...
      </p>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl text-amanda-black">Dashboard</h1>
        <p className="text-xs text-amanda-gray mt-1 tracking-wide">Resumen de actividad</p>
      </div>

      {/* Métricas 2x2 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-amanda-lightgray p-6">
          <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-3">Ventas del mes</p>
          <p className="font-serif text-3xl text-amanda-black">{formatMoney(metricas?.ventasMes || 0)}</p>
        </div>
        <div className="bg-white border border-amanda-lightgray p-6">
          <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-3">Pedidos pendientes</p>
          <p className="font-serif text-3xl text-amanda-black">{metricas?.pedidosPendientes}</p>
        </div>
        <div className="bg-white border border-amanda-lightgray p-6">
          <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-3">Pedidos hoy</p>
          <p className="font-serif text-3xl text-amanda-black">{metricas?.pedidosHoy}</p>
        </div>
        <div className="bg-white border border-amanda-lightgray p-6">
          <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-3">Productos stock bajo</p>
          <p className={`font-serif text-3xl ${(metricas?.stockBajo || 0) > 0 ? 'text-red-600' : 'text-amanda-black'}`}>
            {metricas?.stockBajo}
          </p>
        </div>
      </div>

      {/* Dos columnas: últimos pedidos | top productos */}
      <div className="grid grid-cols-2 gap-6">
        {/* Últimos pedidos */}
        <div className="bg-white border border-amanda-lightgray p-6">
          <h2 className="text-[10px] tracking-widest uppercase text-amanda-gray mb-4">Últimos pedidos</h2>
          {ultimosPedidos.length === 0 ? (
            <p className="text-xs text-amanda-gray">Sin pedidos aún.</p>
          ) : (
            <div className="space-y-3">
              {ultimosPedidos.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-amanda-lightgray last:border-0">
                  <div>
                    <p className="text-xs font-medium text-amanda-black">#{p.id}</p>
                    <p className="text-[10px] text-amanda-gray">{formatFecha(p.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 border ${estadoClases[p.estado] || 'border-stone-200 text-stone-500'}`}>
                      {p.estado}
                    </span>
                    <span className="text-xs font-medium text-amanda-black">{formatMoney(p.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top productos */}
        <div className="bg-white border border-amanda-lightgray p-6">
          <h2 className="text-[10px] tracking-widest uppercase text-amanda-gray mb-4">Top productos vendidos</h2>
          {topProductos.length === 0 ? (
            <p className="text-xs text-amanda-gray">Sin ventas registradas aún.</p>
          ) : (
            <div className="space-y-4">
              {topProductos.map((p, i) => (
                <div key={i} className="flex items-center gap-4 py-2 border-b border-amanda-lightgray last:border-0">
                  <span className="font-serif text-2xl text-amanda-lightgray w-8 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-amanda-black truncate">{p.nombre}</p>
                    <p className="text-[10px] text-amanda-gray">{p.total_vendido} unidades vendidas</p>
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
