import { Router } from "express";
import type { ReportsService } from "../service/reportsService";
import { overdueQuerySchema } from "../validators/reportValidators";

export const createReportsRouter = (service: ReportsService) => {
  const router = Router();

  router.get("/overdue-tasks", async (req, res, next) => {
    try {
      const { days } = overdueQuerySchema.parse(req.query);
      const parsedDays = days ? Number(days) : 0;
      const items = await service.getOverdueTasks(Number.isNaN(parsedDays) ? 0 : parsedDays);
      res.json(items);
    } catch (err) {
      next(err);
    }
  });

  router.get("/workload", async (_req, res, next) => {
    try {
      res.json(await service.getWorkload());
    } catch (err) {
      next(err);
    }
  });

  router.get("/project-health", async (req, res, next) => {
    try {
      const { days } = overdueQuerySchema.parse(req.query);
      const parsedDays = days ? Number(days) : 0;
      res.json(await service.getProjectHealth(Number.isNaN(parsedDays) ? 0 : parsedDays));
    } catch (err) {
      next(err);
    }
  });

  return router;
};
