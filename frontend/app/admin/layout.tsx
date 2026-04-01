export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-amanda-black text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-serif text-sm tracking-widest uppercase">Amanda — Admin</span>
          <nav className="flex gap-4">
            <a href="/admin/productos" className="text-xs tracking-widest uppercase text-white/70 hover:text-white transition-colors">
              Productos
            </a>
          </nav>
        </div>
        <a href="/" className="text-xs tracking-widest uppercase text-white/50 hover:text-white transition-colors">
          Ver tienda →
        </a>
      </header>
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
