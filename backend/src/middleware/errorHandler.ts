import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({ message: "Validation error", issues: err.issues });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
};
