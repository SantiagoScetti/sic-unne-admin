import { getSupabaseServer } from '../_lib/supabaseServer';

// =============================================================================
// API Route: /api/reportes
// Trazabilidad: Diagrama de Secuencia C-01.
//
// Métodos soportados:
//   GET    /api/reportes?filtroEstado=Todos|Pendiente|Resuelto|Desestimado|En Revision
//          → Devuelve el listado de reportes con relaciones emisor/receptor.
// =============================================================================

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') return await handleGet(req, res);

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  } catch (err) {
    console.error('[/api/reportes] Error inesperado:', err);
    return res.status(500).json({ error: err.message ?? 'Error interno' });
  }
}

async function handleGet(req, res) {
  const filtroEstado = req.query.filtroEstado ?? 'Todos';
  const supabase = getSupabaseServer();

  let query = supabase
    .from('reporte')
    .select(`
      *,
      emisor:usuario!emisor_id (id_usuario, nombre, apellido),
      receptor:usuario!receptor_id (id_usuario, nombre, apellido)
    `)
    .order('fecha_alta', { ascending: false });

  if (filtroEstado && filtroEstado !== 'Todos') {
    query = query.eq('estado', filtroEstado);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[GET /api/reportes] Error:', error);
    return res.status(500).json({ data: null, error: error.message });
  }

  return res.status(200).json({ data, error: null });
}
