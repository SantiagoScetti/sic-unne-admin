import { DenunciaRepositorio } from '../../infrastructure/repositorios/DenunciaRepositorio';
import { UsuarioRepositorio } from '../../infrastructure/repositorios/UsuarioRepositorio';
import type { Denuncia } from './Denuncia';
import type { AccionTomada } from './tipos';

// =============================================================================
// ServicioResolucionDenuncia — Servicio de Aplicación / ORQUESTADOR (Caso de Uso C-01).
//
// Es el orquestador del caso de uso: NO hace el trabajo, lo DELEGA paso a paso.
// Cada línea de resolver()/desestimar() se corresponde 1:1 con un mensaje del
// Diagrama de Secuencia:
//
//   denuncia = denunciaRepo.obtenerPorId(id)   → carga la entidad
//   denuncia.resolver(accion)                  → la entidad valida la transición
//                                              delegando en su objeto-estado
//                                              (PATRÓN ESTADO, en estados/).
//   denunciaRepo.guardar(denuncia)             → persiste el nuevo estado
//   usuarioRepo.suspender(...)                 → efecto de la acción (si corresponde)
//
// El único patrón de diseño implementado es ESTADO (src/domain/denuncia/estados/);
// se documenta y se marca con un recuadro en el Diagrama de Clases (UML), no acá.
// =============================================================================

export class DenunciaNoEncontradaError extends Error {
  readonly codigo = 'DENUNCIA_NO_ENCONTRADA';
  constructor(id: number) {
    super(`No existe la denuncia #${id}.`);
    this.name = 'DenunciaNoEncontradaError';
  }
}

export interface ParamsResolver {
  id_denuncia: number;
  accion: AccionTomada;
  fechaHasta?: string | null;
  observaciones?: string;
  admin_id?: number | null;
}

export interface ParamsDesestimar {
  id_denuncia: number;
  observaciones?: string;
  admin_id?: number | null;
}

export class ServicioResolucionDenuncia {
  constructor(
    private readonly denunciaRepo: DenunciaRepositorio = new DenunciaRepositorio(),
    private readonly usuarioRepo: UsuarioRepositorio = new UsuarioRepositorio(),
  ) {}

  /** Resuelve una denuncia aplicando una acción administrativa. */
  async resolver(params: ParamsResolver): Promise<Denuncia> {
    const denuncia = await this.cargar(params.id_denuncia);
    const adminId = await this.resolverAdminId(params.admin_id);

    denuncia.resolver(params.accion);
    denuncia.asignarAdmin(adminId);
    await this.denunciaRepo.guardar(denuncia);

    await this.aplicarEfecto(denuncia, params.accion, params.fechaHasta ?? null);

    return denuncia;
  }

  /** Desestima una denuncia (sin sanción). */
  async desestimar(params: ParamsDesestimar): Promise<Denuncia> {
    const denuncia = await this.cargar(params.id_denuncia);
    const adminId = await this.resolverAdminId(params.admin_id);

    denuncia.desestimar();
    denuncia.asignarAdmin(adminId);
    await this.denunciaRepo.guardar(denuncia);

    return denuncia;
  }

  private async aplicarEfecto(
    denuncia: Denuncia,
    accion: AccionTomada,
    fechaHasta: string | null,
  ): Promise<void> {
    switch (accion) {
      case 'Suspender Temporalmente': {
        if (!fechaHasta) {
          throw new Error("La suspensión temporal requiere el parámetro 'fechaHasta'.");
        }
        await this.usuarioRepo.suspender(denuncia.receptor_id, fechaHasta);
        break;
      }
      case 'Suspender Indefinidamente': {
        await this.usuarioRepo.suspender(denuncia.receptor_id, null);
        break;
      }
      case 'Enviar aviso': {
        break;
      }
      default:
        throw new Error(`Acción de resolución desconocida: ${accion}`);
    }
  }

  private async cargar(id: number): Promise<Denuncia> {
    const denuncia = await this.denunciaRepo.obtenerPorId(id);
    if (!denuncia) throw new DenunciaNoEncontradaError(id);
    return denuncia;
  }

  private async resolverAdminId(adminId?: number | null): Promise<number> {
    if (adminId) return adminId;
    const porDefecto = await this.usuarioRepo.obtenerAdminPorDefecto();
    if (!porDefecto) {
      throw new Error('No hay administradores registrados.');
    }
    return porDefecto;
  }
}
