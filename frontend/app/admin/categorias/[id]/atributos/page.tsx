'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const API = process.env.NEXT_PUBLIC_API_URL;

interface Atributo {
  id: number;
  categoria_id: number;
  clave: string;
  nombre: string;
  tipo: string;
  valores_permitidos: string[] | null;
  obligatorio: boolean;
  orden: number;
}

interface Categoria {
  id: number;
  nombre: string;
}

const TIPOS = [
  { value: 'texto', label: 'Texto libre' },
  { value: 'numero', label: 'Número' },
  { value: 'select', label: 'Selección única' },
  { value: 'multi_select', label: 'Selección múltiple' },
  { value: 'booleano', label: 'Sí/No' },
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

export default function AtributosCategoriaPage() {
  const params = useParams();
  const categoriaId = parseInt(params?.id as string);

  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [atributos, setAtributos] = useState<Atributo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<Atributo | null>(null);
  const [creando, setCreando] = useState(false);

  useEffect(() => { cargar(); }, [categoriaId]);

  async function cargar() {
    setLoading(true);
    const [catRes, attrsRes] = await Promise.all([
      authFetch(`${API}/admin/categorias`),
      authFetch(`${API}/admin/categorias/${categoriaId}/atributos`),
    ]);
    if (catRes.ok) {
      const cats = await catRes.json();
      setCategoria(cats.find((c: Categoria) => c.id === categoriaId) || null);
    }
    if (attrsRes.ok) setAtributos(await attrsRes.json());
    setLoading(false);
  }

  async function eliminar(id: number) {
    if (!confirm('¿Eliminar este atributo? Se borran los valores asignados a variantes.')) return;
    await authFetch(`${API}/admin/atributos/${id}`, { method: 'DELETE' });
    cargar();
  }

  return (
    <div>
      <Link href="/admin/categorias" className="text-[10px] tracking-widest uppercase text-stone-400 hover:text-stone-900">
        ← Volver a categorías
      </Link>
      <div className="mt-2 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Atributos de {categoria?.nombre || 'categoría'}</h1>
          <p className="text-sm text-stone-400 mt-1">
            Definí los atributos que tendrán las variantes de esta categoría (talle, color, sabor, voltaje, etc.)
          </p>
        </div>
        <button onClick={() => setCreando(true)}
          className="bg-stone-900 text-white text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-stone-700 rounded">
          + Nuevo atributo
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-stone-400">Cargando...</p>
      ) : atributos.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <p className="text-sm text-stone-500">
            Esta categoría no tiene atributos definidos. Por defecto se usa talle/color del modelo base.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-100">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Orden</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Nombre</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Clave</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Tipo</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Valores</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500">Obligatorio</th>
                <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-stone-500"></th>
              </tr>
            </thead>
            <tbody>
              {atributos.map((a, i) => (
                <tr key={a.id} className={`border-t border-stone-100 ${i % 2 === 0 ? 'bg-white' : 'bg-stone-50/40'}`}>
                  <td className="px-4 py-3 text-xs text-stone-400">{a.orden}</td>
                  <td className="px-4 py-3 text-xs text-stone-900 font-medium">{a.nombre}</td>
                  <td className="px-4 py-3 text-xs text-stone-500 font-mono">{a.clave}</td>
                  <td className="px-4 py-3 text-xs text-stone-600 capitalize">{a.tipo.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-xs text-stone-500">
                    {a.valores_permitidos?.length ? a.valores_permitidos.join(', ') : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {a.obligatorio ? <span className="text-rose-600">Sí</span> : <span className="text-stone-400">No</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEditando(a)}
                      className="text-[10px] tracking-widest uppercase text-stone-500 hover:text-stone-900 mr-3">
                      Editar
                    </button>
                    <button onClick={() => eliminar(a.id)}
                      className="text-[10px] tracking-widest uppercase text-rose-500 hover:underline">
                      Eliminar
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
          categoriaId={categoriaId}
          atributo={editando}
          onClose={() => { setCreando(false); setEditando(null); }}
          onSaved={() => { setCreando(false); setEditando(null); cargar(); }}
        />
      )}
    </div>
  );
}

function FormModal({ categoriaId, atributo, onClose, onSaved }: {
  categoriaId: number;
  atributo: Atributo | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(atributo?.nombre || '');
  const [clave, setClave] = useState(atributo?.clave || '');
  const [tipo, setTipo] = useState(atributo?.tipo || 'texto');
  const [valoresStr, setValoresStr] = useState((atributo?.valores_permitidos || []).join(', '));
  const [obligatorio, setObligatorio] = useState(atributo?.obligatorio || false);
  const [orden, setOrden] = useState(atributo?.orden || 0);
  const [working, setWorking] = useState(false);

  async function save() {
    setWorking(true);
    const valores = (tipo === 'select' || tipo === 'multi_select')
      ? valoresStr.split(',').map(v => v.trim()).filter(Boolean)
      : null;
    const payload = {
      clave: clave || nombre.toLowerCase().replace(/\s+/g, '_'),
      nombre,
      tipo,
      valores_permitidos: valores,
      obligatorio,
      orden,
    };
    const url = atributo
      ? `${API}/admin/atributos/${atributo.id}`
      : `${API}/admin/categorias/${categoriaId}/atributos`;
    await authFetch(url, {
      method: atributo ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setWorking(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-stone-900">{atributo ? 'Editar atributo' : 'Nuevo atributo'}</h2>
          <button onClick={onClose} className="text-stone-400 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-1">Nombre *</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              className="w-full border border-stone-200 px-3 py-2 text-sm rounded" placeholder="Sabor" />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-1">Clave (slug)</label>
            <input value={clave} onChange={e => setClave(e.target.value)}
              className="w-full border border-stone-200 px-3 py-2 text-sm rounded font-mono" placeholder="sabor (autogenerado)" />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-1">Tipo</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)}
              className="w-full border border-stone-200 px-3 py-2 text-sm rounded">
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {(tipo === 'select' || tipo === 'multi_select') && (
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-1">
                Valores posibles (separados por coma)
              </label>
              <input value={valoresStr} onChange={e => setValoresStr(e.target.value)}
                className="w-full border border-stone-200 px-3 py-2 text-sm rounded"
                placeholder="Vainilla, Chocolate, Frutilla" />
            </div>
          )}
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={obligatorio} onChange={e => setObligatorio(e.target.checked)} />
              Obligatorio
            </label>
            <div className="ml-auto">
              <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-1">Orden</label>
              <input type="number" value={orden} onChange={e => setOrden(parseInt(e.target.value) || 0)}
                className="w-20 border border-stone-200 px-3 py-2 text-sm rounded" />
            </div>
          </div>
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
