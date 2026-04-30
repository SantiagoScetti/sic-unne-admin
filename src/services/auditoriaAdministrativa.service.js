import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// =============================================================================
// :AuditoriaAdministrativa — Objeto del dominio (C-01)
// Métodos trazables con el diagrama de secuencia C-01.
// =============================================================================

/**
 * registrar — C-01, trazabilidad administrativa.
 * Inserta un registro en auditoria_administrativa con la acción tomada por el admin.
 * @param {number} id_reporte - ID del reporte gestionado
 * @param {string} accion     - Descripción de la acción tomada
 * @param {number} admin_id   - ID del usuario administrador
 */
export const registrar = async (id_reporte, accion, admin_id) => {
  const { data, error } = await supabase
    .from('auditoria_administrativa')
    .insert({
      id_admin:            admin_id,
      id_usuario_afectado: null,
      accion,
      detalles: { id_reporte },
      fecha:    new Date().toISOString(),
    })
    .select();

  if (error) {
    console.error('Error registrando auditoría:', error);
    throw new Error(error.message);
  }
  return data?.[0] || null;
};
