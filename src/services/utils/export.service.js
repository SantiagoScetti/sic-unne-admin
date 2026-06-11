import Papa from 'papaparse';

export function descargarCSV(nombreArchivo, datos) {
  const csv = Papa.unparse(datos);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', nombreArchivo);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function descargarPlantillaCSV() {
  const cabeceras = "edificio_nombre,edificio_direccion,edificio_ciudad,facultad_nombre,facultad_ciudad,carrera_nombre,periodo_nombre,periodo_fecha_inicio,periodo_fecha_fin,asignatura_nombre,asignatura_anio,profesor_nombre,profesor_apellido,profesor_documento,profesor_correo,comision_nombre,comision_letra_desde,comision_letra_hasta";
  const ejemplo1 = "Campus Deodoro Roca,Av. Libertad 5470,Corrientes,FaCENA,Corrientes,Licenciatura en Sistemas,1er Cuatrimestre,2025-03-01,2025-07-31,Bases de Datos,Tercer Año,María,Gómez,25432198,mgomez@unne.edu.ar,COM-1,A,M";
  const ejemplo2 = "Campus Deodoro Roca,Av. Libertad 5470,Corrientes,FaCENA,Corrientes,Licenciatura en Sistemas,1er Cuatrimestre,2025-03-01,2025-07-31,Bases de Datos,Tercer Año,Carlos,Pérez,32145678,cperez@unne.edu.ar,COM-2,N,Z";
  const csvContent = `${cabeceras}\n${ejemplo1}\n${ejemplo2}`;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'plantilla_importacion_sic.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
