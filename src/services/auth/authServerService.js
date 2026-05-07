import { createClient } from "@/lib/supabase/server";

// Server-side Get User
export const getServerUser = async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Server-side Get Claims (if needed by starter templates)
export const getServerClaims = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  return { claims: data?.claims || null, error };
};

// Server-side SignOut
export const serverSignOut = async () => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Verifies authentication AND role in a single server-side call.
 * Queries public.usuario using auth_id to read the `rol` column.
 * @returns {{ user, rol: string|null, error }}
 */
export const getServerUserWithRole = async () => {
  const supabase = await createClient();

  // 1. Verify the session is valid (tamper-proof server check)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { user: null, rol: null, error: authError };

  // 2. Cross-reference public.usuario to obtain the application role
  const { data: usuarioData, error: rolError } = await supabase
    .from('usuario')
    .select('rol')
    .eq('auth_id', user.id)
    .single();

  if (rolError) return { user, rol: null, error: rolError };

  return { user, rol: usuarioData?.rol ?? null, error: null };
};
