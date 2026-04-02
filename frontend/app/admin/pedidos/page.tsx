'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type EstadoPedido = 'pendiente' | 'pagado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado';

interface Pedido {
  id: number;
  total: number;
  estado: EstadoPedido;
  created_at: string;
  usuarios: { email: string } | null;
}

const ESTADOS: EstadoPedido[] = ['pendiente', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado'];

const estadoBadge: Record<EstadoPedido, string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  pagado: 'bg-blue-100 text-blue-700',
  preparando: 'bg-orange-100 text-orange-700',
  enviado: 'bg-violet-100 text-violet-700',
  entregado: 'bg-emerald-100 text-emerald-700',
  cancelado: 'bg-rose-100 text-rose-700',
};

function formatMoney(n: number) {
  return '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ id: number; texto: string; ok: boolean } | null>(null);
  const [filtro, setFiltro] = useState<EstadoPedido | 'todos'>('todos');

  useEffect(() => {
    fetchPedidos();
  }, []);

  async function fetchPedidos() {
    const supabase = createClient();
    const { data } = await supabase
      .from('pedidos')
      .select('id, total, estado, created_at, usuarios(email)')
      .order('created_at', { ascending: false });
    setPedidos((data as unknown as Pedido[]) || []);
    setLoading(false);
  }

  function flash(id: number, texto: string, ok = true) {
    setMsg({ id, texto, ok });
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleCambiarEstado(pedidoId: number, nuevoEstado: EstadoPedido) {
    setActualizando(pedidoId);
    const supabase = createClient();
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', pedidoId);

    if (error) {
      flash(pedidoId, 'Error al actualizar', false);
    } else {
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p));
      flash(pedidoId, 'Estado actualizado');
    }
    setActualizando(null);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Cargando pedidos...</p>
      </div>
    );
  }

  const pendientesCount = pedidos.filter(p => p.estado === 'pendiente').length;
  const pedidosFiltrados = filtro === 'todos' ? pedidos : pedidos.filter(p => p.estado === filtro);

  const filtrosPill: { label: string; value: EstadoPedido | 'todos' }[] = [
    { label: 'Todos', value: 'todos' },
    { label: 'Pendientes', value: 'pendiente' },
    { label: 'Pagados', value: 'pagado' },
    { label: 'Preparando', value: 'preparando' },
    { label: 'Enviados', value: 'enviado' },
    { label: 'Entregados', value: 'entregado' },
    { label: 'Cancelados', value: 'cancelado' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Pedidos</h1>
        {pendientesCount > 0 && (
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-700">
            {pendientesCount} pendientes
          </span>
        )}
      </div>

      {/* Filtros pill */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {filtrosPill.map(f => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filtro === f.value
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        {/* Header tabla */}
        <div className="grid grid-cols-[80px_1fr_110px_140px_150px_190px] gap-4 px-5 py-3 border-b border-stone-200 bg-stone-100">
          {['ID', 'Cliente', 'Total', 'Estado', 'Fecha', 'Cambiar estado'].map(h => (
            <span key={h} className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">{h}</span>
          ))}
        </div>

        {pedidosFiltrados.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-stone-400">Sin pedidos{filtro !== 'todos' ? ` con estado "${filtro}"` : ''}.</p>
          </div>
        ) : (
          pedidosFiltrados.map((p, idx) => (
            <div
              key={p.id}
              className={`grid grid-cols-[80px_1fr_110px_140px_150px_190px] gap-4 px-5 py-4 border-b border-stone-100 items-center hover:bg-stone-50 transition-colors last:border-0 ${idx % 2 === 0 ? '' : 'bg-stone-50/50'}`}
            >
              {/* ID */}
              <span className="text-sm font-medium text-stone-700">#{p.id}</span>

              {/* Cliente */}
              <span className="text-sm text-stone-500 truncate">
                {p.usuarios?.email || '—'}
              </span>

              {/* Total */}
              <span className="text-sm font-semibold text-stone-800">{formatMoney(p.total)}</span>

              {/* Estado badge */}
              <div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium ${estadoBadge[p.estado] || 'bg-stone-100 text-stone-500'}`}>
                  {p.estado}
                </span>
                {msg?.id === p.id && (
                  <p className={`text-xs mt-1 ${msg.ok ? 'text-emerald-600' : 'text-rose-500'}`}>{msg.texto}</p>
                )}
              </div>

              {/* Fecha */}
              <span className="text-xs text-stone-400">{formatFecha(p.created_at)}</span>

              {/* Select estado */}
              <select
                value={p.estado}
                disabled={actualizando === p.id}
                onChange={e => handleCambiarEstado(p.id, e.target.value as EstadoPedido)}
                className="border border-stone-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white disabled:opacity-50 cursor-pointer"
              >
                {ESTADOS.map(est => (
                  <option key={est} value={est}>{est}</option>
                ))}
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
