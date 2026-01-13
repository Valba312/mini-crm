export type UserRole = "ADMIN" | "MANAGER" | "MEMBER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}
