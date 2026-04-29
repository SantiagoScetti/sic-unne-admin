# Trazabilidad: Diagramas de Secuencia ↔ Código

Este documento conecta cada paso de los diagramas de secuencia con su función exacta
en el código fuente del proyecto SIC-UNNE (Módulo de Administración).

**Participantes válidos en todos los diagramas:**
`Administrador → Vista React → Servicio JS`

---

## C-01: Gestionar Reportes y Resolución de Conflictos

> **Archivo del servicio:** `src/services/reportesService.js`  
> **Vista React:** `src/pages/ReportesPage.jsx`

| Paso en el diagrama | Función en el código | Archivo | Qué hace |
|---|---|---|---|
| `obtenerReportes()` | `obtenerReportes()` | `reportesService.js` | Trae todos los reportes con datos de emisor y receptor, ordenados por fecha. |
| `obtenerReportesFiltrados(estado)` | `obtenerReportesFiltrados(estado)` | `reportesService.js` | Filtra los reportes por estado ('Pendiente', 'Resuelto', etc.) directamente en Supabase. |
| `obtenerDetalleReporte(id_reporte)` | `obtenerDetalleReporte(id_reporte)` | `reportesService.js` | Trae un único reporte por ID con todos sus datos relacionados (usuarios, período). |
| `actualizarEstadoReporte(id_reporte, estado, resolucion)` | `actualizarEstadoReporte(id_reporte, estado, resolucion)` | `reportesService.js` | Actualiza el estado del reporte y guarda la resolución del administrador. Mensaje: "Reporte actualizado". |
| `suspenderUsuario(receptor_id, duracion)` | `suspenderUsuario(receptor_id, duracion)` | `reportesService.js` | Registra la suspensión del usuario reportado mediante una notificación de tipo 'suspension'. |
| `registrarAuditoria(id_reporte, accion, admin_id)` | `registrarAuditoria(id_reporte, accion, admin_id)` | `reportesService.js` | Inserta un registro en `auditoria_administrativa` con la acción tomada por el administrador. |
| `enviarNotificaciones(emisor_id, receptor_id)` | `enviarNotificaciones(emisor_id, receptor_id)` | `reportesService.js` | Inserta notificaciones para ambos usuarios involucrados en el reporte. |

---

## C-02: Crear Comisión

> **Archivo del servicio:** `src/services/estructuraService.js`  
> **Vista React:** `src/pages/EstructuraPage.jsx` (mediante `AddComisionModal`)

| Paso en el diagrama | Función en el código | Archivo | Qué hace |
|---|---|---|---|
| `crearComision(datos)` | `crearComision(comisionData)` | `estructuraService.js` | Orquestador principal. Llama en secuencia a los tres pasos de abajo. Mensaje de éxito: "Comisión creada con éxito". |
| `verificarAsignaturaExiste(id_asignatura)` | `verificarAsignaturaExiste(id_asignatura)` | `estructuraService.js` | Helper privado (paso 1): consulta si la asignatura existe antes de crear la comisión. Lanza error si no existe. |
| `insertarComision(row)` | `insertarComision(row)` | `estructuraService.js` | Helper privado (paso 2): hace el INSERT en la tabla `comision` y retorna el registro creado con su ID. |
| `asignarProfesores(id_comision, profesores_ids)` | `asignarProfesores(id_comision, profesores_ids)` | `estructuraService.js` | Helper privado (paso 3): inserta las relaciones N:M en la tabla `comision_profesor`. |

---

## C-03: Importar Datos Masivamente

> **Archivo del parser:** `src/services/csvParser.js`  
> **Archivo del servicio:** `src/services/estructuraService.js`  
> **Vista React:** `src/pages/EstructuraPage.jsx` (función `handleFileUpload`)

### Cadena de validación (en csvParser.js)

| Paso en el diagrama | Función en el código | Archivo | Qué hace |
|---|---|---|---|
| `validarFormatoArchivo(archivo)` | `validarFormatoArchivo(archivo)` | `csvParser.js` | Verifica que el archivo tenga extensión `.csv`. Retorna `true/false`. Mensaje de error: "El archivo seleccionado es inválido". |
| `parsearCSV(archivo)` | `parsearCSV(archivo)` | `csvParser.js` | Convierte el archivo `.csv` en un array de objetos usando PapaParse. Retorna una Promise. |
| `validarEsquema(filas)` | `validarEsquema(filas)` | `csvParser.js` | Verifica que todas las columnas requeridas del SP estén presentes en el CSV. Retorna array de errores. |
| `detectarDuplicados(filas)` | `detectarDuplicados(filas)` | `csvParser.js` | Detecta filas con la misma combinación comisión+asignatura dentro del CSV. Mensaje: "Revise los datos de la entidad 'Comisión', se encontraron duplicados". |
| `detectarIncompletos(filas)` | `detectarIncompletos(filas)` | `csvParser.js` | Detecta campos requeridos vacíos o nulos en cualquier fila. Mensaje: "Revise los datos de la entidad '...', se encontraron datos incompletos". |
| `detectarFormatosInvalidos(filas)` | `detectarFormatosInvalidos(filas)` | `csvParser.js` | Valida formatos: fechas YYYY-MM-DD, documento numérico entero, letras de comisión de 1 carácter. |

