import { ServicioComision } from '../../../domain/comision/ServicioComision';
import { ComisionInvalidaError } from '../../../domain/comision/errores';

// =============================================================================
// API Route: /api/comisiones/[id]  (Capa de Controladores)
//
//   PUT   /api/comisiones/:id   body = { comisionData }
//         → Actualiza datos base; si comisionData.profesores_ids viene, reemplaza
//           el set de vínculos comision_profesor.
//   PATCH /api/comisiones/:id   body = { estado: boolean }
//         → Activa/desactiva la comisión.
// =============================================================================

export default async function handler(req, res) {
  const { id } = req.query;
  const idNum = Number(id);

  if (!Number.isInteger(idNum) || idNum <= 0) {
    return res.status(400).json({ error: "Parámetro 'id' inválido." });
  }

  const servicio = new ServicioComision();

  try {
    if (req.method === 'PUT') {
      const { comisionData } = req.body ?? {};
      if (!comisionData || typeof comisionData !== 'object') {
        return res.status(400).json({ data: null, error: "Falta el cuerpo 'comisionData'." });
      }
      const actualizada = await servicio.actualizar(idNum, comisionData);
      return res.status(200).json({ data: actualizada, error: null });
    }

    if (req.method === 'PATCH') {
      const { estado } = req.body ?? {};
      if (typeof estado !== 'boolean') {
        return res.status(400).json({ error: "El campo 'estado' debe ser boolean." });
      }
      await servicio.cambiarEstado(idNum, estado);
      return res.status(200).json({ error: null });
    }

    res.setHeader('Allow', ['PUT', 'PATCH']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  } catch (err) {
    if (err instanceof ComisionInvalidaError) {
      return res.status(400).json({ data: null, error: err.message, codigo: err.codigo });
    }
    console.error(`[/api/comisiones/${idNum}] Error inesperado:`, err);
    return res.status(500).json({ data: null, error: err.message ?? 'Error interno' });
  }
}
