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
    const supabase = getSupabaseServer();
    const { error } = await supabase.from('auditoria_administrativa').insert({
      id_admin: registro.id_admin,
      id_usuario_afectado: registro.id_usuario_afectado,
      accion: registro.accion,
      detalles: registro.detalles,
      fecha: new Date().toISOString(),
    });

    if (error) throw new Error(error.message);
  }
}
