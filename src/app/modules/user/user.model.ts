import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";

import env from "../../config/env";

import { IUser, IUserMethods, UserModel } from "./user.interface";

import { USER_ROLE } from "../../constants/user_role";
import { USER_STATUS } from "../../constants/user_status";
import crypto from "crypto";

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
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
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
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

  this.password = await bcrypt.hash(
    this.password,
    Number(env.bcrypt_salt_rounds),
  );
});

/**
 * Static Method
 */
userSchema.static("isUserExistsByEmail", function (email: string) {
  return this.findOne({ email }).select("+password");
});

/**
 * Instance Method
 */
userSchema.method(
  "isPasswordMatched",
  async function (plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  },
);

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex")

  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
}

export const User = model<IUser, UserModel>("User", userSchema);
