export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          email: string;
          nombre: string | null;
          rol: 'cliente' | 'admin';
          whatsapp: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          nombre?: string | null;
          rol?: 'cliente' | 'admin';
          whatsapp?: string | null;
          created_at?: string;
        };
        Update: {
          nombre?: string | null;
          whatsapp?: string | null;
        };
      };
    };
  };
};
