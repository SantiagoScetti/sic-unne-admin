# Plan de Pruebas — SIC-UNNE (Módulo de Administración)

---

## C-01 — Gestionar Reporte y Resolución de Conflictos


|                                        |     |                                                                      |     |
| -------------------------------------- | --- | -------------------------------------------------------------------- | --- |
| **Id-nombre del sistema:** SIC-UNNE    |     | **Caso de uso:** C-01 – Gestionar Reporte y Resolución de Conflictos |     |
| **Versión del caso de prueba:** 1      |     | **Nombre del probador:** Grupo 50                                    |     |
| **Autor del caso de prueba:** Grupo 50 |     | **Fecha de ejecución:** 2026-05-28                                   |     |
| **Fecha de creación:** 2026-05-28      |     |                                                                      |     |


### Patrón Estado — `Reporte.ts`


| CP  | Objetivo                                                      | Datos de entrada                                                     | Resultado esperado                                                                             |
| --- | ------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1   | Resolver un reporte pendiente aplicando una acción            | Reporte en estado `Pendiente`; acción: `'Suspender Temporalmente'`   | El estado cambia a `Resuelto`; el campo `accionTomada` queda registrado con el valor ingresado |
| 2   | Desestimar un reporte pendiente                               | Reporte en estado `Pendiente`; llamada a `desestimar()`              | El estado cambia a `Desestimado`                                                               |
| 3   | Intentar resolver un reporte ya resuelto                      | Reporte en estado `Resuelto`; acción: `'Enviar aviso'`               | Se lanza `ReporteYaProcesadoError`; el estado no cambia                                        |
| 4   | Verificar el código de error de un reporte ya procesado       | Reporte en estado `Resuelto`; se captura el error de `resolver(...)` | El error contiene el código `'CONFLICT_ALREADY_PROCESSED'`                                     |
| 5   | Intentar desestimar un reporte ya desestimado                 | Reporte en estado `Desestimado`; llamada a `desestimar()`            | Se lanza `ReporteYaProcesadoError`                                                             |
| 6   | Verificar si el emisor es el Sistema (null) o un usuario real | `emisor_id = null` y `emisor_id = 5`                                 | `emisorEsSistema()` retorna `true` para `null` y `false` para `5`                              |
| 7   | Obtener la fila persistible tras resolver el reporte          | Reporte `Pendiente` resuelto con acción y admin asignado             | `aFilaPersistible()` retorna `{ estado: 'Resuelto', accion_tomada, admin_id }`                 |


### Orquestación del Servicio — `ServicioResolucionReporte.ts`


| CP  | Objetivo                                                              | Datos de entrada                                                               | Resultado esperado                                                                      |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 8   | Resolver un reporte en flujo completo con admin explícito             | Reporte `Pendiente`; acción `'Suspender Temporalmente'`; fecha; `admin_id = 2` | Estado cambia a `Resuelto`; se persiste; se suspende al usuario; se notifica; se audita |
| 9   | Resolver usando el admin por defecto cuando no se provee uno          | Reporte `Pendiente`; acción `'Enviar aviso'`; sin `admin_id`                   | Usa el admin por defecto; la auditoría registra `id_admin = 1`                          |
| 10  | Resolver un reporte ya procesado no debe producir efectos secundarios | Reporte `Resuelto`; cualquier acción                                           | Se lanza error de conflicto; no se llama a guardar, suspender, notificar ni auditar     |
| 11  | Desestimar un reporte en flujo completo                               | Reporte `Pendiente`; llamada a `desestimar()`                                  | Estado cambia a `Desestimado`; sin sanción al usuario; la acción queda auditada         |


---

## C-02 — Crear Comisión


|                                        |     |                                        |     |
| -------------------------------------- | --- | -------------------------------------- | --- |
| **Id-nombre del sistema:** SIC-UNNE    |     | **Caso de uso:** C-02 – Crear Comisión |     |
| **Versión del caso de prueba:** 1      |     | **Nombre del probador:** Grupo 50      |     |
| **Autor del caso de prueba:** Grupo 50 |     | **Fecha de ejecución:** 2026-05-28     |     |
| **Fecha de creación:** 2026-05-28      |     |                                        |     |


### Entidad de Dominio — `Comision.ts`


