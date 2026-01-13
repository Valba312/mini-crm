import type { IClientRepo } from "./clientRepo";
import type { Client } from "../types/client";
import { supabase } from "../../../db/supabase";

const TABLE = "clients";

type DbClient = {
  id: string;
  name: string;
  email: string | null;
  phone?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

const toClient = (row: DbClient): Client => ({
  id: row.id,
  name: row.name,
  email: row.email ?? "",
  phone: row.phone ?? undefined,
  notes: row.notes ?? undefined,
  createdAt: row.created_at
});

export class SupabaseClientRepo implements IClientRepo {
  async list(): Promise<Client[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from(TABLE).select("*").order("created_at", { ascending: true });
    if (error) throw error;
    return (data as DbClient[]).map(toClient);
  }

  async getById(id: string): Promise<Client | undefined> {
    if (!supabase) return undefined;
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? toClient(data as DbClient) : undefined;
  }

  async create(input: Omit<Client, "id" | "createdAt">): Promise<Client> {
    if (!supabase) throw new Error("Supabase is not configured");
    const now = new Date().toISOString();
    const payload = {
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      notes: input.notes ?? null,
      created_at: now,
      updated_at: now
    };
    const { data, error } = await supabase.from(TABLE).insert(payload).select("*").single();
    if (error) throw error;
    return toClient(data as DbClient);
  }

  async update(id: string, input: Partial<Omit<Client, "id" | "createdAt">>): Promise<Client | undefined> {
    if (!supabase) return undefined;
    const payload: Partial<DbClient> = { updated_at: new Date().toISOString() };
    if (input.name !== undefined) payload.name = input.name as string;
    if (input.email !== undefined) payload.email = input.email ?? null;
    if (input.phone !== undefined) payload.phone = input.phone ?? null;
    if (input.notes !== undefined) payload.notes = input.notes ?? null;
    const { data, error } = await supabase.from(TABLE).update(payload).eq("id", id).select("*").maybeSingle();
    if (error) throw error;
    return data ? toClient(data as DbClient) : undefined;
  }

  async delete(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
    return true;
  }
}
