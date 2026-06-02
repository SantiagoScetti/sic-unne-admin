# Trazabilidad de Diagramas ↔ Código (DOO)

Este documento te deja **seguir cada diagrama de secuencia paso por paso y ver dónde está ese paso en el código**. Es la herramienta para defender en la exposición que "cada flecha del diagrama es una función real".

## Cómo leer un diagrama como si fuera el código

1. **Cada línea de vida = una clase/archivo.** El "orquestador" (la columna que envía la mayoría de las flechas) es el `Servicio…`.
2. **Cada flecha = una llamada a un método** que existe en la clase de destino.
3. **Recorrer el diagrama = leer el método del orquestador de arriba hacia abajo.** Para C-01, abrí `ServicioResolucionReporte.resolver()` y seguilo línea por línea: vas a ver los mensajes en el mismo orden que el diagrama.
4. **La primera flecha `Sistema (Interfaz) → Servicio` no muestra el salto HTTP.** En el código esa flecha se realiza en 3 saltos de plomería: el cliente HTTP hace `fetch`, la API Route recibe, y recién ahí se llama al Servicio. El diagrama OO abstrae eso.

## Mapa de capas → carpetas → objetos del diagrama

| Capa | Carpeta | Objetos en los diagramas |
|---|---|---|
| Presentación | `src/pages/*.jsx`, `src/components/`, `src/services/*` (cliente HTTP) | `Sistema (Interfaz)`, `:csvParser` |
| Dominio (orquestador + entidad) | `src/domain/` | `:ServicioResolucionReporte`, `:ServicioComision`, `reporte:Reporte`, `comision:Comision`, `estado:EstadoPendiente/Resuelto` |
| Persistencia | `src/infrastructure/repositorios/` | `:ReporteRepositorio`, `:UsuarioRepositorio`, `:ComisionRepositorio` |

> El **patrón Estado** NO se marca en estos diagramas (se marca con un recuadro en el Diagrama de Clases / UML). Acá los objetos `estado:EstadoPendiente` y la delegación `reporte → estado.resolver()` aparecen simplemente porque **así funciona el código**.

---

## C-01 · Gestionar Reporte (Caso Normal)

> Archivo de código central: `src/domain/reporte/ServicioResolucionReporte.ts` (método `resolver()`, línea 51).

| # | Mensaje del diagrama | Dónde está en el código |
|---|---|---|
| 2 | `Interfaz → resolver(...)` | `ReportesPage.jsx` → `resolverReporte()` `src/services/reportes/reporte.service.js:70` → `src/pages/api/reportes/[id].js:69` → `ServicioResolucionReporte.resolver()` `ServicioResolucionReporte.ts:51` |
| 3 | `obtenerPorId(id_reporte)` | `resolver()` llama a `cargar()` `:104` → `ReporteRepositorio.obtenerPorId()` `src/infrastructure/repositorios/ReporteRepositorio.ts:12` |
| 5 | `obtenerAdminPorDefecto()` *(solo si no se envió admin_id)* | `resolverAdminId()` `:110` → `UsuarioRepositorio.obtenerAdminPorDefecto()` `UsuarioRepositorio.ts:30` |
| 7 | `reporte.resolver(accion)` | `ServicioResolucionReporte.ts:56` → `Reporte.resolver()` `src/domain/reporte/Reporte.ts:50` |
| 8 | `estado.resolver(reporte, accion)` | `Reporte.ts:50` delega en `this._estado` → `EstadoPendiente.resolver()` `src/domain/reporte/estados/EstadoPendiente.ts:17` |
| 9 | `registrarAccion(accion)` | `EstadoPendiente.ts:18` → `Reporte.registrarAccion()` `Reporte.ts:46` |
| 10 | `transicionarA(EstadoResuelto)` | `EstadoPendiente.ts:19` → `Reporte.transicionarA()` `Reporte.ts:45` |
| 13 | `asignarAdmin(id_admin)` | `ServicioResolucionReporte.ts:57` → `Reporte.asignarAdmin()` `Reporte.ts:54` |
| 14 | `guardar(reporte)` | `ServicioResolucionReporte.ts:58` → `ReporteRepositorio.guardar()` `ReporteRepositorio.ts:28` |
| 16 | `suspender(receptor_id, fechaHasta)` | helper interno `aplicarEfecto()` `:71` → `UsuarioRepositorio.suspender()` `UsuarioRepositorio.ts:15` |
| 18 | `200 → reporte resuelto` | `/api/reportes/[id].js:86` (respuesta) → `reporte.service.js:90` |

---

## C-01 · Gestionar Reporte (Alternativo: reporte ya gestionado)

| # | Mensaje del diagrama | Dónde está en el código |
|---|---|---|
| 5 | `reporte.resolver(accion)` | `Reporte.resolver()` `Reporte.ts:50` |
| 6 | `estado.resolver(reporte, accion)` | El reporte está **Resuelto**: `EstadoResuelto` NO sobrescribe `resolver()`, así que corre el de la clase base `EstadoReporte.resolver()` `src/domain/reporte/estados/EstadoReporte.ts:18` |
| 7 | `throw ReporteYaProcesadoError` | `EstadoReporte.ts:19` lanza `ReporteYaProcesadoError` (`src/domain/reporte/errores.ts`) |
| 9 | `409 Conflict` | `/api/reportes/[id].js:34` (catch → 409) → `reporte.service.js:83` lanza `CONFLIC_ALREADY_PROCESSED` |

