import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const applyEstadoFilter = (query, filtroEstado) => {
  if (filtroEstado === 'Activos') return query.eq('estado', true);
  if (filtroEstado === 'Inactivos') return query.eq('estado', false);
  return query;
};

// =============================================================================
// :Facultad — Objeto del dominio (C-03)
// Métodos trazables con el diagrama de secuencia C-03.
// =============================================================================

export const obtenerFacultades = async (filtroEstado = 'Activos') => {
  try {
    const { data, error } = await applyEstadoFilter(
      supabase.from('facultad').select('*, edificio(nombre)'),
      filtroEstado
    );
    if (error) throw error;
    const planas = data.map(f => ({ ...f, nombreEdificio: f.edificio?.nombre || 'Sin Asignar' }));
    return { data: planas, error: null };
  } catch (error) {
    console.error('Error obteniendo facultades:', error.message);
    return { data: null, error: error.message };
  }
};

export const contarActivos = async () => {
  try {
    const { count, error } = await supabase
      .from('facultad')
      .select('*', { count: 'exact', head: true })
      .eq('estado', true);
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error contando facultades:', error.message);
    return 0;
  }
};

export const crear = async (data) => {
  try {
    const { data: result, error } = await supabase
      .from('facultad')
      .insert([{ nombre: data.nombre, ciudad: data.ciudad, id_edificio: Number(data.id_edificio), estado: true }])
      .select();
    if (error) throw error;
    return { data: result ? result[0] : null, error: null };
  } catch (error) {
    console.error('Error creando facultad:', error.message);
    return { data: null, error: error.message };
  }
};

export const actualizar = async (id, data) => {
  try {
    const { data: result, error } = await supabase
      .from('facultad')
      .update({ nombre: data.nombre, ciudad: data.ciudad, id_edificio: Number(data.id_edificio) })
      .eq('id_facultad', id)
      .select();
    if (error) throw error;
    return { data: result ? result[0] : null, error: null };
  } catch (error) {
    console.error('Error actualizando facultad id=' + id + ':', error.message);
    return { data: null, error: error.message };
  }
};

export const cambiarEstado = async (id, estado) => {
  try {
    const { error } = await supabase
      .from('facultad')
      .update({ estado })
      .eq('id_facultad', id);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error cambiando estado facultad id=' + id + ':', error.message);
    return { error: error.message };
  }
};

/**
 * insertar — C-03, paso 2.
 * Upsert masivo de facultades desde un array de filas parseadas del CSV.
 * Resuelve id_edificio por nombre. Requiere que los edificios ya existan.
 * @param {Object[]} filas - Filas parseadas del CSV
 */
export const insertar = async (filas) => {
  // Deduplicar por nombre de facultad
  const vistas = new Set();
  const unicos = filas.filter((f) => {
    if (vistas.has(f.facultad_nombre)) return false;
    vistas.add(f.facultad_nombre);
    return true;
  });

  const resultados = [];

  for (const f of unicos) {
    // Resolver id_edificio por nombre
    const { data: edificio } = await supabase
      .from('edificio').select('id_edificio').eq('nombre', f.edificio_nombre).single();
    if (!edificio) throw new Error(`No se encontró el edificio "${f.edificio_nombre}".`);

    const { data, error } = await supabase
      .from('facultad')
      .upsert({
        nombre:      f.facultad_nombre,
        ciudad:      f.facultad_ciudad || 'Sin especificar',
        id_edificio: edificio.id_edificio,
        estado:      true,
      }, { onConflict: 'nombre', ignoreDuplicates: false })
      .select();

    if (error) throw error;
    resultados.push(...(data || []));
  }

  return resultados;
};
