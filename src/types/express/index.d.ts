import { AuthenticatedUser } from "../../common/types/auth";

declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthenticatedUser;
    }
  }
}

export {};
