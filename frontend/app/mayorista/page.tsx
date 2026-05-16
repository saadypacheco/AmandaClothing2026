import Link from 'next/link';

export const metadata = {
  title: 'TiendaIA Mayorista — El copiloto que vende mientras vos atendés',
  description: 'IA que detecta clientes que dejaron de comprar, recupera ventas dormidas, sugiere pedidos por cliente y te dice exactamente qué hacer cada mañana. Más que un sistema: un copiloto comercial.',
};

const WA = '5491133821989';
const WA_MSG = encodeURIComponent('Hola, me interesa el módulo mayorista B2B de TiendaIA');

// ── Copiloto — features estrella ─────────────────────────────────────────────
const copilotoFeatures = [
  {
    titulo: 'Tu plan del día, cada mañana',
    desc: 'A las 8am recibís por WhatsApp un brief con las 3 acciones más rentables del día. No abrís el sistema: lo abrís cuando ves la plata.',
    impacto: '+22% conversión en clientes dormidos',
    icon: '☀️',
  },
  {
    titulo: 'Clientes dormidos detectados solos',
    desc: 'El sistema aprende cuándo te compra cada cliente. Cuando alguien rompe el patrón, te avisa antes que la competencia se lo lleve.',
    impacto: 'Recuperación promedio: $1.2M / mes',
    icon: '😴',
  },
  {
    titulo: 'Sugerencia de pedido por cliente',
    desc: 'Al cargar un pedido, ves: "este cliente normalmente lleva X y hace 45 días que no lo pide". Vende lo que el cliente ya quería comprar.',
    impacto: '+18% ticket promedio',
    icon: '🎯',
  },
  {
    titulo: 'Score de riesgo por cliente',
    desc: 'Cada cliente con badge 1-5 según frecuencia, ticket, mora y comportamiento. Ves de un vistazo quién necesita atención HOY.',
    impacto: '60% menos abandono',
    icon: '🚨',
  },
  {
    titulo: 'Recuperador automático de ventas',
    desc: 'Detecta categorías que dejaron de rotar y arma campañas WhatsApp con la lista de precios del cliente y un mensaje pensado para él.',
    impacto: 'Ventas recuperadas: ROI 8x',
    icon: '🔄',
  },
  {
    titulo: 'Cobranza con prioridad inteligente',
    desc: 'No es solo "quién debe". Es "a quién llamar primero según probabilidad de cobro y monto". Mensajes pre-armados para WhatsApp.',
    impacto: '-40% días promedio de cobro',
    icon: '💸',
  },
];

// ── Plataforma base (lo que ya está construido) ──────────────────────────────
const beneficios = [
  { titulo: 'Catálogo privado por cliente', desc: 'Login obligatorio + aprobación manual. Cada cliente ve solo lo suyo.', icon: '🔒' },
  { titulo: 'Listas de precios por segmento', desc: 'Mayorista A, B, distribuidor — import CSV masivo. Descuentos por cliente.', icon: '💲' },
  { titulo: 'Cuenta corriente real', desc: 'Límite de crédito, condición de pago, movimientos auditables.', icon: '📒' },
  { titulo: 'Workflow B2B completo', desc: 'Borrador → cotizado → aprobado → despacho → facturado. Auto-aprobación.', icon: '✓' },
  { titulo: '4 métodos de pago', desc: 'MercadoPago, cuenta corriente, transferencia, cotización.', icon: '💳' },
  { titulo: 'Mínimo de compra', desc: 'Por producto, en unidades o packs. Validado en backend.', icon: '📦' },
  { titulo: 'Reportes y export CSV', desc: 'Ventas por cliente / ABC / margen / cobranzas. Todo a Excel.', icon: '📊' },
  { titulo: 'Atributos dinámicos', desc: 'No solo talle/color. Voltaje, sabor, ml — cualquier rubro.', icon: '🧩' },
  { titulo: 'Dominio propio + SSL', desc: 'tudistribuidora.com. Tu marca, tus colores, tu identidad.', icon: '🌐' },
];

const flujo = [
  { num: '01', titulo: 'Cliente solicita cuenta', desc: 'CUIT, razón social, condición IVA. Queda pendiente de aprobación.' },
  { num: '02', titulo: 'Aprobás y asignás', desc: 'Lista de precios, condición de pago, límite. Su CC se crea sola.' },
  { num: '03', titulo: 'Hace su pedido online', desc: 'Ve sus precios, respeta mínimos, elige método de pago.' },
  { num: '04', titulo: 'El copiloto trabaja', desc: 'Detecta oportunidades, te avisa, sugiere acciones. Vos solo ejecutás.' },
];

