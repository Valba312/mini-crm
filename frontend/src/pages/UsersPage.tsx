import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, getUsers, updateUser } from "../api/api";
import type { User, UserRole } from "../types";
import StatusBadge from "../components/StatusBadge";

const roleOptions: UserRole[] = ["ADMIN", "MANAGER", "MEMBER"];
const roleLabels: Record<UserRole, string> = {
  ADMIN: "Администратор",
  MANAGER: "Менеджер",
  MEMBER: "Сотрудник"
};

const emptyForm = { name: "", email: "", role: "MEMBER" as UserRole, isActive: true };

const UsersPage = () => {
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) => updateUser(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] })
  });

  const sorted = useMemo(() => [...data].sort((a, b) => a.name.localeCompare(b.name)), [data]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.email) return;
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload: form },
        {
          onSuccess: () => resetForm()
        }
      );
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-4">
        {sorted.map((user) => (
          <div key={user.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-lg">{user.name}</div>
                <p className="text-sm text-white/60">{user.email}</p>
              </div>
              <StatusBadge label={user.isActive ? "Активен" : "Неактивен"} tone={user.isActive ? "green" : "red"} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/60">
              <span className="badge bg-white/10 text-white/70">{roleLabels[user.role]}</span>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <button className="text-xs text-white/60" onClick={() => {
                setEditing(user);
                setForm({ name: user.name, email: user.email, role: user.role, isActive: user.isActive });
              }}>
                Редактировать
              </button>
              <button
                className="text-xs text-sky-200"
                onClick={() => updateMutation.mutate({ id: user.id, payload: { isActive: !user.isActive } })}
              >
                {user.isActive ? "Деактивировать" : "Активировать"}
              </button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && <div className="card text-white/60">Сотрудники не найдены</div>}
      </section>

      <section className="card">
        <h2 className="font-display text-lg">{editing ? "Редактировать сотрудника" : "Новый сотрудник"}</h2>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            placeholder="Имя"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <select
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-xs text-white/60">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border border-white/20 bg-white/10 text-emerald-300 accent-emerald-300"
              checked={form.isActive}
              onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
            />
            Активен
          </label>
          <div className="flex items-center gap-2">
            <button type="submit" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950">
              {editing ? "Сохранить" : "Добавить"}
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

export default UsersPage;
