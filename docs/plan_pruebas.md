# Plan de Pruebas y Pruebas Unitarias — SIC-UNNE (Módulo de Administración)

---

## 4.3 Plan de Pruebas (Pruebas de Sistema - Caja Negra)

Las pruebas de sistema se diseñan y ejecutan desde el punto de vista del usuario final (administrador) a través de la interfaz gráfica de usuario (GUI). Describen flujos de trabajo completos, acciones de usuario (clicks, selección de opciones, ingresos de texto) y las respuestas visibles del sistema (mensajes de confirmación, actualizaciones de tablas, alertas visuales y redirecciones).

### 4.3.1 Plan de prueba C-01: Gestión de Denuncias y Resolución de Conflictos

| | | | |
| --- | --- | --- | --- |
| **Id-nombre del sistema:** SIC-UNNE | | **Caso de uso:** C-01 – Gestión de Denuncias y Resolución de Conflictos | |
| **Versión del caso de prueba:** 1 | | **Nombre del probador:** Grupo 50 | |
| **Autor del caso de prueba:** Grupo 50 | | **Fecha de ejecución:** 05-06-2026 | |
| **Fecha de creación:** 28-05-2026 | | | |

| CP | Objetivo | Datos de entrada (Acciones del usuario) | Resultado esperado (Comportamiento del sistema) |
| --- | --- | --- | --- |
| 1 | Resolver una denuncia pendiente con suspensión temporal de usuario. | 1. Iniciar sesión como Administrador.<br>2. Ir a "Gestión de Denuncias".<br>3. Hacer clic en "Abrir" en una denuncia con estado "Pendiente".<br>4. Seleccionar la acción "Suspender Temporalmente".<br>5. Ingresar una fecha futura (ej: `2026-12-31`) en "Suspender hasta".<br>6. Hacer clic en "Aplicar acción" y aceptar el cuadro de confirmación del navegador. | 1. El modal se cierra.<br>2. Se muestra una notificación verde en pantalla: "Acción 'Suspender Temporalmente...' aplicada con éxito".<br>3. El estado de la denuncia en la tabla cambia de "Pendiente" a "Resuelto".<br>4. El usuario denunciado queda suspendido. |
| 2 | Resolver una denuncia enviando solo aviso (sin suspensión). | 1. Hacer clic en "Abrir" en una denuncia con estado "Pendiente".<br>2. Seleccionar la acción "Enviar aviso".<br>3. Hacer clic en "Aplicar acción" y aceptar la confirmación del navegador. | 1. El modal se cierra.<br>2. Se muestra una notificación: "Acción 'Enviar aviso' aplicada con éxito".<br>3. El estado cambia a "Resuelto" y el usuario denunciado no recibe sanción. |
| 3 | Desestimar una denuncia pendiente. | 1. Hacer clic en "Abrir" en una denuncia con estado "Pendiente".<br>2. Hacer clic en el botón "Eliminar denuncia".<br>3. Aceptar el diálogo de confirmación del navegador ("¿Desea eliminar la denuncia...?"). | 1. El modal se cierra.<br>2. Se muestra el mensaje "Denuncia desestimada correctamente".<br>3. El estado de la denuncia en la tabla cambia a "Desestimado". |
| 4 | Control de concurrencia al resolver una denuncia ya procesada por otro administrador. | 1. El Administrador A abre el modal de una denuncia "Pendiente" y la mantiene abierta.<br>2. El Administrador B ingresa en otra sesión, abre la misma denuncia, le aplica "Enviar aviso" y la guarda.<br>3. El Administrador A intenta guardar la acción "Suspender Temporalmente" en su modal. | 1. El sistema intercepta el guardado y muestra la alerta: "Esta denuncia ya ha sido procesada por otro administrador. Por favor, recargá la página."<br>2. El modal se cierra automáticamente y la denuncia se actualiza en la tabla mostrando "Resuelto". |
| 5 | Validación de campos obligatorios en suspensión temporal. | 1. Abrir una denuncia "Pendiente".<br>2. Seleccionar la acción "Suspender Temporalmente".<br>3. Dejar el campo "Suspender hasta" vacío.<br>4. Hacer clic en "Aplicar acción". | 1. El sistema bloquea el envío del formulario.<br>2. Se muestra el error visual abajo del campo de fecha: "Debe indicar la fecha hasta." |
| 6 | Validación de fecha anterior al día de hoy en suspensión temporal. | 1. Abrir una denuncia "Pendiente".<br>2. Seleccionar la acción "Suspender Temporalmente".<br>3. Ingresar una fecha anterior o igual a hoy.<br>4. Hacer clic en "Aplicar acción". | 1. El sistema bloquea el envío.<br>2. Se muestra el error visual: "La fecha debe ser posterior a hoy." |
| 7 | Cancelar la operación de resolución de denuncia. | 1. Abrir el modal de una denuncia.<br>2. Cambiar la acción a "Suspender Temporalmente".<br>3. Hacer clic en "Cancelar" y aceptar la confirmación del navegador. | 1. El modal se cierra.<br>2. Los cambios se descartan; el estado de la denuncia permanece "Pendiente". |

