import { getSupabaseServer } from '../_lib/supabaseServer';
import {
  ServicioResolucionDenuncia,
  DenunciaNoEncontradaError,
} from '../../../domain/denuncia/ServicioResolucionDenuncia';
import { DenunciaYaProcesadaError } from '../../../domain/denuncia/errores';

// =============================================================================
// API Route: /api/denuncias/[id]  (Capa de Controladores)
// Trazabilidad: Diagrama de Secuencia C-01.
//
//   GET    /api/denuncias/[id]   → detalle de la denuncia (con emisor/receptor).
//   PATCH  /api/denuncias/[id]   → resuelve o desestima la denuncia delegando en
//                                 ServicioResolucionDenuncia. RN: si ya fue procesada → 409.
//          body = { estado, accion?, fechaHasta?, observaciones?, admin_id? }
// =============================================================================

export default async function handler(req, res) {
  const { id } = req.query;
  const id_denuncia = Number(id);

  if (isNaN(id_denuncia)) {
    return res.status(400).json({ error: 'ID de denuncia inválido' });
  }

  try {
    if (req.method === 'GET')   return await handleGet(id_denuncia, res);
    if (req.method === 'PATCH') return await handlePatch(id_denuncia, req, res);

    res.setHeader('Allow', ['GET', 'PATCH']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  } catch (err) {
    if (err instanceof DenunciaYaProcesadaError) {
      return res.status(409).json({
        error: 'La denuncia ya ha sido procesada por otro administrador.',
        codigo: err.codigo,
        estadoActual: err.estadoActual,
      });
    }
    if (err instanceof DenunciaNoEncontradaError) {
      return res.status(404).json({ error: err.message });
    }
    console.error(`[/api/denuncias/${id_denuncia}] Error inesperado:`, err);
    return res.status(500).json({ error: err.message ?? 'Error interno' });
  }
}

async function handleGet(id_denuncia, res) {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('denuncia')
    .select(`
      *,
      emisor:usuario!emisor_id (id_usuario, nombre, apellido),
      receptor:usuario!receptor_id (id_usuario, nombre, apellido)
    `)
    .eq('id_denuncia', id_denuncia)
    .single();

  if (error) {
    return res.status(error.code === 'PGRST116' ? 404 : 500).json({ error: error.message });
  }
  return res.status(200).json({ data, error: null });
}

async function handlePatch(id_denuncia, req, res) {
  const { estado, accion, fechaHasta, observaciones, admin_id } = req.body ?? {};
  const servicio = new ServicioResolucionDenuncia();

  if (estado === 'Desestimado') {
    const denuncia = await servicio.desestimar({ id_denuncia, observaciones, admin_id });
    return res.status(200).json({
      data: { id_denuncia, estado: denuncia.estado },
      error: null,
    });
  }

  if (estado === 'Resuelto') {
    if (!accion) {
      return res.status(400).json({ error: "Para resolver la denuncia se requiere 'accion'." });
    }
    const denuncia = await servicio.resolver({ id_denuncia, accion, fechaHasta, observaciones, admin_id });
    return res.status(200).json({
      data: { id_denuncia, estado: denuncia.estado, accion_tomada: denuncia.accionTomada },
      error: null,
    });
  }

  return res.status(400).json({ error: "Campo 'estado' inválido. Use 'Resuelto' o 'Desestimado'." });
}
