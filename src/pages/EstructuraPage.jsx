"use client";
import React, { useState, useEffect, useRef } from 'react';
import { descargarCSV, descargarPlantillaCSV } from '../services/utils/export.service';
import * as periodoService from '../services/academico/periodo.service';
import * as edificioService from '../services/academico/edificio.service';
import * as facultadService from '../services/academico/facultad.service';
import * as carreraService from '../services/academico/carrera.service';
import * as asignaturaService from '../services/academico/asignatura.service';
import * as profesorService from '../services/academico/profesor.service';
import * as comisionService from '../services/academico/comision.service';
import { validarFormatoArchivo, parsearCSV, validarEsquema, detectarDuplicados, detectarIncompletos, detectarFormatosInvalidos } from '../services/utils/csvParser';
import AddEdificioModal from '../components/features/modals/addEdificioModal';
import AddFacultadModal from '../components/features/modals/addFacultadModal';
import AddCarreraModal from '../components/features/modals/addCarreraModal';
import AddAsignaturaModal from '../components/features/modals/addAsignaturaModal';
import AddPeriodoModal from '../components/features/modals/addPeriodoModal';
import AddProfesorModal from '../components/features/modals/addProfesorModal';
import AddComisionModal from '../components/features/modals/addComisionModal';

const EstructuraPage = () => {
  const [entidadActiva, setEntidadActiva] = useState('Comisiones');
  const [editingTipo, setEditingTipo] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('Activos');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const [comisionesList, setComisionesList] = useState([]);
  const [estadisticasReales, setEstadisticasReales] = useState({});
  const [profesoresList, setProfesoresList] = useState([]);
  const [periodosList, setPeriodosList] = useState([]);
  const [edificiosList, setEdificiosList] = useState([]);
  const [facultadesList, setFacultadesList] = useState([]);
  const [carrerasList, setCarrerasList] = useState([]);
  const [asignaturasList, setAsignaturasList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const csvInputRef = useRef(null);

  const fetchEstadisticas = async () => {
    try {
      const [Periodos, Edificios, Facultades, Carreras, Asignaturas, Profesores, Comisiones] = await Promise.all([
        periodoService.contarActivos(),
        edificioService.contarActivos(),
        facultadService.contarActivos(),
        carreraService.contarActivos(),
        asignaturaService.contarActivos(),
        profesorService.contarActivos(),
        comisionService.contarActivos()
      ]);
      return { data: { Periodos, Edificios, Facultades, Carreras, Asignaturas, Profesores, Comisiones }, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  // Re-fetcha todas las listas cuando cambia el filtro de estado
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      const [
        periodosRes, edificiosRes, facultadesRes, carrerasRes, asignaturasRes, profRes, comisionesRes, statsRes
      ] = await Promise.all([
        periodoService.obtenerPeriodos(filtroEstado), edificioService.obtenerEdificios(filtroEstado), facultadService.obtenerFacultades(filtroEstado),
        carreraService.obtenerCarreras(filtroEstado), asignaturaService.obtenerAsignaturas(filtroEstado), profesorService.obtenerProfesores(filtroEstado),
        comisionService.obtenerComisiones(filtroEstado), fetchEstadisticas()
      ]);

      const errors = [periodosRes, edificiosRes, facultadesRes, carrerasRes, asignaturasRes, profRes, comisionesRes, statsRes].map(r => r.error).filter(Boolean);
      if (errors.length > 0) setErrorMessage(errors.join(', '));

      if (periodosRes.data)    setPeriodosList(periodosRes.data);
      if (edificiosRes.data)   setEdificiosList(edificiosRes.data);
      if (facultadesRes.data)  setFacultadesList(facultadesRes.data);
      if (carrerasRes.data)    setCarrerasList(carrerasRes.data);
      if (asignaturasRes.data) setAsignaturasList(asignaturasRes.data);
      if (profRes.data)        setProfesoresList(profRes.data);
      if (comisionesRes.data)  setComisionesList(comisionesRes.data);
      if (statsRes.data)       setEstadisticasReales(statsRes.data);

      setIsLoading(false);
    };
    loadData();
  }, [filtroEstado]); // Se re-ejecuta cuando el usuario cambia el filtro
  
  // ESTADOS PARA MODALES
  const [isPeriodoModalOpen, setIsPeriodoModalOpen] = useState(false);
  const [isEdificioModalOpen, setIsEdificioModalOpen] = useState(false);
  const [isFacultadModalOpen, setIsFacultadModalOpen] = useState(false);
  const [isCarreraModalOpen, setIsCarreraModalOpen] = useState(false);
  const [isAsignaturaModalOpen, setIsAsignaturaModalOpen] = useState(false);
  const [isProfesorModalOpen, setIsProfesorModalOpen] = useState(false);
  const [isComisionModalOpen, setIsComisionModalOpen] = useState(false);
  
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  const [periodoData, setPeriodoData] = useState(null);
  const [edificioData, setEdificioData] = useState(null);
  const [facultadData, setFacultadData] = useState(null);
  const [carreraData, setCarreraData] = useState(null);
  const [asignaturaData, setAsignaturaData] = useState(null);
  const [profesorData, setProfesorData] = useState(null);
  const [comisionData, setComisionData] = useState(null);
  // Único estado para el item seleccionado en edición/borrado
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  // Derivar arrays con shape { id, nombre } que esperan los <select> de los modales
  const edificiosDisponibles = edificiosList.map(e => ({ id: e.id_edificio, nombre: e.nombre }));
  const facultadesDisponibles = facultadesList.map(f => ({ id: f.id_facultad, nombre: f.nombre }));
  const carrerasDisponibles = carrerasList.map(c => ({ id: c.id_carrera, nombre: c.nombre }));
  const profesoresDisponibles = profesoresList.map(p => ({ id: p.id_profesor, nombre: p.nombre, apellido: p.apellido }));
  const asignaturasDisponibles = asignaturasList.map(a => ({ id: a.id_asignatura, nombre: a.nombre }));

  const colores = {
    Periodo: '#ed64a6', 
    Edificios: '#4a5568', Facultades: '#2b6cb0', Carreras: '#805ad5',
    Asignaturas: '#319795', Profesores: '#d69e2e', Comisiones: '#38a169',
  };

  // Cierra todos los modales
  const cerrarTodosLosModales = () => {
    setIsPeriodoModalOpen(false);
    setIsEdificioModalOpen(false);
    setIsFacultadModalOpen(false);
    setIsCarreraModalOpen(false);
    setIsAsignaturaModalOpen(false);
    setIsProfesorModalOpen(false);
    setIsComisionModalOpen(false);
    setEditingTipo(null);
    setItemSeleccionado(null);
  };

  // ── C-02: CREAR COMISIÓN — handler de alta cohesión ─────────────────────────
  // Trazable con el diagrama de secuencia C-02:
  //   paso 1: asignaturaVerificarExistencia  → :Asignatura
  //   paso 2: comisionCrear                 → :Comision
  //   paso 3: profesorAsignar               → :Profesor
  // El componente solo orquesta; la lógica de negocio vive en cada servicio.
  const handleCrearComision = async (datos) => {
    await asignaturaService.verificarExistencia(datos.id_asignatura);                           // paso 1
    const nueva = await comisionService.crear(                                                 // paso 2
      datos.nombre,
      datos.letraDesde ?? datos.letra_desde,
      datos.letraHasta ?? datos.letra_hasta,
      datos.id_asignatura
    );
    await profesorService.asignar(nueva.id_comision, datos.profesores_ids);                    // paso 3
    return nueva;
  };

  const handleSave = async (datos, tipo) => {
    setIsLoading(true);
    setErrorMessage(null);
    let result = { data: null, error: 'Tipo desconocido' };
    const esEdicion = Boolean(editingTipo);

    // Tabla de resolución para entidades genéricas (una función = una responsabilidad)
    // NOTA: 'Comisión' en modo creación se maneja fuera de esta tabla mediante
    // handleCrearComision, que implementa el patrón C-02 de alta cohesión.
    const config = {
      'Periodo':    { id: itemSeleccionado?.id_periodo,    crear: periodoService.crear,    actualizar: periodoService.actualizar,    fetch: periodoService.obtenerPeriodos,    set: setPeriodosList    },
      'Edificio':   { id: itemSeleccionado?.id_edificio,   crear: edificioService.crear,   actualizar: edificioService.actualizar,   fetch: edificioService.obtenerEdificios,   set: setEdificiosList   },
      'Facultad':   { id: itemSeleccionado?.id_facultad,   crear: facultadService.crear,   actualizar: facultadService.actualizar,   fetch: facultadService.obtenerFacultades,  set: setFacultadesList  },
      'Carrera':    { id: itemSeleccionado?.id_carrera,    crear: carreraService.crear,    actualizar: carreraService.actualizar,    fetch: carreraService.obtenerCarreras,    set: setCarrerasList    },
      'Asignatura': { id: itemSeleccionado?.id_asignatura, crear: asignaturaService.crear, actualizar: asignaturaService.actualizar, fetch: asignaturaService.obtenerAsignaturas, set: setAsignaturasList  },
      'Profesor':   { id: itemSeleccionado?.id_profesor,   crear: profesorService.crear,   actualizar: profesorService.actualizar,   fetch: profesorService.obtenerProfesores,  set: setProfesoresList  },
      'Comisión':   { id: itemSeleccionado?.id_comision,                                   actualizar: comisionService.actualizar,   fetch: comisionService.obtenerComisiones,  set: setComisionesList  },
    };

    try {
      const entry = config[tipo];
      if (!entry) throw new Error(`Tipo "${tipo}" no reconocido`);

      if (esEdicion && entry.id) {
        // ── MODO EDICIÓN: delegado al servicio de actualización (igual para todas las entidades) ──
        result = await entry.actualizar(entry.id, datos);
        if (result.error) {
          setErrorMessage(`Error al guardar ${tipo}: ${result.error}`);
          setIsLoading(false);
          return;
        }
      } else if (tipo === 'Comisión') {
        // ── MODO CREACIÓN de Comisión: C-02 — orquesta 3 servicios cohesivos ──
        await handleCrearComision(datos);
        result = { data: true, error: null };
      } else {
        // ── MODO CREACIÓN genérico ──
        result = await entry.crear(datos);
        if (result.error) {
          setErrorMessage(`Error al guardar ${tipo}: ${result.error}`);
          setIsLoading(false);
          return;
        }
      }

      // Éxito: cerrar modal y refrescar
      cerrarTodosLosModales();
      const accionTexto = esEdicion ? 'actualizado' : 'creado';
      setMensajeExito(`¡${tipo} ${accionTexto} con éxito!`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      const [listRes, statsRes] = await Promise.all([entry.fetch(filtroEstado), fetchEstadisticas()]);
      if (listRes.data) entry.set(listRes.data);
      if (statsRes.data) setEstadisticasReales(statsRes.data);

    } catch (err) {
      setErrorMessage(`Error inesperado: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (tipo, item) => {
    const pkMap = {
      'Periodos':    { fn: (id) => periodoService.cambiarEstado(id, true),    pk: item.id_periodo,    fetch: periodoService.obtenerPeriodos,    set: setPeriodosList    },
      'Edificios':   { fn: (id) => edificioService.cambiarEstado(id, true),   pk: item.id_edificio,   fetch: edificioService.obtenerEdificios,   set: setEdificiosList   },
      'Facultades':  { fn: (id) => facultadService.cambiarEstado(id, true),   pk: item.id_facultad,   fetch: facultadService.obtenerFacultades,  set: setFacultadesList  },
      'Carreras':    { fn: (id) => carreraService.cambiarEstado(id, true),    pk: item.id_carrera,    fetch: carreraService.obtenerCarreras,    set: setCarrerasList    },
      'Asignaturas': { fn: (id) => asignaturaService.cambiarEstado(id, true), pk: item.id_asignatura, fetch: asignaturaService.obtenerAsignaturas, set: setAsignaturasList  },
      'Profesores':  { fn: (id) => profesorService.cambiarEstado(id, true),   pk: item.id_profesor,   fetch: profesorService.obtenerProfesores,  set: setProfesoresList  },
      'Comisiones':  { fn: (id) => comisionService.cambiarEstado(id, true),   pk: item.id_comision,   fetch: comisionService.obtenerComisiones,  set: setComisionesList  },
    };
    const entry = pkMap[tipo];
    if (!entry) return;
    setIsLoading(true);
    await entry.fn(entry.pk);
    const [listRes, statsRes] = await Promise.all([entry.fetch('Todos'), fetchEstadisticas()]);
    if (listRes.data) entry.set(listRes.data);
    if (statsRes.data) setEstadisticasReales(statsRes.data);
    setIsLoading(false);
  };

  const handleDelete = async (tipo) => {
    const pkMap = {
      'Periodo':    { fn: (id) => periodoService.cambiarEstado(id, false),    pk: itemSeleccionado?.id_periodo,    fetch: periodoService.obtenerPeriodos,    set: setPeriodosList    },
      'Edificio':   { fn: (id) => edificioService.cambiarEstado(id, false),   pk: itemSeleccionado?.id_edificio,   fetch: edificioService.obtenerEdificios,   set: setEdificiosList   },
      'Facultad':   { fn: (id) => facultadService.cambiarEstado(id, false),   pk: itemSeleccionado?.id_facultad,   fetch: facultadService.obtenerFacultades,  set: setFacultadesList  },
      'Carrera':    { fn: (id) => carreraService.cambiarEstado(id, false),    pk: itemSeleccionado?.id_carrera,    fetch: carreraService.obtenerCarreras,    set: setCarrerasList    },
      'Asignatura': { fn: (id) => asignaturaService.cambiarEstado(id, false), pk: itemSeleccionado?.id_asignatura, fetch: asignaturaService.obtenerAsignaturas, set: setAsignaturasList  },
      'Profesor':   { fn: (id) => profesorService.cambiarEstado(id, false),   pk: itemSeleccionado?.id_profesor,   fetch: profesorService.obtenerProfesores,  set: setProfesoresList  },
      'Comisión':   { fn: (id) => comisionService.cambiarEstado(id, false),   pk: itemSeleccionado?.id_comision,   fetch: comisionService.obtenerComisiones,  set: setComisionesList  },
    };

    const entry = pkMap[tipo];
    if (!entry) return;

    const id = entry.pk;
    if (!id) {
      setErrorMessage(`No se encontró el ID del registro a eliminar.`);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await entry.fn(id);

    if (error) {
      setErrorMessage(`Error al desactivar ${tipo}: ${error}`);
      setIsLoading(false);
      return;
    }

    cerrarTodosLosModales();
    setMensajeExito(`¡${tipo} eliminado con éxito!`);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);

    const [listRes, statsRes] = await Promise.all([entry.fetch('Todos'), fetchEstadisticas()]);
    if (listRes.data) entry.set(listRes.data);
    if (statsRes.data) setEstadisticasReales(statsRes.data);

    setIsLoading(false);
  };

  // ── C-03: IMPORTAR DATOS MASIVAMENTE ─────────────────────────────────────────
  // Cadena trazable con el diagrama de secuencia:
  // validarFormatoArchivo → parsearCSV → validarEsquema → detectarDuplicados
  // → detectarIncompletos → detectarFormatosInvalidos → importarEstructuraAcademica
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Paso 1 — Validar formato del archivo (extensión .csv)
      if (!validarFormatoArchivo(file)) {
        setErrorMessage('El archivo seleccionado es inválido');
        setIsLoading(false);
        event.target.value = null;
        return;
      }

      // Paso 2 — Parsear el CSV en un array de filas
      const filas = await parsearCSV(file);

      // Paso 3 — Validar esquema (columnas requeridas)
      const erroresEsquema = validarEsquema(filas);
      if (erroresEsquema.length > 0) {
        setErrorMessage(erroresEsquema[0]);
        setIsLoading(false);
        event.target.value = null;
        return;
      }

      // Paso 4 — Detectar duplicados dentro del CSV
      const erroresDuplicados = detectarDuplicados(filas);
      if (erroresDuplicados.length > 0) {
        setErrorMessage(erroresDuplicados.join(' | '));
        setIsLoading(false);
        event.target.value = null;
        return;
      }

      // Paso 5 — Detectar campos incompletos
      const erroresIncompletos = detectarIncompletos(filas);
      if (erroresIncompletos.length > 0) {
        setErrorMessage(erroresIncompletos[0]);
        setIsLoading(false);
        event.target.value = null;
        return;
      }

      // Paso 6 — Detectar formatos inválidos (fechas, documento, letras)
      const erroresFormato = detectarFormatosInvalidos(filas);
      if (erroresFormato.length > 0) {
        setErrorMessage(erroresFormato[0]);
        setIsLoading(false);
        event.target.value = null;
        return;
      }

      // C-03: pasos 7-13 — inserción por objeto del dominio (trazable con el diagrama de secuencia)
      // Cada paso tiene su propio try/catch para identificar exactamente dónde falla la importación.
      try { await edificioService.insertar(filas); }   // paso 7  — :Edificio
      catch (e) { throw new Error(`Error al importar edificios: ${e.message}`); }

      try { await facultadService.insertar(filas); }   // paso 8  — :Facultad
      catch (e) { throw new Error(`Error al importar facultades: ${e.message}`); }

      try { await carreraService.insertar(filas); }    // paso 9  — :Carrera
      catch (e) { throw new Error(`Error al importar carreras: ${e.message}`); }

      try { await periodoService.insertar(filas); }    // paso 10 — :Periodo
      catch (e) { throw new Error(`Error al importar periodos: ${e.message}`); }

      try { await asignaturaService.insertar(filas); } // paso 11 — :Asignatura
      catch (e) { throw new Error(`Error al importar asignaturas: ${e.message}`); }

      try { await profesorService.insertar(filas); }   // paso 12 — :Profesor
      catch (e) { throw new Error(`Error al importar profesores: ${e.message}`); }

      try { await comisionService.insertar(filas); }   // paso 13 — :Comision
      catch (e) { throw new Error(`Error al importar comisiones: ${e.message}`); }

      // Éxito — mensaje exacto del caso de uso C-03
      setMensajeExito('Archivo importado con éxito');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);

      // Refrescar todas las listas después de la importación
      const [
        periodosRes, edificiosRes, facultadesRes, carrerasRes, asignaturasRes, profRes, comisionesRes, statsRes
      ] = await Promise.all([
        periodoService.obtenerPeriodos(filtroEstado), edificioService.obtenerEdificios(filtroEstado), facultadService.obtenerFacultades(filtroEstado),
        carreraService.obtenerCarreras(filtroEstado), asignaturaService.obtenerAsignaturas(filtroEstado), profesorService.obtenerProfesores(filtroEstado),
        comisionService.obtenerComisiones(filtroEstado), fetchEstadisticas()
      ]);

      if (periodosRes.data)    setPeriodosList(periodosRes.data);
      if (edificiosRes.data)   setEdificiosList(edificiosRes.data);
      if (facultadesRes.data)  setFacultadesList(facultadesRes.data);
      if (carrerasRes.data)    setCarrerasList(carrerasRes.data);
      if (asignaturasRes.data) setAsignaturasList(asignaturasRes.data);
      if (profRes.data)        setProfesoresList(profRes.data);
      if (comisionesRes.data)  setComisionesList(comisionesRes.data);
      if (statsRes.data)       setEstadisticasReales(statsRes.data);

    } catch (err) {
      // Error inesperado (red, Supabase, etc.)
      setErrorMessage('Error en la importación de datos');
      console.error('Error inesperado en handleFileUpload:', err);
    } finally {
      setIsLoading(false);
      event.target.value = null; // resetear el input para permitir re-selección
    }
  };



  const exportarDatosCSV = () => {
    let listaActual = [];
    switch (entidadActiva) {
      case 'Periodos': listaActual = periodosList; break;
      case 'Edificios': listaActual = edificiosList; break;
      case 'Facultades': listaActual = facultadesList; break;
      case 'Carreras': listaActual = carrerasList; break;
      case 'Asignaturas': listaActual = asignaturasList; break;
      case 'Profesores': listaActual = profesoresList; break;
      case 'Comisiones': listaActual = comisionesList; break;
      default: break;
    }
    
    if (listaActual.length === 0) {
      alert(`No hay datos para exportar en ${entidadActiva}`);
      return;
    }

    descargarCSV(`exportacion_${entidadActiva.toLowerCase()}.csv`, listaActual);
  };

  const handleEdit = (tipo, item) => {
    setItemSeleccionado(item);
    setEditingTipo(tipo);
    if (tipo === 'Periodos')    setIsPeriodoModalOpen(true);
    if (tipo === 'Edificios')   setIsEdificioModalOpen(true);
    if (tipo === 'Facultades')  setIsFacultadModalOpen(true);
    if (tipo === 'Carreras')    setIsCarreraModalOpen(true);
    if (tipo === 'Asignaturas') setIsAsignaturaModalOpen(true);
    if (tipo === 'Profesores')  setIsProfesorModalOpen(true);
    if (tipo === 'Comisiones')  setIsComisionModalOpen(true);
  };

  const StatCard = ({ titulo, cantidad, color, onAdd, onClickCard }) => (
    <div
      onClick={onClickCard}
      style={{ flex: 1, minWidth: '180px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${color}`, position: 'relative', cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,0.12)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'; }}
    >
      <p style={{ margin: 0, color: '#718096', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>{titulo}</p>
      <p style={{ margin: '8px 0 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#2d3748' }}>{cantidad}</p>
      <button
        title="Agregar nuevo registro"
        onClick={e => { e.stopPropagation(); onAdd(); }}
        style={{ position: 'absolute', right: '15px', bottom: '15px', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: color, color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s ease, filter 0.2s ease' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.filter = 'brightness(0.88)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'brightness(1)'; }}
      >+</button>
    </div>
  );

  const cellStyle = { padding: '15px', color: '#4a5568', fontSize: '0.9rem', textAlign: 'center'};
  const headerStyle = { padding: '15px', color: '#4a5568', fontWeight: '600', textAlign: 'center'};
  
  const renderHeaders = () => {
    switch (entidadActiva) {
      case 'Periodos': return (<><th style={headerStyle}>ID</th><th style={headerStyle}>Nombre</th><th style={headerStyle}>Fecha Inicio</th><th style={headerStyle}>Fecha Fin</th></>);
      case 'Edificios': return (<><th style={headerStyle}>ID</th><th style={headerStyle}>Nombre</th><th style={headerStyle}>Dirección</th><th style={headerStyle}>Ciudad</th></>);
      case 'Facultades': return (<><th style={headerStyle}>ID</th><th style={headerStyle}>Nombre</th><th style={headerStyle}>Ciudad</th><th style={headerStyle}>Edificio Asociado</th><th style={headerStyle}>Carreras</th></>);
      case 'Carreras': return (<><th style={headerStyle}>ID</th><th style={headerStyle}>Nombre</th><th style={headerStyle}>Facultad</th><th style={headerStyle}>Asignaturas</th></>);
      case 'Asignaturas': return (<><th style={headerStyle}>ID</th><th style={headerStyle}>Nombre</th><th style={headerStyle}>Año</th><th style={headerStyle}>Periodo</th><th style={headerStyle}>Carrera</th></>);
      case 'Profesores': return (<><th style={headerStyle}>ID</th><th style={headerStyle}>Nombre</th><th style={headerStyle}>Apellido</th><th style={headerStyle}>Documento</th><th style={headerStyle}>Correo</th><th style={headerStyle}>Telefono</th><th style={headerStyle}>Estado</th><th style={headerStyle}>Asignaciones</th></>);
      case 'Comisiones': return (<><th style={headerStyle}>ID</th><th style={headerStyle}>Nombre</th><th style={headerStyle}>Letras</th><th style={headerStyle}>Asignatura</th><th style={headerStyle}>Facultad</th><th style={headerStyle}>Profesores</th><th style={headerStyle}>Inscriptos</th></>);
      default: return null;
    }
  };

  const ActionsCell = ({ tipo, item, estadoRegistro }) => (
    <td style={{ padding: '10px' }}>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
        {estadoRegistro === false ? (
          <button
            onClick={() => handleRestore(tipo, item)}
            style={{ padding: '4px 12px', backgroundColor: '#c6f6d5', color: '#276749', border: '1px solid #9ae6b4', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
          >♻️ Restaurar</button>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button onClick={() => handleEdit(tipo, item)} style={{ padding: '4px 10px', backgroundColor: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', width: '85px' }}>Editar</button>
            </div>
          </>
        )}
      </div>
    </td>
  );

  const aplicarFiltro = (lista) => {
    let filtrada = lista;
    if (filtroEstado === 'Activos') filtrada = lista.filter(i => i.estado !== false);
    else if (filtroEstado === 'Inactivos') filtrada = lista.filter(i => i.estado === false);
    
    if (!terminoBusqueda.trim()) return filtrada;
    const t = terminoBusqueda.toLowerCase();
    return filtrada.filter(item =>
      Object.values(item).some(v => String(v).toLowerCase().includes(t))
    );
  };

  const renderRows = () => {
    if (isLoading) {
      return <tr><td colSpan={7} style={{textAlign:'center', padding:'20px'}}>Cargando datos reales...</td></tr>;
    }

    const rowStyle = { borderBottom: '1px solid #e2e8f0' };
    switch (entidadActiva) {
      case 'Periodos': {
        const lista = aplicarFiltro(periodosList);
        if (lista.length === 0) return (<tr style={rowStyle}><td colSpan={5} style={{...cellStyle, padding:'20px'}}>Sin registros</td></tr>);
        return lista.map(p => (<tr className="table-row-hover" key={p.id_periodo} style={rowStyle}><td style={cellStyle}>{p.id_periodo}</td><td style={{...cellStyle, fontWeight:'600'}}>{p.nombre}</td><td style={cellStyle}>{p.fecha_inicio}</td><td style={cellStyle}>{p.fecha_fin}</td><ActionsCell tipo="Periodos" item={p} estadoRegistro={p.estado} /></tr>));
      }
      case 'Edificios': {
        const lista = aplicarFiltro(edificiosList);
        if (lista.length === 0) return (<tr style={rowStyle}><td colSpan={5} style={{...cellStyle, padding:'20px'}}>Sin registros</td></tr>);
        return lista.map(e => (<tr className="table-row-hover" key={e.id_edificio} style={rowStyle}><td style={cellStyle}>{e.id_edificio}</td><td style={{...cellStyle, fontWeight:'600'}}>{e.nombre}</td><td style={cellStyle}>{e.direccion}</td><td style={cellStyle}>-</td><ActionsCell tipo="Edificios" item={e} estadoRegistro={e.estado} /></tr>));
      }
      case 'Facultades': {
        const lista = aplicarFiltro(facultadesList);
        if (lista.length === 0) return (<tr style={rowStyle}><td colSpan={5} style={{...cellStyle, padding:'20px'}}>Sin registros</td></tr>);
        return lista.map(f => (<tr className="table-row-hover" key={f.id_facultad} style={rowStyle}><td style={cellStyle}>{f.id_facultad}</td><td style={{...cellStyle, fontWeight:'600'}}>{f.nombre}</td><td style={cellStyle}>{f.ciudad}</td><td style={cellStyle}>{f.nombreEdificio}</td><td style={cellStyle}><button style={{ padding: '4px 12px', backgroundColor: '#ebf8ff', color: '#2b6cb0', border: '1px solid #90cdf4', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>Ver Carreras</button></td><ActionsCell tipo="Facultades" item={f} estadoRegistro={f.estado} /></tr>));
      }
      case 'Carreras': {
        const lista = aplicarFiltro(carrerasList);
        if (lista.length === 0) return (<tr style={rowStyle}><td colSpan={5} style={{...cellStyle, padding:'20px'}}>Sin registros</td></tr>);
        return lista.map(c => (<tr className="table-row-hover" key={c.id_carrera} style={rowStyle}><td style={cellStyle}>{c.id_carrera}</td><td style={{...cellStyle, fontWeight:'600'}}>{c.nombre}</td><td style={cellStyle}>{c.nombreFacultad}</td><td style={cellStyle}>-</td><ActionsCell tipo="Carreras" item={c} estadoRegistro={c.estado} /></tr>));
      }
      case 'Asignaturas': {
        const lista = aplicarFiltro(asignaturasList);
        if (lista.length === 0) return (<tr style={rowStyle}><td colSpan={7} style={{...cellStyle, padding:'20px'}}>Sin registros</td></tr>);
        return lista.map(a => (<tr className="table-row-hover" key={a.id_asignatura} style={rowStyle}><td style={cellStyle}>{a.id_asignatura}</td><td style={{...cellStyle, fontWeight:'600'}}>{a.nombre}</td><td style={cellStyle}>{a.anio_dictado}</td><td style={cellStyle}>{a.nombrePeriodo}</td><td style={cellStyle}>{a.nombreCarrera}</td><ActionsCell tipo="Asignaturas" item={a} estadoRegistro={a.estado} /></tr>));
      }
      case 'Profesores': {
        const lista = aplicarFiltro(profesoresList);
        if (lista.length === 0) return (<tr style={rowStyle}><td colSpan={9} style={{...cellStyle, padding:'20px'}}>Sin registros</td></tr>);
        return lista.map(prof => (<tr className="table-row-hover" key={prof.id_profesor} style={rowStyle}><td style={cellStyle}>{prof.id_profesor}</td><td style={cellStyle}>{prof.nombre}</td><td style={{...cellStyle, fontWeight:'600'}}>{prof.apellido}</td><td style={cellStyle}>{prof.documento}</td><td style={cellStyle}>{prof.correo}</td><td style={cellStyle}>-</td><td style={cellStyle}><span style={{padding:'2px 8px', backgroundColor: prof.estado ? '#c6f6d5' : '#fed7d7', color: prof.estado ? '#22543d' : '#9b2c2c', borderRadius:'10px', fontSize:'0.75rem', fontWeight:'700'}}>{prof.estado ? 'Activo' : 'Inactivo'}</span></td><td style={{...cellStyle, fontWeight:'700', color:'#2b6cb0'}}>{prof.totalAsignaciones || 0}</td><ActionsCell tipo="Profesores" item={prof} estadoRegistro={prof.estado} /></tr>));
      }
      case 'Comisiones': {
        const lista = aplicarFiltro(comisionesList);
        if (lista.length === 0) return (<tr style={rowStyle}><td colSpan={8} style={{...cellStyle, padding:'20px'}}>Sin registros</td></tr>);
        return lista.map(com => {
          const profesoresStr = Array.isArray(com.profesoresNombresArray) ? com.profesoresNombresArray.join(', ') : (com.profesoresNombresArray || 'Sin Asignar');
          return (<tr className="table-row-hover" key={com.id_comision} style={rowStyle}><td style={cellStyle}>{com.id_comision}</td><td style={{...cellStyle, fontWeight:'600'}}>{com.nombreComision}</td><td style={cellStyle}>{com.letraDesde} - {com.letraHasta}</td><td style={cellStyle}>{com.nombreAsignatura}</td><td style={cellStyle}>{com.nombreFacultad}</td><td style={cellStyle}>{profesoresStr}</td><td style={{...cellStyle, fontWeight:'700', color:'#2b6cb0'}}>0</td><ActionsCell tipo="Comisiones" item={com} estadoRegistro={com.estado} /></tr>);
        });
      }
      default: return (<tr><td colSpan={7} style={{textAlign:'center', padding:'20px'}}>Seleccione una entidad para ver datos.</td></tr>);
    }
  };

  const currentActiveColor = entidadActiva === 'Periodos' ? colores.Periodo : (colores[entidadActiva] || '#3182ce');

  const formatearProfesores = (asignatura) => {
    const profesoresSet = new Map();
    (asignatura.comision || []).forEach(com =>
      (com.comision_profesor || []).forEach(cp => {
        const prof = cp.profesor;
        if (prof) profesoresSet.set(prof.nombre + prof.apellido, prof);
      })
    );
    return profesoresSet.size > 0
      ? [...profesoresSet.values()]
          .map(p => `${p.apellido}, ${p.nombre}`).join(' | ')
      : 'Sin Asignar';
  };

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        .table-row-hover {
          transition: all 0.2s ease;
        }
        .table-row-hover:hover {
          background-color: ${currentActiveColor}11;
          box-shadow: inset 0 2px 4px ${currentActiveColor}1A, inset 0 -2px 4px ${currentActiveColor}1A;
          transform: translateY(-1px);
        }
      `}</style>
      {showSuccessMessage && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#38a169', color: 'white', padding: '12px 24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2000 }}>
          <span>✅</span><span style={{ fontWeight: '600' }}>{mensajeExito}</span>
        </div>
      )}

      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '20px', color: '#2d3748' }}>Gestión de Estructura Académica</h1>

      {errorMessage && (
        <div style={{ backgroundColor: '#fed7d7', color: '#c53030', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #e53e3e' }}>
          <strong>Error cargando los datos: </strong>{errorMessage}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard titulo="Periodo" cantidad={estadisticasReales.Periodos ?? '0'} color={colores.Periodo} onAdd={() => { setEditingTipo(null); setIsPeriodoModalOpen(true); }} onClickCard={() => setEntidadActiva('Periodos')} />
        <StatCard titulo="Edificios" cantidad={estadisticasReales.Edificios ?? '0'} color={colores.Edificios} onAdd={() => { setEditingTipo(null); setIsEdificioModalOpen(true); }} onClickCard={() => setEntidadActiva('Edificios')} />
        <StatCard titulo="Facultades" cantidad={estadisticasReales.Facultades ?? '0'} color={colores.Facultades} onAdd={() => { setEditingTipo(null); setIsFacultadModalOpen(true); }} onClickCard={() => setEntidadActiva('Facultades')} />
        <StatCard titulo="Carreras" cantidad={estadisticasReales.Carreras ?? '0'} color={colores.Carreras} onAdd={() => { setEditingTipo(null); setIsCarreraModalOpen(true); }} onClickCard={() => setEntidadActiva('Carreras')} />
        <StatCard titulo="Asignaturas" cantidad={estadisticasReales.Asignaturas ?? '0'} color={colores.Asignaturas} onAdd={() => { setEditingTipo(null); setIsAsignaturaModalOpen(true); }} onClickCard={() => setEntidadActiva('Asignaturas')} />
        <StatCard titulo="Profesores" cantidad={estadisticasReales.Profesores ?? '0'} color={colores.Profesores} onAdd={() => { setEditingTipo(null); setIsProfesorModalOpen(true); }} onClickCard={() => setEntidadActiva('Profesores')} />
        <StatCard titulo="Comisiones" cantidad={estadisticasReales.Comisiones ?? '0'} color={colores.Comisiones} onAdd={() => { setEditingTipo(null); setIsComisionModalOpen(true); }} onClickCard={() => setEntidadActiva('Comisiones')} />
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px', backgroundColor: '#ffffff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="file"
            accept=".csv"
            hidden
            id="csvFileInput"
            ref={csvInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => csvInputRef.current?.click()}
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #3182ce', backgroundColor: 'transparent', color: '#3182ce', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            📥 Importar CSV
          </button>
          <button onClick={exportarDatosCSV} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #38a169', backgroundColor: 'transparent', color: '#38a169', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>📤 Exportar CSV</button>
          <button onClick={descargarPlantillaCSV} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #718096', backgroundColor: 'transparent', color: '#718096', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>📄 Descargar Plantilla</button>
        </div>
        <div style={{ flex: 1 }} />
        <input
          type="text"
          placeholder="🔍 Buscar en tabla..."
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#2d3748', fontSize: '0.9rem', minWidth: '220px', outline: 'none' }}
        />
        <select
          value={filtroEstado}
          onChange={(e) => { setFiltroEstado(e.target.value); setTerminoBusqueda(''); }}
          style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#2d3748', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}
        >
          <option value="Activos">✅ Activos</option>
          <option value="Inactivos">🔴 Inactivos</option>
          <option value="Todos">📋 Todos</option>
        </select>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden', borderLeft: `4px solid ${currentActiveColor}`, transition: 'border-color 0.3s ease' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ backgroundColor: `${currentActiveColor}1A`, borderBottom: '2px solid #e2e8f0', transition: 'background-color 0.3s ease' }}>{renderHeaders()}<th style={headerStyle}>Acciones</th></tr></thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>

      <AddPeriodoModal    isOpen={isPeriodoModalOpen}    onClose={() => setIsPeriodoModalOpen(false)}    onSave={(d) => handleSave(d, 'Periodo')}    initialData={editingTipo === 'Periodos'    ? itemSeleccionado : null} isEditMode={editingTipo === 'Periodos'}    onDelete={() => handleDelete('Periodo')}    isSaving={isLoading} />
      <AddEdificioModal   isOpen={isEdificioModalOpen}   onClose={() => setIsEdificioModalOpen(false)}   onSave={(d) => handleSave(d, 'Edificio')}   initialData={editingTipo === 'Edificios'   ? itemSeleccionado : null} isEditMode={editingTipo === 'Edificios'}   onDelete={() => handleDelete('Edificio')}   isSaving={isLoading} />
      <AddFacultadModal   isOpen={isFacultadModalOpen}   onClose={() => setIsFacultadModalOpen(false)}   onSave={(d) => handleSave(d, 'Facultad')}   edificiosDisponibles={edificiosDisponibles} initialData={editingTipo === 'Facultades'   ? itemSeleccionado : null} isEditMode={editingTipo === 'Facultades'}   onDelete={() => handleDelete('Facultad')}   isSaving={isLoading} />
      <AddCarreraModal    isOpen={isCarreraModalOpen}    onClose={() => setIsCarreraModalOpen(false)}    onSave={(d) => handleSave(d, 'Carrera')}    facultadesDisponibles={facultadesDisponibles} initialData={editingTipo === 'Carreras'    ? itemSeleccionado : null} isEditMode={editingTipo === 'Carreras'}    onDelete={() => handleDelete('Carrera')}    isSaving={isLoading} />
      <AddAsignaturaModal isOpen={isAsignaturaModalOpen} onClose={() => setIsAsignaturaModalOpen(false)} onSave={(d) => handleSave(d, 'Asignatura')} carrerasDisponibles={carrerasDisponibles} profesoresDisponibles={profesoresDisponibles} periodosDisponibles={periodosList} initialData={editingTipo === 'Asignaturas' ? itemSeleccionado : null} isEditMode={editingTipo === 'Asignaturas'} onDelete={() => handleDelete('Asignatura')} isSaving={isLoading} />
      <AddProfesorModal   isOpen={isProfesorModalOpen}   onClose={() => setIsProfesorModalOpen(false)}   onSave={(d) => handleSave(d, 'Profesor')}   initialData={editingTipo === 'Profesores'   ? itemSeleccionado : null} isEditMode={editingTipo === 'Profesores'}   onDelete={() => handleDelete('Profesor')}   isSaving={isLoading} />
      <AddComisionModal
        isOpen={isComisionModalOpen}
        onClose={() => setIsComisionModalOpen(false)}
        onSave={(d) => handleSave(d, 'Comisión')}
        profesoresDisponibles={profesoresDisponibles}
        asignaturasDisponibles={asignaturasDisponibles}
        initialData={editingTipo === 'Comisiones' ? itemSeleccionado : null}
        isEditMode={editingTipo === 'Comisiones'}
        onDelete={() => handleDelete('Comisión')}
        isSaving={isLoading}
      />
    </div>
  );
};

export default EstructuraPage;