import Link from 'next/link';

export const metadata = {
  title: 'TiendaIA — E-commerce inteligente con IA y marca propia',
  description: 'Plataforma de e-commerce white-label con IA que atiende clientes 24/7, recomienda productos y se administra sola. Tu marca, tus colores, tu moneda. Lista en 1 día.',
};

const WA = '5491133821989';

const planes = [
  {
    nombre: 'Growth',
    precio: '49.900',
    periodo: '/mes',
    comision: '+ 1% por venta',
    setup: 'Setup: $29.900 (bonificable)',
    descripcion: 'Para emprendedores que arrancan y necesitan todo',
    destacado: false,
    idealPara: 'Vendés menos de $2M/mes',
    features: [
      'Hasta 200 productos',
      'Panel de administración visual',
      'Asistente IA 24/7 incluido',
      'Motor de recomendaciones (3 algoritmos)',
      'Chat en tiempo real con clientes',
      'Publicación en redes sociales (1 click)',
      'Seguimiento de pedidos por estado',
      'Control de stock en tiempo real',
      'Dominio propio + SSL',
      'Base de datos dedicada por cliente',
      'Soporte por WhatsApp',
    ],
    noIncluye: [
      'Plan sin comisión por venta',
      'Integraciones a medida',
    ],
  },
  {
    nombre: 'Pro',
    precio: '129.900',
    periodo: '/mes',
    comision: 'Sin comisión por venta',
    setup: 'Setup: $49.900 (primer mes bonificado)',
    descripcion: 'Para negocios establecidos que ya venden bien',
    destacado: true,
    idealPara: 'Vendés más de $2M/mes',
    features: [
      'Productos ilimitados',
      'Todo lo del plan Growth',
      '0% de comisión sobre tus ventas',
      'Dashboard de analytics avanzado',
      'Backups diarios automáticos',
      'Prioridad en atención al cliente',
      'Más canales de redes sociales',
      'Agente IA personalizable (tu tono de voz)',
      'Múltiples administradores',
    ],
    noIncluye: [
      'Desarrollo a medida',
      'Integraciones personalizadas',
    ],
  },
  {
    nombre: 'Enterprise',
    precio: '299.000',
    periodo: '/mes',
    comision: 'Desde · Cotización a medida',
    setup: 'Setup a medida según integraciones',
    descripcion: 'Para marcas con múltiples tiendas o integraciones',
    destacado: false,
    idealPara: 'Vendés más de $10M/mes',
    features: [
      'Todo lo del plan Pro',
      'Desarrollo de funcionalidades a medida',
      'Integraciones con tus sistemas (ERP, CRM)',
      'Múltiples sucursales / tiendas',
      'Capacitación para tu equipo',
      'SLA de soporte garantizado',
      'Servidor dedicado exclusivo',
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
          {/* Badge urgencia */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-amanda-nude/40 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-amanda-nude rounded-full animate-pulse" />
            <span className="text-xs tracking-widest uppercase text-amanda-nude">Lanzamiento · 14 días gratis sin tarjeta</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl mb-6 leading-tight max-w-4xl mx-auto">
            Tu tienda online que
            <span className="text-amanda-nude"> vende mientras dormís</span>
          </h1>

          <p className="text-lg md:text-xl text-amanda-gray mb-4 max-w-2xl mx-auto leading-relaxed">
            IA 24/7 que responde consultas, recomienda productos y cierra ventas.
          </p>
          <p className="text-sm md:text-base text-amanda-nude mb-12 max-w-2xl mx-auto">
            Tu marca, tu logo, tus colores, tu moneda. Lista en 1 día. Sin programar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/productos"
              className="px-10 py-4 bg-amanda-nude text-white text-sm tracking-widest uppercase hover:brightness-110 transition-all font-medium shadow-lg shadow-amanda-nude/20"
            >
              Ver demo en vivo →
            </Link>
            <a
              href={`https://wa.me/${WA}?text=${encodeURIComponent('Hola, quiero empezar 14 días gratis con TiendaIA')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 border border-white/20 text-amanda-white text-sm tracking-widest uppercase hover:bg-white/5 transition-colors font-medium"
            >
              Empezar 14 días gratis
            </a>
          </div>

          {/* Micro-confianza debajo del CTA */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-12 text-[10px] tracking-widest uppercase text-amanda-gray">
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Sin tarjeta de crédito
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Cancelás cuando quieras
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Tus datos son tuyos
            </span>
          </div>

          {/* Placeholder de video — reemplazar src con YouTube embed cuando esté listo */}
          <div className="max-w-4xl mx-auto mb-16 aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-amanda-nude/10 bg-stone-900 relative group cursor-pointer">
            {/* TODO: Reemplazar este div por <iframe src="https://www.youtube.com/embed/VIDEO_ID" /> cuando el video esté subido */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-900 via-amanda-black to-stone-800">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-amanda-nude rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-amanda-nude/30">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-amanda-white text-sm tracking-widest uppercase">Ver demo · 3 min</p>
                <p className="text-amanda-gray text-xs mt-1">Cómo funciona TiendaIA en 3 minutos</p>
              </div>
            </div>
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

      {/* ── CÓMO FUNCIONA EN 3 PASOS ──────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-4 sm:px-6 bg-stone-50">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest uppercase text-amanda-nude mb-3">Cómo funciona</p>
            <h2 className="font-serif text-4xl md:text-5xl text-amanda-black">
              Tu tienda lista en 3 pasos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                numero: '01',
                titulo: 'Completás el wizard',
                desc: 'Tres minutos de formulario visual. Elegís nombre, logo, paleta de colores, moneda, y los textos de tu home. Sin código.',
                tiempo: '3 minutos'
              },
              {
                numero: '02',
                titulo: 'Nosotros desplegamos',
                desc: 'Activamos tu dominio propio con SSL, configuramos tu base de datos, y cargamos tus primeros productos desde las fotos que nos pases.',
                tiempo: '1 día'
              },
              {
                numero: '03',
                titulo: 'Empezás a vender',
                desc: 'La IA atiende consultas 24/7, las recomendaciones funcionan desde la primera visita, y vos mirás las ventas en el dashboard.',
                tiempo: 'Desde día 1'
              },
            ].map((paso, i) => (
              <div key={paso.numero} className="relative">
                {/* Línea de conexión (solo desktop) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[1px] bg-gradient-to-r from-amanda-nude/40 to-transparent" />
                )}
                <div className="relative bg-amanda-white p-8 rounded-xl border border-stone-200 hover:border-amanda-nude/50 transition-colors h-full">
                  <span className="font-serif text-5xl text-amanda-nude/30 absolute top-4 right-6">{paso.numero}</span>
                  <div className="text-xs tracking-widest uppercase text-amanda-nude mb-4">{paso.tiempo}</div>
                  <h3 className="font-serif text-2xl text-amanda-black mb-3">{paso.titulo}</h3>
                  <p className="text-sm text-amanda-gray leading-relaxed">{paso.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CASO DE USO: AMANDA CLOTHING ───────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full mb-6">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] tracking-widest uppercase text-emerald-700 font-medium">Caso real</span>
              </div>
              <h3 className="font-serif text-3xl md:text-4xl text-amanda-black mb-4 leading-tight">
                Amanda Clothing
              </h3>
              <p className="text-sm text-amanda-gray mb-6 leading-relaxed">
                La primera tienda que usó TiendaIA. Moda argentina para mujeres, venta directa con chat y WhatsApp integrado.
              </p>
              <a
                href="https://amandaclouthing.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-amanda-black border-b border-amanda-black pb-1 hover:text-amanda-nude hover:border-amanda-nude transition-colors"
              >
                Ver la tienda en vivo →
              </a>
            </div>

            <div className="md:col-span-3 grid grid-cols-2 gap-4">
              {[
                { metric: '24/7', label: 'Atención con IA', sub: 'Desde el primer día' },
                { metric: '<3 min', label: 'Setup inicial', sub: 'Wizard completo' },
                { metric: '40%', label: 'Más conversión', sub: 'Con recomendaciones' },
                { metric: '100%', label: 'Personalización', sub: 'Sin tocar código' },
              ].map(m => (
                <div key={m.label} className="p-6 bg-stone-50 border border-stone-200 rounded-xl">
                  <p className="font-serif text-3xl text-amanda-black mb-1">{m.metric}</p>
                  <p className="text-xs font-medium text-amanda-black mb-0.5">{m.label}</p>
                  <p className="text-[10px] text-amanda-gray">{m.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEMA → SOLUCIÓN ──────────────────────────────────────────── */}
      <section className="py-24 md:py-36 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs tracking-widest uppercase text-amanda-nude mb-3">El problema</p>
            <h2 className="font-serif text-4xl md:text-5xl text-amanda-black mb-6 leading-tight">
              ¿Perdés ventas y no sabés por qué?
            </h2>
            <p className="text-amanda-gray text-lg max-w-2xl mx-auto">
              El 89% de las tiendas online en LATAM pierden clientes por las mismas 3 razones. Te las contamos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="p-10 bg-red-50/50 border border-red-100 rounded-xl">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-5">
                <span className="text-red-500 text-xl">✕</span>
              </div>
              <h3 className="font-medium text-amanda-black mb-3 text-lg">Clientes sin respuesta</h3>
              <p className="text-amanda-gray text-sm leading-relaxed">Cada pregunta sin contestar en los primeros 5 minutos es una venta perdida. Y vos no podés estar online 24 horas.</p>
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
              <p className="text-amanda-gray text-sm leading-relaxed">Subir fotos, controlar stock, publicar en redes, responder consultas. Todo manual. Tiempo que no usás para diseñar, crear, crecer.</p>
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
                <div className="space-y-4">
                  <div className="bg-stone-800 rounded-lg p-4 max-w-[80%]">
                    <p className="text-stone-300 text-sm leading-relaxed">¿Tienen este vestido en talle M?</p>
                  </div>
                  <div className="bg-amanda-nude/20 rounded-lg p-4 max-w-[85%] ml-auto">
                    <p className="text-amanda-nude text-sm leading-relaxed">¡Sí! El vestido Milano está disponible en talle M, color negro y nude. ¿Te lo agrego al carrito? 😊</p>
                  </div>
                  <div className="bg-stone-800 rounded-lg p-4 max-w-[60%]">
                    <p className="text-stone-300 text-sm leading-relaxed">Dale, el negro</p>
                  </div>
                  <div className="bg-amanda-nude/20 rounded-lg p-4 max-w-[85%] ml-auto">
                    <p className="text-amanda-nude text-sm leading-relaxed">¡Listo! Agregado al carrito. ¿Querés ver opciones para completar el look? 👗</p>
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
                  {[
                    { name: 'Vestido Floral', price: '24.900', img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300&q=80' },
                    { name: 'Campera Cuero', price: '45.900', img: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=300&q=80' },
                    { name: 'Bolso Milano', price: '18.500', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&q=80' },
                  ].map(p => (
                    <div key={p.name} className="bg-stone-800 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.img} alt={p.name} className="aspect-[3/4] w-full object-cover" />
                      <div className="p-2">
                        <p className="text-[10px] text-stone-300 truncate">{p.name}</p>
                        <p className="text-[10px] text-amanda-nude">${p.price}</p>
                      </div>
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

      {/* ── LO QUE SOLO TENEMOS NOSOTROS ─────────────────────────────────── */}
      <section className="py-24 md:py-32 px-4 sm:px-6 bg-gradient-to-b from-amanda-white to-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs tracking-widest uppercase text-amanda-nude mb-3">Lo que nos hace únicos</p>
            <h2 className="font-serif text-4xl md:text-5xl text-amanda-black mb-4 leading-tight">
              No es solo una tienda online.
              <span className="block text-amanda-nude">Es un equipo que trabaja por vos.</span>
            </h2>
            <p className="text-amanda-gray text-lg max-w-2xl mx-auto">
              Estas son las cosas que no vas a encontrar en otras plataformas — ni pagando extra.
            </p>
          </div>

          {/* Grid de diferenciadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                titulo: 'IA 24/7 que responde por vos',
                desc: 'Tu asistente virtual contesta consultas, recomienda productos y cierra ventas mientras dormís, comés o diseñás. Usa Gemini (Google).',
                highlight: 'En Shopify: app extra USD 30-100/mes',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                ),
                titulo: 'Publicación en redes con 1 click',
                desc: 'Subís un producto al admin y lo publicás en Instagram, Facebook y Telegram al instante. Caption generado por IA, foto optimizada, link directo a la compra.',
                highlight: 'Ahorrás 2 horas por producto',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                ),
                titulo: 'Control de stock en tiempo real',
                desc: 'Cada venta descuenta automáticamente. Alertas cuando un producto baja de 3 unidades. Badges "Últimas" se muestran solos. Nunca más vender lo que no tenés.',
                highlight: 'Sin hojas de cálculo, sin errores',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                titulo: 'Seguimiento de pedidos completo',
                desc: 'Pendiente → Pagado → Preparando → Enviado → Entregado. Tu cliente ve su pedido actualizándose, vos recibís notificaciones, todo queda registrado.',
                highlight: 'Cero "¿dónde está mi pedido?"',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                  </svg>
                ),
                titulo: 'Base de datos dedicada por cliente',
                desc: 'Tu propia Supabase, solo tuya. No compartís servidor con otras tiendas. Tus datos aislados, tus backups independientes, tu performance no se afecta por nadie.',
                highlight: 'Ni Shopify ni Tiendanube hacen esto',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                  </svg>
                ),
                titulo: 'Sitio 100% personalizado',
                desc: 'Tu logo, tus colores, tu tipografía, tu moneda, tus textos. Wizard de 3 minutos para configurarlo todo. Dominio propio con SSL. Parece hecho a medida.',
                highlight: 'No es un template genérico',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                ),
                titulo: '0% de comisión en plan Pro',
                desc: 'Shopify te cobra 0.5-2% de cada venta. Tiendanube hasta 4%. En nuestro plan Pro: 0% para siempre. Todo lo que vendés, te queda a vos.',
                highlight: 'Un cliente que factura $3M/mes ahorra $60k',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                ),
                titulo: 'Soporte por WhatsApp real',
                desc: 'Te respondemos nosotros, no un chatbot. Menos de 1 hora en horario comercial, lunes a sábado. Sin tickets, sin colas, sin "por favor cree una cuenta para soporte".',
                highlight: 'Hablás con quien programó la plataforma',
              },
            ].map(d => (
              <div key={d.titulo} className="bg-amanda-white p-7 rounded-2xl border border-stone-200 hover:border-amanda-nude/40 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-amanda-nude/10 text-amanda-nude rounded-xl flex items-center justify-center mb-5">
                  {d.icon}
                </div>
                <h3 className="font-serif text-xl text-amanda-black mb-3 leading-tight">{d.titulo}</h3>
                <p className="text-sm text-amanda-gray leading-relaxed mb-4">{d.desc}</p>
                <div className="pt-3 border-t border-stone-100">
                  <p className="text-[10px] tracking-widest uppercase text-amanda-nude font-medium">
                    {d.highlight}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Callout de cierre */}
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-amanda-gray italic">
              No estás contratando una plataforma. Estás sumando un equipo técnico, una IA que vende, y una infraestructura que crece con vos.
            </p>
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
                <h3 className={`font-serif text-2xl mb-1 ${plan.destacado ? 'text-amanda-white' : 'text-amanda-black'}`}>
                  {plan.nombre}
                </h3>
                <p className={`text-[10px] tracking-widest uppercase mb-3 ${plan.destacado ? 'text-amanda-nude' : 'text-amanda-nude'}`}>
                  {plan.idealPara}
                </p>
                <p className={`text-sm mb-6 ${plan.destacado ? 'text-stone-400' : 'text-amanda-gray'}`}>
                  {plan.descripcion}
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`font-serif text-4xl ${plan.destacado ? 'text-amanda-white' : 'text-amanda-black'}`}>
                      ${plan.precio}
                    </span>
                    <span className={`text-sm ${plan.destacado ? 'text-stone-400' : 'text-amanda-gray'}`}>
                      {plan.periodo}
                    </span>
                  </div>
                  <p className={`text-xs mt-2 font-medium ${plan.destacado ? 'text-amanda-nude' : 'text-amanda-nude'}`}>
                    {plan.comision}
                  </p>
                  <p className={`text-[10px] mt-1 ${plan.destacado ? 'text-stone-500' : 'text-amanda-gray'}`}>
                    {plan.setup}
                  </p>
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
                  {plan.precio === 'A medida' ? 'Consultar' : 'Probar 14 días gratis'}
                </a>
              </div>
            ))}
          </div>

          {/* Garantía visible */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="bg-amanda-white border border-stone-200 rounded-2xl p-8 md:p-10 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl text-amanda-black mb-3">Garantía sin letra chica</h3>
              <p className="text-amanda-gray text-sm leading-relaxed max-w-xl mx-auto">
                Si en 14 días no estás convencido, cancelás sin pagar nada. Te damos un backup completo de tus productos y clientes. Tus datos son tuyos, siempre.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-[10px] tracking-widest uppercase text-amanda-gray">
                <span>14 días gratis</span>
                <span className="w-1 h-1 bg-amanda-gray rounded-full" />
                <span>Sin tarjeta</span>
                <span className="w-1 h-1 bg-amanda-gray rounded-full" />
                <span>Sin contrato</span>
                <span className="w-1 h-1 bg-amanda-gray rounded-full" />
                <span>Backup al cancelar</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPLICADOR: GROWTH O PRO ────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest uppercase text-amanda-nude mb-3">Elegí tu camino</p>
            <h2 className="font-serif text-3xl md:text-4xl text-amanda-black">¿Growth o Pro? Depende de dónde estés hoy.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Growth */}
            <div className="p-8 border border-stone-200 rounded-2xl hover:border-amanda-nude/40 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-lg">🌱</div>
                <div>
                  <h3 className="font-serif text-xl text-amanda-black">Growth</h3>
                  <p className="text-xs text-amanda-gray">$49.900/mes + 1% por venta</p>
                </div>
              </div>
              <p className="text-sm text-amanda-gray leading-relaxed mb-6">
                Ideal si recién arrancás o vendés menos de $2M/mes. La cuota mensual es baja para que no te pese al principio, y la comisión escala con tus ventas.
              </p>
              <div className="space-y-3">
                <p className="text-xs text-amanda-black font-medium">Ejemplo real:</p>
                <div className="bg-stone-50 rounded-lg p-4 space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-amanda-gray">Vendés $500.000/mes</span><span className="text-amanda-black">Pagás $54.900</span></div>
                  <div className="flex justify-between"><span className="text-amanda-gray">Vendés $1.000.000/mes</span><span className="text-amanda-black">Pagás $59.900</span></div>
                  <div className="flex justify-between"><span className="text-amanda-gray">Vendés $2.000.000/mes</span><span className="text-amanda-black">Pagás $69.900</span></div>
                </div>
                <p className="text-[10px] text-amanda-nude tracking-widest uppercase">Cuando pases los $2M/mes, te conviene pasarte a Pro</p>
              </div>
            </div>

            {/* Pro */}
            <div className="p-8 border-2 border-amanda-nude rounded-2xl bg-amanda-nude/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amanda-nude/20 rounded-full flex items-center justify-center text-lg">🚀</div>
                <div>
                  <h3 className="font-serif text-xl text-amanda-black">Pro</h3>
                  <p className="text-xs text-amanda-gray">$129.900/mes · 0% comisión</p>
                </div>
              </div>
              <p className="text-sm text-amanda-gray leading-relaxed mb-6">
                Ideal si ya vendés bien. Cuota fija predecible, sin sorpresas. No importa si vendés $2M o $20M — siempre pagás lo mismo.
              </p>
              <div className="space-y-3">
                <p className="text-xs text-amanda-black font-medium">Tu ahorro vs Growth:</p>
                <div className="bg-white rounded-lg p-4 space-y-2 text-xs border border-amanda-nude/20">
                  <div className="flex justify-between"><span className="text-amanda-gray">Vendés $3.000.000/mes</span><span className="text-emerald-600 font-medium">Ahorrás $49.900 vs Growth</span></div>
                  <div className="flex justify-between"><span className="text-amanda-gray">Vendés $5.000.000/mes</span><span className="text-emerald-600 font-medium">Ahorrás $99.900 vs Growth</span></div>
                  <div className="flex justify-between"><span className="text-amanda-gray">Vendés $8.000.000/mes</span><span className="text-emerald-600 font-medium">Ahorrás $209.900 vs Growth</span></div>
                </div>
                <p className="text-[10px] text-amanda-nude tracking-widest uppercase">Cuanto más vendés, más ahorrás</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIO ────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-4 sm:px-6 bg-amanda-black text-amanda-white">
        <div className="max-w-4xl mx-auto text-center">
          <svg className="w-12 h-12 mx-auto mb-8 text-amanda-nude/40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.5 10c-.22 0-.43.02-.65.05.67-2.2 2.73-3.75 5.15-3.75V4c-3.31 0-6 2.69-6 6 0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4zm11 0c-.22 0-.43.02-.65.05.67-2.2 2.73-3.75 5.15-3.75V4c-3.31 0-6 2.69-6 6 0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4z"/>
          </svg>

          <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed mb-10">
            Antes respondía mensajes hasta la una de la mañana. Ahora la IA contesta sola, las clientas encuentran lo que buscan, y yo me enfoco en diseñar la próxima colección.
          </blockquote>

          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-amanda-nude rounded-full flex items-center justify-center text-amanda-black font-serif text-lg">A</div>
            <div className="text-left">
              <p className="text-sm font-medium">Amanda Clothing</p>
              <p className="text-xs text-amanda-gray">Moda argentina · Primera cliente de TiendaIA</p>
            </div>
          </div>
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
          <p className="text-xs tracking-widest uppercase text-amanda-nude mb-4">Última llamada</p>
          <h2 className="font-serif text-4xl md:text-5xl mb-6 leading-tight">
            Tu próxima venta puede ocurrir
            <span className="text-amanda-nude"> mientras dormís</span>
          </h2>
          <p className="text-lg text-amanda-gray mb-4 leading-relaxed">
            Dejá de responder WhatsApps a las once de la noche.
          </p>
          <p className="text-sm text-amanda-gray mb-10">
            14 días gratis · Sin tarjeta · Setup en 1 día · Cancelás cuando quieras
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href={`https://wa.me/${WA}?text=${encodeURIComponent('Hola, quiero empezar 14 días gratis con TiendaIA')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 bg-amanda-nude text-white text-sm tracking-widest uppercase hover:brightness-110 transition-all font-medium shadow-lg shadow-amanda-nude/20"
            >
              Empezar 14 días gratis →
            </a>
            <Link
              href="/productos"
              className="px-10 py-4 border border-white/20 text-amanda-white text-sm tracking-widest uppercase hover:bg-white/5 transition-colors font-medium"
            >
              Ver demo primero
            </Link>
          </div>
          <p className="text-[10px] tracking-widest uppercase text-amanda-gray/70">
            Respuesta por WhatsApp en menos de 1 hora, de lunes a sábado.
          </p>
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
