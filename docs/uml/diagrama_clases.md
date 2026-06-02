# Diagrama de Clases del Dominio — SIC-UNNE

Este documento contiene dos vistas complementarias:

1. **Diagrama de Clases de Diseño** (sección 0): las clases reales del código `src/domain/`, con sus **métodos** y la jerarquía del **único patrón de diseño implementado: Estado**. Es la vista que demuestra el Diseño Orientado a Objetos.
2. **Diagrama de Clases de Datos / Entidades** (secciones 1-2): el mapeo de las tablas (atributos), útil como referencia del modelo persistente.

Se presentan en **Mermaid** (visualización nativa en GitHub/VSCode) y **PlantUML** (sintaxis académica estándar).

---

## 0. Diagrama de Clases de DISEÑO (dominio Reporte + Comisión)

> Esta es la vista que refleja el código y el **único patrón de diseño implementado (Estado)**, marcado con un recuadro. Los patrones **Estrategia** y **Observador** quedan como **candidatos documentados** (se describe dónde *podrían* aplicarse) en `docs/uml/patrones_diseno.md`; **no** están en el código.

```plantuml
@startuml
skinparam classAttributeIconSize 0
title Clases de Diseno - Dominio Reporte (patron Estado) y Comision

' ───────────── Entidad Reporte (Contexto del patron Estado) ─────────────
class Reporte <<Context>> {
  + id_reporte: int
  + emisor_id: int?
  + receptor_id: int
  + id_periodo: int?
  + motivo: string
  - _estado: EstadoReporte
  - _accionTomada: AccionTomada?
  - _adminId: int?
  + resolver(accion: AccionTomada): void
  + desestimar(): void
  + asignarAdmin(id: int): void
  + registrarAccion(a: AccionTomada): void
  + transicionarA(e: EstadoReporte): void
  + esPendiente(): boolean
  + emisorEsSistema(): boolean
  + aFilaPersistible(): object
}

' ═════════ PATRON DE DISENO IMPLEMENTADO: ESTADO (marcado con recuadro) ═════════
package "Patron Estado (State)" <<Rectangle>> #LightYellow {
  abstract class EstadoReporte <<State>> {
    + {abstract} nombre: string
    + resolver(r: Reporte, a: AccionTomada): void
    + desestimar(r: Reporte): void
  }
  class EstadoPendiente {
    + nombre: string
    + resolver(r: Reporte, a: AccionTomada): void
    + desestimar(r: Reporte): void
  }
  class EstadoResuelto {
    + nombre: string
  }
  class EstadoDesestimado {
    + nombre: string
  }
  EstadoReporte <|-- EstadoPendiente
  EstadoReporte <|-- EstadoResuelto
  EstadoReporte <|-- EstadoDesestimado
}
Reporte o--> EstadoReporte : estado actual

note bottom of EstadoReporte
  resolver() y desestimar() de la clase base lanzan
  ReporteYaProcesadoError (HTTP 409).
  * EstadoPendiente los SOBRESCRIBE para permitir la transicion.
  * EstadoResuelto y EstadoDesestimado son terminales:
    solo definen nombre y HEREDAN el comportamiento que
    rechaza (por eso no agregan metodos propios).
end note

' ───────────── Servicio de aplicacion (ORQUESTADOR: delega, no ejecuta) ─────────────
class ServicioResolucionReporte <<Service>> {
  + resolver(params): Reporte
  + desestimar(params): Reporte
  - aplicarEfecto(reporte, accion, fechaHasta)
  - notificar(reporte, tipo, mensaje): void
  - auditar(reporte, accion, adminId, obs, detalle): void
}

' ───────────── Repositorios (persistencia) ─────────────
class ReporteRepositorio <<Repository>> {
  + obtenerPorId(id): Reporte?
  + guardar(r: Reporte): void
}
class UsuarioRepositorio <<Repository>> {
  + suspender(id, fechaHasta): void
  + obtenerAdminPorDefecto(): int?
}
class NotificacionRepositorio <<Repository>> {
  + crearVarias(notificaciones): void
}
class AuditoriaRepositorio <<Repository>> {
  + registrar(registro): void
}

' ───────────── Dominio Comision (entidad + servicio + repositorio) ─────────────
class Comision <<Entity>> {
  + id_comision: int?
  + nombre: string
  + letraDesde: char
  + letraHasta: char
  + id_asignatura: int
  + estado: boolean
  + profesoresIds: int[]
  + validar(): void
  + aFilaPersistible(): object
}
class ServicioComision <<Service>> {
  + listar(filtro): Comision[]
  + contarActivas(): int
  + crear(datos): Comision
  + actualizar(id, datos): Comision
  + cambiarEstado(id, estado): void
  + importarMasivo(filas): ResultadoImportacion
}
class ComisionRepositorio <<Repository>> {
  + listar(filtro): Comision[]
  + existeAsignatura(id): boolean
  + crear(comision): Comision
  + vincularProfesores(idComision, ids): void
  + buscarIdAsignaturaPorNombre(nombre): int?
  + buscarIdComision(nombre, idAsignatura): int?
  + buscarIdProfesorPorDocumento(documento): int?
  + upsertVinculo(idComision, idProfesor): void
}

' ───────────── Infraestructura compartida (PATRON SINGLETON) ─────────────
class SupabaseServer <<Singleton>> {
  + getSupabaseServer(): SupabaseClient
}

' ═════════ Relaciones (SOLO las que existen de verdad en el codigo) ═════════
ServicioResolucionReporte ..> Reporte
ServicioResolucionReporte ..> ReporteRepositorio
ServicioResolucionReporte ..> UsuarioRepositorio
ServicioResolucionReporte ..> NotificacionRepositorio
ServicioResolucionReporte ..> AuditoriaRepositorio
ReporteRepositorio ..> Reporte : reconstruye / persiste

ServicioComision ..> Comision
ServicioComision ..> ComisionRepositorio
ComisionRepositorio ..> Comision : crea / persiste

' Todos los repositorios comparten la MISMA instancia (Singleton) -> conecta el grafo
ReporteRepositorio ..> SupabaseServer
UsuarioRepositorio ..> SupabaseServer
NotificacionRepositorio ..> SupabaseServer
AuditoriaRepositorio ..> SupabaseServer
ComisionRepositorio ..> SupabaseServer
@enduml
```