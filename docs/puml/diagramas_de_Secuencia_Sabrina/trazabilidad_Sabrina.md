# Trazabilidad — Diagramas de Sabrina (los que viven en el doc) ↔ Código

> Mapea **cada mensaje** de los `.puml` de esta carpeta a la **función real del código**.
> Sirve para mostrar en la defensa que "cada flecha del diagrama es una función que existe".
>
> **Cómo leer la línea de vida `Reporte` / `Comision`:** representa el **módulo** de ese caso de
> uso (su "fachada" pública). El mensaje es la **operación pública** que se invoca; por dentro esa
> operación recorre las 3 capas. Donde eso es importante (resolver un reporte), abajo está la
> **cadena interna** que muestra el patrón Estado.

---

## C-01 · Gestionar Reporte (Caso Normal)

| Mensaje del diagrama | Función real del código |
|---|---|
| `Interfaz → Reporte : obtenerReportes()` | `obtenerReportes()` → [`src/services/reportes/reporte.service.js:11`](../../../src/services/reportes/reporte.service.js) → `GET /api/reportes` [`src/pages/api/reportes/index.js:24`](../../../src/pages/api/reportes/index.js) |
| `Reporte → Reporte : obtenerDetalleReporte(id_reporte)` | `obtenerDetalleReporte()` `reporte.service.js:41` → `GET /api/reportes/[id]` (handleGet) [`src/pages/api/reportes/[id].js:50`](../../../src/pages/api/reportes/[id].js) |
| `Interfaz → Interfaz : setIsReporteModalOpen(true)` | `handleAbrirModal()` → `setIsModalOpen(true)` [`src/pages/ReportesPage.jsx:96`](../../../src/pages/ReportesPage.jsx) |
| `Reporte → Reporte : resolverReporte(id_reporte, {estado, accion, fechaHasta, observaciones, admin_id})` | `resolverReporte()` `reporte.service.js:70` → `PATCH /api/reportes/[id]` (handlePatch) `[id].js:69` → **cadena interna ↓** |
| `Interfaz → Administrador : "Reporte resuelto con éxito…"` | toast de éxito `ReportesPage.jsx:123` (en `handleGuardarAccion:108`) |

### Cadena interna de `resolverReporte(...)` — acá está el PATRÓN ESTADO
```
PATCH /api/reportes/[id].js:69  (controlador)
  └─ ServicioResolucionReporte.resolver()        src/domain/reporte/ServicioResolucionReporte.ts:55   ← ORQUESTADOR
       ├─ reporteRepo.obtenerPorId(id)            ReporteRepositorio.ts:12
       ├─ reporte.resolver(accion)                Reporte.ts:50            ← la ENTIDAD delega en su estado
       │     └─ EstadoPendiente.resolver(...)     estados/EstadoPendiente.ts:17
       │           ├─ reporte.registrarAccion()   Reporte.ts:46
       │           └─ reporte.transicionarA(EstadoResuelto)  Reporte.ts:45
       ├─ reporte.asignarAdmin(adminId)           Reporte.ts:54
       ├─ reporteRepo.guardar(reporte)            ReporteRepositorio.ts:28
       └─ usuarioRepo.suspender(receptor, fecha)  UsuarioRepositorio.ts:15   (si la acción es suspender)
```

---

## C-01 · Gestionar Reporte (Alternativo: ya gestionado)

| Mensaje del diagrama | Función real del código |
|---|---|
| `Reporte → Reporte : resolverReporte(... estado="Resuelto" ...)` | `resolverReporte()` `reporte.service.js:70` → `PATCH [id].js:69` → cadena interna ↓ |
| `Reporte --> Interfaz : Error: Reporte ya gestionado` | el reporte está en estado terminal → `EstadoReporte.resolver()` base **lanza** `ReporteYaProcesadoError` [`estados/EstadoReporte.ts:18`](../../../src/domain/reporte/estados/EstadoReporte.ts) → controlador devuelve **409** `[id].js:34` |
| `Interfaz → Administrador : "…Reporte ya gestionado."` | `reporte.service.js:83` lanza `CONFLIC_ALREADY_PROCESSED` → `ReportesPage.jsx:127` muestra el aviso |

