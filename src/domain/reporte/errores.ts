// =============================================================================
// Errores del dominio Reporte.
// =============================================================================

/**
 * Se lanza cuando se intenta resolver/desestimar un reporte que ya no está
 * 'Pendiente'. El código 'CONFLIC_ALREADY_PROCESSED' es el que la UI ya conoce
 * para mostrar el aviso de "reporte ya gestionado" (mapea a HTTP 409).
 */
export class ReporteYaProcesadoError extends Error {
  readonly codigo = 'CONFLIC_ALREADY_PROCESSED';
  readonly estadoActual: string;

  constructor(estadoActual: string) {
    super(`El reporte ya fue procesado (estado actual: ${estadoActual}).`);
    this.name = 'ReporteYaProcesadoError';
    this.estadoActual = estadoActual;
  }
}
