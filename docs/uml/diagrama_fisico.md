# Diagrama Físico de Base de Datos — SIC-UNNE

Este documento contiene la representación visual en formato **Mermaid ER** de la base de datos física del sistema (SIC-UNNE). Este diagrama detalla los tipos de datos exactos, las claves primarias (PK) y claves foráneas (FK) tal como están definidas en tu esquema físico de PostgreSQL.

Puedes copiar este código Mermaid y visualizarlo en Notion, GitHub, VSCode, o renderizarlo en [Mermaid Live Editor](https://mermaid.live).

---

## Modelo Entidad-Relación Físico (Mermaid)

```mermaid
erDiagram
    usuario {
        integer id_usuario PK
        uuid auth_id FK
        character_varying nombre
        character_varying apellido
        integer documento
        character_varying correo
        character_varying estado
        character_varying rol
        integer id_carrera FK
        date fecha_suspension_hasta
    }

    denuncia {
        integer id_denuncia PK
        integer emisor_id FK
        integer receptor_id FK
        integer id_periodo FK
        character_varying motivo
        character_varying estado
        timestamp_without_time_zone fecha_alta
        text resolucion_admin
        character_varying accion_tomada
        integer admin_id FK
    }

    auditoria_administrativa {
        integer id_log PK
        integer id_admin FK
        integer id_usuario_afectado FK
        character_varying accion
        jsonb detalles
        timestamp_without_time_zone fecha
    }

    notificacion {
        integer id_notificacion PK
        integer id_usuario FK
        character_varying tipo
        character_varying mensaje
        boolean leido
        timestamp_without_time_zone fecha
    }

    periodo {
        integer id_periodo PK
        character_varying nombre
        date fecha_inicio
        date fecha_fin
    }

    edificio {
        integer id_edificio PK
        character_varying nombre
        character_varying direccion
    }

    facultad {
        integer id_facultad PK
        character_varying nombre
        character_varying ciudad
        integer id_edificio FK
    }

    carrera {
        integer id_carrera PK
        character_varying nombre
        integer id_facultad FK
    }

    asignatura {
        integer id_asignatura PK
        character_varying nombre
        character_varying anio_dictado
        integer id_periodo FK
        integer id_carrera FK
    }

    comision {
        integer id_comision PK
        character_varying nombre
        character letra_desde
        character letra_hasta
        integer id_asignatura FK
        boolean estado
    }

    profesor {
        integer id_profesor PK
        character_varying nombre
        character_varying apellido
        integer documento
        character_varying correo
        boolean estado
    }

    comision_profesor {
        integer id_comision PK, FK
        integer id_profesor PK, FK
    }

    aula {
        integer id_aula PK
        character_varying nombre
        integer id_edificio FK
    }

    horario {
        integer id_horario PK
        character_varying dia
        time_without_time_zone hora_inicio
        time_without_time_zone hora_fin
        character_varying modalidad
    }

    horario_comision {
        integer id_horario PK, FK
        integer id_comision PK, FK
        integer id_aula FK
    }

    inscripcion {
        integer id_inscripcion PK
        date fecha_alta
        boolean estado
        integer id_comision FK
        integer id_usuario FK
    }

    lista_espera {
        integer id_lista_espera PK
        date fecha_alta
        character_varying estado
        integer id_usuario FK
        integer id_comision_origen FK
        integer id_comision_destino FK
    }

    propuesta {
        integer id_propuesta PK
        timestamp_without_time_zone fecha_alta
        character_varying estado
        integer id_listaespera_1 FK
        integer id_listaespera_2 FK
    }

    respuesta_propuesta {
        integer id_respuesta PK
        integer id_propuesta FK
        integer id_usuario FK
        character_varying decision
        character_varying motivo_rechazo
        timestamp_without_time_zone fecha
    }

    comprobante {
        integer id_comprobante PK
        integer id_propuesta FK
        integer id_usuario_1 FK
        integer id_usuario_2 FK
        timestamp_without_time_zone fecha_emision
    }

    constancia {
        integer id_constancia PK
        integer id_usuario FK
        character_varying constancia_url
        timestamp_without_time_zone fecha_constancia
    }

    %% Definición de Relaciones Físicas (FK)
    usuario ||--o{ notificacion : "id_usuario"
    usuario ||--o{ constancia : "id_usuario"
    usuario ||--o{ inscripcion : "id_usuario"
    usuario ||--o{ lista_espera : "id_usuario"
    usuario ||--o{ respuesta_propuesta : "id_usuario"
    
    usuario ||--o{ comprobante : "id_usuario_1"
    usuario ||--o{ comprobante : "id_usuario_2"

    usuario ||--o{ denuncia : "emisor_id"
    usuario ||--o{ denuncia : "receptor_id"
    usuario ||--o{ denuncia : "admin_id"

    usuario ||--o{ auditoria_administrativa : "id_admin"
    usuario ||--o{ auditoria_administrativa : "id_usuario_afectado"

    periodo ||--o{ denuncia : "id_periodo"
    periodo ||--o{ asignatura : "id_periodo"

    edificio ||--o{ facultad : "id_edificio"
    edificio ||--o{ aula : "id_edificio"

    facultad ||--o{ carrera : "id_facultad"
    carrera ||--o{ usuario : "id_carrera"
    carrera ||--o{ asignatura : "id_carrera"

    asignatura ||--o{ comision : "id_asignatura"

    comision ||--o{ comision_profesor : "id_comision"
    profesor ||--o{ comision_profesor : "id_profesor"

    comision ||--o{ inscripcion : "id_comision"
    comision ||--o{ lista_espera : "id_comision_origen"
    comision ||--o{ lista_espera : "id_comision_destino"

    comision ||--o{ horario_comision : "id_comision"
    horario ||--o{ horario_comision : "id_horario"
    aula ||--o{ horario_comision : "id_aula"

    lista_espera ||--o{ propuesta : "id_listaespera_1"
    lista_espera ||--o{ propuesta : "id_listaespera_2"

    propuesta ||--o{ respuesta_propuesta : "id_propuesta"
    propuesta ||--o{ comprobante : "id_propuesta"
```
