# Anexo B — Manual de Implementación y Configuración del Sistema SIC-UNNE

---

## Introducción

El presente documento describe el proceso de configuración, despliegue y puesta en marcha del **Sistema de Intercambio de Comisiones de la Universidad Nacional del Nordeste (SIC-UNNE)**, en su módulo de administración.

A diferencia de los sistemas de escritorio tradicionales, SIC-UNNE es una **aplicación web**. Esto significa que los usuarios finales no realizan ninguna instalación local: acceden al sistema directamente desde un navegador web a través de una URL. Sin embargo, para poner el sistema en funcionamiento por primera vez —o para desplegarlo en un nuevo entorno— el responsable técnico debe seguir los pasos descritos en este manual.

---

## Objetivo de este manual

Indicar los pasos y procedimientos necesarios para llevar a cabo la **configuración, el despliegue y la puesta en marcha** del sistema SIC-UNNE, incluyendo la configuración del entorno, las variables de conexión, la base de datos en la nube y la publicación de la aplicación.

---

## Dirigido a

Este manual está dirigido al **perfil técnico responsable de la implementación y mantenimiento del sistema**: desarrolladores, administradores de sistemas o cualquier integrante del equipo técnico que deba desplegar la aplicación en un entorno nuevo o de producción.

---

## Lo que deben conocer

El responsable de la implementación debe contar con los siguientes conocimientos mínimos:

- Uso básico de la **terminal de comandos** (Bash, PowerShell o Zsh).
- Manejo de **Node.js** y el gestor de paquetes `npm`.
- Comprensión básica de **variables de entorno** y archivos `.env`.
- Conocimientos generales de **bases de datos relacionales** y el lenguaje SQL.
- Manejo básico de la plataforma **Supabase** (o disposición para aprenderla siguiendo este manual).
- Nociones de **despliegue web** (hosting, dominios y certificados HTTPS).

---

## Arquitectura del sistema

SIC-UNNE sigue una arquitectura web en **tres capas**:

| Capa | Tecnología | Descripción |
|---|---|---|
| **Presentación** | Next.js 15 + React 19 + TailwindCSS | Interfaz de usuario ejecutada en el navegador del administrador. |
| **Dominio / Backend** | Next.js API Routes (Node.js) | Lógica de negocio: valida reglas, orquesta entidades y expone endpoints REST internos. |
| **Persistencia** | Supabase (PostgreSQL en la nube) | Base de datos relacional gestionada como servicio (BaaS). Incluye autenticación y Row Level Security (RLS). |

> **Nota:** Supabase actúa como base de datos y proveedor de autenticación simultáneamente. No requiere un servidor de base de datos propio.

---

## Especificaciones técnicas

### Requerimientos del servidor de despliegue (donde corre la aplicación)

| Componente | Requerimiento mínimo | Recomendado |
|---|---|---|
| **Sistema operativo** | Linux (Ubuntu 22.04+), macOS o Windows Server | Ubuntu 22.04 LTS |
| **Node.js** | v18.x | v20.x (LTS) |
| **npm** | v9.x o superior | v10.x |
| **RAM** | 512 MB | 1 GB o más |
| **Almacenamiento** | 1 GB (para la aplicación compilada) | 5 GB |
| **Conectividad** | Acceso a internet (para conectar con Supabase) | Conexión estable de baja latencia |
| **Puerto** | 3000 (desarrollo) / 80 y 443 (producción con proxy) | 443 (HTTPS) |

> La base de datos **no requiere instalación local**: es gestionada íntegramente por Supabase en la nube.

### Requerimientos del cliente (navegador del usuario administrador)

No se requiere instalación de ningún software adicional. El sistema es compatible con:

| Navegador | Versión mínima |
|---|---|
| Google Chrome | 110 o superior |
| Mozilla Firefox | 110 o superior |
| Microsoft Edge | 110 o superior |
| Safari | 16 o superior |

**Conexión a internet requerida.** No funciona sin conectividad.

---

## Dependencias y tecnologías utilizadas

Las siguientes bibliotecas y frameworks son instaladas automáticamente al ejecutar `npm install`:

| Paquete | Versión | Rol |
|---|---|---|
| `next` | latest (≥15) | Framework principal (frontend + backend) |
| `react` / `react-dom` | ^19.0.0 | Librería de interfaz de usuario |
| `@supabase/supabase-js` | latest | Cliente JavaScript de Supabase |
| `@supabase/ssr` | latest | Integración Supabase con renderizado server-side |
| `typescript` | ^5 | Tipado estático del código |
| `tailwindcss` | ^3.4.1 | Framework de estilos CSS |
| `papaparse` | ^5.5.3 | Procesamiento de archivos CSV (importación masiva) |
| `lucide-react` | ^0.511.0 | Íconos de interfaz |
| `vitest` | ^4.1.7 | Framework de pruebas unitarias |

