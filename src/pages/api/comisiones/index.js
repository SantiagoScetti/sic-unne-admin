import { ServicioComision } from '../../../domain/comision/ServicioComision';
import { ComisionInvalidaError } from '../../../domain/comision/errores';

// =============================================================================
// API Route: /api/comisiones  (Capa de Controladores)
// Trazabilidad: Diagramas de Secuencia C-02 (creación) y C-03 (importación).
//
//   GET  /api/comisiones?filtroEstado=Activos|Inactivos|Todos
//        → Listado normalizado.
//   POST /api/comisiones
//     - body = { nombre, letraDesde, letraHasta, id_asignatura, profesores_ids }
//          → Crea comisión + vincula profesores (C-02).
//     - body = { filas: [ ... ] }
//          → Importación masiva desde CSV (C-03).
//
// El controlador solo valida el transporte y delega en ServicioComision.
// =============================================================================

export default async function handler(req, res) {
  const servicio = new ServicioComision();

  try {
    if (req.method === 'GET') {
      const filtroEstado = req.query.filtroEstado ?? 'Activos';
      const data = await servicio.listar(filtroEstado);
      return res.status(200).json({ data, error: null });
    }

    if (req.method === 'POST') {
      const body = req.body ?? {};

      // Importación masiva (C-03)
      if (Array.isArray(body.filas)) {
        if (body.filas.length === 0) {
          return res.status(400).json({ error: "Se requiere un array 'filas' no vacío." });
        }
        const { insertadas, resultados, errores } = await servicio.importarMasivo(body.filas);
        const status = errores.length === 0 ? 200 : errores.length === body.filas.length ? 500 : 207;
        return res.status(status).json({
          data: resultados,
          insertadas,
          errores: errores.length > 0 ? errores : null,
          error: null,
        });
      }

      // Creación simple (C-02)
      const comision = await servicio.crear(body);
      return res.status(201).json({ data: comision, error: null });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  } catch (err) {
    if (err instanceof ComisionInvalidaError) {
      return res.status(400).json({ error: err.message, codigo: err.codigo });
    }
    console.error('[/api/comisiones] Error inesperado:', err);
    return res.status(500).json({ error: err.message ?? 'Error interno' });
  }
}
