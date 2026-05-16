'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const API = process.env.NEXT_PUBLIC_API_URL;

interface Cuenta {
  id: string;
  email: string;
  nombre: string | null;
  estado_cuenta: string;
  razon_social: string | null;
  cuit: string | null;
  condicion_iva: string | null;
  lista_precio_id: number | null;
  descuento_general: number | null;
  condicion_pago_default: string | null;
  telefono_contacto: string | null;
  direccion_fiscal: string | null;
  notas_internas: string | null;
  aprobado_en: string | null;
  created_at: string;
}

interface ListaPrecio {
  id: number;
  nombre: string;
}

const ESTADOS = [
  { key: 'pendiente', label: 'Pendientes', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { key: 'activo', label: 'Activas', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { key: 'suspendido', label: 'Suspendidas', color: 'bg-stone-100 text-stone-700 border-stone-200' },
  { key: 'rechazado', label: 'Rechazadas', color: 'bg-rose-100 text-rose-700 border-rose-200' },
];

const CONDICIONES_PAGO = [
  { value: 'contado', label: 'Contado' },
  { value: '15_dias', label: '15 días' },
  { value: '30_dias', label: '30 días' },
  { value: '60_dias', label: '60 días' },
  { value: '90_dias', label: '90 días' },
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

export default function AdminCuentasPage() {
  const [estado, setEstado] = useState('pendiente');
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [listas, setListas] = useState<ListaPrecio[]>([]);
  const [seleccionada, setSeleccionada] = useState<Cuenta | null>(null);

  useEffect(() => {
    cargar();
    cargarListas();
  }, [estado]);

  async function cargar() {
    setLoading(true);
    const res = await authFetch(`${API}/admin/cuentas?estado=${estado}`);
    if (res.ok) setCuentas(await res.json());
    setLoading(false);
  }

  async function cargarListas() {
    const res = await authFetch(`${API}/admin/listas-precio`);
    if (res.ok) setListas(await res.json());
  }

  function formatFecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">Cuentas mayoristas</h1>
        <p className="text-sm text-stone-400 mt-1">Aprobá, suspendé o gestioná cuentas de clientes B2B</p>
      </div>

      {/* Tabs de estado */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ESTADOS.map(e => (
          <button
            key={e.key}
            onClick={() => setEstado(e.key)}
            className={`px-4 py-2 text-xs tracking-widest uppercase rounded-full border transition-colors ${
              estado === e.key ? e.color : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* Listado */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center gap-3 text-sm text-stone-400">
            <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
            Cargando...
          </div>
        ) : cuentas.length === 0 ? (
          <p className="p-8 text-sm text-stone-400">No hay cuentas en este estado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-100">
                <tr>
                  <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">CUIT</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Tel.</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Fecha</th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {cuentas.map((c, i) => (
                  <tr key={c.id} className={`border-t border-stone-100 ${i % 2 === 0 ? 'bg-white' : 'bg-stone-50/40'} hover:bg-stone-50`}>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-stone-900">{c.razon_social || c.nombre || '—'}</p>
                      {c.razon_social && c.nombre && <p className="text-[10px] text-stone-400">{c.nombre}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-600">{c.cuit || '—'}</td>
                    <td className="px-4 py-3 text-xs text-stone-600">{c.email}</td>
                    <td className="px-4 py-3 text-xs text-stone-600">{c.telefono_contacto || '—'}</td>
                    <td className="px-4 py-3 text-xs text-stone-400">{formatFecha(c.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSeleccionada(c)}
                        className="text-xs tracking-widest uppercase text-stone-900 hover:underline"
                      >
                        {estado === 'pendiente' ? 'Revisar' : 'Ver'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {seleccionada && (
        <DetalleModal
          cuenta={seleccionada}
          listas={listas}
          onClose={() => setSeleccionada(null)}
          onRefresh={() => { setSeleccionada(null); cargar(); }}
        />
      )}
    </div>
  );
}

function DetalleModal({
  cuenta, listas, onClose, onRefresh,
}: {
  cuenta: Cuenta;
  listas: ListaPrecio[];
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [listaId, setListaId] = useState<number>(cuenta.lista_precio_id || listas[0]?.id || 0);
  const [condicionPago, setCondicionPago] = useState(cuenta.condicion_pago_default || 'contado');
  const [descuento, setDescuento] = useState<string>(String(cuenta.descuento_general || 0));
  const [limite, setLimite] = useState<string>('0');
  const [diasPago, setDiasPago] = useState<string>('30');
  const [notas, setNotas] = useState(cuenta.notas_internas || '');
  const [working, setWorking] = useState(false);

  async function aprobar() {
    if (!listaId) {
      alert('Tenés que asignar una lista de precios');
      return;
    }
    setWorking(true);
    const res = await authFetch(`${API}/admin/cuentas/${cuenta.id}/aprobar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lista_precio_id: listaId,
        condicion_pago_default: condicionPago,
        descuento_general: parseFloat(descuento) || 0,
        limite_credito: parseFloat(limite) || 0,
        dias_pago_default: parseInt(diasPago) || 30,
        notas_internas: notas || null,
      }),
    });
    setWorking(false);
    if (res.ok) onRefresh();
    else alert('Error al aprobar');
  }

  async function rechazar() {
    if (!confirm('¿Rechazar esta cuenta?')) return;
    setWorking(true);
    const res = await authFetch(`${API}/admin/cuentas/${cuenta.id}/rechazar`, { method: 'POST' });
    setWorking(false);
    if (res.ok) onRefresh();
  }

  async function suspender() {
    if (!confirm('¿Suspender esta cuenta?')) return;
    setWorking(true);
    const res = await authFetch(`${API}/admin/cuentas/${cuenta.id}/suspender`, { method: 'POST' });
    setWorking(false);
    if (res.ok) onRefresh();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">{cuenta.razon_social || cuenta.nombre}</h2>
            <p className="text-xs text-stone-500 mt-0.5">{cuenta.email}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-900 text-xl">×</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Datos fiscales */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="CUIT" value={cuenta.cuit} />
            <Info label="Condición IVA" value={cuenta.condicion_iva} />
            <Info label="Teléfono" value={cuenta.telefono_contacto} />
            <Info label="Dirección" value={cuenta.direccion_fiscal} />
          </div>

          {/* Configuración (solo si pendiente o activa) */}
          {(cuenta.estado_cuenta === 'pendiente' || cuenta.estado_cuenta === 'activo') && (
            <div className="border-t border-stone-100 pt-5">
              <p className="text-[10px] tracking-widest uppercase text-stone-500 mb-3">Configuración comercial</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-1">Lista de precios *</label>
                  <select
                    value={listaId}
                    onChange={e => setListaId(parseInt(e.target.value))}
                    className="w-full border border-stone-200 px-3 py-2 text-xs rounded"
                  >
                    <option value={0}>-- Elegir --</option>
                    {listas.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-1">Condición de pago</label>
                  <select
                    value={condicionPago}
                    onChange={e => setCondicionPago(e.target.value)}
                    className="w-full border border-stone-200 px-3 py-2 text-xs rounded"
                  >
                    {CONDICIONES_PAGO.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-1">Descuento general (%)</label>
                  <input type="number" value={descuento} onChange={e => setDescuento(e.target.value)}
                    className="w-full border border-stone-200 px-3 py-2 text-xs rounded" />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-1">Límite de crédito</label>
                  <input type="number" value={limite} onChange={e => setLimite(e.target.value)}
                    className="w-full border border-stone-200 px-3 py-2 text-xs rounded" />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-1">Días pago default</label>
                  <input type="number" value={diasPago} onChange={e => setDiasPago(e.target.value)}
                    className="w-full border border-stone-200 px-3 py-2 text-xs rounded" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-1">Notas internas</label>
                <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
                  className="w-full border border-stone-200 px-3 py-2 text-xs rounded" />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2 bg-stone-50">
          {cuenta.estado_cuenta === 'pendiente' && (
            <>
              <button onClick={rechazar} disabled={working}
                className="text-xs tracking-widest uppercase px-4 py-2 text-rose-600 hover:bg-rose-50 rounded disabled:opacity-50">
                Rechazar
              </button>
              <button onClick={aprobar} disabled={working}
                className="text-xs tracking-widest uppercase px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded disabled:opacity-50">
                {working ? 'Aprobando...' : 'Aprobar cuenta'}
              </button>
            </>
          )}
          {cuenta.estado_cuenta === 'activo' && (
            <>
              <button onClick={suspender} disabled={working}
                className="text-xs tracking-widest uppercase px-4 py-2 text-amber-600 hover:bg-amber-50 rounded disabled:opacity-50">
                Suspender
              </button>
              <button onClick={aprobar} disabled={working}
                className="text-xs tracking-widest uppercase px-5 py-2 bg-stone-900 text-white hover:bg-stone-700 rounded disabled:opacity-50">
                Guardar cambios
              </button>
            </>
          )}
          {(cuenta.estado_cuenta === 'rechazado' || cuenta.estado_cuenta === 'suspendido') && (
            <button onClick={aprobar} disabled={working}
              className="text-xs tracking-widest uppercase px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded disabled:opacity-50">
              Reactivar / Aprobar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[10px] tracking-widest uppercase text-stone-400">{label}</p>
      <p className="text-xs text-stone-800 mt-0.5">{value || '—'}</p>
    </div>
  );
}
