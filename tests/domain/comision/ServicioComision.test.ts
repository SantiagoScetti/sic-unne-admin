import { describe, it, expect, vi } from 'vitest';
import { ServicioComision } from '@/src/domain/comision/ServicioComision';
import { ComisionInvalidaError } from '@/src/domain/comision/errores';

// =============================================================================
// Servicio de aplicación C-02 / C-03 — con ComisionRepositorio FALSO inyectado.
// =============================================================================

function buildRepo(over: Record<string, unknown> = {}) {
  return {
    listar: vi.fn(),
    contarActivas: vi.fn(),
    existeAsignatura: vi.fn(async () => true),
    crear: vi.fn(async () => ({ id_comision: 99 })),
    vincularProfesores: vi.fn(),
    reemplazarProfesores: vi.fn(),
    actualizar: vi.fn(async () => ({ id_comision: 99 })),
    cambiarEstado: vi.fn(),
    buscarIdAsignaturaPorNombre: vi.fn(),
    buscarIdComision: vi.fn(),
    buscarIdProfesorPorDocumento: vi.fn(),
    upsertVinculo: vi.fn(),
    ...over,
  };
}

describe('ServicioComision — crear() (C-02)', () => {
  it('crea la comisión y vincula profesores cuando los datos son válidos', async () => {
    const repo = buildRepo();
    const fila = await new ServicioComision(repo as any).crear({
      nombre: 'Comisión A',
      letraDesde: 'A',
      letraHasta: 'M',
      id_asignatura: 13,
      profesores_ids: [1, 2],
    });
    expect(repo.existeAsignatura).toHaveBeenCalledWith(13);
    expect(repo.crear).toHaveBeenCalledTimes(1);
    expect(repo.vincularProfesores).toHaveBeenCalledWith(99, [1, 2]);
    expect(fila).toEqual({ id_comision: 99 });
  });

  it('rechaza letras inválidas y NO toca el repositorio', async () => {
    const repo = buildRepo();
    await expect(
      new ServicioComision(repo as any).crear({ nombre: 'X', letraDesde: 'M', letraHasta: 'A', id_asignatura: 13 }),
    ).rejects.toThrow(ComisionInvalidaError);
    expect(repo.crear).not.toHaveBeenCalled();
  });

  it('rechaza si la asignatura no existe', async () => {
    const repo = buildRepo({ existeAsignatura: vi.fn(async () => false) });
    await expect(
      new ServicioComision(repo as any).crear({ nombre: 'X', letraDesde: 'A', letraHasta: 'M', id_asignatura: 999 }),
    ).rejects.toThrow(ComisionInvalidaError);
    expect(repo.crear).not.toHaveBeenCalled();
  });
});

describe('ServicioComision — actualizar()', () => {
  it('reemplaza los profesores cuando se envía profesores_ids', async () => {
    const repo = buildRepo();
    await new ServicioComision(repo as any).actualizar(99, { nombre: 'Nuevo', profesores_ids: [3] });
    expect(repo.reemplazarProfesores).toHaveBeenCalledWith(99, [3]);
  });

  it('rechaza letras inválidas en edición', async () => {
    const repo = buildRepo();
    await expect(
      new ServicioComision(repo as any).actualizar(99, { letraDesde: 'Z', letraHasta: 'A' }),
    ).rejects.toThrow(ComisionInvalidaError);
  });
});

describe('ServicioComision — importarMasivo() (C-03)', () => {
  it('inserta comisiones válidas y reporta errores por fila', async () => {
    const repo = buildRepo({
      buscarIdAsignaturaPorNombre: vi.fn(async (n: string) => (n === 'Conocida' ? 13 : null)),
      buscarIdComision: vi.fn(async () => null),
      buscarIdProfesorPorDocumento: vi.fn(async () => 1),
    });

    const filas = [
      { asignatura_nombre: 'Conocida', comision_nombre: 'Com A', comision_letra_desde: 'A', comision_letra_hasta: 'M', profesor_documento: 20123456 },
      { asignatura_nombre: 'Inexistente', comision_nombre: 'Com B', comision_letra_desde: 'A', comision_letra_hasta: 'M', profesor_documento: 1 },
    ];

    const res = await new ServicioComision(repo as any).importarMasivo(filas as any);

    expect(res.insertadas).toBe(1);
    expect(res.errores).toHaveLength(1);
    expect(res.errores[0]).toContain('Inexistente');
    expect(repo.upsertVinculo).toHaveBeenCalledWith(99, 1);
  });
});
