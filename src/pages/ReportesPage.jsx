"use client";
import React, { useState, useEffect } from 'react';
// C-01: imports trazables con el diagrama de secuencia — un import por objeto del dominio
import { obtenerReportes, obtenerReportesFiltrados, obtenerDetalleReporte, actualizarEstado } from '../services/reporte.service';
import { actualizarFechaSuspension } from '../services/usuario.service';
import { registrar } from '../services/auditoriaAdministrativa.service';
import { notificar } from '../services/notificacion.service';

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
      return { ...baseStyle, backgroundColor: '#fefcbf', color: '#975a16' }; // yellow
    case 'Resuelto':
      return { ...baseStyle, backgroundColor: '#c6f6d5', color: '#22543d' }; // green
    case 'Desestimado':
      return { ...baseStyle, backgroundColor: '#e2e8f0', color: '#4a5568' }; // gray
    case 'En Revision':
      return { ...baseStyle, backgroundColor: '#bee3f8', color: '#2b6cb0' }; // blue
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

const ReportesPage = () => {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await obtenerReportes();
        setReportes(data || []);
      } catch (err) {
        console.error("Failed to load reportes", err);
        setError("Ocurrió un error al cargar los reportes. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportes();
  }, []);

  // Calculate summary stats
  const totalReportes = reportes.length;
  const pendientesCount = reportes.filter(r => r.estado === 'Pendiente').length;
  const resueltosCount = reportes.filter(r => r.estado === 'Resuelto').length;

  // Filter reportes client-side
  const reportesFiltrados = reportes.filter(r => {
    if (filtroEstado === 'Todos') return true;
    return r.estado === filtroEstado;
  });

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '20px', color: '#2d3748' }}>Gestión de Reportes</h1>
      
      {error && (
        <div style={{ backgroundColor: '#fed7d7', color: '#c53030', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <strong>Error: </strong>{error}
        </div>
      )}

      {/* Summary Stats Bar */}
      {!loading && !error && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
          <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #4a5568' }}>
            <p style={{ margin: 0, color: '#718096', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase' }}>Total de Reportes</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748' }}>{totalReportes}</p>
          </div>
          <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #d69e2e' }}>
            <p style={{ margin: 0, color: '#718096', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase' }}>Pendientes</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748' }}>{pendientesCount}</p>
          </div>
          <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #38a169' }}>
            <p style={{ margin: 0, color: '#718096', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase' }}>Resueltos</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748' }}>{resueltosCount}</p>
          </div>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Controls Bar (Filter) */}
          {!error && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label htmlFor="filtro-estado" style={{ fontWeight: '500', color: '#4a5568', fontSize: '0.875rem' }}>Filtrar por estado:</label>
                <select 
                  id="filtro-estado"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
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

          {/* Reportes Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600' }}>ID</th>
                  <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600' }}>Usuario Reportado</th>
                  <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600' }}>Motivo</th>
                  <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600' }}>Descripción</th>
                  <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600' }}>Estado</th>
                  <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600' }}>Fecha Reporte</th>
                  <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reportesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>
                      No se encontraron reportes para los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  reportesFiltrados.map((reporte) => {
                    const nombreReportado = reporte.receptor ? `${reporte.receptor.nombre} ${reporte.receptor.apellido}` : 'Usuario Desconocido';
                    const fechaFormat = new Date(reporte.fecha_alta).toLocaleDateString('es-AR');
                    
                    return (
                      <tr key={reporte.id_reporte} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '15px', color: '#718096' }}>{reporte.id_reporte}</td>
                        <td style={{ padding: '15px', fontWeight: '500', color: '#2d3748' }}>{nombreReportado}</td>
                        <td style={{ padding: '15px', color: '#4a5568' }}>{reporte.motivo}</td>
                        <td style={{ padding: '15px', color: '#718096', fontSize: '0.875rem' }}>
                          {reporte.resolucion_admin || <span style={{ fontStyle: 'italic', color: '#a0aec0' }}>Sin descripción</span>}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span style={getEstadoBadgeStyle(reporte.estado)}>
                            {reporte.estado}
                          </span>
                        </td>
                        <td style={{ padding: '15px', color: '#718096' }}>{fechaFormat}</td>
                        <td style={{ padding: '15px', textAlign: 'right' }}>
                          <button 
                            onClick={() => console.log('Abrir reporte id:', reporte.id_reporte)}
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
    </div>
  );
};

export default ReportesPage;
