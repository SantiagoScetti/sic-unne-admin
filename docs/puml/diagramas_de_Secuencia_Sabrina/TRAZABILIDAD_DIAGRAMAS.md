# Trazabilidad de Diagramas SIC-UNNE

---

## C-01: Gestionar Denuncias y Resolución de Conflictos

### Figura 3 — Caso Normal (31 pasos)

1: Ingresa al panel administrativo y hace click en "Denuncias" --> (acción implícita del usuario — sin correspondencia directa en el código)
2: Solicita lista de Denuncias --> DenunciasPage.jsx Linea 65 (llamada a obtenerDenuncias())
3: obtenerDenuncias() --> denuncia.service.js Linea 10 (fetch GET /api/denuncias) / api/denuncias/index.js Linea 34 (query plana a tabla `denuncia`)
4: [loop por cada denuncia] Solicita datos del receptor_id --> api/denuncias/index.js Linea 51-52 (recopila receptor_ids únicos e instancia ServicioConsultaUsuario)
5: obtenerPorId(receptor_id) --> ServicioConsultaUsuario.ts Linea 42 (obtenerPorId) / UsuarioRepositorio.ts Linea 19 (query a tabla `usuario`)
6: Devuelve datos del receptor_id --> UsuarioRepositorio.ts Linea 29 (retorna entidad Usuario)
7: Devuelve lista de Denuncias (con datos del denunciado) --> api/denuncias/index.js Linea 78 (200 { data: denuncias enriquecidas con receptor })
8: Muestra listado de Denuncias --> (render implícito de React en DenunciasPage.jsx)
9: Hace click en "Abrir" de una Denuncia --> (acción implícita del usuario — sin correspondencia directa en el código)
10: Solicita detalle de la Denuncia --> DenunciasPage.jsx Linea 93 (handleAbrirModal — setDenunciaSeleccionada + setIsModalOpen)
11: obtenerDetalleDenuncia(id_denuncia) --> denuncia.service.js Linea 38 (fetch GET /api/denuncias/${id}) / api/denuncias/[id].js Linea 63 (query plana a tabla `denuncia`)
12: [opt emisor_id != null] Solicita datos del emisor --> api/denuncias/[id].js Linea 75-84 (bloque emisor — instancia ServicioConsultaUsuario si emisor_id existe)
13: obtenerPorId(emisor_id) --> ServicioConsultaUsuario.ts Linea 42 (obtenerPorId) / UsuarioRepositorio.ts Linea 19 (query a tabla `usuario`)
14: Devuelve datos del emisor --> UsuarioRepositorio.ts Linea 29 (retorna entidad Usuario)
15: Solicita datos del receptor --> api/denuncias/[id].js Linea 86-93 (bloque receptor — reutiliza ServicioConsultaUsuario)
16: obtenerPorId(receptor_id) --> ServicioConsultaUsuario.ts Linea 42 (obtenerPorId) / UsuarioRepositorio.ts Linea 19 (query a tabla `usuario`)
17: Devuelve datos del receptor --> UsuarioRepositorio.ts Linea 29 (retorna entidad Usuario)
18: Devuelve detalle de la Denuncia --> api/denuncias/[id].js Linea 95 (200 { data: { ...denuncia, emisor, receptor } })
19: setIsDenunciaModalOpen(true) --> DenunciasPage.jsx Linea 95 (setIsModalOpen(true) dentro de handleAbrirModal)
20: Muestra modal de detalle de la Denuncia --> (render implícito de React — AccionDenunciaModal con isOpen=true)
21: Selecciona acción y hace click en "Confirmar" --> (acción implícita del usuario — sin correspondencia directa en el código)
22: Solicita resolver Denuncia --> DenunciasPage.jsx Linea 105 (handleGuardarAccion — llama a resolverDenuncia)
23: resolverDenuncia(id_denuncia, {estado, accion, fechaHasta, observaciones, admin_id}) --> denuncia.service.js Linea 55 (fetch PATCH /api/denuncias/${id}) / api/denuncias/[id].js Linea 123 (delega en ServicioResolucionDenuncia.resolver)
24: Solicita id_admin que resuelve la denuncia --> ServicioResolucionDenuncia.ts Linea 109 (resolverAdminId — invoca UsuarioRepositorio)
25: obtenerAdminSesion() --> UsuarioRepositorio.ts Linea 52 (query a tabla `usuario` filtrando por rol Administrador)
26: Devuelve admin_id --> UsuarioRepositorio.ts Linea 63 (retorna id_usuario del primer administrador)
27: [opt accion implica suspensión] Solicita suspender usuario --> ServicioResolucionDenuncia.ts Linea 78-101 (aplicarEfecto — switch por accion: 'Suspender Temporalmente' / 'Suspender Indefinidamente' invocan usuarioRepo.suspender)
28: suspender(receptor_id, fechaHasta) --> UsuarioRepositorio.ts Linea 37 (UPDATE tabla `usuario`: estado='Suspendido', fecha_suspension_hasta=fechaHasta)
29: Usuario suspendido --> UsuarioRepositorio.ts Linea 44 (retorna void — suspensión aplicada correctamente)
30: Denuncia resuelta --> ServicioResolucionDenuncia.ts Linea 63 (retorna entidad Denuncia resuelta) / api/denuncias/[id].js Linea 124 (200 { data: { estado, accion_tomada } })
31: "Denuncia resuelta con éxito" --> DenunciasPage.jsx Linea 118 (setSuccessMsg)

