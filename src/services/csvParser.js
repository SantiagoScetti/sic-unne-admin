import Papa from 'papaparse';

// ─────────────────────────────────────────────────────────────────────────────
// Esquema de campos requeridos (deducido del SP importar_estructura_academica)
// ─────────────────────────────────────────────────────────────────────────────
const CAMPOS_REQUERIDOS = [
  'edificio_nombre',
  'facultad_nombre',
  'carrera_nombre',
  'periodo_nombre',
  'periodo_fecha_inicio',
  'periodo_fecha_fin',
  'asignatura_nombre',
  'profesor_nombre',
  'profesor_apellido',
  'profesor_documento',
  'comision_nombre',
  'comision_letra_desde',
  'comision_letra_hasta',
];

// Campos opcionales (tienen COALESCE con default en el SP)
const CAMPOS_OPCIONALES = [
  'edificio_direccion',
  'facultad_ciudad',
  'asignatura_anio',
  'profesor_correo',
];

// Formato de fecha esperado: YYYY-MM-DD
const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;

// ─────────────────────────────────────────────────────────────────────────────
// validarFormatoArchivo
// Verifica que el archivo tenga extensión .csv antes de intentar parsear.
// Retorna true si es válido, false si no.
// ─────────────────────────────────────────────────────────────────────────────
export const validarFormatoArchivo = (archivo) => {
  if (!archivo) return false;
  return archivo.name.toLowerCase().endsWith('.csv');
};

