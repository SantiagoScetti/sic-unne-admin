import type { Reporte } from '../Reporte';
import type { AccionTomada, EstadoReporteNombre } from '../tipos';
import { ReporteYaProcesadoError } from '../errores';

// =============================================================================
// PATRÓN ESTADO (State) — Clase base abstracta.
//
// Cada estado concreto del ciclo de vida del reporte decide qué transiciones
// son válidas. Por defecto, todas las transiciones están prohibidas (un estado
// terminal no permite nada); los estados que sí permiten una transición la
// sobrescriben (ver EstadoPendiente).
// =============================================================================

export abstract class EstadoReporte {
  abstract get nombre(): EstadoReporteNombre;

  /** Transición a 'Resuelto'. Por defecto inválida (reporte ya procesado). */
  resolver(_reporte: Reporte, _accion: AccionTomada): void {
    throw new ReporteYaProcesadoError(this.nombre);
  }

  /** Transición a 'Desestimado'. Por defecto inválida (reporte ya procesado). */
  desestimar(_reporte: Reporte): void {
    throw new ReporteYaProcesadoError(this.nombre);
  }
}
