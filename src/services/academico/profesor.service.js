import { createClient } from '@/lib/supabase/client';

// =============================================================================
// :Profesor — Service (Cliente HTTP puro hacia /api/profesores)
//
// Este archivo ya NO accede directamente a Supabase para las operaciones
// de ABM (listar, crear, actualizar, cambiarEstado). Todas esas operaciones
// pasan por la API Route /api/profesores, que a su vez usa el servidor.
//
// Excepción: insertar() sigue usando el cliente Supabase directamente ya que
// es parte del flujo C-03 (importación masiva desde CSV), que se ejecuta
// completamente en el cliente.
//
// Trazabilidad:
//   obtenerProfesores → GET  /api/profesores?filtroEstado=...
//   contarActivos     → GET  /api/profesores?filtroEstado=Activos (count)
//   crear             → POST /api/profesores
//   actualizar        → PUT  /api/profesores/:id
//   cambiarEstado     → PATCH /api/profesores/:id
//   insertar          → Supabase cliente (C-03, importación masiva)
// =============================================================================

const ENDPOINT = '/api/profesores';

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
 * obtenerProfesores — Listado de profesores con total de asignaciones.
 * @param {string} filtroEstado - 'Activos' | 'Inactivos' | 'Todos'
 */
export const obtenerProfesores = async (filtroEstado = 'Activos') => {
  try {
    const { res, payload } = await jsonFetch(
      `${ENDPOINT}?filtroEstado=${encodeURIComponent(filtroEstado)}`
    );
    if (!res.ok) {
      const msg = payload?.error ?? `HTTP ${res.status}`;
      console.error('[obtenerProfesores] Error API:', msg);
      return { data: null, error: msg };
    }
    return { data: payload?.data ?? [], error: payload?.error ?? null };
  } catch (err) {
    console.error('[obtenerProfesores] Error de red:', err);
    return { data: null, error: err.message };
  }
};

/**
 * contarActivos — Cantidad de profesores activos (para StatCards).
 */
export const contarActivos = async () => {
  try {
    const { res, payload } = await jsonFetch(
      `${ENDPOINT}?filtroEstado=Activos`
    );
    if (!res.ok) {
      console.error('[contarActivos] Error API:', payload?.error ?? res.status);
      return 0;
    }
    return (payload?.data ?? []).length;
  } catch (err) {
    console.error('[contarActivos] Error de red:', err);
    return 0;
  }
};

/**
 * crear — Alta de un nuevo profesor.
 * @param {{ nombre, apellido, documento, correo }} data
 */
export const crear = async (data) => {
  try {
    const { res, payload } = await jsonFetch(ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({
        nombre:    data.nombre,
        apellido:  data.apellido,
        documento: Number(data.documento),
        correo:    data.correo ?? null,
      }),
    });
    if (!res.ok) {
      const msg = payload?.error ?? `HTTP ${res.status}`;
      console.error('[crear] Error API:', msg);
      return { data: null, error: msg };
    }
    return { data: payload?.data ?? null, error: null };
  } catch (err) {
    console.error('[crear] Error de red:', err);
    return { data: null, error: err.message };
  }
};

/**
 * actualizar — Actualiza datos de un profesor existente.
 * @param {number} id
 * @param {{ nombre, apellido, documento, correo }} data
 */
export const actualizar = async (id, data) => {
  try {
    const { res, payload } = await jsonFetch(`${ENDPOINT}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        nombre:    data.nombre,
        apellido:  data.apellido,
        documento: Number(data.documento),
        correo:    data.correo ?? null,
      }),
    });
    if (!res.ok) {
      const msg = payload?.error ?? `HTTP ${res.status}`;
      console.error('[actualizar] Error API:', msg);
      return { data: null, error: msg };
    }
    return { data: payload?.data ?? null, error: null };
  } catch (err) {
    console.error('[actualizar] Error de red:', err);
    return { data: null, error: err.message };
  }
};

/**
 * cambiarEstado — Activa o desactiva un profesor.
 * @param {number}  id
 * @param {boolean} estado
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
    return { error: null };
  } catch (err) {
    console.error('[cambiarEstado] Error de red:', err);
    return { error: err.message };
  }
};

/**
 * asignar — C-02, paso 3.
 * Vincula profesores a una comisión recién creada.
 * Sigue usando Supabase cliente porque es una operación auxiliar dentro del
 * flujo de creación de comisiones (orquestado en comision.service.js).
 */
export const asignar = async (id_comision, profesores_ids) => {
  if (!profesores_ids || profesores_ids.length === 0) return;
  const supabase = createClient();
  const relaciones = profesores_ids.map((id_profesor) => ({ id_comision, id_profesor }));
  const { error } = await supabase.from('comision_profesor').insert(relaciones);
  if (error) {
    console.error('Error asignando profesores a comisión:', error);
    throw new Error(error.message);
  }
};

/**
 * insertar — C-03, importación masiva desde CSV.
 * Upsert masivo de profesores. Usa Supabase cliente directamente porque
 * el flujo C-03 completo se ejecuta en el cliente (no pasa por API Route).
 */
export const insertar = async (filas) => {
  const supabase = createClient();
  const vistas = new Set();
  const unicos = filas.filter((f) => {
    if (vistas.has(f.profesor_documento)) return false;
    vistas.add(f.profesor_documento);
    return true;
  });

  const resultados = [];
  for (const f of unicos) {
    const documento = f.profesor_documento;
    
    const { data: existente } = await supabase
      .from('profesor')
      .select('*')
      .eq('documento', documento)
      .maybeSingle();

    if (existente) {
      resultados.push(existente);
    } else {
      const { data, error } = await supabase
        .from('profesor')
        .insert([{
          nombre:    f.profesor_nombre,
          apellido:  f.profesor_apellido,
          documento: documento,
          correo:    f.profesor_correo,
          estado:    true,
        }])
        .select();
      
      if (error) {
        console.error('Error insertando profesor:', error);
        throw new Error(error.message);
      }
      if (data) resultados.push(data[0]);
    }
  }
  return resultados;
};
