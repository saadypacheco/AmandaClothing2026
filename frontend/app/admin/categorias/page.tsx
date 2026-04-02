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
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
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

function ModalNuevaCategoria({ onCreada, onClose }: {
  onCreada: (c: Categoria) => void;
  onClose: () => void;
}) {
  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleNombreChange(v: string) {
    setNombre(v);
    setSlug(generarSlug(v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData();
    fd.append('nombre', nombre);
    fd.append('slug', slug);
    try {
      const res = await authFetch(`${API}/admin/categorias`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json()).detail || 'Error al crear');
      const data = await res.json();
      onCreada(data);
    } catch (e: any) {
      setError(e.message || 'Error al crear');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Nueva categoría</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
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
            <label className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1.5">Slug</label>
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
            className="w-full bg-gray-900 hover:bg-gray-700 text-white text-xs font-medium tracking-wider uppercase px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Creando...' : 'Crear categoría'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCategorias();
  }, []);

  async function fetchCategorias() {
    try {
      const res = await fetch(`${API}/categorias`);
      const data = await res.json();
      setCategorias(data || []);
    } catch {
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div>
      {showModal && (
        <ModalNuevaCategoria
          onCreada={c => { setCategorias(prev => [...prev, c]); setShowModal(false); }}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Categorías</h1>
          <p className="text-sm text-gray-500 mt-1">{categorias.length} categorías en total</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gray-900 hover:bg-gray-700 text-white text-xs font-medium tracking-wider uppercase px-5 py-2.5 rounded-lg transition-colors"
        >
          + Nueva categoría
        </button>
      </div>

      {categorias.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-sm text-gray-400">Sin categorías. Creá la primera.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {categorias.map(c => (
            <div
              key={c.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900">{c.nombre}</h3>
                <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-500">
                  #{c.id}
                </span>
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Slug</p>
              <p className="text-sm font-mono text-gray-600">{c.slug}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
