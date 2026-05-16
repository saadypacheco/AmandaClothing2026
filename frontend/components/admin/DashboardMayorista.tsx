'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const API = process.env.NEXT_PUBLIC_API_URL;

interface Cobranzas {
  total_pendiente: number;
  total_vencido: number;
  total_proximos_7_dias: number;
}

interface PedidoPendiente {
  id: number;
  total: number;
  metodo_pago: string;
  condicion_pago: string | null;
  comprobante_url: string | null;
  created_at: string;
  usuarios: { email: string; nombre: string | null; razon_social: string | null } | null;
}

interface TopCliente {
  cliente: string;
  pedidos: number;
  total: number;
}

interface VentaMes {
  mes: string;
  pedidos: number;
  total: number;
}

async function authFetch(url: string, options: RequestInit = {}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${session?.access_token ?? ''}` },
  });
}

function formatMoney(n: number) {
  return '$' + (n || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function DashboardMayorista() {
  const [cobranzas, setCobranzas] = useState<Cobranzas | null>(null);
  const [pendientes, setPendientes] = useState<PedidoPendiente[]>([]);
  const [topClientes, setTopClientes] = useState<TopCliente[]>([]);
  const [ventas, setVentas] = useState<VentaMes[]>([]);
  const [stockBajo, setStockBajo] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setLoading(true);
    const hace3meses = new Date();
    hace3meses.setMonth(hace3meses.getMonth() - 3);
    const desde = hace3meses.toISOString().slice(0, 10);
    const hasta = new Date().toISOString().slice(0, 10);

    const [cobranzasRes, pendientesRes, topClientesRes, ventasRes] = await Promise.all([
      authFetch(`${API}/admin/reportes/cobranzas-resumen`),
      authFetch(`${API}/admin/pedidos/pendientes-aprobacion`),
      authFetch(`${API}/admin/reportes/top-clientes?desde=${desde}&hasta=${hasta}&limit=5`),
      authFetch(`${API}/admin/reportes/ventas?desde=${desde}&hasta=${hasta}&group_by=mes`),
    ]);

    if (cobranzasRes.ok) setCobranzas(await cobranzasRes.json());
    if (pendientesRes.ok) setPendientes(await pendientesRes.json());
    if (topClientesRes.ok) {
      const data = await topClientesRes.json();
      setTopClientes(data.rows || []);
    }
    if (ventasRes.ok) {
      const data = await ventasRes.json();
      setVentas(data.rows || []);
    }

    // Stock bajo via supabase directo
    const supabase = createClient();
    const { data: variantesLow } = await supabase
      .from('variantes').select('producto_id').lte('stock', 3);
    const productosUnicos = new Set((variantesLow || []).map(v => v.producto_id));
    setStockBajo(productosUnicos.size);

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-stone-400">Cargando dashboard...</p>
      </div>
    );
  }

  const mesActual = ventas[ventas.length - 1];
  const mesAnterior = ventas[ventas.length - 2];
  const varMes = mesAnterior && mesAnterior.total > 0
    ? ((mesActual.total - mesAnterior.total) / mesAnterior.total) * 100
    : null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
        <p className="text-sm text-stone-400 mt-1 capitalize">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPIs B2B */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Deuda vencida"
          valor={formatMoney(cobranzas?.total_vencido || 0)}
          accent="border-l-rose-400"
          valorColor={(cobranzas?.total_vencido || 0) > 0 ? 'text-rose-600' : 'text-stone-900'}
          subLabel={cobranzas?.total_vencido ? 'Cobranza urgente' : 'Al día'}
          href="/admin/cuentas-corriente"
        />
        <KpiCard
          label="Por vencer 7d"
          valor={formatMoney(cobranzas?.total_proximos_7_dias || 0)}
          accent="border-l-amber-400"
          valorColor="text-amber-600"
          subLabel="Próximos 7 días"
        />
        <KpiCard
          label="Pedidos a aprobar"
          valor={String(pendientes.length)}
          accent={pendientes.length > 0 ? 'border-l-amber-400' : 'border-l-stone-200'}
          valorColor={pendientes.length > 0 ? 'text-amber-600' : 'text-stone-900'}
          href="/admin/pedidos?estado=pendiente_aprobacion"
        />
        <KpiCard
          label="Stock crítico"
          valor={String(stockBajo)}
          accent={stockBajo > 0 ? 'border-l-rose-400' : 'border-l-stone-200'}
          valorColor={stockBajo > 0 ? 'text-rose-600' : 'text-stone-900'}
          href="/admin/productos"
        />
      </div>

      {/* Ventas vs mes anterior */}
      {ventas.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">Ventas últimos 3 meses</h2>
            <Link href="/admin/reportes" className="text-[10px] tracking-widest uppercase text-stone-400 hover:text-stone-900">
              Ver reportes →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {ventas.slice(-3).map((m, idx) => (
              <div key={m.mes} className={`text-center ${idx === ventas.slice(-3).length - 1 ? 'font-semibold' : ''}`}>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest">{m.mes}</p>
                <p className={`text-2xl mt-1 ${idx === ventas.slice(-3).length - 1 ? 'text-stone-900' : 'text-stone-500'}`}>
                  {formatMoney(m.total)}
                </p>
                <p className="text-[10px] text-stone-400 mt-1">{m.pedidos} pedidos</p>
              </div>
            ))}
          </div>
          {varMes !== null && (
            <p className={`text-center mt-3 text-xs ${varMes >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {varMes >= 0 ? '↑' : '↓'} {Math.abs(varMes).toFixed(1)}% vs mes anterior
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos pendientes */}
        <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
            <h2 className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">Pedidos a revisar</h2>
            {pendientes.length > 0 && (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700">
                {pendientes.length}
              </span>
            )}
          </div>
          {pendientes.length === 0 ? (
            <p className="text-sm text-stone-400 px-6 py-8">Sin pedidos a revisar 🎉</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {pendientes.slice(0, 5).map(p => (
                <div key={p.id} className="px-6 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">
                      {p.usuarios?.razon_social || p.usuarios?.nombre || p.usuarios?.email}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      #{p.id} · {p.metodo_pago?.replace('_', ' ')} · {formatFecha(p.created_at)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-stone-900 shrink-0">{formatMoney(p.total)}</p>
                </div>
              ))}
              {pendientes.length > 5 && (
                <Link href="/admin/pedidos?estado=pendiente_aprobacion"
                  className="block text-center py-3 text-[10px] tracking-widest uppercase text-stone-500 hover:text-stone-900">
                  Ver los {pendientes.length} →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Top clientes */}
        <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
            <h2 className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">Top clientes (3 meses)</h2>
          </div>
          {topClientes.length === 0 ? (
            <p className="text-sm text-stone-400 px-6 py-8">Sin ventas registradas.</p>
          ) : (
            <div className="px-6 py-5 space-y-3">
              {topClientes.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-stone-700">
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm text-stone-900 truncate">{c.cliente}</p>
                  <p className="text-xs font-semibold text-stone-900">{formatMoney(c.total)}</p>
                  <p className="text-[10px] text-stone-400">{c.pedidos} p.</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label, valor, accent, valorColor, subLabel, href,
}: {
  label: string; valor: string; accent: string; valorColor: string;
  subLabel?: string; href?: string;
}) {
  const card = (
    <div className={`bg-white rounded-xl shadow-sm border border-stone-100 border-l-4 ${accent} p-5 h-full ${href ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}>
      <p className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-2 ${valorColor}`}>{valor}</p>
      {subLabel && <p className="text-[10px] text-stone-400 mt-1">{subLabel}</p>}
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}
