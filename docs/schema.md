Esquema public — Documentación de tablas, columnas y Foreign Keys
asignatura
Columnas

id_asignatura (integer)
nombre (character varying)
anio_dictado (character varying)
id_periodo (integer)
id_carrera (integer)
Foreign Keys

id_carrera → carrera.id_carrera (constraint: asignatura_id_carrera_fkey)
id_periodo → periodo.id_periodo (constraint: asignatura_id_periodo_fkey)
asignatura_profesor
Columnas

id_asignatura (integer)
id_profesor (integer)
Foreign Keys

id_asignatura → asignatura.id_asignatura (constraint: asignatura_profesor_id_asignatura_fkey)
id_profesor → profesor.id_profesor (constraint: asignatura_profesor_id_profesor_fkey)
auditoria_administrativa
Columnas

id_log (integer)
id_admin (integer)
id_usuario_afectado (integer)
accion (character varying)
detalles (jsonb)
fecha (timestamp without time zone)
Foreign Keys

id_admin → usuario.id_usuario (constraint: auditoria_administrativa_id_admin_fkey)
id_usuario_afectado → usuario.id_usuario (constraint: auditoria_administrativa_id_usuario_afectado_fkey)
aula
Columnas

id_aula (integer)
nombre (character varying)
id_edificio (integer)
Foreign Keys

id_edificio → edificio.id_edificio (constraint: aula_id_edificio_fkey)
carrera
Columnas

id_carrera (integer)
nombre (character varying)
id_facultad (integer)
Foreign Keys

id_facultad → facultad.id_facultad (constraint: carrera_id_facultad_fkey)
comision
Columnas

id_comision (integer)
nombre (character varying)
letra_desde (character)
letra_hasta (character)
id_asignatura (integer)
Foreign Keys

id_asignatura → asignatura.id_asignatura (constraint: comision_id_asignatura_fkey)
comision_profesor
Columnas

id_comision (integer)
id_profesor (integer)
Foreign Keys

id_comision → comision.id_comision (constraint: comision_profesor_id_comision_fkey)
id_profesor → profesor.id_profesor (constraint: comision_profesor_id_profesor_fkey)
comprobante
Columnas

id_comprobante (integer)
id_propuesta (integer)
id_usuario_1 (integer)
id_usuario_2 (integer)
fecha_emision (timestamp without time zone)
Foreign Keys

id_propuesta → propuesta.id_propuesta (constraint: comprobante_id_propuesta_fkey)
id_usuario_1 → usuario.id_usuario (constraint: comprobante_id_usuario_1_fkey)
id_usuario_2 → usuario.id_usuario (constraint: comprobante_id_usuario_2_fkey)
constancia
Columnas

id_constancia (integer)
id_usuario (integer)
constancia_url (character varying)
fecha_constancia (timestamp without time zone)
Foreign Keys

id_usuario → usuario.id_usuario (constraint: constancia_id_usuario_fkey)
edificio
Columnas

id_edificio (integer)
nombre (character varying)
direccion (character varying)
Foreign Keys

(no se listaron Foreign Keys para esta tabla en tus outputs)
facultad
Columnas

id_facultad (integer)
nombre (character varying)
ciudad (character varying)
id_edificio (integer)
Foreign Keys

id_edificio → edificio.id_edificio (constraint: facultad_id_edificio_fkey)
horario
Columnas

id_horario (integer)
dia (character varying)
hora_inicio (time without time zone)
hora_fin (time without time zone)
modalidad (character varying)
Foreign Keys

(no se listaron Foreign Keys para esta tabla en tus outputs)
horario_comision
Columnas

id_horario (integer)
id_comision (integer)
id_aula (integer)
Foreign Keys

id_aula → aula.id_aula (constraint: horario_comision_id_aula_fkey)
id_comision → comision.id_comision (constraint: horario_comision_id_comision_fkey)
id_horario → horario.id_horario (constraint: horario_comision_id_horario_fkey)
inscripcion
Columnas

id_inscripcion (integer)
fecha_alta (date)
estado (boolean)
id_comision (integer)
id_usuario (integer)
Foreign Keys

id_comision → comision.id_comision (constraint: inscripcion_id_comision_fkey)
id_usuario → usuario.id_usuario (constraint: inscripcion_id_usuario_fkey)
lista_espera
Columnas

id_lista_espera (integer)
fecha_alta (date)
estado (character varying)
id_usuario (integer)
id_comision_origen (integer)
id_comision_destino (integer)
Foreign Keys

id_usuario → usuario.id_usuario (constraint: lista_espera_id_usuario_fkey)
id_comision_origen → comision.id_comision (constraint: lista_espera_id_comision_origen_fkey)
id_comision_destino → comision.id_comision (constraint: lista_espera_id_comision_destino_fkey)
notificacion
Columnas

id_notificacion (integer)
id_usuario (integer)
tipo (character varying)
mensaje (character varying)
leido (boolean)
fecha (timestamp without time zone)
Foreign Keys

