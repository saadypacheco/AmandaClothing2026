'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTiendaConfig } from '@/hooks/useTiendaConfig';

// Rutas accesibles sin sesion incluso en modo mayorista
const RUTAS_PUBLICAS = [
  '/login',
  '/registro',
  '/registro-mayorista',
  '/cuenta-pendiente',
  '/mayorista',
  '/software',
];

function esPublica(pathname: string) {
  return RUTAS_PUBLICAS.some(r => pathname.startsWith(r));
}

/**
 * Guard global que aplica solo si tienda_config.modo === 'mayorista'.
 *
 * Reglas:
 * - Sin sesion → redirige a /login (salvo en rutas publicas).
 * - Sesion + tipo_cuenta=mayorista + estado != 'activo' → /cuenta-pendiente.
 * - Admin queda exento.
 *
 * En modo minorista NO hace nada, asi Amanda no se ve afectada.
 */
export function MayoristaGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { get, loading: cfgLoading } = useTiendaConfig();
  const [chequeado, setChequeado] = useState(false);

  useEffect(() => {
    if (cfgLoading) return;
    if (get('modo', 'minorista') !== 'mayorista') {
      setChequeado(true);
      return;
    }
    if (pathname.startsWith('/admin')) {
      setChequeado(true);
      return;
    }
    if (esPublica(pathname)) {
      setChequeado(true);
      return;
    }

    (async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login?mensaje=Esta tienda requiere cuenta mayorista');
        return;
      }

      const { data: perfil } = await supabase
        .from('usuarios')
        .select('rol, tipo_cuenta, estado_cuenta')
        .eq('id', session.user.id)
        .single();

      if (perfil?.rol === 'admin') {
        setChequeado(true);
        return;
      }
      if (perfil?.tipo_cuenta === 'mayorista' && perfil.estado_cuenta !== 'activo') {
        router.replace('/cuenta-pendiente');
        return;
      }
      if (perfil?.tipo_cuenta !== 'mayorista') {
        router.replace('/registro-mayorista');
        return;
      }
      setChequeado(true);
    })();
  }, [cfgLoading, get, pathname, router]);

  // No renderiza nada. Es solo logica de redireccion.
  return chequeado ? null : (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