const rubros = [
  { emoji: '👗', nombre: 'Indumentaria', detalle: 'Talles, colores, packs' },
  { emoji: '🔩', nombre: 'Ferretería', detalle: 'SKU, marcas, cantidades' },
  { emoji: '🍬', nombre: 'Golosinas y kioscos', detalle: 'Cajas, bultos, vencimiento' },
  { emoji: '💄', nombre: 'Cosmética y perfumería', detalle: 'Línea, presentación, ml' },
  { emoji: '🔌', nombre: 'Electrónica', detalle: 'Voltaje, modelo, garantía' },
  { emoji: '🍷', nombre: 'Bebidas', detalle: 'Variedad, añada, packs' },
  { emoji: '🧴', nombre: 'Limpieza', detalle: 'Bidón, caja, presentación' },
  { emoji: '🎨', nombre: 'Arte y librería', detalle: 'Color, tamaño, papel' },
];

const proximamente = [
  { titulo: 'WhatsApp 2-way con interpretación de audios', desc: 'Tu cliente te manda un audio "che, mandame 10 cajas de…" y el sistema lo convierte en pedido.' },
  { titulo: 'Catálogo PDF auto-generado', desc: 'Tu lista de precios en PDF, siempre actualizada, compartible por WhatsApp.' },
  { titulo: 'App de vendedores en ruta', desc: 'El vendedor carga pedidos desde el celular en visita. Sin pasar por la oficina.' },
  { titulo: 'Integración AFIP / facturación electrónica', desc: 'Aprobás el pedido → factura emitida automáticamente con tu CUIT.' },
  { titulo: 'Sincronización con ERP', desc: 'Tango, Bejerman, Holistor, Calipso. Stock + precios + clientes siempre sincronizados.' },
  { titulo: 'Pedidos recurrentes automáticos', desc: '"Todos los lunes mando el mismo pedido". Se genera solo, vos solo aprobás.' },
];

const planes = [
  {
    nombre: 'B2B Starter',
    precio: '79.900',
    periodo: '/mes',
    setup: 'Setup: $49.900 (bonificable 1er mes)',
    descripcion: 'Mayoristas que vienen de Excel + WhatsApp',
    destacado: false,
    idealPara: 'Hasta 30 clientes activos',
    copiloto: false,
    features: [
      'Plataforma B2B completa',
      'Catálogo privado con aprobación',
      'Listas de precios ilimitadas',
      'Cuenta corriente + cobranzas',
      'Workflow B2B de pedidos',
      '4 métodos de pago',
      'Reportes y export CSV',
      'Dominio propio + SSL',
      'Soporte WhatsApp',
    ],
  },
  {
    nombre: 'B2B Pro · Copiloto',
    precio: '189.900',
    periodo: '/mes',
    setup: 'Setup: $89.900 (bonificable)',
    descripcion: 'Vendé más sin sumar gente — el copiloto trabaja por vos',
    destacado: true,
    idealPara: '+30 clientes · facturación >$5M/mes',
    copiloto: true,
    features: [
      'Todo lo del plan Starter',
      '🧠 Asistente diario por WhatsApp',
      '😴 Detección de clientes dormidos',
      '🎯 Sugerencia de pedido por cliente',
      '🚨 Score de riesgo automático',
      '🔄 Recuperador de ventas dormidas',
      '💸 Cobranza con prioridad inteligente',
      'Multi-vendedor con comisiones',
      'API REST para integraciones',
      'Soporte prioritario',
    ],
  },
  {
    nombre: 'B2B Enterprise',
    precio: '399.000',
    periodo: '/mes',
    setup: 'Cotización a medida',
    descripcion: 'Marcas con múltiples sucursales o integración ERP/AFIP',
    destacado: false,
    idealPara: 'Distribuidores nacionales · +$20M/mes',
    copiloto: true,
    features: [
      'Todo lo del plan Pro · Copiloto',
      'WhatsApp 2-way con audio (Beta)',
      'Integración con ERP',
      'Facturación electrónica AFIP',
      'App de vendedores en ruta',
      'Multi-depósito',
      'Servidor dedicado',
      'Account manager',
      'SLA garantizado',
    ],
  },
];

