import type { User, UserRole } from "../types/user";

export interface IUserRepo {
  list(): Promise<User[]>;
  getById(id: string): Promise<User | undefined>;
  getFirst(): Promise<User | undefined>;
  create(input: { name: string; email: string; role: UserRole; isActive: boolean }): Promise<User>;
  updateRoleActive(id: string, input: { role?: UserRole; isActive?: boolean }): Promise<User | undefined>;
}
