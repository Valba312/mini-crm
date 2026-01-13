import { z } from "zod";

const optionalEmail = z.string().email().optional().or(z.literal(""));

const baseClientSchema = z.object({
  name: z.string().min(2),
  email: optionalEmail.optional(),
  phone: z.string().min(5).optional(),
  notes: z.string().max(500).optional()
});

export const createClientSchema = baseClientSchema.transform((data) => ({
  ...data,
  email: data.email ? data.email : undefined
}));

export const updateClientSchema = baseClientSchema.partial();

export const clientIdParamSchema = z.object({
  id: z.string().uuid()
});
