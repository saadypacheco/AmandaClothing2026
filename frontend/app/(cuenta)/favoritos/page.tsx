'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ProductCard } from '@/components/producto/ProductCard';
import { useWishlist } from '@/hooks/useWishlist';
import { Producto } from '@/types/producto';

export default function FavoritosPage() {
  const router = useRouter();
  const wishlist = useWishlist();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login?mensaje=Iniciá sesión para ver tus favoritos'); return; }

      const { data: wItems } = await supabase
        .from('wishlist')
        .select('producto_id')
        .eq('usuario_id', user.id);

      const ids = (wItems || []).map(w => w.producto_id);
      if (ids.length === 0) { setLoading(false); return; }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/?${ids.map(id => `ids=${id}`).join('&')}`);
      // Fallback: fetch individualmente si el endpoint no soporta ids[]
      const prods: Producto[] = [];
      for (const id of ids) {
        const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${id}`);
        if (r.ok) prods.push(await r.json());
      }
      setProductos(prods);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-stone-400">Cargando favoritos...</p>
      </div>
    </div>
  );

  // Filtrar los que siguen en wishlist (por si se eliminaron durante la sesión)
  const productosFiltrados = productos.filter(p => wishlist.ids.has(p.id));

  return (
    <main className="min-h-screen bg-amanda-white pt-24 pb-16">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="mb-8">
          <p className="text-[10px] tracking-widest uppercase text-amanda-gray">Mi cuenta</p>
          <h1 className="text-2xl tracking-wide uppercase text-amanda-black mt-1">Mis favoritos</h1>
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="text-center py-16 border border-amanda-lightgray">
            <p className="text-sm text-amanda-gray mb-4">No guardaste ningún favorito todavía.</p>
            <Link href="/productos" className="text-[10px] tracking-widest uppercase text-amanda-black border-b border-amanda-black pb-0.5">
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
            {productosFiltrados.map(p => (
              <ProductCard
                key={p.id}
                producto={p}
                isWishlisted={wishlist.ids.has(p.id)}
                onWishlistToggle={wishlist.toggle}
              />
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href="/productos" className="text-[10px] tracking-widest uppercase text-amanda-gray hover:text-amanda-black transition-colors">
            ← Seguir comprando
          </Link>
        </div>
      </div>
    </main>
  );
}
