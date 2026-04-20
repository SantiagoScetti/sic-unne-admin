import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const getReportes = async () => {
  const { data, error } = await supabase
    .from('reporte')
    .select(`
      id_reporte,
      motivo,
      estado,
      fecha_alta,
      resolucion_admin,
      emisor:usuario!emisor_id (
        nombre,
        apellido
      ),
      receptor:usuario!receptor_id (
        nombre,
        apellido
      )
    `)
    .order('fecha_alta', { ascending: false });

  if (error) {
    console.error('Error fetching reportes:', error);
    throw new Error(error.message);
  }

  return data;
};
