import { model } from "mongoose";
import { userSchema } from "./user.model";
import bcrypt from "bcryptjs";
import { IUser, UserModel } from "./user.interface";
import config from "../../config/env";

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds),
  );
});

// Instance Methods
userSchema.methods.isPasswordMatched = async function (
  plainPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, this.password);
};
userSchema.methods.isPasswordChangedAfter = function (
  jwtIssuedAt: number,
): boolean {
  if (!this.passwordChangedAt) {
    return false;
  }

  const passwordChangedAtInSeconds = Math.floor(
    this.passwordChangedAt.getTime() / 1000,
  );

  return passwordChangedAtInSeconds > jwtIssuedAt;
};

// Static Methods

userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await this.findOne({
    email,
    isDeleted: false,
  }).select("+password");
};

userSchema.statics.isUserExistsById = async function (id: string) {
  return await this.findOne({
    _id: id,
    isDeleted: false,
  }).select("+password");
};

export const User = model<IUser, UserModel>("User", userSchema);
