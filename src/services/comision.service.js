import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// =============================================================================
// :Comision — Objeto del dominio (C-02, C-03)
// Métodos trazables con los diagramas de secuencia C-02 y C-03.
// =============================================================================

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
