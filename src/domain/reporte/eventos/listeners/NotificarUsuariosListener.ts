import type { Observador } from '../Observador';
import type { ReporteResueltoEvent } from '../ReporteResueltoEvent';
import type {
  NotificacionRepositorio,
  NuevaNotificacion,
} from '../../../../infrastructure/repositorios/NotificacionRepositorio';

// =============================================================================
// PATRÓN OBSERVADOR — Listener concreto: notifica a los usuarios involucrados.
//   - Receptor (reportado): siempre, con el tipo/mensaje según la acción.
//   - Emisor (denunciante): solo si no es el Sistema y es distinto del receptor.
// =============================================================================

export class NotificarUsuariosListener implements Observador<ReporteResueltoEvent> {
  constructor(private readonly notificacionRepo: NotificacionRepositorio) {}

  async manejar(evento: ReporteResueltoEvent): Promise<void> {
    const { reporte } = evento;
    const notificaciones: NuevaNotificacion[] = [];

    // Receptor (siempre)
    notificaciones.push({
      id_usuario: reporte.receptor_id,
      tipo: evento.tipoNotificacionReceptor,
      mensaje: evento.mensajeReceptor,
    });

    // Emisor (solo si no es el Sistema y es distinto del receptor)
    if (!reporte.emisorEsSistema() && reporte.emisor_id !== reporte.receptor_id) {
      notificaciones.push({
        id_usuario: reporte.emisor_id as number,
        tipo: 'Reporte',
        mensaje:
          'El reporte que realizaste fue revisado por un administrador. ' +
          'Gracias por colaborar con la comunidad.',
      });
    }

    await this.notificacionRepo.crearVarias(notificaciones);
  }
}
