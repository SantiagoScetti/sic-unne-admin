import type { AccionResolucion, ContextoAccion, ResultadoAccion } from './AccionResolucion';

// =============================================================================
// PATRÓN ESTRATEGIA — Acción 'Enviar aviso'.
// No modifica el estado del usuario; solo deja constancia y lo notifica.
// =============================================================================

export class EnviarAviso implements AccionResolucion {
  readonly nombre = 'Enviar aviso' as const;

  async aplicar(_ctx: ContextoAccion): Promise<ResultadoAccion> {
    return {
      tipoNotificacionReceptor: 'Aviso',
      mensajeReceptor:
        'Un administrador revisó un reporte en tu contra y te envió un aviso formal. ' +
        'Tené en cuenta las normas de convivencia de la plataforma.',
      detalleAuditoria: { efecto: 'aviso_enviado' },
    };
  }
}
