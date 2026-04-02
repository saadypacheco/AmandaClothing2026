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
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ id: number; texto: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetchPedidos();
  }, []);

  async function fetchPedidos() {
    const supabase = createClient();
    const { data } = await supabase
      .from('pedidos')
      .select('id, total, estado, created_at, usuarios(email)')
      .order('created_at', { ascending: false });
    setPedidos((data as Pedido[]) || []);
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
      <p className="text-[10px] tracking-widest uppercase text-amanda-gray animate-pulse">
        Cargando pedidos...
      </p>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl text-amanda-black">Pedidos</h1>
        <p className="text-xs text-amanda-gray mt-1 tracking-wide">{pedidos.length} pedidos en total</p>
      </div>

      <div className="bg-white border border-amanda-lightgray">
        {/* Header */}
        <div className="grid grid-cols-[80px_1fr_120px_180px_160px_200px] gap-4 px-4 py-3 border-b border-amanda-lightgray bg-stone-50">
          {['ID', 'Cliente', 'Total', 'Estado', 'Fecha', 'Cambiar estado'].map(h => (
            <span key={h} className="text-[10px] tracking-widest uppercase text-amanda-gray">{h}</span>
          ))}
        </div>

        {pedidos.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-amanda-gray">Sin pedidos aún.</p>
          </div>
        ) : (
          pedidos.map(p => (
            <div
              key={p.id}
              className="grid grid-cols-[80px_1fr_120px_180px_160px_200px] gap-4 px-4 py-4 border-b border-amanda-lightgray items-center hover:bg-stone-50 transition-colors"
            >
              {/* ID */}
              <span className="text-xs font-medium text-amanda-black">#{p.id}</span>

              {/* Cliente */}
              <span className="text-xs text-amanda-gray truncate">
                {p.usuarios?.email || '—'}
              </span>

              {/* Total */}
              <span className="text-xs font-medium text-amanda-black">{formatMoney(p.total)}</span>

              {/* Estado badge */}
              <div>
                <span className={`text-[10px] tracking-widest uppercase px-2 py-1 border ${estadoBadge[p.estado] || 'border-stone-200 text-stone-500'}`}>
                  {p.estado}
                </span>
                {msg?.id === p.id && (
                  <p className={`text-[10px] mt-1 ${msg.ok ? 'text-green-600' : 'text-red-500'}`}>{msg.texto}</p>
                )}
              </div>

              {/* Fecha */}
              <span className="text-[10px] text-amanda-gray">{formatFecha(p.created_at)}</span>

              {/* Select estado */}
              <select
                value={p.estado}
                disabled={actualizando === p.id}
                onChange={e => handleCambiarEstado(p.id, e.target.value as EstadoPedido)}
                className="border-b border-amanda-lightgray text-xs py-1 bg-transparent focus:outline-none focus:border-amanda-black disabled:opacity-50 cursor-pointer"
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
