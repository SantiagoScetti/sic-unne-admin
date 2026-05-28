import { ReporteRepositorio } from '../../infrastructure/repositorios/ReporteRepositorio';
import { UsuarioRepositorio } from '../../infrastructure/repositorios/UsuarioRepositorio';
import { NotificacionRepositorio } from '../../infrastructure/repositorios/NotificacionRepositorio';
import { AuditoriaRepositorio } from '../../infrastructure/repositorios/AuditoriaRepositorio';
import { DispatcherEventos } from './eventos/DispatcherEventos';
import { ReporteResueltoEvent } from './eventos/ReporteResueltoEvent';
import { NotificarUsuariosListener } from './eventos/listeners/NotificarUsuariosListener';
import { RegistrarAuditoriaListener } from './eventos/listeners/RegistrarAuditoriaListener';
import { seleccionarAccion } from './acciones/seleccionarAccion';
import type { Reporte } from './Reporte';
import type { AccionTomada } from './tipos';

// =============================================================================
// ServicioResolucionReporte — Servicio de Aplicación (Caso de Uso C-01).
//
// Coordina los TRES patrones de diseño del dominio en un único punto:
//   (1) ESTADO     → valida la transición del reporte.
//   (2) ESTRATEGIA → ejecuta el efecto concreto de la acción administrativa.
//   (3) OBSERVADOR → publica el evento; los listeners notifican y auditan.
//
// Reemplaza a la antigua ReporteFacade y a la orquestación que antes vivía,
// incorrectamente, en el cliente (ReportesPage hacía 4 fetches separados).
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
  private readonly dispatcher: DispatcherEventos<ReporteResueltoEvent>;

  // Inyección de dependencias: los repositorios se reciben por constructor (con
  // defaults de producción). Esto permite testear el servicio sin base de datos,
  // inyectando dobles de prueba (fakes/mocks).
  constructor(
    private readonly reporteRepo: ReporteRepositorio = new ReporteRepositorio(),
    private readonly usuarioRepo: UsuarioRepositorio = new UsuarioRepositorio(),
    notificacionRepo: NotificacionRepositorio = new NotificacionRepositorio(),
    auditoriaRepo: AuditoriaRepositorio = new AuditoriaRepositorio(),
  ) {
    // Suscripción de observadores (patrón Observador).
    this.dispatcher = new DispatcherEventos<ReporteResueltoEvent>()
      .suscribir(new NotificarUsuariosListener(notificacionRepo))
      .suscribir(new RegistrarAuditoriaListener(auditoriaRepo));
  }

  /** Resuelve un reporte aplicando una acción administrativa. */
  async resolver(params: ParamsResolver): Promise<Reporte> {
    const reporte = await this.cargar(params.id_reporte);
    const adminId = await this.resolverAdminId(params.admin_id);

    // (1) PATRÓN ESTADO — lanza ReporteYaProcesadoError si no está 'Pendiente'.
    reporte.resolver(params.accion);
    reporte.asignarAdmin(adminId);
    await this.reporteRepo.guardar(reporte);

    // (2) PATRÓN ESTRATEGIA — efecto concreto de la acción.
    const estrategia = seleccionarAccion(params.accion);
    const resultado = await estrategia.aplicar({
      reporte,
      fechaHasta: params.fechaHasta ?? null,
      usuarioRepo: this.usuarioRepo,
    });

    // (3) PATRÓN OBSERVADOR — notifica y audita vía listeners.
    await this.dispatcher.publicar(
      new ReporteResueltoEvent(
        reporte,
        params.accion,
        adminId,
        resultado.tipoNotificacionReceptor,
        resultado.mensajeReceptor,
        params.observaciones ?? '',
        resultado.detalleAuditoria,
      ),
    );

    return reporte;
  }

  /** Desestima un reporte (sin sanción). */
  async desestimar(params: ParamsDesestimar): Promise<Reporte> {
    const reporte = await this.cargar(params.id_reporte);
    const adminId = await this.resolverAdminId(params.admin_id);

    // (1) PATRÓN ESTADO
    reporte.desestimar();
    reporte.asignarAdmin(adminId);
    await this.reporteRepo.guardar(reporte);

    // (3) PATRÓN OBSERVADOR (no hay estrategia: desestimar no aplica sanción)
    await this.dispatcher.publicar(
      new ReporteResueltoEvent(
        reporte,
        null,
        adminId,
        'Reporte',
        'Un administrador revisó el reporte y decidió desestimarlo. No se aplicaron sanciones.',
        params.observaciones ?? '',
        { efecto: 'reporte_desestimado' },
      ),
    );

    return reporte;
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