> **Punto fuerte para mostrar:** C-01 normal y este alternativo invocan **el mismo** `resolver(accion)`.
> La diferencia de comportamiento NO está en un `if`, sino en el **objeto-estado** del reporte
> (Pendiente acepta; Resuelto/Desestimado rechazan). Eso es el patrón Estado.

---

## C-02 · Crear Comisión (Caso Normal)

| Mensaje del diagrama | Función real del código |
|---|---|
| `Comision → Comision : obtenerComisiones(filtroEstado="Todos")` | `obtenerComisiones()` [`src/services/academico/comision.service.js:32`](../../../src/services/academico/comision.service.js) → `GET /api/comisiones` [`index.js:23`](../../../src/pages/api/comisiones/index.js) → `ServicioComision.listar()` `ServicioComision.ts:50` → `ComisionRepositorio.listar()` `ComisionRepositorio.ts:35` |
| `Interfaz → Interfaz : setIsComisionModalOpen(true)` | StatCard "Comisiones" `EstructuraPage.jsx:589` |
| `Interfaz → Interfaz : validarCampos()` | `validarCampos()` [`src/components/features/modals/addComisionModal.tsx:62`](../../../src/components/features/modals/addComisionModal.tsx) (validación de **presentación**) |
| `Comision → Comision : crear(nombre, letraDesde, letraHasta, id_asignatura, profesores_ids)` | `crear()` `comision.service.js:74` → `POST /api/comisiones` `index.js:48` → `ServicioComision.crear()` `ServicioComision.ts:59` → **cadena interna ↓** |
| `Comision → Profesor : asignar(id_comision, profesores_ids)` | ⚠️ **OJO:** no existe `asignar()`. La función real es `vincularProfesores()` `ComisionRepositorio.ts:84` (llamada desde `ServicioComision.ts:76`). **Ver "micro-ediciones" abajo.** |
| `Interfaz → Administrador : "Comisión creada con éxito"` | toast de éxito `EstructuraPage.jsx:197` (en `handleSave:149` → `handleCrearComision:139`) |

### Cadena interna de `crear(...)`
```
POST /api/comisiones/index.js:48
  └─ ServicioComision.crear()           src/domain/comision/ServicioComision.ts:59   ← ORQUESTADOR
       ├─ new Comision(datos)           src/domain/comision/Comision.ts:30
       ├─ comision.validar()            Comision.ts:47   ← reglas de negocio (entidad)
       ├─ repo.existeAsignatura(id)     ComisionRepositorio.ts:61
       ├─ repo.crear(comision)          ComisionRepositorio.ts:73
       └─ repo.vincularProfesores(...)  ComisionRepositorio.ts:84   (= el "asignar" del diagrama)
```

---

## C-02 · Crear Comisión (Alternativo: datos inválidos)

| Mensaje del diagrama | Función real del código |
|---|---|
| `Interfaz → Interfaz : validarCampos()` (detecta error) | `validarCampos()` `addComisionModal.tsx:62` devuelve `false` y setea `errores` (no se llama al backend) |
| `Interfaz → Administrador : avisos en los campos` | render de `errores` en el modal `addComisionModal.tsx:149,160,175,188` |
| (tras corregir) `crear(...)` / `asignar(...)` | igual que el caso normal ↑ |

> El dominio **también** valida (`Comision.validar()` lanza `ComisionInvalidaError` → 400), por si el
> dato inválido llegara igual al backend. Es la "segunda barrera". Buen dato para mencionar.

---

## C-03 · Importar datos masivamente (Caso Normal) — el más fiel al código

