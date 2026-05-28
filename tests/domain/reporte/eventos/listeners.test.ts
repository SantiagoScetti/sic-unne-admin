import { describe, it, expect, vi } from 'vitest';
import { NotificarUsuariosListener } from '@/src/domain/reporte/eventos/listeners/NotificarUsuariosListener';
import { RegistrarAuditoriaListener } from '@/src/domain/reporte/eventos/listeners/RegistrarAuditoriaListener';
import { ReporteResueltoEvent } from '@/src/domain/reporte/eventos/ReporteResueltoEvent';
import { Reporte } from '@/src/domain/reporte/Reporte';
import type { ReporteData } from '@/src/domain/reporte/tipos';

// =============================================================================
// PATRÓN OBSERVADOR — Listeners concretos.
// =============================================================================

const mkReporte = (over: Partial<ReporteData> = {}) =>
  new Reporte({
    id_reporte: 7,
    emisor_id: 10,
    receptor_id: 20,
    id_periodo: 1,
    motivo: 'x'.repeat(25),
    estado: 'Pendiente',
    fecha_alta: null,
    accion_tomada: null,
    admin_id: null,
    ...over,
  });

const mkEvento = (reporte: Reporte) =>
  new ReporteResueltoEvent(reporte, 'Enviar aviso', 1, 'Aviso', 'mensaje al receptor', 'obs del admin', {
    efecto: 'aviso_enviado',
  });

describe('Observador — NotificarUsuariosListener', () => {
  it('notifica a receptor Y emisor cuando el emisor no es el Sistema', async () => {
    const notiRepo = { crearVarias: vi.fn() } as any;
    await new NotificarUsuariosListener(notiRepo).manejar(mkEvento(mkReporte()));

    const notifs = notiRepo.crearVarias.mock.calls[0][0];
    expect(notifs).toHaveLength(2);
    expect(notifs.map((n: any) => n.id_usuario).sort()).toEqual([10, 20]);
  });

  it('notifica solo al receptor cuando el emisor es el Sistema (null)', async () => {
    const notiRepo = { crearVarias: vi.fn() } as any;
    await new NotificarUsuariosListener(notiRepo).manejar(mkEvento(mkReporte({ emisor_id: null })));

    const notifs = notiRepo.crearVarias.mock.calls[0][0];
    expect(notifs).toHaveLength(1);
    expect(notifs[0].id_usuario).toBe(20);
  });
});

describe('Observador — RegistrarAuditoriaListener', () => {
  it('registra auditoría con admin, usuario afectado y detalles (incluye observaciones)', async () => {
    const auditRepo = { registrar: vi.fn() } as any;
    await new RegistrarAuditoriaListener(auditRepo).manejar(mkEvento(mkReporte()));

    expect(auditRepo.registrar).toHaveBeenCalledTimes(1);
    const registro = auditRepo.registrar.mock.calls[0][0];
    expect(registro.id_admin).toBe(1);
    expect(registro.id_usuario_afectado).toBe(20);
    expect(registro.accion).toBe('Enviar aviso');
    expect(registro.detalles.observaciones).toBe('obs del admin');
    expect(registro.detalles.id_reporte).toBe(7);
  });
});
