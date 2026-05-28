import type { AccionResolucion } from './AccionResolucion';
import type { AccionTomada } from '../tipos';
import { EnviarAviso } from './EnviarAviso';
import { SuspenderTemporalmente } from './SuspenderTemporalmente';
import { SuspenderIndefinidamente } from './SuspenderIndefinidamente';

// =============================================================================
// Selector de estrategia: dado el nombre de la acción, devuelve la estrategia
// concreta correspondiente (PATRÓN ESTRATEGIA).
// =============================================================================

export function seleccionarAccion(accion: AccionTomada): AccionResolucion {
  switch (accion) {
    case 'Enviar aviso':                return new EnviarAviso();
    case 'Suspender Temporalmente':     return new SuspenderTemporalmente();
    case 'Suspender Indefinidamente':   return new SuspenderIndefinidamente();
    default:                            throw new Error(`Acción de resolución desconocida: ${accion}`);
  }
}
