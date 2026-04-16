"use client";
import React, { useEffect, useState } from 'react';

type NuevoPeriodo = {
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
};

type AddPeriodoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (periodo: NuevoPeriodo) => void;
  initialData?: NuevoPeriodo | null;
  isEditMode?: boolean;
  onDelete?: () => void;
};

const AddPeriodoModal = ({ isOpen, onClose, onSave, initialData = null, isEditMode = false, onDelete }: AddPeriodoModalProps) => {
  const [nuevoPeriodo, setNuevoPeriodo] = useState<NuevoPeriodo>({ nombre: '', fecha_inicio: '', fecha_fin: '' });
  const [errores, setErrores] = useState({ nombre: '', fecha_inicio: '', fecha_fin: '' });

  useEffect(() => {
    if (!isOpen) return;
    if (isEditMode && initialData) {
      setNuevoPeriodo(initialData);
    } else {
      setNuevoPeriodo({ nombre: '', fecha_inicio: '', fecha_fin: '' });
    }
    setErrores({ nombre: '', fecha_inicio: '', fecha_fin: '' });
  }, [isOpen, isEditMode, initialData]);

  if (!isOpen) return null;

  const validarCampos = () => {
    let erroresTemp = { nombre: '', fecha_inicio: '', fecha_fin: '' };
    let esValido = true;
    const hoy = new Date().toISOString().split('T')[0];

    // Nombre: > 5 caracteres y SIN números
    const tieneNumeros = /\d/;
    if (nuevoPeriodo.nombre.trim().length <= 5) {
      erroresTemp.nombre = "El nombre debe tener más de 5 caracteres.";
      esValido = false;
    } else if (tieneNumeros.test(nuevoPeriodo.nombre)) {
      erroresTemp.nombre = "El nombre no puede contener números.";
      esValido = false;
    }

    // Fecha Inicio: Obligatoria y >= Hoy
    if (!nuevoPeriodo.fecha_inicio) {
      erroresTemp.fecha_inicio = "La fecha de inicio es obligatoria.";
      esValido = false;
    } else if (nuevoPeriodo.fecha_inicio < hoy) {
      erroresTemp.fecha_inicio = "La fecha debe ser igual o posterior a hoy.";
      esValido = false;
    }

    // Fecha Fin: Obligatoria y > Fecha Inicio
    if (!nuevoPeriodo.fecha_fin) {
      erroresTemp.fecha_fin = "La fecha de fin es obligatoria.";
      esValido = false;
    } else if (nuevoPeriodo.fecha_fin <= nuevoPeriodo.fecha_inicio) {
      erroresTemp.fecha_fin = "Debe ser posterior a la fecha de inicio.";
      esValido = false;
    }

    setErrores(erroresTemp);
    return esValido;
  };

  const confirmarGuardar = () => {
    if (validarCampos()) {
      const accion = isEditMode ? "modificar" : "agregar";
      if (window.confirm(`¿Desea ${accion} el periodo "${nuevoPeriodo.nombre}"?`)) {
        onSave(nuevoPeriodo);
        setNuevoPeriodo({ nombre: '', fecha_inicio: '', fecha_fin: '' });
        setErrores({ nombre: '', fecha_inicio: '', fecha_fin: '' });
      }
    }
  };

  const confirmarEliminar = () => {
    if (!onDelete) return;
    if (window.confirm(`¿Desea eliminar el periodo "${nuevoPeriodo.nombre}"?`)) {
      onDelete();
    }
  };

  const confirmarCancelar = () => {
    if (window.confirm("¿Desea cancelar la operación?")) {
      setNuevoPeriodo({ nombre: '', fecha_inicio: '', fecha_fin: '' });
      setErrores({ nombre: '', fecha_inicio: '', fecha_fin: '' });
      onClose();
    }
  };

  return (
    <div style={overlayStyle}>
      <style>{`
        .modal-input:focus { border-color: #3182ce !important; box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.1); }
        .modal-input::placeholder { color: #a0aec0 !important; opacity: 1; }
        .modal-input:focus::placeholder { color: transparent !important; }
      `}</style>
      <div style={modalStyle}>
        <h2 style={titleStyle}>{isEditMode ? 'Editar Periodo Académico' : 'Nuevo Periodo Académico'}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={labelStyle}>ID Asignado</label>
            <input type="text" value="AUTO-GEN" disabled style={inputDisabledStyle} />
          </div>

          <div>
            <label style={labelStyle}>Nombre del Periodo *</label>
            <input 
              className="modal-input" 
              style={{ ...inputBaseStyle, border: `1px solid ${errores.nombre ? '#e53e3e' : '#e2e8f0'}` }}
              value={nuevoPeriodo.nombre} 
              onChange={(e) => setNuevoPeriodo({ ...nuevoPeriodo, nombre: e.target.value })} 
              placeholder="Ej: Primer Cuatrimestre"
            />
            {errores.nombre && <p style={errorTextStyle}>{errores.nombre}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Fecha Inicio *</label>
              <input 
                type="date" 
                className="modal-input"
                style={{ ...inputBaseStyle, border: `1px solid ${errores.fecha_inicio ? '#e53e3e' : '#e2e8f0'}` }}
                value={nuevoPeriodo.fecha_inicio}
                onChange={(e) => setNuevoPeriodo({ ...nuevoPeriodo, fecha_inicio: e.target.value })}
              />
              {errores.fecha_inicio && <p style={errorTextStyle}>{errores.fecha_inicio}</p>}
            </div>
            <div>
              <label style={labelStyle}>Fecha Fin *</label>
              <input 
                type="date" 
                className="modal-input"
                style={{ ...inputBaseStyle, border: `1px solid ${errores.fecha_fin ? '#e53e3e' : '#e2e8f0'}` }}
                value={nuevoPeriodo.fecha_fin}
                onChange={(e) => setNuevoPeriodo({ ...nuevoPeriodo, fecha_fin: e.target.value })}
              />
              {errores.fecha_fin && <p style={errorTextStyle}>{errores.fecha_fin}</p>}
            </div>
          </div>
        </div>
        <div style={footerStyle}>
          {isEditMode && onDelete && (
            <button onClick={confirmarEliminar} style={btnDeleteStyle}>Eliminar</button>
          )}
          <button onClick={confirmarCancelar} style={btnCancelStyle}>Cancelar</button>
          <button onClick={confirmarGuardar} style={btnSaveStyle}>{isEditMode ? 'Guardar cambios' : 'Guardar Periodo'}</button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle: React.CSSProperties = { backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
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

export default AddPeriodoModal;