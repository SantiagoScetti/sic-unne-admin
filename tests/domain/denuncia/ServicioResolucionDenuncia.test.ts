import { describe, it, expect, vi } from 'vitest';
import { ServicioResolucionDenuncia } from '@/src/domain/denuncia/ServicioResolucionDenuncia';
import { DenunciaYaProcesadaError } from '@/src/domain/denuncia/errores';
import { Denuncia } from '@/src/domain/denuncia/Denuncia';
import type { DenunciaData } from '@/src/domain/denuncia/tipos';

const mkDenuncia = (over: Partial<DenunciaData> = {}) =>
  new Denuncia({
    id_denuncia: 7,
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

function build(denunciaInicial: Denuncia) {
  const denunciaRepo = { obtenerPorId: vi.fn(async () => denunciaInicial), guardar: vi.fn() };
  const usuarioRepo = { suspender: vi.fn() };
  const servicioConsultaUsuario = { obtenerAdminSesion: vi.fn(async () => 1) };
  const servicio = new ServicioResolucionDenuncia(
    denunciaRepo as any,
    usuarioRepo as any,
    servicioConsultaUsuario as any,
  );
  return { servicio, denunciaRepo, usuarioRepo, servicioConsultaUsuario };
}

describe('ServicioResolucionDenuncia — resolver()', () => {
  it('resuelve una denuncia pendiente con suspensión temporal (delega cada paso)', async () => {
    const { servicio, denunciaRepo, usuarioRepo } = build(mkDenuncia());

    await servicio.resolver({
      id_denuncia: 7,
      accion: 'Suspender Temporalmente',
      fechaHasta: '2026-12-31',
    });

    expect(denunciaRepo.guardar).toHaveBeenCalledTimes(1);
    expect(usuarioRepo.suspender).toHaveBeenCalledWith(20, '2026-12-31');
  });

  it('resuelve con Enviar aviso sin suspender al usuario', async () => {
    const { servicio, usuarioRepo } = build(mkDenuncia());
    await servicio.resolver({ id_denuncia: 7, accion: 'Enviar aviso' });
    expect(usuarioRepo.suspender).not.toHaveBeenCalled();
  });

  it('rechaza con error de conflicto si la denuncia ya fue procesada y NO escribe nada', async () => {
    const { servicio, denunciaRepo, usuarioRepo } = build(
      mkDenuncia({ estado: 'Resuelto' }),
    );

    await expect(servicio.resolver({ id_denuncia: 7, accion: 'Enviar aviso' })).rejects.toThrow(
      DenunciaYaProcesadaError,
    );

    expect(denunciaRepo.guardar).not.toHaveBeenCalled();
    expect(usuarioRepo.suspender).not.toHaveBeenCalled();
  });
});

describe('ServicioResolucionDenuncia — desestimar()', () => {
  it('desestima una denuncia pendiente sin aplicar sanción', async () => {
    const { servicio, usuarioRepo } = build(mkDenuncia());
    const r = await servicio.desestimar({ id_denuncia: 7, observaciones: 'no corresponde' });
    expect(r.estado).toBe('Desestimado');
    expect(usuarioRepo.suspender).not.toHaveBeenCalled();
  });
});
