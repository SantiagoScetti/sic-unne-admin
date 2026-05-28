# Plan de Pruebas — SIC-UNNE (Módulo de Administración)

> **Asignatura:** Ingeniería del Software II — **Fecha:** 2026-05-28
> Cubre la rúbrica *"Pruebas de Funcionalidad: diseña las pruebas y registra ejecución de funcionalidad crítica"*.

---

## 1. Estrategia de pruebas

| Aspecto | Decisión |
|---|---|
| **Tipo** | Pruebas **unitarias** sobre la capa de **dominio** y los **servicios de aplicación**. |
| **Framework** | [Vitest](https://vitest.dev) 4.x (corre sobre Node + esbuild, soporte TypeScript nativo). |
| **Aislamiento de la BD** | Los servicios reciben sus repositorios por **inyección de dependencias**; en las pruebas se inyectan **dobles de prueba (mocks)**. **No se toca Supabase**: las pruebas son rápidas, deterministas y no requieren conexión. |
| **Ubicación** | Carpeta `tests/` que **espeja** la estructura de `src/`. |
| **Ejecución** | `npm test` (una corrida) · `npm run test:watch` (modo interactivo). |

### Organización de carpetas

```
tests/
└── domain/
    ├── reporte/
    │   ├── Reporte.test.ts                      ← Patrón ESTADO
    │   ├── acciones/seleccionarAccion.test.ts   ← Patrón ESTRATEGIA
    │   ├── eventos/DispatcherEventos.test.ts     ← Patrón OBSERVADOR (sujeto)
    │   ├── eventos/listeners.test.ts             ← Patrón OBSERVADOR (listeners)
    │   └── ServicioResolucionReporte.test.ts     ← Orquestación C-01 (3 patrones)
    └── comision/
        ├── Comision.test.ts                      ← Reglas de negocio (validación)
        └── ServicioComision.test.ts              ← Casos de uso C-02 / C-03
```

---

## 2. Casos de prueba diseñados

> **Funcionalidades cubiertas:** C-01 Gestionar Reporte (principal) y C-02/C-03 Crear/Importar Comisión.
> Estado de la última ejecución: ✅ = pasó.

### 2.1 C-01 — Patrón Estado (`Reporte.test.ts`)

| ID | Precondición | Entrada / Acción | Resultado esperado | Result. |
|----|--------------|------------------|--------------------|:------:|
| RP-01 | Reporte `Pendiente` | `resolver('Suspender Temporalmente')` | estado → `Resuelto`; `accionTomada` guardada | ✅ |
| RP-02 | Reporte `Pendiente` | `desestimar()` | estado → `Desestimado` | ✅ |
| RP-03 | Reporte `Resuelto` | `resolver('Enviar aviso')` | lanza `ReporteYaProcesadoError` | ✅ |
| RP-04 | Reporte `Resuelto` | `resolver(...)` y se inspecciona el error | `codigo === 'CONFLIC_ALREADY_PROCESSED'` | ✅ |
| RP-05 | Reporte `Desestimado` | `desestimar()` | lanza `ReporteYaProcesadoError` | ✅ |
| RP-06 | `emisor_id = null` / `= 5` | `emisorEsSistema()` | `true` / `false` | ✅ |
| RP-07 | Reporte `Pendiente` resuelto + admin | `aFilaPersistible()` | `{ estado:'Resuelto', accion_tomada, admin_id }` | ✅ |

### 2.2 C-01 — Patrón Estrategia (`seleccionarAccion.test.ts`)

| ID | Precondición | Entrada / Acción | Resultado esperado | Result. |
|----|--------------|------------------|--------------------|:------:|
| ES-01 | — | `seleccionarAccion(<cada acción>)` | devuelve la estrategia concreta correcta | ✅ |
| ES-02 | — | `EnviarAviso.aplicar()` | NO suspende; notificación tipo `Aviso` | ✅ |
| ES-03 | `fechaHasta` provista | `SuspenderTemporalmente.aplicar()` | `usuarioRepo.suspender(receptor, fecha)`; tipo `Bloqueo` | ✅ |
| ES-04 | sin `fechaHasta` | `SuspenderTemporalmente.aplicar()` | lanza error | ✅ |
| ES-05 | — | `SuspenderIndefinidamente.aplicar()` | `suspender(receptor, null)`; tipo `Bloqueo` | ✅ |

### 2.3 C-01 — Patrón Observador (`DispatcherEventos.test.ts`, `listeners.test.ts`)

| ID | Precondición | Entrada / Acción | Resultado esperado | Result. |
|----|--------------|------------------|--------------------|:------:|
| OB-01 | 2 observadores suscritos | `publicar(evento)` | ambos reciben el evento, en orden | ✅ |
| OB-02 | sin observadores | `publicar(evento)` | no falla | ✅ |
| OB-03 | emisor real (≠ Sistema) | `NotificarUsuariosListener.manejar()` | 2 notificaciones (receptor + emisor) | ✅ |
| OB-04 | emisor = Sistema (`null`) | `NotificarUsuariosListener.manejar()` | 1 notificación (solo receptor) | ✅ |
| OB-05 | evento resuelto | `RegistrarAuditoriaListener.manejar()` | auditoría con admin, afectado y observaciones | ✅ |

### 2.4 C-01 — Orquestación (`ServicioResolucionReporte.test.ts`)

| ID | Precondición | Entrada / Acción | Resultado esperado | Result. |
|----|--------------|------------------|--------------------|:------:|
| SR-01 | Reporte `Pendiente` | `resolver(Suspender Temporal, fecha, admin=2)` | estado `Resuelto`; guarda; suspende; notifica; audita | ✅ |
| SR-02 | sin `admin_id` | `resolver('Enviar aviso')` | usa admin por defecto; auditoría con `id_admin=1` | ✅ |
| SR-03 | Reporte `Resuelto` | `resolver(...)` | lanza conflicto y **no escribe nada** (ni guardar/suspender/notif/auditoría) | ✅ |
| SR-04 | Reporte `Pendiente` | `desestimar()` | estado `Desestimado`; sin sanción; auditado | ✅ |

### 2.5 C-02/C-03 — Comisión (`Comision.test.ts`, `ServicioComision.test.ts`)

| ID | Precondición | Entrada / Acción | Resultado esperado | Result. |
|----|--------------|------------------|--------------------|:------:|
| CO-01 | — | `validar()` con datos válidos (` a `,` m `) | OK; normaliza a `A`/`M` y recorta nombre | ✅ |
| CO-02 | — | `validar()` con nombre vacío | lanza `ComisionInvalidaError` | ✅ |
| CO-03 | — | `validar()` con letras no `[A-Z]` o de 2 chars | lanza `ComisionInvalidaError` | ✅ |
| CO-04 | — | `validar()` con `Desde >= Hasta` (M,A / A,A) | lanza `ComisionInvalidaError` (CHECK estricto) | ✅ |
| CO-05 | — | `validar()` con `id_asignatura = 0` | lanza `ComisionInvalidaError` | ✅ |
| CO-06 | — | `aFilaPersistible()` | forma exacta de la tabla `comision` | ✅ |
| SC-01 | asignatura existe | `crear()` válido con 2 profesores | crea comisión + `vincularProfesores(99,[1,2])` | ✅ |
| SC-02 | — | `crear()` con letras inválidas | lanza error; **no llama** al repositorio | ✅ |
| SC-03 | asignatura inexistente | `crear()` | lanza `ComisionInvalidaError`; no crea | ✅ |
| SC-04 | — | `actualizar()` con `profesores_ids` | `reemplazarProfesores(99,[3])` | ✅ |
| SC-05 | — | `actualizar()` con letras inválidas | lanza `ComisionInvalidaError` | ✅ |
| SC-06 | 2 filas (1 ok, 1 con asignatura inexistente) | `importarMasivo()` | `insertadas=1`, `errores=1` con detalle | ✅ |

---

## 3. Registro de ejecución

**Comando:** `npm test`
**Fecha de corrida:** 2026-05-28
**Resultado global:**

```
 Test Files  7 passed (7)
      Tests  33 passed (33)
   Duration  ~0.8 s
```

| Archivo | Tests | Estado |
|---|:---:|:---:|
| `Reporte.test.ts` | 7 | ✅ |
| `acciones/seleccionarAccion.test.ts` | 5 | ✅ |
| `eventos/DispatcherEventos.test.ts` | 2 | ✅ |
| `eventos/listeners.test.ts` | 3 | ✅ |
| `ServicioResolucionReporte.test.ts` | 4 | ✅ |
| `comision/Comision.test.ts` | 6 | ✅ |
| `comision/ServicioComision.test.ts` | 6 | ✅ |
| **Total** | **33** | **✅ 33/33** |

> Para regenerar este registro: `npm test` y pegar la salida. Para volver a correr ante cada cambio: `npm run test:watch`.

---

## 4. Trazabilidad pruebas ↔ diseño

| Caso de uso | Patrón / Clase probada | Archivo de test | Diagrama |
|---|---|---|---|
| C-01 | Estado (`Reporte`, `EstadoPendiente/Resuelto/Desestimado`) | `Reporte.test.ts` | `docs/puml/actualizacion_claude/C-01 *` |
| C-01 | Estrategia (`AccionResolucion` y concretas) | `seleccionarAccion.test.ts` | idem |
| C-01 | Observador (`DispatcherEventos`, listeners) | `DispatcherEventos.test.ts`, `listeners.test.ts` | idem |
| C-01 | Orquestación (`ServicioResolucionReporte`) | `ServicioResolucionReporte.test.ts` | `C-01 (Caso Normal)` / `(ya gestionado)` |
| C-02 / C-03 | `Comision`, `ServicioComision` | `Comision.test.ts`, `ServicioComision.test.ts` | `C-02 *`, `C-03 *` |

---

## 5. Pruebas pendientes (trabajo futuro)

- **Integración de API Routes** (`/api/reportes/[id]`, `/api/comisiones`): requieren mock de Supabase o una BD de prueba; quedan fuera del alcance actual.
- **Pruebas E2E** de la UI (Playwright) sobre los flujos "Crear Comisión" y "Gestionar Reporte".
- **Repositorios** contra una base de datos de test (hoy se prueban indirectamente vía mocks en los servicios).
