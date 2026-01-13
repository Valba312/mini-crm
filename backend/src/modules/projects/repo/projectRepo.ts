import type { Project, ProjectMember, ProjectMemberRole } from "../types/project";

export interface IProjectRepo {
  list(): Promise<Project[]>;
  getById(id: string): Promise<Project | undefined>;
  create(input: Omit<Project, "id" | "createdAt">): Promise<Project>;
  update(id: string, input: Partial<Omit<Project, "id" | "createdAt">>): Promise<Project | undefined>;
  delete(id: string): Promise<boolean>;
  listMembers(projectId: string): Promise<ProjectMember[]>;
  addMember(input: { projectId: string; userId: string; memberRole: ProjectMemberRole }): Promise<ProjectMember>;
  removeMember(projectId: string, userId: string): Promise<boolean>;
}
