import { EstadoReporte } from './EstadoReporte';
import { EstadoPendiente } from './EstadoPendiente';
import { EstadoResuelto } from './EstadoResuelto';
import { EstadoDesestimado } from './EstadoDesestimado';
import type { EstadoReporteNombre } from '../tipos';

// =============================================================================
// Fábrica simple de estados: traduce el string persistido en la DB al objeto
// Estado correspondiente (reconstrucción del patrón Estado desde la base).
// =============================================================================

export function crearEstado(nombre: EstadoReporteNombre): EstadoReporte {
  switch (nombre) {
    case 'Pendiente':   return new EstadoPendiente();
    case 'Resuelto':    return new EstadoResuelto();
    case 'Desestimado': return new EstadoDesestimado();
    default:            throw new Error(`Estado de reporte desconocido: ${nombre}`);
  }
}

export { EstadoReporte, EstadoPendiente, EstadoResuelto, EstadoDesestimado };
