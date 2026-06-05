// =============================================================================
// Tipos del dominio Profesor.
// =============================================================================

export interface ProfesorData {
  id_profesor: number;
  nombre: string;
  apellido: string;
  documento: number;
  correo?: string | null;
  estado: boolean;
}

/** Proyección mínima usada al enriquecer el listado de comisiones. */
export interface ProfesorResumen {
  id_profesor: number;
  nombre: string;
  apellido: string;
}
