import { ServicioConsultaUsuario } from '../../../domain/usuario/ServicioConsultaUsuario';
import {
  ServicioResolucionDenuncia,
  DenunciaNoEncontradaError,
} from '../../../domain/denuncia/ServicioResolucionDenuncia';
import { DenunciaYaProcesadaError } from '../../../domain/denuncia/errores';
import { getSupabaseServer } from '../_lib/supabaseServer';

// =============================================================================
// API Route: /api/denuncias/[id]  (Capa de Controladores)
// Trazabilidad: Diagrama de Secuencia C-01, pasos 10-27.
//
//   GET   /api/denuncias/[id]  → detalle de la denuncia.
//         Paso 11: obtenerDetalleDenuncia(id_denuncia) — query plana a `denuncia`.
//         Pasos 12-14: ServicioConsultaUsuario.obtenerPorId(emisor_id).
//         Pasos 15-17: ServicioConsultaUsuario.obtenerPorId(receptor_id).
//
//   PATCH /api/denuncias/[id]  → resuelve o desestima la denuncia.
//         Paso 23: resolverDenuncia(...) → delega en ServicioResolucionDenuncia.
//         Pasos 24-26: ServicioResolucionDenuncia obtiene admin_id via
//                      ServicioConsultaUsuario.obtenerAdminSesion().
//         RN: si la denuncia ya fue procesada → 409 CONFLICT.
//         body = { estado, accion?, fechaHasta?, observaciones?, admin_id? }
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

// ── GET ───────────────────────────────────────────────────────────────────────

async function handleGet(id_denuncia, res) {
  const supabase = getSupabaseServer();

  // ── Paso 11: obtenerDetalleDenuncia(id_denuncia) ──────────────────────────
  // Consulta plana sin JOIN: emisor y receptor se resuelven por separado.
  const { data, error } = await supabase
    .from('denuncia')
    .select('id_denuncia, emisor_id, receptor_id, id_periodo, motivo, estado, fecha_alta, accion_tomada, admin_id')
    .eq('id_denuncia', id_denuncia)
    .single();

  if (error) {
    return res.status(error.code === 'PGRST116' ? 404 : 500).json({ error: error.message });
  }

  const servicio = new ServicioConsultaUsuario();

  // ── Pasos 12-14: Solicita datos del emisor ────────────────────────────────
  let emisor = null;
  if (data.emisor_id) {
    try {
      const u = await servicio.obtenerPorId(data.emisor_id);
      emisor = { id_usuario: u.id_usuario, nombre: u.nombre, apellido: u.apellido, documento: u.documento };
    } catch {
      // El emisor puede no existir si fue eliminado; se devuelve null.
    }
  }

  // ── Pasos 15-17: Solicita datos del receptor ──────────────────────────────
  let receptor = null;
  try {
    const u = await servicio.obtenerPorId(data.receptor_id);
    receptor = { id_usuario: u.id_usuario, nombre: u.nombre, apellido: u.apellido, documento: u.documento };
  } catch {
    // El receptor puede no existir en casos de datos corruptos/borrados.
  }

  return res.status(200).json({ data: { ...data, emisor, receptor }, error: null });
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

async function handlePatch(id_denuncia, req, res) {
  // ── Paso 23: resolverDenuncia(id_denuncia, { estado, accion, ... }) ────────
  // El ServicioResolucionDenuncia orquesta internamente:
  //   - carga la Denuncia via DenunciaRepositorio
  //   - aplica la transición de estado (patrón Estado)
  //   - persiste el nuevo estado
  //   - paso 24-26: obtiene admin_id via ServicioConsultaUsuario.obtenerAdminSesion()
  //   - aplica el efecto (suspender usuario si corresponde)
  const { estado, accion, fechaHasta, observaciones, auth_id } = req.body ?? {};
  const servicio = new ServicioResolucionDenuncia();

  if (estado === 'Desestimado') {
    const denuncia = await servicio.desestimar({ id_denuncia, observaciones, auth_id });
    return res.status(200).json({
      data: { id_denuncia, estado: denuncia.estado },
      error: null,
    });
  }

  if (estado === 'Resuelto') {
    if (!accion) {
      return res.status(400).json({ error: "Para resolver la denuncia se requiere 'accion'." });
    }
    const denuncia = await servicio.resolver({ id_denuncia, accion, fechaHasta, observaciones, auth_id });
    return res.status(200).json({
      data: { id_denuncia, estado: denuncia.estado, accion_tomada: denuncia.accionTomada },
      error: null,
    });
  }

  return res.status(400).json({ error: "Campo 'estado' inválido. Use 'Resuelto' o 'Desestimado'." });
}
