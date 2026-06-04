**Universidad Nacional del Nordeste**

**Facultad de Ciencias Exactas y Naturales y Agrimensura**

**LICENCIATURA EN SISTEMAS DE INFORMACIÓN**

INGENIERÍA DEL SOFTWARE II

**Sistema de Intercambio de Comisiones (SIC-UNNE)**

Módulo de Administración, Denuncias y Resolución de Conflictos

**Integrantes:**

Scetti, Santiago — D.N.I.: 43.752.065

Turtola, Sabrina — D.N.I.: 44.000.850

**Profesor Coordinador:** M. de los Angeles Ferraro

**Informe Preliminar 2026**

**Año de defensa:** 2026

**Resumen**

En el presente apartado se sintetiza el desarrollo del **Módulo de Administración, Denuncias y Resolución de Conflictos** dentro del **Sistema de Intercambio de Comisiones (SIC-UNNE)**.

El **SIC-UNNE** surge para **digitalizar** y **optimizar** el intercambio de comisiones entre estudiantes de la Universidad Nacional del Nordeste, reemplazando métodos informales y poco eficientes. Este módulo específico está diseñado para proporcionar al personal administrativo y a los administradores del sistema **herramientas** de supervisión, gestión de usuarios y análisis de actividad.

Los **objetivos** principales del módulo son reducir la carga administrativa, mejorar la trazabilidad de los acuerdos entre alumnos y optimizar los recursos institucionales mediante un control centralizado. La metodología adoptada fue **Scrum**, permitiendo un desarrollo ágil e iterativo. El relevamiento de requisitos se realizó mediante entrevistas a personal administrativo y estudiantes, junto con la definición de escenarios de uso.

En cuanto a las **herramientas**, el sistema se proyectó como una **aplicación web** responsive bajo el estándar **IEEE 830**. Se utilizaron diagramas de casos de uso para el modelado y GitHub como repositorio para asegurar la integridad de los datos.

Los **resultados** obtenidos incluyen un panel funcional que permite la gestión de niveles de acceso diferenciados, la importación masiva de datos académicos y la generación de informes estadísticos sobre el uso del sistema. Esto garantiza que, aunque el sistema no modifique directamente los registros oficiales, funcione como una herramienta complementaria, segura y trazable para la toma de decisiones institucionales.

**Prólogo**

El crecimiento de la comunidad estudiantil en la **Facultad de Ciencias Exactas y Naturales y Agrimensura** ha traído consigo retos logísticos que los métodos tradicionales de comunicación no logran cubrir eficientemente. El presente trabajo no solo busca ofrecer una solución técnica al intercambio de comisiones, sino establecer un precedente en la gestión administrativa transparente y basada en datos. A través del **Módulo de Administración**, **Denuncias** y **Resolución de Conflictos**, transformamos el caos de los mensajes informales en un flujo de trabajo auditable y seguro, devolviendo el control a la institución y brindando previsibilidad a los docentes.

**Agradecimientos**

A la Universidad Nacional del Nordeste y a la Facultad de Ciencias Exactas y Naturales y de Agrimensura, por brindarnos el espacio y las herramientas para formarnos como profesionales.  
A nuestros profesores, Lic. Maria de los Angeles Ferraro, Lic. Alejandra Matoso, por sus guías expertas, sus correcciones precisas y por impulsarnos a aplicar metodologías ágiles en problemas reales.  
Al personal administrativo y a los estudiantes que participaron en las entrevistas, cuyas experiencias fueron la base para construir los requerimientos de este sistema.

# 

# 

# 

# 

# 

**Índice de contenidos**

