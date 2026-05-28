// =============================================================================
// Tipos del dominio Reporte.
// Reflejan exactamente los CHECK constraints de la base de datos:
//   reporte.estado        ∈ {Pendiente, Resuelto, Desestimado}
//   reporte.accion_tomada ∈ {Enviar aviso, Suspender Temporalmente, Suspender Indefinidamente}
// =============================================================================

export type EstadoReporteNombre = 'Pendiente' | 'Resuelto' | 'Desestimado';

export type AccionTomada =
  | 'Enviar aviso'
  | 'Suspender Temporalmente'
  | 'Suspender Indefinidamente';

export interface ReporteData {
  id_reporte: number;
  emisor_id: number | null; // null = reporte generado por el Sistema
  receptor_id: number;
  id_periodo: number | null;
  motivo: string;
  estado: EstadoReporteNombre;
  fecha_alta: string | null;
  accion_tomada: AccionTomada | null;
  admin_id: number | null;
}
