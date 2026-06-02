# Cheat-sheet de defensa — SIC-UNNE (foco: DOO + Arquitectura)

> Para repasar antes de la mesa. Respuestas en primera persona, listas para decir.
> (Lo de arquitectura híbrida / RLS lo explicás vos; acá va lo de DOO, capas y patrón.)

---

## 0. Guion de 30 segundos sobre la arquitectura (si te lo piden de entrada)

> "El módulo está en **capas**. Para los dos casos de uso con lógica de negocio —gestionar reportes
> (C-01) y crear/importar comisiones (C-02/C-03)— el flujo es:
> **Interfaz (React) → API Route (controlador) → Servicio de dominio (orquestador) → Entidad →
> Repositorio → base.** La lógica vive en `src/domain/`, aislada de Supabase y de Next.js. El
> orquestador **no hace el trabajo: lo delega** en la entidad y en el repositorio."

---

## 1. Preguntas sobre el DIAGRAMA DOO

**P: ¿Qué representa cada línea de vida?**
> El actor (Administrador), el `Sistema (Interfaz)` que **orquesta**, y los **objetos del dominio**
> (Reporte, Usuario, Comisión, etc.). No hay `Frontend/Backend/DB`: son objetos, no capas técnicas.

**P: ¿Por qué `Reporte` se manda un mensaje a sí mismo? ¿Está bien una auto-llamada?**
> Sí, es un **mensaje reflexivo** válido en UML: el objeto ejecuta uno de sus propios métodos. Lo uso
> para mostrar las operaciones públicas del módulo Reporte (`obtenerDetalleReporte`, `resolverReporte`).

**P: ¿`resolverReporte()` es un método de la entidad `Reporte`?**
> En el diagrama, la línea `Reporte` representa el **módulo** del caso de uso y `resolverReporte()` es
> su **operación pública** (la fachada). Internamente recorre las capas y la **lógica de negocio la
> ejecuta la entidad `Reporte` con `resolver(accion)`**, que aplica el patrón Estado. Te muestro la
> cadena en la trazabilidad si querés. *(→ `trazabilidad_Sabrina.md`)*

**P: ¿Dónde está el patrón de diseño en este diagrama?**
> Dentro de `resolver()`. El `Reporte` **delega** en su objeto-estado actual. `EstadoPendiente`
> permite resolver; `EstadoResuelto`/`EstadoDesestimado` heredan el comportamiento base que **lanza
> `ReporteYaProcesadoError`**. Es el **patrón Estado**.

**P: ¿Cómo evitás que un reporte se resuelva dos veces?**
> No con un `if`. El caso normal y el alternativo invocan **el mismo** `resolver(accion)`; la diferencia
> la decide el **estado** del reporte. Si ya está en estado terminal, lanza el error → el controlador
> responde **409**. Esa es la gracia del patrón Estado: la regla está en los objetos, no dispersa.

**P: En el diagrama, ¿el `Sistema` hace todo o delega? (GRASP)**
> **Delega.** El `Sistema (Interfaz)` actúa como **Controlador/Orquestador** (GRASP Controller): recibe
> la acción, invoca a cada objeto y evalúa el resultado, pero **el trabajo lo hace cada entidad**
> (`Reporte.resolver`, `Comision.validar`) y la persistencia el repositorio.

**P: ¿Quién es responsable de crear la Comisión? (GRASP Creator)**
> El `ServicioComision` instancia `new Comision(datos)` y le pide `validar()`. La entidad es la
> **Information Expert** de sus reglas (nombre, letras, asignatura): nadie valida por ella.

**P: ¿Por qué la primera flecha (Interfaz → Reporte) no muestra el salto HTTP?**
> El diagrama es de **diseño OO**, abstrae la plomería. Esa flecha en el código son 3 saltos: `fetch`
> del cliente → API Route → Servicio. Lo muestro en la trazabilidad, pero en el diagrama no ensucio
> el mensaje de negocio con detalles de transporte.

**P: ¿Por qué los métodos están en español y con parámetros?**
> Es el **refinamiento del diseño** para esta entrega: nombres de dominio en español
> (`obtenerComisiones`, `vincularProfesores`) y parámetros de entrada/salida explícitos, para que el
> diagrama hable el lenguaje del problema y no de la implementación.

