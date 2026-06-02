# Tests — SIC-UNNE (Matching, Grupo 50)

Pruebas unitarias con **Vitest**. Verifican la **capa de dominio** de forma aislada:
sin base de datos, sin servidor HTTP y sin navegador (los repositorios se reemplazan
por dobles de prueba inyectados). Hoy hay **38 tests en 5 archivos**.

## Cómo correrlos

```bash
npm test                 # corre toda la suite una vez (vitest run)
npx vitest               # modo watch: re-ejecuta al guardar cambios
npx vitest run tests/domain/reporte/Reporte.test.ts   # un solo archivo
```

## Qué verifica cada archivo

| Archivo | Tests | Qué prueba |
|---|---:|---|
| `tests/domain/reporte/Reporte.test.ts` | 7 | **Patrón Estado**: un reporte `Pendiente` puede resolverse/desestimarse; uno `Resuelto`/`Desestimado` ya no (lanza `ReporteYaProcesadoError` → 409); `emisorEsSistema()`; `aFilaPersistible()`. |
| `tests/domain/reporte/ServicioResolucionReporte.test.ts` | 4 | **Orquestador C-01**: al resolver con suspensión, delega en cada repositorio (guardar, suspender, notificar, auditar); usa admin por defecto si no se pasa; ante un reporte ya procesado **no escribe nada**; `desestimar()` audita sin sancionar. |
| `tests/domain/comision/Comision.test.ts` | 6 | **Entidad Comisión** `validar()`: nombre obligatorio, letras de un solo carácter A-Z, rango estricto (Desde < Hasta), asignatura válida; `aFilaPersistible()`. |
| `tests/domain/comision/ServicioComision.test.ts` | 6 | **Servicio C-02 / C-03**: crea la comisión y vincula profesores; rechaza datos inválidos sin tocar la base; `actualizar()`; `importarMasivo()` inserta válidas y reporta errores por fila. |
| `src/services/utils/csvParser.test.js` | 15 | **Validación del CSV (C-03, presentación)**: formato `.csv`, esquema de columnas, duplicados, campos incompletos y formatos inválidos (fechas, documento, letras). |

> El test del CSV vive en `src/` (al lado del código que prueba). Vitest lo incluye por
> el patrón `src/**/*.test.{js,ts}` definido en `vitest.config.ts`.

## Configuración

- `vitest.config.ts`: define el alias `@` → raíz del proyecto y qué archivos se ejecutan.
- `tests/tsconfig.json`: hace que el **editor** resuelva los imports `@/src/...` dentro de
  `tests/` (si no, marca "Cannot find module", aunque los tests corran bien).
