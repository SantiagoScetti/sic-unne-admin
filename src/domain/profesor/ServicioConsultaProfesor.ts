import { ProfesorRepositorio } from '../../infrastructure/repositorios/ProfesorRepositorio';
import type { Profesor } from './Profesor';

// =============================================================================
// ServicioConsultaProfesor — Servicio de Dominio (Caso de Uso C-02).
//
// Encapsula las consultas de lectura sobre la entidad Profesor que son
// necesarias para otros contextos. En particular, el listado de comisiones
// necesita mostrar los nombres de los profesores vinculados a cada comisión;
// esos datos se obtienen aquí en lugar de usar un JOIN directo de Supabase.
//
// Trazabilidad con el Diagrama de Secuencia C-02:
//   obtenerPorId(id_profesor) → obtenerPorId en el repositorio
//   listarPorComision(id_comision) → listarIdsPorComision + obtenerPorId por cada uno
// =============================================================================

export class ProfesorNoEncontradoError extends Error {
  readonly codigo = 'PROFESOR_NO_ENCONTRADO';
  constructor(id: number) {
    super(`No existe el profesor con id #${id}.`);
    this.name = 'ProfesorNoEncontradoError';
  }
}

export class ServicioConsultaProfesor {
  constructor(
    private readonly profesorRepo: ProfesorRepositorio = new ProfesorRepositorio(),
  ) {}

  /**
   * obtenerPorId — C-02, paso de enriquecimiento del listado.
   *
   * Devuelve la entidad Profesor correspondiente al id recibido.
   * Lanza ProfesorNoEncontradoError si no existe ningún profesor con ese id.
   *
   * @param id  id_profesor de la tabla `profesor`
   */
  async obtenerPorId(id: number): Promise<Profesor> {
    const profesor = await this.profesorRepo.obtenerPorId(id);
    if (!profesor) throw new ProfesorNoEncontradoError(id);
    return profesor;
  }

  /**
   * listarPorComision — C-02, loop de enriquecimiento.
   *
   * Devuelve todos los profesores vinculados a una comisión dada.
   * Primero obtiene los ids desde `comision_profesor`, luego resuelve
   * cada uno via obtenerPorId en paralelo.
   *
   * @param idComision  id de la comisión cuyos profesores se quieren obtener
   */
  async listarPorComision(idComision: number): Promise<Profesor[]> {
    const ids = await this.profesorRepo.listarIdsPorComision(idComision);
    const profesores = await Promise.all(
      ids.map(async (id) => {
        try {
          return await this.obtenerPorId(id);
        } catch {
          return null;
        }
      })
    );
    return profesores.filter((p): p is Profesor => p !== null);
  }
}
