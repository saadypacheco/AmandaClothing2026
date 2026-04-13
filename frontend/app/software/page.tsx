import Link from 'next/link';

export const metadata = {
  title: 'Amanda Clothing - Tu tienda online lista en días',
  description: 'E-commerce con agente IA 24/7, chat en tiempo real y recomendaciones inteligentes. Diseñado para vender más.',
};

export default function SoftwarePage() {
  return (
    <div className="bg-amanda-white">
      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="bg-amanda-black text-amanda-white py-20 md:py-32">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl md:text-6xl mb-6 leading-tight">
            Tu tienda online, lista en días
          </h1>
          <p className="text-lg text-amanda-gray mb-8 max-w-2xl mx-auto">
            E-commerce moderno con agente IA 24/7, chat en tiempo real y motor de recomendaciones inteligente.
            Aumenta tus conversiones desde el primer día.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/productos"
              className="px-8 py-4 bg-amanda-white text-amanda-black text-sm tracking-widest uppercase hover:bg-amanda-nude transition-colors font-medium"
            >
              Ver demo en vivo
            </Link>
            <a
              href={`https://wa.me/5491133821989?text=Hola, quiero saber más sobre el e-commerce`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border border-amanda-white text-amanda-white text-sm tracking-widest uppercase hover:bg-amanda-white/10 transition-colors font-medium"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── DIFERENCIALES ───────────────────────────────────────────────────── */}
      <section className="py-20 md:py-32 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-amanda-black mb-4">
              Qué te diferencia del resto
            </h2>
            <p className="text-amanda-gray">Características diseñadas para convertir visitantes en clientes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 border border-amanda-lightgray hover:border-amanda-black transition-colors">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-serif text-xl mb-3 text-amanda-black">Agente IA 24/7</h3>
              <p className="text-amanda-gray text-sm">
                Responde preguntas sobre talles, colores, envíos y cambios automáticamente. Gemini 2.0 Flash genera respuestas precisas en tiempo real.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 border border-amanda-lightgray hover:border-amanda-black transition-colors">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-serif text-xl mb-3 text-amanda-black">Chat en tiempo real</h3>
              <p className="text-amanda-gray text-sm">
                Comunicate directamente con tus clientes. Supabase Realtime sincroniza mensajes al instante. Crea conexión y aumenta la confianza.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 border border-amanda-lightgray hover:border-amanda-black transition-colors">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-serif text-xl mb-3 text-amanda-black">Recomendaciones inteligentes</h3>
              <p className="text-amanda-gray text-sm">
                Motor de IA que aprende preferencias. 3 tipos de recomendaciones: completá el look, otras vieron, para vos. Aumenta carro promedio.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-8 border border-amanda-lightgray hover:border-amanda-black transition-colors">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="font-serif text-xl mb-3 text-amanda-black">Mobile-first</h3>
              <p className="text-amanda-gray text-sm">
                Diseñado desde el navegador móvil. 85% del tráfico viene de smartphones. Todos los usuarios tienen experiencia optimizada.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-8 border border-amanda-lightgray hover:border-amanda-black transition-colors">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="font-serif text-xl mb-3 text-amanda-black">Carrito y checkout integrado</h3>
              <p className="text-amanda-gray text-sm">
                Carrito persistente con actualizaciones optimistas. Checkout simplificado sin tarjeta. Integración con MercadoPago y WhatsApp.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-8 border border-amanda-lightgray hover:border-amanda-black transition-colors">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="font-serif text-xl mb-3 text-amanda-black">Panel admin completo</h3>
              <p className="text-amanda-gray text-sm">
                Gestiona productos, variantes, imágenes, categorías, pedidos y consultas desde un dashboard intuitivo. Sin código necesario.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-amanda-lightgray">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-amanda-black mb-16 text-center">
            Funcionalidades completas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Columna 1 */}
            <div>
              <h3 className="font-serif text-2xl text-amanda-black mb-6">Catálogo</h3>
              <ul className="space-y-3 text-amanda-gray">
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>Filtros por categoría, talla, color y precio</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>Búsqueda full-text en nombre y descripción</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>Galería multi-imagen (hasta 4 fotos por producto)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>Variantes por talla y color con stock en vivo</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>Badges de oferta, nuevo y stock bajo</span>
                </li>
              </ul>
            </div>

            {/* Columna 2 */}
            <div>
              <h3 className="font-serif text-2xl text-amanda-black mb-6">Ventas y Marketing</h3>
              <ul className="space-y-3 text-amanda-gray">
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>Wishlist (favoritos) por cliente</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>Publicar en redes (Telegram, Instagram, Facebook, WhatsApp, TikTok)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>Historial de pedidos por cliente</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>Seguimiento de eventos (vistas, clicks, conversiones)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>Analytics del motor de recomendaciones</span>
                </li>
              </ul>
            </div>

            {/* Columna 3 */}
            <div>
              <h3 className="font-serif text-2xl text-amanda-black mb-6">Gestión de contenido</h3>
              <ul className="space-y-3 text-amanda-gray">
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>CRUD de productos con validación</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>Gestión de variantes (talla, color, stock, SKU)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>Upload de imágenes a Supabase Storage</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>Gestión de categorías con slugs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>Lookbooks y secciones de inspiración</span>
                </li>
              </ul>
            </div>

            {/* Columna 4 */}
            <div>
              <h3 className="font-serif text-2xl text-amanda-black mb-6">Infraestructura</h3>
              <ul className="space-y-3 text-amanda-gray">
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>ISR (Incremental Static Regeneration) - CDN rápido</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>Autenticación con Supabase Auth</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>RLS (Row Level Security) en base de datos</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>Docker en VPS para backend escalable</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black mt-1">✓</span>
                  <span>Tests automáticos en cada push</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── STACK TECNOLÓGICO ────────────────────────────────────────────────── */}
      <section className="py-20 md:py-32 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-amanda-black mb-4">
              Construido con tecnología moderna
            </h2>
            <p className="text-amanda-gray">Stack escalable y mantenible para el futuro</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              'Next.js 14',
              'FastAPI',
              'Supabase',
              'Tailwind CSS',
              'Docker',
              'PostgreSQL',
              'Zustand',
              'TypeScript',
              'Google Generative AI',
              'GitHub Actions',
              'Vercel',
              'Pydantic',
            ].map((tech) => (
              <div
                key={tech}
                className="px-4 py-3 bg-amanda-lightgray border border-amanda-gray/20 text-center rounded text-sm text-amanda-black hover:border-amanda-black transition-colors"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────────────────── */}
      <section className="bg-amanda-nude text-amanda-white py-20 md:py-32 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">
            ¿Querés tu tienda online?
          </h2>
          <p className="text-lg mb-10 opacity-95">
            Mira la demo en vivo y descubrí cómo aumentar tus ventas con recomendaciones inteligentes y conexión directa con tus clientes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/productos"
              className="px-8 py-4 bg-amanda-white text-amanda-nude text-sm tracking-widest uppercase hover:bg-amanda-nude2 transition-colors font-medium"
            >
              Ver demo
            </Link>
            <a
              href={`https://wa.me/5491133821989?text=Hola, me interesa crear mi tienda online`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border-2 border-amanda-white text-amanda-white text-sm tracking-widest uppercase hover:bg-amanda-white/10 transition-colors font-medium"
            >
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-amanda-lightgray">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-amanda-black mb-16 text-center">
            Preguntas frecuentes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-medium text-amanda-black mb-2">¿Puedo usar mi propio dominio?</h3>
              <p className="text-amanda-gray text-sm">Sí, el e-commerce está diseñado para ser deployable en cualquier dominio propio con Vercel o tu servidor.</p>
            </div>
            <div>
              <h3 className="font-medium text-amanda-black mb-2">¿Qué métodos de pago soporta?</h3>
              <p className="text-amanda-gray text-sm">WhatsApp para contacto directo, MercadoPago Checkout Pro integrado, y transferencia bancaria manual.</p>
            </div>
            <div>
              <h3 className="font-medium text-amanda-black mb-2">¿Cuánto cuesta mantenerlo?</h3>
              <p className="text-amanda-gray text-sm">Vercel Free tier para el frontend. Supabase tiene free tier generoso. Backend en VPS propio con costo mínimo.</p>
            </div>
            <div>
              <h3 className="font-medium text-amanda-black mb-2">¿Puedo modificar el código?</h3>
              <p className="text-amanda-gray text-sm">Todo está en GitHub público. Puedes clonar, personalizar y deployar bajo tu propia marca.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
