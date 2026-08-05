import { SignOptions } from "jsonwebtoken";
import config from "../../config/env";
import { ERROR_MESSAGES } from "../../constants/messages";
import { USER_STATUS } from "../../constants/user_status";
import AppError from "../../errors/AppError";
import { createToken } from "../../utils/jwt";
import { User } from "../user/user.model";
import { TLoginUser, TCreateUser, TJwtPayload } from "./auth.interface";
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

const loginUser = async (payload: TLoginUser) => {
  // Check if user exists
  const user= await User.isUserExistsByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  // Check if user is deleted
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, ERROR_MESSAGES.ACCOUNT_DELETED);
  }

  // Check user status
  if (user.status !== USER_STATUS.ACTIVE) {
    throw new AppError(httpStatus.FORBIDDEN, ERROR_MESSAGES.USER_BLOCKED);
  }

  // Verify password
  const isPasswordMatched = await user.isPasswordMatched(payload.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
  }

  // JWT Payload
  const jwtPayload: TJwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  // Generate Access Token
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret!,
    config.jwt_refresh_expires_in as SignOptions["expiresIn"],
  );

  // Generate Refresh Token
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret!,
    config.jwt_refresh_expires_in as SignOptions["expiresIn"],
  );
  const { password, ...userData } = user.toObject();

  return {
    accessToken,
    refreshToken,
    user: userData,
  };
};

export const AuthService = {
  registerUser,
  loginUser,
};
