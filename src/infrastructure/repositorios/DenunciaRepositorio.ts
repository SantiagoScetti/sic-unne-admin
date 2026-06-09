import { getSupabaseServer } from '../supabaseServer';
import { Denuncia } from '../../domain/denuncia/Denuncia';
import type { DenunciaData } from '../../domain/denuncia/tipos';

// =============================================================================
// DenunciaRepositorio — Capa de persistencia del agregado Denuncia.
// Traduce entre filas de la tabla `denuncia` y la entidad de dominio Denuncia
// (que reconstruye su patrón Estado a partir del string `estado`).
// =============================================================================

export class DenunciaRepositorio {
  async obtenerPorId(id: number): Promise<Denuncia | null> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('denuncia')
      .select('id_denuncia, emisor_id, receptor_id, id_periodo, motivo, estado, fecha_alta, accion_tomada, admin_id')
      .eq('id_denuncia', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }

    return new Denuncia(data as DenunciaData);
  }

  async guardar(denuncia: Denuncia): Promise<void> {
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from('denuncia')
      .update(denuncia.aFilaPersistible())
      .eq('id_denuncia', denuncia.id_denuncia);

    if (error) throw new Error(error.message);
  }

  /**
   * Estadísticas de denuncias agrupadas por estado.
   * CONSULTA vía STORED PROCEDURE: fn_contar_denuncias_por_estado().
   * La función SQL devuelve filas { estado, cantidad } calculadas en Postgres.
   */
  async contarPorEstado(): Promise<{ estado: string; cantidad: number }[]> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase.rpc('fn_contar_denuncias_por_estado');

    if (error) throw new Error(error.message);
    return (data ?? []).map((fila: { estado: string; cantidad: number }) => ({
      estado: fila.estado,
      cantidad: Number(fila.cantidad),
    }));
  }
}
