import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";

import env from "../../config/env";

import { IUser, UserModel } from "./user.interface";

import { USER_ROLE } from "../../constants/user_role";
import { USER_STATUS } from "../../constants/user_status";

const userSchema = new Schema<IUser, UserModel>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.STUDENT,
    },

    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/**
 * Hash password before saving
 */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password,Number(env.bcrypt_salt_rounds),
  );
});

/**
 * Find user by email
 */
userSchema.static("isUserExistsByEmail", function (email: string) {
  return this.findOne({email,isDeleted: false,}).select("+password");
});

/**
 * Compare password
 */
userSchema.static("isPasswordMatched",function (plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },
);

export const User = model<IUser, UserModel>("User", userSchema);
