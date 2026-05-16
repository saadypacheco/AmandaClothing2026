'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const API = process.env.NEXT_PUBLIC_API_URL;

interface ListaPrecio {
  id: number;
  nombre: string;
  descripcion: string | null;
  es_default: boolean;
  activo: boolean;
  created_at: string;
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

export default function ListasPrecioPage() {
  const [listas, setListas] = useState<ListaPrecio[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<ListaPrecio | null>(null);
  const [creando, setCreando] = useState(false);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setLoading(true);
    const res = await authFetch(`${API}/admin/listas-precio`);
    if (res.ok) setListas(await res.json());
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Listas de precios</h1>
          <p className="text-sm text-stone-400 mt-1">{listas.length} listas configuradas</p>
        </div>
        <button onClick={() => setCreando(true)}
          className="bg-stone-900 text-white text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-stone-700 rounded">
          + Nueva lista
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-stone-400">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-100">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Descripción</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Default</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Estado</th>
                <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listas.map((l, i) => (
                <tr key={l.id} className={`border-t border-stone-100 ${i % 2 === 0 ? 'bg-white' : 'bg-stone-50/40'}`}>
                  <td className="px-4 py-3 text-xs font-medium text-stone-900">{l.nombre}</td>
                  <td className="px-4 py-3 text-xs text-stone-500">{l.descripcion || '—'}</td>
                  <td className="px-4 py-3">
                    {l.es_default && <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700">Default</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${l.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                      {l.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/listas-precio/${l.id}`}
                      className="text-xs tracking-widest uppercase text-stone-900 hover:underline mr-3">
                      Precios
                    </Link>
                    <button onClick={() => setEditando(l)}
                      className="text-xs tracking-widest uppercase text-stone-500 hover:text-stone-900">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(creando || editando) && (
        <FormModal
          lista={editando}
          onClose={() => { setCreando(false); setEditando(null); }}
          onSaved={() => { setCreando(false); setEditando(null); cargar(); }}
        />
      )}
    </div>
  );
}

function FormModal({ lista, onClose, onSaved }: {
  lista: ListaPrecio | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(lista?.nombre || '');
  const [descripcion, setDescripcion] = useState(lista?.descripcion || '');
  const [esDefault, setEsDefault] = useState(lista?.es_default || false);
  const [activo, setActivo] = useState(lista?.activo ?? true);
  const [working, setWorking] = useState(false);

  async function save() {
    setWorking(true);
    const url = lista ? `${API}/admin/listas-precio/${lista.id}` : `${API}/admin/listas-precio`;
    const method = lista ? 'PATCH' : 'POST';
    const res = await authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion: descripcion || null, es_default: esDefault, activo }),
    });
    setWorking(false);
    if (res.ok) onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-stone-900">{lista ? 'Editar lista' : 'Nueva lista'}</h2>
          <button onClick={onClose} className="text-stone-400 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-1">Nombre *</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              className="w-full border border-stone-200 px-3 py-2 text-sm rounded" placeholder="Mayorista A" />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-1">Descripción</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
              rows={2} className="w-full border border-stone-200 px-3 py-2 text-sm rounded"
              placeholder="Clientes con compra > $500k/mes" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={esDefault} onChange={e => setEsDefault(e.target.checked)} />
            Es la lista por defecto al aprobar cuentas
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} />
            Activa
          </label>
        </div>
        <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2 bg-stone-50">
          <button onClick={onClose} className="text-xs tracking-widest uppercase text-stone-500 px-4 py-2">Cancelar</button>
          <button onClick={save} disabled={working || !nombre}
            className="bg-stone-900 text-white text-xs tracking-widest uppercase px-5 py-2 rounded disabled:opacity-40">
            {working ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
