'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTiendaConfig } from '@/hooks/useTiendaConfig';

const API = process.env.NEXT_PUBLIC_API_URL;

const CONDICIONES_IVA = [
  { value: '', label: '-- Seleccionar --' },
  { value: 'responsable_inscripto', label: 'Responsable Inscripto' },
  { value: 'monotributo', label: 'Monotributista' },
  { value: 'exento', label: 'Exento' },
  { value: 'consumidor_final', label: 'Consumidor Final' },
];

export default function RegistroMayoristaPage() {
  const { get } = useTiendaConfig();
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: '',
    razon_social: '',
    cuit: '',
    condicion_iva: '',
    email: '',
    telefono_contacto: '',
    direccion_fiscal: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function upd<K extends keyof typeof form>(k: K, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register-mayorista`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          nombre: form.nombre,
          razon_social: form.razon_social || undefined,
          cuit: form.cuit || undefined,
          condicion_iva: form.condicion_iva || undefined,
          telefono_contacto: form.telefono_contacto || undefined,
          direccion_fiscal: form.direccion_fiscal || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || 'Error al registrarse');
      } else {
        setOk(true);
        setTimeout(() => router.push('/cuenta-pendiente'), 2500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  if (ok) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl text-amanda-black mb-2">Solicitud enviada</h2>
        <p className="text-sm text-amanda-gray">
          Un administrador revisará tu cuenta. Te avisaremos por email cuando esté aprobada.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-1">{get('nombre_tienda', 'Mi Tienda')}</p>
        <h1 className="text-2xl tracking-wide uppercase text-amanda-black">Solicitar cuenta mayorista</h1>
        <p className="text-xs text-amanda-gray mt-3">
          Completá tus datos. La cuenta queda pendiente hasta que un administrador la apruebe.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 border border-red-200 bg-red-50">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nombre y apellido *" value={form.nombre} onChange={v => upd('nombre', v)} required disabled={loading} />
          <Field label="Razón social" value={form.razon_social} onChange={v => upd('razon_social', v)} disabled={loading} />
          <Field label="CUIT" value={form.cuit} onChange={v => upd('cuit', v)} placeholder="20-12345678-9" disabled={loading} />
          <SelectField
            label="Condición IVA"
            value={form.condicion_iva}
            onChange={v => upd('condicion_iva', v)}
            options={CONDICIONES_IVA}
            disabled={loading}
          />
          <Field label="Email *" value={form.email} onChange={v => upd('email', v)} type="email" required disabled={loading} />
          <Field label="Teléfono" value={form.telefono_contacto} onChange={v => upd('telefono_contacto', v)} type="tel" disabled={loading} />
        </div>
        <Field label="Dirección fiscal" value={form.direccion_fiscal} onChange={v => upd('direccion_fiscal', v)} disabled={loading} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Contraseña *" value={form.password} onChange={v => upd('password', v)} type="password" required disabled={loading} />
          <Field label="Confirmar contraseña *" value={form.confirmPassword} onChange={v => upd('confirmPassword', v)} type="password" required disabled={loading} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amanda-black text-amanda-white text-[10px] tracking-widest uppercase py-4 hover:bg-amanda-gray transition-colors disabled:opacity-50 mt-2"
        >
          {loading ? 'Enviando solicitud...' : 'Solicitar cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-[10px] tracking-widest uppercase text-amanda-gray">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="text-amanda-black hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', placeholder, required, disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-widest uppercase text-amanda-gray mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full border border-amanda-lightgray px-3 py-2.5 text-xs text-amanda-black placeholder-amanda-gray outline-none focus:border-amanda-black transition-colors disabled:opacity-50"
      />
    </div>
  );
}

function SelectField({
  label, value, onChange, options, disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-widest uppercase text-amanda-gray mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full border border-amanda-lightgray px-3 py-2.5 text-xs text-amanda-black outline-none focus:border-amanda-black transition-colors disabled:opacity-50 bg-white"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
