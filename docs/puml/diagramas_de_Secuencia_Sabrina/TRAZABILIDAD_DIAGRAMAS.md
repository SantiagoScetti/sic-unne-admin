# Trazabilidad de Diagramas SIC-UNNE

## C-01: Gestionar Denuncias y Resolución de Conflictos

### Figura 3 — Caso Normal

1: Ingresa al panel administrativo y hace click en "Denuncias" --> (acción implícita del usuario, sin correspondencia directa en el código)
2: Solicita lista de Denuncias --> DenunciasPage.jsx Linea 65 (llamada a obtenerDenuncias())
3: obtenerDenuncias() --> denuncia.service.js Linea 10 (fetch GET /api/denuncias) / api/denuncias/index.js Linea 34 (query plana a tabla `denuncia`)
4: Solicita datos de receptor_id --> api/denuncias/index.js Linea 51-52 (recopila receptor_ids únicos e instancia ServicioConsultaUsuario)
5: obtenerPorId(receptor_id) --> ServicioConsultaUsuario.ts Linea 42 (buscarPorId) / UsuarioRepositorio.ts Linea 19 (query a tabla `usuario`)
6: Devuelve datos de receptor_id --> UsuarioRepositorio.ts Linea 29 (retorna entidad Usuario)
7: Devuelve lista de Denuncias --> api/denuncias/index.js Linea 78 (200 { data: denuncias enriquecidas con receptor })
8: Muestra listado de Denuncias --> (render implícito de React en DenunciasPage.jsx)
9: Hace click en "Abrir" de un Denuncia --> (acción implícita del usuario, sin correspondencia directa en el código)
10: Solicita detalle de la Denuncia --> DenunciasPage.jsx Linea 93 (handleAbrirModal — setDenunciaSeleccionada + setIsModalOpen)
11: obtenerDetalleDenuncia(id_denuncia) --> denuncia.service.js Linea 38 (fetch GET /api/denuncias/${id}) / api/denuncias/[id].js Linea 63 (query plana a tabla `denuncia`)
12: Solicita datos del emisor --> api/denuncias/[id].js Linea 75-84 (bloque emisor — instancia ServicioConsultaUsuario)
13: obtenerPorId(emisor_id) --> ServicioConsultaUsuario.ts Linea 42 (buscarPorId) / UsuarioRepositorio.ts Linea 19 (query a tabla `usuario`)
14: Devuelve datos del emisor --> UsuarioRepositorio.ts Linea 29 (retorna entidad Usuario)
15: Solicita datos del receptor --> api/denuncias/[id].js Linea 86-93 (bloque receptor — reutiliza ServicioConsultaUsuario)
16: obtenerPorId(receptor_id) --> ServicioConsultaUsuario.ts Linea 42 (buscarPorId) / UsuarioRepositorio.ts Linea 19 (query a tabla `usuario`)
17: Devuelve datos del receptor --> UsuarioRepositorio.ts Linea 29 (retorna entidad Usuario)
18: Devuelve detalle del Denuncia --> api/denuncias/[id].js Linea 95 (200 { data: { ...denuncia, emisor, receptor } })
19: setIsDenunciaModalOpen(true) --> DenunciasPage.jsx Linea 95 (setIsModalOpen(true) dentro de handleAbrirModal)
20: Muestra modal para resolver el Denuncia --> (render implícito de React — AccionDenunciaModal con isOpen=true)
21: Selecciona acción y hace click en "Confirmar" --> (acción implícita del usuario, sin correspondencia directa en el código)
22: Solicita resolver Denuncia --> DenunciasPage.jsx Linea 105 (handleGuardarAccion — llama a resolverDenuncia)
23: resolverDenuncia(id_denuncia, {estado, accion, fechaHasta, observaciones, admin_id}) --> denuncia.service.js Linea 55 (fetch PATCH /api/denuncias/${id}) / api/denuncias/[id].js Linea 123 (delega en ServicioResolucionDenuncia.resolver)
24: Solicita id_admin que resuelve la denuncia --> ServicioResolucionDenuncia.ts Linea 109 (resolverAdminId — invoca UsuarioRepositorio)
25: obtenerAdminPorDefecto() --> UsuarioRepositorio.ts Linea 52 (query a tabla `usuario` filtrando por rol Administrador)
26: Devuelve admin_id --> UsuarioRepositorio.ts Linea 63 (retorna id_usuario del primer administrador)
27: [opt accion implica suspensión] Solicita suspender usuario --> ServicioResolucionDenuncia.ts Linea 78-101 (aplicarEfecto — switch por accion: 'Suspender Temporalmente' / 'Suspender Indefinidamente' invocan usuarioRepo.suspender)
28: suspender(receptor_id, fechaHasta) --> UsuarioRepositorio.ts Linea 37 (update a tabla `usuario`: estado='Suspendido', fecha_suspension_hasta=fechaHasta)
29: Usuario suspendido --> UsuarioRepositorio.ts Linea 44 (retorna void — suspensión aplicada correctamente)
30: Denuncia resuelta --> ServicioResolucionDenuncia.ts Linea 63 (retorna entidad Denuncia resuelta) / api/denuncias/[id].js Linea 124 (200 { data: { estado, accion_tomada } })
31: "Denuncia resuelta con éxito" --> DenunciasPage.jsx Linea 118 (setSuccessMsg)

