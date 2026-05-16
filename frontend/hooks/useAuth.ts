'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useCartStore } from '@/store/cart';

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
      // getSession lee del cache local — sin request de red, sin lock
      const { data: { session } } = await supabase.auth.getSession();
      setState(s => ({ ...s, user: session?.user ?? null, loading: false, error: null }));
    };

    getCurrentUser();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setState(s => ({ ...s, user: session?.user ?? null }));

      // Restaurar carrito guardado si el mismo usuario vuelve a entrar
      if (event === 'SIGNED_IN' && session?.user) {
        const key = `boutique-cart-user-${session.user.id}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            useCartStore.getState().restoreItems(JSON.parse(saved));
            localStorage.removeItem(key);
          } catch { /* ignorar */ }
        }
      }
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

      // Verificar rol + estado de cuenta para redirigir según corresponda
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('rol, tipo_cuenta, estado_cuenta')
          .eq('id', user.id)
          .single();

        if (perfil?.rol === 'admin') {
          setState(s => ({ ...s, loading: false }));
          router.push('/admin/dashboard');
          return true;
        }

        // Cuenta mayorista no activa → pantalla de espera
        if (perfil?.tipo_cuenta === 'mayorista' && perfil?.estado_cuenta && perfil.estado_cuenta !== 'activo') {
          setState(s => ({ ...s, loading: false }));
          router.push('/cuenta-pendiente');
          return true;
        }
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

  const register = async (email: string, password: string, nombre: string, telefono?: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const API = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nombre, telefono: telefono || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        setState(s => ({ ...s, error: data.detail || 'Error al registrarse', loading: false }));
        return false;
      }

      setState(s => ({ ...s, loading: false }));
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
