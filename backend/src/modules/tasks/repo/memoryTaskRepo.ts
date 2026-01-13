import { v4 as uuid } from "uuid";
import type { ITaskRepo } from "./taskRepo";
import type { Task, TaskStatus, TaskStatusHistory } from "../types/task";

export class MemoryTaskRepo implements ITaskRepo {
  private items = new Map<string, Task>();
  private order: string[] = [];
  private history: TaskStatusHistory[] = [];

  async listByProject(projectId: string): Promise<Task[]> {
    return this.order
      .map((id) => this.items.get(id)!)
      .filter((task) => task && task.projectId === projectId);
  }

  async getById(id: string): Promise<Task | undefined> {
    return this.items.get(id);
  }

  async create(input: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
    const now = new Date().toISOString();
    const task: Task = {
      id: uuid(),
      createdAt: now,
      updatedAt: now,
      ...input
    };
    this.items.set(task.id, task);
    this.order.push(task.id);
    return task;
  }

  async update(id: string, input: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>): Promise<Task | undefined> {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated: Task = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString()
    };
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    if (!this.items.has(id)) return false;
    this.items.delete(id);
    this.order = this.order.filter((taskId) => taskId !== id);
    this.history = this.history.filter((record) => record.taskId !== id);
    return true;
  }

  async updateStatus(
    id: string,
    toStatus: TaskStatus,
    changedByUserId: string
  ): Promise<{ task: Task; history: TaskStatusHistory } | undefined> {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const fromStatus = existing.status;
    const updated: Task = {
      ...existing,
      status: toStatus,
      updatedAt: new Date().toISOString()
    };
    this.items.set(id, updated);
    const history: TaskStatusHistory = {
      id: uuid(),
      taskId: id,
      fromStatus,
      toStatus,
      changedByUserId,
      changedAt: new Date().toISOString()
    };
    this.history.push(history);
    return { task: updated, history };
  }

  async listStatusHistory(taskId: string): Promise<TaskStatusHistory[]> {
    return this.history.filter((record) => record.taskId === taskId);
  }
}
