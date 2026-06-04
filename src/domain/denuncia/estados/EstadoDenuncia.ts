import type { Denuncia } from '../Denuncia';
import type { AccionTomada, EstadoDenunciaNombre } from '../tipos';
import { DenunciaYaProcesadaError } from '../errores';

// =============================================================================
// PATRÓN ESTADO (State) — Clase base abstracta.
//
// Cada estado concreto del ciclo de vida de la denuncia decide qué transiciones
// son válidas. Por defecto, todas las transiciones están prohibidas (un estado
// terminal no permite nada); los estados que sí permiten una transición la
// sobrescriben (ver EstadoPendiente).
// =============================================================================

export abstract class EstadoDenuncia {
  abstract get nombre(): EstadoDenunciaNombre;

  /** Transición a 'Resuelto'. Por defecto inválida (denuncia ya procesada). */
  resolver(_denuncia: Denuncia, _accion: AccionTomada): void {
    throw new DenunciaYaProcesadaError(this.nombre);
  }

  /** Transición a 'Desestimado'. Por defecto inválida (denuncia ya procesada). */
  desestimar(_denuncia: Denuncia): void {
    throw new DenunciaYaProcesadaError(this.nombre);
  }
}
