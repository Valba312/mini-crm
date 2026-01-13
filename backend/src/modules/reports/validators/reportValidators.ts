import { z } from "zod";

export const overdueQuerySchema = z.object({
  days: z.string().optional()
});
