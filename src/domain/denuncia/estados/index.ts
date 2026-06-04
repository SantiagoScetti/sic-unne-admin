import { EstadoDenuncia } from './EstadoDenuncia';
import { EstadoPendiente } from './EstadoPendiente';
import { EstadoResuelto } from './EstadoResuelto';
import { EstadoDesestimado } from './EstadoDesestimado';
import type { EstadoDenunciaNombre } from '../tipos';

// =============================================================================
// Fábrica simple de estados: traduce el string persistido en la DB al objeto
// Estado correspondiente (reconstrucción del patrón Estado desde la base).
// =============================================================================

export function crearEstado(nombre: EstadoDenunciaNombre): EstadoDenuncia {
  switch (nombre) {
    case 'Pendiente':   return new EstadoPendiente();
    case 'Resuelto':    return new EstadoResuelto();
    case 'Desestimado': return new EstadoDesestimado();
    default:            throw new Error(`Estado de denuncia desconocido: ${nombre}`);
  }
}

export { EstadoDenuncia, EstadoPendiente, EstadoResuelto, EstadoDesestimado };
