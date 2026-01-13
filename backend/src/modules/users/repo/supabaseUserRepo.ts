import { v4 as uuid } from "uuid";
import type { IUserRepo } from "./userRepo";
import type { User, UserRole } from "../types/user";
import { isSupabaseAdminEnabled, supabase, supabaseAdmin } from "../../../db/supabase";

const TABLE = "user_profiles";

type DbUser = {
  user_id: string;
  full_name: string;
  email?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
};

const toUser = (row: DbUser): User => ({
  id: row.user_id,
  name: row.full_name,
  email: row.email ?? "",
  role: row.role,
  isActive: row.is_active,
  createdAt: row.created_at
});

const makePassword = () => `Pwd-${uuid()}`;

const findAuthUserIdByEmail = async (email: string): Promise<string | undefined> => {
  if (!supabaseAdmin) return undefined;
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  const user = data.users.find((item) => item.email?.toLowerCase() === email.toLowerCase());
  return user?.id;
};

export class SupabaseUserRepo implements IUserRepo {
  async list(): Promise<User[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from(TABLE).select("*").order("created_at", { ascending: true });
    if (error) throw error;
    return (data as DbUser[]).map(toUser);
  }

  async getById(id: string): Promise<User | undefined> {
    if (!supabase) return undefined;
    const { data, error } = await supabase.from(TABLE).select("*").eq("user_id", id).maybeSingle();
    if (error) throw error;
    if (!data) return undefined;
    return toUser(data as DbUser);
  }

  async getFirst(): Promise<User | undefined> {
    if (!supabase) return undefined;
    const { data, error } = await supabase.from(TABLE).select("*").order("created_at", { ascending: true }).limit(1);
    if (error) throw error;
    const row = (data as DbUser[])[0];
    return row ? toUser(row) : undefined;
  }

  async create(input: { name: string; email: string; role: UserRole; isActive: boolean }): Promise<User> {
    if (!supabase) throw new Error("Supabase is not configured");
    if (!isSupabaseAdminEnabled) {
      throw new Error("Supabase admin key is required. Set SUPABASE_SERVICE_ROLE_KEY in backend/.env");
    }

    const normalizedEmail = input.email?.trim();
    const email = normalizedEmail && normalizedEmail.length > 0 ? normalizedEmail : `user-${uuid()}@local.invalid`;

    let userId: string | undefined;
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client is not configured");
    }

    const authCreate = await supabaseAdmin.auth.admin.createUser({
      email,
      password: makePassword(),
      email_confirm: true
    });

    if (authCreate.error) {
      userId = await findAuthUserIdByEmail(email);
      if (!userId) {
        throw authCreate.error;
      }
    } else {
      userId = authCreate.data.user?.id;
    }

    if (!userId) throw new Error("Failed to resolve auth user id");

    const basePayload: Record<string, unknown> = {
      user_id: userId,
      full_name: input.name,
      role: input.role,
      is_active: input.isActive
    };
    if (email) {
      basePayload.email = email;
    }

    const tryInsert = async (payload: Record<string, unknown>) => {
      return supabase.from(TABLE).insert(payload).select("*").single();
    };

    let { data, error } = await tryInsert(basePayload);
    if (!error && data) return toUser(data as DbUser);

    if (error && error.message?.includes("column") && error.message?.includes("email")) {
      const withoutEmail = { ...basePayload };
      delete withoutEmail.email;
      ({ data, error } = await tryInsert(withoutEmail));
      if (!error && data) return toUser(data as DbUser);
    }

    if (error) throw error;
    throw new Error("Failed to create user");
  }

  async updateRoleActive(id: string, input: { role?: UserRole; isActive?: boolean }): Promise<User | undefined> {
    if (!supabase) return undefined;
    const payload: Partial<DbUser> = {};
    if (input.role) payload.role = input.role;
    if (typeof input.isActive === "boolean") payload.is_active = input.isActive;
    const { data, error } = await supabase.from(TABLE).update(payload).eq("user_id", id).select("*").maybeSingle();
    if (error) throw error;
    if (!data) return undefined;
    return toUser(data as DbUser);
  }
}
