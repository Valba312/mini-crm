import { v4 as uuid } from "uuid";
import type { IClientRepo } from "./clientRepo";
import type { Client } from "../types/client";

export class MemoryClientRepo implements IClientRepo {
  private items = new Map<string, Client>();
  private order: string[] = [];

  async list(): Promise<Client[]> {
    return this.order.map((id) => this.items.get(id)!).filter(Boolean);
  }

  async getById(id: string): Promise<Client | undefined> {
    return this.items.get(id);
  }

  async create(input: Omit<Client, "id" | "createdAt">): Promise<Client> {
    const now = new Date().toISOString();
    const client: Client = {
      id: uuid(),
      createdAt: now,
      ...input
    };
    this.items.set(client.id, client);
    this.order.push(client.id);
    return client;
  }

  async update(id: string, input: Partial<Omit<Client, "id" | "createdAt">>): Promise<Client | undefined> {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated: Client = {
      ...existing,
      ...input
    };
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    if (!this.items.has(id)) return false;
    this.items.delete(id);
    this.order = this.order.filter((itemId) => itemId !== id);
    return true;
  }
}
