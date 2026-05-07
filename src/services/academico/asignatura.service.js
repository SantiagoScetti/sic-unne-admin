import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const applyEstadoFilter = (query, filtroEstado) => {
  if (filtroEstado === 'Activos') return query.eq('estado', true);
  if (filtroEstado === 'Inactivos') return query.eq('estado', false);
  return query;
};

// =============================================================================
// :Asignatura — Objeto del dominio (C-02, C-03)
// Métodos trazables con los diagramas de secuencia C-02 y C-03.
// =============================================================================

export const obtenerListado = async (filtroEstado = 'Activos') => {
  try {
    const { data, error } = await applyEstadoFilter(
      supabase.from('asignatura').select(`
        *,
        periodo(nombre),
        carrera(nombre, facultad(nombre)),
        comision(comision_profesor(profesor(nombre, apellido)))
      `),
      filtroEstado
    );
    if (error) throw error;
    const planas = data.map(a => {
      return {
        ...a,
        nombrePeriodo: a.periodo?.nombre || 'Sin Asignar',
        nombreCarrera: a.carrera?.nombre || 'Sin Asignar',
        nombreFacultad: a.carrera?.facultad?.nombre || 'Sin Asignar'
      };
    });
    return { data: planas, error: null };
  } catch (error) {
    console.error('Error obteniendo asignaturas:', error.message);
    return { data: null, error: error.message };
  }
};

export const contarActivos = async () => {
  try {
    const { count, error } = await supabase
      .from('asignatura')
      .select('*', { count: 'exact', head: true })
      .eq('estado', true);
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error contando asignaturas:', error.message);
    return 0;
  }
};

export const crear = async (data) => {
  try {
    const { data: result, error } = await supabase
      .from('asignatura')
      .insert([{
        nombre: data.nombre,
        anio_dictado: data.año || data.anio_dictado,
        id_periodo: Number(data.id_periodo),
        id_carrera: Number(data.id_carrera),
        estado: true
      }])
      .select();
    if (error) throw error;
    return { data: result ? result[0] : null, error: null };
  } catch (error) {
    console.error('Error creando asignatura:', error.message);
    return { data: null, error: error.message };
  }
};

export const actualizar = async (id, data) => {
  try {
    const { data: result, error } = await supabase
      .from('asignatura')
      .update({
        nombre: data.nombre,
        anio_dictado: data.año || data.anio_dictado,
        id_periodo: Number(data.id_periodo),
        id_carrera: Number(data.id_carrera)
      })
      .eq('id_asignatura', id)
      .select();
    if (error) throw error;
    return { data: result ? result[0] : null, error: null };
  } catch (error) {
    console.error('Error actualizando asignatura id=' + id + ':', error.message);
    return { data: null, error: error.message };
  }
};

export const cambiarEstado = async (id, estado) => {
  try {
    const { error } = await supabase
      .from('asignatura')
      .update({ estado })
      .eq('id_asignatura', id);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error cambiando estado asignatura id=' + id + ':', error.message);
    return { error: error.message };
  }
};

/**
 * verificarExistencia — C-02, paso 1.
 * Consulta si la asignatura con el ID dado existe en la base de datos.
 * Lanza error si no existe para detener el flujo antes de insertar la comisión.
 * @param {number} id_asignatura - ID de la asignatura a verificar
 */
export const verificarExistencia = async (id_asignatura) => {
  const { data, error } = await supabase
    .from('asignatura')
    .select('id_asignatura')
    .eq('id_asignatura', id_asignatura)
    .single();

  if (error || !data) throw new Error(`La asignatura con ID ${id_asignatura} no existe.`);
  return data;
};

/**
 * insertar — C-03, paso 5.
 * Upsert masivo de asignaturas desde un array de filas parseadas del CSV.
 * Resuelve id_carrera e id_periodo por nombre.
 * @param {Object[]} filas - Filas parseadas del CSV
 */
export const insertar = async (filas) => {
  // Deduplicar por nombre + carrera + periodo
  const vistas = new Set();
  const unicos = filas.filter((f) => {
    const key = [f.asignatura_nombre, f.carrera_nombre, f.periodo_nombre].join('||');
    if (vistas.has(key)) return false;
    vistas.add(key);
    return true;
  });

  const resultados = [];

  for (const f of unicos) {
    const { data: carrera } = await supabase
      .from('carrera').select('id_carrera').eq('nombre', f.carrera_nombre).single();
    if (!carrera) throw new Error(`No se encontró la carrera "${f.carrera_nombre}".`);

    const { data: periodo } = await supabase
      .from('periodo').select('id_periodo').eq('nombre', f.periodo_nombre).single();
    if (!periodo) throw new Error(`No se encontró el período "${f.periodo_nombre}".`);

    const { data, error } = await supabase
      .from('asignatura')
      .upsert({
        nombre:       f.asignatura_nombre,
        anio_dictado: f.asignatura_anio || '',
        id_carrera:   carrera.id_carrera,
        id_periodo:   periodo.id_periodo,
        estado:       true,
      }, { onConflict: 'nombre', ignoreDuplicates: false })
      .select();

    if (error) throw error;
    resultados.push(...(data || []));
  }

  return resultados;
};
