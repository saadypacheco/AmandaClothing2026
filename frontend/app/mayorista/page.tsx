import Link from 'next/link';

export const metadata = {
  title: 'TiendaIA Mayorista — Plataforma B2B para distribuidores y marcas',
  description: 'Catálogo privado por cliente, listas de precios diferenciales, cuenta corriente, aprobación de pedidos y cobranzas. Reemplazá Excel + WhatsApp por un canal mayorista profesional.',
};

const WA = '5491133821989';
const WA_MSG = encodeURIComponent('Hola, me interesa el módulo mayorista B2B de TiendaIA');

const beneficios = [
  {
    titulo: 'Catálogo privado por cliente',
    desc: 'Tus clientes ven solo lo que vos querés mostrarles. Login obligatorio + aprobación manual. Cero filtración de precios mayoristas a la competencia.',
    icon: '🔒',
  },
  {
    titulo: 'Listas de precios por segmento',
    desc: 'Mayorista A, B, distribuidor, revendedor — cada cliente ve su lista al loguearse. Importación masiva por CSV. Descuentos extra por cliente.',
    icon: '💲',
  },
  {
    titulo: 'Cuenta corriente con vencimientos',
    desc: 'Cada cliente con límite de crédito, condición de pago (15/30/60/90 días) y movimientos auditables (cargos, pagos, NC, ND). Saldo siempre real.',
    icon: '📒',
  },
  {
    titulo: 'Workflow de aprobación B2B',
    desc: 'Pedidos pasan por borrador → cotizado → pendiente_aprobacion → aprobado → preparación → despacho → entregado → facturado. Auto-aprobación por monto.',
    icon: '✓',
  },
  {
    titulo: '4 métodos de pago configurables',
    desc: 'MercadoPago, cuenta corriente, transferencia con comprobante o solicitud de cotización. El cliente elige al checkout.',
    icon: '💳',
  },
  {
    titulo: 'Mínimo de compra por producto',
    desc: 'Definí mínimo en unidades o packs. El backend valida antes de aprobar el pedido. Útil para fábricas y mayoristas duros.',
    icon: '📦',
  },
  {
    titulo: 'Cobranzas y alertas',
    desc: 'Dashboard con deuda vencida, próximos 7 días y total pendiente. El admin ve quién debe, cuánto y desde cuándo. Cliente ve su estado de cuenta.',
    icon: '⚠️',
  },
  {
    titulo: 'Reportes y exportables',
    desc: 'Ventas por cliente / producto / mes, ABC de productos (Pareto), margen bruto, top clientes. Todo exportable a CSV para tu contador.',
    icon: '📊',
  },
  {
    titulo: 'Atributos dinámicos por rubro',
    desc: 'No estás limitado a talle/color. Sumá voltaje, sabor, capacidad, tamaño, lo que necesites. El catálogo se adapta a tu industria.',
    icon: '🧩',
  },
];

const dashboardWidgets = [
  { label: 'Deuda vencida', valor: '$ 248.300', color: 'rose' },
  { label: 'Por vencer 7d', valor: '$ 87.500', color: 'amber' },
  { label: 'Pedidos a aprobar', valor: '4', color: 'amber' },
  { label: 'Stock crítico', valor: '7 prod.', color: 'rose' },
];

const flujo = [
  { num: '01', titulo: 'Cliente solicita cuenta', desc: 'Llena CUIT, razón social, condición IVA. Queda pendiente de aprobación.' },
  { num: '02', titulo: 'Vos aprobás y asignás', desc: 'Lista de precios, condición de pago, límite de crédito. Se crea su cuenta corriente automáticamente.' },
  { num: '03', titulo: 'Hace su pedido online', desc: 'Ve sus precios, respeta los mínimos, elige método de pago. Si paga con CC se carga al saldo automáticamente.' },
  { num: '04', titulo: 'Aprobás, despachás, facturás', desc: 'Workflow guiado paso a paso. Asignás número de remito y factura. El cliente ve todo en tiempo real.' },
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
  { titulo: 'App de vendedores con visita en ruta', desc: 'El vendedor visita al cliente y carga el pedido en su celular. Sin pasar por la oficina.' },
  { titulo: 'Catálogo PDF auto-generado', desc: 'Tu lista de precios en PDF compartible por WhatsApp, siempre actualizado.' },
  { titulo: 'Recordatorios automáticos de cobranza', desc: 'El cliente recibe WhatsApp 3 días antes del vencimiento. Si vence, recordatorio diario.' },
  { titulo: 'Integración AFIP (factura electrónica)', desc: 'Aprobás el pedido, se factura automático con tu CUIT. Mandás factura por mail al cliente.' },
  { titulo: 'Sincronización con ERP', desc: 'Tango, Bejerman, Holistor, Calipso. Stock + precios + clientes siempre sincronizados.' },
  { titulo: 'Reposición sugerida por IA', desc: 'El sistema analiza el historial del cliente y le propone un pedido sugerido cada X días.' },
  { titulo: 'Multi-depósito', desc: 'Stock por sucursal, asignación automática al despachar según cercanía.' },
  { titulo: 'Pedidos recurrentes', desc: 'El cliente programa "todos los lunes mando el mismo pedido". Se genera solo, vos solo aprobás.' },
];

