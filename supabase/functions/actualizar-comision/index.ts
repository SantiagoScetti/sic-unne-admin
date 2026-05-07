// @ts-ignore
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// =============================================================================
// Edge Function: actualizar-comision
// Trazabilidad: Diagrama de Secuencia (actualizar)
// Responsabilidad: Actualizar los datos base de una comisión y reemplazar
// atómicamente las relaciones en comision_profesor (delete + insert).
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
    const { id, comisionData } = await req.json();

    // --- Validaciones ---
    if (!id || isNaN(Number(id))) {
      return new Response(
        JSON.stringify({ error: "El campo 'id' es requerido y debe ser numérico." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!comisionData || !comisionData.nombre) {
      return new Response(
        JSON.stringify({ error: "El campo 'comisionData.nombre' es requerido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const row = {
      nombre:        comisionData.nombre,
      letra_desde:   comisionData.letraDesde ?? comisionData.letra_desde,
      letra_hasta:   comisionData.letraHasta ?? comisionData.letra_hasta,
      id_asignatura: Number(comisionData.id_asignatura),
    };

    // PASO 1: Actualizar datos base de la comisión
    const { data, error: errUpdate } = await supabaseAdmin
      .from("comision")
      .update(row)
      .eq("id_comision", Number(id))
      .select()
      .single();

    if (errUpdate) throw new Error(errUpdate.message);

    // PASO 2: Eliminar relaciones anteriores en N:M
    const { error: errDelete } = await supabaseAdmin
      .from("comision_profesor")
      .delete()
      .eq("id_comision", Number(id));

    if (errDelete) throw new Error(errDelete.message);

    // PASO 3: Insertar nuevas relaciones
    if (Array.isArray(comisionData.profesores_ids) && comisionData.profesores_ids.length > 0) {
      const relaciones = comisionData.profesores_ids.map((id_profesor: number) => ({
        id_comision: Number(id),
        id_profesor,
      }));

      const { error: errInsert } = await supabaseAdmin
        .from("comision_profesor")
        .insert(relaciones);

      if (errInsert) throw new Error(errInsert.message);
    }

    return new Response(
      JSON.stringify({ data, error: null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json", "Connection": "keep-alive" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[actualizar-comision] Error:", message);
    return new Response(
      JSON.stringify({ data: null, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
