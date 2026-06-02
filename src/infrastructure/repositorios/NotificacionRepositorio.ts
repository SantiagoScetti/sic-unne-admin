import { getSupabaseServer } from '../supabaseServer';

// =============================================================================
// NotificacionRepositorio — Capa de persistencia.
// Los valores de 'tipo' deben respetar el CHECK de la tabla notificacion:
//   ('Propuesta','Reporte','Comprobante','Aviso','Aceptacion','Rechazo','Sistema','Bloqueo')
// =============================================================================

export type TipoNotificacion =
  | 'Propuesta'
  | 'Reporte'
  | 'Comprobante'
  | 'Aviso'
  | 'Aceptacion'
  | 'Rechazo'
  | 'Sistema'
  | 'Bloqueo';

export interface NuevaNotificacion {
  id_usuario: number;
  tipo: TipoNotificacion;
  mensaje: string;
}

export class NotificacionRepositorio {
  async crearVarias(notificaciones: NuevaNotificacion[]): Promise<void> {
    if (notificaciones.length === 0) return;

    // Simplificación de base de datos: La tabla 'notificacion' fue eliminada del backend
    // por simplificación del alcance. Se simula para mantener la trazabilidad OO.
    console.log(
      `[Notificación simulada] Creando ${notificaciones.length} notificaciones:`,
      notificaciones.map((n) => `Usuario #${n.id_usuario} (${n.tipo}): "${n.mensaje}"`)
    );
  }
}
