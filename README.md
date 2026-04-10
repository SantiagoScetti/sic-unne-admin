# SIC-UNNE | Módulo de Administración y Reportes

Este repositorio contiene el frontend del Panel de Administración para el Sistema de Intercambio de Comisiones (SIC-UNNE). Está construido para permitir al personal de la facultad gestionar la estructura académica, auditar acciones y resolver conflictos de matching.

## 🏗️ Arquitectura del Proyecto

Para cumplir con los estándares de la asignatura, este proyecto implementa una **Arquitectura Cliente-Servidor orientada a servicios BaaS** (Supabase) aplicando estrictamente el patrón de **Separación de Responsabilidades (Separation of Concerns)**.

**Regla de Oro para el Desarrollo:**
Los componentes visuales (React/Next.js) **nunca** deben comunicarse directamente con la base de datos. Toda petición a Supabase debe pasar a través de las funciones exportadas en la carpeta `src/services/`.

### Estructura de Carpetas

* `src/app/`: Define las rutas de la aplicación (App Router). Aquí viven las páginas (`page.tsx`) y los layouts (`layout.tsx`).
* `src/components/`: Componentes puros de interfaz de usuario.
  * `ui/`: Botones, inputs, modales, etc.
* `src/services/`: **Capa de Datos.** Aquí reside toda la lógica de conexión con Supabase (`authClientService.js`, `reportesService.js`).
* `src/lib/`: Utilidades y configuraciones generales del cliente.

## 🚀 Guía de Inicio Rápido (Setup)

Sigue estos pasos para levantar el entorno de desarrollo local:

1. **Clonar el repositorio:**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd sic-unne-admin

Instalar dependencias:

Bash
npm install
Configurar Variables de Entorno:

Crea un archivo llamado .env.local en la raíz del proyecto.

Solicita las credenciales de Supabase al administrador del repositorio (Santiago) y pégalas con el siguiente formato:

Fragmento de código
NEXT_PUBLIC_SUPABASE_URL=URL_DEL_PROYECTO
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANONIMA
Levantar el servidor local:

Bash
npm run dev
Abre http://localhost:3000 en tu navegador para ver la aplicación.

🎨 Flujo de Trabajo para UI/UX
Crea una rama nueva para tu feature: git checkout -b feature/nombre-de-la-vista.

Desarrolla la maquetación en src/app o src/components utilizando datos estáticos (mock de datos) si el endpoint aún no está listo.

Una vez finalizada la vista, importa el servicio correspondiente de src/services/ para conectar los datos reales.
