import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// =============================================================================
// Edge Function: cambiar-estado-comision
// Trazabilidad: Diagrama de Secuencia (cambiarEstado)
// Responsabilidad: Activar o desactivar una comisión por su ID.
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

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { id, estado } = await req.json();

    // --- Validaciones ---
    if (!id || isNaN(Number(id))) {
      return new Response(
        JSON.stringify({ error: "El campo 'id' es requerido y debe ser numérico." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (typeof estado !== "boolean") {
      return new Response(
        JSON.stringify({ error: "El campo 'estado' es requerido y debe ser booleano." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error } = await supabaseAdmin
      .from("comision")
      .update({ estado })
      .eq("id_comision", Number(id));

    if (error) throw new Error(error.message);

    return new Response(
      JSON.stringify({ error: null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json", "Connection": "keep-alive" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cambiar-estado-comision] Error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
