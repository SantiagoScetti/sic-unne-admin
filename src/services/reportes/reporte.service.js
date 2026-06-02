// =============================================================================
// :Reporte — Objeto del dominio (C-01)
// Métodos del cliente refactorizados para consumir las API Routes (3 capas).
// Mantiene exactamente la misma firma y comportamiento que el servicio original.
// =============================================================================

/**
 * obtenerReportes — C-01, paso 1.
 * Devuelve todos los reportes con datos de emisor y receptor.
 */
export const obtenerReportes = async () => { // C-01: llamada al backend a través de API Route.
  const res = await fetch('/api/reportes');
  const result = await res.json();
  
  if (!res.ok) {
    console.error('Error fetching reportes:', result.error);
    throw new Error(result.error || 'Fallo al obtener reportes');
  }
  return result.data;
};

/**
 * obtenerReportesFiltrados — C-01, variante de listado.
 * Devuelve reportes filtrando por estado ('Pendiente', 'Resuelto', 'Desestimado', 'En Revision').
 */
export const obtenerReportesFiltrados = async (estado) => {
  const res = await fetch(`/api/reportes?filtroEstado=${estado || 'Todos'}`);
  const result = await res.json();

  if (!res.ok) {
    console.error('Error fetching reportes filtrados:', result.error);
    throw new Error(result.error || 'Fallo al obtener reportes filtrados');
  }
  return result.data;
};

/**
 * obtenerDetalleReporte — C-01, paso de detalle.
 * Devuelve un único reporte por ID con todos sus datos relacionados.
 */
export const obtenerDetalleReporte = async (id_reporte) => { // C-01: llamada al backend a través de API Route para obtener detalle de un reporte específico.
  const res = await fetch(`/api/reportes/${id_reporte}`);
  const result = await res.json();

  if (!res.ok) {
    console.error('Error fetching detalle reporte:', result.error);
    throw new Error(result.error || 'Fallo al obtener detalle del reporte');
  }
  return result.data;
};

/**
 * resolverReporte — C-01, operación crítica (resolver o desestimar).
 *
 * Una sola llamada al backend. El servidor orquesta toda la operación
 * (cambio de estado + sanción + auditoría + notificaciones) aplicando los
 * patrones Estado, Estrategia y Observador. La UI ya no encadena 4 fetches.
 *
 * Regla de negocio (409): si el reporte ya fue procesado por otro admin,
 * se lanza 'CONFLIC_ALREADY_PROCESSED' para alertar en la UI.
 *
 * @param {number} id_reporte
 * @param {Object} payload
 * @param {'Resuelto'|'Desestimado'} payload.estado
 * @param {string} [payload.accion]        - requerido si estado='Resuelto'
 * @param {string} [payload.fechaHasta]    - requerido si accion='Suspender Temporalmente'
 * @param {string} [payload.observaciones]
 * @param {number} [payload.admin_id]      - opcional; el server resuelve un admin por defecto
 */
export const resolverReporte = async ( // C-01: llamada al backend a través de API Route para resolver o desestimar un reporte.
  id_reporte,
  { estado, accion, fechaHasta, observaciones, admin_id } = {}
) => {
  const res = await fetch(`/api/reportes/${id_reporte}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado, accion, fechaHasta, observaciones, admin_id }),
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 409) {
      throw new Error('CONFLIC_ALREADY_PROCESSED');
    }
    console.error('Error resolviendo reporte:', result.error);
    throw new Error(result.error || 'Fallo al resolver el reporte');
  }

  return result.data;
};
