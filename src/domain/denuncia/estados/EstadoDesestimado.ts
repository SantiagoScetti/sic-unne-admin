import { EstadoDenuncia } from './EstadoDenuncia';
import type { EstadoDenunciaNombre } from '../tipos';

// =============================================================================
// PATRÓN ESTADO — Estado terminal 'Desestimado'.
// Hereda el comportamiento por defecto: no admite más transiciones.
// =============================================================================

export class EstadoDesestimado extends EstadoDenuncia {
  get nombre(): EstadoDenunciaNombre {
    return 'Desestimado';
  }
}
