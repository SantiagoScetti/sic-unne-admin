"use client";
import React, { useEffect, useState } from 'react';

type NuevoEdificio = {
  nombre: string;
  direccion: string;
};

type AddEdificioModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (edificio: NuevoEdificio) => void;
  initialData?: NuevoEdificio | null;
  isEditMode?: boolean;
  onDelete?: () => void;
};

const AddEdificioModal = ({ isOpen, onClose, onSave, initialData = null, isEditMode = false, onDelete }: AddEdificioModalProps) => {
  const [nuevoEdificio, setNuevoEdificio] = useState<NuevoEdificio>({ nombre: '', direccion: '' });
  const [errores, setErrores] = useState({ nombre: '', direccion: '' });

  useEffect(() => {
    if (!isOpen) return;
    if (isEditMode && initialData) {
      setNuevoEdificio(initialData);
    } else {
      setNuevoEdificio({ nombre: '', direccion: '' });
    }
    setErrores({ nombre: '', direccion: '' });
  }, [isOpen, isEditMode, initialData]);

  if (!isOpen) return null;

  const validarCampos = () => {
    let erroresTemp = { nombre: '', direccion: '' };
    let esValido = true;

    if (nuevoEdificio.nombre.length <= 3) {
      erroresTemp.nombre = "El nombre debe tener más de 3 caracteres.";
      esValido = false;
    }
    const tieneLetrasYNumeros = /^(?=.*[a-zA-Z])(?=.*[0-9]).+$/;
    if (nuevoEdificio.direccion.length <= 5 || !tieneLetrasYNumeros.test(nuevoEdificio.direccion)) {
      erroresTemp.direccion = "Debe tener más de 5 caracteres e incluir letras y números.";
      esValido = false;
    }

    setErrores(erroresTemp);
    return esValido;
  };

  const confirmarGuardar = () => {
    if (validarCampos()) {
      const accion = isEditMode ? "modificar" : "agregar";
      if (window.confirm(`¿Desea ${accion} el edificio "${nuevoEdificio.nombre}"?`)) {
        onSave(nuevoEdificio);
        setNuevoEdificio({ nombre: '', direccion: '' });
      }
    }
  };

  const confirmarEliminar = () => {
    if (!onDelete) return;
    if (window.confirm(`¿Desea eliminar el edificio "${nuevoEdificio.nombre}"?`)) {
      onDelete();
    }
  };

  const confirmarCancelar = () => {
    if (window.confirm("¿Desea cancelar la operación?")) {
      setNuevoEdificio({ nombre: '', direccion: '' });
      setErrores({ nombre: '', direccion: '' });
      onClose();
    }
  };

  return (
    <div style={overlayStyle}>
      {/* Inyectamos este estilo para manejar el placeholder y el focus */}
      <style>{`
        .modal-input::placeholder {
          color: #a0aec0 !important;
          opacity: 1;
        }
        .modal-input:focus::placeholder {
          color: transparent !important;
        }
        .modal-input:focus {
          border-color: #3182ce !important;
          box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.1);
        }
      `}</style>

      <div style={modalStyle}>
        <h2 style={titleStyle}>{isEditMode ? 'Editar Edificio' : 'Nuevo Edificio'}</h2>
        
        <div style={formStyle}>

          <div>
            <label style={labelStyle}>Nombre del Edificio *</label>
            <input 
              className="modal-input"
              style={{ ...inputBaseStyle, border: `1px solid ${errores.nombre ? '#e53e3e' : '#e2e8f0'}` }}
              value={nuevoEdificio.nombre}
              onChange={(e) => setNuevoEdificio({...nuevoEdificio, nombre: e.target.value})}
              placeholder="Ej: Edificio Central"
            />
            {errores.nombre && <p style={errorTextStyle}>{errores.nombre}</p>}
          </div>

          <div>
            <label style={labelStyle}>Dirección *</label>
            <input 
              className="modal-input"
              style={{ ...inputBaseStyle, border: `1px solid ${errores.direccion ? '#e53e3e' : '#e2e8f0'}` }}
              value={nuevoEdificio.direccion}
              onChange={(e) => setNuevoEdificio({...nuevoEdificio, direccion: e.target.value})}
              placeholder="Ej: Av. Libertad 5470"
            />
            {errores.direccion && <p style={errorTextStyle}>{errores.direccion}</p>}
          </div>
        </div>

        <div style={footerStyle}>
          {isEditMode && onDelete && (
            <button onClick={confirmarEliminar} style={btnDeleteStyle}>Eliminar</button>
          )}
          <button onClick={confirmarCancelar} style={btnCancelStyle}>Cancelar</button>
          <button onClick={confirmarGuardar} style={btnSaveStyle}>{isEditMode ? 'Guardar cambios' : 'Guardar Edificio'}</button>
        </div>
      </div>
    </div>
  );
};

// --- ESTILOS ACTUALIZADOS ---
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle: React.CSSProperties = { backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
const titleStyle: React.CSSProperties = { marginBottom: '20px', color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' };
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '15px' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568', marginBottom: '5px' };

const inputBaseStyle: React.CSSProperties = { 
  width: '100%', 
  padding: '10px', 
  borderRadius: '6px', 
  outline: 'none', 
  backgroundColor: '#ffffff',
  color: '#1a202c', // Texto negro al escribir
  fontSize: '0.95rem',
  caretColor: '#3182ce' // Cursor de tipado azul para que se vea bien
};

const inputDisabledStyle: React.CSSProperties = { 
  ...inputBaseStyle, 
  backgroundColor: '#f8fafc', 
  border: '1px solid #e2e8f0', 
  color: '#a0aec0', 
  cursor: 'not-allowed' 
};

const errorTextStyle: React.CSSProperties = { color: '#e53e3e', fontSize: '0.75rem', marginTop: '4px' };
const footerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' };
const btnBase: React.CSSProperties = { padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' };
const btnCancelStyle: React.CSSProperties = { ...btnBase, backgroundColor: 'transparent', color: '#4a5568', border: '1px solid #e2e8f0' };
const btnDeleteStyle: React.CSSProperties = { ...btnBase, backgroundColor: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2' };
const btnSaveStyle: React.CSSProperties = { ...btnBase, backgroundColor: '#3182ce', color: 'white', border: 'none' };

export default AddEdificioModal;