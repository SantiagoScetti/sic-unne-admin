import { describe, it, expect } from 'vitest';
import { Comision } from '@/src/domain/comision/Comision';
import { ComisionInvalidaError } from '@/src/domain/comision/errores';

// =============================================================================
// Entidad Comisión — reglas de negocio (validar) y serialización.
// =============================================================================

describe('Comisión — validar()', () => {
  it('acepta una comisión válida y normaliza nombre/letras', () => {
    const c = new Comision({ nombre: '  Comisión A  ', letraDesde: 'a', letraHasta: 'm', id_asignatura: 13 });
    expect(() => c.validar()).not.toThrow();
    expect(c.nombre).toBe('Comisión A');
    expect(c.letraDesde).toBe('A');
    expect(c.letraHasta).toBe('M');
  });

  it('rechaza nombre vacío', () => {
    const c = new Comision({ nombre: '   ', letraDesde: 'A', letraHasta: 'M', id_asignatura: 13 });
    expect(() => c.validar()).toThrow(ComisionInvalidaError);
  });

  it('rechaza letras que no sean un único carácter A-Z', () => {
    expect(() => new Comision({ nombre: 'X', letraDesde: 'AB', letraHasta: 'M', id_asignatura: 13 }).validar())
      .toThrow(ComisionInvalidaError);
    expect(() => new Comision({ nombre: 'X', letraDesde: '1', letraHasta: 'M', id_asignatura: 13 }).validar())
      .toThrow(ComisionInvalidaError);
  });

  it('rechaza letraDesde >= letraHasta (CHECK estricto de la DB)', () => {
    expect(() => new Comision({ nombre: 'X', letraDesde: 'M', letraHasta: 'A', id_asignatura: 13 }).validar())
      .toThrow(ComisionInvalidaError);
    expect(() => new Comision({ nombre: 'X', letraDesde: 'A', letraHasta: 'A', id_asignatura: 13 }).validar())
      .toThrow(ComisionInvalidaError);
  });

  it('rechaza asignatura inválida', () => {
    expect(() => new Comision({ nombre: 'X', letraDesde: 'A', letraHasta: 'M', id_asignatura: 0 }).validar())
      .toThrow(ComisionInvalidaError);
  });

  it('aFilaPersistible devuelve la forma de la tabla comision', () => {
    const c = new Comision({ nombre: 'C', letraDesde: 'A', letraHasta: 'Z', id_asignatura: 5 });
    expect(c.aFilaPersistible()).toEqual({
      nombre: 'C',
      letra_desde: 'A',
      letra_hasta: 'Z',
      id_asignatura: 5,
      estado: true,
    });
  });
});
