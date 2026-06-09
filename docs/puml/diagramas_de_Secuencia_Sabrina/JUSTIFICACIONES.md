Justificación del uso del fragmento combinado loop en el Diagrama de Secuencia C-01
Contexto
En el Diagrama de Secuencia C-01 Gestionar Denuncia (Caso Normal), durante el flujo de carga del listado de denuncias (pasos 4 a 6), se utiliza el fragmento combinado loop de UML para modelar la interacción entre la entidad Denuncia y la entidad Usuario. A continuación se justifica su uso desde el punto de vista del modelado UML y su correspondencia con la implementación real del sistema.

Fundamento en UML
Según la especificación de UML 2.x, los fragmentos combinados (combined fragments) permiten modelar estructuras de control dentro de un diagrama de secuencia. El fragmento loop se utiliza cuando un conjunto de mensajes se repite una o más veces bajo una condición dada. Su sintaxis es:


loop [condición de guarda]
  — mensajes que se repiten —
En este caso, la condición de guarda es: [por cada denuncia de la lista], lo que expresa con precisión que los pasos 4, 5 y 6 se ejecutan iterativamente, una vez por cada elemento devuelto en la consulta de denuncias.

Por qué es necesario en este diagrama
La operación modelada en el paso 3 (obtenerDenuncias()) devuelve una colección de registros de la tabla denuncia. Cada registro contiene un receptor_id, pero no contiene los datos del usuario receptor (nombre, apellido, documento), ya que esos datos residen en la entidad Usuario, que es un dominio separado.

Por lo tanto, para construir la lista completa que necesita mostrar la interfaz (Sistema — DenunciasPage), es necesario enriquecer cada denuncia con los datos de su receptor. Esta operación de enriquecimiento se repite tantas veces como denuncias haya en la lista, lo cual corresponde exactamente a la semántica del fragmento loop.

Sin el loop, el diagrama daría a entender que se realiza una única llamada a obtenerPorId, lo cual sería una representación incorrecta e incompleta del flujo real del sistema.

Correspondencia con el código
La implementación de este comportamiento se encuentra en el archivo src/pages/api/denuncias/index.js, función handleGet, líneas 49–70:

js

// Pasos 4-6 del diagrama — loop [por cada denuncia de la lista]
const servicio = new ServicioConsultaUsuario();
const receptorIds = [...new Set(data.map((d) => d.receptor_id).filter(Boolean))];
const receptoresMap = {};
await Promise.all(
  receptorIds.map(async (id) => {           // ← iteración sobre los receptores
    try {
      const usuario = await servicio.obtenerPorId(id);   // paso 5: obtenerPorId(receptor_id)
      receptoresMap[id] = {
        id_usuario: usuario.id_usuario,
        nombre:     usuario.nombre,
        apellido:   usuario.apellido,
        documento:  usuario.documento,
      };                                    // paso 6: devuelve datos del receptor
    } catch {
      receptoresMap[id] = null;
    }
  })
);
Diferencia entre el modelo UML y la implementación: loop secuencial vs. paralelo
El diagrama de secuencia modela el loop de manera secuencial, es decir, como si las llamadas a obtenerPorId se realizaran una tras otra. Esto es correcto desde el punto de vista del modelo lógico, ya que UML describe qué ocurre, no necesariamente cómo se optimiza.

En la implementación, sin embargo, el loop se ejecuta de forma paralela mediante Promise.all. Esta es una decisión de implementación que optimiza el rendimiento: en lugar de esperar que cada llamada al repositorio termine antes de iniciar la siguiente, todas las consultas se lanzan simultáneamente y se espera a que todas completen.

Aspecto	Modelo UML	Implementación
Tipo de iteración	Loop secuencial (conceptual)	Promise.all — paralelo
Semántica	Por cada receptor_id en la lista	Por cada receptor_id único en la lista
Objetivo	Representar el flujo lógico	Optimizar el tiempo de respuesta
La optimización adicional de trabajar con receptor_ids únicos (new Set(...)) evita consultar dos veces al repositorio si dos denuncias comparten el mismo receptor, lo que reduce la cantidad de llamadas a la base de datos sin alterar el resultado final.

Conclusión
El uso del fragmento loop en el diagrama de secuencia C-01 es técnicamente correcto y necesario para representar con fidelidad el flujo de obtención de datos del receptor en el contexto del listado de denuncias. Refleja que la entidad Denuncia (capa de API Route) debe consultar reiteradamente a la entidad Usuario (a través del ServicioConsultaUsuario) para enriquecer cada elemento de la lista antes de devolvérsela al sistema. La implementación concreta en código respeta esta lógica y la optimiza mediante ejecución paralela, sin contradecir el modelo conceptual representado en el diagrama.