**P: En C-02, ¿qué es `asignar(...)`?** *(la única flecha floja — respuesta honesta)*
> En el código la vinculación comisión–profesor la hace `vincularProfesores(profesores_ids)`. El
> mensaje del diagrama refleja esa operación. *(Ideal: editá el `.puml` y ponelo como
> `vincularProfesores` — ver las "3 micro-ediciones" en `trazabilidad_Sabrina.md`.)*

**P: ¿Dónde se validan los datos?**
> En **dos barreras**: en el cliente, `validarCampos()` en el modal (no deja ni llamar al backend si
> hay errores); y en el dominio, `Comision.validar()`, que lanza `ComisionInvalidaError` → 400. La del
> dominio es la que de verdad protege la integridad.

**P: ¿Cómo bajan el acoplamiento entre interfaz y backend?** *(le importa a tu profe)*
> La interfaz **no consume datos crudos ni vistas**: llama a funciones/servicios que pegan a la **API**
> y devuelven **JSON** con lo necesario. La UI no sabe de SQL ni de la forma de las tablas.

**P: ¿Y el encapsulamiento? (lo que le marcó a otro grupo)**
> La transición de estado del reporte es interna a la entidad (`registrarAccion`, `transicionarA` son
> de uso interno); afuera solo se expone `resolver()`/`desestimar()`. El método público coincide con
> la flecha del diagrama.

---

## 2. Preguntas sobre la ARQUITECTURA / capas

**P: ¿Qué capas tiene y qué hace cada una?**
> - **Presentación:** `src/app`, `src/pages/*.jsx`, `src/components`, `src/services/*` (cliente HTTP). React + validación de entrada.
> - **Aplicación (API):** `src/pages/api/` — controladores que reciben el `fetch`, validan transporte y delegan en el dominio.
> - **Dominio:** `src/domain/` — entidades, reglas y el **patrón Estado**. No importa Supabase ni Next.js.
> - **Infraestructura:** `src/infrastructure/repositorios/` — los únicos que conocen Supabase (SQL).
> - **Datos:** PostgreSQL en Supabase.

**P: ¿Por qué separaste dominio de infraestructura?**
> Para poder **testear la lógica sin base de datos** (inyecto repositorios falsos) y para **neutralidad
> tecnológica**: si cambiara de base, solo toco la capa de repositorios.

**P: ¿Qué pasa si mañana cambian de Supabase a otra base?**
> Reescribo solo `src/infrastructure/repositorios/`. El dominio y los controladores no se enteran.

**P: ¿Tienen pruebas?**
> Sí, **38 tests** con Vitest sobre el dominio, sin base de datos: máquina de estados del reporte, cada
> validación de comisión y la importación masiva (incluido el caso de "reporte ya gestionado").

**P: ¿Por qué Supabase si no usan sus APIs automáticas?**
> Lo usamos como **PostgreSQL + Auth**. La capa de aplicación es nuestra (API Routes), así controlamos
> validaciones, patrones y dónde se ejecuta cada cosa.

---

## 3. Mapa rápido "dónde está cada cosa" (por si te piden abrir el código)

| Concepto | Archivo |
|---|---|
| Orquestador C-01 | `src/domain/reporte/ServicioResolucionReporte.ts` |
| Entidad + patrón Estado | `src/domain/reporte/Reporte.ts` + `src/domain/reporte/estados/` |
| Orquestador C-02/C-03 | `src/domain/comision/ServicioComision.ts` |
| Entidad Comisión (validar) | `src/domain/comision/Comision.ts` |
| Controladores (API) | `src/pages/api/reportes/[id].js`, `src/pages/api/comisiones/index.js` |
| Repositorios | `src/infrastructure/repositorios/` |
| Validación CSV (C-03) | `src/services/utils/csvParser.js` |
| Validación del formulario (C-02) | `src/components/features/modals/addComisionModal.tsx` (`validarCampos`) |
| Trazabilidad diagrama↔código | `docs/puml/diagramas_de_Secuencia_Sabrina/trazabilidad_Sabrina.md` |

---

## 4. Las 3 micro-ediciones que conviene hacer ANTES (texto en los `.puml`)

1. C-02: `asignar(...)` → `vincularProfesores(id_comision, profesores_ids)` *(la única flecha sin función real)*.
2. C-02: participante `Sistema (ReportesPage)` → `Sistema (EstructuraPage)`.
3. C-01: sacar "Se ha notificado a los usuarios" del mensaje final (no hay notificaciones en el código).

Con eso, **cada flecha cae en una función real** y aguantás el "mostrame esa función".