const planes = [
  {
    nombre: 'B2B Starter',
    precio: '79.900',
    periodo: '/mes',
    setup: 'Setup: $49.900 (bonificable 1er mes)',
    descripcion: 'Mayoristas que arrancan o vienen de Excel + WhatsApp',
    destacado: false,
    idealPara: 'Hasta 30 clientes activos',
    features: [
      'Todo lo del módulo minorista de TiendaIA',
      'Catálogo privado con aprobación manual',
      'Listas de precios ilimitadas',
      'Cuenta corriente + cobranzas',
      'Workflow B2B de pedidos completo',
      '4 métodos de pago configurables',
      'Mínimo de compra por producto',
      'Reportes y export CSV',
      'Atributos dinámicos por categoría',
      'Dashboard de cobranzas',
      'Dominio propio + SSL',
      'Soporte por WhatsApp',
    ],
  },
  {
    nombre: 'B2B Pro',
    precio: '189.900',
    periodo: '/mes',
    setup: 'Setup: $89.900 (bonificable)',
    descripcion: 'Mayoristas establecidos con varias listas y cobranzas activas',
    destacado: true,
    idealPara: '+30 clientes activos · facturación >$5M/mes',
    features: [
      'Todo lo del plan Starter',
      'Clientes ilimitados',
      'Multi-vendedor con comisiones',
      'Aprobación de pedidos por jerarquía',
      'Exports automáticos por email diario',
      'Backups diarios automáticos',
      'API REST para integraciones',
      'Múltiples administradores',
      'Soporte prioritario',
    ],
  },
  {
    nombre: 'B2B Enterprise',
    precio: '399.000',
    periodo: '/mes',
    setup: 'Cotización a medida',
    descripcion: 'Marcas con múltiples sucursales o que necesitan integración con ERP/AFIP',
    destacado: false,
    idealPara: 'Distribuidores nacionales · +$20M/mes',
    features: [
      'Todo lo del plan Pro',
      'Integración con ERP (Tango, Bejerman, Holistor)',
      'Facturación electrónica AFIP',
      'App de vendedores en ruta',
      'Multi-depósito con asignación automática',
      'Recordatorios automáticos de cobranza',
      'Catálogo PDF auto-generado',
      'Servidor dedicado exclusivo',
      'Account manager personal',
      'SLA garantizado',
    ],
  },
];

const faqs = [
  {
    q: '¿Puedo tener tienda minorista y mayorista al mismo tiempo?',
    a: 'Sí. Cada modo es un deploy separado (dos dominios). Por ejemplo: tumarca.com para venta al público y mayorista.tumarca.com para tus clientes B2B. Comparten productos y stock si querés, o son independientes — vos decidís.',
  },
  {
    q: '¿Mis clientes mayoristas necesitan instalar algo?',
    a: 'No. Entran desde el navegador, móvil o desktop. Se loguean con email + clave. Funciona en cualquier dispositivo, sin app.',
  },
  {
    q: '¿Cómo cargo mis listas de precios actuales?',
    a: 'Importás un CSV con SKU, precio y descuento. Si tenés varias listas (Mayorista A, B, distribuidor), creás una por cada una. También las podés cargar a mano desde el panel.',
  },
  {
    q: '¿Mis clientes pueden pagar con cuenta corriente?',
    a: 'Sí — el cliente elige al checkout. El sistema verifica que no supere su límite de crédito, calcula vencimiento según su condición de pago, y registra el cargo en su CC. Vos ves saldos en tiempo real.',
  },
  {
    q: '¿Y si quiero combinar con MercadoPago para pedidos chicos?',
    a: 'Habilitás los 4 métodos: MP (contado), CC (a 15/30/60/90 días), transferencia (con comprobante) y solicitud de cotización (para pedidos custom). El cliente elige.',
  },
  {
    q: '¿Sirve para vender productos que no son ropa?',
    a: 'Sí. El catálogo tiene "atributos dinámicos" — cada categoría define sus propias dimensiones (voltaje, sabor, mililitros, lo que sea). Funciona igual para ferretería, bebidas, electrónica, etc.',
  },
  {
    q: '¿Mis datos quedan separados de los de otros clientes del SaaS?',
    a: 'Sí. Cada cliente tiene su propia base de datos Supabase. No hay cruce posible. Aislamiento total + backups diarios.',
  },
  {
    q: '¿En cuánto tiempo está activa mi tienda?',
    a: 'Configuración base en 1 día. Si cargás tus listas de precios y aprobás tus primeros clientes, en 3-5 días tenés clientes haciendo pedidos online.',
  },
];

