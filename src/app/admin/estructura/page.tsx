import { redirect } from "next/navigation";
import { getServerUserWithRole } from "@/src/services/authServerService";
import AdminLayout from "@/src/layouts/AdminLayout";
import EstructuraPage from "@/src/pages/EstructuraPage";
import { Suspense } from "react";

async function AuthCheck({ children }: { children: React.ReactNode }) {
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
}

export default function AdminEstructuraRoute() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', color: '#4a5568' }}>Cargando sesión...</div>}>
      <AuthCheck>
        <EstructuraPage />
      </AuthCheck>
    </Suspense>
  );
}
