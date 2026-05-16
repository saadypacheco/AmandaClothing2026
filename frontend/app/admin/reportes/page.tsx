'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const API = process.env.NEXT_PUBLIC_API_URL;

type Tab = 'ventas' | 'abc' | 'margen' | 'top-clientes';

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

function fechaHaceMeses(meses: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - meses);
  return d.toISOString().slice(0, 10);
}

export default function ReportesPage() {
  const [tab, setTab] = useState<Tab>('ventas');
  const [desde, setDesde] = useState(fechaHaceMeses(3));
  const [hasta, setHasta] = useState(new Date().toISOString().slice(0, 10));
  const [groupBy, setGroupBy] = useState<'mes' | 'cliente' | 'producto'>('mes');
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { cargar(); }, [tab, desde, hasta, groupBy]);

  async function cargar() {
    setLoading(true);
    const params = new URLSearchParams({ desde, hasta });
    if (tab === 'ventas') params.set('group_by', groupBy);
    if (tab === 'top-clientes') params.set('limit', '20');
    const url = `${API}/admin/reportes/${tab}?${params.toString()}`;
    const res = await authFetch(url);
    if (res.ok) {
      const data = await res.json();
      setRows(data.rows || []);
    }
    setLoading(false);
  }

  async function exportar() {
    const params = new URLSearchParams({ desde, hasta, export: 'csv' });
    if (tab === 'ventas') params.set('group_by', groupBy);
    const url = `${API}/admin/reportes/${tab}?${params.toString()}`;
    const res = await authFetch(url);
    if (!res.ok) return;
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${tab}-${desde}-${hasta}.csv`;
    a.click();
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'ventas', label: 'Ventas' },
    { key: 'abc', label: 'ABC' },
    { key: 'margen', label: 'Margen' },
    { key: 'top-clientes', label: 'Top clientes' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">Reportes</h1>
        <p className="text-sm text-stone-400 mt-1">Analytics avanzados — exportá lo que necesites a CSV</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-xs tracking-widest uppercase rounded-full transition-colors ${
              tab === t.key ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-400'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-1">Desde</label>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
            className="border border-stone-200 px-3 py-2 text-sm rounded" />
        </div>
        <div>
          <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-1">Hasta</label>
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
            className="border border-stone-200 px-3 py-2 text-sm rounded" />
        </div>
        {tab === 'ventas' && (
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-1">Agrupar por</label>
            <select value={groupBy} onChange={e => setGroupBy(e.target.value as typeof groupBy)}
              className="border border-stone-200 px-3 py-2 text-sm rounded">
              <option value="mes">Mes</option>
              <option value="cliente">Cliente</option>
              <option value="producto">Producto</option>
            </select>
          </div>
        )}
        <div className="ml-auto">
          <button onClick={exportar}
            className="bg-stone-900 text-white text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-stone-700 rounded">
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <p className="text-sm text-stone-400">Cargando...</p>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <p className="text-sm text-stone-500">No hay datos para el rango seleccionado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <Tabla rows={rows} tab={tab} groupBy={groupBy} />
        </div>
      )}
    </div>
  );
}

function Tabla({ rows, tab, groupBy }: { rows: Record<string, unknown>[]; tab: Tab; groupBy: string }) {
  if (tab === 'ventas') {
    return (
      <table className="w-full text-sm">
        <thead className="bg-stone-100">
          <tr>
            <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 capitalize">{groupBy}</th>
            <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">
              {groupBy === 'producto' ? 'Unidades' : 'Pedidos'}
            </th>
            <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-t border-stone-100 ${i % 2 === 0 ? 'bg-white' : 'bg-stone-50/40'}`}>
              <td className="px-4 py-3 text-xs text-stone-900">{String(r[groupBy] || '—')}</td>
              <td className="px-4 py-3 text-xs text-stone-600 text-right">{String(r.pedidos ?? r.unidades ?? 0)}</td>
              <td className="px-4 py-3 text-xs font-semibold text-stone-900 text-right">{formatMoney(Number(r.total) || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (tab === 'abc') {
    return (
      <table className="w-full text-sm">
        <thead className="bg-stone-100">
          <tr>
            <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">ABC</th>
            <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Producto</th>
            <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Unidades</th>
            <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Total</th>
            <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">% Acum</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-t border-stone-100 ${i % 2 === 0 ? 'bg-white' : 'bg-stone-50/40'}`}>
              <td className="px-4 py-3">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  r.abc === 'A' ? 'bg-emerald-100 text-emerald-700' :
                  r.abc === 'B' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'
                }`}>{String(r.abc)}</span>
              </td>
              <td className="px-4 py-3 text-xs text-stone-900">{String(r.producto)}</td>
              <td className="px-4 py-3 text-xs text-stone-600 text-right">{String(r.unidades)}</td>
              <td className="px-4 py-3 text-xs font-semibold text-stone-900 text-right">{formatMoney(Number(r.total) || 0)}</td>
              <td className="px-4 py-3 text-xs text-stone-600 text-right">{String(r.pct_acum)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (tab === 'margen') {
    return (
      <table className="w-full text-sm">
        <thead className="bg-stone-100">
          <tr>
            <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Producto</th>
            <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Unidades</th>
            <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Ingreso</th>
            <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Costo</th>
            <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Margen</th>
            <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">% Margen</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-t border-stone-100 ${i % 2 === 0 ? 'bg-white' : 'bg-stone-50/40'}`}>
              <td className="px-4 py-3 text-xs text-stone-900">{String(r.producto)}</td>
              <td className="px-4 py-3 text-xs text-stone-600 text-right">{String(r.unidades)}</td>
              <td className="px-4 py-3 text-xs text-stone-600 text-right">{formatMoney(Number(r.ingreso) || 0)}</td>
              <td className="px-4 py-3 text-xs text-stone-400 text-right">{formatMoney(Number(r.costo) || 0)}</td>
              <td className="px-4 py-3 text-xs font-semibold text-emerald-700 text-right">{formatMoney(Number(r.margen) || 0)}</td>
              <td className="px-4 py-3 text-xs text-stone-600 text-right">{String(r.margen_pct)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // top-clientes
  return (
    <table className="w-full text-sm">
      <thead className="bg-stone-100">
        <tr>
          <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">#</th>
          <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Cliente</th>
          <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Pedidos</th>
          <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={`border-t border-stone-100 ${i % 2 === 0 ? 'bg-white' : 'bg-stone-50/40'}`}>
            <td className="px-4 py-3 text-xs text-stone-400">{i + 1}</td>
            <td className="px-4 py-3 text-xs text-stone-900">{String(r.cliente)}</td>
            <td className="px-4 py-3 text-xs text-stone-600 text-right">{String(r.pedidos)}</td>
            <td className="px-4 py-3 text-xs font-semibold text-stone-900 text-right">{formatMoney(Number(r.total) || 0)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
