'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTiendaConfig } from '@/hooks/useTiendaConfig';

function RegistroForm() {
  const { register, loading, error: authError } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const { get, loading: cfgLoading } = useTiendaConfig();

  // Si la tienda es mayorista, redirigir al registro B2B
  useEffect(() => {
    if (!cfgLoading && get('modo', 'minorista') === 'mayorista') {
      router.replace('/registro-mayorista');
    }
  }, [cfgLoading, get, router]);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    nombre?: string;
    email?: string;
    telefono?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Pre-rellenar desde query params (viene de checkout guest)
  useEffect(() => {
    const tel = params.get('telefono');
    const nom = params.get('nombre');
    if (tel) setTelefono(tel);
    if (nom) setNombre(nom);
  }, [params]);

  const vieneDeCheckout = !!params.get('telefono');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};
    if (!nombre.trim()) newErrors.nombre = 'Ingresá tu nombre';
    if (!email.trim()) newErrors.email = 'Ingresá tu email';
    if (!password) newErrors.password = 'Ingresá una contraseña';
    if (password && password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await register(email, password, nombre.trim(), telefono.trim() || undefined);
  };

  return (
    <div className="w-full max-w-sm">
      {vieneDeCheckout && (
        <div className="mb-6 border border-amanda-lightgray px-4 py-3 bg-stone-50">
          <p className="text-[10px] tracking-widest uppercase text-amanda-gray">
            Al crear tu cuenta con este celular, tu pedido anterior aparecerá automáticamente en tu historial.
          </p>
        </div>
      )}

      {authError && (
        <div className="mb-4 px-4 py-3 border border-red-200 bg-red-50">
          <p className="text-xs text-red-600">{authError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] tracking-widest uppercase text-amanda-gray mb-1.5">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Tu nombre"
            disabled={loading}
            className="w-full border border-amanda-lightgray px-3 py-2.5 text-xs text-amanda-black placeholder-amanda-gray outline-none focus:border-amanda-black transition-colors disabled:opacity-50"
          />
          {errors.nombre && <p className="text-[10px] text-red-500 mt-1">{errors.nombre}</p>}
        </div>

        <div>
          <label className="block text-[10px] tracking-widest uppercase text-amanda-gray mb-1.5">
            Celular <span className="normal-case text-[9px]">(para rastrear pedidos)</span>
          </label>
          <input
            type="tel"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            placeholder="Ej: 1133821989"
            disabled={loading}
            className="w-full border border-amanda-lightgray px-3 py-2.5 text-xs text-amanda-black placeholder-amanda-gray outline-none focus:border-amanda-black transition-colors disabled:opacity-50"
          />
          {errors.telefono && <p className="text-[10px] text-red-500 mt-1">{errors.telefono}</p>}
        </div>

        <div>
          <label className="block text-[10px] tracking-widest uppercase text-amanda-gray mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            disabled={loading}
            className="w-full border border-amanda-lightgray px-3 py-2.5 text-xs text-amanda-black placeholder-amanda-gray outline-none focus:border-amanda-black transition-colors disabled:opacity-50"
          />
          {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-[10px] tracking-widest uppercase text-amanda-gray mb-1.5">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            className="w-full border border-amanda-lightgray px-3 py-2.5 text-xs text-amanda-black placeholder-amanda-gray outline-none focus:border-amanda-black transition-colors disabled:opacity-50"
          />
          {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-[10px] tracking-widest uppercase text-amanda-gray mb-1.5">Confirmar contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            className="w-full border border-amanda-lightgray px-3 py-2.5 text-xs text-amanda-black placeholder-amanda-gray outline-none focus:border-amanda-black transition-colors disabled:opacity-50"
          />
          {errors.confirmPassword && <p className="text-[10px] text-red-500 mt-1">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amanda-black text-amanda-white text-[10px] tracking-widest uppercase py-4 hover:bg-amanda-gray transition-colors disabled:opacity-50 mt-2"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
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

export default function RegistroPage() {
  const { get } = useTiendaConfig();
  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <p className="text-[10px] tracking-widest uppercase text-amanda-gray mb-1">{get('nombre_tienda', 'Mi Tienda')}</p>
        <h1 className="text-2xl tracking-wide uppercase text-amanda-black">Crear cuenta</h1>
      </div>
      <Suspense>
        <RegistroForm />
      </Suspense>
    </div>
  );
}
