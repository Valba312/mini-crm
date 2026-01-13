import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOverdueReport, getProjects, getTasks } from "../api/api";
import type { Task } from "../types";
import StatusBadge from "../components/StatusBadge";
import { taskStatusLabels } from "../utils/labels";

const DashboardPage = () => {
  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: getProjects });
  const overdueQuery = useQuery({ queryKey: ["reports", "overdue"], queryFn: () => getOverdueReport(0) });

  const tasksInWorkQuery = useQuery({
    queryKey: ["tasksInWork", projectsQuery.data?.map((p) => p.id).join(",")],
    enabled: !!projectsQuery.data,
    queryFn: async () => {
      const projects = projectsQuery.data ?? [];
      const taskLists = await Promise.all(projects.map((project) => getTasks(project.id)));
      return taskLists.flat();
    }
  });

  const activeProjects = useMemo(
    () => (projectsQuery.data ?? []).filter((project) => project.status === "ACTIVE").length,
    [projectsQuery.data]
  );

  const overdueCount = overdueQuery.data?.length ?? 0;

  const tasksInWork = useMemo(() => {
    const tasks = tasksInWorkQuery.data ?? [];
    return tasks.filter((task: Task) => ["IN_PROGRESS", "REVIEW"].includes(task.status)).length;
  }, [tasksInWorkQuery.data]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-white/60">Активные проекты</p>
          <p className="mt-3 text-3xl font-display">{activeProjects}</p>
        </div>
        <div className="card">
          <p className="text-sm text-white/60">Просроченные задачи</p>
          <p className="mt-3 text-3xl font-display">{overdueCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-white/60">Задачи в работе</p>
          <p className="mt-3 text-3xl font-display">{tasksInWork}</p>
        </div>
      </section>

      <section className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg">Просроченные задачи</h2>
            <p className="text-sm text-white/60">Задачи с прошедшим дедлайном</p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Задача</th>
                <th>Проект</th>
                <th>Срок</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {(overdueQuery.data ?? []).map((task) => (
                <tr key={task.taskId}>
                  <td>{task.title}</td>
                  <td className="text-white/70">{task.projectId.slice(0, 8)}</td>
                  <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</td>
                  <td>
                    <StatusBadge label={taskStatusLabels[task.status as Task["status"]] ?? task.status} tone="red" />
                  </td>
                </tr>
              ))}
              {overdueCount === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-white/60">
                    Нет просроченных задач
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
