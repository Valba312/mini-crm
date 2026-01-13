import type { ITaskRepo } from "./taskRepo";
import type { Task, TaskStatus, TaskStatusHistory } from "../types/task";
import { supabase } from "../../../db/supabase";

const TASKS_TABLE = "tasks";
const HISTORY_TABLE = "task_status_history";

type DbTask = {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  assignee_id?: string | null;
  priority: Task["priority"];
  status: TaskStatus;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
};

type DbHistory = {
  id: string;
  task_id: string;
  from_status: TaskStatus;
  to_status: TaskStatus;
  changed_by_user_id: string | null;
  changed_at: string;
};

const toTask = (row: DbTask): Task => ({
  id: row.id,
  projectId: row.project_id,
  title: row.title,
  description: row.description ?? undefined,
  assigneeId: row.assignee_id ?? undefined,
  priority: row.priority,
  status: row.status,
  dueDate: row.due_date ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const toHistory = (row: DbHistory): TaskStatusHistory => ({
  id: row.id,
  taskId: row.task_id,
  fromStatus: row.from_status,
  toStatus: row.to_status,
  changedByUserId: row.changed_by_user_id ?? "",
  changedAt: row.changed_at
});

export class SupabaseTaskRepo implements ITaskRepo {
  async listByProject(projectId: string): Promise<Task[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from(TASKS_TABLE).select("*").eq("project_id", projectId);
    if (error) throw error;
    return (data as DbTask[]).map(toTask);
  }

  async getById(id: string): Promise<Task | undefined> {
    if (!supabase) return undefined;
    const { data, error } = await supabase.from(TASKS_TABLE).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? toTask(data as DbTask) : undefined;
  }

  async create(input: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
    if (!supabase) throw new Error("Supabase is not configured");
    const now = new Date().toISOString();
    const payload = {
      project_id: input.projectId,
      title: input.title,
      description: input.description ?? null,
      assignee_id: input.assigneeId ?? null,
      priority: input.priority,
      status: input.status,
      due_date: input.dueDate ?? null,
      created_at: now,
      updated_at: now
    };
    const { data, error } = await supabase.from(TASKS_TABLE).insert(payload).select("*").single();
    if (error) throw error;
    return toTask(data as DbTask);
  }

  async update(id: string, input: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>): Promise<Task | undefined> {
    if (!supabase) return undefined;
    const payload: Partial<DbTask> = { updated_at: new Date().toISOString() };
    if (input.projectId !== undefined) payload.project_id = input.projectId;
    if (input.title !== undefined) payload.title = input.title as string;
    if (input.description !== undefined) payload.description = input.description ?? null;
    if (input.assigneeId !== undefined) payload.assignee_id = input.assigneeId ?? null;
    if (input.priority !== undefined) payload.priority = input.priority as Task["priority"];
    if (input.status !== undefined) payload.status = input.status as TaskStatus;
    if (input.dueDate !== undefined) payload.due_date = input.dueDate ?? null;
    const { data, error } = await supabase.from(TASKS_TABLE).update(payload).eq("id", id).select("*").maybeSingle();
    if (error) throw error;
    return data ? toTask(data as DbTask) : undefined;
  }

  async delete(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from(TASKS_TABLE).delete().eq("id", id);
    if (error) throw error;
    await supabase.from(HISTORY_TABLE).delete().eq("task_id", id);
    return true;
  }

  async updateStatus(
    id: string,
    toStatus: TaskStatus,
    changedByUserId: string
  ): Promise<{ task: Task; history: TaskStatusHistory } | undefined> {
    if (!supabase) return undefined;
    const existing = await this.getById(id);
    if (!existing) return undefined;

    const updated = await this.update(id, { status: toStatus });
    if (!updated) return undefined;

    const historyPayload = {
      task_id: id,
      from_status: existing.status,
      to_status: toStatus,
      changed_by_user_id: changedByUserId || null,
      changed_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from(HISTORY_TABLE).insert(historyPayload).select("*").single();
    if (error) throw error;
    return { task: updated, history: toHistory(data as DbHistory) };
  }

  async listStatusHistory(taskId: string): Promise<TaskStatusHistory[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from(HISTORY_TABLE).select("*").eq("task_id", taskId);
    if (error) throw error;
    return (data as DbHistory[]).map(toHistory);
  }
}
