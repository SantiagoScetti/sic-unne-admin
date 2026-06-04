# Trazabilidad de Diagramas SIC-UNNE

## C-01: Gestionar Denuncias y Resolución de Conflictos

### Figura 3 — Caso Normal

1: Selecciona denuncia y elige accion --> DenunciasPage.jsx
2: resolverDenuncia(id, { estado, accion, fechaHasta, observaciones }) --> Linea 70 denuncia.service.js
3: PATCH /api/denuncias/:id --> Linea 74 denuncia.service.js
4: resolver({ id, accion, fechaHasta, observaciones }) --> Linea 85 /api/denuncias/[id].js
5: obtenerPorId(id) --> Linea 126 ServicioResolucionDenuncia.ts / Linea 12 DenunciaRepositorio.ts
6: Denuncia (estado = 'Pendiente') --> Linea 25 DenunciaRepositorio.ts
7: resolver(accion) --> Linea 71 ServicioResolucionDenuncia.ts / Linea 50 Denuncia.ts
8: Denuncia resuelto --> Linea 50 Denuncia.ts
9: guardar() --> Linea 73 ServicioResolucionDenuncia.ts / Linea 28 DenunciaRepositorio.ts
10: Denuncia guardado --> Linea 35 DenunciaRepositorio.ts
11: suspender(receptor_id, fechaHasta) --> Linea 77 ServicioResolucionDenuncia.ts / Linea 15 UsuarioRepositorio.ts
12: Suspension aplicada --> Linea 22 UsuarioRepositorio.ts
13: crearVarias(emisor_id, receptor_id, mensaje) --> Linea 84 ServicioResolucionDenuncia.ts / Linea 26 NotificacionRepositorio.ts
14: Notificaciones creadas --> Linea 38 NotificacionRepositorio.ts
15: registrar(admin_id, accion, id_denuncia) --> Linea 84 ServicioResolucionDenuncia.ts / Linea 17 AuditoriaRepositorio.ts
16: Auditoria registrada --> Linea 27 AuditoriaRepositorio.ts
17: Denuncia resuelto --> Linea 96 ServicioResolucionDenuncia.ts
18: 200 { data: { estado:'Resuelto', accion_tomada } } --> Linea 87 /api/denuncias/[id].js
19: Denuncia resuelto --> Linea 90 denuncia.service.js
20: "Accion aplicada con exito" --> DenunciasPage.jsx

### Figura 4 — Caso Alternativo: Denuncia ya gestionado

1: Intenta resolver un denuncia ya gestionado --> DenunciasPage.jsx
2: resolverDenuncia(id, { estado:'Resuelto', accion }) --> Linea 70 denuncia.service.js
3: PATCH /api/denuncias/:id --> Linea 74 denuncia.service.js
4: resolver({ id, accion }) --> Linea 85 /api/denuncias/[id].js
5: obtenerPorId(id) --> Linea 126 ServicioResolucionDenuncia.ts / Linea 12 DenunciaRepositorio.ts
6: Denuncia (estado = 'Resuelto') --> Linea 25 DenunciaRepositorio.ts
7: resolver(accion) --> Linea 71 ServicioResolucionDenuncia.ts / Linea 50 Denuncia.ts
8: throw DenunciaYaProcesadaError --> errores.ts (lanzado por EstadoResuelto)
9: propaga DenunciaYaProcesadaError --> ServicioResolucionDenuncia.ts (error no capturado)
10: 409 Conflict { error, estadoActual } --> Linea 34 /api/denuncias/[id].js
11: throw error (409) --> Linea 82 denuncia.service.js
12: "Este denuncia ya fue procesado por otro administrador" --> DenunciasPage.jsx

---

## C-02: Crear Comisión

### Figura 5 — Caso Normal

1: Ingresa a estructura academica --> EstructuraPage.jsx
2: Se muestran entidades existentes --> EstructuraPage.jsx (render de StatCards)
3: Hace click en "Comisiones" --> EstructuraPage.jsx (onClickCard)
4: obtenerComisiones("Activos") --> Linea 32 comision.service.js
5: GET /api/comisiones?filtroEstado=Activos --> Linea 34 comision.service.js
6: obtenerTodas(filtroEstado) --> /api/comisiones/index.js / Linea 35 ComisionRepositorio.ts
7: lista de comisiones --> Linea 48 ComisionRepositorio.ts
8: { data: [...], error: null } --> /api/comisiones/index.js
9: lista normalizada --> Linea 42 comision.service.js
10: Se muestra listado y botones --> EstructuraPage.jsx
11: Hace click en "Crear Comision" --> EstructuraPage.jsx (onAdd)
12: Se muestra addComisionModal --> addComisionModal.tsx
13: Completa campos y confirma --> Linea 105 addComisionModal.tsx
14: validarCampos() --> Linea 61 addComisionModal.tsx
15: crear(nombre, letraDesde, letraHasta, id_asignatura, profesores_ids) --> Linea 74 comision.service.js
16: POST /api/comisiones { nombre, letraDesde, letraHasta, id_asignatura, profesores_ids } --> Linea 75 comision.service.js
17: validarCamposRequeridos() --> /api/comisiones/index.js (validacion interna)
18: crear(nombre, letraDesde, letraHasta, id_asignatura) --> Linea 73 ComisionRepositorio.ts
19: Comision creada --> Linea 81 ComisionRepositorio.ts
20: vincular(id_comision, profesores_ids) [si hay profesores] --> Linea 84 ComisionRepositorio.ts
21: Vinculos creados --> Linea 89 ComisionRepositorio.ts
22: 201 { data: comision, error: null } --> /api/comisiones/index.js
23: Comision creada --> Linea 91 comision.service.js
24: "Comision creada con exito" --> EstructuraPage.jsx

### Figura 6 — Caso Alternativo: Datos de formulario inválidos

1-10: (igual al caso normal — ingreso y listado de comisiones)
11: Hace click en "Crear Comision" --> EstructuraPage.jsx
12: Se muestra addComisionModal --> addComisionModal.tsx
13: Completa campos y confirma --> Linea 105 addComisionModal.tsx
14: validarCampos() --> Linea 61 addComisionModal.tsx
SE DETECTAN CAMPOS VACIOS O FORMATOS INCORRECTOS
15: Muestra avisos de validacion en los campos afectados --> Linea 89 addComisionModal.tsx (setErrores) / Linea 148 (render de mensajes)
16: Corrige los datos y confirma --> Linea 105 addComisionModal.tsx
17: validarCampos() --> Linea 61 addComisionModal.tsx
A PARTIR DE AQUI EL FLUJO RETOMA EL CURSO NORMAL (ver paso 15 Figura 5)

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