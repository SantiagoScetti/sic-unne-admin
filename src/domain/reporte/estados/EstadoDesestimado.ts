import { EstadoReporte } from './EstadoReporte';
import type { EstadoReporteNombre } from '../tipos';

// =============================================================================
// PATRÓN ESTADO — Estado terminal 'Desestimado'.
// Hereda el comportamiento por defecto: no admite más transiciones.
// =============================================================================

export class EstadoDesestimado extends EstadoReporte {
  get nombre(): EstadoReporteNombre {
    return 'Desestimado';
  }
}