---

### Figura 4 — Caso Alternativo: Denuncia ya gestionada (28 pasos)

1: Ingresa al panel administrativo y hace click en "Denuncias" --> (acción implícita del usuario — sin correspondencia directa en el código)
2: Solicita lista de Denuncias --> DenunciasPage.jsx Linea 65 (llamada a obtenerDenuncias())
3: obtenerDenuncias() --> denuncia.service.js Linea 10 (fetch GET /api/denuncias) / api/denuncias/index.js Linea 34 (query plana a tabla `denuncia`)
4: [loop por cada denuncia] Solicita datos del receptor_id --> api/denuncias/index.js Linea 51-52 (recopila receptor_ids únicos e instancia ServicioConsultaUsuario)
5: obtenerPorId(receptor_id) --> ServicioConsultaUsuario.ts Linea 42 (obtenerPorId) / UsuarioRepositorio.ts Linea 19 (query a tabla `usuario`)
6: Devuelve datos del receptor_id --> UsuarioRepositorio.ts Linea 29 (retorna entidad Usuario)
7: Devuelve lista de Denuncias --> api/denuncias/index.js Linea 78 (200 { data: denuncias enriquecidas con receptor })
8: Muestra listado de Denuncias --> (render implícito de React en DenunciasPage.jsx)
9: Hace click en "Abrir" de una Denuncia --> (acción implícita del usuario — sin correspondencia directa en el código)
10: Solicita detalle de la Denuncia --> DenunciasPage.jsx Linea 93 (handleAbrirModal — setDenunciaSeleccionada + setIsModalOpen)
11: obtenerDetalleDenuncia(id_denuncia) --> denuncia.service.js Linea 38 (fetch GET /api/denuncias/${id}) / api/denuncias/[id].js Linea 63 (query plana a tabla `denuncia`)
12: [opt emisor_id != null] Solicita datos del emisor_id --> api/denuncias/[id].js Linea 75-84 (bloque emisor — instancia ServicioConsultaUsuario si emisor_id existe)
13: obtenerPorId(emisor_id) --> ServicioConsultaUsuario.ts Linea 42 (obtenerPorId) / UsuarioRepositorio.ts Linea 19 (query a tabla `usuario`)
14: Devuelve datos del emisor_id --> UsuarioRepositorio.ts Linea 29 (retorna entidad Usuario)
15: Solicita datos del receptor --> api/denuncias/[id].js Linea 86-93 (bloque receptor — reutiliza ServicioConsultaUsuario)
16: obtenerPorId(receptor_id) --> ServicioConsultaUsuario.ts Linea 42 (obtenerPorId) / UsuarioRepositorio.ts Linea 19 (query a tabla `usuario`)
17: Devuelve datos del receptor --> UsuarioRepositorio.ts Linea 29 (retorna entidad Usuario)
18: Devuelve detalle de la Denuncia --> api/denuncias/[id].js Linea 95 (200 { data: { ...denuncia, emisor, receptor } })
19: setIsDenunciaModalOpen(true) --> DenunciasPage.jsx Linea 95 (setIsModalOpen(true) dentro de handleAbrirModal)
20: Muestra modal para resolver la Denuncia --> (render implícito de React — AccionDenunciaModal con isOpen=true)
21: Selecciona acción y hace click en "Confirmar" --> (acción implícita del usuario — sin correspondencia directa en el código)
22: Solicita resolver Denuncia --> DenunciasPage.jsx Linea 105 (handleGuardarAccion — llama a resolverDenuncia)
23: Solicita id_admin de la sesión --> ServicioResolucionDenuncia.ts Linea 109 (resolverAdminId — invoca UsuarioRepositorio)
24: obtenerAdminSesion() --> UsuarioRepositorio.ts Linea 52 (query a tabla `usuario` filtrando por rol Administrador)
25: Devuelve admin_id --> UsuarioRepositorio.ts Linea 63 (retorna id_usuario del primer administrador)
26: resolverDenuncia(id_denuncia, {estado="Resuelto", accion, fechaHasta, observaciones, admin_id}) --> denuncia.service.js Linea 55 (fetch PATCH) / api/denuncias/[id].js Linea 123 (ServicioResolucionDenuncia.resolver) / ServicioResolucionDenuncia.ts Linea 57 (denuncia.resolver) / Denuncia.ts Linea 50 (delega en estado actual) / EstadoDenuncia.ts Linea 19 (lanza DenunciaYaProcesadaError — estado no es Pendiente)
27: Error: Denuncia ya gestionada --> errores.ts Linea 10 (DenunciaYaProcesadaError) / api/denuncias/[id].js Linea 41-46 (captura y devuelve 409 Conflict) / denuncia.service.js Linea 68-70 (detecta status 409 y lanza 'CONFLICT_ALREADY_PROCESSED')
28: "Hubo un error al resolver la denuncia. Denuncia ya gestionada." --> DenunciasPage.jsx Linea 122-129 (catch de handleGuardarAccion — setError con mensaje de conflicto)

