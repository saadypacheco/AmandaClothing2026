import type { Metadata } from 'next';
import './globals.css';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/Navbar';
const CartDrawer = dynamic(
  () => import('@/components/carrito/CartDrawer').then(m => m.CartDrawer),
  { ssr: false }
);

const ChatWidget = dynamic(
  () => import('@/components/chat/ChatWidget').then(m => m.ChatWidget),
  { ssr: false }
);

const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${API}/config`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error('fetch failed');
    const cfg = await res.json();
    return {
      title: cfg.nombre_tienda || 'Tienda',
      description: cfg.descripcion || '',
    };
  } catch {
    return { title: 'Tienda', description: '' };
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-amanda-white text-amanda-black">
        <Navbar />
        {children}
        <CartDrawer />
        <ChatWidget />
      </body>
    </html>
  );
}