export default function MayoristaPage() {
  return (
    <div className="bg-amanda-white">

      {/* ── NAVBAR PROPIO ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-amanda-black/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/software" className="font-serif text-xl tracking-wider text-amanda-white">
            TiendaIA <span className="text-amanda-nude text-xs tracking-widest uppercase ml-2">Mayorista</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#beneficios" className="hidden sm:block text-xs tracking-widest uppercase text-amanda-gray hover:text-amanda-white transition-colors">
              Beneficios
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
      <section className="relative bg-amanda-black text-amanda-white pt-32 pb-24 md:pt-44 md:pb-36 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amanda-black via-stone-900 to-amanda-black" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-amanda-nude/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amanda-nude/3 rounded-full blur-3xl" />

        <div className="relative max-w-screen-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-amanda-nude/40 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-amanda-nude rounded-full animate-pulse" />
            <span className="text-xs tracking-widest uppercase text-amanda-nude">Plataforma B2B · 14 días gratis</span>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight max-w-4xl mx-auto">
            Cambiá Excel + WhatsApp por un<span className="text-amanda-nude"> canal mayorista profesional</span>
          </h1>

          <p className="text-lg md:text-xl text-amanda-gray mb-4 max-w-2xl mx-auto leading-relaxed">
            Tus clientes hacen pedidos online con sus precios, su cuenta corriente y sus vencimientos.
          </p>
          <p className="text-sm md:text-base text-amanda-nude mb-12 max-w-2xl mx-auto">
            Vos ves todo el negocio en un dashboard: cobranzas, pedidos a aprobar, top clientes, stock crítico.
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
              href="#beneficios"
              className="px-10 py-4 border border-white/20 text-amanda-white text-sm tracking-widest uppercase hover:bg-white/5 transition-colors font-medium"
            >
              Ver qué incluye
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-16 text-[10px] tracking-widest uppercase text-amanda-gray">
            {['Sin tarjeta de crédito', 'Setup en 1 día', 'Tus datos son tuyos', 'Cancelás cuando quieras'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t}
              </span>
            ))}
          </div>

          {/* Mockup del dashboard mayorista */}
          <div className="max-w-5xl mx-auto bg-stone-900 rounded-xl border border-white/10 shadow-2xl shadow-amanda-nude/10 overflow-hidden">
            <div className="bg-stone-800 px-4 py-3 flex items-center gap-2 border-b border-white/5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <p className="text-[10px] text-amanda-gray ml-2 font-mono">tudistribuidora.com / admin / dashboard</p>
            </div>
            <div className="bg-stone-50 p-6 text-left">
              <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Dashboard mayorista</p>
              <h3 className="font-serif text-2xl text-stone-900 mb-5">Lunes, 16 de mayo</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {dashboardWidgets.map(w => (
                  <div key={w.label} className={`bg-white rounded-lg border border-stone-100 border-l-4 ${w.color === 'rose' ? 'border-l-rose-400' : 'border-l-amber-400'} p-4`}>
                    <p className="text-[10px] text-stone-400 uppercase tracking-wider">{w.label}</p>
                    <p className={`text-xl font-bold mt-1 ${w.color === 'rose' ? 'text-rose-600' : 'text-amber-600'}`}>{w.valor}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-stone-100 p-4">
                  <p className="text-[10px] tracking-widest uppercase text-stone-500 mb-3">Pedidos a revisar</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-stone-700">Distribuidora Norte SA</span><span className="font-semibold text-stone-900">$ 84.200</span></div>
                    <div className="flex justify-between"><span className="text-stone-700">Boutique Lía</span><span className="font-semibold text-stone-900">$ 31.800</span></div>
                    <div className="flex justify-between"><span className="text-stone-700">Modas del Sur</span><span className="font-semibold text-stone-900">$ 56.400</span></div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-stone-100 p-4">
                  <p className="text-[10px] tracking-widest uppercase text-stone-500 mb-3">Top clientes (3 meses)</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-stone-700 text-white text-[9px] flex items-center justify-center">1</span><span className="text-stone-700 flex-1">Boutique Lía</span><span className="font-semibold">$ 412k</span></div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-stone-700 text-white text-[9px] flex items-center justify-center">2</span><span className="text-stone-700 flex-1">Distribuidora Norte SA</span><span className="font-semibold">$ 318k</span></div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-stone-700 text-white text-[9px] flex items-center justify-center">3</span><span className="text-stone-700 flex-1">Modas del Sur</span><span className="font-semibold">$ 287k</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              'Tenés 4 listas de precios en Excel y siempre se desactualizan.',
              'No sabés en tiempo real cuánto te debe cada cliente ni qué está vencido.',
              'Pedís comprobantes de transferencia por WhatsApp y los perdés en el chat.',
              'Tus vendedores cargan pedidos en planilla y te los pasan a la noche.',
              'Repetís todos los días "che, ¿esa factura ya la pagaste?".',
            ].map((p, i) => (
              <div key={i} className="flex gap-3 items-start p-4 bg-white rounded-lg border border-stone-100">
                <span className="text-rose-500 text-xl shrink-0 leading-none mt-0.5">✕</span>
                <p className="text-sm text-stone-700">{p}</p>
              </div>
            ))}
          </div>
          <p className="text-sm md:text-base text-stone-600 mt-10 max-w-2xl mx-auto">
            Si todo lo de arriba te resuena, tu canal mayorista <strong>no es chico</strong> — es <strong>desorganizado</strong>. Lo digital ya no es opcional para tus competidores.
          </p>
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

      {/* ── BENEFICIOS ────────────────────────────────────────────────────── */}
      <section id="beneficios" className="py-20 md:py-28 px-4 sm:px-6 bg-stone-50">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest uppercase text-amanda-nude mb-3">Qué incluye</p>
            <h2 className="font-serif text-3xl md:text-5xl text-amanda-black mb-4">
              Todo lo que necesita un B2B serio
            </h2>
            <p className="text-base text-stone-600 max-w-2xl mx-auto">
              No es "Shopify con un parche mayorista". Es un sistema diseñado de cero para distribuidores y marcas con clientes B2B.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {beneficios.map(b => (
              <div key={b.titulo} className="bg-white rounded-xl border border-stone-200 p-6 hover:shadow-lg transition-shadow">
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
                  <th className="text-center py-4 px-3 text-xs tracking-widest uppercase text-amanda-nude font-medium">TiendaIA B2B</th>
                  <th className="text-center py-4 px-3 text-xs tracking-widest uppercase text-amanda-gray font-normal">Shopify B2B</th>
                  <th className="text-center py-4 px-3 text-xs tracking-widest uppercase text-amanda-gray font-normal">Tiendanube</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ['Cuenta corriente nativa', true, false, false],
                  ['Workflow de aprobación B2B', true, 'limitado', false],
                  ['Listas de precios por cliente', true, true, 'addon'],
                  ['Cobranzas y vencimientos', true, false, false],
                  ['Precio en pesos / locale LATAM', true, 'workaround', true],
                  ['Tus datos en tu Supabase', true, false, false],
                  ['Soporte por WhatsApp en español', true, false, true],
                  ['IA conversacional incluida', true, false, false],
                  ['Costo (USD/mes)', '~50', '+400', '~100'],
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
        </div>
      </section>

      {/* ── PRÓXIMAMENTE ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest uppercase text-amanda-nude mb-3">Roadmap</p>
            <h2 className="font-serif text-3xl md:text-5xl text-amanda-black mb-4">
              Próximamente <span className="text-amanda-nude">(plan Enterprise)</span>
            </h2>
            <p className="text-base text-stone-600 max-w-2xl mx-auto">
              Funcionalidades que vienen incluidas en el plan Enterprise o se cotizan a medida.
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
                <p className="text-xs tracking-widest uppercase text-amanda-nude mb-2">{p.nombre}</p>
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
                  href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hola, me interesa el plan ${p.nombre} de TiendaIA Mayorista`)}`}
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
            Dejá de cargar pedidos<br />
            <span className="text-amanda-nude">de WhatsApp a mano.</span>
          </h2>
          <p className="text-lg text-amanda-gray mb-10 max-w-xl mx-auto">
            Demo en vivo de 30 minutos. Te mostramos cómo se ve con tus productos, tus precios y tus clientes.
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
