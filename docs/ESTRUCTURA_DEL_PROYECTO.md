# Estructura del Proyecto — SIC-UNNE (Matching, Grupo 50)

Mapa de carpetas y archivos para no perderte. La app es **un solo proyecto Next.js**
(no es un monorepo). La lógica de las 2 funcionalidades que demostramos
(**Comisión** y **Reporte**) está organizada en **3 capas**.

## Las 3 capas (lo más importante)

| Capa | Qué hace | Carpetas |
|---|---|---|
| **1. Presentación** | UI en React + cliente HTTP (hace `fetch`). | `src/app/`, `src/pages/*.jsx`, `src/layouts/`, `src/components/`, `src/services/` |
| **2. Dominio (Aplicación)** | Orquestador + entidades con comportamiento + patrón Estado + API Routes (puerta técnica). | `src/pages/api/`, `src/domain/` |
| **3. Persistencia** | Repositorios + acceso a Supabase. | `src/infrastructure/` |

> Regla mental: **Presentación pide → Dominio decide → Persistencia guarda.**

---

## Árbol anotado

```text
matchinggrupo50/
├── src/                          ← TODO el código de la app vive acá
│   │
│   ├── app/                      [Capa 1] Next.js App Router = LAS RUTAS REALES
│   │   ├── admin/
│   │   │   ├── estructura/page.tsx   Ruta /admin/estructura → monta <EstructuraPage/>
│   │   │   └── reportes/page.tsx     Ruta /admin/reportes  → monta <ReportesPage/>
│   │   ├── auth/                     Login, registro, recupero (rutas /auth/*)
│   │   ├── layout.tsx               Layout raíz
│   │   ├── page.tsx                 Home: redirige a /auth/login
│   │   └── unauthorized/, not-found.jsx
│   │
│   ├── pages/                    ⚠ OJO: nombre confuso. NO son rutas (salvo api/).
│   │   ├── api/                  [Capa 2] CONTROLADORES (API Routes) — backend propio
│   │   │   ├── comisiones/index.js     POST/GET comisiones (C-02 y C-03)
│   │   │   ├── comisiones/[id].js      PUT/PATCH una comisión
│   │   │   ├── comisiones/contar-activas.js
│   │   │   ├── reportes/index.js       GET reportes
│   │   │   ├── reportes/[id].js        PATCH resolver/desestimar (C-01)
│   │   │   └── _lib/supabaseServer.js  Cliente Supabase del servidor (para las API)
│   │   ├── ReportesPage.jsx     [Capa 1] Pantalla grande de reportes (C-01)
│   │   └── EstructuraPage.jsx   [Capa 1] Pantalla grande de estructura académica (C-02/C-03)
│   │
│   ├── layouts/AdminLayout.jsx  [Capa 1] Marco visual del panel admin
│   │
│   ├── components/features/modals/   [Capa 1] Los formularios modales
│   │   ├── addComisionModal.tsx       (C-02: crear comisión)
│   │   ├── accionReporteModal.tsx     (C-01: elegir acción del reporte)
│   │   └── add{Asignatura,Carrera,Edificio,Facultad,Periodo,Profesor}Modal.tsx
│   │
│   ├── domain/                  [Capa 2] DOMINIO — reglas de negocio (sin SQL)
│   │   ├── reporte/                   ← Funcionalidad principal (C-01)
│   │   │   ├── Reporte.ts             Entidad rica (Contexto del patrón Estado)
│   │   │   ├── ServicioResolucionReporte.ts   ORQUESTADOR: delega cada paso
│   │   │   ├── estados/               ★ PATRÓN ESTADO (el único implementado)
│   │   │   │   ├── EstadoReporte.ts        (base abstracta)
│   │   │   │   ├── EstadoPendiente.ts      (permite resolver/desestimar)
│   │   │   │   ├── EstadoResuelto.ts       (terminal → 409)
│   │   │   │   ├── EstadoDesestimado.ts    (terminal → 409)
│   │   │   │   └── index.ts                (fábrica crearEstado)
│   │   │   ├── errores.ts             ReporteYaProcesadoError
│   │   │   └── tipos.ts               Tipos (EstadoReporteNombre, AccionTomada)
│   │   └── comision/                  ← C-02 y C-03
│   │       ├── Comision.ts            Entidad (valida sus reglas)
│   │       ├── ServicioComision.ts    Orquestador (crear / importarMasivo)
│   │       └── errores.ts             ComisionInvalidaError
│   │
│   ├── infrastructure/         [Capa 3] PERSISTENCIA — único lugar con acceso a Supabase
│   │   ├── repositorios/
│   │   │   ├── ReporteRepositorio.ts        obtenerPorId / guardar
│   │   │   ├── UsuarioRepositorio.ts        suspender / obtenerAdminPorDefecto
│   │   │   ├── NotificacionRepositorio.ts   crearVarias
│   │   │   ├── AuditoriaRepositorio.ts      registrar
│   │   │   └── ComisionRepositorio.ts       crear / buscar... / vincular...
│   │   └── supabaseServer.ts        Cliente Supabase del servidor (Singleton)
│   │
│   └── services/               ⚠ Carpeta MIXTA (tres cosas distintas):
│       ├── reportes/reporte.service.js     [Capa 1] CLIENTE HTTP de C-01 (hace fetch a /api)
│       ├── academico/
│       │   ├── comision.service.js         [Capa 1] CLIENTE HTTP de C-02/C-03 (fetch a /api)
│       │   └── periodo/edificio/facultad/  [BaaS] Catálogo: pegan DIRECTO a Supabase
│       │       carrera/asignatura/profesor.service.js   (a propósito, sin reglas)
│       ├── auth/                            Login/sesión (cliente y servidor)
│       ├── utils/csvParser.js              [Capa 1] Parseo y validación del CSV (C-03)
│       ├── utils/export.service.js         Descarga de CSV/plantilla
│       └── supabaseClient.js               Cliente Supabase del navegador
│
├── components/                  Auth del starter (login-form, ui/, etc.) — SÍ se usa
├── lib/supabase/                Clientes Supabase (client/server) usados por auth
├── public/images/               Imágenes (logo)
├── docs/                        Documentación académica (informe, UML, diagramas, planes)
│   ├── puml/actualizacion_claude/   Diagramas de secuencia DOO + trazabilidad
│   ├── uml/                          Diagrama de clases, modelo físico, patrones
│   └── *.md                          Plan de acción, plan de simplificación, etc.
├── tests/                       Pruebas Vitest (dominio Reporte y Comisión)
├── supabase/                    Config del CLI de Supabase (las Edge Functions se eliminaron)
├── proxy.ts                     Middleware de Next 15 (protege rutas /admin)
└── package.json, tsconfig.json, vitest.config.ts, ...   Configuración
```

