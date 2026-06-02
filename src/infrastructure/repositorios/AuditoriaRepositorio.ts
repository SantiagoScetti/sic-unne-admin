import { getSupabaseServer } from '../supabaseServer';

// =============================================================================
// AuditoriaRepositorio — Capa de persistencia.
// La tabla auditoria_administrativa tiene id_admin NOT NULL: siempre debe
// recibirse un administrador válido.
// =============================================================================

export interface RegistroAuditoria {
  id_admin: number;
  id_usuario_afectado: number | null;
  accion: string;
  detalles: Record<string, unknown>;
}

export class AuditoriaRepositorio {
  async registrar(registro: RegistroAuditoria): Promise<void> {
    // Simplificación de base de datos: La tabla 'auditoria_administrativa' fue eliminada
    // por simplificación del alcance. Se simula para mantener la trazabilidad OO.
    console.log(
      `[Auditoría simulada] Admin #${registro.id_admin} ejecutó acción "${registro.accion}" ` +
      `sobre Usuario Afectado #${registro.id_usuario_afectado}. Detalles:`,
      registro.detalles
    );
  }
}
