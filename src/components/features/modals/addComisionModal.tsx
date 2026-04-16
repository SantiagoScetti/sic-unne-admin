"use client";
import React, { useEffect, useState } from 'react';

type Profesor = {
  id: number;
  nombre: string;
  apellido: string;
};

type Asignatura = {
  id: number;
  nombre: string;
};

type NuevaComision = {
  nombre: string;
  letraDesde: string;
  letraHasta: string;
  id_asignatura: string;
  profesores_ids: number[];
};

type AddComisionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comision: NuevaComision) => void;
  profesoresDisponibles: Profesor[];
  asignaturasDisponibles: Asignatura[];
  initialData?: NuevaComision | null;
  isEditMode?: boolean;
  onDelete?: () => void;
};

const AddComisionModal = ({ isOpen, onClose, onSave, profesoresDisponibles, asignaturasDisponibles, initialData = null, isEditMode = false, onDelete }: AddComisionModalProps) => {
  const [nuevaComision, setNuevaComision] = useState<NuevaComision>({
    nombre: '', letraDesde: '', letraHasta: '', id_asignatura: '', profesores_ids: [] as number[]
  });
  const [busquedaProfesor, setBusquedaProfesor] = useState('');
  const [errores, setErrores] = useState({ nombre: '', letras: '', asignatura: '', profesores: '' });

  useEffect(() => {
    if (!isOpen) return;
    if (isEditMode && initialData) {
      setNuevaComision(initialData);
    } else {
      setNuevaComision({ nombre: '', letraDesde: '', letraHasta: '', id_asignatura: '', profesores_ids: [] });
    }
    setErrores({ nombre: '', letras: '', asignatura: '', profesores: '' });
    setBusquedaProfesor('');
  }, [isOpen, isEditMode, initialData]);

  if (!isOpen) return null;

  const profesoresFiltrados = profesoresDisponibles.filter(p => 
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(busquedaProfesor.toLowerCase())
  );

  const validarCampos = () => {
    let erroresTemp = { nombre: '', letras: '', asignatura: '', profesores: '' };
    let esValido = true;

    if (!nuevaComision.nombre.trim()) {
      erroresTemp.nombre = "El nombre es obligatorio.";
      esValido = false;
    }

    const regexLetra = /^[a-zA-Z]$/;
    if (!regexLetra.test(nuevaComision.letraDesde) || !regexLetra.test(nuevaComision.letraHasta)) {
      erroresTemp.letras = "Ambas letras deben ser un único carácter (A-Z).";
      esValido = false;
    } else if (nuevaComision.letraHasta.toUpperCase() < nuevaComision.letraDesde.toUpperCase()) {
      erroresTemp.letras = "La letra 'Hasta' debe ser posterior o igual a 'Desde'.";
      esValido = false;
    }

    if (!nuevaComision.id_asignatura) {
      erroresTemp.asignatura = "Debe seleccionar una asignatura.";
      esValido = false;
    }

    if (nuevaComision.profesores_ids.length === 0) {
      erroresTemp.profesores = "Debe seleccionar al menos un profesor.";
      esValido = false;
    }

    setErrores(erroresTemp);
    return esValido;
  };

  const toggleProfesor = (profesorId: number) => {
    setNuevaComision((prev) => {
      const yaSeleccionado = prev.profesores_ids.includes(profesorId);
      const profesores_ids = yaSeleccionado
        ? prev.profesores_ids.filter((id) => id !== profesorId)
        : [...prev.profesores_ids, profesorId];

      return { ...prev, profesores_ids };
    });
  };

  const confirmarGuardar = () => {
    if (validarCampos()) {
      const accion = isEditMode ? "modificar" : "agregar";
      if (window.confirm(`¿Desea ${accion} la comisión "${nuevaComision.nombre}"?`)) {
        onSave(nuevaComision);
        setNuevaComision({ nombre: '', letraDesde: '', letraHasta: '', id_asignatura: '', profesores_ids: [] });
      }
    }
  };

  const confirmarEliminar = () => {
    if (!onDelete) return;
    if (window.confirm(`¿Desea eliminar la comisión "${nuevaComision.nombre}"?`)) {
      onDelete();
    }
  };

  const confirmarCancelar = () => {
    if (window.confirm("¿Desea cancelar la operación?")) {
      setNuevaComision({ nombre: '', letraDesde: '', letraHasta: '', id_asignatura: '', profesores_ids: [] });
      setErrores({ nombre: '', letras: '', asignatura: '', profesores: '' });
      onClose();
    }
  };

  return (
    <div style={overlayStyle}>
      <style>{`
        .checkbox-custom { appearance: none; width: 18px; height: 18px; border: 2px solid #cbd5e0; border-radius: 4px; background-color: #ffffff; cursor: pointer; display: inline-grid; place-content: center; }
        .checkbox-custom:checked { background-color: #3182ce; border-color: #3182ce; }
        .checkbox-custom:checked::before { content: "✔"; color: white; font-size: 12px; font-weight: bold; }
        .modal-input:focus, .modal-select:focus { border-color: #3182ce !important; box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.1); }
      `}</style>

      <div style={{ ...modalStyle, width: '450px' }}>
        <h2 style={titleStyle}>{isEditMode ? 'Editar Comisión' : 'Nueva Comisión'}</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={labelStyle}>ID Asignado</label>
            <input type="text" value="AUTO-GEN" disabled style={inputDisabledStyle} />
          </div>

          <div>
            <label style={labelStyle}>Nombre de Comisión *</label>
            <input className="modal-input" style={{ ...inputBaseStyle, border: `1px solid ${errores.nombre ? '#e53e3e' : '#e2e8f0'}` }} 
              value={nuevaComision.nombre} onChange={(e) => setNuevaComision({...nuevaComision, nombre: e.target.value})} placeholder="Ej: Comisión A" />
            {errores.nombre && <p style={errorTextStyle}>{errores.nombre}</p>}
          </div>

          {/* AGREGADO: Selector de Asignatura */}
          <div>
            <label style={labelStyle}>Asignatura *</label>
            <select className="modal-select" style={{ ...inputBaseStyle, border: `1px solid ${errores.asignatura ? '#e53e3e' : '#e2e8f0'}` }}
              value={nuevaComision.id_asignatura} onChange={(e) => setNuevaComision({...nuevaComision, id_asignatura: e.target.value})}>
              <option value="">Seleccione una asignatura...</option>
              {asignaturasDisponibles.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
            {errores.asignatura && <p style={errorTextStyle}>{errores.asignatura}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Letra Desde *</label>
              <input className="modal-input" style={{ ...inputBaseStyle, textAlign: 'center' }} maxLength={1}
                value={nuevaComision.letraDesde} onChange={(e) => setNuevaComision({...nuevaComision, letraDesde: e.target.value})} placeholder="A" />
            </div>
            <div>
              <label style={labelStyle}>Letra Hasta *</label>
              <input className="modal-input" style={{ ...inputBaseStyle, textAlign: 'center' }} maxLength={1}
                value={nuevaComision.letraHasta} onChange={(e) => setNuevaComision({...nuevaComision, letraHasta: e.target.value})} placeholder="Z" />
            </div>
          </div>
          {errores.letras && <p style={errorTextStyle}>{errores.letras}</p>}

          <div>
            <label style={labelStyle}>Profesores Asignados *</label>
            <input type="text" className="modal-input" placeholder="🔍 Buscar profesor..." style={{ ...inputBaseStyle, marginBottom: '8px', padding: '8px' }} value={busquedaProfesor} onChange={(e) => setBusquedaProfesor(e.target.value)} />
            <div style={{ border: `1px solid ${errores.profesores ? '#e53e3e' : '#e2e8f0'}`, borderRadius: '6px', maxHeight: '120px', overflowY: 'auto', padding: '10px', backgroundColor: '#ffffff' }}>
              {profesoresFiltrados.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f7fafc' }}>
                  <input type="checkbox" className="checkbox-custom" checked={nuevaComision.profesores_ids.includes(p.id)} onChange={() => toggleProfesor(p.id)} />
                  <span style={{ fontSize: '0.9rem', marginLeft: '10px', color: '#1a202c' }}>{p.apellido}, {p.nombre}</span>
                </div>
              ))}
            </div>
            {errores.profesores && <p style={errorTextStyle}>{errores.profesores}</p>}
          </div>
        </div>

        <div style={footerStyle}>
          {isEditMode && onDelete && (
            <button onClick={confirmarEliminar} style={btnDeleteStyle}>Eliminar</button>
          )}
          <button onClick={confirmarCancelar} style={btnCancelStyle}>Cancelar</button>
          <button onClick={confirmarGuardar} style={btnSaveStyle}>{isEditMode ? 'Guardar cambios' : 'Guardar Comisión'}</button>
        </div>
      </div>
    </div>
  );
};

// ... (Estilos iguales que antes)
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle: React.CSSProperties = { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
const titleStyle: React.CSSProperties = { marginBottom: '20px', color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568', marginBottom: '5px' };
const inputBaseStyle: React.CSSProperties = { width: '100%', padding: '10px', borderRadius: '6px', outline: 'none', border: '1px solid #e2e8f0', fontSize: '0.95rem', backgroundColor: '#ffffff', color: '#1a202c' };
const inputDisabledStyle: React.CSSProperties = { ...inputBaseStyle, backgroundColor: '#fdfdfd', color: '#a0aec0', cursor: 'not-allowed' };
const errorTextStyle: React.CSSProperties = { color: '#e53e3e', fontSize: '0.75rem', marginTop: '4px' };
const footerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' };
const btnBase: React.CSSProperties = { padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' };
const btnCancelStyle: React.CSSProperties = { ...btnBase, backgroundColor: 'transparent', color: '#4a5568', border: '1px solid #e2e8f0' };
const btnDeleteStyle: React.CSSProperties = { ...btnBase, backgroundColor: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2' };
const btnSaveStyle: React.CSSProperties = { ...btnBase, backgroundColor: '#3182ce', color: 'white', border: 'none' };

export default AddComisionModal;