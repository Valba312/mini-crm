import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().min(3),
  role: z.enum(["ADMIN", "MANAGER", "MEMBER"]).optional(),
  isActive: z.boolean().optional()
});

export const updateUserSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "MEMBER"]).optional(),
  isActive: z.boolean().optional()
});

export const userIdParamSchema = z.object({
  id: z.string().uuid()
});
