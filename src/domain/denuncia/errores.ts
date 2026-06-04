// =============================================================================
// Errores del dominio Denuncia.
// =============================================================================

/**
 * Se lanza cuando se intenta resolver/desestimar una denuncia que ya no está
 * 'Pendiente'. El código 'CONFLIC_ALREADY_PROCESSED' es el que la UI ya conoce
 * para mostrar el aviso de "denuncia ya gestionada" (mapea a HTTP 409).
 */
export class DenunciaYaProcesadaError extends Error {
  readonly codigo = 'CONFLIC_ALREADY_PROCESSED';
  readonly estadoActual: string;

  constructor(estadoActual: string) {
    super(`La denuncia ya fue procesada (estado actual: ${estadoActual}).`);
    this.name = 'DenunciaYaProcesadaError';
    this.estadoActual = estadoActual;
  }
}
