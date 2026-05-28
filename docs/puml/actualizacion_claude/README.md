# Diagramas actualizados — Arquitectura 3 capas

Esta carpeta contiene la **nueva versión** de los Diagramas de Secuencia, reescritos para reflejar la arquitectura **Cliente-Servidor en 3 capas con backend propio (Next.js API Routes)** que se está construyendo según [PLAN_DE_ACCION.md](../../PLAN_DE_ACCION.md) (Fase 1).

Los archivos originales en `docs/puml/` **no fueron modificados** — quedan como referencia histórica de la arquitectura BaaS previa. Una vez que la migración esté completa y el profe la valide, se podrán reemplazar.

## Cambios estructurales respecto a los originales

| Original (BaaS) | Nuevo (3 capas) |
|---|---|
| Líneas de vida `Asignatura`, `Profesor`, `Comision` como objetos del dominio que se autollaman | Eliminadas — se reemplazan por una sola línea de vida `API Backend (/api/comisiones)` |
| `Interfaz` llamaba directamente a Edge Functions / Supabase | `Interfaz` llama a `comision.service.js`, que hace `fetch('/api/comisiones', ...)` |
| Validaciones y SQL mezclados sin capa explícita | Validaciones de cliente en `csvParser.js`, validaciones de negocio en `API`, persistencia en `Supabase` |
| Sin separación visual de capas | Cajas (`box`) coloreadas que agrupan participantes por capa: Presentación, Aplicación-Cliente, Aplicación-Servidor, Datos |

## Archivos

| Archivo | Caso de uso | Flujo |
|---|---|---|
| `C-01 Gestionar Reporte (Caso Normal).puml` | C-01 | **Funcionalidad principal.** Resolución con los 3 patrones: Estado → Estrategia → Observador |
| `C-01 Gestionar Reporte (Reporte ya gestionado).puml` | C-01 | Alt: el patrón Estado detecta transición inválida → HTTP 409, sin escrituras |
| `C-02 Crear Comision (Caso Normal).puml` | C-02 | Camino feliz: validación cliente → POST → ServicioComision (valida + crea + vincula) |
| `C-02 Crear Comision (Datos de formulario invalidos).puml` | C-02 | Alt: validación falla en cliente, no se llama al backend |
| `C-03 Importar datos masivamente (Caso Normal).puml` | C-03 | Bulk: parser cliente → POST con `{ filas }` → loop server-side |
| `C-03 Importar datos masivamente (CSV con errores_duplicados).puml` | C-03 | Alt: el parser detecta errores antes del fetch, no se llama al backend |

> **C-01** es la funcionalidad principal y donde viven los **3 patrones de diseño** (Estado, Estrategia, Observador). Ver `docs/uml/patrones_diseno.md`.

## Trazabilidad código ↔ diagrama (post-migración)

- `Interfaz` → `src/pages/EstructuraPage.jsx` + `src/components/features/modals/addComisionModal.tsx`
- `comision.service.js` → `src/services/academico/comision.service.js`
- `API Backend (/api/comisiones)` → `src/pages/api/comisiones/index.js` y `[id].js`
- `Supabase` → tablas `comision`, `comision_profesor`, `asignatura`, `profesor` (PostgreSQL gestionado por Supabase, accedido vía service_role desde `src/pages/api/_lib/supabaseServer.js`)

## Por qué C-01 (Reportes) todavía no está acá

C-01 está pendiente de migración en **Fase 3** del plan. Sus DS originales en `docs/puml/` siguen siendo válidos para describir el estado **previo** del código (que toca Supabase directo desde el cliente). Cuando se ejecute Fase 3, se agregará a esta carpeta el equivalente actualizado.
