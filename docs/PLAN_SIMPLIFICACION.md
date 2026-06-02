# Plan de Simplificación — SIC-UNNE (Grupo 50)

Resumen de **qué se decidió**, **qué ya está hecho** y **qué falta**. Versión condensada
(2026-06-02). Los artefactos detallados viven en sus propios archivos (links abajo).

---

## 1. Estado de avance

| Tema | Estado |
|---|---|
| Un solo patrón de diseño en el código: **Estado** (Estrategia y Observador *inlineados*) | ✅ HECHO |
| Carpetas `src/domain/reporte/acciones/` y `eventos/` eliminadas | ✅ HECHO |
| Legacy borrado: `supabase/functions/` + boilerplate del starter | ✅ HECHO |
| Diagramas de secuencia **DOO** (objetos, métodos en español, sin capas/HTTP/SQL, sin recuadros) | ✅ HECHO → `docs/puml/actualizacion_claude/` |
| Diagrama de clases con **recuadro del patrón Estado** | ✅ HECHO → `docs/uml/diagrama_clases.md` |
| Trazabilidad diagrama ↔ código (flecha → archivo:línea) | ✅ HECHO → `.../trazabilidaddeDiagramas.md` |
| Mapa de carpetas del repo | ✅ HECHO → `docs/ESTRUCTURA_DEL_PROYECTO.md` |
| Tests (38, en 5 archivos) + fix de rutas del editor | ✅ HECHO → `tests/README.md`, `tests/tsconfig.json` |
| **Código de la app** | ✅ **CONGELADO** (no se simplifica más) |
| Reescribir `docs/uml/patrones_diseno.md` (1 + 2 candidatos + 2 auxiliares) | ⬜ PENDIENTE |
| Ajustes en el **Word** (cap. 3) | ⬜ PENDIENTE (ver §4) |
| Ampliar bibliografía | ⬜ PENDIENTE |

---

## 2. Decisiones tomadas

1. **Arquitectura en capas.** Se mantiene; el problema nunca fueron "las capas" sino la
   duplicación y los patrones de más (ya resueltos). Tu **Figura 17 con 5 capas es
   correcta: dejala**. El estilo "sin capas/HTTP/SQL" aplica **solo a los diagramas de
   secuencia**, no al gráfico de arquitectura.

2. **Un solo patrón de diseño (GoF): Estado.** Estrategia y Observador pasan a
   **candidatos documentados** (se describe dónde *podrían* aplicarse; no están en el
   código). El recuadro del patrón va **solo en el diagrama de clases**.

3. **`Repositorio` y `Singleton` NO son "el patrón".** Son **roles de la arquitectura en
   capas**, no patrones que se estén luciendo. Que aparezcan no contradice "un solo
   patrón de diseño".

4. **Catálogo en BaaS a propósito.** Solo Comisión y Reporte pasan por la API en capas
   (tienen lógica de negocio). El resto (períodos, edificios, etc.) accede directo a
   Supabase, protegido por **RLS**. Es una migración incremental, no un descuido.

5. **Código congelado.** Sacar el repositorio NO simplificaría los diagramas y metería
   SQL en ellos (lo que la profe rechaza). El repositorio es lo que mantiene los
   diagramas OO limpios y permite testear sin base.

---

## 3. Cómo defenderlo (machete para la exposición)

- *"¿Por qué `ComisionRepositorio`?"* → "Es el único objeto que sabe hablar con la base
  para las comisiones. Mantiene el SQL fuera del dominio (por eso los diagramas son OO
  sin SQL) y nos deja testear sin base de datos."
- *"¿Cuántos patrones implementaron?"* → "Uno de diseño: **Estado**. Documentamos dos
  candidatos (Estrategia, Observador). Y usamos dos auxiliares de arquitectura
  (Repositorio, Singleton)."
- *"Mostrame el diagrama en el código"* → abrir `ServicioResolucionReporte.resolver()` y
  bajar; cada línea es una flecha (ver `trazabilidaddeDiagramas.md`).
- *"¿Seguridad del catálogo?"* → "Esas tablas están protegidas por RLS en Supabase."

---

## 4. Qué falta cambiar en el Word (cap. 3)

Tu tabla de 5 capas y la Figura 17 quedan. Lo que hay que corregir (texto desactualizado):

| Dónde | Cambio |
|---|---|
| **3.1.1, fila Dominio** | Quitar "interfaces de repositorio"; decir "el patrón de diseño **Estado**". |
| **3.1.1, fila Infraestructura** | Repos **concretos** (no "definidos en el dominio"); son los únicos que conocen Supabase. |
| **3.1.1, fila Datos** | "Edge Functions **reemplazadas** por API Routes; el catálogo usa acceso directo protegido por **RLS**." |
| **3.2 intro** | "implementa **cinco** patrones" → "**un** patrón (Estado) + **dos candidatos** (Estrategia, Observador) + **dos auxiliares** (Repositorio, Singleton)". |
| **3.2.1** | `ReporteYaGestionadoError` → **`ReporteYaProcesadoError`**. |
| **3.2.2 / 3.2.3** | Reescribir Estrategia y Observador como **candidatos** ("dónde aplicaría"), no como implementados (las carpetas `acciones/` y `eventos/` ya no existen). |
| **3.2.5 Singleton** | `createServerClient()` → **`getSupabaseServer()`**; instancia única **por proceso** (no por petición). |
| **3.4.4 Vitest** | **33 → 38 tests**; quitar "estrategias/dispatcher"; el patrón verificado es **Estado**; el test de CSV está en `src/services/utils/csvParser.test.js`. |

> Los textos exactos para copiar y pegar se entregan aparte (en el chat de trabajo).

---

## 5. Archivos de referencia

- Diagramas de secuencia + trazabilidad: `docs/puml/actualizacion_claude/`
- Diagrama de clases: `docs/uml/diagrama_clases.md`
- Mapa del repo: `docs/ESTRUCTURA_DEL_PROYECTO.md`
- Tests: `tests/README.md`
