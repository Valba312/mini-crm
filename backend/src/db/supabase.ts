import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const anonKey = process.env.SUPABASE_ANON_KEY ?? "";

const looksLikeJwt = (value: string) => value.split(".").length === 3;
const hasValidServiceRole = !!serviceRoleKey && looksLikeJwt(serviceRoleKey);
export const isSupabaseAdminEnabled = hasValidServiceRole;

const clientKey = hasValidServiceRole ? serviceRoleKey : anonKey;

if (!supabaseUrl || !clientKey) {
  console.warn("Supabase env is not set. Falling back to memory storage.");
}

if (serviceRoleKey && !hasValidServiceRole) {
  console.warn("SUPABASE_SERVICE_ROLE_KEY is not a JWT. Use the service_role key from Supabase.");
}

export const supabase = supabaseUrl && clientKey ? createClient(supabaseUrl, clientKey) : null;

export const supabaseAdmin =
  supabaseUrl && hasValidServiceRole
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    : null;
