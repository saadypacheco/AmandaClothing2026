'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/productos', label: 'Productos' },
  { href: '/admin/categorias', label: 'Categorías' },
  { href: '/admin/pedidos', label: 'Pedidos' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    const verificar = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login?mensaje=Necesitás iniciar sesión'); return; }
      const { data } = await supabase.from('usuarios').select('rol').eq('id', user.id).single();
      if (data?.rol !== 'admin') { router.replace('/'); return; }
      setVerificado(true);
    };
    verificar();
  }, [router]);

  if (!verificado) return (
    <div className="min-h-screen bg-amanda-white flex items-center justify-center">
      <p className="text-[10px] tracking-widest uppercase text-amanda-gray">Verificando acceso...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-48 bg-amanda-black text-white flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-white/10">
          <span className="font-serif text-sm tracking-widest uppercase">Amanda</span>
          <p className="text-[10px] text-white/40 tracking-widest uppercase mt-0.5">Admin</p>
        </div>
        <nav className="flex-1 px-4 py-4 flex flex-col gap-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`text-xs tracking-widest uppercase px-3 py-2.5 rounded transition-colors ${
                pathname === item.href
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <Link href="/" className="text-[10px] tracking-widest uppercase text-white/30 hover:text-white/70 transition-colors">
            ← Ver tienda
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-screen-xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
