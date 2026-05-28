import { describe, it, expect } from 'vitest';
import { Reporte } from '@/src/domain/reporte/Reporte';
import { ReporteYaProcesadoError } from '@/src/domain/reporte/errores';
import type { ReporteData } from '@/src/domain/reporte/tipos';

// =============================================================================
// PATRÓN ESTADO — probado a través de la entidad Reporte (su Contexto).
// =============================================================================

const base = (over: Partial<ReporteData> = {}): ReporteData => ({
  id_reporte: 1,
  emisor_id: 10,
  receptor_id: 20,
  id_periodo: 1,
  motivo: 'motivo de prueba con longitud suficiente',
  estado: 'Pendiente',
  fecha_alta: '2026-01-01',
  accion_tomada: null,
  admin_id: null,
  ...over,
});

describe('Reporte — patrón Estado', () => {
  it('un reporte Pendiente puede resolverse y queda Resuelto con la acción', () => {
    const r = new Reporte(base());
    r.resolver('Suspender Temporalmente');
    expect(r.estado).toBe('Resuelto');
    expect(r.accionTomada).toBe('Suspender Temporalmente');
  });

  it('un reporte Pendiente puede desestimarse', () => {
    const r = new Reporte(base());
    r.desestimar();
    expect(r.estado).toBe('Desestimado');
  });

  it('un reporte Resuelto NO puede volver a resolverse (transición inválida)', () => {
    const r = new Reporte(base({ estado: 'Resuelto' }));
    expect(() => r.resolver('Enviar aviso')).toThrow(ReporteYaProcesadoError);
  });

  it('el error de ya-procesado expone el código CONFLIC_ALREADY_PROCESSED', () => {
    const r = new Reporte(base({ estado: 'Resuelto' }));
    let err: unknown;
    try {
      r.resolver('Enviar aviso');
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ReporteYaProcesadoError);
    expect((err as ReporteYaProcesadoError).codigo).toBe('CONFLIC_ALREADY_PROCESSED');
  });

  it('un reporte Desestimado no admite más transiciones', () => {
    const r = new Reporte(base({ estado: 'Desestimado' }));
    expect(() => r.desestimar()).toThrow(ReporteYaProcesadoError);
  });

  it('emisorEsSistema() distingue reportes del Sistema (emisor_id null)', () => {
    expect(new Reporte(base({ emisor_id: null })).emisorEsSistema()).toBe(true);
    expect(new Reporte(base({ emisor_id: 5 })).emisorEsSistema()).toBe(false);
  });

  it('aFilaPersistible refleja estado, acción y admin tras resolver', () => {
    const r = new Reporte(base());
    r.resolver('Enviar aviso');
    r.asignarAdmin(1);
    expect(r.aFilaPersistible()).toEqual({
      estado: 'Resuelto',
      accion_tomada: 'Enviar aviso',
      admin_id: 1,
    });
  });
});
