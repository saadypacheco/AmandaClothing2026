'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useTiendaConfig } from '@/hooks/useTiendaConfig';

const API = process.env.NEXT_PUBLIC_API_URL;

interface CuentaCorriente {
  existe: boolean;
  id?: number;
  limite_credito?: number;
  dias_pago_default?: number;
  saldo_actual?: number;
  activo?: boolean;
}

interface Movimiento {
  id: number;
  tipo: string;
  monto: number;
  descripcion: string | null;
  pedido_id: number | null;
  fecha_vencimiento: string | null;
  fecha_pago: string | null;
  created_at: string;
}

function formatFecha(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function MiCuentaCorrientePage() {
  const router = useRouter();
  const { formatPrice: formatMoney, get } = useTiendaConfig();
  const [cuenta, setCuenta] = useState<CuentaCorriente | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (get('modo', 'minorista') !== 'mayorista') {
      router.replace('/');
      return;
    }
    cargar();
  }, [get, router]);

  async function cargar() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    const headers = { Authorization: `Bearer ${session.access_token}` };
    const [cuentaRes, movRes] = await Promise.all([
      fetch(`${API}/me/cuenta-corriente`, { headers }),
      fetch(`${API}/me/cuenta-corriente/movimientos`, { headers }),
    ]);
    if (cuentaRes.ok) setCuenta(await cuentaRes.json());
    if (movRes.ok) setMovimientos(await movRes.json());
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-stone-400">Cargando cuenta...</p>
        </div>
      </main>
    );
  }

  if (!cuenta?.existe) {
    return (
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-[10px] tracking-widest uppercase text-amanda-gray">Mi cuenta</p>
            <h1 className="text-2xl tracking-wide uppercase text-amanda-black mt-1">Cuenta corriente</h1>
          </div>
          <div className="text-center py-16 border border-stone-200 bg-white">
            <p className="text-sm text-stone-500 mb-4">
              Tu cuenta corriente todavía no fue habilitada.
            </p>
            <p className="text-xs text-stone-400">
              Una vez que un administrador la apruebe vas a poder ver acá tu saldo y movimientos.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const saldo = cuenta.saldo_actual || 0;
  const limite = cuenta.limite_credito || 0;
  const disponible = Math.max(0, limite - saldo);
  const enMora = saldo > limite && limite > 0;

  return (
    <main className="min-h-screen pt-24 pb-16 bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <p className="text-[10px] tracking-widest uppercase text-stone-400">Mi cuenta</p>
          <h1 className="text-2xl tracking-wide uppercase text-stone-900 mt-1">Cuenta corriente</h1>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`bg-white rounded-xl border border-stone-200 p-5 border-l-4 ${enMora ? 'border-l-rose-400' : 'border-l-stone-400'}`}>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">Saldo a pagar</p>
            <p className={`text-2xl font-bold mt-2 ${enMora ? 'text-rose-600' : 'text-stone-900'}`}>
              {formatMoney(saldo)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">Límite de crédito</p>
            <p className="text-2xl font-bold mt-2 text-stone-900">{formatMoney(limite)}</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">Disponible</p>
            <p className="text-2xl font-bold mt-2 text-emerald-700">{formatMoney(disponible)}</p>
          </div>
        </div>

        {/* Movimientos */}
        <h2 className="text-[10px] tracking-widest uppercase text-stone-500 mb-3">Movimientos</h2>
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          {movimientos.length === 0 ? (
            <p className="text-sm text-stone-400 px-6 py-8">Todavía no hay movimientos.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-stone-100">
                <tr>
                  <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Fecha</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Tipo</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Detalle</th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Monto</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Vto.</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m, i) => {
                  const suma = (m.tipo === 'cargo' || m.tipo === 'nota_debito');
                  const signo = suma ? '+' : '-';
                  const color = suma ? 'text-rose-600' : 'text-emerald-600';
                  const vencido = m.fecha_vencimiento && !m.fecha_pago &&
                    m.fecha_vencimiento < new Date().toISOString().slice(0, 10);
                  return (
                    <tr key={m.id} className={`border-t border-stone-100 ${i % 2 === 0 ? 'bg-white' : 'bg-stone-50/40'}`}>
                      <td className="px-4 py-3 text-xs text-stone-500">{formatFecha(m.created_at)}</td>
                      <td className="px-4 py-3 text-xs text-stone-900 capitalize">{m.tipo.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-xs text-stone-600">
                        {m.descripcion || (m.pedido_id ? `Pedido #${m.pedido_id}` : '—')}
                      </td>
                      <td className={`px-4 py-3 text-xs font-semibold text-right ${color}`}>
                        {signo}{formatMoney(m.monto)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {m.fecha_pago ? (
                          <span className="text-emerald-600">Pagado {formatFecha(m.fecha_pago)}</span>
                        ) : m.fecha_vencimiento ? (
                          <span className={vencido ? 'text-rose-600' : 'text-stone-500'}>
                            {vencido ? 'Vencido ' : ''}{formatFecha(m.fecha_vencimiento)}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Link href="/pedidos" className="text-[10px] tracking-widest uppercase text-stone-400 hover:text-stone-900">
            Ver mis pedidos →
          </Link>
          <Link href="/productos" className="text-[10px] tracking-widest uppercase text-stone-400 hover:text-stone-900">
            Seguir comprando →
          </Link>
        </div>
      </div>
    </main>
  );
}
