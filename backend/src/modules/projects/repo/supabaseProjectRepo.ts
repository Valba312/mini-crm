import type { IProjectRepo } from "./projectRepo";
import type { Project, ProjectMember, ProjectMemberRole } from "../types/project";
import { supabase } from "../../../db/supabase";

const PROJECTS_TABLE = "projects";
const MEMBERS_TABLE = "project_members";

type DbProject = {
  id: string;
  client_id: string;
  name: string;
  description?: string | null;
  status: Project["status"];
  budget?: number | null;
  start_date?: string | null;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
};

type DbMember = {
  project_id: string;
  user_id: string;
  member_role: ProjectMemberRole;
  added_at: string;
};

const toProject = (row: DbProject): Project => ({
  id: row.id,
  clientId: row.client_id,
  name: row.name,
  description: row.description ?? undefined,
  status: row.status,
  budget: row.budget ?? undefined,
  startDate: row.start_date ?? undefined,
  dueDate: row.due_date ?? undefined,
  createdAt: row.created_at
});

const toMember = (row: DbMember): ProjectMember => ({
  projectId: row.project_id,
  userId: row.user_id,
  memberRole: row.member_role
});

export class SupabaseProjectRepo implements IProjectRepo {
  async list(): Promise<Project[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from(PROJECTS_TABLE).select("*").order("created_at", { ascending: true });
    if (error) throw error;
    return (data as DbProject[]).map(toProject);
  }

  async getById(id: string): Promise<Project | undefined> {
    if (!supabase) return undefined;
    const { data, error } = await supabase.from(PROJECTS_TABLE).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? toProject(data as DbProject) : undefined;
  }

  async create(input: Omit<Project, "id" | "createdAt">): Promise<Project> {
    if (!supabase) throw new Error("Supabase is not configured");
    const now = new Date().toISOString();
    const payload = {
      client_id: input.clientId,
      name: input.name,
      description: input.description ?? null,
      status: input.status,
      budget: input.budget ?? null,
      start_date: input.startDate ?? null,
      due_date: input.dueDate ?? null,
      created_at: now,
      updated_at: now
    };
    const { data, error } = await supabase.from(PROJECTS_TABLE).insert(payload).select("*").single();
    if (error) throw error;
    return toProject(data as DbProject);
  }

  async update(id: string, input: Partial<Omit<Project, "id" | "createdAt">>): Promise<Project | undefined> {
    if (!supabase) return undefined;
    const payload: Partial<DbProject> = { updated_at: new Date().toISOString() };
    if (input.clientId !== undefined) payload.client_id = input.clientId;
    if (input.name !== undefined) payload.name = input.name;
    if (input.description !== undefined) payload.description = input.description ?? null;
    if (input.status !== undefined) payload.status = input.status as Project["status"];
    if (input.budget !== undefined) payload.budget = input.budget ?? null;
    if (input.startDate !== undefined) payload.start_date = input.startDate ?? null;
    if (input.dueDate !== undefined) payload.due_date = input.dueDate ?? null;
    const { data, error } = await supabase.from(PROJECTS_TABLE).update(payload).eq("id", id).select("*").maybeSingle();
    if (error) throw error;
    return data ? toProject(data as DbProject) : undefined;
  }

  async delete(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from(PROJECTS_TABLE).delete().eq("id", id);
    if (error) throw error;
    await supabase.from(MEMBERS_TABLE).delete().eq("project_id", id);
    return true;
  }

  async listMembers(projectId: string): Promise<ProjectMember[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from(MEMBERS_TABLE).select("*").eq("project_id", projectId);
    if (error) throw error;
    return (data as DbMember[]).map(toMember);
  }

  async addMember(input: { projectId: string; userId: string; memberRole: ProjectMemberRole }): Promise<ProjectMember> {
    if (!supabase) throw new Error("Supabase is not configured");
    const payload = {
      project_id: input.projectId,
      user_id: input.userId,
      member_role: input.memberRole,
      added_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from(MEMBERS_TABLE).insert(payload).select("*").single();
    if (error) throw error;
    return toMember(data as DbMember);
  }

  async removeMember(projectId: string, userId: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from(MEMBERS_TABLE)
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", userId);
    if (error) throw error;
    return true;
  }
}
