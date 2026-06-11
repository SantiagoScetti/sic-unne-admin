import { getSupabaseServer } from '../supabaseServer';
import { Usuario } from '../../domain/usuario/Usuario';
import type { UsuarioData } from '../../domain/usuario/tipos';

// =============================================================================
// UsuarioRepositorio — Capa de persistencia (acceso a datos).
// Aísla el dominio del motor de base de datos. No es uno de los 3 patrones de
// diseño elegidos; es separación de capas (Layered Architecture).
// =============================================================================

export class UsuarioRepositorio {
  /**
   * Busca un usuario por su id primario.
   * Devuelve null si no existe ningún registro con ese id.
   * Trazabilidad: Diagrama de Secuencia C-01, pasos 5 / 13 / 16.
   *
   * @param id  id_usuario de la tabla `usuario`
   */
  async obtenerPorId(id: number): Promise<Usuario | null> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('usuario')
      .select('id_usuario, nombre, apellido, documento, correo, rol, estado, fecha_suspension_hasta')
      .eq('id_usuario', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data)  return null;
    return new Usuario(data as UsuarioData);
  }

  /**
   * Suspende un usuario. Estado de DB: 'Suspendido'.
   * @param idUsuario  id del usuario a suspender
   * @param fechaHasta fecha ISO hasta la cual dura la suspensión; null = indefinida
   */
  async suspender(idUsuario: number, fechaHasta: string | null): Promise<void> {
    const supabase = getSupabaseServer();
    // Persistencia vía STORED PROCEDURE (actualización en BD): sp_suspender_usuario.
    // La función PL/pgSQL hace el UPDATE de estado y fecha en el servidor de Postgres.
    const { error } = await supabase.rpc('sp_suspender_usuario', {
      p_id_usuario: idUsuario,
      p_fecha_hasta: fechaHasta,
    });

    if (error) throw new Error(error.message);
  }

  /**
   * Resuelve el administrador de la sesión actual.
   * (TODO: MOCK ACTUAL - recuperar el admin real usando supabase.auth.getUser()
   * con las cookies de sesión una vez implementada la autenticación en las rutas).
   */
  async obtenerAdminSesion(authId?: string | null): Promise<number | null> {
    const supabase = getSupabaseServer();
    
    let query = supabase.from('usuario').select('id_usuario').eq('rol', 'Administrador');
    if (authId) {
      query = query.eq('auth_id', authId);
    }

    const { data, error } = await query.order('id_usuario', { ascending: true }).limit(1).maybeSingle();

    if (error) throw new Error(error.message);
    return data?.id_usuario ?? null;
  }
}
