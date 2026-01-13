import { Router } from "express";
import type { ClientsService } from "../service/clientsService";
import { clientIdParamSchema, createClientSchema, updateClientSchema } from "../validators/clientValidators";

export const createClientsRouter = (service: ClientsService) => {
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
      const { id } = clientIdParamSchema.parse(req.params);
      const client = await service.getById(id);
      if (!client) {
        res.status(404).json({ message: "Client not found" });
        return;
      }
      res.json(client);
    } catch (err) {
      next(err);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const data = createClientSchema.parse(req.body);
      const client = await service.create(data);
      res.status(201).json(client);
    } catch (err) {
      next(err);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const { id } = clientIdParamSchema.parse(req.params);
      const data = updateClientSchema.parse(req.body);
      const client = await service.update(id, data);
      if (!client) {
        res.status(404).json({ message: "Client not found" });
        return;
      }
      res.json(client);
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const { id } = clientIdParamSchema.parse(req.params);
      const ok = await service.delete(id);
      if (!ok) {
        res.status(404).json({ message: "Client not found" });
        return;
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
};
