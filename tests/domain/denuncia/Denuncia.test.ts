import { describe, it, expect } from 'vitest';
import { Denuncia } from '@/src/domain/denuncia/Denuncia';
import { DenunciaYaProcesadaError } from '@/src/domain/denuncia/errores';
import type { DenunciaData } from '@/src/domain/denuncia/tipos';

const base = (over: Partial<DenunciaData> = {}): DenunciaData => ({
  id_denuncia: 1,
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

describe('Denuncia — patrón Estado', () => {
  it('una denuncia Pendiente puede resolverse y queda Resuelto con la acción', () => {
    const r = new Denuncia(base());
    r.resolver('Suspender Temporalmente');
    expect(r.estado).toBe('Resuelto');
    expect(r.accionTomada).toBe('Suspender Temporalmente');
  });

  it('una denuncia Pendiente puede desestimarse', () => {
    const r = new Denuncia(base());
    r.desestimar();
    expect(r.estado).toBe('Desestimado');
  });

  it('una denuncia Resuelto NO puede volver a resolverse (transición inválida)', () => {
    const r = new Denuncia(base({ estado: 'Resuelto' }));
    expect(() => r.resolver('Enviar aviso')).toThrow(DenunciaYaProcesadaError);
  });

  it('el error de ya-procesado expone el código CONFLIC_ALREADY_PROCESSED', () => {
    const r = new Denuncia(base({ estado: 'Resuelto' }));
    let err: unknown;
    try {
      r.resolver('Enviar aviso');
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(DenunciaYaProcesadaError);
    expect((err as DenunciaYaProcesadaError).codigo).toBe('CONFLIC_ALREADY_PROCESSED');
  });

  it('una denuncia Desestimado no admite más transiciones', () => {
    const r = new Denuncia(base({ estado: 'Desestimado' }));
    expect(() => r.desestimar()).toThrow(DenunciaYaProcesadaError);
  });

  it('emisorEsSistema() distingue denuncias del Sistema (emisor_id null)', () => {
    expect(new Denuncia(base({ emisor_id: null })).emisorEsSistema()).toBe(true);
    expect(new Denuncia(base({ emisor_id: 5 })).emisorEsSistema()).toBe(false);
  });

  it('aFilaPersistible refleja estado, acción y admin tras resolver', () => {
    const r = new Denuncia(base());
    r.resolver('Enviar aviso');
    r.asignarAdmin(1);
    expect(r.aFilaPersistible()).toEqual({
      estado: 'Resuelto',
      accion_tomada: 'Enviar aviso',
      admin_id: 1,
    });
  });
});
