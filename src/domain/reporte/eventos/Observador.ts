// =============================================================================
// PATRÓN OBSERVADOR (Observer) — Contrato del observador.
// Un observador reacciona ante un evento de dominio publicado por el sujeto.
// =============================================================================

export interface Observador<TEvento> {
  manejar(evento: TEvento): Promise<void>;
}
