import { ERROR_MESSAGES } from "../../constants/messages";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { TCreateUser } from "./auth.interface";
import httpStatus from "http-status";

const registerUser = async (payload: TCreateUser) => {
  // Check duplicate email
  const isUserExists = await User.isUserExistsByEmail(payload.email);
  if (isUserExists) {
    throw new AppError(httpStatus.CONFLICT, ERROR_MESSAGES.DUPLICATE_ERROR);
  }

  // Create user
  const result = await User.create(payload);
  const { password, ...user } = result.toObject();

  return user;
};

export const AuthService = {
  registerUser,
};
