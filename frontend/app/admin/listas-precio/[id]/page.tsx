'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const API = process.env.NEXT_PUBLIC_API_URL;

interface PrecioRow {
  id: number;
  producto_id: number | null;
  variante_id: number | null;
  precio: number;
  descuento_pct: number;
  productos: { nombre: string; precio: number } | null;
  variantes: { talla: string; color: string; sku: string } | null;
}

interface Variante {
  id: number;
  producto_id: number;
  talla: string;
  color: string;
  sku: string;
  productos?: { nombre: string };
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

export default function PreciosListaPage() {
  const params = useParams();
  const listaId = parseInt(params?.id as string);

  const [precios, setPrecios] = useState<PrecioRow[]>([]);
  const [variantes, setVariantes] = useState<Variante[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAgregar, setShowAgregar] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { cargar(); }, [listaId]);

  async function cargar() {
    setLoading(true);
    const [preciosRes, variantesRes] = await Promise.all([
      authFetch(`${API}/admin/listas-precio/${listaId}/precios`),
      authFetch(`${API}/admin/productos`),
    ]);
    if (preciosRes.ok) setPrecios(await preciosRes.json());
    if (variantesRes.ok) {
      const productos = await variantesRes.json();
      // Para cada producto, obtener sus variantes
      const allVariantes: Variante[] = [];
      for (const p of productos) {
        const vRes = await authFetch(`${API}/admin/productos/${p.id}/variantes`);
        if (vRes.ok) {
          const vs = await vRes.json();
          vs.forEach((v: Variante) => allVariantes.push({ ...v, productos: { nombre: p.nombre } }));
        }
      }
      setVariantes(allVariantes);
    }
    setLoading(false);
  }

  async function eliminarPrecio(id: number) {
    if (!confirm('¿Eliminar este precio de la lista?')) return;
    await authFetch(`${API}/admin/listas-precio/${listaId}/precios/${id}`, { method: 'DELETE' });
    cargar();
  }

  async function importarCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    const fd = new FormData();
    fd.append('file', file);
    const res = await authFetch(`${API}/admin/listas-precio/${listaId}/precios/import-csv`, {
      method: 'POST',
      body: fd,
    });
    if (res.ok) {
      const data = await res.json();
      setImportResult(`Importados: ${data.insertados}. Fallidos: ${data.fallidos}.`);
      cargar();
    } else {
      setImportResult('Error al importar CSV');
    }
    setImporting(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/listas-precio" className="text-[10px] tracking-widest uppercase text-stone-400 hover:text-stone-900">
          ← Volver a listas
        </Link>
        <h1 className="text-2xl font-semibold text-stone-900 mt-2">Precios de la lista</h1>
        <p className="text-sm text-stone-400 mt-1">{precios.length} precios cargados</p>
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setShowAgregar(true)}
          className="bg-stone-900 text-white text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-stone-700 rounded">
          + Agregar precio
        </button>
        <label className="bg-white border border-stone-300 text-stone-900 text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-stone-50 rounded cursor-pointer">
          {importing ? 'Importando...' : 'Importar CSV'}
          <input ref={fileRef} type="file" accept=".csv" onChange={importarCSV} className="hidden" disabled={importing} />
        </label>
        <a href="data:text/csv;charset=utf-8,sku,precio,descuento_pct%0AABC-001,1200,0%0AABC-002,1500,10"
          download="ejemplo-precios.csv"
          className="text-xs tracking-widest uppercase text-stone-500 hover:text-stone-900 px-3 py-2.5">
          ↓ Ejemplo CSV
        </a>
        {importResult && (
          <span className="text-xs text-stone-700 self-center px-3">{importResult}</span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-stone-400">Cargando...</p>
      ) : precios.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <p className="text-sm text-stone-500">Esta lista no tiene precios cargados todavía.</p>
          <p className="text-xs text-stone-400 mt-2">Las variantes sin precio especifico usarán el precio publico de la tienda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-100">
                <tr>
                  <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Producto</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Variante</th>
                  <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">SKU</th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Precio pub.</th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Precio lista</th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Dto %</th>
                  <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {precios.map((p, i) => (
                  <tr key={p.id} className={`border-t border-stone-100 ${i % 2 === 0 ? 'bg-white' : 'bg-stone-50/40'}`}>
                    <td className="px-4 py-3 text-xs text-stone-900">{p.productos?.nombre || '—'}</td>
                    <td className="px-4 py-3 text-xs text-stone-600">
                      {p.variantes ? `${p.variantes.talla} / ${p.variantes.color}` : 'Producto general'}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-400 font-mono">{p.variantes?.sku || '—'}</td>
                    <td className="px-4 py-3 text-xs text-stone-400 text-right">
                      ${(p.productos?.precio || 0).toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-stone-900 text-right">
                      ${p.precio.toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-600 text-right">
                      {p.descuento_pct > 0 ? `${p.descuento_pct}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => eliminarPrecio(p.id)}
                        className="text-[10px] tracking-widest uppercase text-rose-500 hover:underline">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAgregar && (
        <AgregarPrecioModal
          listaId={listaId}
          variantes={variantes}
          onClose={() => setShowAgregar(false)}
          onSaved={() => { setShowAgregar(false); cargar(); }}
        />
      )}
    </div>
  );
}

function AgregarPrecioModal({ listaId, variantes, onClose, onSaved }: {
  listaId: number;
  variantes: Variante[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [varianteId, setVarianteId] = useState<number>(variantes[0]?.id || 0);
  const [precio, setPrecio] = useState('');
  const [descuento, setDescuento] = useState('0');
  const [working, setWorking] = useState(false);

  async function save() {
    if (!precio || !varianteId) return;
    const variante = variantes.find(v => v.id === varianteId);
    if (!variante) return;
    setWorking(true);
    await authFetch(`${API}/admin/listas-precio/${listaId}/precios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lista_id: listaId,
        items: [{
          producto_id: variante.producto_id,
          variante_id: variante.id,
          precio: parseFloat(precio),
          descuento_pct: parseFloat(descuento) || 0,
        }],
      }),
    });
    setWorking(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-stone-900">Agregar precio</h2>
          <button onClick={onClose} className="text-stone-400 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-1">Variante *</label>
            <select value={varianteId} onChange={e => setVarianteId(parseInt(e.target.value))}
              className="w-full border border-stone-200 px-3 py-2 text-xs rounded">
              <option value={0}>-- Elegir variante --</option>
              {variantes.map(v => (
                <option key={v.id} value={v.id}>
                  {v.productos?.nombre} — {v.talla}/{v.color} ({v.sku})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-1">Precio *</label>
            <input type="number" value={precio} onChange={e => setPrecio(e.target.value)}
              className="w-full border border-stone-200 px-3 py-2 text-sm rounded" placeholder="1200" />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-1">Descuento adicional (%)</label>
            <input type="number" value={descuento} onChange={e => setDescuento(e.target.value)}
              className="w-full border border-stone-200 px-3 py-2 text-sm rounded" placeholder="0" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2 bg-stone-50">
          <button onClick={onClose} className="text-xs tracking-widest uppercase text-stone-500 px-4 py-2">Cancelar</button>
          <button onClick={save} disabled={working || !precio || !varianteId}
            className="bg-stone-900 text-white text-xs tracking-widest uppercase px-5 py-2 rounded disabled:opacity-40">
            {working ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
