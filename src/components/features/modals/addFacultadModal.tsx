"use client";
import React, { useEffect, useState } from 'react';

type Edificio = {
  id: number;
  nombre: string;
};

type NuevaFacultad = {
  nombre: string;
  ciudad: string;
  id_edificio: string;
};

type AddFacultadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (facultad: NuevaFacultad) => void;
  edificiosDisponibles: Edificio[];
  initialData?: NuevaFacultad | null;
  isEditMode?: boolean;
  onDelete?: () => void;
};

const AddFacultadModal = ({ isOpen, onClose, onSave, edificiosDisponibles, initialData = null, isEditMode = false, onDelete }: AddFacultadModalProps) => {
  const [nuevaFacultad, setNuevaFacultad] = useState<NuevaFacultad>({ 
    nombre: '', 
    ciudad: '', 
    id_edificio: '' 
  });
  const [errores, setErrores] = useState({ nombre: '', ciudad: '', edificio: '' });

  useEffect(() => {
    if (!isOpen) return;
    if (isEditMode && initialData) {
      setNuevaFacultad(initialData);
    } else {
      setNuevaFacultad({ nombre: '', ciudad: '', id_edificio: '' });
    }
    setErrores({ nombre: '', ciudad: '', edificio: '' });
  }, [isOpen, isEditMode, initialData]);

  if (!isOpen) return null;

  const validarCampos = () => {
    let erroresTemp = { nombre: '', ciudad: '', edificio: '' };
    let esValido = true;

    if (nuevaFacultad.nombre.length <= 5) {
      erroresTemp.nombre = "El nombre debe tener más de 5 caracteres.";
      esValido = false;
    }
    if (nuevaFacultad.ciudad.length <= 5) {
      erroresTemp.ciudad = "La ciudad debe tener más de 5 caracteres.";
      esValido = false;
    }
    if (!nuevaFacultad.id_edificio || nuevaFacultad.id_edificio === "") {
      erroresTemp.edificio = "Debe seleccionar un edificio válido.";
      esValido = false;
    }

    setErrores(erroresTemp);
    return esValido;
  };

  const confirmarGuardar = () => {
    if (validarCampos()) {
      const accion = isEditMode ? "modificar" : "agregar";
      if (window.confirm(`¿Desea ${accion} la facultad "${nuevaFacultad.nombre}"?`)) {
        onSave(nuevaFacultad);
        setNuevaFacultad({ nombre: '', ciudad: '', id_edificio: '' });
      }
    }
  };

  const confirmarEliminar = () => {
    if (!onDelete) return;
    if (window.confirm(`¿Desea eliminar la facultad "${nuevaFacultad.nombre}"?`)) {
      onDelete();
    }
  };

  const confirmarCancelar = () => {
    if (window.confirm("¿Desea cancelar la operación?")) {
      setNuevaFacultad({ nombre: '', ciudad: '', id_edificio: '' });
      setErrores({ nombre: '', ciudad: '', edificio: '' });
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
        <h2 style={titleStyle}>{isEditMode ? 'Editar Facultad' : 'Nueva Facultad'}</h2>
        
        <div style={formStyle}>
          {/* ID Asignado */}
          <div>
            <label style={labelStyle}>ID Asignado (Automático)</label>
            <input type="text" value="AUTO-GEN" disabled style={inputDisabledStyle} />
          </div>

          {/* Nombre */}
          <div>
            <label style={labelStyle}>Nombre de la Facultad *</label>
            <input 
              className="modal-input"
              style={{ ...inputBaseStyle, border: `1px solid ${errores.nombre ? '#e53e3e' : '#e2e8f0'}` }}
              value={nuevaFacultad.nombre}
              onChange={(e) => setNuevaFacultad({...nuevaFacultad, nombre: e.target.value})}
              placeholder="Ej: Facultad de Ciencias Exactas"
            />
            {errores.nombre && <p style={errorTextStyle}>{errores.nombre}</p>}
          </div>

          {/* Ciudad */}
          <div>
            <label style={labelStyle}>Ciudad *</label>
            <input 
              className="modal-input"
              style={{ ...inputBaseStyle, border: `1px solid ${errores.ciudad ? '#e53e3e' : '#e2e8f0'}` }}
              value={nuevaFacultad.ciudad}
              onChange={(e) => setNuevaFacultad({...nuevaFacultad, ciudad: e.target.value})}
              placeholder="Ej: Corrientes Capital"
            />
            {errores.ciudad && <p style={errorTextStyle}>{errores.ciudad}</p>}
          </div>

          {/* Selector de Edificio */}
          <div>
            <label style={labelStyle}>Edificio Asociado *</label>
            <select 
              className="modal-select"
              style={{ ...inputBaseStyle, border: `1px solid ${errores.edificio ? '#e53e3e' : '#e2e8f0'}`, cursor: 'pointer' }}
              value={nuevaFacultad.id_edificio}
              onChange={(e) => setNuevaFacultad({...nuevaFacultad, id_edificio: e.target.value})}
            >
              <option value="">Seleccione un edificio...</option>
              {edificiosDisponibles && edificiosDisponibles.length > 0 ? (
                edificiosDisponibles.map((ed) => (
                  <option key={ed.id} value={ed.id}>{ed.nombre}</option>
                ))
              ) : (
                <option value="" disabled>No se encontró ningún edificio</option>
              )}
            </select>
            {errores.edificio && <p style={errorTextStyle}>{errores.edificio}</p>}
          </div>
        </div>

        <div style={footerStyle}>
          {isEditMode && onDelete && (
            <button onClick={confirmarEliminar} style={btnDeleteStyle}>Eliminar</button>
          )}
          <button onClick={confirmarCancelar} style={btnCancelStyle}>Cancelar</button>
          <button onClick={confirmarGuardar} style={btnSaveStyle}>{isEditMode ? 'Guardar cambios' : 'Guardar Facultad'}</button>
        </div>
      </div>
    </div>
  );
};

// --- ESTILOS (Idénticos al de Edificio para coherencia visual) ---
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

export default AddFacultadModal;