[**Capítulo 1\. Introducción	1**](#heading=)

[**1.1. Estado del arte	1**](#heading=)

[**1.2. Objetivos	1**](#heading=)

[**1.3. Fundamentación	2**](#heading=)

[**Capítulo 2\. Metodología	3**](#heading=)

[**2.1. Ciclo de vida del proyecto	3**](#heading=)

[**2.2. Planificación realizada	4**](#heading=)

[**2.2.1. Tareas y recursos	4**](#heading=)

[2.3. Plan de riesgos	5](#2.3.-plan-de-riesgos)

[Tabla de Riesgos	6](#tabla-de-riesgos)

[**2.4. Diagrama de Entidad-Relación	8**](#heading=)

[2.5. Diccionario de datos	8](#2.5.-diccionario-de-datos)

[Nombre: Comision	8](#nombre:-comision)

[Nombre: Asignatura	9](#nombre:-asignatura)

[Nombre: Denuncia	10](#nombre:-denuncia)

[**2.7. Casos de uso	11**](#heading=)

[**2.8. Conversaciones de casos de uso	12**](#heading=)

[2.8.1. Conversación del caso de uso C-01	12](#2.8.1.-conversación-del-caso-de-uso-c-01)

[2.8.2. Conversación del caso de uso C-02	13](#2.8.2.-conversación-del-caso-de-uso-c-02)

[2.8.4. Conversación del caso de uso C-03	15](#2.8.4.-conversación-del-caso-de-uso-c-03)

[2.9. Diagramas de secuencia	17](#2.9.-diagramas-de-secuencia)

[**2.9.1. Gestionar Denuncias y Resolución de Conflictos	17**](#heading=)

[2.9.2 Gestionar Denuncias (Flujo Alternativo: Denuncia ya gestionado)	17](#2.9.2-gestionar-denuncias-\(flujo-alternativo:-denuncia-ya-gestionado\))

[**2.9.3  Crear Comisión	17**](#heading=)

[2.9.4 Crear Comisión (Flujo Alternativo: Datos inválidos en formulario)	18](#2.9.4-crear-comisión-\(flujo-alternativo:-datos-inválidos-en-formulario\))

[2.9.5. Importar datos masivamente	18](#2.9.5.-importar-datos-masivamente)

[2.9.5. Importar datos masivamente (Flujo Alternativo: Datos inválidos)	19](#2.9.5.-importar-datos-masivamente-\(flujo-alternativo:-datos-inválidos\))

[**2.10. Contratos de operaciones críticas	19**](#heading=)

[**2.10.1. Contrato 1: \[importarEstructuraAcademica\]	19**](#heading=)

[**2.10.2. Contrato 2: \[resolverDenuncia\]	22**](#heading=)

[2.11. Desarrollo de  la funcionalidad básica	25](#heading=h.b644fxfkc21x)

[2.11.1. Descripción de la funcionalidad	25](#heading=h.g4djlcp5zzqw)

[2.11.2. Fragmentos de código relevantes	25](#heading=h.li6kkjrofr3)

[2.11.3. Descripción del flujo implementado	26](#heading=h.arqc8vcqtow)

[**Capítulo 3\. Herramientas y lenguajes de programación	27**](#heading=)

[3.1 Arquitectura del Software	27](#3.1-arquitectura-del-software)

[3.1.1 Arquitectura Lógica: Patrón Cliente \- Servidor en Capas	27](#3.1.1-arquitectura-lógica:-patrón-cliente---servidor-en-capas)

[3.2 Patrones de Diseño aplicados en el Dominio	29](#3.2-patrones-de-diseño-aplicados-en-el-dominio)

[3.2.1 Patrón Estado (State)	29](#3.2.1-patrón-estado-\(state\))

[3.2.2 Patrón Estrategia (Strategy)	29](#3.2.2-patrón-estrategia-\(strategy\))

[3.2.3 Patrón Observador (Observer)	30](#3.2.3-patrón-observador-\(observer\))

[3.2.4 Patrón Repositorio	31](#3.2.4-patrón-repositorio)

[3.2.5 Patrón Singleton	31](#3.2.5-patrón-singleton)

[3.3 Gráfico de arquitecturas	31](#3.3-gráfico-de-arquitecturas)

[Arquitectura en capas	31](#arquitectura-en-capas)

[**3.4. Herramientas seleccionadas	32**](#heading=)

[**3.4.1. React	32**](#heading=)

[**3.4.2. Next.js (API Routes)	32**](#heading=)

[3.4.3 Supabase (PostgreSQL \+ Autenticación)	33](#3.4.3-supabase-\(postgresql-+-autenticación\))

[3.4.4. Vitest	33](#3.4.4.-vitest)

[**3.4.5. Otras herramientas	34**](#heading=)

[**Capítulo 4\. Resultados	36**](#heading=)

[4.1. Capturas de pantalla: Interfaz	36](#4.1.-capturas-de-pantalla:-interfaz)

[Panel de Gestión de Estructura Académica	36](#panel-de-gestión-de-estructura-académica)

[Modal Agregar Asignatura	36](#modal-agregar-asignatura)

[Modal Agregar Comisión	37](#modal-agregar-comisión)

[4.1.2. Códigos de Lógica	37](#4.1.2.-códigos-de-lógica)

[Algoritmo 1: Lógica de validación para la creación de comisiones.	37](#algoritmo-1:-lógica-de-validación-para-la-creación-de-comisiones.)

[**Capítulo 5\. Conclusiones y futuros trabajos	38**](#heading=)

[**5.1. Conclusiones	38**](#heading=)

[**5.2. Futuros trabajos	38**](#heading=)

[**Referencias	39**](#heading=)

[**Anexos	40**](#heading=)

[Anexo A — Tablero Trello (Sprint planning)	40](#anexo-a-—-tablero-trello-\(sprint-planning\))

**Índice de figuras**

[Figura 1	8](#figura-1)

[Figura 2	11](#figura-2)

[Figura 3	17](#figura-3)

[Figura 4	17](#figura-4)

[Figura 5	17](#figura-5)

[Figura 6	18](#figura-6)

[Figura 7	18](#figura-7)

[Figura 8	19](#figura-8)

[Figura 9	31](#figura-17)

[Figura 11	36](#figura-11)

[Figura 12	36](#figura-12)

[Figura 13	37](#figura-13)

[Figura 14	37](#figura-14)

**Índice de tablas**

[Tabla 1	8](#tabla-1)

[Tabla 2	9](#tabla-2)

[Tabla 3	9](#tabla-3)

[Tabla 4	10](#tabla-4)

[Tabla 5	13](#tabla-5)

[Tabla 6	14](#tabla-6)

[Tabla 7	16](#tabla-7)

[Tabla 8	22](#tabla-8)

[Tabla 9	25](#tabla-9)

# **Capítulo 1\. Introducción**

## **1.1. Estado del arte**

En el ámbito de las universidades nacionales, la **asignación** de comisiones suele realizarse de manera automática o por orden de inscripción, procesos que frecuentemente ignoran las realidades laborales o personales de los alumnos. Ante la rigidez de estos sistemas, la gestión de cambios ha derivado en dos vertientes claramente diferenciadas: **Gestión Informal y Descentralizada**.

El proceso actual de intercambio de comisiones depende de métodos informales y gestiones manuales que resultan ineficientes para la comunidad universitaria. Mientras los estudiantes enfrentan riesgos de privacidad y una alta tasa de intercambios fallidos al utilizar redes sociales sin validación institucional , el personal administrativo de unidades como FaCENA procesa manualmente entre 200 y 250 solicitudes por cuatrimestre. Esta metodología genera una excesiva carga de trabajo, formularios incompletos y una crítica falta de trazabilidad y herramientas de análisis para optimizar la oferta académica futura.

Si bien han comenzado a explorarse algoritmos de emparejamiento inspirados en plataformas de "matching" para facilitar el encuentro entre estudiantes, la mayoría de estas propuestas se **centran** exclusivamente en la experiencia del usuario final (el alumno). El SIC-UNNE se diferencia al proponer un **Panel de Administración y Gestión** que actúa como puente entre la autogestión estudiantil y el control institucional.

Este módulo busca **transformar** la resolución de conflictos de un proceso burocrático manual a uno **digitalizado** donde el administrador supervisa coincidencias pre-validadas por un algoritmo, garantizando la seguridad de los datos y la equidad en los intercambios.

## **1.2. Objetivos**

El objetivo principal de este trabajo es desarrollar e implementar el **Módulo de Administración, Denuncias y Resolución de Conflictos del Sistema de Intercambio de Comisiones (SIC-UNNE)**.

Los **objetivos** específicos son:

* **Desarrollar** el panel de control administrativo para la gestión académica y de usuarios e intercambios.

* **Implementar** el flujo completo de gestión de denuncias, desde la recepción hasta la resolución.

* **Desarrollar** una herramienta de *creación/edición* e *importación masiva* de datos para estructurar la oferta académica oficial (facultades, carreras, materias y comisiones) de forma centralizada y libre de duplicados.

* **Proveer** estadísticas e informes de uso del sistema para la toma de decisiones.

* **Garantizar** la seguridad y trazabilidad de todas las acciones administrativas.

## 

## **1.3. Fundamentación**

La **implementación** de este módulo es el pilar que transforma una herramienta de interacción entre pares en una plataforma institucional robusta y confiable. Mientras que el algoritmo de matching resuelve la necesidad inmediata del alumno, la administración y supervisión garantizan que dicha solución sea sostenible y segura para la UNNE.

A diferencia de los métodos informales actuales como WhatsApp o Facebook, que carecen de organización y privacidad, el SIC-UNNE requiere un entorno moderado. La moderación permite: 

* **Validar** **la integridad del sistema:** Asegurar que los datos académicos y las comisiones cargadas sean veraces.  
* **Prevenir el mal uso:** Detectar comportamientos que puedan comprometer la equidad de los intercambios o la seguridad de los usuarios.

La auditoría es una exigencia operativa y legal. El sistema debe mantener un registro de todas las acciones críticas realizadas, asegurando el cumplimiento de la **Ley de Protección de Datos Personales**. Esta trazabilidad permite a los administradores educativos monitorear los movimientos, reduciendo la incertidumbre y la carga administrativa manual que actualmente enfrentan.

La **confianza** es el motor de adopción del sistema. Al ofrecer un módulo que genere comprobantes oficiales y ofrezca una vía de resolución de conflictos, el estudiante percibe que el intercambio no depende de la "suerte", sino de un proceso **estructurado** y **respaldado**. Esto mitiga los riesgos de pérdida de datos sensibles y garantiza una experiencia académica más equitativa y menos estresante.

# **Capítulo 2\. Metodología**

## **2.1. Ciclo de vida del proyecto**

Para el desarrollo de este módulo se adoptó la metodología ágil Scrum, dado que permite un enfoque iterativo e incremental que facilita la adaptación a cambios de requerimientos y la entrega continua de valor. Esta elección es consistente con la metodología utilizada en la fase de análisis realizada en Ingeniería del Software I.

**Definición de Roles:** 

**Santiago Scetti:**

* **Scrum Master:** Mantiene el rol original de facilitar la metodología y eliminar impedimentos.  
* **Product Owner:** Asume la responsabilidad de definir las prioridades del módulo y asegurar que cumpla con las necesidades administrativas relevadas.  
* **Backend Developer (Especialista en Supabase):** Encargado de la arquitectura de datos, la configuración de la base de datos, la autenticación y las políticas de seguridad (RLS) en Supabase.

**Sabrina Turtola:**

* **UI/UX Designer:** Mantiene su rol de diseñadora de interfaces, asegurando que el panel administrativo sea intuitivo.  
* **Frontend Developer (Especialista en React):** Encargada de transformar los diseños en componentes funcionales, consumir la API de Supabase y gestionar el estado de la aplicación en el cliente.  
* **QA / Tester:** Responsable de validar que las funcionalidades de administración y denuncias operen sin errores antes de cada entrega.

**Eventos Scrum:** 

* **Sprint Planning**: Al inicio de cada uno de los 4 sprints definidos, nos reunimos para seleccionar las historias de usuario del *Backlog* que Santiago (Product Owner) priorizó, definiendo el objetivo del sprint.  
* **Sprints**: Se establecieron iteraciones de 2 semanas de duración para asegurar entregas continuas de valor en el panel administrativo.  
* **Daily Scrum**: Reuniones breves de sincronización para identificar bloqueos técnicos, especialmente en la integración de políticas de seguridad (RLS) en Supabase.  
* **Sprint Review & Retrospective**: Al finalizar cada sprint, validamos las funcionalidades (como el CRUD de estudiantes o los gráficos de denuncias) y ajustamos nuestros procesos de trabajo colaborativo.

## **2.2. Planificación realizada**

### **2.2.1. Tareas y recursos**

* **Recursos Humanos**: Santiago Scetti (Backend/Arquitectura) y Sabrina Turtola (Frontend/Diseño UI-UX/QA).  
* **Recursos Tecnológicos**: Computadoras personales con VS Code, acceso a la plataforma Supabase Cloud y el repositorio en GitHub.

A continuación se detallan las tareas de cada Sprint para cada integrante del equipo:

**Sprint 1: Infraestructura y Seguridad**  
Su objetivo principal es establecer la base técnica y el control de acceso para que solo los administradores gestionen la información sensible.  
**Tiempo estimado:** 2 días.  
**Tareas Backend:**

* Configuración inicial del proyecto en Supabase.  
* Diseño del esquema de la base de datos PostgreSQL.  
* Definición de políticas de **Row Level Security (RLS)** para restringir el acceso a datos académicos.

**Tareas Frontend:**

* Implementación del flujo de autenticación en React (Login de Administrador).  
* Creación de la estructura base de navegación del panel administrativo.

**Sprint 2: Gestión académica y de usuarios**  
Este sprint se enfoca en la capacidad de alimentar el sistema con información real de la FaCENA.  
**Tiempo estimado:** 5 días.  
**Tareas Backend:**

* Creación de funciones para la importación masiva de datos académicos.  
* Desarrollo de la lógica de servidor para el CRUD (Crear, Leer, Actualizar, Borrar) de estudiantes y datos académicos.  
* Desarrollo de endpoints en Supabase (RPC Functions) para procesar e insertar lotes de datos relacionales asegurando la integridad referencial.

**Tareas Frontend:**

* Diseño y desarrollo de formularios de gestión de usuarios y tablas interactivas en React para visualizar la oferta académica cargada.  
* Implementación de un procesador de archivos `.csv` en el cliente (React) para pre-validar la estructura de los datos antes de enviarlos a la base de datos, optimizando el rendimiento de la red.

**Sprint 3: Dashboard de denuncias y Visualización de datos**  
El foco aquí es transformar los datos en información útil para la toma de decisiones institucionales.  
**Tiempo estimado:** 5  días.  
**Tareas Backend:**

* Optimización de consultas SQL en Supabase para obtener estadísticas en tiempo real sobre el uso del sistema y los intercambios realizados.

**Tareas Frontend:**

* Desarrollo de **Dashboards** visuales utilizando librerías de gráficos (como [Chart.js](http://Chart.js))  
* Integración de una funcionalidad para exportar estos informes en formato PDF.

**Sprint 4: Resolución de conflictos y Aseguramiento de calidad (QA)**  
El sprint final aborda la lógica más compleja: intervenir cuando el proceso automático falla.  
**Tiempo estimado:** 5 días.  
**Tareas Backend:**

* Implementar la lógica de negocio para gestionar denuncias y permitir la intervención manual en "matches" fallidos o conflictivos.

**Tareas Frontend:**

* Refinamiento de la interfaz de usuario (UI) para la gestión de denuncias.  
* Ejecución del plan de pruebas (QA/Testing) para asegurar que no existan errores críticos antes del despliegue.

## **2.3. Plan de riesgos** {#2.3.-plan-de-riesgos}

Para efectuar la identificación de los riesgos críticos del sistema SIC-UNNE, se han tomado como base los siguientes estándares de calidad y restricciones técnicas definidos en los Requerimientos No Funcionales (RNF):

**Usabilidad y Accesibilidad**

- **RNF-01:** Interfaz clara, intuitiva y responsive.  
- **RNF-02:** Uso fluido con conexión mínima de 5 Mbps.  
- **RNF-03:** Cumplimiento de estándares de accesibilidad (WCAG).

**Rendimiento y Escalabilidad**

- **RNF-04:** Capacidad para 5000 usuarios concurrentes.  
- **RNF-05:** Operaciones críticas en menos de 2 segundos.  
- **RNF-09:** Escalabilidad para múltiples universidades y facultades.

**Fiabilidad y Disponibilidad**

- **RNF-06:** Respaldos automáticos diarios de la base de datos.  
- **RNF-07:** Disponibilidad 24/7 (especialmente en periodos de alta demanda).  
- **RNF-08:** Plan de contingencia para picos de acceso.

**Mantenibilidad**

- **RNF-10:** Documentación técnica completa para mantenimiento.  
- **RNF-11:** Actualizaciones modulares sin afectación funcional.

### **Tabla de Riesgos** {#tabla-de-riesgos}

| Riesgo | Tipo | Probabilidad | Impacto | Mitigación |
| ----- | ----- | :---: | :---: | ----- |
| **Cuello de botella por equipo reducido** | Proyecto | Alta | Crítico | Documentación técnica exhaustiva y revisiones de código cruzadas semanales. |
| **Saturación por picos de demanda (5k concurrentes)** | Producto | Alta | Crítico | Implementar Auto-scaling en la nube y realizar pruebas de estrés previas. |
| **Pérdida de integridad en importación masiva** | Producto | Alta | Crítico | Implementar validaciones de esquema con Zod antes de impactar la base de datos. |
| **Configuración incorrecta de RLS en Supabase** | Producto | Media | Crítico | Auditoría estricta de políticas de seguridad y pruebas de "acceso denegado" por rol. |
| **Pérdida de datos por fallo en respaldos** | Producto | Baja | Crítico | Automatizar backups diarios externos a Supabase y probar restauraciones cada mes. |
| **Abandono o incapacidad de un integrante** | Proyecto | Baja | Crítico | Repositorio en GitHub siempre al día y centralización de credenciales en un gestor compartido. |
| **Inconsistencia en resolución manual de conflictos** | Producto | Media | Alto | Definir reglas de negocio claras en la UI y dejar logs de auditoría de cada acción. |
| **Dificultad de escalabilidad (Multi-universidad)** | Producto | Media | Alto | Arquitectura multi-tenant y abstracción de la lógica de facultad en el modelo de datos. |
| **Inestabilidad por actualizaciones modulares** | Proyecto | Media | Medio | Implementar un pipeline de CI/CD con pruebas unitarias automáticas antes de deploy. |
| **Curva de aprendizaje Supabase (PostgreSQL)** | Proyecto | Media | Medio | Capacitación intensiva en funciones asíncronas y lógica de servidor en PostgreSQL. |

###### Tabla 1 {#tabla-1}

## **2.4. Diagrama de Entidad-Relación**

##  ![][image1]

##### Figura 1 {#figura-1}

## **2.5. Diccionario de datos** {#2.5.-diccionario-de-datos}

#### **Nombre: Comision** {#nombre:-comision}

**Descripción:** Representa una comisión académica asociada a una asignatura, definiendo el rango de apellidos que abarca.

| Campo | Tipo | Long | Significado |
| ----- | ----- | ----- | ----- |
| id\_comision | integer | — | Identificador único de la comisión |
| nombre | character varying | — | Nombre descriptivo de la comisión |
| letra\_desde | character | 1 | Letra inicial del rango de apellidos que cubre |
| letra\_hasta | character | 1 | Letra final del rango de apellidos que cubre |
| id\_asignatura | integer | — | Asignatura a la que pertenece la comisión |

###### Tabla 2 {#tabla-2}

**Restricciones**

| Campo | Tipo de restricción |
| ----- | ----- |
| id\_comision | Primary key |

**Claves foráneas**

| Campo | Entidad asociada |
| ----- | ----- |
| id\_asignatura | asignatura |

#### **Nombre: Asignatura** {#nombre:-asignatura}

**Descripción:** Registra las materias disponibles en el sistema, vinculadas a una carrera y a un período académico.

| Campo | Tipo | Long | Significado |
| ----- | ----- | ----- | ----- |
| id\_asignatura | integer | — | Identificador único de la asignatura |
| nombre | character varying | — | Nombre de la materia |
| anio\_dictado | character varying | — | Año en que se dicta la asignatura |
| id\_periodo | integer | — | Período académico al que corresponde |
| id\_carrera | integer | — | Carrera a la que pertenece la asignatura |

###### Tabla 3 {#tabla-3}

**Restricciones**

| Campo | Tipo de restricción |
| ----- | ----- |
| id\_asignatura | Primary key |

**Claves foráneas**

| Campo | Entidad asociada |
| ----- | ----- |
| id\_periodo | periodo |
| id\_carrera | carrera |

#### **Nombre: Denuncia** {#nombre:-denuncia}

**Descripción:** Registra los denuncias generados por usuarios hacia otros usuarios dentro del sistema, incluyendo el estado de resolución y la intervención administrativa.

| Campo | Tipo | Long | Significado |
| ----- | ----- | ----- | ----- |
| id\_reporte | integer | — | Identificador único del denuncia |
| emisor\_id | integer | — | Usuario que genera el denuncia |
| receptor\_id | integer | — | Usuario que es reportado |
| id\_periodo | integer | — | Período académico en que ocurre el denuncia |
| motivo | character varying | — | Descripción del motivo del denuncia |
| estado | character varying | — | Estado actual: Pendiente, En Revisión, Resuelto o Desestimado |
| fecha\_alta | timestamp | — | Fecha y hora en que se generó el denuncia |
| resolucion\_admin | text | — | Descripción textual de la resolución tomada por el administrador |
| accion\_tomada | character varying | — | Acción aplicada: Advertencia, Suspensión o Desestimado |
| admin\_id | integer | — | Administrador que gestionó el denuncia |

###### Tabla 4 {#tabla-4}

**Restricciones**

| Campo | Tipo de restricción |
| ----- | ----- |
| id\_reporte | Primary key |

**Claves foráneas**

| Campo | Entidad asociada |
| ----- | ----- |
| emisor\_id | usuario |
| receptor\_id | usuario |
| admin\_id | usuario |
| id\_periodo | periodo |

## 

## **2.7. Casos de uso**

### **![][image2]**

##### Figura 2 {#figura-2}

## 

## 

## 

## 

## **2.8. Conversaciones de casos de uso**

### **2.8.1. Conversación del caso de uso C-01** {#2.8.1.-conversación-del-caso-de-uso-c-01}

| Acción | Curso Normal | Curso Alternativo |
| :---- | :---- | :---- |
| **1\. A:** Accede al panel de denuncias |  |  |
| **2\. S:** Muestra lista de denuncias y opciones de filtrado | **2.1** Lista desplegada |  |
| **3\. A:** Selecciona el filtro "Pendiente" | **3.1** Filtro aplicado | **3.1.1 S:** Detecta que el denuncia ya no está pendiente. **3.1.2 S:** Muestra mensaje "Denuncia ya gestionado". **3.1.3** Fin del caso de uso. |
| **4\. A:** Selecciona un denuncia específico |  |  |
| **5\. S:** Muestra el detalle completo del denuncia | **5.1** Datos visibles |  |
| **6\. A:** Analiza la información y decide resolver |  |  |
| **7\. S:** Solicita la acción a realizar | **7.1** Opciones mostradas |  |
| **8\. A:** Selecciona acción y registra resolución | **8.1** Resolución registrada | **8.1.1 A:** Selecciona "Desestimar". Ir a 9\. **8.1.2 A:** Selecciona "Suspender". **S:** solicita duración.  **A:** Ingresa tiempo. Ir a 9\. **8.1.3 A:** Selecciona “Advertir Usuario”. Ir a 9\. **8.1.4** Error de sistema/BD.  **S:** muestra mensaje de error. No hay cambios. Fin del caso de uso. |
| **9\. S:** Actualiza estado, guarda auditoría y notifica. | **9.1** Procesamiento exitoso |  |
| **10\. S:** Muestra mensaje "Denuncia actualizado" |  |   |

###### Tabla 5 {#tabla-5}

### **2.8.2. Conversación del caso de uso C-02** {#2.8.2.-conversación-del-caso-de-uso-c-02}

| Acción | Curso Normal | Curso Alternativo |
| ----- | ----- | ----- |
| **1\. A:** Accede al módulo de estructura académica. | **1.1 S:** Muestra listado de entidades y tarjetas (Periodos, Edificios, Facultades, Carreras, Asignaturas, Profesores, Comisiones). |  |
| **2\. A:** Presiona el botón ‘+’ en la tarjeta “Comisiones”. | **2.1 S:** Muestra el formulario correspondiente para la creación. |  |
| **3\. A:** Ingresa o selecciona los datos requeridos (Asignatura, Profesor, Nombre, Letras). | **3.1** Datos existentes para seleccionar y correcto ingreso de datos. | **3.1.1 A:** No encuentra datos existentes ("Asignatura" o "Profesor"). **3.1.2 A:** Presiona botón “Cancelar”. **3.1.3 S:** Pregunta “¿Desea cancelar la operación?”. **3.1.4 A:** Presiona “Aceptar”. **3.1.5 S:** Cancela y no modifica datos. **3.1.6** Vuelve al paso 1\. |
| **4\. A:** Confirma la operación de guardado. | **4.1 S:** Valida campos obligatorios y formatos de los datos. |  |
| **5\. S:** Intenta guardar la información en la base de datos. | **5.1** Persistencia exitosa. | **5.1.1 S:** Muestra avisos de validación en los campos afectados. **5.1.2 A:** Corrige los datos correctamente. **5.1.3** Vuelve al paso 4\. **5.1.1 S:** Ocurre un error de conexión o base de datos. **5.1.2 S:** Muestra mensaje: “Error en crear comisión”. **5.1.3** Vuelve al paso 1\. |
| **6\. S:** Confirma la operación y muestra mensaje: “Comisión creada con éxito”. | **6.1** Fin del caso de uso. |  |

###### Tabla 6 {#tabla-6}

### 

### 

### **2.8.4. Conversación del caso de uso C-03** {#2.8.4.-conversación-del-caso-de-uso-c-03}

| Acción | Curso Normal | Curso Alternativo |
| ----- | ----- | ----- |
| **1\. A:** Accede al módulo de estructura académica. | **1.1 S:** Muestra listado de entidades, tarjetas y botones funcionales. |  |
| **2\. A:** Presiona el botón ‘Importar CSV’. | **2.1 S:** Indica al ordenador que abra el explorador de archivos. **2.2** Explorador de archivos abierto. |  |
| **3\. A:** Selecciona archivo y presiona ‘Aceptar’. | **3.1** Formato del archivo correcto. | **3.1.1** Formato del archivo incorrecto. **3.1.2 S:** Muestra mensaje de error ‘El archivo seleccionado es inválido”. **3.1.3 A:** Presiona el botón ‘Seleccionar otro archivo’. **3.1.4** Vuelve al paso 2\. |
| **4\. S:** Analiza el contenido del archivo, valida el formato de los datos, busca datos duplicados o incompletos. | **4.1** Contenido del archivo en condiciones.  | **4.1.1** Encuentra datos inválidos. **4.1.2 S:** Muestra mensaje de error ‘Revise los datos de la entidad ‘Periodo’, se encontraron datos que no cumplen con ‘...’’. **4.1.3 S:** Cancela la operación. Vuelve al paso 1\. **4.1.1** Encuentra datos duplicados. **4.1.2 S:** Muestra mensaje de error ‘Revise los datos de la entidad ‘Periodo’, se encontraron datos duplicados’. **4.1.3 S:** Cancela la operación. Vuelve al paso 1\. **4.1.1** Encuentra datos incompletos. **4.1.2 S:** Muestra mensaje de error ‘Revise los datos de la entidad ‘Periodo’, se encontraron datos incompletos’. **4.1.3 S:** Cancela la operación. Vuelve al paso 1\. |
| **5\. S:** Intenta guardar la información en la base de datos. | **5.1** Persistencia exitosa. | **5.1.1 S:** Ocurre un error de conexión o base de datos. **5.1.2 S:** Muestra mensaje: “Error en la importación del archivo”. Vuelve al paso 1\. |
| **6\. S:** Confirma la operación y muestra mensaje: “Importación de datos con éxito”. | **6.1** Fin del caso de uso. |  |

###### Tabla 7 {#tabla-7}

## 

## 

## 

## 

## 

## **2.9. Diagramas de secuencia** {#2.9.-diagramas-de-secuencia}

### **2.9.1. Gestionar Denuncias y Resolución de Conflictos**

### **![][image3]**

##### Figura 3 {#figura-3}

### **2.9.2 Gestionar Denuncias (Flujo Alternativo: Denuncia ya gestionado)**  {#2.9.2-gestionar-denuncias-(flujo-alternativo:-denuncia-ya-gestionado)}

### **![][image4]**

##### Figura 4 {#figura-4}

### **2.9.3  Crear Comisión** 

![][image5]

##### Figura 5 {#figura-5}

### 

### 

### **2.9.4 Crear Comisión (Flujo Alternativo: Datos inválidos en formulario)**  {#2.9.4-crear-comisión-(flujo-alternativo:-datos-inválidos-en-formulario)}

![][image6]

##### Figura 6 {#figura-6}

### **2.9.5. Importar datos masivamente**  {#2.9.5.-importar-datos-masivamente}

![][image7]

##### Figura 7 {#figura-7}

### 

### **2.9.5. Importar datos masivamente (Flujo Alternativo: Datos inválidos)**  {#2.9.5.-importar-datos-masivamente-(flujo-alternativo:-datos-inválidos)}

![][image8]

##### Figura 8 {#figura-8}

## 

## **2.10. Contratos de operaciones críticas**

Debido a los requerimientos de rendimiento (RNF-05) y fiabilidad (RNF-06), se definen los contratos para las operaciones que manipulan volúmenes masivos de datos o afectan la integridad del sistema.

### 

### **2.10.1. Contrato 1: \[`importarEstructuraAcademica`\]**

Esta operación es vital para la carga inicial de datos y debe garantizar que no existan registros huérfanos.

| Campo | Descripción |
| :---- | :---- |
| **Operación** | **importarEstructuraAcademica(archivo: File): void** |
| **Referencia Cruzada** | C.U. Importar Datos Masivamente (C-03). Orquestado desde EstructuraPage.jsx → handleFileUpload(). |
| **Responsabilidades** | **Validar el archivo CSV en el cliente** (6 pasos secuenciales), parsear su contenido e **insertar masivamente los registros** respetando el **orden de dependencias entre entidades**: Edificio → Facultad → Carrera → Periodo → Asignatura → Profesor → Comisión. Las primeras seis entidades se insertan mediante sus servicios de cliente (src/services/academico/\*.service.js) usando el SDK de Supabase con clave de servicio. La **inserción de Comisiones se delega a la API Route POST /api/comisiones** (capa de controladores), que **ejecuta la validación de dominio y la persistencia en el servidor**. |
| **Excepciones** | Si el archivo no tiene **extensión .csv**, el sistema muestra "**El archivo seleccionado es inválido**" y **cancela la operación**. Si el CSV no contiene las **columnas requeridas (esquema obligatorio)**, el sistema muestra el **primer error de esquema y cancela**. Si se detectan filas con la misma combinación comision\_nombre \+ asignatura\_nombre, el sistema muestra "**duplicados**" e indica las filas afectadas. Si algún campo requerido está vacío, el sistema muestra "**se encontraron datos incompletos**". Si las **fechas no tienen formato YYYY-MM-DD**, o **fecha\_fin es anterior a fecha\_inicio**, el sistema indica el error de formato. Si **profesor\_documento no es un entero positivo**, o las **letras de comisión no son exactamente 1 carácter alfabético**, el sistema indica el error de formato. Si la **inserción de cualquiera de las primeras seis entidades falla** (error de red, **violación de FK**, entidad referenciada no encontrada), el sistema lanza un error con el mensaje "Error al importar \[entidad\]: \[detalle\]" y **cancela las inserciones restantes**. Si **POST /api/comisiones devuelve un error HTTP** (status ≠ 2xx ni 207), el sistema muestra "**Error en la importación de datos y cancela**". Si la API devuelve **status 207 (importación parcial)**, algunas filas se habrán insertado y se registran los errores por fila en la consola; la **operación continúa con las filas exitosas**. |
| **Precondiciones** | El administrador se encuentra **autenticado en su sesión**. El sistema está **conectado a la base de datos a través de Supabase**. Existe al menos una **fila de datos válida en el archivo CSV**. Las entidades referenciadas por clave foránea se crean en **orden dentro de la misma operación** (Edificio antes de Facultad, Facultad antes de Carrera, etc.). |
| **Postcondiciones** | **Se crearon o actualizaron instancias en la tabla edificio** (upsert por nombre)**.** **Se crearon o actualizaron instancias en la tabla facultad** (upsert por nombre, con id\_edificio resuelto por nombre de edificio)**.** **Se crearon o actualizaron instancias en la tabla carrera** (upsert por nombre, con id\_facultad resuelto)**.** **Se crearon o actualizaron instancias en la tabla periodo** (upsert por nombre)**.** **Se crearon o actualizaron instancias en la tabla asignatura** (upsert por nombre, con id\_carrera e id\_periodo resueltos)**.** **Se crearon o actualizaron instancias en la tabla profesor** (upsert por documento)**.** **Se crearon instancias en la tabla comision procesadas por la API Route /api/comisiones**; las filas con comision\_nombre \+ asignatura\_nombre ya existentes son omitidas o actualizadas según la política de upsert del servidor. **Se crearon instancias en la tabla comision\_profesor vinculando cada comisión con su profesor** (upsert idempotente, gestionado por el servidor). El atributo **estado** de todos los registros insertados fue establecido en **true**. **Las listas de la interfaz** (periodosList, edificiosList, facultadesList, carrerasList, asignaturasList, profesoresList, comisionesList) **fueron refrescadas con los datos actualizados mediante llamadas paralelas** (Promise.all)**.** El sistema mostró el mensaje **"Archivo importado con éxito"** en pantalla durante 5 segundos. |

###### Tabla 8 {#tabla-8}

### **2.10.2. Contrato 2: \[resolverDenuncia\]**

Esta operación gestiona la moderación y convivencia dentro del sistema, asegurando la trazabilidad de las acciones administrativas.

| Campo | Descripción |
| :---- | :---- |
| **Operación** | **resolverDenuncia(id\_reporte: int, accion: varchar, fechaHasta?: date, observaciones?: text, admin\_id?: int): void** |
| **Referencias Cruzadas** | C.U. Gestionar Denuncias y Resolución de Conflictos (C-01). Ruta: PATCH /api/denuncias/\[id\] con body { estado: 'Resuelto', accion, fechaHasta?, observaciones?, admin\_id? }. Servicio de dominio: src/domain/denuncia/ServicioResolucionDenuncia.ts. |
| **Responsabilidades** | **Validar** que el denuncia esté en estado **'Pendiente'** (**patrón Estado**), **ejecutar** el efecto concreto de la **acción administrativa** sobre el usuario reportado (**patrón Estrategia**) y **publicar un evento de dominio** para que los **observadores** registren la **auditoría** y envíen las **notificaciones** correspondientes (**patrón Observador**). |
| **Excepciones** | Si id\_reporte no es un número válido, el controlador retorna **HTTP 400** con "**ID de denuncia inválido**". Si el denuncia con id\_reporte no existe en la tabla denuncia, el dominio lanza **DenunciaNoEncontradaError** y el controlador retorna **HTTP 404**. Si el denuncia ya tiene estado 'Resuelto' o 'Desestimado', el dominio lanza **DenunciaYaProcesadaError** y el controlador retorna **HTTP 409** con "**El denuncia ya ha sido procesado por otro administrador**.", incluyendo el estado actual. Si el campo accion no se incluye en el body, el controlador retorna HTTP 400 con "**Para resolver el denuncia se requiere 'accion'.**" y **cancela la operación**. Si accion \= '**Suspender Temporalmente**' pero fechaHasta no es una fecha posterior a hoy, la **estrategia rechaza la ejecución**. Si admin\_id es nulo o no se envía, el servicio consulta automáticamente el **primer administrador disponible** en usuario. Si no existe ninguno, lanza una excepción y cancela. Si falla la **persistencia en la base de datos** (error de red, violación de restricción), la excepción se propaga al controlador que retorna **HTTP 500**. |
| **Precondiciones** | El administrador se encuentra **autenticado en su sesión**. El sistema está **conectado a la base de datos** a través de la capa de infraestructura (**repositorios con cliente service\_role**). El denuncia con id\_reporte **existe** en la tabla denuncia y tiene **estado 'Pendiente'**. Los usuarios con emisor\_id y receptor\_id **existen** en la tabla usuario. El campo accion contiene uno de los **valores válidos** según la restricción CHECK de la BD: '**Enviar aviso**', '**Suspender Temporalmente**' o '**Suspender Indefinidamente**'. Si accion \= 'Suspender Temporalmente': el campo **fechaHasta debe ser una fecha posterior a la fecha actual**. |
| **Postcondiciones** | El atributo **estado** de la instancia **Denuncia** con id\_reporte fue modificado a **'Resuelto'**. El atributo **accion\_tomada** del denuncia fue **actualizado** con el valor de accion. El atributo **admin\_id** del denuncia fue **asociado al administrador** que ejecutó la acción. Si accion \= **'Suspender Temporalmente'**: el campo **suspendido\_hasta** del usuario receptor fue actualizado con la fecha indicada en **fechaHasta**. Si accion \= **'Suspender Indefinidamente'**: el usuario receptor queda **suspendido sin fecha de fin**. Se crearon instancias en la tabla **notificacion** para el receptor y, si el emisor no es el Sistema, también para el emisor, con el **tipo y mensaje** correspondientes a la acción aplicada. Se creó una instancia en **auditoria\_administrativa** con id\_admin, la **acción tomada** y los **detalles de la resolución**. El controlador retorna **HTTP 200** con { id\_reporte, estado: 'Resuelto', accion\_tomada }. El sistema mostró el mensaje **"Acción aplicada con éxito"** en pantalla. |

###### Tabla 9 {#tabla-9}

## 

## **2.11. Desarrollo de las Funcionalidades Básicas**

### **2.11.1. C-01: Gestionar Denuncia y Resolución de Conflictos**

**Descripción de la funcionalidad**

La funcionalidad **C-01** permite al **administrador** revisar los **denuncias** entre alumnos, seleccionar una **acción disciplinaria** (enviar aviso, suspender temporalmente o suspender indefinidamente) y **resolver** o **desestimar** el caso en una **única operación**. El sistema garantiza que un denuncia no pueda ser **procesado dos veces** de forma concurrente, devolviendo un **error 409** si otro administrador ya lo gestionó.

Esta funcionalidad es la de **mayor complejidad** del sistema: concentra los **tres patrones de diseño** del proyecto (**Estado, Estrategia y Observador**) en un **único punto de coordinación**.

**Fragmentos de código relevantes**

**Entidad de dominio Denuncia — Patrón Estado**

La clase Denuncia delega cada transición en su objeto de estado actual. Esto impide que un denuncia ya resuelto vuelva a ser procesado sin necesidad de condicionales en el servicio.

![][image9]![][image10]

##### Figura 9

**ServicioResolucionDenuncia — Orquestación de los 3 patrones**

**![][image11]**

##### Figura 10

**Selector de estrategia — Patrón Estrategia**

**![][image12]**

##### Figura 11

**Controlador API — /api/denuncias/\[id\]**

**![][image13]**

##### Figura 12

**Descripción del flujo implementado**

El flujo sigue la arquitectura de 3 capas definida en el proyecto:

* **Presentación:** El administrador selecciona un denuncia desde DenunciasPage, elige una acción y confirma. La capa de presentación invoca resolverDenuncia() del servicio HTTP cliente.  
* **Aplicación (cliente):** denuncia.service.js realiza un único PATCH /api/denuncias/:id enviando el estado, la acción y los parámetros opcionales (fecha de suspensión, observaciones).  
* **Controlador:** La API Route \[id\].js recibe la petición, instancia ServicioResolucionDenuncia y delega la orquestación al dominio.  
* **Dominio:** El servicio carga el Denuncia desde el repositorio, aplica la transición de estado (Patrón Estado), ejecuta la acción disciplinaria correspondiente (Patrón Estrategia) y publica un evento (Patrón Observador) que activa dos listeners: uno que crea las notificaciones y otro que registra la auditoría administrativa.  
* **Infraestructura:** Los repositorios (DenunciaRepositorio, UsuarioRepositorio, NotificacionRepositorio, AuditoriaRepositorio) traducen las operaciones de dominio en consultas SQL sobre Supabase/PostgreSQL.  
* **Respuesta:** El controlador devuelve 200 con el nuevo estado, o 409 si el denuncia ya fue procesado por otro administrador.

### 

### **2.11.2. C-02: Crear Comisión**

**Descripción de la funcionalidad**

La funcionalidad **C-02** permite al **administrador** **crear** una nueva **comisión académica**, asociándola a una **asignatura existente** y vinculando uno o más **profesores** a cargo. La operación incluye una **validación doble**: primero en el **cliente** (formulario modal) y luego en el **servidor** (verificación de existencia de la asignatura y consistencia de los datos). Sin **comisiones activas**, los **alumnos** no pueden **inscribirse** ni **solicitar intercambios**.

**Fragmentos de código relevantes**

**Servicio cliente — comision.service.js**

# **![][image14]**

##### Figura 13

**Repositorio — ComisionRepositorio.ts**

**![][image15]**

##### Figura 14

**Descripción del flujo implementado**

* **Presentación:** El administrador accede a la pantalla de Estructura Académica (EstructuraPage), selecciona la entidad "Comisiones" y abre el modal addComisionModal. Completa el nombre, rango de letras (Desde–Hasta), asignatura y profesores.  
* **Validación en cliente:** Al confirmar, validarCampos() verifica que todos los campos obligatorios estén completos y que letraDesde \< letraHasta. Si falla, se muestran mensajes de error inline sin llamar al backend.  
* **Aplicación (cliente):** Si la validación pasa, comision.service.js invoca crear(), que realiza un POST /api/comisiones con los datos del formulario.  
* **Controlador:** La API Route valida los campos requeridos del lado del servidor y delega en ComisionRepositorio.  
* **Infraestructura:** El repositorio ejecuta el INSERT en la tabla comision y, si hay profesores seleccionados, inserta las relaciones en comision\_profesor en una segunda operación.  
* **Respuesta:** El servidor devuelve 201 con la comisión creada. El frontend cierra el modal y muestra el mensaje de éxito.

### **2.11.3. C-03: Importar Datos Masivamente (CSV)**

**Descripción de la funcionalidad**

La funcionalidad **C-03** permite al administrador cargar un archivo **CSV** con datos de comisiones y sus profesores. El sistema **valida** el archivo íntegramente en el **cliente** antes de enviar cualquier dato al servidor: detecta errores de esquema, **duplicados**, filas **incompletas** y formatos **inválidos**. Si el archivo es correcto, se realiza una **importación masiva** a través de la **API**, que procesa cada fila de forma individual con estrategia **upsert** para evitar duplicados en la base de datos. Un código de respuesta **207** indica importación parcial (algunas filas correctas y otras con error).

**Fragmentos de código relevantes**

**Servicio cliente — comision.service.js**

![][image16]

##### Figura 15

**Repositorio — búsqueda y upsert (C-03)**

**![][image17]**

##### Figura 16

**Descripción del flujo implementado**

* **Presentación:** El administrador accede a Estructura Académica, hace clic en "Importar CSV" y selecciona el archivo desde el explorador de archivos del sistema operativo.  
* **Validación en cliente (parser):** El módulo csvParser.js ejecuta cuatro validaciones en cadena antes de contactar al servidor: validación de formato de archivo (extensión y MIME), parseo del CSV, verificación del esquema de columnas esperadas, detección de duplicados dentro del mismo archivo, filas incompletas y formatos inválidos. Si cualquiera de estas falla, se muestra un mensaje de error específico y no se realiza ninguna llamada a la API.  
* **Aplicación (cliente):** Si todas las validaciones pasan, comision.service.js invoca insertar(filas), realizando un único POST /api/comisiones con el array de filas.  
* **Controlador:** La API Route detecta la presencia del campo filas en el cuerpo y ejecuta el procesamiento masivo.  
* **Infraestructura:** El repositorio recorre cada fila, resuelve los IDs de asignatura y profesor por nombre/documento (búsqueda en BD), crea la comisión si no existe (INSERT) y vincula al profesor con upsert para manejar duplicados sin error.  
* **Respuesta:** El servidor devuelve 200 si todas las filas se procesaron correctamente, o 207 (Multi-Status) si hubo filas con error parcial, detallando los errores por fila. El frontend muestra el resumen de la importación al administrador.

# **Capítulo 3\. Herramientas y lenguajes de programación**

## **3.1 Arquitectura del Software** {#3.1-arquitectura-del-software}

El diseño del sistema SIC-UNNE se fundamenta en un enfoque arquitectónico que combina un **patrón estructural por capas** con un conjunto de **patrones de diseño de dominio**, garantizando la **separación de responsabilidades**, la **trazabilidad** entre los diagramas de secuencia y el código, y la **extensibilidad** ante futuros cambios de requisitos.

### **3.1.1 Arquitectura Lógica: Patrón Cliente \- Servidor en Capas** {#3.1.1-arquitectura-lógica:-patrón-cliente---servidor-en-capas}

   
 La organización interna del software sigue un patrón **Cliente-Servidor en capas** (Presentación, Aplicación, Dominio, Infraestructura y Datos), desplegado íntegramente sobre **Next.js**. Para las operaciones con lógica de negocio (Comisiones y Denuncias), el cliente (navegador) nunca accede directamente a la base de datos: la validación y la escritura pasan por el servidor.

| Capa | Ubicación en el código | Responsabilidad |
| :---- | :---- | :---- |
| **Presentación** | src/app/, src/pages/\*.jsx, src/components/ | Renderizado de la interfaz React, validación de entrada en el cliente, disparo de llamadas HTTP a la capa de aplicación. |
| **Aplicación (API)** | src/pages/api/ (Next.js API Routes)  | Controladores HTTP que reciben las peticiones del cliente, invocan los servicios de dominio y devuelven respuestas JSON. Actúan como frontera del servidor: aquí se aplican las validaciones de autorización y se orquesta el flujo de cada caso de uso. |
| **Dominio** | src/domain/ | Entidades ricas con sus reglas de negocio y el patrón de diseño Estado, más los servicios de aplicación que orquestan cada caso de uso. Es independiente de Next.js y de Supabase: no importa ningún SDK externo. |
| **Infraestructura** | src/infrastructure/repositorios/ | Repositorios: clases concretas que encapsulan todo el acceso a la base. Traducen las operaciones del dominio a consultas SQL mediante el cliente de Supabase con privilegios de servidor (service\_role). Son los únicos objetos que conocen Supabase. |
| **Datos** | PostgreSQL en Supabase | Motor relacional que almacena las tablas, restricciones CHECK y claves foráneas. Supabase se utiliza como proveedor de PostgreSQL y de autenticación; las Edge Functions fueron reemplazadas por las API Routes. La lógica de negocio no vive en la base: las consultas de catálogo (períodos, edificios, etc.) usan acceso directo protegido por políticas RLS. |

###### Tabla 10

El **flujo completo** de una **operación** es:

Componente React  
  **→** fetch() a /api/\<recurso\>                (Capa de Presentación)  
  → Controlador Next.js API Route     (Capa de Aplicación)  
  → Servicio de dominio                      (Capa de Dominio)  
  → Repositorio                                   (Capa de Infraestructura)  
  → Supabase (PostgreSQL)              (Capa de Datos)

Se optó por una arquitectura de diseño **orientada a capas** en lugar de un modelo puramente **Backend-as-a-Service (BaaS)** debido a las siguientes ventajas:

* **Correlación técnica con el modelado:** Existe una equivalencia exacta entre los objetos de los diagramas de secuencia (Sistema/Interfaz \= DenunciasPage, *ServicioResolucionDenuncia*, *DenunciaRepositorio*…) y la estructura de archivos del proyecto.  
* **Neutralidad tecnológica:** Al centralizar las reglas de negocio en la carpeta *src/domain/* de forma agnóstica a los SDK de Supabase, se facilita una eventual migración de base de datos, requiriendo únicamente la actualización de la capa de repositorios.  
* **Seguridad centralizada en el servidor:** El uso de API Routes permite gestionar de forma segura la clave **service\_role**, validando la sesión del usuario antes de procesar solicitudes y evitando su exposición en el lado del cliente.

## **3.2 Patrones de Diseño aplicados en el Dominio** {#3.2-patrones-de-diseño-aplicados-en-el-dominio}

El proyecto implementa **un** único patrón de diseño del catálogo GoF: **Estado** (caso **C-01: Gestionar Denuncia**), marcado con un recuadro en el diagrama de clases. Se documentan además **dos patrones candidatos** —Estrategia y Observador—, indicando dónde *podrían* aplicarse, aunque **no** están implementados en el código. Como soporte de la arquitectura en capas se emplean **dos patrones auxiliares**: Repositorio y Singleton.

### **3.2.1 Patrón Estado (State)** {#3.2.1-patrón-estado-(state)}

Este patrón permite **encapsular** el comportamiento de un objeto en función de su estado, eliminando condicionales (if/switch) dispersos en el código. Para ello, la entidad **Denuncia** (src/domain/denuncia/Denuncia.ts) **delega** la **validación de transiciones** en objetos de estado concretos:

| Clase | Archivo | Estado que representa |
| :---- | :---- | :---- |
| **EstadoPendiente** | estados/EstadoPendiente.ts  | Denuncia recién creado, pendiente de revisión. |
| **EstadoResuelto** | estados/EstadoResuelto.ts | Denuncia con acción administrativa aplicada. |
| **EstadoDesestimado** | estados/EstadoDesestimado.ts | Denuncia descartado por el administrador. |

###### Tabla 11

Cuando se intenta resolver un denuncia que ya fue gestionado, el estado terminal (**EstadoResuelto** o **EstadoDesestimado**) hereda el comportamiento por defecto de la clase base y lanza la excepción **DenunciaYaProcesadaError**, que el controlador convierte en una respuesta HTTP 409, sin necesidad de lógica condicional en la capa de aplicación.

### **3.2.2 Patrón Estrategia (Strategy) — candidato** {#3.2.2-patrón-estrategia-(strategy)}

Patrón **candidato** (no implementado en el código actual). Sería aplicable a las **tres acciones administrativas** que puede tomar el administrador al resolver un denuncia: *Enviar aviso*, *Suspender Temporalmente* y *Suspender Indefinidamente*. Cada una podría encapsularse como una **estrategia intercambiable** bajo una interfaz común (p. ej. `AccionResolucion.aplicar(contexto)`), eligiéndose en tiempo de ejecución sin que el servicio conozca su implementación concreta. Esto cumpliría el principio **Abierto/Cerrado**: agregar una acción nueva no obligaría a modificar el servicio.

En la **implementación actual**, por simplicidad, esas tres acciones se resuelven con una estructura condicional dentro de **`ServicioResolucionDenuncia`** (método `aplicarEfecto`), ya que su número es fijo y acotado. El patrón se reserva como refactorización si el conjunto de acciones creciera.

### **3.2.3 Patrón Observador (Observer) — candidato** {#3.2.3-patrón-observador-(observer)}

Patrón **candidato** (no implementado en el código actual). Sería aplicable a los **efectos secundarios** que se disparan al resolver un denuncia: registrar la auditoría y notificar a los usuarios. Con un Observador, el servicio publicaría un **evento de dominio** (`ReporteResueltoEvent`) y distintos *listeners* reaccionarían de forma **desacoplada**, permitiendo agregar efectos nuevos (p. ej. enviar un email) sin modificar el servicio principal.

En la **implementación actual**, por simplicidad, esos efectos se ejecutan como **llamadas directas** del servicio a los repositorios correspondientes (métodos `notificar` y `auditar` de **`ServicioResolucionDenuncia`**). El patrón se reserva como refactorización si los efectos se volvieran numerosos o variables.

### **3.2.4 Patrón Repositorio** {#3.2.4-patrón-repositorio}

El Patrón Repositorio (patrón **auxiliar** de la arquitectura en capas) tiene como fin **aislar** la capa de dominio de los detalles de persistencia, permitiendo que el dominio pida operaciones de alto nivel (obtener, guardar) **sin escribir SQL ni conocer Supabase**. Para ello, en src/infrastructure/repositorios/ se encuentran las clases concretas como **DenunciaRepositorio**, **UsuarioRepositorio**, **AuditoriaRepositorio**, **NotificacionRepositorio** y **ComisionRepositorio**. Estas implementaciones reciben el cliente de Supabase por inyección de dependencias y devuelven objetos del dominio en lugar de estructuras de datos propias del proveedor, facilitando que los tests unitarios puedan sustituirlos por implementaciones en memoria sin necesidad de modificar la lógica de negocio.

### **3.2.5 Patrón Singleton** {#3.2.5-patrón-singleton}

Para garantizar que el cliente de Supabase con privilegios de servidor se construya **una única vez por proceso** (evitando abrir conexiones redundantes en cada llamada), **`src/infrastructure/supabaseServer.ts`** exporta la función **`getSupabaseServer()`**, que crea el cliente la primera vez usando **`SUPABASE_SERVICE_ROLE_KEY`** (variable de entorno de servidor, sin prefijo `NEXT_PUBLIC_`) y reutiliza la misma instancia en las llamadas siguientes. Es consumida por los repositorios de infraestructura, asegurando que el navegador nunca reciba ni conozca esta clave.

## **3.3 Gráfico de arquitecturas** {#3.3-gráfico-de-arquitecturas}

#### **Arquitectura en capas** {#arquitectura-en-capas}

**![][image18]**

##### Figura 17 {#figura-17}

##### 

## **3.4. Herramientas seleccionadas**

### **3.4.1. React**

**React** es una **biblioteca** de JavaScript de código abierto desarrollada por Meta, diseñada para construir interfaces de usuario mediante componentes **reutilizables** e **independientes**. Su modelo de programación declarativo permite describir cómo debe verse la interfaz en función del estado de la aplicación, delegando al framework la actualización eficiente del DOM cuando ese estado cambia.

La elección de React responde a la naturaleza interactiva del módulo administrativo. El panel gestiona entidades con múltiples relaciones (Comisiones, Denuncias, Estructura Académica) y requiere que los cambios aplicados por el administrador (como la resolución de un denuncia o la creación de una comisión) se reflejen de forma inmediata sin recargar la página completa. 

React también posibilita la **modularidad** de la interfaz mediante componentes **aislados** (tablas, modales, formularios), lo que facilita el mantenimiento y la incorporación de nuevas funcionalidades sin impactar componentes existentes.

### **3.4.2. Next.js (API Routes)**

**Next.js** es un **framework** de React que extiende sus capacidades con renderizado del lado del servidor (SSR), generación estática y, en particular, **API Routes**: rutas HTTP que se ejecutan en el servidor Node.js integrado, sin necesidad de un servidor backend independiente.

 En este proyecto, **Next.js API Routes** actúa como la capa de controladores del backend propio. Cada ruta recibe peticiones HTTP del cliente React, **valida** el contexto de autorización, **delega** la lógica de negocio en los servicios de dominio y **devuelve** una respuesta JSON estructurada. Las rutas implementadas son:

| Ruta | Método | Funcionalidad |
| :---- | :---- | :---- |
| **/api/denuncias** | GET | Listar todos los denuncias con datos de emisor y receptor |
| **/api/denuncias/\[id\]** | PATCH | Resolver o desestimar un denuncia (C-01) |
| **/api/comisiones** | POST | Crear una nueva comisión con validación completa (C-02) |

###### Tabla 13

El uso de **API Routes** permite mantener la clave **service\_role** de Supabase estrictamente en el servidor, evitando su **exposición** al navegador. También garantiza que toda la lógica de negocio (validaciones de dominio, patrones de diseño, auditoría) se ejecute en un entorno controlado antes de cualquier acceso a la base de datos, algo que no es posible cuando el cliente accede directamente a Supabase.

### **3.4.3 Supabase (PostgreSQL \+ Autenticación)** {#3.4.3-supabase-(postgresql-+-autenticación)}

**Supabase** es una **plataforma** de infraestructura de código abierto que provee, en este proyecto, **dos servicios** específicos: **motor de base de datos PostgreSQL** y **gestión de autenticación**. A diferencia de un enfoque Backend-as-a-Service completo, no se delega en Supabase la lógica de negocio de las operaciones críticas (Comisiones y Denuncias) ni se usan Edge Functions; la capa de aplicación es propia y reside en **src/pages/api/**. Las consultas de catálogo (períodos, edificios, etc.) sí usan el acceso directo de Supabase desde el cliente, protegido por políticas RLS.

* **Base de Datos PostgreSQL:** Aloja el motor relacional que almacena la estructura académica del SIC-UNNE (Edificios, Facultades, Carreras, Comisiones, Asignaturas) y los registros transaccionales (Denuncias, Auditoría, Notificaciones). Se aprovechan las restricciones de integridad nativas de PostgreSQL (claves foráneas, restricciones CHECK, valores NOT NULL) para garantizar la **consistencia** de los datos en la fuente. El acceso desde el servidor se realiza mediante el cliente con clave **service\_role**, que opera con privilegios completos desde las API Routes y los repositorios de infraestructura.  
* **Gestión de Autenticación:** Provee el sistema de identidades basado en tokens JWT para la sesión del administrador. El panel **valida** estos tokens en las API Routes para identificar al usuario antes de ejecutar cualquier operación de escritura.

### **3.4.4. Vitest** {#3.4.4.-vitest}

**Vitest** es un **framework** de **testing** unitario moderno diseñado específicamente para proyectos que utilizan Vite o TypeScript. Ofrece una API compatible con Jest, ejecución nativa de ESModules y soporte de primera clase para TypeScript sin transpilación adicional.

En el contexto **SIC-UNNE** se utiliza para **verificar** la correctitud de la capa de dominio de forma aislada, sin dependencia de Supabase, del servidor HTTP ni del navegador. El proyecto cuenta con 38 tests distribuidos en cinco archivos:

| Archivo de tests | Qué verifica |
| :---- | :---- |
| **tests/domain/denuncia/** | Dominio C-01: máquina de estados del denuncia (patrón Estado) y el servicio de resolución completo (resolver/desestimar, con sus efectos delegados a los repositorios). |
| **tests/domain/comision/** | Reglas de la entidad Comisión (validación) y el servicio de comisiones (crear, actualizar e importación masiva — C-02/C-03). |
| **src/services/utils/csvParser.test.js** | Validación del parser de CSV: esquema de columnas, detección de duplicados, campos incompletos y formatos inválidos (fechas, letras, documentos). |

###### Tabla 14

La configuración (vitest.config.ts) define el alias @ apuntando a la raíz del proyecto, lo que permite que los tests **importen** el código de dominio con las mismas rutas absolutas que usa la aplicación, sin rutas relativas frágiles. Los tests se ejecutan con npm test y producen un denuncia detallado de cada caso verificado.

La presencia de una suite de tests automatizados sobre el dominio **garantiza** que el patrón de diseño implementado (Estado) funcione **correctamente** ante todos los escenarios posibles (incluyendo casos borde como intentar resolver un denuncia ya gestionado) y que futuras modificaciones no introduzcan regresiones en los flujos críticos del sistema.

### **3.4.5. Otras herramientas**

Para complementar el flujo de desarrollo bajo la metodología Scrum, se integraron las siguientes herramientas de apoyo:

* **Trello:** Utilizada como la herramienta central para el Sprint Planning y el seguimiento de tareas. Permite visualizar el flujo de trabajo (To Do, Doing, Done) y asegurar que el equipo cumpla con los objetivos de cada iteración.  
* **GitHub:** Funciona como el sistema de control de versiones y repositorio central de código. Es fundamental para mantener la integridad del software y permitir el trabajo colaborativo entre los integrantes del equipo.  
* **Postman:** Herramienta esencial para la prueba y depuración de las APIs generadas por Supabase, permitiendo validar las respuestas del servidor antes de integrarlas en el frontend.  
* **Estándar IEEE 830:** Se adoptó para la documentación de los Requerimientos de Software, asegurando que el informe preliminar cumpla con las normas de calidad internacional exigidas por la Facultad.

# 

# 

# 

# 

# 

# **Capítulo 4\. Resultados**

Los prototipos de pantalla presentados a continuación forman parte del desarrollo de la interfaz de usuario:

## **4.1. Capturas de pantalla: Interfaz** {#4.1.-capturas-de-pantalla:-interfaz}

### **Panel de Gestión de Estructura Académica** {#panel-de-gestión-de-estructura-académica}

**![][image19]**

##### Figura 11 {#figura-11}

### **Modal Agregar Asignatura** {#modal-agregar-asignatura}

**![][image20]**

##### Figura 12 {#figura-12}

### **Modal Agregar Comisión** {#modal-agregar-comisión}

**![][image21]**

##### Figura 13 {#figura-13}

## **4.1.2. Códigos de Lógica** {#4.1.2.-códigos-de-lógica}

### **Algoritmo 1: Lógica de validación para la creación de comisiones.**  {#algoritmo-1:-lógica-de-validación-para-la-creación-de-comisiones.}

![][image22]

##### Figura 14 {#figura-14}

# 

# 

# **Capítulo 5\. Conclusiones y futuros trabajos**

## **5.1. Conclusiones**

La implementación del módulo de administración mediante una arquitectura BaaS con Supabase permitió reducir los tiempos de configuración de infraestructura, cumpliendo con la planificación ágil establecida. El uso del patrón por capas aseguró que la lógica de importación masiva fuera robusta y segura, protegiendo la integridad de los datos académicos ante errores de carga manual. La principal dificultad radicó en la configuración de las políticas RLS para garantizar que la seguridad no dependiera del código frontend, sino que estuviera blindada en el motor de base de datos.

## 

## **5.2. Futuros trabajos**

\[Describimos luego posibles extensiones o mejoras del módulo: integración con sistemas académicos oficiales, módulo de apelaciones, denuncias automáticos, entre otros.\]

# **Referencias**

**\[1\]** IEEE Computer Society, "IEEE Standard for Information Technology—Software Design Descriptions," IEEE Std 1016-2009, 2009\.

**\[2\]** PostgreSQL Global Development Group, "PostgreSQL 16.0 Documentation," 2023\. \[Online\]. Available: [https://www.postgresql.org/docs/16/](https://www.postgresql.org/docs/16/)

**\[3\]** Supabase Inc., "Row Level Security and Policies," 2024\. \[Online\]. Available: [https://supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security)

# **Anexos**

## **Anexo A — [Tablero Trello (Sprint planning)](https://trello.com/invite/b/69cc8f7a02d5f92f04e155c3/ATTI2199024c3dd1e2a29dc33b252cf6aceb872E3EC9/ing2-grupo-50)** {#anexo-a-—-tablero-trello-(sprint-planning)}

**Anexo A — [Manual de Usuarios del Sistema](https://docs.google.com/document/d/1CKQ0EC64wTrNKwehAjn8LqAlHJWvazzm_YiXKMyTbAc/edit?usp=sharing)**

## 