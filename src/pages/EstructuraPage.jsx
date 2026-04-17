"use client";
import React, { useState, useEffect } from 'react';
import { fetchPeriodos, fetchEdificios, fetchFacultades, fetchCarreras, fetchAsignaturas, fetchProfesores, fetchComisiones, fetchEstadisticas } from '../services/estructuraService';
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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      const [
        periodosRes, edificiosRes, facultadesRes, carrerasRes, asignaturasRes, profRes, comisionesRes, statsRes
      ] = await Promise.all([
        fetchPeriodos(), fetchEdificios(), fetchFacultades(), fetchCarreras(), fetchAsignaturas(), fetchProfesores(), fetchComisiones(), fetchEstadisticas()
      ]);
      
      const errors = [periodosRes, edificiosRes, facultadesRes, carrerasRes, asignaturasRes, profRes, comisionesRes, statsRes].map(r => r.error).filter(Boolean);
      if (errors.length > 0) {
        setErrorMessage(errors.join(', '));
      }
      
      if (periodosRes.data) setPeriodosList(periodosRes.data);
      if (edificiosRes.data) setEdificiosList(edificiosRes.data);
      if (facultadesRes.data) setFacultadesList(facultadesRes.data);
      if (carrerasRes.data) setCarrerasList(carrerasRes.data);
      if (asignaturasRes.data) setAsignaturasList(asignaturasRes.data);
      if (profRes.data) setProfesoresList(profRes.data);
      if (comisionesRes.data) setComisionesList(comisionesRes.data);
      if (statsRes.data) setEstadisticasReales(statsRes.data);
      
      setIsLoading(false);
    };
    
    loadData();
  }, []);
  
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

  // DATOS ESTÁTICOS LIMPIOS
  const edificiosDisponibles = [];
  const facultadesDisponibles = [];
  const carrerasDisponibles = [];
  const profesoresDisponibles = [];
  const asignaturasDisponibles = [];

  const colores = {
    Periodo: '#ed64a6', 
    Edificios: '#4a5568', Facultades: '#2b6cb0', Carreras: '#805ad5',
    Asignaturas: '#319795', Profesores: '#d69e2e', Comisiones: '#38a169',
  };

  const handleSave = (datos, tipo) => {
    if (tipo === 'Periodo') setPeriodoData(datos);
    if (tipo === 'Edificio') setEdificioData(datos);
    if (tipo === 'Facultad') setFacultadData(datos);
    if (tipo === 'Carrera') setCarreraData(datos);
    if (tipo === 'Asignatura') setAsignaturaData(datos);
    if (tipo === 'Profesor') setProfesorData(datos);
    if (tipo === 'Comisión') setComisionData(datos);

    setIsPeriodoModalOpen(false);
    setIsEdificioModalOpen(false); 
    setIsFacultadModalOpen(false); 
    setIsCarreraModalOpen(false);
    setIsAsignaturaModalOpen(false);
    setIsProfesorModalOpen(false);
    setIsComisionModalOpen(false);
    setEditingTipo(null);
    setMensajeExito(`¡${tipo} agregado con éxito!`);
    setShowSuccessMessage(true);   
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleDelete = (tipo) => {
    if (tipo === 'Periodo') setPeriodoData(null);
    if (tipo === 'Edificio') setEdificioData(null);
    if (tipo === 'Facultad') setFacultadData(null);
    if (tipo === 'Carrera') setCarreraData(null);
    if (tipo === 'Asignatura') setAsignaturaData(null);
    if (tipo === 'Profesor') setProfesorData(null);
    if (tipo === 'Comisión') setComisionData(null);

    setIsPeriodoModalOpen(false);
    setIsEdificioModalOpen(false); 
    setIsFacultadModalOpen(false); 
    setIsCarreraModalOpen(false);
    setIsAsignaturaModalOpen(false);
    setIsProfesorModalOpen(false);
    setIsComisionModalOpen(false);
    setEditingTipo(null);
    setMensajeExito(`¡${tipo} eliminado con éxito!`);
    setShowSuccessMessage(true);   
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleEdit = (tipo) => {
    setEditingTipo(tipo);
    if (tipo === 'Periodos') setIsPeriodoModalOpen(true);
    if (tipo === 'Edificios') setIsEdificioModalOpen(true);
    if (tipo === 'Facultades') setIsFacultadModalOpen(true);
    if (tipo === 'Carreras') setIsCarreraModalOpen(true);
    if (tipo === 'Asignaturas') setIsAsignaturaModalOpen(true);
    if (tipo === 'Profesores') setIsProfesorModalOpen(true);
    if (tipo === 'Comisiones') setIsComisionModalOpen(true);
  };

  const StatCard = ({ titulo, cantidad, color, onAdd }) => (
    <div style={{ flex: 1, minWidth: '180px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${color}`, position: 'relative' }}>
      <p style={{ margin: 0, color: '#718096', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>{titulo}</p>
      <p style={{ margin: '8px 0 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#2d3748' }}>{cantidad}</p>
      <button onClick={onAdd} style={{ position: 'absolute', right: '15px', bottom: '15px', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: color, color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
    </div>
  );

  const cellStyle = { padding: '15px', color: '#4a5568', fontSize: '0.9rem', textAlign: 'center'};
  const headerStyle = { padding: '15px', color: '#4a5568', fontWeight: '600', textAlign: 'center'};
  
  const renderHeaders = () => {
    switch (entidadActiva) {
      case 'Periodos': return (<><th style={headerStyle}>ID</th><th style={headerStyle}>Nombre</th><th style={headerStyle}>Fecha Inicio</th><th style={headerStyle}>Fecha Fin</th></>);
      case 'Edificios': return (<><th style={headerStyle}>ID</th><th style={headerStyle}>Nombre</th><th style={headerStyle}>Dirección</th><th style={headerStyle}>Ciudad</th></>);
      case 'Facultades': return (<><th style={headerStyle}>ID</th><th style={headerStyle}>Nombre</th><th style={headerStyle}>Edificios</th><th style={headerStyle}>Carreras</th></>);
      case 'Carreras': return (<><th style={headerStyle}>ID</th><th style={headerStyle}>Nombre</th><th style={headerStyle}>Facultad</th><th style={headerStyle}>Asignaturas</th></>);
      case 'Asignaturas': return (<><th style={headerStyle}>ID</th><th style={headerStyle}>Nombre</th><th style={headerStyle}>Año</th><th style={headerStyle}>Periodo</th><th style={headerStyle}>Facultad</th></>);
      case 'Profesores': return (<><th style={headerStyle}>ID</th><th style={headerStyle}>Nombre</th><th style={headerStyle}>Apellido</th><th style={headerStyle}>Documento</th><th style={headerStyle}>Correo</th><th style={headerStyle}>Telefono</th><th style={headerStyle}>Estado</th><th style={headerStyle}>Asignaturas</th></>);
      case 'Comisiones': return (<><th style={headerStyle}>ID</th><th style={headerStyle}>Nombre</th><th style={headerStyle}>Letras</th><th style={headerStyle}>Asignatura</th><th style={headerStyle}>Facultad</th><th style={headerStyle}>Profesores</th><th style={headerStyle}>Inscriptos</th></>);
      default: return null;
    }
  };

  const ActionsCell = ({ tipo }) => (
    <td style={{ padding: '10px' }}>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button onClick={() => handleEdit(tipo)} style={{ padding: '4px 10px', backgroundColor: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', width: '85px' }}>Editar</button>
          <button style={{ padding: '4px 10px', backgroundColor: '#ebf8ff', color: '#2b6cb0', border: '1px solid #bee3f8', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', width: '85px' }}>Ver lista</button>
        </div>
        {tipo === 'Comisiones' && <button style={{ width: '35px', backgroundColor: '#f0fff4', color: '#2f855a', border: '1px solid #c6f6d5', borderRadius: '6px', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>}
      </div>
    </td>
  );

  const renderRows = () => {
    if (isLoading) {
      return <tr><td colSpan={7} style={{textAlign:'center', padding:'20px'}}>Cargando datos reales...</td></tr>;
    }

    const rowStyle = { borderBottom: '1px solid #e2e8f0' };
    switch (entidadActiva) {
      case 'Periodos':
        if (periodosList.length === 0) return (<tr style={rowStyle}><td colSpan={5} style={{...cellStyle, padding:'20px'}}>Sin registros</td></tr>);
        return periodosList.map(p => (
          <tr key={p.id_periodo} style={rowStyle}>
            <td style={cellStyle}>{p.id_periodo}</td>
            <td style={{...cellStyle, fontWeight:'600'}}>{p.nombre}</td>
            <td style={cellStyle}>{p.fecha_inicio}</td>
            <td style={cellStyle}>{p.fecha_fin}</td>
            <ActionsCell tipo="Periodos" />
          </tr>
        ));
      case 'Edificios':
        if (edificiosList.length === 0) return (<tr style={rowStyle}><td colSpan={5} style={{...cellStyle, padding:'20px'}}>Sin registros</td></tr>);
        return edificiosList.map(e => (
          <tr key={e.id_edificio} style={rowStyle}>
            <td style={cellStyle}>{e.id_edificio}</td>
            <td style={{...cellStyle, fontWeight:'600'}}>{e.nombre}</td>
            <td style={cellStyle}>{e.direccion}</td>
            <td style={cellStyle}>-</td>
            <ActionsCell tipo="Edificios" />
          </tr>
        ));
      case 'Facultades':
        if (facultadesList.length === 0) return (<tr style={rowStyle}><td colSpan={5} style={{...cellStyle, padding:'20px'}}>Sin registros</td></tr>);
        return facultadesList.map(f => (
          <tr key={f.id_facultad} style={rowStyle}>
            <td style={cellStyle}>{f.id_facultad}</td>
            <td style={{...cellStyle, fontWeight:'600'}}>{f.nombre}</td>
            <td style={cellStyle}>{f.ciudad}</td>
            <td style={cellStyle}>{f.nombreEdificio}</td>
            <ActionsCell tipo="Facultades" />
          </tr>
        ));
      case 'Carreras':
        if (carrerasList.length === 0) return (<tr style={rowStyle}><td colSpan={5} style={{...cellStyle, padding:'20px'}}>Sin registros</td></tr>);
        return carrerasList.map(c => (
          <tr key={c.id_carrera} style={rowStyle}>
            <td style={cellStyle}>{c.id_carrera}</td>
            <td style={{...cellStyle, fontWeight:'600'}}>{c.nombre}</td>
            <td style={cellStyle}>{c.nombreFacultad}</td>
            <td style={cellStyle}>-</td>
            <ActionsCell tipo="Carreras" />
          </tr>
        ));
      case 'Asignaturas': 
        if (asignaturasList.length === 0) return (<tr style={rowStyle}><td colSpan={6} style={{...cellStyle, padding:'20px'}}>Sin registros</td></tr>);
        return asignaturasList.map(a => (
          <tr key={a.id_asignatura} style={rowStyle}>
            <td style={cellStyle}>{a.id_asignatura}</td>
            <td style={{...cellStyle, fontWeight:'600'}}>{a.nombre}</td>
            <td style={cellStyle}>{a.anio_dictado}</td>
            <td style={cellStyle}>{a.nombrePeriodo}</td>
            <td style={cellStyle}>{a.nombreFacultad}</td>
            <ActionsCell tipo="Asignaturas" />
          </tr>
        ));
      case 'Profesores':
        if (profesoresList.length === 0) return (<tr style={rowStyle}><td colSpan={9} style={{...cellStyle, padding:'20px'}}>Sin registros</td></tr>);
        return profesoresList.map(prof => (
          <tr key={prof.id_profesor} style={rowStyle}>
            <td style={cellStyle}>{prof.id_profesor}</td>
            <td style={cellStyle}>{prof.nombre}</td>
            <td style={{...cellStyle, fontWeight:'600'}}>{prof.apellido}</td>
            <td style={cellStyle}>{prof.documento}</td>
            <td style={cellStyle}>{prof.correo}</td>
            <td style={cellStyle}>-</td>
            <td style={cellStyle}><span style={{padding:'2px 8px', backgroundColor: prof.estado ? '#c6f6d5' : '#fed7d7', color: prof.estado ? '#22543d' : '#9b2c2c', borderRadius:'10px', fontSize:'0.75rem', fontWeight:'700'}}>{prof.estado ? 'Activo' : 'Inactivo'}</span></td>
            <td style={cellStyle}>0</td>
            <ActionsCell tipo="Profesores" />
          </tr>
        ));
      case 'Comisiones':
        if (comisionesList.length === 0) return (<tr style={rowStyle}><td colSpan={8} style={{...cellStyle, padding:'20px'}}>Sin registros</td></tr>);
        return comisionesList.map(com => {
          const profesoresStr = Array.isArray(com.profesoresNombresArray) ? com.profesoresNombresArray.join(', ') : (com.profesoresNombresArray || 'Sin Asignar');
          return (
            <tr key={com.id_comision} style={rowStyle}>
              <td style={cellStyle}>{com.id_comision}</td>
              <td style={{...cellStyle, fontWeight:'600'}}>{com.nombreComision}</td>
              <td style={cellStyle}>{com.letraDesde} - {com.letraHasta}</td>
              <td style={cellStyle}>{com.nombreAsignatura}</td>
              <td style={cellStyle}>{com.nombreFacultad}</td>
              <td style={cellStyle}>{profesoresStr}</td>
              <td style={{...cellStyle, fontWeight:'700', color:'#2b6cb0'}}>0</td>
              <ActionsCell tipo="Comisiones" />
            </tr>
          );
        });
      default: return (<tr><td colSpan={7} style={{textAlign:'center', padding:'20px'}}>Seleccione una entidad para ver datos.</td></tr>);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
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
        <StatCard titulo="Periodo" cantidad={estadisticasReales.Periodos ?? '0'} color={colores.Periodo} onAdd={() => { setEditingTipo(null); setIsPeriodoModalOpen(true); }} />
        <StatCard titulo="Edificios" cantidad={estadisticasReales.Edificios ?? '0'} color={colores.Edificios} onAdd={() => { setEditingTipo(null); setIsEdificioModalOpen(true); }} />
        <StatCard titulo="Facultades" cantidad={estadisticasReales.Facultades ?? '0'} color={colores.Facultades} onAdd={() => { setEditingTipo(null); setIsFacultadModalOpen(true); }} />
        <StatCard titulo="Carreras" cantidad={estadisticasReales.Carreras ?? '0'} color={colores.Carreras} onAdd={() => { setEditingTipo(null); setIsCarreraModalOpen(true); }} />
        <StatCard titulo="Asignaturas" cantidad={estadisticasReales.Asignaturas ?? '0'} color={colores.Asignaturas} onAdd={() => { setEditingTipo(null); setIsAsignaturaModalOpen(true); }} />
        <StatCard titulo="Profesores" cantidad={estadisticasReales.Profesores ?? '0'} color={colores.Profesores} onAdd={() => { setEditingTipo(null); setIsProfesorModalOpen(true); }} />
        <StatCard titulo="Comisiones" cantidad={estadisticasReales.Comisiones ?? '0'} color={colores.Comisiones} onAdd={() => { setEditingTipo(null); setIsComisionModalOpen(true); }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#ffffff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #3182ce', backgroundColor: 'transparent', color: '#3182ce', fontWeight: '600', cursor: 'pointer' }}>📥 Importar CSV</button>
          <button style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #38a169', backgroundColor: 'transparent', color: '#38a169', fontWeight: '600', cursor: 'pointer' }}>📤 Exportar CSV</button>
        </div>
        <select value={entidadActiva} onChange={(e) => setEntidadActiva(e.target.value)} style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#2d3748', fontWeight: '500', minWidth: '180px' }}>
          <option value="Periodos">Periodos</option>
          <option value="Edificios">Edificios</option><option value="Facultades">Facultades</option><option value="Carreras">Carreras</option><option value="Asignaturas">Asignaturas</option><option value="Profesores">Profesores</option><option value="Comisiones">Comisiones</option>
        </select>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>{renderHeaders()}<th style={headerStyle}>Acciones</th></tr></thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>

      <AddPeriodoModal isOpen={isPeriodoModalOpen} onClose={() => setIsPeriodoModalOpen(false)} onSave={(d) => handleSave(d, 'Periodo')} initialData={editingTipo === 'Periodos' ? periodoData : null} isEditMode={editingTipo === 'Periodos'} onDelete={() => handleDelete('Periodo')} />
      <AddEdificioModal isOpen={isEdificioModalOpen} onClose={() => setIsEdificioModalOpen(false)} onSave={(d) => handleSave(d, 'Edificio')} initialData={editingTipo === 'Edificios' ? edificioData : null} isEditMode={editingTipo === 'Edificios'} onDelete={() => handleDelete('Edificio')} />
      <AddFacultadModal isOpen={isFacultadModalOpen} onClose={() => setIsFacultadModalOpen(false)} onSave={(d) => handleSave(d, 'Facultad')} edificiosDisponibles={edificiosDisponibles} initialData={editingTipo === 'Facultades' ? facultadData : null} isEditMode={editingTipo === 'Facultades'} onDelete={() => handleDelete('Facultad')} />
      <AddCarreraModal isOpen={isCarreraModalOpen} onClose={() => setIsCarreraModalOpen(false)} onSave={(d) => handleSave(d, 'Carrera')} facultadesDisponibles={facultadesDisponibles} initialData={editingTipo === 'Carreras' ? carreraData : null} isEditMode={editingTipo === 'Carreras'} onDelete={() => handleDelete('Carrera')} />
      <AddAsignaturaModal isOpen={isAsignaturaModalOpen} onClose={() => setIsAsignaturaModalOpen(false)} onSave={(d) => handleSave(d, 'Asignatura')} carrerasDisponibles={carrerasDisponibles} profesoresDisponibles={profesoresDisponibles} initialData={editingTipo === 'Asignaturas' ? asignaturaData : null} isEditMode={editingTipo === 'Asignaturas'} onDelete={() => handleDelete('Asignatura')} />
      <AddProfesorModal isOpen={isProfesorModalOpen} onClose={() => setIsProfesorModalOpen(false)} onSave={(d) => handleSave(d, 'Profesor')} initialData={editingTipo === 'Profesores' ? profesorData : null} isEditMode={editingTipo === 'Profesores'} onDelete={() => handleDelete('Profesor')} />
      {/* MODIFICACIÓN: Pasamos las asignaturas disponibles al modal */}
      <AddComisionModal 
        isOpen={isComisionModalOpen} 
        onClose={() => setIsComisionModalOpen(false)} 
        onSave={(d) => handleSave(d, 'Comisión')} 
        profesoresDisponibles={profesoresDisponibles} 
        asignaturasDisponibles={asignaturasDisponibles} 
        initialData={editingTipo === 'Comisiones' ? comisionData : null}
        isEditMode={editingTipo === 'Comisiones'}
        onDelete={() => handleDelete('Comisión')}
      />
    </div>
  );
};

export default EstructuraPage;