---


### Figura 4 — Caso Alternativo: Denuncia ya gestionada

1: Ingresa al panel administrativo y hace click en "Denuncias" --> (acción implícita del usuario, sin correspondencia directa en el código)
2: Solicita lista de Denuncias --> DenunciasPage.jsx Linea 65 (llamada a obtenerDenuncias())
3: obtenerDenuncias() --> denuncia.service.js Linea 10 (fetch GET /api/denuncias) / api/denuncias/index.js Linea 34 (query plana a tabla `denuncia`)
4: [loop] Solicita datos del receptor_id --> api/denuncias/index.js Linea 51-52 (recopila receptor_ids únicos e instancia ServicioConsultaUsuario)
5: obtenerPorId(receptor_id) --> ServicioConsultaUsuario.ts Linea 42 (buscarPorId) / UsuarioRepositorio.ts Linea 19 (query a tabla `usuario`)
6: Devuelve datos del receptor_id --> UsuarioRepositorio.ts Linea 29 (retorna entidad Usuario)
7: Devuelve lista de Denuncias --> api/denuncias/index.js Linea 78 (200 { data: denuncias enriquecidas con receptor })
8: Muestra listado de Denuncias --> (render implícito de React en DenunciasPage.jsx)
9: Hace click en "Abrir" de un Denuncia --> (acción implícita del usuario, sin correspondencia directa en el código)
10: Solicita detalle de la Denuncia --> DenunciasPage.jsx Linea 93 (handleAbrirModal — setDenunciaSeleccionada + setIsModalOpen)
11: obtenerDetalleDenuncia(id_denuncia) --> denuncia.service.js Linea 38 (fetch GET /api/denuncias/${id}) / api/denuncias/[id].js Linea 63 (query plana a tabla `denuncia`)
12: [opt emisor_id != null] Solicita datos del emisor_id --> api/denuncias/[id].js Linea 75-84 (bloque emisor — instancia ServicioConsultaUsuario)
13: obtenerPorId(emisor_id) --> ServicioConsultaUsuario.ts Linea 42 (buscarPorId) / UsuarioRepositorio.ts Linea 19 (query a tabla `usuario`)
14: Devuelve datos de emisor_id --> UsuarioRepositorio.ts Linea 29 (retorna entidad Usuario)
15: Solicita datos del receptor --> api/denuncias/[id].js Linea 86-93 (bloque receptor — reutiliza ServicioConsultaUsuario)
16: obtenerPorId(receptor_id) --> ServicioConsultaUsuario.ts Linea 42 (buscarPorId) / UsuarioRepositorio.ts Linea 19 (query a tabla `usuario`)
17: Devuelve datos del receptor --> UsuarioRepositorio.ts Linea 29 (retorna entidad Usuario)
18: Devuelve detalle del Denuncia --> api/denuncias/[id].js Linea 95 (200 { data: { ...denuncia, emisor, receptor } })
19: setIsDenunciaModalOpen(true) --> DenunciasPage.jsx Linea 95 (setIsModalOpen(true) dentro de handleAbrirModal)
20: Muestra modal para resolver el Denuncia --> (render implícito de React — AccionDenunciaModal con isOpen=true)
21: Selecciona acción y hace click en "Confirmar" --> (acción implícita del usuario, sin correspondencia directa en el código)
22: Solicita resolver Denuncia --> DenunciasPage.jsx Linea 105 (handleGuardarAccion — llama a resolverDenuncia)
23: Solicita id_admin de la sesión --> ServicioResolucionDenuncia.ts Linea 109 (resolverAdminId — invoca UsuarioRepositorio)
24: obtenerAdminPorDefecto() --> UsuarioRepositorio.ts Linea 52 (query a tabla `usuario` filtrando por rol Administrador)
25: Devuelve admin_id --> UsuarioRepositorio.ts Linea 63 (retorna id_usuario del primer administrador)
26: resolverDenuncia(id_denuncia, {estado="Resuelto", accion, fechaHasta, observaciones, admin_id}) --> denuncia.service.js Linea 55 (fetch PATCH) / api/denuncias/[id].js Linea 123 (ServicioResolucionDenuncia.resolver) / ServicioResolucionDenuncia.ts Linea 57 (denuncia.resolver) / Denuncia.ts Linea 50 (delega en estado actual) / EstadoDenuncia.ts Linea 19 (lanza DenunciaYaProcesadaError ya que el estado no es Pendiente)
27: Error: Denuncia ya gestionada --> errores.ts Linea 10 (DenunciaYaProcesadaError) / api/denuncias/[id].js Linea 41-46 (captura y devuelve 409 Conflict) / denuncia.service.js Linea 68-70 (detecta status 409 y lanza 'CONFLIC_ALREADY_PROCESSED')
28: "Hubo un error al resolver la denuncia. Denuncia ya gestionada." --> DenunciasPage.jsx Linea 122-129 (catch de handleGuardarAccion — setError con mensaje de conflicto)

