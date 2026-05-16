'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTiendaConfig } from '@/hooks/useTiendaConfig';

const API = process.env.NEXT_PUBLIC_API_URL;

interface Pedido {
  id: number;
  total: number;
  estado: string;
  tipo: string | null;
  metodo_pago: string | null;
  condicion_pago: string | null;
  vencimiento: string | null;
  comprobante_url: string | null;
  remito_numero: string | null;
  factura_numero: string | null;
  nota_interna: string | null;
  aprobado_en: string | null;
  created_at: string;
  usuario_id: string | null;
  usuarios: {
    email: string;
    nombre: string | null;
    razon_social: string | null;
    tipo_cuenta: string | null;
  } | null;
}

const ESTADOS_MINORISTA = ['pendiente', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado'];
const ESTADOS_MAYORISTA = [
  'borrador', 'cotizado', 'pendiente_aprobacion', 'aprobado',
  'preparacion', 'despacho', 'entregado', 'facturado', 'cancelado',
];

const estadoBadge: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  pendiente_aprobacion: 'bg-amber-100 text-amber-800',
  cotizado: 'bg-violet-100 text-violet-700',
  borrador: 'bg-stone-100 text-stone-700',
  aprobado: 'bg-blue-100 text-blue-700',
  pagado: 'bg-blue-100 text-blue-700',
  preparacion: 'bg-orange-100 text-orange-700',
  preparando: 'bg-orange-100 text-orange-700',
  despacho: 'bg-cyan-100 text-cyan-700',
  enviado: 'bg-cyan-100 text-cyan-700',
  entregado: 'bg-emerald-100 text-emerald-700',
  facturado: 'bg-emerald-100 text-emerald-800',
  cancelado: 'bg-rose-100 text-rose-700',
};

async function authFetch(url: string, options: RequestInit = {}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    },
  });
}

function formatMoney(n: number) {
  return '$' + (n || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function PedidosPage() {
  const { get } = useTiendaConfig();
  const modo = get('modo', 'minorista');
  const esMayorista = modo === 'mayorista';

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>(esMayorista ? 'mayorista' : 'todos');
  const [actualizando, setActualizando] = useState<number | null>(null);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtroEstado !== 'todos') params.set('estado', filtroEstado);
    if (filtroTipo !== 'todos') params.set('tipo', filtroTipo);
    const url = `${API}/admin/pedidos${params.toString() ? '?' + params.toString() : ''}`;
    const res = await authFetch(url);
    if (res.ok) setPedidos(await res.json());
    setLoading(false);
  }

  useEffect(() => { cargar(); }, [filtroEstado, filtroTipo]);

  async function cambiarEstado(pedidoId: number, nuevoEstado: string) {
    setActualizando(pedidoId);
    const res = await authFetch(`${API}/admin/pedidos/${pedidoId}/cambiar-estado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    if (res.ok) {
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p));
    }
    setActualizando(null);
  }

  const pendientesCount = pedidos.filter(p => p.estado === 'pendiente_aprobacion' || p.estado === 'pendiente').length;
  const estados = esMayorista ? ESTADOS_MAYORISTA : ESTADOS_MINORISTA;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Pedidos</h1>
        {pendientesCount > 0 && (
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-50 text-amber-700">
            {pendientesCount} a revisar
          </span>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <button
          onClick={() => setFiltroEstado('todos')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            filtroEstado === 'todos'
              ? 'bg-stone-900 text-white'
              : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-400'
          }`}
        >
          Todos
        </button>
        {estados.map(e => (
          <button
            key={e}
            onClick={() => setFiltroEstado(e)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
              filtroEstado === e
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-400'
            }`}
          >
            {e.replace('_', ' ')}
          </button>
        ))}
        {esMayorista && (
          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            className="ml-auto border border-stone-200 rounded-full px-3 py-1.5 text-xs bg-white"
          >
            <option value="todos">Todos los tipos</option>
            <option value="minorista">Minorista</option>
            <option value="mayorista">Mayorista</option>
          </select>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-stone-400">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-stone-100">
                <tr>
                  <th className="text-left px-3 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">#</th>
                  <th className="text-left px-3 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Cliente</th>
                  <th className="text-left px-3 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Tipo</th>
                  <th className="text-left px-3 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Método</th>
                  <th className="text-right px-3 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Total</th>
                  <th className="text-left px-3 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Estado</th>
                  <th className="text-left px-3 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Vto.</th>
                  <th className="text-left px-3 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Fecha</th>
                  <th className="text-right px-3 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 ? (
                  <tr><td colSpan={9} className="p-8 text-center text-sm text-stone-400">Sin pedidos.</td></tr>
                ) : pedidos.map((p, i) => (
                  <tr key={p.id} className={`border-t border-stone-100 ${i % 2 === 0 ? 'bg-white' : 'bg-stone-50/40'} hover:bg-stone-50`}>
                    <td className="px-3 py-3 text-xs font-medium text-stone-700">#{p.id}</td>
                    <td className="px-3 py-3 text-xs text-stone-700">
                      {p.usuarios?.razon_social || p.usuarios?.nombre || p.usuarios?.email || '—'}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${
                        p.tipo === 'mayorista' ? 'bg-blue-50 text-blue-700' : 'bg-stone-100 text-stone-500'
                      }`}>
                        {p.tipo || 'minorista'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[11px] text-stone-500 capitalize">
                      {p.metodo_pago?.replace('_', ' ') || '—'}
                    </td>
                    <td className="px-3 py-3 text-xs font-semibold text-stone-900 text-right">{formatMoney(p.total)}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium ${estadoBadge[p.estado] || 'bg-stone-100 text-stone-500'} capitalize`}>
                        {p.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[11px] text-stone-500">
                      {p.vencimiento ? formatFecha(p.vencimiento) : '—'}
                    </td>
                    <td className="px-3 py-3 text-[11px] text-stone-400">{formatFecha(p.created_at)}</td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {p.estado === 'pendiente_aprobacion' && (
                          <button
                            onClick={() => cambiarEstado(p.id, 'aprobado')}
                            disabled={actualizando === p.id}
                            className="text-[10px] tracking-widest uppercase bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Aprobar
                          </button>
                        )}
                        <select
                          value={p.estado}
                          disabled={actualizando === p.id}
                          onChange={e => cambiarEstado(p.id, e.target.value)}
                          className="border border-stone-200 rounded px-2 py-1 text-[11px] bg-white"
                        >
                          {estados.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                        </select>
                      </div>
                      {p.comprobante_url && (
                        <a href={p.comprobante_url} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] text-blue-600 hover:underline mt-1 block">
                          Ver comprobante ↗
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
