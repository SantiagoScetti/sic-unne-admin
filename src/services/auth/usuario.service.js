import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// =============================================================================
// :Usuario — Objeto del dominio (C-01)
// Métodos trazables con el diagrama de secuencia C-01.
// =============================================================================

/**
 * actualizarFechaSuspension — C-01, acción sobre el receptor.
 * Registra la suspensión del usuario reportado insertando una notificación de tipo 'suspension'.
 * @param {number} receptor_id - ID del usuario a suspender
 * @param {number} duracion    - duración en días de la suspensión
 */
export const actualizarFechaSuspension = async (receptor_id, duracion) => {
  const fechaSuspension = new Date();
  fechaSuspension.setDate(fechaSuspension.getDate() + (duracion || 7));

  const { data, error } = await supabase
    .from('notificacion')
    .insert({
      id_usuario: receptor_id,
      tipo:       'suspension',
      mensaje:    `Tu cuenta ha sido suspendida por ${duracion || 7} días hasta el ${fechaSuspension.toLocaleDateString('es-AR')}.`,
      leido:      false,
      fecha:      new Date().toISOString(),
    })
    .select();

  if (error) {
    console.error('Error actualizando fecha de suspensión:', error);
    throw new Error(error.message);
  }
  return data?.[0] || null;
};
