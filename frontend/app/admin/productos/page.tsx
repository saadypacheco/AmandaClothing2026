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

interface ImagenGaleria {
  id: number;
  url: string;
  orden: number;
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
  precio_original?: number | null;
  es_nuevo?: boolean;
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

// ── Modal de publicación en redes sociales ──────────────────────────────────
interface PublishResult {
  [key: string]: { ok: boolean; error?: string; url?: string };
}

function ModalPublicar({
  producto,
  onClose,
}: {
  producto: ProductoAdmin;
  onClose: () => void;
}) {
  const [redes, setRedes] = useState<Set<string>>(new Set(['telegram', 'whatsapp']));
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<PublishResult | null>(null);

  const toggleRed = (red: string) => {
    setRedes(prev => {
      const next = new Set(prev);
      if (next.has(red)) next.delete(red);
      else next.add(red);
      return next;
    });
  };

  const captionDefault = `✨ ${producto.nombre}\n💰 $${producto.precio.toLocaleString('es-AR')}\n${producto.descripcion?.substring(0, 100) || ''}\n\n👗 Ver más en amandaclothing.com.ar/productos/${producto.id}`;

  useEffect(() => {
    setCaption(captionDefault);
  }, [captionDefault]);

  async function handlePublicar() {
    setLoading(true);
    const fd = new FormData();
    Array.from(redes).forEach(r => fd.append('redes', r));
    if (caption !== captionDefault) fd.append('caption', caption);

    try {
      const res = await authFetch(`${API}/admin/productos/${producto.id}/publicar`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      setResultados(data.resultados);
    } catch (e) {
      setResultados({ error: { ok: false, error: String(e) } });
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-xl">Publicar &ldquo;{producto.nombre}&rdquo;</h2>
          <button onClick={onClose} className="text-amanda-gray hover:text-amanda-black text-2xl">✕</button>
        </div>

        {!resultados ? (
          <>
            {/* Preview */}
            <div className="mb-6 p-4 bg-stone-50 border border-stone-200 rounded">
              <div className="grid grid-cols-[80px_1fr] gap-4">
                {producto.imagen_url && (
                  <div className="w-20 h-24 bg-stone-100 rounded overflow-hidden">
                    <Image src={producto.imagen_url} alt={producto.nombre} width={80} height={120} className="object-cover w-full h-full" />
                  </div>
                )}
                <div>
                  <p className="text-xs text-amanda-gray mb-2">Preview del post:</p>
                  <p className="text-sm whitespace-pre-wrap text-amanda-black">{caption}</p>
                </div>
              </div>
            </div>

            {/* Caption editable */}
            <div className="mb-6">
              <label className="block text-[10px] tracking-widest uppercase text-amanda-gray mb-2">Caption (editable)</label>
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                className="w-full h-24 p-3 border border-stone-300 text-xs text-amanda-black focus:outline-none focus:border-amanda-black"
              />
            </div>

            {/* Seleccionar redes */}
            <div className="mb-6">
              <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-3">Publicar en:</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {['telegram', 'whatsapp', 'facebook', 'instagram', 'tiktok'].map(red => (
                  <label key={red} className="flex items-center gap-2 cursor-pointer p-3 border border-stone-200 rounded hover:bg-stone-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={redes.has(red)}
                      onChange={() => toggleRed(red)}
                      className="w-4 h-4 accent-amanda-black"
                    />
                    <span className="text-xs uppercase tracking-widest text-amanda-black capitalize">{red}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={handlePublicar}
                disabled={loading || redes.size === 0}
                className="flex-1 py-3 bg-amanda-black text-amanda-white text-[10px] tracking-widest uppercase hover:bg-stone-800 disabled:opacity-40 transition-colors"
              >
                {loading ? 'Publicando...' : 'Publicar ahora'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-amanda-lightgray text-amanda-black text-[10px] tracking-widest uppercase hover:bg-stone-50"
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Resultados */}
            <div className="space-y-3 mb-6">
              {Object.entries(resultados).map(([red, result]) => (
                <div key={red} className={`p-4 border rounded text-sm ${result.ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start gap-2">
                    {result.ok ? (
                      <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-widest capitalize">{red}</p>
                      {result.ok && result.url && (
                        <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline">
                          Ver publicación →
                        </a>
                      )}
                      {!result.ok && result.error && (
                        <p className="text-[10px] text-red-600">{result.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-amanda-black text-amanda-white text-[10px] tracking-widest uppercase hover:bg-stone-800"
            >
              Cerrar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Panel de imágenes (galería multi-foto) ────────────────────────────────────
function PanelImagenes({ productoId, onClose }: { productoId: number; onClose: () => void }) {
  const [imagenes, setImagenes] = useState<ImagenGaleria[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { fetchImagenes(); }, []);

  async function fetchImagenes() {
    const res = await authFetch(`${API}/admin/productos/${productoId}/imagenes`);
    if (res.ok) setImagenes(await res.json());
    setLoading(false);
  }

  function flash(text: string) { setMsg(text); setTimeout(() => setMsg(''), 2500); }

  async function handleSubir(file: File) {
    if (imagenes.length >= 4) { flash('Máximo 4 fotos por producto'); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await authFetch(`${API}/admin/productos/${productoId}/imagenes`, { method: 'POST', body: fd });
    if (res.ok) { await fetchImagenes(); flash('Foto agregada'); }
    else { const d = await res.json(); flash(d.detail || 'Error al subir'); }
    setUploading(false);
  }

  async function handleEliminar(imagenId: number) {
    await authFetch(`${API}/admin/productos/${productoId}/imagenes/${imagenId}`, { method: 'DELETE' });
    setImagenes(prev => prev.filter(i => i.id !== imagenId));
    flash('Foto eliminada');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-serif text-xl">Fotos del producto</h2>
            <p className="text-[10px] tracking-widest uppercase text-amanda-gray mt-0.5">{imagenes.length}/4 fotos</p>
          </div>
          <button onClick={onClose} className="text-amanda-gray hover:text-amanda-black">✕</button>
        </div>

        {msg && <p className="text-xs text-green-600 mb-4">{msg}</p>}

        {loading ? (
          <p className="text-xs text-amanda-gray animate-pulse">Cargando...</p>
        ) : (
          <div className="grid grid-cols-4 gap-3 mb-6">
            {/* Fotos existentes */}
            {imagenes.map((img, idx) => (
              <div key={img.id} className="relative aspect-[3/4] bg-stone-100 overflow-hidden group">
                <Image src={img.url} alt={`Foto ${idx + 1}`} fill className="object-cover object-top" sizes="120px" />
                {idx === 0 && (
                  <span className="absolute bottom-1 left-1 text-[8px] tracking-widest uppercase bg-amanda-black text-white px-1.5 py-0.5">Principal</span>
                )}
                <button
                  onClick={() => handleEliminar(img.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >×</button>
              </div>
            ))}

            {/* Slot para agregar — solo si hay menos de 4 */}
            {imagenes.length < 4 && (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="aspect-[3/4] border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-1 text-stone-400 hover:border-amanda-black hover:text-amanda-black transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <span className="text-[9px]">Subiendo...</span>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-[9px] tracking-widest uppercase">Agregar</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleSubir(f); e.target.value = ''; }} />

        <p className="text-[10px] text-amanda-gray">La primera foto es la imagen principal del producto.</p>
      </div>
    </div>
  );
}

// ── Modal nuevo producto ──────────────────────────────────────────────────────
function ModalNuevoProducto({ categorias, onCreado, onClose }: {
  categorias: Categoria[];
  onCreado: (p: ProductoAdmin) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', categoria_id: '', activo: true });
  const [fotos, setFotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  function handleFotos(files: FileList) {
    const nuevas = Array.from(files).slice(0, 4 - fotos.length);
    setFotos(prev => [...prev, ...nuevas].slice(0, 4));
    setPreviews(prev => [...prev, ...nuevas.map(f => URL.createObjectURL(f))].slice(0, 4));
  }

  function quitarFoto(idx: number) {
    setFotos(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  }

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

      // Subir fotos secuencialmente
      for (const foto of fotos) {
        const imgForm = new FormData();
        imgForm.append('file', foto);
        await authFetch(`${API}/admin/productos/${data.id}/imagenes`, { method: 'POST', body: imgForm });
      }

      // Recargar producto con imagen_url actualizada
      const reloadRes = await authFetch(`${API}/admin/productos`);
      if (reloadRes.ok) {
        const todos = await reloadRes.json();
        const creado = todos.find((p: ProductoAdmin) => p.id === data.id) || data;
        onCreado(creado);
      } else {
        onCreado(data);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al crear');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
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

          {/* Fotos — hasta 4 */}
          <div>
            <label className="text-[10px] tracking-widest uppercase text-amanda-gray block mb-2">
              Fotos <span className="normal-case text-[9px]">({fotos.length}/4 — la primera será la principal)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {previews.map((src, idx) => (
                <div key={idx} className="relative aspect-[3/4] bg-stone-100 overflow-hidden group">
                  <img src={src} alt="" className="w-full h-full object-cover object-top" />
                  <button type="button" onClick={() => quitarFoto(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                </div>
              ))}
              {fotos.length < 4 && (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="aspect-[3/4] border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-1 text-stone-400 hover:border-amanda-black hover:text-amanda-black transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[9px]">Agregar</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
              onChange={e => { if (e.target.files) handleFotos(e.target.files); e.target.value = ''; }} />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-amanda-black text-white text-xs tracking-widest uppercase py-3 hover:bg-amanda-gray transition-colors mt-2 disabled:opacity-50">
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
  const [editando, setEditando] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ precio: string; precio_original: string; es_nuevo: boolean; activo: boolean }>({ precio: '', precio_original: '', es_nuevo: false, activo: true });
  const [msg, setMsg] = useState<{ id: number; text: string; ok: boolean } | null>(null);
  const [showNuevo, setShowNuevo] = useState(false);
  const [variantesId, setVariantesId] = useState<number | null>(null);
  const [imagenesId, setImagenesId] = useState<number | null>(null);
  const [publicarId, setPublicarId] = useState<number | null>(null);

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

  async function handleGuardarEdicion(productoId: number) {
    const form = new FormData();
    form.append('precio', editValues.precio);
    form.append('activo', String(editValues.activo));
    form.append('es_nuevo', String(editValues.es_nuevo));
    form.append('precio_original', editValues.precio_original || '0');
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

      {imagenesId && (
        <PanelImagenes
          productoId={imagenesId}
          onClose={() => {
            setImagenesId(null);
            fetchProductos(); // refresca imagen_url principal en la tabla
          }}
        />
      )}

      {publicarId && (
        <ModalPublicar
          producto={productos.find(p => p.id === publicarId)!}
          onClose={() => setPublicarId(null)}
        />
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
        <div className="overflow-x-auto">
        <div className="min-w-[580px]">
        <div className="grid grid-cols-[64px_1fr_110px_75px_110px_150px] gap-3 px-4 py-3 border-b border-stone-200 bg-stone-100">
          {['Foto', 'Producto', 'Categoría', 'Precio', 'Estado', 'Acciones'].map(h => (
            <span key={h} className="text-[10px] tracking-widest uppercase text-stone-500 font-medium">{h}</span>
          ))}
        </div>

        {productos.map((p, idx) => (
          <div key={p.id} className={`grid grid-cols-[64px_1fr_110px_75px_110px_150px] gap-3 px-4 py-4 border-b border-stone-100 items-center hover:bg-stone-50 transition-colors ${idx % 2 !== 0 ? 'bg-stone-50/40' : ''}`}>

            {/* Foto principal */}
            <button
              onClick={() => setImagenesId(p.id)}
              className="relative w-16 h-20 bg-stone-100 flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
              title="Gestionar fotos"
            >
              {p.imagen_url ? (
                <Image src={p.imagen_url} alt={p.nombre} fill className="object-cover object-top" sizes="64px" />
              ) : (
                <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>

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
              <div className="flex flex-col gap-1">
                <input type="number" value={editValues.precio} onChange={e => setEditValues(v => ({ ...v, precio: e.target.value }))}
                  placeholder="Precio" className="w-full border-b border-amanda-black text-xs py-0.5 bg-transparent focus:outline-none" />
                <input type="number" value={editValues.precio_original} onChange={e => setEditValues(v => ({ ...v, precio_original: e.target.value }))}
                  placeholder="Antes (0=sin oferta)" className="w-full border-b border-stone-300 text-xs py-0.5 bg-transparent focus:outline-none text-amanda-gray" />
              </div>
            ) : (
              <div>
                <span className="text-xs">${p.precio.toLocaleString('es-AR')}</span>
                {p.precio_original && p.precio_original > p.precio && (
                  <p className="text-[10px] text-rose-500 line-through">${p.precio_original.toLocaleString('es-AR')}</p>
                )}
              </div>
            )}

            {/* Estado */}
            {editando === p.id ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-1">
                  {[true, false].map(v => (
                    <button key={String(v)} onClick={() => setEditValues(ev => ({ ...ev, activo: v }))}
                      className={`text-[9px] tracking-widest uppercase px-2 py-1 border transition-colors ${editValues.activo === v ? 'bg-amanda-black text-white border-amanda-black' : 'border-amanda-lightgray text-amanda-gray'}`}>
                      {v ? 'Activo' : 'Inactivo'}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={editValues.es_nuevo} onChange={e => setEditValues(v => ({ ...v, es_nuevo: e.target.checked }))} className="w-3 h-3" />
                  <span className="text-[9px] tracking-widest uppercase text-amanda-gray">Nuevo</span>
                </label>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <span className={`text-[10px] tracking-widest uppercase px-2 py-1 border w-fit ${p.activo ? 'border-green-300 text-green-700 bg-green-50' : 'border-stone-300 text-stone-400'}`}>
                  {p.activo ? 'Activo' : 'Inactivo'}
                </span>
                {p.es_nuevo && (
                  <span className="text-[9px] tracking-widest uppercase text-amanda-black">Nuevo</span>
                )}
              </div>
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
                  <button onClick={() => { setEditando(p.id); setEditValues({ precio: String(p.precio), precio_original: p.precio_original ? String(p.precio_original) : '', es_nuevo: p.es_nuevo ?? false, activo: p.activo }); }}
                    className="text-[10px] tracking-widest uppercase text-amanda-gray hover:text-amanda-black">Editar</button>
                  <button onClick={() => setVariantesId(p.id)}
                    className="text-[10px] tracking-widest uppercase text-amanda-gray hover:text-amanda-black">Variantes</button>
                  <button onClick={() => setImagenesId(p.id)}
                    className="text-[10px] tracking-widest uppercase text-amanda-gray hover:text-amanda-black">Fotos</button>
                  <button onClick={() => setPublicarId(p.id)}
                    className="text-[10px] tracking-widest uppercase text-rose-500 hover:text-rose-700">Publicar</button>
                </>
              )}
            </div>
          </div>
        ))}
        </div>{/* min-w */}
        </div>{/* overflow-x-auto */}
      </div>
    </div>
  );
}
