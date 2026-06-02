# Diagramas de secuencia DOO — versión final (para defender ante la cátedra)

> Estos diagramas están en una carpeta **aparte** a propósito: **no tocan** los que hizo
> tu compañera en `docs/puml/actualizacion_claude/`. Si los adoptan, copien/renombren
> desde acá.

---

## 1. Lo que tu profe corrige (sus 5 reglas, sacadas de sus devoluciones)

1. **Las líneas de vida NO son `Frontend / Backend / DB`.** Ese diagrama lo marcó como **erróneo**
   (el de "Registrar Venta"). Las líneas de vida son: el **Actor**, el **`Sistema (Interfaz)`**
   y los **objetos del dominio** (Producto, Categoría, Receta, Usuario, Comisión, etc.).
2. **`Sistema (Interfaz)` es un ORQUESTADOR**: va invocando a cada objeto **por separado** y
   evaluando el resultado feliz. **No** hace todo él mismo: **delega** en las entidades.
   (Esto es lo que le marcó a Nazareno: "el controlador hace las 6 funciones… no las delega").
3. **Diagrama y código tienen que coincidir EXACTO**: si una flecha existe en el diagrama, el
   método debe existir en el código con **ese mismo nombre**, esa visibilidad (pública/privada)
   y ese emisor/receptor. (Es lo que le marcó a Tomás con `validarReceta()`/`registrarReceta()`).
4. **Nombres de métodos en español + parámetros de entrada/salida.** En el refinamiento de la 2ª
   entrega no se aceptan `getProducts()`; va `obtenerProductos(id_usuario)`.
5. **Bajo acoplamiento**: nada de consumir vistas/datos crudos directo en la interfaz. Funciones
   o APIs que devuelvan lo necesario.

**Las auto-llamadas (mensaje de un objeto a sí mismo) SÍ las acepta** — aparecen en todos sus
ejemplos (`Categoria -> Categoria: obtenerCategorias()`, `Receta -> Receta: validarReceta()`).

---

## 2. Buena noticia: el enfoque de tu compañera está bien encaminado

Comparado con los ejemplos que la profe **aceptó** (Recetas, Agregar Producto, GestAcad), los
diagramas de tu compañera **están en la familia correcta**: Actor → `Sistema (Interfaz)` → entidades,
con auto-llamadas. **No** cayeron en el error `Frontend/Backend/DB`. Eso es lo más difícil y ya lo
tienen bien.

> Esto matiza lo que te dije en la revisión anterior: yo los comparé contra un diagrama de
> arquitectura limpia (con Servicio/Repositorio). Contra el estándar **real de TU profe**
> (Active Record + orquestador), el estilo de tu compañera es el correcto. **No hay que tirar su
> trabajo**, hay que **refinarlo**.

Lo que sí falla en los `.puml` actuales (y está corregido acá):

| Bug en `actualizacion_claude/` | Corrección en `doo_final/` |
|---|---|
| C-01: el participante `Usuario` se declara y **nunca se usa** | Ahora `Usuario` recibe `suspender(fechaHasta)` |
| C-01: mensaje final "**Se ha notificado a los usuarios**" (falso, no hay notificaciones) | Eliminado → "Acción aplicada con éxito" |
| C-01/02: `Reporte -> Reporte: resolverReporte(...)` (es función del **cliente**, no método de la entidad) | Reemplazado por el método real `resolver(accion)` |
| C-02: participante etiquetado **`Sistema (ReportesPage)`** (mal copiado) | Ahora `Sistema (Interfaz)` / EstructuraPage |
| C-02: `Profesor -> Profesor: asignar(...)` (**no existe** ese método) | Reemplazado por `Comision.vincularProfesores(profesores_ids)` (real) |

---

## 3. El núcleo de tu pregunta: "¿cómo adapto la arquitectura para que sea como los diagramas?"

Tu profe te deja elegir el sentido (se lo dijo a Tomás): **o ajustás el código al diagrama, o el
diagrama al código.** Tenés dos caminos:

### 🅰️ Opción A — Adaptar el CÓDIGO a estos diagramas (estilo Active Record, igual que los ejemplos de la profe)
Las entidades pasan a **dueñas de sus operaciones** (incluida la persistencia) y el orquestador
**delega** en ellas. Es lo que muestran estos `.puml` y lo que más se parece a sus ejemplos.
**Mejor calce con la cátedra**, pero implica tocar código (detalle en §4) y **revisar los tests**.

### 🅱️ Opción B — Adaptar el DIAGRAMA al código actual (cero cambios de código)
Tu código ya tiene un orquestador (`ServicioResolucionReporte` / `ServicioComision`) que delega en
la entidad **y** en repositorios. Mostramos esos repositorios como objetos en el diagrama.
**Cero refactor, los 38 tests siguen verdes**, y sigue siendo DOO con delegación. El repositorio
es un objeto de diseño válido (NO es `DB`/`Backend`). Cómo convertir, en §5.

### Recomendación honesta (tienen deadline)
- **Si tienen un par de horas:** Opción A. Calza casi perfecto con el estándar de tu profe.
- **Si están sin tiempo / no quieren arriesgar los tests:** Opción B. Es 100% defendible igual.

---

## 4. Opción A — cambios de código exactos (mensaje del diagrama ↔ código)