---

## C-02: Crear Comisión

### Figura 5 — Caso Normal (26 pasos)

1: Ingresa a estructura académica --> EstructuraPage.jsx (implícito — carga del componente, useEffect dispara loadData)
2: [par] Solicita lista de Profesores --> EstructuraPage.jsx Linea 65 (Promise.all — profesorService.obtenerProfesores(filtroEstado))
3: obtenerProfesores(filtroEstado) --> profesor.service.js Linea 39 (fetch GET /api/profesores?filtroEstado=...)
4: GET /api/profesores?filtroEstado=Activos --> api/profesores/index.js Linea 30 (query a tabla `profesor` con filtro de estado)
5: Devuelve lista de Profesores --> api/profesores/index.js Linea 46 (200 { data: [...] }) / profesor.service.js Linea 49 (retorna { data, error })
6: [par] Solicita lista de Comisiones --> EstructuraPage.jsx Linea 66 (Promise.all — comisionService.obtenerComisiones(filtroEstado))
7: obtenerComisiones(filtroEstado) --> comision.service.js Linea 32 (fetch GET /api/comisiones?filtroEstado=...)
8: GET /api/comisiones?filtroEstado=Activos --> api/comisiones/index.js Linea 25 / ServicioComision.ts Linea 58 (listar — ComisionRepositorio.listar sin JOIN a profesor)
9: [loop por cada comision] listarPorComision(id_comision) --> ServicioComision.ts Linea 64 (profesorServicio.listarPorComision) / ServicioConsultaProfesor.ts Linea 53 (listarIdsPorComision + obtenerPorId en paralelo)
10: listarIdsPorComision(id_comision) --> ProfesorRepositorio.ts Linea 38 (query a tabla `comision_profesor` filtrando por id_comision)
11: obtenerPorId(id_profesor) --> ProfesorRepositorio.ts Linea 19 (query a tabla `profesor` por id — una por cada profesor de la comision)
12: Devuelve profesores de la comision --> ServicioConsultaProfesor.ts Linea 64 (retorna Profesor[] filtrado sin nulos)
13: Devuelve lista de Comisiones (con datos de profesores) --> ServicioComision.ts Linea 66-68 (profesoresNombresArray mapeado) / api/comisiones/index.js Linea 26 (200 { data }) / comision.service.js Linea 42 (retorna { data, error })
14: Se muestran entidades existentes --> EstructuraPage.jsx Linea 77-78 (setProfesoresList / setComisionesList — React re-renderiza)
15: Hace click en "Comisiones" --> EstructuraPage.jsx Linea 588 (onClickCard: setEntidadActiva('Comisiones') — sin nuevo fetch)
16: Muestra lista de Comisiones --> EstructuraPage.jsx Linea 528-534 (renderRows — case 'Comisiones' consume comisionesList ya en estado)
17: Hace click en '+' (crear comision) --> EstructuraPage.jsx Linea 588 (onAdd: setIsComisionModalOpen(true))
18: setIsComisionModalOpen(true) --> EstructuraPage.jsx Linea 588 (profesoresDisponibles ya en estado desde paso 5 — sin nuevo fetch)
19: Muestra modal de crear Comision --> addComisionModal.tsx (render con isOpen=true y profesoresDisponibles como prop — Linea 112 EstructuraPage.jsx)
20: Completa correctamente los campos y hace click en crear --> addComisionModal.tsx Linea 107 (handleGuardar)
21: validarCampos() --> addComisionModal.tsx Linea 62 (verifica nombre, letras A-Z, letraDesde < letraHasta, asignatura seleccionada)
22: Solicita crear Comision --> EstructuraPage.jsx Linea 140 (handleCrearComision invoca comisionService.crear) / comision.service.js Linea 74 (POST /api/comisiones con body)
23: crear(nombre, letraDesde, letraHasta, id_asignatura, profesores_ids) --> api/comisiones/index.js Linea 48 / ServicioComision.ts Linea 78 (new Comision + validar + existeAsignatura + repo.crear)
24: [opt profesores_ids no vacío] vincularProfesores(id_comision, profesores_ids) --> ServicioComision.ts Linea 95 / ComisionRepositorio.ts Linea 84 (INSERT en tabla `comision_profesor`)
25: Comision creada --> api/comisiones/index.js Linea 49 (201 { data: comision }) / comision.service.js Linea 91 (retorna payload)
26: "Comision creada con exito" --> EstructuraPage.jsx Linea 197-198 (setMensajeExito / setShowSuccessMessage)

