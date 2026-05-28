import type { EstadoReporte } from './estados/EstadoReporte';
import { crearEstado } from './estados';
import type { AccionTomada, EstadoReporteNombre, ReporteData } from './tipos';

// =============================================================================
// Entidad de dominio: Reporte.
//
// Objeto rico (con comportamiento, no anémico). Es el "Contexto" del PATRÓN
// ESTADO: delega en su estado actual la decisión de qué transiciones son
// válidas. No accede a la base de datos: la persistencia vive en el repositorio.
// =============================================================================

export class Reporte {
  readonly id_reporte: number;
  readonly emisor_id: number | null;
  readonly receptor_id: number;
  readonly id_periodo: number | null;
  readonly motivo: string;
  readonly fecha_alta: string | null;

  private _accionTomada: AccionTomada | null;
  private _adminId: number | null;
  private _estado: EstadoReporte;

  constructor(data: ReporteData) {
    this.id_reporte = data.id_reporte;
    this.emisor_id = data.emisor_id;
    this.receptor_id = data.receptor_id;
    this.id_periodo = data.id_periodo;
    this.motivo = data.motivo;
    this.fecha_alta = data.fecha_alta;
    this._accionTomada = data.accion_tomada;
    this._adminId = data.admin_id;
    this._estado = crearEstado(data.estado);
  }

  // ── Consultas ──────────────────────────────────────────────────────────
  get estado(): EstadoReporteNombre { return this._estado.nombre; }
  get accionTomada(): AccionTomada | null { return this._accionTomada; }
  get adminId(): number | null { return this._adminId; }
  esPendiente(): boolean { return this._estado.nombre === 'Pendiente'; }
  emisorEsSistema(): boolean { return this.emisor_id == null; }

  // ── API interna usada por los objetos Estado (patrón Estado) ────────────
  transicionarA(nuevoEstado: EstadoReporte): void { this._estado = nuevoEstado; }
  registrarAccion(accion: AccionTomada): void { this._accionTomada = accion; }

  // ── Operaciones de negocio (delegan en el Estado actual) ────────────────
  /** Resuelve el reporte aplicando una acción. Lanza si no está 'Pendiente'. */
  resolver(accion: AccionTomada): void { this._estado.resolver(this, accion); }
  /** Desestima el reporte. Lanza si no está 'Pendiente'. */
  desestimar(): void { this._estado.desestimar(this); }
  /** Asigna el administrador que gestionó el reporte. */
  asignarAdmin(adminId: number): void { this._adminId = adminId; }

  // ── Serialización para la capa de persistencia ──────────────────────────
  aFilaPersistible(): {
    estado: EstadoReporteNombre;
    accion_tomada: AccionTomada | null;
    admin_id: number | null;
  } {
    return {
      estado: this._estado.nombre,
      accion_tomada: this._accionTomada,
      admin_id: this._adminId,
    };
  }
}
