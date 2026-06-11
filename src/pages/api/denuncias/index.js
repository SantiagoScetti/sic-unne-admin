import { getSupabaseServer } from '../_lib/supabaseServer';
import { ServicioConsultaUsuario } from '../../../domain/usuario/ServicioConsultaUsuario';

// =============================================================================
// API Route: /api/denuncias
// Trazabilidad: Diagrama de Secuencia C-01, pasos 2-7.
//
// Métodos soportados:
//   GET  /api/denuncias?filtroEstado=Todos|Pendiente|Resuelto|Desestimado
//        → Devuelve el listado de denuncias.
//          Paso 3: obtenerDenuncias() — consulta la tabla `denuncia`.
//          Pasos 4-6: por cada receptor_id único, solicita datos al
//          ServicioConsultaUsuario (obtenerPorId) y los adjunta a la denuncia.
// =============================================================================

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') return await handleGet(req, res);

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  } catch (err) {
    console.error('[/api/denuncias] Error inesperado:', err);
    return res.status(500).json({ error: err.message ?? 'Error interno' });
  }
}

async function handleGet(req, res) {
  const filtroEstado = req.query.filtroEstado ?? 'Todos';
  const supabase = getSupabaseServer();

  // ── Paso 3: obtenerDenuncias() ────────────────────────────────────────────
  // Consulta plana sin JOIN: el dominio Usuario se resuelve por separado.
  let query = supabase
    .from('denuncia')
    .select('id_denuncia, emisor_id, receptor_id, id_periodo, motivo, estado, fecha_alta, accion_tomada, admin_id')
    .order('fecha_alta', { ascending: false });

  if (filtroEstado && filtroEstado !== 'Todos') {
    query = query.eq('estado', filtroEstado);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[GET /api/denuncias] Error:', error);
    return res.status(500).json({ data: null, error: error.message });
  }

  // ── Pasos 4-6: Solicita datos del receptor via ServicioConsultaUsuario ────
  // Se recopilan los receptor_id únicos para minimizar llamadas al repositorio.
  const servicio = new ServicioConsultaUsuario();
  const receptorIds = [...new Set(data.map((d) => d.receptor_id).filter(Boolean))];

  const receptoresMap = {};
  await Promise.all(
    receptorIds.map(async (id) => {
      try {
        const usuario = await servicio.obtenerPorId(id);
        receptoresMap[id] = {
          id_usuario:  usuario.id_usuario,
          nombre:      usuario.nombre,
          apellido:    usuario.apellido,
          documento:   usuario.documento,
        };
      } catch {
        // Si el usuario no existe en la DB, se mapea como null (datos corruptos/borrados).
        receptoresMap[id] = null;
      }
    })
  );

  // Enriquecer cada denuncia con los datos de su receptor.
  const denuncias = data.map((d) => ({
    ...d,
    receptor: receptoresMap[d.receptor_id] ?? null,
  }));

  return res.status(200).json({ data: denuncias, error: null });
}
