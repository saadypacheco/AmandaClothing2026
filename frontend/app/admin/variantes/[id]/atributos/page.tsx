'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const API = process.env.NEXT_PUBLIC_API_URL;

interface Variante {
  id: number;
  producto_id: number;
  talla: string;
  color: string;
  sku: string;
}

interface Producto {
  id: number;
  nombre: string;
  categoria_id: number | null;
}

interface AtributoDef {
  id: number;
  clave: string;
  nombre: string;
  tipo: string;
  valores_permitidos: string[] | null;
  obligatorio: boolean;
}

interface AtributoValor {
  id: number;
  atributo_id: number;
  valor: string;
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

export default function AtributosVariantePage() {
  const params = useParams();
  const router = useRouter();
  const varianteId = parseInt(params?.id as string);

  const [variante, setVariante] = useState<Variante | null>(null);
  const [producto, setProducto] = useState<Producto | null>(null);
  const [atributosDef, setAtributosDef] = useState<AtributoDef[]>([]);
  const [valores, setValores] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => { cargar(); }, [varianteId]);

  async function cargar() {
    setLoading(true);

    const supabase = createClient();
    // Buscar la variante para conocer su producto y categoria
    const { data: variantes } = await supabase
      .from('variantes').select('*, productos(id, nombre, categoria_id)').eq('id', varianteId).single();

    if (!variantes) {
      setLoading(false);
      return;
    }
    setVariante(variantes);
    setProducto(variantes.productos);

    const categoriaId = variantes.productos?.categoria_id;
    if (!categoriaId) {
      setLoading(false);
      return;
    }

    // Cargar atributos de la categoria y valores actuales en paralelo
    const [defsRes, valoresRes] = await Promise.all([
      authFetch(`${API}/admin/categorias/${categoriaId}/atributos`),
      authFetch(`${API}/admin/variantes/${varianteId}/atributos`),
    ]);

    if (defsRes.ok) setAtributosDef(await defsRes.json());
    if (valoresRes.ok) {
      const data: AtributoValor[] = await valoresRes.json();
      const mapa: Record<number, string> = {};
      data.forEach(v => { mapa[v.atributo_id] = v.valor; });
      setValores(mapa);
    }
    setLoading(false);
  }

  async function guardar() {
    setSaving(true);
    setOk(false);
    const valoresArray = Object.entries(valores)
      .filter(([, v]) => v && v.trim())
      .map(([atrId, valor]) => ({ atributo_id: parseInt(atrId), valor }));

    const res = await authFetch(`${API}/admin/variantes/${varianteId}/atributos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valores: valoresArray }),
    });
    setSaving(false);
    if (res.ok) {
      setOk(true);
      setTimeout(() => setOk(false), 2500);
    }
  }

  if (loading) return <p className="text-sm text-stone-400">Cargando...</p>;
  if (!variante) return <p className="text-sm text-stone-400">Variante no encontrada.</p>;

  return (
    <div>
      <button onClick={() => router.back()}
        className="text-[10px] tracking-widest uppercase text-stone-400 hover:text-stone-900">
        ← Volver
      </button>

      <div className="mt-2 mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">
          Atributos de variante
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          <strong>{producto?.nombre}</strong> — {variante.talla} / {variante.color} ({variante.sku})
        </p>
      </div>

      {atributosDef.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <p className="text-sm text-stone-500">
            La categoría de este producto no tiene atributos definidos.
          </p>
          {producto?.categoria_id && (
            <Link href={`/admin/categorias/${producto.categoria_id}/atributos`}
              className="inline-block mt-3 text-[10px] tracking-widest uppercase text-stone-900 hover:underline">
              Definir atributos →
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4 max-w-2xl">
          {atributosDef.map(a => (
            <div key={a.id}>
              <label className="block text-xs tracking-widest uppercase text-stone-700 mb-1">
                {a.nombre} {a.obligatorio && <span className="text-rose-500">*</span>}
              </label>
              {a.tipo === 'select' && a.valores_permitidos ? (
                <select
                  value={valores[a.id] || ''}
                  onChange={e => setValores(v => ({ ...v, [a.id]: e.target.value }))}
                  className="w-full border border-stone-200 px-3 py-2 text-sm rounded"
                >
                  <option value="">—</option>
                  {a.valores_permitidos.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              ) : a.tipo === 'booleano' ? (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={valores[a.id] === 'true'}
                    onChange={e => setValores(v => ({ ...v, [a.id]: e.target.checked ? 'true' : 'false' }))}
                  />
                  Sí
                </label>
              ) : a.tipo === 'numero' ? (
                <input
                  type="number"
                  value={valores[a.id] || ''}
                  onChange={e => setValores(v => ({ ...v, [a.id]: e.target.value }))}
                  className="w-full border border-stone-200 px-3 py-2 text-sm rounded"
                />
              ) : (
                <input
                  type="text"
                  value={valores[a.id] || ''}
                  onChange={e => setValores(v => ({ ...v, [a.id]: e.target.value }))}
                  className="w-full border border-stone-200 px-3 py-2 text-sm rounded"
                />
              )}
            </div>
          ))}

          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            {ok && <p className="text-xs text-emerald-600">Guardado ✓</p>}
            <button onClick={guardar} disabled={saving}
              className="ml-auto bg-stone-900 text-white text-xs tracking-widest uppercase px-5 py-2 hover:bg-stone-700 rounded disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar atributos'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