| Mensaje del diagrama | Función real del código |
|---|---|
| `Interfaz → Parser : validarFormatoArchivo(archivo)` | [`src/services/utils/csvParser.js:38`](../../../src/services/utils/csvParser.js) (desde `EstructuraPage.jsx:288`) |
| `Interfaz → Parser : parsearCSV(archivo)` | `csvParser.js:48` (`EstructuraPage.jsx:296`) |
| `Interfaz → Parser : validarEsquema(filas)` | `csvParser.js:64` (`EstructuraPage.jsx:299`) |
| `Interfaz → Parser : detectarDuplicados(filas)` | `csvParser.js:90` (`EstructuraPage.jsx:308`) |
| `Interfaz → Parser : detectarIncompletos(filas)` | `csvParser.js:116` (`EstructuraPage.jsx:317`) |
| `Interfaz → Parser : detectarFormatosInvalidos(filas)` | `csvParser.js:140` (`EstructuraPage.jsx:326`) |
| `Edificio → Edificio : insertar(filas)` | `insertar()` [`src/services/academico/edificio.service.js:90`](../../../src/services/academico/edificio.service.js) (`EstructuraPage.jsx:336`) |
| `Facultad → Facultad : insertar(filas)` | `facultad.service.js` → `insertar()` (`EstructuraPage.jsx:339`) |
| `Carrera → Carrera : insertar(filas)` | `carrera.service.js` → `insertar()` (`EstructuraPage.jsx:342`) |
| `Periodo → Periodo : insertar(filas)` | `periodo.service.js` → `insertar()` (`EstructuraPage.jsx:345`) |
| `Asignatura → Asignatura : insertar(filas)` | `asignatura.service.js` → `insertar()` (`EstructuraPage.jsx:348`) |
| `Profesor → Profesor : insertar(filas)` | `profesor.service.js` → `insertar()` (`EstructuraPage.jsx:351`) |
| `Comision → Comision : insertar(filas)` | `comision.service.js:98` → `POST /api/comisiones` (filas) `index.js:33` → `ServicioComision.importarMasivo()` `ServicioComision.ts:122` |
| `Interfaz → Administrador : "Archivo importado con éxito"` | `EstructuraPage.jsx:358` |

➡️ Acá **todos los nombres coinciden** con funciones reales. Es el caso de uso más sólido para defender.

---

## C-03 · Importar datos (Alternativo: CSV con errores/duplicados)

| Mensaje del diagrama | Función real del código |
|---|---|
| `Parser → Interfaz : Se detectaron duplicados` | `detectarDuplicados()` `csvParser.js:90` devuelve errores → `EstructuraPage.jsx:308-313` corta el flujo |
| `Interfaz → Administrador : "Se encontraron datos duplicados…"` | `setErrorMessage(...)` `EstructuraPage.jsx:310` |

---

## ⚠️ 3 micro-ediciones de TEXTO (no cambian la estructura) que te dejan a prueba de balas

Tu profe exige que el método del diagrama exista en el código (regla que le marcó a Tomás). Estas 3
son ediciones de **texto** dentro de los `.puml`, no rediseños:

1. **C-02 (normal e inválidos):** cambiar el mensaje `Profesor → Profesor : asignar(id_comision, profesores_ids)`
   por `Comision → Profesor : vincularProfesores(id_comision, profesores_ids)`.
   *(Es el ÚNICO mensaje sin función real. Si no lo cambian, prepará la respuesta: "en el código se
   llama `vincularProfesores`".)*
2. **C-02 (ambos):** el participante dice `Sistema (ReportesPage)` → debería ser `Sistema (EstructuraPage)`.
3. **C-01 (normal):** el mensaje final dice "…Se ha notificado a los usuarios". **No hay notificaciones**
   en el código. Dejarlo en "Reporte resuelto con éxito" (sacar la parte de notificación).

Con esas 3, **cada flecha de los diagramas de Sabrina cae en una función real** y pasás el test de
"mostrame esa función" sin huecos.
