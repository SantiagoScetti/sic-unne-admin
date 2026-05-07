import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// =============================================================================
// :Comision — Service (Pasarela a Edge Functions — sin lógica de negocio)
//
// Este archivo NO contiene SQL ni lógica de negocio.
// Toda la lógica vive en las Edge Functions de Supabase.
//
// Trazabilidad con Diagramas de Secuencia:
//   obtenerComisiones → C-02 → Edge Function `obtener-comisiones`
//   crear             → C-02 → Edge Function `crear-comision`
//   insertar          → C-03 → Edge Function `importar-comisiones-csv`
//   actualizar        →        Edge Function `actualizar-comision`
//   cambiarEstado     →        Edge Function `cambiar-estado-comision`
//   contarActivos     →        Edge Function `contar-comisiones-activas`
// =============================================================================

/**
 * obtenerComisiones — C-02, lectura.
 * @param {string} filtroEstado - 'Activos' | 'Inactivos' | 'Todos'
 */
export const obtenerComisiones = async (filtroEstado = 'Activos') => {
  const { data, error } = await supabase.functions.invoke('obtener-comisiones', {
    body: { filtroEstado },
  });

  if (error) {
    console.error('[obtenerComisiones] Error invocando Edge Function:', error);
    return { data: null, error: error.message };
  }

  return { data: data?.data ?? [], error: data?.error ?? null };
};

/**
 * contarActivos — Auxiliar
 */
export const contarActivos = async () => {
  const { data, error } = await supabase.functions.invoke('contar-comisiones-activas', {
    body: {},
  });

  if (error) {
    console.error('[contarActivos] Error invocando Edge Function:', error);
    return 0;
  }

  return data?.data ?? 0;
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
  const { data, error } = await supabase.functions.invoke('crear-comision', {
    body: { nombre, letraDesde, letraHasta, id_asignatura, profesores_ids },
  });

  if (error) {
    console.error('[crear] Error invocando Edge Function:', error);
    throw new Error(error.message);
  }

  if (data?.error) {
    console.error('[crear] Error retornado por la Edge Function:', data.error);
    throw new Error(data.error);
  }

  return data?.data ?? data;
};

/**
 * insertar — C-03, importación masiva desde CSV.
 * @param {Object[]} filas - Filas parseadas del CSV
 */
export const insertar = async (filas) => {
  const { data, error } = await supabase.functions.invoke('importar-comisiones-csv', {
    body: { filas },
  });

  if (error) {
    console.error('[insertar] Error invocando Edge Function:', error);
    throw new Error(error.message);
  }

  if (data?.error) {
    console.error('[insertar] Error retornado por la Edge Function:', data.error);
    throw new Error(data.error);
  }

  // data.errores contiene errores parciales de filas individuales (HTTP 207)
  if (data?.errores?.length > 0) {
    console.warn('[insertar] Importación parcial — errores por fila:', data.errores);
  }

  return data;
};

/**
 * actualizar — Actualiza datos base y relaciones de una comisión.
 * @param {number} id           - ID de la comisión
 * @param {Object} comisionData - Datos actualizados
 */
export const actualizar = async (id, comisionData) => {
  const { data, error } = await supabase.functions.invoke('actualizar-comision', {
    body: { id, comisionData },
  });

  if (error) {
    console.error('[actualizar] Error invocando Edge Function:', error);
    return { data: null, error: error.message };
  }

  return { data: data?.data ?? null, error: data?.error ?? null };
};

/**
 * cambiarEstado — Activa o desactiva una comisión.
 * @param {number}  id     - ID de la comisión
 * @param {boolean} estado - true (activo) | false (inactivo)
 */
export const cambiarEstado = async (id, estado) => {
  const { data, error } = await supabase.functions.invoke('cambiar-estado-comision', {
    body: { id, estado },
  });

  if (error) {
    console.error('[cambiarEstado] Error invocando Edge Function:', error);
    return { error: error.message };
  }

  return { error: data?.error ?? null };
};