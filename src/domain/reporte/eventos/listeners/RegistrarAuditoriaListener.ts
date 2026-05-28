import type { Observador } from '../Observador';
import type { ReporteResueltoEvent } from '../ReporteResueltoEvent';
import type { AuditoriaRepositorio } from '../../../../infrastructure/repositorios/AuditoriaRepositorio';

// =============================================================================
// PATRÓN OBSERVADOR — Listener concreto: registra la acción en auditoría.
// Deja trazabilidad de qué admin resolvió el reporte, sobre qué usuario y con
// qué efecto. Las observaciones del admin se guardan en 'detalles' (jsonb),
// ya que la tabla reporte no tiene columna para texto libre.
// =============================================================================

export class RegistrarAuditoriaListener implements Observador<ReporteResueltoEvent> {
  constructor(private readonly auditoriaRepo: AuditoriaRepositorio) {}

  async manejar(evento: ReporteResueltoEvent): Promise<void> {
    await this.auditoriaRepo.registrar({
      id_admin: evento.adminId,
      id_usuario_afectado: evento.reporte.receptor_id,
      accion: evento.accion ?? 'Desestimar reporte',
      detalles: {
        id_reporte: evento.reporte.id_reporte,
        estado_final: evento.reporte.estado,
        observaciones: evento.observaciones,
        ...evento.detalleAuditoria,
      },
    });
  }
}
