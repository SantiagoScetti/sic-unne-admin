import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// =============================================================================
// :Notificacion — Objeto del dominio (C-01)
// Métodos trazables con el diagrama de secuencia C-01.
// =============================================================================

/**
 * notificar — C-01, comunicación a los usuarios involucrados.
 * Inserta notificaciones para el emisor y el receptor del reporte.
 * @param {number} emisor_id   - ID del usuario que hizo el reporte
 * @param {number} receptor_id - ID del usuario reportado
 */
export const notificar = async (emisor_id, receptor_id) => {
  const fecha = new Date().toISOString();

  const notificaciones = [
    {
      id_usuario: emisor_id,
      tipo:       'resolucion_reporte',
      mensaje:    'El reporte que realizaste ha sido revisado y resuelto por el administrador.',
      leido:      false,
      fecha,
    },
    {
      id_usuario: receptor_id,
      tipo:       'resolucion_reporte',
      mensaje:    'Se ha tomado una decisión respecto a un reporte en tu contra. Revisá tu situación en la plataforma.',
      leido:      false,
      fecha,
    },
  ];

  const { data, error } = await supabase
    .from('notificacion')
    .insert(notificaciones)
    .select();

  if (error) {
    console.error('Error enviando notificaciones:', error);
    throw new Error(error.message);
  }
  return data;
};
