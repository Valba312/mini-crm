import { Router } from "express";
import type { TasksService } from "../service/tasksService";
import {
  projectIdParamSchema,
  taskIdParamSchema,
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema
} from "../validators/taskValidators";
import { DEFAULT_PRIORITY } from "../repo/taskRepo";

export const createTasksRouter = (service: TasksService) => {
  const router = Router();

  router.get("/projects/:projectId/tasks", async (req, res, next) => {
    try {
      const { projectId } = projectIdParamSchema.parse(req.params);
      res.json(await service.listByProject(projectId));
    } catch (err) {
      next(err);
    }
  });

  router.post("/projects/:projectId/tasks", async (req, res, next) => {
    try {
      const { projectId } = projectIdParamSchema.parse(req.params);
      const data = createTaskSchema.parse(req.body);
      const task = await service.create({
        projectId,
        title: data.title,
        description: data.description,
        assigneeId: data.assigneeId,
        priority: data.priority ?? DEFAULT_PRIORITY,
        status: data.status ?? "TODO",
        dueDate: data.dueDate
      });
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  });

  router.put("/projects/:projectId/tasks/:id", async (req, res, next) => {
    try {
      const { projectId } = projectIdParamSchema.parse(req.params);
      const { id } = taskIdParamSchema.parse(req.params);
      const data = updateTaskSchema.parse(req.body);
      const task = await service.update(id, { ...data, projectId });
      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }
      res.json(task);
    } catch (err) {
      next(err);
    }
  });

  router.delete("/projects/:projectId/tasks/:id", async (req, res, next) => {
    try {
      const { id } = taskIdParamSchema.parse(req.params);
      const ok = await service.delete(id);
      if (!ok) {
        res.status(404).json({ message: "Task not found" });
        return;
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  router.patch("/tasks/:id/status", async (req, res, next) => {
    try {
      const { id } = taskIdParamSchema.parse(req.params);
      const data = updateStatusSchema.parse(req.body);
      const userId = req.user?.id ?? "system";
      const updated = await service.updateStatus(id, data.status, userId);
      if (!updated) {
        res.status(404).json({ message: "Task not found" });
        return;
      }
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
