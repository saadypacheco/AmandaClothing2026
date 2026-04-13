import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Amanda Clothing - Tu tienda online lista en días',
  description: 'E-commerce inteligente con IA 24/7. Vende más con recomendaciones personalizadas y chat en tiempo real.',
};

export default function SoftwarePage() {
  return (
    <div className="bg-amanda-white">
      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-amanda-black to-stone-900 text-amanda-white py-24 md:py-40 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-serif text-5xl md:text-6xl mb-6 leading-tight">
                Vende con inteligencia
              </h1>
              <p className="text-xl text-amanda-gray mb-4">
                Tu tienda online con IA que habla con tus clientes y vende mientras duermes.
              </p>
              <p className="text-sm text-amanda-gray mb-10">
                Diseñado para aumentar conversiones desde el primer día. Sin necesidad de conocimientos técnicos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/productos"
                  className="px-8 py-4 bg-amanda-nude text-amanda-white text-sm tracking-widest uppercase hover:bg-amanda-nude hover:brightness-110 transition-all font-medium"
                >
                  Probar demo
                </Link>
                <a
                  href={`https://wa.me/5491133821989?text=Hola, quiero saber más sobre el e-commerce inteligente`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 border-2 border-amanda-white text-amanda-white text-sm tracking-widest uppercase hover:bg-amanda-white/10 transition-colors font-medium"
                >
                  Chat por WhatsApp
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-gradient-to-br from-amanda-nude/20 to-stone-700/20 p-8 rounded-lg border border-amanda-nude/30">
                <div className="aspect-[4/3] bg-stone-800 rounded flex items-center justify-center text-amanda-gray">
                  📱 Preview de tienda en vivo
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEMA → SOLUCIÓN ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-32 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-amanda-black mb-16 text-center">
            El problema: vender online es complicado
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="p-8 bg-amanda-lightgray rounded-lg">
              <div className="text-3xl mb-3">❌</div>
              <h3 className="font-medium text-amanda-black mb-2">Clientes sin respuesta</h3>
              <p className="text-amanda-gray text-sm">Las preguntas sin respuesta = pedidos perdidos. Tu vendedor no puede estar en chat 24/7.</p>
            </div>
            <div className="p-8 bg-amanda-lightgray rounded-lg">
              <div className="text-3xl mb-3">❌</div>
              <h3 className="font-medium text-amanda-black mb-2">Carrito abandonado</h3>
              <p className="text-amanda-gray text-sm">70% abandona el carrito sin comprar. Sin recomendaciones, no hay razón para quedarse.</p>
            </div>
            <div className="p-8 bg-amanda-lightgray rounded-lg">
              <div className="text-3xl mb-3">❌</div>
              <h3 className="font-medium text-amanda-black mb-2">Gestión manual</h3>
              <p className="text-amanda-gray text-sm">Admin lento, fotos sin sistema, stock perdido. Pierdes tiempo en tareas que no venden.</p>
            </div>
          </div>

          <div className="bg-amanda-nude/10 border border-amanda-nude/30 p-12 rounded-lg text-center mb-12">
            <h3 className="font-serif text-2xl text-amanda-black mb-4">↓ La solución</h3>
            <p className="text-lg text-amanda-black">
              Un e-commerce inteligente que <span className="font-medium">responde, vende y se administra solo</span>.
            </p>
          </div>
        </div>
      </section>

      {/* ── CARACTERÍSTICAS PRINCIPALES ──────────────────────────────────────── */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-stone-50">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="font-serif text-4xl text-amanda-black mb-16 text-center">
            3 funciones que cambian el juego
          </h2>

          {/* Feature 1: IA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="font-serif text-3xl text-amanda-black mb-4">
                IA que habla con tus clientes 24/7
              </h3>
              <p className="text-amanda-gray mb-6">
                Tu asistente IA responde preguntas sobre talles, colores, envíos y cambios. Los clientes sienten que alguien los atiende. Las conversiones suben automáticamente.
              </p>
              <ul className="space-y-3 text-amanda-gray">
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black font-bold">→</span>
                  <span>Responde en segundos, 24/7. Tu cliente no espera.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black font-bold">→</span>
                  <span>Aprende de tu tienda. Sabe sobre tus productos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black font-bold">→</span>
                  <span>Tú atiendes solo consultas complejas. La IA hace el resto.</span>
                </li>
              </ul>
            </div>
            <div className="bg-amanda-lightgray p-8 rounded-lg border-2 border-amanda-nude/20">
              <div className="aspect-square bg-gradient-to-br from-stone-200 to-stone-300 rounded flex items-center justify-center text-4xl">
                💬
              </div>
            </div>
          </div>

          {/* Feature 2: Recomendaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20 md:grid-flow-dense">
            <div className="md:order-2">
              <h3 className="font-serif text-3xl text-amanda-black mb-4">
                Vende más con recomendaciones inteligentes
              </h3>
              <p className="text-amanda-gray mb-6">
                El motor de IA muestra exactamente lo que cada cliente quiere ver. 3 tipos de recomendaciones que duplican el carrito promedio.
              </p>
              <ul className="space-y-3 text-amanda-gray">
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black font-bold">→</span>
                  <span>"Completá el look" — vende accesorios automáticamente.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black font-bold">→</span>
                  <span>"Otros también vieron" — crea urgencia y FOMO.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black font-bold">→</span>
                  <span>"Para vos" — personalizado por cliente. Se sienten VIP.</span>
                </li>
              </ul>
            </div>
            <div className="md:order-1 bg-amanda-lightgray p-8 rounded-lg border-2 border-amanda-nude/20">
              <div className="aspect-square bg-gradient-to-br from-stone-200 to-stone-300 rounded flex items-center justify-center text-4xl">
                🎯
              </div>
            </div>
          </div>

          {/* Feature 3: Admin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-serif text-3xl text-amanda-black mb-4">
                Admin tan fácil que hasta no-técnicos lo usan
              </h3>
              <p className="text-amanda-gray mb-6">
                Gesiona productos, fotos, variantes, pedidos y consultas sin escribir una línea de código. Todo en un dashboard visual.
              </p>
              <ul className="space-y-3 text-amanda-gray">
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black font-bold">→</span>
                  <span>Upload de fotos fácil. Galerías de hasta 4 imágenes por producto.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black font-bold">→</span>
                  <span>Gestión de talles y colores. Stock en vivo.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black font-bold">→</span>
                  <span>Publica en redes sociales directamente desde aquí.</span>
                </li>
              </ul>
            </div>
            <div className="bg-amanda-lightgray p-8 rounded-lg border-2 border-amanda-nude/20">
              <div className="aspect-square bg-gradient-to-br from-stone-200 to-stone-300 rounded flex items-center justify-center text-4xl">
                ⚙️
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES EN DETALLE ──────────────────────────────────────── */}
      <section className="py-20 md:py-32 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-amanda-black mb-16 text-center">
            Todo lo que necesitas para vender
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Tienda */}
            <div className="bg-amanda-lightgray p-10 rounded-lg">
              <div className="text-4xl mb-4">🛍️</div>
              <h3 className="font-serif text-2xl text-amanda-black mb-4">Para tus clientes</h3>
              <ul className="space-y-2 text-amanda-gray text-sm">
                <li>✓ Búsqueda y filtros por talla, color, precio</li>
                <li>✓ Galerías de fotos grandes y claras</li>
                <li>✓ Carrito persistente (no pierde datos)</li>
                <li>✓ Wishlist / Favoritos</li>
                <li>✓ Checkout rápido sin tarjeta</li>
                <li>✓ Chat directo con vendedor</li>
                <li>✓ Historial de pedidos guardado</li>
              </ul>
            </div>

            {/* Marketing */}
            <div className="bg-amanda-lightgray p-10 rounded-lg">
              <div className="text-4xl mb-4">📢</div>
              <h3 className="font-serif text-2xl text-amanda-black mb-4">Para vender más</h3>
              <ul className="space-y-2 text-amanda-gray text-sm">
                <li>✓ Publicar en Telegram, Instagram, Facebook, WhatsApp</li>
                <li>✓ Ofertas con descuentos automáticos</li>
                <li>✓ Badges "Nuevo" y "Últimas unidades"</li>
                <li>✓ Cupones y promociones</li>
                <li>✓ Analytics de qué vende más</li>
                <li>✓ Seguimiento de eventos de cliente</li>
                <li>✓ Dashboard de ventas en tiempo real</li>
              </ul>
            </div>

            {/* Admin */}
            <div className="bg-amanda-lightgray p-10 rounded-lg">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="font-serif text-2xl text-amanda-black mb-4">Para tu gestión</h3>
              <ul className="space-y-2 text-amanda-gray text-sm">
                <li>✓ CRUD fácil de productos y variantes</li>
                <li>✓ Upload de imágenes sin límite</li>
                <li>✓ Gestión de categorías</li>
                <li>✓ Control de stock en vivo</li>
                <li>✓ Estados de pedidos (nuevo, pagado, enviado, etc)</li>
                <li>✓ Panel de consultas/preguntas</li>
                <li>✓ Dashboard con métricas clave</li>
              </ul>
            </div>

            {/* Tech */}
            <div className="bg-amanda-lightgray p-10 rounded-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-serif text-2xl text-amanda-black mb-4">Velocidad y seguridad</h3>
              <ul className="space-y-2 text-amanda-gray text-sm">
                <li>✓ Carga en menos de 1 segundo desde CDN</li>
                <li>✓ Totalmente seguro (SSL, encriptación)</li>
                <li>✓ Backup automático de datos</li>
                <li>✓ Móvil optimizado (85% del tráfico)</li>
                <li>✓ Escala automática si creces</li>
                <li>✓ Soporte y actualizaciones continuas</li>
                <li>✓ No necesita mantenimiento técnico</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── TECNOLOGÍA (minimalista) ──────────────────────────────────────── */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-amanda-black text-amanda-white">
        <div className="max-w-screen-xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            Construido con tecnología confiable
          </h2>
          <p className="text-amanda-gray mb-12">
            Herramientas que usan millones de usuarios alrededor del mundo. Escalable, segura, y lista para crecer con tu negocio.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-items-center">
            {/* Next.js */}
            <div className="w-16 h-16 flex items-center justify-center bg-stone-800 rounded-lg hover:bg-stone-700 transition-colors">
              <svg className="w-8 h-8" viewBox="0 0 180 180" fill="white">
                <path d="M90 0C40.2 0 0 40.2 0 90s40.2 90 90 90 90-40.2 90-90S139.8 0 90 0zM71.4 135l-35.1-52h21.7L92.5 117l34.5-34h-21.7l-34.4 51v19zm34.3-34h21.8L109 135h-21.8l18.5-34z"/>
              </svg>
            </div>
            {/* FastAPI */}
            <div className="w-16 h-16 flex items-center justify-center bg-stone-800 rounded-lg hover:bg-stone-700 transition-colors">
              <span className="text-2xl">⚡</span>
            </div>
            {/* Supabase */}
            <div className="w-16 h-16 flex items-center justify-center bg-stone-800 rounded-lg hover:bg-stone-700 transition-colors">
              <span className="text-2xl">🔋</span>
            </div>
            {/* Tailwind */}
            <div className="w-16 h-16 flex items-center justify-center bg-stone-800 rounded-lg hover:bg-stone-700 transition-colors">
              <span className="text-2xl">🎨</span>
            </div>
            {/* Docker */}
            <div className="w-16 h-16 flex items-center justify-center bg-stone-800 rounded-lg hover:bg-stone-700 transition-colors">
              <span className="text-2xl">🐳</span>
            </div>
            {/* PostgreSQL */}
            <div className="w-16 h-16 flex items-center justify-center bg-stone-800 rounded-lg hover:bg-stone-700 transition-colors">
              <span className="text-2xl">🗄️</span>
            </div>
          </div>

          <p className="text-amanda-gray mt-12 text-sm">
            + Google AI (Gemini), Vercel, TypeScript, GitHub Actions
          </p>
        </div>
      </section>

      {/* ── CASOS DE USO ──────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-amanda-lightgray">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-amanda-black mb-16 text-center">
            Perfecto para cualquier vendedor
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-amanda-white p-8 rounded-lg border border-amanda-lightgray hover:border-amanda-black transition-colors">
              <div className="text-3xl mb-4">👗</div>
              <h3 className="font-medium text-amanda-black mb-3">Boutiques de ropa</h3>
              <p className="text-amanda-gray text-sm">
                Gestiona variantes (talla, color), subí fotos hermosas, publica en redes. Tus clientes recibirán recomendaciones personalizadas.
              </p>
            </div>

            <div className="bg-amanda-white p-8 rounded-lg border border-amanda-lightgray hover:border-amanda-black transition-colors">
              <div className="text-3xl mb-4">💄</div>
              <h3 className="font-medium text-amanda-black mb-3">Emprendimientos</h3>
              <p className="text-amanda-gray text-sm">
                Empieza desde cero sin saber código. Admin intuitivo, sin costos de programador. Crece y escala automáticamente.
              </p>
            </div>

            <div className="bg-amanda-white p-8 rounded-lg border border-amanda-lightgray hover:border-amanda-black transition-colors">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="font-medium text-amanda-black mb-3">Negocios existentes</h3>
              <p className="text-amanda-gray text-sm">
                Migra tu catálogo fácilmente. Aumenta ventas con IA y recomendaciones. Mantén control total de tu marca.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────────────────── */}
      <section className="bg-amanda-nude text-amanda-white py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-5xl mb-6">
            ¿Listo para vender inteligente?
          </h2>
          <p className="text-xl mb-12">
            Entra a la demo ahora. Sin registrarse, sin datos de tarjeta. Solo mira cómo funciona y después hablamos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/productos"
              className="px-10 py-4 bg-amanda-white text-amanda-nude text-sm tracking-widest uppercase hover:bg-amanda-nude2 transition-colors font-semibold text-lg"
            >
              Entrar a la demo
            </Link>
            <a
              href={`https://wa.me/5491133821989?text=Hola, quiero saber más sobre cómo implementar esto en mi tienda`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 border-2 border-amanda-white text-amanda-white text-sm tracking-widest uppercase hover:bg-amanda-white/10 transition-colors font-semibold text-lg"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-32 px-4 sm:px-6">
        <div className="max-w-screen-lg mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-amanda-black mb-16 text-center">
            Dudas frecuentes
          </h2>

          <div className="space-y-6">
            <div className="p-8 bg-amanda-lightgray rounded-lg hover:border-l-4 hover:border-amanda-nude transition-all">
              <h3 className="font-medium text-amanda-black mb-2 text-lg">¿Necesito saber programar?</h3>
              <p className="text-amanda-gray">
                No. Todo está listo para usarse. El admin es visual e intuitivo. Cualquier persona puede gestionar la tienda.
              </p>
            </div>

            <div className="p-8 bg-amanda-lightgray rounded-lg hover:border-l-4 hover:border-amanda-nude transition-all">
              <h3 className="font-medium text-amanda-black mb-2 text-lg">¿Cuánto cuesta?</h3>
              <p className="text-amanda-gray">
                Muy poco. Vercel es gratis. Supabase ofrece free tier generoso. El único costo es el hosting del backend en VPS (desde USD 5/mes).
              </p>
            </div>

            <div className="p-8 bg-amanda-lightgray rounded-lg hover:border-l-4 hover:border-amanda-nude transition-all">
              <h3 className="font-medium text-amanda-black mb-2 text-lg">¿Puedo personalizarlo con mi marca?</h3>
              <p className="text-amanda-gray">
                Sí. Cambia colores, logos, textos, fuentes. Todo es personalizable. Si quieres más cambios, podemos ayudarte con desarrollo.
              </p>
            </div>

            <div className="p-8 bg-amanda-lightgray rounded-lg hover:border-l-4 hover:border-amanda-nude transition-all">
              <h3 className="font-medium text-amanda-black mb-2 text-lg">¿Qué pasa si creo mucho?</h3>
              <p className="text-amanda-gray">
                Escala automáticamente. La infraestructura crece con vos. Si eso pasa, estaremos felices de ayudarte a optimizar costos.
              </p>
            </div>

            <div className="p-8 bg-amanda-lightgray rounded-lg hover:border-l-4 hover:border-amanda-nude transition-all">
              <h3 className="font-medium text-amanda-black mb-2 text-lg">¿Dónde están mis datos?</h3>
              <p className="text-amanda-gray">
                En Supabase (PostgreSQL). Tu datos son tuyos. Base de datos encriptada, backups automáticos diarios. Seguridad de enterprise.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