### C-01 Gestionar Reporte
| Mensaje en el diagrama | ¿Existe hoy? | Qué hacer |
|---|---|---|
| `Reporte.resolver(accion)` | ✅ `src/domain/reporte/Reporte.ts:50` | nada |
| `Reporte.registrarAccion(accion)` / `transicionarA(...)` | ✅ `Reporte.ts:45-46` | nada |
| `Reporte.asignarAdmin(admin_id)` | ✅ `Reporte.ts:54` | nada |
| `Reporte.obtenerReportes(filtroEstado)` | ⚠️ hoy es `GET /api/reportes` | agregar método (estático) en `Reporte` que use el repo, **o** dejarlo como lectura (ver nota) |
| `Reporte.obtenerDetalle(id_reporte)` | ⚠️ hoy `GET /api/reportes/[id]` | idem |
| `Reporte.guardar()` | ⚠️ hoy `ReporteRepositorio.guardar(reporte)` | agregar `Reporte.guardar()` que delega en el repo |
| `Usuario.suspender(fechaHasta)` | ⚠️ hoy `UsuarioRepositorio.suspender(id, fecha)` | crear entidad `src/domain/usuario/Usuario.ts` con `suspender(fechaHasta)` que delega en el repo |

Y en `ServicioResolucionReporte.resolver()` cambiar las llamadas a repos por llamadas a las
entidades (`reporte.guardar()`, `usuario.suspender(...)`).

### C-02 Crear Comisión
| Mensaje | ¿Existe hoy? | Qué hacer |
|---|---|---|
| `Comision.validar()` | ✅ `src/domain/comision/Comision.ts:47` | nada |
| `Comision.crear(...)` | ⚠️ está en `ServicioComision.crear()` | que el orquestador delegue, o exponer `Comision.crear()` |
| `Asignatura.existe(id_asignatura)` | ⚠️ hoy `ComisionRepositorio.existeAsignatura()` | crear entidad `Asignatura` con `existe(id)` **o** dejar el chequeo dentro de `Comision` |
| `Comision.guardar()` | ⚠️ hoy `ComisionRepositorio.crear(comision)` | agregar `Comision.guardar()` que delega en el repo |
| `Comision.vincularProfesores(ids)` | ⚠️ hoy `ComisionRepositorio.vincularProfesores()` | agregar facade `Comision.vincularProfesores(ids)` |

### C-03 Importar masivamente
| Mensaje | ¿Existe hoy? | Qué hacer |
|---|---|---|
| `csvParser.validarFormatoArchivo/parsearCSV/validarEsquema/detectarDuplicados/detectarIncompletos/detectarFormatosInvalidos` | ✅ `src/services/utils/csvParser.js` | **nada** |
| `Edificio/Facultad/Carrera/Periodo/Asignatura/Profesor/Comision.insertar(filas)` | ✅ cada `src/services/academico/*.service.js` tiene `insertar()` | **nada** |

➡️ **C-03 ya coincide con el código tal cual.** Es el caso de uso más fácil de defender.

> ⚠️ **Nota sobre los tests (importante):** mover la persistencia a las entidades cambia cómo se
> testea `ServicioResolucionReporte` (hoy inyecta repos mock por constructor). Si hacen la Opción A,
> revisen `tests/domain/reporte/ServicioResolucionReporte.test.ts` y
> `tests/domain/comision/ServicioComision.test.ts`. Por eso, si están con el tiempo justo, la
> Opción B es más segura.
>
> **Lecturas (`obtener...`):** los dos primeros mensajes de cada diagrama (listar/detalle) son de
> consulta. Si no quieren tocarlos, pueden dejarlos como están y la profe normalmente lo acepta —
> lo que de verdad mira es la **operación de escritura** (resolver / crear) delegada en la entidad.

---

## 5. Opción B — convertir cualquiera de estos diagramas (cero código)

Donde el diagrama dice una auto-llamada de persistencia de la entidad, se reemplaza por una llamada
del orquestador al **repositorio real**. Ejemplo para C-01:

```
' En vez de:
Sistema -> Reporte : guardar()
Sistema -> Usuario : suspender(fechaHasta)

' Se pone (coincide con el código actual, sin tocar nada):
participant ":ReporteRepositorio" as RepoR
participant ":UsuarioRepositorio" as RepoU
...
Sistema -> RepoR : guardar(reporte)
Sistema -> RepoU : suspender(receptor_id, fechaHasta)
```

`Reporte.resolver(accion)` y `Comision.validar()` se quedan como están (ya son métodos reales de la
entidad). Así el orquestador sigue delegando (entidad para la lógica, repositorio para la persistencia)
y **todo coincide con el código sin cambiar una línea**.

---

## 6. Cómo defenderlo en la mesa

- "El **`Sistema (Interfaz)`** es el orquestador; **delega** la lógica de negocio en la entidad
  (`Reporte.resolver()`, `Comision.validar()`) y la persistencia en [la entidad / el repositorio]."
- "El **patrón Estado** está acá: `resolver()` solo es válido si el reporte está `Pendiente`; un
  estado terminal lanza `ReporteYaProcesadoError` → 409. Por eso C-01 normal y el alternativo
  comparten el mismo `resolver(accion)`."
- "Cada flecha es un método real": abrí `trazabilidaddeDiagramas.md` al lado del código.
  (Antes corregí los números de línea, ver la revisión general.)

---

### Archivos en esta carpeta
- `C-01 Gestionar Reporte (Caso Normal).puml`
- `C-01 Gestionar Reporte (Reporte ya procesado).puml`
- `C-02 Crear Comision (Caso Normal).puml`
- `C-02 Crear Comision (Datos invalidos).puml`
- `C-03 Importar datos masivamente (Caso Normal).puml`
- `C-03 Importar datos masivamente (CSV con errores).puml`