---

## Recorrido de una funcionalidad (para explicar en la exposición)

**C-01 Resolver un reporte** atraviesa las 3 capas así:

```
ReportesPage.jsx                         (1 Presentación: el admin elige acción)
  → reporte.service.js  resolverReporte()  (1 Presentación: cliente HTTP, fetch)
  → api/reportes/[id].js                    (2 Dominio: controlador, recibe el PATCH)
  → ServicioResolucionReporte.resolver()    (2 Dominio: ORQUESTADOR)
       → Reporte.resolver() → EstadoPendiente   (2 Dominio: PATRÓN ESTADO)
       → ReporteRepositorio / UsuarioRepositorio / ... (3 Persistencia)
  → Supabase (PostgreSQL)                   (datos)
```

El detalle paso a paso (qué línea de código es cada flecha del diagrama) está en
[`docs/puml/actualizacion_claude/trazabilidaddeDiagramas.md`](puml/actualizacion_claude/trazabilidaddeDiagramas.md).

---

## Qué se limpió y qué quedó pendiente

**Eliminado (era código muerto, no afecta la app):**
- `supabase/functions/` — Edge Functions viejas, reemplazadas por las API Routes.
- Boilerplate del starter sin usar: `components/hero.tsx`, `next-logo.tsx`,
  `supabase-logo.tsx`, `deploy-button.tsx`, `env-var-warning.tsx`, `auth-button.tsx`,
  `components/tutorial/`.
- Patrones Estrategia (`src/domain/reporte/acciones/`) y Observador
  (`src/domain/reporte/eventos/`): se dejó **solo el patrón Estado** en el código.

**Mejoras opcionales (no urgentes, para cuando quieras pulir):**
- Renombrar los *clientes HTTP* para que no se confundan con los *servicios de dominio*:
  `reporte.service.js → reporteApi.js`, `comision.service.js → comisionApi.js`.
- Unificar los clientes Supabase (hoy hay varios: `src/infrastructure/supabaseServer.ts`,
  `src/pages/api/_lib/supabaseServer.js`, `lib/supabase/*`, `src/services/supabaseClient.js`).
- `src/pages/*.jsx` no son rutas; podrían vivir en `src/views/` para evitar la confusión
  con el routing. (Cambio cosmético, toca imports.)

> No hace falta reorganizar carpetas para la entrega. La estructura ya mapea a las 3 capas;
> estas mejoras son solo para legibilidad futura.
```
