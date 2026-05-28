import { getSupabaseServer } from '../supabaseServer';

// =============================================================================
// UsuarioRepositorio — Capa de persistencia (acceso a datos).
// Aísla el dominio del motor de base de datos. No es uno de los 3 patrones de
// diseño elegidos; es separación de capas (Layered Architecture).
// =============================================================================

export class UsuarioRepositorio {
  /**
   * Suspende un usuario. Estado de DB: 'Suspendido'.
   * @param idUsuario  id del usuario a suspender
   * @param fechaHasta fecha ISO hasta la cual dura la suspensión; null = indefinida
   */
  async suspender(idUsuario: number, fechaHasta: string | null): Promise<void> {
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from('usuario')
      .update({ estado: 'Suspendido', fecha_suspension_hasta: fechaHasta })
      .eq('id_usuario', idUsuario);

    if (error) throw new Error(error.message);
  }

  /**
   * Resuelve un administrador por defecto para atribuir la auditoría cuando el
   * cliente no envía admin_id. (TODO: reemplazar por el admin de la sesión real
   * cuando se cablee la autenticación en las API Routes.)
   */
  async obtenerAdminPorDefecto(): Promise<number | null> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('usuario')
      .select('id_usuario')
      .eq('rol', 'Administrador')
      .order('id_usuario', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data?.id_usuario ?? null;
  }
}
