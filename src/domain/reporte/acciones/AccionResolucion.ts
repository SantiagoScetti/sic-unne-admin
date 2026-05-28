import type { Reporte } from '../Reporte';
import type { AccionTomada } from '../tipos';
import type { UsuarioRepositorio } from '../../../infrastructure/repositorios/UsuarioRepositorio';
import type { TipoNotificacion } from '../../../infrastructure/repositorios/NotificacionRepositorio';

// =============================================================================
// PATRÓN ESTRATEGIA (Strategy) — Contrato común.
//
// Cada acción administrativa que puede tomarse al resolver un reporte
// (advertir, suspender temporal, suspender indefinido) es una estrategia
// intercambiable que implementa esta interfaz.
// =============================================================================

/** Datos que necesita una estrategia para ejecutar su efecto. */
export interface ContextoAccion {
  reporte: Reporte;
  fechaHasta?: string | null;
  usuarioRepo: UsuarioRepositorio;
}

/** Lo que devuelve una estrategia para que el resto del flujo notifique/audite. */
export interface ResultadoAccion {
  tipoNotificacionReceptor: TipoNotificacion;
  mensajeReceptor: string;
  detalleAuditoria: Record<string, unknown>;
}

export interface AccionResolucion {
  readonly nombre: AccionTomada;
  aplicar(ctx: ContextoAccion): Promise<ResultadoAccion>;
}