---

### Figura 6 — Caso Alternativo: Datos de formulario inválidos (25 pasos)

1: Ingresa a estructura académica --> EstructuraPage.jsx (implícito — carga del componente, useEffect dispara loadData)
2: [par] Solicita lista de Profesores --> EstructuraPage.jsx Linea 65 (Promise.all — profesorService.obtenerProfesores(filtroEstado))
3: obtenerProfesores(filtroEstado) --> profesor.service.js Linea 39 (fetch GET /api/profesores?filtroEstado=...)
4: GET /api/profesores?filtroEstado=Activos --> api/profesores/index.js Linea 30 (query a tabla `profesor` con filtro de estado)
5: Devuelve lista de Profesores --> api/profesores/index.js Linea 46 (200 { data: [...] }) / profesor.service.js Linea 49 (retorna { data, error })
6: [par] Solicita lista de Comisiones --> EstructuraPage.jsx Linea 66 (Promise.all — comisionService.obtenerComisiones(filtroEstado))
7: obtenerComisiones(filtroEstado) --> comision.service.js Linea 32 (fetch GET /api/comisiones?filtroEstado=...)
8: GET /api/comisiones?filtroEstado=Activos --> api/comisiones/index.js Linea 25 / ServicioComision.ts Linea 58 (listar — ComisionRepositorio.listar sin JOIN a profesor)
9: [loop por cada comision] listarPorComision(id_comision) --> ServicioComision.ts Linea 64 / ServicioConsultaProfesor.ts Linea 53 (listarIdsPorComision + obtenerPorId en paralelo)
10: Devuelve lista de Comisiones (con datos de profesores) --> ServicioComision.ts Linea 66-68 / api/comisiones/index.js Linea 26 / comision.service.js Linea 42
11: Se muestran entidades existentes --> EstructuraPage.jsx Linea 77-78 (setProfesoresList / setComisionesList)
12: Hace click en "Comisiones" --> EstructuraPage.jsx Linea 588 (onClickCard: setEntidadActiva('Comisiones'))
13: Muestra lista de Comisiones --> EstructuraPage.jsx Linea 528-534 (renderRows — case 'Comisiones')
14: Hace click en '+' (crear comision) --> EstructuraPage.jsx Linea 588 (onAdd: setIsComisionModalOpen(true))
15: setIsComisionModalOpen(true) --> EstructuraPage.jsx Linea 588 (profesoresDisponibles ya en estado — sin nuevo fetch)
16: Muestra modal de crear Comision --> addComisionModal.tsx (render con isOpen=true)
17: Completa con campos incorrectos y hace click en crear --> addComisionModal.tsx Linea 107 (handleGuardar)
18: validarCampos() --> addComisionModal.tsx Linea 62 (detecta campos vacíos o letraDesde >= letraHasta)
SE DETECTAN CAMPOS VACIOS O FORMATOS INCORRECTOS
19: setErrores(erroresTemp) --> addComisionModal.tsx Linea 90 (actualiza estado de errores de validación por campo)
20: Muestra avisos de validación en los campos afectados --> addComisionModal.tsx Linea 148 (render condicional de mensajes de error por campo)
21: Corrige los datos y hace click en crear --> addComisionModal.tsx Linea 107 (handleGuardar — segunda invocación)
22: validarCampos() --> addComisionModal.tsx Linea 62 (segunda validación — ahora exitosa, retorna true)
23: Solicita crear Comision --> EstructuraPage.jsx Linea 140 (handleCrearComision) / comision.service.js Linea 74 (POST /api/comisiones)
24: crear(nombre, letraDesde, letraHasta, id_asignatura, profesores_ids) --> api/comisiones/index.js Linea 48 / ServicioComision.ts Linea 78
25: Comision creada --> api/comisiones/index.js Linea 49 (201 { data: comision }) / EstructuraPage.jsx Linea 197-198 ("Comision creada con exito")

