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
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header tabla */}
        <div className="grid grid-cols-[80px_1fr_110px_140px_150px_190px] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
          {['ID', 'Cliente', 'Total', 'Estado', 'Fecha', 'Cambiar estado'].map(h => (
            <span key={h} className="text-xs text-gray-500 uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {pedidosFiltrados.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-400">Sin pedidos{filtro !== 'todos' ? ` con estado "${filtro}"` : ''}.</p>
          </div>
        ) : (
          pedidosFiltrados.map(p => (
            <div
              key={p.id}
              className="grid grid-cols-[80px_1fr_110px_140px_150px_190px] gap-4 px-5 py-4 border-b border-gray-50 items-center hover:bg-gray-50 transition-colors last:border-0"
            >
              {/* ID */}
              <span className="text-sm font-medium text-gray-900">#{p.id}</span>

              {/* Cliente */}
              <span className="text-sm text-gray-500 truncate">
                {p.usuarios?.email || '—'}
              </span>

              {/* Total */}
              <span className="text-sm font-medium text-gray-900">{formatMoney(p.total)}</span>

              {/* Estado badge */}
              <div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoBadge[p.estado] || 'bg-gray-100 text-gray-600'}`}>
                  {p.estado}
                </span>
                {msg?.id === p.id && (
                  <p className={`text-xs mt-1 ${msg.ok ? 'text-green-600' : 'text-red-500'}`}>{msg.texto}</p>
                )}
              </div>

              {/* Fecha */}
              <span className="text-xs text-gray-500">{formatFecha(p.created_at)}</span>

              {/* Select estado */}
              <select
                value={p.estado}
                disabled={actualizando === p.id}
                onChange={e => handleCambiarEstado(p.id, e.target.value as EstadoPedido)}
                className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white disabled:opacity-50 cursor-pointer"
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
