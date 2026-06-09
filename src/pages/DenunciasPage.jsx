"use client";
import React, { useState, useEffect } from 'react';
import { obtenerDenuncias, obtenerDenunciasFiltradas, resolverDenuncia, obtenerEstadisticas } from '../services/denuncias/denuncia.service';
import AccionDenunciaModal from '../components/features/modals/accionDenunciaModal';

const getEstadoBadgeStyle = (estado) => {
  const baseStyle = {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'inline-block'
  };

  switch (estado) {
    case 'Pendiente':
      return { ...baseStyle, backgroundColor: '#fefcbf', color: '#975a16' };
    case 'Resuelto':
      return { ...baseStyle, backgroundColor: '#c6f6d5', color: '#22543d' };
    case 'Desestimado':
      return { ...baseStyle, backgroundColor: '#e2e8f0', color: '#4a5568' };
    default:
      return { ...baseStyle, backgroundColor: '#e2e8f0', color: '#4a5568' };
  }
};

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #e2e8f0',
      borderTop: '4px solid #4a5568',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

const DenunciasPage = () => {
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [denunciaSeleccionada, setDenunciaSeleccionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [estadisticas, setEstadisticas] = useState([]);

  // Carga las tarjetas desde la función almacenada fn_contar_denuncias_por_estado.
  const cargarEstadisticas = async () => {
    try {
      const stats = await obtenerEstadisticas();
      setEstadisticas(stats || []);
    } catch (err) {
      console.error("Failed to load estadisticas", err);
    }
  };

  useEffect(() => {
    const fetchDenuncias = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await obtenerDenuncias();
        setDenuncias(data || []);
        await cargarEstadisticas();
      } catch (err) {
        console.error("Failed to load denuncias", err);
        setError("Ocurrió un error al cargar las denuncias. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchDenuncias();
  }, []);

  // Las tarjetas se calculan con el stored procedure (cuenta el total real en la
  // base, sin importar el filtro aplicado a la tabla).
  const cantidadPorEstado = (estado) =>
    estadisticas.find((e) => e.estado === estado)?.cantidad ?? 0;
  const totalDenuncias = estadisticas.reduce((suma, e) => suma + e.cantidad, 0);
  const pendientesCount = cantidadPorEstado('Pendiente');
  const resueltosCount = cantidadPorEstado('Resuelto');

  const handleCambioFiltro = async (estado) => {
    setFiltroEstado(estado);
    if (estado === 'Todos') {
      const data = await obtenerDenuncias();
      setDenuncias(data || []);
    } else {
      const data = await obtenerDenunciasFiltradas(estado);
      setDenuncias(data || []);
    }
  };

  const handleAbrirModal = (denuncia) => {
    setDenunciaSeleccionada(denuncia);
    setIsModalOpen(true);
  };

  const refrescarLista = async () => {
    const data = filtroEstado === 'Todos'
      ? await obtenerDenuncias()
      : await obtenerDenunciasFiltradas(filtroEstado);
    setDenuncias(data || []);
    await cargarEstadisticas();
  };

  const handleGuardarAccion = async ({ accion, fechaHasta, observaciones }) => {
    if (!denunciaSeleccionada) return;
    setIsSaving(true);
    try {
      await resolverDenuncia(denunciaSeleccionada.id_denuncia, {
        estado: 'Resuelto',
        accion,
        fechaHasta,
        observaciones,
      });

      setIsModalOpen(false);
      setDenunciaSeleccionada(null);
      setSuccessMsg(`Acción "${accion}" aplicada con éxito`);
      setTimeout(() => setSuccessMsg(''), 3500);
      await refrescarLista();
    } catch (err) {
      if (err.message === 'CONFLIC_ALREADY_PROCESSED') {
        setError("Esta denuncia ya ha sido procesada por otro administrador. Por favor, recargá la página.");
        setIsModalOpen(false);
        setDenunciaSeleccionada(null);
        await refrescarLista();
      } else {
        setError(`Error al guardar la acción: ${err.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDesestimarDenuncia = async () => {
    if (!denunciaSeleccionada) return;
    setIsSaving(true);
    try {
      await resolverDenuncia(denunciaSeleccionada.id_denuncia, {
        estado: 'Desestimado',
        observaciones: '',
      });
      setIsModalOpen(false);
      setDenunciaSeleccionada(null);
      setSuccessMsg('Denuncia desestimada correctamente');
      setTimeout(() => setSuccessMsg(''), 3500);
      await refrescarLista();
    } catch (err) {
      if (err.message === 'CONFLIC_ALREADY_PROCESSED') {
        setError("Esta denuncia ya ha sido procesada por otro administrador. Por favor, recargá la página.");
        setIsModalOpen(false);
        setDenunciaSeleccionada(null);
        await refrescarLista();
      } else {
        setError(`Error al desestimar la denuncia: ${err.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {successMsg && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#38a169', color: 'white', padding: '12px 24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2000 }}>
          <span>✅</span><span style={{ fontWeight: '600' }}>{successMsg}</span>
        </div>
      )}
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '20px', color: '#2d3748' }}>Gestión de Denuncias</h1>

      {error && (
        <div style={{ backgroundColor: '#fed7d7', color: '#c53030', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <strong>Error: </strong>{error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
          <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #4a5568' }}>
            <p style={{ margin: 0, color: '#718096', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase' }}>Total de Denuncias</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748' }}>{totalDenuncias}</p>
          </div>
          <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #d69e2e' }}>
            <p style={{ margin: 0, color: '#718096', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase' }}>Pendientes</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748' }}>{pendientesCount}</p>
          </div>
          <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #38a169' }}>
            <p style={{ margin: 0, color: '#718096', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase' }}>Resueltas</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748' }}>{resueltosCount}</p>
          </div>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <>
          {!error && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label htmlFor="filtro-estado" style={{ fontWeight: '500', color: '#4a5568', fontSize: '0.875rem' }}>Filtrar por estado:</label>
                <select
                  id="filtro-estado"
                  value={filtroEstado}
                  onChange={(e) => handleCambioFiltro(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', color: '#2d3748', outline: 'none' }}
                >
                  <option value="Todos">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Resuelto">Resuelto</option>
                  <option value="Desestimado">Desestimado</option>
                </select>
              </div>
            </div>
          )}

          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600' }}>ID</th>
                  <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600' }}>Usuario Denunciado</th>
                  <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600' }}>Motivo</th>
                  <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600' }}>Descripción</th>
                  <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600' }}>Estado</th>
                  <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600' }}>Fecha Denuncia</th>
                  <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {denuncias.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>
                      No se encontraron denuncias para los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  denuncias.map((denuncia) => {
                    const nombreDenunciado = denuncia.receptor ? `${denuncia.receptor.nombre} ${denuncia.receptor.apellido}` : 'Usuario Desconocido';
                    const fechaFormat = new Date(denuncia.fecha_alta).toLocaleDateString('es-AR');

                    return (
                      <tr key={denuncia.id_denuncia} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '15px', color: '#718096' }}>{denuncia.id_denuncia}</td>
                        <td style={{ padding: '15px', fontWeight: '500', color: '#2d3748' }}>{nombreDenunciado}</td>
                        <td style={{ padding: '15px', color: '#4a5568' }}>{denuncia.motivo}</td>
                        <td style={{ padding: '15px', color: '#718096', fontSize: '0.875rem' }}>
                          {denuncia.accion_tomada || <span style={{ fontStyle: 'italic', color: '#a0aec0' }}>Sin descripción</span>}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span style={getEstadoBadgeStyle(denuncia.estado)}>
                            {denuncia.estado}
                          </span>
                        </td>
                        <td style={{ padding: '15px', color: '#718096' }}>{fechaFormat}</td>
                        <td style={{ padding: '15px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleAbrirModal(denuncia)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#edf2f7',
                              color: '#4a5568',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#edf2f7'}
                          >
                            Abrir
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <AccionDenunciaModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setDenunciaSeleccionada(null); }}
        onSave={handleGuardarAccion}
        onEliminar={handleDesestimarDenuncia}
        denuncia={denunciaSeleccionada}
        isSaving={isSaving}
      />
    </div>
  );
};

export default DenunciasPage;
