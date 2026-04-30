import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// =============================================================================
// :Periodo — Objeto del dominio (C-03)
// =============================================================================

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
