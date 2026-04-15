import Link from 'next/link';

export const metadata = {
  title: 'TiendaIA — E-commerce inteligente con IA y marca propia',
  description: 'Plataforma de e-commerce white-label con IA que atiende clientes 24/7, recomienda productos y se administra sola. Tu marca, tus colores, tu moneda. Lista en 1 día.',
};

const WA = '5491133821989';

const planes = [
  {
    nombre: 'Starter',
    precio: '29.900',
    periodo: '/mes',
    descripcion: 'Para emprendedores que arrancan',
    destacado: false,
    features: [
      'Hasta 50 productos',
      'Panel de administración',
      'Carrito y checkout',
      'Diseño personalizado con tu marca',
      'Dominio propio incluido',
      'Certificado SSL',
      'Soporte por WhatsApp',
    ],
    noIncluye: [
      'Asistente IA',
      'Recomendaciones inteligentes',
      'Publicación en redes sociales',
      'Chat en tiempo real',
    ],
  },
  {
    nombre: 'Profesional',
    precio: '59.900',
    periodo: '/mes',
    descripcion: 'Para negocios que quieren vender más',
    destacado: true,
    features: [
      'Productos ilimitados',
      'Todo lo del plan Starter',
      'Asistente IA 24/7',
      'Motor de recomendaciones',
      'Chat en tiempo real con clientes',
      'Publicación en redes sociales',
      'Dashboard de analytics',
      'Soporte prioritario',
    ],
    noIncluye: [
      'Desarrollo a medida',
      'Integraciones personalizadas',
    ],
  },
  {
    nombre: 'Enterprise',
    precio: 'A medida',
    periodo: '',
    descripcion: 'Para marcas con necesidades especiales',
    destacado: false,
    features: [
      'Todo lo del plan Profesional',
      'Desarrollo de funcionalidades a medida',
      'Integraciones con tus sistemas',
      'Múltiples sucursales / tiendas',
      'Capacitación para tu equipo',
      'SLA de soporte garantizado',
      'Servidor dedicado',
      'Account manager personal',
    ],
    noIncluye: [],
  },
];

