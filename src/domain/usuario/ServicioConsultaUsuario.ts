import { UsuarioRepositorio } from '../../infrastructure/repositorios/UsuarioRepositorio';
import type { Usuario } from './Usuario';

// =============================================================================
// ServicioConsultaUsuario — Servicio de Dominio (Caso de Uso C-01).
//
// Encapsula las consultas de lectura sobre la entidad Usuario que son
// necesarias para otros contextos (por ej., Denuncia necesita mostrar los
// datos del emisor y del receptor). No realiza mutaciones; las escrituras
// (suspender, etc.) siguen siendo responsabilidad de ServicioResolucionDenuncia
// a través del UsuarioRepositorio.
//
// Trazabilidad con el Diagrama de Secuencia C-01:
//   paso 5  → obtenerPorId(receptor_id)   (listado de denuncias)
//   paso 13 → obtenerPorId(emisor_id)     (detalle: datos del emisor)
//   paso 16 → obtenerPorId(receptor_id)   (detalle: datos del receptor)
//   paso 25 → obtenerAdminSesion()       (resolución: id del admin)
// =============================================================================

export class UsuarioNoEncontradoError extends Error {
  readonly codigo = 'USUARIO_NO_ENCONTRADO';
  constructor(id: number) {
    super(`No existe el usuario con id #${id}.`);
    this.name = 'UsuarioNoEncontradoError';
  }
}

export class ServicioConsultaUsuario {
  constructor(
    private readonly usuarioRepo: UsuarioRepositorio = new UsuarioRepositorio(),
  ) {}

  /**
   * obtenerPorId — C-01, pasos 5 / 13 / 16.
   *
   * Devuelve la entidad Usuario correspondiente al id recibido.
   * Lanza UsuarioNoEncontradoError si no existe ningún usuario con ese id.
   *
   * @param id  id_usuario de la tabla `usuario`
   */
  async obtenerPorId(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepo.obtenerPorId(id);
    if (!usuario) throw new UsuarioNoEncontradoError(id);
    return usuario;
  }

  /**
   * obtenerAdminSesion — C-01, paso 25.
   *
   * Devuelve el id del administrador de la sesión activa.
   * Se usa cuando el cliente no envía admin_id en la resolución de una
   * denuncia. (TODO: reemplazar por el admin de la sesión real.)
   */
  async obtenerAdminSesion(): Promise<number> {
    const adminId = await this.usuarioRepo.obtenerAdminPorDefecto();
    if (!adminId) throw new Error('No hay administradores registrados en el sistema.');
    return adminId;
  }
}
