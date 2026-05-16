'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const API = process.env.NEXT_PUBLIC_API_URL;

interface CuentaDetalle {
  id: number;
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
    condicion_iva: string | null;
    telefono_contacto: string | null;
    direccion_fiscal: string | null;
    condicion_pago_default: string | null;
  } | null;
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

const TIPOS = [
  { value: 'pago', label: 'Pago' },
  { value: 'cargo', label: 'Cargo' },
  { value: 'nota_credito', label: 'Nota de crédito' },
  { value: 'nota_debito', label: 'Nota de débito' },
];

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

function formatFecha(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function CuentaDetallePage() {
  const params = useParams();
  const cuentaId = parseInt(params?.id as string);

  const [cuenta, setCuenta] = useState<CuentaDetalle | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAgregar, setShowAgregar] = useState(false);

  useEffect(() => { cargar(); }, [cuentaId]);

  async function cargar() {
    setLoading(true);
    const [cuentaRes, movRes] = await Promise.all([
      authFetch(`${API}/admin/cuentas-corriente/${cuentaId}`),
      authFetch(`${API}/admin/cuentas-corriente/${cuentaId}/movimientos`),
    ]);
    if (cuentaRes.ok) setCuenta(await cuentaRes.json());
    if (movRes.ok) setMovimientos(await movRes.json());
    setLoading(false);
  }

  async function anular(id: number) {
    if (!confirm('¿Anular este movimiento?')) return;
    await authFetch(`${API}/admin/movimientos-cc/${id}`, { method: 'DELETE' });
    cargar();
  }

  if (loading) return <p className="text-sm text-stone-400">Cargando...</p>;
  if (!cuenta) return <p className="text-sm text-stone-400">Cuenta no encontrada.</p>;

  return (
    <div>
      <Link href="/admin/cuentas-corriente" className="text-[10px] tracking-widest uppercase text-stone-400 hover:text-stone-900">
        ← Volver a cuentas
      </Link>
      <h1 className="text-2xl font-semibold text-stone-900 mt-2 mb-6">
        {cuenta.usuarios?.razon_social || cuenta.usuarios?.nombre || cuenta.usuarios?.email}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-stone-200 p-5 border-l-4 border-l-stone-400">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Saldo actual</p>
          <p className={`text-2xl font-bold mt-2 ${cuenta.saldo_actual > cuenta.limite_credito ? 'text-rose-600' : 'text-stone-900'}`}>
            {formatMoney(cuenta.saldo_actual)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Límite de crédito</p>
          <p className="text-2xl font-bold mt-2 text-stone-900">{formatMoney(cuenta.limite_credito)}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Disponible</p>
          <p className="text-2xl font-bold mt-2 text-emerald-700">
            {formatMoney(Math.max(0, (cuenta.limite_credito || 0) - (cuenta.saldo_actual || 0)))}
          </p>
        </div>
      </div>

      {/* Datos del cliente */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 mb-6">
        <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-3">Datos del cliente</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Info label="CUIT" value={cuenta.usuarios?.cuit} />
          <Info label="Cond. IVA" value={cuenta.usuarios?.condicion_iva} />
          <Info label="Tel" value={cuenta.usuarios?.telefono_contacto} />
          <Info label="Cond. pago" value={cuenta.usuarios?.condicion_pago_default} />
        </div>
      </div>

      {/* Movimientos */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium text-stone-900">Movimientos</h2>
        <button onClick={() => setShowAgregar(true)}
          className="bg-stone-900 text-white text-xs tracking-widest uppercase px-4 py-2 hover:bg-stone-700 rounded">
          + Registrar movimiento
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-100">
            <tr>
              <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Fecha</th>
              <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Tipo</th>
              <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Descripción</th>
              <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Monto</th>
              <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Vto.</th>
              <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Pagado</th>
              <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500"></th>
            </tr>
          </thead>
          <tbody>
            {movimientos.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-sm text-stone-400">Sin movimientos.</td></tr>
            ) : movimientos.map((m, i) => {
              const signo = (m.tipo === 'cargo' || m.tipo === 'nota_debito') ? '+' : '-';
              const color = signo === '+' ? 'text-rose-600' : 'text-emerald-600';
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
                  <td className="px-4 py-3 text-xs text-stone-500">{formatFecha(m.fecha_vencimiento)}</td>
                  <td className="px-4 py-3 text-xs text-stone-500">{formatFecha(m.fecha_pago)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => anular(m.id)}
                      className="text-[10px] tracking-widest uppercase text-rose-500 hover:underline">
                      Anular
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAgregar && (
        <AgregarMovModal cuentaId={cuentaId}
          onClose={() => setShowAgregar(false)}
          onSaved={() => { setShowAgregar(false); cargar(); }}
        />
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[10px] tracking-widest uppercase text-stone-400">{label}</p>
      <p className="text-xs text-stone-800 mt-0.5">{value || '—'}</p>
    </div>
  );
}

function AgregarMovModal({ cuentaId, onClose, onSaved }: {
  cuentaId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [tipo, setTipo] = useState('pago');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().slice(0, 10));
  const [working, setWorking] = useState(false);

  async function save() {
    if (!monto) return;
    setWorking(true);
    await authFetch(`${API}/admin/cuentas-corriente/${cuentaId}/movimientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cuenta_id: cuentaId,
        tipo,
        monto: parseFloat(monto),
        descripcion: descripcion || null,
        fecha_pago: (tipo === 'pago') ? fechaPago : null,
      }),
    });
    setWorking(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-stone-900">Registrar movimiento</h2>
          <button onClick={onClose} className="text-stone-400 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-1">Tipo *</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)}
              className="w-full border border-stone-200 px-3 py-2 text-sm rounded">
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-1">Monto *</label>
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)}
              className="w-full border border-stone-200 px-3 py-2 text-sm rounded" placeholder="0" />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-1">Descripción</label>
            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)}
              className="w-full border border-stone-200 px-3 py-2 text-sm rounded" placeholder="Transferencia recibida..." />
          </div>
          {tipo === 'pago' && (
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-1">Fecha de pago</label>
              <input type="date" value={fechaPago} onChange={e => setFechaPago(e.target.value)}
                className="w-full border border-stone-200 px-3 py-2 text-sm rounded" />
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2 bg-stone-50">
          <button onClick={onClose} className="text-xs tracking-widest uppercase text-stone-500 px-4 py-2">Cancelar</button>
          <button onClick={save} disabled={working || !monto}
            className="bg-stone-900 text-white text-xs tracking-widest uppercase px-5 py-2 rounded disabled:opacity-40">
            {working ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
