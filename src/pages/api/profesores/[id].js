import { getSupabaseServer } from '../_lib/supabaseServer';

// =============================================================================
// API Route: /api/profesores/[id]  (Capa de Controladores)
//
//   PUT   /api/profesores/:id  body = { nombre, apellido, documento, correo }
//         → Actualiza los datos de un profesor.
//   PATCH /api/profesores/:id  body = { estado: boolean }
//         → Activa o desactiva un profesor.
// =============================================================================

export default async function handler(req, res) {
  const { id } = req.query;
  const idNum = Number(id);

  if (!Number.isInteger(idNum) || idNum <= 0) {
    return res.status(400).json({ error: "Parámetro 'id' inválido." });
  }

  const supabase = getSupabaseServer();

  try {
    if (req.method === 'PUT') {
      const { nombre, apellido, documento, correo } = req.body ?? {};
      if (!nombre?.trim() || !apellido?.trim() || !documento) {
        return res.status(400).json({ error: 'Los campos nombre, apellido y documento son obligatorios.' });
      }
      const { data, error } = await supabase
        .from('profesor')
        .update({ nombre: nombre.trim(), apellido: apellido.trim(), documento: Number(documento), correo: correo ?? null })
        .eq('id_profesor', idNum)
        .select()
        .single();
      if (error) return res.status(500).json({ data: null, error: error.message });
      return res.status(200).json({ data, error: null });
    }

    if (req.method === 'PATCH') {
      const { estado } = req.body ?? {};
      if (typeof estado !== 'boolean') {
        return res.status(400).json({ error: "El campo 'estado' debe ser boolean." });
      }
      const { error } = await supabase
        .from('profesor')
        .update({ estado })
        .eq('id_profesor', idNum);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ error: null });
    }

    res.setHeader('Allow', ['PUT', 'PATCH']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  } catch (err) {
    console.error(`[/api/profesores/${idNum}] Error inesperado:`, err);
    return res.status(500).json({ error: err.message ?? 'Error interno' });
  }
}
