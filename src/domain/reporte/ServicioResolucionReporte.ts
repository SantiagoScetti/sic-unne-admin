import { ReporteRepositorio } from '../../infrastructure/repositorios/ReporteRepositorio';
import { UsuarioRepositorio } from '../../infrastructure/repositorios/UsuarioRepositorio';
import {
  NotificacionRepositorio,
  type NuevaNotificacion,
  type TipoNotificacion,
} from '../../infrastructure/repositorios/NotificacionRepositorio';
import { AuditoriaRepositorio } from '../../infrastructure/repositorios/AuditoriaRepositorio';
import type { Reporte } from './Reporte';
import type { AccionTomada } from './tipos';

// =============================================================================
// ServicioResolucionReporte — Servicio de Aplicación / ORQUESTADOR (Caso de Uso C-01).
//
// Es el orquestador del caso de uso: NO hace el trabajo, lo DELEGA paso a paso.
// Cada línea de resolver()/desestimar() se corresponde 1:1 con un mensaje del
// Diagrama de Secuencia (ver docs/puml/actualizacion_claude/trazabilidaddeDiagramas.md):
//
//   reporte = reporteRepo.obtenerPorId(id)   → carga la entidad
//   reporte.resolver(accion)                 → la entidad valida la transición
//                                              delegando en su objeto-estado
//                                              (PATRÓN ESTADO, en estados/).
//   reporteRepo.guardar(reporte)             → persiste el nuevo estado
//   usuarioRepo.suspender(...)               → efecto de la acción (si corresponde)
//   notificacionRepo.crearVarias(...)        → notifica al receptor y al emisor
//   auditoriaRepo.registrar(...)             → deja traza administrativa
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

/** Textos de notificación/auditoría que produce el efecto de una acción. */
interface EfectoAccion {
  tipoNotificacionReceptor: TipoNotificacion;
  mensajeReceptor: string;
  detalleAuditoria: Record<string, unknown>;
}

const MENSAJE_EMISOR =
  'El reporte que realizaste fue revisado por un administrador. ' +
  'Gracias por colaborar con la comunidad.';

export class ServicioResolucionReporte {
  // Inyección de dependencias: los repositorios se reciben por constructor (con
  // defaults de producción). Esto permite testear el servicio sin base de datos.
  constructor(
    private readonly reporteRepo: ReporteRepositorio = new ReporteRepositorio(),
    private readonly usuarioRepo: UsuarioRepositorio = new UsuarioRepositorio(),
    private readonly notificacionRepo: NotificacionRepositorio = new NotificacionRepositorio(),
    private readonly auditoriaRepo: AuditoriaRepositorio = new AuditoriaRepositorio(),
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
    const efecto = await this.aplicarEfecto(reporte, params.accion, params.fechaHasta ?? null);

    // Notificar (receptor + emisor) y auditar.
    await this.notificar(reporte, efecto.tipoNotificacionReceptor, efecto.mensajeReceptor);
    await this.auditar(reporte, params.accion, adminId, params.observaciones ?? '', efecto.detalleAuditoria);

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

    // Desestimar no aplica sanción: solo se notifica y se audita.
    await this.notificar(
      reporte,
      'Reporte',
      'Un administrador revisó el reporte y decidió desestimarlo. No se aplicaron sanciones.',
    );
    await this.auditar(reporte, 'Desestimar reporte', adminId, params.observaciones ?? '', {
      efecto: 'reporte_desestimado',
    });

    return reporte;
  }

  // ── Efecto de la acción (antes: patrón Estrategia) ──────────────────────────
  private async aplicarEfecto(
    reporte: Reporte,
    accion: AccionTomada,
    fechaHasta: string | null,
  ): Promise<EfectoAccion> {
    switch (accion) {
      case 'Suspender Temporalmente': {
        if (!fechaHasta) {
          throw new Error("La suspensión temporal requiere el parámetro 'fechaHasta'.");
        }
        await this.usuarioRepo.suspender(reporte.receptor_id, fechaHasta);
        const fechaLegible = new Date(fechaHasta).toLocaleDateString('es-AR');
        return {
          tipoNotificacionReceptor: 'Bloqueo',
          mensajeReceptor:
            `Tu cuenta fue suspendida temporalmente hasta el ${fechaLegible} como ` +
            'resultado de un reporte.',
          detalleAuditoria: { efecto: 'suspension_temporal', fechaHasta },
        };
      }
      case 'Suspender Indefinidamente': {
        await this.usuarioRepo.suspender(reporte.receptor_id, null);
        return {
          tipoNotificacionReceptor: 'Bloqueo',
          mensajeReceptor:
            'Tu cuenta fue suspendida de forma indefinida como resultado de un reporte. ' +
            'Contactá a la administración para más información.',
          detalleAuditoria: { efecto: 'suspension_indefinida' },
        };
      }
      case 'Enviar aviso': {
        return {
          tipoNotificacionReceptor: 'Aviso',
          mensajeReceptor:
            'Un administrador revisó un reporte en tu contra y te envió un aviso formal. ' +
            'Tené en cuenta las normas de convivencia de la plataforma.',
          detalleAuditoria: { efecto: 'aviso_enviado' },
        };
      }
      default:
        throw new Error(`Acción de resolución desconocida: ${accion}`);
    }
  }

  // ── Notificación (antes: Observador / NotificarUsuariosListener) ────────────
  private async notificar(
    reporte: Reporte,
    tipoReceptor: TipoNotificacion,
    mensajeReceptor: string,
  ): Promise<void> {
    const notificaciones: NuevaNotificacion[] = [
      { id_usuario: reporte.receptor_id, tipo: tipoReceptor, mensaje: mensajeReceptor },
    ];

    // Emisor: solo si no es el Sistema y es distinto del receptor.
    if (!reporte.emisorEsSistema() && reporte.emisor_id !== reporte.receptor_id) {
      notificaciones.push({
        id_usuario: reporte.emisor_id as number,
        tipo: 'Reporte',
        mensaje: MENSAJE_EMISOR,
      });
    }

    await this.notificacionRepo.crearVarias(notificaciones);
  }

  // ── Auditoría (antes: Observador / RegistrarAuditoriaListener) ──────────────
  private async auditar(
    reporte: Reporte,
    accion: string,
    adminId: number,
    observaciones: string,
    detalleAuditoria: Record<string, unknown>,
  ): Promise<void> {
    await this.auditoriaRepo.registrar({
      id_admin: adminId,
      id_usuario_afectado: reporte.receptor_id,
      accion,
      detalles: {
        id_reporte: reporte.id_reporte,
        estado_final: reporte.estado,
        observaciones,
        ...detalleAuditoria,
      },
    });
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
      throw new Error('No hay administradores registrados para atribuir la auditoría.');
    }
    return porDefecto;
  }
}
