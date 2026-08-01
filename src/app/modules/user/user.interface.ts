import { Model } from "mongoose";
import { TUserRole } from "../../constants/user_role";
import { TUserStatus } from "../../constants/user_status";

export interface IUser {
  name: string;
  email: string;
  password: string;

  role: TUserRole;
  status: TUserStatus;

  isDeleted: boolean;
}

export interface UserModel extends Model<IUser> {
  isUserExistsByEmail(email: string): Promise<IUser | null>;
  isPasswordMatched(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
