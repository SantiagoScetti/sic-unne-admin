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

    const supabase = getSupabaseServer();
    const filas = notificaciones.map((n) => ({
      id_usuario: n.id_usuario,
      tipo: n.tipo,
      mensaje: n.mensaje,
      leido: false,
      fecha: new Date().toISOString(),
    }));

    const { error } = await supabase.from('notificacion').insert(filas);
    if (error) throw new Error(error.message);
  }
}
