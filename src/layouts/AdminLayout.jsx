"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOutUser } from '../services/authClientService';

const AdminLayout = ({ adminEmail, children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const getLinkStyle = (path) => ({
    padding: '12px 16px',
    borderRadius: '8px',
    color: 'white',
    textDecoration: 'none',
    backgroundColor: pathname === path ? '#334155' : 'transparent', // Highlight active route
    fontWeight: pathname === path ? '600' : '400',
    display: 'block',
    transition: 'background-color 0.2s',
  });

  const emailInitial = adminEmail ? adminEmail.charAt(0).toUpperCase() : '?';

  const handleLogout = async () => {
    try {
      await signOutUser();
      router.push('/auth/login');
    } catch (err) {
      console.error("Error al cerrar sesión", err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Fixed Left Sidebar with dark background #1e293b */}
      <aside style={{ width: '250px', backgroundColor: '#1e293b', color: 'white', padding: '24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ marginBottom: '40px', paddingLeft: '8px', fontSize: '1.5rem', fontWeight: 'bold' }}>SIC-UNNE</h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link href="/admin/reportes" style={getLinkStyle('/admin/reportes')}>Reportes</Link>
            <Link href="/admin/estructura" style={getLinkStyle('/admin/estructura')}>Estructura Académica</Link>
          </nav>
        </div>

        {/* Separated Config option at the bottom */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #334155', paddingTop: '16px' }}>
          <Link href="/admin/configuracion" style={getLinkStyle('/admin/configuracion')}>Configuración</Link>
        </nav>
      </aside>

      {/* Right Column (Header + Main Content) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          padding: '16px 30px', 
          backgroundColor: '#ffffff', 
          borderBottom: '1px solid #e2e8f0',
          gap: '24px'
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Avatar Circle */}
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              backgroundColor: '#e2e8f0', 
              color: '#2d3748',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}>
              {emailInitial}
            </div>
            {/* Email Label */}
            <span style={{ fontWeight: '500', color: '#4a5568', fontSize: '0.95rem' }}>
              {adminEmail || 'Cargando email...'}
            </span>
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: 'transparent', 
              color: '#e53e3e', 
              border: '1px solid #fc8181', 
              borderRadius: '6px', 
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.9rem'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fff5f5'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            Cerrar Sesión
          </button>
        </header>

        {/* Child Routes Content Area */}
        <main style={{ padding: '30px', flex: 1, backgroundColor: '#f7fafc' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
