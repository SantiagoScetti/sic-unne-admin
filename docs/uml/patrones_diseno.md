# Patrones de Diseño — SIC-UNNE

Describe la arquitectura y los patrones del módulo de Administración, **tal como están
en el código** (`src/`). Criterio: **un** patrón de diseño (GoF) implementado y lucido,
**dos** candidatos documentados, y **dos** patrones auxiliares de arquitectura.

---

## 1. Arquitectura: Cliente-Servidor en capas

| Capa | Carpeta | Responsabilidad |
|---|---|---|
| Presentación | `src/app`, `src/components`, `src/pages/*.jsx`, `src/services/*` (cliente HTTP) | UI React; captura datos y muestra resultados. |
| Aplicación (API) | `src/pages/api/` | API Routes: validan el transporte y delegan en el dominio. |
| Dominio | `src/domain/` | Entidades ricas, reglas de negocio y **el patrón Estado**. |
| Infraestructura | `src/infrastructure/` | Repositorios: aíslan el acceso a Supabase. |
| Datos | Supabase (PostgreSQL) | Motor de base de datos. |

---

## 2. Patrón IMPLEMENTADO: ESTADO (State)

### Problema
Un reporte tiene un **ciclo de vida**: nace `Pendiente` y pasa a `Resuelto` o
`Desestimado` (terminales). La regla "un reporte ya procesado no puede volver a
resolverse" estaba dispersa en `if`s, fácil de olvidar y duplicar.

### Solución
Cada estado es una clase que decide qué transiciones son válidas. El `Reporte`
(contexto) **delega** en su estado actual. Una transición inválida lanza
`ReporteYaProcesadoError` (HTTP 409). El estado `Pendiente` es el único que sobrescribe
`resolver()`/`desestimar()`; los terminales heredan el comportamiento que rechaza.

### Diagrama (marcado con recuadro en el Diagrama de Clases)
```plantuml
@startuml
skinparam classAttributeIconSize 0
class Reporte <<Context>> {
  - _estado: EstadoReporte
  + resolver(accion): void
  + desestimar(): void
  + transicionarA(e): void
  + registrarAccion(a): void
}
package "Patron Estado (State)" <<Rectangle>> #LightYellow {
  abstract class EstadoReporte <<State>> {
    + {abstract} nombre
    + resolver(r, a): void
    + desestimar(r): void
  }
  class EstadoPendiente {
    + nombre
    + resolver(r, a): void
    + desestimar(r): void
  }
  class EstadoResuelto { + nombre }
  class EstadoDesestimado { + nombre }
  EstadoReporte <|-- EstadoPendiente
  EstadoReporte <|-- EstadoResuelto
  EstadoReporte <|-- EstadoDesestimado
}
Reporte o--> EstadoReporte : estado actual
note bottom of EstadoReporte
  resolver()/desestimar() de la base lanzan ReporteYaProcesadoError (409).
  EstadoPendiente los sobrescribe; los terminales solo definen nombre.
end note
@enduml
```

### Archivos
`src/domain/reporte/Reporte.ts` (contexto) y `src/domain/reporte/estados/`
(`EstadoReporte.ts` base, `EstadoPendiente.ts`, `EstadoResuelto.ts`,
`EstadoDesestimado.ts`, `index.ts` fábrica `crearEstado`).

---

## 3. Patrones CANDIDATOS (documentados, no implementados)

### 3.1. Estrategia (Strategy)
**Dónde aplicaría:** las **tres acciones administrativas** al resolver un reporte
(*Enviar aviso*, *Suspender Temporalmente*, *Suspender Indefinidamente*). Cada una sería
una estrategia intercambiable bajo una interfaz `AccionResolucion.aplicar(contexto)`,
elegida en tiempo de ejecución (principio Abierto/Cerrado).

**Por qué no está:** son tres acciones fijas y acotadas; se resuelven con un `switch`
dentro de `ServicioResolucionReporte.aplicarEfecto()`. El patrón se reserva como
refactorización si el conjunto de acciones creciera.

### 3.2. Observador (Observer)
**Dónde aplicaría:** los **efectos secundarios** al resolver (auditar + notificar). El
servicio publicaría un `ReporteResueltoEvent` y varios *listeners* reaccionarían
desacoplados (p. ej. agregar "enviar email" sin tocar el servicio).

**Por qué no está:** hoy son dos efectos directos; se resuelven con llamadas del servicio
a los repositorios (`notificar()` y `auditar()`). El patrón se reserva si los efectos se
volvieran numerosos o variables.

---

## 4. Patrones AUXILIARES (soporte de la arquitectura en capas)

No son patrones que el proyecto "luzca", sino que sostienen la separación de capas:

- **Repositorio** — `src/infrastructure/repositorios/` (`ReporteRepositorio`,
  `UsuarioRepositorio`, `NotificacionRepositorio`, `AuditoriaRepositorio`,
  `ComisionRepositorio`). Encapsulan todo el SQL/Supabase: el dominio pide operaciones de
  alto nivel sin conocer la base. Permiten testear el dominio sin base de datos
  (dobles inyectados). **Es lo que mantiene el SQL fuera de los diagramas OO.**
- **Singleton** — `src/infrastructure/supabaseServer.ts`. `getSupabaseServer()` crea el
  cliente Supabase del servidor una sola vez por proceso y reutiliza la instancia.

---

## 5. Trazabilidad

El detalle paso a paso (cada flecha de los diagramas de secuencia → archivo:línea del
código) está en
[`docs/puml/actualizacion_claude/trazabilidaddeDiagramas.md`](../puml/actualizacion_claude/trazabilidaddeDiagramas.md).
El diagrama de clases completo está en [`diagrama_clases.md`](./diagrama_clases.md).
