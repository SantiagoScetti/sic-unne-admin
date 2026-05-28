// =============================================================================
// Errores del dominio Comisión.
// =============================================================================

/** Se lanza cuando los datos de una comisión no cumplen las reglas de negocio. */
export class ComisionInvalidaError extends Error {
  readonly codigo = 'COMISION_INVALIDA';
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ComisionInvalidaError';
  }
}
