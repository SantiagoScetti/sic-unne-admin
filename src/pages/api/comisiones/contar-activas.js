import { ServicioComision } from '../../../domain/comision/ServicioComision';

// =============================================================================
// API Route: /api/comisiones/contar-activas
// Devuelve la cantidad de comisiones activas.
// =============================================================================

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  try {
    const data = await new ServicioComision().contarActivas();
    return res.status(200).json({ data, error: null });
  } catch (err) {
    console.error('[/api/comisiones/contar-activas] Error:', err);
    return res.status(500).json({ data: 0, error: err.message ?? 'Error interno' });
  }
}
