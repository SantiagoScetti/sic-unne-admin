import { EstadoReporte } from './EstadoReporte';
import { EstadoResuelto } from './EstadoResuelto';
import { EstadoDesestimado } from './EstadoDesestimado';
import type { Reporte } from '../Reporte';
import type { AccionTomada, EstadoReporteNombre } from '../tipos';

// =============================================================================
// PATRÓN ESTADO — Estado 'Pendiente' (único estado NO terminal).
// Es el único que permite las transiciones a 'Resuelto' y 'Desestimado'.
// =============================================================================

export class EstadoPendiente extends EstadoReporte {
  get nombre(): EstadoReporteNombre {
    return 'Pendiente';
  }

  override resolver(reporte: Reporte, accion: AccionTomada): void {
    reporte.registrarAccion(accion);
    reporte.transicionarA(new EstadoResuelto());
  }

  override desestimar(reporte: Reporte): void {
    reporte.transicionarA(new EstadoDesestimado());
  }
}
