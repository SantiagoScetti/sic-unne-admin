# Diagrama de Clases del Dominio — SIC-UNNE

Este documento contiene dos vistas complementarias:

1. **Diagrama de Clases de Diseño** (sección 0): las clases reales del código `src/domain/`, con sus **métodos** y las jerarquías de los patrones Estado, Estrategia y Observador. Es la vista que demuestra el Diseño Orientado a Objetos.
2. **Diagrama de Clases de Datos / Entidades** (secciones 1-2): el mapeo de las tablas (atributos), útil como referencia del modelo persistente.

Se presentan en **Mermaid** (visualización nativa en GitHub/VSCode) y **PlantUML** (sintaxis académica estándar).

---

## 0. Diagrama de Clases de DISEÑO (dominio Reporte + Comisión)

> Esta es la vista que refleja el código y los **3 patrones de diseño**. Ver `docs/uml/patrones_diseno.md` para el detalle de cada patrón.

```plantuml
@startuml
skinparam classAttributeIconSize 0
title Clases de Diseño — Dominio Reporte (Estado + Estrategia + Observador) y Comisión

' ───────────── Entidad Reporte (Contexto del patrón Estado) ─────────────
class Reporte <<Context>> {
  + id_reporte: int
  + emisor_id: int?
  + receptor_id: int
  + motivo: string
  - _estado: EstadoReporte
  - _accionTomada: AccionTomada?
  - _adminId: int?
  + resolver(accion: AccionTomada): void
  + desestimar(): void
  + asignarAdmin(id: int): void
  + esPendiente(): boolean
  + emisorEsSistema(): boolean
  + aFilaPersistible(): object
}

' ───────────── PATRÓN ESTADO ─────────────
abstract class EstadoReporte <<State>> {
  + {abstract} nombre: string
  + resolver(r: Reporte, a: AccionTomada): void
  + desestimar(r: Reporte): void
}
class EstadoPendiente
class EstadoResuelto
class EstadoDesestimado
EstadoReporte <|-- EstadoPendiente
EstadoReporte <|-- EstadoResuelto
EstadoReporte <|-- EstadoDesestimado
Reporte o--> EstadoReporte

' ───────────── PATRÓN ESTRATEGIA ─────────────
interface AccionResolucion <<Strategy>> {
  + nombre: AccionTomada
  + aplicar(ctx: ContextoAccion): ResultadoAccion
}
class EnviarAviso
class SuspenderTemporalmente
class SuspenderIndefinidamente
AccionResolucion <|.. EnviarAviso
AccionResolucion <|.. SuspenderTemporalmente
AccionResolucion <|.. SuspenderIndefinidamente

' ───────────── PATRÓN OBSERVADOR ─────────────
class DispatcherEventos <<Subject>> {
  + suscribir(o: Observador): this
  + publicar(e: ReporteResueltoEvent): void
}
interface Observador <<Observer>> {
  + manejar(e: ReporteResueltoEvent): void
}
class NotificarUsuariosListener
class RegistrarAuditoriaListener
Observador <|.. NotificarUsuariosListener
Observador <|.. RegistrarAuditoriaListener
DispatcherEventos o--> Observador

' ───────────── Servicio de aplicación (coordina los 3 patrones) ─────────────
class ServicioResolucionReporte <<Service>> {
  + resolver(params): Reporte
  + desestimar(params): Reporte
}
ServicioResolucionReporte ..> Reporte
ServicioResolucionReporte ..> AccionResolucion
ServicioResolucionReporte ..> DispatcherEventos

' ───────────── Repositorios (infraestructura) ─────────────
class ReporteRepositorio <<Repository>> {
  + obtenerPorId(id): Reporte?
  + guardar(r: Reporte): void
}
class UsuarioRepositorio <<Repository>> {
  + suspender(id, fechaHasta): void
  + obtenerAdminPorDefecto(): int?
}
ServicioResolucionReporte ..> ReporteRepositorio
ServicioResolucionReporte ..> UsuarioRepositorio

' ───────────── Dominio Comisión (sin patrones especiales) ─────────────
class Comision <<Entity>> {
  + id_comision: int?
  + nombre: string
  + letraDesde: char
  + letraHasta: char
  + id_asignatura: int
  + profesoresIds: int[]
  + validar(): void
  + aFilaPersistible(): object
}
class ServicioComision <<Service>> {
  + crear(datos): Comision
  + actualizar(id, datos): Comision
  + cambiarEstado(id, estado): void
  + importarMasivo(filas): ResultadoImportacion
}
class ComisionRepositorio <<Repository>>
ServicioComision ..> Comision
ServicioComision ..> ComisionRepositorio
@enduml
```

