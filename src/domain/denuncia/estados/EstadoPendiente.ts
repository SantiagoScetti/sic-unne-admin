import { EstadoDenuncia } from './EstadoDenuncia';
import { EstadoResuelto } from './EstadoResuelto';
import { EstadoDesestimado } from './EstadoDesestimado';
import type { Denuncia } from '../Denuncia';
import type { AccionTomada, EstadoDenunciaNombre } from '../tipos';

// =============================================================================
// PATRÓN ESTADO — Estado 'Pendiente' (único estado NO terminal).
// Es el único que permite las transiciones a 'Resuelto' y 'Desestimado'.
// =============================================================================

export class EstadoPendiente extends EstadoDenuncia {
  get nombre(): EstadoDenunciaNombre {
    return 'Pendiente';
  }

  override resolver(denuncia: Denuncia, accion: AccionTomada): void {
    denuncia.registrarAccion(accion);
    denuncia.transicionarA(new EstadoResuelto());
  }

  override desestimar(denuncia: Denuncia): void {
    denuncia.transicionarA(new EstadoDesestimado());
  }
}
