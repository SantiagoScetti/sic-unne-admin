// =============================================================================
// Tipos del dominio Usuario.
// Centraliza las definiciones de tipos para que tanto la entidad como el
// servicio de consulta y el repositorio hablen el mismo lenguaje.
// =============================================================================

export type RolUsuario = 'Administrador' | 'Estudiante' | 'Docente';

export type EstadoUsuario = 'Activo' | 'Suspendido' | 'Inactivo';

/** Forma de los datos crudos que llegan desde la base de datos. */
export interface UsuarioData {
  id_usuario: number;
  nombre: string;
  apellido: string;
  documento?: string | null;
  correo?: string | null;
  rol: RolUsuario;
  estado: EstadoUsuario;
  fecha_suspension_hasta?: string | null;
}

/** Proyección mínima usada al mostrar datos de emisor/receptor en denuncias. */
export interface UsuarioResumen {
  id_usuario: number;
  nombre: string;
  apellido: string;
  documento?: string | null;
}
