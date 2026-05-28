# Plan de Acción — SIC-UNNE (Grupo 50)

> Estado al **2026-05-28**. Funcionalidades en alcance: **Crear Comisión (C-02)**, **Importar CSV (C-03)**, **Gestionar Reporte (C-01)**.
> Leyenda: ✅ listo · 🟡 existe pero hay que actualizar/renderizar · ❌ falta.

## Arquitectura (decidida)
Cliente-Servidor **en capas**, backend propio Next.js API Routes. **NO BaaS, NO MVC.** Supabase = solo PostgreSQL + Auth.
`React (src/app, src/pages/*.jsx) → Servicios HTTP (src/services) → Controladores (src/pages/api) → Dominio (src/domain) → Repositorios (src/infrastructure) → Supabase`
**3 patrones** (dominio de Reporte, C-01): **Estado** (`domain/reporte/estados`), **Estrategia** (`acciones`), **Observador** (`eventos`). Auxiliares: **Singleton** + **Repositorios** (`src/infrastructure`).

## PRIMER AVANCE — checklist oficial
| Ítem | Estado | Dónde está / qué falta |
|---|---|---|
| Ciclo de vida del proyecto | ✅ | En informe .docx — Scrum (Sec. 2.1) |
| Planificación (tareas/recursos) | ✅ | En informe — 4 sprints (Sec. 2.2) |
| Plan de Riesgos | ✅ | En informe — tabla (Sec. 2.3) |
| Evaluación y justificación de arquitectura | ✅ | Cap. 3 actualizado a 3 capas (texto en `artifacts/seccion_arquitectura.md`) |
| Herramientas (síntesis) | ✅ | Sec. 3.4 actualizada — React, Supabase, Next.js API Routes, Vitest (texto en `artifacts/seccion_herramientas.md`) |
| Bibliografía | 🟡 | Solo 3 refs IEEE — **ampliar** |
| Diagrama de Casos de Uso (refinado) | 🟡 | Figura 2 existe — refinar a la muestra implementada |
| 6 Conversaciones | ✅ | En informe — C-01/C-02/C-03 normal+alt (Sec. 2.8) |
| 6 Diagramas de Secuencia | ✅ | En informe + actualizados a 3 capas en `docs/puml/actualizacion_claude/` |
| Contratos de operaciones críticas | ✅ | Ambos contratos alineados al código — `artifacts/contrato_1_importar.md` + `artifacts/contrato_2_resolver.md` |
| Desarrollo de 1 funcionalidad básica | ✅ | Crear Comisión / Estructura Académica corriendo |

## SEGUNDA ENTREGA — checklist oficial
| Ítem | Estado | Dónde está / qué falta |
|---|---|---|
| Mapeo a Modelo de BD Física | 🟡 | ER en informe (Fig. 1) + `docs/uml/diagrama_fisico.md` — falta **render final** desde `dbdiagram.dbml` |
| Diagrama de Clases | 🟡 | `docs/uml/diagrama_clases.md` (vista diseño con métodos + vista datos) — falta **renderizar e insertar en informe** |
| Funcionalidad principal + trazabilidad | 🟡 | C-01 Gestionar Reporte ✅ en código; **falta reescribir** `TRAZABILIDAD_DIAGRAMAS.md` (apunta a rutas/Edge Functions viejas) |
| Generación y ejecución de pruebas | ✅ | 33 tests (Vitest) en `tests/` (`npm test`) + `docs/plan_pruebas.md` con registro |
| Documentación Técnica + Manual de Usuario | ❌ | **Falta crear** `docs/manual_tecnico.md` (instalación/despliegue) y `docs/manual_usuario.md` (capturas de los flujos) |
| Bibliografía consultada | 🟡 | Ampliar |

## ✅ Hecho a nivel código (resumen)
- **C-01** resolver/desestimar en 1 llamada (`PATCH /api/reportes/[id]`) con los 3 patrones; caso "ya gestionado" → 409.
- **C-02** Crear Comisión en 3 capas (`POST /api/comisiones`): valida asignatura + crea + vincula profesores; validación estricta de letras (Desde < Hasta).
- **C-03** Importar CSV: la parte de comisiones va por el API.
- Dominio en TypeScript con inyección de dependencias; `tsc --noEmit` sin errores; 33 tests verdes.

## 🔜 Próximos pasos (orden sugerido)
1. **Manual de Usuario + Manual Técnico** (❌, único punto sin empezar de la 2da entrega).
2. **Reescribir `TRAZABILIDAD_DIAGRAMAS.md`** con las rutas/clases nuevas (requisito → CU → DS → código → test).
3. **Renderizar** diagrama de clases y modelo físico para meterlos en el informe.
4. **Actualizar el informe .docx**: Cap. 3 (arquitectura 3 capas), herramientas (Vitest), bibliografía.
5. (Código, opcional) Migrar el resto de entidades académicas (asignatura, profesor, carrera, período, edificio, facultad) a 3 capas: hoy aún usan Supabase directo desde el cliente. Repetir el patrón de Comisión → deja el CSV 100% por el API.

## Notas técnicas
- Requiere `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` (sin `NEXT_PUBLIC_`), usada server-side.
- Hallazgos del schema ya corregidos en código: `reporte` no tiene `resolucion_admin` (obs. van a `auditoria.detalles`); `reporte.estado` ∈ {Pendiente, Resuelto, Desestimado}; `notificacion.tipo` válidos {Reporte, Aviso, Bloqueo, ...}; `auditoria.id_admin` NOT NULL.
- **TODO**: la auditoría usa un admin por defecto si el front no manda `admin_id`; reemplazar por el admin de la sesión real al cablear auth en las API Routes.
