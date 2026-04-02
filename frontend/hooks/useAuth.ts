'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const router = useRouter();
  const supabase = createClient();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          // "Auth session missing" es estado normal cuando no hay sesión iniciada
          setState(s => ({ ...s, user: null, loading: false }));
          return;
        }

        setState(s => ({
          ...s,
          user,
          loading: false,
          error: null,
        }));
      } catch (err) {
        setState(s => ({
          ...s,
          error: err instanceof Error ? err.message : 'Error desconocido',
          loading: false,
        }));
      }
    };

    getCurrentUser();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(s => ({
        ...s,
        user: session?.user ?? null,
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const login = async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setState(s => ({ ...s, error: error.message, loading: false }));
        return false;
      }

      setState(s => ({ ...s, loading: false }));
      router.push('/');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setState(s => ({ ...s, error: message, loading: false }));
      return false;
    }
  };

  const register = async (email: string, password: string, nombre: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
          },
        },
      });

      if (error) {
        setState(s => ({ ...s, error: error.message, loading: false }));
        return false;
      }

      setState(s => ({ ...s, loading: false }));
      // El usuario necesita confirmar su email antes de poder loguear
      // Redirigir a login con mensaje
      router.push('/login?mensaje=Revisa tu email para confirmar tu cuenta');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrarse';
      setState(s => ({ ...s, error: message, loading: false }));
      return false;
    }
  };

  const logout = async () => {
    setState(s => ({ ...s, loading: true }));
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setState(s => ({ ...s, error: error.message, loading: false }));
        return false;
      }

      setState(s => ({ ...s, user: null, loading: false }));
      router.push('/');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cerrar sesión';
      setState(s => ({ ...s, error: message, loading: false }));
      return false;
    }
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
  };
};
