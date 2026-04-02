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
      <div className="bg-white w-full max-w-md p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-xl">Nueva categoría</h2>
          <button onClick={onClose} className="text-amanda-gray hover:text-amanda-black">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] tracking-widest uppercase text-amanda-gray block mb-1">Nombre</label>
            <input
              required
              value={nombre}
              onChange={e => handleNombreChange(e.target.value)}
              className="w-full border-b border-amanda-black text-sm py-1 bg-transparent focus:outline-none"
              placeholder="Ej: Remeras"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-widest uppercase text-amanda-gray block mb-1">Slug</label>
            <input
              required
              value={slug}
              onChange={e => setSlug(e.target.value)}
              className="w-full border-b border-amanda-lightgray text-sm py-1 bg-transparent focus:outline-none text-amanda-gray"
              placeholder="remeras"
            />
            <p className="text-[10px] text-amanda-gray mt-1">Se genera automáticamente desde el nombre</p>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amanda-black text-white text-xs tracking-widest uppercase py-3 hover:bg-amanda-gray transition-colors mt-2"
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
      <p className="text-[10px] tracking-widest uppercase text-amanda-gray animate-pulse">
        Cargando categorías...
      </p>
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

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-amanda-black">Categorías</h1>
          <p className="text-xs text-amanda-gray mt-1 tracking-wide">{categorias.length} categorías en total</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amanda-black text-white text-xs tracking-widest uppercase px-6 py-3 hover:bg-amanda-gray transition-colors"
        >
          + Nueva categoría
        </button>
      </div>

      <div className="bg-white border border-amanda-lightgray">
        {/* Header */}
        <div className="grid grid-cols-[1fr_1fr_100px] gap-4 px-4 py-3 border-b border-amanda-lightgray bg-stone-50">
          {['Nombre', 'Slug', 'ID'].map(h => (
            <span key={h} className="text-[10px] tracking-widest uppercase text-amanda-gray">{h}</span>
          ))}
        </div>

        {categorias.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-amanda-gray">Sin categorías. Creá la primera.</p>
          </div>
        ) : (
          categorias.map(c => (
            <div
              key={c.id}
              className="grid grid-cols-[1fr_1fr_100px] gap-4 px-4 py-4 border-b border-amanda-lightgray last:border-0 items-center hover:bg-stone-50 transition-colors"
            >
              <span className="text-sm font-medium text-amanda-black">{c.nombre}</span>
              <span className="text-xs text-amanda-gray font-mono">{c.slug}</span>
              <span className="text-[10px] text-amanda-gray">#{c.id}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
