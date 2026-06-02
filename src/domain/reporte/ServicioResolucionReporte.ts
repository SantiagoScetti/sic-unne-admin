import { ReporteRepositorio } from '../../infrastructure/repositorios/ReporteRepositorio';
import { UsuarioRepositorio } from '../../infrastructure/repositorios/UsuarioRepositorio';
import type { Reporte } from './Reporte';
import type { AccionTomada } from './tipos';

// =============================================================================
// ServicioResolucionReporte — Servicio de Aplicación / ORQUESTADOR (Caso de Uso C-01).
//
// Es el orquestador del caso de uso: NO hace el trabajo, lo DELEGA paso a paso.
// Cada línea de resolver()/desestimar() se corresponde 1:1 con un mensaje del
// Diagrama de Secuencia:
//
//   reporte = reporteRepo.obtenerPorId(id)   → carga la entidad
//   reporte.resolver(accion)                 → la entidad valida la transición
//                                              delegando en su objeto-estado
//                                              (PATRÓN ESTADO, en estados/).
//   reporteRepo.guardar(reporte)             → persiste el nuevo estado
//   usuarioRepo.suspender(...)               → efecto de la acción (si corresponde)
//
// El único patrón de diseño implementado es ESTADO (src/domain/reporte/estados/);
// se documenta y se marca con un recuadro en el Diagrama de Clases (UML), no acá.
// =============================================================================

export class ReporteNoEncontradoError extends Error {
  readonly codigo = 'REPORTE_NO_ENCONTRADO';
  constructor(id: number) {
    super(`No existe el reporte #${id}.`);
    this.name = 'ReporteNoEncontradoError';
  }
}

export interface ParamsResolver {
  id_reporte: number;
  accion: AccionTomada;
  fechaHasta?: string | null;
  observaciones?: string;
  admin_id?: number | null;
}

export interface ParamsDesestimar {
  id_reporte: number;
  observaciones?: string;
  admin_id?: number | null;
}

export class ServicioResolucionReporte {
  // Inyección de dependencias: los repositorios se reciben por constructor (con
  // defaults de producción). Esto permite testear el servicio sin base de datos.
  constructor(
    private readonly reporteRepo: ReporteRepositorio = new ReporteRepositorio(),
    private readonly usuarioRepo: UsuarioRepositorio = new UsuarioRepositorio(),
  ) {}

  /** Resuelve un reporte aplicando una acción administrativa. */
  async resolver(params: ParamsResolver): Promise<Reporte> {
    const reporte = await this.cargar(params.id_reporte);
    const adminId = await this.resolverAdminId(params.admin_id);

    // PATRÓN ESTADO — lanza ReporteYaProcesadoError si no está 'Pendiente'.
    reporte.resolver(params.accion);
    reporte.asignarAdmin(adminId);
    await this.reporteRepo.guardar(reporte);

    // Efecto concreto de la acción sobre el usuario reportado.
    await this.aplicarEfecto(reporte, params.accion, params.fechaHasta ?? null);

    return reporte;
  }

  /** Desestima un reporte (sin sanción). */
  async desestimar(params: ParamsDesestimar): Promise<Reporte> {
    const reporte = await this.cargar(params.id_reporte);
    const adminId = await this.resolverAdminId(params.admin_id);

    // PATRÓN ESTADO
    reporte.desestimar();
    reporte.asignarAdmin(adminId);
    await this.reporteRepo.guardar(reporte);

    return reporte;
  }

  // ── Efecto de la acción (antes: patrón Estrategia) ──────────────────────────
  private async aplicarEfecto(
    reporte: Reporte,
    accion: AccionTomada,
    fechaHasta: string | null,
  ): Promise<void> {
    switch (accion) {
      case 'Suspender Temporalmente': {
        if (!fechaHasta) {
          throw new Error("La suspensión temporal requiere el parámetro 'fechaHasta'.");
        }
        await this.usuarioRepo.suspender(reporte.receptor_id, fechaHasta);
        break;
      }
      case 'Suspender Indefinidamente': {
        await this.usuarioRepo.suspender(reporte.receptor_id, null);
        break;
      }
      case 'Enviar aviso': {
        // Enviar aviso ya no requiere notificaciones ni auditoría en el sistema simplificado
        break;
      }
      default:
        throw new Error(`Acción de resolución desconocida: ${accion}`);
    }
  }

  private async cargar(id: number): Promise<Reporte> {
    const reporte = await this.reporteRepo.obtenerPorId(id);
    if (!reporte) throw new ReporteNoEncontradoError(id);
    return reporte;
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
