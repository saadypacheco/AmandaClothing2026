import { createBrowserClient } from '@supabase/ssr';

// Singleton — un solo cliente compartido por toda la app
// Evita la contención del lock de auth cuando múltiples componentes llaman createClient()
let instance: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  if (!instance) {
    instance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return instance;
};
