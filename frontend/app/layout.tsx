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

export const metadata: Metadata = {
  title: 'Amanda Clothing',
  description: 'Moda con identidad. Conectá directamente con la vendedora.',
};

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
