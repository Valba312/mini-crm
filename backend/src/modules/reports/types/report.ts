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
  projectStatus: string;
  totalTasks: number;
  overdueTasks: number;
  doneTasks: number;
}
