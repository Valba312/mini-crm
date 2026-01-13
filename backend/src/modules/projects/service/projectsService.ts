import type { IProjectRepo } from "../repo/projectRepo";
import type { Project, ProjectMember, ProjectMemberRole } from "../types/project";

export class ProjectsService {
  constructor(private repo: IProjectRepo) {}

  async list(): Promise<Project[]> {
    return this.repo.list();
  }

  async getById(id: string): Promise<Project | undefined> {
    return this.repo.getById(id);
  }

  async create(input: Omit<Project, "id" | "createdAt">): Promise<Project> {
    return this.repo.create(input);
  }

  async update(id: string, input: Partial<Omit<Project, "id" | "createdAt">>): Promise<Project | undefined> {
    return this.repo.update(id, input);
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  async listMembers(projectId: string): Promise<ProjectMember[]> {
    return this.repo.listMembers(projectId);
  }

  async addMember(projectId: string, userId: string, memberRole: ProjectMemberRole): Promise<ProjectMember> {
    return this.repo.addMember({ projectId, userId, memberRole });
  }

  async removeMember(projectId: string, userId: string): Promise<boolean> {
    return this.repo.removeMember(projectId, userId);
  }
}
