import type { ProfesorData } from './tipos';

// =============================================================================
// Entidad de dominio: Profesor.
//
// Objeto de dominio que encapsula los datos y comportamientos básicos de un
// profesor del sistema. No accede a la base de datos: la persistencia vive
// en ProfesorRepositorio.
// =============================================================================

export class Profesor {
  readonly id_profesor: number;
  readonly nombre: string;
  readonly apellido: string;
  readonly documento: number;
  readonly correo: string | null;
  readonly estado: boolean;

  constructor(data: ProfesorData) {
    this.id_profesor = data.id_profesor;
    this.nombre      = data.nombre;
    this.apellido    = data.apellido;
    this.documento   = data.documento;
    this.correo      = data.correo ?? null;
    this.estado      = data.estado;
  }

  // ── Consultas ──────────────────────────────────────────────────────────────

  /** Nombre completo en formato "Apellido, Nombre". */
  get nombreCompleto(): string {
    return `${this.apellido}, ${this.nombre}`;
  }

  estaActivo(): boolean {
    return this.estado === true;
  }
}
