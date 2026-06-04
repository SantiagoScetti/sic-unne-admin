// =============================================================================
// Tipos del dominio Denuncia.
// Reflejan exactamente los CHECK constraints de la base de datos:
//   denuncia.estado        ∈ {Pendiente, Resuelto, Desestimado}
//   denuncia.accion_tomada ∈ {Enviar aviso, Suspender Temporalmente, Suspender Indefinidamente}
// =============================================================================

export type EstadoDenunciaNombre = 'Pendiente' | 'Resuelto' | 'Desestimado';

export type AccionTomada =
  | 'Enviar aviso'
  | 'Suspender Temporalmente'
  | 'Suspender Indefinidamente';

export interface DenunciaData {
  id_denuncia: number;
  emisor_id: number | null; // null = denuncia generada por el Sistema
  receptor_id: number;
  id_periodo: number | null;
  motivo: string;
  estado: EstadoDenunciaNombre;
  fecha_alta: string | null;
  accion_tomada: AccionTomada | null;
  admin_id: number | null;
}
