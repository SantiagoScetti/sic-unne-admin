import { EstadoDenuncia } from './EstadoDenuncia';
import type { EstadoDenunciaNombre } from '../tipos';

// =============================================================================
// PATRÓN ESTADO — Estado terminal 'Resuelto'.
// Hereda el comportamiento por defecto: cualquier intento de re-resolver o
// desestimar lanza DenunciaYaProcesadaError.
// =============================================================================

export class EstadoResuelto extends EstadoDenuncia {
  get nombre(): EstadoDenunciaNombre {
    return 'Resuelto';
  }
}
