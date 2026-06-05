import { getSupabaseServer } from '../supabaseServer';
import { Profesor } from '../../domain/profesor/Profesor';
import type { ProfesorData } from '../../domain/profesor/tipos';

// =============================================================================
// ProfesorRepositorio — Capa de persistencia del dominio Profesor.
// Aísla todo acceso a la tabla `profesor` y a la tabla de relación
// `comision_profesor`. No contiene lógica de negocio.
// =============================================================================

export class ProfesorRepositorio {
  /**
   * Busca un profesor por su id primario.
   * Devuelve null si no existe ningún registro con ese id.
   * Trazabilidad: Diagrama de Secuencia C-02, paso obtenerPorId(id_profesor).
   *
   * @param id  id_profesor de la tabla `profesor`
   */
  async buscarPorId(id: number): Promise<Profesor | null> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('profesor')
      .select('id_profesor, nombre, apellido, documento, correo, estado')
      .eq('id_profesor', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data)  return null;
    return new Profesor(data as ProfesorData);
  }

  /**
   * Devuelve los ids de todos los profesores vinculados a una comisión.
   * Trazabilidad: C-02 — obtener ids de profesores de la tabla `comision_profesor`.
   *
   * @param idComision  id_comision de la tabla `comision`
   */
  async listarIdsPorComision(idComision: number): Promise<number[]> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('comision_profesor')
      .select('id_profesor')
      .eq('id_comision', idComision);

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => row.id_profesor);
  }
}
