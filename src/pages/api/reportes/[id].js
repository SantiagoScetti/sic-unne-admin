import { getSupabaseServer } from '../_lib/supabaseServer';
import {
  ServicioResolucionReporte,
  ReporteNoEncontradoError,
} from '../../../domain/reporte/ServicioResolucionReporte';
import { ReporteYaProcesadoError } from '../../../domain/reporte/errores';

// =============================================================================
// API Route: /api/reportes/[id]  (Capa de Controladores)
// Trazabilidad: Diagrama de Secuencia C-01.
//
//   GET    /api/reportes/[id]   → detalle del reporte (con emisor/receptor).
//   PATCH  /api/reportes/[id]   → resuelve o desestima el reporte delegando en
//                                 ServicioResolucionReporte (Estado + Estrategia
//                                 + Observador). RN: si ya fue procesado → 409.
//          body = { estado, accion?, fechaHasta?, observaciones?, admin_id? }
// =============================================================================

export default async function handler(req, res) {
  const { id } = req.query;
  const id_reporte = Number(id);

  if (isNaN(id_reporte)) {
    return res.status(400).json({ error: 'ID de reporte inválido' });
  }

  try {
    if (req.method === 'GET')   return await handleGet(id_reporte, res);
    if (req.method === 'PATCH') return await handlePatch(id_reporte, req, res);

    res.setHeader('Allow', ['GET', 'PATCH']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  } catch (err) {
    if (err instanceof ReporteYaProcesadoError) {
      return res.status(409).json({
        error: 'El reporte ya ha sido procesado por otro administrador.',
        codigo: err.codigo,
        estadoActual: err.estadoActual,
      });
    }
    if (err instanceof ReporteNoEncontradoError) {
      return res.status(404).json({ error: err.message });
    }
    console.error(`[/api/reportes/${id_reporte}] Error inesperado:`, err);
    return res.status(500).json({ error: err.message ?? 'Error interno' });
  }
}

// ─── GET: detalle ───────────────────────────────────────────────────────────
async function handleGet(id_reporte, res) { // C-01: consulta al backend para obtener detalle de un reporte específico, incluyendo datos de emisor y receptor.
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('reporte')
    .select(`
      *,
      emisor:usuario!emisor_id (id_usuario, nombre, apellido),
      receptor:usuario!receptor_id (id_usuario, nombre, apellido)
    `)
    .eq('id_reporte', id_reporte)
    .single();

  if (error) {
    return res.status(error.code === 'PGRST116' ? 404 : 500).json({ error: error.message });
  }
  return res.status(200).json({ data, error: null });
}

// ─── PATCH: resolver / desestimar ─────────────────────────────────────────────
async function handlePatch(id_reporte, req, res) {
  const { estado, accion, fechaHasta, observaciones, admin_id } = req.body ?? {};
  const servicio = new ServicioResolucionReporte();

  if (estado === 'Desestimado') {
    const reporte = await servicio.desestimar({ id_reporte, observaciones, admin_id });
    return res.status(200).json({
      data: { id_reporte, estado: reporte.estado },
      error: null,
    });
  }

  if (estado === 'Resuelto') {
    if (!accion) {
      return res.status(400).json({ error: "Para resolver el reporte se requiere 'accion'." });
    }
    const reporte = await servicio.resolver({ id_reporte, accion, fechaHasta, observaciones, admin_id });
    return res.status(200).json({
      data: { id_reporte, estado: reporte.estado, accion_tomada: reporte.accionTomada },
      error: null,
    });
  }

  return res.status(400).json({ error: "Campo 'estado' inválido. Use 'Resuelto' o 'Desestimado'." });
}
