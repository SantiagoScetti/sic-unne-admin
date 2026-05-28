import type { Observador } from './Observador';

// =============================================================================
// PATRÓN OBSERVADOR — Sujeto / Dispatcher.
// Mantiene la lista de observadores suscritos y les notifica un evento.
// Permite agregar nuevas reacciones (ej. enviar email) sin tocar el dominio.
// =============================================================================

export class DispatcherEventos<TEvento> {
  private observadores: Observador<TEvento>[] = [];

  suscribir(observador: Observador<TEvento>): this {
    this.observadores.push(observador);
    return this;
  }

  async publicar(evento: TEvento): Promise<void> {
    for (const observador of this.observadores) {
      await observador.manejar(evento);
    }
  }
}
