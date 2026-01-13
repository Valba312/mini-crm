import type { Request, Response, NextFunction } from "express";
import type { IUserRepo } from "../modules/users/repo/userRepo";

export const createFakeAuth = (usersRepo: IUserRepo) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const header = req.header("X-User-Id");
      const user = header ? await usersRepo.getById(header) : await usersRepo.getFirst();
      if (user) {
        req.user = user;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
