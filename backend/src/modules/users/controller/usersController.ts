import { Router } from "express";
import type { UsersService } from "../service/usersService";
import { createUserSchema, updateUserSchema, userIdParamSchema } from "../validators/userValidators";

export const createUsersRouter = (service: UsersService) => {
  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      res.json(await service.list());
    } catch (err) {
      next(err);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const data = createUserSchema.parse(req.body);
      const user = await service.create(data);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  });

  router.patch("/:id", async (req, res, next) => {
    try {
      const { id } = userIdParamSchema.parse(req.params);
      const data = updateUserSchema.parse(req.body);
      const user = await service.updateRoleActive(id, data);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
