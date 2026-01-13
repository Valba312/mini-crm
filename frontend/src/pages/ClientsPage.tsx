import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient, deleteClient, getClients, updateClient } from "../api/api";
import type { Client } from "../types";

const emptyForm = { name: "", email: "", phone: "", notes: "" };

const ClientsPage = () => {
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Client> }) => updateClient(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] })
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const sorted = useMemo(() => [...data].sort((a, b) => a.name.localeCompare(b.name)), [data]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="card">
        <h2 className="font-display text-lg">Клиенты</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Email</th>
                <th>Телефон</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-xs text-white/60">{client.notes}</div>
                  </td>
                  <td className="text-white/70">{client.email}</td>
                  <td className="text-white/70">{client.phone ?? "-"}</td>
                  <td className="text-right">
                    <button
                      onClick={() => {
                        setEditing(client);
                        setForm({
                          name: client.name,
                          email: client.email,
                          phone: client.phone ?? "",
                          notes: client.notes ?? ""
                        });
                      }}
                      className="text-xs text-sky-200"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(client.id)}
                      className="ml-3 text-xs text-rose-200"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-white/60">
                    Клиенты не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 className="font-display text-lg">{editing ? "Редактировать клиента" : "Новый клиент"}</h2>
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
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            placeholder="Телефон"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
          />
          <textarea
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            placeholder="Комментарий"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950"
            >
              {editing ? "Сохранить" : "Создать"}
            </button>
            {editing && (
              <button type="button" onClick={resetForm} className="text-xs text-white/60">
                Отмена
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
};

export default ClientsPage;
