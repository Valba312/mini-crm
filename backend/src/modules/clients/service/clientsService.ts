import type { IClientRepo } from "../repo/clientRepo";
import type { Client } from "../types/client";

export class ClientsService {
  constructor(private repo: IClientRepo) {}

  async list(): Promise<Client[]> {
    return this.repo.list();
  }

  async getById(id: string): Promise<Client | undefined> {
    return this.repo.getById(id);
  }

  async create(input: Omit<Client, "id" | "createdAt">): Promise<Client> {
    return this.repo.create(input);
  }

  async update(id: string, input: Partial<Omit<Client, "id" | "createdAt">>): Promise<Client | undefined> {
    return this.repo.update(id, input);
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}
