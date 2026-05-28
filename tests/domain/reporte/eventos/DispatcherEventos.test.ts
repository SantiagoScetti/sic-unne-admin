import { describe, it, expect, vi } from 'vitest';
import { DispatcherEventos } from '@/src/domain/reporte/eventos/DispatcherEventos';

// =============================================================================
// PATRÓN OBSERVADOR — Sujeto / Dispatcher.
// =============================================================================

describe('Observador — DispatcherEventos', () => {
  it('notifica a todos los observadores suscritos, en orden de suscripción', async () => {
    const orden: string[] = [];
    const o1 = { manejar: vi.fn(async () => { orden.push('o1'); }) };
    const o2 = { manejar: vi.fn(async () => { orden.push('o2'); }) };

    const dispatcher = new DispatcherEventos<string>().suscribir(o1).suscribir(o2);
    await dispatcher.publicar('evento');

    expect(o1.manejar).toHaveBeenCalledWith('evento');
    expect(o2.manejar).toHaveBeenCalledWith('evento');
    expect(orden).toEqual(['o1', 'o2']);
  });

  it('sin observadores suscritos no falla', async () => {
    await expect(new DispatcherEventos<string>().publicar('x')).resolves.toBeUndefined();
  });
});