---

## C-03: Importar Datos Masivamente

### Figura 7 — Caso Normal (30 pasos)

1: Ingresa a estructura académica --> EstructuraPage.jsx (implícito — carga del componente)
2: Se muestran entidades y botones --> EstructuraPage.jsx (render de StatCards y barra de herramientas)
3: Hace click en "Importar CSV" --> EstructuraPage.jsx Linea 602-606 (botón que invoca csvInputRef.current.click())
4: Abre explorador de archivos --> (manejado por el navegador — input[type=file] hidden, Linea 595-601 EstructuraPage.jsx)
5: Selecciona archivo CSV --> EstructuraPage.jsx Linea 279 (handleFileUpload — onChange del input, recibe event.target.files[0])
6: validarFormatoArchivo(archivo) --> EstructuraPage.jsx Linea 288 / csvParser.js Linea 38 (verifica extensión .csv y que el archivo no sea null)
7: Formato de archivo validado --> csvParser.js Linea 38-42 (retorna true si extensión es .csv)
8: parsearCSV(archivo) --> EstructuraPage.jsx Linea 296 / csvParser.js Linea 48 (lee el archivo con FileReader y parsea columnas separadas por coma)
9: Devuelve array de filas --> csvParser.js Linea 48-58 (retorna Promise<Object[]> con una fila por línea del CSV)
10: validarEsquema(filas) --> EstructuraPage.jsx Linea 299 / csvParser.js Linea 64 (verifica que estén presentes todas las columnas requeridas)
11: Esquema validado --> csvParser.js Linea 64-83 (retorna [] si no hay errores de columnas faltantes)
12: detectarDuplicados(filas) --> EstructuraPage.jsx Linea 308 / csvParser.js Linea 90 (detecta filas con combinación comision+asignatura duplicada)
13: No se detectaron duplicados --> csvParser.js Linea 90-110 (retorna [] si no hay duplicados)
14: detectarIncompletos(filas) --> EstructuraPage.jsx Linea 317 / csvParser.js Linea 116 (verifica que ningún campo obligatorio esté vacío)
15: No se detectaron campos incompletos --> csvParser.js Linea 116-134 (retorna [] si todos los campos están completos)
16: detectarFormatosInvalidos(filas) --> EstructuraPage.jsx Linea 326 / csvParser.js Linea 140 (verifica fechas, documento numérico y letras A-Z)
17: No se detectaron formatos inválidos --> csvParser.js Linea 140-fin (retorna [] si todos los formatos son correctos)
18: Solicita crear Edificio/s --> EstructuraPage.jsx Linea 336 (edificioService.insertar(filas))
19: insertar(filas) --> edificio.service.js Linea 90 (upsert en tabla `edificio` deduplicando por nombre)
20: Edificio/s insertado/s --> edificio.service.js (retorna data de Supabase)
21: Solicita crear Facultad/es --> EstructuraPage.jsx Linea 339 (facultadService.insertar(filas))
22: insertar(filas) --> facultad.service.js Linea 94 (upsert en tabla `facultad` deduplicando por nombre)
23: Facultad/es insertada/s --> facultad.service.js (retorna data de Supabase)
24: Solicita crear Carrera/s --> EstructuraPage.jsx Linea 342 (carreraService.insertar(filas))
25: insertar(filas) --> carrera.service.js Linea 91 (upsert en tabla `carrera` deduplicando por nombre)
26: Carrera/s insertada/s --> carrera.service.js (retorna data de Supabase)
27: Solicita crear Periodo/s --> EstructuraPage.jsx Linea 345 (periodoService.insertar(filas))
28: insertar(filas) --> periodo.service.js Linea 88 (upsert en tabla `periodo` deduplicando por nombre)
29: Periodo/s insertado/s --> periodo.service.js (retorna data de Supabase)
30: Solicita crear Asignatura/s --> EstructuraPage.jsx Linea 348 (asignaturaService.insertar(filas))
31: insertar(filas) --> asignatura.service.js Linea 134 (upsert en tabla `asignatura` deduplicando por nombre+carrera)
32: Asignatura/s insertada/s --> asignatura.service.js (retorna data de Supabase)
33: Solicita crear Profesor/es --> EstructuraPage.jsx Linea 351 (profesorService.insertar(filas))
34: insertar(filas) --> profesor.service.js Linea 175 (upsert en tabla `profesor` deduplicando por documento)
35: Profesor/es insertado/s --> profesor.service.js (retorna data de Supabase)
36: Solicita crear Comision/es --> EstructuraPage.jsx Linea 354 (comisionService.insertar(filas))
37: insertar(filas) --> comision.service.js Linea 98 (POST /api/comisiones con body { filas }) / ServicioComision.ts importarMasivo
38: Comision/es insertada/s --> api/comisiones/index.js Linea 37-44 (200/207 { insertadas, resultados, errores })
39: "Archivo importado con exito" --> EstructuraPage.jsx Linea 358-360 (setMensajeExito / setShowSuccessMessage)

