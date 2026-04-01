'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    const verificar = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login?mensaje=Necesitás iniciar sesión');
        return;
      }

      const { data } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single();

      if (data?.rol !== 'admin') {
        router.replace('/');
        return;
      }

      setVerificado(true);
    };

    verificar();
  }, [router]);

  if (!verificado) {
    return (
      <div className="min-h-screen bg-amanda-white flex items-center justify-center">
        <p className="text-[10px] tracking-widest uppercase text-amanda-gray">Verificando acceso...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-amanda-black text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-serif text-sm tracking-widest uppercase">Amanda — Admin</span>
          <nav className="flex gap-4">
            <a href="/admin/productos" className="text-xs tracking-widest uppercase text-white/70 hover:text-white transition-colors">
              Productos
            </a>
          </nav>
        </div>
        <a href="/" className="text-xs tracking-widest uppercase text-white/50 hover:text-white transition-colors">
          Ver tienda →
        </a>
      </header>
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
