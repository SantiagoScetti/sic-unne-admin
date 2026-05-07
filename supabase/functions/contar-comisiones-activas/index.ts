// @ts-ignore
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// =============================================================================
// Edge Function: contar-comisiones-activas
// Responsabilidad: Contar las comisiones con estado=true.
// Auxiliar para dashboards administrativos.
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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { count, error } = await supabaseAdmin
      .from("comision")
      .select("*", { count: "exact", head: true })
      .eq("estado", true);

    if (error) throw new Error(error.message);

    return new Response(
      JSON.stringify({ data: count ?? 0, error: null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json", "Connection": "keep-alive" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[contar-comisiones-activas] Error:", message);
    return new Response(
      JSON.stringify({ data: 0, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
