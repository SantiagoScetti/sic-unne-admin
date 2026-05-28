// =============================================================================
// :Comision — Service (Cliente HTTP puro hacia /api/comisiones)
//
// Este archivo NO contiene SQL ni acceso directo a Supabase.
// Hace llamadas fetch contra nuestro backend a mano (Next.js API Routes).
//
// Trazabilidad con Diagramas de Secuencia (versión 3 capas):
//   obtenerComisiones → C-02 → GET    /api/comisiones?filtroEstado=...
//   crear             → C-02 → POST   /api/comisiones    body simple
//   insertar          → C-03 → POST   /api/comisiones    body { filas }
//   actualizar        →        PUT    /api/comisiones/:id
//   cambiarEstado     →        PATCH  /api/comisiones/:id
//   contarActivos     →        GET    /api/comisiones/contar-activas
// =============================================================================

const ENDPOINT = '/api/comisiones';

const jsonFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  });
  let payload = null;
  try { payload = await res.json(); } catch { /* respuesta sin cuerpo */ }
  return { res, payload };
};

/**
 * obtenerComisiones — C-02, lectura.
 * @param {string} filtroEstado - 'Activos' | 'Inactivos' | 'Todos'
 */
export const obtenerComisiones = async (filtroEstado = 'Activos') => {
  try {
    const { res, payload } = await jsonFetch(
      `${ENDPOINT}?filtroEstado=${encodeURIComponent(filtroEstado)}`
    );
    if (!res.ok) {
      const msg = payload?.error ?? `HTTP ${res.status}`;
      console.error('[obtenerComisiones] Error API:', msg);
      return { data: null, error: msg };
    }
    return { data: payload?.data ?? [], error: payload?.error ?? null };
  } catch (err) {
    console.error('[obtenerComisiones] Error de red:', err);
    return { data: null, error: err.message };
  }
};

/**
 * contarActivos — Auxiliar.
 */
export const contarActivos = async () => {
  try {
    const { res, payload } = await jsonFetch(`${ENDPOINT}/contar-activas`);
    if (!res.ok) {
      console.error('[contarActivos] Error API:', payload?.error ?? res.status);
      return 0;
    }
    return payload?.data ?? 0;
  } catch (err) {
    console.error('[contarActivos] Error de red:', err);
    return 0;
  }
};

/**
 * crear — C-02, escritura.
 * @param {string}   nombre
 * @param {string}   letraDesde
 * @param {string}   letraHasta
 * @param {number}   id_asignatura
 * @param {number[]} profesores_ids
 */
export const crear = async (nombre, letraDesde, letraHasta, id_asignatura, profesores_ids = []) => {
  const { res, payload } = await jsonFetch(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ nombre, letraDesde, letraHasta, id_asignatura, profesores_ids }),
  });

  if (!res.ok && res.status !== 207) {
    const msg = payload?.error ?? `HTTP ${res.status}`;
    console.error('[crear] Error API:', msg);
    throw new Error(msg);
  }

  if (payload?.error && res.status !== 207) {
    console.error('[crear] Error retornado por la API:', payload.error);
    throw new Error(payload.error);
  }

  return payload?.data ?? payload;
};

/**
 * insertar — C-03, importación masiva desde CSV.
 * @param {Object[]} filas - Filas parseadas del CSV
 */
export const insertar = async (filas) => {
  const { res, payload } = await jsonFetch(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ filas }),
  });

  // 207 = importación parcial (algunas filas OK, otras con error)
  if (!res.ok && res.status !== 207) {
    const msg = payload?.error ?? `HTTP ${res.status}`;
    console.error('[insertar] Error API:', msg);
    throw new Error(msg);
  }

  if (payload?.errores?.length > 0) {
    console.warn('[insertar] Importación parcial — errores por fila:', payload.errores);
  }

  return payload;
};

/**
 * actualizar — Actualiza datos base y relaciones de una comisión.
 * @param {number} id           - ID de la comisión
 * @param {Object} comisionData - Datos actualizados
 */
export const actualizar = async (id, comisionData) => {
  try {
    const { res, payload } = await jsonFetch(`${ENDPOINT}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ comisionData }),
    });
    if (!res.ok) {
      const msg = payload?.error ?? `HTTP ${res.status}`;
      console.error('[actualizar] Error API:', msg);
      return { data: null, error: msg };
    }
    return { data: payload?.data ?? null, error: payload?.error ?? null };
  } catch (err) {
    console.error('[actualizar] Error de red:', err);
    return { data: null, error: err.message };
  }
};

/**
 * cambiarEstado — Activa o desactiva una comisión.
 * @param {number}  id     - ID de la comisión
 * @param {boolean} estado - true (activo) | false (inactivo)
 */
export const cambiarEstado = async (id, estado) => {
  try {
    const { res, payload } = await jsonFetch(`${ENDPOINT}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
    if (!res.ok) {
      const msg = payload?.error ?? `HTTP ${res.status}`;
      console.error('[cambiarEstado] Error API:', msg);
      return { error: msg };
    }
    return { error: payload?.error ?? null };
  } catch (err) {
    console.error('[cambiarEstado] Error de red:', err);
    return { error: err.message };
  }
};
