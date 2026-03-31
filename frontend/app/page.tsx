import Link from 'next/link';
import Image from 'next/image';

const categorias = [
  { nombre: 'Vestidos', slug: 'vestidos', bg: 'bg-stone-200' },
  { nombre: 'Pantalones', slug: 'pantalones', bg: 'bg-neutral-300' },
  { nombre: 'Camperas', slug: 'camperas', bg: 'bg-zinc-200' },
  { nombre: 'Calzado', slug: 'calzado', bg: 'bg-stone-300' },
];

export default function Home() {
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
          <p className="text-xs tracking-widest2 uppercase text-white/80 mb-3">Nueva colección</p>
          <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight mb-6">
            Primavera<br />Verano 2026
          </h1>
          <Link
            href="/productos"
            className="inline-block border border-white text-white text-xs tracking-widest uppercase px-8 py-3 hover:bg-white hover:text-amanda-black transition-all duration-300"
          >
            Ver colección
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
              <div className={`${cat.bg} aspect-[3/4] overflow-hidden relative flex items-end`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-stone-400 text-xs tracking-widest uppercase">Foto {cat.nombre}</span>
                </div>
                <div className="absolute inset-0 bg-amanda-black/0 group-hover:bg-amanda-black/10 transition-all duration-500" />
                <div className="relative z-10 w-full p-4 bg-gradient-to-t from-amanda-black/40 to-transparent">
                  <p className="text-white text-xs tracking-widest uppercase">{cat.nombre}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* NOVEDADES */}
      <section className="px-6 pb-24 max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-serif text-2xl md:text-3xl">Lo nuevo</h2>
          <Link href="/productos" className="link-underline text-xs tracking-widest uppercase text-amanda-gray">
            Ver todo
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="group">
              <div className="aspect-[3/4] bg-stone-100 overflow-hidden mb-3 relative">
                <div className="product-card-img w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                  <span className="text-stone-400 text-xs">Producto {i}</span>
                </div>
              </div>
              <p className="text-xs tracking-wide uppercase text-amanda-black">Nombre producto</p>
              <p className="text-xs text-amanda-gray mt-1">$12.500</p>
            </div>
          ))}
        </div>
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
