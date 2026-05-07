import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// =============================================================================
// :Reporte — Objeto del dominio (C-01)
// Métodos trazables con el diagrama de secuencia C-01.
// =============================================================================

/**
 * obtenerReportes — C-01, paso 1.
 * Devuelve todos los reportes con datos de emisor y receptor.
 */
export const obtenerReportes = async () => {
  const { data, error } = await supabase
    .from('reporte')
    .select(`
      id_reporte,
      motivo,
      estado,
      fecha_alta,
      resolucion_admin,
      accion_tomada,
      admin_id,
      emisor_id,
      receptor_id,
      emisor:usuario!emisor_id (
        id_usuario,
        nombre,
        apellido
      ),
      receptor:usuario!receptor_id (
        id_usuario,
        nombre,
        apellido
      )
    `)
    .order('fecha_alta', { ascending: false });

  if (error) {
    console.error('Error fetching reportes:', error);
    throw new Error(error.message);
  }
  return data;
};

/**
 * obtenerReportesFiltrados — C-01, variante de listado.
 * Devuelve reportes filtrando por estado ('Pendiente', 'Resuelto', 'Desestimado', 'En Revision').
 * Si estado es 'Todos' o undefined, devuelve todos los reportes.
 */
export const obtenerReportesFiltrados = async (estado) => {
  let query = supabase
    .from('reporte')
    .select(`
      id_reporte,
      motivo,
      estado,
      fecha_alta,
      resolucion_admin,
      accion_tomada,
      emisor:usuario!emisor_id (id_usuario, nombre, apellido),
      receptor:usuario!receptor_id (id_usuario, nombre, apellido)
    `)
    .order('fecha_alta', { ascending: false });

  if (estado && estado !== 'Todos') {
    query = query.eq('estado', estado);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching reportes filtrados:', error);
    throw new Error(error.message);
  }
  return data;
};

/**
 * obtenerDetalleReporte — C-01, paso de detalle.
 * Devuelve un único reporte por ID con todos sus datos relacionados.
 */
export const obtenerDetalleReporte = async (id_reporte) => {
  const { data, error } = await supabase
    .from('reporte')
    .select(`
      id_reporte,
      motivo,
      estado,
      fecha_alta,
      resolucion_admin,
      accion_tomada,
      admin_id,
      emisor_id,
      receptor_id,
      emisor:usuario!emisor_id (id_usuario, nombre, apellido),
      receptor:usuario!receptor_id (id_usuario, nombre, apellido),
      periodo:periodo!id_periodo (nombre)
    `)
    .eq('id_reporte', id_reporte)
    .single();

  if (error) {
    console.error('Error fetching detalle reporte:', error);
    throw new Error(error.message);
  }
  return data;
};

/**
 * actualizarEstado — C-01, paso de resolución.
 * Actualiza el estado y la resolución del administrador en el reporte.
 * Mensaje de éxito: "Reporte actualizado"
 */
export const actualizarEstado = async (id_reporte, estado, resolucion) => {
  const { data, error } = await supabase
    .from('reporte')
    .update({
      estado,
      resolucion_admin: resolucion,
    })
    .eq('id_reporte', id_reporte)
    .select();

  if (error) {
    console.error('Error actualizando estado reporte:', error);
    throw new Error(error.message);
  }
  return data?.[0] || null;
};