---


## C-02: Crear Comisión

### Figura 5 — Caso Normal

1: Ingresa a estructura academica --> EstructuraPage.jsx (implícito — carga del componente)
2: [par] Solicita lista de Profesores --> EstructuraPage.jsx Linea 65 (Promise.all — profesorService.obtenerProfesores(filtroEstado))
3: obtenerProfesores(filtroEstado) --> profesor.service.js Linea 39 (fetch GET /api/profesores?filtroEstado=...)
4: GET /api/profesores?filtroEstado=Activos --> api/profesores/index.js Linea 30 (query a tabla `profesor` con filtro)
5: Devuelve lista de Profesores --> api/profesores/index.js Linea 46 (200 { data: [...] }) / profesor.service.js Linea 49 (retorna { data, error })
6: [par] Solicita lista de Comisiones --> EstructuraPage.jsx Linea 66 (Promise.all — comisionService.obtenerComisiones(filtroEstado))
7: obtenerComisiones(filtroEstado) --> comision.service.js Linea 32 (fetch GET /api/comisiones?filtroEstado=...)
8: GET /api/comisiones?filtroEstado=Activos --> api/comisiones/index.js Linea 25 / ServicioComision.ts Linea 58 (listar — ComisionRepositorio.listar sin JOIN a profesor)
9: [loop por cada comision] listarPorComision(id_comision) --> ServicioComision.ts Linea 64 (profesorServicio.listarPorComision) / ServicioConsultaProfesor.ts Linea 53 (listarIdsPorComision + buscarPorId)
10: listarIdsPorComision(id_comision) --> ProfesorRepositorio.ts Linea 38 (query a tabla `comision_profesor` filtrando por id_comision)
11: buscarPorId(id_profesor) --> ProfesorRepositorio.ts Linea 19 (query a tabla `profesor` por id)
12: Devuelve profesores de la comision --> ServicioConsultaProfesor.ts Linea 64 (retorna Profesor[] filtrado)
13: Devuelve lista de Comisiones (con datos de profesores) --> ServicioComision.ts Linea 66-68 (profesoresNombresArray mapeado) / api/comisiones/index.js Linea 26 (200 { data }) / comision.service.js Linea 42 (retorna { data, error })
14: Se muestran entidades existentes --> EstructuraPage.jsx Linea 77-78 (setProfesoresList / setComisionesList)
15: Hace click en "Comisiones" --> EstructuraPage.jsx Linea 588 (onClickCard: setEntidadActiva('Comisiones'))
16: Muestra lista de Comisiones --> EstructuraPage.jsx Linea 528-534 (renderRows — case 'Comisiones' consume comisionesList ya en estado)
17: Hace click en '+' (crear comision) --> EstructuraPage.jsx Linea 588 (onAdd: setIsComisionModalOpen(true))
18: setIsComisionModalOpen(true) --> EstructuraPage.jsx Linea 588 (profesoresDisponibles ya en estado desde paso 5 — sin nuevo fetch)
19: Muestra modal de crear Comision --> addComisionModal.tsx (render con isOpen=true y profesoresDisponibles como prop)
20: Completa correctamente los campos y hace click en crear --> addComisionModal.tsx Linea 107 (handleGuardar)
21: validarCampos() --> addComisionModal.tsx Linea 62 (verifica nombre, letras, asignatura)
22: Solicita crear Comision --> EstructuraPage.jsx Linea 140 (handleCrearComision → comisionService.crear) / comision.service.js Linea 74 (POST /api/comisiones)
23: crear(nombre, letraDesde, letraHasta, id_asignatura, profesores_ids) --> api/comisiones/index.js Linea 48 / ServicioComision.ts Linea 78 (new Comision + validar + repo.crear)
24: [opt profesores_ids no vacío] vincularProfesores(id_comision, profesores_ids) --> ServicioComision.ts Linea 95 / ComisionRepositorio.ts Linea 84 (INSERT en tabla `comision_profesor`)
25: Comision creada --> api/comisiones/index.js Linea 49 (201 { data: comision }) / comision.service.js Linea 91 (retorna payload)
26: "Comision creada con exito" --> EstructuraPage.jsx Linea 197-198 (setMensajeExito / setShowSuccessMessage)