const faqs = [
  {
    q: '¿Qué hace exactamente "el copiloto"?',
    a: 'Es un sistema que analiza tu data todas las noches (clientes, pedidos, cobranzas) y a las 8am te manda por WhatsApp las 3 acciones más rentables del día: a quién recuperar, a quién cobrar, qué vender. No tenés que abrir el sistema — solo ejecutar.',
  },
  {
    q: '¿Cuánto tarda el copiloto en aprender mi negocio?',
    a: 'Las recomendaciones útiles arrancan a los 30 días de uso (necesita ver patrones de compra). Las predicciones más finas mejoran a los 90 días. Mientras tanto ya tenés las alertas básicas (dormidos, mora, stock).',
  },
  {
    q: '¿El copiloto me reemplaza al vendedor?',
    a: 'No — lo hace más productivo. Le dice a quién llamar primero, qué decirle y por qué. Tus vendedores no tienen que adivinar dónde está la oportunidad: el sistema ya la encontró.',
  },
  {
    q: '¿Puedo tener tienda minorista y mayorista al mismo tiempo?',
    a: 'Sí. Cada modo es un deploy separado (dos dominios). Por ejemplo: tumarca.com para venta al público y mayorista.tumarca.com para tus clientes B2B. Comparten productos y stock si querés.',
  },
  {
    q: '¿Mis clientes mayoristas necesitan instalar algo?',
    a: 'No. Entran desde el navegador, móvil o desktop. Funciona en cualquier dispositivo.',
  },
  {
    q: '¿Cómo cargo mis listas de precios actuales?',
    a: 'Importás un CSV con SKU, precio y descuento. Una lista por segmento (Mayorista A, B, etc.).',
  },
  {
    q: '¿Sirve para vender productos que no son ropa?',
    a: 'Sí. Atributos dinámicos por categoría — cada rubro define sus propias dimensiones (voltaje, sabor, ml, lo que sea).',
  },
  {
    q: '¿Mis datos quedan separados de los de otros clientes?',
    a: 'Sí. Cada cliente tiene su propia base de datos. Cero cruce posible. Backups diarios.',
  },
];

