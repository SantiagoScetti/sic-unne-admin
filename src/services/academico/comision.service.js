import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const applyEstadoFilter = (query, filtroEstado) => {
  if (filtroEstado === 'Activos') return query.eq('estado', true);
  if (filtroEstado === 'Inactivos') return query.eq('estado', false);
  return query;
};

// =============================================================================
// :Comision — Objeto del dominio (C-02, C-03)
// Métodos trazables con los diagramas de secuencia C-02 y C-03.
// =============================================================================

export const obtenerListado = async (filtroEstado = 'Activos') => {
  try {
    const { data, error } = await applyEstadoFilter(
      supabase.from('comision').select(`
        *,
        asignatura (
          *,
          carrera (
            *,
            facultad (*)
          )
        ),
        comision_profesor (
          profesor (*)
        )
      `),
      filtroEstado
    );

    if (error) throw error;

    const planas = data.map(com => ({
      ...com,
      id_comision: com.id_comision,
      nombreComision: com.nombre,
      letraDesde: com.letra_desde,
      letraHasta: com.letra_hasta,
      nombreAsignatura: com.asignatura?.nombre || 'N/A',
      nombreFacultad: com.asignatura?.carrera?.facultad?.nombre || 'N/A',
      profesoresNombresArray: com.comision_profesor?.map(cp => `${cp.profesor?.nombre} ${cp.profesor?.apellido}`) || []
    }));

    return { data: planas, error: null };
  } catch (error) {
    console.error('Error obteniendo comisiones:', error.message);
    return { data: null, error: error.message };
  }
};

export const contarActivos = async () => {
  try {
    const { count, error } = await supabase
      .from('comision')
      .select('*', { count: 'exact', head: true })
      .eq('estado', true);
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error contando comisiones:', error.message);
    return 0;
  }
};

export const actualizar = async (id, comisionData) => {
  try {
    const row = {
      nombre: comisionData.nombre,
      letra_desde: comisionData.letraDesde || comisionData.letra_desde,
      letra_hasta: comisionData.letraHasta || comisionData.letra_hasta,
      id_asignatura: Number(comisionData.id_asignatura),
    };

    // 1. Actualizar datos base
    const { data, error } = await supabase
      .from('comision')
      .update(row)
      .eq('id_comision', id)
      .select();

    if (error) throw error;

    // 2. Eliminar relaciones viejas en N:M
    const { error: delError } = await supabase
      .from('comision_profesor')
      .delete()
      .eq('id_comision', id);

    if (delError) throw delError;

    // 3. Insertar nuevas relaciones
    if (comisionData.profesores_ids && comisionData.profesores_ids.length > 0) {
      const relaciones = comisionData.profesores_ids.map(id_profesor => ({
        id_comision: id,
        id_profesor,
      }));
      const { error: relError } = await supabase.from('comision_profesor').insert(relaciones);
      if (relError) throw relError;
    }

    return { data: data ? data[0] : null, error: null };
  } catch (error) {
    console.error('Error actualizando comisión:', error.message);
    return { data: null, error: error.message };
  }
};

export const cambiarEstado = async (id, estado) => {
  try {
    const { error } = await supabase
      .from('comision')
      .update({ estado })
      .eq('id_comision', id);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error cambiando estado comisión id=' + id + ':', error.message);
    return { error: error.message };
  }
};

/**
 * crear — C-02, paso 2.
 * Inserta una nueva comisión en la tabla comision.
 * Precondición: la asignatura ya fue verificada (ver asignatura.service.js).
 * Mensaje de éxito/error: "Comisión creada con éxito" / "Error en crear comisión"
 * @param {string} nombre        - Nombre de la comisión
 * @param {string} letraDesde    - Letra inicial del rango de alumnos
 * @param {string} letraHasta    - Letra final del rango de alumnos
 * @param {number} id_asignatura - ID de la asignatura a la que pertenece
 */
export const crear = async (nombre, letraDesde, letraHasta, id_asignatura) => {
  const { data, error } = await supabase
    .from('comision')
    .insert([{
      nombre,
      letra_desde:   letraDesde,
      letra_hasta:   letraHasta,
      id_asignatura: Number(id_asignatura),
    }])
    .select();

  if (error) {
    console.error('Error creando comisión:', error);
    throw new Error(error.message);
  }
  return data[0];
};

/**
 * insertar — C-03, paso 7.
 * Upsert masivo de comisiones desde un array de filas parseadas del CSV.
 * Resuelve id_asignatura por nombre y vincula profesores por documento.
 * @param {Object[]} filas - Filas parseadas del CSV
 */
export const insertar = async (filas) => {
  const resultados = [];

  for (const f of filas) {
    // Resolver asignatura por nombre
    const { data: asignatura } = await supabase
      .from('asignatura').select('id_asignatura').eq('nombre', f.asignatura_nombre).single();
    if (!asignatura) throw new Error(`No se encontró la asignatura "${f.asignatura_nombre}".`);

    // Insertar comisión si no existe ya
    let { data: comisiones, error: errCom } = await supabase
      .from('comision')
      .select('id_comision')
      .eq('nombre', f.comision_nombre)
      .eq('id_asignatura', asignatura.id_asignatura);
    if (errCom) throw errCom;

    let id_comision;
    if (!comisiones || comisiones.length === 0) {
      const { data: nueva, error: errIns } = await supabase
        .from('comision')
        .insert({
          nombre:        f.comision_nombre,
          letra_desde:   f.comision_letra_desde,
          letra_hasta:   f.comision_letra_hasta,
          id_asignatura: asignatura.id_asignatura,
          estado:        true,
        })
        .select();
      if (errIns) throw errIns;
      id_comision = nueva[0].id_comision;
      resultados.push(nueva[0]);
    } else {
      id_comision = comisiones[0].id_comision;
    }

    // Vincular profesor por documento
    const { data: profesor } = await supabase
      .from('profesor').select('id_profesor').eq('documento', Number(f.profesor_documento)).single();
    if (!profesor) throw new Error(`No se encontró el profesor con documento ${f.profesor_documento}.`);

    // Insertar relación (ignorar si ya existe)
    await supabase
      .from('comision_profesor')
      .upsert(
        { id_comision, id_profesor: profesor.id_profesor },
        { onConflict: 'id_comision,id_profesor', ignoreDuplicates: true }
      );
  }

  return resultados;
};