export default function SoftwarePage() {
  return (
    <div className="bg-amanda-white">

      {/* ── NAVBAR PROPIO ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-amanda-black/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-serif text-xl tracking-wider text-amanda-white">
            TiendaIA
          </span>
          <div className="flex items-center gap-6">
            <a href="#planes" className="hidden sm:block text-xs tracking-widest uppercase text-amanda-gray hover:text-amanda-white transition-colors">
              Planes
            </a>
            <a
              href={`https://wa.me/${WA}?text=Hola, me interesa TiendaIA`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 bg-amanda-nude text-white text-xs tracking-widest uppercase hover:brightness-110 transition-all"
            >
              Contactar
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative bg-amanda-black text-amanda-white pt-32 pb-24 md:pt-44 md:pb-36 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amanda-black via-stone-900 to-amanda-black" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-amanda-nude/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amanda-nude/3 rounded-full blur-3xl" />

        <div className="relative max-w-screen-xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 border border-amanda-nude/40 rounded-full mb-8">
            <span className="text-xs tracking-widest uppercase text-amanda-nude">E-commerce con inteligencia artificial</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl mb-6 leading-tight max-w-4xl mx-auto">
            Tu tienda online que
            <span className="text-amanda-nude"> vende sola</span>
          </h1>

          <p className="text-lg md:text-xl text-amanda-gray mb-12 max-w-2xl mx-auto leading-relaxed">
            Plataforma de e-commerce con IA integrada que atiende clientes, recomienda productos y gestiona tu negocio.
            <span className="block mt-2 text-amanda-nude">Lista en 1 día con tu marca, colores, logo y moneda.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/productos"
              className="px-10 py-4 bg-amanda-nude text-white text-sm tracking-widest uppercase hover:brightness-110 transition-all font-medium"
            >
              Ver demo en vivo
            </Link>
            <a
              href="#planes"
              className="px-10 py-4 border border-white/20 text-amanda-white text-sm tracking-widest uppercase hover:bg-white/5 transition-colors font-medium"
            >
              Ver planes y precios
            </a>
          </div>

          {/* Métricas de confianza */}
          <div className="grid grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div>
              <p className="font-serif text-3xl md:text-4xl text-amanda-white">24/7</p>
              <p className="text-xs text-amanda-gray mt-1">IA activa</p>
            </div>
            <div>
              <p className="font-serif text-3xl md:text-4xl text-amanda-white">&lt;1s</p>
              <p className="text-xs text-amanda-gray mt-1">Tiempo de carga</p>
            </div>
            <div>
              <p className="font-serif text-3xl md:text-4xl text-amanda-white">+40%</p>
              <p className="text-xs text-amanda-gray mt-1">Conversiones</p>
            </div>
            <div>
              <p className="font-serif text-3xl md:text-4xl text-amanda-white">8</p>
              <p className="text-xs text-amanda-gray mt-1">Monedas LATAM</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGOS DE CONFIANZA ─────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 border-b border-amanda-lightgray">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-xs tracking-widest uppercase text-amanda-gray text-center mb-8">Tecnologías de clase mundial detrás de tu tienda</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-60">
            {['Next.js', 'Google AI', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'FastAPI'].map(t => (
              <span key={t} className="text-sm font-medium text-amanda-gray tracking-wide">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEMA → SOLUCIÓN ──────────────────────────────────────────── */}
      <section className="py-24 md:py-36 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl md:text-5xl text-amanda-black mb-6">
              Vender online no debería ser difícil
            </h2>
            <p className="text-amanda-gray text-lg max-w-2xl mx-auto">
              La mayoría de las tiendas online pierden ventas por estos 3 problemas. TiendaIA los resuelve por vos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="p-10 bg-red-50/50 border border-red-100 rounded-xl">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-5">
                <span className="text-red-500 text-xl">✕</span>
              </div>
              <h3 className="font-medium text-amanda-black mb-3 text-lg">Clientes sin respuesta</h3>
              <p className="text-amanda-gray text-sm leading-relaxed">Cada pregunta sin contestar es una venta perdida. No podés estar 24 horas contestando mensajes.</p>
            </div>
            <div className="p-10 bg-red-50/50 border border-red-100 rounded-xl">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-5">
                <span className="text-red-500 text-xl">✕</span>
              </div>
              <h3 className="font-medium text-amanda-black mb-3 text-lg">Carritos abandonados</h3>
              <p className="text-amanda-gray text-sm leading-relaxed">7 de cada 10 personas dejan el carrito sin comprar. Sin recomendaciones inteligentes, no hay forma de recuperarlos.</p>
            </div>
            <div className="p-10 bg-red-50/50 border border-red-100 rounded-xl">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-5">
                <span className="text-red-500 text-xl">✕</span>
              </div>
              <h3 className="font-medium text-amanda-black mb-3 text-lg">Horas en tareas manuales</h3>
              <p className="text-amanda-gray text-sm leading-relaxed">Subir fotos, controlar stock, publicar en redes, responder consultas. Todo manual. Tiempo que no usás para vender.</p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-[1px] bg-amanda-nude" />
              <span className="text-xs tracking-widest uppercase text-amanda-nude font-medium">La solución</span>
              <div className="w-12 h-[1px] bg-amanda-nude" />
            </div>
            <h3 className="font-serif text-3xl text-amanda-black mb-4">
              Una tienda inteligente que trabaja por vos
            </h3>
            <p className="text-amanda-gray text-lg">
              IA que atiende, recomendaciones que venden, y un admin que cualquiera puede usar.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3 FEATURES PRINCIPALES ──────────────────────────────────────── */}
      <section className="py-24 md:py-36 px-4 sm:px-6 bg-stone-50">
        <div className="max-w-screen-xl mx-auto">

          {/* Feature 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-28">
            <div>
              <div className="inline-block px-3 py-1 bg-amanda-nude/10 border border-amanda-nude/20 rounded-full mb-6">
                <span className="text-xs tracking-widest uppercase text-amanda-nude">Asistente IA</span>
              </div>
              <h3 className="font-serif text-3xl md:text-4xl text-amanda-black mb-6 leading-tight">
                Tu mejor vendedor nunca descansa
              </h3>
              <p className="text-amanda-gray mb-8 leading-relaxed">
                El asistente inteligente responde todas las preguntas al instante. Tus clientes sienten que alguien los atiende a las 3 de la mañana.
              </p>
              <div className="space-y-4">
                {['Responde al instante, a cualquier hora', 'Conoce todos tus productos y políticas', 'Vos solo atendés consultas especiales'].map(t => (
                  <div key={t} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-amanda-nude/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-amanda-nude text-xs">✓</span>
                    </div>
                    <span className="text-amanda-black text-sm">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-amanda-black to-stone-800 p-8 rounded-2xl">
              <div className="bg-stone-900 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-amanda-nude rounded-full flex items-center justify-center text-white text-xs font-bold">IA</div>
                  <div>
                    <p className="text-white text-xs font-medium">Asistente TiendaIA</p>
                    <p className="text-stone-500 text-[10px]">En línea</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-stone-800 rounded-lg p-3 max-w-[80%]">
                    <p className="text-stone-300 text-xs">¿Tienen este vestido en talle M?</p>
                  </div>
                  <div className="bg-amanda-nude/20 rounded-lg p-3 max-w-[85%] ml-auto">
                    <p className="text-amanda-nude text-xs">¡Sí! El vestido Milano está disponible en talle M, color negro y nude. ¿Te lo agrego al carrito? 😊</p>
                  </div>
                  <div className="bg-stone-800 rounded-lg p-3 max-w-[60%]">
                    <p className="text-stone-300 text-xs">Dale, el negro por favor</p>
                  </div>
                  <div className="bg-amanda-nude/20 rounded-lg p-3 max-w-[85%] ml-auto">
                    <p className="text-amanda-nude text-xs">¡Listo! Agregado al carrito. ¿Querés ver opciones para completar el look? 👗</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-28">
            <div className="md:order-2">
              <div className="inline-block px-3 py-1 bg-amanda-nude/10 border border-amanda-nude/20 rounded-full mb-6">
                <span className="text-xs tracking-widest uppercase text-amanda-nude">Recomendaciones</span>
              </div>
              <h3 className="font-serif text-3xl md:text-4xl text-amanda-black mb-6 leading-tight">
                Cada cliente ve lo que quiere comprar
              </h3>
              <p className="text-amanda-gray mb-8 leading-relaxed">
                3 motores de recomendación que aprenden de cada visita. Tus clientes encuentran más productos que les gustan y compran más.
              </p>
              <div className="space-y-4">
                {['"Completá el look" — vende accesorios que combinan', '"Otros también vieron" — muestra lo popular', '"Para vos" — personalizado para cada cliente'].map(t => (
                  <div key={t} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-amanda-nude/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-amanda-nude text-xs">✓</span>
                    </div>
                    <span className="text-amanda-black text-sm">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:order-1 bg-gradient-to-br from-amanda-black to-stone-800 p-8 rounded-2xl">
              <div className="bg-stone-900 rounded-xl p-6">
                <p className="text-xs tracking-widest uppercase text-stone-500 mb-4">También te puede gustar</p>
                <div className="grid grid-cols-3 gap-3">
                  {['Vestido Floral', 'Campera Cuero', 'Bolso Milano'].map((name, i) => (
                    <div key={name} className="bg-stone-800 rounded-lg p-3">
                      <div className="aspect-[3/4] bg-stone-700 rounded mb-2 flex items-center justify-center">
                        <span className="text-2xl">{['👗', '🧥', '👜'][i]}</span>
                      </div>
                      <p className="text-[10px] text-stone-300 truncate">{name}</p>
                      <p className="text-[10px] text-amanda-nude">${['24.900', '45.900', '18.500'][i]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4 (nuevo) — Personalización white-label */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-28">
            <div>
              <div className="inline-block px-3 py-1 bg-amanda-nude/10 border border-amanda-nude/20 rounded-full mb-6">
                <span className="text-xs tracking-widest uppercase text-amanda-nude">Personalización total</span>
              </div>
              <h3 className="font-serif text-3xl md:text-4xl text-amanda-black mb-6 leading-tight">
                Tu marca, tu identidad, tu moneda
              </h3>
              <p className="text-amanda-gray mb-8 leading-relaxed">
                Un wizard de onboarding te guía en 4 pasos: identidad, contacto, colores y textos de home. En menos de 3 minutos tu tienda tiene tu cara, sin código, sin esperar al desarrollador.
              </p>
              <div className="space-y-4">
                {['Logo, nombre y textos propios', 'Paleta de colores y tipografía a elección', 'Moneda local: ARS, USD, EUR, MXN, CLP, PEN, UYU, BRL', 'Dominio propio con SSL incluido'].map(t => (
                  <div key={t} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-amanda-nude/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-amanda-nude text-xs">✓</span>
                    </div>
                    <span className="text-amanda-black text-sm">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:order-1 bg-gradient-to-br from-amanda-black to-stone-800 p-8 rounded-2xl">
              <div className="bg-stone-900 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 h-1.5 bg-emerald-500 rounded-full" />
                  <div className="flex-1 h-1.5 bg-emerald-500 rounded-full" />
                  <div className="flex-1 h-1.5 bg-amanda-nude rounded-full" />
                  <div className="flex-1 h-1.5 bg-stone-700 rounded-full" />
                </div>
                <p className="text-[10px] tracking-widest uppercase text-stone-500 mb-3">Paso 3 de 4 · Branding</p>
                <p className="text-white text-sm mb-4">Elegí tu paleta</p>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {[
                    ['#0a0a0a', '#c9a882', '#fafafa'],
                    ['#2d1f1f', '#d48a8a', '#fdf7f7'],
                    ['#1a2b1e', '#6b8e5a', '#f8faf6'],
                    ['#0a1a2e', '#4a7ba8', '#f6f9fc'],
                    ['#2e0a0f', '#a84a5e', '#fcf6f7'],
                  ].map((colores, i) => (
                    <div key={i} className={`p-2 rounded border ${i === 1 ? 'border-amanda-nude' : 'border-stone-700'}`}>
                      <div className="flex gap-1">
                        {colores.map(c => <div key={c} className="flex-1 h-5 rounded" style={{ background: c }} />)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-amanda-nude text-white text-[10px] tracking-widest uppercase px-3 py-2 text-center rounded">
                  Siguiente →
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-amanda-nude/10 border border-amanda-nude/20 rounded-full mb-6">
                <span className="text-xs tracking-widest uppercase text-amanda-nude">Panel admin</span>
              </div>
              <h3 className="font-serif text-3xl md:text-4xl text-amanda-black mb-6 leading-tight">
                Gestioná todo sin tocar código
              </h3>
              <p className="text-amanda-gray mb-8 leading-relaxed">
                Panel visual donde manejás productos, fotos, stock, pedidos y consultas. Tan simple que cualquier persona lo domina en minutos.
              </p>
              <div className="space-y-4">
                {['Subí fotos, manejá talles y colores', 'Controlá stock y pedidos en tiempo real', 'Publicá en Instagram, Telegram y Facebook con un click'].map(t => (
                  <div key={t} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-amanda-nude/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-amanda-nude text-xs">✓</span>
                    </div>
                    <span className="text-amanda-black text-sm">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-amanda-black to-stone-800 p-8 rounded-2xl">
              <div className="bg-stone-900 rounded-xl p-6">
                <p className="text-xs tracking-widest uppercase text-stone-500 mb-4">Dashboard</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Ventas hoy', value: '$127.400', color: 'text-emerald-400' },
                    { label: 'Pedidos', value: '23', color: 'text-blue-400' },
                    { label: 'Productos vistos', value: '1.842', color: 'text-amber-400' },
                    { label: 'Conversión', value: '4.2%', color: 'text-rose-400' },
                  ].map(m => (
                    <div key={m.label} className="bg-stone-800 rounded-lg p-3">
                      <p className="text-[10px] text-stone-500 mb-1">{m.label}</p>
                      <p className={`text-lg font-medium ${m.color}`}>{m.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-stone-800 rounded-lg p-3">
                  <p className="text-[10px] text-stone-500 mb-2">Últimos pedidos</p>
                  {['María G. — Vestido Negro M', 'Laura R. — Campera + Bolso', 'Ana S. — 3 productos'].map(p => (
                    <div key={p} className="flex items-center justify-between py-1.5 border-b border-stone-700 last:border-0">
                      <span className="text-[10px] text-stone-300">{p}</span>
                      <span className="text-[10px] text-emerald-400">Pagado</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES COMPLETAS ─────────────────────────────────────── */}
      <section className="py-24 md:py-36 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl md:text-5xl text-amanda-black mb-4">
              Todo incluido
            </h2>
            <p className="text-amanda-gray text-lg">Cada función está pensada para que vendas más y trabajes menos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🛍️', titulo: 'Experiencia de compra', items: ['Búsqueda y filtros inteligentes', 'Fotos grandes y profesionales', 'Carrito que no se pierde', 'Favoritos y wishlist', 'Compra rápida y segura', 'Historial de pedidos'] },
              { icon: '📢', titulo: 'Marketing y ventas', items: ['Publicación en redes sociales', 'Ofertas y descuentos visibles', 'Badges "Nuevo" y "Últimas"', 'Analytics de productos', 'Seguimiento de cada cliente', 'Dashboard de ventas'] },
              { icon: '🎨', titulo: 'Identidad de marca', items: ['Logo y nombre propios', 'Paleta de colores custom', 'Tipografía configurable', 'Textos de home editables', '8 monedas LATAM/global', 'Wizard de onboarding'] },
              { icon: '💼', titulo: 'Administración', items: ['Gestión fácil de productos', 'Galería de fotos por producto', 'Talles, colores y categorías', 'Control de stock en vivo', 'Estados de pedidos', 'Panel de consultas'] },
              { icon: '⚡', titulo: 'Rendimiento', items: ['Carga en menos de 1 segundo', 'Dominio propio con SSL', 'Backups automáticos', 'Optimizado para móviles', 'Escala con tu negocio', 'Actualizaciones gratis'] },
            ].map(col => (
              <div key={col.titulo} className="p-8 bg-amanda-lightgray rounded-xl">
                <div className="text-3xl mb-4">{col.icon}</div>
                <h3 className="font-serif text-xl text-amanda-black mb-5">{col.titulo}</h3>
                <ul className="space-y-2.5">
                  {col.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-amanda-gray">
                      <span className="text-amanda-nude mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANES Y PRECIOS ──────────────────────────────────────────────── */}
      <section id="planes" className="py-24 md:py-36 px-4 sm:px-6 bg-stone-50 scroll-mt-20">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl md:text-5xl text-amanda-black mb-4">
              Planes simples, sin sorpresas
            </h2>
            <p className="text-amanda-gray text-lg">Elegí el plan que se adapta a tu negocio. Cambiá cuando quieras.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {planes.map(plan => (
              <div
                key={plan.nombre}
                className={`rounded-2xl p-8 flex flex-col ${
                  plan.destacado
                    ? 'bg-amanda-black text-amanda-white ring-2 ring-amanda-nude shadow-2xl md:-mt-4 md:mb-[-16px] md:py-12'
                    : 'bg-amanda-white border border-stone-200'
                }`}
              >
                {plan.destacado && (
                  <div className="inline-block self-start px-3 py-1 bg-amanda-nude text-white text-[10px] tracking-widest uppercase rounded-full mb-4">
                    Más popular
                  </div>
                )}
                <h3 className={`font-serif text-2xl mb-2 ${plan.destacado ? 'text-amanda-white' : 'text-amanda-black'}`}>
                  {plan.nombre}
                </h3>
                <p className={`text-sm mb-6 ${plan.destacado ? 'text-stone-400' : 'text-amanda-gray'}`}>
                  {plan.descripcion}
                </p>

                <div className="mb-8">
                  {plan.precio === 'A medida' ? (
                    <p className={`font-serif text-3xl ${plan.destacado ? 'text-amanda-white' : 'text-amanda-black'}`}>A medida</p>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className={`font-serif text-4xl ${plan.destacado ? 'text-amanda-white' : 'text-amanda-black'}`}>
                        ${plan.precio}
                      </span>
                      <span className={`text-sm ${plan.destacado ? 'text-stone-400' : 'text-amanda-gray'}`}>
                        {plan.periodo}
                      </span>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className={`mt-0.5 ${plan.destacado ? 'text-amanda-nude' : 'text-amanda-nude'}`}>✓</span>
                      <span className={`text-sm ${plan.destacado ? 'text-stone-300' : 'text-amanda-gray'}`}>{f}</span>
                    </li>
                  ))}
                  {plan.noIncluye.map(f => (
                    <li key={f} className="flex items-start gap-2.5 opacity-40">
                      <span className="mt-0.5">—</span>
                      <span className={`text-sm line-through ${plan.destacado ? 'text-stone-500' : 'text-stone-400'}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hola, me interesa el plan ${plan.nombre} de TiendaIA`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full py-4 text-center text-sm tracking-widest uppercase font-medium transition-all ${
                    plan.destacado
                      ? 'bg-amanda-nude text-white hover:brightness-110'
                      : 'bg-amanda-black text-white hover:bg-stone-800'
                  }`}
                >
                  {plan.precio === 'A medida' ? 'Consultar' : 'Empezar ahora'}
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-amanda-gray text-xs mt-10">
            Todos los planes incluyen 14 días de prueba gratis. Precios en ARS. Sin contratos largos, cancelá cuando quieras.
          </p>
        </div>
      </section>

      {/* ── PARA QUIÉN ───────────────────────────────────────────────────── */}
      <section className="py-24 md:py-36 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-amanda-black mb-4">Perfecto para cualquier negocio</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { emoji: '🌱', titulo: 'Emprendedores', desc: 'Arrancá tu tienda sin saber de tecnología. Todo listo para tu primera venta en menos de una semana.' },
              { emoji: '📈', titulo: 'Negocios en crecimiento', desc: 'Migra tu catálogo fácilmente. Aumentá tus ventas con IA y recomendaciones inteligentes.' },
              { emoji: '🏪', titulo: 'Cualquier rubro', desc: 'Ropa, accesorios, cosméticos, artesanías, alimentos. Adaptable a cualquier producto y marca.' },
            ].map(c => (
              <div key={c.titulo} className="p-8 border border-stone-200 rounded-xl hover:border-amanda-black transition-colors">
                <div className="text-3xl mb-4">{c.emoji}</div>
                <h3 className="font-medium text-amanda-black mb-3 text-lg">{c.titulo}</h3>
                <p className="text-amanda-gray text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-36 px-4 sm:px-6 bg-amanda-lightgray">
        <div className="max-w-screen-lg mx-auto">
          <h2 className="font-serif text-4xl text-amanda-black mb-16 text-center">
            Preguntas frecuentes
          </h2>

          <div className="space-y-4">
            {[
              { q: '¿Necesito saber programar?', a: 'No. Todo se maneja desde un panel visual. Si sabés usar Instagram, sabés usar TiendaIA.' },
              { q: '¿Cuánto tarda en estar lista mi tienda?', a: 'El setup inicial toma 1 día. El mismo día completás el wizard de onboarding (3 minutos) y tu tienda tiene tu marca, logo, colores y moneda configurados.' },
              { q: '¿Puedo personalizar colores, logo y tipografía sin tocar código?', a: 'Sí. Todo lo visual es configurable desde el panel admin: logo, paleta (5 paletas predefinidas o una custom), tipografía, textos de home, descripciones. Los cambios se reflejan al instante.' },
              { q: '¿Puedo usar mi dominio propio?', a: 'Sí. Todos los planes incluyen configuración con tu dominio personalizado (tutienda.com) con certificado SSL automático.' },
              { q: '¿Qué monedas soporta?', a: 'ARS, USD, EUR, MXN, CLP, PEN, UYU, BRL. Podés cambiarla desde el wizard o en Configuración. Los precios se formatean según el locale (ej: $1.200 en AR, R$1.200,00 en BR).' },
              { q: '¿Qué métodos de pago aceptan mis clientes?', a: 'MercadoPago (tarjeta, débito, efectivo), transferencia bancaria con tu alias, y coordinación por WhatsApp.' },
              { q: '¿Puedo cambiar de plan?', a: 'Sí, en cualquier momento. Subís o bajás de plan y se ajusta al próximo ciclo de facturación.' },
              { q: '¿Qué pasa con mis datos si cancelo?', a: 'Tus datos son tuyos. Te damos un backup completo de tu base (productos, pedidos, clientes). Nada se pierde.' },
              { q: '¿La IA realmente funciona bien?', a: 'Usa la misma tecnología de Google (Gemini). Responde con precisión sobre tus productos, talles, envíos y políticas. Vos editás el "tono" de la IA (system prompt) desde el panel admin.' },
            ].map(faq => (
              <div key={faq.q} className="p-6 bg-amanda-white rounded-xl border border-stone-200 hover:border-amanda-nude/50 transition-colors">
                <h3 className="font-medium text-amanda-black mb-2">{faq.q}</h3>
                <p className="text-amanda-gray text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────────────────── */}
      <section className="bg-amanda-black text-amanda-white py-24 md:py-36 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amanda-nude/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-amanda-nude/3 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">
            Empezá a vender
            <span className="text-amanda-nude"> inteligente</span>
          </h2>
          <p className="text-lg text-amanda-gray mb-12 leading-relaxed">
            14 días de prueba gratis. Sin tarjeta de crédito. Probá la demo ahora y después hablamos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/productos"
              className="px-10 py-4 bg-amanda-nude text-white text-sm tracking-widest uppercase hover:brightness-110 transition-all font-medium"
            >
              Probar demo gratis
            </Link>
            <a
              href={`https://wa.me/${WA}?text=Hola, quiero empezar con TiendaIA`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 border border-white/20 text-amanda-white text-sm tracking-widest uppercase hover:bg-white/5 transition-colors font-medium"
            >
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-4 sm:px-6 border-t border-stone-200">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-serif text-lg tracking-wider text-amanda-black">TiendaIA</span>
          <div className="flex items-center gap-6 text-xs text-amanda-gray">
            <Link href="/productos" className="hover:text-amanda-black transition-colors">Demo</Link>
            <a href="#planes" className="hover:text-amanda-black transition-colors">Planes</a>
            <a
              href={`https://wa.me/${WA}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amanda-black transition-colors"
            >
              Contacto
            </a>
          </div>
          <p className="text-xs text-amanda-gray">© 2026 TiendaIA. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
