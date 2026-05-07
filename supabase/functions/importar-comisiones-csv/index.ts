// @ts-ignore
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// =============================================================================
// Edge Function: importar-comisiones-csv
// Trazabilidad: Diagrama de Secuencia C-03
// Responsabilidad: Recibir el array de filas parseadas del CSV y realizar la
// inserción masiva de comisiones, resolviendo IDs de asignaturas y documentos
// de profesores del lado del servidor.
// =============================================================================

interface FilaCSV {
  asignatura_nombre: string;
  comision_nombre: string;
  comision_letra_desde: string;
  comision_letra_hasta: string;
  profesor_documento: string | number;
}

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
    const { filas } = await req.json();

    // --- Validación de entrada ---
    if (!Array.isArray(filas) || filas.length === 0) {
      return new Response(
        JSON.stringify({ error: "Se requiere un array 'filas' no vacío." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Crear cliente con service_role para bypass de RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resultados: unknown[] = [];
    const errores: string[] = [];

    // --- BUCLE DE INSERCIÓN MASIVA (lógica de negocio en el servidor) ---
    for (const f of filas as FilaCSV[]) {
      try {
        // PASO 1: Resolver id_asignatura por nombre
        const { data: asignatura, error: errAsig } = await supabaseAdmin
          .from("asignatura")
          .select("id_asignatura")
          .eq("nombre", f.asignatura_nombre)
          .single();

        if (errAsig || !asignatura) {
          errores.push(
            `[Fila comision='${f.comision_nombre}'] No se encontró la asignatura "${f.asignatura_nombre}".`
          );
          continue; // Siguiente fila
        }

        // PASO 2: Verificar si la comisión ya existe (idempotencia)
        const { data: comisionesExistentes, error: errBusqueda } =
          await supabaseAdmin
            .from("comision")
            .select("id_comision")
            .eq("nombre", f.comision_nombre)
            .eq("id_asignatura", asignatura.id_asignatura);

        if (errBusqueda) throw new Error(errBusqueda.message);

        let id_comision: number;

        if (!comisionesExistentes || comisionesExistentes.length === 0) {
          // PASO 3a: Insertar nueva comisión
          const { data: nueva, error: errIns } = await supabaseAdmin
            .from("comision")
            .insert({
              nombre: f.comision_nombre,
              letra_desde: f.comision_letra_desde,
              letra_hasta: f.comision_letra_hasta,
              id_asignatura: asignatura.id_asignatura,
              estado: true,
            })
            .select()
            .single();

          if (errIns || !nueva) throw new Error(errIns?.message ?? "Error al insertar comisión");

          id_comision = nueva.id_comision;
          resultados.push(nueva);
        } else {
          // PASO 3b: Comisión ya existe — reutilizar
          id_comision = comisionesExistentes[0].id_comision;
        }

        // PASO 4: Resolver id_profesor por documento
        const { data: profesor, error: errProf } = await supabaseAdmin
          .from("profesor")
          .select("id_profesor")
          .eq("documento", Number(f.profesor_documento))
          .single();

        if (errProf || !profesor) {
          errores.push(
            `[Fila comision='${f.comision_nombre}'] No se encontró el profesor con documento ${f.profesor_documento}.`
          );
          continue; // Siguiente fila
        }

        // PASO 5: Vincular profesor a comisión (upsert idempotente)
        const { error: errUpsert } = await supabaseAdmin
          .from("comision_profesor")
          .upsert(
            { id_comision, id_profesor: profesor.id_profesor },
            { onConflict: "id_comision,id_profesor", ignoreDuplicates: true }
          );

        if (errUpsert) throw new Error(errUpsert.message);

      } catch (rowErr) {
        const msg = rowErr instanceof Error ? rowErr.message : String(rowErr);
        errores.push(`[Fila comision='${f.comision_nombre}'] Error inesperado: ${msg}`);
      }
    }

    // --- Respuesta con resumen de la operación ---
    const status = errores.length === 0 ? 200 : errores.length === filas.length ? 500 : 207;

    return new Response(
      JSON.stringify({
        data: resultados,
        insertadas: resultados.length,
        errores: errores.length > 0 ? errores : null,
        error: null,
      }),
      {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Connection": "keep-alive" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[importar-comisiones-csv] Error inesperado:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
