'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function LoginContent() {
  const searchParams = useSearchParams();
  const { login, loading, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [message, setMessage] = useState(searchParams.get('mensaje') || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage('');

    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email es requerido';
    if (!password) newErrors.password = 'Contraseña es requerida';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const success = await login(email, password);
    if (!success && authError) {
      setMessage(authError);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <h1 className="text-3xl font-bold text-center text-boutique-primary mb-2">
        Boutique
      </h1>
      <p className="text-center text-gray-600 text-sm mb-6">
        Accede a tu cuenta
      </p>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={loading}
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={loading}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          className="w-full"
        >
          Iniciar sesión
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link href="/registro" className="font-semibold text-boutique-accent hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Al continuar, aceptas nuestros términos de servicio
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-white rounded-lg shadow-xl p-8" />}>
      <LoginContent />
    </Suspense>
  );
}
