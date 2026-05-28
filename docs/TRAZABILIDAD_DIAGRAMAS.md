# Trazabilidad de Diagramas SIC-UNNE

## C-01: Gestionar Reportes y Resolución de Conflictos

### Figura 3 (caso normal)

1: Ingresa al panel de reportes -> src/pages/ReportesPage.jsx
2: obtenerReportes() -> src/services/reporte.service.js linea 14
3: Verifica los reportes 
4: Devuelve lista de reportes 
5: Se muestra lista y opciones de filtrado -> ReportesPage.jsx linea 126 (render de controles de filtro)
6: Selecciona filtro "Pendiente" -> ReportesPage.jsx linea 133 (onChange del select)
7: obtenerReportesFiltrados("Pendiente") -> ReportesPage.jsx linea 88 (llamada a la función del servicio)
8: Filtra por estado 
9: Devuelve reportes filtrados 
10: Se muestra lista filtrada -> ReportesPage.jsx linea 167 (mapeo del array reportes)
11: Hace click en un reporte -> ReportesPage.jsx linea 187 (onClick del botón Abrir)
12: obtenerDetalleReporte(id_reporte) -> src/services/reporte.service.js linea 83 (llamada desde Frontend pendiente de implementación)
13: Devuelve detalle del reporte 
14: Se muestra detalle completo (Pendiente implementación UI)
15: Selecciona accion y resuelve (Pendiente implementación UI)
16: actualizarEstado(id_reporte, "Resuelto", resolucion) -> src/services/reporte.service.js linea 115
17: Procesa actualizacion 
18: estado_actualizado
19: actualizarFechaSuspension(receptor_id, duracion) -> src/services/usuario.service.js linea 16
20: Registra suspension 
21: fecha_actualizada 
22: registrar(id_reporte, accion, admin_id) -> src/services/auditoriaAdministrativa.service.js linea 17
23: auditoria_registrada 
24: notificar(emisor_id, receptor_id) -> src/services/notificacion.service.js linea 16
25: notificacion_enviada
26: "Reporte actualizado" -> (Pendiente implementación UI)

### Figura 4 (caso alternativo)

1: Ingresa al panel de reportes -> src/pages/ReportesPage.jsx
2: obtenerReportes() -> src/services/reporte.service.js linea 14
3: Verifica los reportes 
4: Devuelve lista de reportes 
5: Se muestra lista y opciones de filtrado -> ReportesPage.jsx linea 126 (render de controles de filtro)
6: Selecciona filtro "Pendiente" -> ReportesPage.jsx linea 133 (onChange del select)
7: obtenerReportesFiltrados("Pendiente") -> ReportesPage.jsx linea 88 (llamada a la función del servicio)
8: Filtra por estado 
9: Devuelve reportes filtrados 
10: Se muestra lista filtrada -> ReportesPage.jsx linea 167 (mapeo del array reportes)
11: Hace click en un reporte -> ReportesPage.jsx linea 187 (onClick del botón Abrir)
12: obtenerDetalleReporte(id_reporte) -> src/services/reporte.service.js linea 83 (llamada desde Frontend pendiente de implementación)
13: Verifica estado actual -> (Lógica pendiente de implementación en servicio/BD)
EL SISTEMA DETECTA QUE EL REPORTE YA NO ESTA PENDIENTE
14: error_reporte_gestionado -> (Lógica pendiente de implementación en servicio: lanzar excepción)
15: "Reporte ya gestionado" -> (Pendiente implementación UI)




## C-02: Crear Comisión

### Figura 5 (caso normal)

1: Ingresa a estructura academica -> src/pages/EstructuraPage.jsx                                  
2: Se muestran entidades existentes -> EstructuraPage.jsx linea 574                                  
3: Hace click en "Comisiones" -> EstructuraPage.jsx linea 581
4: Se muestra listado de comisiones y botones -> EstructuraPage.jsx linea 520
5: Hace click en "Crear Comision" -> EstructuraPage.jsx linea 581
6: Se muestra formulario para crear comision -> EstructuraPage.jsx linea 635
7: Completa todos los campos y confirma -> addComisionModal.tsx linea 105
8: validarCampos() -> addComisionModal.tsx linea 61
9: verificarExistencia(id_asignatura) -> asignatura.service.js linea 16
10: Verifica existencia 
11: asignatura_verificada 
12: crear(nombre, letraDesde, letraHasta, id_asignatura) -> comision.service.js linea 20
13: Crea el registro 
14: comision_creada 
15: asignar(id_comision, profesores_ids) -> profesor.service.js linea 16
16: Verifica disponibilidad 
17: profesores_asignados 
18: "Comision creada con exito" -> EstructuraPage.jsx linea 189


