import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const applyEstadoFilter = (query, filtroEstado) => {
  if (filtroEstado === 'Activos') return query.eq('estado', true);
  if (filtroEstado === 'Inactivos') return query.eq('estado', false);
  return query;
};

// =============================================================================
// :Profesor — Objeto del dominio (C-02, C-03)
// Métodos trazables con los diagramas de secuencia C-02 y C-03.
// =============================================================================

export const obtenerListado = async (filtroEstado = 'Activos') => {
  try {
    const { data, error } = await applyEstadoFilter(
      supabase.from('profesor').select('*, comision_profesor(count)'),
      filtroEstado
    );
    if (error) throw error;
    const planas = data.map(p => ({
      ...p,
      totalAsignaciones: p.comision_profesor?.[0]?.count || 0
    }));
    return { data: planas, error: null };
  } catch (error) {
    console.error('Error obteniendo profesores:', error.message);
    return { data: null, error: error.message };
  }
};

export const contarActivos = async () => {
  try {
    const { count, error } = await supabase
      .from('profesor')
      .select('*', { count: 'exact', head: true })
      .eq('estado', true);
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error contando profesores:', error.message);
    return 0;
  }
};

export const crear = async (data) => {
  try {
    const { data: result, error } = await supabase
      .from('profesor')
      .insert([{
        nombre: data.nombre,
        apellido: data.apellido,
        documento: Number(data.documento),
        correo: data.correo,
        estado: true,
      }])
      .select();
    if (error) throw error;
    return { data: result ? result[0] : null, error: null };
  } catch (error) {
    console.error('Error creando profesor:', error.message);
    return { data: null, error: error.message };
  }
};

export const actualizar = async (id, data) => {
  try {
    const { data: result, error } = await supabase
      .from('profesor')
      .update({
        nombre: data.nombre,
        apellido: data.apellido,
        documento: Number(data.documento),
        correo: data.correo,
      })
      .eq('id_profesor', id)
      .select();
    if (error) throw error;
    return { data: result ? result[0] : null, error: null };
  } catch (error) {
    console.error('Error actualizando profesor id=' + id + ':', error.message);
    return { data: null, error: error.message };
  }
};

export const cambiarEstado = async (id, estado) => {
  try {
    const { error } = await supabase
      .from('profesor')
      .update({ estado })
      .eq('id_profesor', id);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error cambiando estado profesor id=' + id + ':', error.message);
    return { error: error.message };
  }
};

/**
 * asignar — C-02, paso 3.
 * Inserta las relaciones N:M en comision_profesor para la comisión recién creada.
 * @param {number}   id_comision     - ID de la comisión a la que se asignan los profesores
 * @param {number[]} profesores_ids  - Array de IDs de profesores a vincular
 */
export const asignar = async (id_comision, profesores_ids) => {
  if (!profesores_ids || profesores_ids.length === 0) return;
  const relaciones = profesores_ids.map((id_profesor) => ({ id_comision, id_profesor }));
  const { error } = await supabase.from('comision_profesor').insert(relaciones);
  if (error) {
    console.error('Error asignando profesores a comisión:', error);
    throw new Error(error.message);
  }
};

/**
 * insertar — C-03, paso 6.
 * Upsert masivo de profesores desde un array de filas parseadas del CSV.
 * Deduplica por documento antes de hacer el upsert.
 * @param {Object[]} filas - Filas parseadas del CSV
 */
export const insertar = async (filas) => {
  // Deduplicar por documento
  const vistas = new Set();
  const unicos = filas.filter((f) => {
    if (vistas.has(f.profesor_documento)) return false;
    vistas.add(f.profesor_documento);
    return true;
  });

  const registros = unicos.map((f) => ({
    nombre:    f.profesor_nombre,
    apellido:  f.profesor_apellido,
    documento: Number(f.profesor_documento),
    correo:    f.profesor_correo || '',
    estado:    true,
  }));

  const { data, error } = await supabase
    .from('profesor')
    .upsert(registros, { onConflict: 'documento', ignoreDuplicates: false })
    .select();

  if (error) {
    console.error('Error insertando profesores:', error);
    throw new Error(error.message);
  }
  return data;
};
