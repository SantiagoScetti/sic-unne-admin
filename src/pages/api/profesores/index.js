import { getSupabaseServer } from '../_lib/supabaseServer';

// =============================================================================
// API Route: /api/profesores  (Capa de Controladores)
//
//   GET  /api/profesores?filtroEstado=Activos|Inactivos|Todos
//        → Lista de profesores con total de asignaciones (comision_profesor count).
//   POST /api/profesores  body = { nombre, apellido, documento, correo }
//        → Crea un nuevo profesor.
// =============================================================================

export default async function handler(req, res) {
  try {
    if (req.method === 'GET')  return await handleGet(req, res);
    if (req.method === 'POST') return await handlePost(req, res);

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  } catch (err) {
    console.error('[/api/profesores] Error inesperado:', err);
    return res.status(500).json({ error: err.message ?? 'Error interno' });
  }
}

async function handleGet(req, res) {
  const filtroEstado = req.query.filtroEstado ?? 'Activos';
  const supabase = getSupabaseServer();

  let query = supabase
    .from('profesor')
    .select('*, comision_profesor(count)')
    .order('apellido', { ascending: true });

  if (filtroEstado === 'Activos')   query = query.eq('estado', true);
  if (filtroEstado === 'Inactivos') query = query.eq('estado', false);

  const { data, error } = await query;
  if (error) return res.status(500).json({ data: null, error: error.message });

  const planos = data.map((p) => ({
    ...p,
    totalAsignaciones: p.comision_profesor?.[0]?.count ?? 0,
  }));

  return res.status(200).json({ data: planos, error: null });
}

async function handlePost(req, res) {
  const { nombre, apellido, documento, correo } = req.body ?? {};

  if (!nombre?.trim() || !apellido?.trim() || !documento) {
    return res.status(400).json({ error: 'Los campos nombre, apellido y documento son obligatorios.' });
  }

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('profesor')
    .insert([{ nombre: nombre.trim(), apellido: apellido.trim(), documento: Number(documento), correo: correo ?? null, estado: true }])
    .select()
    .single();

  if (error) return res.status(500).json({ data: null, error: error.message });
  return res.status(201).json({ data, error: null });
}
