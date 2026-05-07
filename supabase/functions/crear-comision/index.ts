// @ts-ignore
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// =============================================================================
// Edge Function: crear-comision
// Trazabilidad: Diagrama de Secuencia C-02
// Responsabilidad: Recibir los datos de una nueva comisión, insertar el
// registro en la tabla `comision` y vincular los profesores en `comision_profesor`.
// Todo ocurre en el servidor con privilegios de service_role.
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

  // Solo aceptar POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Parsear el body
    const { nombre, letraDesde, letraHasta, id_asignatura, profesores_ids } =
      await req.json();

    // --- Validaciones básicas ---
    if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
      return new Response(
        JSON.stringify({ error: "El campo 'nombre' es requerido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!letraDesde || !letraHasta) {
      return new Response(
        JSON.stringify({ error: "Los campos 'letraDesde' y 'letraHasta' son requeridos." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!id_asignatura) {
      return new Response(
        JSON.stringify({ error: "El campo 'id_asignatura' es requerido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Crear cliente con service_role para bypass de RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // --- PASO 1: Insertar la comisión ---
    const { data: comision, error: errComision } = await supabaseAdmin
      .from("comision")
      .insert([
        {
          nombre: nombre.trim(),
          letra_desde: letraDesde,
          letra_hasta: letraHasta,
          id_asignatura: Number(id_asignatura),
          estado: true,
        },
      ])
      .select()
      .single();

    if (errComision) {
      console.error("[crear-comision] Error insertando comisión:", errComision);
      return new Response(
        JSON.stringify({ error: errComision.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- PASO 2: Insertar relaciones comision_profesor ---
    if (
      Array.isArray(profesores_ids) &&
      profesores_ids.length > 0
    ) {
      const relaciones = profesores_ids.map((id_profesor: number) => ({
        id_comision: comision.id_comision,
        id_profesor,
      }));

      const { error: errRelaciones } = await supabaseAdmin
        .from("comision_profesor")
        .insert(relaciones);

      if (errRelaciones) {
        console.error(
          "[crear-comision] Error insertando relaciones comision_profesor:",
          errRelaciones
        );
        // La comisión ya fue creada; devolvemos error pero con el id para que el
        // cliente pueda informar el estado parcial.
        return new Response(
          JSON.stringify({
            error: `Comisión creada (id=${comision.id_comision}) pero falló la vinculación de profesores: ${errRelaciones.message}`,
            comision,
          }),
          { status: 207, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // --- Respuesta exitosa ---
    return new Response(
      JSON.stringify({ data: comision, error: null }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Connection": "keep-alive" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[crear-comision] Error inesperado:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
