'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { invalidateConfigCache } from '@/hooks/useTiendaConfig';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function authFetch(url: string, options: RequestInit = {}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

interface ConfigItem {
  id: number;
  clave: string;
  valor: string;
  tipo: string;
  grupo: string;
  descripcion: string | null;
}

const GRUPO_LABELS: Record<string, string> = {
  marca: 'Marca',
  contacto: 'Contacto',
  home: 'Página principal',
  pago: 'Pagos',
  ia: 'Asistente IA',
  sitio: 'Sitio web',
};

const GRUPO_ORDER = ['marca', 'contacto', 'home', 'pago', 'ia', 'sitio'];

export default function ConfiguracionPage() {
  const [items, setItems] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    const res = await authFetch(`${API}/admin/config`);
    if (res.ok) {
      const data: ConfigItem[] = await res.json();
      setItems(data);
      const values: Record<string, string> = {};
      data.forEach(item => { values[item.clave] = item.valor; });
      setEditValues(values);
    }
    setLoading(false);
  }

  function flash(text: string, ok = true) {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleSave() {
    setSaving(true);
    const changed: Record<string, string> = {};
    items.forEach(item => {
      if (editValues[item.clave] !== item.valor) {
        changed[item.clave] = editValues[item.clave];
      }
    });

    if (Object.keys(changed).length === 0) {
      flash('No hay cambios para guardar');
      setSaving(false);
      return;
    }

    const res = await authFetch(`${API}/admin/config/bulk`, {
      method: 'POST',
      body: JSON.stringify({ items: changed }),
    });

    if (res.ok) {
      invalidateConfigCache();
      await fetchConfig();
      flash(`${Object.keys(changed).length} campo(s) actualizados`);
    } else {
      flash('Error al guardar', false);
    }
    setSaving(false);
  }

  const grouped = GRUPO_ORDER.map(grupo => ({
    grupo,
    label: GRUPO_LABELS[grupo] || grupo,
    items: items.filter(i => i.grupo === grupo),
  })).filter(g => g.items.length > 0);

  if (loading) return <p className="text-xs tracking-widest uppercase text-amanda-gray animate-pulse">Cargando configuración...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl">Configuración de la tienda</h1>
          <p className="text-xs text-amanda-gray mt-1">Personaliza nombre, contacto, textos y más</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-amanda-black text-white text-xs tracking-widest uppercase px-6 py-3 hover:bg-amanda-gray transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      {msg && (
        <div className={`mb-6 px-4 py-3 text-xs ${msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'} rounded`}>
          {msg.text}
        </div>
      )}

      <div className="space-y-10">
        {grouped.map(group => (
          <section key={group.grupo}>
            <h2 className="text-sm tracking-widest uppercase text-amanda-gray border-b border-stone-200 pb-2 mb-6">
              {group.label}
            </h2>
            <div className="space-y-5">
              {group.items.map(item => (
                <div key={item.clave} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 items-start">
                  <div>
                    <label className="text-xs font-medium text-amanda-black block">
                      {item.clave.replace(/_/g, ' ')}
                    </label>
                    {item.descripcion && (
                      <p className="text-[10px] text-amanda-gray mt-0.5">{item.descripcion}</p>
                    )}
                  </div>
                  {item.tipo === 'json' || (editValues[item.clave] || '').length > 100 ? (
                    <textarea
                      value={editValues[item.clave] || ''}
                      onChange={e => setEditValues(v => ({ ...v, [item.clave]: e.target.value }))}
                      rows={4}
                      className="w-full border border-stone-300 px-3 py-2 text-sm text-amanda-black bg-white focus:outline-none focus:border-amanda-black rounded font-mono"
                    />
                  ) : (
                    <input
                      type="text"
                      value={editValues[item.clave] || ''}
                      onChange={e => setEditValues(v => ({ ...v, [item.clave]: e.target.value }))}
                      className="w-full border border-stone-300 px-3 py-2 text-sm text-amanda-black bg-white focus:outline-none focus:border-amanda-black rounded"
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