| CP  | Objetivo                                                    | Datos de entrada                                                                     | Resultado esperado                                                                          |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| 1   | Validar una comisión con datos correctos                    | Nombre: `'Comisión A'`; letraDesde: `' a '`; letraHasta: `' m '`; id_asignatura: `1` | `validar()` no lanza error; los datos se normalizan a `A` / `M` y el nombre queda recortado |
| 2   | Rechazar una comisión con nombre vacío                      | Nombre: `''`; resto de campos válidos                                                | Se lanza `ComisionInvalidaError` con mensaje de nombre obligatorio                          |
| 3   | Rechazar letras fuera del rango A-Z o de más de un carácter | letraDesde: `'AA'`; letraHasta: `'1'`                                                | Se lanza `ComisionInvalidaError`                                                            |
| 4   | Rechazar cuando letraDesde es mayor o igual a letraHasta    | letraDesde: `'M'`, letraHasta: `'A'`; y caso `'A'`, `'A'`                            | Se lanza `ComisionInvalidaError` (violación del CHECK de rango)                             |
| 5   | Rechazar id_asignatura inválido                             | `id_asignatura = 0`                                                                  | Se lanza `ComisionInvalidaError`                                                            |
| 6   | Serializar la comisión para persistencia                    | Comisión válida ya creada                                                            | `aFilaPersistible()` retorna el objeto en la forma exacta de la tabla `comision` de la BD   |


### Servicio de Aplicación — `ServicioComision.ts`


| CP  | Objetivo                                            | Datos de entrada                                              | Resultado esperado                                                |
| --- | --------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| 7   | Crear una comisión válida con profesores asignados  | Datos válidos; asignatura existente; `profesores_ids: [1, 2]` | La comisión se crea y se llama a `vincularProfesores(id, [1, 2])` |
| 8   | No crear una comisión si las letras son inválidas   | letraDesde: `'Z'`; letraHasta: `'A'`                          | Se lanza error antes de llamar al repositorio; nada se persiste   |
| 9   | No crear una comisión si la asignatura no existe    | `id_asignatura` que no existe en la BD                        | Se lanza `ComisionInvalidaError`; no se crea la comisión          |
| 10  | Actualizar los profesores de una comisión existente | `id_comision = 99`; `profesores_ids: [3]`                     | Se llama a `reemplazarProfesores(99, [3])` correctamente          |
| 11  | Rechazar la actualización con letras inválidas      | letraDesde: `'Z'`; letraHasta: `'A'`                          | Se lanza `ComisionInvalidaError`                                  |


---

## C-03 — Importación Masiva de Comisiones por CSV


|                                        |     |                                                     |     |
| -------------------------------------- | --- | --------------------------------------------------- | --- |
| **Id-nombre del sistema:** SIC-UNNE    |     | **Caso de uso:** C-03 – Importar Comisiones por CSV |     |
| **Versión del caso de prueba:** 1      |     | **Nombre del probador:** Grupo 50                   |     |
| **Autor del caso de prueba:** Grupo 50 |     | **Fecha de ejecución:** 2026-05-28                  |     |
| **Fecha de creación:** 2026-05-28      |     |                                                     |     |


### Servicio de Aplicación — `ServicioComision.ts` (importarMasivo)


| CP  | Objetivo                                      | Datos de entrada                                                   | Resultado esperado                                                |
| --- | --------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| 1   | Importar un CSV con filas válidas e inválidas | 2 filas: 1 con asignatura existente y 1 con asignatura inexistente | `insertadas = 1`; `errores = 1` con el detalle de la fila fallida |


---

## Registro de ejecución

**Comando:** `npm test`
**Fecha de corrida:** 2026-05-28

```
 Test Files  7 passed (7)
      Tests  33 passed (33)
   Duration  ~0.8 s
```


| Archivo de test                             | Tests  | Estado      |
| ------------------------------------------- | ------ | ----------- |
| `reporte/Reporte.test.ts`                   | 7      | ✅           |
| `reporte/ServicioResolucionReporte.test.ts` | 4      | ✅           |
| `comision/Comision.test.ts`                 | 6      | ✅           |
| `comision/ServicioComision.test.ts`         | 6      | ✅           |
| **Total**                                   | **33** | **✅ 33/33** |