---

## C-02 · Crear Comisión (Caso Normal)

> Código central: `src/domain/comision/ServicioComision.ts` (método `crear()`, línea 59).

| # | Mensaje del diagrama | Dónde está en el código |
|---|---|---|
| 2 | `validarCampos()` *(self-call)* | `src/components/features/modals/addComisionModal.tsx` (validación de presentación) |
| 3 | `Interfaz → crear(...)` | `crear()` `src/services/academico/comision.service.js:74` → `src/pages/api/comisiones/index.js:48` → `ServicioComision.crear()` `ServicioComision.ts:59` |
| 4 | `new Comision(...)` | `ServicioComision.ts:60` → constructor de `src/domain/comision/Comision.ts` |
| 5 | `validar()` | `ServicioComision.ts:68` → `Comision.validar()` `Comision.ts:47` |
| 7 | `existeAsignatura(id_asignatura)` | `ServicioComision.ts:70` → `ComisionRepositorio.existeAsignatura()` `src/infrastructure/repositorios/ComisionRepositorio.ts:61` |
| 9 | `crear(comision)` | `ServicioComision.ts:74` → `ComisionRepositorio.crear()` `ComisionRepositorio.ts:73` |
| 11 | `vincularProfesores(id_comision, profesores_ids)` *(si hay profesores)* | `ServicioComision.ts:76` → `ComisionRepositorio.vincularProfesores()` `ComisionRepositorio.ts:84` |
| 13 | `201 → comisión creada` | `/api/comisiones/index.js:49` → `comision.service.js:91` |

## C-02 · Crear Comisión (Alternativo: datos inválidos)

| # | Mensaje del diagrama | Dónde está en el código |
|---|---|---|
| 5 | `validar()` | `ServicioComision.ts:68` → `Comision.validar()` `Comision.ts:47` |
| 6 | `throw ComisionInvalidaError` | `Comision.validar()` lanza `ComisionInvalidaError` (`src/domain/comision/errores.ts`) |
| 7 | `400 Bad Request` | `/api/comisiones/index.js:55` (catch → 400) → `comision.service.js` |

---

## C-03 · Importar Datos Masivamente (Caso Normal)

> Código central: `src/domain/comision/ServicioComision.ts` (método `importarMasivo()`, línea 122).

| # | Mensaje del diagrama | Dónde está en el código |
|---|---|---|
| 2 | `validarFormatoArchivo(archivo)` | `src/services/utils/csvParser.js:38` (desde `EstructuraPage.jsx`) |
| 4 | `parsearCSV(archivo)` | `csvParser.js:48` |
| 6 | `validarEsquema(filas)` | `csvParser.js:64` |
| 7 | `detectarDuplicados(filas)` | `csvParser.js:90` |
| 8 | `detectarIncompletos(filas)` | `csvParser.js:116` |
| 9 | `detectarFormatosInvalidos(filas)` | `csvParser.js:140` |
| 11 | `Interfaz → importarMasivo(filas)` | `insertar()` `comision.service.js:98` → `src/pages/api/comisiones/index.js:37` → `ServicioComision.importarMasivo()` `ServicioComision.ts:122` |
| 12 | `buscarIdAsignaturaPorNombre(asignatura_nombre)` | `ServicioComision.ts:128` → `ComisionRepositorio.buscarIdAsignaturaPorNombre()` `ComisionRepositorio.ts:124` |
| 14 | `buscarIdComision(comision_nombre, id_asignatura)` | `ServicioComision.ts:134` → `ComisionRepositorio.buscarIdComision()` `ComisionRepositorio.ts:135` |
| 16 | `new Comision(...)` *(si no existe)* | `ServicioComision.ts:136` |
| 17 | `validar()` | `ServicioComision.ts:143` → `Comision.validar()` `Comision.ts:47` |
| 19 | `crear(comision)` | `ServicioComision.ts:148` → `ComisionRepositorio.crear()` `ComisionRepositorio.ts:73` |
| 21 | `buscarIdProfesorPorDocumento(profesor_documento)` | `ServicioComision.ts:153` → `ComisionRepositorio.buscarIdProfesorPorDocumento()` `ComisionRepositorio.ts:147` |
| 23 | `upsertVinculo(id_comision, id_profesor)` | `ServicioComision.ts:159` → `ComisionRepositorio.upsertVinculo()` `ComisionRepositorio.ts:158` |
| 25 | `resultado(insertadas, errores)` | `ServicioComision.ts:165` → `/api/comisiones/index.js:37` → `comision.service.js:98` |

## C-03 · Importar Datos Masivamente (Alternativo: CSV con errores/duplicados)

| # | Mensaje del diagrama | Dónde está en el código |
|---|---|---|
| 6-9 | `validarEsquema / detectarDuplicados / detectarIncompletos / detectarFormatosInvalidos` devuelven errores | `csvParser.js:64 / 90 / 116 / 140` |
| final | `muestra error, NO invoca al Servicio` | `EstructuraPage.jsx` corta el flujo antes de `insertar()` |
