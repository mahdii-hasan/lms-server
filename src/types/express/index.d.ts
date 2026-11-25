import { IAuthenticatedUser } from "./interfaces/authenticatedUser";

declare global {
  namespace Express {
    interface Request {
      user?: IAuthenticatedUser;
    }
  }
}

export {};