import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// =============================================================================
// C-01: GESTIÓN DE REPORTES Y RESOLUCIÓN DE CONFLICTOS
// Todos los métodos están nombrados igual que en el diagrama de secuencia.
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

// Alias de compatibilidad con el nombre anterior (no borrar — ReportesPage lo usa)
export const getReportes = obtenerReportes;

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

  // Aplicar filtro solo si se especificó un estado válido
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
 * actualizarEstadoReporte — C-01, paso de resolución.
 * Actualiza el estado, la resolución y la acción del administrador en el reporte.
 * Mensaje de éxito: "Reporte actualizado"
 */
export const actualizarEstadoReporte = async (id_reporte, estado, resolucion) => {
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

/**
 * suspenderUsuario — C-01, acción sobre el receptor.
 * Registra la suspensión del usuario reportado (campo suspendido_hasta en usuario).
 * Nota: si la tabla usuario no tiene el campo, esta función inserta en notificacion como registro.
 * @param {number} receptor_id - ID del usuario a suspender
 * @param {number} duracion - duración en días de la suspensión
 */
export const suspenderUsuario = async (receptor_id, duracion) => {
  // Calcular la fecha de fin de suspensión
  const fechaSuspension = new Date();
  fechaSuspension.setDate(fechaSuspension.getDate() + (duracion || 7));

  // Registrar la suspensión como notificación al usuario afectado
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
    console.error('Error suspendiendo usuario:', error);
    throw new Error(error.message);
  }
  return data?.[0] || null;
};

/**
 * registrarAuditoria — C-01, trazabilidad administrativa.
 * Inserta un registro en auditoria_administrativa con la acción tomada por el admin.
 * @param {number} id_reporte  - ID del reporte gestionado
 * @param {string} accion      - Descripción de la acción tomada
 * @param {number} admin_id    - ID del usuario administrador
 */
export const registrarAuditoria = async (id_reporte, accion, admin_id) => {
  const { data, error } = await supabase
    .from('auditoria_administrativa')
    .insert({
      id_admin:           admin_id,
      id_usuario_afectado: null, // se puede enriquecer si se pasa el receptor
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

/**
 * enviarNotificaciones — C-01, comunicación a los usuarios involucrados.
 * Inserta notificaciones para el emisor y el receptor del reporte.
 * @param {number} emisor_id   - ID del usuario que hizo el reporte
 * @param {number} receptor_id - ID del usuario reportado
 */
export const enviarNotificaciones = async (emisor_id, receptor_id) => {
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
