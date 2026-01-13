import axios from "axios";
import type {
  Client,
  Project,
  ProjectHealthReportItem,
  ProjectMember,
  Task,
  User,
  WorkloadReportItem,
  OverdueTaskReportItem
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000"
});

export const getUsers = async (): Promise<User[]> => (await api.get("/api/users")).data;
export const createUser = async (payload: Partial<User>): Promise<User> =>
  (await api.post("/api/users", payload)).data;
export const updateUser = async (id: string, payload: Partial<User>): Promise<User> =>
  (await api.patch(`/api/users/${id}`, payload)).data;

export const getClients = async (): Promise<Client[]> => (await api.get("/api/clients")).data;
export const getClient = async (id: string): Promise<Client> => (await api.get(`/api/clients/${id}`)).data;
export const createClient = async (payload: Partial<Client>): Promise<Client> =>
  (await api.post("/api/clients", payload)).data;
export const updateClient = async (id: string, payload: Partial<Client>): Promise<Client> =>
  (await api.put(`/api/clients/${id}`, payload)).data;
export const deleteClient = async (id: string): Promise<void> => {
  await api.delete(`/api/clients/${id}`);
};

export const getProjects = async (): Promise<Project[]> => (await api.get("/api/projects")).data;
export const getProject = async (id: string): Promise<Project> => (await api.get(`/api/projects/${id}`)).data;
export const createProject = async (payload: Partial<Project>): Promise<Project> =>
  (await api.post("/api/projects", payload)).data;
export const updateProject = async (id: string, payload: Partial<Project>): Promise<Project> =>
  (await api.put(`/api/projects/${id}`, payload)).data;
export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/api/projects/${id}`);
};

export const getProjectMembers = async (projectId: string): Promise<ProjectMember[]> =>
  (await api.get(`/api/projects/${projectId}/members`)).data;
export const addProjectMember = async (
  projectId: string,
  payload: { userId: string; memberRole?: string }
): Promise<ProjectMember> => (await api.post(`/api/projects/${projectId}/members`, payload)).data;

export const getTasks = async (projectId: string): Promise<Task[]> =>
  (await api.get(`/api/projects/${projectId}/tasks`)).data;
export const createTask = async (projectId: string, payload: Partial<Task>): Promise<Task> =>
  (await api.post(`/api/projects/${projectId}/tasks`, payload)).data;
export const updateTask = async (projectId: string, taskId: string, payload: Partial<Task>): Promise<Task> =>
  (await api.put(`/api/projects/${projectId}/tasks/${taskId}`, payload)).data;
export const deleteTask = async (projectId: string, taskId: string): Promise<void> => {
  await api.delete(`/api/projects/${projectId}/tasks/${taskId}`);
};
export const updateTaskStatus = async (taskId: string, status: string) =>
  (await api.patch(`/api/tasks/${taskId}/status`, { status })).data;

export const getOverdueReport = async (days = 0): Promise<OverdueTaskReportItem[]> =>
  (await api.get(`/api/reports/overdue-tasks?days=${days}`)).data;
export const getWorkloadReport = async (): Promise<WorkloadReportItem[]> =>
  (await api.get("/api/reports/workload")).data;
export const getProjectHealthReport = async (days = 0): Promise<ProjectHealthReportItem[]> =>
  (await api.get(`/api/reports/project-health?days=${days}`)).data;

export default api;