export default function MayoristaPage() {
  return (
    <div className="bg-amanda-white">

      {/* ── NAVBAR PROPIO ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-amanda-black/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/software" className="font-serif text-xl tracking-wider text-amanda-white">
            TiendaIA <span className="text-amanda-nude text-xs tracking-widest uppercase ml-2">Copiloto Mayorista</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#copiloto" className="hidden sm:block text-xs tracking-widest uppercase text-amanda-gray hover:text-amanda-white transition-colors">
              Copiloto
            </a>
            <a href="#planes" className="hidden sm:block text-xs tracking-widest uppercase text-amanda-gray hover:text-amanda-white transition-colors">
              Planes
            </a>
            <a
              href={`https://wa.me/${WA}?text=${WA_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 bg-amanda-nude text-white text-xs tracking-widest uppercase hover:brightness-110 transition-all"
            >
              Pedir demo
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative bg-amanda-black text-amanda-white pt-32 pb-20 md:pt-44 md:pb-28 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amanda-black via-stone-900 to-amanda-black" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-amanda-nude/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amanda-nude/3 rounded-full blur-3xl" />

        <div className="relative max-w-screen-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-amanda-nude/40 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-amanda-nude rounded-full animate-pulse" />
            <span className="text-xs tracking-widest uppercase text-amanda-nude">Copiloto con IA · 14 días gratis</span>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight max-w-5xl mx-auto">
            El copiloto que <span className="text-amanda-nude">vende mientras vos atendés</span> el mostrador
          </h1>

          <p className="text-lg md:text-xl text-amanda-gray mb-3 max-w-2xl mx-auto leading-relaxed">
            Detecta clientes que dejaron de comprar. Recupera ventas dormidas. Te dice qué hacer cada mañana.
          </p>
          <p className="text-sm md:text-base text-amanda-nude mb-12 max-w-2xl mx-auto">
            No es un ERP más. Es un sistema que te ayuda a ganar más plata y perder menos tiempo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href={`https://wa.me/${WA}?text=${WA_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 bg-amanda-nude text-white text-sm tracking-widest uppercase hover:brightness-110 transition-all font-medium shadow-lg shadow-amanda-nude/20"
            >
              Pedir demo personalizada →
            </a>
            <a
              href="#copiloto"
              className="px-10 py-4 border border-white/20 text-amanda-white text-sm tracking-widest uppercase hover:bg-white/5 transition-colors font-medium"
            >
              Ver al copiloto en acción
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-16 text-[10px] tracking-widest uppercase text-amanda-gray">
            {['ROI desde el 1er mes', 'Setup en 1 día', 'Sin tarjeta', 'Cancelás cuando quieras'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t}
              </span>
            ))}
          </div>

          {/* ── MOCKUP DEL COPILOTO ─────────────────────────────────────────── */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-white/10 shadow-2xl shadow-amanda-nude/20 overflow-hidden">
            {/* Top bar */}
            <div className="bg-stone-900 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <p className="text-[10px] text-stone-400 ml-2 font-mono">tudistribuidora.com / copiloto</p>
              <div className="ml-auto flex items-center gap-2 text-[10px] text-stone-400">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Live · 08:00
              </div>
            </div>

            <div className="bg-stone-50 p-5 md:p-7 text-left">
              {/* Saludo */}
              <div className="mb-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amanda-nude to-amber-300 flex items-center justify-center shrink-0">
                  <span className="text-xl">🧠</span>
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-stone-400">Lunes 16 de mayo · 08:00</p>
                  <h3 className="font-serif text-xl md:text-2xl text-stone-900">Buen día Mariana. Hoy podés generar <span className="text-emerald-600 font-bold">$858.600</span></h3>
                </div>
              </div>

              {/* 3 KPIs accionables */}
              <div className="grid grid-cols-3 gap-2 md:gap-3 mb-5">
                <div className="bg-rose-50 rounded-xl border border-rose-100 p-3 md:p-4">
                  <p className="text-[9px] md:text-[10px] tracking-widest uppercase text-rose-600 mb-1">Recuperá</p>
                  <p className="text-lg md:text-2xl font-bold text-rose-700">$487.300</p>
                  <p className="text-[9px] md:text-[10px] text-rose-600 mt-1">5 clientes dormidos</p>
                </div>
                <div className="bg-amber-50 rounded-xl border border-amber-100 p-3 md:p-4">
                  <p className="text-[9px] md:text-[10px] tracking-widest uppercase text-amber-700 mb-1">Cobrá</p>
                  <p className="text-lg md:text-2xl font-bold text-amber-700">$248.300</p>
                  <p className="text-[9px] md:text-[10px] text-amber-700 mt-1">4 facturas vencidas</p>
                </div>
                <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-3 md:p-4">
                  <p className="text-[9px] md:text-[10px] tracking-widest uppercase text-emerald-700 mb-1">Vendé</p>
                  <p className="text-lg md:text-2xl font-bold text-emerald-700">$123.000</p>
                  <p className="text-[9px] md:text-[10px] text-emerald-700 mt-1">8 oportunidades</p>
                </div>
              </div>

              {/* Acción del día — destacada */}
              <div className="bg-white rounded-xl border-2 border-amanda-nude p-4 md:p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] tracking-widest uppercase text-amanda-nude font-bold">⚡ Acción más urgente</span>
                  <span className="ml-auto text-[10px] text-stone-400">Potencial: $84.200</span>
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-sm font-bold shrink-0">DN</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-stone-900">Distribuidora Norte SA</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      ⚠️ Hace <strong className="text-rose-600">47 días sin comprar</strong> · su promedio es cada 21 días
                    </p>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-lg p-3 mb-3">
                  <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-2">Productos que suele llevar</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-700">• Remera básica negra ×24</span>
                      <span className="text-stone-500">$36.000</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-700">• Pantalón sport gris ×12</span>
                      <span className="text-stone-500">$48.200</span>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-100 rounded-lg p-3 mb-3 border-l-2 border-emerald-400">
                  <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-1">💬 Mensaje sugerido</p>
                  <p className="text-xs text-stone-700 italic leading-relaxed">
                    "Hola Mariana, ¿cómo va? Te quedaste sin la remera negra que tanto se vende. Te armé el pedido habitual con un 8% de descuento por 48hs. ¿Lo aprobamos?"
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-emerald-600 text-white text-xs tracking-widest uppercase py-2.5 rounded-lg hover:bg-emerald-700 transition-colors">
                    Enviar por WhatsApp →
                  </button>
                  <button className="px-4 text-xs tracking-widest uppercase py-2.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50">
                    Más tarde
                  </button>
                </div>
              </div>

              {/* Mini-resumen abajo */}
              <p className="text-[10px] text-stone-400 mt-4 text-center">
                + 4 acciones más esperándote. El copiloto trabaja todos los días.
              </p>
            </div>
          </div>

          {/* Subtítulo bajo mockup */}
          <p className="text-base md:text-lg text-amanda-gray mt-12 max-w-3xl mx-auto">
            <strong className="text-amanda-white">Esto es lo que ves todas las mañanas.</strong> Sin abrir el sistema, sin perder tiempo, sin adivinar.
          </p>
        </div>
      </section>

      {/* ── PROBLEMA / AUDIENCIA ──────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-stone-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-widest uppercase text-amanda-nude mb-3">Para vos si...</p>
          <h2 className="font-serif text-3xl md:text-5xl text-amanda-black mb-10">
            ¿Te suena familiar?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            {[
              'Tus clientes te mandan pedidos por WhatsApp y los pasás a mano al sistema.',
              'Sentís que se te van clientes y no sabés por qué — los descubrís cuando ya se fueron.',
              'Tenés 4 listas de precios en Excel y siempre se desactualizan.',
              'No sabés en tiempo real cuánto te debe cada cliente ni qué está vencido.',
              'Tus vendedores cargan pedidos en planilla y te los pasan a la noche.',
              'Querés crecer pero sumar otro vendedor no te cierra el número.',
            ].map((p, i) => (
              <div key={i} className="flex gap-3 items-start p-4 bg-white rounded-lg border border-stone-100">
                <span className="text-rose-500 text-xl shrink-0 leading-none mt-0.5">✕</span>
                <p className="text-sm text-stone-700">{p}</p>
              </div>
            ))}
          </div>
          <p className="text-sm md:text-base text-stone-600 mt-10 max-w-2xl mx-auto">
            Si todo lo de arriba te resuena, no tenés un problema de <em>volumen</em>: tenés un problema de <strong>información</strong>. Mientras facturás, hay plata sobre la mesa que no estás levantando.
          </p>
        </div>
      </section>

      {/* ── EL COPILOTO ───────────────────────────────────────────────────── */}
      <section id="copiloto" className="py-20 md:py-28 px-4 sm:px-6 bg-amanda-black text-amanda-white">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest uppercase text-amanda-nude mb-3">El diferencial</p>
            <h2 className="font-serif text-3xl md:text-5xl mb-4">
              El copiloto trabaja <span className="text-amanda-nude">mientras vos atendés</span>
            </h2>
            <p className="text-base text-amanda-gray max-w-2xl mx-auto">
              No es otro dashboard con gráficos lindos. Es un sistema que <strong>te dice qué hacer, con qué cliente, con qué producto y cuánta plata podés generar</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {copilotoFeatures.map(b => (
              <div key={b.titulo} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-amanda-nude/40 transition-colors">
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="font-serif text-lg text-amanda-white mb-2">{b.titulo}</h3>
                <p className="text-sm text-amanda-gray leading-relaxed mb-3">{b.desc}</p>
                <p className="text-[10px] tracking-widest uppercase text-amanda-nude font-medium">📈 {b.impacto}</p>
              </div>
            ))}
          </div>

          {/* Bloque "principio" */}
          <div className="mt-16 max-w-3xl mx-auto text-center bg-amanda-nude/10 border border-amanda-nude/30 rounded-2xl p-8">
            <p className="text-xs tracking-widest uppercase text-amanda-nude mb-3">El principio</p>
            <p className="font-serif text-2xl md:text-3xl text-amanda-white leading-relaxed">
              Cada feature responde a una pregunta:<br />
              <span className="text-amanda-nude">¿Esto te ayuda a ganar más plata?</span>
            </p>
            <p className="text-sm text-amanda-gray mt-4">
              Si no, no está. No vas a encontrar pantallas burocráticas inútiles. Solo lo que mueve el negocio.
            </p>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ─────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest uppercase text-amanda-nude mb-3">Cómo funciona</p>
            <h2 className="font-serif text-3xl md:text-5xl text-amanda-black">
              4 pasos. Vos elegís cuánto control.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {flujo.map((f) => (
              <div key={f.num} className="text-left">
                <p className="font-serif text-4xl text-amanda-nude mb-3">{f.num}</p>
                <h3 className="font-serif text-xl text-amanda-black mb-2">{f.titulo}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATAFORMA (base) ─────────────────────────────────────────────── */}
      <section id="plataforma" className="py-20 md:py-28 px-4 sm:px-6 bg-stone-50">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest uppercase text-amanda-nude mb-3">La base</p>
            <h2 className="font-serif text-3xl md:text-5xl text-amanda-black mb-4">
              Plataforma B2B sólida + Copiloto encima
            </h2>
            <p className="text-base text-stone-600 max-w-2xl mx-auto">
              El copiloto necesita una plataforma sólida abajo. Tenemos las dos cosas en un solo producto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {beneficios.map(b => (
              <div key={b.titulo} className="bg-white rounded-xl border border-stone-200 p-6">
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="font-serif text-lg text-amanda-black mb-2">{b.titulo}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RUBROS ────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest uppercase text-amanda-nude mb-3">No solo indumentaria</p>
            <h2 className="font-serif text-3xl md:text-5xl text-amanda-black mb-4">
              Sirve para cualquier rubro
            </h2>
            <p className="text-base text-stone-600 max-w-2xl mx-auto">
              Gracias a los atributos dinámicos, cada categoría define sus propias dimensiones. Sin código.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {rubros.map(r => (
              <div key={r.nombre} className="bg-white rounded-xl border border-stone-200 p-5 text-center hover:border-amanda-nude transition-colors">
                <div className="text-4xl mb-3">{r.emoji}</div>
                <p className="text-sm font-medium text-amanda-black mb-1">{r.nombre}</p>
                <p className="text-[11px] text-stone-500">{r.detalle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFERENCIALES VS COMPETENCIA ───────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-amanda-black text-amanda-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs tracking-widest uppercase text-amanda-nude mb-3">Vs. la competencia</p>
            <h2 className="font-serif text-3xl md:text-5xl mb-4">
              ¿Por qué no Shopify B2B o Tiendanube?
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-3 text-xs tracking-widest uppercase text-amanda-gray font-normal"></th>
                  <th className="text-center py-4 px-3 text-xs tracking-widest uppercase text-amanda-nude font-medium">TiendaIA</th>
                  <th className="text-center py-4 px-3 text-xs tracking-widest uppercase text-amanda-gray font-normal">Shopify B2B</th>
                  <th className="text-center py-4 px-3 text-xs tracking-widest uppercase text-amanda-gray font-normal">Tiendanube</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ['Copiloto IA con asistente diario', true, false, false],
                  ['Detección clientes dormidos', true, false, false],
                  ['Sugerencia de pedido por cliente', true, false, false],
                  ['Score de riesgo automático', true, false, false],
                  ['Cuenta corriente nativa', true, false, false],
                  ['Workflow de aprobación B2B', true, 'limitado', false],
                  ['Listas de precios por cliente', true, true, 'addon'],
                  ['Tus datos en tu Supabase', true, false, false],
                  ['Soporte WhatsApp en español', true, false, true],
                  ['Costo (USD/mes)', '~110', '+400', '~100'],
                ].map(([feat, ti, sh, tn], i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-3 px-3 text-amanda-white">{feat as string}</td>
                    <td className="text-center py-3 px-3">
                      {typeof ti === 'boolean' ? (ti ? <span className="text-emerald-400 text-lg">✓</span> : <span className="text-rose-400">—</span>) : <span className="text-amanda-nude font-medium">{ti}</span>}
                    </td>
                    <td className="text-center py-3 px-3">
                      {typeof sh === 'boolean' ? (sh ? <span className="text-emerald-400">✓</span> : <span className="text-rose-400/60">—</span>) : <span className="text-amanda-gray text-xs italic">{sh}</span>}
                    </td>
                    <td className="text-center py-3 px-3">
                      {typeof tn === 'boolean' ? (tn ? <span className="text-emerald-400">✓</span> : <span className="text-rose-400/60">—</span>) : <span className="text-amanda-gray text-xs italic">{tn}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-xs text-amanda-gray mt-6 max-w-2xl mx-auto">
            Shopify y Tiendanube te dan una tienda. Nosotros te damos una tienda <strong className="text-amanda-nude">+ un sistema que te dice cómo venderle a cada cliente</strong>.
          </p>
        </div>
      </section>

      {/* ── PRÓXIMAMENTE ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest uppercase text-amanda-nude mb-3">Roadmap</p>
            <h2 className="font-serif text-3xl md:text-5xl text-amanda-black mb-4">
              Próximamente <span className="text-amanda-nude">(Enterprise)</span>
            </h2>
            <p className="text-base text-stone-600 max-w-2xl mx-auto">
              Funcionalidades premium para clientes con volumen alto.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proximamente.map(p => (
              <div key={p.titulo} className="bg-white rounded-xl border border-stone-200 p-5">
                <p className="text-[10px] tracking-widest uppercase text-amanda-nude mb-1">Próximamente</p>
                <h3 className="font-serif text-lg text-amanda-black mb-1">{p.titulo}</h3>
                <p className="text-sm text-stone-600">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANES ────────────────────────────────────────────────────────── */}
      <section id="planes" className="py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs tracking-widest uppercase text-amanda-nude mb-3">Planes y precios</p>
            <h2 className="font-serif text-3xl md:text-5xl text-amanda-black mb-4">
              Elegí el plan que se adapta
            </h2>
            <p className="text-base text-stone-600 max-w-2xl mx-auto">
              Sin sorpresas. Sin comisión por venta. Cancelás cuando quieras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {planes.map(p => (
              <div key={p.nombre} className={`relative bg-white rounded-2xl p-7 ${p.destacado ? 'border-2 border-amanda-nude shadow-xl shadow-amanda-nude/10' : 'border border-stone-200'}`}>
                {p.destacado && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amanda-nude text-white text-[10px] tracking-widest uppercase px-3 py-1 rounded-full">
                    Más elegido
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs tracking-widest uppercase text-amanda-nude">{p.nombre}</p>
                  {p.copiloto && <span className="text-[10px] bg-amanda-nude/15 text-amanda-nude px-2 py-0.5 rounded-full">🧠 con Copiloto</span>}
                </div>
                <div className="mb-3">
                  <span className="font-serif text-4xl text-amanda-black">${p.precio}</span>
                  <span className="text-sm text-stone-500 ml-1">{p.periodo}</span>
                </div>
                <p className="text-sm text-stone-600 mb-1">{p.descripcion}</p>
                <p className="text-[11px] text-amanda-nude mb-4">{p.idealPara}</p>
                <p className="text-[10px] text-stone-400 tracking-wider uppercase mb-5">{p.setup}</p>

                <ul className="space-y-2 mb-7">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-stone-700">
                      <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hola, me interesa el plan ${p.nombre} de TiendaIA`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center py-3 text-xs tracking-widest uppercase transition-colors ${
                    p.destacado
                      ? 'bg-amanda-nude text-white hover:brightness-110'
                      : 'border border-amanda-black text-amanda-black hover:bg-amanda-black hover:text-white'
                  }`}
                >
                  Quiero este plan
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-stone-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest uppercase text-amanda-nude mb-3">Preguntas frecuentes</p>
            <h2 className="font-serif text-3xl md:text-5xl text-amanda-black">
              Lo que más nos preguntan
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="group bg-white rounded-xl border border-stone-200 p-5 cursor-pointer">
                <summary className="flex items-center justify-between text-sm font-medium text-amanda-black list-none">
                  {f.q}
                  <svg className="w-4 h-4 text-stone-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-sm text-stone-600 mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-4 sm:px-6 bg-amanda-black text-amanda-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-4xl md:text-6xl mb-6 leading-tight">
            Dejá de adivinar.<br />
            <span className="text-amanda-nude">Dejá que el copiloto te diga.</span>
          </h2>
          <p className="text-lg text-amanda-gray mb-10 max-w-xl mx-auto">
            Demo en vivo de 30 minutos. Te mostramos cómo se ve el copiloto con tus productos, tus clientes y tu data real.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${WA}?text=${WA_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 bg-amanda-nude text-white text-sm tracking-widest uppercase hover:brightness-110 transition-all font-medium shadow-lg shadow-amanda-nude/20"
            >
              Pedir demo por WhatsApp
            </a>
            <Link
              href="/software"
              className="px-10 py-4 border border-white/20 text-amanda-white text-sm tracking-widest uppercase hover:bg-white/5 transition-colors font-medium"
            >
              Ver versión minorista
            </Link>
          </div>
          <p className="text-[10px] tracking-widest uppercase text-amanda-gray mt-10">
            Sin tarjeta · Sin compromiso · Te asesoramos según tu rubro
          </p>
        </div>
      </section>

    </div>
  );
}
