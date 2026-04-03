'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Categoria {
  id: number;
  nombre: string;
  slug: string;
}

const API = process.env.NEXT_PUBLIC_API_URL;

async function authFetch(url: string, options: RequestInit = {}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';
  return fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
  });
}

function generarSlug(nombre: string) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function ModalCategoria({
  categoria,
  onGuardada,
  onClose,
}: {
  categoria?: Categoria;
  onGuardada: (c: Categoria) => void;
  onClose: () => void;
}) {
  const [nombre, setNombre] = useState(categoria?.nombre || '');
  const [slug, setSlug] = useState(categoria?.slug || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleNombreChange(v: string) {
    setNombre(v);
    if (!categoria) setSlug(generarSlug(v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData();
    fd.append('nombre', nombre);
    fd.append('slug', slug);
    try {
      const url = categoria
        ? `${API}/admin/categorias/${categoria.id}`
        : `${API}/admin/categorias`;
      const method = categoria ? 'PATCH' : 'POST';
      const res = await authFetch(url, { method, body: fd });
      if (!res.ok) throw new Error((await res.json()).detail || 'Error');
      onGuardada(await res.json());
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {categoria ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1.5">Nombre</label>
            <input
              required
              value={nombre}
              onChange={e => handleNombreChange(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Ej: Remeras"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1.5">URL</label>
            <input
              required
              value={slug}
              onChange={e => setSlug(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono text-gray-600"
              placeholder="remeras"
            />
            <p className="text-xs text-gray-400 mt-1.5">Se genera automáticamente desde el nombre</p>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-700 text-white text-xs font-medium tracking-wider uppercase px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : categoria ? 'Guardar cambios' : 'Crear categoría'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalCategoria, setModalCategoria] = useState<Categoria | null | 'nueva'>(null);

  useEffect(() => { fetchCategorias(); }, []);

  async function fetchCategorias() {
    try {
      const res = await fetch(`${API}/categorias`);
      setCategorias(await res.json() || []);
    } catch {
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }

  function handleGuardada(c: Categoria) {
    setCategorias(prev => {
      const existe = prev.find(x => x.id === c.id);
      if (existe) return prev.map(x => x.id === c.id ? c : x);
      return [...prev, c];
    });
    setModalCategoria(null);
  }

  if (loading) return (
    <div className="flex items-center gap-3">
      <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Cargando categorías...</p>
    </div>
  );

  return (
    <div>
      {modalCategoria !== null && (
        <ModalCategoria
          categoria={modalCategoria === 'nueva' ? undefined : modalCategoria}
          onGuardada={handleGuardada}
          onClose={() => setModalCategoria(null)}
        />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Categorías</h1>
          <p className="text-sm text-gray-500 mt-1">{categorias.length} categorías en total</p>
        </div>
        <button
          onClick={() => setModalCategoria('nueva')}
          className="bg-gray-900 hover:bg-gray-700 text-white text-xs font-medium tracking-wider uppercase px-5 py-2.5 rounded-lg transition-colors"
        >
          + Nueva categoría
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
        <div className="min-w-[400px]">
        <div className="grid grid-cols-[1fr_1fr_60px_100px] gap-3 px-4 py-3 border-b border-stone-200 bg-stone-100">
          {['Nombre', 'URL', 'ID', 'Acciones'].map(h => (
            <span key={h} className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">{h}</span>
          ))}
        </div>

        {categorias.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-stone-400">Sin categorías. Creá la primera.</p>
          </div>
        ) : (
          categorias.map((c, idx) => (
            <div key={c.id} className={`grid grid-cols-[1fr_1fr_60px_100px] gap-3 px-4 py-4 border-b border-stone-100 last:border-0 items-center hover:bg-stone-50 transition-colors ${idx % 2 !== 0 ? 'bg-stone-50/50' : ''}`}>
              <span className="text-sm font-medium text-stone-800">{c.nombre}</span>
              <span className="text-sm font-mono text-stone-500 truncate">{c.slug}</span>
              <span className="text-xs text-stone-400">#{c.id}</span>
              <button
                onClick={() => setModalCategoria(c)}
                className="text-xs text-stone-400 hover:text-stone-900 font-medium transition-colors text-left"
              >
                Editar
              </button>
            </div>
          ))
        )}
        </div>{/* min-w */}
        </div>{/* overflow-x-auto */}
      </div>
    </div>
  );
}
