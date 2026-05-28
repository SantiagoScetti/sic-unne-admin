import { getSupabaseServer } from '../supabaseServer';
import type { Comision } from '../../domain/comision/Comision';

// =============================================================================
// ComisionRepositorio — Capa de persistencia del agregado Comisión.
// Aísla todo el acceso a Supabase relacionado con comisiones, sus relaciones
// (comision_profesor) y las búsquedas auxiliares para la importación CSV.
// =============================================================================

type FiltroEstado = 'Activos' | 'Inactivos' | 'Todos';

interface FilaComision {
  id_comision: number;
  [campo: string]: unknown;
}

// Aplana la fila con relaciones anidadas a la forma que espera el frontend.
function normalizar(com: Record<string, any>): Record<string, unknown> {
  return {
    ...com,
    id_comision: com.id_comision,
    nombreComision: com.nombre,
    letraDesde: com.letra_desde,
    letraHasta: com.letra_hasta,
    nombreAsignatura: com.asignatura?.nombre ?? 'N/A',
    nombreFacultad: com.asignatura?.carrera?.facultad?.nombre ?? 'N/A',
    profesoresNombresArray: (com.comision_profesor ?? []).map(
      (cp: Record<string, any>) => `${cp.profesor?.nombre} ${cp.profesor?.apellido}`
    ),
  };
}

export class ComisionRepositorio {
  // ── Lecturas ──────────────────────────────────────────────────────────────
  async listar(filtroEstado: FiltroEstado): Promise<Record<string, unknown>[]> {
    const supabase = getSupabaseServer();
    let query = supabase.from('comision').select(`
      *,
      asignatura ( *, carrera ( *, facultad (*) ) ),
      comision_profesor ( profesor (*) )
    `);

    if (filtroEstado === 'Activos')   query = query.eq('estado', true);
    if (filtroEstado === 'Inactivos') query = query.eq('estado', false);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map(normalizar);
  }

  async contarActivas(): Promise<number> {
    const supabase = getSupabaseServer();
    const { count, error } = await supabase
      .from('comision')
      .select('*', { count: 'exact', head: true })
      .eq('estado', true);
    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  async existeAsignatura(idAsignatura: number): Promise<boolean> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('asignatura')
      .select('id_asignatura')
      .eq('id_asignatura', idAsignatura)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return !!data;
  }

  // ── Escrituras ──────────────────────────────────────────────────────────────
  async crear(comision: Comision): Promise<FilaComision> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('comision')
      .insert([comision.aFilaPersistible()])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as FilaComision;
  }

  async vincularProfesores(idComision: number, profesoresIds: number[]): Promise<void> {
    if (profesoresIds.length === 0) return;
    const supabase = getSupabaseServer();
    const relaciones = profesoresIds.map((id_profesor) => ({ id_comision: idComision, id_profesor }));
    const { error } = await supabase.from('comision_profesor').insert(relaciones);
    if (error) throw new Error(error.message);
  }

  async reemplazarProfesores(idComision: number, profesoresIds: number[]): Promise<void> {
    const supabase = getSupabaseServer();
    const { error: errDel } = await supabase
      .from('comision_profesor')
      .delete()
      .eq('id_comision', idComision);
    if (errDel) throw new Error(errDel.message);
    await this.vincularProfesores(idComision, profesoresIds);
  }

  async actualizar(idComision: number, fila: Record<string, unknown>): Promise<FilaComision | null> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('comision')
      .update(fila)
      .eq('id_comision', idComision)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return (data as FilaComision) ?? null;
  }

  async cambiarEstado(idComision: number, estado: boolean): Promise<void> {
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from('comision')
      .update({ estado })
      .eq('id_comision', idComision);
    if (error) throw new Error(error.message);
  }

  // ── Auxiliares para importación CSV (C-03) ──────────────────────────────────
  async buscarIdAsignaturaPorNombre(nombre: string): Promise<number | null> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('asignatura')
      .select('id_asignatura')
      .eq('nombre', nombre)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data?.id_asignatura ?? null;
  }

  async buscarIdComision(nombre: string, idAsignatura: number): Promise<number | null> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('comision')
      .select('id_comision')
      .eq('nombre', nombre)
      .eq('id_asignatura', idAsignatura)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data?.id_comision ?? null;
  }

  async buscarIdProfesorPorDocumento(documento: number): Promise<number | null> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('profesor')
      .select('id_profesor')
      .eq('documento', documento)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data?.id_profesor ?? null;
  }

  async upsertVinculo(idComision: number, idProfesor: number): Promise<void> {
    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from('comision_profesor')
      .upsert(
        { id_comision: idComision, id_profesor: idProfesor },
        { onConflict: 'id_comision,id_profesor', ignoreDuplicates: true }
      );
    if (error) throw new Error(error.message);
  }
}
