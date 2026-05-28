import { describe, it, expect } from 'vitest';
import {
  validarFormatoArchivo,
  validarEsquema,
  detectarDuplicados,
  detectarIncompletos,
  detectarFormatosInvalidos,
} from './csvParser';

describe('csvParser Unit Tests', () => {
  
  // ─── 1. TEST validarFormatoArchivo ──────────────────────────────────────────
  describe('validarFormatoArchivo', () => {
    it('debería retornar true si el archivo tiene extensión .csv', () => {
      const mockFile = { name: 'datos_comision.csv' };
      expect(validarFormatoArchivo(mockFile)).toBe(true);
    });

    it('debería retornar false si el archivo no tiene extensión .csv', () => {
      const mockFile = { name: 'documento.txt' };
      expect(validarFormatoArchivo(mockFile)).toBe(false);
    });

    it('debería retornar false si el archivo es nulo o indefinido', () => {
      expect(validarFormatoArchivo(null)).toBe(false);
      expect(validarFormatoArchivo(undefined)).toBe(false);
    });
  });

  // ─── 2. TEST validarEsquema ─────────────────────────────────────────────────
  describe('validarEsquema', () => {
    it('debería retornar un error si las filas están vacías o no hay datos', () => {
      expect(validarEsquema([])).toContain('El archivo no contiene filas de datos.');
    });

    it('debería retornar vacío (sin errores) si todas las columnas requeridas están presentes', () => {
      const filasValidas = [{
        edificio_nombre: 'A',
        facultad_nombre: 'B',
        carrera_nombre: 'C',
        periodo_nombre: 'D',
        periodo_fecha_inicio: '2026-03-01',
        periodo_fecha_fin: '2026-07-01',
        asignatura_nombre: 'E',
        profesor_nombre: 'F',
        profesor_apellido: 'G',
        profesor_documento: '12345678',
        comision_nombre: 'H',
        comision_letra_desde: 'A',
        comision_letra_hasta: 'Z'
      }];
      expect(validarEsquema(filasValidas)).toEqual([]);
    });

    it('debería retornar un mensaje detallado si faltan columnas requeridas', () => {
      const filasInvalidas = [{
        edificio_nombre: 'A',
        facultad_nombre: 'B'
        // Faltan el resto de los campos requeridos
      }];
      const errores = validarEsquema(filasInvalidas);
      expect(errores.length).toBe(1);
      expect(errores[0]).toContain('El CSV no tiene las columnas requeridas');
    });
  });

  // ─── 3. TEST detectarDuplicados ─────────────────────────────────────────────
  describe('detectarDuplicados', () => {
    it('debería retornar vacío si no hay comisiones duplicadas en la misma asignatura', () => {
      const filas = [
        { comision_nombre: 'A', asignatura_nombre: 'Matemática' },
        { comision_nombre: 'B', asignatura_nombre: 'Matemática' },
        { comision_nombre: 'A', asignatura_nombre: 'Física' } // Misma comisión pero distinta asignatura
      ];
      expect(detectarDuplicados(filas)).toEqual([]);
    });

    it('debería retornar un error si se encuentra la misma comisión en la misma asignatura', () => {
      const filas = [
        { comision_nombre: 'A', asignatura_nombre: 'Matemática' },
        { comision_nombre: 'B', asignatura_nombre: 'Matemática' },
        { comision_nombre: 'A', asignatura_nombre: 'Matemática' } // Duplicado!
      ];
      const errores = detectarDuplicados(filas);
      expect(errores.length).toBe(1);
      expect(errores[0]).toContain('se encontraron duplicados');
    });
  });

  // ─── 4. TEST detectarIncompletos ────────────────────────────────────────────
  describe('detectarIncompletos', () => {
    it('debería retornar vacío si todos los campos requeridos están completos', () => {
      const filas = [{
        edificio_nombre: 'A',
        facultad_nombre: 'B',
        carrera_nombre: 'C',
        periodo_nombre: 'D',
        periodo_fecha_inicio: '2026-03-01',
        periodo_fecha_fin: '2026-07-01',
        asignatura_nombre: 'E',
        profesor_nombre: 'F',
        profesor_apellido: 'G',
        profesor_documento: '12345678',
        comision_nombre: 'H',
        comision_letra_desde: 'A',
        comision_letra_hasta: 'Z'
      }];
      expect(detectarIncompletos(filas)).toEqual([]);
    });

    it('debería retornar un error si algún campo requerido está vacío o es nulo', () => {
      const filas = [{
        edificio_nombre: 'A',
        facultad_nombre: 'B',
        carrera_nombre: '', // Vacío!
        periodo_nombre: 'D',
        periodo_fecha_inicio: '2026-03-01',
        periodo_fecha_fin: '2026-07-01',
        asignatura_nombre: 'E',
        profesor_nombre: 'F',
        profesor_apellido: 'G',
        profesor_documento: '12345678',
        comision_nombre: null, // Nulo!
        comision_letra_desde: 'A',
        comision_letra_hasta: 'Z'
      }];
      const errores = detectarIncompletos(filas);
      expect(errores.length).toBe(2);
      expect(errores[0]).toContain('se encontraron datos incompletos');
    });
  });

  // ─── 5. TEST detectarFormatosInvalidos ──────────────────────────────────────
  describe('detectarFormatosInvalidos', () => {
    it('debería retornar vacío si todos los formatos son correctos', () => {
      const filas = [{
        periodo_fecha_inicio: '2026-03-01',
        periodo_fecha_fin: '2026-07-01',
        profesor_documento: '40123456',
        comision_letra_desde: 'A',
        comision_letra_hasta: 'D'
      }];
      expect(detectarFormatosInvalidos(filas)).toEqual([]);
    });

    it('debería retornar error si el formato de la fecha es incorrecto (no YYYY-MM-DD)', () => {
      const filas = [{
        periodo_fecha_inicio: '01/03/2026', // Formato inválido
        periodo_fecha_fin: '2026-07-01',
        profesor_documento: '40123456',
        comision_letra_desde: 'A',
        comision_letra_hasta: 'D'
      }];
      const errores = detectarFormatosInvalidos(filas);
      expect(errores.length).toBe(1);
      expect(errores[0]).toContain('tiene formato inválido (esperado: YYYY-MM-DD');
    });

    it('debería retornar error si la fecha de fin es anterior a la fecha de inicio', () => {
      const filas = [{
        periodo_fecha_inicio: '2026-07-01',
        periodo_fecha_fin: '2026-03-01', // Fin antes de Inicio
        profesor_documento: '40123456',
        comision_letra_desde: 'A',
        comision_letra_hasta: 'D'
      }];
      const errores = detectarFormatosInvalidos(filas);
      expect(errores.length).toBe(1);
      expect(errores[0]).toContain('es anterior a "periodo_fecha_inicio"');
    });

    it('debería retornar error si el documento del profesor no es un entero positivo', () => {
      const filas = [{
        periodo_fecha_inicio: '2026-03-01',
        periodo_fecha_fin: '2026-07-01',
        profesor_documento: '-45.5', // Documento no válido
        comision_letra_desde: 'A',
        comision_letra_hasta: 'D'
      }];
      const errores = detectarFormatosInvalidos(filas);
      expect(errores.length).toBe(1);
      expect(errores[0]).toContain('debe ser un número entero positivo');
    });

    it('debería retornar error si las letras de comisión tienen longitud diferente a 1 carácter o caracteres no alfabéticos', () => {
      const filas = [{
        periodo_fecha_inicio: '2026-03-01',
        periodo_fecha_fin: '2026-07-01',
        profesor_documento: '40123456',
        comision_letra_desde: 'AA', // 2 letras!
        comision_letra_hasta: '3' // Un número!
      }];
      const errores = detectarFormatosInvalidos(filas);
      expect(errores.length).toBe(2);
      expect(errores[0]).toContain('debe ser exactamente 1 letra');
    });
  });
});
