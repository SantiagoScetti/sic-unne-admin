## 1. Diagrama de Clases del DOMINIO (Puro DOO - Vista Conceptual)

> **Esta vista es independiente de la arquitectura y la persistencia.** Contiene **únicamente las entidades del dominio** y sus relaciones de colaboración conceptuales, tal como exige la cátedra para el modelado puramente DOO (sin controladores, servicios de aplicación, repositorios ni detalles tecnológicos).

```plantuml
@startuml
skinparam classAttributeIconSize 0
title Diagrama de Clases del Dominio (Puro DOO) - SIC-UNNE

' ─── Entidad Reporte y su Maquina de Estados ───
class Reporte {
  + id_reporte: int
  + emisor_id: int?
  + receptor_id: int
  + id_periodo: int?
  + motivo: string
  + fecha_alta: string?
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
}

abstract class EstadoReporte {
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
Reporte "1" o--> "1" EstadoReporte : estado actual

' ─── Entidades de Usuario ───
class Usuario {
  + id_usuario: int
  + nombre: string
  + apellido: string
  + documento: int
  + correo: string
  + rol: string
  + suspendido_hasta: date?
  + suspender(fechaHasta: date?): void
}

' Relaciones conceptuales de Reporte y Usuario
Reporte "many" --> "1" Usuario : "reporta a (receptor)"
Reporte "many" --> "1" Usuario : "creado por (emisor)"
Reporte "many" --> "1" Usuario : "gestionado por (admin)"

' ─── Entidades del Dominio Academico (Comision) ───
class Comision {
  + id_comision: int?
  + nombre: string
  + letraDesde: char
  + letraHasta: char
  + id_asignatura: int
  + estado: boolean
  + profesoresIds: int[]
  + validar(): void
}

class Asignatura {
  + id_asignatura: int
  + nombre: string
  + anio_dictado: string
  + id_periodo: int?
  + id_carrera: int
}

class Profesor {
  + id_profesor: int
  + nombre: string
  + apellido: string
  + documento: int
  + correo: string
  + estado: boolean
}

Comision "many" --> "1" Asignatura : "pertenece a"
Comision "many" <--> "many" Profesor : "dictada por"

@enduml
```

1. **Diagrama de Clases del Dominio (Sección 1):** Es la vista conceptual abstracta (DOO Puro). Representa las entidades de negocio, sus atributos y sus colaboraciones conceptuales directas (por ejemplo, que un `Reporte` se asocia con un `Usuario` emisor y receptor, y delega su comportamiento de estado en un `EstadoReporte`). No sabe nada de bases de datos, APIs de Next.js, ni de cómo se persisten los objetos.