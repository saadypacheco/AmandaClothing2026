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
  { href: '/admin/consultas', label: 'Consultas' },
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
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-stone-400">Verificando acceso...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex">

      {/* ── Sidebar desktop (md+) ─────────────────────────────── */}
      <aside className="hidden md:flex w-48 border-r border-stone-200 flex-col shrink-0 fixed top-16 bottom-0 bg-stone-50">
        <div className="px-6 py-6 border-b border-stone-200">
          <p className="font-serif text-base tracking-widest uppercase text-stone-900">Amanda</p>
          <p className="text-[10px] tracking-widest uppercase text-stone-400 mt-0.5">Panel</p>
        </div>
        <nav className="flex-1 px-6 py-6 flex flex-col gap-1">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`text-xs tracking-widest uppercase py-2 transition-colors border-b border-transparent ${
                  active ? 'text-stone-900 font-medium border-b-stone-900' : 'text-stone-400 hover:text-stone-900'
                }`}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-6 border-t border-stone-200">
          <Link href="/" className="text-[10px] tracking-widest uppercase text-stone-400 hover:text-stone-900 transition-colors">
            ← Ver tienda
          </Link>
        </div>
      </aside>

      {/* ── Nav mobile (barra inferior) ───────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 flex">
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex-1 py-3 text-center text-[9px] tracking-widest uppercase transition-colors ${
                active ? 'text-stone-900 font-semibold' : 'text-stone-400'
              }`}>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ── Contenido ─────────────────────────────────────────── */}
      <main className="flex-1 md:ml-48 min-h-screen bg-stone-50 pt-16 pb-16 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
