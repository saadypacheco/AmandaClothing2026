import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'TiendaIA - Tu tienda online inteligente',
  description: 'E-commerce con IA 24/7 que atiende, vende y se administra solo. Aumenta tus conversiones desde el primer día.',
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
                Tu tienda con IA
              </h1>
              <p className="text-xl text-amanda-gray mb-4">
                E-commerce inteligente que atiende, vende y se administra solo.
              </p>
              <p className="text-sm text-amanda-gray mb-10">
                Aumenta conversiones desde el primer día. Diseñado para cualquier emprendedor, sin necesidad de saber de tecnología.
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
                Tu asistente inteligente responde todas las preguntas de clientes sin que vos tengas que estar. Talles, colores, envíos, cambios. Los clientes sienten atención personalizada. Las ventas suben automáticamente.
              </p>
              <ul className="space-y-3 text-amanda-gray">
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black font-bold">→</span>
                  <span>Responde al instante, a cualquier hora del día.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black font-bold">→</span>
                  <span>Conoce tus productos y tu marca perfectamente.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black font-bold">→</span>
                  <span>Vos solo respondes si el cliente necesita algo especial.</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-amanda-nude/20 to-amanda-nude/5 p-12 rounded-lg border-2 border-amanda-nude/40">
              <div className="aspect-square bg-gradient-to-br from-amanda-nude/40 to-amanda-nude/20 rounded-lg flex items-center justify-center text-6xl hover:scale-105 transition-transform">
                💬
              </div>
              <p className="text-center text-amanda-gray text-sm mt-4">IA responde automáticamente</p>
            </div>
          </div>

          {/* Feature 2: Recomendaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20 md:grid-flow-dense">
            <div className="md:order-2">
              <h3 className="font-serif text-3xl text-amanda-black mb-4">
                Vende más con recomendaciones inteligentes
              </h3>
              <p className="text-amanda-gray mb-6">
                El sistema aprende qué le gusta a cada cliente y le muestra exactamente eso. 3 tipos de recomendaciones inteligentes que hacen que compren más.
              </p>
              <ul className="space-y-3 text-amanda-gray">
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black font-bold">→</span>
                  <span>"Completá el look" — vende accesorios que van juntos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black font-bold">→</span>
                  <span>"Otros también vieron" — muestra lo que otros clientes miran.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black font-bold">→</span>
                  <span>"Para vos" — personalizado según lo que busca cada cliente.</span>
                </li>
              </ul>
            </div>
            <div className="md:order-1 bg-gradient-to-br from-amanda-nude/20 to-amanda-nude/5 p-12 rounded-lg border-2 border-amanda-nude/40">
              <div className="aspect-square bg-gradient-to-br from-amanda-nude/40 to-amanda-nude/20 rounded-lg flex items-center justify-center text-6xl hover:scale-105 transition-transform">
                🎯
              </div>
              <p className="text-center text-amanda-gray text-sm mt-4">Vende más con recomendaciones</p>
            </div>
          </div>

          {/* Feature 3: Admin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-serif text-3xl text-amanda-black mb-4">
                Admin tan fácil que hasta no-técnicos lo usan
              </h3>
              <p className="text-amanda-gray mb-6">
                Todo en un panel visual fácil de usar. Cero complicaciones, cero código. Hasta alguien sin experiencia puede gestionarlo perfectamente.
              </p>
              <ul className="space-y-3 text-amanda-gray">
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black font-bold">→</span>
                  <span>Sube fotos hermosas. Hasta 4 fotos por producto.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black font-bold">→</span>
                  <span>Maneja talles, colores y stock desde un mismo lugar.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amanda-black font-bold">→</span>
                  <span>Publica productos en Instagram, Telegram, Facebook con un click.</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-amanda-nude/20 to-amanda-nude/5 p-12 rounded-lg border-2 border-amanda-nude/40">
              <div className="aspect-square bg-gradient-to-br from-amanda-nude/40 to-amanda-nude/20 rounded-lg flex items-center justify-center text-6xl hover:scale-105 transition-transform">
                ⚙️
              </div>
              <p className="text-center text-amanda-gray text-sm mt-4">Admin fácil de usar</p>
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
                <li>✓ Búsqueda y filtros inteligentes</li>
                <li>✓ Fotos grandes y claras de productos</li>
                <li>✓ Carrito que recuerda todo</li>
                <li>✓ Marcar favoritos fácilmente</li>
                <li>✓ Compra rápida y segura</li>
                <li>✓ Chat para hacer preguntas</li>
                <li>✓ Ver todos sus pedidos anteriores</li>
              </ul>
            </div>

            {/* Marketing */}
            <div className="bg-amanda-lightgray p-10 rounded-lg">
              <div className="text-4xl mb-4">📢</div>
              <h3 className="font-serif text-2xl text-amanda-black mb-4">Para vender más</h3>
              <ul className="space-y-2 text-amanda-gray text-sm">
                <li>✓ Publica productos en redes sociales</li>
                <li>✓ Promociones y descuentos destacados</li>
                <li>✓ Avisos de "Nuevo" y "Pocas unidades"</li>
                <li>✓ Cupones y ofertas especiales</li>
                <li>✓ Ve cuál es tu producto más vendido</li>
                <li>✓ Observa cada acción de clientes</li>
                <li>✓ Dashboard con tus números de ventas</li>
              </ul>
            </div>

            {/* Admin */}
            <div className="bg-amanda-lightgray p-10 rounded-lg">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="font-serif text-2xl text-amanda-black mb-4">Para tu gestión</h3>
              <ul className="space-y-2 text-amanda-gray text-sm">
                <li>✓ Crear, editar y eliminar productos fácilmente</li>
                <li>✓ Galerías de fotos de productos</li>
                <li>✓ Gestión de talles, colores y categorías</li>
                <li>✓ Control de stock en tiempo real</li>
                <li>✓ Seguimiento de pedidos y estados</li>
                <li>✓ Panel de consultas de clientes</li>
                <li>✓ Dashboard con métricas de ventas</li>
              </ul>
            </div>

            {/* Tech */}
            <div className="bg-amanda-lightgray p-10 rounded-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-serif text-2xl text-amanda-black mb-4">Velocidad y seguridad</h3>
              <ul className="space-y-2 text-amanda-gray text-sm">
                <li>✓ Carga en menos de 1 segundo</li>
                <li>✓ Totalmente seguro y encriptado</li>
                <li>✓ Copias de seguridad automáticas</li>
                <li>✓ Optimizado para móviles</li>
                <li>✓ Crece automáticamente con tu negocio</li>
                <li>✓ Actualizaciones continuas gratis</li>
                <li>✓ Cero tareas técnicas para ti</li>
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
            <div className="flex flex-col items-center justify-center gap-3 p-4 bg-stone-800/40 rounded-lg hover:bg-stone-800/60 transition-colors">
              <span className="text-3xl">⚡</span>
              <p className="text-sm text-amanda-white font-medium">Next.js</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 p-4 bg-stone-800/40 rounded-lg hover:bg-stone-800/60 transition-colors">
              <span className="text-3xl">🔧</span>
              <p className="text-sm text-amanda-white font-medium">FastAPI</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 p-4 bg-stone-800/40 rounded-lg hover:bg-stone-800/60 transition-colors">
              <span className="text-3xl">🗄️</span>
              <p className="text-sm text-amanda-white font-medium">PostgreSQL</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 p-4 bg-stone-800/40 rounded-lg hover:bg-stone-800/60 transition-colors">
              <span className="text-3xl">🎨</span>
              <p className="text-sm text-amanda-white font-medium">Tailwind CSS</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 p-4 bg-stone-800/40 rounded-lg hover:bg-stone-800/60 transition-colors">
              <span className="text-3xl">🐳</span>
              <p className="text-sm text-amanda-white font-medium">Docker</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 p-4 bg-stone-800/40 rounded-lg hover:bg-stone-800/60 transition-colors">
              <span className="text-3xl">🤖</span>
              <p className="text-sm text-amanda-white font-medium">IA Gemini</p>
            </div>
          </div>

          <p className="text-amanda-gray mt-12 text-sm">
            + Vercel, TypeScript, Realtime, Autenticación segura
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
              <div className="text-3xl mb-4">🌱</div>
              <h3 className="font-medium text-amanda-black mb-3">Emprendedores nuevos</h3>
              <p className="text-amanda-gray text-sm">
                Empieza desde cero sin saber de tecnología. Admin visual, sin costos de programador. Todo listo para tu primer venta.
              </p>
            </div>

            <div className="bg-amanda-white p-8 rounded-lg border border-amanda-lightgray hover:border-amanda-black transition-colors">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="font-medium text-amanda-black mb-3">Negocios que crecen</h3>
              <p className="text-amanda-gray text-sm">
                Migra tu catálogo fácilmente. Aumenta ventas con IA y recomendaciones. Mantén el control total de tu marca.
              </p>
            </div>

            <div className="bg-amanda-white p-8 rounded-lg border border-amanda-lightgray hover:border-amanda-black transition-colors">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="font-medium text-amanda-black mb-3">Cualquier ramo</h3>
              <p className="text-amanda-gray text-sm">
                Ropa, accesorios, cosméticos, artesanías. Funciona para cualquier producto. Personaliza tu tienda con tu marca.
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
                Tus datos son 100% tuyos. Guardados de forma segura y encriptada. Backups automáticos diarios. Puedes acceder a ellos en cualquier momento.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
