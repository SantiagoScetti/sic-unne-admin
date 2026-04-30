import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// =============================================================================
// :Edificio — Objeto del dominio (C-03)
// Métodos trazables con el diagrama de secuencia C-03.
// =============================================================================

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
