'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { createClient } from '@/lib/supabase/client';
import { useTiendaConfig } from '@/hooks/useTiendaConfig';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Categoria {
  id: number;
  nombre: string;
  slug: string;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const itemCount = useCartStore(s => s.itemCount);
  const openCart = useCartStore(s => s.openCart);
  const pathname = usePathname();
  const { get } = useTiendaConfig();

  const isSoftware = pathname === '/software';
  const isHome = pathname === '/';
  const transparent = isHome && !scrolled;
  const nombreTienda = get('nombre_tienda', 'Mi Tienda');

  if (isSoftware) return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetch(`${API}/categorias`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setCategorias(data.slice(0, 4)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const checkUser = async (userId: string | undefined) => {
      if (!userId) { setIsLoggedIn(false); setIsAdmin(false); return; }
      setIsLoggedIn(true);
      const { data } = await supabase.from('usuarios').select('rol').eq('id', userId).single();
      setIsAdmin(data?.rol === 'admin');
    };

    supabase.auth.getSession().then(({ data: { session } }) => checkUser(session?.user?.id));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUser(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const items = useCartStore.getState().items;
      if (items.length > 0) {
        localStorage.setItem(`boutique-cart-user-${user.id}`, JSON.stringify(items));
      }
    }
    await supabase.auth.signOut();
    useCartStore.getState().clearCart();
    window.location.href = '/';
  };

  const linkClass = `link-underline text-xs tracking-widest uppercase ${transparent ? 'text-white drop-shadow-md' : 'text-amanda-black'}`;

  return (
    <>
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${transparent ? 'bg-transparent' : 'navbar-scrolled'}`}>
      <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Nav izquierda — categorías dinámicas */}
        <nav className="hidden md:flex items-center gap-8">
          {categorias.slice(0, 3).map(cat => (
            <Link key={cat.slug} href={`/productos?categoria=${cat.slug}`} className={linkClass}>{cat.nombre}</Link>
          ))}
        </nav>

        {/* Logo centrado */}
        <Link href="/" className={`absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 ${transparent ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <span className="font-serif text-2xl tracking-widest2 uppercase font-medium text-amanda-black">
            {nombreTienda}
          </span>
        </Link>

        {/* Nav derecha */}
        <div className="hidden md:flex items-center gap-6 ml-auto">
          {isAdmin && <Link href="/admin/dashboard" className={linkClass}>Admin</Link>}

          {isLoggedIn ? (
            <>
              <Link href="/favoritos" className={linkClass}>Favoritos</Link>
              <Link href="/pedidos" className={linkClass}>Mis pedidos</Link>
              <button onClick={handleLogout} className={`${linkClass} hover:opacity-60 transition-opacity`}>
                Salir
              </button>
            </>
          ) : (
            <Link href="/login" className={linkClass}>Cuenta</Link>
          )}

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
        </div>

        {/* Carrito + hamburguesa mobile */}
        <div className="flex md:hidden items-center gap-4 ml-auto">
          <button
            onClick={openCart}
            className={`relative flex items-center ${transparent ? 'text-white' : 'text-amanda-black'}`}
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
          <button onClick={() => setMenuOpen(!menuOpen)} className={transparent ? 'text-white' : 'text-amanda-black'}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

    </header>

      {/* Menú mobile — categorías dinámicas */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-amanda-white z-40 overflow-y-auto px-6 py-8 flex flex-col gap-6">
          <p className="text-[10px] tracking-widest uppercase text-amanda-gray">Categorías</p>
          {categorias.map(cat => (
            <Link key={cat.slug} href={`/productos?categoria=${cat.slug}`}
              className="text-sm tracking-widest uppercase text-amanda-black border-b border-amanda-lightgray pb-4"
              onClick={() => setMenuOpen(false)}>
              {cat.nombre}
            </Link>
          ))}
          <p className="text-[10px] tracking-widest uppercase text-amanda-gray mt-2">Mi cuenta</p>
          {isLoggedIn ? (
            <>
              <Link href="/favoritos" className="text-sm tracking-widest uppercase text-amanda-black border-b border-amanda-lightgray pb-4" onClick={() => setMenuOpen(false)}>Favoritos</Link>
              <Link href="/pedidos" className="text-sm tracking-widest uppercase text-amanda-black border-b border-amanda-lightgray pb-4" onClick={() => setMenuOpen(false)}>Mis pedidos</Link>
              {isAdmin && <Link href="/admin/dashboard" className="text-sm tracking-widest uppercase text-amanda-black border-b border-amanda-lightgray pb-4" onClick={() => setMenuOpen(false)}>Admin</Link>}
              <button onClick={handleLogout} className="text-sm tracking-widest uppercase text-amanda-gray text-left">Cerrar sesión</button>
            </>
          ) : (
            <Link href="/login" className="text-sm tracking-widest uppercase text-amanda-black border-b border-amanda-lightgray pb-4" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
          )}
        </div>
      )}
    </>
  );
}
