import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/** Aplica el filtro de estado a una query de Supabase */
const applyEstadoFilter = (query, filtroEstado) => {
  if (filtroEstado === 'Activos')   return query.eq('estado', true);
  if (filtroEstado === 'Inactivos') return query.eq('estado', false);
  return query; // 'Todos': sin filtro
};

export const fetchPeriodos = async (filtroEstado = 'Activos') => {
  try {
    const { data, error } = await applyEstadoFilter(supabase.from('periodo').select('*'), filtroEstado);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching periodos:', error.message);
    return { data: null, error: error.message };
  }
};

export const fetchEdificios = async (filtroEstado = 'Activos') => {
  try {
    const { data, error } = await applyEstadoFilter(supabase.from('edificio').select('*'), filtroEstado);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching edificios:', error.message);
    return { data: null, error: error.message };
  }
};

export const fetchFacultades = async (filtroEstado = 'Activos') => {
  try {
    const { data, error } = await applyEstadoFilter(
      supabase.from('facultad').select('*, edificio(nombre)'),
      filtroEstado
    );
    if (error) throw error;
    const planas = data.map(f => ({ ...f, nombreEdificio: f.edificio?.nombre || 'Sin Asignar' }));
    return { data: planas, error: null };
  } catch (error) {
    console.error('Error fetching facultades:', error.message);
    return { data: null, error: error.message };
  }
};

export const fetchCarreras = async (filtroEstado = 'Activos') => {
  try {
    const { data, error } = await applyEstadoFilter(
      supabase.from('carrera').select('*, facultad(nombre)'),
      filtroEstado
    );
    if (error) throw error;
    const planas = data.map(c => ({ ...c, nombreFacultad: c.facultad?.nombre || 'Sin Asignar' }));
    return { data: planas, error: null };
  } catch (error) {
    console.error('Error fetching carreras:', error.message);
    return { data: null, error: error.message };
  }
};

export const fetchAsignaturas = async (filtroEstado = 'Activos') => {
  try {
    const { data, error } = await applyEstadoFilter(
      supabase.from('asignatura').select('*, periodo(nombre), carrera(nombre, facultad(nombre)), asignatura_profesor(profesor(nombre, apellido))'),
      filtroEstado
    );
    if (error) throw error;
    const planas = data.map(a => {
      const profs = a.asignatura_profesor?.map(ap => `${ap.profesor?.apellido}, ${ap.profesor?.nombre}`).join(' | ') || 'Sin Asignar';
      return {
        ...a,
        nombrePeriodo:  a.periodo?.nombre || 'Sin Asignar',
        nombreCarrera:  a.carrera?.nombre || 'Sin Asignar',
        nombreFacultad: a.carrera?.facultad?.nombre || 'Sin Asignar',
        nombreProfesor: profs
      };
    });
    return { data: planas, error: null };
  } catch (error) {
    console.error('Error fetching asignaturas:', error.message);
    return { data: null, error: error.message };
  }
};

export const fetchProfesores = async (filtroEstado = 'Activos') => {
  try {
    const { data, error } = await applyEstadoFilter(
      supabase.from('profesor').select('*, comision_profesor(count), asignatura_profesor(count)'), 
      filtroEstado
    );
    if (error) throw error;
    
    // Sumar ambos counts para la UI
    const planas = data.map(p => {
      const countComisiones = p.comision_profesor?.[0]?.count || 0;
      const countAsignaturas = p.asignatura_profesor?.[0]?.count || 0;
      const totalAsignaciones = countComisiones + countAsignaturas;
      
      return {
        ...p,
        totalAsignaciones
      };
    });
    
    return { data: planas, error: null };
  } catch (error) {
    console.error('Error fetching profesores:', error.message);
    return { data: null, error: error.message };
  }
};

