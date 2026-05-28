import type { AccionResolucion, ContextoAccion, ResultadoAccion } from './AccionResolucion';

// =============================================================================
// PATRÓN ESTRATEGIA — Acción 'Suspender Indefinidamente'.
// Suspende al usuario receptor sin fecha de fin (fecha_suspension_hasta = null).
// =============================================================================

export class SuspenderIndefinidamente implements AccionResolucion {
  readonly nombre = 'Suspender Indefinidamente' as const;

  async aplicar(ctx: ContextoAccion): Promise<ResultadoAccion> {
    await ctx.usuarioRepo.suspender(ctx.reporte.receptor_id, null);

    return {
      tipoNotificacionReceptor: 'Bloqueo',
      mensajeReceptor:
        'Tu cuenta fue suspendida de forma indefinida como resultado de un reporte. ' +
        'Contactá a la administración para más información.',
      detalleAuditoria: { efecto: 'suspension_indefinida' },
    };
  }
}
