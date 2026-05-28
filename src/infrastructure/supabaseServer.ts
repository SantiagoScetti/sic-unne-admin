import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// =============================================================================
// supabaseServer — PATRÓN SINGLETON.
//
// Garantiza una única instancia del cliente Supabase del lado del servidor
// durante todo el ciclo de vida del proceso Node. Evita abrir conexiones
// redundantes en cada llamada a las API Routes.
//
// Usa SUPABASE_SERVICE_ROLE_KEY (variable SIN prefijo NEXT_PUBLIC_), por lo que
// solo es accesible desde el servidor y nunca llega al bundle del cliente.
// La autorización es responsabilidad de cada API Route (capa de Controladores).
// =============================================================================

let _instancia: SupabaseClient | null = null;

export const getSupabaseServer = (): SupabaseClient => {
  if (_instancia) return _instancia;

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Faltan variables de entorno SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env.local'
    );
  }

  _instancia = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _instancia;
};
