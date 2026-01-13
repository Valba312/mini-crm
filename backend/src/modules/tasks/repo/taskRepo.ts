import type { Task, TaskPriority, TaskStatus, TaskStatusHistory } from "../types/task";

export interface ITaskRepo {
  listByProject(projectId: string): Promise<Task[]>;
  getById(id: string): Promise<Task | undefined>;
  create(input: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task>;
  update(id: string, input: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>): Promise<Task | undefined>;
  delete(id: string): Promise<boolean>;
  updateStatus(
    id: string,
    toStatus: TaskStatus,
    changedByUserId: string
  ): Promise<{ task: Task; history: TaskStatusHistory } | undefined>;
  listStatusHistory(taskId: string): Promise<TaskStatusHistory[]>;
}

export const ACTIVE_TASK_STATUSES: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "BLOCKED"
];

export const WORKING_TASK_STATUSES: TaskStatus[] = ["IN_PROGRESS", "REVIEW"];

export const DEFAULT_PRIORITY: TaskPriority = "MEDIUM";
