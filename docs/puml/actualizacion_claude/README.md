# Diagramas de Secuencia (DOO) — versión orientada a objetos

Esta carpeta contiene los Diagramas de Secuencia reescritos en **estilo Diseño
Orientado a Objetos (DOO)**, según las correcciones de la cátedra (Prof. Ferraro,
clases del 28-04 y foros del 03/04-05-2026).

## La regla de oro: el diagrama tiene que COINCIDIR con el código

La profe evalúa dos cosas: que el diagrama sea OO y que **se corresponda con las
funciones del código**. De sus correcciones se desprende esta convención:

| ❌ NO hacer (estilo rechazado) | ✅ SÍ hacer (estilo pedido) |
|---|---|
| Líneas de vida `Frontend / Backend / DB` | Líneas de vida = **objetos del dominio** (`:Reporte`, `:Comision`, `:ServicioComision`, repositorios) |
| Mensajes `POST /api/...`, `SELECT`, `INSERT`, `UPDATE` | Mensajes = **métodos en español con parámetros** (`obtenerPorId(id_reporte)`, `suspender(receptor_id, fechaHasta)`) |
| Un "backend" que hace todo de corrido | Un **orquestador que delega** a cada objeto (responsabilidad única) |
| Mostrar un método privado como mensaje externo | Método privado/interno → **flecha a sí mismo** (self-call) |

### Decisiones de modelado aplicadas

1. **No se dibuja el salto HTTP.** En un DS de diseño OO, la transmisión por red es
   plomería. La flecha `Sistema (Interfaz) → :ServicioResolucionReporte` **se realiza en
   el código** mediante `reporteApi.resolverReporte()` (fetch) → handler de la API Route
   → `servicio.resolver()`. Los ejemplos que la profe aprobó ocultan el HTTP igual.
2. **El orquestador delega.** `:ServicioResolucionReporte` y `:ServicioComision` no hacen
   el trabajo: lo reparten entre la entidad (`Reporte`/`Comision`) y los repositorios.
   (Es justo lo que la profe le pidió a Nazareno: que el controlador *delegue*, no que
   ejecute las N funciones él mismo.)
3. **Sin recuadros (`alt`/`opt`/`loop`/`group`).** Los diagramas se entienden de forma
   lineal. Los flujos alternativos (409, datos inválidos, CSV con errores) están en
   **diagramas separados**. La iteración de C-03 se indica con una nota breve.
4. **El patrón NO se marca en el diagrama de secuencia.** El recuadro que identifica el
   patrón Estado va **solo en el Diagrama de Clases (UML)**. Acá los objetos
   `:EstadoPendiente`/`:EstadoResuelto` y la delegación `reporte.resolver() → estado.resolver()`
   aparecen simplemente porque así funciona el código (polimorfismo real).
5. **Self-calls** para lo interno: `validarCampos()` de la Interfaz.

## Archivos

| Archivo | CU | Flujo |
|---|---|---|
| `C-01 Gestionar Reporte (Caso Normal).puml` | C-01 | Funcionalidad principal. Resolución con **patrón Estado** + delegación a repositorios |
| `C-01 Gestionar Reporte (Reporte ya gestionado).puml` | C-01 | Alt: `EstadoResuelto` rechaza la transición → `ReporteYaProcesadoError` |
| `C-02 Crear Comision (Caso Normal).puml` | C-02 | `ServicioComision` valida (entidad) + crea + vincula (repositorio) |
| `C-02 Crear Comision (Datos de formulario invalidos).puml` | C-02 | Alt: validación de presentación o `validar()` de la entidad lanza `ComisionInvalidaError` |
| `C-03 Importar datos masivamente (Caso Normal).puml` | C-03 | `csvParser` valida; `importarMasivo()` procesa cada fila (nota "por cada fila") |
| `C-03 Importar datos masivamente (CSV con errores_duplicados).puml` | C-03 | Alt: el `csvParser` detecta errores; no se invoca al dominio |

## Trazabilidad diagrama ↔ código

La correspondencia **paso por paso** (cada flecha → archivo y línea, para los 6 diagramas)
está en **[trazabilidaddeDiagramas.md](./trazabilidaddeDiagramas.md)**. Ahí está la tabla
que permite decir en la defensa "esta flecha = esta función".

> **Estado del código:** ya se dejó **un solo patrón (Estado)**. La suspensión, la
> notificación y la auditoría se invocan **directo desde `ServicioResolucionReporte`**
> (los patrones Estrategia y Observador fueron *inlineados*; las carpetas `acciones/` y
> `eventos/` se eliminaron). Por eso el diagrama y el código coinciden 1:1. Los 23 tests
> (`npm test`) siguen pasando.

## Cómo renderizar

- PlantText: https://www.planttext.com/ (pegar el contenido del `.puml`)
- VSCode: extensión *PlantUML* (Alt+D para previsualizar, exportar a PNG/SVG)