export const fetchComisiones = async (filtroEstado = 'Activos') => {
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
    console.error('Error fetching comisiones:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Realiza conteos paralelos sobre todas las tablas de Estructura Académica para las StatCards
 */
export const fetchEstadisticas = async () => {
  try {
    const getCount = async (table) => {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('estado', true);
      if (error) throw error;
      return count || 0;
    };

    const [periodos, edificios, facultades, carreras, asignaturas, profesores, comisiones] = await Promise.all([
      getCount('periodo'),
      getCount('edificio'),
      getCount('facultad'),
      getCount('carrera'),
      getCount('asignatura'),
      getCount('profesor'),
      getCount('comision')
    ]);

    return {
      data: {
        Periodos: periodos,
        Edificios: edificios,
        Facultades: facultades,
        Carreras: carreras,
        Asignaturas: asignaturas,
        Profesores: profesores,
        Comisiones: comisiones
      },
      error: null
    };
  } catch (error) {
    console.error('Error fetching estadísticas:', error.message);
    return { data: null, error: error.message };
  }
};

// ─── FUNCIONES DE INSERCIÓN ───────────────────────────────────────────────────

/**
 * Inserta un nuevo Periodo.
 * Payload esperado: { nombre, fecha_inicio, fecha_fin }
 */
export const crearPeriodo = async (data) => {
  try {
    const { data: result, error } = await supabase
      .from('periodo')
      .insert([{ nombre: data.nombre, fecha_inicio: data.fecha_inicio, fecha_fin: data.fecha_fin }])
      .select();
    if (error) throw error;
    return { data: result ? result[0] : null, error: null };
  } catch (error) {
    console.error('Error creando periodo:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Inserta un nuevo Edificio.
 * Payload esperado: { nombre, direccion }
 */
export const crearEdificio = async (data) => {
  try {
    const { data: result, error } = await supabase
      .from('edificio')
      .insert([{ nombre: data.nombre, direccion: data.direccion }])
      .select();
    if (error) throw error;
    return { data: result ? result[0] : null, error: null };
  } catch (error) {
    console.error('Error creando edificio:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Inserta una nueva Facultad.
 * Payload esperado: { nombre, ciudad, id_edificio }
 */
export const crearFacultad = async (data) => {
  try {
    const { data: result, error } = await supabase
      .from('facultad')
      .insert([{ nombre: data.nombre, ciudad: data.ciudad, id_edificio: Number(data.id_edificio) }])
      .select();
    if (error) throw error;
    return { data: result ? result[0] : null, error: null };
  } catch (error) {
    console.error('Error creando facultad:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Inserta una nueva Carrera.
 * Payload esperado: { nombre, id_facultad }
 */
export const crearCarrera = async (data) => {
  try {
    const { data: result, error } = await supabase
      .from('carrera')
      .insert([{ nombre: data.nombre, id_facultad: Number(data.id_facultad) }])
      .select();
    if (error) throw error;
    return { data: result ? result[0] : null, error: null };
  } catch (error) {
    console.error('Error creando carrera:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Inserta una nueva Asignatura y sus relaciones con Profesores (asignatura_profesor).
 * Payload esperado: { nombre, año, id_periodo (integer), id_carrera, profesores_ids[] }
 */
export const crearAsignatura = async (data) => {
  try {
    const { data: result, error } = await supabase
      .from('asignatura')
      .insert([{
        nombre: data.nombre,
        anio_dictado: data.año || data.anio_dictado,
        id_periodo: Number(data.id_periodo),
        id_carrera: Number(data.id_carrera),
      }])
      .select();
    if (error) throw error;

    const nuevaAsignatura = result[0];

    // Insertar relaciones N:M con profesores
    if (data.profesores_ids && data.profesores_ids.length > 0) {
      const relaciones = data.profesores_ids.map(id_profesor => ({
        id_asignatura: nuevaAsignatura.id_asignatura,
        id_profesor,
      }));
      const { error: relError } = await supabase.from('asignatura_profesor').insert(relaciones);
      if (relError) throw relError;
    }

    return { data: nuevaAsignatura, error: null };
  } catch (error) {
    console.error('Error creando asignatura:', error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Inserta un nuevo Profesor.
 * Payload esperado: { nombre, apellido, documento, correo, telefono }
 * NOTA: 'telefono' no existe en el schema actual; se omite silenciosamente.
 */
export const crearProfesor = async (data) => {
  try {
    const { data: result, error } = await supabase
      .from('profesor')
      .insert([{
        nombre: data.nombre,
        apellido: data.apellido,
        documento: Number(data.documento),
        correo: data.correo,
        estado: true, // Activo por defecto al crear
      }])
      .select();
    if (error) throw error;
    return { data: result ? result[0] : null, error: null };
  } catch (error) {
    console.error('Error creando profesor:', error.message);
    return { data: null, error: error.message };
  }
};

export const crearComision = async (comisionData) => {
  try {
    // Mapear payload del modal a columnas reales del schema
    const row = {
      nombre: comisionData.nombre,
      letra_desde: comisionData.letraDesde || comisionData.letra_desde,
      letra_hasta: comisionData.letraHasta || comisionData.letra_hasta,
      id_asignatura: Number(comisionData.id_asignatura),
    };

    const { data, error } = await supabase
      .from('comision')
      .insert([row])
      .select();

    if (error) throw error;
    const nuevaComision = data[0];

    // Insertar relaciones N:M con profesores
    if (comisionData.profesores_ids && comisionData.profesores_ids.length > 0) {
      const relaciones = comisionData.profesores_ids.map(id_profesor => ({
        id_comision: nuevaComision.id_comision,
        id_profesor,
      }));
      const { error: relError } = await supabase.from('comision_profesor').insert(relaciones);
      if (relError) throw relError;
    }

    return { data: nuevaComision, error: null };
  } catch (error) {
    console.error('Error creando comisión:', error.message);
    return { data: null, error: error.message };
  }
};

export const actualizarComision = async (id, comisionData) => {
  try {
    const row = {
      nombre:      comisionData.nombre,
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

// ─── FUNCIONES DE ACTUALIZACIÓN (UPDATE) ────────────────────────────────────

/** Helper interno: actualiza campos en cualquier tabla */
const softUpdate = async (table, pkColumn, id, fields) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .update(fields)
      .eq(pkColumn, id)
      .select();
    if (error) throw error;
    return { data: data ? data[0] : null, error: null };
  } catch (error) {
    console.error(`Error actualizando ${table} id=${id}:`, error.message);
    return { data: null, error: error.message };
  }
};

/** Actualiza un Periodo. Payload: { nombre, fecha_inicio, fecha_fin } */
export const actualizarPeriodo = (id, data) =>
  softUpdate('periodo', 'id_periodo', id, {
    nombre:       data.nombre,
    fecha_inicio: data.fecha_inicio,
    fecha_fin:    data.fecha_fin,
  });

/** Actualiza un Edificio. Payload: { nombre, direccion } */
export const actualizarEdificio = (id, data) =>
  softUpdate('edificio', 'id_edificio', id, {
    nombre:    data.nombre,
    direccion: data.direccion,
  });

/** Actualiza una Facultad. Payload: { nombre, ciudad, id_edificio } */
export const actualizarFacultad = (id, data) =>
  softUpdate('facultad', 'id_facultad', id, {
    nombre:      data.nombre,
    ciudad:      data.ciudad,
    id_edificio: Number(data.id_edificio),
  });

/** Actualiza una Carrera. Payload: { nombre, id_facultad } */
export const actualizarCarrera = (id, data) =>
  softUpdate('carrera', 'id_carrera', id, {
    nombre:      data.nombre,
    id_facultad: Number(data.id_facultad),
  });

/** Actualiza una Asignatura y recarga sus relaciones N:M. Payload: { nombre, año, id_periodo, id_carrera, profesores_ids[] } */
export const actualizarAsignatura = async (id, data) => {
  try {
    const row = {
      nombre:       data.nombre,
      anio_dictado: data.año || data.anio_dictado,
      id_periodo:   Number(data.id_periodo),
      id_carrera:   Number(data.id_carrera),
    };

    const { data: result, error } = await supabase
      .from('asignatura')
      .update(row)
      .eq('id_asignatura', id)
      .select();

    if (error) throw error;

    // 2. Eliminar relaciones viejas en asignatura_profesor
    const { error: delError } = await supabase
      .from('asignatura_profesor')
      .delete()
      .eq('id_asignatura', id);
    
    if (delError) throw delError;

    // 3. Insertar la nueva lista de profesores (usamos array para asegurar flexibilidad a futuro si lo desean, aunque limiten desde el front)
    if (data.profesores_ids && data.profesores_ids.length > 0) {
      const relaciones = data.profesores_ids.map(id_profesor => ({
        id_asignatura: id,
        id_profesor,
      }));
      const { error: relError } = await supabase.from('asignatura_profesor').insert(relaciones);
      if (relError) throw relError;
    }

    return { data: result ? result[0] : null, error: null };
  } catch (error) {
    console.error('Error actualizando asignatura:', error.message);
    return { data: null, error: error.message };
  }
};

/** Actualiza un Profesor. Payload: { nombre, apellido, documento, correo } */
export const actualizarProfesor = (id, data) =>
  softUpdate('profesor', 'id_profesor', id, {
    nombre:    data.nombre,
    apellido:  data.apellido,
    documento: Number(data.documento),
    correo:    data.correo,
  });


// ─── FUNCIONES DE BORRADO LÓGICO (SOFT DELETE) ───────────────────────────────

const softDelete = async (table, pkColumn, id) => {
  try {
    const { error } = await supabase
      .from(table)
      .update({ estado: false })
      .eq(pkColumn, id);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Error desactivando ${table} id=${id}:`, error.message);
    return { error: error.message };
  }
};

export const desactivarPeriodo    = (id) => softDelete('periodo',    'id_periodo',    id);
export const desactivarEdificio   = (id) => softDelete('edificio',   'id_edificio',   id);
export const desactivarFacultad   = (id) => softDelete('facultad',   'id_facultad',   id);
export const desactivarCarrera    = (id) => softDelete('carrera',    'id_carrera',    id);
export const desactivarAsignatura = (id) => softDelete('asignatura', 'id_asignatura', id);
export const desactivarProfesor   = (id) => softDelete('profesor',   'id_profesor',   id);
export const desactivarComision   = (id) => softDelete('comision',   'id_comision',   id);

// ─── FUNCIONES DE RESTAURACIÓN (SOFT RESTORE) ────────────────────────────────

export const restaurarPeriodo    = (id) => softUpdate('periodo',    'id_periodo',    id, { estado: true });
export const restaurarEdificio   = (id) => softUpdate('edificio',   'id_edificio',   id, { estado: true });
export const restaurarFacultad   = (id) => softUpdate('facultad',   'id_facultad',   id, { estado: true });
export const restaurarCarrera    = (id) => softUpdate('carrera',    'id_carrera',    id, { estado: true });
export const restaurarAsignatura = (id) => softUpdate('asignatura', 'id_asignatura', id, { estado: true });
export const restaurarProfesor   = (id) => softUpdate('profesor',   'id_profesor',   id, { estado: true });
export const restaurarComision   = (id) => softUpdate('comision',   'id_comision',   id, { estado: true });

// ─── FUNCIONES RPC (OPERACIONES MASIVAS) ──────────────────────────────────────

/**
 * Llama a la función RPC `importar_estructura_academica` en Supabase.
 * @param {Object[]} payload - Array de filas mapeadas desde el CSV.
 * @returns {{ data: string|null, error: string|null }}
 */
export const importarEstructuraCSV = async (payload) => {
  try {
    const { data, error } = await supabase.rpc('importar_estructura_academica', { payload });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error en importación masiva:', error.message);
    return { data: null, error: error.message };
  }
};
