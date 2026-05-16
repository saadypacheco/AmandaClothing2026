'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

interface StepProps {
  values: Record<string, string>;
  setValue: (k: string, v: string) => void;
}

// ── Paso 1: Identidad ───────────────────────────────────────────────────────
function Paso1Identidad({ values, setValue }: StepProps) {
  const modo = values.modo || 'minorista';
  return (
    <div className="space-y-5">
      <h2 className="font-serif text-2xl text-stone-900">Contanos de tu marca</h2>
      <p className="text-sm text-stone-500">Estos datos aparecen en el navbar, el pie de pagina y los mensajes de WhatsApp.</p>

      <Field label="Tipo de tienda" hint="Definí el modelo de venta. Podés cambiarlo después pero impacta toda la UX.">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue('modo', 'minorista')}
            className={`p-4 border rounded text-left transition-colors ${
              modo === 'minorista' ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-400'
            }`}
          >
            <p className="text-sm font-medium text-stone-900">Minorista (B2C)</p>
            <p className="text-[11px] text-stone-500 mt-1">Catálogo público, pago con MercadoPago, consumidor final.</p>
          </button>
          <button
            type="button"
            onClick={() => setValue('modo', 'mayorista')}
            className={`p-4 border rounded text-left transition-colors ${
              modo === 'mayorista' ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-400'
            }`}
          >
            <p className="text-sm font-medium text-stone-900">Mayorista (B2B)</p>
            <p className="text-[11px] text-stone-500 mt-1">Catálogo privado, listas de precios, cuenta corriente, cotización.</p>
          </button>
        </div>
      </Field>

      <Field label="Nombre completo de la tienda" hint="Ej: Luna Boutique">
        <input type="text" value={values.nombre_tienda || ''} onChange={e => setValue('nombre_tienda', e.target.value)}
          className="input" placeholder="Mi Tienda" />
      </Field>

      <Field label="Nombre corto" hint="Se usa en saludos ('Hola Luna!') y el sidebar admin">
        <input type="text" value={values.nombre_corto || ''} onChange={e => setValue('nombre_corto', e.target.value)}
          className="input" placeholder="Luna" />
      </Field>

      <Field label="Descripcion (SEO)" hint="Frase corta que aparece en Google y al compartir el link">
        <textarea value={values.descripcion || ''} onChange={e => setValue('descripcion', e.target.value)}
          rows={2} className="input" placeholder="Moda con identidad..." />
      </Field>

      <Field label="URL del logo" hint="Opcional. Si esta vacio se muestra el nombre como texto">
        <input type="text" value={values.logo_url || ''} onChange={e => setValue('logo_url', e.target.value)}
          className="input" placeholder="https://..." />
      </Field>
    </div>
  );
}

// ── Paso 2: Contacto ────────────────────────────────────────────────────────
function Paso2Contacto({ values, setValue }: StepProps) {
  return (
    <div className="space-y-5">
      <h2 className="font-serif text-2xl text-stone-900">¿Como te contactan?</h2>
      <p className="text-sm text-stone-500">El boton flotante de WhatsApp y el link del carrito usan estos datos.</p>

      <Field label="Numero de WhatsApp" hint="Sin + ni espacios. Formato internacional. Ej: 5491133821989">
        <input type="text" value={values.whatsapp_numero || ''} onChange={e => setValue('whatsapp_numero', e.target.value.replace(/\D/g, ''))}
          className="input" placeholder="5491133821989" />
      </Field>

      <Field label="Email de contacto" hint="Opcional">
        <input type="email" value={values.email || ''} onChange={e => setValue('email', e.target.value)}
          className="input" placeholder="hola@mitienda.com" />
      </Field>

      <Field label="Alias bancario" hint="Para mostrar en el checkout de transferencias">
        <input type="text" value={values.alias_bancario || ''} onChange={e => setValue('alias_bancario', e.target.value.toUpperCase())}
          className="input" placeholder="MI.TIENDA.ALIAS" />
      </Field>
    </div>
  );
}

