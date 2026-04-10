"use client";
import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#f7fafc', // match the main content background
      fontFamily: 'sans-serif',
      color: '#2d3748',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '500px', backgroundColor: '#ffffff', padding: '50px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '5rem', fontWeight: 'bold', color: '#a0aec0', margin: 0, lineHeight: '1' }}>404</h1>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '10px', marginBottom: '20px', color: '#2d3748' }}>Página no encontrada</h2>
        <p style={{ color: '#4a5568', marginBottom: '35px', lineHeight: '1.6', fontSize: '1rem' }}>
          Lo sentimos, la página de administración a la que intentas acceder no existe, la dirección es incorrecta o fue movida a otra ubicación.
        </p>
        <Link 
          href="/admin/reportes" 
          style={{ 
            display: 'inline-block',
            padding: '12px 28px', 
            backgroundColor: '#1e293b', // Match Sidebar Dark
            color: '#ffffff', 
            textDecoration: 'none', 
            borderRadius: '6px', 
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#334155'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
