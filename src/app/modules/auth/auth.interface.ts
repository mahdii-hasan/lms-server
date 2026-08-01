import { IUser } from "../user/user.interface";

export interface ILoginUser {
  email: string;
  password: string;
}

export type TCreateUser = Pick<IUser, "name" | "email" | "password">;
