import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const applyEstadoFilter = (query, filtroEstado) => {
  if (filtroEstado === 'Activos') return query.eq('estado', true);
  if (filtroEstado === 'Inactivos') return query.eq('estado', false);
  return query;
};

// =============================================================================
// :Edificio — Objeto del dominio (C-03)
// Métodos trazables con el diagrama de secuencia C-03.
// =============================================================================

export const obtenerListado = async (filtroEstado = 'Activos') => {
  try {
    const { data, error } = await applyEstadoFilter(supabase.from('edificio').select('*'), filtroEstado);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo edificios:', error.message);
    return { data: null, error: error.message };
  }
};

export const contarActivos = async () => {
  try {
    const { count, error } = await supabase
      .from('edificio')
      .select('*', { count: 'exact', head: true })
      .eq('estado', true);
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error contando edificios:', error.message);
    return 0;
  }
};

export const crear = async (data) => {
  try {
    const { data: result, error } = await supabase
      .from('edificio')
      .insert([{ nombre: data.nombre, direccion: data.direccion, estado: true }])
      .select();
    if (error) throw error;
    return { data: result ? result[0] : null, error: null };
  } catch (error) {
    console.error('Error creando edificio:', error.message);
    return { data: null, error: error.message };
  }
};

export const actualizar = async (id, data) => {
  try {
    const { data: result, error } = await supabase
      .from('edificio')
      .update({ nombre: data.nombre, direccion: data.direccion })
      .eq('id_edificio', id)
      .select();
    if (error) throw error;
    return { data: result ? result[0] : null, error: null };
  } catch (error) {
    console.error('Error actualizando edificio id=' + id + ':', error.message);
    return { data: null, error: error.message };
  }
};

export const cambiarEstado = async (id, estado) => {
  try {
    const { error } = await supabase
      .from('edificio')
      .update({ estado })
      .eq('id_edificio', id);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error cambiando estado edificio id=' + id + ':', error.message);
    return { error: error.message };
  }
};

/**
 * insertar — C-03, paso 1.
 * Upsert masivo de edificios desde un array de filas parseadas del CSV.
 * Deduplica por nombre antes de hacer el upsert.
 * @param {Object[]} filas - Filas parseadas del CSV
 */
export const insertar = async (filas) => {
  // Deduplicar por nombre de edificio
  const vistas = new Set();
  const unicos = filas.filter((f) => {
    if (vistas.has(f.edificio_nombre)) return false;
    vistas.add(f.edificio_nombre);
    return true;
  });

  const registros = unicos.map((f) => ({
    nombre:    f.edificio_nombre,
    direccion: f.edificio_direccion || 'Sin especificar',
    estado:    true,
  }));

  const { data, error } = await supabase
    .from('edificio')
    .upsert(registros, { onConflict: 'nombre', ignoreDuplicates: false })
    .select();

  if (error) {
    console.error('Error insertando edificios:', error);
    throw new Error(error.message);
  }
  return data;
};
