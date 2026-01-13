import type { ProjectStatus, TaskPriority, TaskStatus, ProjectMemberRole } from "../types";

export const projectStatusLabels: Record<ProjectStatus, string> = {
  PLANNED: "Запланирован",
  ACTIVE: "Активен",
  ON_HOLD: "На паузе",
  DONE: "Завершен",
  CANCELLED: "Отменен"
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  TODO: "К выполнению",
  IN_PROGRESS: "В работе",
  REVIEW: "На проверке",
  DONE: "Готово",
  BLOCKED: "Заблокировано"
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
  URGENT: "Срочный"
};

export const projectMemberRoleLabels: Record<ProjectMemberRole, string> = {
  OWNER: "Владелец",
  MANAGER: "Менеджер",
  CONTRIBUTOR: "Участник"
};