### Figura 6 — Caso Alternativo: Datos de formulario inválidos

1: Ingresa a estructura academica --> EstructuraPage.jsx (implícito — carga del componente)
2: [par] Solicita lista de Profesores --> EstructuraPage.jsx Linea 65 (Promise.all — profesorService.obtenerProfesores(filtroEstado))
3: obtenerProfesores(filtroEstado) --> profesor.service.js Linea 39 (fetch GET /api/profesores?filtroEstado=...)
4: GET /api/profesores?filtroEstado=Activos --> api/profesores/index.js Linea 30 (query a tabla `profesor` con filtro)
5: Devuelve lista de Profesores --> api/profesores/index.js Linea 46 (200 { data: [...] }) / profesor.service.js Linea 49 (retorna { data, error })
6: [par] Solicita lista de Comisiones --> EstructuraPage.jsx Linea 66 (Promise.all — comisionService.obtenerComisiones(filtroEstado))
7: obtenerComisiones(filtroEstado) --> comision.service.js Linea 32 (fetch GET /api/comisiones?filtroEstado=...)
8: GET /api/comisiones?filtroEstado=Activos --> api/comisiones/index.js Linea 25 / ServicioComision.ts Linea 58 (listar — ComisionRepositorio.listar sin JOIN a profesor)
9: [loop por cada comision] listarPorComision(id_comision) --> ServicioComision.ts Linea 64 / ServicioConsultaProfesor.ts Linea 53 (listarIdsPorComision + buscarPorId)
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
19: setErrores(erroresTemp) --> addComisionModal.tsx Linea 90 (actualiza estado de errores de validacion)
20: Muestra avisos de validacion en los campos afectados --> addComisionModal.tsx Linea 148 (render condicional de mensajes de error por campo)
21: Corrige los datos y hace click en crear --> addComisionModal.tsx Linea 107 (handleGuardar)
22: validarCampos() --> addComisionModal.tsx Linea 62 (segunda validacion — ahora exitosa)
23: Solicita crear Comision --> EstructuraPage.jsx Linea 140 / comision.service.js Linea 74 (POST /api/comisiones)
24: crear(nombre, letraDesde, letraHasta, id_asignatura, profesores_ids) --> api/comisiones/index.js Linea 48 / ServicioComision.ts Linea 78
25: Comision creada --> api/comisiones/index.js Linea 49 (201 { data: comision }) / EstructuraPage.jsx Linea 197-198 ("Comision creada con exito")