// ─────────────────────────────────────────────────────────────────────────────
// parsearCSV
// Convierte el archivo .csv en un array de objetos usando PapaParse.
// Retorna una Promise que resuelve con las filas parseadas.
// ─────────────────────────────────────────────────────────────────────────────
export const parsearCSV = (archivo) => {
  return new Promise((resolve, reject) => {
    Papa.parse(archivo, {
      header: true,         // usa la primera fila como nombres de columna
      skipEmptyLines: true, // ignora filas en blanco
      complete: (resultado) => resolve(resultado.data),
      error: (err) => reject(new Error(`Error al leer el CSV: ${err.message}`)),
    });
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// validarEsquema
// Verifica que cada fila tenga todas las columnas requeridas según el SP.
// Retorna un array de strings con los errores encontrados (vacío si todo OK).
// ─────────────────────────────────────────────────────────────────────────────
export const validarEsquema = (filas) => {
  const errores = [];
  if (!filas || filas.length === 0) {
    errores.push('El archivo no contiene filas de datos.');
    return errores;
  }

  // Verificar que las columnas del CSV coincidan con el esquema esperado
  const columnas = Object.keys(filas[0]);
  const faltantes = CAMPOS_REQUERIDOS.filter((campo) => !columnas.includes(campo));

  if (faltantes.length > 0) {
    errores.push(
      `El CSV no tiene las columnas requeridas: ${faltantes.join(', ')}`
    );
  }

  return errores;
};

// ─────────────────────────────────────────────────────────────────────────────
// detectarDuplicados
// Busca filas con la misma combinación (comision_nombre + asignatura_nombre).
// Una comisión duplicada en el CSV generaría conflictos en la importación.
// Retorna un array de mensajes de error por cada duplicado detectado.
// ─────────────────────────────────────────────────────────────────────────────
export const detectarDuplicados = (filas) => {
  const errores = [];
  const vistas = new Map(); // clave → número de fila donde apareció primero

  filas.forEach((fila, index) => {
    // Clave de unicidad: comisión dentro de una asignatura
    const clave = `${fila.comision_nombre}||${fila.asignatura_nombre}`;
    if (vistas.has(clave)) {
      errores.push(
        `Revise los datos de la entidad 'Comisión', se encontraron duplicados: ` +
        `"${fila.comision_nombre}" (asignatura: "${fila.asignatura_nombre}") ` +
        `aparece en las filas ${vistas.get(clave) + 1} y ${index + 1}.`
      );
    } else {
      vistas.set(clave, index);
    }
  });

  return errores;
};

// ─────────────────────────────────────────────────────────────────────────────
// detectarIncompletos
// Verifica que ningún campo requerido esté vacío, null o undefined en alguna fila.
// Retorna un array de mensajes de error por campo y fila.
// ─────────────────────────────────────────────────────────────────────────────
export const detectarIncompletos = (filas) => {
  const errores = [];

  filas.forEach((fila, index) => {
    CAMPOS_REQUERIDOS.forEach((campo) => {
      const valor = fila[campo];
      if (valor === undefined || valor === null || String(valor).trim() === '') {
        errores.push(
          `Revise los datos de la entidad '${_entidadDeCampo(campo)}', ` +
          `se encontraron datos incompletos: ` +
          `campo "${campo}" está vacío en la fila ${index + 1}.`
        );
      }
    });
  });

  return errores;
};

// ─────────────────────────────────────────────────────────────────────────────
// detectarFormatosInvalidos
// Verifica formatos específicos: fechas YYYY-MM-DD, documento numérico, letras de 1 char.
// Retorna un array de mensajes de error por fila y campo.
// ─────────────────────────────────────────────────────────────────────────────
export const detectarFormatosInvalidos = (filas) => {
  const errores = [];

  filas.forEach((fila, index) => {
    const numFila = index + 1;

    // Fechas deben tener formato YYYY-MM-DD
    ['periodo_fecha_inicio', 'periodo_fecha_fin'].forEach((campo) => {
      const valor = fila[campo];
      if (valor && !REGEX_FECHA.test(String(valor).trim())) {
        errores.push(
          `Revise los datos de la entidad 'Período', se encontraron datos incompletos: ` +
          `"${campo}" en fila ${numFila} tiene formato inválido (esperado: YYYY-MM-DD, recibido: "${valor}").`
        );
      }
    });

    // Validar que fecha_fin no sea anterior a fecha_inicio
    if (fila.periodo_fecha_inicio && fila.periodo_fecha_fin) {
      const inicio = new Date(fila.periodo_fecha_inicio);
      const fin    = new Date(fila.periodo_fecha_fin);
      if (!isNaN(inicio) && !isNaN(fin) && fin < inicio) {
        errores.push(
          `Revise los datos de la entidad 'Período', se encontraron datos incompletos: ` +
          `"periodo_fecha_fin" (${fila.periodo_fecha_fin}) es anterior a "periodo_fecha_inicio" ` +
          `(${fila.periodo_fecha_inicio}) en fila ${numFila}.`
        );
      }
    }

    // Documento debe ser un entero válido
    if (fila.profesor_documento) {
      const doc = Number(fila.profesor_documento);
      if (!Number.isInteger(doc) || doc <= 0) {
        errores.push(
          `Revise los datos de la entidad 'Profesor', se encontraron datos incompletos: ` +
          `"profesor_documento" en fila ${numFila} debe ser un número entero positivo ` +
          `(recibido: "${fila.profesor_documento}").`
        );
      }
    }

    // Letras de comisión deben ser exactamente 1 carácter alfabético
    ['comision_letra_desde', 'comision_letra_hasta'].forEach((campo) => {
      const valor = String(fila[campo] || '').trim();
      if (valor && (valor.length !== 1 || !/^[A-Za-z]$/.test(valor))) {
        errores.push(
          `Revise los datos de la entidad 'Comisión', se encontraron datos incompletos: ` +
          `"${campo}" en fila ${numFila} debe ser exactamente 1 letra (recibido: "${valor}").`
        );
      }
    });
  });

  return errores;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper privado: mapea un nombre de campo a su entidad en el dominio
// ─────────────────────────────────────────────────────────────────────────────
const _entidadDeCampo = (campo) => {
  if (campo.startsWith('edificio_'))        return 'Edificio';
  if (campo.startsWith('facultad_'))        return 'Facultad';
  if (campo.startsWith('carrera_'))         return 'Carrera';
  if (campo.startsWith('periodo_'))         return 'Período';
  if (campo.startsWith('asignatura_'))      return 'Asignatura';
  if (campo.startsWith('profesor_'))        return 'Profesor';
  if (campo.startsWith('comision_'))        return 'Comisión';
  return 'Dato';
};
