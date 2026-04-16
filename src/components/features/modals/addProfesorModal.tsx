"use client";
import React, { useEffect, useState } from 'react';

type NuevoProfesorForm = {
  nombre: string;
  apellido: string;
  documento: string;
  correo: string;
  cod_area: string;
  telefono: string;
};

type NuevoProfesor = {
  nombre: string;
  apellido: string;
  documento: string;
  correo: string;
  telefono: string;
};

type AddProfesorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profesor: NuevoProfesor) => void;
  initialData?: NuevoProfesor | null;
  isEditMode?: boolean;
  onDelete?: () => void;
};

const AddProfesorModal = ({ isOpen, onClose, onSave, initialData = null, isEditMode = false, onDelete }: AddProfesorModalProps) => {
  const [nuevoProfesor, setNuevoProfesor] = useState<NuevoProfesorForm>({
    nombre: '', apellido: '', documento: '', correo: '', cod_area: '', telefono: ''
  });
  const [errores, setErrores] = useState({ 
    nombre: '', apellido: '', documento: '', correo: '', telefono: '' 
  });

  useEffect(() => {
    if (!isOpen) return;
    if (isEditMode && initialData) {
      const telefonoCompleto = initialData.telefono || '';
      setNuevoProfesor({
        nombre: initialData.nombre,
        apellido: initialData.apellido,
        documento: initialData.documento,
        correo: initialData.correo,
        cod_area: telefonoCompleto.slice(0, 4),
        telefono: telefonoCompleto.slice(4),
      });
    } else {
      setNuevoProfesor({ nombre: '', apellido: '', documento: '', correo: '', cod_area: '', telefono: '' });
    }
    setErrores({ nombre: '', apellido: '', documento: '', correo: '', telefono: '' });
  }, [isOpen, isEditMode, initialData]);

  if (!isOpen) return null;

  const validarCampos = () => {
    let erroresTemp = { nombre: '', apellido: '', documento: '', correo: '', telefono: '' };
    let esValido = true;

    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const soloNumeros = /^\d+$/;
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Nombre y Apellido: >= 3 y solo letras
    if (nuevoProfesor.nombre.length < 3 || !soloLetras.test(nuevoProfesor.nombre)) {
      erroresTemp.nombre = "Mínimo 3 caracteres, solo letras.";
      esValido = false;
    }
    if (nuevoProfesor.apellido.length < 3 || !soloLetras.test(nuevoProfesor.apellido)) {
      erroresTemp.apellido = "Mínimo 3 caracteres, solo letras.";
      esValido = false;
    }

    // Documento: >= 7 y solo números
    if (nuevoProfesor.documento.length < 7 || !soloNumeros.test(nuevoProfesor.documento)) {
      erroresTemp.documento = "Mínimo 7 dígitos, solo números.";
      esValido = false;
    }

    // Correo: Formato válido
    if (!formatoCorreo.test(nuevoProfesor.correo)) {
      erroresTemp.correo = "Ingrese un correo institucional válido.";
      esValido = false;
    }

    // Teléfono: Opcional, pero si se llena, debe cumplir el formato
    if (nuevoProfesor.cod_area || nuevoProfesor.telefono) {
      if (nuevoProfesor.cod_area.length !== 4 || !soloNumeros.test(nuevoProfesor.cod_area)) {
        erroresTemp.telefono = "Cód. área debe ser de 4 números.";
        esValido = false;
      } else if (nuevoProfesor.telefono.length !== 6 || !soloNumeros.test(nuevoProfesor.telefono)) {
        erroresTemp.telefono = "El número debe ser de 6 dígitos.";
        esValido = false;
      }
    }

    setErrores(erroresTemp);
    return esValido;
  };

  const confirmarGuardar = () => {
    if (validarCampos()) {
      const accion = isEditMode ? "modificar" : "agregar";
      if (window.confirm(`¿Desea ${accion} al profesor "${nuevoProfesor.apellido}, ${nuevoProfesor.nombre}"?`)) {
        const telefonoConcatenado = nuevoProfesor.cod_area || nuevoProfesor.telefono
          ? `${nuevoProfesor.cod_area}${nuevoProfesor.telefono}`
          : '';
        const profesorAGuardar: NuevoProfesor = {
          nombre: nuevoProfesor.nombre,
          apellido: nuevoProfesor.apellido,
          documento: nuevoProfesor.documento,
          correo: nuevoProfesor.correo,
          telefono: telefonoConcatenado,
        };
        onSave(profesorAGuardar);
        setNuevoProfesor({ nombre: '', apellido: '', documento: '', correo: '', cod_area: '', telefono: '' });
      }
    }
  };

  const confirmarEliminar = () => {
    if (!onDelete) return;
    if (window.confirm(`¿Desea eliminar al profesor "${nuevoProfesor.apellido}, ${nuevoProfesor.nombre}"?`)) {
      onDelete();
    }
  };

  const confirmarCancelar = () => {
    if (window.confirm("¿Desea cancelar la operación?")) {
      setNuevoProfesor({ nombre: '', apellido: '', documento: '', correo: '', cod_area: '', telefono: '' });
      setErrores({ nombre: '', apellido: '', documento: '', correo: '', telefono: '' });
      onClose();
    }
  };

  return (
    <div style={overlayStyle}>
      <style>{`
        .modal-input:focus { border-color: #3182ce !important; box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.1); }
        .modal-input::placeholder { color: #a0aec0 !important; }
      `}</style>
      <div style={{ ...modalStyle, width: '450px' }}>
        <h2 style={titleStyle}>{isEditMode ? 'Editar Profesor' : 'Nuevo Profesor'}</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={labelStyle}>ID Asignado</label>
            <input type="text" value="AUTO-GEN" disabled style={inputDisabledStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input className="modal-input" style={{ ...inputBaseStyle, border: `1px solid ${errores.nombre ? '#e53e3e' : '#e2e8f0'}` }}
                value={nuevoProfesor.nombre} onChange={(e) => setNuevoProfesor({ ...nuevoProfesor, nombre: e.target.value })} placeholder="Ej: María" />
              {errores.nombre && <p style={errorTextStyle}>{errores.nombre}</p>}
            </div>
            <div>
              <label style={labelStyle}>Apellido *</label>
              <input className="modal-input" style={{ ...inputBaseStyle, border: `1px solid ${errores.apellido ? '#e53e3e' : '#e2e8f0'}` }}
                value={nuevoProfesor.apellido} onChange={(e) => setNuevoProfesor({ ...nuevoProfesor, apellido: e.target.value })} placeholder="Ej: Ferraro" />
              {errores.apellido && <p style={errorTextStyle}>{errores.apellido}</p>}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Documento (DNI) *</label>
            <input className="modal-input" style={{ ...inputBaseStyle, border: `1px solid ${errores.documento ? '#e53e3e' : '#e2e8f0'}` }}
              value={nuevoProfesor.documento} onChange={(e) => setNuevoProfesor({ ...nuevoProfesor, documento: e.target.value })} placeholder="Ej: 30444555" />
            {errores.documento && <p style={errorTextStyle}>{errores.documento}</p>}
          </div>

          <div>
            <label style={labelStyle}>Correo Institucional *</label>
            <input className="modal-input" style={{ ...inputBaseStyle, border: `1px solid ${errores.correo ? '#e53e3e' : '#e2e8f0'}` }}
              value={nuevoProfesor.correo} onChange={(e) => setNuevoProfesor({ ...nuevoProfesor, correo: e.target.value })} placeholder="usuario@unne.edu.ar" />
            {errores.correo && <p style={errorTextStyle}>{errores.correo}</p>}
          </div>

          <div>
            <label style={labelStyle}>Número de Teléfono (Opcional)</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input className="modal-input" style={{ ...inputBaseStyle, width: '80px', textAlign: 'center' }}
                value={nuevoProfesor.cod_area} onChange={(e) => setNuevoProfesor({ ...nuevoProfesor, cod_area: e.target.value })} placeholder="3794" maxLength={4} />
              <span style={{ color: '#cbd5e0' }}>-</span>
              <input className="modal-input" style={inputBaseStyle}
                value={nuevoProfesor.telefono} onChange={(e) => setNuevoProfesor({ ...nuevoProfesor, telefono: e.target.value })} placeholder="607080" maxLength={6} />
            </div>
            {errores.telefono && <p style={errorTextStyle}>{errores.telefono}</p>}
          </div>
        </div>

        <div style={footerStyle}>
          {isEditMode && onDelete && (
            <button onClick={confirmarEliminar} style={btnDeleteStyle}>Eliminar</button>
          )}
          <button onClick={confirmarCancelar} style={btnCancelStyle}>Cancelar</button>
          <button onClick={confirmarGuardar} style={btnSaveStyle}>{isEditMode ? 'Guardar cambios' : 'Guardar Profesor'}</button>
        </div>
      </div>
    </div>
  );
};

// Estilos (Consistentes con los anteriores)
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

export default AddProfesorModal;