// ── Paso 3: Branding ────────────────────────────────────────────────────────
function Paso3Branding({ values, setValue }: StepProps) {
  const paletas = [
    { nombre: 'Minimalista (default)', primario: '#0a0a0a', acento: '#c9a882', fondo: '#fafafa' },
    { nombre: 'Rosa suave', primario: '#2d1f1f', acento: '#d48a8a', fondo: '#fdf7f7' },
    { nombre: 'Verde bosque', primario: '#1a2b1e', acento: '#6b8e5a', fondo: '#f8faf6' },
    { nombre: 'Azul marino', primario: '#0a1a2e', acento: '#4a7ba8', fondo: '#f6f9fc' },
    { nombre: 'Vino tinto', primario: '#2e0a0f', acento: '#a84a5e', fondo: '#fcf6f7' },
  ];

  const aplicarPaleta = (p: typeof paletas[0]) => {
    setValue('color_primario', p.primario);
    setValue('color_acento', p.acento);
    setValue('color_fondo', p.fondo);
  };

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-2xl text-stone-900">Elegi tu paleta</h2>
      <p className="text-sm text-stone-500">Podes empezar con una paleta predefinida o personalizar cada color.</p>

      <div>
        <p className="text-xs text-stone-400 mb-2 tracking-widest uppercase">Paletas sugeridas</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {paletas.map(p => (
            <button key={p.nombre} onClick={() => aplicarPaleta(p)}
              className="p-3 border border-stone-200 hover:border-stone-900 text-left rounded transition-colors">
              <div className="flex gap-1 mb-2">
                <div className="w-5 h-5 rounded" style={{ background: p.primario }} />
                <div className="w-5 h-5 rounded" style={{ background: p.acento }} />
                <div className="w-5 h-5 rounded border border-stone-200" style={{ background: p.fondo }} />
              </div>
              <p className="text-[10px] text-stone-600">{p.nombre}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <ColorField label="Primario" value={values.color_primario || '#0a0a0a'} onChange={v => setValue('color_primario', v)} />
        <ColorField label="Acento" value={values.color_acento || '#c9a882'} onChange={v => setValue('color_acento', v)} />
        <ColorField label="Fondo" value={values.color_fondo || '#fafafa'} onChange={v => setValue('color_fondo', v)} />
      </div>

      <div className="pt-4 border-t border-stone-200">
        <Field label="Moneda" hint="Codigo ISO (ARS, USD, EUR, MXN, CLP, PEN, UYU, BRL)">
          <select value={values.moneda_codigo || 'ARS'} onChange={e => {
            const map: Record<string, string> = {
              ARS: 'es-AR', USD: 'en-US', EUR: 'es-ES', MXN: 'es-MX',
              CLP: 'es-CL', PEN: 'es-PE', UYU: 'es-UY', BRL: 'pt-BR',
            };
            setValue('moneda_codigo', e.target.value);
            setValue('moneda_locale', map[e.target.value] || 'es-AR');
          }} className="input">
            <option value="ARS">ARS — Peso argentino</option>
            <option value="USD">USD — Dolar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="MXN">MXN — Peso mexicano</option>
            <option value="CLP">CLP — Peso chileno</option>
            <option value="PEN">PEN — Sol peruano</option>
            <option value="UYU">UYU — Peso uruguayo</option>
            <option value="BRL">BRL — Real brasileno</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

// ── Paso 4: Textos del home ─────────────────────────────────────────────────
function Paso4Home({ values, setValue }: StepProps) {
  return (
    <div className="space-y-5">
      <h2 className="font-serif text-2xl text-stone-900">Textos de la home</h2>
      <p className="text-sm text-stone-500">Estos son los titulos grandes que ve el cliente al entrar a tu tienda.</p>

      <Field label="Titulo principal (hero)">
        <input type="text" value={values.hero_titulo || ''} onChange={e => setValue('hero_titulo', e.target.value)}
          className="input" placeholder="Mi Tienda" />
      </Field>

      <Field label="Subtitulo del hero">
        <input type="text" value={values.hero_subtitulo || ''} onChange={e => setValue('hero_subtitulo', e.target.value)}
          className="input" placeholder="nueva coleccion" />
      </Field>

      <Field label="Statement 1" hint="Frase corta debajo del hero">
        <input type="text" value={values.statement_1 || ''} onChange={e => setValue('statement_1', e.target.value)}
          className="input" placeholder="Ropa que habla por vos." />
      </Field>

      <Field label="Statement 2" hint="Segunda frase (color acento)">
        <input type="text" value={values.statement_2 || ''} onChange={e => setValue('statement_2', e.target.value)}
          className="input" placeholder="Disenada para quedarse." />
      </Field>
    </div>
  );
}

// ── Helpers UI ──────────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-stone-700 mb-1">{label}</label>
      {hint && <p className="text-[10px] text-stone-400 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-stone-700 mb-1">{label}</label>
      <div className="flex gap-2 items-center">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-10 h-10 border border-stone-300 rounded cursor-pointer" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          className="input flex-1 font-mono text-xs" />
      </div>
    </div>
  );
}

// ── Wizard principal ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Identidad', claves: ['modo', 'nombre_tienda', 'nombre_corto', 'descripcion', 'logo_url'] },
  { id: 2, label: 'Contacto', claves: ['whatsapp_numero', 'email', 'alias_bancario'] },
  { id: 3, label: 'Branding', claves: ['color_primario', 'color_acento', 'color_fondo', 'moneda_codigo', 'moneda_locale'] },
  { id: 4, label: 'Home', claves: ['hero_titulo', 'hero_subtitulo', 'statement_1', 'statement_2'] },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authFetch(`${API}/admin/config`)
      .then(r => r.ok ? r.json() : [])
      .then((data: { clave: string; valor: string }[]) => {
        const v: Record<string, string> = {};
        data.forEach(item => { v[item.clave] = item.valor; });
        setValues(v);
      })
      .finally(() => setLoading(false));
  }, []);

  const setValue = (k: string, v: string) => setValues(prev => ({ ...prev, [k]: v }));

  const handleNext = async () => {
    const claves = STEPS[step - 1].claves;
    const items: Record<string, string> = {};
    claves.forEach(k => { if (values[k] !== undefined) items[k] = values[k]; });

    setSaving(true);
    await authFetch(`${API}/admin/config/bulk`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
    setSaving(false);

    if (step < STEPS.length) {
      setStep(step + 1);
    } else {
      // Ultimo paso: marcar onboarding completado
      await authFetch(`${API}/admin/config/bulk`, {
        method: 'POST',
        body: JSON.stringify({ items: { onboarding_completado: 'true' } }),
      });
      invalidateConfigCache();
      router.push('/admin/dashboard');
    }
  };

  if (loading) return <p className="text-sm text-stone-400">Cargando...</p>;

  const StepComponent = [Paso1Identidad, Paso2Contacto, Paso3Branding, Paso4Home][step - 1];

  return (
    <div className="max-w-2xl mx-auto">
      <style>{`
        .input {
          width: 100%;
          border: 1px solid #d6d3d1;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: #0a0a0a;
          background: white;
          border-radius: 0.25rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus { border-color: #0a0a0a; }
      `}</style>

      {/* Header con progreso */}
      <div className="mb-8">
        <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-2">Bienvenido</p>
        <h1 className="font-serif text-3xl text-stone-900 mb-6">Configuremos tu tienda</h1>

        <div className="flex items-center gap-2">
          {STEPS.map(s => (
            <div key={s.id} className="flex-1 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                s.id < step ? 'bg-emerald-500 text-white' :
                s.id === step ? 'bg-stone-900 text-white' :
                'bg-stone-200 text-stone-400'
              }`}>
                {s.id < step ? '✓' : s.id}
              </div>
              <p className={`text-xs tracking-widest uppercase hidden sm:block ${
                s.id === step ? 'text-stone-900 font-medium' : 'text-stone-400'
              }`}>{s.label}</p>
              {s.id < STEPS.length && <div className="flex-1 h-px bg-stone-200" />}
            </div>
          ))}
        </div>
      </div>

      {/* Contenido del paso */}
      <div className="bg-white border border-stone-200 p-6 md:p-8 rounded">
        <StepComponent values={values} setValue={setValue} />

        <div className="mt-8 pt-6 border-t border-stone-200 flex justify-between items-center">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className="text-xs tracking-widest uppercase text-stone-400 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed">
            ← Anterior
          </button>

          <button
            onClick={handleNext}
            disabled={saving}
            className="bg-stone-900 text-white text-xs tracking-widest uppercase px-6 py-3 hover:bg-stone-700 disabled:opacity-50">
            {saving ? 'Guardando...' : (step === STEPS.length ? 'Finalizar' : 'Siguiente →')}
          </button>
        </div>
      </div>

      <p className="text-center text-[10px] text-stone-400 mt-4 tracking-widest uppercase">
        Podes editar todo despues desde <a href="/admin/configuracion" className="underline hover:text-stone-900">Configuracion</a>
      </p>
    </div>
  );
}