id_usuario → usuario.id_usuario (constraint: notificacion_id_usuario_fkey)
periodo
Columnas

id_periodo (integer)
nombre (character varying)
fecha_inicio (date)
fecha_fin (date)
Foreign Keys

(no se listaron Foreign Keys para esta tabla en tus outputs)
profesor
Columnas

id_profesor (integer)
nombre (character varying)
apellido (character varying)
documento (integer)
correo (character varying)
estado (boolean)
Foreign Keys

(no se listaron Foreign Keys para esta tabla en tus outputs)
propuesta
Columnas

id_propuesta (integer)
fecha_alta (timestamp without time zone)
estado (character varying)
id_listaespera_1 (integer)
id_listaespera_2 (integer)
Foreign Keys

id_listaespera_1 → lista_espera.id_lista_espera (constraint: propuesta_id_listaespera_1_fkey)
id_listaespera_2 → lista_espera.id_lista_espera (constraint: propuesta_id_listaespera_2_fkey)
reporte
Columnas

id_reporte (integer)
emisor_id (integer)
receptor_id (integer)
id_periodo (integer)
motivo (character varying)
estado (character varying)
fecha_alta (timestamp without time zone)
resolucion_admin (text)
accion_tomada (character varying)
admin_id (integer)
Foreign Keys

admin_id → usuario.id_usuario (constraint: reporte_admin_id_fkey)
emisor_id → usuario.id_usuario (constraint: reporte_emisor_id_fkey)
receptor_id → usuario.id_usuario (constraint: reporte_receptor_id_fkey)
id_periodo → periodo.id_periodo (constraint: reporte_id_periodo_fkey)
respuesta_propuesta
Columnas

id_respuesta (integer)
id_propuesta (integer)
id_usuario (integer)
decision (character varying)
motivo_rechazo (character varying)
fecha (timestamp without time zone)
Foreign Keys

id_propuesta → propuesta.id_propuesta (constraint: respuesta_propuesta_id_propuesta_fkey)
id_usuario → usuario.id_usuario (constraint: respuesta_propuesta_id_usuario_fkey)
usuario
Columnas

id_usuario (integer)
auth_id (uuid)
Foreign Keys

id_usuario → (no hay Foreign Keys salientes listadas para esta tabla en tus outputs)

Mapa de relaciones (grafo) entre tablas (según tus Foreign Keys)
Relaciones desde tablas “hijas” hacia tablas “padre”

asignatura
id_carrera → carrera.id_carrera
id_periodo → periodo.id_periodo
asignatura_profesor
id_asignatura → asignatura.id_asignatura
id_profesor → profesor.id_profesor
auditoria_administrativa
id_admin → usuario.id_usuario
id_usuario_afectado → usuario.id_usuario
aula
id_edificio → edificio.id_edificio
carrera
id_facultad → facultad.id_facultad
comision
id_asignatura → asignatura.id_asignatura
comision_profesor
id_comision → comision.id_comision
id_profesor → profesor.id_profesor
comprobante
id_propuesta → propuesta.id_propuesta
id_usuario_1 → usuario.id_usuario
id_usuario_2 → usuario.id_usuario
constancia
id_usuario → usuario.id_usuario
facultad
id_edificio → edificio.id_edificio
horario_comision
id_aula → aula.id_aula
id_comision → comision.id_comision
id_horario → horario.id_horario
inscripcion
id_comision → comision.id_comision
id_usuario → usuario.id_usuario
lista_espera
id_usuario → usuario.id_usuario
id_comision_origen → comision.id_comision
id_comision_destino → comision.id_comision
notificacion
id_usuario → usuario.id_usuario
propuesta
id_listaespera_1 → lista_espera.id_lista_espera
id_listaespera_2 → lista_espera.id_lista_espera
reporte
admin_id → usuario.id_usuario
emisor_id → usuario.id_usuario
receptor_id → usuario.id_usuario
id_periodo → periodo.id_periodo
respuesta_propuesta
id_propuesta → propuesta.id_propuesta
id_usuario → usuario.id_usuario
usuario
(sin FKs salientes listadas en tus outputs)
Bloques / “clusters” principales (por tema)
Organización académica
carrera → facultad → edificio
asignatura → carrera
asignatura → periodo
comision → asignatura
Asignación/agenda
comision_profesor → comision, profesor
asignatura_profesor → asignatura, profesor
horario_comision → comision, aula, horario
Flujo de solicitudes / estados
inscripcion → comision, usuario
lista_espera → usuario, comision (origen/destino)
propuesta → lista_espera (dos referencias)
respuesta_propuesta → propuesta, usuario
comprobante → propuesta, usuario (dos usuarios)
constancia → usuario
Auditoría / comunicación / reportes
auditoria_administrativa → usuario (admin + afectado)
notificacion → usuario
reporte → usuario (admin/emisor/receptor) + periodo