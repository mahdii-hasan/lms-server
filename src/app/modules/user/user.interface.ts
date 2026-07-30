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