### 4.3.2 Plan de prueba C-02: Crear Comisión

| | | | |
| --- | --- | --- | --- |
| **Id-nombre del sistema:** SIC-UNNE | | **Caso de uso:** C-02 – Crear Comisión | |
| **Versión del caso de prueba:** 1 | | **Nombre del probador:** Grupo 50 | |
| **Autor del caso de prueba:** Grupo 50 | | **Fecha de ejecución:** 05-06-2026 | |
| **Fecha de creación:** 28-05-2026 | | | |

| CP | Objetivo | Datos de entrada (Acciones del usuario) | Resultado esperado (Comportamiento del sistema) |
| --- | --- | --- | --- |
| 8 | Crear una comisión con todos sus datos válidos. | 1. Iniciar sesión como Administrador.<br>2. Ir a "Gestión de Estructura Académica".<br>3. Hacer clic en el botón "+" de la tarjeta de "Comisiones".<br>4. Ingresar Nombre: "Comisión A".<br>5. Seleccionar una asignatura (ej: "Ingeniería de Software II").<br>6. Letra Desde: "A", Letra Hasta: "M".<br>7. Seleccionar uno o más profesores de la lista.<br>8. Hacer clic en "Guardar Comisión" y confirmar la operación. | 1. El modal se cierra.<br>2. Se visualiza la notificación: "¡Comisión creado con éxito!".<br>3. La comisión aparece en la tabla de comisiones con estado activo, rango de letras "A - M" y sus profesores vinculados. |
| 9 | Intentar crear comisión con nombre vacío. | 1. Dejar el campo "Nombre de Comisión" vacío o con espacios.<br>2. Completar asignatura, letras y profesores válidos.<br>3. Hacer clic en "Guardar Comisión". | 1. El formulario no se envía.<br>2. Se muestra el mensaje de error: "El nombre es obligatorio." |
| 10 | Intentar crear comisión sin seleccionar asignatura. | 1. Completar Nombre: "Comisión B".<br>2. Dejar el selector de "Asignatura" en la opción por defecto.<br>3. Completar letras y profesores válidos.<br>4. Hacer clic en "Guardar Comisión". | 1. El formulario no se envía.<br>2. Se muestra el mensaje de error: "Debe seleccionar una asignatura." |
| 11 | Intentar crear comisión con rango de letras inválido (Desde >= Hasta). | 1. Completar nombre, asignatura y profesores.<br>2. Ingresar Letra Desde: "Z", Letra Hasta: "A".<br>3. Hacer clic en "Guardar Comisión". | 1. El formulario no se envía.<br>2. Se muestra el error: "La letra 'Desde' debe ser anterior a la letra 'Hasta'." |
| 12 | Intentar crear comisión sin profesores asignados. | 1. Completar nombre, asignatura y rango de letras válido.<br>2. Dejar la lista de profesores sin marcar.<br>3. Hacer clic en "Guardar Comisión". | 1. El formulario no se envía.<br>2. Se muestra el error: "Debe seleccionar al menos un profesor." |
| 13 | Intentar ingresar letras con formato inválido (más de un carácter o números). | 1. Intentar ingresar en Letra Desde: "AA" y en Letra Hasta: "1".<br>2. Hacer clic en "Guardar Comisión". | 1. El formulario no se envía.<br>2. Se muestra el error: "Ambas letras deben ser un único carácter (A-Z)." |
| 14 | Cancelar la creación de una comisión. | 1. Completar datos parciales en el formulario.<br>2. Hacer clic en "Cancelar" y confirmar la operación en el diálogo emergente. | 1. El modal se cierra.<br>2. No se crea ningún registro; la tabla de comisiones no cambia. |

### 4.3.3 Plan de prueba C-03: Importación Masiva de Comisiones por CSV

| | | | |
| --- | --- | --- | --- |
| **Id-nombre del sistema:** SIC-UNNE | | **Caso de uso:** C-03 – Importación Masiva | |
| **Versión del caso de prueba:** 1 | | **Nombre del probador:** Grupo 50 | |
| **Autor del caso de prueba:** Grupo 50 | | **Fecha de ejecución:** 05-06-2026 | |
| **Fecha de creación:** 28-05-2026 | | | |

