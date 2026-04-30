import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// =============================================================================
// :Facultad — Objeto del dominio (C-03)
// Métodos trazables con el diagrama de secuencia C-03.
// =============================================================================

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
