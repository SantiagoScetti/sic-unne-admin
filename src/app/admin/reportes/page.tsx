import { redirect } from "next/navigation";
import { getServerUser } from "@/src/services/authServerService";
import AdminLayout from "@/src/layouts/AdminLayout";
import ReportesPage from "@/src/pages/ReportesPage";
import { Suspense } from "react";

async function AuthCheck({ children }: { children: React.ReactNode }) {
  // Verify if the user is authenticated
  const { user, error } = await getServerUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return (
    <AdminLayout adminEmail={user?.email}>
      {children}
    </AdminLayout>
  );
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
