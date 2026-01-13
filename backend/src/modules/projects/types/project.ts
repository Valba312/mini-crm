export type ProjectStatus = "PLANNED" | "ACTIVE" | "ON_HOLD" | "DONE" | "CANCELLED";

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  budget?: number;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
}

export type ProjectMemberRole = "OWNER" | "MANAGER" | "CONTRIBUTOR";

export interface ProjectMember {
  projectId: string;
  userId: string;
  memberRole: ProjectMemberRole;
}
