import { TUserRole } from "../../constants/user_role";
import { IUser } from "../user/user.interface";

export interface TLoginUser {
  email: string;
  password: string;
}

export type TCreateUser = Pick<IUser, "name" | "email" | "password">;

export interface TJwtPayload {
  userId: string;
  email: string;
  role: TUserRole;
}
