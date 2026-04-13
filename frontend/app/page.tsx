'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RecoShelf } from '@/components/recomendaciones/RecoShelf';
import { OfertasShelf } from '@/components/recomendaciones/OfertasShelf';
import { useTracking } from '@/hooks/useTracking';
import { useTiendaConfig } from '@/hooks/useTiendaConfig';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  imagen_url?: string;
}

export default function Home() {
  const { sessionId } = useTracking();
  const { get } = useTiendaConfig();
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    fetch(`${API}/categorias`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setCategorias(data.slice(0, 4)))
      .catch(() => {});
  }, []);

  const waNumero = get('whatsapp_numero', '5491133821989');

  return (
    <main>
      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center bg-stone-100 overflow-hidden">
        <Image
          src={get('hero_imagen', '/hero.jpg')}
          alt={get('hero_titulo', 'Tienda')}
          fill
          className="object-cover object-top"
          priority
        />
        <div className="hero-overlay absolute inset-0" />

        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-none tracking-[0.25em] uppercase">
            {get('hero_titulo', 'Mi Tienda')}
          </h1>

          <div className="mt-10 w-px h-10 bg-white/40" />

          <Link
            href="/productos"
            className="mt-8 text-sm tracking-[0.3em] uppercase text-white border border-white/60 px-10 py-3 hover:bg-white hover:text-amanda-black transition-all duration-300"
          >
            {get('hero_cta_texto', 'Entrá')}
          </Link>
        </div>
      </section>

      {/* STATEMENT */}
      <section className="py-20 px-6 text-center">
        <p className="font-serif text-2xl md:text-4xl text-amanda-black max-w-2xl mx-auto leading-relaxed">
          {get('statement_1', 'Bienvenidos a nuestra tienda.')}<br />
          <span className="text-amanda-nude">{get('statement_2', '')}</span>
        </p>
      </section>

      {/* CATEGORÍAS — dinámicas desde BD */}
      {categorias.length > 0 && (
        <section className="px-6 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-screen-xl mx-auto">
            {categorias.map((cat) => (
              <Link key={cat.slug} href={`/productos?categoria=${cat.slug}`} className="group block">
                <div className="aspect-[3/4] overflow-hidden relative bg-stone-200">
                  {cat.imagen_url ? (
                    <Image src={cat.imagen_url} alt={cat.nombre} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-stone-400 text-lg font-serif">{cat.nombre}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-amanda-black/0 group-hover:bg-amanda-black/10 transition-all duration-500" />
                  <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-amanda-black/50 to-transparent">
                    <p className="text-white text-xs tracking-widest uppercase">{cat.nombre}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* OFERTAS */}
      <OfertasShelf />

      {/* NOVEDADES */}
      <section className="px-6 pb-24 max-w-screen-xl mx-auto">
        <RecoShelf titulo="Lo nuevo" sessionId={sessionId} limit={8} />
      </section>

      {/* BANNER ASISTENTE IA */}
      <section className="bg-amanda-black text-amanda-white py-20 px-6">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <p className="text-xs tracking-widest uppercase text-amanda-nude mb-3">{get('seccion_ia_subtitulo', 'Tecnología al servicio de tu estilo')}</p>
            <h2 className="font-serif text-3xl md:text-4xl mb-4">{get('seccion_ia_titulo', 'Consultá con asistente IA 24/7')}</h2>
            <p className="text-amanda-gray text-sm mb-8 max-w-md leading-relaxed">
              {get('seccion_ia_descripcion', 'Respondemos tus dudas al instante, cualquier día, a cualquier hora.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link
                href="/login"
                className="inline-block bg-amanda-nude text-amanda-black text-xs tracking-widest uppercase px-8 py-3 hover:bg-white transition-all duration-300 text-center"
              >
                {get('seccion_ia_cta', 'Chatear')}
              </Link>
              <a
                href={`https://wa.me/${waNumero}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-[#25D366] text-[#25D366] text-xs tracking-widest uppercase px-8 py-3 hover:bg-[#25D366] hover:text-white transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-6 md:max-w-xs w-full">
            {[
              { icon: '⚡', titulo: 'Respuesta instantánea', desc: 'FAQ frecuentes respondidas al instante, sin espera' },
              { icon: '🤖', titulo: 'Agente IA', desc: 'Responde consultas de talles, colores y productos' },
              { icon: '👩', titulo: 'Atención humana', desc: 'Un click a WhatsApp para hablar con el equipo real' },
            ].map(f => (
              <div key={f.titulo} className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-xs tracking-widest uppercase text-amanda-white mb-1">{f.titulo}</p>
                  <p className="text-xs text-amanda-gray leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-12 border-t border-amanda-lightgray">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-serif text-lg tracking-widest2 uppercase">{get('nombre_tienda', 'Mi Tienda')}</span>
          <div className="flex gap-8">
            <Link href="/productos" className="text-xs tracking-widest uppercase text-amanda-gray link-underline">Tienda</Link>
            <Link href="/login" className="text-xs tracking-widest uppercase text-amanda-gray link-underline">Mi cuenta</Link>
          </div>
          <p className="text-xs text-amanda-gray">{get('footer_texto', `© ${new Date().getFullYear()}`)}</p>
        </div>
      </footer>
    </main>
  );
}
