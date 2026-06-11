// =============================================================================
// :Denuncia — Objeto del dominio (C-01)
// Métodos del cliente refactorizados para consumir las API Routes (3 capas).
// =============================================================================

/**
 * obtenerDenuncias — C-01, paso 1.
 * Devuelve todas las denuncias con datos de emisor y receptor.
 */
export const obtenerDenuncias = async () => {
  const res = await fetch('/api/denuncias');
  const result = await res.json();

  if (!res.ok) {
    console.error('Error fetching denuncias:', result.error);
    throw new Error(result.error || 'Fallo al obtener denuncias');
  }
  return result.data;
};

/**
 * obtenerDenunciasFiltradas — C-01, variante de listado.
 */
export const obtenerDenunciasFiltradas = async (estado) => {
  const res = await fetch(`/api/denuncias?filtroEstado=${estado || 'Todos'}`);
  const result = await res.json();

  if (!res.ok) {
    console.error('Error fetching denuncias filtradas:', result.error);
    throw new Error(result.error || 'Fallo al obtener denuncias filtradas');
  }
  return result.data;
};

/**
 * obtenerEstadisticas — C-01, tarjetas del panel.
 * Invoca la FUNCIÓN ALMACENADA fn_contar_denuncias_por_estado a través de
 * /api/denuncias/estadisticas. Devuelve un array [{ estado, cantidad }].
 */
export const obtenerEstadisticas = async () => {
  const res = await fetch('/api/denuncias/estadisticas');
  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error('Error fetching estadisticas:', result.error);
    throw new Error(result.error || 'Fallo al obtener estadísticas');
  }
  return result.data || [];
};

/**
 * obtenerDetalleDenuncia — C-01, paso de detalle.
 */
export const obtenerDetalleDenuncia = async (id_denuncia) => {
  const res = await fetch(`/api/denuncias/${id_denuncia}`);
  const result = await res.json();

  if (!res.ok) {
    console.error('Error fetching detalle denuncia:', result.error);
    throw new Error(result.error || 'Fallo al obtener detalle de la denuncia');
  }
  return result.data;
};

/**
 * resolverDenuncia — C-01, operación crítica (resolver o desestimar).
 *
 * Regla de negocio (409): si la denuncia ya fue procesada por otro admin,
 * se lanza 'CONFLIC_ALREADY_PROCESSED' para alertar en la UI.
 */
export const resolverDenuncia = async (
  id_denuncia,
  { estado, accion, fechaHasta, observaciones, auth_id } = {}
) => {
  const res = await fetch(`/api/denuncias/${id_denuncia}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado, accion, fechaHasta, observaciones, auth_id }),
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 409) {
      throw new Error('CONFLIC_ALREADY_PROCESSED');
    }
    console.error('Error resolviendo denuncia:', result.error);
    throw new Error(result.error || 'Fallo al resolver la denuncia');
  }

  return result.data;
};
