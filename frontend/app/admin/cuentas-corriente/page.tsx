'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const API = process.env.NEXT_PUBLIC_API_URL;

interface Cuenta {
  id: number;
  usuario_id: string;
  limite_credito: number;
  saldo_actual: number;
  dias_pago_default: number;
  activo: boolean;
  usuarios: {
    id: string;
    email: string;
    nombre: string | null;
    razon_social: string | null;
    cuit: string | null;
    tipo_cuenta: string | null;
  } | null;
}

interface Cargo {
  id: number;
  cuenta_id: number;
  monto: number;
  descripcion: string | null;
  fecha_vencimiento: string;
  pedido_id: number | null;
  cuentas_corriente: {
    usuarios: {
      id: string;
      email: string;
      nombre: string | null;
      razon_social: string | null;
    } | null;
  } | null;
}

interface Cobranzas {
  vencidos: Cargo[];
  por_vencer: Cargo[];
  total_vencido: number;
  total_por_vencer: number;
}

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

export default function CuentasCorrientePage() {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [cobranzas, setCobranzas] = useState<Cobranzas | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'cuentas' | 'cobranzas'>('cobranzas');

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setLoading(true);
    const [cuentasRes, cobranzasRes] = await Promise.all([
      authFetch(`${API}/admin/cuentas-corriente`),
      authFetch(`${API}/admin/cuentas-corriente/cobranzas`),
    ]);
    if (cuentasRes.ok) setCuentas(await cuentasRes.json());
    if (cobranzasRes.ok) setCobranzas(await cobranzasRes.json());
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">Cuenta corriente</h1>
        <p className="text-sm text-stone-400 mt-1">Saldos, cobranzas y movimientos</p>
      </div>

      {/* KPIs cobranzas */}
      {cobranzas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <KpiCard label="Deuda vencida" valor={formatMoney(cobranzas.total_vencido)}
            colorClass="border-l-rose-400" valorColor="text-rose-600" />
          <KpiCard label="Por vencer" valor={formatMoney(cobranzas.total_por_vencer)}
            colorClass="border-l-amber-400" valorColor="text-amber-600" />
          <KpiCard label="Total a cobrar" valor={formatMoney((cobranzas.total_vencido || 0) + (cobranzas.total_por_vencer || 0))}
            colorClass="border-l-stone-400" valorColor="text-stone-900" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('cobranzas')}
          className={`px-4 py-2 text-xs tracking-widest uppercase rounded-full ${
            tab === 'cobranzas' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-500'
          }`}>
          Cobranzas pendientes
        </button>
        <button onClick={() => setTab('cuentas')}
          className={`px-4 py-2 text-xs tracking-widest uppercase rounded-full ${
            tab === 'cuentas' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-500'
          }`}>
          Todas las cuentas
        </button>
      </div>

      {loading ? <p className="text-sm text-stone-400">Cargando...</p> : (
        tab === 'cobranzas' ? (
          <CobranzasTabla cobranzas={cobranzas} />
        ) : (
          <CuentasTabla cuentas={cuentas} />
        )
      )}
    </div>
  );
}

function KpiCard({ label, valor, colorClass, valorColor }: {
  label: string; valor: string; colorClass: string; valorColor: string;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-stone-100 border-l-4 ${colorClass} p-5`}>
      <p className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-2 ${valorColor}`}>{valor}</p>
    </div>
  );
}

function CobranzasTabla({ cobranzas }: { cobranzas: Cobranzas | null }) {
  if (!cobranzas) return null;
  const todos = [
    ...cobranzas.vencidos.map(c => ({ ...c, _vencido: true })),
    ...cobranzas.por_vencer.map(c => ({ ...c, _vencido: false })),
  ];

  if (todos.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
        <p className="text-sm text-stone-500">No hay deuda pendiente.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-stone-100">
          <tr>
            <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Cliente</th>
            <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Descripción</th>
            <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Vencimiento</th>
            <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Monto</th>
            <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Estado</th>
            <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500"></th>
          </tr>
        </thead>
        <tbody>
          {todos.map((c, i) => {
            const cliente = c.cuentas_corriente?.usuarios;
            return (
              <tr key={c.id} className={`border-t border-stone-100 ${i % 2 === 0 ? 'bg-white' : 'bg-stone-50/40'}`}>
                <td className="px-4 py-3 text-xs text-stone-900">
                  {cliente?.razon_social || cliente?.nombre || cliente?.email || '—'}
                </td>
                <td className="px-4 py-3 text-xs text-stone-600">{c.descripcion || '—'}</td>
                <td className="px-4 py-3 text-xs text-stone-600">{formatFecha(c.fecha_vencimiento)}</td>
                <td className="px-4 py-3 text-xs font-semibold text-stone-900 text-right">{formatMoney(c.monto)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${
                    c._vencido ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {c._vencido ? 'Vencido' : 'Por vencer'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/cuentas-corriente/${c.cuenta_id}`}
                    className="text-[10px] tracking-widest uppercase text-stone-900 hover:underline">
                    Ver cuenta
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CuentasTabla({ cuentas }: { cuentas: Cuenta[] }) {
  if (cuentas.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
        <p className="text-sm text-stone-500">No hay cuentas activas todavía.</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-stone-100">
          <tr>
            <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Cliente</th>
            <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">CUIT</th>
            <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Saldo</th>
            <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Límite</th>
            <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Días pago</th>
            <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500"></th>
          </tr>
        </thead>
        <tbody>
          {cuentas.map((c, i) => {
            const saldoPct = c.limite_credito > 0 ? (c.saldo_actual / c.limite_credito) * 100 : 0;
            const saldoColor = saldoPct >= 100 ? 'text-rose-600' : saldoPct >= 80 ? 'text-amber-600' : 'text-stone-900';
            return (
              <tr key={c.id} className={`border-t border-stone-100 ${i % 2 === 0 ? 'bg-white' : 'bg-stone-50/40'}`}>
                <td className="px-4 py-3 text-xs text-stone-900">
                  {c.usuarios?.razon_social || c.usuarios?.nombre || c.usuarios?.email || '—'}
                </td>
                <td className="px-4 py-3 text-xs text-stone-500">{c.usuarios?.cuit || '—'}</td>
                <td className={`px-4 py-3 text-xs font-semibold text-right ${saldoColor}`}>{formatMoney(c.saldo_actual)}</td>
                <td className="px-4 py-3 text-xs text-stone-500 text-right">{formatMoney(c.limite_credito)}</td>
                <td className="px-4 py-3 text-xs text-stone-500 text-right">{c.dias_pago_default} d.</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/cuentas-corriente/${c.id}`}
                    className="text-[10px] tracking-widest uppercase text-stone-900 hover:underline">
                    Detalle
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
