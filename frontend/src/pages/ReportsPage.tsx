import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOverdueReport, getProjectHealthReport, getWorkloadReport } from "../api/api";
import StatusBadge from "../components/StatusBadge";
import { taskStatusLabels } from "../utils/labels";

const ReportsPage = () => {
  const overdueQuery = useQuery({ queryKey: ["reports", "overdue"], queryFn: () => getOverdueReport(0) });
  const workloadQuery = useQuery({ queryKey: ["reports", "workload"], queryFn: getWorkloadReport });
  const healthQuery = useQuery({ queryKey: ["reports", "health"], queryFn: () => getProjectHealthReport(0) });

  const [overdueCollapsed, setOverdueCollapsed] = useState(false);

  const maxWorkload = useMemo(() => {
    const values = workloadQuery.data?.map((item) => item.activeTasks) ?? [];
    return Math.max(1, ...values);
  }, [workloadQuery.data]);

  const overdueCount = overdueQuery.data?.length ?? 0;
  const staffCount = workloadQuery.data?.length ?? 0;
  const projectsCount = healthQuery.data?.length ?? 0;

  const healthAverage = useMemo(() => {
    const items = healthQuery.data ?? [];
    if (items.length === 0) return 0;
    const total = items.reduce((sum, item) => sum + item.totalTasks, 0) || 1;
    const done = items.reduce((sum, item) => sum + item.doneTasks, 0);
    return Math.round((done / total) * 100);
  }, [healthQuery.data]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="card relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.2),_transparent_55%)]" />
          <div className="relative">
            <p className="text-xs uppercase tracking-wide text-white/60">Риск</p>
            <p className="mt-3 text-4xl font-display">{overdueCount}</p>
            <p className="text-xs text-white/60">просроченных задач</p>
          </div>
        </div>
        <div className="card relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_55%)]" />
          <div className="relative">
            <p className="text-xs uppercase tracking-wide text-white/60">Команда</p>
            <p className="mt-3 text-4xl font-display">{staffCount}</p>
            <p className="text-xs text-white/60">сотрудников в работе</p>
          </div>
        </div>
        <div className="card relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.2),_transparent_55%)]" />
          <div className="relative">
            <p className="text-xs uppercase tracking-wide text-white/60">Прогресс</p>
            <p className="mt-3 text-4xl font-display">{healthAverage}%</p>
            <p className="text-xs text-white/60">среднее выполнение</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg">Просроченные задачи</h2>
              <p className="text-xs text-white/60">Фокус на критических дедлайнах</p>
            </div>
            <button
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 hover:text-white"
              onClick={() => setOverdueCollapsed((prev) => !prev)}
            >
              {overdueCollapsed ? "Показать" : "Свернуть"}
            </button>
          </div>
          {!overdueCollapsed && (
            <div className="mt-4 space-y-3">
              {(overdueQuery.data ?? []).map((task) => (
                <div key={task.taskId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-white/60">Проект: {task.projectId.slice(0, 8)}</p>
                      <p className="mt-2 text-xs text-white/60">
                        Дедлайн: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                      </p>
                    </div>
                    <StatusBadge
                      label={taskStatusLabels[task.status as keyof typeof taskStatusLabels] ?? task.status}
                      tone="red"
                    />
                  </div>
                </div>
              ))}
              {overdueCount === 0 && <div className="text-sm text-white/60">Нет просроченных задач</div>}
            </div>
          )}
          {overdueCollapsed && (
            <div className="mt-4 text-sm text-white/60">
              Скрыто. Всего задач с риском: {overdueCount}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg">Нагрузка по сотрудникам</h2>
              <p className="text-xs text-white/60">Сколько активных задач у каждого</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {(workloadQuery.data ?? []).map((item) => {
              const initials = item.userName
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("");
              return (
                <div key={item.userId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs">
                      {initials}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.userName}</span>
                        <span className="text-white/70">{item.activeTasks}</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-sky-400/70 active-line"
                          style={{ width: `${(item.activeTasks / maxWorkload) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {staffCount === 0 && <div className="text-sm text-white/60">Нет данных по нагрузке</div>}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg">Здоровье проектов</h2>
            <p className="text-xs text-white/60">Прогресс и риски по каждому проекту</p>
          </div>
          <span className="text-xs text-white/50">Среднее выполнение: {healthAverage}%</span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(healthQuery.data ?? []).map((item) => {
            const total = item.totalTasks || 1;
            const donePercent = Math.round((item.doneTasks / total) * 100);
            const overduePercent = Math.round((item.overdueTasks / total) * 100);
            return (
              <div key={item.projectId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.projectName}</p>
                    <p className="text-xs text-white/60">Всего задач: {item.totalTasks}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/60">Готово {donePercent}%</span>
                    <StatusBadge
                      label={item.projectStatus}
                      tone={
                        item.projectStatus === "DONE"
                          ? "green"
                          : item.projectStatus === "ON_HOLD"
                          ? "yellow"
                          : item.projectStatus === "CANCELLED"
                          ? "red"
                          : "blue"
                      }
                    />
                  </div>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-emerald-400/70 active-line"
                    style={{ width: `${donePercent}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                  <span>Просрочено: {item.overdueTasks}</span>
                  <span>{overduePercent}%</span>
                </div>
              </div>
            );
          })}
          {projectsCount === 0 && <div className="text-sm text-white/60">Нет данных по проектам</div>}
        </div>
      </section>
    </div>
  );
};

export default ReportsPage;
