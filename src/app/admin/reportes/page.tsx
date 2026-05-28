import { redirect } from "next/navigation";
import { getServerUserWithRole } from "@/src/services/auth/authServerService";
import AdminLayout from "@/src/layouts/AdminLayout";
import ReportesPage from "@/src/pages/ReportesPage";
import { Suspense } from "react";

async function AuthCheck({ children }: { children: React.ReactNode }) {
  try {
    const { user, rol, error } = await getServerUserWithRole();

    // 1. Not authenticated → login
    if (error || !user) {
      redirect("/auth/login");
    }

    // 2. Authenticated but not an admin → access denied
    if (rol !== 'Administrador') {
      redirect("/unauthorized");
    }

    return (
      <AdminLayout adminEmail={user?.email}>
        {children}
      </AdminLayout>
    );
  } catch (err: any) {
    // If it's a redirect error or dynamic/prerender cookie error from Next.js, we must rethrow it!
    if (
      err.message === "NEXT_REDIRECT" || 
      err.digest?.startsWith("NEXT_REDIRECT") ||
      err.message?.includes("During prerendering") ||
      err.digest === "HANGING_PROMISE_REJECTION" ||
      err.digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw err;
    }
    
    console.error("Error in AuthCheck:", err);
    
    return (
      <div style={{
        padding: '30px',
        margin: '20px',
        backgroundColor: '#fff5f5',
        border: '1px solid #feb2b2',
        borderRadius: '8px',
        color: '#c53030',
        fontFamily: 'sans-serif'
      }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>
          Error de Autenticación / Conexión
        </h2>
        <p style={{ fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '15px' }}>
          No se pudo verificar tu sesión de administrador. Esto puede deberse a que la base de datos de Supabase no está accesible o que no has reiniciado el servidor después de configurar tu archivo <code>.env.local</code>.
        </p>
        <div style={{ fontSize: '0.85rem', backgroundColor: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #fed7d7', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
          {err.message || String(err)}
        </div>
        <a href="/auth/login" style={{ display: 'inline-block', marginTop: '15px', padding: '8px 16px', backgroundColor: '#c53030', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600' }}>
          Reintentar Inicio de Sesión
        </a>
      </div>
    );
  }
}

export default function AdminReportesRoute() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', color: '#4a5568' }}>Cargando sesión...</div>}>
      <AuthCheck>
        <ReportesPage />
      </AuthCheck>
    </Suspense>
  );
}
