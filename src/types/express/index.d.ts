import { TJwtPayload } from "../../app/modules/auth/auth.interface";
import { IUser } from "../../app/modules/user/user.interface";

declare global {
  namespace Express {
    interface Request {
      user: IUser | TJwtPayload;
    }
  }
}

export {};