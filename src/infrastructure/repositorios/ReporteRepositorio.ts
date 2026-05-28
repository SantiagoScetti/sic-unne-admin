import { getSupabaseServer } from '../supabaseServer';
import { Reporte } from '../../domain/reporte/Reporte';
import type { ReporteData } from '../../domain/reporte/tipos';

// =============================================================================
// ReporteRepositorio — Capa de persistencia del agregado Reporte.
// Traduce entre filas de la tabla `reporte` y la entidad de dominio Reporte
// (que reconstruye su patrón Estado a partir del string `estado`).
// =============================================================================

export class ReporteRepositorio {
  async obtenerPorId(id: number): Promise<Reporte | null> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('reporte')
      .select('id_reporte, emisor_id, receptor_id, id_periodo, motivo, estado, fecha_alta, accion_tomada, admin_id')
      .eq('id_reporte', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // no encontrado
      throw new Error(error.message);
    }

    return new Reporte(data as ReporteData);
  }

  async guardar(reporte: Reporte): Promise<void> {
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from('reporte')
      .update(reporte.aFilaPersistible())
      .eq('id_reporte', reporte.id_reporte);

    if (error) throw new Error(error.message);
  }
}
