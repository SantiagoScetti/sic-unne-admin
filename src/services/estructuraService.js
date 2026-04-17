import { supabase } from './supabaseClient';

export const fetchPeriodos = async () => {
  try {
    const { data, error } = await supabase.from('periodo').select('*');
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching periodos:', error.message);
    return { data: null, error: error.message };
  }
};

export const fetchEdificios = async () => {
  try {
    const { data, error } = await supabase.from('edificio').select('*');
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching edificios:', error.message);
    return { data: null, error: error.message };
  }
};

export const fetchFacultades = async () => {
  try {
    const { data, error } = await supabase
      .from('facultad')
      .select('*, edificio(nombre)');
    if (error) throw error;
    
    // Aplanar respuesta
    const planas = data.map(f => ({
      ...f,
      nombreEdificio: f.edificio?.nombre || 'Sin Asignar'
    }));
    return { data: planas, error: null };
  } catch (error) {
    console.error('Error fetching facultades:', error.message);
    return { data: null, error: error.message };
  }
};

export const fetchCarreras = async () => {
  try {
    const { data, error } = await supabase
      .from('carrera')
      .select('*, facultad(nombre)');
    if (error) throw error;
    
    // Aplanar respuesta
    const planas = data.map(c => ({
      ...c,
      nombreFacultad: c.facultad?.nombre || 'Sin Asignar'
    }));
    return { data: planas, error: null };
  } catch (error) {
    console.error('Error fetching carreras:', error.message);
    return { data: null, error: error.message };
  }
};

export const fetchAsignaturas = async () => {
  try {
    const { data, error } = await supabase
      .from('asignatura')
      .select('*, periodo(nombre), carrera(nombre, facultad(nombre))');
    if (error) throw error;
    
    // Aplanar respuesta
    const planas = data.map(a => ({
      ...a,
      nombrePeriodo: a.periodo?.nombre || 'Sin Asignar',
      nombreCarrera: a.carrera?.nombre || 'Sin Asignar',
      nombreFacultad: a.carrera?.facultad?.nombre || 'Sin Asignar'
    }));
    return { data: planas, error: null };
  } catch (error) {
    console.error('Error fetching asignaturas:', error.message);
    return { data: null, error: error.message };
  }
};

export const fetchProfesores = async () => {
  try {
    const { data, error } = await supabase.from('profesor').select('*');
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching profesores:', error.message);
    return { data: null, error: error.message };
  }
};

export const fetchComisiones = async () => {
  try {
    const { data, error } = await supabase
      .from('comision')
      .select(`
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
      `);
      
    if (error) throw error;

    // Aplanamos la respuesta para que la UI no maneje anidamiento profundo
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
        .select('*', { count: 'exact', head: true });
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

export const crearComision = async (comisionData) => {
  try {
    const { data, error } = await supabase
      .from('comision')
      .insert([comisionData])
      .select();

    if (error) throw error;
    return { data: data ? data[0] : null, error: null };
  } catch (error) {
    console.error('Error creando comisión:', error.message);
    return { data: null, error: error.message };
  }
};

export const actualizarComision = async (id, comisionData) => {
  try {
    const idColumn = 'id_comision'; 
    const { data, error } = await supabase
      .from('comision')
      .update(comisionData)
      .eq(idColumn, id)
      .select();

    if (error) throw error;
    return { data: data ? data[0] : null, error: null };
  } catch (error) {
    console.error('Error actualizando comisión:', error.message);
    return { data: null, error: error.message };
  }
};
