import { HydratedDocument, Model } from "mongoose";

import { TUserRole } from "../../constants/user_role";
import { TUserStatus } from "../../constants/user_status";

/**
 * User document fields
 */
export interface IUser {
  name: string;
  email: string;
  password: string;

  role: TUserRole;
  status: TUserStatus;

  isDeleted: boolean;
  passwordChangedAt?: Date;
}

/**
 * Instance methods
 */
export interface IUserMethods {
  isPasswordMatched(plainPassword: string): Promise<boolean>;
}

/**
 * Model static methods
 */
export interface UserModel extends Model<IUser, {}, IUserMethods> {
  isUserExistsByEmail(
    email: string
  ): Promise<HydratedDocument<IUser, IUserMethods> | null>;
}