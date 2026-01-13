import type { Client } from "../types/client";

export interface IClientRepo {
  list(): Promise<Client[]>;
  getById(id: string): Promise<Client | undefined>;
  create(input: Omit<Client, "id" | "createdAt">): Promise<Client>;
  update(id: string, input: Partial<Omit<Client, "id" | "createdAt">>): Promise<Client | undefined>;
  delete(id: string): Promise<boolean>;
}
