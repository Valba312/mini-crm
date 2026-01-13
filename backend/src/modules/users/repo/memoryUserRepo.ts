import { v4 as uuid } from "uuid";
import type { IUserRepo } from "./userRepo";
import type { User, UserRole } from "../types/user";

export class MemoryUserRepo implements IUserRepo {
  private items = new Map<string, User>();
  private order: string[] = [];

  async list(): Promise<User[]> {
    return this.order.map((id) => this.items.get(id)!).filter(Boolean);
  }

  async getById(id: string): Promise<User | undefined> {
    return this.items.get(id);
  }

  async getFirst(): Promise<User | undefined> {
    const firstId = this.order[0];
    if (!firstId) return undefined;
    return this.items.get(firstId);
  }

  async create(input: { name: string; email: string; role: UserRole; isActive: boolean }): Promise<User> {
    const now = new Date().toISOString();
    const user: User = {
      id: uuid(),
      name: input.name,
      email: input.email,
      role: input.role,
      isActive: input.isActive,
      createdAt: now
    };
    this.items.set(user.id, user);
    this.order.push(user.id);
    return user;
  }

  async updateRoleActive(id: string, input: { role?: UserRole; isActive?: boolean }): Promise<User | undefined> {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated: User = {
      ...existing,
      role: input.role ?? existing.role,
      isActive: input.isActive ?? existing.isActive
    };
    this.items.set(id, updated);
    return updated;
  }
}
