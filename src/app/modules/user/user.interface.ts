import { Model, Types } from "mongoose";
import { HydratedDocument } from "mongoose";
import { TUserRole } from "../../constants/user_role";
import { TUserStatus } from "../../constants/user_status";

export interface IUser {
  _id: Types.ObjectId;

  name: string;
  email: string;
  password: string;

  role: TUserRole;
  status: TUserStatus;

  avatar?: {
    url: string;
    publicId: string;
  };

  isVerified: boolean;
  isDeleted: boolean;

  passwordChangedAt?: Date;

  passwordResetToken?: string;
  passwordResetExpires?: Date;

  emailVerificationCode?: string;
  emailVerificationExpires?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  isPasswordMatched(password: string): Promise<boolean>;

  isPasswordChangedAfter(jwtIssuedAt: number): boolean;
}

// Hydrated document = User fields + Mongoose document functionality + custom methods
export type TUserDocument = HydratedDocument<IUser, IUserMethods>;

export interface UserModel extends Model<IUser, {}, IUserMethods> {
  isUserExistsByEmail(email: string): Promise<TUserDocument | null>;
  isUserExistsById(id: string): Promise<TUserDocument | null>;
}