---

## 1. Diagrama de Clases de DATOS / Entidades (modelo persistente)

> Vista de referencia: tablas y atributos. (Mantiene la versión previa del documento.)

---

## 1. Representación Gráfica (Mermaid)

```mermaid
classDiagram
    class Usuario {
        +int id_usuario
        +uuid auth_id
        +string nombre
        +string apellido
        +int documento
        +string correo
        +string estado
        +string rol
        +int id_carrera
        +date fecha_suspension_hasta
    }

    class Reporte {
        +int id_reporte
        +int emisor_id
        +int receptor_id
        +int id_periodo
        +string motivo
        +string estado
        +datetime fecha_alta
        +string resolucion_admin
        +string accion_tomada
        +int admin_id
    }

    class AuditoriaAdministrativa {
        +int id_log
        +int id_admin
        +int id_usuario_afectado
        +string accion
        +jsonb detalles
        +datetime fecha
    }

    class Notificacion {
        +int id_notificacion
        +int id_usuario
        +string tipo
        +string mensaje
        +boolean leido
        +datetime fecha
    }

    class Periodo {
        +int id_periodo
        +string nombre
        +date fecha_inicio
        +date fecha_fin
    }

    class Edificio {
        +int id_edificio
        +string nombre
        +string direccion
    }

    class Facultad {
        +int id_facultad
        +string nombre
        +string ciudad
        +int id_edificio
    }

    class Carrera {
        +int id_carrera
        +string nombre
        +int id_facultad
    }

    class Asignatura {
        +int id_asignatura
        +string nombre
        +string anio_dictado
        +int id_periodo
        +int id_carrera
    }

    class Comision {
        +int id_comision
        +string nombre
        +char letra_desde
        +char letra_hasta
        +int id_asignatura
        +boolean estado
    }

    class Profesor {
        +int id_profesor
        +string nombre
        +string apellido
        +int documento
        +string correo
        +boolean estado
    }

    class Aula {
        +int id_aula
        +string nombre
        +int id_edificio
    }

    class Horario {
        +int id_horario
        +string dia
        +time hora_inicio
        +time hora_fin
        +string modalidad
    }

    %% Relaciones
    Usuario "1" --> "0..*" Notificacion : recibe
    Usuario "1" --> "0..*" Reporte : emite (como emisor)
    Usuario "1" --> "0..*" Reporte : recibe (como receptor)
    Usuario "1" --> "0..*" Reporte : gestiona (como admin)
    
    Usuario "1" --> "0..*" AuditoriaAdministrativa : ejecuta (como admin)
    Usuario "1" --> "0..*" AuditoriaAdministrativa : es afectado (como usuario)

    Reporte "0..*" --> "1" Periodo : pertenece a

    Edificio "1" --> "0..*" Facultad : contiene
    Edificio "1" --> "0..*" Aula : alberga
    Facultad "1" --> "0..*" Carrera : dicta
    Carrera "1" --> "0..*" Asignatura : contiene
    Periodo "1" --> "0..*" Asignatura : abarca
    Asignatura "1" --> "0..*" Comision : se divide en

    %% Relaciones de Muchos a Muchos
    Comision "0..*" -- "1..*" Profesor : dictan (Comision_Profesor)
    Comision "0..*" -- "0..*" Horario : en (Horario_Comision)
    Horario_Comision "0..*" --> "1" Aula : asignada a
```

