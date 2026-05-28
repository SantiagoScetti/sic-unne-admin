import { Comision } from './Comision';
import { ComisionInvalidaError } from './errores';
import { ComisionRepositorio } from '../../infrastructure/repositorios/ComisionRepositorio';

// =============================================================================
// ServicioComision — Servicio de Aplicación (Casos de Uso C-02 y C-03).
//
// Orquesta la entidad de dominio Comisión (validación) con el repositorio
// (persistencia). El controlador (API Route) solo delega aquí; no conoce SQL.
// =============================================================================

export interface DatosCrearComision {
  nombre: string;
  letraDesde: string;
  letraHasta: string;
  id_asignatura: number | string;
  profesores_ids?: number[];
}

export interface DatosActualizarComision {
  nombre?: string;
  letraDesde?: string;
  letraHasta?: string;
  letra_desde?: string;
  letra_hasta?: string;
  id_asignatura?: number | string;
  profesores_ids?: number[];
}

export interface FilaComisionCSV {
  asignatura_nombre: string;
  comision_nombre: string;
  comision_letra_desde: string;
  comision_letra_hasta: string;
  profesor_documento: string | number;
}

export interface ResultadoImportacion {
  insertadas: number;
  resultados: unknown[];
  errores: string[];
}

export class ServicioComision {
  // Inyección de dependencias: el repositorio se recibe por constructor (con
  // default de producción), permitiendo testear sin base de datos.
  constructor(private readonly repo: ComisionRepositorio = new ComisionRepositorio()) {}

  // ── Lecturas ──────────────────────────────────────────────────────────────
  listar(filtroEstado: 'Activos' | 'Inactivos' | 'Todos') {
    return this.repo.listar(filtroEstado);
  }

  contarActivas() {
    return this.repo.contarActivas();
  }

  // ── C-02: Crear comisión (validación + alta + vinculación, atómico) ─────────
  async crear(datos: DatosCrearComision) {
    const comision = new Comision({
      nombre: datos.nombre,
      letraDesde: datos.letraDesde,
      letraHasta: datos.letraHasta,
      id_asignatura: Number(datos.id_asignatura),
      profesoresIds: datos.profesores_ids ?? [],
    });

    comision.validar(); // reglas de negocio (lanza ComisionInvalidaError)

    if (!(await this.repo.existeAsignatura(comision.id_asignatura))) {
      throw new ComisionInvalidaError(`La asignatura con ID ${comision.id_asignatura} no existe.`);
    }

    const fila = await this.repo.crear(comision);
    if (comision.profesoresIds.length > 0) {
      await this.repo.vincularProfesores(fila.id_comision, comision.profesoresIds);
    }
    return fila;
  }

  // ── Actualización (admite camelCase o snake_case en las letras) ─────────────
  async actualizar(idComision: number, datos: DatosActualizarComision) {
    const fila: Record<string, unknown> = {};

    if (datos.nombre !== undefined) fila.nombre = String(datos.nombre).trim();

    const letraDesde = datos.letraDesde ?? datos.letra_desde;
    const letraHasta = datos.letraHasta ?? datos.letra_hasta;
    if (letraDesde !== undefined && letraHasta !== undefined) {
      const ld = String(letraDesde).trim().toUpperCase();
      const lh = String(letraHasta).trim().toUpperCase();
      const reLetra = /^[A-Z]$/;
      if (!reLetra.test(ld) || !reLetra.test(lh)) {
        throw new ComisionInvalidaError("Las letras 'Desde' y 'Hasta' deben ser un único carácter (A-Z).");
      }
      if (ld.charCodeAt(0) >= lh.charCodeAt(0)) {
        throw new ComisionInvalidaError("La letra 'Desde' debe ser anterior a la letra 'Hasta'.");
      }
      fila.letra_desde = ld;
      fila.letra_hasta = lh;
    }

    if (datos.id_asignatura !== undefined && datos.id_asignatura !== '' && datos.id_asignatura !== null) {
      fila.id_asignatura = Number(datos.id_asignatura);
    }

    let actualizada = null;
    if (Object.keys(fila).length > 0) {
      actualizada = await this.repo.actualizar(idComision, fila);
    }
    if (Array.isArray(datos.profesores_ids)) {
      await this.repo.reemplazarProfesores(idComision, datos.profesores_ids);
    }
    return actualizada;
  }

  cambiarEstado(idComision: number, estado: boolean) {
    return this.repo.cambiarEstado(idComision, estado);
  }

  // ── C-03: Importación masiva desde CSV ──────────────────────────────────────
  async importarMasivo(filas: FilaComisionCSV[]): Promise<ResultadoImportacion> {
    const resultados: unknown[] = [];
    const errores: string[] = [];

    for (const f of filas) {
      try {
        const idAsignatura = await this.repo.buscarIdAsignaturaPorNombre(f.asignatura_nombre);
        if (!idAsignatura) {
          errores.push(`[Fila comision='${f.comision_nombre}'] No se encontró la asignatura "${f.asignatura_nombre}".`);
          continue;
        }

        let idComision = await this.repo.buscarIdComision(f.comision_nombre, idAsignatura);
        if (!idComision) {
          const comision = new Comision({
            nombre: f.comision_nombre,
            letraDesde: f.comision_letra_desde,
            letraHasta: f.comision_letra_hasta,
            id_asignatura: idAsignatura,
          });
          try {
            comision.validar();
          } catch (e) {
            errores.push(`[Fila comision='${f.comision_nombre}'] ${(e as Error).message}`);
            continue;
          }
          const nueva = await this.repo.crear(comision);
          idComision = nueva.id_comision;
          resultados.push(nueva);
        }

        const idProfesor = await this.repo.buscarIdProfesorPorDocumento(Number(f.profesor_documento));
        if (!idProfesor) {
          errores.push(`[Fila comision='${f.comision_nombre}'] No se encontró el profesor con documento ${f.profesor_documento}.`);
          continue;
        }

        await this.repo.upsertVinculo(idComision, idProfesor);
      } catch (rowErr) {
        errores.push(`[Fila comision='${f.comision_nombre}'] Error inesperado: ${(rowErr as Error).message}`);
      }
    }

    return { insertadas: resultados.length, resultados, errores };
  }
}
