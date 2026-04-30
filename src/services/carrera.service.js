import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// =============================================================================
// :Carrera — Objeto del dominio (C-03)
// =============================================================================

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
