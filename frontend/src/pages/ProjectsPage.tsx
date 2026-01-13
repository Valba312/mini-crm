import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  addProjectMember,
  createProject,
  deleteProject,
  getClients,
  getProjectMembers,
  getProjects,
  getUsers,
  updateProject
} from "../api/api";
import type { Project, ProjectMember, User } from "../types";
import StatusBadge from "../components/StatusBadge";
import { projectStatusLabels } from "../utils/labels";

const statusTone: Record<Project["status"], "green" | "yellow" | "red" | "blue" | "gray"> = {
  ACTIVE: "green",
  ON_HOLD: "yellow",
  PLANNED: "gray",
  DONE: "blue",
  CANCELLED: "red"
};

const ProjectsPage = () => {
  const queryClient = useQueryClient();
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: getProjects });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: getUsers });

  const membersQuery = useQuery({
    queryKey: ["project-members", projects.map((p) => p.id).join(",")],
    enabled: projects.length > 0,
    queryFn: async () => {
      const entries = await Promise.all(
        projects.map(async (project) => ({
          projectId: project.id,
          members: await getProjectMembers(project.id)
        }))
      );
      return entries.reduce((acc, entry) => {
        acc[entry.projectId] = entry.members;
        return acc;
      }, {} as Record<string, ProjectMember[]>);
    }
  });

  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({
    name: "",
    clientId: "",
    status: "PLANNED",
    budget: ""
  });

  const resetForm = () => {
    setEditing(null);
    setForm({ name: "", clientId: "", status: "PLANNED", budget: "" });
  };

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Project> }) => updateProject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] })
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      addProjectMember(projectId, { userId, memberRole: "CONTRIBUTOR" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project-members"] })
  });

  const memberLookup = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach((user) => map.set(user.id, user));
    return map;
  }, [users]);

  const clientLookup = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((client) => map.set(client.id, client.name));
    return map;
  }, [clients]);

  const getProjectMembersLabel = (projectId: string) => {
    const members = membersQuery.data?.[projectId] ?? [];
    return members.map((member) => memberLookup.get(member.userId)?.name ?? "Unknown");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.clientId) return;
    const payload: Partial<Project> = {
      name: form.name,
      clientId: form.clientId,
      status: form.status as Project["status"],
      budget: form.budget ? Number(form.budget) : undefined
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const startEdit = (project: Project) => {
    setEditing(project);
    setForm({
      name: project.name,
      clientId: project.clientId,
      status: project.status,
      budget: project.budget ? String(project.budget) : ""
    });
  };

  const handleDelete = (projectId: string, name: string) => {
    if (!confirm(`Удалить проект "${name}"?`)) return;
    deleteMutation.mutate(projectId);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-4">
        <div className="card text-sm text-white/60">
          Чтобы изменить проект, нажмите «Редактировать» на карточке справа и сохраните форму.
        </div>
        {projects.map((project) => {
          const members = getProjectMembersLabel(project.id);
          return (
            <div key={project.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <Link to={`/projects/${project.id}`} className="font-display text-lg">
                    {project.name}
                  </Link>
                  <p className="text-sm text-white/60">
                    Клиент: {clientLookup.get(project.clientId) ?? project.clientId.slice(0, 8)}
                  </p>
                </div>
                <StatusBadge label={projectStatusLabels[project.status]} tone={statusTone[project.status]} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {members.length > 0 ? (
                  members.map((name) => (
                    <span key={name} className="badge bg-white/10 text-white/70">
                      {name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-white/50">Нет участников</span>
                )}
              </div>
              <div className="mt-4 flex items-center gap-4">
                {users.length > 0 && (
                  <button
                    className="text-xs text-sky-200"
                    onClick={() => addMemberMutation.mutate({ projectId: project.id, userId: users[0].id })}
                  >
                    + Добавить первого пользователя
                  </button>
                )}
                <button className="text-xs text-white/60" onClick={() => startEdit(project)}>
                  Редактировать
                </button>
                <button className="text-xs text-rose-200" onClick={() => handleDelete(project.id, project.name)}>
                  Удалить
                </button>
              </div>
            </div>
          );
        })}
        {projects.length === 0 && <div className="card text-white/60">Нет проектов</div>}
      </section>

      <section className="card">
        <h2 className="font-display text-lg">{editing ? "Редактировать проект" : "Новый проект"}</h2>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            placeholder="Название проекта"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <select
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            value={form.clientId}
            onChange={(event) => setForm({ ...form, clientId: event.target.value })}
            required
          >
            <option value="">Выберите клиента</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          <select
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
          >
            {(["PLANNED", "ACTIVE", "ON_HOLD", "DONE", "CANCELLED"] as Project["status"][]).map(
              (status) => (
                <option key={status} value={status}>
                  {projectStatusLabels[status]}
                </option>
              )
            )}
          </select>
          <input
            type="number"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            placeholder="Бюджет"
            value={form.budget}
            onChange={(event) => setForm({ ...form, budget: event.target.value })}
          />
          <div className="flex items-center gap-3">
            <button type="submit" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950">
              {editing ? "Сохранить" : "Создать"}
            </button>
            {editing && (
              <button type="button" className="text-xs text-white/60" onClick={resetForm}>
                Отмена
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
};

export default ProjectsPage;
