// =============================================================================
// Shim de compatibilidad.
// El cliente Supabase del servidor (PATRÓN SINGLETON) vive ahora en la capa de
// infraestructura: src/infrastructure/supabaseServer.ts
// Este archivo re-exporta esa única instancia para no romper los imports
// existentes (handlers de comisiones, clase Comision, etc.).
// =============================================================================

export { getSupabaseServer } from '../../../infrastructure/supabaseServer';
