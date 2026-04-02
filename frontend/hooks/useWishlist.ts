'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function useWishlist() {
  const [ids, setIds] = useState<Set<number>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase.from('wishlist').select('producto_id');
      setIds(new Set((data || []).map((w: any) => w.producto_id as number)));
    };
    load();
  }, []);

  const toggle = useCallback(async (productoId: number) => {
    if (!userId) {
      router.push('/login?mensaje=Iniciá sesión para guardar favoritos');
      return;
    }
    const supabase = createClient();
    if (ids.has(productoId)) {
      setIds(prev => { const n = new Set(prev); n.delete(productoId); return n; });
      await supabase.from('wishlist').delete().eq('producto_id', productoId);
    } else {
      setIds(prev => new Set([...prev, productoId]));
      await supabase.from('wishlist').insert({ usuario_id: userId, producto_id: productoId });
    }
  }, [ids, userId, router]);

  return { ids, toggle };
}
