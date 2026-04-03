'use client';

import Link from 'next/link';
import Image from 'next/image';
import { RecoShelf } from '@/components/recomendaciones/RecoShelf';
import { OfertasShelf } from '@/components/recomendaciones/OfertasShelf';
import { useTracking } from '@/hooks/useTracking';

const categorias = [
  { nombre: 'Vestidos', slug: 'vestidos', img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&fit=crop&q=80' },
  { nombre: 'Pantalones', slug: 'pantalones', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&fit=crop&q=80' },
  { nombre: 'Camperas', slug: 'camperas', img: 'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&fit=crop&q=80' },
  { nombre: 'Calzado', slug: 'calzado', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&fit=crop&q=80' },
];

export default function Home() {
  const { sessionId } = useTracking();

  return (
    <main>
      {/* HERO */}
      <section className="relative h-screen flex items-end bg-stone-100 overflow-hidden">
        <Image
          src="/hero.jpg"
          alt="Amanda Clothing — nueva colección"
          fill
          className="object-cover object-top"
          priority
        />
        <div className="hero-overlay absolute inset-0" />

        <div className="relative z-10 w-full px-8 pb-16 md:px-16 md:pb-20">
          <p className="text-xs tracking-widest2 uppercase text-white/80 mb-3">Temporada 2026</p>
          <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight mb-6">
            Prendas que amarás<br />a precios increíbles.
          </h1>
          <Link
            href="/productos"
            className="inline-block border border-white text-white text-xs tracking-widest uppercase px-8 py-3 hover:bg-white hover:text-amanda-black transition-all duration-300"
          >
            Entrá
          </Link>
        </div>
      </section>

      {/* STATEMENT */}
      <section className="py-20 px-6 text-center">
        <p className="font-serif text-2xl md:text-4xl text-amanda-black max-w-2xl mx-auto leading-relaxed">
          Ropa que habla por vos.<br />
          <span className="text-amanda-nude">Diseñada para quedarse.</span>
        </p>
      </section>

      {/* CATEGORÍAS */}
      <section className="px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-screen-xl mx-auto">
          {categorias.map((cat) => (
            <Link key={cat.slug} href={`/productos?categoria=${cat.slug}`} className="group block">
              <div className="aspect-[3/4] overflow-hidden relative">
                <Image src={cat.img} alt={cat.nombre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-amanda-black/0 group-hover:bg-amanda-black/10 transition-all duration-500" />
                <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-amanda-black/50 to-transparent">
                  <p className="text-white text-xs tracking-widest uppercase">{cat.nombre}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* OFERTAS — solo se muestra si hay productos con precio_original */}
      <OfertasShelf />

      {/* NOVEDADES */}
      <section className="px-6 pb-24 max-w-screen-xl mx-auto">
        <RecoShelf titulo="Lo nuevo" sessionId={sessionId} limit={8} />
      </section>

      {/* BANNER CHAT */}
      <section className="bg-amanda-black text-amanda-white py-16 px-6 text-center">
        <p className="text-xs tracking-widest2 uppercase text-amanda-nude mb-3">Atención personalizada</p>
        <h2 className="font-serif text-3xl md:text-4xl mb-4">¿Dudas sobre el talle?</h2>
        <p className="text-amanda-gray text-sm mb-8 max-w-md mx-auto">
          Hablá directamente con Amanda. Te asesoramos para que tu compra sea perfecta.
        </p>
        <Link
          href="/productos"
          className="inline-block border border-amanda-nude text-amanda-nude text-xs tracking-widest uppercase px-8 py-3 hover:bg-amanda-nude hover:text-amanda-black transition-all duration-300"
        >
          Consultar ahora
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-12 border-t border-amanda-lightgray">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-serif text-lg tracking-widest2 uppercase">Amanda Clothing</span>
          <div className="flex gap-8">
            <Link href="/productos" className="text-xs tracking-widest uppercase text-amanda-gray link-underline">Tienda</Link>
            <Link href="/login" className="text-xs tracking-widest uppercase text-amanda-gray link-underline">Mi cuenta</Link>
          </div>
          <p className="text-xs text-amanda-gray">© 2026 Amanda Clothing</p>
        </div>
      </footer>
    </main>
  );
}
