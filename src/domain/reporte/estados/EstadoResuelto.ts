import { EstadoReporte } from './EstadoReporte';
import type { EstadoReporteNombre } from '../tipos';

// =============================================================================
// PATRÓN ESTADO — Estado terminal 'Resuelto'.
// Hereda el comportamiento por defecto: cualquier intento de re-resolver o
// desestimar lanza ReporteYaProcesadoError.
// =============================================================================

export class EstadoResuelto extends EstadoReporte {
  get nombre(): EstadoReporteNombre {
    return 'Resuelto';
  }
}
