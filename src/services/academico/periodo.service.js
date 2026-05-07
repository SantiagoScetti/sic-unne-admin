import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const applyEstadoFilter = (query, filtroEstado) => {
  if (filtroEstado === 'Activos') return query.eq('estado', true);
  if (filtroEstado === 'Inactivos') return query.eq('estado', false);
  return query;
};

// =============================================================================
// :Periodo — Objeto del dominio (C-03)
// =============================================================================

export const obtenerPeriodos = async (filtroEstado = 'Activos') => {
  try {
    const { data, error } = await applyEstadoFilter(supabase.from('periodo').select('*'), filtroEstado);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo periodos:', error.message);
    return { data: null, error: error.message };
  }
};

export const contarActivos = async () => {
  try {
    const { count, error } = await supabase
      .from('periodo')
      .select('*', { count: 'exact', head: true })
      .eq('estado', true);
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error contando periodos:', error.message);
    return 0;
  }
};

export const crear = async (data) => {
  try {
    const { data: result, error } = await supabase
      .from('periodo')
      .insert([{ nombre: data.nombre, fecha_inicio: data.fecha_inicio, fecha_fin: data.fecha_fin, estado: true }])
      .select();
    if (error) throw error;
    return { data: result ? result[0] : null, error: null };
  } catch (error) {
    console.error('Error creando periodo:', error.message);
    return { data: null, error: error.message };
  }
};

export const actualizar = async (id, data) => {
  try {
    const { data: result, error } = await supabase
      .from('periodo')
      .update({ nombre: data.nombre, fecha_inicio: data.fecha_inicio, fecha_fin: data.fecha_fin })
      .eq('id_periodo', id)
      .select();
    if (error) throw error;
    return { data: result ? result[0] : null, error: null };
  } catch (error) {
    console.error('Error actualizando periodo id=' + id + ':', error.message);
    return { data: null, error: error.message };
  }
};

export const cambiarEstado = async (id, estado) => {
  try {
    const { error } = await supabase
      .from('periodo')
      .update({ estado })
      .eq('id_periodo', id);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error cambiando estado periodo id=' + id + ':', error.message);
    return { error: error.message };
  }
};

/**
 * insertar — C-03, paso 4.
 * Upsert masivo de períodos desde filas del CSV.
 * Deduplica por nombre + fecha_inicio.
 */
export const insertar = async (filas) => {
  const vistas = new Set();
  const unicos = filas.filter((f) => {
    const key = [f.periodo_nombre, f.periodo_fecha_inicio].join('||');
    if (vistas.has(key)) return false;
    vistas.add(key);
    return true;
  });

  const registros = unicos.map((f) => ({
    nombre:       f.periodo_nombre,
    fecha_inicio: f.periodo_fecha_inicio,
    fecha_fin:    f.periodo_fecha_fin,
    estado:       true,
  }));

  const { data, error } = await supabase
    .from('periodo')
    .upsert(registros, { onConflict: 'nombre', ignoreDuplicates: false })
    .select();

  if (error) {
    console.error('Error insertando períodos:', error);
    throw new Error(error.message);
  }
  return data;
};