---

### Figura 8 — Caso Alternativo: CSV con errores/duplicados (8 pasos)

1: Ingresa a estructura académica --> EstructuraPage.jsx (implícito — carga del componente)
2: Se muestran entidades y botones --> EstructuraPage.jsx (render de StatCards y barra de herramientas)
3: Hace click en "Importar CSV" --> EstructuraPage.jsx Linea 602-606 (botón que invoca csvInputRef.current.click())
4: Abre explorador de archivos --> (manejado por el navegador — input[type=file] hidden)
5: Selecciona archivo CSV --> EstructuraPage.jsx Linea 279 (handleFileUpload — onChange del input)
6: validarFormatoArchivo(archivo) --> EstructuraPage.jsx Linea 288 / csvParser.js Linea 38
7: Formato de archivo validado --> csvParser.js Linea 38-42 (retorna true)
8: parsearCSV(archivo) --> EstructuraPage.jsx Linea 296 / csvParser.js Linea 48
9: Devuelve array de filas --> csvParser.js Linea 48-58
10: validarEsquema(filas) --> EstructuraPage.jsx Linea 299 / csvParser.js Linea 64
11: Esquema validado --> csvParser.js Linea 64-83
12: detectarDuplicados(filas) --> EstructuraPage.jsx Linea 308 / csvParser.js Linea 90
SE DETECTAN DUPLICADOS EN EL CSV
13: Se detectaron duplicados --> csvParser.js Linea 90-110 (retorna array con mensajes de error por combinación duplicada)
14: Muestra mensaje de error --> EstructuraPage.jsx Linea 310 (setErrorMessage(erroresDuplicados.join(' | '))) — el flujo termina aquí, los services NO se invocan