| CP | Objetivo | Datos de entrada (Acciones del usuario) | Resultado esperado (Comportamiento del sistema) |
| --- | --- | --- | --- |
| 15 | Importar archivo CSV estructurado correctamente con datos válidos. | 1. Ir a "Gestión de Estructura Académica".<br>2. Hacer clic en "Importar CSV".<br>3. Seleccionar un archivo `.csv` válido con datos de la estructura académica. | 1. El sistema procesa y almacena toda la estructura.<br>2. Muestra un mensaje verde: "Archivo importado con éxito".<br>3. Las tarjetas estadísticas se incrementan y los nuevos registros se muestran en sus tablas correspondientes. |
| 16 | Cargar un archivo con extensión incorrecta (no CSV). | 1. Hacer clic en "Importar CSV".<br>2. Seleccionar un archivo `.xlsx` o `.pdf`. | 1. La carga se aborta de inmediato.<br>2. Se muestra la alerta de error: "El archivo seleccionado es inválido". |
| 17 | Cargar un CSV con columnas ausentes o cabeceras inválidas. | 1. Cargar un archivo `.csv` al que le falte alguna columna obligatoria. | 1. El procesamiento se detiene.<br>2. Se muestra un error especificando la columna faltante en el esquema. |
| 18 | Cargar un CSV que contiene registros duplicados internamente. | 1. Cargar un archivo `.csv` donde dos filas tienen el mismo nombre de comisión para una misma asignatura. | 1. El procesamiento se interrumpe.<br>2. Se muestra una alerta con la lista de filas y celdas duplicadas en el archivo. |
| 19 | Cargar un CSV con fechas de periodo inconsistentes. | 1. Subir un archivo `.csv` donde la fecha de fin de un periodo es anterior a la de inicio. | 1. La importación se cancela e informa el error de consistencia en el formato. |

---

## 4.4 Pruebas Unitarias (Caja Blanca)

Las pruebas unitarias se ejecutan de forma programática a nivel de código para validar clases, entidades del modelo de dominio y servicios de aplicación aislados (utilizando mocks/dobles de prueba para sus dependencias). Permiten asegurar la robustez de las reglas de negocio y consistencia de datos.

### 4.4.1 Pruebas de Dominio — `Denuncia.ts` (Patrón Estado)

Estas pruebas validan las reglas de transición del ciclo de vida de una denuncia (Pendiente -> Resuelto / Desestimado) implementadas mediante el patrón de diseño Estado en la entidad `Denuncia`.

| CP | Objetivo | Datos de entrada (Parámetros y estado inicial) | Resultado esperado (Retornos y excepciones) |
| --- | --- | --- | --- |
| 1 | Resolver una denuncia pendiente. | Denuncia en estado `Pendiente`; llamada a `.resolver('Suspender Temporalmente')`. | El estado cambia a `Resuelto` y `.accionTomada` almacena `'Suspender Temporalmente'`. |
| 2 | Desestimar una denuncia pendiente. | Denuncia en estado `Pendiente`; llamada a `.desestimar()`. | El estado cambia a `Desestimado`. |
| 3 | Impedir transiciones en una denuncia ya resuelta. | Denuncia en estado `Resuelto`; llamada a `.resolver('Enviar aviso')`. | Lanza `DenunciaYaProcesadaError` y el estado no cambia. |
| 4 | Capturar y verificar código de error en conflicto de transiciones. | Denuncia en estado `Resuelto`; captura del error al llamar a `.resolver('Enviar aviso')`. | El error es instancia de `DenunciaYaProcesadaError` y su propiedad `.codigo` es `'CONFLIC_ALREADY_PROCESSED'`. |
| 5 | Impedir transiciones en una denuncia ya desestimada. | Denuncia en estado `Desestimado`; llamada a `.desestimar()`. | Lanza `DenunciaYaProcesadaError` y el estado no cambia. |
| 6 | Distinguir emisor del sistema de usuarios reales. | Denuncia con `emisor_id: null` y denuncia con `emisor_id: 5`. | `.emisorEsSistema()` retorna `true` para `null` y `false` para `5`. |
| 7 | Serializar la entidad a la estructura de fila de BD. | Denuncia resuelta con acción y administrador asignado (`admin_id = 1`); llamada a `.aFilaPersistible()`. | Retorna el objeto literal `{ estado: 'Resuelto', accion_tomada: 'Enviar aviso', admin_id: 1 }`. |

