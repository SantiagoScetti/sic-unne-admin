import { createClient } from "@/lib/supabase/client";

// SignIn wrapper
export const signInWithPassword = async ({ email, password }) => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

// SignUp wrapper
export const signUpUser = async ({ email, password, redirectUrl }) => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectUrl },
  });
  if (error) throw error;
  return data;
};

// Reset Password wrapper
export const resetPasswordForEmail = async ({ email, redirectUrl }) => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });
  if (error) throw error;
  return data;
};

// Update User (Password) wrapper
export const updateUserPassword = async (password) => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
};

// SignOut wrapper
export const signOutUser = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
