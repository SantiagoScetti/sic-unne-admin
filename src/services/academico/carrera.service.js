import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const applyEstadoFilter = (query, filtroEstado) => {
  if (filtroEstado === 'Activos') return query.eq('estado', true);
  if (filtroEstado === 'Inactivos') return query.eq('estado', false);
  return query;
};

// =============================================================================
// :Carrera — Objeto del dominio (C-03)
// =============================================================================

export const obtenerCarreras = async (filtroEstado = 'Activos') => {
  try {
    const { data, error } = await applyEstadoFilter(
      supabase.from('carrera').select('*, facultad(nombre), asignatura(count)'),
      filtroEstado
    );
    if (error) throw error;
    const planas = data.map(c => ({
      ...c,
      nombreFacultad: c.facultad?.nombre || 'Sin Asignar',
      totalAsignaturas: c.asignatura?.[0]?.count ?? 0,
    }));
    return { data: planas, error: null };
  } catch (error) {
    console.error('Error obteniendo carreras:', error.message);
    return { data: null, error: error.message };
  }
};

export const contarActivos = async () => {
  try {
    const { count, error } = await supabase
      .from('carrera')
      .select('*', { count: 'exact', head: true })
      .eq('estado', true);
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error contando carreras:', error.message);
    return 0;
  }
};

export const crear = async (data) => {
  try {
    const { data: result, error } = await supabase
      .from('carrera')
      .insert([{ nombre: data.nombre, id_facultad: Number(data.id_facultad), estado: true }])
      .select();
    if (error) throw error;
    return { data: result ? result[0] : null, error: null };
  } catch (error) {
    console.error('Error creando carrera:', error.message);
    return { data: null, error: error.message };
  }
};

export const actualizar = async (id, data) => {
  try {
    const { data: result, error } = await supabase
      .from('carrera')
      .update({ nombre: data.nombre, id_facultad: Number(data.id_facultad) })
      .eq('id_carrera', id)
      .select();
    if (error) throw error;
    return { data: result ? result[0] : null, error: null };
  } catch (error) {
    console.error('Error actualizando carrera id=' + id + ':', error.message);
    return { data: null, error: error.message };
  }
};

export const cambiarEstado = async (id, estado) => {
  try {
    const { error } = await supabase
      .from('carrera')
      .update({ estado })
      .eq('id_carrera', id);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error cambiando estado carrera id=' + id + ':', error.message);
    return { error: error.message };
  }
};

/**
 * insertar — C-03, paso 3.
 * Upsert masivo de carreras. Resuelve id_facultad por nombre.
 */
export const insertar = async (filas) => {
  const vistas = new Set();
  const unicos = filas.filter((f) => {
    const key = [f.carrera_nombre, f.facultad_nombre].join('||');
    if (vistas.has(key)) return false;
    vistas.add(key);
    return true;
  });

  const resultados = [];
  for (const f of unicos) {
    const { data: facultad } = await supabase
      .from('facultad').select('id_facultad').eq('nombre', f.facultad_nombre).single();
    if (!facultad) throw new Error(`No se encontró la facultad "${f.facultad_nombre}".`);

    const { data, error } = await supabase
      .from('carrera')
      .upsert({ nombre: f.carrera_nombre, id_facultad: facultad.id_facultad, estado: true },
        { onConflict: 'nombre', ignoreDuplicates: false })
      .select();
    if (error) throw error;
    resultados.push(...(data || []));
  }
  return resultados;
};
