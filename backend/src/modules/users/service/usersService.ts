import type { IUserRepo } from "../repo/userRepo";
import type { User, UserRole } from "../types/user";

export class UsersService {
  constructor(private repo: IUserRepo) {}

  async list(): Promise<User[]> {
    return this.repo.list();
  }

  async getById(id: string): Promise<User | undefined> {
    return this.repo.getById(id);
  }

  async create(input: { name: string; email: string; role?: UserRole; isActive?: boolean }): Promise<User> {
    return this.repo.create({
      name: input.name,
      email: input.email,
      role: input.role ?? "MEMBER",
      isActive: input.isActive ?? true
    });
  }

  async updateRoleActive(id: string, input: { role?: UserRole; isActive?: boolean }): Promise<User | undefined> {
    return this.repo.updateRoleActive(id, input);
  }
}
