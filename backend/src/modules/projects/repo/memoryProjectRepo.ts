import { v4 as uuid } from "uuid";
import type { IProjectRepo } from "./projectRepo";
import type { Project, ProjectMember, ProjectMemberRole } from "../types/project";

export class MemoryProjectRepo implements IProjectRepo {
  private items = new Map<string, Project>();
  private order: string[] = [];
  private members: ProjectMember[] = [];

  async list(): Promise<Project[]> {
    return this.order.map((id) => this.items.get(id)!).filter(Boolean);
  }

  async getById(id: string): Promise<Project | undefined> {
    return this.items.get(id);
  }

  async create(input: Omit<Project, "id" | "createdAt">): Promise<Project> {
    const now = new Date().toISOString();
    const project: Project = {
      id: uuid(),
      createdAt: now,
      ...input
    };
    this.items.set(project.id, project);
    this.order.push(project.id);
    return project;
  }

  async update(id: string, input: Partial<Omit<Project, "id" | "createdAt">>): Promise<Project | undefined> {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated: Project = {
      ...existing,
      ...input
    };
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    if (!this.items.has(id)) return false;
    this.items.delete(id);
    this.order = this.order.filter((itemId) => itemId !== id);
    this.members = this.members.filter((member) => member.projectId !== id);
    return true;
  }

  async listMembers(projectId: string): Promise<ProjectMember[]> {
    return this.members.filter((member) => member.projectId === projectId);
  }

  async addMember(input: { projectId: string; userId: string; memberRole: ProjectMemberRole }): Promise<ProjectMember> {
    const existing = this.members.find(
      (member) => member.projectId === input.projectId && member.userId === input.userId
    );
    if (existing) {
      return existing;
    }
    const member: ProjectMember = {
      projectId: input.projectId,
      userId: input.userId,
      memberRole: input.memberRole
    };
    this.members.push(member);
    return member;
  }

  async removeMember(projectId: string, userId: string): Promise<boolean> {
    const before = this.members.length;
    this.members = this.members.filter(
      (member) => !(member.projectId === projectId && member.userId === userId)
    );
    return this.members.length !== before;
  }
}
