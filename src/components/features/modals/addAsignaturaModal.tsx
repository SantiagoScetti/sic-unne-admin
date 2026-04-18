"use client";
import React, { useEffect, useState } from 'react';

type Profesor = {
  id: number;
  nombre: string;
  apellido: string;
};

type Carrera = {
  id: number;
  nombre: string;
};

type Periodo = {
  id_periodo: number;
  nombre: string;
};

type NuevaAsignatura = {
  nombre: string;
  año: string;
  id_periodo: number | string;
  id_carrera: string;
  id_profesor: number | string;
};

type AddAsignaturaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asignatura: NuevaAsignatura) => void;
  carrerasDisponibles: Carrera[];
  profesoresDisponibles: Profesor[];
  periodosDisponibles: Periodo[];
  initialData?: NuevaAsignatura | null;
  isEditMode?: boolean;
  onDelete?: () => void;
};

const AddAsignaturaModal = ({ isOpen, onClose, onSave, carrerasDisponibles, profesoresDisponibles, periodosDisponibles, initialData = null, isEditMode = false, onDelete }: AddAsignaturaModalProps) => {
  const [nuevaAsignatura, setNuevaAsignatura] = useState<NuevaAsignatura>({
    nombre: '', año: '', id_periodo: '', id_carrera: '', id_profesor: ''
  });
  const [errores, setErrores] = useState({ nombre: '', año: '', periodo: '', carrera: '', profesor: '' });

  useEffect(() => {
    if (!isOpen) return;
    if (isEditMode && initialData) {
      const profId = (initialData as any)?.profesores_ids?.length > 0 ? (initialData as any).profesores_ids[0] : '';
      setNuevaAsignatura({
        nombre: initialData.nombre || '',
        año: initialData.año || (initialData as any).anio_dictado || '',
        id_periodo: initialData.id_periodo || '',
        id_carrera: initialData.id_carrera || '',
        id_profesor: profId
      });
    } else {
      setNuevaAsignatura({ nombre: '', año: '', id_periodo: '', id_carrera: '', id_profesor: '' });
    }
    setErrores({ nombre: '', año: '', periodo: '', carrera: '', profesor: '' });
  }, [isOpen, isEditMode, initialData]);

  if (!isOpen) return null;

  const añosDictado = ['Primer Año', 'Segundo Año', 'Tercer Año', 'Cuarto Año', 'Quinto Año', 'Sexto Año'];

  const validarCampos = () => {
    let erroresTemp = { nombre: '', año: '', periodo: '', carrera: '', profesor: '' };
    let esValido = true;

    // Restricción: Nombre >= 5
    if (nuevaAsignatura.nombre.trim().length < 5) {
      erroresTemp.nombre = "El nombre es obligatorio y debe tener al menos 5 caracteres.";
      esValido = false;
    }
    // Restricción: Año obligatorio
    if (!nuevaAsignatura.año) {
      erroresTemp.año = "Debe seleccionar un año de dictado.";
      esValido = false;
    }
    // Restricción: Periodo obligatorio
    if (!nuevaAsignatura.id_periodo) {
      erroresTemp.periodo = "Debe seleccionar un periodo.";
      esValido = false;
    }
    // Restricción: Carrera obligatoria
    if (!nuevaAsignatura.id_carrera) {
      erroresTemp.carrera = "Debe seleccionar una carrera.";
      esValido = false;
    }
    // Restricción: Profesor Titular
    if (!nuevaAsignatura.id_profesor) {
      erroresTemp.profesor = "Debe seleccionar un profesor titular.";
      esValido = false;
    }

    setErrores(erroresTemp);
    return esValido;
  };

  const confirmarGuardar = () => {
    if (validarCampos()) {
      const accion = isEditMode ? "modificar" : "agregar";
      if (window.confirm(`¿Desea ${accion} la asignatura "${nuevaAsignatura.nombre}"?`)) {
        const payload = {
          ...nuevaAsignatura,
          profesores_ids: [Number(nuevaAsignatura.id_profesor)]
        };
        onSave(payload as any);
        setNuevaAsignatura({ nombre: '', año: '', id_periodo: '', id_carrera: '', id_profesor: '' });
        setErrores({ nombre: '', año: '', periodo: '', carrera: '', profesor: '' });
      }
    }
  };

  const confirmarEliminar = () => {
    if (!onDelete) return;
    if (window.confirm(`¿Desea eliminar la asignatura "${nuevaAsignatura.nombre}"?`)) {
      onDelete();
    }
  };

  const confirmarCancelar = () => {
    if (window.confirm("¿Desea cancelar la operación?")) {
      setNuevaAsignatura({ nombre: '', año: '', id_periodo: '', id_carrera: '', id_profesor: '' });
      setErrores({ nombre: '', año: '', periodo: '', carrera: '', profesor: '' });
      onClose();
    }
  };

  return (
    <div style={overlayStyle}>
      <style>{`
        .checkbox-custom { appearance: none; width: 18px; height: 18px; border: 2px solid #cbd5e0; border-radius: 4px; background-color: #ffffff; cursor: pointer; display: inline-grid; place-content: center; transition: all 0.2s; }
        .checkbox-custom:checked { background-color: #3182ce; border-color: #3182ce; }
        .checkbox-custom:checked::before { content: "✔"; color: white; font-size: 12px; font-weight: bold; }
        .modal-input:focus, .modal-select:focus { border-color: #3182ce !important; box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.1); }
      `}</style>

      <div style={{ ...modalStyle, width: '500px' }}>
        <h2 style={titleStyle}>{isEditMode ? 'Editar Asignatura' : 'Nueva Asignatura'}</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div>
            <label style={labelStyle}>Nombre de la Asignatura *</label>
            <input className="modal-input" style={{ ...inputBaseStyle, border: `1px solid ${errores.nombre ? '#e53e3e' : '#e2e8f0'}` }} value={nuevaAsignatura.nombre} onChange={(e) => setNuevaAsignatura({ ...nuevaAsignatura, nombre: e.target.value })} placeholder="Ej: Ingeniería del Software II" />
            {errores.nombre && <p style={errorTextStyle}>{errores.nombre}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Año de Dictado *</label>
              <select className="modal-select" style={{ ...inputBaseStyle, border: `1px solid ${errores.año ? '#e53e3e' : '#e2e8f0'}` }} value={nuevaAsignatura.año} onChange={(e) => setNuevaAsignatura({ ...nuevaAsignatura, año: e.target.value })}>
                <option value="">Seleccionar...</option>
                {añosDictado.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {errores.año && <p style={errorTextStyle}>{errores.año}</p>}
            </div>
            <div>
              <label style={labelStyle}>Periodo *</label>
              <select className="modal-select" style={{ ...inputBaseStyle, border: `1px solid ${errores.periodo ? '#e53e3e' : '#e2e8f0'}` }} value={nuevaAsignatura.id_periodo} onChange={(e) => setNuevaAsignatura({ ...nuevaAsignatura, id_periodo: Number(e.target.value) })}>
                <option value="">Seleccionar...</option>
                {periodosDisponibles && periodosDisponibles.map(p => <option key={p.id_periodo} value={p.id_periodo}>{p.nombre}</option>)}
              </select>
              {errores.periodo && <p style={errorTextStyle}>{errores.periodo}</p>}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Carrera *</label>
            <select className="modal-select" style={{ ...inputBaseStyle, border: `1px solid ${errores.carrera ? '#e53e3e' : '#e2e8f0'}` }} value={nuevaAsignatura.id_carrera} onChange={(e) => setNuevaAsignatura({ ...nuevaAsignatura, id_carrera: e.target.value })}>
              <option value="">Seleccione una carrera...</option>
              {carrerasDisponibles.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            {errores.carrera && <p style={errorTextStyle}>{errores.carrera}</p>}
          </div>

          <div>
            <label style={labelStyle}>Profesor Titular *</label>
            <select className="modal-select" style={{ ...inputBaseStyle, border: `1px solid ${errores.profesor ? '#e53e3e' : '#e2e8f0'}` }} value={nuevaAsignatura.id_profesor} onChange={(e) => setNuevaAsignatura({ ...nuevaAsignatura, id_profesor: Number(e.target.value) })}>
              <option value="">Seleccione un profesor...</option>
              {profesoresDisponibles.map(p => <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>)}
            </select>
            {errores.profesor && <p style={errorTextStyle}>{errores.profesor}</p>}
          </div>
        </div>

        <div style={footerStyle}>
          {isEditMode && onDelete && (
            <button onClick={confirmarEliminar} style={btnDeleteStyle}>Eliminar</button>
          )}
          <button onClick={confirmarCancelar} style={btnCancelStyle}>Cancelar</button>
          <button onClick={confirmarGuardar} style={btnSaveStyle}>{isEditMode ? 'Guardar cambios' : 'Guardar Asignatura'}</button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle: React.CSSProperties = { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
const titleStyle: React.CSSProperties = { marginBottom: '20px', color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#4a5568', marginBottom: '5px' };
const inputBaseStyle: React.CSSProperties = { width: '100%', padding: '10px', borderRadius: '6px', outline: 'none', border: '1px solid #e2e8f0', fontSize: '0.9rem', backgroundColor: '#ffffff', color: '#1a202c' };
const inputDisabledStyle: React.CSSProperties = { ...inputBaseStyle, backgroundColor: '#fdfdfd', color: '#a0aec0', cursor: 'not-allowed' };
const errorTextStyle: React.CSSProperties = { color: '#e53e3e', fontSize: '0.7rem', marginTop: '4px' };
const footerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' };
const btnBase: React.CSSProperties = { padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' };
const btnCancelStyle: React.CSSProperties = { ...btnBase, backgroundColor: 'transparent', color: '#4a5568', border: '1px solid #e2e8f0' };
const btnDeleteStyle: React.CSSProperties = { ...btnBase, backgroundColor: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2' };
const btnSaveStyle: React.CSSProperties = { ...btnBase, backgroundColor: '#3182ce', color: 'white', border: 'none' };

export default AddAsignaturaModal;