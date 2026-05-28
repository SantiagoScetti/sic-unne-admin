import { ComisionInvalidaError } from './errores';

// =============================================================================
// Entidad de dominio: Comisión.
//
// Objeto rico que encapsula sus reglas de negocio (validación) pero NO accede
// a la base de datos: la persistencia vive en ComisionRepositorio (separación
// de capas). Reemplaza la antigua clase Active Record src/domain/Comision.js.
// =============================================================================

export interface DatosComision {
  id_comision?: number;
  nombre: string;
  letraDesde: string;
  letraHasta: string;
  id_asignatura: number;
  estado?: boolean;
  profesoresIds?: number[];
}

export class Comision {
  id_comision?: number;
  nombre: string;
  letraDesde: string;
  letraHasta: string;
  id_asignatura: number;
  estado: boolean;
  profesoresIds: number[];

  constructor(datos: DatosComision) {
    this.id_comision = datos.id_comision;
    this.nombre = (datos.nombre ?? '').trim();
    this.letraDesde = (datos.letraDesde ?? '').trim().toUpperCase();
    this.letraHasta = (datos.letraHasta ?? '').trim().toUpperCase();
    this.id_asignatura = Number(datos.id_asignatura);
    this.estado = datos.estado ?? true;
    this.profesoresIds = datos.profesoresIds ?? [];
  }

  /**
   * Valida las reglas de negocio. Lanza ComisionInvalidaError si algo falla.
   * Refleja los CHECK constraints de la tabla comision:
   *   - nombre obligatorio (varchar 50)
   *   - letras: exactamente 1 carácter alfabético
   *   - ck_comision_rangoletras: ascii(letra_desde) < ascii(letra_hasta) [ESTRICTO]
   */
  validar(): void {
    if (!this.nombre) {
      throw new ComisionInvalidaError('El nombre de la comisión es obligatorio.');
    }
    if (this.nombre.length > 50) {
      throw new ComisionInvalidaError('El nombre no puede superar los 50 caracteres.');
    }

    const reLetra = /^[A-Z]$/;
    if (!reLetra.test(this.letraDesde) || !reLetra.test(this.letraHasta)) {
      throw new ComisionInvalidaError("Las letras 'Desde' y 'Hasta' deben ser un único carácter (A-Z).");
    }
    if (this.letraDesde.charCodeAt(0) >= this.letraHasta.charCodeAt(0)) {
      throw new ComisionInvalidaError("La letra 'Desde' debe ser anterior a la letra 'Hasta'.");
    }

    if (!this.id_asignatura || Number.isNaN(this.id_asignatura)) {
      throw new ComisionInvalidaError('Debe indicarse una asignatura válida.');
    }
  }

  /** Serializa los campos persistibles a la forma de la tabla comision. */
  aFilaPersistible(): {
    nombre: string;
    letra_desde: string;
    letra_hasta: string;
    id_asignatura: number;
    estado: boolean;
  } {
    return {
      nombre: this.nombre,
      letra_desde: this.letraDesde,
      letra_hasta: this.letraHasta,
      id_asignatura: this.id_asignatura,
      estado: this.estado,
    };
  }
}
