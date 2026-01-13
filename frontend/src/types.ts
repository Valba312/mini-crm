export type UserRole = "ADMIN" | "MANAGER" | "MEMBER";
export type ProjectStatus = "PLANNED" | "ACTIVE" | "ON_HOLD" | "DONE" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BLOCKED";
export type ProjectMemberRole = "OWNER" | "MANAGER" | "CONTRIBUTOR";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  createdAt: string;
}

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

export interface ProjectMember {
  projectId: string;
  userId: string;
  memberRole: ProjectMemberRole;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OverdueTaskReportItem {
  taskId: string;
  title: string;
  projectId: string;
  dueDate?: string;
  status: string;
  assigneeId?: string;
}

export interface WorkloadReportItem {
  userId: string;
  userName: string;
  activeTasks: number;
}

export interface ProjectHealthReportItem {
  projectId: string;
  projectName: string;
  projectStatus: ProjectStatus;
  totalTasks: number;
  overdueTasks: number;
  doneTasks: number;
}
