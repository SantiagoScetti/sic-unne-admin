import type { Reporte } from '../Reporte';
import type { AccionTomada } from '../tipos';
import type { TipoNotificacion } from '../../../infrastructure/repositorios/NotificacionRepositorio';

// =============================================================================
// PATRÓN OBSERVADOR — Evento de dominio.
// Se publica cuando un reporte cambia a un estado terminal (Resuelto o
// Desestimado). Transporta todo lo que los listeners necesitan para reaccionar.
// =============================================================================

export class ReporteResueltoEvent {
  constructor(
    public readonly reporte: Reporte,
    public readonly accion: AccionTomada | null, // null = desestimado
    public readonly adminId: number,
    public readonly tipoNotificacionReceptor: TipoNotificacion,
    public readonly mensajeReceptor: string,
    public readonly observaciones: string,
    public readonly detalleAuditoria: Record<string, unknown>,
  ) {}
}
