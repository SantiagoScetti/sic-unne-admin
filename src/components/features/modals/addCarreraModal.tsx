"use client";
import React, { useEffect, useState } from 'react';

type Facultad = {
  id: number;
  nombre: string;
};

type NuevaCarrera = {
  nombre: string;
  id_facultad: string;
};

type AddCarreraModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (carrera: NuevaCarrera) => void;
  facultadesDisponibles: Facultad[];
  initialData?: NuevaCarrera | null;
  isEditMode?: boolean;
  onDelete?: () => void;
};

const AddCarreraModal = ({ isOpen, onClose, onSave, facultadesDisponibles, initialData = null, isEditMode = false, onDelete }: AddCarreraModalProps) => {
  const [nuevaCarrera, setNuevaCarrera] = useState<NuevaCarrera>({ nombre: '', id_facultad: '' });
  const [errores, setErrores] = useState({ nombre: '', facultad: '' });

  useEffect(() => {
    if (!isOpen) return;
    if (isEditMode && initialData) {
      setNuevaCarrera(initialData);
    } else {
      setNuevaCarrera({ nombre: '', id_facultad: '' });
    }
    setErrores({ nombre: '', facultad: '' });
  }, [isOpen, isEditMode, initialData]);

  if (!isOpen) return null;

  const validarCampos = () => {
    let erroresTemp = { nombre: '', facultad: '' };
    let esValido = true;

    if (nuevaCarrera.nombre.length <= 10) {
      erroresTemp.nombre = "El nombre debe tener más de 10 caracteres.";
      esValido = false;
    }
    if (!nuevaCarrera.id_facultad || nuevaCarrera.id_facultad === "") {
      erroresTemp.facultad = "Debe seleccionar una facultad válida.";
      esValido = false;
    }

    setErrores(erroresTemp);
    return esValido;
  };

  const confirmarGuardar = () => {
    if (validarCampos()) {
      const accion = isEditMode ? "modificar" : "agregar";
      if (window.confirm(`¿Desea ${accion} la carrera "${nuevaCarrera.nombre}"?`)) {
        onSave(nuevaCarrera);
        setNuevaCarrera({ nombre: '', id_facultad: '' });
      }
    }
  };

  const confirmarEliminar = () => {
    if (!onDelete) return;
    if (window.confirm(`¿Desea eliminar la carrera "${nuevaCarrera.nombre}"?`)) {
      onDelete();
    }
  };

  const confirmarCancelar = () => {
    if (window.confirm("¿Desea cancelar la operación?")) {
      setNuevaCarrera({ nombre: '', id_facultad: '' });
      setErrores({ nombre: '', facultad: '' });
      onClose();
    }
  };

  return (
    <div style={overlayStyle}>
      <style>{`
        .modal-input::placeholder { color: #a0aec0 !important; opacity: 1; }
        .modal-input:focus::placeholder { color: transparent !important; }
        .modal-input:focus, .modal-select:focus { 
          border-color: #3182ce !important; 
          box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.1); 
        }
      `}</style>

      <div style={modalStyle}>
        <h2 style={titleStyle}>{isEditMode ? 'Editar Carrera' : 'Nueva Carrera'}</h2>
        
        <div style={formStyle}>
          <div>
            <label style={labelStyle}>ID Asignado (Automático)</label>
            <input type="text" value="AUTO-GEN" disabled style={inputDisabledStyle} />
          </div>

          <div>
            <label style={labelStyle}>Nombre de la Carrera *</label>
            <input 
              className="modal-input"
              style={{ ...inputBaseStyle, border: `1px solid ${errores.nombre ? '#e53e3e' : '#e2e8f0'}` }}
              value={nuevaCarrera.nombre}
              onChange={(e) => setNuevaCarrera({...nuevaCarrera, nombre: e.target.value})}
              placeholder="Ej: Licenciatura en Sistemas de Información"
            />
            {errores.nombre && <p style={errorTextStyle}>{errores.nombre}</p>}
          </div>

          <div>
            <label style={labelStyle}>Facultad Asociada *</label>
            <select 
              className="modal-select"
              style={{ ...inputBaseStyle, border: `1px solid ${errores.facultad ? '#e53e3e' : '#e2e8f0'}`, cursor: 'pointer' }}
              value={nuevaCarrera.id_facultad}
              onChange={(e) => setNuevaCarrera({...nuevaCarrera, id_facultad: e.target.value})}
            >
              <option value="">Seleccione una facultad...</option>
              {facultadesDisponibles && facultadesDisponibles.length > 0 ? (
                facultadesDisponibles.map((f) => (
                  <option key={f.id} value={f.id}>{f.nombre}</option>
                ))
              ) : (
                <option value="" disabled>No se encontraron facultades</option>
              )}
            </select>
            {errores.facultad && <p style={errorTextStyle}>{errores.facultad}</p>}
          </div>
        </div>

        <div style={footerStyle}>
          {isEditMode && onDelete && (
            <button onClick={confirmarEliminar} style={btnDeleteStyle}>Eliminar</button>
          )}
          <button onClick={confirmarCancelar} style={btnCancelStyle}>Cancelar</button>
          <button onClick={confirmarGuardar} style={btnSaveStyle}>{isEditMode ? 'Guardar cambios' : 'Guardar Carrera'}</button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle: React.CSSProperties = { backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
const titleStyle: React.CSSProperties = { marginBottom: '20px', color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' };
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '15px' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568', marginBottom: '5px' };
const inputBaseStyle: React.CSSProperties = { width: '100%', padding: '10px', borderRadius: '6px', outline: 'none', backgroundColor: '#ffffff', color: '#1a202c', fontSize: '0.95rem', caretColor: '#3182ce' };
const inputDisabledStyle: React.CSSProperties = { ...inputBaseStyle, backgroundColor: '#fdfdfd', border: '1px solid #e2e8f0', color: '#a0aec0', cursor: 'not-allowed' };
const errorTextStyle: React.CSSProperties = { color: '#e53e3e', fontSize: '0.75rem', marginTop: '4px' };
const footerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' };
const btnBase: React.CSSProperties = { padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' };
const btnCancelStyle: React.CSSProperties = { ...btnBase, backgroundColor: 'transparent', color: '#4a5568', border: '1px solid #e2e8f0' };
const btnDeleteStyle: React.CSSProperties = { ...btnBase, backgroundColor: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2' };
const btnSaveStyle: React.CSSProperties = { ...btnBase, backgroundColor: '#3182ce', color: 'white', border: 'none' };

export default AddCarreraModal;