---

## Pasos de implementación

### Paso 1 — Verificar requerimientos del servidor

Antes de comenzar, confirmar que el servidor donde se desplegará la aplicación cumple con los requerimientos mínimos listados anteriormente. Verificar la versión de Node.js instalada con:

```bash
node --version
npm --version
```

Si Node.js no está instalado, descargarlo desde [https://nodejs.org](https://nodejs.org) e instalarlo siguiendo las instrucciones del sitio oficial.

---

### Paso 2 — Obtener el código fuente

Clonar el repositorio del proyecto desde el sistema de control de versiones del equipo:

```bash
git clone <URL_DEL_REPOSITORIO> sic-unne-admin
cd sic-unne-admin
```

Si no se utiliza Git, copiar la carpeta del proyecto completa al servidor y posicionarse dentro de ella en la terminal.

---

### Paso 3 — Instalar las dependencias

Dentro de la carpeta del proyecto, ejecutar:

```bash
npm install
```

Este comando descarga e instala automáticamente todas las bibliotecas listadas en `package.json`. Puede tardar algunos minutos según la velocidad de conexión. Al finalizar, se habrá creado la carpeta `node_modules/` con todos los paquetes necesarios.

---

### Paso 4 — Configurar las variables de entorno

El sistema requiere cuatro variables de entorno para conectarse con Supabase. Estas variables contienen las credenciales de acceso a la base de datos y al servicio de autenticación.

**4.1.** En la raíz del proyecto, crear un archivo llamado `.env.local` (si no existe):

```bash
touch .env.local
```

**4.2.** Abrir el archivo con cualquier editor de texto e ingresar las siguientes variables con los valores correspondientes al proyecto Supabase:

```env
# Clave pública (usada en el navegador — segura para exponer)
NEXT_PUBLIC_SUPABASE_URL=https://<ID_DEL_PROYECTO>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<CLAVE_ANONIMA_PUBLICA>

# Clave de servicio (usada solo en el servidor — NO exponer públicamente)
SUPABASE_URL=https://<ID_DEL_PROYECTO>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<CLAVE_SERVICE_ROLE>
```

**4.3.** Para obtener estos valores, ingresar al panel de Supabase ([https://supabase.com](https://supabase.com)), seleccionar el proyecto correspondiente y navegar a **Configuración del proyecto → API**. Allí se encuentran la URL del proyecto, la clave anónima pública (`anon key`) y la clave de rol de servicio (`service_role key`).

> **⚠ Advertencia de seguridad:** La variable `SUPABASE_SERVICE_ROLE_KEY` otorga acceso total a la base de datos sin restricciones de RLS. **Nunca** debe ser expuesta en el código del frontend ni subida a repositorios públicos. El archivo `.env.local` está excluido del control de versiones por el archivo `.gitignore` del proyecto.

---

### Paso 5 — Verificar la base de datos en Supabase

El esquema de base de datos del sistema debe estar correctamente configurado en el proyecto Supabase. Comprende las siguientes tablas principales:

`edificio` · `facultad` · `carrera` · `periodo` · `asignatura` · `comision` · `profesor` · `comision_profesor` · `aula` · `horario` · `horario_comision` · `usuario` · `inscripcion` · `lista_espera` · `propuesta` · `respuesta_propuesta` · `comprobante` · `constancia` · `denuncia` · `notificacion` · `auditoria_administrativa`

Para verificar que las tablas existen, ingresar al **Editor de tablas** en el panel de Supabase. Si el esquema no ha sido creado aún, ejecutar el script SQL de inicialización provisto por el equipo de desarrollo en el **Editor SQL** de Supabase.

Adicionalmente, verificar que las **políticas de Row Level Security (RLS)** estén activas en todas las tablas, especialmente en `usuario`, `denuncia` y `comision`. Las políticas garantizan que solo los usuarios autenticados con rol de Administrador puedan acceder a los datos sensibles del sistema.

---

### Paso 6 — Ejecutar el sistema en modo desarrollo (opcional)

Para verificar que la configuración es correcta antes del despliegue en producción, ejecutar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`. Abrir esa URL en el navegador y verificar que:

- La pantalla de inicio de sesión se muestra correctamente.
- Es posible iniciar sesión con las credenciales de un usuario Administrador existente.
- El panel de administración carga sin errores.

Si la aplicación no carga o muestra errores de conexión, revisar que las variables del archivo `.env.local` sean correctas.

---

### Paso 7 — Compilar para producción

Una vez verificado el funcionamiento, compilar la aplicación para el entorno de producción:

```bash
npm run build
```

Este comando genera una versión optimizada de la aplicación en la carpeta `.next/`. Una vez completado sin errores, iniciar el servidor de producción con:

```bash
npm run start
```

La aplicación quedará disponible en el puerto `3000`. Para exponer la aplicación a través del puerto `80` (HTTP) o `443` (HTTPS), configurar un servidor proxy inverso como **Nginx** o **Apache** que redirija el tráfico al puerto `3000`.

---

### Paso 8 — Configurar dominio y HTTPS (entorno de producción)

Para que el sistema sea accesible mediante una URL institucional con HTTPS, se recomienda:

1. **Asignar un dominio** (ej.: `sic.unne.edu.ar`) apuntando a la IP del servidor mediante un registro DNS de tipo `A`.
2. **Configurar Nginx** como proxy inverso con la siguiente configuración básica:

```nginx
server {
    listen 80;
    server_name sic.unne.edu.ar;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name sic.unne.edu.ar;

    ssl_certificate     /etc/letsencrypt/live/sic.unne.edu.ar/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sic.unne.edu.ar/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Obtener un certificado SSL gratuito** con Let's Encrypt mediante Certbot:

```bash
sudo certbot --nginx -d sic.unne.edu.ar
```

---

### Paso 9 — Carga inicial de datos

Una vez desplegado el sistema, el administrador deberá realizar una **carga inicial de datos** para que el sistema sea funcional. Esta carga incluye:

| Entidad | Método de carga |
|---|---|
| Edificios y Facultades | Inserción directa desde el panel de administración del sistema |
| Carreras y Períodos | Inserción directa desde el panel de administración del sistema |
| Asignaturas | Inserción directa desde el panel de administración del sistema |
| Profesores | Inserción directa o mediante importación masiva por archivo CSV |
| Comisiones | Inserción individual o importación masiva desde archivo CSV (funcionalidad C-03) |
| Usuarios Administradores | Alta desde el panel de autenticación de Supabase (`Authentication → Users`) |

> Los usuarios de tipo Administrador deben ser creados directamente en Supabase Auth y luego registrados en la tabla `usuario` con el rol `Administrador`. Los usuarios de tipo Alumno son gestionados por el sistema complementario (aplicación móvil o web del alumno), no por este módulo de administración.

---

### Paso 10 — Verificación final del sistema

Antes de dar el sistema por operativo, realizar las siguientes verificaciones:

- [ ] Las variables de entorno están configuradas correctamente en el servidor de producción.
- [ ] La compilación (`npm run build`) finalizó sin errores.
- [ ] El sistema es accesible desde el navegador mediante la URL de producción.
- [ ] El inicio de sesión con credenciales de Administrador funciona correctamente.
- [ ] Las tablas de la base de datos contienen los datos iniciales necesarios.
- [ ] El módulo de gestión de denuncias (C-01) permite visualizar, resolver y desestimar denuncias.
- [ ] El módulo de estructura académica (C-02 y C-03) permite crear comisiones y realizar importaciones CSV.
- [ ] Las políticas RLS de Supabase están activas y funcionando.

---

## Mantenimiento y actualización del sistema

Para actualizar el sistema con una nueva versión del código:

1. Obtener los cambios del repositorio: `git pull origin main`
2. Instalar nuevas dependencias (si las hubiera): `npm install`
3. Compilar nuevamente: `npm run build`
4. Reiniciar el servidor de producción: `npm run start`

Se recomienda utilizar un gestor de procesos como **PM2** para mantener el servidor activo ante reinicios del sistema operativo:

```bash
# Instalar PM2
npm install -g pm2

# Iniciar la aplicación con PM2
pm2 start npm --name "sic-unne" -- start

# Configurar inicio automático al reiniciar el servidor
pm2 startup
pm2 save
```

---

## Resolución de problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| Error de conexión con Supabase | Variables de entorno incorrectas o faltantes | Verificar el contenido de `.env.local` y reiniciar el servidor |
| Pantalla en blanco al abrir la app | Error en la compilación | Ejecutar `npm run build` y revisar la salida de errores |
| El inicio de sesión no funciona | Usuario no creado en Supabase Auth | Crear el usuario desde el panel de Supabase → Authentication → Users |
| Error 403 al acceder a datos | Políticas RLS no configuradas | Revisar las políticas de seguridad en Supabase → Authentication → Policies |
| Puerto 3000 en uso | Otro proceso ocupa el puerto | Cambiar el puerto con `PORT=3001 npm run start` o detener el proceso en conflicto |

---

## Referencias

- Documentación oficial de Next.js: [https://nextjs.org/docs](https://nextjs.org/docs)
- Documentación oficial de Supabase: [https://supabase.com/docs](https://supabase.com/docs)
- Guía de Row Level Security (RLS): [https://supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security)
- Certbot (certificados HTTPS): [https://certbot.eff.org](https://certbot.eff.org)
- PM2 (gestor de procesos Node.js): [https://pm2.keymetrics.io](https://pm2.keymetrics.io)
