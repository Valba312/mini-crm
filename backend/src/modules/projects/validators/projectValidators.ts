import { z } from "zod";

export const projectIdParamSchema = z.object({
  id: z.string().uuid()
});

export const createProjectSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(2),
  description: z.string().max(1000).optional(),
  status: z.enum(["PLANNED", "ACTIVE", "ON_HOLD", "DONE", "CANCELLED"]).optional(),
  budget: z.number().nonnegative().optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional()
});

export const updateProjectSchema = createProjectSchema.partial();

export const addProjectMemberSchema = z.object({
  userId: z.string().uuid(),
  memberRole: z.enum(["OWNER", "MANAGER", "CONTRIBUTOR"]).optional()
});

export const memberParamsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid()
});