---

## 2. Definición en PlantUML

Puedes copiar y pegar este bloque de código directamente en [PlantText](https://www.planttext.com/) o en tu plugin de VSCode para generar el diagrama en PNG o SVG.

```plantuml
@startuml
skinparam classAttributeIconSize 0

class Usuario {
    + id_usuario: Integer
    + auth_id: UUID
    + nombre: String
    + apellido: String
    + documento: Integer
    + correo: String
    + estado: String
    + rol: String
    + id_carrera: Integer
    + fecha_suspension_hasta: Date
}

class Reporte {
    + id_reporte: Integer
    + emisor_id: Integer
    + receptor_id: Integer
    + id_periodo: Integer
    + motivo: String
    + estado: String
    + fecha_alta: DateTime
    + resolucion_admin: String
    + accion_tomada: String
    + admin_id: Integer
}

class AuditoriaAdministrativa {
    + id_log: Integer
    + id_admin: Integer
    + id_usuario_afectado: Integer
    + accion: String
    + detalles: JSONB
    + fecha: DateTime
}

class Notificacion {
    + id_notificacion: Integer
    + id_usuario: Integer
    + tipo: String
    + mensaje: String
    + leido: Boolean
    + fecha: DateTime
}

class Periodo {
    + id_periodo: Integer
    + nombre: String
    + fecha_inicio: Date
    + fecha_fin: Date
}

class Edificio {
    + id_edificio: Integer
    + nombre: String
    + direccion: String
}

class Facultad {
    + id_facultad: Integer
    + nombre: String
    + ciudad: String
    + id_edificio: Integer
}

class Carrera {
    + id_carrera: Integer
    + nombre: String
    + id_facultad: Integer
}

class Asignatura {
    + id_asignatura: Integer
    + nombre: String
    + anio_dictado: String
    + id_periodo: Integer
    + id_carrera: Integer
}

class Comision {
    + id_comision: Integer
    + nombre: String
    + letra_desde: Char
    + letra_hasta: Char
    + id_asignatura: Integer
    + estado: Boolean
}

class Profesor {
    + id_profesor: Integer
    + nombre: String
    + apellido: String
    + documento: Integer
    + correo: String
    + estado: Boolean
}

class Aula {
    + id_aula: Integer
    + nombre: String
    + id_edificio: Integer
}

class Horario {
    + id_horario: Integer
    + dia: String
    + hora_inicio: Time
    + hora_fin: Time
    + modalidad: String
}

' Relaciones de Asociación
Usuario "1" --> "0..*" Notificacion : recibe >
Usuario "1" --> "0..*" Reporte : emite (como emisor) >
Usuario "1" --> "0..*" Reporte : recibe (como receptor) >
Usuario "1" --> "0..*" Reporte : gestiona (como admin) >

Usuario "1" --> "0..*" AuditoriaAdministrativa : ejecuta (como admin) >
Usuario "1" --> "0..*" AuditoriaAdministrativa : afectado >

Reporte "0..*" --> "1" Periodo : pertenece a >

Edificio "1" --> "0..*" Facultad : contiene >
Edificio "1" --> "0..*" Aula : alberga >
Facultad "1" --> "0..*" Carrera : dicta >
Carrera "1" --> "0..*" Asignatura : contiene >
Periodo "1" --> "0..*" Asignatura : abarca >
Asignatura "1" --> "0..*" Comision : se divide en >

' Muchos a muchos representados asociativamente
Comision "0..*" -- "1..*" Profesor : dictan (Comision_Profesor) >
Comision "0..*" -- "0..*" Horario : en (Horario_Comision) >
(Comision, Horario) .. Horario_Comision

class Horario_Comision {
    + id_comision: Integer
    + id_horario: Integer
    + id_aula: Integer
}

Horario_Comision "0..*" --> "1" Aula : asignada a >

@enduml
```