### Importación por entidad en el servicio JS (en estructuraService.js)

| Paso en el diagrama | Función en el código | Archivo | Qué hace |
|---|---|---|---|
| `importarEstructuraAcademica(filas)` | `importarEstructuraAcademica(filas)` | `estructuraService.js` | Orquestador principal. Llama a los 7 métodos de abajo en orden. Mensaje de éxito: "Archivo importado con éxito". |
| `insertarEdificios(filas)` | `insertarEdificios(filas)` | `estructuraService.js` | Deduplica y hace upsert de edificios en la tabla `edificio`. |
| `insertarFacultades(filas)` | `insertarFacultades(filas)` | `estructuraService.js` | Deduplica y hace upsert de facultades, resolviendo el `id_edificio` por nombre. |
| `insertarCarreras(filas)` | `insertarCarreras(filas)` | `estructuraService.js` | Deduplica y hace upsert de carreras, resolviendo el `id_facultad` por nombre. |
| `insertarPeriodos(filas)` | `insertarPeriodos(filas)` | `estructuraService.js` | Deduplica y hace upsert de períodos por nombre y fecha de inicio. |
| `insertarAsignaturas(filas)` | `insertarAsignaturas(filas)` | `estructuraService.js` | Deduplica y hace upsert de asignaturas, resolviendo `id_carrera` e `id_periodo`. |
| `insertarProfesores(filas)` | `insertarProfesores(filas)` | `estructuraService.js` | Deduplica y hace upsert de profesores por número de documento. |
| `insertarComisiones(filas)` | `insertarComisiones(filas)` | `estructuraService.js` | Inserta comisiones y sus relaciones con profesores en `comision_profesor`. |

---

## Mensajes de interfaz exactos (según caso de uso)

| Situación | Mensaje mostrado al usuario |
|---|---|
| Archivo sin extensión `.csv` | `"El archivo seleccionado es inválido"` |
| Filas duplicadas en el CSV | `"Revise los datos de la entidad 'Comisión', se encontraron duplicados: ..."` |
| Campos obligatorios vacíos | `"Revise los datos de la entidad '...', se encontraron datos incompletos: ..."` |
| Error al persistir en Supabase | `"Error en la importación de datos"` |
| Importación exitosa | `"Archivo importado con éxito"` |
| Comisión creada correctamente | `"Comisión creada con éxito"` (generado en EstructuraPage) |
| Error al crear comisión | `"Error en crear comisión"` (generado en EstructuraPage) |
| Reporte actualizado | `"Reporte actualizado"` (reportesService.js → actualizarEstadoReporte) |

---

## Seguridad y RLS

> **Nota:** Las políticas RLS de Supabase se configuraron directamente en el panel de Supabase
> y no se modifican en esta refactorización. La lógica de validación fue movida al servicio JS,
> pero la capa de seguridad de la base de datos sigue intacta.

### Lo que sabemos de las políticas activas

| Tabla | Rol que accede | Cómo se aplica |
|---|---|---|
| `edificio` | `authenticated` | Solo usuarios autenticados pueden leer/escribir. El SP usa `SECURITY DEFINER` con `GRANT EXECUTE TO authenticated`. |
| `facultad` | `authenticated` | Ídem. Las escrituras usan el cliente autenticado de Next.js. |
| `carrera` | `authenticated` | Ídem. |
| `periodo` | `authenticated` | Ídem. |
| `asignatura` | `authenticated` | Ídem. |
| `profesor` | `authenticated` | Ídem. |
| `comision` | `authenticated` | Ídem. |
| `comision_profesor` | `authenticated` | Ídem. |
| `reporte` | `authenticated` | El administrador lee y modifica reportes. Solo usuarios autenticados acceden. |
| `auditoria_administrativa` | `authenticated` | Solo el administrador inserta registros de auditoría. |
| `notificacion` | `authenticated` | Los usuarios autenticados reciben sus notificaciones. |

### Cómo funciona la autenticación en el código

El archivo `src/lib/supabase/client.ts` crea el cliente Supabase con la clave `anon`.
Las políticas RLS de Supabase validan automáticamente el JWT del usuario en cada
request. Solo los usuarios con sesión activa (rol `authenticated`) pueden ejecutar
las operaciones del módulo de administración.

La función RPC `importar_estructura_academica` (el SP original, que se mantiene disponible)
usa `SECURITY DEFINER`, lo que significa que se ejecuta con los permisos del propietario
de la función, pero solo puede ser invocada por el rol `authenticated`.

---

*Documento generado el 2026-04-29. Actualizar cada vez que se modifiquen los diagramas de secuencia.*
