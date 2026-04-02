'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { createClient } from '@/lib/supabase/client';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const itemCount = useCartStore(s => s.itemCount);
  const openCart = useCartStore(s => s.openCart);
  const pathname = usePathname();

  const isHome = pathname === '/';
  const transparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('usuarios').select('rol').eq('id', user.id).single();
      setIsAdmin(data?.rol === 'admin');
    };
    checkAdmin();
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${transparent ? 'bg-transparent' : 'navbar-scrolled'}`}>
      <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Nav izquierda */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/productos?categoria=vestidos" className={`link-underline text-xs tracking-widest uppercase ${transparent ? 'text-white drop-shadow-md' : 'text-amanda-black'}`}>
            Vestidos
          </Link>
          <Link href="/productos?categoria=pantalones" className={`link-underline text-xs tracking-widest uppercase ${transparent ? 'text-white drop-shadow-md' : 'text-amanda-black'}`}>
            Pantalones
          </Link>
          <Link href="/productos?categoria=camperas" className={`link-underline text-xs tracking-widest uppercase ${transparent ? 'text-white drop-shadow-md' : 'text-amanda-black'}`}>
            Camperas
          </Link>
        </nav>

        {/* Logo centrado */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <span className={`font-serif text-xl tracking-widest2 uppercase ${transparent ? 'text-white drop-shadow-md' : 'text-amanda-black'}`}>
            Amanda Clothing
          </span>
        </Link>

        {/* Nav derecha */}
        <div className="flex items-center gap-6 ml-auto">
          {isAdmin && (
            <Link href="/admin/dashboard" className={`hidden md:block link-underline text-xs tracking-widest uppercase ${transparent ? 'text-white drop-shadow-md' : 'text-amanda-black'}`}>
              Admin
            </Link>
          )}
          <Link href="/login" className={`hidden md:block link-underline text-xs tracking-widest uppercase ${transparent ? 'text-white drop-shadow-md' : 'text-amanda-black'}`}>
            Cuenta
          </Link>

          {/* Carrito */}
          <button
            onClick={openCart}
            className={`relative flex items-center gap-1 text-xs tracking-widest uppercase ${transparent ? 'text-white drop-shadow-md' : 'text-amanda-black'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-amanda-black text-amanda-white text-[10px] rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          {/* Menú mobile */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Menú mobile desplegable */}
      {menuOpen && (
        <div className="md:hidden bg-amanda-white border-t border-amanda-lightgray px-6 py-6 flex flex-col gap-5">
          {['Vestidos', 'Pantalones', 'Camperas', 'Calzado'].map(cat => (
            <Link
              key={cat}
              href={`/productos?categoria=${cat.toLowerCase()}`}
              className="text-xs tracking-widest uppercase text-amanda-black"
              onClick={() => setMenuOpen(false)}
            >
              {cat}
            </Link>
          ))}
          <Link href="/login" className="text-xs tracking-widest uppercase text-amanda-gray" onClick={() => setMenuOpen(false)}>
            Mi cuenta
          </Link>
          {isAdmin && (
            <Link href="/admin/dashboard" className="text-xs tracking-widest uppercase text-amanda-gray" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
