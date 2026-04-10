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