### 4.4.2 Pruebas del Servicio de Aplicación — `ServicioResolucionDenuncia.ts`

Estas pruebas validan la orquestación del caso de uso C-01, simulando (mockeando) el acceso a la base de datos y validando los efectos secundarios y llamadas a los repositorios de persistencia y sanciones.

| CP | Objetivo | Datos de entrada (Parámetros y dependencias mock) | Resultado esperado (Interacciones con Mocks) |
| --- | --- | --- | --- |
| 8 | Resolver una denuncia aplicando sanción de suspensión temporal. | Denuncia `Pendiente`; llamada a `.resolver({ id_denuncia: 7, accion: 'Suspender Temporalmente', fechaHasta: '2026-12-31' })`. | Se invoca `denunciaRepo.guardar` una vez, y se llama a `usuarioRepo.suspender(20, '2026-12-31')` para aplicar la sanción. |
| 9 | Resolver una denuncia enviando aviso (sin suspender al usuario). | Denuncia `Pendiente`; llamada a `.resolver({ id_denuncia: 7, accion: 'Enviar aviso' })`. | Se invoca `denunciaRepo.guardar`, y `usuarioRepo.suspender` NO es invocado. |
| 10 | Evitar escrituras en base de datos si la denuncia ya estaba resuelta. | Denuncia en estado `Resuelto`; llamada a `.resolver({ id_denuncia: 7, accion: 'Enviar aviso' })`. | Lanza `DenunciaYaProcesadaError`. `denunciaRepo.guardar` y `usuarioRepo.suspender` NO se invocan. |
| 11 | Desestimar una denuncia. | Denuncia `Pendiente`; llamada a `.desestimar({ id_denuncia: 7, observaciones: 'no corresponde' })`. | Retorna la denuncia con estado `Desestimado`. `usuarioRepo.suspender` NO es invocado. |

### 4.4.3 Pruebas de Dominio — `Comision.ts`

Valida las restricciones estructurales y lógica de negocio de la entidad `Comision` previo a su guardado.

| CP | Objetivo | Datos de entrada (Atributos de la entidad) | Resultado esperado (Retorno / Excepciones) |
| --- | --- | --- | --- |
| 12 | Validar comisión correcta y normalizar textos. | `nombre: '  Comisión A  '`, `letraDesde: 'a'`, `letraHasta: 'm'`, `id_asignatura: 13`; llamada a `.validar()`. | No lanza error. El nombre se recorta a `'Comisión A'` y las letras se guardan en mayúsculas `'A'` y `'M'`. |
| 13 | Rechazar comisión con nombre vacío. | `nombre: '   '` (espacios), resto válido; llamada a `.validar()`. | Lanza `ComisionInvalidaError`. |
| 14 | Rechazar letras que no sean de un único carácter (A-Z). | `letraDesde: 'AB'` o `letraHasta: '1'`; llamada a `.validar()`. | Lanza `ComisionInvalidaError`. |
| 15 | Rechazar cuando la letraDesde es mayor o igual a la letraHasta. | `letraDesde: 'M'`, `letraHasta: 'A'` o `letraDesde: 'A'`, `letraHasta: 'A'`; llamada a `.validar()`. | Lanza `ComisionInvalidaError` (CHECK de base de datos). |
| 16 | Rechazar asignatura inválida. | `id_asignatura: 0` (o negativa); llamada a `.validar()`. | Lanza `ComisionInvalidaError`. |
| 17 | Serializar para persistencia. | Comisión válida (`nombre: 'C'`, `letraDesde: 'A'`, `letraHasta: 'Z'`, `id_asignatura: 5`); llamada a `.aFilaPersistible()`. | Retorna `{ nombre: 'C', letra_desde: 'A', letra_hasta: 'Z', id_asignatura: 5, estado: true }`. |

### 4.4.4 Pruebas del Servicio de Aplicación — `ServicioComision.ts` (Creación e Importación)

Estas pruebas validan la orquestación del caso de uso C-02 y la lógica transaccional de la importación masiva por filas (C-03) utilizando repositorios simulados.

