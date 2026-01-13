import type { IUserRepo } from "../../users/repo/userRepo";
import type { IProjectRepo } from "../../projects/repo/projectRepo";
import type { ITaskRepo } from "../../tasks/repo/taskRepo";
import { ACTIVE_TASK_STATUSES } from "../../tasks/repo/taskRepo";
import type { OverdueTaskReportItem, ProjectHealthReportItem, WorkloadReportItem } from "../types/report";

export class ReportsService {
  constructor(
    private usersRepo: IUserRepo,
    private projectsRepo: IProjectRepo,
    private tasksRepo: ITaskRepo
  ) {}

  async getOverdueTasks(days: number): Promise<OverdueTaskReportItem[]> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);
    const projects = await this.projectsRepo.list();
    const items: OverdueTaskReportItem[] = [];
    for (const project of projects) {
      const tasks = await this.tasksRepo.listByProject(project.id);
      for (const task of tasks) {
        if (!task.dueDate) continue;
        const due = new Date(task.dueDate);
        const isOverdue = due < threshold && task.status !== "DONE";
        if (isOverdue) {
          items.push({
            taskId: task.id,
            title: task.title,
            projectId: project.id,
            dueDate: task.dueDate,
            status: task.status,
            assigneeId: task.assigneeId
          });
        }
      }
    }
    return items;
  }

  async getWorkload(): Promise<WorkloadReportItem[]> {
    const users = await this.usersRepo.list();
    const projects = await this.projectsRepo.list();
    const counts = new Map<string, number>();
    for (const user of users) {
      counts.set(user.id, 0);
    }
    for (const project of projects) {
      const tasks = await this.tasksRepo.listByProject(project.id);
      for (const task of tasks) {
        if (!task.assigneeId) continue;
        if (!ACTIVE_TASK_STATUSES.includes(task.status)) continue;
        counts.set(task.assigneeId, (counts.get(task.assigneeId) ?? 0) + 1);
      }
    }
    return users.map((user) => ({
      userId: user.id,
      userName: user.name,
      activeTasks: counts.get(user.id) ?? 0
    }));
  }

  async getProjectHealth(days: number): Promise<ProjectHealthReportItem[]> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);
    const projects = await this.projectsRepo.list();
    const items: ProjectHealthReportItem[] = [];
    for (const project of projects) {
      const tasks = await this.tasksRepo.listByProject(project.id);
      const totalTasks = tasks.length;
      const doneTasks = tasks.filter((task) => task.status === "DONE").length;
      const overdueTasks = tasks.filter((task) => {
        if (!task.dueDate) return false;
        const due = new Date(task.dueDate);
        return due < threshold && task.status !== "DONE";
      }).length;
      items.push({
        projectId: project.id,
        projectName: project.name,
        projectStatus: project.status,
        totalTasks,
        overdueTasks,
        doneTasks
      });
    }
    return items;
  }
}