### Figura 6 (caso alternativo)

1: Ingresa a estructura academica -> src/pages/EstructuraPage.jsx                                  
2: Se muestran entidades existentes -> EstructuraPage.jsx linea 574                                  
3: Hace click en "Comisiones" -> EstructuraPage.jsx linea 581
4: Se muestra listado de comisiones y botones -> EstructuraPage.jsx linea 520
5: Hace click en "Crear Comision" -> EstructuraPage.jsx linea 581
6: Se muestra formulario para crear comision -> EstructuraPage.jsx linea 635
7: Completa todos los campos y confirma -> addComisionModal.tsx linea 105
8: validarCampos() -> addComisionModal.tsx linea 61
SE DETECTAN CAMPOS OBLIGATORIOS VACIOS O FORMATOS INCORRECTOS
9: Muestra avisos de validacion en los campos afectados -> addComisionModal.tsx linea 89 (setErrores) y 148 (render de los mensajes)
10: Corrige datos y confirma -> addComisionModal.tsx linea 105
11: validarCampos() -> addComisionModal.tsx linea 61
A PARTIR DE AQUI EL FLUJO RETOMA EL CURSO NORMAL -> ver linea 15 del documento actual



## C-03: Importar Datos Masivamente

### Figura 7 (caso normal)

1: Ingresa a estructura academica -> src/pages/EstructuraPage.jsx
2: Se muestran entidades y botones -> EstructuraPage.jsx linea 574 (render de tarjetas principales)
3: Hace click en el boton "Importar CSV" -> EstructuraPage.jsx linea 595 (botón que abre el selector)
4: Se abre explorador de archivos -> (Manejado por el SO nativo)
5: Selecciona archivo CSV -> EstructuraPage.jsx linea 592 (evento onChange del input file)
6: validarFormatoArchivo(archivo) -> src/services/csvParser.js linea 38
7: parsearCSV(archivo) -> src/services/csvParser.js linea 48
8: validarEsquema(filas) -> src/services/csvParser.js linea 64
9: detectarDuplicados(filas) -> src/services/csvParser.js linea 90
10: detectarIncompletos(filas) -> src/services/csvParser.js linea 116
11: detectarFormatosInvalidos(filas) -> src/services/csvParser.js linea 140
12: insertar(filas) -> src/services/edificio.service.js linea 16
13: edificios_insertados -> 
14: insertar(filas) -> src/services/facultad.service.js linea 16
15: facultades_insertadas -> 
16: insertar(filas) -> src/services/carrera.service.js linea 13
17: carreras_insertadas -> 
18: insertar(filas) -> src/services/periodo.service.js linea 14
19: periodos_insertados -> 
20: insertar(filas) -> src/services/asignatura.service.js linea 33
21: asignaturas_insertadas -> 
22: insertar(filas) -> src/services/profesor.service.js linea 32
23: profesores_insertados -> 
24: insertar(filas) -> src/services/comision.service.js linea 44
25: comisiones_insertadas -> 
26: "Importación de datos con éxito" -> EstructuraPage.jsx linea 350 (setMensajeExito)


### Figura 8 (caso alternativo)
1: Ingresa a estructura academica -> src/pages/EstructuraPage.jsx
2: Se muestran entidades y botones -> EstructuraPage.jsx linea 574 (render de tarjetas principales)
3: Hace click en el boton "Importar CSV" -> EstructuraPage.jsx linea 595 (botón que abre el selector)
4: Se abre explorador de archivos -> (Manejado por el SO nativo)
5: Selecciona archivo CSV -> EstructuraPage.jsx linea 592 (evento onChange del input file)
6: validarFormatoArchivo(archivo) -> src/services/csvParser.js linea 38
7: parsearCSV(archivo) -> src/services/csvParser.js linea 48
8: validarEsquema(filas) -> src/services/csvParser.js linea 64
9: detectarDuplicados(filas) -> src/services/csvParser.js linea 90
10: detectarIncompletos(filas) -> src/services/csvParser.js linea 116
11: detectarFormatosInvalidos(filas) -> src/services/csvParser.js linea 140
EL SISTEMA DETECTA DATOS INVALIDOS, INCOMPLETOS O DUPLICADOS
12: "Mensaje de error específico del parser" -> EstructuraPage.jsx linea 568 (render del bloque de errorMessage, seteado mediante setErrorMessage en líneas 293, 302, 311 o 320 según corresponda el fallo)