| CP | Objetivo | Datos de entrada (Parámetros y comportamiento del Mock) | Resultado esperado (Retorno / Excepciones) |
| --- | --- | --- | --- |
| 18 | Crear comisión y asignar profesores. | Datos válidos, profesores `[1, 2]`. Llamada a `.crear(...)`. | El servicio valida que la asignatura exista, persiste la comisión y llama a `vincularProfesores(99, [1, 2])`. Retorna el ID de la comisión (`{ id_comision: 99 }`). |
| 19 | Bloquear creación si el rango de letras de comisión es inválido. | `letraDesde: 'M'`, `letraHasta: 'A'`. Llamada a `.crear(...)`. | Lanza `ComisionInvalidaError` de inmediato. No se interactúa con el repositorio. |
| 20 | Bloquear creación si la asignatura no existe en la base de datos. | `id_asignatura: 999` (simulando que `existeAsignatura` retorna `false`). Llamada a `.crear(...)`. | Lanza `ComisionInvalidaError`. No se crea la comisión en el repositorio. |
| 21 | Actualizar la lista de profesores asignados a una comisión. | `id_comision: 99`, `profesores_ids: [3]`. Llamada a `.actualizar(...)`. | Se ejecuta con éxito y llama a `reemplazarProfesores(99, [3])`. |
| 22 | Bloquear actualización con letras inválidas. | `letraDesde: 'Z'`, `letraHasta: 'A'`. Llamada a `.actualizar(...)`. | Lanza `ComisionInvalidaError`. |
| 23 | Importación masiva con filas válidas e inválidas (CSV). | Array de 2 filas: una con materia "Conocida" (existe) y otra con materia "Inexistente" (no existe). Llamada a `.importarMasivo(...)`. | Retorna `{ insertadas: 1, errores: ['Error en fila 2: Asignatura Inexistente no encontrada'] }`. Para la comisión insertada, llama a `upsertVinculo(99, 1)`. |

### 4.4.5 Pruebas Unitarias del Procesador CSV — `csvParser.test.js`

Prueba de forma aislada las utilidades encargadas de parsear, validar formato, verificar duplicados y detectar errores en la importación de archivos CSV (C-03).

| CP | Objetivo | Datos de entrada | Resultado esperado |
| --- | --- | --- | --- |
| 24 | Validar archivo con formato correcto. | Archivo con nombre `'planilla.csv'`; llamada a `validarFormatoArchivo()`. | Retorna `true`. |
| 25 | Validar archivo con formato incorrecto. | Archivo con nombre `'planilla.xlsx'` o nulo; llamada a `validarFormatoArchivo()`. | Retorna `false`. |
| 26 | Validar columnas obligatorias ausentes en esquema. | Filas parseadas donde faltan columnas requeridas; llamada a `validarEsquema()`. | Retorna un listado de errores especificando las columnas faltantes. |
| 27 | Validar columnas correctas en esquema. | Filas parseadas con todas las columnas correspondientes; llamada a `validarEsquema()`. | Retorna un array vacío (sin errores). |
| 28 | Detectar comisiones duplicadas en un mismo CSV. | Filas que intentan registrar la misma comisión para una misma materia; llamada a `detectarDuplicados()`. | Retorna un array con mensajes de error identificando la duplicación. |
| 29 | Detectar campos vacíos en el archivo CSV. | Filas con celdas vacías en columnas obligatorias; llamada a `detectarIncompletos()`. | Retorna un listado indicando qué fila y qué columna tiene el dato vacío. |
| 30 | Detectar fecha de finalización de periodo incorrecta en el CSV. | Filas con `fecha_fin` anterior a `fecha_inicio`; llamada a `detectarFormatosInvalidos()`. | Retorna error informando la inconsistencia de fecha. |
| 31 | Detectar documento de profesor no numérico en el CSV. | Filas con documento de profesor que contiene caracteres; llamada a `detectarFormatosInvalidos()`. | Retorna error detallando que el documento no es un entero positivo. |

---

## 4.5 Registro de Ejecución de Pruebas

**Comando:** `npm test`  
**Fecha de corrida:** 05-06-2026

```
 RUN  v4.1.7 C:/SANTI-ARCHIVOS/Santi/Licenciaura en sistemas de la información/Ing II/Proyecto Matching/Web App/matchinggrupo50

 Test Files  5 passed (5)
      Tests  38 passed (38)
   Start at  16:22:32
   Duration  870ms (tests 37ms)
```

| Archivo de test | Cantidad de Tests | Estado |
| --- | --- | --- |
| `tests/domain/denuncia/Denuncia.test.ts` | 7 | ✅ Exitoso (7/7) |
| `tests/domain/denuncia/ServicioResolucionDenuncia.test.ts` | 4 | ✅ Exitoso (4/4) |
| `tests/domain/comision/Comision.test.ts` | 6 | ✅ Exitoso (6/6) |
| `tests/domain/comision/ServicioComision.test.ts` | 6 | ✅ Exitoso (6/6) |
| `src/services/utils/csvParser.test.js` | 15 | ✅ Exitoso (15/15) |
| **Total** | **38** | **✅ Exitoso (38/38)** |
