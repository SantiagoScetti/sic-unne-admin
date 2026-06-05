import type { UsuarioData, RolUsuario, EstadoUsuario } from './tipos';

// =============================================================================
// Entidad de dominio: Usuario.
//
// Objeto de dominio que encapsula los datos y comportamientos básicos de un
// usuario del sistema. No accede a la base de datos: la persistencia vive
// en UsuarioRepositorio.
// =============================================================================

export class Usuario {
  readonly id_usuario: number;
  readonly nombre: string;
  readonly apellido: string;
  readonly documento: string | null;
  readonly correo: string | null;
  readonly rol: RolUsuario;
  readonly estado: EstadoUsuario;
  readonly fechaSuspensionHasta: string | null;

  constructor(data: UsuarioData) {
    this.id_usuario          = data.id_usuario;
    this.nombre              = data.nombre;
    this.apellido            = data.apellido;
    this.documento           = data.documento ?? null;
    this.correo              = data.correo ?? null;
    this.rol                 = data.rol;
    this.estado              = data.estado;
    this.fechaSuspensionHasta = data.fecha_suspension_hasta ?? null;
  }

  // ── Consultas ──────────────────────────────────────────────────────────────

  /** Nombre completo en formato "Apellido, Nombre". */
  get nombreCompleto(): string {
    return `${this.apellido}, ${this.nombre}`;
  }

  estaActivo(): boolean {
    return this.estado === 'Activo';
  }

  estaSuspendido(): boolean {
    return this.estado === 'Suspendido';
  }

  esAdministrador(): boolean {
    return this.rol === 'Administrador';
  }
}
