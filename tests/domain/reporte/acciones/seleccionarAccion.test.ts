import { describe, it, expect, vi } from 'vitest';
import { seleccionarAccion } from '@/src/domain/reporte/acciones/seleccionarAccion';
import { EnviarAviso } from '@/src/domain/reporte/acciones/EnviarAviso';
import { SuspenderTemporalmente } from '@/src/domain/reporte/acciones/SuspenderTemporalmente';
import { SuspenderIndefinidamente } from '@/src/domain/reporte/acciones/SuspenderIndefinidamente';
import { Reporte } from '@/src/domain/reporte/Reporte';

// =============================================================================
// PATRÓN ESTRATEGIA — selector + cada estrategia concreta.
// =============================================================================

const reporte = () =>
  new Reporte({
    id_reporte: 1,
    emisor_id: 10,
    receptor_id: 20,
    id_periodo: 1,
    motivo: 'x'.repeat(25),
    estado: 'Pendiente',
    fecha_alta: null,
    accion_tomada: null,
    admin_id: null,
  });

describe('Estrategia — seleccionarAccion', () => {
  it('mapea cada acción a su estrategia concreta', () => {
    expect(seleccionarAccion('Enviar aviso')).toBeInstanceOf(EnviarAviso);
    expect(seleccionarAccion('Suspender Temporalmente')).toBeInstanceOf(SuspenderTemporalmente);
    expect(seleccionarAccion('Suspender Indefinidamente')).toBeInstanceOf(SuspenderIndefinidamente);
  });
});

describe('Estrategia — EnviarAviso', () => {
  it('no suspende al usuario y notifica con tipo Aviso', async () => {
    const usuarioRepo = { suspender: vi.fn() } as any;
    const res = await new EnviarAviso().aplicar({ reporte: reporte(), usuarioRepo });
    expect(usuarioRepo.suspender).not.toHaveBeenCalled();
    expect(res.tipoNotificacionReceptor).toBe('Aviso');
  });
});

describe('Estrategia — SuspenderTemporalmente', () => {
  it('suspende al receptor hasta la fecha y notifica con tipo Bloqueo', async () => {
    const usuarioRepo = { suspender: vi.fn() } as any;
    const res = await new SuspenderTemporalmente().aplicar({
      reporte: reporte(),
      fechaHasta: '2026-12-31',
      usuarioRepo,
    });
    expect(usuarioRepo.suspender).toHaveBeenCalledWith(20, '2026-12-31');
    expect(res.tipoNotificacionReceptor).toBe('Bloqueo');
  });

  it('falla si no se provee fechaHasta', async () => {
    const usuarioRepo = { suspender: vi.fn() } as any;
    await expect(
      new SuspenderTemporalmente().aplicar({ reporte: reporte(), usuarioRepo })
    ).rejects.toThrow();
  });
});

describe('Estrategia — SuspenderIndefinidamente', () => {
  it('suspende sin fecha (null) y notifica con tipo Bloqueo', async () => {
    const usuarioRepo = { suspender: vi.fn() } as any;
    const res = await new SuspenderIndefinidamente().aplicar({ reporte: reporte(), usuarioRepo });
    expect(usuarioRepo.suspender).toHaveBeenCalledWith(20, null);
    expect(res.tipoNotificacionReceptor).toBe('Bloqueo');
  });
});
