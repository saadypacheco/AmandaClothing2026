'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface ProductoAdmin {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  activo: boolean;
  imagen_url: string | null;
  categorias: { id: number; nombre: string; slug: string } | null;
}

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<ProductoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [editando, setEditando] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ precio: string; activo: boolean }>({ precio: '', activo: true });
  const [msg, setMsg] = useState<{ id: number; text: string; ok: boolean } | null>(null);
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    try {
      const res = await fetch(`${API}/admin/productos`);
      const data = await res.json();
      setProductos(data);
    } catch {
      console.error('Error cargando productos');
    } finally {
      setLoading(false);
    }
  }

  function flash(id: number, text: string, ok = true) {
    setMsg({ id, text, ok });
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleImageUpload(productoId: number, file: File) {
    setUploading(productoId);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`${API}/admin/productos/${productoId}/imagen`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      const { imagen_url } = await res.json();
      setProductos(prev => prev.map(p => p.id === productoId ? { ...p, imagen_url } : p));
      flash(productoId, 'Imagen subida');
    } catch (e: any) {
      flash(productoId, e.message || 'Error al subir', false);
    } finally {
      setUploading(null);
    }
  }

  async function handleEliminarImagen(productoId: number) {
    try {
      await fetch(`${API}/admin/productos/${productoId}/imagen`, { method: 'DELETE' });
      setProductos(prev => prev.map(p => p.id === productoId ? { ...p, imagen_url: null } : p));
      flash(productoId, 'Imagen eliminada');
    } catch {
      flash(productoId, 'Error al eliminar', false);
    }
  }

  async function handleGuardarEdicion(productoId: number) {
    try {
      const form = new FormData();
      form.append('precio', editValues.precio);
      form.append('activo', String(editValues.activo));
      const res = await fetch(`${API}/admin/productos/${productoId}`, { method: 'PATCH', body: form });
      if (!res.ok) throw new Error((await res.json()).detail);
      const updated = await res.json();
      setProductos(prev => prev.map(p => p.id === productoId ? { ...p, ...updated } : p));
      flash(productoId, 'Guardado');
      setEditando(null);
    } catch (e: any) {
      flash(productoId, e.message || 'Error al guardar', false);
    }
  }

  if (loading) {
    return <p className="text-xs tracking-widest uppercase text-amanda-gray animate-pulse">Cargando productos...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl">Productos</h1>
          <p className="text-xs text-amanda-gray mt-1">{productos.length} productos en total</p>
        </div>
      </div>

      <div className="bg-white border border-amanda-lightgray">
        {/* Header tabla */}
        <div className="grid grid-cols-[80px_1fr_120px_80px_160px_120px] gap-4 px-4 py-3 border-b border-amanda-lightgray bg-stone-50">
          <span className="text-[10px] tracking-widest uppercase text-amanda-gray">Foto</span>
          <span className="text-[10px] tracking-widest uppercase text-amanda-gray">Producto</span>
          <span className="text-[10px] tracking-widest uppercase text-amanda-gray">Categoría</span>
          <span className="text-[10px] tracking-widest uppercase text-amanda-gray">Precio</span>
          <span className="text-[10px] tracking-widest uppercase text-amanda-gray">Estado</span>
          <span className="text-[10px] tracking-widest uppercase text-amanda-gray">Acciones</span>
        </div>

        {productos.map((p) => (
          <div key={p.id} className="grid grid-cols-[80px_1fr_120px_80px_160px_120px] gap-4 px-4 py-4 border-b border-amanda-lightgray items-center hover:bg-stone-50 transition-colors">

            {/* Foto */}
            <div className="relative w-16 h-20 bg-stone-100 flex items-center justify-center overflow-hidden">
              {p.imagen_url ? (
                <>
                  <Image src={p.imagen_url} alt={p.nombre} fill className="object-cover object-top" sizes="64px" />
                  <button
                    onClick={() => handleEliminarImagen(p.id)}
                    className="absolute top-0 right-0 w-5 h-5 bg-black/60 text-white text-[10px] flex items-center justify-center hover:bg-red-600 transition-colors"
                    title="Eliminar imagen"
                  >×</button>
                </>
              ) : (
                <button
                  onClick={() => fileRefs.current[p.id]?.click()}
                  disabled={uploading === p.id}
                  className="w-full h-full flex flex-col items-center justify-center gap-1 text-stone-400 hover:text-amanda-black hover:bg-stone-200 transition-colors"
                >
                  {uploading === p.id ? (
                    <span className="text-[9px]">Subiendo...</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-[9px]">Foto</span>
                    </>
                  )}
                </button>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                ref={el => { fileRefs.current[p.id] = el; }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(p.id, file);
                  e.target.value = '';
                }}
              />
            </div>

            {/* Nombre + descripción */}
            <div className="min-w-0">
              <p className="text-xs font-medium text-amanda-black truncate">{p.nombre}</p>
              <p className="text-[10px] text-amanda-gray truncate mt-0.5">{p.descripcion}</p>
              {msg?.id === p.id && (
                <p className={`text-[10px] mt-1 ${msg.ok ? 'text-green-600' : 'text-red-500'}`}>{msg.text}</p>
              )}
            </div>

            {/* Categoría */}
            <span className="text-xs text-amanda-gray">{p.categorias?.nombre || '—'}</span>

            {/* Precio */}
            {editando === p.id ? (
              <input
                type="number"
                value={editValues.precio}
                onChange={e => setEditValues(v => ({ ...v, precio: e.target.value }))}
                className="w-full border-b border-amanda-black text-xs py-0.5 bg-transparent focus:outline-none"
              />
            ) : (
              <span className="text-xs">${p.precio.toLocaleString('es-AR')}</span>
            )}

            {/* Estado */}
            {editando === p.id ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditValues(v => ({ ...v, activo: true }))}
                  className={`text-[10px] tracking-widest uppercase px-2 py-1 border transition-colors ${editValues.activo ? 'bg-amanda-black text-white border-amanda-black' : 'border-amanda-lightgray text-amanda-gray'}`}
                >Activo</button>
                <button
                  onClick={() => setEditValues(v => ({ ...v, activo: false }))}
                  className={`text-[10px] tracking-widest uppercase px-2 py-1 border transition-colors ${!editValues.activo ? 'bg-amanda-black text-white border-amanda-black' : 'border-amanda-lightgray text-amanda-gray'}`}
                >Inactivo</button>
              </div>
            ) : (
              <span className={`text-[10px] tracking-widest uppercase px-2 py-1 border w-fit ${p.activo ? 'border-green-300 text-green-700 bg-green-50' : 'border-stone-300 text-stone-400'}`}>
                {p.activo ? 'Activo' : 'Inactivo'}
              </span>
            )}

            {/* Acciones */}
            <div className="flex items-center gap-2">
              {editando === p.id ? (
                <>
                  <button onClick={() => handleGuardarEdicion(p.id)} className="text-[10px] tracking-widest uppercase border-b border-amanda-black hover:text-amanda-gray transition-colors">
                    Guardar
                  </button>
                  <button onClick={() => setEditando(null)} className="text-[10px] tracking-widest uppercase text-amanda-gray hover:text-amanda-black transition-colors">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setEditando(p.id); setEditValues({ precio: String(p.precio), activo: p.activo }); }}
                    className="text-[10px] tracking-widest uppercase text-amanda-gray hover:text-amanda-black transition-colors"
                  >Editar</button>
                  {p.imagen_url && (
                    <button
                      onClick={() => fileRefs.current[p.id]?.click()}
                      disabled={uploading === p.id}
                      className="text-[10px] tracking-widest uppercase text-amanda-gray hover:text-amanda-black transition-colors"
                    >Cambiar foto</button>
                  )}
                </>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
