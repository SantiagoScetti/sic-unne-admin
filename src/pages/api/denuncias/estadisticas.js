import { DenunciaRepositorio } from '../../../infrastructure/repositorios/DenunciaRepositorio';

// =============================================================================
// API Route: /api/denuncias/estadisticas  (Capa de Controladores)
//
//   GET /api/denuncias/estadisticas
//       → Devuelve la cantidad de denuncias por estado.
//       Invoca la FUNCIÓN ALMACENADA fn_contar_denuncias_por_estado()
//       a través de DenunciaRepositorio.contarPorEstado().
//
// Demuestra la invocación de un stored procedure de CONSULTA desde la API.
// =============================================================================

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  try {
    const repo = new DenunciaRepositorio();
    const data = await repo.contarPorEstado();
    return res.status(200).json({ data, error: null });
  } catch (err) {
    console.error('[/api/denuncias/estadisticas] Error:', err);
    return res.status(500).json({ data: null, error: err.message ?? 'Error interno' });
  }
}
