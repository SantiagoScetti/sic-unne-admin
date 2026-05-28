import { describe, it, expect, vi } from 'vitest';
import { ServicioResolucionReporte } from '@/src/domain/reporte/ServicioResolucionReporte';
import { ReporteYaProcesadoError } from '@/src/domain/reporte/errores';
import { Reporte } from '@/src/domain/reporte/Reporte';
import type { ReporteData } from '@/src/domain/reporte/tipos';

// =============================================================================
// Servicio de aplicación C-01 — orquesta Estado + Estrategia + Observador.
// Se prueba con repositorios FALSOS inyectados (sin base de datos).
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

function build(reporteInicial: Reporte) {
  const reporteRepo = { obtenerPorId: vi.fn(async () => reporteInicial), guardar: vi.fn() };
  const usuarioRepo = { suspender: vi.fn(), obtenerAdminPorDefecto: vi.fn(async () => 1) };
  const notificacionRepo = { crearVarias: vi.fn() };
  const auditoriaRepo = { registrar: vi.fn() };
  const servicio = new ServicioResolucionReporte(
    reporteRepo as any,
    usuarioRepo as any,
    notificacionRepo as any,
    auditoriaRepo as any,
  );
  return { servicio, reporteRepo, usuarioRepo, notificacionRepo, auditoriaRepo };
}

describe('ServicioResolucionReporte — resolver()', () => {
  it('resuelve un reporte pendiente con suspensión temporal (los 3 patrones)', async () => {
    const { servicio, reporteRepo, usuarioRepo, notificacionRepo, auditoriaRepo } = build(mkReporte());

    const r = await servicio.resolver({
      id_reporte: 7,
      accion: 'Suspender Temporalmente',
      fechaHasta: '2026-12-31',
      observaciones: 'reincidente',
      admin_id: 2,
    });

    expect(r.estado).toBe('Resuelto');                              // (1) Estado
    expect(reporteRepo.guardar).toHaveBeenCalledTimes(1);
    expect(usuarioRepo.suspender).toHaveBeenCalledWith(20, '2026-12-31'); // (2) Estrategia
    expect(notificacionRepo.crearVarias).toHaveBeenCalledTimes(1);  // (3) Observador
    expect(auditoriaRepo.registrar).toHaveBeenCalledTimes(1);       // (3) Observador
    expect(auditoriaRepo.registrar.mock.calls[0][0].id_admin).toBe(2);
  });

  it('usa el administrador por defecto cuando no se pasa admin_id', async () => {
    const { servicio, usuarioRepo, auditoriaRepo } = build(mkReporte());
    await servicio.resolver({ id_reporte: 7, accion: 'Enviar aviso' });
    expect(usuarioRepo.obtenerAdminPorDefecto).toHaveBeenCalledTimes(1);
    expect(auditoriaRepo.registrar.mock.calls[0][0].id_admin).toBe(1);
  });

  it('rechaza con error de conflicto si el reporte ya fue procesado y NO escribe nada', async () => {
    const { servicio, reporteRepo, usuarioRepo, notificacionRepo, auditoriaRepo } = build(
      mkReporte({ estado: 'Resuelto' }),
    );

    await expect(servicio.resolver({ id_reporte: 7, accion: 'Enviar aviso' })).rejects.toThrow(
      ReporteYaProcesadoError,
    );

    expect(reporteRepo.guardar).not.toHaveBeenCalled();
    expect(usuarioRepo.suspender).not.toHaveBeenCalled();
    expect(notificacionRepo.crearVarias).not.toHaveBeenCalled();
    expect(auditoriaRepo.registrar).not.toHaveBeenCalled();
  });
});

describe('ServicioResolucionReporte — desestimar()', () => {
  it('desestima un reporte pendiente sin aplicar sanción, pero auditando', async () => {
    const { servicio, usuarioRepo, auditoriaRepo } = build(mkReporte());
    const r = await servicio.desestimar({ id_reporte: 7, observaciones: 'no corresponde' });
    expect(r.estado).toBe('Desestimado');
    expect(usuarioRepo.suspender).not.toHaveBeenCalled();
    expect(auditoriaRepo.registrar).toHaveBeenCalledTimes(1);
  });
});
