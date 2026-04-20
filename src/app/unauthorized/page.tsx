export default function UnauthorizedPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      backgroundColor: '#f7fafc',
      gap: '16px',
      textAlign: 'center',
      padding: '40px'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#fff5f5',
        border: '2px solid #fc8181',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem'
      }}>
        🚫
      </div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2d3748', margin: 0 }}>
        Acceso Denegado
      </h1>
      <p style={{ color: '#718096', fontSize: '1rem', maxWidth: '420px', margin: 0 }}>
        No tenés permisos para acceder a esta sección. Esta área está reservada exclusivamente para administradores del sistema.
      </p>
      <a
        href="/auth/login"
        style={{
          marginTop: '8px',
          padding: '10px 24px',
          backgroundColor: '#1e293b',
          color: 'white',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '0.95rem'
        }}
      >
        Volver al inicio de sesión
      </a>
    </div>
  );
}
