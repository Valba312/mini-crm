import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addProjectMember,
  createTask,
  getProject,
  getProjectMembers,
  getTasks,
  getUsers,
  updateTask,
  updateTaskStatus
} from "../../api/api";
import type { Task, TaskPriority, TaskStatus } from "../../types";
import StatusBadge from "../../components/StatusBadge";
import { projectMemberRoleLabels, taskPriorityLabels, taskStatusLabels } from "../../utils/labels";

const tabs = ["Обзор", "Задачи", "Участники"] as const;

type TabKey = (typeof tabs)[number];

const statusOptions: { value: TaskStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Все" },
  { value: "TODO", label: taskStatusLabels.TODO },
  { value: "IN_PROGRESS", label: taskStatusLabels.IN_PROGRESS },
  { value: "REVIEW", label: taskStatusLabels.REVIEW },
  { value: "DONE", label: taskStatusLabels.DONE },
  { value: "BLOCKED", label: taskStatusLabels.BLOCKED }
];

const priorityOptions: { value: TaskPriority | "ALL"; label: string }[] = [
  { value: "ALL", label: "Все" },
  { value: "LOW", label: taskPriorityLabels.LOW },
  { value: "MEDIUM", label: taskPriorityLabels.MEDIUM },
  { value: "HIGH", label: taskPriorityLabels.HIGH },
  { value: "URGENT", label: taskPriorityLabels.URGENT }
];

