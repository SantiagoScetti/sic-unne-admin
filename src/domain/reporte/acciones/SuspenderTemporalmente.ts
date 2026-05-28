import type { AccionResolucion, ContextoAccion, ResultadoAccion } from './AccionResolucion';

// =============================================================================
// PATRÓN ESTRATEGIA — Acción 'Suspender Temporalmente'.
// Suspende al usuario receptor hasta una fecha determinada.
// =============================================================================

export class SuspenderTemporalmente implements AccionResolucion {
  readonly nombre = 'Suspender Temporalmente' as const;

  async aplicar(ctx: ContextoAccion): Promise<ResultadoAccion> {
    if (!ctx.fechaHasta) {
      throw new Error("La suspensión temporal requiere el parámetro 'fechaHasta'.");
    }

    await ctx.usuarioRepo.suspender(ctx.reporte.receptor_id, ctx.fechaHasta);

    const fechaLegible = new Date(ctx.fechaHasta).toLocaleDateString('es-AR');
    return {
      tipoNotificacionReceptor: 'Bloqueo',
      mensajeReceptor:
        `Tu cuenta fue suspendida temporalmente hasta el ${fechaLegible} como ` +
        'resultado de un reporte.',
      detalleAuditoria: { efecto: 'suspension_temporal', fechaHasta: ctx.fechaHasta },
    };
  }
}
