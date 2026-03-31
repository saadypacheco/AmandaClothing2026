'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegistroPage() {
  const { register, loading, error: authError } = useAuth();
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    nombre?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validación
    const newErrors: typeof errors = {};
    if (!nombre) newErrors.nombre = 'Nombre es requerido';
    if (!email) newErrors.email = 'Email es requerido';
    if (!password) newErrors.password = 'Contraseña es requerida';
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (password && password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await register(email, password, nombre);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <h1 className="text-3xl font-bold text-center text-boutique-primary mb-2">
        Boutique
      </h1>
      <p className="text-center text-gray-600 text-sm mb-6">
        Crea tu cuenta
      </p>

      {authError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          type="text"
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          error={errors.nombre}
          disabled={loading}
        />

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

        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          disabled={loading}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          className="w-full"
        >
          Registrarse
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-boutique-accent hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Al registrarte, aceptas nuestros términos de servicio
        </p>
      </div>
    </div>
  );
}