---

## C-03: Importar Datos Masivamente

### Figura 7 — Caso Normal

1: Ingresa a estructura academica --> EstructuraPage.jsx
2: Se muestran entidades y botones --> EstructuraPage.jsx (render de tarjetas)
3: Hace click en "Importar CSV" --> EstructuraPage.jsx (boton que abre el input file)
4: Se abre explorador de archivos --> (manejado por el navegador, input[type=file])
5: Selecciona archivo CSV --> EstructuraPage.jsx (onChange del input)
6: validarFormatoArchivo(archivo) --> csvParser.js
7: ok --> csvParser.js
8: parsearCSV(archivo) --> csvParser.js
9: filas[] --> csvParser.js
10: validarEsquema(filas) --> csvParser.js
11: sin errores --> csvParser.js
12: detectarDuplicados(filas) --> csvParser.js
13: sin errores --> csvParser.js
14: detectarIncompletos(filas) --> csvParser.js
15: sin errores --> csvParser.js
16: detectarFormatosInvalidos(filas) --> csvParser.js
17: sin errores --> csvParser.js
18: insertar(filas) --> Linea 98 comision.service.js
19: POST /api/comisiones { filas } --> Linea 99 comision.service.js
20: obtenerPorNombre(nombre_asignatura) [loop por fila] --> Linea 124 ComisionRepositorio.ts
21: Asignatura encontrada --> Linea 132 ComisionRepositorio.ts
22: obtenerPorNombreYAsignatura(nombre, id_asignatura) --> Linea 135 ComisionRepositorio.ts
23: existe? --> Linea 144 ComisionRepositorio.ts
24: crear(nombre, id_asignatura, letraDesde, letraHasta) [si no existe] --> Linea 73 ComisionRepositorio.ts
25: Comision creada --> Linea 81 ComisionRepositorio.ts
26: upsertVinculo(id_comision, documento_profesor) --> Linea 158 ComisionRepositorio.ts
27: Vinculo registrado --> Linea 166 ComisionRepositorio.ts
28: 200 { insertadas: N, errores: null } --> /api/comisiones/index.js
29: Resumen importacion --> Linea 115 comision.service.js
30: "Archivo importado con exito" --> EstructuraPage.jsx

### Figura 8 — Caso Alternativo: CSV con errores/duplicados

1-9: (igual al caso normal — ingreso, seleccion de archivo, parseo)
10: validarEsquema(filas) --> csvParser.js
11: errores_esquema[] --> csvParser.js
12: detectarDuplicados(filas) --> csvParser.js
13: errores_duplicados[] --> csvParser.js
14: detectarIncompletos(filas) --> csvParser.js
15: errores_incompletos[] --> csvParser.js
16: detectarFormatosInvalidos(filas) --> csvParser.js
17: errores_formato[] --> csvParser.js
EL SISTEMA DETECTA DATOS INVALIDOS, INCOMPLETOS O DUPLICADOS
18: Muestra mensaje de error especifico --> EstructuraPage.jsx (setErrorMessage)
LA VALIDACION FALLA EN PRESENTACION — Service y API no se invocan