const toDateInput = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const projectId = id ?? "";
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("Обзор");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [newTask, setNewTask] = useState({
    title: "",
    assigneeId: "",
    priority: "MEDIUM",
    status: "TODO",
    dueDate: ""
  });

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
    enabled: !!projectId
  });
  const membersQuery = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: () => getProjectMembers(projectId),
    enabled: !!projectId
  });
  const tasksQuery = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: () => getTasks(projectId),
    enabled: !!projectId
  });
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: getUsers });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) => updateTaskStatus(taskId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] })
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: Partial<Task> }) =>
      updateTask(projectId, taskId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] })
  });

  const createTaskMutation = useMutation({
    mutationFn: (payload: Partial<Task>) => createTask(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      setNewTask({ title: "", assigneeId: "", priority: "MEDIUM", status: "TODO", dueDate: "" });
    }
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      addProjectMember(projectId, { userId, memberRole: "CONTRIBUTOR" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project-members", projectId] })
  });

  const usersMap = useMemo(() => {
    const map = new Map<string, string>();
    usersQuery.data?.forEach((user) => map.set(user.id, user.name));
    return map;
  }, [usersQuery.data]);

  const filteredTasks = useMemo(() => {
    const tasks = tasksQuery.data ?? [];
    return tasks.filter((task) => {
      const statusOk = statusFilter === "ALL" || task.status === statusFilter;
      const priorityOk = priorityFilter === "ALL" || task.priority === priorityFilter;
      return statusOk && priorityOk;
    });
  }, [tasksQuery.data, statusFilter, priorityFilter]);

  const overviewStats = useMemo(() => {
    const tasks = tasksQuery.data ?? [];
    return {
      total: tasks.length,
      done: tasks.filter((task) => task.status === "DONE").length,
      inProgress: tasks.filter((task) => task.status === "IN_PROGRESS").length
    };
  }, [tasksQuery.data]);

  const handleCreateTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTask.title.trim()) return;
    createTaskMutation.mutate({
      title: newTask.title,
      assigneeId: newTask.assigneeId || undefined,
      priority: newTask.priority as TaskPriority,
      status: newTask.status as TaskStatus,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : undefined
    });
  };

  if (!projectId) {
    return <div className="card">Проект не найден</div>;
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl">{projectQuery.data?.name ?? "Проект"}</h1>
            <p className="text-sm text-white/60">{projectQuery.data?.description}</p>
          </div>
          <StatusBadge label={projectQuery.data?.status ?? "-"} tone="blue" />
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-sm ${
              activeTab === tab ? "bg-white text-slate-950" : "bg-white/10 text-white/70"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Обзор" && (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="card">
            <p className="text-sm text-white/60">Всего задач</p>
            <p className="mt-3 text-3xl font-display">{overviewStats.total}</p>
          </div>
          <div className="card">
            <p className="text-sm text-white/60">Выполнено</p>
            <p className="mt-3 text-3xl font-display">{overviewStats.done}</p>
          </div>
          <div className="card">
            <p className="text-sm text-white/60">В прогрессе</p>
            <p className="mt-3 text-3xl font-display">{overviewStats.inProgress}</p>
          </div>
        </section>
      )}

      {activeTab === "Задачи" && (
        <section className="grid gap-6 lg:grid-cols-[1.5fr_0.5fr]">
          <div className="card">
            <div className="flex flex-wrap items-center gap-3">
              <select
                className="select-base"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                className="select-base"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="text-xs text-white/50">Статус и срок можно менять прямо в карточке</span>
            </div>

            <div className="mt-4 space-y-3">
              {filteredTasks.map((task: Task) => (
                <div key={task.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-white/60">{task.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="chip">{taskPriorityLabels[task.priority]}</span>
                        <span className="chip">{taskStatusLabels[task.status]}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <select
                        className="control-pill"
                        value={task.assigneeId ?? ""}
                        onChange={(event) =>
                          updateTaskMutation.mutate({
                            taskId: task.id,
                            payload: { assigneeId: event.target.value || undefined }
                          })
                        }
                      >
                        <option value="">Не назначен</option>
                        {(usersQuery.data ?? []).map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                      <select
                        className="control-pill"
                        value={task.status}
                        onChange={(event) =>
                          updateStatusMutation.mutate({
                            taskId: task.id,
                            status: event.target.value as TaskStatus
                          })
                        }
                      >
                        {statusOptions.filter((option) => option.value !== "ALL").map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        className="control-pill"
                        value={toDateInput(task.dueDate)}
                        onChange={(event) =>
                          updateTaskMutation.mutate({
                            taskId: task.id,
                            payload: {
                              dueDate: event.target.value ? new Date(event.target.value).toISOString() : undefined
                            }
                          })
                        }
                      />
                      <button
                        className="btn-ghost"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            taskId: task.id,
                            status: task.status === "DONE" ? "IN_PROGRESS" : "DONE"
                          })
                        }
                      >
                        Быстро
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredTasks.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/60">
                  Нет задач
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="font-display text-lg">Новая задача</h3>
            <p className="text-xs text-white/60">Создай задачу прямо здесь — она попадет в активные.</p>
            <form className="mt-4 space-y-3" onSubmit={handleCreateTask}>
              <input
                className="input-base"
                placeholder="Название задачи"
                value={newTask.title}
                onChange={(event) => setNewTask({ ...newTask, title: event.target.value })}
                required
              />
              <select
                className="select-base"
                value={newTask.assigneeId}
                onChange={(event) => setNewTask({ ...newTask, assigneeId: event.target.value })}
              >
                <option value="">Исполнитель не назначен</option>
                {(usersQuery.data ?? []).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="select-base"
                  value={newTask.priority}
                  onChange={(event) => setNewTask({ ...newTask, priority: event.target.value })}
                >
                  {priorityOptions.filter((option) => option.value !== "ALL").map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  className="select-base"
                  value={newTask.status}
                  onChange={(event) => setNewTask({ ...newTask, status: event.target.value })}
                >
                  {statusOptions.filter((option) => option.value !== "ALL").map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="date"
                className="input-base"
                value={newTask.dueDate}
                onChange={(event) => setNewTask({ ...newTask, dueDate: event.target.value })}
              />
              <button type="submit" className="btn-primary">
                Добавить задачу
              </button>
            </form>
          </div>
        </section>
      )}

      {activeTab === "Участники" && (
        <section className="card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg">Участники</h2>
            {usersQuery.data && usersQuery.data.length > 0 && (
              <button
                className="btn-primary"
                onClick={() => addMemberMutation.mutate({ projectId, userId: usersQuery.data?.[0]?.id ?? "" })}
              >
                + Добавить первого пользователя
              </button>
            )}
          </div>
          <ul className="mt-4 space-y-2">
            {(membersQuery.data ?? []).map((member) => (
              <li key={`${member.projectId}-${member.userId}`} className="flex items-center justify-between">
                <span>{usersMap.get(member.userId) ?? member.userId}</span>
                <span className="text-xs text-white/60">{projectMemberRoleLabels[member.memberRole]}</span>
              </li>
            ))}
            {(membersQuery.data ?? []).length === 0 && <li className="text-white/60">Нет участников</li>}
          </ul>
        </section>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
