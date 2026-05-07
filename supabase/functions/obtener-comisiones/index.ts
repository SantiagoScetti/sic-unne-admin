// @ts-ignore
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// =============================================================================
// Edge Function: obtener-comisiones
// Trazabilidad: Diagrama de Secuencia C-02 (lectura)
// Responsabilidad: Consultar comisiones con sus relaciones anidadas y devolver
// un array de objetos planos normalizados al cliente.
// =============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // 1. Manejar la petición pre-flight de CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Leer filtroEstado del body (POST) o query param (GET)
    let filtroEstado = "Activos";
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      filtroEstado = body.filtroEstado ?? "Activos";
    } else {
      const url = new URL(req.url);
      filtroEstado = url.searchParams.get("filtroEstado") ?? "Activos";
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let query = supabaseAdmin.from("comision").select(`
      *,
      asignatura (
        *,
        carrera (
          *,
          facultad (*)
        )
      ),
      comision_profesor (
        profesor (*)
      )
    `);

    if (filtroEstado === "Activos")   query = query.eq("estado", true);
    if (filtroEstado === "Inactivos") query = query.eq("estado", false);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    // Normalizar a objetos planos (misma forma que esperaba el frontend)
    const planas = (data ?? []).map((com: Record<string, any>) => ({
      ...com,
      id_comision:            com.id_comision,
      nombreComision:         com.nombre,
      letraDesde:             com.letra_desde,
      letraHasta:             com.letra_hasta,
      nombreAsignatura:       com.asignatura?.nombre ?? "N/A",
      nombreFacultad:         com.asignatura?.carrera?.facultad?.nombre ?? "N/A",
      profesoresNombresArray: (com.comision_profesor ?? []).map(
        (cp: Record<string, any>) => `${cp.profesor?.nombre} ${cp.profesor?.apellido}`
      ),
    }));

    return new Response(
      JSON.stringify({ data: planas, error: null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json", "Connection": "keep-alive" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[obtener-comisiones] Error:", message);
    return new Response(
      JSON.stringify({ data: null, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
