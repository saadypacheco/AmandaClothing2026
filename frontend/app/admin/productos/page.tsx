'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

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

interface Variante {
  id: number;
  producto_id: number;
  talla: string;
  color: string;
  stock: number;
  sku: string;
}

interface ProductoAdmin {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  activo: boolean;
  imagen_url: string | null;
  categorias: { id: number; nombre: string; slug: string } | null;
}

interface Categoria {
  id: number;
  nombre: string;
  slug: string;
}

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Modal nuevo producto ──────────────────────────────────────────────────────
function ModalNuevoProducto({ categorias, onCreado, onClose }: {
  categorias: Categoria[];
  onCreado: (p: ProductoAdmin) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', categoria_id: '', activo: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData();
    fd.append('nombre', form.nombre);
    fd.append('descripcion', form.descripcion);
    fd.append('precio', form.precio);
    fd.append('categoria_id', form.categoria_id);
    fd.append('activo', String(form.activo));
    try {
      const res = await authFetch(`${API}/admin/productos`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json()).detail);
      const data = await res.json();
      onCreado(data);
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
          <h2 className="font-serif text-xl">Nuevo producto</h2>
          <button onClick={onClose} className="text-amanda-gray hover:text-amanda-black">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] tracking-widest uppercase text-amanda-gray block mb-1">Nombre</label>
            <input required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              className="w-full border-b border-amanda-black text-sm py-1 bg-transparent focus:outline-none" />
          </div>
          <div>
            <label className="text-[10px] tracking-widest uppercase text-amanda-gray block mb-1">Descripción</label>
            <textarea required value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              rows={3} className="w-full border-b border-amanda-black text-sm py-1 bg-transparent focus:outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] tracking-widest uppercase text-amanda-gray block mb-1">Precio</label>
              <input required type="number" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))}
                className="w-full border-b border-amanda-black text-sm py-1 bg-transparent focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] tracking-widest uppercase text-amanda-gray block mb-1">Categoría</label>
              <select required value={form.categoria_id} onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))}
                className="w-full border-b border-amanda-black text-sm py-1 bg-transparent focus:outline-none">
                <option value="">Elegir...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-amanda-black text-white text-xs tracking-widest uppercase py-3 hover:bg-amanda-gray transition-colors mt-2">
            {loading ? 'Creando...' : 'Crear producto'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Panel de variantes ────────────────────────────────────────────────────────
function PanelVariantes({ productoId, onClose }: { productoId: number; onClose: () => void }) {
  const [variantes, setVariantes] = useState<Variante[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ talla: '', color: '', stock: '', sku: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchVariantes(); }, []);

  async function fetchVariantes() {
    const res = await authFetch(`${API}/admin/productos/${productoId}/variantes`);
    setVariantes(await res.json());
    setLoading(false);
  }

  function flash(text: string) { setMsg(text); setTimeout(() => setMsg(''), 2500); }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    const res = await authFetch(`${API}/admin/productos/${productoId}/variantes`, { method: 'POST', body: fd });
    if (res.ok) { setForm({ talla: '', color: '', stock: '', sku: '' }); fetchVariantes(); flash('Variante creada'); }
    else flash((await res.json()).detail || 'Error');
  }

  async function handleEditarStock(id: number) {
    const fd = new FormData();
    fd.append('stock', editStock);
    const res = await authFetch(`${API}/admin/variantes/${id}`, { method: 'PATCH', body: fd });
    if (res.ok) { setEditId(null); fetchVariantes(); flash('Stock actualizado'); }
    else flash('Error al actualizar');
  }

  async function handleEliminar(id: number) {
    await authFetch(`${API}/admin/variantes/${id}`, { method: 'DELETE' });
    fetchVariantes();
    flash('Variante eliminada');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-xl">Variantes</h2>
          <button onClick={onClose} className="text-amanda-gray hover:text-amanda-black">✕</button>
        </div>

        {msg && <p className="text-xs text-green-600 mb-3">{msg}</p>}

        {/* Lista de variantes */}
        {loading ? (
          <p className="text-xs text-amanda-gray animate-pulse mb-4">Cargando...</p>
        ) : variantes.length === 0 ? (
          <p className="text-xs text-amanda-gray mb-4">Sin variantes — agregá la primera abajo.</p>
        ) : (
          <div className="mb-6">
            <div className="grid grid-cols-[80px_100px_60px_1fr_80px] gap-2 mb-2">
              {['Talla', 'Color', 'Stock', 'SKU', ''].map(h => (
                <span key={h} className="text-[10px] tracking-widest uppercase text-amanda-gray">{h}</span>
              ))}
            </div>
            {variantes.map(v => (
              <div key={v.id} className="grid grid-cols-[80px_100px_60px_1fr_80px] gap-2 py-2 border-b border-amanda-lightgray items-center">
                <span className="text-xs">{v.talla}</span>
                <span className="text-xs">{v.color}</span>
                {editId === v.id ? (
                  <input type="number" value={editStock} onChange={e => setEditStock(e.target.value)}
                    className="text-xs border-b border-amanda-black w-full bg-transparent focus:outline-none" />
                ) : (
                  <span className="text-xs">{v.stock}</span>
                )}
                <span className="text-[10px] text-amanda-gray truncate">{v.sku}</span>
                <div className="flex gap-2">
                  {editId === v.id ? (
                    <>
                      <button onClick={() => handleEditarStock(v.id)} className="text-[10px] text-green-600">OK</button>
                      <button onClick={() => setEditId(null)} className="text-[10px] text-amanda-gray">✕</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(v.id); setEditStock(String(v.stock)); }}
                        className="text-[10px] text-amanda-gray hover:text-amanda-black">Stock</button>
                      <button onClick={() => handleEliminar(v.id)}
                        className="text-[10px] text-red-400 hover:text-red-600">Borrar</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulario nueva variante */}
        <h3 className="text-[10px] tracking-widest uppercase text-amanda-gray mb-3">Nueva variante</h3>
        <form onSubmit={handleCrear} className="grid grid-cols-2 gap-3">
          {[
            { label: 'Talla', key: 'talla', placeholder: 'S, M, L, 38...' },
            { label: 'Color', key: 'color', placeholder: 'Negro, Blanco...' },
            { label: 'Stock', key: 'stock', placeholder: '10', type: 'number' },
            { label: 'SKU', key: 'sku', placeholder: 'REM-NEG-S' },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <label className="text-[10px] tracking-widest uppercase text-amanda-gray block mb-1">{label}</label>
              <input required type={type || 'text'} placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border-b border-amanda-lightgray text-xs py-1 bg-transparent focus:outline-none focus:border-amanda-black" />
            </div>
          ))}
          <div className="col-span-2">
            <button type="submit" className="w-full bg-amanda-black text-white text-xs tracking-widest uppercase py-2.5 hover:bg-amanda-gray transition-colors">
              Agregar variante
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function AdminProductosPage() {
  const [productos, setProductos] = useState<ProductoAdmin[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [editando, setEditando] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ precio: string; activo: boolean }>({ precio: '', activo: true });
  const [msg, setMsg] = useState<{ id: number; text: string; ok: boolean } | null>(null);
  const [showNuevo, setShowNuevo] = useState(false);
  const [variantesId, setVariantesId] = useState<number | null>(null);
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  async function fetchProductos() {
    const res = await authFetch(`${API}/admin/productos`);
    setProductos(await res.json());
    setLoading(false);
  }

  async function fetchCategorias() {
    const res = await authFetch(`${API}/admin/categorias`);
    setCategorias(await res.json());
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
      const res = await authFetch(`${API}/admin/productos/${productoId}/imagen`, { method: 'POST', body: form });
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
    await authFetch(`${API}/admin/productos/${productoId}/imagen`, { method: 'DELETE' });
    setProductos(prev => prev.map(p => p.id === productoId ? { ...p, imagen_url: null } : p));
    flash(productoId, 'Imagen eliminada');
  }

  async function handleGuardarEdicion(productoId: number) {
    const form = new FormData();
    form.append('precio', editValues.precio);
    form.append('activo', String(editValues.activo));
    const res = await authFetch(`${API}/admin/productos/${productoId}`, { method: 'PATCH', body: form });
    if (res.ok) {
      const updated = await res.json();
      setProductos(prev => prev.map(p => p.id === productoId ? { ...p, ...updated } : p));
      flash(productoId, 'Guardado');
      setEditando(null);
    } else {
      flash(productoId, 'Error al guardar', false);
    }
  }

  if (loading) return <p className="text-xs tracking-widest uppercase text-amanda-gray animate-pulse">Cargando productos...</p>;

  return (
    <div>
      {showNuevo && (
        <ModalNuevoProducto
          categorias={categorias}
          onCreado={p => { setProductos(prev => [p, ...prev]); setShowNuevo(false); }}
          onClose={() => setShowNuevo(false)}
        />
      )}

      {variantesId && (
        <PanelVariantes productoId={variantesId} onClose={() => setVariantesId(null)} />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl">Productos</h1>
          <p className="text-xs text-amanda-gray mt-1">{productos.length} productos en total</p>
        </div>
        <button onClick={() => setShowNuevo(true)}
          className="bg-amanda-black text-white text-xs tracking-widest uppercase px-6 py-3 hover:bg-amanda-gray transition-colors">
          + Nuevo producto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_120px_80px_120px_160px] gap-4 px-4 py-3 border-b border-stone-200 bg-stone-100">
          {['Foto', 'Producto', 'Categoría', 'Precio', 'Estado', 'Acciones'].map(h => (
            <span key={h} className="text-[10px] tracking-widest uppercase text-stone-500 font-medium">{h}</span>
          ))}
        </div>

        {productos.map((p, idx) => (
          <div key={p.id} className={`grid grid-cols-[80px_1fr_120px_80px_120px_160px] gap-4 px-4 py-4 border-b border-stone-100 items-center hover:bg-stone-50 transition-colors ${idx % 2 !== 0 ? 'bg-stone-50/40' : ''}`}>

            {/* Foto */}
            <div className="relative w-16 h-20 bg-stone-100 flex items-center justify-center overflow-hidden">
              {p.imagen_url ? (
                <>
                  <Image src={p.imagen_url} alt={p.nombre} fill className="object-cover object-top" sizes="64px" />
                  <button onClick={() => handleEliminarImagen(p.id)}
                    className="absolute top-0 right-0 w-5 h-5 bg-black/60 text-white text-[10px] flex items-center justify-center hover:bg-red-600 transition-colors">×</button>
                </>
              ) : (
                <button onClick={() => fileRefs.current[p.id]?.click()} disabled={uploading === p.id}
                  className="w-full h-full flex flex-col items-center justify-center gap-1 text-stone-400 hover:text-amanda-black hover:bg-stone-200 transition-colors">
                  {uploading === p.id ? <span className="text-[9px]">Subiendo...</span> : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg><span className="text-[9px]">Foto</span></>
                  )}
                </button>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                ref={el => { fileRefs.current[p.id] = el; }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(p.id, f); e.target.value = ''; }} />
            </div>

            {/* Nombre */}
            <div className="min-w-0">
              <p className="text-xs font-medium text-amanda-black truncate">{p.nombre}</p>
              <p className="text-[10px] text-amanda-gray truncate mt-0.5">{p.descripcion}</p>
              {msg?.id === p.id && <p className={`text-[10px] mt-1 ${msg.ok ? 'text-green-600' : 'text-red-500'}`}>{msg.text}</p>}
            </div>

            {/* Categoría */}
            <span className="text-xs text-amanda-gray">{p.categorias?.nombre || '—'}</span>

            {/* Precio */}
            {editando === p.id ? (
              <input type="number" value={editValues.precio} onChange={e => setEditValues(v => ({ ...v, precio: e.target.value }))}
                className="w-full border-b border-amanda-black text-xs py-0.5 bg-transparent focus:outline-none" />
            ) : (
              <span className="text-xs">${p.precio.toLocaleString('es-AR')}</span>
            )}

            {/* Estado */}
            {editando === p.id ? (
              <div className="flex gap-1">
                {[true, false].map(v => (
                  <button key={String(v)} onClick={() => setEditValues(ev => ({ ...ev, activo: v }))}
                    className={`text-[9px] tracking-widest uppercase px-2 py-1 border transition-colors ${editValues.activo === v ? 'bg-amanda-black text-white border-amanda-black' : 'border-amanda-lightgray text-amanda-gray'}`}>
                    {v ? 'Activo' : 'Inactivo'}
                  </button>
                ))}
              </div>
            ) : (
              <span className={`text-[10px] tracking-widest uppercase px-2 py-1 border w-fit ${p.activo ? 'border-green-300 text-green-700 bg-green-50' : 'border-stone-300 text-stone-400'}`}>
                {p.activo ? 'Activo' : 'Inactivo'}
              </span>
            )}

            {/* Acciones */}
            <div className="flex items-center gap-2 flex-wrap">
              {editando === p.id ? (
                <>
                  <button onClick={() => handleGuardarEdicion(p.id)} className="text-[10px] tracking-widest uppercase border-b border-amanda-black">Guardar</button>
                  <button onClick={() => setEditando(null)} className="text-[10px] uppercase text-amanda-gray">Cancelar</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditando(p.id); setEditValues({ precio: String(p.precio), activo: p.activo }); }}
                    className="text-[10px] tracking-widest uppercase text-amanda-gray hover:text-amanda-black">Editar</button>
                  <button onClick={() => setVariantesId(p.id)}
                    className="text-[10px] tracking-widest uppercase text-amanda-gray hover:text-amanda-black">Variantes</button>
                  {p.imagen_url && (
                    <button onClick={() => fileRefs.current[p.id]?.click()} disabled={uploading === p.id}
                      className="text-[10px] tracking-widest uppercase text-amanda-gray hover:text-amanda-black">Foto</button>
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
