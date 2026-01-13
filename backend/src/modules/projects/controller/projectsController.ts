import { Router } from "express";
import type { ProjectsService } from "../service/projectsService";
import {
  addProjectMemberSchema,
  memberParamsSchema,
  projectIdParamSchema,
  createProjectSchema,
  updateProjectSchema
} from "../validators/projectValidators";

export const createProjectsRouter = (service: ProjectsService) => {
  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      res.json(await service.list());
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const { id } = projectIdParamSchema.parse(req.params);
      const project = await service.getById(id);
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.json(project);
    } catch (err) {
      next(err);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const data = createProjectSchema.parse(req.body);
      const project = await service.create({
        ...data,
        status: data.status ?? "PLANNED"
      });
      res.status(201).json(project);
    } catch (err) {
      next(err);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const { id } = projectIdParamSchema.parse(req.params);
      const data = updateProjectSchema.parse(req.body);
      const project = await service.update(id, data);
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.json(project);
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const { id } = projectIdParamSchema.parse(req.params);
      const ok = await service.delete(id);
      if (!ok) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id/members", async (req, res, next) => {
    try {
      const { id } = projectIdParamSchema.parse(req.params);
      const members = await service.listMembers(id);
      res.json(members);
    } catch (err) {
      next(err);
    }
  });

  router.post("/:id/members", async (req, res, next) => {
    try {
      const { id } = projectIdParamSchema.parse(req.params);
      const data = addProjectMemberSchema.parse(req.body);
      const member = await service.addMember(id, data.userId, data.memberRole ?? "CONTRIBUTOR");
      res.status(201).json(member);
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id/members/:userId", async (req, res, next) => {
    try {
      const { id, userId } = memberParamsSchema.parse(req.params);
      const ok = await service.removeMember(id, userId);
      if (!ok) {
        res.status(404).json({ message: "Member not found" });
        return;
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
};
