import type { ITaskRepo } from "../repo/taskRepo";
import type { Task, TaskStatus, TaskStatusHistory } from "../types/task";

export class TasksService {
  constructor(private repo: ITaskRepo) {}

  async listByProject(projectId: string): Promise<Task[]> {
    return this.repo.listByProject(projectId);
  }

  async getById(id: string): Promise<Task | undefined> {
    return this.repo.getById(id);
  }

  async create(input: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
    return this.repo.create(input);
  }

  async update(id: string, input: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>): Promise<Task | undefined> {
    return this.repo.update(id, input);
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  async updateStatus(
    id: string,
    toStatus: TaskStatus,
    changedByUserId: string
  ): Promise<{ task: Task; history: TaskStatusHistory } | undefined> {
    return this.repo.updateStatus(id, toStatus, changedByUserId);
  }
}
