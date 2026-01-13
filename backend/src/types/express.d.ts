import type { User } from "../modules/users/types/user";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
