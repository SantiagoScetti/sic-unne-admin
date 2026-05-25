"use client";
import React, { useEffect, useState } from 'react';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Usuario = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  documento?: string;
};

export type Reporte = {
  id_reporte: number;
  motivo: string;
  estado: string;
  fecha_alta: string;
  resolucion_admin?: string;
  accion_tomada?: string;
  emisor_id?: number | null;   // null = Sistema
  receptor_id: number;
  emisor?: Usuario | null;     // null = Sistema
  receptor?: Usuario | null;
};

export type AccionReporte = {
  accion: 'Suspender Temporalmente' | 'Suspender Indefinidamente' | 'Enviar aviso';
  fechaHasta?: string;
  observaciones: string;
};

type AccionReporteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accion: AccionReporte) => void;
  onEliminar?: () => void;
  reporte: Reporte | null;
  isSaving?: boolean;
};

// ─── Componente ──────────────────────────────────────────────────────────────

const AccionReporteModal = ({
  isOpen,
  onClose,
  onSave,
  onEliminar,
  reporte,
  isSaving = false,
}: AccionReporteModalProps) => {

  const [accion, setAccion] = useState<AccionReporte['accion']>('Enviar aviso');
  const [fechaHasta, setFechaHasta] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [errores, setErrores] = useState({ accion: '', fechaHasta: '', observaciones: '' });

  // Reset al abrir
  useEffect(() => {
    if (!isOpen) return;
    setAccion('Enviar aviso');
    setFechaHasta('');
    setObservaciones('');
    setErrores({ accion: '', fechaHasta: '', observaciones: '' });
  }, [isOpen, reporte]);

  if (!isOpen || !reporte) return null;

  // ── Datos derivados ──
  const esEmisoresSistema = !reporte.emisor_id || !reporte.emisor;
  const reportadoPor = esEmisoresSistema
    ? 'Sistema'
    : `${reporte.emisor!.apellido}, ${reporte.emisor!.nombre}${reporte.emisor!.documento ? ` — DNI ${reporte.emisor!.documento}` : ''}`;

  const receptor = reporte.receptor;
  const reportadoA = receptor
    ? `${receptor.apellido}, ${receptor.nombre}${receptor.documento ? ` — DNI ${receptor.documento}` : ''}`
    : 'Usuario desconocido';

  const fechaReporte = new Date(reporte.fecha_alta).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const hoy = new Date().toISOString().split('T')[0];

  // ── Validación ──
  const validar = () => {
    const e = { accion: '', fechaHasta: '', observaciones: '' };
    let ok = true;

    if (!accion) {
      e.accion = 'Debe seleccionar una acción.';
      ok = false;
    }
    if (accion === 'Suspender Temporalmente') {
      if (!fechaHasta) {
        e.fechaHasta = 'Debe indicar la fecha hasta.';
        ok = false;
      } else if (fechaHasta <= hoy) {
        e.fechaHasta = 'La fecha debe ser posterior a hoy.';
        ok = false;
      }
    }

    setErrores(e);
    return ok;
  };

  const confirmarGuardar = () => {
    if (!validar()) return;
    const accionLabel = accion === 'Suspender Temporalmente' && fechaHasta
      ? `${accion} hasta ${fechaHasta}`
      : accion;
    if (!window.confirm(`¿Desea aplicar "${accionLabel}" al estudiante ${receptor?.nombre} ${receptor?.apellido}?`)) return;
    onSave({ accion, fechaHasta: accion === 'Suspender Temporalmente' ? fechaHasta : undefined, observaciones });
  };

  const confirmarEliminar = () => {
    if (!onEliminar) return;
    if (!window.confirm(`¿Desea eliminar el reporte #${reporte.id_reporte}? Esta acción no se puede deshacer.`)) return;
    onEliminar();
  };

  const confirmarCancelar = () => {
    if (!window.confirm('¿Desea cancelar la operación?')) return;
    onClose();
  };

  // ── Badge de estado ──
  const badgeColor: Record<string, { bg: string; color: string }> = {
    'Pendiente':   { bg: '#fefcbf', color: '#975a16' },
    'En Revision': { bg: '#bee3f8', color: '#2b6cb0' },
    'Resuelto':    { bg: '#c6f6d5', color: '#22543d' },
    'Desestimado': { bg: '#e2e8f0', color: '#4a5568' },
  };
  const badge = badgeColor[reporte.estado] ?? badgeColor['Desestimado'];

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={overlayStyle}>
      <style>{`
        .ar-input:focus, .ar-select:focus, .ar-textarea:focus {
          border-color: #3182ce !important;
          box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.12);
          outline: none;
        }
        .ar-input::placeholder, .ar-textarea::placeholder { color: #a0aec0; }
        .ar-radio:checked { accent-color: #3182ce; }
      `}</style>

      <div style={{ ...modalStyle, width: '520px', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* ── Título + badge ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
          <h2 style={{ margin: 0, color: '#2d3748', fontSize: '1.2rem' }}>
            Gestionar Reporte <span style={{ color: '#718096', fontWeight: '400' }}>#{reporte.id_reporte}</span>
          </h2>
          <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', backgroundColor: badge.bg, color: badge.color }}>
            {reporte.estado}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* ── Quién reportó ── */}
          <div style={infoBlockStyle}>
            <p style={infoLabelStyle}>Reportado por</p>
            <p style={infoValueStyle}>
              {esEmisoresSistema
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1rem' }}>🤖</span> Sistema automático
                  </span>
                : reportadoPor}
            </p>
          </div>

          {/* ── A quién se reportó ── */}
          <div style={infoBlockStyle}>
            <p style={infoLabelStyle}>Estudiante reportado</p>
            <p style={{ ...infoValueStyle, color: '#c53030' }}>{reportadoA}</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#a0aec0' }}>Fecha del reporte: {fechaReporte}</p>
          </div>

          {/* ── Descripción / motivo ── */}
          <div>
            <label style={labelStyle}>Descripción del reporte</label>
            <div style={{ ...inputBaseStyle, minHeight: '70px', backgroundColor: '#f8fafc', color: '#4a5568', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
              {reporte.motivo || <span style={{ fontStyle: 'italic', color: '#a0aec0' }}>Sin descripción</span>}
            </div>
          </div>

          {/* ── Separador ── */}
          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '4px 0' }} />

          {/* ── Acción a tomar ── */}
          <div>
            <label style={labelStyle}>Acción a tomar *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              {(['Enviar aviso', 'Suspender Temporalmente', 'Suspender Indefinidamente'] as const).map((op) => (
                <label
                  key={op}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                    border: `1.5px solid ${accion === op ? '#3182ce' : '#e2e8f0'}`,
                    backgroundColor: accion === op ? '#ebf8ff' : '#ffffff',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    className="ar-radio"
                    name="accion"
                    value={op}
                    checked={accion === op}
                    onChange={() => { setAccion(op); setFechaHasta(''); setErrores(e => ({ ...e, accion: '', fechaHasta: '' })); }}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: accion === op ? '600' : '400', color: accion === op ? '#2b6cb0' : '#4a5568' }}>
                    {op === 'Enviar aviso' && '📢 '}
                    {op === 'Suspender Temporalmente' && '⏸️ '}
                    {op === 'Suspender Indefinidamente' && '🚫 '}
                    {op}
                  </span>
                </label>
              ))}
            </div>
            {errores.accion && <p style={errorTextStyle}>{errores.accion}</p>}
          </div>

          {/* ── Fecha hasta (solo si suspensión temporal) ── */}
          {accion === 'Suspender Temporalmente' && (
            <div style={{ paddingLeft: '8px', borderLeft: '3px solid #3182ce' }}>
              <label style={labelStyle}>Suspender hasta *</label>
              <input
                type="date"
                className="ar-input"
                min={hoy}
                value={fechaHasta}
                onChange={(e) => { setFechaHasta(e.target.value); setErrores(err => ({ ...err, fechaHasta: '' })); }}
                style={{ ...inputBaseStyle, border: `1px solid ${errores.fechaHasta ? '#e53e3e' : '#e2e8f0'}` }}
              />
              {errores.fechaHasta && <p style={errorTextStyle}>{errores.fechaHasta}</p>}
            </div>
          )}

          {/* ── Observaciones ── */}
          <div>
            <label style={labelStyle}>Observaciones del administrador</label>
            <textarea
              className="ar-textarea"
              placeholder="Ej: El estudiante fue notificado y tiene plazo para apelar..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              style={{ ...inputBaseStyle, resize: 'vertical', lineHeight: '1.5', border: '1px solid #e2e8f0' }}
            />
          </div>

          {/* ── Aviso de notificación ── */}
          <div style={{ backgroundColor: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: '8px', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1rem', marginTop: '1px' }}>📬</span>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#2b6cb0', lineHeight: '1.5' }}>
              <strong>Aviso:</strong> Al confirmar esta acción,{' '}
              {esEmisoresSistema
                ? 'el estudiante reportado será notificado automáticamente.'
                : 'tanto el estudiante reportado como quien realizó el reporte serán notificados automáticamente.'}
            </p>
          </div>

        </div>{/* fin columna */}

        {/* ── Footer ── */}
        <div style={footerStyle}>
          {onEliminar && (
            <button
              onClick={confirmarEliminar}
              disabled={isSaving}
              style={btnDeleteStyle}
            >
              Eliminar reporte
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button
            onClick={confirmarCancelar}
            disabled={isSaving}
            style={{ ...btnCancelStyle, opacity: isSaving ? 0.5 : 1 }}
          >
            Cancelar
          </button>
          <button
            onClick={confirmarGuardar}
            disabled={isSaving}
            style={{ ...btnSaveStyle, opacity: isSaving ? 0.8 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
          >
            {isSaving ? '⏳ Guardando...' : 'Aplicar acción'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Estilos (consistentes con los demás modales del sistema) ────────────────
const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
  justifyContent: 'center', alignItems: 'center', zIndex: 1000,
};
const modalStyle: React.CSSProperties = {
  backgroundColor: 'white', padding: '30px', borderRadius: '12px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.85rem', fontWeight: '600',
  color: '#4a5568', marginBottom: '6px',
};
const inputBaseStyle: React.CSSProperties = {
  width: '100%', padding: '10px', borderRadius: '6px',
  border: '1px solid #e2e8f0', fontSize: '0.95rem',
  backgroundColor: '#ffffff', color: '#1a202c',
  boxSizing: 'border-box' as const,
};
const infoBlockStyle: React.CSSProperties = {
  backgroundColor: '#f8fafc', borderRadius: '8px',
  padding: '12px 14px', border: '1px solid #e2e8f0',
};
const infoLabelStyle: React.CSSProperties = {
  margin: '0 0 4px', fontSize: '0.75rem', fontWeight: '700',
  color: '#718096', textTransform: 'uppercase' as const, letterSpacing: '0.05em',
};
const infoValueStyle: React.CSSProperties = {
  margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#2d3748',
};
const errorTextStyle: React.CSSProperties = {
  color: '#e53e3e', fontSize: '0.75rem', marginTop: '4px',
};
const footerStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px', marginTop: '28px',
};
const btnBase: React.CSSProperties = {
  padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer',
};
const btnCancelStyle: React.CSSProperties = {
  ...btnBase, backgroundColor: 'transparent', color: '#4a5568', border: '1px solid #e2e8f0',
};
const btnDeleteStyle: React.CSSProperties = {
  ...btnBase, backgroundColor: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2',
};
const btnSaveStyle: React.CSSProperties = {
  ...btnBase, backgroundColor: '#3182ce', color: 'white', border: 'none',
};

export default AccionReporteModal;
